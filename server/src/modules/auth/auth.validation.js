import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Valid email address is required').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  collegeId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Valid college ID required'),
  department: z.string().optional().default(''),
  academicYear: z.number().int().min(1).max(6).optional().default(1),
  interests: z.array(z.string()).optional().default([]),
  skills: z.array(z.string()).optional().default([]),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional().default('beginner'),
  preferredEventTypes: z.array(z.string()).optional().default([]),
  budgetMax: z.number().nonnegative().nullable().optional().default(null),
});

export const loginSchema = z.object({
  email: z.string().email('Valid email address is required').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});
