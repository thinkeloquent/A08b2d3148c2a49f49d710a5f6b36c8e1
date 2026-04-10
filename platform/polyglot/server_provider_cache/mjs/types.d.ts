/**
 * TypeScript type definitions for server-provider-cache.
 */

// =============================================================================
// Log Levels
// =============================================================================

export declare const DEBUG: 10;
export declare const INFO: 20;
export declare const WARN: 30;
export declare const ERROR: 40;

// =============================================================================
// Logger
// =============================================================================

export interface ILogger {
    debug(message: string): void;
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
    child(instanceName: string): ILogger;
}

export declare class Logger implements ILogger {
    constructor(
        packageName: string,
        filename: string,
        instance?: string | null,
        level?: number,
        output?: (message: string) => void
    );
    debug(message: string): void;
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
    child(instanceName: string): Logger;
}

export interface CreateLoggerOptions {
    level?: number;
    output?: (message: string) => void;
}

export declare function createLogger(
    packageName: string,
    filename: string,
    options?: CreateLoggerOptions
): Logger;

// =============================================================================
// Constants
// =============================================================================

export declare const CacheNames: {
    readonly PROVIDERS: "providers";
    readonly SERVICES: "services";
    readonly CONFIG: "config";
    readonly SESSIONS: "sessions";
    readonly TOKENS: "tokens";
};

export type CacheName = (typeof CacheNames)[keyof typeof CacheNames];

export declare const DefaultTTLs: {
    readonly providers: 600;
    readonly services: 300;
    readonly config: 3600;
    readonly sessions: 1800;
    readonly tokens: 900;
};

export declare const DEFAULT_BACKEND: "memory";
export declare const DEFAULT_TTL: number;

// =============================================================================
// Backend Interface
// =============================================================================

export interface IBackend {
    get(key: string): Promise<any | undefined>;
    set(key: string, value: any, ttlMs: number): Promise<void>;
    del(key: string): Promise<void>;
    clear(): Promise<void>;
    keys(): Promise<string[]>;
    size(): Promise<number>;
    connect?(): Promise<void>;
    disconnect?(): Promise<void>;
}

// =============================================================================
// Memory Backend
// =============================================================================

export declare class MemoryBackend implements IBackend {
    constructor(name?: string);
    get(key: string): Promise<any | undefined>;
    set(key: string, value: any, ttlMs: number): Promise<void>;
    del(key: string): Promise<void>;
    clear(): Promise<void>;
    keys(): Promise<string[]>;
    size(): Promise<number>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
}

export declare function createMemoryBackend(name?: string): MemoryBackend;

// =============================================================================
// Redis Backend (Stub)
// =============================================================================

export interface RedisBackendOptions {
    url?: string;
    namespace?: string;
}

export declare class RedisBackend implements IBackend {
    constructor(name?: string, options?: RedisBackendOptions);
    get(key: string): Promise<any | undefined>;
    set(key: string, value: any, ttlMs: number): Promise<void>;
    del(key: string): Promise<void>;
    clear(): Promise<void>;
    keys(): Promise<string[]>;
    size(): Promise<number>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
}

export declare function createRedisBackend(
    name?: string,
    options?: RedisBackendOptions
): RedisBackend;

// =============================================================================
// Cache Service
// =============================================================================

export interface CacheServiceOptions {
    name: string;
    defaultTtl?: number;
    backend?: "memory" | "redis";
    namespace?: string;
    logger?: ILogger;
}

export interface ICacheService {
    readonly name: string;
    readonly defaultTtl: number;
    readonly backend: string;

    get<T = any>(key: string): Promise<T | undefined>;
    set<T = any>(key: string, value: T, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    clear(): Promise<void>;
    keys(): Promise<string[]>;
    size(): Promise<number>;
    getOrSet<T = any>(
        key: string,
        fetchFn: () => Promise<T>,
        ttl?: number
    ): Promise<T>;
    destroy(): Promise<void>;
}

export declare class CacheService implements ICacheService {
    constructor(options: CacheServiceOptions);
    readonly name: string;
    readonly defaultTtl: number;
    readonly backend: string;

    get<T = any>(key: string): Promise<T | undefined>;
    set<T = any>(key: string, value: T, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    clear(): Promise<void>;
    keys(): Promise<string[]>;
    size(): Promise<number>;
    getOrSet<T = any>(
        key: string,
        fetchFn: () => Promise<T>,
        ttl?: number
    ): Promise<T>;
    destroy(): Promise<void>;
}

export declare function createCacheService(
    options: CacheServiceOptions
): CacheService;

// =============================================================================
// Cache Factory
// =============================================================================

export interface FactoryDefaults {
    defaultTtl?: number;
    backend?: "memory" | "redis";
}

export interface FactoryOptions {
    defaults?: FactoryDefaults;
    logger?: ILogger;
}

export interface CreateCacheOptions {
    defaultTtl?: number;
    backend?: "memory" | "redis";
    namespace?: string;
}

export interface ICacheFactory {
    create(name: string, options?: CreateCacheOptions): ICacheService;
    get(name: string): ICacheService;
    has(name: string): boolean;
    destroy(name: string): Promise<void>;
    destroyAll(): Promise<void>;
    getNames(): string[];
    getCount(): number;
}

export declare class CacheFactory implements ICacheFactory {
    constructor(options?: FactoryOptions);
    create(name: string, options?: CreateCacheOptions): CacheService;
    get(name: string): CacheService;
    has(name: string): boolean;
    destroy(name: string): Promise<void>;
    destroyAll(): Promise<void>;
    getNames(): string[];
    getCount(): number;
}

export declare function createCacheFactory(options?: FactoryOptions): CacheFactory;

// =============================================================================
// SDK Convenience Functions
// =============================================================================

export interface CreateCacheSDKOptions {
    defaultTtl?: number;
    backend?: "memory" | "redis";
    namespace?: string;
}

export declare function createCache(
    name: string,
    options?: CreateCacheSDKOptions
): CacheService;

// =============================================================================
// Fastify Module Augmentation
// =============================================================================

declare module "fastify" {
    interface FastifyInstance {
        cache: ICacheFactory;
    }
}
