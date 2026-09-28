import { z } from 'zod';

const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
const mongoIdSchema = z.string().regex(mongoIdRegex, 'Invalid MongoDB ObjectId format');

export const createComplianceSchema = z.object({
  body: z.object({
    projectId: mongoIdSchema,
    approvalId: mongoIdSchema.optional(),
    complianceName: z
      .string({ required_error: 'Compliance name is required' })
      .trim()
      .min(2, 'Compliance name must be at least 2 characters long')
      .max(300, 'Compliance name cannot exceed 300 characters'),
    department: z
      .string({ required_error: 'Department is required' })
      .trim()
      .min(2, 'Department is required'),
    frequency: z
      .enum(['Monthly', 'Quarterly', 'Half-Yearly', 'Annual', 'Biennial', 'One-Time'], {
        errorMap: () => ({ message: 'Invalid frequency specified' }),
      })
      .default('Annual'),
    lastCompleted: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
    nextDueDate: z
      .string({ required_error: 'Next due date is required' })
      .min(1, 'Next due date cannot be empty'),
    priority: z
      .enum(['Low', 'Medium', 'High', 'Critical'], {
        errorMap: () => ({ message: 'Priority must be Low, Medium, High, or Critical' }),
      })
      .default('Medium'),
    documentsRequired: z.array(z.string().trim()).default([]),
    renewalRequired: z.boolean().default(true),
    renewalWindowDays: z
      .number()
      .int()
      .min(1, 'Renewal window must be at least 1 day')
      .max(180, 'Renewal window cannot exceed 180 days')
      .default(30),
    penaltyRisk: z
      .enum(['Low', 'Medium', 'High', 'Critical'], {
        errorMap: () => ({ message: 'Penalty risk must be Low, Medium, High, or Critical' }),
      })
      .default('Medium'),
    remarks: z.string().trim().optional().default(''),
  }),
});

export const updateComplianceSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
  body: z.object({
    complianceName: z.string().trim().min(2).max(300).optional(),
    department: z.string().trim().min(2).optional(),
    frequency: z.enum(['Monthly', 'Quarterly', 'Half-Yearly', 'Annual', 'Biennial', 'One-Time']).optional(),
    lastCompleted: z.string().optional(),
    nextDueDate: z.string().optional(),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
    documentsRequired: z.array(z.string().trim()).optional(),
    renewalRequired: z.boolean().optional(),
    renewalWindowDays: z.number().int().min(1).max(180).optional(),
    penaltyRisk: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
    remarks: z.string().trim().optional(),
  }),
});

export const updateComplianceStatusSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
  body: z.object({
    status: z.enum(['Upcoming', 'Due Soon', 'Overdue', 'Completed', 'Renewal Pending'], {
      required_error: 'New status is required',
    }),
    remarks: z.string().trim().optional(),
    completionDate: z.string().optional(),
    nextDueDate: z.string().optional(),
  }),
});

export const getComplianceParamsSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
});

export const complianceQuerySchema = z.object({
  query: z.object({
    projectId: mongoIdSchema.optional(),
    department: z.string().trim().optional(),
    status: z.string().trim().optional(),
    priority: z.string().trim().optional(),
    penaltyRisk: z.string().trim().optional(),
    search: z.string().trim().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
    sort: z.string().trim().optional(),
  }),
});
