import { IProject } from '../../models/Project';
import { evaluateIndustryRules, RuleEvaluationResult } from './industry.rules';
import { evaluateEnvironmentRules } from './environment.rules';
import { evaluateLabourRules } from './labour.rules';
import { evaluateFactoryRules } from './factory.rules';
import { evaluateWaterRules } from './water.rules';
import { evaluateElectricityRules } from './electricity.rules';

export interface ApprovalRoadmapOutput {
  approvals: RuleEvaluationResult[];
  totalDepartments: number;
  estimatedTimeline: number; // in days
  requiredDocuments: string[];
  parallelWorkflows: {
    stage: string;
    approvals: string[];
    canRunParallel: boolean;
  }[];
  readinessScore: number;
}

export class ApprovalRuleEngine {
  /**
   * Evaluates all statutory business rules against the project specifications
   * and generates a personalized approval roadmap.
   * Architecture is modular and ready for ML/AI plug-in replacement.
   */
  static evaluateProject(project: IProject): ApprovalRoadmapOutput {
    // 1. Run all rule evaluators
    const allResults: RuleEvaluationResult[] = [
      ...evaluateFactoryRules(project),
      ...evaluateEnvironmentRules(project),
      ...evaluateWaterRules(project),
      ...evaluateElectricityRules(project),
      ...evaluateLabourRules(project),
      ...evaluateIndustryRules(project),
    ];

    // 2. Deduplicate approvals by approvalName
    const approvalMap = new Map<string, RuleEvaluationResult>();
    for (const item of allResults) {
      if (!approvalMap.has(item.approvalName)) {
        approvalMap.set(item.approvalName, item);
      }
    }
    const approvals = Array.from(approvalMap.values());

    // 3. Calculate unique departments
    const departmentsSet = new Set<string>();
    approvals.forEach((a) => departmentsSet.add(a.department));
    const totalDepartments = departmentsSet.size;

    // 4. Calculate unique required documents
    const docSet = new Set<string>();
    approvals.forEach((a) => {
      a.requiredDocuments.forEach((doc) => docSet.add(doc));
    });
    const requiredDocuments = Array.from(docSet);

    // 5. Calculate parallel workflows based on dependencies
    // Stage 1: Initial Planning & Pre-construction Clearances (can run in parallel)
    const stage1 = approvals.filter(
      (a) => a.dependencies.length === 0 || a.approvalName.includes('Provisional') || a.approvalName.includes('Consent to Establish')
    );

    // Stage 2: Utility & Infrastructure Connections
    const stage2 = approvals.filter(
      (a) =>
        !stage1.includes(a) &&
        (a.department.includes('Water') || a.department.includes('Electricity') || a.department.includes('Labour'))
    );

    // Stage 3: Specialized Industry & Operating Licenses
    const stage3 = approvals.filter((a) => !stage1.includes(a) && !stage2.includes(a));

    const parallelWorkflows = [
      {
        stage: 'Phase 1: Pre-Construction Clearances & Planning NOCs',
        approvals: stage1.map((a) => a.approvalName),
        canRunParallel: true,
      },
      {
        stage: 'Phase 2: Utility Allotments & Civil Approvals',
        approvals: stage2.map((a) => a.approvalName),
        canRunParallel: true,
      },
      {
        stage: 'Phase 3: Statutory Equipment Certification & Operational Licenses',
        approvals: stage3.map((a) => a.approvalName),
        canRunParallel: false,
      },
    ];

    // 6. Calculate estimated timeline in days (Critical path through parallel phases)
    const maxStage1 = Math.max(...stage1.map((a) => a.estimatedDays), 20);
    const maxStage2 = Math.max(...stage2.map((a) => a.estimatedDays), 15);
    const maxStage3 = Math.max(...stage3.map((a) => a.estimatedDays), 10);
    const estimatedTimeline = maxStage1 + maxStage2 + maxStage3;

    // 7. Calculate Project Readiness Score (0-100)
    // Based on Project Details (30pts), Infrastructure specifications (30pts), and completeness
    let readinessScore = 40; // baseline for valid project
    if (project.investment > 0) readinessScore += 15;
    if (project.landArea > 0) readinessScore += 15;
    if (project.waterRequirement > 0 && project.powerRequirement > 0) readinessScore += 15;
    if (project.location && project.taluka) readinessScore += 15;
    readinessScore = Math.min(100, readinessScore);

    return {
      approvals,
      totalDepartments,
      estimatedTimeline,
      requiredDocuments,
      parallelWorkflows,
      readinessScore,
    };
  }
}

export default ApprovalRuleEngine;
