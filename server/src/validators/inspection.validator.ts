import { z } from 'zod';

const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
const mongoIdSchema = z.string().regex(mongoIdRegex, 'Invalid MongoDB ObjectId format');

const checklistItemSchema = z.object({
  _id: mongoIdSchema.optional(),
  item: z.string().trim().min(2, 'Checklist item description must be at least 2 characters'),
  status: z
    .enum(['Compliant', 'Non-Compliant', 'Pending', 'Not Applicable'])
    .default('Pending'),
  remarks: z.string().trim().optional().default(''),
});

export const createInspectionSchema = z.object({
  body: z.object({
    project: mongoIdSchema,
    application: mongoIdSchema.optional(),
    department: z
      .string({ required_error: 'Department is required' })
      .trim()
      .min(2, 'Department is required'),
    assignedInspector: mongoIdSchema,
    inspectionDate: z
      .string({ required_error: 'Inspection date is required' })
      .min(1, 'Inspection date cannot be empty'),
    inspectionTime: z.string().trim().optional().default('10:00 AM'),
    inspectionType: z.string().trim().optional().default('Joint Site Visit'),
    status: z
      .enum(['Scheduled', 'Rescheduled', 'Completed', 'Cancelled'])
      .default('Scheduled'),
    remarks: z.string().trim().optional().default(''),
    location: z.string().trim().optional().default(''),
    documentsVerified: z.array(z.string().trim()).default([]),
    photos: z.array(z.string().trim()).default([]),
    checklist: z.array(checklistItemSchema).optional().default([]),
  }),
});

export const updateInspectionSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
  body: z.object({
    department: z.string().trim().min(2).optional(),
    assignedInspector: mongoIdSchema.optional(),
    inspectionDate: z.string().optional(),
    inspectionTime: z.string().trim().optional(),
    inspectionType: z.string().trim().optional(),
    remarks: z.string().trim().optional(),
    findings: z.string().trim().optional(),
    documentsVerified: z.array(z.string().trim()).optional(),
    photos: z.array(z.string().trim()).optional(),
    location: z.string().trim().optional(),
    checklist: z.array(checklistItemSchema).optional(),
  }),
});

export const updateInspectionStatusSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
  body: z.object({
    status: z.enum(['Scheduled', 'Rescheduled', 'Completed', 'Cancelled'], {
      required_error: 'Status is required',
    }),
    remarks: z.string().trim().optional(),
    findings: z.string().trim().optional(),
    documentsVerified: z.array(z.string().trim()).optional(),
    photos: z.array(z.string().trim()).optional(),
  }),
});

export const rescheduleInspectionSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
  body: z.object({
    inspectionDate: z
      .string({ required_error: 'New inspection date is required' })
      .min(1, 'New inspection date cannot be empty'),
    inspectionTime: z.string().trim().optional().default('10:00 AM'),
    reason: z
      .string({ required_error: 'Rescheduling reason is required' })
      .trim()
      .min(3, 'Please specify the rescheduling rationale'),
  }),
});

export const cancelInspectionSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
  body: z.object({
    reason: z
      .string({ required_error: 'Cancellation reason is required' })
      .trim()
      .min(3, 'Please provide the cancellation reason'),
  }),
});

export const assignInspectorSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
  body: z.object({
    assignedInspector: mongoIdSchema,
    remarks: z.string().trim().optional(),
  }),
});

export const inspectionParamsSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
});

export const inspectionQuerySchema = z.object({
  query: z.object({
    project: mongoIdSchema.optional(),
    application: mongoIdSchema.optional(),
    department: z.string().trim().optional(),
    assignedInspector: mongoIdSchema.optional(),
    status: z.string().trim().optional(),
    inspectionType: z.string().trim().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    search: z.string().trim().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
    sort: z.string().trim().optional(),
  }),
});
