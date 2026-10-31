import { z } from 'zod';

export const expenseCategoryEnum = z.enum([
  'Venue',
  'Catering',
  'Photography',
  'Decor & Flowers',
  'Entertainment',
  'Attire & Beauty',
  'Invitations & Favors',
  'Transport & Lodging',
  'Miscellaneous'
]);

export const createExpenseSchema = z.object({
  category: expenseCategoryEnum,
  title: z.string().min(1, 'Title is required').max(150),
  allocatedAmount: z.number().min(0, 'Allocated amount cannot be negative').default(0),
  actualAmount: z.number().min(0, 'Actual amount cannot be negative').default(0),
  paidStatus: z.enum(['unpaid', 'partially_paid', 'paid']).default('unpaid'),
  notes: z.string().max(1000).optional().default(''),
  date: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: 'Invalid date format'
  })
});

export const updateExpenseSchema = createExpenseSchema.partial();

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
