import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IFAQ extends Document {
  _id: mongoose.Types.ObjectId;
  question: string;
  answer: string;
  department: string;
  category: string;
  keywords: string[];
  createdAt: Date;
  updatedAt: Date;
}

const FAQSchema = new Schema<IFAQ>(
  {
    question: {
      type: String,
      required: [true, 'Question is required'],
      trim: true,
      index: true,
    },
    answer: {
      type: String,
      required: [true, 'Answer is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    keywords: {
      type: [String],
      default: [],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Full-text search index for keyword intelligence
FAQSchema.index({
  question: 'text',
  answer: 'text',
  category: 'text',
  keywords: 'text',
  department: 'text',
});

// Compound index for department and category query optimizations
FAQSchema.index({ department: 1, category: 1 });

export const FAQ: Model<IFAQ> = mongoose.model<IFAQ>('FAQ', FAQSchema);
export default FAQ;
