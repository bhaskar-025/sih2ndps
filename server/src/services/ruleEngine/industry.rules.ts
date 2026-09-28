import { IProject } from '../../models/Project';

export interface RuleEvaluationResult {
  approvalName: string;
  department: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  reason: string;
  estimatedDays: number;
  inspectionRequired: boolean;
  dependencies: string[];
  requiredDocuments: string[];
}

export const evaluateIndustryRules = (project: IProject): RuleEvaluationResult[] => {
  const approvals: RuleEvaluationResult[] = [];
  const ind = (project.industry || '').toLowerCase();

  // Rule: Food Processing & Agro-tech
  if (ind.includes('food') || ind.includes('agro')) {
    approvals.push({
      approvalName: 'FSSAI Central Food Manufacturing License',
      department: 'Food Safety and Standards Authority of India (FSSAI)',
      priority: 'Critical',
      reason: `Mandatory for ${project.industry} units producing consumer food products to comply with Food Safety Standards Act 2006.`,
      estimatedDays: 20,
      inspectionRequired: true,
      dependencies: ['Building Plan Sanction', 'Water Quality Test Report'],
      requiredDocuments: [
        'Manufacturing Plant Layout Blueprint',
        'Food Safety Management System (FSMS) Plan',
        'Water Potability Lab Chemical Analysis',
        'List of Processing Machinery & Capacity Specification',
      ],
    });
  }

  // Rule: Chemicals & Petrochemicals
  if (ind.includes('chemical') || ind.includes('petro')) {
    approvals.push({
      approvalName: 'PESO Petroleum & Explosive Storage License',
      department: 'Petroleum and Explosives Safety Organization (PESO)',
      priority: 'Critical',
      reason: `Required for storage and handling of pressurized volatile chemicals and class-A/B solvents under Petroleum Rules 2002.`,
      estimatedDays: 30,
      inspectionRequired: true,
      dependencies: ['Site Safety Distance Buffer Plan', 'Provisional Fire NOC'],
      requiredDocuments: [
        'Solvent & Petrochemical Tank Layout Plan',
        'Hazardous Material Safety Data Sheets (MSDS)',
        'PESO Authorized Competent Person Certification',
        'Emergency On-Site Disaster Management Plan',
      ],
    });
  }

  // Rule: Renewable Energy & Biofuels
  if (ind.includes('renewable') || ind.includes('biofuel') || ind.includes('ethanol')) {
    approvals.push({
      approvalName: 'State Excise Industrial Alcohol & Ethanol License (Form I-A)',
      department: 'Maharashtra State Excise Department',
      priority: 'Critical',
      reason: `Mandatory for bio-refineries producing anhydrous ethanol and industrial spirits under Bombay Prohibition Act.`,
      estimatedDays: 25,
      inspectionRequired: true,
      dependencies: ['Consent to Establish (CTE)', 'Factory Blueprint Approval'],
      requiredDocuments: [
        'Distillation Column & Flow Meter Schematics',
        'Denaturation Protocol & Storage Tank Calibration Certificate',
        'MIDC Land Allotment Order',
      ],
    });
  }

  // Rule: Electric Mobility & Electronics
  if (ind.includes('electric') || ind.includes('electronic') || ind.includes('battery')) {
    approvals.push({
      approvalName: 'E-Waste Management Authorization & Battery Storage Safety NOC',
      department: 'Maharashtra Pollution Control Board (MPCB)',
      priority: 'High',
      reason: `Required for high-capacity lithium cell assembly and e-mobility electronics under Battery Waste Management Rules 2022.`,
      estimatedDays: 18,
      inspectionRequired: true,
      dependencies: ['Provisional Fire NOC'],
      requiredDocuments: [
        'Battery Storage Thermal Runaway Prevention Plan',
        'Extended Producer Responsibility (EPR) Plan',
        'Authorized Hazardous Recycler Agreement',
      ],
    });
  }

  // Rule: Pharmaceuticals & Biotechnology
  if (ind.includes('pharma') || ind.includes('bio')) {
    approvals.push({
      approvalName: 'FDA Maharashtra Drug Manufacturing License (Form 25/28)',
      department: 'Food & Drugs Administration (FDA Maharashtra)',
      priority: 'Critical',
      reason: `Statutory license under Drugs and Cosmetics Act 1940 for active pharmaceutical ingredients (API) and formulations.`,
      estimatedDays: 35,
      inspectionRequired: true,
      dependencies: ['Consent to Establish (CTE)', 'Cleanroom HVAC Validation'],
      requiredDocuments: [
        'Site Master File (SMF) & WHO-GMP Layout',
        'Technical Staff Qualifications & Pharmacist Registration',
        'Sterile HVAC Air Handling Schematic',
      ],
    });
  }

  // Rule: High Investment Units (> ₹10 Crore)
  if (project.investment >= 1000) {
    approvals.push({
      approvalName: 'Directorate of Industries PSI 2019 Incentive Eligibility Certificate',
      department: 'Directorate of Industries (Government of Maharashtra)',
      priority: 'High',
      reason: `Investment of ₹${(project.investment / 100).toFixed(2)} Cr qualifies for Package Scheme of Incentives (PSI 2019) gross SGST refund & power concessions.`,
      estimatedDays: 14,
      inspectionRequired: false,
      dependencies: ['Udyam Registration / IEM Part-B'],
      requiredDocuments: [
        'Detailed Project Report (DPR) certified by Chartered Accountant',
        'Bank Term Loan Sanction Letter',
        'Fixed Capital Investment Projection Audit',
      ],
    });
  }

  return approvals;
};
