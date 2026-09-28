import mongoose, { FilterQuery } from 'mongoose';
import { AuditLog, IAuditLog } from '../models/AuditLog';
import { Application, IApplication } from '../models/Application';
import { IAuditLogFilterParams, IAuditLogCreateDTO } from '../types/audit.types';

export class AuditRepository {
  /**
   * Insert a new audit log record
   */
  async createLog(data: IAuditLogCreateDTO): Promise<IAuditLog> {
    const log = new AuditLog({
      user: data.user && mongoose.Types.ObjectId.isValid(String(data.user)) ? data.user : null,
      action: data.action,
      entity: data.entity,
      entityId: String(data.entityId),
      oldValue: data.oldValue ?? null,
      newValue: data.newValue ?? null,
      ipAddress: data.ipAddress || '127.0.0.1',
      metadata: data.metadata || {},
      timestamp: data.timestamp || new Date(),
    });
    return await log.save();
  }

  /**
   * Query audit logs with rich filtering, search, and pagination
   */
  async findAuditLogs(params: IAuditLogFilterParams) {
    const page = Math.max(Number(params.page) || 1, 1);
    const limit = Math.min(Number(params.limit) || 50, 200);
    const skip = (page - 1) * limit;

    const filter: FilterQuery<IAuditLog> = {};

    if (params.entity && params.entity !== 'ALL') {
      filter.entity = new RegExp(`^${params.entity.trim()}$`, 'i');
    }

    if (params.action && params.action !== 'ALL') {
      filter.action = new RegExp(params.action.trim(), 'i');
    }

    const targetUser = params.userId || params.user;
    if (targetUser && targetUser !== 'ALL') {
      if (mongoose.Types.ObjectId.isValid(targetUser.trim())) {
        filter.user = new mongoose.Types.ObjectId(targetUser.trim());
      }
    }

    if (params.entityId && params.entityId.trim()) {
      filter.entityId = params.entityId.trim();
    }

    // Date range filtering
    if (params.startDate || params.endDate) {
      filter.timestamp = {};
      if (params.startDate) {
        filter.timestamp.$gte = new Date(params.startDate);
      }
      if (params.endDate) {
        const end = new Date(params.endDate);
        end.setHours(23, 59, 59, 999);
        filter.timestamp.$lte = end;
      }
    }

    // Search across action, entity, entityId, ipAddress
    if (params.search && params.search.trim()) {
      const searchRegex = new RegExp(params.search.trim(), 'i');
      filter.$or = [
        { action: searchRegex },
        { entity: searchRegex },
        { entityId: searchRegex },
        { ipAddress: searchRegex },
      ];
    }

    // Determine sort
    let sortOption: any = { timestamp: -1 };
    if (params.sort) {
      if (params.sort.startsWith('-')) {
        sortOption = { [params.sort.substring(1)]: -1 };
      } else {
        sortOption = { [params.sort]: 1 };
      }
    }

    const [items, total] = await Promise.all([
      AuditLog.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email role department organization')
        .exec(),
      AuditLog.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Find all audit records associated with a specific entity
   */
  async findLogsByEntity(entity: string, entityId: string): Promise<IAuditLog[]> {
    return await AuditLog.find({
      entity: new RegExp(`^${entity}$`, 'i'),
      entityId: String(entityId),
    })
      .sort({ timestamp: -1 })
      .populate('user', 'name email role department')
      .exec();
  }

  /**
   * Find application by ID or applicationNumber with full populated references
   */
  async findApplicationWithWorkflow(applicationId: string): Promise<IApplication | null> {
    const trimmed = applicationId.trim();

    let query: FilterQuery<IApplication> = {};
    if (mongoose.Types.ObjectId.isValid(trimmed)) {
      query = { _id: trimmed };
    } else {
      query = {
        $or: [
          { applicationNumber: trimmed },
          { applicationNumber: new RegExp(`^${trimmed}$`, 'i') },
        ],
      };
    }

    return await Application.findOne(query)
      .populate('projectId', 'projectName companyName district industry location investment employees')
      .populate('approvalId', 'approvalName department priority estimatedDays')
      .populate('assignedOfficer', 'name email phone department organization')
      .populate('history.performedBy', 'name email role department organization')
      .populate('queries.raisedBy', 'name email role department')
      .populate('queries.respondedBy', 'name email role department')
      .exec();
  }

  /**
   * Get high-level audit statistics (counts by entity, recent activity)
   */
  async getAuditStats() {
    const [totalLogs, entityBreakdown, recentLogs] = await Promise.all([
      AuditLog.countDocuments(),
      AuditLog.aggregate([
        { $group: { _id: '$entity', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      AuditLog.find()
        .sort({ timestamp: -1 })
        .limit(10)
        .populate('user', 'name email role department')
        .exec(),
    ]);

    return {
      totalLogs,
      entityBreakdown,
      recentLogs,
    };
  }
}

export const auditRepository = new AuditRepository();
export default auditRepository;
