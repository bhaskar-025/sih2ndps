import mongoose, { Document, Model, Schema } from 'mongoose';

export type ApplicationStatus =
  | 'Draft'
  | 'Submitted'
  | 'Under Scrutiny'
  | 'Query Raised'
  | 'Inspection Scheduled'
  | 'Inspection Completed'
  | 'Approved'
  | 'Rejected';

export type ApplicationPriority = 'Normal' | 'High' | 'Urgent' | 'Critical';

export interface IApplicationQuery {
  _id: mongoose.Types.ObjectId;
  queryText: string;
  raisedBy?: mongoose.Types.ObjectId;
  raisedAt: Date;
  status: 'Open' | 'Resolved';
  response?: string;
  respondedBy?: mongoose.Types.ObjectId;
  respondedAt?: Date;
}

export interface IApplicationHistory {
  action: string;
  performedBy?: mongoose.Types.ObjectId;
  fromStatus?: string;
  toStatus?: string;
  fromStage?: string;
  toStage?: string;
  remarks?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface IApplication extends Document {
  _id: mongoose.Types.ObjectId;
  applicationNumber: string;
  projectId: mongoose.Types.ObjectId;
  approvalId?: mongoose.Types.ObjectId;
  department: string;
  assignedOfficer?: mongoose.Types.ObjectId;
  status: ApplicationStatus;
  currentStage: string;
  priority: ApplicationPriority;
  slaDays: number;
  submittedAt: Date;
  lastUpdated: Date;
  inspectionDate?: Date;
  remarks?: string;
  queries: IApplicationQuery[];
  history: IApplicationHistory[];
  serviceName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    applicationNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () =>
        `APP-MH-${Date.now().toString(36).toUpperCase()}-${Math.floor(
          100 + Math.random() * 900
        )}`,
    },
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
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      index: true,
    },
    assignedOfficer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    status: {
      type: String,
      enum: [
        'Draft',
        'Submitted',
        'Under Scrutiny',
        'Query Raised',
        'Inspection Scheduled',
        'Inspection Completed',
        'Approved',
        'Rejected',
      ],
      default: 'Submitted',
      index: true,
    },
    currentStage: {
      type: String,
      default: 'Document Scrutiny',
      trim: true,
    },
    priority: {
      type: String,
      enum: ['Normal', 'High', 'Urgent', 'Critical'],
      default: 'Normal',
      index: true,
    },
    slaDays: {
      type: Number,
      required: true,
      default: 30,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    inspectionDate: {
      type: Date,
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
    serviceName: {
      type: String,
      trim: true,
      default: 'Statutory Clearance NOC',
    },
    queries: [
      {
        queryText: { type: String, required: true },
        raisedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        raisedAt: { type: Date, default: Date.now },
        status: { type: String, enum: ['Open', 'Resolved'], default: 'Open' },
        response: { type: String },
        respondedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        respondedAt: { type: Date },
      },
    ],
    history: [
      {
        action: { type: String, required: true },
        performedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        fromStatus: { type: String },
        toStatus: { type: String },
        fromStage: { type: String },
        toStage: { type: String },
        remarks: { type: String },
        metadata: { type: Schema.Types.Mixed, default: {} },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

ApplicationSchema.index({ department: 1, status: 1 });
ApplicationSchema.index({ projectId: 1, department: 1 });

export const Application: Model<IApplication> =
  mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);

export default Application;
