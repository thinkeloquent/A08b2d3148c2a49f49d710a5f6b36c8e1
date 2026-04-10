/**
 * Admin Dashboard Types
 */

export type TaskStatus = 'PENDING' | 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED' | 'SKIPPED' | 'RETRYING' | 'FAILED';
export type StepStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED' | 'BLOCKED';
export type WorkflowStatus = 'PENDING' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type RepeatInterval = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface Task {
  id: string;
  idempotencyKey: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: string | null;
  repeatInterval: RepeatInterval;
  retryCount: number;
  maxRetries: number;
  skipReason: string | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  creatorId: string | null;
  assignedToId: string | null;
  templateId: string | null;
  stepsCount?: number;
  prerequisitesCount?: number;
  dependentsCount?: number;
}

export interface Step {
  id: string;
  token: string;
  content: string;
  order: number | null;
  status: StepStatus;
  startedAt: string | null;
  completedAt: string | null;
  skipReason: string | null;
  blockedReason: string | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  taskId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  executionId: string;
  workflowType: string;
  status: WorkflowStatus;
  currentNode: string | null;
  startedAt: string;
  completedAt: string | null;
  pausedAt: string | null;
  errorMessage: string | null;
  completedTasks: string[];
  failedTasks: string[];
  skippedTasks: string[];
  taskId: string;
  userId: string | null;
}

export interface ExecutionLog {
  id: string;
  eventType: string;
  eventData: Record<string, unknown>;
  correlationId: string;
  executionId: string | null;
  timestamp: string;
  taskId: string | null;
  stepId: string | null;
  userId: string | null;
}

export interface Pagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}

export interface SingleResponse<T> {
  success: boolean;
  data: T;
}

// Dashboard stats
export interface DashboardStats {
  totalTasks: number;
  tasksByStatus: Record<TaskStatus, number>;
  totalSteps: number;
  totalUsers: number;
  totalWorkflows: number;
  recentActivity: ExecutionLog[];
}
