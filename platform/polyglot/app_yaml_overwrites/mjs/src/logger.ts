
/**
 * Unified Logger Interface for App Yaml Overwrites.
 */
export interface ILogger {
    debug(message: string, data?: Record<string, any>): void;
    info(message: string, data?: Record<string, any>): void;
    warn(message: string, data?: Record<string, any>): void;
    error(message: string, data?: Record<string, any>): void;
    trace(message: string, data?: Record<string, any>): void;
}

class ConsoleLogger implements ILogger {
    private prefix: string;
    private currentLevel: number;
    private levels: Record<string, number> = {
        'trace': 0,
        'debug': 1,
        'info': 2,
        'warn': 3,
        'error': 4
    };

    constructor(packageName: string, filename: string) {
        this.prefix = `[${packageName}:${filename}]`;
        const envLevel = (process.env.LOG_LEVEL || 'info').toLowerCase();
        this.currentLevel = this.levels[envLevel] ?? 2;
    }

    private log(level: string, message: string, data?: Record<string, any>) {
        if (this.levels[level] < this.currentLevel) return;

        const timestamp = new Date().toISOString();
        const dataStr = data ? ` ${JSON.stringify(data)}` : '';
        const output = `${this.prefix} ${level.toUpperCase()}: ${message}${dataStr}`;

        switch (level) {
            case 'error':
                console.error(output);
                break;
            case 'warn':
                console.warn(output);
                break;
            default:
                console.log(output);
                break;
        }
    }

    debug(message: string, data?: Record<string, any>): void {
        this.log('debug', message, data);
    }

    info(message: string, data?: Record<string, any>): void {
        this.log('info', message, data);
    }

    warn(message: string, data?: Record<string, any>): void {
        this.log('warn', message, data);
    }

    error(message: string, data?: Record<string, any>): void {
        this.log('error', message, data);
    }

    trace(message: string, data?: Record<string, any>): void {
        this.log('trace', message, data);
    }
}

/**
 * Factory to create a logger instance.
 */
export function create(packageName: string, filename: string): ILogger {
    return new ConsoleLogger(packageName, filename);
}
