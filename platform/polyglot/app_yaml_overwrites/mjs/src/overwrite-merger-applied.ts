/**
 * Overwrite Merger Applied Module for app-yaml-overwrites package.
 * Top-layer that handles merging of overwrite_from_context sections with template resolution.
 *
 * This module provides the complete flow:
 * 1. Extract overwrite_from_context section from config
 * 2. Resolve any {{...}} templates in that section using context
 * 3. Deep merge resolved values into original config (replacing null placeholders)
 * 4. Remove overwrite_from_context key from final result
 */

import { create, ILogger } from './logger.js';
import { TemplateResolver } from './template-resolver.js';
import { ComputeScope } from './options.js';

// Create module-level logger
const logger = create('app-yaml-overwrites', 'overwrite-merger-applied.ts');

/**
 * Options for the applied overwrite merger.
 */
export interface AppliedMergerOptions {
    /** Template resolver for {{...}} expressions */
    resolver: TemplateResolver;
    /** Custom logger */
    logger?: ILogger;
    /** Whether to remove overwrite_from_context key from result (default: true) */
    removeOverwriteKey?: boolean;
    /** Scope for template resolution (default: REQUEST) */
    scope?: ComputeScope;
}

/**
 * Deep merge that replaces null values in target with source values.
 *
 * @param target - Target object (may have null placeholders)
 * @param source - Source object with values to merge
 * @returns Merged object
 */
export function deepMergeWithNullReplace(target: any, source: any): any {
    if (source === null || source === undefined) {
        return target;
    }

    if (typeof target !== 'object' || target === null) {
        return source;
    }

    if (typeof source !== 'object') {
        return source;
    }

    // Arrays: Replace entirely
    if (Array.isArray(source)) {
        return [...source];
    }

    const output = { ...target };

    for (const key of Object.keys(source)) {
        const sourceValue = source[key];
        const targetValue = output[key];

        if (targetValue === null || targetValue === undefined) {
            // Replace null/undefined with source value
            output[key] = sourceValue;
        } else if (typeof sourceValue === 'object' && sourceValue !== null && !Array.isArray(sourceValue)) {
            // Recursive merge for objects
            output[key] = deepMergeWithNullReplace(targetValue, sourceValue);
        } else {
            // Direct replacement for primitives and arrays
            output[key] = sourceValue;
        }
    }

    return output;
}

/**
 * Apply overwrites from overwrite_from_context sections with template resolution.
 * Recursively processes all nested overwrite_from_context sections throughout the config tree.
 *
 * @param config - Original config object containing overwrite_from_context (at any level)
 * @param context - Context object for template resolution (request, env, etc.)
 * @param options - Merger options including resolver
 * @returns Config with resolved overwrites applied
 *
 * @example
 * ```typescript
 * const config = {
 *   providers: {
 *     my_provider: {
 *       headers: {
 *         "X-App-Name": null,
 *         "X-Request-Id": null
 *       },
 *       overwrite_from_context: {
 *         headers: {
 *           "X-App-Name": "MyApp",
 *           "X-Request-Id": "{{request.headers.x-request-id}}"
 *         }
 *       }
 *     }
 *   }
 * };
 *
 * const result = await applyOverwritesFromContext(config, context, { resolver });
 * // Result:
 * // {
 * //   providers: {
 * //     my_provider: {
 * //       headers: {
 * //         "X-App-Name": "MyApp",
 * //         "X-Request-Id": "actual-request-id-value"
 * //       }
 * //     }
 * //   }
 * // }
 * ```
 */
export async function applyOverwritesFromContext(
    config: any,
    context: Record<string, any>,
    options: AppliedMergerOptions
): Promise<any> {
    const mergerLogger = options.logger ?? logger;
    const scope = options.scope ?? ComputeScope.REQUEST;
    const removeKey = options.removeOverwriteKey ?? true;

    mergerLogger.debug('applyOverwritesFromContext called', {
        contextKeys: Object.keys(context)
    });

    async function processNode(node: any): Promise<any> {
        if (typeof node !== 'object' || node === null) {
            return node;
        }

        if (Array.isArray(node)) {
            const results: any[] = [];
            for (const item of node) {
                results.push(typeof item === 'object' && item !== null ? await processNode(item) : item);
            }
            return results;
        }

        let result: Record<string, any> = {};

        for (const key of Object.keys(node)) {
            if (key === 'overwrite_from_context') {
                // Skip - will be processed separately
                continue;
            }

            const value = node[key];
            if (typeof value === 'object' && value !== null) {
                result[key] = await processNode(value);
            } else {
                result[key] = value;
            }
        }

        // Check if this node has overwrite_from_context
        const overwriteSection = node.overwrite_from_context;
        if (overwriteSection && typeof overwriteSection === 'object') {
            mergerLogger.debug('Found overwrite_from_context section', {
                overwriteKeys: Object.keys(overwriteSection)
            });

            // Resolve templates in the overwrite section
            const resolvedOverwrites = await options.resolver.resolveObject(
                overwriteSection,
                context,
                scope
            );
            mergerLogger.debug('Templates resolved for overwrite section');

            // Deep merge resolved values into this node
            result = deepMergeWithNullReplace(result, resolvedOverwrites);

            // Keep overwrite_from_context key if removeKey is false
            if (!removeKey) {
                result.overwrite_from_context = resolvedOverwrites;
            }
        }

        return result;
    }

    const result = await processNode(config);
    mergerLogger.info('Overwrites applied successfully (recursive)');
    return result;
}

