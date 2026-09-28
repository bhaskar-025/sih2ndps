import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Name is required' })
      .trim()
      .min(2, 'Name must be at least 2 characters long')
      .max(100, 'Name cannot exceed 100 characters'),
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .email('Please provide a valid email address')
      .toLowerCase(),
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters long'),
    role: z
      .enum(['entrepreneur', 'officer', 'admin', 'Entrepreneur', 'Officer', 'Admin'], {
        errorMap: () => ({ message: 'Role must be entrepreneur, officer, or admin' }),
      })
      .transform((val) => val.toLowerCase() as 'entrepreneur' | 'officer' | 'admin')
      .default('entrepreneur'),
    phone: z.string().trim().optional().default(''),
    organization: z.string().trim().optional().default(''),
    department: z.string().trim().optional().default(''),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .email('Please enter a valid email address')
      .toLowerCase(),
    password: z
      .string({ required_error: 'Password is required' })
      .min(1, 'Password is required'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional(),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
