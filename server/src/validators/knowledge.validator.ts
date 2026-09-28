import { z } from 'zod';

export const knowledgeSearchQuerySchema = z.object({
  query: z.object({
    q: z.string().trim().optional(),
    search: z.string().trim().optional(),
    keyword: z.string().trim().optional(),
    department: z.string().trim().optional(),
    industry: z.string().trim().optional(),
    category: z.string().trim().optional(),
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
      .default('20'),
  }),
});

export const approvalGuideFilterSchema = z.object({
  query: z.object({
    industry: z.string().trim().optional(),
    department: z.string().trim().optional(),
    inspectionRequired: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
    renewalRequired: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
    search: z.string().trim().optional(),
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
      .default('25'),
  }),
});

export const faqFilterSchema = z.object({
  query: z.object({
    department: z.string().trim().optional(),
    category: z.string().trim().optional(),
    keyword: z.string().trim().optional(),
    search: z.string().trim().optional(),
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
  }),
});

export const regulationFilterSchema = z.object({
  query: z.object({
    department: z.string().trim().optional(),
    industry: z.string().trim().optional(),
    actName: z.string().trim().optional(),
    search: z.string().trim().optional(),
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
      .default('25'),
  }),
});

export const departmentIdParamSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1, 'Department ID or code is required'),
  }),
});

export const createApprovalGuideSchema = z.object({
  body: z.object({
    title: z.string().trim().min(3, 'Title is required'),
    department: z.string().trim().min(2, 'Department is required'),
    industryTypes: z.array(z.string()).min(1, 'At least one industry type is required'),
    description: z.string().trim().min(10, 'Detailed description is required'),
    requiredDocuments: z.array(z.string()).default([]),
    eligibilityCriteria: z.array(z.string()).default([]),
    estimatedTimeline: z.string().default('15-30 working days'),
    inspectionRequired: z.boolean().default(false),
    dependencies: z.array(z.string()).default([]),
    renewalRequired: z.boolean().default(false),
    renewalFrequency: z.string().default('Not Required'),
    faqIds: z.array(z.string()).default([]),
  }),
});

export const createFAQSchema = z.object({
  body: z.object({
    question: z.string().trim().min(5, 'Question is required'),
    answer: z.string().trim().min(5, 'Answer is required'),
    department: z.string().trim().min(2, 'Department is required'),
    category: z.string().trim().min(2, 'Category is required'),
    keywords: z.array(z.string()).default([]),
  }),
});

export const createRegulationSchema = z.object({
  body: z.object({
    title: z.string().trim().min(3, 'Title is required'),
    actName: z.string().trim().min(3, 'Act name is required'),
    ruleNumber: z.string().optional().default(''),
    summary: z.string().trim().min(10, 'Summary is required'),
    applicableIndustries: z.array(z.string()).default(['ALL']),
    department: z.string().trim().min(2, 'Department is required'),
    effectiveDate: z.string().or(z.date()).optional(),
    referenceUrl: z.string().url().or(z.literal('')).optional().default(''),
  }),
});

export const createKnowledgeCategorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Category name is required'),
    description: z.string().default(''),
  }),
});
