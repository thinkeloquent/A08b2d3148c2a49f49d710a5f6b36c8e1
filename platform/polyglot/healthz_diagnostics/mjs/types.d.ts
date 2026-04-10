/**
 * Log level constants
 */
export declare const DEBUG: 10;
export declare const INFO: 20;
export declare const WARN: 30;
export declare const ERROR: 40;

/**
 * Logger interface
 */
export interface Logger {
    debug(message: string): void;
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
}

/**
 * Logger creation options
 */
export interface LoggerOptions {
    level?: number;
    output?: (message: string) => void;
}

/**
 * Create a logger instance for the given package and file.
 */
export declare function create(
    packageName: string,
    filename: string,
    options?: LoggerOptions
): Logger;

/**
 * Event captured during diagnostics.
 */
export interface DiagnosticEvent {
    type: string;
    timestamp: string; // ISO8601
    status?: number | null;
    error?: string | null;
    duration_ms?: number | null;
    metadata?: Record<string, any> | null;
}

/**
 * Result of a health check execution.
 */
export interface HealthCheckResult {
    provider: string;
    healthy: boolean;
    status_code?: number | null;
    latency_ms?: number | null;
    error?: string | null;
    endpoint?: string | null;
    model?: string | null;
    timestamp: string;
    diagnostics: DiagnosticEvent[];
    data?: any | null;
}

/**
 * Configuration for a provider.
 */
export interface ProviderConfig {
    base_url: string;
    health_endpoint?: string;
    method?: string;
    model?: string;
    endpoint_api_key?: string;
    [key: string]: any;
}

/**
 * Timestamp formatter
 */
export declare class TimestampFormatter {
    format(): string;
    formatFromEpoch(epochMs: number): string;
}

/**
 * Latency calculator
 */
export declare class LatencyCalculator {
    start(): void;
    stop(): void;
    getMs(): number;
    getSeconds(): number;
}

/**
 * Diagnostics collector
 */
export declare class DiagnosticsCollector {
    pushStart(url: string, method?: string): void;
    pushEnd(status: number): void;
    pushError(error: any): void;
    getEvents(): DiagnosticEvent[];
    getDuration(): number;
}

/**
 * Config sanitizer
 */
export declare class ConfigSanitizer {
    sanitize(config: Record<string, any>): Record<string, any>;
    checkEnvVars(varNames: string[]): Record<string, boolean>;
}

/**
 * Health check executor
 */
export type HttpClient = {
    request(method: string, url: string): Promise<any>;
    close(): Promise<void>;
};

export type HttpClientFactory = (config: Record<string, any>) => HttpClient;

export declare class HealthCheckExecutor {
    constructor(httpClientFactory: HttpClientFactory, logger?: Logger);
    execute(providerName: string, providerConfig: Record<string, any>): Promise<HealthCheckResult>;
}

/**
 * SDK
 */
export declare class HealthzDiagnosticsSDK {
    constructor(executor: HealthCheckExecutor);
    static create(httpClientFactory: HttpClientFactory): HealthzDiagnosticsSDK;
    checkHealth(providerName: string, providerConfig: Record<string, any>): Promise<HealthCheckResult>;
    sanitizeConfig(config: Record<string, any>): Record<string, any>;
    checkEnvVars(varNames: string[]): Record<string, boolean>;
    formatTimestamp(): string;
}
