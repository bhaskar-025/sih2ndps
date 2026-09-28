import mongoose, { Document, Model, Schema } from 'mongoose';

export type PollutionCategory = 'Red' | 'Orange' | 'Green' | 'White';
export type ProjectStage = 'Planning' | 'Land_Acquisition' | 'Clearance_In_Progress' | 'Construction' | 'Operational';
export type ProjectStatus = 'Draft' | 'Submitted' | 'Under_Review' | 'Approved' | 'Rejected';

export interface IProject extends Document {
  _id: mongoose.Types.ObjectId;
  projectName: string;
  companyName: string;
  industry: string;
  projectType: string;
  location: string;
  district: string;
  taluka: string;
  village?: string;
  investment: number; // in Lakhs
  landArea: number;   // in Acres
  employees: number;
  waterRequirement: number; // in KLD
  powerRequirement: number; // in KW
  pollutionCategory: PollutionCategory;
  projectStage: ProjectStage;
  status: ProjectStatus;
  owner: mongoose.Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    projectName: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      index: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      index: true,
    },
    industry: {
      type: String,
      required: [true, 'Industry type is required'],
      trim: true,
      index: true,
    },
    projectType: {
      type: String,
      required: [true, 'Project type is required (e.g. Greenfield, Brownfield, Expansion)'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location address / MIDC plot detail is required'],
      trim: true,
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
      index: true,
    },
    taluka: {
      type: String,
      required: [true, 'Taluka is required'],
      trim: true,
      index: true,
    },
    village: {
      type: String,
      trim: true,
      default: '',
    },
    investment: {
      type: Number,
      required: [true, 'Investment amount in Lakhs is required'],
      min: [0, 'Investment amount cannot be negative'],
    },
    landArea: {
      type: Number,
      required: [true, 'Land area in acres is required'],
      min: [0, 'Land area cannot be negative'],
    },
    employees: {
      type: Number,
      required: [true, 'Planned employees count is required'],
      min: [0, 'Employees count cannot be negative'],
    },
    waterRequirement: {
      type: Number,
      required: [true, 'Water requirement in KLD is required'],
      min: [0, 'Water requirement cannot be negative'],
      default: 0,
    },
    powerRequirement: {
      type: Number,
      required: [true, 'Power requirement in KW is required'],
      min: [0, 'Power requirement cannot be negative'],
      default: 0,
    },
    pollutionCategory: {
      type: String,
      enum: {
        values: ['Red', 'Orange', 'Green', 'White'],
        message: '{VALUE} is not a valid pollution category (Red, Orange, Green, White)',
      },
      default: 'Orange',
      index: true,
    },
    projectStage: {
      type: String,
      enum: {
        values: ['Planning', 'Land_Acquisition', 'Clearance_In_Progress', 'Construction', 'Operational'],
        message: '{VALUE} is not a valid project stage',
      },
      default: 'Planning',
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['Draft', 'Submitted', 'Under_Review', 'Approved', 'Rejected'],
        message: '{VALUE} is not a valid project status',
      },
      default: 'Submitted',
      index: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Project owner is required'],
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret: any) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Virtual populate for applications
ProjectSchema.virtual('applications', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'projectId',
});

// Virtual populate for documents
ProjectSchema.virtual('documents', {
  ref: 'Document',
  localField: '_id',
  foreignField: 'projectId',
});

// Virtual populate for inspections
ProjectSchema.virtual('inspections', {
  ref: 'Inspection',
  localField: '_id',
  foreignField: 'applicationId',
});

// Compound indexes for fast multi-filter search
ProjectSchema.index({ projectName: 'text', companyName: 'text', district: 'text', industry: 'text' });
ProjectSchema.index({ owner: 1, isDeleted: 1 });
ProjectSchema.index({ district: 1, status: 1, industry: 1, projectStage: 1 });

export const Project: Model<IProject> = mongoose.model<IProject>('Project', ProjectSchema);
export default Project;
