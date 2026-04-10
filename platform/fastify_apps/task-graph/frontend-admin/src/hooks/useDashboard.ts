/**
 * Dashboard Hooks
 */

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../services/api/client';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: () => dashboardApi.getStats(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
