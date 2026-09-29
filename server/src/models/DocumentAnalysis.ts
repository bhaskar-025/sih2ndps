import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IDocumentAnalysis extends Document {
  _id: mongoose.Types.ObjectId;
  documentId?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  fileName: string;
  fileUrl?: string;
  mimeType?: string;
  documentType: string;
  expiry: string;
  department: string;
  reusableFor: string[];
  reusableCount: number;
  extractedFields: Record<string, any>;
  confidence: number;
  rawAnalysis?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentAnalysisSchema = new Schema<IDocumentAnalysis>(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: 'Document',
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      index: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileUrl: {
      type: String,
      trim: true,
      default: '',
    },
    mimeType: {
      type: String,
      trim: true,
      default: 'application/octet-stream',
    },
    documentType: {
      type: String,
      required: true,
      index: true,
    },
    expiry: {
      type: String,
      default: 'Perpetual / No Expiry',
    },
    department: {
      type: String,
      default: 'Government of Maharashtra / Statutory Authority',
    },
    reusableFor: {
      type: [String],
      default: [],
    },
    reusableCount: {
      type: Number,
      default: 0,
    },
    extractedFields: {
      type: Schema.Types.Mixed,
      default: {},
    },
    confidence: {
      type: Number,
      default: 98,
      min: 0,
      max: 100,
    },
    rawAnalysis: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    collection: 'document_analyses',
  }
);

DocumentAnalysisSchema.index({ projectId: 1, documentType: 1 });

export const DocumentAnalysis: Model<IDocumentAnalysis> =
  mongoose.models.DocumentAnalysis ||
  mongoose.model<IDocumentAnalysis>('DocumentAnalysis', DocumentAnalysisSchema);

export default DocumentAnalysis;
