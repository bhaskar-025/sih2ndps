import { IProject } from '../../models/Project';
import { RuleEvaluationResult } from './industry.rules';

export const evaluateElectricityRules = (project: IProject): RuleEvaluationResult[] => {
  const approvals: RuleEvaluationResult[] = [];
  const power = project.powerRequirement || 0;

  // Rule: Basic Power Sanction
  if (power > 0) {
    approvals.push({
      approvalName: 'MSEDCL Industrial Power Load Sanction & Connection',
      department: 'Maharashtra State Electricity Distribution Co. Ltd. (MSEDCL)',
      priority: 'High',
      reason: `Sanction required for ${power} KW connected load from regional grid substation under Maharashtra Electricity Regulatory Commission (MERC) supply code.`,
      estimatedDays: 14,
      inspectionRequired: true,
      dependencies: ['Building Plan Sanction'],
      requiredDocuments: [
        'Single Line Diagram (SLD) of Electrical Distribution',
        'Connected Load Breakup & Maximum Demand Projection',
        'Substation Transformer & Switchgear Technical Data Sheets',
      ],
    });
  }

  // Rule: High Power Load (>= 500 KW)
  if (power >= 500) {
    approvals.push({
      approvalName: 'Chief Electrical Inspector (CEIG) High Voltage Substation Approval',
      department: 'Chief Electrical Inspector to Government (CEIG Maharashtra)',
      priority: 'Critical',
      reason: `High tension power demand of ${power} KW requires statutory CEIG electrical safety clearance before energizing 11kV/33kV transformers.`,
      estimatedDays: 21,
      inspectionRequired: true,
      dependencies: ['MSEDCL Industrial Power Load Sanction & Connection'],
      requiredDocuments: [
        'Electrical Contractor Class-A License & Work Completion Affidavit',
        'Earth Pit Resistance Test Reports (< 1 Ohm)',
        'Relay Coordination Study & Transformer Oil Breakdown Voltage Test',
      ],
    });
  }

  return approvals;
};
