import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(120),
  eventType: z.preprocess(
    (val) => (typeof val === 'string' ? val.toLowerCase() : val),
    z.enum(['wedding', 'birthday', 'anniversary', 'community', 'other'])
  ),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Valid event date is required'
  }),
  location: z.string().min(2, 'Location is required').max(200),
  guestCount: z.number().int().min(1, 'Guest count must be at least 1'),
  budget: z.number().min(0, 'Budget cannot be negative'),
  currency: z.string().min(1).max(5).default('USD'),
  theme: z.string().max(100).optional().default('Classic'),
  dietaryRequirements: z.array(z.string()).optional().default([]),
  accessibilityRequirements: z.array(z.string()).optional().default([]),
  notes: z.string().max(2000).optional().default(''),
  status: z.enum(['planning', 'confirmed', 'completed', 'cancelled']).optional().default('planning')
});

export const updateEventSchema = createEventSchema.partial();

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
