import mongoose, { Document, Model, Schema } from 'mongoose';

export type CompliancePeriodicity = 'One_Time' | 'Monthly' | 'Quarterly' | 'Annual';
export type ComplianceStatus = 'Pending' | 'Submitted' | 'Compliant' | 'Overdue';
export type PenaltyRisk = 'Low' | 'Medium' | 'High' | 'Critical';

export interface IComplianceTask extends Document {
  _id: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  departmentId: mongoose.Types.ObjectId;
  taskName: string;
  description?: string;
  periodicity: CompliancePeriodicity;
  dueDate: Date;
  status: ComplianceStatus;
  penaltyRisk: PenaltyRisk;
  mandatoryDocuments: string[];
  submittedDocumentRef?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ComplianceTaskSchema = new Schema<IComplianceTask>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
      index: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department reference is required'],
      index: true,
    },
    taskName: {
      type: String,
      required: [true, 'Task name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    periodicity: {
      type: String,
      enum: ['One_Time', 'Monthly', 'Quarterly', 'Annual'],
      default: 'Annual',
    },
    dueDate: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Submitted', 'Compliant', 'Overdue'],
      default: 'Pending',
      index: true,
    },
    penaltyRisk: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    mandatoryDocuments: {
      type: [String],
      default: [],
    },
    submittedDocumentRef: {
      type: Schema.Types.ObjectId,
      ref: 'Document',
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const ComplianceTask: Model<IComplianceTask> = mongoose.model<IComplianceTask>(
  'ComplianceTask',
  ComplianceTaskSchema
);
