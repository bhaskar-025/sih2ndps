import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IDocumentMaster extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  category: string;
  issuingAuthority: string;
  description: string;
  applicableIndustries: string[];
  usedFor: string[]; // List of approvals this document is typically required for
  isMandatory: boolean;
  sampleTemplateUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentMasterSchema = new Schema<IDocumentMaster>(
  {
    name: {
      type: String,
      required: [true, 'Document name is required'],
      trim: true,
      unique: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Land & Siting', 'Environmental', 'Safety & Factory', 'Utility & Infrastructure', 'Operational & Industry Specific', 'Financial & Identity'],
      default: 'Land & Siting',
    },
    issuingAuthority: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    applicableIndustries: {
      type: [String],
      default: ['ALL'],
    },
    usedFor: {
      type: [String],
      default: [],
    },
    isMandatory: {
      type: Boolean,
      default: true,
    },
    sampleTemplateUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    collection: 'document_masters',
  }
);

DocumentMasterSchema.index({ name: 'text', description: 'text', category: 'text' });

export const DocumentMaster: Model<IDocumentMaster> =
  mongoose.models.DocumentMaster ||
  mongoose.model<IDocumentMaster>('DocumentMaster', DocumentMasterSchema);

export default DocumentMaster;
