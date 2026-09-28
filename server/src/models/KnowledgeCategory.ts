import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IKnowledgeCategory extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const KnowledgeCategorySchema = new Schema<IKnowledgeCategory>(
  {
    name: {
      type: String,
      required: [true, 'Knowledge category name is required'],
      unique: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

KnowledgeCategorySchema.index({ name: 'text', description: 'text' });

export const KnowledgeCategory: Model<IKnowledgeCategory> = mongoose.model<IKnowledgeCategory>(
  'KnowledgeCategory',
  KnowledgeCategorySchema
);
export default KnowledgeCategory;
