import axios, { type AxiosInstance, type AxiosError } from 'axios';

/**
 * API Client Configuration
 * Centralized Axios instance for all backend API calls
 */

const API_TIMEOUT = 30000; // 30 seconds

/**
 * Create configured Axios instance
 * Uses relative URLs — Vite proxy handles routing in dev,
 * same-origin serving handles it in production.
 */
export const apiClient: AxiosInstance = axios.create({
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 */
apiClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`[API] Response from ${response.config.url}:`, response.data);
    }

    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;

      if (status === 401) {
        localStorage.removeItem('authToken');
      } else if (status === 429) {
        console.warn('[API] Rate limit exceeded:', data);
      }

      if (import.meta.env.DEV) {
        console.error(`[API] Error ${status}:`, data);
      }
    } else if (error.request) {
      console.error('[API] No response received:', error.message);
    } else {
      console.error('[API] Request setup error:', error.message);
    }

    return Promise.reject(error);
  }
);

/**
 * API Error type
 */
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
    details?: unknown;
  };
}

/**
 * Check if error is an API error
 */
export function isApiError(error: unknown): error is AxiosError<ApiError> {
  return axios.isAxiosError(error) && error.response?.data?.success === false;
}

/**
 * Extract error message from API error
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.response?.data.error.message || 'An error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}
