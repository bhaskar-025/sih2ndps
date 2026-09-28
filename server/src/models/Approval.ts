import mongoose, { Document, Model, Schema } from 'mongoose';

export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected' | 'Revoked';

export interface IApproval extends Document {
  _id: mongoose.Types.ObjectId;
  applicationId: mongoose.Types.ObjectId;
  departmentId: mongoose.Types.ObjectId;
  officerId: mongoose.Types.ObjectId;
  status: ApprovalStatus;
  approvedAt?: Date;
  validityPeriodMonths: number;
  licenseCertificateNumber?: string;
  digitalSignatureHash?: string;
  conditions: string[];
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ApprovalSchema = new Schema<IApproval>(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
      required: [true, 'Application reference is required'],
      index: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department reference is required'],
      index: true,
    },
    officerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reviewing Officer reference is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Revoked'],
      default: 'Pending',
      index: true,
    },
    approvedAt: {
      type: Date,
    },
    validityPeriodMonths: {
      type: Number,
      default: 36,
      min: 1,
    },
    licenseCertificateNumber: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
    },
    digitalSignatureHash: {
      type: String,
      trim: true,
    },
    conditions: {
      type: [String],
      default: [],
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Approval: Model<IApproval> = mongoose.model<IApproval>('Approval', ApprovalSchema);
