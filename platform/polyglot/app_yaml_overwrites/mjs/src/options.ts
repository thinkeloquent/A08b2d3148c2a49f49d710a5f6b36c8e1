/**
 * Options and enums for app-yaml-overwrites package.
 */

import type { ILogger } from './logger.js';

/**
 * Scope for compute functions.
 * - STARTUP: Resolved once at server boot, cached for lifetime
 * - REQUEST: Resolved per HTTP request, no caching
 * - GLOBAL:  Resolved in both STARTUP and REQUEST scopes, never cached.
 *            At STARTUP the function runs without request context (ctx.request is null).
 *            At REQUEST the function runs with full request context (headers, query, etc.).
 */
export enum ComputeScope {
    STARTUP = 'STARTUP',
    REQUEST = 'REQUEST',
    GLOBAL = 'GLOBAL'
}

/**
 * Strategy for handling missing template values.
 * - ERROR: Raise exception on missing value
 * - DEFAULT: Use default value if provided
 * - IGNORE: Return original template string
 */
export enum MissingStrategy {
    ERROR = 'ERROR',
    DEFAULT = 'DEFAULT',
    IGNORE = 'IGNORE'
}

/**
 * Configuration options for the TemplateResolver.
 */
export interface ResolverOptions {
    maxDepth?: number;
    missingStrategy?: MissingStrategy;
    logger?: ILogger;
}

/**
 * Default resolver options.
 */
export const DEFAULT_RESOLVER_OPTIONS: Required<Omit<ResolverOptions, 'logger'>> & { logger: undefined } = {
    maxDepth: 10,
    missingStrategy: MissingStrategy.ERROR,
    logger: undefined
};
