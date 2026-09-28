import { IApprovalGuide } from '../models/ApprovalGuide';
import { IFAQ } from '../models/FAQ';
import { IRegulation } from '../models/Regulation';
import { IDepartment } from '../models/Department';
import { IKnowledgeCategory } from '../models/KnowledgeCategory';

export interface IKnowledgeSearchParams {
  q?: string;
  search?: string;
  keyword?: string;
  department?: string;
  industry?: string;
  category?: string;
  limit?: number;
  page?: number;
}

export interface IApprovalGuideFilterParams {
  industry?: string;
  department?: string;
  inspectionRequired?: boolean;
  renewalRequired?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface IFAQFilterParams {
  department?: string;
  category?: string;
  keyword?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface IRegulationFilterParams {
  department?: string;
  industry?: string;
  actName?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface IKnowledgeSearchResponse {
  query: string;
  appliedFilters: {
    department?: string;
    industry?: string;
    category?: string;
  };
  totalMatches: number;
  approvalGuides: IApprovalGuide[];
  faqs: IFAQ[];
  regulations: IRegulation[];
  departments: IDepartment[];
}

export interface IDepartmentRegulatoryProfile {
  department: IDepartment;
  statistics: {
    totalApprovalGuides: number;
    totalRegulations: number;
    totalFaqs: number;
    mandatoryInspectionsCount: number;
    periodicRenewalsCount: number;
  };
  approvalGuides: IApprovalGuide[];
  regulations: IRegulation[];
  faqs: IFAQ[];
}

export interface IKnowledgeOverviewResponse {
  statistics: {
    totalDepartments: number;
    totalApprovalGuides: number;
    totalRegulations: number;
    totalFaqs: number;
    totalCategories: number;
  };
  categories: IKnowledgeCategory[];
  departments: IDepartment[];
  featuredApprovalGuides: IApprovalGuide[];
  recentRegulations: IRegulation[];
  popularFaqs: IFAQ[];
}
