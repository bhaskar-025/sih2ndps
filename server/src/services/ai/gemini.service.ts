import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { IProject } from '../../models/Project';
import { IRegulation } from '../../models/Regulation';
import { IRule } from '../../models/Rule';
import { IStatutoryApproval } from '../../models/StatutoryApproval';
import { IScheme } from '../../models/Scheme';
import { IDocumentMaster } from '../../models/DocumentMaster';
import { IIndustry } from '../../models/Industry';
import { Logger } from '../../utils/logger';

// Expected Output Schema definition using Zod
export const AIApprovalItemSchema = z.object({
  department: z.string().min(1),
  approval: z.string().min(1),
  reason: z.string().default('Mandatory statutory compliance under Maharashtra regulations'),
  priority: z.enum(['Critical', 'High', 'Medium', 'Low']).default('Medium'),
  estimatedDays: z.number().nonnegative().default(15),
});

export const AIDocumentItemSchema = z.object({
  name: z.string().min(1),
  usedFor: z.array(z.string()).default([]),
});

export const AITimelineItemSchema = z.object({
  stage: z.string().min(1),
  approvals: z.array(z.string()).default([]),
  estimatedDays: z.number().default(15),
  canRunParallel: z.boolean().default(true),
});

export const AIInspectionPlanItemSchema = z.object({
  department: z.string().min(1),
  stage: z.string().min(1),
  reason: z.string().default('Statutory compliance audit'),
});

export const AISchemeItemSchema = z.object({
  name: z.string().min(1),
  benefit: z.string().default('Incentive subsidy'),
  eligibility: z.string().default('Eligible unit'),
});

export const AIRoadmapOutputSchema = z.object({
  approvals: z.array(AIApprovalItemSchema).min(1),
  documents: z.array(AIDocumentItemSchema).default([]),
  timeline: z.array(AITimelineItemSchema).default([]),
  inspectionPlan: z.array(AIInspectionPlanItemSchema).default([]),
  schemes: z.array(AISchemeItemSchema).default([]),
  complianceScore: z.number().min(0).max(100).default(85),
  summary: z.string().default('AI-generated approval roadmap and compliance intelligence.'),
});

export type AIRoadmapOutput = z.infer<typeof AIRoadmapOutputSchema>;

export interface RegulatoryContext {
  project: IProject;
  industryProfile?: IIndustry | null;
  regulations: IRegulation[];
  rules: IRule[];
  approvalsDatabase: IStatutoryApproval[];
  schemes: IScheme[];
  documentMasters: IDocumentMaster[];
  existingDocuments?: string[];
}

export class GeminiService {
  private static apiKey: string | undefined = process.env.GEMINI_API_KEY;

  /**
   * Initializes the Google Generative AI client
   */
  private static getClient(): GoogleGenerativeAI | null {
    const key = process.env.GEMINI_API_KEY || this.apiKey;
    if (!key || key.trim() === '') {
      return null;
    }
    return new GoogleGenerativeAI(key.trim());
  }

