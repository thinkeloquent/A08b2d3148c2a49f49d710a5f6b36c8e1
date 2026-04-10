/**
 * Task Graph Enums
 *
 * Defines all enum types used across task-graph models.
 *
 * @module models/enums
 */

// ============================================================================
// Task Status
// ============================================================================

export const TaskStatus = Object.freeze({
  PENDING: 'PENDING',
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
  BLOCKED: 'BLOCKED',
  SKIPPED: 'SKIPPED',
  RETRYING: 'RETRYING',
  FAILED: 'FAILED',
});

// ============================================================================
// Step Status
// ============================================================================

export const StepStatus = Object.freeze({
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  SKIPPED: 'SKIPPED',
  BLOCKED: 'BLOCKED',
});

// ============================================================================
// Repeat Interval
// ============================================================================

export const RepeatInterval = Object.freeze({
  NONE: 'NONE',
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
});

// ============================================================================
// Workflow Status
// ============================================================================

export const WorkflowStatus = Object.freeze({
  PENDING: 'PENDING',
  RUNNING: 'RUNNING',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
});

// ============================================================================
// Execution Event Type
// ============================================================================

export const ExecutionEventType = Object.freeze({
  // Task events
  TASK_CREATED: 'TASK_CREATED',
  TASK_STARTED: 'TASK_STARTED',
  TASK_COMPLETED: 'TASK_COMPLETED',
  TASK_FAILED: 'TASK_FAILED',
  TASK_SKIPPED: 'TASK_SKIPPED',
  TASK_RETRIED: 'TASK_RETRIED',
  TASK_BLOCKED: 'TASK_BLOCKED',
  TASK_UNBLOCKED: 'TASK_UNBLOCKED',

  // Step events
  STEP_CREATED: 'STEP_CREATED',
  STEP_STARTED: 'STEP_STARTED',
  STEP_COMPLETED: 'STEP_COMPLETED',
  STEP_FAILED: 'STEP_FAILED',
  STEP_SKIPPED: 'STEP_SKIPPED',
  STEP_RETRIED: 'STEP_RETRIED',
  STEP_BLOCKED: 'STEP_BLOCKED',
  STEP_UNBLOCKED: 'STEP_UNBLOCKED',

  // Dependency events
  DEPENDENCY_ADDED: 'DEPENDENCY_ADDED',
  DEPENDENCY_REMOVED: 'DEPENDENCY_REMOVED',
  DEPENDENCY_CYCLE_DETECTED: 'DEPENDENCY_CYCLE_DETECTED',

  // Checkpoint events
  CHECKPOINT_CREATED: 'CHECKPOINT_CREATED',
  CHECKPOINT_RESTORED: 'CHECKPOINT_RESTORED',

  // Execution events
  EXECUTION_STARTED: 'EXECUTION_STARTED',
  EXECUTION_COMPLETED: 'EXECUTION_COMPLETED',
  EXECUTION_FAILED: 'EXECUTION_FAILED',

  // Workflow events
  WORKFLOW_STARTED: 'WORKFLOW_STARTED',
  WORKFLOW_PAUSED: 'WORKFLOW_PAUSED',
  WORKFLOW_RESUMED: 'WORKFLOW_RESUMED',
  WORKFLOW_COMPLETED: 'WORKFLOW_COMPLETED',
  WORKFLOW_FAILED: 'WORKFLOW_FAILED',
  WORKFLOW_CANCELLED: 'WORKFLOW_CANCELLED',
});
