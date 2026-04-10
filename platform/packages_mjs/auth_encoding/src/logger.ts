export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LoggerOptions {
    level?: LogLevel;
}

export interface ILogger {
    debug(msg: string, ...args: unknown[]): void;
    info(msg: string, ...args: unknown[]): void;
    warn(msg: string, ...args: unknown[]): void;
    error(msg: string, ...args: unknown[]): void;
}

const LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
};

export function createLogger(
    packageName: string,
    filename: string,
    options?: LoggerOptions
): ILogger {
    const level = options?.level ?? (process.env.LOG_LEVEL as LogLevel) ?? 'debug';
    const threshold = LOG_LEVELS[level] ?? 0;
    const prefix = `[${packageName}:${filename}]`;

    const shouldLog = (msgLevel: LogLevel): boolean =>
        LOG_LEVELS[msgLevel] >= threshold;

    return {
        debug: (msg: string, ...args: unknown[]) =>
            shouldLog('debug') && console.debug(prefix, msg, ...args),
        info: (msg: string, ...args: unknown[]) =>
            shouldLog('info') && console.info(prefix, msg, ...args),
        warn: (msg: string, ...args: unknown[]) =>
            shouldLog('warn') && console.warn(prefix, msg, ...args),
        error: (msg: string, ...args: unknown[]) =>
            shouldLog('error') && console.error(prefix, msg, ...args),
    };
}

export const logger = { create: createLogger };