  /**
   * Constructs a structured, context-rich prompt incorporating MongoDB regulations, rules,
   * schemes, approvals, and the specific industrial project metrics.
   */
  public static buildPrompt(context: RegulatoryContext): string {
    const {
      project,
      industryProfile,
      regulations,
      rules,
      approvalsDatabase,
      schemes,
      documentMasters,
    } = context;

    const estimatedBuildingSize = Math.round((project.landArea || 1) * 2000); // Approx sq.m
    const manufacturingProcessDesc =
      industryProfile?.manufacturingProcesses?.length
        ? industryProfile.manufacturingProcesses.join(' -> ')
        : `${project.projectType} manufacturing operations for ${project.industry}`;

    const regulationsText = regulations.length
      ? regulations
          .map(
            (r, i) =>
              `${i + 1}. [${r.department}] ${r.title} (${r.actName} ${r.ruleNumber}): ${r.summary}`
          )
          .join('\n')
      : 'Standard Environment, Safety and Municipal Statutory Acts apply.';

    const rulesText = rules.length
      ? rules
          .map(
            (rl, i) =>
              `${i + 1}. [${rl.ruleCode}] ${rl.title} (Dept: ${rl.department}, Severity: ${rl.severity}): Mandate: ${rl.mandate}. Condition: ${rl.condition}`
          )
          .join('\n')
      : 'Standard industrial rules apply.';

    const schemesText = schemes.length
      ? schemes
          .map(
            (s, i) =>
              `${i + 1}. ${s.name} (${s.code}): ${s.description}. Benefit: ${s.financialIncentiveSummary}`
          )
          .join('\n')
      : 'State Industrial Policy 2019 Incentives.';

    const approvalsDbText = approvalsDatabase.length
      ? approvalsDatabase
          .map(
            (a, i) =>
              `${i + 1}. Approval: "${a.approvalName}" | Department: "${a.department}" | Risk: ${a.riskLevel} | Timeline: ${a.timeline} days | Inspection: ${a.inspectionRequired ? 'Yes' : 'No'} | Applicable Industries: ${a.industry.join(', ')} | Conditions: ${a.conditions.join('; ')}`
          )
          .join('\n')
      : 'Statutory approvals list.';

    const docCatalogText = documentMasters.length
      ? documentMasters
          .map(
            (d, i) =>
              `${i + 1}. Document: "${d.name}" (Category: ${d.category}, Issuing: ${d.issuingAuthority}, Typically Used For: [${d.usedFor.join(', ')}])`
          )
          .join('\n')
      : 'Statutory documents catalog.';

    return `
You are the Maharashtra Single Window Approval Intelligence Engine (MAITRI+ Engine), an expert statutory regulator in industrial approvals and compliance for the Government of Maharashtra.

=====================================================
COMPLETE PROJECT PROFILE
=====================================================
- Industry: ${project.industry}
- Investment: ₹${project.investment} Lakhs INR
- Employees: ${project.employees} workers
- District: ${project.district} (Taluka: ${project.taluka || 'N/A'})
- Pollution Category: ${project.pollutionCategory}
- Land Area: ${project.landArea} Acres
- Building Area: ${estimatedBuildingSize} sq. meters
- Manufacturing Process: ${manufacturingProcessDesc}

=====================================================
AVAILABLE REGULATIONS FROM MONGODB
=====================================================
${regulationsText}

=====================================================
REQUIRED RULES & STATUTORY THRESHOLDS FROM MONGODB
=====================================================
${rulesText}

=====================================================
GOVERNMENT SCHEMES FROM MONGODB
=====================================================
${schemesText}

=====================================================
APPROVAL DATABASE FROM MONGODB
=====================================================
${approvalsDbText}

=====================================================
DOCUMENT MAPPING CATALOG FROM MONGODB
=====================================================
${docCatalogText}

=====================================================
AI INSTRUCTIONS
=====================================================
1. You must act as the Approval Intelligence Engine and return ONLY valid JSON. No conversational text, no markdown outside of JSON.
2. NEVER invent non-existent government approvals, fictional agencies, or extraneous requirements. Only use the approvals and regulations supplied above.
3. Tailor the approvals specifically to this project's Industry (${project.industry}), Pollution Category (${project.pollutionCategory}), Investment (₹${project.investment} Lakhs), Workforce (${project.employees}), Water (${project.waterRequirement} KLD), and Power (${project.powerRequirement} KW).
   - For Food Processing: Include FSSAI Manufacturing License, MPCB Consent, DISH Factory Plan, DMFS Fire NOC, Water testing.
   - For Chemical: Include Red Category MPCB CTE, PESO Solvent License, Hazardous Waste TSDF Authorization, DISH MAH Plan, DMFS Fire NOC.
   - For Textile: Include MPCB CTE, CETP Conduit Connection, DISH Factory Plan, DMFS Fire NOC, Ground water clearance.
   - For Electronics: Include Green/Orange MPCB CTE, E-Waste Producer Responsibility, BIS Certification, DISH Cleanroom Layout.
   - For Warehousing: Include MIDC Building Plan, High-Hazard Warehouse Fire NOC & Sprinkler, Legal Metrology Weighbridge.
   - For Renewable Energy: Include MEDA Grid Connectivity, MSEDCL Interconnection, MPCB CTE, Distillation / Boiler Approval.
4. DOCUMENT INTELLIGENCE: Recommend ONLY relevant documents based on the project's scale, industry, and pollution. Map each document to its corresponding approvals in the "usedFor" array.
5. TIMELINE: Structure the approval phases into parallel and sequential stages (Phase 1 Pre-Construction, Phase 2 Civil/Utilities, Phase 3 Operational/Commissioning) with estimated days.
6. SCHEMES: Select applicable schemes from the supplied MongoDB schemes based on the district, investment, and industry.
7. Return an accurate complianceScore (0-100) and an executive regulatory summary for the investor dossier.

=====================================================
MANDATORY JSON FORMAT (RETURN ONLY THIS OBJECT)
=====================================================
{
  "approvals": [
    {
      "department": "Department Name",
      "approval": "Approval Name",
      "reason": "Detailed statutory justification based on project metrics",
      "priority": "Critical|High|Medium|Low",
      "estimatedDays": 20
    }
  ],
  "documents": [
    {
      "name": "Document Name",
      "usedFor": ["Approval Name 1", "Approval Name 2"]
    }
  ],
  "timeline": [
    {
      "stage": "Phase 1: Pre-Construction Clearances & Planning NOCs",
      "approvals": ["Approval Name 1", "Approval Name 2"],
      "estimatedDays": 30,
      "canRunParallel": true
    }
  ],
  "schemes": [
    {
      "name": "Scheme Name",
      "benefit": "Benefit description",
      "eligibility": "Eligibility basis"
    }
  ],
  "complianceScore": 90,
  "summary": "Executive compliance dossier summary"
}
`.trim();
  }

