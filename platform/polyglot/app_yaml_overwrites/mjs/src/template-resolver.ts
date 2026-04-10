/**
 * Template Resolver Module for app-yaml-overwrites package.
 * Provides resolution of {{...}} template expressions in configuration.
 */

import { create as createLogger, type ILogger } from './logger.js';
import { ComputeScope, MissingStrategy, type ResolverOptions } from './options.js';
import {
    RecursionLimitError,
    ComputeFunctionError,
    ErrorCode
} from './errors.js';
import { ComputeRegistry } from './compute-registry.js';
import { Security } from './security.js';
import { traversePath } from './path-parser.js';

// Create module-level logger
const logger = createLogger('app-yaml-overwrites', 'template-resolver.ts');

/**
 * Resolves template expressions in configuration values.
 *
 * Supported patterns:
 * - {{variable.path}} - Access context value by path
 * - {{fn:function_name}} - Call registered compute function
 * - {{fn:function_name.property}} - Call function and access property (Option 4)
 * - {{path | "default"}} - Use default value if path not found
 * - {{fn:name | "default"}} - Use default if function not found/fails
 * - {{fn:name.property | "default"}} - Access property with default
 */
export class TemplateResolver {
    // Pattern: {{fn:function_name.property_path | "default"}}
    // Groups: 1=fn_name, 2=property_path (optional), 3=default section, 4=default value
    private static readonly COMPUTE_PATTERN = /^\{\{fn:([a-zA-Z_][a-zA-Z0-9_]*)(?:\.([a-zA-Z0-9_.]+))?(\s*\|\s*['"](.*)['"])?\}\}$/;

    // Pattern: {{variable.path | "default"}}
    private static readonly TEMPLATE_PATTERN = /^\{\{([a-zA-Z0-9_.]*)(\s*\|\s*['"](.*)['"])?\}\}$/;

    private logger: ILogger;
    private registry: ComputeRegistry;
    private maxDepth: number;
    private missingStrategy: MissingStrategy;

    /**
     * Initialize the TemplateResolver.
     *
     * @param registry - ComputeRegistry for function resolution
     * @param options - Optional ResolverOptions configuration
     */
    constructor(registry: ComputeRegistry, options?: ResolverOptions) {
        this.logger = options?.logger || logger;
        this.registry = registry;
        this.maxDepth = options?.maxDepth ?? 10;
        this.missingStrategy = options?.missingStrategy ?? MissingStrategy.ERROR;
        this.logger.debug('TemplateResolver initialized');
    }

    /**
     * Check if an expression matches the compute pattern {{fn:name}}.
     *
     * @param expression - The string to check
     * @returns True if it's a compute pattern
     */
    public isComputePattern(expression: string): boolean {
        return TemplateResolver.COMPUTE_PATTERN.test(expression);
    }

    /**
     * Check if an expression matches the template pattern {{path}}.
     *
     * @param expression - The string to check
     * @returns True if it's a template pattern
     */
    public isTemplatePattern(expression: string): boolean {
        return TemplateResolver.TEMPLATE_PATTERN.test(expression);
    }

    /**
     * Resolve a single template expression.
     *
     * @param expression - The value to resolve (string with {{...}} or other)
     * @param context - Context object for variable lookup
     * @param scope - Resolution scope (STARTUP or REQUEST)
     * @param depth - Current recursion depth
     * @param propertyPath - The path to the property being resolved (e.g., "providers.gemini_openai.api_key")
     * @returns Resolved value (preserves types)
     */
    public async resolve(
        expression: any,
        context: Record<string, any>,
        scope: ComputeScope = ComputeScope.REQUEST,
        depth: number = 0,
        propertyPath?: string
    ): Promise<any> {
        // Pass-through non-string values
        if (typeof expression !== 'string') {
            return expression;
        }

        // Recursion check
        if (depth > this.maxDepth) {
            this.logger.error(`Recursion limit reached: ${this.maxDepth}`);
            throw new RecursionLimitError(
                `Recursion limit reached (${this.maxDepth})`,
                ErrorCode.RECURSION_LIMIT
            );
        }

        // Check compute pattern first
        const computeMatch = TemplateResolver.COMPUTE_PATTERN.exec(expression);
        if (computeMatch) {
            return this.resolveCompute(computeMatch, context, scope, propertyPath);
        }

        // Check template pattern
        const templateMatch = TemplateResolver.TEMPLATE_PATTERN.exec(expression);
        if (templateMatch) {
            return this.resolveTemplate(templateMatch, context);
        }

        // Not a template, return as-is
        return expression;
    }

    /**
     * Recursively resolve templates in an object (dict/list).
     *
     * @param obj - The object to resolve
     * @param context - Context object for variable lookup
     * @param scope - Resolution scope (STARTUP or REQUEST)
     * @param depth - Current recursion depth
     * @param currentPath - The current property path being traversed (e.g., "providers.gemini_openai")
     * @returns New object with all templates resolved
     */
    public async resolveObject(
        obj: any,
        context: Record<string, any>,
        scope: ComputeScope = ComputeScope.REQUEST,
        depth: number = 0,
        currentPath: string = ''
    ): Promise<any> {
        if (depth > this.maxDepth) {
            throw new RecursionLimitError(
                `Recursion limit reached (${this.maxDepth})`,
                ErrorCode.RECURSION_LIMIT
            );
        }

        if (Array.isArray(obj)) {
            return Promise.all(
                obj.map((item, i) => {
                    const newPath = currentPath ? `${currentPath}[${i}]` : `[${i}]`;
                    return this.resolveObject(item, context, scope, depth + 1, newPath);
                })
            );
        }

        if (obj !== null && typeof obj === 'object') {
            const newObj: Record<string, any> = {};
            for (const key of Object.keys(obj)) {
                const newPath = currentPath ? `${currentPath}.${key}` : key;
                newObj[key] = await this.resolveObject(obj[key], context, scope, depth + 1, newPath);
            }
            return newObj;
        }

        if (typeof obj === 'string') {
            return this.resolve(obj, context, scope, depth, currentPath);
        }

        // Pass through other types
        return obj;
    }

    /**
     * Resolve multiple expressions.
     *
     * @param expressions - Array of values to resolve
     * @param context - Context object for variable lookup
     * @param scope - Resolution scope
     * @returns Array of resolved values
     */
    public async resolveMany(
        expressions: any[],
        context: Record<string, any>,
        scope: ComputeScope = ComputeScope.REQUEST
    ): Promise<any[]> {
        return Promise.all(
            expressions.map(expr => this.resolve(expr, context, scope))
        );
    }

    /**
     * Access nested property via dot notation (Option 4 support).
     *
     * @param obj - The object to access (dict, object, or any with property access)
     * @param path - Dot-separated path e.g., "case_001" or "nested.value"
     * @returns The value at the path, or undefined if not found
     *
     * @example
     * const result = { tokens: { case_001: 'abc' } };
     * getNested(result, 'tokens.case_001');  // Returns 'abc'
     */
    private getNested(obj: any, path: string): any {
        if (obj == null || path == null) {
            return obj;
        }

        const keys = path.split('.');
        let current = obj;

        for (const key of keys) {
            if (current == null) {
                return undefined;
            }

            if (typeof current === 'object') {
                current = current[key];
            } else {
                return undefined;
            }
        }

        return current;
    }

    /**
     * Resolve a compute function expression with optional property access.
     *
     * Supports both:
     * - {{fn:function_name}} - Returns full result
     * - {{fn:function_name.property}} - Returns nested property (Option 4)
     *
     * @param match - Regex match object
     * @param context - Context object
     * @param scope - Resolution scope
     * @param targetPropertyPath - The path to the property being computed (e.g., "providers.gemini_openai.api_key")
     */
    private async resolveCompute(
        match: RegExpExecArray,
        context: Record<string, any>,
        scope: ComputeScope,
        targetPropertyPath?: string
    ): Promise<any> {
        const fnName = match[1];
        const fnPropertyPath = match[2];  // Optional property path for Option 4 (e.g., {{fn:name.property}})
        const defaultVal = match[4];    // Updated group number

        this.logger.debug(`Resolving compute: ${fnName}`, { fnPropertyPath, targetPropertyPath, default: defaultVal });

        if (!this.registry.has(fnName)) {
            if (defaultVal !== undefined) {
                return this.parseDefault(defaultVal);
            }
            if (this.missingStrategy === MissingStrategy.DEFAULT) {
                return undefined;
            }
            if (this.missingStrategy === MissingStrategy.IGNORE) {
                return match[0];
            }

            throw new ComputeFunctionError(
                `Compute function not found: ${fnName}`,
                ErrorCode.COMPUTE_FUNCTION_NOT_FOUND,
                { name: fnName }
            );
        }

        // Skip REQUEST-scoped functions during STARTUP
        const fnScope = this.registry.getScope(fnName);
        if (fnScope === ComputeScope.REQUEST && scope === ComputeScope.STARTUP) {
            this.logger.debug(
                `Skipping REQUEST scope function '${fnName}' during STARTUP`
            );
            return match[0]; // Return original template
        }

        try {
            // Pass the target property path to the compute function
            let result = await this.registry.resolve(fnName, context, targetPropertyPath);

            // Option 4: Apply property path if specified (for {{fn:name.property}})
            if (fnPropertyPath) {
                result = this.getNested(result, fnPropertyPath);
                if (result === undefined && defaultVal !== undefined) {
                    return this.parseDefault(defaultVal);
                }
            }

            return result;

        } catch (e: any) {
            if (defaultVal !== undefined) {
                this.logger.warn(
                    `Function ${fnName} failed, using default: ${e.message}`
                );
                return this.parseDefault(defaultVal);
            }
            throw e;
        }
    }

    /**
     * Resolve a template variable expression.
     */
    private resolveTemplate(
        match: RegExpExecArray,
        context: Record<string, any>
    ): any {
        const path = match[1];
        const defaultVal = match[3];

        this.logger.debug(`Resolving template: ${path}`, { default: defaultVal });

        // Validate path security
        if (path) {
            Security.validatePath(path);
        }

        // Traverse context to get value
        const value = path ? traversePath(context, path) : context;

        if (value === undefined || value === null) {
            if (defaultVal !== undefined) {
                return this.parseDefault(defaultVal);
            }
            if (this.missingStrategy === MissingStrategy.IGNORE) {
                return match[0];
            }
            // Return undefined for missing values if strategy is DEFAULT or path is empty
            return undefined;
        }

        return value;
    }

    /**
     * Parse a default value string, converting to appropriate type.
     */
    private parseDefault(val: string): any {
        if (val === 'true') return true;
        if (val === 'false') return false;
        if (val === 'null' || val === 'None') return null;

        // Try to parse as number
        const num = Number(val);
        if (!isNaN(num)) {
            return num;
        }

        return val;
    }
}

/**
 * Factory function to create a TemplateResolver.
 *
 * @param registry - ComputeRegistry for function resolution
 * @param options - Optional resolver configuration
 * @returns TemplateResolver instance
 */
export function createResolver(
    registry: ComputeRegistry,
    options?: ResolverOptions
): TemplateResolver {
    return new TemplateResolver(registry, options);
}
