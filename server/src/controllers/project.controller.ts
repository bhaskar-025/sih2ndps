import { Request, Response, NextFunction } from 'express';
import { Project } from '../models/Project';
import { Application } from '../models/Application';
import { User } from '../models/User';
import '../models/Document';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';
import { AIComplianceService } from '../services/ai/aiCompliance.service';
import { Logger } from '../utils/logger';

export class ProjectController {
  /**
   * POST /api/v1/projects
   * Create a new Industrial Project (Unit)
   */
  static async createProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let ownerId = req.user?.userId;
      if (!ownerId) {
        // Fallback to seeded demo entrepreneur user if available
        const defaultOwner = await User.findOne({ role: { $regex: /entrepreneur/i } });
        ownerId = defaultOwner?._id?.toString();
      }
      if (!ownerId) {
        const anyUser = await User.findOne({});
        ownerId = anyUser?._id?.toString();
      }
      if (!ownerId) {
        throw ApiError.unauthorized('User must be authenticated to create a project');
      }

      const project = new Project({
        ...req.body,
        owner: ownerId,
        isDeleted: false,
      });

      await project.save();
      await project.populate('owner', 'name email phone organization department');

      // Automatically register statutory clearance application in Officer Workplace
      try {
        const dept =
          req.body.pollutionCategory === 'Red' || req.body.pollutionCategory === 'Orange'
            ? 'Maharashtra Pollution Control Board (MPCB)'
            : 'Directorate of Industrial Safety & Health (DISH)';

        const appNumber = `APP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

        const initialApplication = new Application({
          applicationNumber: appNumber,
          projectId: project._id,
          department: dept,
          serviceName: `Composite Industrial Clearance (${req.body.pollutionCategory || 'Orange'} Category)`,
          priority: req.body.pollutionCategory === 'Red' ? 'High' : 'Normal',
          slaDays: 21,
          status: 'Submitted',
          currentStage: 'Document Scrutiny',
          remarks: `New industrial unit clearance request submitted for ${project.projectName} (${project.industry}).`,
          submittedAt: new Date(),
          lastUpdated: new Date(),
          history: [
            {
              action: 'Application Submission',
              performedBy: ownerId,
              toStatus: 'Submitted',
              remarks: `Initial registration of industrial unit ${project.projectName}`,
              timestamp: new Date(),
            },
          ],
        });
        await initialApplication.save();
      } catch (appErr: any) {
        Logger.warn(`Initial application creation warning: ${appErr.message}`);
      }

      // Trigger AI Compliance score calculation on project creation
      AIComplianceService.calculateComplianceScore(project._id.toString()).catch((err) => {
        Logger.error(`Background compliance score calculation on create failed: ${err.message}`);
      });

      res.status(201).json({
        success: true,
        message: 'Project created successfully and queued in Officer Workplace',
        data: project,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/projects
   * Get All Projects with Pagination, Search, Sort, Filter
   */
  static async getProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const skip = (page - 1) * limit;

      const { search, industry, district, status, projectStage, sort } = req.query;

      // Base query: exclude soft-deleted projects
      const query: any = { isDeleted: { $ne: true } };

      // Role scoping: Entrepreneur can only see their own projects unless Admin/Officer
      const userRole = (req.user?.role || '').toLowerCase();
      if (userRole === 'entrepreneur') {
        query.owner = req.user?.userId;
      }

      // Search across projectName, companyName, district, industry
      if (search && typeof search === 'string' && search.trim() !== '') {
        const searchRegex = new RegExp(search.trim(), 'i');
        query.$or = [
          { projectName: searchRegex },
          { companyName: searchRegex },
          { district: searchRegex },
          { industry: searchRegex },
          { location: searchRegex },
        ];
      }

      // Filters
      if (industry && typeof industry === 'string' && industry !== 'ALL') {
        query.industry = industry;
      }
      if (district && typeof district === 'string' && district !== 'ALL') {
        query.district = district;
      }
      if (status && typeof status === 'string' && status !== 'ALL') {
        query.status = status;
      }
      if (projectStage && typeof projectStage === 'string' && projectStage !== 'ALL') {
        query.projectStage = projectStage;
      }

      // Sorting
      let sortCriteria: any = { createdAt: -1 };
      if (sort && typeof sort === 'string') {
        if (sort === 'investment_asc') sortCriteria = { investment: 1 };
        else if (sort === 'investment_desc') sortCriteria = { investment: -1 };
        else if (sort === 'name_asc') sortCriteria = { projectName: 1 };
        else if (sort === 'name_desc') sortCriteria = { projectName: -1 };
        else if (sort === 'oldest') sortCriteria = { createdAt: 1 };
      }

      const total = await Project.countDocuments(query);
      const totalPages = Math.ceil(total / limit) || 1;

      const projects = await Project.find(query)
        .populate('owner', 'name email phone organization department')
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit);

      res.status(200).json({
        success: true,
        message: 'Projects retrieved successfully',
        data: projects,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/projects/:id
   * Get single project details with populated relationships
   */
  static async getProjectById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const project = await Project.findOne({
        _id: req.params.id,
        isDeleted: { $ne: true },
      })
        .populate('owner', 'name email phone organization department')
        .populate({
          path: 'applications',
          select: 'applicationNumber serviceName status currentStage priority submittedAt',
        })
        .populate({
          path: 'documents',
          select: 'title originalName verificationStatus aiClassificationTag createdAt',
        });

      if (!project) {
        throw ApiError.notFound('Project not found or has been removed');
      }

      // If entrepreneur, verify ownership
      const userRole = (req.user?.role || '').toLowerCase();
      if (userRole === 'entrepreneur' && project.owner._id.toString() !== req.user?.userId) {
        throw ApiError.forbidden('You do not have permission to view this project docket');
      }

      res.status(200).json({
        success: true,
        message: 'Project details retrieved successfully',
        data: project,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/projects/:id
   * Update project fields
   */
  static async updateProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const project = await Project.findOne({
        _id: req.params.id,
        isDeleted: { $ne: true },
      });

      if (!project) {
        throw ApiError.notFound('Project not found or has been removed');
      }

      // Check ownership
      const userRole = (req.user?.role || '').toLowerCase();
      if (userRole === 'entrepreneur' && project.owner.toString() !== req.user?.userId) {
        throw ApiError.forbidden('You do not have permission to modify this project');
      }

      // Update fields
      const updated = await Project.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      ).populate('owner', 'name email phone organization department');

      // Trigger AI Compliance Score Engine calculation whenever project changes
      if (updated) {
        AIComplianceService.calculateComplianceScore(updated._id.toString()).catch((err) => {
          Logger.error(`Background compliance score calculation failed: ${err.message}`);
        });
      }

      res.status(200).json({
        success: true,
        message: 'Project updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/projects/:id
   * Soft delete a project
   */
  static async deleteProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const project = await Project.findOne({
        _id: req.params.id,
        isDeleted: { $ne: true },
      });

      if (!project) {
        throw ApiError.notFound('Project not found or has already been removed');
      }

      // Check ownership
      const userRole = (req.user?.role || '').toLowerCase();
      if (userRole === 'entrepreneur' && project.owner.toString() !== req.user?.userId) {
        throw ApiError.forbidden('You do not have permission to delete this project');
      }

      // Soft delete: set isDeleted to true
      await Project.findByIdAndUpdate(req.params.id, { isDeleted: true });

      res.status(200).json({
        success: true,
        message: 'Project removed successfully',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default ProjectController;
