import { z } from 'zod';

export const auditQuerySchema = z.object({
  query: z.object({
    entity: z.string().trim().optional(),
    action: z.string().trim().optional(),
    user: z.string().trim().optional(),
    userId: z.string().trim().optional(),
    entityId: z.string().trim().optional(),
    search: z.string().trim().optional(),
    startDate: z.string().trim().optional(),
    endDate: z.string().trim().optional(),
    page: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .optional()
      .default('1'),
    limit: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .optional()
      .default('50'),
    sort: z.string().trim().optional().default('-timestamp'),
  }),
});

export const workflowParamsSchema = z.object({
  params: z.object({
    applicationId: z.string().trim().min(1, 'Application ID or application number is required'),
  }),
});

export const createAuditLogSchema = z.object({
  body: z.object({
    action: z.string().trim().min(2, 'Action is required'),
    entity: z.string().trim().min(2, 'Entity is required'),
    entityId: z.string().trim().min(1, 'Entity ID is required'),
    oldValue: z.any().optional(),
    newValue: z.any().optional(),
    ipAddress: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  }),
});