/**
 * Class-based applied merger for stateful operations.
 */
export class AppliedOverwriteMerger {
    private config: any;
    private resolver: TemplateResolver;
    private logger: ILogger;
    private removeOverwriteKey: boolean;

    constructor(config: any, options: AppliedMergerOptions) {
        this.config = JSON.parse(JSON.stringify(config)); // Deep clone
        this.resolver = options.resolver;
        this.logger = options.logger ?? logger;
        this.removeOverwriteKey = options.removeOverwriteKey ?? true;

        this.logger.debug('AppliedOverwriteMerger initialized', {
            configKeys: Object.keys(config),
            hasOverwriteSection: !!config.overwrite_from_context
        });
    }

    /**
     * Apply overwrites using the provided context.
     *
     * @param context - Context object for template resolution
     * @param scope - Resolution scope (default: REQUEST)
     * @returns Merged config with resolved overwrites
     */
    async apply(
        context: Record<string, any>,
        scope: ComputeScope = ComputeScope.REQUEST
    ): Promise<any> {
        this.config = await applyOverwritesFromContext(this.config, context, {
            resolver: this.resolver,
            logger: this.logger,
            removeOverwriteKey: this.removeOverwriteKey,
            scope
        });

        return this.config;
    }

    /**
     * Get the current config state.
     */
    getConfig(): any {
        return this.config;
    }
}

/**
 * Factory function to create an applied merger.
 */
export function createAppliedMerger(
    config: any,
    options: AppliedMergerOptions
): AppliedOverwriteMerger {
    return new AppliedOverwriteMerger(config, options);
}

/**
 * Apply already-resolved overwrite_from_context values to top-level config fields.
 *
 * This is a simple utility for use after SDK resolution has already resolved
 * template values inside overwrite_from_context. It copies those resolved values
 * to their corresponding top-level fields.
 *
 * Unlike applyOverwritesFromContext (which performs template resolution),
 * this function assumes templates are already resolved and simply copies values.
 *
 * @param config - Config object with resolved overwrite_from_context values
 * @returns Config with overwrite_from_context values applied to top-level fields
 *
 * @example
 * ```typescript
 * // After SDK resolution, overwrite_from_context contains resolved values:
 * const config = {
 *     base_url: "https://api.example.com",
 *     api_key: null,  // placeholder
 *     overwrite_from_context: {
 *         api_key: "resolved-api-key-value"  // resolved by SDK
 *     }
 * };
 *
 * const result = applyResolvedOverwrites(config);
 * // Result:
 * // {
 * //     base_url: "https://api.example.com",
 * //     api_key: "resolved-api-key-value",  // copied from overwrite_from_context
 * //     overwrite_from_context: {
 * //         api_key: "resolved-api-key-value"
 * //     }
 * // }
 * ```
 */
export function applyResolvedOverwrites<T extends Record<string, any>>(config: T | null | undefined): T {
    if (!config) {
        return (config || {}) as T;
    }

    let result = { ...config };

    // Apply overwrite_from_env: values are env var names, look up from process.env
    const envOverwrites = config.overwrite_from_env;
    if (envOverwrites && typeof envOverwrites === 'object') {
        for (const [key, envVarName] of Object.entries(envOverwrites)) {
            if (key in result && typeof envVarName === 'string') {
                const envValue = process.env[envVarName];
                if (envValue !== undefined) {
                    (result as any)[key] = envValue;
                }
            }
        }
    }

    // Apply overwrite_from_context: values are already-resolved template results
    const overwrites = config.overwrite_from_context;
    if (overwrites && typeof overwrites === 'object') {
        for (const [key, value] of Object.entries(overwrites)) {
            if (key in result) {
                (result as any)[key] = value;
            }
        }
    }

    return result;
}
