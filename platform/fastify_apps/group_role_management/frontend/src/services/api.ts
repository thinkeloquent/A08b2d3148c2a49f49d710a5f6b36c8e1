/**
 * API Client
 * Handles all HTTP requests to the Group Role Management backend API
 */

import type { ApiResponse, PaginatedResponse, Role, Group, Label, Action, Restriction } from '@/types';

const API_BASE_URL = '/api/group-role-management';

/**
 * Transform a backend role (with nested group/label objects) to frontend Role type.
 * Backend returns groups: [{id, name, ...}], frontend expects groups: string[] (IDs)
 * Backend returns labels: [{name, color, ...}], frontend expects labels: string[] (names)
 */
function transformRole(raw: any): Role {
  return {
    ...raw,
    groups: Array.isArray(raw.groups)
      ? raw.groups.map((g: { id?: string } | string) => (typeof g === 'string' ? g : g.id))
      : [],
    labels: Array.isArray(raw.labels)
      ? raw.labels.map((l: { name?: string } | string) => (typeof l === 'string' ? l : l.name))
      : [],
    actions: Array.isArray(raw.actions)
      ? raw.actions.map((a: { id?: string } | string) => (typeof a === 'string' ? a : a.id))
      : [],
    restrictions: Array.isArray(raw.restrictions)
      ? raw.restrictions.map((r: { id?: string } | string) => (typeof r === 'string' ? r : r.id))
      : [],
    createdAt: raw.createdAt || raw.created_at || '',
    updatedAt: raw.updatedAt || raw.updated_at,
    createdBy: raw.createdBy || raw.created_by,
    updatedBy: raw.updatedBy || raw.updated_by,
    archivedAt: raw.archivedAt || raw.archived_at,
  };
}

/**
 * Transform a backend group to frontend Group type
 */
function transformGroup(raw: any): Group {
  return {
    ...raw,
    actions: Array.isArray(raw.actions)
      ? raw.actions.map((a: { id?: string } | string) => (typeof a === 'string' ? a : a.id))
      : [],
    restrictions: Array.isArray(raw.restrictions)
      ? raw.restrictions.map((r: { id?: string } | string) => (typeof r === 'string' ? r : r.id))
      : [],
    createdAt: raw.createdAt || raw.created_at,
    updatedAt: raw.updatedAt || raw.updated_at,
    createdBy: raw.createdBy || raw.created_by,
    updatedBy: raw.updatedBy || raw.updated_by,
    archivedAt: raw.archivedAt || raw.archived_at,
    roleCount: raw.roleCount ?? 0,
  };
}

/**
 * Transform a backend action to frontend Action type
 */
function transformAction(raw: any): Action {
  return {
    ...raw,
    createdAt: raw.createdAt || raw.created_at,
    updatedAt: raw.updatedAt || raw.updated_at,
    roleCount: raw.roleCount ?? 0,
    groupCount: raw.groupCount ?? 0,
  };
}

/**
 * Transform a backend restriction to frontend Restriction type
 */
function transformRestriction(raw: any): Restriction {
  return {
    ...raw,
    createdAt: raw.createdAt || raw.created_at,
    updatedAt: raw.updatedAt || raw.updated_at,
    roleCount: raw.roleCount ?? 0,
    groupCount: raw.groupCount ?? 0,
  };
}

/**
 * Transform a backend label to frontend Label type
 */
function transformLabel(raw: any): Label {
  return {
    ...raw,
    isPredefined: raw.isPredefined ?? raw.is_predefined ?? false,
    customCreated: raw.customCreated ?? raw.custom_created ?? true,
    usageCount: raw.usageCount ?? 0,
    createdAt: raw.createdAt || raw.created_at,
    createdBy: raw.createdBy || raw.created_by,
  };
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit,
    transform?: (data: any) => T,
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'API request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {
        data: undefined as unknown as T,
        meta: { timestamp: new Date().toISOString() },
      };
    }

    const data = await response.json();
    return {
      data: transform ? transform(data) : data,
      meta: { timestamp: new Date().toISOString() },
    };
  } catch (error) {
    return {
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      meta: { timestamp: new Date().toISOString() },
    };
  }
}

/**
 * Role API endpoints
 */
