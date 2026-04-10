/**
 * React Query Client Configuration
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Cache data for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry once on failure for queries (idempotent)
      retry: 1,
      // Don't refetch on window focus to reduce unnecessary requests
      refetchOnWindowFocus: false,
      // Don't refetch on reconnect automatically
      refetchOnReconnect: false,
    },
    mutations: {
      // Don't retry mutations (non-idempotent operations)
      retry: 0,
    },
  },
});
