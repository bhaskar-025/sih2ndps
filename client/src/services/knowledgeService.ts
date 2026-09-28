import { api } from './api';

export interface ApprovalGuideItem {
  _id: string;
  title: string;
  department: string;
  industryTypes: string[];
  description: string;
  requiredDocuments: string[];
  eligibilityCriteria: string[];
  estimatedTimeline: string;
  inspectionRequired: boolean;
  dependencies: string[];
  renewalRequired: boolean;
  renewalFrequency: string;
  faqIds?: any[];
  createdAt?: string;
  updatedAt?: string;
}

export interface FAQItem {
  _id: string;
  question: string;
  answer: string;
  department: string;
  category: string;
  keywords: string[];
}

export interface RegulationItem {
  _id: string;
  title: string;
  actName: string;
  ruleNumber: string;
  summary: string;
  applicableIndustries: string[];
  department: string;
  effectiveDate: string;
  referenceUrl: string;
}

export interface DepartmentItem {
  _id: string;
  name: string;
  code: string;
  description: string;
  website: string;
  contactEmail: string;
  contactPhone: string;
  officeAddress: string;
  approvalTypes: string[];
  status: string;
}

export interface KnowledgeOverviewData {
  statistics: {
    totalDepartments: number;
    totalApprovalGuides: number;
    totalRegulations: number;
    totalFaqs: number;
    totalCategories: number;
  };
  categories: { _id: string; name: string; description: string }[];
  departments: DepartmentItem[];
  featuredApprovalGuides: ApprovalGuideItem[];
  recentRegulations: RegulationItem[];
  popularFaqs: FAQItem[];
}

export interface KnowledgeSearchResults {
  query: string;
  appliedFilters: {
    department?: string;
    industry?: string;
    category?: string;
  };
  totalMatches: number;
  approvalGuides: ApprovalGuideItem[];
  faqs: FAQItem[];
  regulations: RegulationItem[];
  departments: DepartmentItem[];
}

export const knowledgeService = {
  getOverview: async (): Promise<KnowledgeOverviewData> => {
    const response = await api.get<any, any>('/knowledge');
    return response.data;
  },

  search: async (params: {
    q?: string;
    department?: string;
    industry?: string;
    category?: string;
    limit?: number;
  }): Promise<KnowledgeSearchResults> => {
    const cleanParams: Record<string, any> = {};
    if (params.q) cleanParams.q = params.q;
    if (params.department && params.department !== 'ALL') cleanParams.department = params.department;
    if (params.industry && params.industry !== 'ALL') cleanParams.industry = params.industry;
    if (params.category && params.category !== 'ALL') cleanParams.category = params.category;
    if (params.limit) cleanParams.limit = params.limit;

    const response = await api.get<any, any>('/knowledge/search', { params: cleanParams });
    return response.data;
  },

  getDepartmentProfile: async (idOrCode: string) => {
    const response = await api.get<any, any>(`/knowledge/department/${idOrCode}`);
    return response.data;
  },

  getApprovalGuides: async (params?: {
    industry?: string;
    department?: string;
    search?: string;
    inspectionRequired?: boolean;
    renewalRequired?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const cleanParams: Record<string, any> = {};
    if (params) {
      if (params.industry && params.industry !== 'ALL') cleanParams.industry = params.industry;
      if (params.department && params.department !== 'ALL') cleanParams.department = params.department;
      if (params.search) cleanParams.search = params.search;
      if (typeof params.inspectionRequired === 'boolean')
        cleanParams.inspectionRequired = params.inspectionRequired;
      if (typeof params.renewalRequired === 'boolean')
        cleanParams.renewalRequired = params.renewalRequired;
      if (params.page) cleanParams.page = params.page;
      if (params.limit) cleanParams.limit = params.limit;
    }

    const response = await api.get<any, any>('/approval-guides', { params: cleanParams });
    return {
      items: (response.data?.items || (Array.isArray(response.data) ? response.data : [])) as ApprovalGuideItem[],
      pagination: response.data?.pagination || response.pagination,
    };
  },

  getApprovalGuideById: async (id: string): Promise<ApprovalGuideItem> => {
    const response = await api.get<any, any>(`/approval-guides/${id}`);
    return response.data;
  },

  getFAQs: async (params?: {
    department?: string;
    category?: string;
    keyword?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const cleanParams: Record<string, any> = {};
    if (params) {
      if (params.department && params.department !== 'ALL') cleanParams.department = params.department;
      if (params.category && params.category !== 'ALL') cleanParams.category = params.category;
      if (params.keyword) cleanParams.keyword = params.keyword;
      if (params.search) cleanParams.search = params.search;
      if (params.page) cleanParams.page = params.page;
      if (params.limit) cleanParams.limit = params.limit;
    }

    const response = await api.get<any, any>('/faq', { params: cleanParams });
    return {
      items: (response.data?.items || (Array.isArray(response.data) ? response.data : [])) as FAQItem[],
      pagination: response.data?.pagination || response.pagination,
    };
  },

  getRegulations: async (params?: {
    department?: string;
    industry?: string;
    actName?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const cleanParams: Record<string, any> = {};
    if (params) {
      if (params.department && params.department !== 'ALL') cleanParams.department = params.department;
      if (params.industry && params.industry !== 'ALL') cleanParams.industry = params.industry;
      if (params.actName) cleanParams.actName = params.actName;
      if (params.search) cleanParams.search = params.search;
      if (params.page) cleanParams.page = params.page;
      if (params.limit) cleanParams.limit = params.limit;
    }

    const response = await api.get<any, any>('/regulations', { params: cleanParams });
    return {
      items: (response.data?.items || (Array.isArray(response.data) ? response.data : [])) as RegulationItem[],
      pagination: response.data?.pagination || response.pagination,
    };
  },

  getCategories: async () => {
    const response = await api.get<any, any>('/knowledge/categories');
    return response.data;
  },
};

export default knowledgeService;
