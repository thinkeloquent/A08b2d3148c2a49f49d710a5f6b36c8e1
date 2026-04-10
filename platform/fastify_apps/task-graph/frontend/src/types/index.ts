// Task Types
export type TaskStatus = 'PENDING' | 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED' | 'SKIPPED' | 'RETRYING' | 'FAILED';

// Step Types
export type StepStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED' | 'BLOCKED';

// Workflow Types
export type WorkflowStatus = 'PENDING' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  idempotencyKey?: string;
  dueDate?: string;
  startedAt?: string;
  completedAt?: string;
  failedAt?: string;
  retryCount: number;
  maxRetries: number;
  skipReason?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  stepsCount?: number;
  prerequisitesCount?: number;
  dependentsCount?: number;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  idempotencyKey?: string;
  dueDate?: string;
  maxRetries?: number;
  metadata?: Record<string, unknown>;
}

export interface Step {
  id: string;
  token?: string;
  content: string;
  status: StepStatus;
  order: number;
  startedAt?: string;
  completedAt?: string;
  skippedAt?: string;
  skipReason?: string;
  blockedAt?: string;
  blockedReason?: string;
  createdAt: string;
  taskId: string;
  filesCount?: number;
  metadata?: Record<string, unknown>;
}

export interface CreateStepInput {
  content: string;
  token?: string;
  order: number;
  metadata?: Record<string, unknown>;
}

export interface BatchCreateStepsInput {
  taskId: string;
  steps: CreateStepInput[];
}

export interface StepProgress {
  taskId: string;
  totalSteps: number;
  completedSteps: number;
  pendingSteps: number;
  skippedSteps: number;
  blockedSteps: number;
  inProgressSteps: number;
  progressPercentage: number;
  currentStep?: Step | null;
  nextAvailableStep?: Step | null;
}

// Checkpoint Types
export interface CheckpointState {
  status: string;
  completedSteps: string[];
  skippedSteps: Array<{
    stepId: string;
    reason: string;
    skippedAt: string;
  }>;
  currentStep: string | null;
  metadata: Record<string, unknown>;
  retryCount?: number;
  lastError?: string;
}

export interface Checkpoint {
  checkpointId: string;
  taskId: string;
  timestamp: string;
  state: CheckpointState;
  ttl: number;
  version: string;
}

export interface CreateCheckpointInput {
  taskId: string;
  state: CheckpointState;
  ttl?: number;
}

// Dependency Types
export interface Dependency {
  prerequisiteId: string;
  dependentId: string;
  allowSkip: boolean;
  createdAt: string;
}

export interface CreateDependencyInput {
  prerequisiteId: string;
  dependentId: string;
  allowSkip?: boolean;
}

export interface DependencyGraph {
  tasks: Array<{
    id: string;
    title: string;
    status: TaskStatus;
  }>;
  dependencies: Dependency[];
}

export interface ExecutionReadiness {
  taskId: string;
  canExecute: boolean;
  reason?: string;
  prerequisitesStatus: {
    total: number;
    completed: number;
    failed: number;
    blocked: number;
    skipped: number;
  };
  blockingPrerequisites: string[];
}

// Execution Log Types
export type ExecutionEventType =
  | 'TASK_CREATED'
  | 'TASK_STARTED'
  | 'TASK_COMPLETED'
  | 'TASK_FAILED'
  | 'TASK_SKIPPED'
  | 'TASK_RETRYING'
  | 'STEP_CREATED'
  | 'STEP_STARTED'
  | 'STEP_COMPLETED'
  | 'STEP_FAILED'
  | 'STEP_SKIPPED'
  | 'CHECKPOINT_CREATED'
  | 'CHECKPOINT_RESTORED'
  | 'DEPENDENCY_ADDED'
  | 'DEPENDENCY_REMOVED'
  | 'DEPENDENCY_CYCLE_DETECTED';

export interface ExecutionLog {
  id: string;
  eventType: ExecutionEventType;
  eventData: Record<string, unknown>;
  timestamp: string;
  correlationId?: string;
  taskId?: string;
  stepId?: string;
  userId?: string;
  executionId?: string;
  parentEventId?: string;
}

export interface ExecutionTimeline {
  taskId: string;
  events: Array<{
    id: string;
    eventType: ExecutionEventType;
    timestamp: string;
    entity: 'task' | 'step';
    entityId: string;
    summary: string;
    details: Record<string, unknown>;
  }>;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  totalEvents: number;
}

// Failed Job Types
export interface FailedJob {
  id: string;
  jobId: string;
  jobType: string;
  jobData: Record<string, unknown>;
  error: string;
  stack?: string;
  retried: boolean;
  failedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// File Types
export interface TaskFile {
  id: string;
  fileName: string;
  url: string;
  mimeType: string;
  size: number;
  taskId?: string;
  stepId?: string;
  uploaderId?: string;
  uploadedAt: string;
}

export interface CreateFileInput {
  fileName: string;
  url: string;
  mimeType?: string;
  size?: number;
  taskId?: string;
  stepId?: string;
  uploaderId?: string;
}

// Note Types
export interface Note {
  id: string;
  content: string;
  taskId: string;
  authorId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteInput {
  content: string;
  taskId: string;
  authorId?: string;
}
