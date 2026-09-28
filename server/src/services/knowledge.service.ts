import { knowledgeRepository, KnowledgeRepository } from '../repositories/knowledge.repository';
import {
  IKnowledgeSearchParams,
  IApprovalGuideFilterParams,
  IFAQFilterParams,
  IRegulationFilterParams,
  IKnowledgeSearchResponse,
  IDepartmentRegulatoryProfile,
  IKnowledgeOverviewResponse,
} from '../types/knowledge.types';
import { ApiError } from '../utils/apiError';
import { Logger } from '../utils/logger';

export class KnowledgeService {
  private repository: KnowledgeRepository;

  constructor(repository: KnowledgeRepository = knowledgeRepository) {
    this.repository = repository;
  }

  /**
   * Get unified high-level regulatory overview and statistics
   */
  async getKnowledgeOverview(): Promise<IKnowledgeOverviewResponse> {
    const overview = await this.repository.getOverviewStats();
    return overview;
  }

  /**
   * Multi-entity keyword search across guides, FAQs, regulations, and departments
   */
  async searchKnowledge(params: IKnowledgeSearchParams): Promise<IKnowledgeSearchResponse> {
    const rawSearch = (params.q || params.search || params.keyword || '').trim();

    const searchResults = await this.repository.searchAcrossAll(params);

    const totalMatches =
      searchResults.approvalGuides.length +
      searchResults.faqs.length +
      searchResults.regulations.length +
      searchResults.departments.length;

    Logger.info(
      `Knowledge Search executed for query="${rawSearch}" | Dept="${params.department || 'ALL'}" | Ind="${params.industry || 'ALL'}" | Found ${totalMatches} total results`
    );

    return {
      query: rawSearch,
      appliedFilters: {
        department: params.department,
        industry: params.industry,
        category: params.category,
      },
      totalMatches,
      approvalGuides: searchResults.approvalGuides,
      faqs: searchResults.faqs,
      regulations: searchResults.regulations,
      departments: searchResults.departments,
    };
  }

  /**
   * Retrieve complete regulatory profile for a specific department
   */
  async getDepartmentKnowledgeProfile(identifier: string): Promise<IDepartmentRegulatoryProfile> {
    const department = await this.repository.findDepartmentByIdOrCode(identifier);
    if (!department) {
      throw ApiError.notFound(`Department not found for identifier: "${identifier}"`);
    }

    const { approvalGuides, regulations, faqs } =
      await this.repository.getDepartmentRegulatoryData(department);

    const mandatoryInspectionsCount = approvalGuides.filter((g) => g.inspectionRequired).length;
    const periodicRenewalsCount = approvalGuides.filter((g) => g.renewalRequired).length;

    return {
      department,
      statistics: {
        totalApprovalGuides: approvalGuides.length,
        totalRegulations: regulations.length,
        totalFaqs: faqs.length,
        mandatoryInspectionsCount,
        periodicRenewalsCount,
      },
      approvalGuides,
      regulations,
      faqs,
    };
  }

  /**
   * Filter and list Approval Guides
   */
  async getApprovalGuides(params: IApprovalGuideFilterParams) {
    return await this.repository.findApprovalGuides(params);
  }

  /**
   * Get single Approval Guide
   */
  async getApprovalGuideById(id: string) {
    const guide = await this.repository.findApprovalGuideById(id);
    if (!guide) {
      throw ApiError.notFound('Approval Guide not found');
    }
    return guide;
  }

  /**
   * Filter and list FAQs
   */
  async getFAQs(params: IFAQFilterParams) {
    return await this.repository.findFAQs(params);
  }

  /**
   * Get single FAQ
   */
  async getFAQById(id: string) {
    const faq = await this.repository.findFAQById(id);
    if (!faq) {
      throw ApiError.notFound('FAQ not found');
    }
    return faq;
  }

  /**
   * Filter and list Regulations
   */
  async getRegulations(params: IRegulationFilterParams) {
    return await this.repository.findRegulations(params);
  }

  /**
   * Get single Regulation
   */
  async getRegulationById(id: string) {
    const regulation = await this.repository.findRegulationById(id);
    if (!regulation) {
      throw ApiError.notFound('Regulation not found');
    }
    return regulation;
  }

  /**
   * Get all knowledge categories
   */
  async getCategories() {
    return await this.repository.getCategories();
  }
}

export const knowledgeService = new KnowledgeService();
export default knowledgeService;
