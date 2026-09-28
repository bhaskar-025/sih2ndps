import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IScheme extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  code: string;
  departmentId: mongoose.Types.ObjectId;
  description: string;
  eligibilityCriteria: string[];
  financialIncentiveSummary: string;
  maxSubsidyAmount?: number;
  active: boolean;
  applicationDeadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SchemeSchema = new Schema<IScheme>(
  {
    name: {
      type: String,
      required: [true, 'Scheme name is required'],
      trim: true,
      unique: true,
    },
    code: {
      type: String,
      required: [true, 'Scheme code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department reference is required'],
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    eligibilityCriteria: {
      type: [String],
      default: [],
    },
    financialIncentiveSummary: {
      type: String,
      required: true,
    },
    maxSubsidyAmount: {
      type: Number,
      min: 0,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    applicationDeadline: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Scheme: Model<IScheme> = mongoose.model<IScheme>('Scheme', SchemeSchema);
