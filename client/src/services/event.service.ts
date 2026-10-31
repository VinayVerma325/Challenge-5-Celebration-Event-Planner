import { request } from './api.js';
import { EventItem } from '../types/index.js';

export const eventService = {
  async list(params?: { type?: string; status?: string; sort?: string }): Promise<{
    success: boolean;
    count: number;
    events: EventItem[];
  }> {
    const query = new URLSearchParams();
    if (params?.type) query.append('type', params.type);
    if (params?.status) query.append('status', params.status);
    if (params?.sort) query.append('sort', params.sort);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request<{ success: boolean; count: number; events: EventItem[] }>(`/events${queryString}`);
  },

  async getById(id: string): Promise<{ success: boolean; event: EventItem }> {
    return request<{ success: boolean; event: EventItem }>(`/events/${id}`);
  },

  async create(data: Partial<EventItem>): Promise<{ success: boolean; event: EventItem }> {
    return request<{ success: boolean; event: EventItem }>('/events', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async update(id: string, data: Partial<EventItem>): Promise<{ success: boolean; event: EventItem }> {
    return request<{ success: boolean; event: EventItem }>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(`/events/${id}`, {
      method: 'DELETE'
    });
  }
};
