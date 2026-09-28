import { Request, Response, NextFunction } from 'express';
import { knowledgeService } from '../services/knowledge.service';
import { ApiResponse } from '../utils/apiResponse';

export class KnowledgeController {
  /**
   * GET /knowledge or /api/v1/knowledge
   * High-level overview & system summary statistics
   */
  static async getKnowledgeOverview(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const overview = await knowledgeService.getKnowledgeOverview();
      ApiResponse.success(res, overview, 'Regulatory knowledge overview fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /knowledge/search or /api/v1/knowledge/search
   * Multi-entity keyword search across guides, FAQs, and regulations
   */
  static async searchKnowledge(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q, search, keyword, department, industry, category, limit, page } = req.query;
      const results = await knowledgeService.searchKnowledge({
        q: (q as string) || (search as string) || (keyword as string),
        department: department as string,
        industry: industry as string,
        category: category as string,
        limit: limit ? Number(limit) : undefined,
        page: page ? Number(page) : undefined,
      });

      ApiResponse.success(res, results, 'Regulatory knowledge search completed');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /knowledge/department/:id or /api/v1/knowledge/department/:id
   * Department regulatory dossier (Department info, Guides, Regulations, FAQs)
   */
  static async getDepartmentKnowledge(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const profile = await knowledgeService.getDepartmentKnowledgeProfile(id);
      ApiResponse.success(res, profile, `Regulatory profile for department "${id}" fetched successfully`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /approval-guides or /api/v1/approval-guides
   * Filtered approval guides
   */
  static async getApprovalGuides(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { industry, department, inspectionRequired, renewalRequired, search, page, limit } =
        req.query;

      const guides = await knowledgeService.getApprovalGuides({
        industry: industry as string,
        department: department as string,
        inspectionRequired:
          inspectionRequired !== undefined ? inspectionRequired === 'true' : undefined,
        renewalRequired: renewalRequired !== undefined ? renewalRequired === 'true' : undefined,
        search: search as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 25,
      });

      ApiResponse.success(
        res,
        {
          items: guides.items,
          pagination: {
            page: guides.page,
            limit: guides.limit,
            total: guides.total,
            totalPages: guides.totalPages,
          },
        },
        'Approval guides fetched successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /approval-guides/:id or /api/v1/approval-guides/:id
   */
  static async getApprovalGuideById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const guide = await knowledgeService.getApprovalGuideById(id);
      ApiResponse.success(res, guide, 'Approval guide details fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /faq or /api/v1/faq
   * Categorized FAQs with search and department filtering
   */
  static async getFAQs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { department, category, keyword, search, page, limit } = req.query;

      const faqs = await knowledgeService.getFAQs({
        department: department as string,
        category: category as string,
        keyword: keyword as string,
        search: search as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 50,
      });

      ApiResponse.success(
        res,
        {
          items: faqs.items,
          pagination: {
            page: faqs.page,
            limit: faqs.limit,
            total: faqs.total,
            totalPages: faqs.totalPages,
          },
        },
        'Regulatory FAQs fetched successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /faq/:id or /api/v1/faq/:id
   */
  static async getFAQById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const faq = await knowledgeService.getFAQById(id);
      ApiResponse.success(res, faq, 'FAQ details fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /regulations or /api/v1/regulations
   * Statutory acts, rules, and compliance mandates
   */
  static async getRegulations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { department, industry, actName, search, page, limit } = req.query;

      const regulations = await knowledgeService.getRegulations({
        department: department as string,
        industry: industry as string,
        actName: actName as string,
        search: search as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 25,
      });

      ApiResponse.success(
        res,
        {
          items: regulations.items,
          pagination: {
            page: regulations.page,
            limit: regulations.limit,
            total: regulations.total,
            totalPages: regulations.totalPages,
          },
        },
        'Statutory regulations fetched successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /regulations/:id or /api/v1/regulations/:id
   */
  static async getRegulationById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const regulation = await knowledgeService.getRegulationById(id);
      ApiResponse.success(res, regulation, 'Regulation details fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /knowledge/categories or /api/v1/knowledge/categories
   */
  static async getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await knowledgeService.getCategories();
      ApiResponse.success(res, categories, 'Knowledge categories fetched successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default KnowledgeController;