export const roleAPI = {
  async getRoles(params?: {
    label?: string;
    search?: string;
    status?: 'active' | 'archived';
    sort?: string;
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
    groups?: string;
  }): Promise<ApiResponse<PaginatedResponse<Role>>> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query.set(key, String(value));
        }
      });
    }
    const qs = query.toString();
    return fetchAPI<PaginatedResponse<Role>>(
      `/roles${qs ? `?${qs}` : ''}`,
      undefined,
      (raw) => ({
        ...raw,
        data: raw.data.map(transformRole),
      }),
    );
  },

  async getRole(roleId: string): Promise<ApiResponse<Role>> {
    return fetchAPI<Role>(`/roles/${roleId}`, undefined, transformRole);
  },

  async createRole(role: Omit<Role, 'id' | 'createdAt'>): Promise<ApiResponse<Role>> {
    return fetchAPI<Role>(
      '/roles',
      { method: 'POST', body: JSON.stringify(role) },
      transformRole,
    );
  },

  async updateRole(
    roleId: string,
    role: Partial<Role>,
    version?: number,
  ): Promise<ApiResponse<Role>> {
    return fetchAPI<Role>(
      `/roles/${roleId}`,
      {
        method: 'PUT',
        headers: version ? { 'If-Match': version.toString() } : {},
        body: JSON.stringify(role),
      },
      transformRole,
    );
  },

  async deleteRole(roleId: string, permanent = false): Promise<ApiResponse<void>> {
    return fetchAPI<void>(`/roles/${roleId}${permanent ? '?permanent=true' : ''}`, {
      method: 'DELETE',
    });
  },

  async cloneRole(roleId: string, name?: string): Promise<ApiResponse<Role>> {
    return fetchAPI<Role>(
      `/roles/${roleId}/clone`,
      { method: 'POST', body: JSON.stringify({ name }) },
      transformRole,
    );
  },
};

/**
 * Group API endpoints
 */
export const groupAPI = {
  async getGroups(params?: {
    search?: string;
    status?: 'active' | 'archived';
    sort?: string;
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<Group>>> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query.set(key, String(value));
        }
      });
    }
    const qs = query.toString();
    return fetchAPI<PaginatedResponse<Group>>(
      `/groups${qs ? `?${qs}` : ''}`,
      undefined,
      (raw) => ({
        ...raw,
        data: raw.data.map(transformGroup),
      }),
    );
  },

  async getGroup(groupId: string): Promise<ApiResponse<{ group: Group; roles: Role[] }>> {
    return fetchAPI<{ group: Group; roles: Role[] }>(
      `/groups/${groupId}`,
      undefined,
      (raw) => ({
        group: transformGroup(raw.group),
        roles: raw.roles.map(transformRole),
      }),
    );
  },

  async createGroup(group: Omit<Group, 'id' | 'createdAt'>): Promise<ApiResponse<Group>> {
    return fetchAPI<Group>(
      '/groups',
      { method: 'POST', body: JSON.stringify(group) },
      transformGroup,
    );
  },

  async updateGroup(groupId: string, group: Partial<Group>): Promise<ApiResponse<Group>> {
    return fetchAPI<Group>(
      `/groups/${groupId}`,
      { method: 'PUT', body: JSON.stringify(group) },
      transformGroup,
    );
  },

  async deleteGroup(
    groupId: string,
    permanent = false,
    reassignTo?: string,
  ): Promise<ApiResponse<void>> {
    const query = new URLSearchParams();
    if (permanent) query.set('permanent', 'true');
    if (reassignTo) query.set('reassignTo', reassignTo);
    const qs = query.toString();
    return fetchAPI<void>(`/groups/${groupId}${qs ? `?${qs}` : ''}`, {
      method: 'DELETE',
    });
  },

  async searchGroups(
    q: string,
    limit = 10,
    excludeIds?: string[],
  ): Promise<ApiResponse<Group[]>> {
    const query = new URLSearchParams({ q, limit: limit.toString() });
    if (excludeIds && excludeIds.length > 0) {
      query.set('excludeIds', excludeIds.join(','));
    }
    return fetchAPI<Group[]>(
      `/groups/search?${query}`,
      undefined,
      (raw) => (Array.isArray(raw) ? raw.map(transformGroup) : raw),
    );
  },
};

