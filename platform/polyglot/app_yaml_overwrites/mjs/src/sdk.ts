/**
 * ConfigSDK Module for app-yaml-overwrites package.
 * Provides unified configuration access with template resolution.
 */

import { create, ILogger } from './logger.js';
import { ContextBuilder, ContextExtender, RequestLike } from './context-builder.js';
import { applyOverwrites } from './overwrite-merger.js';
import { deepMergeWithNullReplace } from './overwrite-merger-applied.js';
import { ComputeScope, MissingStrategy, ResolverOptions } from './options.js';
import { ComputeRegistry, createRegistry, ComputeFunction } from './compute-registry.js';
import { TemplateResolver, createResolver } from './template-resolver.js';

// Create module-level logger
const logger = create('app-yaml-overwrites', 'sdk.ts');

// Re-export RequestLike for external use
export type { RequestLike };

// Re-export ComputeScope for convenience
export { ComputeScope };

/**
 * Optional external config provider interface.
 * Implementations can provide config from various sources (YAML files, env, etc.)
 */
interface ConfigProvider {
    getAll(): any;
}

export interface ConfigSDKOptions {
    /** Initial config object (alternative to configProvider) */
    config?: any;
    /** External config provider (e.g., AppYamlConfig) */
    configProvider?: ConfigProvider;
    /** Directory for config files (reserved for future use) */
    configDir?: string;
    /** Path to single config file (reserved for future use) */
    configPath?: string;
    /** Context extenders for building resolution context */
    contextExtenders?: ContextExtender[];
    /** Application environment (dev, prod, etc.) */
    env?: string;
    /** Reserved for future schema validation */
    validateSchema?: boolean;
    /** Pre-configured compute registry (optional) */
    registry?: ComputeRegistry;
    /** Resolver options for template resolution */
    resolverOptions?: ResolverOptions;
    /** Missing strategy for unresolved templates */
    missingStrategy?: MissingStrategy;
    /** Max recursion depth for nested templates */
    maxDepth?: number;
}

export class ConfigSDK {
    private static instance: ConfigSDK | undefined;
    private logger: ILogger;
    private configProvider?: ConfigProvider;
    private contextExtenders: ContextExtender[];

    // State
    private rawConfig: any;
    private initialized: boolean = false;

    // Resolution components
    private registry: ComputeRegistry;
    private resolver: TemplateResolver;
    private resolverOptions: ResolverOptions;

    constructor(options: ConfigSDKOptions = {}) {
        this.logger = create('config-sdk', 'sdk.ts');
        this.logger.debug('ConfigSDK constructor called');

        this.contextExtenders = options.contextExtenders || [];
        this.configProvider = options.configProvider;

        // Initialize registry (use provided or create new)
        this.registry = options.registry || createRegistry(this.logger);
        this.logger.debug('ComputeRegistry initialized');

        // Setup resolver options
        this.resolverOptions = options.resolverOptions || {
            logger: this.logger,
            maxDepth: options.maxDepth ?? 10,
            missingStrategy: options.missingStrategy ?? MissingStrategy.ERROR
        };

        // Initialize template resolver
        this.resolver = createResolver(this.registry, this.resolverOptions);
        this.logger.debug('TemplateResolver initialized');

        // Allow direct config injection
        if (options.config) {
            this.rawConfig = options.config;
        }
    }

    // Recommendation 1: Async Initialize
    public static async initialize(options: ConfigSDKOptions = {}): Promise<ConfigSDK> {
        if (ConfigSDK.instance) {
            return ConfigSDK.instance;
        }

        const sdk = new ConfigSDK(options);
        await sdk.bootstrap(options);
        ConfigSDK.instance = sdk;
        return sdk;
    }

    public static getInstance(): ConfigSDK {
        if (!ConfigSDK.instance) {
            throw new Error("ConfigSDK not initialized. Call initialize() first.");
        }
        return ConfigSDK.instance;
    }

