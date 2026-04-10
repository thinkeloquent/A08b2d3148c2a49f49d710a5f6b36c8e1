/**
 * Base API Client
 * Provides typed HTTP request functionality with error handling
 */

import {
  ApiError,
  ApiErrorCode,
  createErrorFromResponse,
  createNetworkError,
  createTimeoutError,
} from '../../types/errors';

// Base URL for the ui-component-metadata API
export const API_BASE_URL = '/api/ui-component-metadata';

// Default timeout in milliseconds
const DEFAULT_TIMEOUT = 10000;

// Request configuration options
export interface RequestOptions {
  timeout?: number;
  signal?: AbortSignal;
}

// HTTP methods
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

/**
 * Build URL with query parameters
 */
function buildUrl(path: string, params?: Record<string, unknown>): string {
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    }
  }

  return url.toString();
}

/**
 * Create abort controller with timeout
 */
function createAbortWithTimeout(
  timeoutMs: number,
  externalSignal?: AbortSignal
): { controller: AbortController; timeoutId: ReturnType<typeof setTimeout> } {
  const controller = new AbortController();

  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener('abort', () => controller.abort());
    }
  }

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  return { controller, timeoutId };
}

/**
 * Generic API request function
 */
export async function apiRequest<T>(
  method: HttpMethod,
  path: string,
  options?: {
    body?: unknown;
    params?: Record<string, unknown>;
    timeout?: number;
    signal?: AbortSignal;
  }
): Promise<T> {
  const timeout = options?.timeout ?? DEFAULT_TIMEOUT;
  const { controller, timeoutId } = createAbortWithTimeout(timeout, options?.signal);

  try {
    const url = buildUrl(path, options?.params);

    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    const fetchOptions: RequestInit = {
      method,
      headers,
      signal: controller.signal,
    };

    if (options?.body && (method === 'POST' || method === 'PUT')) {
      headers['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, fetchOptions);

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw await createErrorFromResponse(response);
    }

    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) throw error;

    if (error instanceof Error && error.name === 'AbortError') {
      throw createTimeoutError(timeout);
    }

    if (error instanceof TypeError) {
      throw createNetworkError(error);
    }

    throw new ApiError(
      ApiErrorCode.NETWORK,
      error instanceof Error ? error.message : 'Unknown error occurred',
      0,
      error
    );
  }
}

export function get<T>(path: string, params?: Record<string, unknown>, options?: RequestOptions): Promise<T> {
  return apiRequest<T>('GET', path, { params, ...options });
}

export function post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
  return apiRequest<T>('POST', path, { body, ...options });
}

export function put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
  return apiRequest<T>('PUT', path, { body, ...options });
}

export function del<T>(path: string, options?: RequestOptions): Promise<T> {
  return apiRequest<T>('DELETE', path, options);
}
