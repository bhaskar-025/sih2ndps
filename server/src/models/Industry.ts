import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IIndustry extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  code: string;
  sector: string;
  pollutionCategory: 'Red' | 'Orange' | 'Green' | 'White';
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  manufacturingProcesses: string[];
  typicalWaterRequirement: number; // KLD
  typicalPowerRequirement: number; // KW
  mandatoryApprovals: string[];
  commonDocuments: string[];
  applicableSchemes: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const IndustrySchema = new Schema<IIndustry>(
  {
    name: {
      type: String,
      required: [true, 'Industry name is required'],
      unique: true,
      trim: true,
      index: true,
    },
    code: {
      type: String,
      required: [true, 'Industry code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    sector: {
      type: String,
      required: [true, 'Sector classification is required'],
      trim: true,
      index: true,
    },
    pollutionCategory: {
      type: String,
      enum: ['Red', 'Orange', 'Green', 'White'],
      default: 'Orange',
    },
    riskLevel: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      default: 'Medium',
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    manufacturingProcesses: {
      type: [String],
      default: [],
    },
    typicalWaterRequirement: {
      type: Number,
      default: 10,
    },
    typicalPowerRequirement: {
      type: Number,
      default: 100,
    },
    mandatoryApprovals: {
      type: [String],
      default: [],
    },
    commonDocuments: {
      type: [String],
      default: [],
    },
    applicableSchemes: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'industries',
  }
);

IndustrySchema.index({ name: 'text', description: 'text', sector: 'text' });

export const Industry: Model<IIndustry> =
  mongoose.models.Industry || mongoose.model<IIndustry>('Industry', IndustrySchema);

export default Industry;
