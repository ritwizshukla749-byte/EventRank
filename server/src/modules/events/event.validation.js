import { z } from 'zod';

export const listEventsQuerySchema = z.object({
  q: z.string().optional(),
  collegeId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid college ID').optional(),
  type: z.enum(['hackathon', 'workshop', 'competition', 'cultural', 'talk', 'social', 'career']).optional(),
  tags: z.string().optional(),
  from: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional()),
  to: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional()),
  minCost: z.coerce.number().min(0).optional(),
  maxCost: z.coerce.number().min(0).optional(),
  sort: z
    .enum(['upcoming', 'cost_asc', 'cost_desc', 'date_desc', 'quality', 'fit'])
    .default('upcoming'),
  includeScores: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const compareEventsSchema = z.object({
  editionIds: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid event edition ID'))
    .min(1, 'At least 1 event edition is required for comparison')
    .max(3, 'Cannot compare more than 3 events simultaneously'),
});

export const createEventSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10),
  organizerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid organizer ID'),
  eventType: z.enum(['hackathon', 'workshop', 'competition', 'cultural', 'talk', 'social', 'career']),
  tags: z.array(z.string()).default([]),
  prerequisites: z.array(z.string()).default([]),
  expectedOutcomes: z.array(z.string()).default([]),
  // Edition details
  editionLabel: z.string().default('Edition 1'),
  eligibility: z.enum(['host_college_only', 'selected_colleges', 'all_active_colleges']).default('all_active_colleges'),
  allowedCollegeIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).default([]),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  timezone: z.string().default('UTC'),
  venue: z.string().min(2),
  costAmount: z.number().min(0).default(0),
  currency: z.string().default('INR'),
  capacity: z.number().int().positive().nullable().optional(),
});
