// Type for server-injected initial state
declare global {
  interface Window {
    INITIAL_STATE?: {
      basePath?: string;
      [key: string]: unknown;
    };
  }
}

// Environment configuration for the Admin UI
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api/figma-files',
  authEnabled: import.meta.env.VITE_AUTH_ENABLED === 'true',
  authHeader: import.meta.env.VITE_AUTH_HEADER || 'Authorization',
  // Base path for router - can be set via env var or injected by server
  basePath: import.meta.env.VITE_BASE_PATH || window.INITIAL_STATE?.basePath || '/',
} as const;

export type Config = typeof config;
