import { z } from 'zod';

export const submitReviewSchema = z.object({
  dimensions: z.object({
    organization: z.number().min(1).max(5),
    contentValue: z.number().min(1).max(5),
    networking: z.number().min(1).max(5),
    timeCostValue: z.number().min(1).max(5),
  }),
  text: z.string().max(1000).optional().default(''),
});

export const moderateReviewSchema = z.object({
  status: z.enum(['published', 'under_review', 'hidden']),
  moderationReason: z.string().min(3),
});

export const reportReviewSchema = z.object({
  reason: z.string().min(5).max(500),
});