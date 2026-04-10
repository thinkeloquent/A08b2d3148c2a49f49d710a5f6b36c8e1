import fs from 'fs';
import { PostgresConfigSchema } from './schemas.js';
import {
    DEFAULT_CONFIG,
    ENV_POSTGRES_HOST,
    ENV_POSTGRES_PORT,
    ENV_POSTGRES_USER,
    ENV_POSTGRES_PASSWORD,
    ENV_POSTGRES_DB,
    ENV_POSTGRES_SCHEMA,
    ENV_POSTGRES_SSL_MODE,
    ENV_POSTGRES_SSL_CA_FILE,
    ENV_POSTGRES_CONNECT_TIMEOUT,
    ENV_POSTGRES_MAX_CONNECTIONS,
} from './constants.js';
import type { SslMode } from './constants.js';
import { DatabaseConfigError } from './exceptions.js';
import { resolve, resolveInt } from '@internal/env-resolve';

export interface PostgresConfigOptions {
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    database?: string;
    schema?: string;
    sslMode?: string;
    sslCaCerts?: string | null;
    connectTimeout?: number;
    maxConnections?: number;
    [key: string]: unknown;
}

export interface SslOptions {
    require?: boolean;
    rejectUnauthorized?: boolean;
    ca?: string;
}

export interface DialectOptions {
    connectTimeout: number;
    ssl?: SslOptions;
}

export interface ConnectionConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    max: number;
    connectionTimeoutMillis: number;
    ssl?: SslOptions | false;
}

export class PostgresConfig {
    public readonly host: string;
    public readonly port: number;
    public readonly username: string;
    public readonly password: string;
    public readonly database: string;
    public readonly schema: string;
    public readonly sslMode: SslMode;
    public readonly sslCaCerts: string | null;
    public readonly connectTimeout: number;
    public readonly maxConnections: number;

    constructor(options: PostgresConfigOptions = {}) {
        this.host = resolve(options.host, ENV_POSTGRES_HOST, options, 'host', DEFAULT_CONFIG.host);
        this.port = resolveInt(options.port, ENV_POSTGRES_PORT, options, 'port', DEFAULT_CONFIG.port);
        this.username = resolve(options.username, ENV_POSTGRES_USER, options, 'username', DEFAULT_CONFIG.username);
        this.password = resolve(options.password, ENV_POSTGRES_PASSWORD, options, 'password', DEFAULT_CONFIG.password);
        this.database = resolve(options.database, ENV_POSTGRES_DB, options, 'database', DEFAULT_CONFIG.database);
        this.schema = resolve(options.schema, ENV_POSTGRES_SCHEMA, options, 'schema', DEFAULT_CONFIG.schema);
        this.sslMode = resolve(options.sslMode, ENV_POSTGRES_SSL_MODE, options, 'sslMode', DEFAULT_CONFIG.sslMode);

        // CA Certs might be file path in env, or content.
        let caCerts: string | null = resolve(options.sslCaCerts, ENV_POSTGRES_SSL_CA_FILE, options, 'sslCaCerts', DEFAULT_CONFIG.sslCaCerts);
        if (caCerts && fs.existsSync(caCerts)) {
            try {
                caCerts = fs.readFileSync(caCerts, 'utf8');
            } catch (_e) {
                // If failed to read, keep as is
            }
        }
        this.sslCaCerts = caCerts;

        this.connectTimeout = resolveInt(options.connectTimeout, ENV_POSTGRES_CONNECT_TIMEOUT, options, 'connectTimeout', DEFAULT_CONFIG.connectTimeout);
        this.maxConnections = resolveInt(options.maxConnections, ENV_POSTGRES_MAX_CONNECTIONS, options, 'maxConnections', DEFAULT_CONFIG.maxConnections);

        // Validate
        this.validate();
    }

    validate(): void {
        try {
            PostgresConfigSchema.parse(this);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            throw new DatabaseConfigError(`Invalid configuration: ${message}`);
        }
    }

    getSequelizeDialectOptions(): DialectOptions {
        const options: DialectOptions = {
            connectTimeout: this.connectTimeout,
        };

        if (this.sslMode !== 'disable') {
            const ssl: SslOptions = {};
            if (this.sslMode === 'require' || this.sslMode === 'verify-ca' || this.sslMode === 'verify-full') {
                ssl.require = true;
                if (this.sslMode === 'verify-full') {
                    // rejectUnauthorized = true is default but explicit is good.
                    ssl.rejectUnauthorized = true;
                } else {
                    // For verify-ca? Sequelize/pg doesn't distinguish finely between verify-ca and full easily without custom checking
                    // generally rejectUnauthorized=true enables CA check. Hostname check is implicit in strict mode?
                    // Let's stick to standard pg ssl keys.
                    ssl.rejectUnauthorized = true;
                }
            } else {
                ssl.rejectUnauthorized = false;
            }

            if (this.sslCaCerts) {
                ssl.ca = this.sslCaCerts;
            }

            options.ssl = ssl;
        }
        return options;
    }

    getConnectionUrl(): string {
        // Construct URL for debugging
        const protocol = 'postgres';
        return `${protocol}://${this.username}:***@${this.host}:${this.port}/${this.database}`;
    }

    getConnectionConfig(): ConnectionConfig {
        const config: ConnectionConfig = {
            host: this.host,
            port: this.port,
            user: this.username,
            password: this.password,
            database: this.database,
            max: this.maxConnections,
            connectionTimeoutMillis: this.connectTimeout,
        };

        if (this.sslMode === 'disable') {
            config.ssl = false;
        } else {
            const dialectOptions = this.getSequelizeDialectOptions();
            if (dialectOptions.ssl) {
                config.ssl = dialectOptions.ssl;
            }
        }

        return config;
    }
}
