import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IStatutoryApproval extends Document {
  _id: mongoose.Types.ObjectId;
  approvalName: string;
  department: string;
  industry: string[]; // Industry reference / applicable industries
  conditions: string[]; // Specific conditions under which this applies
  requiredDocuments: string[]; // Required statutory documents
  timeline: number; // Timeline in estimated days
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  stage: 'Pre-Construction' | 'Construction' | 'Operational' | 'Post-Commissioning';
  inspectionRequired: boolean;
  issuingAuthority?: string;
  validityYears?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StatutoryApprovalSchema = new Schema<IStatutoryApproval>(
  {
    approvalName: {
      type: String,
      required: [true, 'Approval name is required'],
      trim: true,
      index: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      index: true,
    },
    industry: {
      type: [String],
      required: true,
      default: ['ALL'],
      index: true,
    },
    conditions: {
      type: [String],
      default: [],
    },
    requiredDocuments: {
      type: [String],
      default: [],
    },
    timeline: {
      type: Number,
      required: true,
      default: 15,
      min: 1,
    },
    riskLevel: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      default: 'Medium',
      index: true,
    },
    priority: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      default: 'Medium',
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    stage: {
      type: String,
      enum: ['Pre-Construction', 'Construction', 'Operational', 'Post-Commissioning'],
      default: 'Pre-Construction',
    },
    inspectionRequired: {
      type: Boolean,
      default: false,
    },
    issuingAuthority: {
      type: String,
      trim: true,
    },
    validityYears: {
      type: Number,
      default: 5,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'approvals',
  }
);

StatutoryApprovalSchema.index({
  approvalName: 'text',
  description: 'text',
  department: 'text',
});

export const StatutoryApproval: Model<IStatutoryApproval> =
  mongoose.models.StatutoryApproval ||
  mongoose.model<IStatutoryApproval>('StatutoryApproval', StatutoryApprovalSchema);

export default StatutoryApproval;
