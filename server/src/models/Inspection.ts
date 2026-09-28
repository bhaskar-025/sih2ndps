import mongoose, { Document, Model, Schema } from 'mongoose';

export type InspectionStatus = 'Scheduled' | 'Rescheduled' | 'Completed' | 'Cancelled';

export interface IInspectionHistory {
  action: string;
  performedBy?: mongoose.Types.ObjectId | { _id?: string; name?: string; email?: string; role?: string };
  previousStatus?: string;
  newStatus?: string;
  remarks?: string;
  timestamp: Date;
}

export interface IInspection extends Document {
  _id: mongoose.Types.ObjectId;
  project: mongoose.Types.ObjectId;
  application?: mongoose.Types.ObjectId;
  department: string;
  assignedInspector: mongoose.Types.ObjectId;
  inspectionDate: Date;
  inspectionTime: string;
  inspectionType: string;
  status: InspectionStatus;
  remarks: string;
  findings: string;
  documentsVerified: string[];
  photos: string[];
  location: string;
  history: IInspectionHistory[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Legacy field getters for backwards compatibility
  applicationId?: mongoose.Types.ObjectId;
  assignedOfficerId?: mongoose.Types.ObjectId;
  scheduledDate?: Date;
}

const InspectionHistorySchema = new Schema<IInspectionHistory>(
  {
    action: {
      type: String,
      required: true,
      trim: true,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    previousStatus: {
      type: String,
      trim: true,
    },
    newStatus: {
      type: String,
      trim: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const InspectionSchema = new Schema<IInspection>(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
      index: true,
    },
    application: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
      index: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      index: true,
    },
    assignedInspector: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigned inspector reference is required'],
      index: true,
    },
    inspectionDate: {
      type: Date,
      required: [true, 'Inspection date is required'],
      index: true,
    },
    inspectionTime: {
      type: String,
      trim: true,
      default: '10:00 AM',
    },
    inspectionType: {
      type: String,
      trim: true,
      default: 'Joint Site Visit',
      index: true,
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Rescheduled', 'Completed', 'Cancelled'],
      default: 'Scheduled',
      index: true,
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
    findings: {
      type: String,
      trim: true,
      default: '',
    },
    documentsVerified: {
      type: [String],
      default: [],
    },
    photos: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    history: {
      type: [InspectionHistorySchema],
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Backward-compatible virtual getters/setters
InspectionSchema.virtual('applicationId').get(function () {
  return this.application;
});
InspectionSchema.virtual('assignedOfficerId').get(function () {
  return this.assignedInspector;
});
InspectionSchema.virtual('scheduledDate').get(function () {
  return this.inspectionDate;
});

// Virtual populate for checklist items
InspectionSchema.virtual('checklist', {
  ref: 'InspectionChecklist',
  localField: '_id',
  foreignField: 'inspectionId',
});

// Compound indexes
InspectionSchema.index({ project: 1, status: 1 });
InspectionSchema.index({ assignedInspector: 1, inspectionDate: 1 });
InspectionSchema.index({ department: 1, inspectionDate: 1 });

export const Inspection: Model<IInspection> = mongoose.model<IInspection>('Inspection', InspectionSchema);
export default Inspection;
