import mongoose, { Document, Model, Schema } from 'mongoose';

export type ComplianceRiskLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export interface IComplianceScore extends Document {
  _id: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  score: number; // 0 to 100
  risk: ComplianceRiskLevel;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  missingApprovals: string[];
  missingDocuments: string[];
  inspectionReadiness: string;
  expectedApprovalTime: string;
  explanation: string;
  calculatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ComplianceScoreSchema = new Schema<IComplianceScore>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
      index: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 80,
    },
    risk: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      default: 'Medium',
      index: true,
    },
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    recommendations: {
      type: [String],
      default: [],
    },
    missingApprovals: {
      type: [String],
      default: [],
    },
    missingDocuments: {
      type: [String],
      default: [],
    },
    inspectionReadiness: {
      type: String,
      default: 'Inspection readiness assessment pending',
    },
    expectedApprovalTime: {
      type: String,
      default: '30-45 working days',
    },
    explanation: {
      type: String,
      default: '',
    },
    calculatedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'compliance_scores',
  }
);

ComplianceScoreSchema.index({ projectId: 1, calculatedAt: -1 });

export const ComplianceScore: Model<IComplianceScore> =
  mongoose.models.ComplianceScore ||
  mongoose.model<IComplianceScore>('ComplianceScore', ComplianceScoreSchema);

export default ComplianceScore;
