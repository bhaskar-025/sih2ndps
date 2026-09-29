import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IRoadmapApproval {
  department: string;
  approval: string;
  reason: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  estimatedDays: number;
}

export interface IRoadmapDocument {
  name: string;
  usedFor: string[];
}

export interface IRoadmapInspection {
  department: string;
  stage: string;
  reason: string;
}

export interface IRoadmapScheme {
  name: string;
  benefit: string;
  eligibility: string;
}

export interface IRoadmapTimelineItem {
  stage: string;
  approvals: string[];
  estimatedDays: number;
  canRunParallel?: boolean;
}

export interface IParallelWorkflow {
  stage: string;
  approvals: string[];
  canRunParallel: boolean;
}

export interface IRoadmap extends Document {
  _id: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  approvals: IRoadmapApproval[];
  documents: IRoadmapDocument[];
  timeline: IRoadmapTimelineItem[];
  inspectionPlan: IRoadmapInspection[];
  schemes: IRoadmapScheme[];
  complianceScore: number;
  summary: string;
  totalApprovals: number;
  totalDepartments: number;
  estimatedTimeline: number;
  requiredDocuments: string[];
  parallelWorkflows: IParallelWorkflow[];
  readinessScore: number;
  generatedBy: string;
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RoadmapSchema = new Schema<IRoadmap>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID reference is required'],
      unique: true,
      index: true,
    },
    approvals: [
      {
        department: { type: String, required: true },
        approval: { type: String, required: true },
        reason: { type: String, default: '' },
        priority: {
          type: String,
          enum: ['Critical', 'High', 'Medium', 'Low'],
          default: 'Medium',
        },
        estimatedDays: { type: Number, default: 15 },
      },
    ],
    documents: [
      {
        name: { type: String, required: true },
        usedFor: { type: [String], default: [] },
      },
    ],
    timeline: [
      {
        stage: { type: String, required: true },
        approvals: { type: [String], default: [] },
        estimatedDays: { type: Number, default: 15 },
        canRunParallel: { type: Boolean, default: true },
      },
    ],
    inspectionPlan: [
      {
        department: { type: String, required: true },
        stage: { type: String, required: true },
        reason: { type: String, default: '' },
      },
    ],
    schemes: [
      {
        name: { type: String, required: true },
        benefit: { type: String, default: '' },
        eligibility: { type: String, default: '' },
      },
    ],
    complianceScore: {
      type: Number,
      default: 85,
    },
    summary: {
      type: String,
      default: '',
    },
    totalApprovals: {
      type: Number,
      default: 0,
    },
    totalDepartments: {
      type: Number,
      default: 0,
    },
    estimatedTimeline: {
      type: Number,
      default: 30,
    },
    requiredDocuments: {
      type: [String],
      default: [],
    },
    parallelWorkflows: [
      {
        stage: { type: String, required: true },
        approvals: { type: [String], default: [] },
        canRunParallel: { type: Boolean, default: true },
      },
    ],
    readinessScore: {
      type: Number,
      default: 85,
    },
    generatedBy: {
      type: String,
      default: 'Gemini-2.5-Flash',
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'roadmaps',
  }
);

export const Roadmap: Model<IRoadmap> =
  mongoose.models.Roadmap || mongoose.model<IRoadmap>('Roadmap', RoadmapSchema);

export default Roadmap;
