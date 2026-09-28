import { api } from './api';
import { Scheme } from '../types/models.types';

export const fallbackSchemes: Scheme[] = [
  {
    _id: 'scheme-1',
    schemeName: 'Maharashtra Package Scheme of Incentives (PSI) 2019',
    department: 'Directorate of Industries (Government of Maharashtra)',
    description:
      'Comprehensive financial incentives including Gross SGST reimbursement, electricity duty exemption, and capital subsidy for eligible manufacturing units in developing talukas.',
    eligibilityCriteria: [
      'MSME or Large-scale manufacturing unit located in Maharashtra',
      'Investment in plant & machinery made within qualifying window',
      'Unit situated in classified industrial zones (Taluka Category B, C, D, or D+)',
    ],
    subsidyPercentage: 80,
    maxSubsidyAmount: 50000000,
    applicationDeadline: '2027-03-31T23:59:59Z',
    active: true,
  },
  {
    _id: 'scheme-2',
    schemeName: 'Chief Minister Employment Generation Programme (CMEGP)',
    department: 'Directorate of Industries & KVIC',
    description:
      'Special credit-linked capital subsidy for micro and small manufacturing and service enterprises to foster rural industrial entrepreneurship.',
    eligibilityCriteria: [
      'Applicant age between 18 and 45 years',
      'Minimum educational qualification of 8th standard pass',
      'Project cost up to ₹50 Lakhs for manufacturing units',
    ],
    subsidyPercentage: 25,
    maxSubsidyAmount: 2500000,
    applicationDeadline: '2026-12-31T23:59:59Z',
    active: true,
  },
  {
    _id: 'scheme-3',
    schemeName: 'Ambedkar Industrial Incentive Scheme (AIIS)',
    department: 'Social Welfare & Industries Department',
    description:
      'Targeted capital subsidy and interest subvention for SC/ST category entrepreneurs in Maharashtra.',
    eligibilityCriteria: [
      'SC/ST entrepreneurs holding at least 51% proprietary equity',
      'New Greenfield manufacturing unit or expansion of existing unit',
    ],
    subsidyPercentage: 30,
    maxSubsidyAmount: 10000000,
    applicationDeadline: '2026-10-31T23:59:59Z',
    active: true,
  },
];

export const schemeService = {
  getSchemes: async (): Promise<Scheme[]> => {
    try {
      const response = await api.get<any, any>('/schemes');
      if (response && Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
      return fallbackSchemes;
    } catch {
      return fallbackSchemes;
    }
  },

  getSchemeById: async (id: string): Promise<Scheme> => {
    try {
      const response = await api.get<any, any>(`/schemes/${id}`);
      if (response.data) return response.data;
    } catch {
      // fallback
    }
    const found = fallbackSchemes.find((s) => s._id === id);
    if (found) return found;
    return fallbackSchemes[0];
  },
};

export default schemeService;
