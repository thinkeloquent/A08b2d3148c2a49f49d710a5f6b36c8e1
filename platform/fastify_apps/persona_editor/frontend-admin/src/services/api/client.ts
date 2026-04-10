/**
 * Base API Client for Admin Dashboard
 */

export const API_BASE_URL = '/~/api/persona_editor';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function request<T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  params?: Record<string, unknown>
): Promise<T> {
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  const options: RequestInit = {
    method,
    headers,
  };

  if (body && (method === 'POST' || method === 'PUT')) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url.toString(), options);

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      if (data.message) message = data.message;
    } catch {}
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const get = <T>(path: string, params?: Record<string, unknown>) =>
  request<T>('GET', path, undefined, params);

export const post = <T>(path: string, body?: unknown) =>
  request<T>('POST', path, body);

export const put = <T>(path: string, body?: unknown) =>
  request<T>('PUT', path, body);

export const del = <T>(path: string) =>
  request<T>('DELETE', path);
