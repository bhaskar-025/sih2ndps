import { IProject } from '../../models/Project';
import { RuleEvaluationResult } from './industry.rules';

export const evaluateEnvironmentRules = (project: IProject): RuleEvaluationResult[] => {
  const approvals: RuleEvaluationResult[] = [];
  const category = project.pollutionCategory;

  // Rule: Red or Orange Category
  if (category === 'Red' || category === 'Orange') {
    approvals.push({
      approvalName: `MPCB Consent to Establish (CTE) - ${category} Category`,
      department: 'Maharashtra Pollution Control Board (MPCB)',
      priority: 'Critical',
      reason: `Industrial unit classified as ${category} Category requiring statutory CTE before commencing civil construction under Water Act 1974 and Air Act 1981.`,
      estimatedDays: category === 'Red' ? 45 : 30,
      inspectionRequired: true,
      dependencies: ['Land Title Deed / MIDC Allotment', 'Effluent Treatment Plant (ETP) Blueprint'],
      requiredDocuments: [
        'Manufacturing Process Flow Sheet & Material Mass Balance',
        'Effluent Treatment Plant (ETP) / Sewage Treatment Plant (STP) Design Calculations',
        'Stack Height & Air Pollution Control Equipment (APCE) Specs',
        'Environmental Management Plan (EMP) & Ambient Air Baseline',
      ],
    });

    // If Red category, add Hazardous Waste Authorization
    if (category === 'Red') {
      approvals.push({
        approvalName: 'Hazardous Waste Management Authorization (Rule 6)',
        department: 'Maharashtra Pollution Control Board (MPCB)',
        priority: 'High',
        reason: `Mandatory authorization under Hazardous and Other Wastes Rules 2016 for generation and disposal of industrial chemical sludge/spent catalysts.`,
        estimatedDays: 21,
        inspectionRequired: true,
        dependencies: [`MPCB Consent to Establish (CTE) - ${category} Category`],
        requiredDocuments: [
          'Hazardous Waste Generation Categorization (Schedule I/II)',
          'Common Hazardous Waste Treatment Facility (CHWTSDF) Membership Agreement',
          'Standard Operating Procedure (SOP) for Storage in Impervious Shed',
        ],
      });
    }
  } else if (category === 'Green') {
    approvals.push({
      approvalName: 'MPCB Green Category Fast-Track Consent to Establish',
      department: 'Maharashtra Pollution Control Board (MPCB)',
      priority: 'Medium',
      reason: 'Low environmental footprint eligible for fast-track self-certification CTE within 15 days.',
      estimatedDays: 15,
      inspectionRequired: false,
      dependencies: ['Land Allotment Order'],
      requiredDocuments: [
        'Self-Certification Affidavit of Clean Technology',
        'Plant Layout Plan showing Drainage Separation',
      ],
    });
  } else if (category === 'White') {
    approvals.push({
      approvalName: 'MPCB White Category Exemption Intimation Receipt',
      department: 'Maharashtra Pollution Control Board (MPCB)',
      priority: 'Low',
      reason: 'Non-polluting micro/assembly operation exempted from formal consent, requiring digital intimation.',
      estimatedDays: 3,
      inspectionRequired: false,
      dependencies: [],
      requiredDocuments: ['Undertaking on Non-Discharge of Toxic Effluents'],
    });
  }

  return approvals;
};
