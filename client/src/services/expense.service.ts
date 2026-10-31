import { request } from './api.js';
import { ExpenseItem, BudgetSummary } from '../types/index.js';

export const expenseService = {
  async list(eventId: string): Promise<{
    success: boolean;
    count: number;
    budgetSummary: BudgetSummary;
    expenses: ExpenseItem[];
  }> {
    return request<{
      success: boolean;
      count: number;
      budgetSummary: BudgetSummary;
      expenses: ExpenseItem[];
    }>(`/events/${eventId}/expenses`);
  },

  async create(eventId: string, data: Partial<ExpenseItem>): Promise<{ success: boolean; expense: ExpenseItem }> {
    return request<{ success: boolean; expense: ExpenseItem }>(`/events/${eventId}/expenses`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async update(
    eventId: string,
    id: string,
    data: Partial<ExpenseItem>
  ): Promise<{ success: boolean; expense: ExpenseItem }> {
    return request<{ success: boolean; expense: ExpenseItem }>(`/events/${eventId}/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async delete(eventId: string, id: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(`/events/${eventId}/expenses/${id}`, {
      method: 'DELETE'
    });
  }
};