    public async bootstrap(options: ConfigSDKOptions = {}) {
        this.logger.debug("Bootstrapping ConfigSDK...");

        try {
            // Load config from provider if available and not already set
            if (!this.rawConfig && this.configProvider) {
                this.logger.debug("Loading config from provider...");
                this.rawConfig = this.configProvider.getAll();
            }

            // Default to empty config if none provided
            if (!this.rawConfig) {
                this.rawConfig = {};
                this.logger.debug("No config provided, using empty config");
            }

            this.logger.debug(`Raw config loaded, keys: ${Object.keys(this.rawConfig).length}`);
            this.initialized = true;
            this.logger.debug("Bootstrap complete, initialized=true");
        } catch (err: any) {
            this.logger.error(`Bootstrap failed: ${err.message}`);
            throw err;
        }
    }

    public getRaw(): any {
        return this.rawConfig;
    }

    public async getResolved(scope: ComputeScope, request?: RequestLike): Promise<any> {
        if (!this.initialized) throw new Error("SDK not initialized");

        this.logger.debug('getResolved called', { scope });

        // Build context for resolution
        const builder = new ContextBuilder(this.logger);
        builder.withConfig(this.rawConfig)
            .withAppConfig(this.rawConfig.app || {})
            .withRequest(request || {});

        this.contextExtenders.forEach(ext => builder.addExtender(ext));

        const context = await builder.build();
        this.logger.debug('Context built', { contextKeys: Object.keys(context) });

        // Resolve all templates in configuration
        const resolved = await this.resolver.resolveObject(
            this.rawConfig,
            context,
            scope
        );
        this.logger.debug('Templates resolved');

        // Recursively apply nested overwrite_from_context sections.
        // Templates inside overwrite_from_context are already resolved by
        // resolveObject above; this step merges those resolved values into
        // their parent nodes (replacing null placeholders).
        return ConfigSDK.applyNestedOverwrites(resolved);
    }

    /**
     * Recursively walk the config tree and merge every
     * overwrite_from_context section into its parent node.
     *
     * This handles nested overwrites at any depth (e.g.
     * providers.gemini_openai.overwrite_from_context) that the
     * old top-level-only applyOverwrites() missed.
     */
    private static applyNestedOverwrites(config: any): any {
        if (config === null || config === undefined || typeof config !== 'object') {
            return config;
        }

        if (Array.isArray(config)) {
            return config.map(item =>
                (item !== null && typeof item === 'object')
                    ? ConfigSDK.applyNestedOverwrites(item)
                    : item
            );
        }

        let result: Record<string, any> = {};
        for (const key of Object.keys(config)) {
            if (key === 'overwrite_from_context' || key === 'overwrite_from_env') {
                continue; // processed below
            }
            const value = config[key];
            if (value !== null && typeof value === 'object') {
                result[key] = ConfigSDK.applyNestedOverwrites(value);
            } else {
                result[key] = value;
            }
        }

        // Apply overwrite_from_env: values are env var names, look up from process.env
        const envOverwriteSection = config.overwrite_from_env;
        if (envOverwriteSection && typeof envOverwriteSection === 'object') {
            const resolved: Record<string, any> = {};
            for (const [key, envVarName] of Object.entries(envOverwriteSection)) {
                if (typeof envVarName === 'string') {
                    const envValue = process.env[envVarName];
                    if (envValue !== undefined) {
                        resolved[key] = envValue;
                    }
                }
            }
            result = deepMergeWithNullReplace(result, resolved);
            // Preserve the overwrite_from_env section for diagnostics
            result.overwrite_from_env = envOverwriteSection;
        }

        // Apply overwrite_from_context: templates already resolved by resolveObject
        const overwriteSection = config.overwrite_from_context;
        if (overwriteSection && typeof overwriteSection === 'object') {
            result = deepMergeWithNullReplace(result, overwriteSection);
            // Preserve the overwrite_from_context section for diagnostics
            result.overwrite_from_context = overwriteSection;
        }

        return result;
    }

