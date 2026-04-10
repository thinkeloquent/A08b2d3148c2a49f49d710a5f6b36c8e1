/**
 * React Query Client Configuration
 * Based on REQ.v002.md performance requirements
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Refetch on window focus
      refetchOnWindowFocus: false,
      // Retry failed requests
      retry: 1,
      // Stale time (data considered fresh for 5 minutes)
      staleTime: 1000 * 60 * 5,
      // Cache time (data kept in cache for 10 minutes)
      gcTime: 1000 * 60 * 10,
    },
    mutations: {
      // Retry failed mutations
      retry: 1,
    },
  },
});
