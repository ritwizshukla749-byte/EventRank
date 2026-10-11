import { z } from 'zod';

export const checkInSchema = z.object({
  method: z.enum(['organizer_checkin', 'dynamic_token', 'admin_verified', 'approved_import']).default('dynamic_token'),
  token: z.string().optional(), // Check-in token when using dynamic token check-in
  evidenceReference: z.string().optional().default(''),
});

export const manualVerifySchema = z.object({
  method: z.enum(['organizer_checkin', 'admin_verified', 'approved_import']).default('organizer_checkin'),
  evidenceReference: z.string().optional().default(''),
});

export const createCheckInTokenSchema = z.object({
  expiresInMinutes: z.number().int().min(5).max(1440).default(60), // Default 1 hour validity
});
