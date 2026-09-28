import mongoose from 'mongoose';
import { Inspection, IInspection } from '../models/Inspection';
import { InspectionChecklist, IInspectionChecklist } from '../models/InspectionChecklist';
import { Project } from '../models/Project';
import { Application } from '../models/Application';
import { User } from '../models/User';
import { inspectionRepository } from '../repositories/inspection.repository';
import { inspectionSchedulerService } from './inspectionScheduler.service';
import {
  CreateInspectionDTO,
  UpdateInspectionDTO,
  UpdateInspectionStatusDTO,
  InspectionFilterParams,
  InspectionDetailsResponse,
} from '../types/inspection.types';
import { ApiError } from '../utils/apiError';
import { Logger } from '../utils/logger';

export class InspectionService {
  /**
   * Schedule a new field inspection with optional checklist items
   */
  async createInspection(data: CreateInspectionDTO, userId?: string): Promise<InspectionDetailsResponse> {
    const project = await Project.findOne({ _id: data.project, isDeleted: false });
    if (!project) {
      throw ApiError.notFound(`Project not found with ID ${data.project}`);
    }

    if (data.application) {
      const application = await Application.findOne({ _id: data.application, isDeleted: false });
      if (!application) {
        throw ApiError.notFound(`Application not found with ID ${data.application}`);
      }
    }

    const inspector = await User.findOne({ _id: data.assignedInspector, isActive: true });
    if (!inspector) {
      throw ApiError.notFound(`Inspector not found with ID ${data.assignedInspector}`);
    }

    const inspectionDate = new Date(data.inspectionDate);

    const historyEntry = {
      action: 'INSPECTION_SCHEDULED',
      performedBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      newStatus: data.status || 'Scheduled',
      remarks: data.remarks || `Inspection scheduled for ${inspectionDate.toISOString().split('T')[0]} at ${data.inspectionTime || '10:00 AM'}`,
      timestamp: new Date(),
    };

    const inspection = await inspectionRepository.create({
      project: new mongoose.Types.ObjectId(data.project),
      application: data.application ? new mongoose.Types.ObjectId(data.application) : undefined,
      department: data.department,
      assignedInspector: new mongoose.Types.ObjectId(data.assignedInspector),
      inspectionDate,
      inspectionTime: data.inspectionTime || '10:00 AM',
      inspectionType: data.inspectionType || 'Joint Site Visit',
      status: data.status || 'Scheduled',
      remarks: data.remarks || '',
      location: data.location || project.location || '',
      documentsVerified: data.documentsVerified || [],
      photos: data.photos || [],
      history: [historyEntry],
    });

    // Create checklist items if provided
    let checklist: IInspectionChecklist[] = [];
    if (data.checklist && data.checklist.length > 0) {
      checklist = await inspectionRepository.createChecklistItems(inspection._id, data.checklist);
    }

    // Synchronize application status if an application was linked
    if (data.application) {
      await Application.updateOne(
        { _id: data.application },
        {
          $set: {
            inspectionDate,
            status: 'Inspection Scheduled',
            currentStage: 'Field Inspection',
          },
          $push: {
            history: {
              action: 'INSPECTION_SCHEDULED',
              performedBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
              fromStatus: 'Under Scrutiny',
              toStatus: 'Inspection Scheduled',
              remarks: `Site inspection scheduled for ${inspectionDate.toISOString().split('T')[0]}`,
              timestamp: new Date(),
            },
          },
        }
      );
    }

    Logger.info(`Scheduled Inspection ${inspection._id} for project ${project.projectName}`);
    return {
      inspection,
      checklist,
      history: inspection.history,
    };
  }

  /**
   * Get all inspections with filters, search, and pagination
   */
  async getInspections(
    params: InspectionFilterParams,
    userRole?: string,
    userId?: string
  ): Promise<{ items: IInspection[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 10));
    const skip = (page - 1) * limit;

    const filter: any = {};

    // Scoping for Entrepreneurs: only show inspections belonging to projects they own
    if (userRole && userRole.toLowerCase() === 'entrepreneur' && userId) {
      const userProjects = await Project.find({ owner: userId, isDeleted: false }).select('_id');
      const projectIds = userProjects.map((p) => p._id);
      filter.project = { $in: projectIds };
    }

    if (params.project && mongoose.Types.ObjectId.isValid(params.project)) {
      filter.project = params.project;
    }

    if (params.application && mongoose.Types.ObjectId.isValid(params.application)) {
      filter.application = params.application;
    }

    if (params.department && params.department !== 'ALL') {
      filter.department = params.department;
    }

    if (params.assignedInspector && mongoose.Types.ObjectId.isValid(params.assignedInspector)) {
      filter.assignedInspector = params.assignedInspector;
    }

    if (params.status && params.status !== 'ALL') {
      filter.status = params.status;
    }

    if (params.inspectionType && params.inspectionType !== 'ALL') {
      filter.inspectionType = params.inspectionType;
    }

    if (params.startDate || params.endDate) {
      filter.inspectionDate = {};
      if (params.startDate) filter.inspectionDate.$gte = new Date(params.startDate);
      if (params.endDate) filter.inspectionDate.$lte = new Date(params.endDate);
    }

