import mongoose, { Document as MongooseDocument, Model, Schema } from 'mongoose';

export type DocumentStatus =
  | 'Uploaded'
  | 'Missing'
  | 'Rejected'
  | 'Verified'
  | 'Expired'
  | 'Pending Verification';

export type VerificationStatus =
  | 'Uploaded'
  | 'Under Verification'
  | 'Verified'
  | 'Rejected';

export interface IDocument extends MongooseDocument {
  _id: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  name: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  version: number;
  status: DocumentStatus;
  verificationStatus: VerificationStatus;
  uploadedBy: mongoose.Types.ObjectId;
  uploadedAt: Date;
  expiryDate?: Date;
  remarks?: string;
  usedInApprovals: string[];
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID reference is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Document name is required'],
      trim: true,
      index: true,
    },
    documentType: {
      type: String,
      required: [true, 'Document type/category is required'],
      trim: true,
      index: true,
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
    },
    fileSize: {
      type: Number,
      required: true,
      min: [0, 'File size cannot be negative'],
    },
    version: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: {
        values: [
          'Uploaded',
          'Missing',
          'Rejected',
          'Verified',
          'Expired',
          'Pending Verification',
        ],
        message: '{VALUE} is not a valid document status',
      },
      default: 'Uploaded',
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: {
        values: ['Uploaded', 'Under Verification', 'Verified', 'Rejected'],
        message: '{VALUE} is not a valid verification status',
      },
      default: 'Uploaded',
      index: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
    usedInApprovals: {
      type: [String],
      default: [],
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

DocumentSchema.index({ projectId: 1, name: 1 });
DocumentSchema.index({ projectId: 1, status: 1 });

export const DocumentModel: Model<IDocument> =
  mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);

export default DocumentModel;
