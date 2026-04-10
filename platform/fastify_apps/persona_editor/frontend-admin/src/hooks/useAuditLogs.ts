/**
 * Audit Logs Hooks for Admin Dashboard
 */

import { useQuery } from '@tanstack/react-query';
import { auditLogsApi } from '../services/api/audit-logs';

export const auditLogKeys = {
  all: ['audit-logs'] as const,
  list: (limit?: number) => [...auditLogKeys.all, 'list', limit] as const,
};

export function useAuditLogs(limit?: number) {
  return useQuery({
    queryKey: auditLogKeys.list(limit),
    queryFn: () => auditLogsApi.list(limit),
  });
}
