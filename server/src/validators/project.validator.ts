import { z } from 'zod';

export const createProjectSchema = z.object({
  body: z.object({
    projectName: z
      .string({ required_error: 'Project name is required' })
      .trim()
      .min(2, 'Project name must be at least 2 characters long')
      .max(200, 'Project name cannot exceed 200 characters'),
    companyName: z
      .string({ required_error: 'Company name is required' })
      .trim()
      .min(2, 'Company name must be at least 2 characters long')
      .max(200, 'Company name cannot exceed 200 characters'),
    industry: z
      .string({ required_error: 'Industry category is required' })
      .trim()
      .min(2, 'Industry must be specified'),
    projectType: z
      .string({ required_error: 'Project type is required' })
      .trim()
      .min(2, 'Project type must be specified (e.g. Greenfield, Brownfield, Expansion)'),
    location: z
      .string({ required_error: 'Location / MIDC plot detail is required' })
      .trim()
      .min(3, 'Location details are required'),
    district: z
      .string({ required_error: 'District is required' })
      .trim()
      .min(2, 'District is required'),
    taluka: z
      .string({ required_error: 'Taluka is required' })
      .trim()
      .min(2, 'Taluka is required'),
    village: z.string().trim().optional().default(''),
    investment: z
      .number({ required_error: 'Investment in Lakhs is required' })
      .positive('Investment must be a positive number'),
    landArea: z
      .number({ required_error: 'Land area in acres is required' })
      .positive('Land area must be greater than 0'),
    employees: z
      .number({ required_error: 'Employees count is required' })
      .int('Employees must be an integer')
      .nonnegative('Employees count cannot be negative'),
    waterRequirement: z
      .number({ required_error: 'Water requirement is required' })
      .nonnegative('Water requirement cannot be negative')
      .default(0),
    powerRequirement: z
      .number({ required_error: 'Power requirement is required' })
      .nonnegative('Power requirement cannot be negative')
      .default(0),
    pollutionCategory: z
      .enum(['Red', 'Orange', 'Green', 'White'], {
        errorMap: () => ({ message: 'Pollution category must be Red, Orange, Green, or White' }),
      })
      .default('Orange'),
    projectStage: z
      .enum(['Planning', 'Land_Acquisition', 'Clearance_In_Progress', 'Construction', 'Operational'], {
        errorMap: () => ({ message: 'Invalid project stage specified' }),
      })
      .default('Planning'),
    status: z
      .enum(['Draft', 'Submitted', 'Under_Review', 'Approved', 'Rejected'], {
        errorMap: () => ({ message: 'Invalid status specified' }),
      })
      .default('Submitted'),
  }),
});

export const updateProjectSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Project ID is required in URL parameter'),
  }),
  body: z.object({
    projectName: z.string().trim().min(2).max(200).optional(),
    companyName: z.string().trim().min(2).max(200).optional(),
    industry: z.string().trim().min(2).optional(),
    projectType: z.string().trim().min(2).optional(),
    location: z.string().trim().min(3).optional(),
    district: z.string().trim().min(2).optional(),
    taluka: z.string().trim().min(2).optional(),
    village: z.string().trim().optional(),
    investment: z.number().positive().optional(),
    landArea: z.number().positive().optional(),
    employees: z.number().int().nonnegative().optional(),
    waterRequirement: z.number().nonnegative().optional(),
    powerRequirement: z.number().nonnegative().optional(),
    pollutionCategory: z.enum(['Red', 'Orange', 'Green', 'White']).optional(),
    projectStage: z.enum(['Planning', 'Land_Acquisition', 'Clearance_In_Progress', 'Construction', 'Operational']).optional(),
    status: z.enum(['Draft', 'Submitted', 'Under_Review', 'Approved', 'Rejected']).optional(),
  }),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>['body'];
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>['body'];
