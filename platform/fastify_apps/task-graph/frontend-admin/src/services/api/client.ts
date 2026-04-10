/**
 * Admin API Client
 */

import type {
  Task,
  Step,
  User,
  WorkflowExecution,
  ExecutionLog,
  DashboardStats,
  PaginatedResponse,
  SingleResponse,
  TaskStatus,
} from '../../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api/task-graph';

class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Request failed' } }));
    throw new ApiError(
      response.status,
      error.error?.code || 'UNKNOWN_ERROR',
      error.error?.message || 'An error occurred',
      error.error?.details
    );
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// ============================================================================
// Tasks API
// ============================================================================

export const tasksApi = {
  list: (params: {
    limit?: number;
    offset?: number;
    status?: TaskStatus | TaskStatus[];
    search?: string;
  } = {}): Promise<PaginatedResponse<Task>> => {
    const searchParams = new URLSearchParams();
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.offset) searchParams.set('offset', params.offset.toString());
    if (params.status) {
      if (Array.isArray(params.status)) {
        params.status.forEach(s => searchParams.append('status', s));
      } else {
        searchParams.set('status', params.status);
      }
    }
    if (params.search) searchParams.set('search', params.search);
    return request(`/tasks?${searchParams.toString()}`);
  },

  get: (taskId: string): Promise<SingleResponse<Task>> =>
    request(`/tasks/${taskId}`),

  create: (data: {
    title: string;
    description?: string;
    status?: TaskStatus;
    dueDate?: string;
    assignedToId?: string;
    metadata?: Record<string, unknown>;
  }): Promise<SingleResponse<Task>> =>
    request('/tasks', { method: 'POST', body: JSON.stringify(data) }),

  update: (taskId: string, data: Partial<Task>): Promise<SingleResponse<Task>> =>
    request(`/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (taskId: string): Promise<void> =>
    request(`/tasks/${taskId}`, { method: 'DELETE' }),

  updateStatus: (taskId: string, status: TaskStatus, skipReason?: string): Promise<SingleResponse<Task>> =>
    request(`/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, skipReason }),
    }),

  start: (taskId: string): Promise<SingleResponse<Task>> =>
    request(`/tasks/${taskId}/start`, { method: 'POST' }),

  complete: (taskId: string): Promise<SingleResponse<Task>> =>
    request(`/tasks/${taskId}/complete`, { method: 'POST' }),

  fail: (taskId: string, error: string): Promise<SingleResponse<Task>> =>
    request(`/tasks/${taskId}/fail`, { method: 'POST', body: JSON.stringify({ error }) }),

  skip: (taskId: string, reason: string): Promise<SingleResponse<Task>> =>
    request(`/tasks/${taskId}/skip`, { method: 'POST', body: JSON.stringify({ reason }) }),

  retry: (taskId: string): Promise<SingleResponse<Task>> =>
    request(`/tasks/${taskId}/retry`, { method: 'POST' }),
};

// ============================================================================
// Steps API
// ============================================================================

export const stepsApi = {
  listByTask: (taskId: string): Promise<{ success: boolean; data: Step[] }> =>
    request(`/tasks/${taskId}?includeSteps=true`).then((res: any) => ({
      success: true,
      data: res.data?.steps || [],
    })),
};

// ============================================================================
// Users API
// ============================================================================

export const usersApi = {
  list: (params: { limit?: number; offset?: number } = {}): Promise<PaginatedResponse<User>> => {
    const searchParams = new URLSearchParams();
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.offset) searchParams.set('offset', params.offset.toString());
    return request(`/users?${searchParams.toString()}`);
  },

  get: (userId: string): Promise<SingleResponse<User>> =>
    request(`/users/${userId}`),
};

// ============================================================================
// Workflows API
// ============================================================================

export const workflowsApi = {
  list: (params: { limit?: number; offset?: number } = {}): Promise<PaginatedResponse<WorkflowExecution>> => {
    const searchParams = new URLSearchParams();
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.offset) searchParams.set('offset', params.offset.toString());
    return request(`/workflows?${searchParams.toString()}`);
  },
};

// ============================================================================
// Execution Logs API
// ============================================================================

export const executionsApi = {
  list: (params: {
    limit?: number;
    offset?: number;
    taskId?: string;
  } = {}): Promise<PaginatedResponse<ExecutionLog>> => {
    const searchParams = new URLSearchParams();
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.offset) searchParams.set('offset', params.offset.toString());
    if (params.taskId) searchParams.set('taskId', params.taskId);
    return request(`/executions?${searchParams.toString()}`);
  },
};

// ============================================================================
// Dashboard API
// ============================================================================

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    // Aggregate stats from multiple endpoints
    const [tasksRes] = await Promise.all([
      tasksApi.list({ limit: 100 }),
    ]);

    const tasksByStatus = tasksRes.data.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<TaskStatus, number>);

    return {
      totalTasks: tasksRes.pagination.total,
      tasksByStatus,
      totalSteps: 0,
      totalUsers: 0,
      totalWorkflows: 0,
      recentActivity: [],
    };
  },
};

export { ApiError };
