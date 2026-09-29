import mongoose, { Document, Model, Schema } from 'mongoose';

export type ApplicationStatus =
  | 'Draft'
  | 'Submitted'
  | 'Under Scrutiny'
  | 'Document Verification'
  | 'Inspection'
  | 'Inspection Scheduled'
  | 'Inspection Completed'
  | 'Committee'
  | 'Approved'
  | 'Rejected'
  | 'Returned'
  | 'Query Raised';

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

export interface IOfficerNote {
  note: string;
  officerName: string;
  officerId?: mongoose.Types.ObjectId;
  createdAt: Date;
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
  internalNotes: IOfficerNote[];
  serviceName?: string;
  escalated?: boolean;
  riskScore?: number;
  certificateNumber?: string;
  certificateIssuedAt?: Date;
  certificateRemarks?: string;
  forwardedFrom?: string;
  forwardedTo?: string;
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
        'Document Verification',
        'Inspection',
        'Inspection Scheduled',
        'Inspection Completed',
        'Committee',
        'Approved',
        'Rejected',
        'Returned',
        'Query Raised',
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
    escalated: {
      type: Boolean,
      default: false,
      index: true,
    },
    riskScore: {
      type: Number,
      default: 15,
      min: 0,
      max: 100,
    },
    certificateNumber: {
      type: String,
      trim: true,
    },
    certificateIssuedAt: {
      type: Date,
    },
    certificateRemarks: {
      type: String,
      trim: true,
    },
    forwardedFrom: {
      type: String,
      trim: true,
    },
    forwardedTo: {
      type: String,
      trim: true,
    },
    internalNotes: [
      {
        note: { type: String, required: true },
        officerName: { type: String, required: true },
        officerId: { type: Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
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
