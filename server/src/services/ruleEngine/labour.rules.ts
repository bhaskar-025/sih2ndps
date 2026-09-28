import { IProject } from '../../models/Project';
import { RuleEvaluationResult } from './industry.rules';

export const evaluateLabourRules = (project: IProject): RuleEvaluationResult[] => {
  const approvals: RuleEvaluationResult[] = [];
  const employees = project.employees || 0;

  // Rule: Basic Labour Registration (> 10 employees)
  if (employees >= 10) {
    approvals.push({
      approvalName: 'Registration under Maharashtra Contract Labour (Regulation & Abolition) Act',
      department: 'Office of the Labour Commissioner (Government of Maharashtra)',
      priority: employees > 100 ? 'Critical' : 'High',
      reason: `Industrial facility employs ${employees} workforce, exceeding the statutory threshold of 10 workers for contractor engagement and employee welfare registrations.`,
      estimatedDays: 14,
      inspectionRequired: false,
      dependencies: ['Employer Identification Certificate', 'EPF & ESIC Registration'],
      requiredDocuments: [
        'Form I Application for Registration of Principal Employer',
        'Contractor Engagement Agreements & Worker Welfare Policy',
        'EPFO & ESIC Allotment Letters',
      ],
    });
  }

  // Rule: High Workforce Compliance (> 100 employees)
  if (employees >= 100) {
    approvals.push({
      approvalName: 'Industrial Standing Orders Certification & Labour Welfare Audit',
      department: 'Office of the Labour Commissioner (Government of Maharashtra)',
      priority: 'High',
      reason: `Workforce of ${employees} triggers mandatory certified Standing Orders governing service conditions under Industrial Employment Act 1946.`,
      estimatedDays: 28,
      inspectionRequired: true,
      dependencies: ['Registration under Maharashtra Contract Labour (Regulation & Abolition) Act'],
      requiredDocuments: [
        'Draft Model Standing Orders in Marathi and English',
        'Staff Salary & Minimum Wage Structure Register',
        'Canteen, Creche & First-Aid Room Layout Plans',
      ],
    });
  }

  return approvals;
};
