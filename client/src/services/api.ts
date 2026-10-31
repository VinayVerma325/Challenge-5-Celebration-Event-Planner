const API_BASE_URL = '/api';

export class ApiError extends Error {
  public status: number;
  public errors?: Array<{ field: string; message: string }>;

  constructor(message: string, status: number, errors?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('celebration_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      data.message || 'An error occurred while communicating with the server.',
      response.status,
      data.errors
    );
  }

  return data as T;
}
