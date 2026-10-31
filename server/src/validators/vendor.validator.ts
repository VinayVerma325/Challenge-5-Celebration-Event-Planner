import { z } from 'zod';

export const createVendorSchema = z.object({
  name: z.string().min(1, 'Vendor name is required').max(150),
  category: z.string().min(1, 'Category is required').max(80),
  contactPerson: z.string().max(100).optional().default(''),
  email: z.string().email('Invalid email').or(z.literal('')).optional().default(''),
  phone: z.string().max(40).optional().default(''),
  website: z.string().max(200).optional().default(''),
  quoteAmount: z.number().min(0, 'Quote amount cannot be negative').default(0),
  status: z.enum(['researching', 'contacted', 'quoted', 'booked', 'declined']).default('researching'),
  notes: z.string().max(1000).optional().default(''),
  isAiSuggested: z.boolean().optional().default(false)
});

export const updateVendorSchema = createVendorSchema.partial();

export type CreateVendorInput = z.infer<typeof createVendorSchema>;
export type UpdateVendorInput = z.infer<typeof updateVendorSchema>;
