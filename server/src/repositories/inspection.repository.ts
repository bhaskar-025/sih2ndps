import mongoose, { FilterQuery } from 'mongoose';
import { Inspection, IInspection, IInspectionHistory } from '../models/Inspection';
import { InspectionChecklist, IInspectionChecklist } from '../models/InspectionChecklist';

export class InspectionRepository {
  /**
   * Create new inspection record
   */
  async create(data: Partial<IInspection>): Promise<IInspection> {
    const inspection = new Inspection(data);
    return await inspection.save();
  }

  /**
   * Find inspection by ID with populated references
   */
  async findById(id: string): Promise<IInspection | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await Inspection.findOne({ _id: id, isDeleted: false })
      .populate('project', 'projectName companyName district industry location')
      .populate('application', 'applicationNumber department currentStage status priority slaDays')
      .populate('assignedInspector', 'name email phone department organization')
      .populate('history.performedBy', 'name email role');
  }

  /**
   * Find inspections with filtering, pagination, and sorting
   */
  async find(
    filter: FilterQuery<IInspection>,
    options: { skip?: number; limit?: number; sort?: any } = {}
  ): Promise<{ items: IInspection[]; total: number }> {
    const query = { ...filter, isDeleted: false };
    const total = await Inspection.countDocuments(query);

    let queryExec = Inspection.find(query)
      .populate('project', 'projectName companyName district industry')
      .populate('application', 'applicationNumber department status priority')
      .populate('assignedInspector', 'name email phone department');

    if (options.sort) {
      queryExec = queryExec.sort(options.sort);
    } else {
      queryExec = queryExec.sort({ inspectionDate: -1 });
    }

    if (typeof options.skip === 'number') queryExec = queryExec.skip(options.skip);
    if (typeof options.limit === 'number') queryExec = queryExec.limit(options.limit);

    const items = await queryExec.exec();
    return { items, total };
  }

  /**
   * Update inspection by ID
   */
  async update(id: string, updateData: Partial<IInspection>): Promise<IInspection | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await Inspection.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('project', 'projectName companyName district industry')
      .populate('application', 'applicationNumber department status')
      .populate('assignedInspector', 'name email phone department');
  }

  /**
   * Append audit log entry to inspection history
   */
  async addHistory(id: string, historyEntry: IInspectionHistory): Promise<IInspection | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await Inspection.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $push: { history: historyEntry } },
      { new: true }
    );
  }

  /**
   * Soft delete inspection
   */
  async softDelete(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    const res = await Inspection.updateOne(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } }
    );
    return res.modifiedCount > 0;
  }

  /**
   * Count inspections matching filter
   */
  async count(filter: FilterQuery<IInspection> = {}): Promise<number> {
    return await Inspection.countDocuments({ ...filter, isDeleted: false });
  }

  /**
   * Create checklist items for an inspection
   */
  async createChecklistItems(
    inspectionId: mongoose.Types.ObjectId,
    items: { item: string; status?: any; remarks?: string }[]
  ): Promise<IInspectionChecklist[]> {
    if (!items || items.length === 0) return [];

    const documents = items.map((i) => ({
      inspectionId,
      item: i.item,
      status: i.status || 'Pending',
      remarks: i.remarks || '',
    }));

    return await InspectionChecklist.insertMany(documents);
  }

  /**
   * Get all checklist items for an inspection
   */
  async getChecklist(inspectionId: string): Promise<IInspectionChecklist[]> {
    if (!mongoose.Types.ObjectId.isValid(inspectionId)) return [];
    return await InspectionChecklist.find({ inspectionId }).sort({ createdAt: 1 });
  }

  /**
   * Update or sync checklist items
   */
  async updateChecklistItem(
    itemId: string,
    data: Partial<IInspectionChecklist>
  ): Promise<IInspectionChecklist | null> {
    if (!mongoose.Types.ObjectId.isValid(itemId)) return null;
    return await InspectionChecklist.findByIdAndUpdate(itemId, { $set: data }, { new: true });
  }

  /**
   * Delete checklist items by inspection ID
   */
  async deleteChecklistByInspection(inspectionId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(inspectionId)) return;
    await InspectionChecklist.deleteMany({ inspectionId });
  }
}

export const inspectionRepository = new InspectionRepository();
export default inspectionRepository;
