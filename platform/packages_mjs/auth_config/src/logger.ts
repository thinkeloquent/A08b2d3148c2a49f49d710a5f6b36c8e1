export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
    debug(message: string, meta?: Record<string, unknown>): void;
    info(message: string, meta?: Record<string, unknown>): void;
    warn(message: string, meta?: Record<string, unknown>): void;
    error(message: string, meta?: Record<string, unknown>): void;
}

const LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

export function createLogger(packageName: string, filename: string): Logger {
    const level = (process.env.LOG_LEVEL as LogLevel) || 'debug';
    const threshold = LOG_LEVELS[level] ?? LOG_LEVELS.debug;
    // Simple extracting filename from path if it's a full path
    const file = filename.split('/').pop() || filename;

    const log = (msgLevel: LogLevel, message: string, meta?: Record<string, unknown>) => {
        if (LOG_LEVELS[msgLevel] >= threshold) {
            const prefix = `[${packageName}:${file}]`;
            const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
            console[msgLevel](`${prefix} ${message}${metaStr}`);
        }
    };

    return {
        debug: (msg, meta) => log('debug', msg, meta),
        info: (msg, meta) => log('info', msg, meta),
        warn: (msg, meta) => log('warn', msg, meta),
        error: (msg, meta) => log('error', msg, meta),
    };
}
