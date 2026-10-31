import { request } from './api.js';
import { User } from '../types/index.js';

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export const authService = {
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  async getMe(): Promise<{ success: boolean; user: User }> {
    return request<{ success: boolean; user: User }>('/auth/me');
  }
};
