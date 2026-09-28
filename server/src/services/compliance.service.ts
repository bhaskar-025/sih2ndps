import mongoose from 'mongoose';
import { Compliance, ICompliance, ComplianceStatus } from '../models/Compliance';
import { Project } from '../models/Project';
import { complianceRepository } from '../repositories/compliance.repository';
import { complianceEngineService } from './complianceEngine.service';
import {
  ComplianceFilterParams,
  CreateComplianceDTO,
  UpdateComplianceDTO,
  ComplianceScoreResult,
} from '../types/compliance.types';
import { ApiError } from '../utils/apiError';
import { Logger } from '../utils/logger';

export class ComplianceService {
  /**
   * Create a new compliance record
   */
  async createCompliance(data: CreateComplianceDTO, userId?: string): Promise<ICompliance> {
    // Validate project existence
    const project = await Project.findOne({ _id: data.projectId, isDeleted: false });
    if (!project) {
      throw ApiError.notFound(`Project not found with ID ${data.projectId}`);
    }

    // Determine initial status via engine
    const tempDoc = new Compliance({
      ...data,
      projectId: new mongoose.Types.ObjectId(data.projectId),
      approvalId: data.approvalId ? new mongoose.Types.ObjectId(data.approvalId) : undefined,
      status: 'Upcoming',
    });
    const evalResult = complianceEngineService.evaluateCompliance(tempDoc);

    const historyEntry = {
      action: 'COMPLIANCE_CREATED',
      performedBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      newStatus: evalResult.newStatus,
      remarks: data.remarks || 'Statutory compliance tracking item created',
      timestamp: new Date(),
    };

    const compliance = await complianceRepository.create({
      ...data,
      projectId: new mongoose.Types.ObjectId(data.projectId) as any,
      approvalId: data.approvalId ? (new mongoose.Types.ObjectId(data.approvalId) as any) : undefined,
      lastCompleted: data.lastCompleted ? new Date(data.lastCompleted) : undefined,
      nextDueDate: new Date(data.nextDueDate),
      status: evalResult.newStatus,
      history: [historyEntry],
    });

    Logger.info(`Created Compliance ${compliance._id} (${compliance.complianceName}) for project ${data.projectId}`);
    return compliance;
  }

  /**
   * Get all compliances with filtering and pagination
   */
  async getCompliances(
    params: ComplianceFilterParams,
    userRole?: string,
    userId?: string
  ): Promise<{ items: ICompliance[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 10));
    const skip = (page - 1) * limit;

    const filter: any = {};

    // Role-based scoping: Entrepreneurs only see compliances of projects they own
    if (userRole && userRole.toLowerCase() === 'entrepreneur' && userId) {
      const userProjects = await Project.find({ owner: userId, isDeleted: false }).select('_id');
      const projectIds = userProjects.map((p) => p._id);
      filter.projectId = { $in: projectIds };
    }

    if (params.projectId && mongoose.Types.ObjectId.isValid(params.projectId)) {
      filter.projectId = params.projectId;
    }

    if (params.department && params.department !== 'ALL') {
      filter.department = params.department;
    }

    if (params.status && params.status !== 'ALL') {
      filter.status = params.status;
    }

    if (params.priority && params.priority !== 'ALL') {
      filter.priority = params.priority;
    }

    if (params.penaltyRisk && params.penaltyRisk !== 'ALL') {
      filter.penaltyRisk = params.penaltyRisk;
    }

    if (typeof params.renewalRequired === 'boolean') {
      filter.renewalRequired = params.renewalRequired;
    }

    if (params.search && params.search.trim()) {
      const searchRegex = new RegExp(params.search.trim(), 'i');
      filter.$or = [
        { complianceName: searchRegex },
        { department: searchRegex },
        { remarks: searchRegex },
      ];
    }

    let sort: any = { nextDueDate: 1 };
    if (params.sort) {
      if (params.sort === 'dueDate_asc') sort = { nextDueDate: 1 };
      else if (params.sort === 'dueDate_desc') sort = { nextDueDate: -1 };
      else if (params.sort === 'priority') sort = { priority: -1, nextDueDate: 1 };
      else if (params.sort === 'newest') sort = { createdAt: -1 };
    }

