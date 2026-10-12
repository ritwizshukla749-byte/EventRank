import { z } from 'zod';

export const createSavedEventSchema = z.object({
  editionId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid event edition ID format')
    .describe('Event edition ID is required'),
});

export const listSavedEventsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const batchStatusSchema = z.object({
  editionIds: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid event edition ID format'))
    .min(1, 'At least one edition ID is required')
    .max(100, 'Maximum 100 edition IDs allowed')
    .describe('Edition IDs array is required'),
});

export const editionIdParamSchema = z.object({
  editionId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid event edition ID format'),
});
