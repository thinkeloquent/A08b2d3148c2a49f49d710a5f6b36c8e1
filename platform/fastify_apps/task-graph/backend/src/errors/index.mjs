/**
 * Task Graph Error Classes
 *
 * Custom error classes with status codes and details
 *
 * @module errors/index
 */

import { AppError } from './base.error.mjs';

// ============================================================================
// VALIDATION ERRORS (1000-1999)
// ============================================================================

export class ValidationError extends AppError {
  constructor(message, details) {
    super('VALIDATION_ERROR', 400, message, details);
  }
}

export class ZodValidationError extends ValidationError {
  constructor(zodError) {
    const details = zodError.errors.map((err) => ({
      path: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));
    super('Input validation failed', { fields: details });
  }
}

// ============================================================================
// BUSINESS RULE ERRORS (2000-2999)
// ============================================================================

export class BusinessRuleError extends AppError {
  constructor(code, message, details) {
    super(code, 422, message, details);
  }
}

export class DependencyCycleError extends BusinessRuleError {
  constructor(cyclePath) {
    super(
      'DEPENDENCY_CYCLE_DETECTED',
      'Cannot add dependency: creates circular reference',
      {
        cyclePath,
        suggestion: 'Remove one of the dependencies in the cycle to break the loop',
      }
    );
  }
}

export class TaskBlockedError extends BusinessRuleError {
  constructor(taskId, incompletePrerequisites) {
    super('TASK_BLOCKED_BY_PREREQUISITES', 'Cannot complete task: prerequisites are incomplete', {
      taskId,
      incompletePrerequisites,
      suggestion: 'Complete or skip the prerequisite tasks first',
    });
  }
}

export class FileConstraintError extends BusinessRuleError {
  constructor() {
    super(
      'FILE_ATTACHMENT_CONSTRAINT_VIOLATION',
      'File must be attached to either a task OR a step, not both',
      { suggestion: 'Specify only taskId or stepId, not both' }
    );
  }
}

export class InvalidStatusTransitionError extends BusinessRuleError {
  constructor(from, to, allowedTransitions) {
    super('INVALID_STATUS_TRANSITION', `Cannot transition task from ${from} to ${to}`, {
      from,
      to,
      allowedTransitions,
    });
  }
}

export class IdempotencyKeyConflictError extends BusinessRuleError {
  constructor(idempotencyKey, existingTaskId) {
    super(
      'IDEMPOTENCY_KEY_CONFLICT',
      'A task with this idempotency key already exists',
      {
        idempotencyKey,
        existingTaskId,
        suggestion: 'Use a different idempotency key or retrieve the existing task',
      }
    );
  }
}

export class MaxRetriesExceededError extends BusinessRuleError {
  constructor(taskId, maxRetries) {
    super('MAX_RETRIES_EXCEEDED', 'Task has exceeded maximum retry attempts', {
      taskId,
      maxRetries,
      suggestion: 'Manual intervention required or increase maxRetries',
    });
  }
}

// ============================================================================
// CHECKPOINT ERRORS (2100-2199)
// ============================================================================

export class CheckpointError extends BusinessRuleError {
  constructor(code, message, details) {
    super(code, message, details);
  }
}

export class CheckpointNotFoundError extends CheckpointError {
  constructor(checkpointId) {
    super('CHECKPOINT_NOT_FOUND', 'Checkpoint not found or expired', {
      checkpointId,
      suggestion: 'The checkpoint may have expired or been deleted',
    });
  }
}

export class CheckpointExpiredError extends CheckpointError {
  constructor(checkpointId, expiredAt) {
    super('CHECKPOINT_EXPIRED', 'Checkpoint has expired', {
      checkpointId,
      expiredAt,
      suggestion: 'Create a new checkpoint',
    });
  }
}

export class CheckpointCorruptedError extends CheckpointError {
  constructor(checkpointId, reason) {
    super('CHECKPOINT_CORRUPTED', 'Checkpoint data is corrupted or invalid', {
      checkpointId,
      reason,
      suggestion: 'Cannot restore from this checkpoint',
    });
  }
}

// ============================================================================
// EXECUTION ERRORS (2200-2299)
// ============================================================================

export class ExecutionError extends BusinessRuleError {
  constructor(code, message, details) {
    super(code, message, details);
  }
}

export class ExecutionAlreadyRunningError extends ExecutionError {
  constructor(taskId, executionId) {
    super('EXECUTION_ALREADY_RUNNING', 'Task execution is already in progress', {
      taskId,
      executionId,
      suggestion: 'Wait for current execution to complete or cancel it',
    });
  }
}

export class ExecutionNotFoundError extends ExecutionError {
  constructor(executionId) {
    super('EXECUTION_NOT_FOUND', 'Execution record not found', {
      executionId,
    });
  }
}

export class StepSkipRequiredError extends ExecutionError {
  constructor(stepId) {
    super('STEP_SKIP_REASON_REQUIRED', 'Skip reason is required when skipping a step', {
      stepId,
      suggestion: 'Provide a reason for skipping this step',
    });
  }
}

export class InvalidStepStateError extends ExecutionError {
  constructor(stepId, operation, currentStatus, requiredStatus) {
    const required = Array.isArray(requiredStatus) ? requiredStatus.join(' or ') : requiredStatus;
    super(
      'INVALID_STEP_STATE',
      `Cannot ${operation} step: step must be in ${required} status`,
      {
        stepId,
        operation,
        currentStatus,
        requiredStatus,
        suggestion: `Change the step status to ${required} before attempting this operation`,
      }
    );
  }
}

export class StepBlockedByOrderError extends ExecutionError {
  constructor(stepId, blockingSteps) {
    super(
      'STEP_BLOCKED_BY_ORDER',
      'Cannot start step: previous steps must be completed or skipped first',
      {
        stepId,
        blockingSteps,
        suggestion: 'Complete or skip the preceding steps before starting this one',
      }
    );
  }
}

// ============================================================================
// DATABASE ERRORS (3000-3999)
// ============================================================================

export class DatabaseError extends AppError {
  constructor(code, message, details) {
    super(code, 500, message, details, false);
  }
}

export class NotFoundError extends AppError {
  constructor(resource, id) {
    super('RESOURCE_NOT_FOUND', 404, `${resource} not found`, { resource, id });
  }
}

export class ConflictError extends AppError {
  constructor(message, details) {
    super('RESOURCE_CONFLICT', 409, message, details);
  }
}

export class UniqueConstraintError extends ConflictError {
  constructor(field, value) {
    super(`${field} already exists`, { field, value });
  }
}

export class DuplicateTitleError extends ConflictError {
  constructor(title) {
    super('A task with this title already exists', {
      title,
      suggestion: 'Use a unique task name',
    });
  }
}

// ============================================================================
// EXTERNAL SERVICE ERRORS (4000-4999)
// ============================================================================

export class ExternalServiceError extends AppError {
  constructor(service, message, details) {
    super(`EXTERNAL_SERVICE_ERROR_${service.toUpperCase()}`, 502, message, details, false);
  }
}

export class RedisConnectionError extends ExternalServiceError {
  constructor(originalError) {
    super('REDIS', 'Redis connection failed', { error: originalError.message });
  }
}

export class RedisOperationError extends ExternalServiceError {
  constructor(operation, originalError) {
    super('REDIS', `Redis ${operation} operation failed`, {
      operation,
      error: originalError.message,
    });
  }
}

// ============================================================================
// SYSTEM ERRORS (5000-5999)
// ============================================================================

export class CriticalSystemError extends AppError {
  constructor(message, details) {
    super('CRITICAL_SYSTEM_ERROR', 500, message, details, false);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required', details) {
    super('UNAUTHORIZED', 401, message, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions', details) {
    super('FORBIDDEN', 403, message, details);
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get valid transitions for a task status
 */
export function getValidTransitions(currentStatus) {
  const transitions = {
    PENDING: ['DONE', 'FAILED', 'RETRYING', 'SKIPPED', 'IN_PROGRESS', 'BLOCKED'],
    TODO: ['PENDING', 'DONE', 'FAILED', 'RETRYING', 'SKIPPED', 'IN_PROGRESS', 'BLOCKED'], // Legacy support
    IN_PROGRESS: ['PENDING', 'DONE', 'BLOCKED', 'FAILED', 'RETRYING', 'SKIPPED'],
    BLOCKED: ['PENDING', 'IN_PROGRESS', 'SKIPPED'],
    DONE: ['PENDING'], // Allow reopening
    FAILED: ['PENDING', 'RETRYING', 'SKIPPED'],
    RETRYING: ['PENDING', 'IN_PROGRESS', 'DONE', 'FAILED', 'SKIPPED'],
    SKIPPED: ['PENDING', 'IN_PROGRESS'], // Allow un-skipping
  };
  return transitions[currentStatus] || [];
}

/**
 * Check if a status transition is valid
 */
export function isValidTransition(from, to) {
  const validTransitions = getValidTransitions(from);
  return validTransitions.includes(to);
}

export { AppError };
