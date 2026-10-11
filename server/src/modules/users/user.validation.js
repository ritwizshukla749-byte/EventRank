import { z } from 'zod';

/**
 * Profile update payload for PATCH /api/v1/users/me.
 * Whitelist-only: identity, role, and college-association fields can never be
 * updated through this endpoint (enforced with .strict() so unknown keys fail).
 */
export const updateProfileSchema = z
  .object({
    name: z.string().min(2).max(100).optional(),
    department: z.string().trim().max(120).optional(),
    academicYear: z.coerce.number().int().min(1).max(6).optional(),
    interests: z.array(z.string().min(1).max(60)).max(30).optional(),
    skills: z.array(z.string().min(1).max(60)).max(30).optional(),
    experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    preferredEventTypes: z
      .array(z.enum(['hackathon', 'workshop', 'competition', 'cultural', 'talk', 'social', 'career']))
      .max(15)
      .optional(),
    budgetMax: z.coerce.number().min(0).nullable().optional(),
    privacyPreferences: z
      .object({
        showInPeerCounts: z.boolean().optional(),
      })
      .optional(),
  })
  .strict();