import mongoose, { Document, Model, Schema } from 'mongoose';

export type ChecklistItemStatus = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Not Applicable';

export interface IInspectionChecklist extends Document {
  _id: mongoose.Types.ObjectId;
  inspectionId: mongoose.Types.ObjectId;
  item: string;
  status: ChecklistItemStatus;
  remarks: string;
  createdAt: Date;
  updatedAt: Date;
}

const InspectionChecklistSchema = new Schema<IInspectionChecklist>(
  {
    inspectionId: {
      type: Schema.Types.ObjectId,
      ref: 'Inspection',
      required: [true, 'Inspection ID reference is required'],
      index: true,
    },
    item: {
      type: String,
      required: [true, 'Checklist item description is required'],
      trim: true,
      maxlength: [500, 'Checklist item description cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['Compliant', 'Non-Compliant', 'Pending', 'Not Applicable'],
      default: 'Pending',
      index: true,
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const InspectionChecklist: Model<IInspectionChecklist> =
  mongoose.model<IInspectionChecklist>('InspectionChecklist', InspectionChecklistSchema);

export default InspectionChecklist;
