import mongoose from 'express';
import { User, Department, Scheme } from '../models';

export const initialDepartments = [
  {
    name: 'Maharashtra Pollution Control Board (MPCB)',
    code: 'MPCB',
    description: 'Mandatory environmental clearance, Consent to Establish (CTE) and Consent to Operate (CTO).',
    nodalOfficer: 'Dr. V. M. Motghare (Joint Director)',
    email: 'contact@mpcb.gov.in',
    phone: '+91 22 24010437',
    servicesOffered: [
      'Consent to Establish (CTE)',
      'Consent to Operate (CTO)',
      'Hazardous Waste Authorization',
      'Bio-Medical Waste Management',
    ],
    averageProcessingDays: 21,
    isActive: true,
  },
  {
    name: 'Maharashtra Industrial Development Corporation (MIDC)',
    code: 'MIDC',
    description: 'Industrial land allotment, infrastructure connectivity, water supply, and building plan approvals.',
    nodalOfficer: 'Shri P. Velrasu, IAS (CEO MIDC)',
    email: 'support@midcindia.org',
    phone: '+91 22 26870052',
    servicesOffered: [
      'Industrial Plot Allotment',
      'Building Plan Sanction',
      'Water Connection Permission',
      'Sub-lease Consent',
    ],
    averageProcessingDays: 14,
    isActive: true,
  },
  {
    name: 'Directorate of Industries',
    code: 'DOI',
    description: 'Nodal authority for industrial policy implementation, MSME facilitation, and subsidy sanctions.',
    nodalOfficer: 'Dr. Harshdeep Kamble, IAS (Development Commissioner)',
    email: 'di-maha@gov.in',
    phone: '+91 22 22028623',
    servicesOffered: [
      'Udyam Registration Endorsement',
      'Mega Project Eligibility Certificate',
      'Stamp Duty Exemption Certificate',
    ],
    averageProcessingDays: 10,
    isActive: true,
  },
  {
    name: 'Directorate of Maharashtra Fire Services',
    code: 'DMFS',
    description: 'Fire hazard analysis, fire prevention compliance, and issuance of Fire Safety Provisional & Final NOC.',
    nodalOfficer: 'Chief Fire Officer S. N. Raut',
    email: 'fireservices@maharashtra.gov.in',
    phone: '+91 22 26677555',
    servicesOffered: [
      'Provisional Fire NOC',
      'Final Fire NOC & Commissioning Inspection',
      'Annual Fire Audit Review',
    ],
    averageProcessingDays: 12,
    isActive: true,
  },
];

export const initialSchemes = [
  {
    name: 'Package Scheme of Incentives (PSI) 2019',
    code: 'PSI-2019',
    description: 'Comprehensive financial incentive package offering capital subsidy, GST reimbursement, and interest subvention for industrial units in underdeveloped talukas.',
    eligibilityCriteria: [
      'Registered MSME / Large scale unit in Maharashtra',
      'Investment in eligible fixed assets post 2019',
      'Taluka classification in Group B, C, D, or D+',
    ],
    financialIncentiveSummary: 'Up to 80% Gross SGST reimbursement + 5% Interest subsidy on term loans for 7 years.',
    maxSubsidyAmount: 50000000,
    active: true,
  },
  {
    name: 'Chief Minister Employment Generation Programme (CMEGP)',
    code: 'CMEGP-2024',
    description: 'Financial assistance for micro & small entrepreneurs to stimulate local employment and rural industrialization.',
    eligibilityCriteria: [
      'Age between 18 to 45 years',
      'Minimum 8th standard educational qualification',
      'New manufacturing project investment up to ₹50 Lakhs',
    ],
    financialIncentiveSummary: '15% to 35% margin money subsidy depending on category and urban/rural location.',
    maxSubsidyAmount: 2500000,
    active: true,
  },
];
