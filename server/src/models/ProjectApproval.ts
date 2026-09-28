import mongoose, { Document, Model, Schema } from 'mongoose';

export type ProjectApprovalStatus =
  | 'Recommended'
  | 'Pending'
  | 'Documents Missing'
  | 'Ready to Apply'
  | 'Applied'
  | 'Under Review'
  | 'Inspection Pending'
  | 'Approved'
  | 'Rejected';

export type ApprovalPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export interface IProjectApproval extends Document {
  _id: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  approvalTemplateId?: mongoose.Types.ObjectId;
  approvalName: string;
  department: string;
  status: ProjectApprovalStatus;
  priority: ApprovalPriority;
  reason: string;
  estimatedDays: number;
  inspectionRequired: boolean;
  dependencies: string[];
  requiredDocuments: string[];
  generatedBy: 'RuleEngine' | 'Officer' | 'AI';
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectApprovalSchema = new Schema<IProjectApproval>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
      index: true,
    },
    approvalTemplateId: {
      type: Schema.Types.ObjectId,
      ref: 'ApprovalTemplate',
    },
    approvalName: {
      type: String,
      required: [true, 'Approval name is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: [
          'Recommended',
          'Pending',
          'Documents Missing',
          'Ready to Apply',
          'Applied',
          'Under Review',
          'Inspection Pending',
          'Approved',
          'Rejected',
        ],
        message: '{VALUE} is not a valid approval status',
      },
      default: 'Recommended',
      index: true,
    },
    priority: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      default: 'Medium',
    },
    reason: {
      type: String,
      required: true,
      trim: true,
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
    dependencies: {
      type: [String],
      default: [],
    },
    requiredDocuments: {
      type: [String],
      default: [],
    },
    generatedBy: {
      type: String,
      enum: ['RuleEngine', 'Officer', 'AI'],
      default: 'RuleEngine',
    },
    generatedAt: {
      type: Date,
      default: Date.now,
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

ProjectApprovalSchema.index({ projectId: 1, approvalName: 1 });

export const ProjectApproval: Model<IProjectApproval> = mongoose.model<IProjectApproval>(
  'ProjectApproval',
  ProjectApprovalSchema
);
export default ProjectApproval;