    public async toJSON(options: { maskSecrets?: boolean } = {}): Promise<any> {
        // Basic export
        return this.getRaw();
    }

    /**
     * Build a resolution context for a request.
     *
     * @param request - The request object (RequestLike)
     * @returns Context dictionary
     */
    public async buildRequestContext(request?: RequestLike): Promise<any> {
        const builder = new ContextBuilder(this.logger);
        builder.withConfig(this.rawConfig)
            .withAppConfig(this.rawConfig.app || {})
            .withRequest(request || {});

        this.contextExtenders.forEach(ext => builder.addExtender(ext));

        return builder.build();
    }


    // SDK Query Interface
    public getProvider(name: string, defaultValue: any = null): any {
        return this.rawConfig?.providers?.[name] ?? defaultValue;
    }

    public getService(name: string, defaultValue: any = null): any {
        return this.rawConfig?.services?.[name] ?? defaultValue;
    }

    public getStorage(name: string, defaultValue: any = null): any {
        return this.rawConfig?.storage?.[name] ?? defaultValue;
    }

    public get(path: string, defaultValue: any = null): any {
        const keys = path.split('.');
        let val = this.rawConfig;
        for (const key of keys) {
            if (val && typeof val === 'object') {
                val = val[key];
            } else {
                return defaultValue;
            }
            if (val === undefined) return defaultValue;
        }
        return val ?? defaultValue;
    }

    /**
     * Resolve a single template expression.
     *
     * @param template - The template string to resolve
     * @param context - Optional context for resolution
     * @param scope - Resolution scope (defaults to REQUEST)
     * @returns Resolved value
     */
    public async resolveTemplate(
        template: string,
        context?: any,
        scope: ComputeScope = ComputeScope.REQUEST
    ): Promise<any> {
        this.logger.debug(`Resolving template: ${template}`);
        const resolveContext = context || this.rawConfig;
        return this.resolver.resolve(template, resolveContext, scope);
    }

    /**
     * Register a compute function for use in templates.
     *
     * @param name - Function name (used as {{fn:name}})
     * @param fn - The function to register
     * @param scope - STARTUP (cached) or REQUEST (per-call)
     */
    public registerCompute(
        name: string,
        fn: ComputeFunction,
        scope: ComputeScope = ComputeScope.REQUEST
    ): void {
        this.logger.debug(`Registering compute function: ${name} with scope: ${scope}`);
        this.registry.register(name, fn, scope);
    }

    /**
     * Unregister a compute function.
     *
     * @param name - Function name to unregister
     * @returns True if function was unregistered
     */
    public unregisterCompute(name: string): boolean {
        this.logger.debug(`Unregistering compute function: ${name}`);
        return this.registry.unregister(name);
    }

    /**
     * Get the compute registry for direct access.
     */
    public getRegistry(): ComputeRegistry {
        return this.registry;
    }

    /**
     * Get the template resolver for direct access.
     */
    public getResolver(): TemplateResolver {
        return this.resolver;
    }

    // Standalone Factories
    public static async fromFiles(files: string[], logger?: ILogger): Promise<ConfigSDK> {
        const sdk = new ConfigSDK();
        await sdk.bootstrap({});
        return sdk;
    }

    public static async fromDirectory(dir: string, options: { env?: string, logger?: ILogger } = {}): Promise<ConfigSDK> {
        const sdk = new ConfigSDK();
        await sdk.bootstrap({ configDir: dir, env: options.env });
        return sdk;
    }

    /**
     * Reset the singleton instance (primarily for testing).
     */
    public static resetInstance(): void {
        ConfigSDK.instance = undefined;
    }
}

/**
 * Factory function to create and initialize a new ConfigSDK instance.
 *
 * @param options - Configuration options
 * @returns Initialized ConfigSDK instance
 */
export async function createSdk(options: ConfigSDKOptions = {}): Promise<ConfigSDK> {
    const sdk = new ConfigSDK(options);
    await sdk.bootstrap(options);
    return sdk;
}
