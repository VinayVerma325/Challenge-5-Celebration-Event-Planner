import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(150),
  description: z.string().max(1000).optional().default(''),
  category: z.string().max(80).optional().default('General'),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Valid task due date is required'
  }),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending')
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  completedAt: z.string().optional().nullable()
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
