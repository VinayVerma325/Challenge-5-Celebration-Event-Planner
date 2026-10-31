import { request } from './api.js';

export interface DashboardSummary {
  stats: {
    totalEvents: number;
    upcomingEventsCount: number;
    totalBudget: number;
    totalSpent: number;
    completedTasks: number;
    pendingTasks: number;
    overdueTasks: number;
  };
  upcomingEvents: Array<{
    id: string;
    title: string;
    eventType: string;
    date: string;
    location: string;
    guestCount: number;
    budget: number;
    currency: string;
    spent: number;
    taskCount: number;
    taskPercentage: number;
  }>;
  urgentTasks: Array<{
    id: string;
    eventId: string;
    title: string;
    category: string;
    dueDate: string;
    priority: string;
    isOverdue: boolean;
  }>;
}

export const dashboardService = {
  async getSummary(): Promise<{ success: boolean } & DashboardSummary> {
    return request<{ success: boolean } & DashboardSummary>('/dashboard');
  }
};
