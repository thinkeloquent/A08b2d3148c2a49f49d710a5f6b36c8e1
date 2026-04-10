/**
 * TypeScript definitions for App YAML Endpoints.
 */

// Logger
export interface LogContext {
    pkg: string;
    file: string;
}

export type LogHandler = (level: string, msg: string, data: Record<string, unknown> | null, ctx: LogContext) => void;

export declare class Logger {
    constructor(pkg: string, filename: string, handler?: LogHandler | null, level?: string, jsonOutput?: boolean);
    trace(msg: string, data?: Record<string, unknown> | null): void;
    debug(msg: string, data?: Record<string, unknown> | null): void;
    info(msg: string, data?: Record<string, unknown> | null): void;
    warn(msg: string, data?: Record<string, unknown> | null): void;
    error(msg: string, data?: Record<string, unknown> | null): void;
}

export declare class LoggerFactory {
    static create(pkg: string, filename: string, handler?: LogHandler | null, level?: string | null, jsonOutput?: boolean | null): Logger;
}

// Models
export interface EndpointConfig {
    key: string;
    name: string;
    tags: string[];
    baseUrl: string;
    description: string;
    method: string;
    headers: Record<string, string>;
    timeout: number;
    bodyType: 'json' | 'text';
}

export interface FetchConfig {
    serviceId: string;
    url: string;
    method: string;
    headers: Record<string, string>;
    body: string;
    headersTimeout: number;
}

export declare function createEndpointConfig(data: Record<string, unknown>, key?: string): EndpointConfig;
export declare function createFetchConfig(opts: {
    serviceId: string;
    url: string;
    method: string;
    headers: Record<string, string>;
    body: string;
    timeout: number;
}): FetchConfig;

// Config
export declare class ConfigError extends Error {
    serviceId: string | null;
    available: string[];
    constructor(message: string, serviceId?: string | null, available?: string[]);
}

export declare function loadConfigFromFile(filePath: string): Record<string, unknown>;
export declare function loadConfig(config: Record<string, unknown>): Record<string, unknown>;
export declare function getConfig(): Record<string, unknown>;
export declare function listEndpoints(): string[];
export declare function getEndpoint(serviceId: string): EndpointConfig | null;
export declare function resolveIntent(intent: string): string;
export declare function getFetchConfig(serviceId: string, payload: unknown, customHeaders?: Record<string, string> | null): FetchConfig;

// SDK
export declare class EndpointConfigSDK {
    constructor(options?: { filePath?: string });
    properties(path: string, defaultValue?: unknown): unknown;
    getByKey(key: string): EndpointConfig | null;
    resolveIntent(intent: string): { key: string; endpoint: EndpointConfig | null };
    loadConfig(configObj: Record<string, unknown>): Record<string, unknown>;
    refreshConfig(): Record<string, unknown>;
    getByName(name: string): EndpointConfig | null;
    getAll(): EndpointConfig[];
    getByTag(tag: string): EndpointConfig[];
    loadFromFile(filePath: string): Record<string, unknown>;
    listKeys(): string[];
    getFetchConfig(serviceId: string, payload: unknown, customHeaders?: Record<string, string> | null): FetchConfig;
}

export declare function createEndpointConfigSDK(options?: { filePath?: string }): EndpointConfigSDK;

export declare const VERSION: string;
