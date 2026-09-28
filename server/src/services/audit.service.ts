import { auditRepository, AuditRepository } from '../repositories/audit.repository';
import {
  IAuditLogFilterParams,
  IAuditLogCreateDTO,
  IWorkflowHistoryResponse,
  IWorkflowTransitionItem,
} from '../types/audit.types';
import { ApiError } from '../utils/apiError';
import { Logger } from '../utils/logger';

export class AuditService {
  private repository: AuditRepository;

  constructor(repository: AuditRepository = auditRepository) {
    this.repository = repository;
  }

  /**
   * Safe asynchronous audit logger to record actions across all modules
   */
  async logAction(data: IAuditLogCreateDTO): Promise<void> {
    try {
      await this.repository.createLog(data);
    } catch (err: any) {
      Logger.error(`Failed to record audit log: ${err.message}`, { action: data.action });
    }
  }

  /**
   * Fetch filtered and paginated audit logs
   */
  async getAuditLogs(params: IAuditLogFilterParams) {
    return await this.repository.findAuditLogs(params);
  }

  /**
   * Fetch complete workflow history and state transitions for an application
   */
  async getApplicationWorkflow(applicationId: string): Promise<IWorkflowHistoryResponse> {
    const application = await this.repository.findApplicationWithWorkflow(applicationId);
    if (!application) {
      throw ApiError.notFound(`Application not found for identifier: "${applicationId}"`);
    }

    // Retrieve associated audit logs for this application
    const [auditById, auditByNumber] = await Promise.all([
      this.repository.findLogsByEntity('Application', application._id.toString()),
      this.repository.findLogsByEntity('Application', application.applicationNumber),
    ]);

    // Deduplicate audit logs
    const auditMap = new Map();
    [...auditById, ...auditByNumber].forEach((item) => {
      auditMap.set(item._id.toString(), item);
    });
    const auditTrail = Array.from(auditMap.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Compute SLA metrics
    const submittedTime = new Date(application.submittedAt || application.createdAt).getTime();
    const nowTime = Date.now();
    const elapsedDays = Math.max(0, Math.floor((nowTime - submittedTime) / (1000 * 60 * 60 * 24)));
    const slaDays = application.slaDays || 30;
    const remainingDays = slaDays - elapsedDays;
    const isBreached = remainingDays < 0;

    let urgencyLevel: 'Normal' | 'Approaching Deadline' | 'Overdue' = 'Normal';
    if (isBreached) {
      urgencyLevel = 'Overdue';
    } else if (remainingDays <= 5) {
      urgencyLevel = 'Approaching Deadline';
    }

    // Process and sort state transitions chronologically
    const rawHistory = application.history || [];
    const sortedHistory = [...rawHistory].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Format transitions with duration calculation between consecutive steps
    const stateTransitions: IWorkflowTransitionItem[] = sortedHistory.map((item, index) => {
      let durationFormatted = 'Initial Step';

      if (index > 0) {
        const prevTimestamp = new Date(sortedHistory[index - 1].timestamp).getTime();
        const currTimestamp = new Date(item.timestamp).getTime();
        const diffHours = Math.max(0, Math.round((currTimestamp - prevTimestamp) / (1000 * 60 * 60)));

        if (diffHours < 24) {
          durationFormatted = `${diffHours} hour${diffHours === 1 ? '' : 's'}`;
        } else {
          const days = Math.floor(diffHours / 24);
          const hours = diffHours % 24;
          durationFormatted = `${days} day${days === 1 ? '' : 's'}${hours > 0 ? ` ${hours}h` : ''}`;
        }
      }

      const performer: any = item.performedBy;

      return {
        action: item.action,
        fromStatus: item.fromStatus || 'Initial',
        toStatus: item.toStatus || application.status,
        fromStage: item.fromStage || '',
        toStage: item.toStage || application.currentStage,
        remarks: item.remarks || '',
        metadata: item.metadata || {},
        timestamp: item.timestamp,
        durationInPreviousStageFormatted: durationFormatted,
        performedBy: performer
          ? {
              _id: performer._id ? performer._id.toString() : String(performer),
              name: performer.name || 'System / Officer',
              email: performer.email || '',
              role: performer.role || 'Officer',
              department: performer.department || application.department,
            }
          : null,
      };
    });

    return {
      application: {
        _id: application._id.toString(),
        applicationNumber: application.applicationNumber,
        project: application.projectId,
        department: application.department,
        assignedOfficer: application.assignedOfficer,
        status: application.status,
        currentStage: application.currentStage,
        priority: application.priority,
        slaDays: application.slaDays,
        submittedAt: application.submittedAt,
        lastUpdated: application.lastUpdated,
        inspectionDate: application.inspectionDate,
        remarks: application.remarks,
      },
      slaAnalytics: {
        slaDays,
        elapsedDays,
        remainingDays,
        isBreached,
        urgencyLevel,
      },
      totalTransitions: stateTransitions.length,
      stateTransitions,
      auditTrail,
      queries: application.queries || [],
    };
  }

  /**
   * Get audit overview statistics
   */
  async getAuditStats() {
    return await this.repository.getAuditStats();
  }
}

export const auditService = new AuditService();
export default auditService;
