/**
 * Compute Registry Module for app-yaml-overwrites package.
 * Provides registration and execution of compute functions with scope management.
 */

import { create as createLogger, type ILogger } from './logger.js';
import { ComputeScope } from './options.js';
import { ComputeFunctionError, ErrorCode } from './errors.js';

// Create module-level logger
const logger = createLogger('app-yaml-overwrites', 'compute-registry.ts');

/**
 * Type for compute functions - can be sync or async, with optional context.
 */
export type ComputeFunction = (context?: any) => any | Promise<any>;

/**
 * Represents a registered compute function with its scope.
 */
export interface RegisteredFunction {
    fn: ComputeFunction;
    scope: ComputeScope;
}

/**
 * Registry for compute functions that can be called via {{fn:name}}.
 *
 * Features:
 * - Function registration with STARTUP or REQUEST scope
 * - Name validation (^[a-zA-Z_][a-zA-Z0-9_]*$)
 * - STARTUP scope results are cached
 * - REQUEST scope functions are executed per-call
 * - Supports both sync and async functions
 */
export class ComputeRegistry {
    private logger: ILogger;
    private functions: Map<string, RegisteredFunction>;
    private cache: Map<string, any>;

    private static readonly NAME_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

    constructor(loggerInstance?: ILogger) {
        this.logger = loggerInstance || logger;
        this.functions = new Map();
        this.cache = new Map();
        this.logger.debug('ComputeRegistry initialized');
    }

    /**
     * Register a compute function with the given scope.
     *
     * @param name - Function name (must match ^[a-zA-Z_][a-zA-Z0-9_]*$)
     * @param fn - The function to register
     * @param scope - ComputeScope.STARTUP (cached) or ComputeScope.REQUEST (per-call)
     * @throws Error if name is invalid
     */
    public register(
        name: string,
        fn: ComputeFunction,
        scope: ComputeScope = ComputeScope.REQUEST
    ): void {
        this.validateName(name);
        this.logger.debug(`Registering function: ${name} with scope: ${scope}`);
        this.functions.set(name, { fn, scope });
        this.logger.info(`Function registered: ${name}`);
    }

    /**
     * Unregister a compute function.
     *
     * @param name - Function name to unregister
     * @returns True if function was unregistered, false if not found
     */
    public unregister(name: string): boolean {
        if (this.functions.has(name)) {
            this.logger.debug(`Unregistering function: ${name}`);
            this.functions.delete(name);
            // Also remove from cache if present
            this.cache.delete(name);
            this.logger.info(`Function unregistered: ${name}`);
            return true;
        }
        return false;
    }

    /**
     * Check if a function is registered.
     *
     * @param name - Function name to check
     * @returns True if function is registered
     */
    public has(name: string): boolean {
        return this.functions.has(name);
    }

    /**
     * List all registered function names.
     *
     * @returns Array of function names
     */
    public list(): string[] {
        return Array.from(this.functions.keys());
    }

    /**
     * Get the scope of a registered function.
     *
     * @param name - Function name
     * @returns ComputeScope if found, undefined otherwise
     */
    public getScope(name: string): ComputeScope | undefined {
        return this.functions.get(name)?.scope;
    }

    /**
     * Clear all registered functions and cache.
     */
    public clear(): void {
        this.logger.debug('Clearing registry');
        this.functions.clear();
        this.cache.clear();
    }

    /**
     * Clear only the result cache (keep registrations).
     */
    public clearCache(): void {
        this.logger.debug('Clearing result cache');
        this.cache.clear();
    }

    /**
     * Resolve (execute) a compute function.
     *
     * @param name - Function name to execute
     * @param context - Optional context object passed to the function
     * @param propertyPath - The path to the property being computed (e.g., "providers.gemini_openai.api_key")
     * @returns The function's return value
     * @throws ComputeFunctionError if function not found or execution fails
     */
    public async resolve(name: string, context?: any, propertyPath?: string): Promise<any> {
        this.logger.debug(`Resolving function: ${name}`, { propertyPath });

        const regFn = this.functions.get(name);
        if (!regFn) {
            this.logger.warn(`Compute function not found: ${name}`);
            throw new ComputeFunctionError(
                `Compute function not found: ${name}`,
                ErrorCode.COMPUTE_FUNCTION_NOT_FOUND,
                { name }
            );
        }

        // Check cache for STARTUP functions (cache key includes propertyPath for uniqueness)
        const cacheKey = propertyPath ? `${name}:${propertyPath}` : name;
        if (regFn.scope === ComputeScope.STARTUP && this.cache.has(cacheKey)) {
            this.logger.debug(`Returning cached value for: ${cacheKey}`);
            return this.cache.get(cacheKey);
        }

        try {
            const result = await this.executeFunction(regFn.fn, context, propertyPath);

            // Cache result if STARTUP scope
            if (regFn.scope === ComputeScope.STARTUP) {
                this.cache.set(cacheKey, result);
                this.logger.debug(`Cached result for STARTUP function: ${cacheKey}`);
            }

            return result;
        } catch (e: any) {
            this.logger.error(`Function execution failed: ${name}, error: ${e.message}`);
            throw new ComputeFunctionError(
                `Compute function failed: ${name}`,
                ErrorCode.COMPUTE_FUNCTION_FAILED,
                { name, originalError: e.message }
            );
        }
    }

    /**
     * Execute a function, handling both sync and async functions.
     * Passes context and propertyPath to the function.
     *
     * Function signatures supported:
     * - fn(ctx, propertyPath) - New: context and property path
     * - fn(ctx) - Legacy: context only
     * - fn() - No arguments (fallback)
     *
     * @param fn - The compute function to execute
     * @param context - Context object with env, config, request, etc.
     * @param propertyPath - Path to the property being computed (e.g., "providers.gemini_openai.api_key")
     */
    private async executeFunction(fn: ComputeFunction, context?: any, propertyPath?: string): Promise<any> {
        // Try with both context and propertyPath first
        try {
            const result = (fn as any)(context, propertyPath);
            return result instanceof Promise ? await result : result;
        } catch (e: any) {
            // If TypeError, try calling with context only
            if (e instanceof TypeError) {
                try {
                    const result = fn(context);
                    return result instanceof Promise ? await result : result;
                } catch (e2: any) {
                    // If still TypeError, try calling with no-args
                    if (e2 instanceof TypeError) {
                        const result = (fn as any)();
                        return result instanceof Promise ? await result : result;
                    }
                    throw e2;
                }
            }
            throw e;
        }
    }

    /**
     * Validate a function name.
     *
     * @param name - Function name to validate
     * @throws Error if name is invalid
     */
    private validateName(name: string): void {
        if (!name) {
            throw new Error('Function name cannot be empty');
        }
        if (!ComputeRegistry.NAME_PATTERN.test(name)) {
            throw new Error(
                `Invalid function name: ${name}. ` +
                `Must match pattern: ^[a-zA-Z_][a-zA-Z0-9_]*$`
            );
        }
    }
}

/**
 * Factory function to create a ComputeRegistry instance.
 *
 * @param loggerInstance - Optional custom logger
 * @returns ComputeRegistry instance
 */
export function createRegistry(loggerInstance?: ILogger): ComputeRegistry {
    return new ComputeRegistry(loggerInstance);
}
