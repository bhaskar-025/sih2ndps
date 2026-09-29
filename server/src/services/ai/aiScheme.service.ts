import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { Scheme, IScheme } from '../../models/Scheme';
import { Project } from '../../models/Project';
import { Logger } from '../../utils/logger';

export interface SchemeInputProfile {
  industry: string;
  investment: number; // in Lakhs
  isMsme: boolean;
  isWomenEntrepreneur: boolean;
  isStartup: boolean;
  district: string;
  employment: number;
}

export const AISchemeRecommendationItemSchema = z.object({
  schemeName: z.string().min(1),
  benefit: z.string().min(1),
  eligibility: z.string().min(1),
  reason: z.string().min(1),
  priority: z.enum(['High', 'Medium', 'Low', 'Critical']).transform((val) => (val === 'Critical' ? 'High' : val)),
});

export type AISchemeRecommendationItem = z.infer<typeof AISchemeRecommendationItemSchema> & {
  'Scheme Name'?: string;
  'Benefit'?: string;
  'Eligibility'?: string;
  'Reason'?: string;
  'Priority'?: string;
};

export class AISchemeService {
  private static getClient(): GoogleGenerativeAI | null {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key.trim() === '') {
      return null;
    }
    return new GoogleGenerativeAI(key.trim());
  }

  /**
   * Parse input profile from either direct body fields or projectId
   */
  public static async resolveInputProfile(body: any): Promise<SchemeInputProfile> {
    let industry = body.industry || body.Industry || '';
    let investment = Number(body.investment || body.Investment || 0);
    let district = body.district || body.District || '';
    let employment = Number(body.employment || body.Employment || body.employees || body.Employees || 0);

    const parseBoolean = (val: any): boolean => {
      if (typeof val === 'boolean') return val;
      if (typeof val === 'string') {
        const s = val.trim().toLowerCase();
        return s === 'true' || s === 'yes' || s === 'y' || s === '1' || s === 'micro' || s === 'small' || s === 'medium';
      }
      if (typeof val === 'number') return val > 0;
      return false;
    };

    let isMsme = parseBoolean(body.isMsme ?? body.msmeStatus ?? body['MSME status'] ?? body.msme ?? body.MSME);
    let isWomenEntrepreneur = parseBoolean(
      body.isWomenEntrepreneur ?? body.womenEntrepreneur ?? body['Women entrepreneur'] ?? body.women_entrepreneur
    );
    let isStartup = parseBoolean(body.isStartup ?? body.startup ?? body.Startup ?? body.is_startup);

    // If projectId is provided, fetch project details from MongoDB
    if (body.projectId) {
      try {
        const project = await Project.findById(body.projectId);
        if (project) {
          if (!industry) industry = project.industry;
          if (!investment) investment = project.investment;
          if (!district) district = project.district;
          if (!employment) employment = project.employees;
          // By default, in India investments <= ₹5000 Lakhs (₹50 Cr) qualify as MSME
          if (body.isMsme === undefined && body.msmeStatus === undefined && body['MSME status'] === undefined) {
            isMsme = project.investment <= 5000;
          }
        }
      } catch (err: any) {
        Logger.warn(`Could not resolve project by projectId ${body.projectId}: ${err.message}`);
      }
    }

    // Default MSME status if not explicitly false and investment <= 5000 Lakhs
    if (body.isMsme === undefined && body['MSME status'] === undefined && investment > 0 && investment <= 5000) {
      isMsme = true;
    }

    return {
      industry: industry || 'Manufacturing & General Engineering',
      investment: investment > 0 ? investment : 100,
      isMsme,
      isWomenEntrepreneur,
      isStartup,
      district: district || 'Maharashtra',
      employment: employment > 0 ? employment : 10,
    };
  }

  /**
   * Builds the context-rich prompt querying MongoDB schemes dynamically without hardcoding.
   */
  private static buildPrompt(profile: SchemeInputProfile, activeSchemes: IScheme[]): string {
    const schemesContext = activeSchemes
      .map(
        (s, idx) => `
${idx + 1}. Scheme Name: "${s.name}" (Code: ${s.code})
   - Description: ${s.description}
   - Stated Eligibility Criteria: ${s.eligibilityCriteria.join('; ')}
   - Financial Incentive / Subsidy Summary: ${s.financialIncentiveSummary}
   - Max Subsidy Ceiling: ${s.maxSubsidyAmount ? '₹' + (s.maxSubsidyAmount / 100000).toFixed(1) + ' Lakhs' : 'Uncapped / As per policy'}
   - Subsidy Percentage: ${s.subsidyPercentage ? s.subsidyPercentage + '%' : 'As per category'}
   - Applicable Industries: ${s.applicableIndustries?.join(', ') || 'ALL'}
   - Applicable Districts: ${s.applicableDistricts?.join(', ') || 'ALL'}
   - Minimum Investment: ₹${s.minInvestment || 0} Lakhs, Max: ${s.maxInvestment ? '₹' + s.maxInvestment + ' Lakhs' : 'Unlimited'}
   - Target Segments: ${[
     s.isMsmeEligible ? 'MSME' : null,
     s.isWomenEntrepreneurEligible ? 'Women Entrepreneur Focused' : null,
     s.isStartupEligible ? 'Startups Eligible' : null,
     s.minEmployment ? `Min ${s.minEmployment} Workers` : null,
   ]
     .filter(Boolean)
     .join(', ')}
`
      )
      .join('\n');

    return `
You are the Maharashtra Single Window Government Scheme Recommendation Engine (MAITRI+ Incentive Intelligence Engine).
You evaluate industrial and commercial projects and recommend authentic State (Government of Maharashtra) and Central Government subsidy schemes based on project profile metrics.

=====================================================
ENTREPRENEUR PROJECT PROFILE
=====================================================
- Industry: ${profile.industry}
- Investment: ₹${profile.investment} Lakhs INR
- MSME Status: ${profile.isMsme ? 'Yes (Micro/Small/Medium Enterprise)' : 'No (Large / Non-MSME)'}
- Women Entrepreneur: ${profile.isWomenEntrepreneur ? 'Yes (Women-owned / Led Enterprise >= 51% equity)' : 'No'}
- Startup Status: ${profile.isStartup ? 'Yes (DPIIT / MSInS recognized innovative startup)' : 'No'}
- District: ${profile.district}
- Employment Generation: ${profile.employment} workers

=====================================================
ACTIVE GOVERNMENT SCHEMES LOADED FROM MONGODB DATABASE
=====================================================
${schemesContext}

=====================================================
RECOMMENDATION RULES & INSTRUCTIONS
=====================================================
1. Carefully match the Entrepreneur Project Profile against the MongoDB Government Schemes provided above.
2. Filter and recommend schemes where the project genuinely qualifies:
   - If Women Entrepreneur is "Yes", prioritize dedicated women entrepreneur capital subsidies and bank loan schemes (e.g., Maharashtra Women Entrepreneur Scheme, Stand-Up India) as "High" priority.
   - If Startup is "Yes", prioritize startup seed funds and innovative startup grants (e.g., SISFS, Maharashtra Startup Policy) as "High" priority.
   - If District is in underdeveloped/backward regions (e.g. Vidarbha, Marathwada, Nanded, Yavatmal, Gadchiroli, Chandrapur, etc.), recommend backward district acceleration packages.
   - Match by Industry sector (e.g., Food Processing -> PMFME; Textiles -> ATUFS & Textile Policy; Electronics -> SPECS; Biofuels -> Biofuel scheme; General -> PSI 2019 / CMEGP).
   - Match by Investment scale and MSME eligibility.
   - Match by Employment threshold (e.g., CMEGP for >= 5 workers; EPF subsidy for >= 50 workers).
3. Return ONLY a valid JSON array of objects. Do NOT include markdown code fences if possible, or format as standard JSON.
4. For each recommended scheme, you MUST provide:
   - "schemeName": exact official scheme name from the database.
   - "benefit": detailed financial subsidy, tax exemption, interest subvention, or grant benefit.
   - "eligibility": concise statement of why and how this unit meets the criteria.
   - "reason": detailed AI justification explaining specifically how this project's Industry (${profile.industry}), Investment (₹${profile.investment} Lakhs), Women entrepreneur status (${profile.isWomenEntrepreneur}), Startup status (${profile.isStartup}), District (${profile.district}), or Employment (${profile.employment}) qualifies for this scheme.
   - "priority": "High" | "Medium" | "Low" (based on financial impact and strategic relevance).
5. Sort recommendations with "High" priority first.

MANDATORY JSON OUTPUT FORMAT:
[
  {
    "schemeName": "Scheme Name",
    "benefit": "Benefit description with percentages and caps",
    "eligibility": "Eligibility criteria statement",
    "reason": "Clear explanation referencing project metrics",
    "priority": "High"
  }
]
`.trim();
  }

  /**
   * Main recommendation engine method:
   * 1. Fetches active schemes from MongoDB.
   * 2. Evaluates with Gemini 2.5 Flash.
   * 3. Falls back gracefully to deterministic MongoDB matching if offline.
   */
  public static async recommendSchemes(profile: SchemeInputProfile): Promise<AISchemeRecommendationItem[]> {
    // 1. Fetch active schemes from MongoDB
    const activeSchemes = await Scheme.find({ active: true });

    if (!activeSchemes || activeSchemes.length === 0) {
      Logger.warn('No active schemes found in MongoDB. Returning empty recommendation list.');
      return [];
    }

    const client = this.getClient();

    // If Gemini client not available, run deterministic MongoDB evaluation
    if (!client) {
      Logger.warn('GEMINI_API_KEY is not configured. Utilizing MongoDB Regulatory Incentive Matching Engine.');
      return this.evaluateWithMongoDBEngine(profile, activeSchemes);
    }

    const prompt = this.buildPrompt(profile, activeSchemes);
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        Logger.info(
          `Invoking Gemini 2.5 Flash for Government Scheme Recommendation (Attempt ${attempt}/${maxRetries}) for Industry: "${profile.industry}", District: "${profile.district}", Women: ${profile.isWomenEntrepreneur}, Startup: ${profile.isStartup}...`
        );

        const model = client.getGenerativeModel({
          model: 'gemini-2.5-flash',
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        if (!responseText || responseText.trim() === '') {
          throw new Error('Empty response returned by Gemini 2.5 Flash');
        }

        let cleanJson = responseText.trim();
        if (cleanJson.startsWith('```json')) {
          cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanJson.startsWith('```')) {
          cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        const parsed = JSON.parse(cleanJson);
        const itemsArray = Array.isArray(parsed) ? parsed : parsed.schemes || parsed.recommendations || [];
        const validated = z.array(AISchemeRecommendationItemSchema).parse(itemsArray);

        Logger.info(`✓ Gemini 2.5 Flash successfully recommended ${validated.length} Government Schemes.`);

        // Map and enrich so both camelCase and Capitalized formats are available
        return validated.map((item) => ({
          schemeName: item.schemeName,
          benefit: item.benefit,
          eligibility: item.eligibility,
          reason: item.reason,
          priority: item.priority,
          'Scheme Name': item.schemeName,
          Benefit: item.benefit,
          Eligibility: item.eligibility,
          Reason: item.reason,
          Priority: item.priority,
        }));
      } catch (error: any) {
        Logger.error(`Gemini 2.5 Flash Scheme Recommendation error (Attempt ${attempt}/${maxRetries}): ${error.message}`);
        if (attempt < maxRetries) {
          const delayMs = attempt * 1200;
          await new Promise((res) => setTimeout(res, delayMs));
        }
      }
    }

    Logger.warn('Falling back to deterministic MongoDB Regulatory Incentive Matching Engine.');
    return this.evaluateWithMongoDBEngine(profile, activeSchemes);
  }

  /**
   * Deterministic matching algorithm evaluating MongoDB schemes collection against project profile.
   * Guarantees 100% server availability and accurate recommendations even during API throttling.
   */
  private static evaluateWithMongoDBEngine(
    profile: SchemeInputProfile,
    schemes: IScheme[]
  ): AISchemeRecommendationItem[] {
    const results: AISchemeRecommendationItem[] = [];

    const normInd = profile.industry.toLowerCase();
    const normDist = profile.district.toLowerCase();

    for (const s of schemes) {
      let isEligible = true;
      let priority: 'High' | 'Medium' | 'Low' = 'Medium';
      const reasonParts: string[] = [];

      // Industry check
      const appIndustries = (s.applicableIndustries || ['ALL']).map((i) => i.toLowerCase());
      const indMatch =
        appIndustries.includes('all') ||
        appIndustries.some((i) => normInd.includes(i) || i.includes(normInd));

      if (!indMatch) {
        continue;
      }

      // Investment check
      if (s.minInvestment && profile.investment < s.minInvestment) {
        continue;
      }
      if (s.maxInvestment && profile.investment > s.maxInvestment) {
        continue;
      }

      // Employment check
      if (s.minEmployment && profile.employment < s.minEmployment) {
        continue;
      }

      // Women Entrepreneur check
      if (s.isWomenEntrepreneurEligible) {
        if (profile.isWomenEntrepreneur) {
          priority = 'High';
          reasonParts.push('Qualifies for exclusive women entrepreneur subsidy and concession package');
        } else if (s.code.includes('WOMEN') || s.code.includes('STANDUP')) {
          // Scheme is exclusively for women entrepreneurs
          continue;
        }
      }

      // Startup check
      if (s.isStartupEligible) {
        if (profile.isStartup) {
          priority = 'High';
          reasonParts.push('Qualifies for early-stage startup innovation grant and patent cost reimbursement');
        } else if (s.code.includes('STARTUP') || s.code.includes('SISFS')) {
          // Exclusively for startups
          continue;
        }
      }

      // MSME check
      if (s.isMsmeEligible && profile.isMsme) {
        reasonParts.push(`Qualifies under MSME investment threshold (₹${profile.investment} Lakhs)`);
      }

      // District check
      const appDistricts = (s.applicableDistricts || ['ALL']).map((d) => d.toLowerCase());
      const distMatch = appDistricts.includes('all') || appDistricts.some((d) => normDist.includes(d) || d.includes(normDist));

      if (distMatch && !appDistricts.includes('all')) {
        priority = 'High';
        reasonParts.push(`Located in priority industrial development district of ${profile.district}`);
      } else if (!distMatch) {
        continue;
      }

      // Employment bonus
      if (s.minEmployment && profile.employment >= s.minEmployment) {
        reasonParts.push(`Meets high-employment creation benchmark with ${profile.employment} planned jobs`);
      }

      const reason =
        reasonParts.length > 0
          ? `Eligible for ${s.name}: ${reasonParts.join('. ')}.`
          : `Eligible for ${s.name} based on ${profile.industry} operations in ${profile.district} with ₹${profile.investment} Lakhs investment.`;

      results.push({
        schemeName: s.name,
        benefit: s.financialIncentiveSummary,
        eligibility: s.eligibilityCriteria.join(', '),
        reason,
        priority,
        'Scheme Name': s.name,
        Benefit: s.financialIncentiveSummary,
        Eligibility: s.eligibilityCriteria.join(', '),
        Reason: reason,
        Priority: priority,
      });
    }

    // Sort by priority (High -> Medium -> Low)
    const priorityWeight = { High: 3, Medium: 2, Low: 1 };
    return results.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
  }
}

export default AISchemeService;
