/**
 * Personas API Module
 * CRUD operations for personas
 */

import { get, post, put, del } from './client';
import type {
  Persona,
  CreatePersonaRequest,
  UpdatePersonaRequest,
  AuditLog,
} from '../../types/persona';

/**
 * Personas API methods
 */
export const personasApi = {
  /**
   * List all personas
   * GET /personas
   */
  list(): Promise<Persona[]> {
    return get<Persona[]>('/personas');
  },

  /**
   * Get a single persona by ID
   * GET /personas/:id
   */
  getById(id: string): Promise<Persona> {
    return get<Persona>(`/personas/${id}`);
  },

  /**
   * Create a new persona
   * POST /personas
   */
  create(data: CreatePersonaRequest): Promise<Persona> {
    return post<Persona>('/personas', data);
  },

  /**
   * Update an existing persona
   * PUT /personas/:id
   */
  update(id: string, data: UpdatePersonaRequest): Promise<Persona> {
    return put<Persona>(`/personas/${id}`, data);
  },

  /**
   * Delete a persona
   * DELETE /personas/:id
   */
  delete(id: string): Promise<void> {
    return del<void>(`/personas/${id}`);
  },

  /**
   * Get audit logs for a persona
   * GET /personas/:id/audit-logs
   */
  getAuditLogs(id: string, limit?: number): Promise<AuditLog[]> {
    const params = limit ? { limit } : undefined;
    return get<AuditLog[]>(`/personas/${id}/audit-logs`, params);
  },

  /**
   * Generate AI suggestion for a persona field
   * POST /suggest
   */
  suggest(type: string, properties: Record<string, unknown>): Promise<{ suggestion: string; type: string }> {
    return post<{ suggestion: string; type: string }>('/suggest', { type, properties });
  },
};