  /**
   * Calls Gemini 2.5 Flash model with retries and structured output validation.
   * If Gemini fails or API key is not configured, provides a deterministic MongoDB-derived
   * fallback so the server never crashes.
   */
  public static async generateApprovalRoadmap(
    context: RegulatoryContext
  ): Promise<AIRoadmapOutput> {
    const prompt = this.buildPrompt(context);
    const client = this.getClient();

    if (!client) {
      Logger.warn(
        'GEMINI_API_KEY is not set or empty in environment. Falling back to MongoDB Regulatory Knowledge Engine evaluation.'
      );
      return this.generateMongoDBFallback(context);
    }

    const maxRetries = 3;
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        Logger.info(
          `Invoking Gemini 2.5 Flash for Project: "${context.project.projectName}" (Attempt ${attempt}/${maxRetries})...`
        );

        // Load Gemini 2.5 Flash model
        const model = client.getGenerativeModel({
          model: 'gemini-2.5-flash',
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.15,
          },
        });

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        if (!responseText || responseText.trim() === '') {
          throw new Error('Empty response received from Gemini 2.5 Flash');
        }

        // Clean any stray markdown formatting if returned
        let cleanJson = responseText.trim();
        if (cleanJson.startsWith('```json')) {
          cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanJson.startsWith('```')) {
          cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        const parsed = JSON.parse(cleanJson);
        const validatedOutput = AIRoadmapOutputSchema.parse(parsed);

        Logger.info(
          `✓ Gemini 2.5 Flash successfully generated ${validatedOutput.approvals.length} statutory approvals and ${validatedOutput.documents.length} document requirements.`
        );

        return validatedOutput;
      } catch (error: any) {
        lastError = error;
        Logger.error(
          `Gemini 2.5 Flash call failed (Attempt ${attempt}/${maxRetries}): ${error.message}`
        );

        if (attempt < maxRetries) {
          const delayMs = attempt * 1200;
          Logger.info(`Retrying in ${delayMs}ms...`);
          await new Promise((res) => setTimeout(res, delayMs));
        }
      }
    }

    Logger.warn(
      `All ${maxRetries} Gemini 2.5 Flash attempts failed. Initiating high-fidelity MongoDB Regulatory Engine fallback to preserve continuous service.`
    );
    return this.generateMongoDBFallback(context);
  }

  /**
   * Deterministic fallback generator utilizing active MongoDB collections
   * (approvals, rules, schemes, documents) to guarantee high reliability if the Gemini API is offline.
   */
  private static generateMongoDBFallback(context: RegulatoryContext): AIRoadmapOutput {
    const { project, approvalsDatabase, schemes, documentMasters } = context;

    // Filter approvals matching industry or ALL
    const matchedApprovals = approvalsDatabase.filter((a) => {
      const matchInd =
        a.industry.includes('ALL') ||
        a.industry.some((ind) => ind.toLowerCase() === project.industry.toLowerCase());
      return matchInd;
    });

    const approvalsToUse = matchedApprovals.length > 0 ? matchedApprovals : approvalsDatabase;

    const approvals = approvalsToUse.map((a) => ({
      department: a.department,
      approval: a.approvalName,
      reason:
        a.conditions.length > 0
          ? `Statutory requirement: ${a.conditions[0]}`
          : `Mandatory clearance for ${project.industry} under ${a.department} guidelines`,
      priority: (a.priority || 'Medium') as 'Critical' | 'High' | 'Medium' | 'Low',
      estimatedDays: a.timeline || 15,
    }));

    // Build document recommendations
    const docMap = new Map<string, Set<string>>();
    approvalsToUse.forEach((a) => {
      a.requiredDocuments.forEach((docName) => {
        if (!docMap.has(docName)) {
          docMap.set(docName, new Set<string>());
        }
        docMap.get(docName)!.add(a.approvalName);
      });
    });

    const documents = Array.from(docMap.entries()).map(([name, usedForSet]) => ({
      name,
      usedFor: Array.from(usedForSet),
    }));

    // Inspection plan
    const inspectionPlan = [
      {
        department: 'Maharashtra Industrial Development Corporation (MIDC)',
        stage: 'Pre-Construction',
        reason: 'Site boundary demarcation and building setback verification',
      },
      {
        department: 'Maharashtra Pollution Control Board (MPCB)',
        stage: 'Construction',
        reason: 'Physical inspection of ETP/STP civil foundations and stack emission height',
      },
      {
        department: 'Directorate of Industrial Safety and Health (DISH)',
        stage: 'Commissioning',
        reason: 'Machine guarding, ventilation rate, and emergency egress audit',
      },
      {
        department: 'Directorate of Maharashtra Fire Services (DMFS)',
        stage: 'Operational',
        reason: 'Final static water reservoir, hydrant ring pressure, and sprinkler commissioning audit',
      },
    ];

    // Schemes
    const matchedSchemes = schemes.map((s) => ({
      name: s.name,
      benefit: s.financialIncentiveSummary,
      eligibility: s.eligibilityCriteria.join(', '),
    }));

    // Timeline phases
    const timeline = [
      {
        stage: 'Phase 1: Pre-Construction Clearances & Planning NOCs',
        approvals: approvals.slice(0, 3).map((a) => a.approval),
        estimatedDays: 30,
        canRunParallel: true,
      },
      {
        stage: 'Phase 2: Utility Allotments & Civil Approvals',
        approvals: approvals.slice(3, 6).map((a) => a.approval),
        estimatedDays: 20,
        canRunParallel: true,
      },
      {
        stage: 'Phase 3: Statutory Equipment Certification & Operational Licenses',
        approvals: approvals.slice(6).map((a) => a.approval),
        estimatedDays: 15,
        canRunParallel: false,
      },
    ];

    let complianceScore = 80;
    if (project.investment > 0) complianceScore += 5;
    if (project.landArea > 0) complianceScore += 5;
    if (project.waterRequirement > 0 && project.powerRequirement > 0) complianceScore += 5;
    complianceScore = Math.min(100, complianceScore);

    return {
      approvals,
      documents,
      timeline,
      inspectionPlan,
      schemes: matchedSchemes,
      complianceScore,
      summary: `Automated Approval Roadmap for ${project.projectName} (${project.industry}). Identified ${approvals.length} statutory clearances across key departments.`,
    };
  }
}

export default GeminiService;
