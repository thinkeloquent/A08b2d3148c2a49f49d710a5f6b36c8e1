/**
 * Personas API for Admin Dashboard
 */

import { get, post, put, del } from './client';
import type { Persona, CreatePersonaRequest, UpdatePersonaRequest } from '../../types/persona';
import type { AuditLog } from '../../types/audit-log';

export const personasApi = {
  list: () => get<Persona[]>('/personas'),
  getById: (id: string) => get<Persona>(`/personas/${id}`),
  create: (data: CreatePersonaRequest) => post<Persona>('/personas', data),
  update: (id: string, data: UpdatePersonaRequest) => put<Persona>(`/personas/${id}`, data),
  delete: (id: string) => del<void>(`/personas/${id}`),
  getAuditLogs: (id: string, limit?: number) =>
    get<AuditLog[]>(`/personas/${id}/audit-logs`, limit ? { limit } : undefined),
  suggest: (type: string, properties: Record<string, unknown>) =>
    post<{ suggestion: string; type: string }>('/suggest', { type, properties }),
};