    const { items, total } = await complianceRepository.find(filter, { skip, limit, sort });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Get compliances for a specific industrial unit / project
   */
  async getProjectCompliances(
    projectId: string,
    params: ComplianceFilterParams = {}
  ): Promise<{ items: ICompliance[]; score: ComplianceScoreResult }> {
    const project = await Project.findOne({ _id: projectId, isDeleted: false });
    if (!project) {
      throw ApiError.notFound(`Project not found with ID ${projectId}`);
    }

    // Auto-evaluate project compliances state machine first
    await complianceEngineService.evaluateProjectCompliances(projectId);

    const filter: any = {};
    if (params.status && params.status !== 'ALL') filter.status = params.status;
    if (params.department && params.department !== 'ALL') filter.department = params.department;
    if (params.priority && params.priority !== 'ALL') filter.priority = params.priority;

    const items = await complianceRepository.findByProject(projectId, filter);
    const score = await this.calculateComplianceScore(projectId);

    return { items, score };
  }

  /**
   * Get compliance by ID
   */
  async getComplianceById(id: string): Promise<ICompliance> {
    const compliance = await complianceRepository.findById(id);
    if (!compliance) {
      throw ApiError.notFound(`Compliance record not found with ID ${id}`);
    }
    return compliance;
  }

  /**
   * Update compliance record by ID
   */
  async updateCompliance(
    id: string,
    updateData: UpdateComplianceDTO,
    userId?: string
  ): Promise<ICompliance> {
    const existing = await complianceRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound(`Compliance record not found with ID ${id}`);
    }

    const cleanedData: any = { ...updateData };
    if (updateData.nextDueDate) {
      cleanedData.nextDueDate = new Date(updateData.nextDueDate);
    }
    if (updateData.lastCompleted) {
      cleanedData.lastCompleted = new Date(updateData.lastCompleted);
    }

    const historyEntry = {
      action: 'COMPLIANCE_UPDATED',
      performedBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      remarks: updateData.remarks || 'Compliance parameters updated',
      timestamp: new Date(),
    };

    const updated = await complianceRepository.update(id, cleanedData);
    if (!updated) {
      throw ApiError.internal('Failed to update compliance record');
    }

