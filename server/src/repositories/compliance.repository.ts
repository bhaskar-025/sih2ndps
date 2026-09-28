import mongoose, { FilterQuery } from 'mongoose';
import { Compliance, ICompliance, IComplianceHistory } from '../models/Compliance';

export class ComplianceRepository {
  /**
   * Create a new compliance record
   */
  async create(data: Partial<ICompliance>): Promise<ICompliance> {
    const compliance = new Compliance(data);
    return await compliance.save();
  }

  /**
   * Find compliance by ID (excludes soft-deleted items)
   */
  async findById(id: string): Promise<ICompliance | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await Compliance.findOne({ _id: id, isDeleted: false })
      .populate('projectId', 'projectName companyName district industry location')
      .populate('approvalId', 'approvalName priority department estimatedDays');
  }

  /**
   * Find compliances with pagination and filtering
   */
  async find(
    filter: FilterQuery<ICompliance>,
    options: { skip?: number; limit?: number; sort?: any } = {}
  ): Promise<{ items: ICompliance[]; total: number }> {
    const query = { ...filter, isDeleted: false };
    const total = await Compliance.countDocuments(query);

    let queryExec = Compliance.find(query)
      .populate('projectId', 'projectName companyName district industry location')
      .populate('approvalId', 'approvalName priority department');

    if (options.sort) {
      queryExec = queryExec.sort(options.sort);
    } else {
      queryExec = queryExec.sort({ nextDueDate: 1 });
    }

    if (typeof options.skip === 'number') {
      queryExec = queryExec.skip(options.skip);
    }
    if (typeof options.limit === 'number') {
      queryExec = queryExec.limit(options.limit);
    }

    const items = await queryExec.exec();
    return { items, total };
  }

  /**
   * Find all compliances for a specific project
   */
  async findByProject(
    projectId: string,
    additionalFilter: FilterQuery<ICompliance> = {}
  ): Promise<ICompliance[]> {
    if (!mongoose.Types.ObjectId.isValid(projectId)) return [];
    return await Compliance.find({
      projectId,
      isDeleted: false,
      ...additionalFilter,
    })
      .sort({ nextDueDate: 1 })
      .populate('approvalId', 'approvalName priority department');
  }

  /**
   * Update compliance document by ID
   */
  async update(id: string, updateData: Partial<ICompliance>): Promise<ICompliance | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await Compliance.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('projectId', 'projectName companyName district industry')
      .populate('approvalId', 'approvalName department');
  }

  /**
   * Append an audit history log entry
   */
  async addHistory(id: string, historyEntry: IComplianceHistory): Promise<ICompliance | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await Compliance.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $push: { history: historyEntry } },
      { new: true }
    );
  }

  /**
   * Soft delete compliance
   */
  async softDelete(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    const res = await Compliance.updateOne(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } }
    );
    return res.modifiedCount > 0;
  }

  /**
   * Count compliance documents
   */
  async count(filter: FilterQuery<ICompliance> = {}): Promise<number> {
    return await Compliance.countDocuments({ ...filter, isDeleted: false });
  }

  /**
   * Find compliances due between two dates
   */
  async findDueBetween(
    startDate: Date,
    endDate: Date,
    projectId?: string
  ): Promise<ICompliance[]> {
    const filter: any = {
      isDeleted: false,
      status: { $ne: 'Completed' },
      nextDueDate: { $gte: startDate, $lte: endDate },
    };
    if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
      filter.projectId = projectId;
    }
    return await Compliance.find(filter)
      .sort({ nextDueDate: 1 })
      .populate('projectId', 'projectName companyName district');
  }

  /**
   * Find expired / overdue compliances
   */
  async findExpired(referenceDate: Date, projectId?: string): Promise<ICompliance[]> {
    const filter: any = {
      isDeleted: false,
      status: { $ne: 'Completed' },
      nextDueDate: { $lt: referenceDate },
    };
    if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
      filter.projectId = projectId;
    }
    return await Compliance.find(filter)
      .sort({ nextDueDate: 1 })
      .populate('projectId', 'projectName companyName district');
  }

  /**
   * Aggregation breakdown of compliances by status for a project or statewide
   */
  async aggregateStatusBreakdown(projectId?: string): Promise<Record<string, number>> {
    const match: any = { isDeleted: false };
    if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
      match.projectId = new mongoose.Types.ObjectId(projectId);
    }

    const aggregation = await Compliance.aggregate([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const result: Record<string, number> = {
      Upcoming: 0,
      'Due Soon': 0,
      Overdue: 0,
      Completed: 0,
      'Renewal Pending': 0,
    };

    for (const item of aggregation) {
      if (item._id && result.hasOwnProperty(item._id)) {
        result[item._id] = item.count;
      }
    }

    return result;
  }
}

export const complianceRepository = new ComplianceRepository();
export default complianceRepository;
