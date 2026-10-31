import { request } from './api.js';
import { TaskItem, TaskMetrics } from '../types/index.js';

export const taskService = {
  async list(
    eventId: string,
    filters?: { status?: string; priority?: string; category?: string }
  ): Promise<{
    success: boolean;
    count: number;
    taskMetrics: TaskMetrics;
    tasks: TaskItem[];
  }> {
    const query = new URLSearchParams();
    if (filters?.status) query.append('status', filters.status);
    if (filters?.priority) query.append('priority', filters.priority);
    if (filters?.category) query.append('category', filters.category);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request<{
      success: boolean;
      count: number;
      taskMetrics: TaskMetrics;
      tasks: TaskItem[];
    }>(`/events/${eventId}/tasks${queryString}`);
  },

  async create(eventId: string, data: Partial<TaskItem>): Promise<{ success: boolean; task: TaskItem }> {
    return request<{ success: boolean; task: TaskItem }>(`/events/${eventId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async update(
    eventId: string,
    id: string,
    data: Partial<TaskItem>
  ): Promise<{ success: boolean; task: TaskItem }> {
    return request<{ success: boolean; task: TaskItem }>(`/events/${eventId}/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async toggle(eventId: string, id: string): Promise<{ success: boolean; message: string; task: TaskItem }> {
    return request<{ success: boolean; message: string; task: TaskItem }>(
      `/events/${eventId}/tasks/${id}/toggle`,
      {
        method: 'PATCH'
      }
    );
  },

  async delete(eventId: string, id: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(`/events/${eventId}/tasks/${id}`, {
      method: 'DELETE'
    });
  }
};
