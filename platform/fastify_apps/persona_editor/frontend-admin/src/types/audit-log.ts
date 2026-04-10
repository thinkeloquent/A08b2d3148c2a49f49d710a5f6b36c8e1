/**
 * Audit Log Types for Admin Dashboard
 */

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';

export interface AuditLog {
  id: string;
  persona_id: string;
  action: AuditAction;
  changes: string;
  user_id: string;
  ip_address?: string;
  timestamp: string;
}

export interface AuditLogWithChanges extends Omit<AuditLog, 'changes'> {
  changes: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    created?: Record<string, unknown>;
    deleted?: Record<string, unknown>;
  };
}

export const ACTION_LABELS: Record<AuditAction, string> = {
  CREATE: 'Created',
  UPDATE: 'Updated',
  DELETE: 'Deleted',
};

export const ACTION_COLORS: Record<AuditAction, string> = {
  CREATE: 'bg-green-100 text-green-800',
  UPDATE: 'bg-blue-100 text-blue-800',
  DELETE: 'bg-red-100 text-red-800',
};
