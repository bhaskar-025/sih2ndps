import { z } from 'zod';

export const createApplicationSchema = z.object({
  body: z.object({
    projectId: z.string().min(1, 'Project ID is required'),
    departmentId: z.string().min(1, 'Department ID is required'),
    serviceName: z.string().min(3, 'Service name is required'),
    priority: z.enum(['Normal', 'High', 'Urgent']).default('Normal'),
    remarks: z.string().optional(),
  }),
});

export const updateApplicationStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Application ID is required'),
  }),
  body: z.object({
    status: z.enum(['Pending', 'In_Progress', 'Clarification_Required', 'Approved', 'Rejected']),
    currentStage: z.string().optional(),
    remarks: z.string().optional(),
  }),
});
