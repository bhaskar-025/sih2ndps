import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IApprovalGuide extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  department: string;
  industryTypes: string[];
  description: string;
  requiredDocuments: string[];
  eligibilityCriteria: string[];
  estimatedTimeline: string;
  inspectionRequired: boolean;
  dependencies: string[];
  renewalRequired: boolean;
  renewalFrequency: string;
  faqIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ApprovalGuideSchema = new Schema<IApprovalGuide>(
  {
    title: {
      type: String,
      required: [true, 'Approval guide title is required'],
      trim: true,
      index: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      index: true,
    },
    industryTypes: {
      type: [String],
      required: [true, 'At least one industry type is required'],
      default: ['ALL'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    requiredDocuments: {
      type: [String],
      default: [],
    },
    eligibilityCriteria: {
      type: [String],
      default: [],
    },
    estimatedTimeline: {
      type: String,
      default: '15-30 working days',
      trim: true,
    },
    inspectionRequired: {
      type: Boolean,
      default: false,
      index: true,
    },
    dependencies: {
      type: [String],
      default: [],
    },
    renewalRequired: {
      type: Boolean,
      default: false,
      index: true,
    },
    renewalFrequency: {
      type: String,
      default: 'Not Required',
      trim: true,
    },
    faqIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'FAQ',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Text index for fast multi-field keyword search
ApprovalGuideSchema.index({
  title: 'text',
  description: 'text',
  department: 'text',
  industryTypes: 'text',
  requiredDocuments: 'text',
});

// Compound indices for filtered discovery
ApprovalGuideSchema.index({ department: 1, industryTypes: 1 });
ApprovalGuideSchema.index({ inspectionRequired: 1, renewalRequired: 1 });

export const ApprovalGuide: Model<IApprovalGuide> = mongoose.model<IApprovalGuide>(
  'ApprovalGuide',
  ApprovalGuideSchema
);
export default ApprovalGuide;
