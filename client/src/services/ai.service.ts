import { request } from './api.js';
import { AiPlanOutput } from '../types/index.js';

export interface GeneratePlanResponse {
  success: boolean;
  message: string;
  isDemoFallback: boolean;
  disclaimer: string;
  plan: AiPlanOutput;
}

export const aiService = {
  async generate(
    eventId: string,
    additionalPrompt: string = '',
    focusAreas: string[] = []
  ): Promise<GeneratePlanResponse> {
    return request<GeneratePlanResponse>(`/events/${eventId}/ai/generate`, {
      method: 'POST',
      body: JSON.stringify({ additionalPrompt, focusAreas })
    });
  },

  async getLatest(eventId: string): Promise<{
    success: boolean;
    plan: AiPlanOutput;
    isDemoFallback: boolean;
    createdAt: string;
  }> {
    return request<{
      success: boolean;
      plan: AiPlanOutput;
      isDemoFallback: boolean;
      createdAt: string;
    }>(`/events/${eventId}/ai/latest`);
  },

  async apply(
    eventId: string,
    options: {
      applyBudget: boolean;
      applyTasks: boolean;
      applyVendors: boolean;
      applyTheme: boolean;
      plan?: AiPlanOutput;
    }
  ): Promise<{
    success: boolean;
    message: string;
    applied: {
      budgetItemsCreated: number;
      tasksCreated: number;
      vendorsCreated: number;
      themeUpdated: boolean;
    };
  }> {
    return request<{
      success: boolean;
      message: string;
      applied: any;
    }>(`/events/${eventId}/ai/apply`, {
      method: 'POST',
      body: JSON.stringify(options)
    });
  }
};
