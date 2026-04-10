import * as fs from 'fs/promises';
import * as yaml from 'js-yaml';
import { InitOptions, ILogger } from './types.js';
import { create as createLogger } from './logger.js';
import { ImmutabilityError } from './validators.js';

/**
 * Deep merge two objects. Override values take precedence over base values.
 * Arrays are replaced, not concatenated.
 */
function deepMerge(base: Record<string, any>, override: Record<string, any>): Record<string, any> {
    const result = structuredClone(base);
    for (const [key, value] of Object.entries(override)) {
        if (
            key in result &&
            typeof result[key] === 'object' &&
            result[key] !== null &&
            typeof value === 'object' &&
            value !== null &&
            !Array.isArray(value) &&
            !Array.isArray(result[key])
        ) {
            result[key] = deepMerge(result[key], value);
        } else {
            result[key] = structuredClone(value);
        }
    }
    return result;
}

export class AppYamlConfig {
    private static _instance: AppYamlConfig | null = null;
    private _config: Record<string, any> = {};
    private _originalConfigs: Map<string, Record<string, any>> = new Map();
    private _initialMergedConfig: Record<string, any> | null = null;
    private _logger: ILogger;

    private constructor(options: InitOptions) {
        if (AppYamlConfig._instance) {
            throw new Error("This class is a singleton!");
        }
        this._logger = options.logger || createLogger("app-yaml-static-config", "core.ts");
    }

    static async initialize(options: InitOptions): Promise<AppYamlConfig> {
        if (!AppYamlConfig._instance) {
            const normalizedOptions: InitOptions = {
                ...options,
                appEnv: options.appEnv?.toLowerCase()
            };
            const instance = new AppYamlConfig(normalizedOptions);
            await instance._loadConfig(normalizedOptions);
            AppYamlConfig._instance = instance;
        }
        return AppYamlConfig._instance!;
    }

    static getInstance(): AppYamlConfig {
        if (!AppYamlConfig._instance) {
            throw new Error("AppYamlConfig not initialized");
        }
        return AppYamlConfig._instance;
    }

    static _resetForTesting(): void {
        AppYamlConfig._instance = null;
    }

    private async _loadConfig(options: InitOptions): Promise<void> {
        this._logger.info("Initializing configuration", options.files);
        let mergedConfig: Record<string, any> = {};

        for (const filePath of options.files) {
            this._logger.debug(`Loading config file: ${filePath}`);
            try {
                const fileContent = await fs.readFile(filePath, 'utf8');
                const content = (yaml.load(fileContent) as Record<string, any>) || {};
                this._originalConfigs.set(filePath, structuredClone(content));
                mergedConfig = deepMerge(mergedConfig, content);
            } catch (error) {
                this._logger.error(`Failed to load user config: ${filePath}`, error);
                throw error;
            }
        }

        this._config = mergedConfig;
        this._mergeGlobalIntoProviders();
        this._initialMergedConfig = structuredClone(this._config);
        this._logger.info("Configuration initialized successfully");
    }

    /**
     * Merge global config into each provider's config.
     *
     * Global values serve as defaults that can be overridden by provider-specific values.
     */
    private _mergeGlobalIntoProviders(): void {
        const globalConfig = this._config.global;
        if (!globalConfig || Object.keys(globalConfig).length === 0) {
            return;
        }

        const providers = this._config.providers;
        if (!providers || Object.keys(providers).length === 0) {
            return;
        }

        for (const [providerName, providerConfig] of Object.entries(providers)) {
            if (providerConfig && typeof providerConfig === 'object') {
                this._config.providers[providerName] = deepMerge(globalConfig, providerConfig as Record<string, any>);
            }
        }

        this._logger.info(`Merged global config into ${Object.keys(providers).length} providers`);
    }

    get<T>(key: string, defaultValue?: T): T | undefined {
        const value = (this._config[key] as T) ?? defaultValue;
        return value !== null && value !== undefined && typeof value === 'object'
            ? structuredClone(value) : value;
    }

    getNested<T>(keys: string[], defaultValue?: T): T | undefined {
        let current: any = this._config;
        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                return defaultValue;
            }
        }
        return current !== null && current !== undefined && typeof current === 'object'
            ? structuredClone(current) : current;
    }

    getAll(): Record<string, any> {
        return structuredClone(this._config);
    }

    /**
     * Get the global app configuration from the 'global' key.
     *
     * Returns a deep copy of the global configuration object that contains
     * shared settings like client timeouts, display preferences, and network settings.
     *
     * @returns Record containing global configuration, or empty object if not present.
     */
    getGlobalAppConfig(): Record<string, any> {
        return structuredClone(this._config.global ?? {});
    }

    getOriginal(file?: string): Record<string, any> | undefined {
        if (file) {
            return structuredClone(this._originalConfigs.get(file));
        }
        return undefined;
    }

    // Note: getOriginalAll wasn't strictly typed in plan but implied parity. 
    // Adding for parity with Python implementation
    getOriginalAll(): Map<string, Record<string, any>> {
        return structuredClone(this._originalConfigs);
    }

    restore(): void {
        if (this._initialMergedConfig) {
            this._config = structuredClone(this._initialMergedConfig);
        }
    }

    // Immutability Stubs
    set(key: string, value: any): never {
        throw new ImmutabilityError("Configuration is immutable");
    }

    update(updates: Record<string, any>): never {
        throw new ImmutabilityError("Configuration is immutable");
    }

    reset(): never {
        throw new ImmutabilityError("Configuration is immutable");
    }

    clear(): never {
        throw new ImmutabilityError("Configuration is immutable");
    }
}
