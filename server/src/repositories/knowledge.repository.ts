import mongoose, { FilterQuery } from 'mongoose';
import { Department, IDepartment } from '../models/Department';
import { ApprovalGuide, IApprovalGuide } from '../models/ApprovalGuide';
import { FAQ, IFAQ } from '../models/FAQ';
import { Regulation, IRegulation } from '../models/Regulation';
import { KnowledgeCategory, IKnowledgeCategory } from '../models/KnowledgeCategory';
import {
  IKnowledgeSearchParams,
  IApprovalGuideFilterParams,
  IFAQFilterParams,
  IRegulationFilterParams,
} from '../types/knowledge.types';

export class KnowledgeRepository {
  /**
   * Universal keyword search across all Regulatory Knowledge Models
   */
  async searchAcrossAll(params: IKnowledgeSearchParams) {
    const rawSearch = (params.q || params.search || params.keyword || '').trim();
    const limit = Math.min(Number(params.limit) || 20, 50);

    const guideFilter: FilterQuery<IApprovalGuide> = {};
    const faqFilter: FilterQuery<IFAQ> = {};
    const regFilter: FilterQuery<IRegulation> = {};
    const deptFilter: FilterQuery<IDepartment> = { status: 'Active' };

    // Apply department filtering if provided
    if (params.department && params.department !== 'ALL') {
      const deptRegex = new RegExp(params.department.trim(), 'i');
      guideFilter.department = deptRegex;
      faqFilter.department = deptRegex;
      regFilter.department = deptRegex;
      deptFilter.$or = [{ name: deptRegex }, { code: deptRegex }];
    }

    // Apply industry filtering if provided
    if (params.industry && params.industry !== 'ALL') {
      const indRegex = new RegExp(params.industry.trim(), 'i');
      guideFilter.industryTypes = { $in: [indRegex, /ALL/i] };
      regFilter.applicableIndustries = { $in: [indRegex, /ALL/i] };
    }

    // Apply category filtering if provided
    if (params.category && params.category !== 'ALL') {
      faqFilter.category = new RegExp(params.category.trim(), 'i');
    }

    // Apply search query across fields
    if (rawSearch) {
      const searchRegex = new RegExp(rawSearch, 'i');

      guideFilter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { department: searchRegex },
        { requiredDocuments: searchRegex },
        { eligibilityCriteria: searchRegex },
        { industryTypes: searchRegex },
      ];

      faqFilter.$or = [
        { question: searchRegex },
        { answer: searchRegex },
        { category: searchRegex },
        { keywords: searchRegex },
        { department: searchRegex },
      ];

      regFilter.$or = [
        { title: searchRegex },
        { actName: searchRegex },
        { ruleNumber: searchRegex },
        { summary: searchRegex },
        { department: searchRegex },
        { applicableIndustries: searchRegex },
      ];

      deptFilter.$or = [
        { name: searchRegex },
        { code: searchRegex },
        { description: searchRegex },
        { approvalTypes: searchRegex },
      ];
    }

    const [approvalGuides, faqs, regulations, departments] = await Promise.all([
      ApprovalGuide.find(guideFilter).limit(limit).populate('faqIds').lean(),
      FAQ.find(faqFilter).limit(limit).lean(),
      Regulation.find(regFilter).limit(limit).lean(),
      Department.find(deptFilter).limit(limit).lean(),
    ]);

