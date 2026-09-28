import mongoose, { Document, Model, Schema } from 'mongoose';

export type ComplianceStatus =
  | 'Upcoming'
  | 'Due Soon'
  | 'Overdue'
  | 'Completed'
  | 'Renewal Pending';

export type CompliancePriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type PenaltyRisk = 'Low' | 'Medium' | 'High' | 'Critical';
export type ComplianceFrequency =
  | 'Monthly'
  | 'Quarterly'
  | 'Half-Yearly'
  | 'Annual'
  | 'Biennial'
  | 'One-Time';

export interface IComplianceHistory {
  action: string;
  performedBy?: mongoose.Types.ObjectId | { _id?: string; name?: string; email?: string; role?: string };
  previousStatus?: string;
  newStatus?: string;
  remarks?: string;
  timestamp: Date;
}

export interface ICompliance extends Document {
  _id: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  approvalId?: mongoose.Types.ObjectId;
  complianceName: string;
  department: string;
  frequency: ComplianceFrequency;
  lastCompleted?: Date;
  nextDueDate: Date;
  status: ComplianceStatus;
  priority: CompliancePriority;
  documentsRequired: string[];
  renewalRequired: boolean;
  renewalWindowDays: number;
  penaltyRisk: PenaltyRisk;
  remarks?: string;
  history: IComplianceHistory[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ComplianceHistorySchema = new Schema<IComplianceHistory>(
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

const ComplianceSchema = new Schema<ICompliance>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
      index: true,
    },
    approvalId: {
      type: Schema.Types.ObjectId,
      ref: 'ProjectApproval',
      index: true,
    },
    complianceName: {
      type: String,
      required: [true, 'Compliance name is required'],
      trim: true,
      maxlength: [300, 'Compliance name cannot exceed 300 characters'],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      index: true,
    },
    frequency: {
      type: String,
      enum: ['Monthly', 'Quarterly', 'Half-Yearly', 'Annual', 'Biennial', 'One-Time'],
      default: 'Annual',
    },
    lastCompleted: {
      type: Date,
    },
    nextDueDate: {
      type: Date,
      required: [true, 'Next due date is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Due Soon', 'Overdue', 'Completed', 'Renewal Pending'],
      default: 'Upcoming',
      index: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    documentsRequired: {
      type: [String],
      default: [],
    },
    renewalRequired: {
      type: Boolean,
      default: true,
    },
    renewalWindowDays: {
      type: Number,
      default: 30,
      min: [1, 'Renewal window must be at least 1 day'],
      max: [180, 'Renewal window cannot exceed 180 days'],
    },
    penaltyRisk: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
    history: {
      type: [ComplianceHistorySchema],
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
  }
);

// Compound indexes for optimal queries
ComplianceSchema.index({ projectId: 1, status: 1 });
ComplianceSchema.index({ nextDueDate: 1, status: 1 });
ComplianceSchema.index({ department: 1, status: 1 });
ComplianceSchema.index({ renewalRequired: 1, nextDueDate: 1 });

export const Compliance: Model<ICompliance> = mongoose.model<ICompliance>(
  'Compliance',
  ComplianceSchema
);

export default Compliance;
