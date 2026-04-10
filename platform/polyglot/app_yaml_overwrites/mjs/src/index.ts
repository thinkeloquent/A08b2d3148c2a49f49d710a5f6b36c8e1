/**
 * app-yaml-overwrites package
 * Provides configuration overwrite resolution with template support.
 */

// SDK and main exports
export { ConfigSDK, ConfigSDK as SDK, ConfigSDKOptions, createSdk } from './sdk.js';
export { create as createLogger, ILogger } from './logger.js';

// Options and enums
export { ComputeScope, MissingStrategy, ResolverOptions } from './options.js';
// Alias for backwards compatibility
export { ComputeScope as ConfigScope } from './options.js';

// Error types
export {
    ErrorCode,
    ResolveError,
    ComputeFunctionError,
    SecurityError,
    RecursionLimitError,
    ScopeViolationError,
    ValidationError,
    ImmutabilityError
} from './errors.js';

// Core resolution engine
export { TemplateResolver, createResolver } from './template-resolver.js';
export { ComputeRegistry, createRegistry, ComputeFunction, RegisteredFunction } from './compute-registry.js';
export { PathParser, PathSegment, parsePath, traversePath } from './path-parser.js';
export { Security, validatePath, isSafePath } from './security.js';

// Overwrite merging
export { applyOverwrites, IOverwriteMerger, OverwriteMerger } from './overwrite-merger.js';

// Overwrite merging with template resolution
export {
    applyOverwritesFromContext,
    applyResolvedOverwrites,
    deepMergeWithNullReplace,
    AppliedOverwriteMerger,
    createAppliedMerger,
    AppliedMergerOptions
} from './overwrite-merger-applied.js';

// Context building
export { ContextBuilder, RequestLike, ContextExtender } from './context-builder.js';

// Shared context for computed functions (Option 5)
export { SharedContext, createSharedContext } from './shared-context.js';

// Fastify integration (from integrations submodule)
export {
    configPlugin,
    createConfigPlugin,
    getConfig,
    ConfigPluginOptions,
    // Legacy aliases
    fastifyConfigSdk,
    FastifyConfigSdkOptions
} from './integrations/fastify.js';
