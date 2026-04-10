/**
 * Audit Logs API for Admin Dashboard
 */

import { get } from './client';
import type { AuditLog } from '../../types/audit-log';

export const auditLogsApi = {
  list: (limit?: number) =>
    get<AuditLog[]>('/audit-logs', limit ? { limit } : undefined),
};
