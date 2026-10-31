import { request } from './api.js';
import { VendorItem, VendorSummary } from '../types/index.js';

export const vendorService = {
  async list(
    eventId: string,
    filters?: { category?: string; status?: string }
  ): Promise<{
    success: boolean;
    count: number;
    vendorSummary: VendorSummary;
    vendors: VendorItem[];
  }> {
    const query = new URLSearchParams();
    if (filters?.category) query.append('category', filters.category);
    if (filters?.status) query.append('status', filters.status);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request<{
      success: boolean;
      count: number;
      vendorSummary: VendorSummary;
      vendors: VendorItem[];
    }>(`/events/${eventId}/vendors${queryString}`);
  },

  async create(eventId: string, data: Partial<VendorItem>): Promise<{ success: boolean; vendor: VendorItem }> {
    return request<{ success: boolean; vendor: VendorItem }>(`/events/${eventId}/vendors`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async update(
    eventId: string,
    id: string,
    data: Partial<VendorItem>
  ): Promise<{ success: boolean; vendor: VendorItem }> {
    return request<{ success: boolean; vendor: VendorItem }>(`/events/${eventId}/vendors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async delete(eventId: string, id: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(`/events/${eventId}/vendors/${id}`, {
      method: 'DELETE'
    });
  }
};