    await complianceRepository.addHistory(id, historyEntry);
    return updated;
  }

  /**
   * Update compliance status (e.g. Completed, Renewal Pending)
   */
  async updateComplianceStatus(
    id: string,
    newStatus: ComplianceStatus,
    remarks?: string,
    userId?: string,
    completionDate?: string | Date,
    nextDueDate?: string | Date
  ): Promise<ICompliance> {
    const existing = await complianceRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound(`Compliance record not found with ID ${id}`);
    }

    const previousStatus = existing.status;
    const updatePayload: any = { status: newStatus };

    if (remarks) {
      updatePayload.remarks = remarks;
    }

    // If marked Completed, set lastCompleted and optionally calculate next recurring due date
    if (newStatus === 'Completed') {
      const compDate = completionDate ? new Date(completionDate) : new Date();
      updatePayload.lastCompleted = compDate;

      // If nextDueDate is explicitly provided or if recurring, compute next due date
      if (nextDueDate) {
        updatePayload.nextDueDate = new Date(nextDueDate);
      } else if (existing.frequency && existing.frequency !== 'One-Time') {
        const nextDate = complianceEngineService.computeNextRecurringDueDate(
          compDate,
          existing.frequency
        );
        updatePayload.nextDueDate = nextDate;
        updatePayload.status = 'Upcoming'; // auto-reset to Upcoming for next cycle
      }
    } else if (nextDueDate) {
      updatePayload.nextDueDate = new Date(nextDueDate);
    }

    const historyEntry = {
      action: `STATUS_CHANGED_TO_${newStatus.toUpperCase().replace(/\s+/g, '_')}`,
      performedBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      previousStatus,
      newStatus,
      remarks: remarks || `Status transitioned from ${previousStatus} to ${newStatus}`,
      timestamp: new Date(),
    };

    const updated = await complianceRepository.update(id, updatePayload);
    if (!updated) {
      throw ApiError.internal('Failed to update compliance status');
    }

    await complianceRepository.addHistory(id, historyEntry);
    Logger.info(`Compliance ${id} status updated: ${previousStatus} -> ${newStatus}`);
    return updated;
  }

  /**
   * Calculate comprehensive statutory compliance score (0-100%)
   */
  async calculateComplianceScore(projectId: string): Promise<ComplianceScoreResult> {
    const compliances = await complianceRepository.findByProject(projectId);
    const totalCompliances = compliances.length;

    if (totalCompliances === 0) {
      return {
        scorePercentage: 100,
        totalCompliances: 0,
        completedCount: 0,
        upcomingCount: 0,
        dueSoonCount: 0,
        renewalPendingCount: 0,
        overdueCount: 0,
        penaltyRiskBreakdown: { critical: 0, high: 0, medium: 0, low: 0 },
        statusBreakdown: {
          Completed: 0,
          Upcoming: 0,
          'Due Soon': 0,
          'Renewal Pending': 0,
          Overdue: 0,
        },
        rating: 'AAA - Exemplary',
        summary: 'No statutory compliances currently registered for this project docket.',
        computedAt: new Date().toISOString(),
      };
    }

    let completedCount = 0;
    let upcomingCount = 0;
    let dueSoonCount = 0;
    let renewalPendingCount = 0;
    let overdueCount = 0;

    const penaltyRiskBreakdown = { critical: 0, high: 0, medium: 0, low: 0 };
    const statusBreakdown: Record<ComplianceStatus, number> = {
      Completed: 0,
      Upcoming: 0,
      'Due Soon': 0,
      'Renewal Pending': 0,
      Overdue: 0,
    };

    let weightedSum = 0;
    let penaltyDeduction = 0;

    for (const comp of compliances) {
      statusBreakdown[comp.status] = (statusBreakdown[comp.status] || 0) + 1;

      const risk = (comp.penaltyRisk || 'Medium').toLowerCase();
      if (risk === 'critical') penaltyRiskBreakdown.critical++;
      else if (risk === 'high') penaltyRiskBreakdown.high++;
      else if (risk === 'medium') penaltyRiskBreakdown.medium++;
      else penaltyRiskBreakdown.low++;

      switch (comp.status) {
        case 'Completed':
          completedCount++;
          weightedSum += 1.0;
          break;
        case 'Upcoming':
          upcomingCount++;
          weightedSum += 1.0; // Statutorily compliant in advance
          break;
        case 'Due Soon':
          dueSoonCount++;
          weightedSum += 0.7; // Needs prompt action
          break;
        case 'Renewal Pending':
          renewalPendingCount++;
          weightedSum += 0.5; // In active renewal process
          break;
        case 'Overdue':
          overdueCount++;
          weightedSum += 0.0;
          // Apply risk-weighted penalty deductions
          if (comp.penaltyRisk === 'Critical') penaltyDeduction += 5;
          else if (comp.penaltyRisk === 'High') penaltyDeduction += 3;
          else penaltyDeduction += 1;
          break;
      }
    }

    const baseScore = (weightedSum / totalCompliances) * 100;
    const finalScore = Math.max(0, Math.min(100, Math.round(baseScore - penaltyDeduction)));

    let rating: ComplianceScoreResult['rating'];
    let summary: string;

    if (finalScore >= 95 && overdueCount === 0) {
      rating = 'AAA - Exemplary';
      summary = 'Flawless statutory compliance standing with zero overdue filings.';
    } else if (finalScore >= 85) {
      rating = 'AA - Strong';
      summary = 'High statutory compliance level with minimal filing risks.';
    } else if (finalScore >= 70) {
      rating = 'A - Compliant';
      summary = 'Compliant overall with active filings due in upcoming regulatory cycles.';
    } else if (finalScore >= 50) {
      rating = 'B - At Risk';
      summary = 'Statutory filings at risk. Immediate action required on due soon and renewal items.';
    } else {
      rating = 'C - Non-Compliant';
      summary = 'Critical non-compliance detected. Overdue statutory returns may attract penalties or inspection audits.';
    }

    return {
      scorePercentage: finalScore,
      totalCompliances,
      completedCount,
      upcomingCount,
      dueSoonCount,
      renewalPendingCount,
      overdueCount,
      penaltyRiskBreakdown,
      statusBreakdown,
      rating,
      summary,
      computedAt: new Date().toISOString(),
    };
  }

  /**
   * Soft delete compliance record
   */
  async deleteCompliance(id: string, userId?: string): Promise<boolean> {
    const existing = await complianceRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound(`Compliance record not found with ID ${id}`);
    }

    const historyEntry = {
      action: 'COMPLIANCE_DELETED',
      performedBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      previousStatus: existing.status,
      remarks: 'Compliance record archived',
      timestamp: new Date(),
    };

    await complianceRepository.addHistory(id, historyEntry);
    return await complianceRepository.softDelete(id);
  }
}

export const complianceService = new ComplianceService();
export default complianceService;