    if (params.search && params.search.trim()) {
      const searchRegex = new RegExp(params.search.trim(), 'i');
      filter.$or = [
        { department: searchRegex },
        { inspectionType: searchRegex },
        { location: searchRegex },
        { remarks: searchRegex },
        { findings: searchRegex },
      ];
    }

    let sort: any = { inspectionDate: -1 };
    if (params.sort) {
      if (params.sort === 'date_asc') sort = { inspectionDate: 1 };
      else if (params.sort === 'date_desc') sort = { inspectionDate: -1 };
      else if (params.sort === 'status') sort = { status: 1, inspectionDate: -1 };
      else if (params.sort === 'newest') sort = { createdAt: -1 };
    }

    const { items, total } = await inspectionRepository.find(filter, { skip, limit, sort });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Get single inspection by ID with checklist and audit history
   */
  async getInspectionById(id: string): Promise<InspectionDetailsResponse> {
    const inspection = await inspectionRepository.findById(id);
    if (!inspection) {
      throw ApiError.notFound(`Inspection record not found with ID ${id}`);
    }

    const checklist = await inspectionRepository.getChecklist(id);

    return {
      inspection,
      checklist,
      history: inspection.history,
    };
  }

  /**
   * Update inspection details and optional checklist items
   */
  async updateInspection(
    id: string,
    updateData: UpdateInspectionDTO,
    userId?: string
  ): Promise<InspectionDetailsResponse> {
    const existing = await inspectionRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound(`Inspection record not found with ID ${id}`);
    }

    const cleanedData: Partial<IInspection> = {};
    if (updateData.department) cleanedData.department = updateData.department;
    if (updateData.assignedInspector) {
      cleanedData.assignedInspector = new mongoose.Types.ObjectId(updateData.assignedInspector);
    }
    if (updateData.inspectionDate) cleanedData.inspectionDate = new Date(updateData.inspectionDate);
    if (updateData.inspectionTime) cleanedData.inspectionTime = updateData.inspectionTime;
    if (updateData.inspectionType) cleanedData.inspectionType = updateData.inspectionType;
    if (updateData.remarks !== undefined) cleanedData.remarks = updateData.remarks;
    if (updateData.findings !== undefined) cleanedData.findings = updateData.findings;
    if (updateData.location !== undefined) cleanedData.location = updateData.location;
    if (updateData.documentsVerified) cleanedData.documentsVerified = updateData.documentsVerified;
    if (updateData.photos) cleanedData.photos = updateData.photos;

    const historyEntry = {
      action: 'INSPECTION_UPDATED',
      performedBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      remarks: updateData.remarks || 'Inspection details modified',
      timestamp: new Date(),
    };

    const updated = await inspectionRepository.update(id, cleanedData);
    if (!updated) {
      throw ApiError.internal('Failed to update inspection');
    }

    await inspectionRepository.addHistory(id, historyEntry);

    // Update checklist if items provided
    if (updateData.checklist && Array.isArray(updateData.checklist)) {
      // Upsert or replace
      await inspectionRepository.deleteChecklistByInspection(id);
      await inspectionRepository.createChecklistItems(
        updated._id,
        updateData.checklist.map((c) => ({
          item: c.item,
          status: c.status,
          remarks: c.remarks,
        }))
      );
    }

    const checklist = await inspectionRepository.getChecklist(id);

    return {
      inspection: updated,
      checklist,
      history: updated.history,
    };
  }

  /**
   * Update inspection status (Completed, Rescheduled, Cancelled, etc.)
   */
  async updateInspectionStatus(
    id: string,
    data: UpdateInspectionStatusDTO,
    userId?: string
  ): Promise<IInspection> {
    if (data.status === 'Completed') {
      return await inspectionSchedulerService.completeInspection(
        id,
        {
          findings: data.findings,
          remarks: data.remarks,
          documentsVerified: data.documentsVerified,
          photos: data.photos,
        },
        userId
      );
    }

    if (data.status === 'Cancelled') {
      return await inspectionSchedulerService.cancelInspection(
        id,
        data.remarks || 'Inspection cancelled by administrative action',
        userId
      );
    }

    const existing = await inspectionRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound(`Inspection record not found with ID ${id}`);
    }

    const previousStatus = existing.status;
    const historyEntry = {
      action: `STATUS_CHANGED_TO_${data.status.toUpperCase()}`,
      performedBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      previousStatus,
      newStatus: data.status,
      remarks: data.remarks || `Status transitioned to ${data.status}`,
      timestamp: new Date(),
    };

    const updated = await inspectionRepository.update(id, {
      status: data.status,
      remarks: data.remarks || existing.remarks,
      findings: data.findings || existing.findings,
    });

    if (!updated) {
      throw ApiError.internal('Failed to update inspection status');
    }

    await inspectionRepository.addHistory(id, historyEntry);
    return updated;
  }

  /**
   * Soft delete inspection
   */
  async deleteInspection(id: string, userId?: string): Promise<boolean> {
    const existing = await inspectionRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound(`Inspection record not found with ID ${id}`);
    }

    const historyEntry = {
      action: 'INSPECTION_ARCHIVED',
      performedBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      previousStatus: existing.status,
      remarks: 'Inspection record archived',
      timestamp: new Date(),
    };

    await inspectionRepository.addHistory(id, historyEntry);
    return await inspectionRepository.softDelete(id);
  }
}

export const inspectionService = new InspectionService();
export default inspectionService;
