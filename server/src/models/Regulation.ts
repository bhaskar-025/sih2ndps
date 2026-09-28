import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IRegulation extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  actName: string;
  ruleNumber: string;
  summary: string;
  applicableIndustries: string[];
  department: string;
  effectiveDate: Date;
  referenceUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const RegulationSchema = new Schema<IRegulation>(
  {
    title: {
      type: String,
      required: [true, 'Regulation title is required'],
      trim: true,
      index: true,
    },
    actName: {
      type: String,
      required: [true, 'Act name is required'],
      trim: true,
    },
    ruleNumber: {
      type: String,
      default: '',
      trim: true,
    },
    summary: {
      type: String,
      required: [true, 'Summary is required'],
      trim: true,
    },
    applicableIndustries: {
      type: [String],
      default: ['ALL'],
      index: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      index: true,
    },
    effectiveDate: {
      type: Date,
      default: Date.now,
    },
    referenceUrl: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Full text indexing for searching statutory acts and rules
RegulationSchema.index({
  title: 'text',
  actName: 'text',
  ruleNumber: 'text',
  summary: 'text',
  department: 'text',
  applicableIndustries: 'text',
});

// Filtering indices
RegulationSchema.index({ department: 1, applicableIndustries: 1 });
RegulationSchema.index({ actName: 1 });

export const Regulation: Model<IRegulation> = mongoose.model<IRegulation>(
  'Regulation',
  RegulationSchema
);
export default Regulation;
