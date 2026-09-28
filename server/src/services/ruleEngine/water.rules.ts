import { IProject } from '../../models/Project';
import { RuleEvaluationResult } from './industry.rules';

export const evaluateWaterRules = (project: IProject): RuleEvaluationResult[] => {
  const approvals: RuleEvaluationResult[] = [];
  const water = project.waterRequirement || 0;

  // Rule: Basic Industrial Water Connection
  if (water > 0) {
    approvals.push({
      approvalName: 'MIDC Industrial Water Supply Connection Sanction',
      department: 'Maharashtra Industrial Development Corporation (MIDC - Water Works)',
      priority: 'High',
      reason: `Industrial allocation of ${water} KLD water required from MIDC infrastructure network.`,
      estimatedDays: 14,
      inspectionRequired: true,
      dependencies: ['MIDC Land Allotment Order'],
      requiredDocuments: [
        'Internal Plumbing Schematic & Water Meter Chamber Location Plan',
        'Daily Water Consumption Breakup (Process, Cooling, Domestic, Boiler)',
        'Rainwater Harvesting System Design Plan',
      ],
    });
  }

  // Rule: Heavy Water Assessment (> 50 KLD)
  if (water >= 50) {
    approvals.push({
      approvalName: 'Groundwater Extraction & ETP Recycling Assessment NOC',
      department: 'Central Ground Water Authority (CGWA) / Maharashtra Water Resources Regulatory Authority (MWRRA)',
      priority: 'Critical',
      reason: `Water consumption of ${water} KLD exceeds 50 KLD threshold, requiring mandatory hydrogeological survey and wastewater recycling plan.`,
      estimatedDays: 30,
      inspectionRequired: true,
      dependencies: ['MIDC Industrial Water Supply Connection Sanction'],
      requiredDocuments: [
        'Comprehensive Hydrogeological & Aquifer Recharge Report',
        'Effluent Treatment Plant (ETP) Recycling Ratio Certificate (> 60% reuse)',
        'Digital Flow Meter Telemetry Calibration Certificate',
      ],
    });
  }

  return approvals;
};
