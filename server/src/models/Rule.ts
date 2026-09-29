import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IRule extends Document {
  _id: mongoose.Types.ObjectId;
  ruleCode: string;
  title: string;
  category: string;
  applicableIndustries: string[];
  condition: string;
  department: string;
  mandate: string;
  requiredApprovals: string[];
  requiredDocuments: string[];
  severity: 'Mandatory' | 'Conditional' | 'Advisory';
  legalActReference?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RuleSchema = new Schema<IRule>(
  {
    ruleCode: {
      type: String,
      required: [true, 'Rule code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Rule title is required'],
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    applicableIndustries: {
      type: [String],
      default: ['ALL'],
      index: true,
    },
    condition: {
      type: String,
      required: [true, 'Condition is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      index: true,
    },
    mandate: {
      type: String,
      required: [true, 'Statutory mandate description is required'],
      trim: true,
    },
    requiredApprovals: {
      type: [String],
      default: [],
    },
    requiredDocuments: {
      type: [String],
      default: [],
    },
    severity: {
      type: String,
      enum: ['Mandatory', 'Conditional', 'Advisory'],
      default: 'Mandatory',
    },
    legalActReference: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'rules',
  }
);

RuleSchema.index({
  title: 'text',
  mandate: 'text',
  category: 'text',
  condition: 'text',
});

export const Rule: Model<IRule> =
  mongoose.models.Rule || mongoose.model<IRule>('Rule', RuleSchema);

export default Rule;