/**
 * Label API endpoints
 */
export const labelAPI = {
  async getLabels(): Promise<ApiResponse<Label[]>> {
    return fetchAPI<Label[]>(
      '/labels',
      undefined,
      (raw) => (Array.isArray(raw) ? raw.map(transformLabel) : raw),
    );
  },

  async createLabel(label: Label): Promise<ApiResponse<Label>> {
    return fetchAPI<Label>(
      '/labels',
      { method: 'POST', body: JSON.stringify(label) },
      transformLabel,
    );
  },

  async updateLabel(labelName: string, label: Partial<Label>): Promise<ApiResponse<Label>> {
    return fetchAPI<Label>(
      `/labels/${encodeURIComponent(labelName)}`,
      { method: 'PUT', body: JSON.stringify(label) },
      transformLabel,
    );
  },

  async deleteLabel(labelName: string): Promise<ApiResponse<void>> {
    return fetchAPI<void>(`/labels/${encodeURIComponent(labelName)}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Action API endpoints
 */
export const actionAPI = {
  async getActions(): Promise<ApiResponse<Action[]>> {
    return fetchAPI<Action[]>(
      '/actions',
      undefined,
      (raw) => (Array.isArray(raw) ? raw.map(transformAction) : raw),
    );
  },

  async searchActions(
    q: string,
    limit = 10,
    excludeIds?: string[],
  ): Promise<ApiResponse<Action[]>> {
    const query = new URLSearchParams({ q, limit: limit.toString() });
    if (excludeIds && excludeIds.length > 0) {
      query.set('excludeIds', excludeIds.join(','));
    }
    return fetchAPI<Action[]>(
      `/actions/search?${query}`,
      undefined,
      (raw) => (Array.isArray(raw) ? raw.map(transformAction) : raw),
    );
  },

  async createAction(action: { name: string; description?: string }): Promise<ApiResponse<Action>> {
    return fetchAPI<Action>(
      '/actions',
      { method: 'POST', body: JSON.stringify(action) },
      transformAction,
    );
  },

  async updateAction(actionId: string, action: Partial<Action>): Promise<ApiResponse<Action>> {
    return fetchAPI<Action>(
      `/actions/${actionId}`,
      { method: 'PUT', body: JSON.stringify(action) },
      transformAction,
    );
  },

  async deleteAction(actionId: string): Promise<ApiResponse<void>> {
    return fetchAPI<void>(`/actions/${actionId}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Restriction API endpoints
 */
export const restrictionAPI = {
  async getRestrictions(): Promise<ApiResponse<Restriction[]>> {
    return fetchAPI<Restriction[]>(
      '/restrictions',
      undefined,
      (raw) => (Array.isArray(raw) ? raw.map(transformRestriction) : raw),
    );
  },

  async searchRestrictions(
    q: string,
    limit = 10,
    excludeIds?: string[],
  ): Promise<ApiResponse<Restriction[]>> {
    const query = new URLSearchParams({ q, limit: limit.toString() });
    if (excludeIds && excludeIds.length > 0) {
      query.set('excludeIds', excludeIds.join(','));
    }
    return fetchAPI<Restriction[]>(
      `/restrictions/search?${query}`,
      undefined,
      (raw) => (Array.isArray(raw) ? raw.map(transformRestriction) : raw),
    );
  },

  async createRestriction(restriction: { name: string; description?: string }): Promise<ApiResponse<Restriction>> {
    return fetchAPI<Restriction>(
      '/restrictions',
      { method: 'POST', body: JSON.stringify(restriction) },
      transformRestriction,
    );
  },

  async updateRestriction(restrictionId: string, restriction: Partial<Restriction>): Promise<ApiResponse<Restriction>> {
    return fetchAPI<Restriction>(
      `/restrictions/${restrictionId}`,
      { method: 'PUT', body: JSON.stringify(restriction) },
      transformRestriction,
    );
  },

  async deleteRestriction(restrictionId: string): Promise<ApiResponse<void>> {
    return fetchAPI<void>(`/restrictions/${restrictionId}`, {
      method: 'DELETE',
    });
  },
};
