import { z } from 'zod';

export const generateAiPlanRequestSchema = z.object({
  additionalPrompt: z.string().max(1000).optional().default(''),
  focusAreas: z.array(z.string()).optional().default([])
});

export const aiPlanOutputSchema = z.object({
  themeConcept: z.string(),
  decorIdeas: z.array(z.string()),
  foodAndBeverageIdeas: z.array(z.string()),
  activityIdeas: z.array(z.string()),
  budgetRecommendations: z.array(
    z.object({
      category: z.string(),
      percentage: z.number(),
      suggestedAmount: z.number(),
      rationale: z.string()
    })
  ),
  milestoneTimeline: z.array(
    z.object({
      timeframe: string(),
      title: z.string(),
      description: z.string()
    })
  ),
  checklistTasks: z.array(
    z.object({
      title: z.string(),
      category: z.string(),
      priority: z.enum(['low', 'medium', 'high']),
      daysBeforeEvent: z.number()
    })
  ),
  vendorSuggestions: z.array(
    z.object({
      category: z.string(),
      name: z.string(),
      estimatedBudgetShare: z.string(),
      recommendationTips: z.string()
    })
  ),
  personalizedTips: z.array(z.string())
});

function string() {
  return z.string();
}

export const applyAiPlanSchema = z.object({
  applyBudget: z.boolean().default(true),
  applyTasks: z.boolean().default(true),
  applyVendors: z.boolean().default(true),
  applyTheme: z.boolean().default(true)
});

export type GenerateAiPlanRequest = z.infer<typeof generateAiPlanRequestSchema>;
export type AiPlanOutput = z.infer<typeof aiPlanOutputSchema>;
export type ApplyAiPlanInput = z.infer<typeof applyAiPlanSchema>;
