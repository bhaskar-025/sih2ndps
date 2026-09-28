import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IApprovalTemplate extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  department: string;
  description: string;
  industryTypes: string[];
  pollutionCategories: string[];
  minInvestment?: number;
  maxInvestment?: number;
  minEmployees?: number;
  maxEmployees?: number;
  requiresBoiler?: boolean;
  requiresWaterAbove?: number;
  requiredDocuments: string[];
  estimatedDays: number;
  inspectionRequired: boolean;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  dependencies: string[];
  status: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ApprovalTemplateSchema = new Schema<IApprovalTemplate>(
  {
    name: {
      type: String,
      required: [true, 'Template name is required'],
      trim: true,
      index: true,
    },
    department: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    industryTypes: {
      type: [String],
      default: [],
      index: true,
    },
    pollutionCategories: {
      type: [String],
      default: [],
    },
    minInvestment: {
      type: Number,
      default: 0,
    },
    maxInvestment: {
      type: Number,
    },
    minEmployees: {
      type: Number,
      default: 0,
    },
    maxEmployees: {
      type: Number,
    },
    requiresBoiler: {
      type: Boolean,
      default: false,
    },
    requiresWaterAbove: {
      type: Number,
      default: 0,
    },
    requiredDocuments: {
      type: [String],
      default: [],
    },
    estimatedDays: {
      type: Number,
      required: true,
      default: 15,
    },
    inspectionRequired: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      default: 'Medium',
    },
    dependencies: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      default: 'Active',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
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

export const ApprovalTemplate: Model<IApprovalTemplate> = mongoose.model<IApprovalTemplate>(
  'ApprovalTemplate',
  ApprovalTemplateSchema
);
export default ApprovalTemplate;
