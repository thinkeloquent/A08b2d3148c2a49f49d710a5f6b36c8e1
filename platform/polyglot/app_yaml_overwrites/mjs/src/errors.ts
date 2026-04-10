/**
 * Error classes for app-yaml-overwrites package.
 * Provides structured error types for resolution, security, and compute failures.
 */

/**
 * Error codes for programmatic handling.
 */
export enum ErrorCode {
    COMPUTE_FUNCTION_NOT_FOUND = 'ERR_COMPUTE_NOT_FOUND',
    COMPUTE_FUNCTION_FAILED = 'ERR_COMPUTE_FAILED',
    SECURITY_BLOCKED_PATH = 'ERR_SECURITY_PATH',
    RECURSION_LIMIT = 'ERR_RECURSION_LIMIT',
    SCOPE_VIOLATION = 'ERR_SCOPE_VIOLATION',
    VALIDATION_ERROR = 'ERR_VALIDATION_ERROR'
}

/**
 * Base exception for resolution errors.
 * Includes error code and context for programmatic handling.
 */
export class ResolveError extends Error {
    public readonly code: ErrorCode;
    public readonly context: Record<string, any>;

    constructor(message: string, code: ErrorCode, context?: Record<string, any>) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.context = context || {};

        // Ensure prototype chain is correct for instanceof checks
        Object.setPrototypeOf(this, new.target.prototype);
    }

    toString(): string {
        return `${this.code}: ${this.message}`;
    }
}

/**
 * Error when a compute function is not found or fails.
 */
export class ComputeFunctionError extends ResolveError {}

/**
 * Error when a path fails security validation.
 */
export class SecurityError extends ResolveError {}

/**
 * Error when recursion depth exceeds maximum.
 */
export class RecursionLimitError extends ResolveError {}

/**
 * Error when scope rules are violated.
 */
export class ScopeViolationError extends ResolveError {}

/**
 * Error for general validation failures.
 */
export class ValidationError extends ResolveError {}

/**
 * Error for immutability violations.
 */
export class ImmutabilityError extends Error {
    constructor(message: string = 'Configuration is immutable and cannot be modified') {
        super(message);
        this.name = 'ImmutabilityError';
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