    return {
      approvalGuides: approvalGuides as unknown as IApprovalGuide[],
      faqs: faqs as unknown as IFAQ[],
      regulations: regulations as unknown as IRegulation[],
      departments: departments as unknown as IDepartment[],
    };
  }

  /**
   * Query Approval Guides with comprehensive filtering & pagination
   */
  async findApprovalGuides(params: IApprovalGuideFilterParams) {
    const page = Math.max(Number(params.page) || 1, 1);
    const limit = Math.min(Number(params.limit) || 25, 100);
    const skip = (page - 1) * limit;

    const filter: FilterQuery<IApprovalGuide> = {};

    if (params.department && params.department !== 'ALL') {
      filter.department = new RegExp(params.department.trim(), 'i');
    }

    if (params.industry && params.industry !== 'ALL') {
      const indRegex = new RegExp(params.industry.trim(), 'i');
      filter.industryTypes = { $in: [indRegex, /ALL/i] };
    }

    if (typeof params.inspectionRequired === 'boolean') {
      filter.inspectionRequired = params.inspectionRequired;
    }

    if (typeof params.renewalRequired === 'boolean') {
      filter.renewalRequired = params.renewalRequired;
    }

    if (params.search && params.search.trim()) {
      const searchRegex = new RegExp(params.search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { department: searchRegex },
        { requiredDocuments: searchRegex },
        { eligibilityCriteria: searchRegex },
      ];
    }

    const [items, total] = await Promise.all([
      ApprovalGuide.find(filter)
        .sort({ department: 1, title: 1 })
        .skip(skip)
        .limit(limit)
        .populate('faqIds')
        .exec(),
      ApprovalGuide.countDocuments(filter),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
  }

  /**
   * Find single Approval Guide by ID
   */
  async findApprovalGuideById(id: string): Promise<IApprovalGuide | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await ApprovalGuide.findById(id).populate('faqIds').exec();
  }

  /**
   * Query FAQs with category & keyword filters
   */
  async findFAQs(params: IFAQFilterParams) {
    const page = Math.max(Number(params.page) || 1, 1);
    const limit = Math.min(Number(params.limit) || 50, 100);
    const skip = (page - 1) * limit;

    const filter: FilterQuery<IFAQ> = {};

    if (params.department && params.department !== 'ALL') {
      filter.department = new RegExp(params.department.trim(), 'i');
    }

    if (params.category && params.category !== 'ALL') {
      filter.category = new RegExp(params.category.trim(), 'i');
    }

    if (params.keyword && params.keyword.trim()) {
      filter.keywords = new RegExp(params.keyword.trim(), 'i');
    }

    if (params.search && params.search.trim()) {
      const searchRegex = new RegExp(params.search.trim(), 'i');
      filter.$or = [
        { question: searchRegex },
        { answer: searchRegex },
        { category: searchRegex },
        { keywords: searchRegex },
        { department: searchRegex },
      ];
    }

    const [items, total] = await Promise.all([
      FAQ.find(filter)
        .sort({ department: 1, category: 1, question: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      FAQ.countDocuments(filter),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
  }

  /**
   * Find single FAQ by ID
   */
  async findFAQById(id: string): Promise<IFAQ | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await FAQ.findById(id).exec();
  }

  /**
   * Query Regulations with acts, rules, and industry filters
   */
  async findRegulations(params: IRegulationFilterParams) {
    const page = Math.max(Number(params.page) || 1, 1);
    const limit = Math.min(Number(params.limit) || 25, 100);
    const skip = (page - 1) * limit;

    const filter: FilterQuery<IRegulation> = {};

    if (params.department && params.department !== 'ALL') {
      filter.department = new RegExp(params.department.trim(), 'i');
    }

    if (params.industry && params.industry !== 'ALL') {
      const indRegex = new RegExp(params.industry.trim(), 'i');
      filter.applicableIndustries = { $in: [indRegex, /ALL/i] };
    }

    if (params.actName && params.actName.trim()) {
      filter.actName = new RegExp(params.actName.trim(), 'i');
    }

    if (params.search && params.search.trim()) {
      const searchRegex = new RegExp(params.search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { actName: searchRegex },
        { ruleNumber: searchRegex },
        { summary: searchRegex },
        { department: searchRegex },
      ];
    }

    const [items, total] = await Promise.all([
      Regulation.find(filter)
        .sort({ effectiveDate: -1, title: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Regulation.countDocuments(filter),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
  }

  /**
   * Find single Regulation by ID
   */
  async findRegulationById(id: string): Promise<IRegulation | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await Regulation.findById(id).exec();
  }

  /**
   * Find department by ObjectId, code (e.g. 'MPCB'), or exact name
   */
  async findDepartmentByIdOrCode(identifier: string): Promise<IDepartment | null> {
    const trimmed = identifier.trim();

    if (mongoose.Types.ObjectId.isValid(trimmed)) {
      const deptById = await Department.findById(trimmed);
      if (deptById) return deptById;
    }

    const deptByCode = await Department.findOne({
      $or: [
        { code: trimmed.toUpperCase() },
        { name: new RegExp(`^${trimmed}$`, 'i') },
        { name: new RegExp(trimmed, 'i') },
      ],
    });

    return deptByCode;
  }

  /**
   * Fetch all regulatory entities for a specific department
   */
  async getDepartmentRegulatoryData(department: IDepartment) {
    // Generate department matching tokens (e.g. 'MPCB', 'Pollution Control Board')
    const deptTokens = [department.name, department.code].filter(Boolean);
    const regexPattern = deptTokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const deptRegex = new RegExp(regexPattern, 'i');

    const [approvalGuides, regulations, faqs] = await Promise.all([
      ApprovalGuide.find({
        $or: [{ department: deptRegex }, { department: department.name }, { department: department.code }],
      })
        .populate('faqIds')
        .sort({ title: 1 }),
      Regulation.find({
        $or: [{ department: deptRegex }, { department: department.name }, { department: department.code }],
      }).sort({ effectiveDate: -1 }),
      FAQ.find({
        $or: [{ department: deptRegex }, { department: department.name }, { department: department.code }],
      }).sort({ category: 1, question: 1 }),
    ]);

    return {
      approvalGuides,
      regulations,
      faqs,
    };
  }

  /**
   * All knowledge categories
   */
  async getCategories(): Promise<IKnowledgeCategory[]> {
    return await KnowledgeCategory.find().sort({ name: 1 }).exec();
  }

  /**
   * Aggregate high-level statistics for the regulatory overview
   */
  async getOverviewStats() {
    const [
      totalDepartments,
      totalApprovalGuides,
      totalRegulations,
      totalFaqs,
      totalCategories,
      categories,
      departments,
      featuredApprovalGuides,
      recentRegulations,
      popularFaqs,
    ] = await Promise.all([
      Department.countDocuments({ status: { $ne: 'Inactive' } }),
      ApprovalGuide.countDocuments(),
      Regulation.countDocuments(),
      FAQ.countDocuments(),
      KnowledgeCategory.countDocuments(),
      KnowledgeCategory.find().sort({ name: 1 }),
      Department.find({ status: { $ne: 'Inactive' } }).sort({ name: 1 }),
      ApprovalGuide.find().limit(6).sort({ updatedAt: -1 }).populate('faqIds'),
      Regulation.find().limit(6).sort({ effectiveDate: -1 }),
      FAQ.find().limit(8).sort({ createdAt: -1 }),
    ]);

    return {
      statistics: {
        totalDepartments,
        totalApprovalGuides,
        totalRegulations,
        totalFaqs,
        totalCategories,
      },
      categories,
      departments,
      featuredApprovalGuides,
      recentRegulations,
      popularFaqs,
    };
  }
}

export const knowledgeRepository = new KnowledgeRepository();
export default knowledgeRepository;
