import mongoose, { Document, Model, Schema } from 'mongoose';

export type DepartmentStatus = 'Active' | 'Inactive' | 'Under Review';

export interface IDepartment extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  code: string;
  description: string;
  website: string;
  contactEmail: string;
  contactPhone: string;
  officeAddress: string;
  approvalTypes: string[];
  status: DepartmentStatus;
  // Backward compatibility fields
  nodalOfficer?: string;
  email?: string;
  phone?: string;
  servicesOffered?: string[];
  averageProcessingDays?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
      unique: true,
    },
    code: {
      type: String,
      trim: true,
      uppercase: true,
      default: function (this: any, doc: any) {
        const target = this || doc;
        if (!target || !target.name) return 'DEPT';
        const words = target.name.split(/\s+/).filter(Boolean);
        return words.length > 1
          ? words.map((w: string) => w[0].toUpperCase()).join('').substring(0, 10)
          : target.name.substring(0, 6).toUpperCase();
      },
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    website: {
      type: String,
      default: '',
      trim: true,
    },
    contactEmail: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
    },
    contactPhone: {
      type: String,
      trim: true,
      default: '',
    },
    officeAddress: {
      type: String,
      trim: true,
      default: '',
    },
    approvalTypes: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Under Review'],
      default: 'Active',
    },
    // Backward compatibility fields
    nodalOfficer: {
      type: String,
      default: 'Nodal Officer',
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    servicesOffered: {
      type: [String],
      default: [],
    },
    averageProcessingDays: {
      type: Number,
      default: 15,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save synchronization hook for backward compatibility
DepartmentSchema.pre<IDepartment>('save', function (next) {
  if (this.contactEmail && !this.email) {
    this.email = this.contactEmail;
  } else if (this.email && !this.contactEmail) {
    this.contactEmail = this.email;
  }

  if (this.contactPhone && !this.phone) {
    this.phone = this.contactPhone;
  } else if (this.phone && !this.contactPhone) {
    this.contactPhone = this.phone;
  }

  if (this.approvalTypes && this.approvalTypes.length > 0 && (!this.servicesOffered || this.servicesOffered.length === 0)) {
    this.servicesOffered = [...this.approvalTypes];
  } else if (this.servicesOffered && this.servicesOffered.length > 0 && (!this.approvalTypes || this.approvalTypes.length === 0)) {
    this.approvalTypes = [...this.servicesOffered];
  }

  if (this.status) {
    this.isActive = this.status === 'Active';
  } else if (this.isActive !== undefined) {
    this.status = this.isActive ? 'Active' : 'Inactive';
  }

  next();
});

// Indexes for fast keyword search and filtering
DepartmentSchema.index({ name: 'text', description: 'text', approvalTypes: 'text' });
DepartmentSchema.index({ status: 1 });

export const Department: Model<IDepartment> = mongoose.model<IDepartment>('Department', DepartmentSchema);
export default Department;
