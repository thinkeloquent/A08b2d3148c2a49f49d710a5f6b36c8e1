import { resolve, resolveBool, resolveInt } from '@internal/env-resolve';

export interface PostgresqlEnv {
    host: string;
    port: number;
    user: string;
    password: string | undefined;
    database: string;
    url: string | undefined;
    schema: string;
    sslMode: string;
    sslCaFile: string | undefined;
    sslCheckHostname: boolean;
    poolSize: number;
    connectTimeout: number;
    maxOverflow: number;
    poolTimeout: number;
    poolRecycle: number;
    logging: boolean;
    verbose: boolean;
    logQueryParameters: boolean;
    echo: boolean;
}

export function resolvePostgresqlEnv(config?: Record<string, any>): PostgresqlEnv {
    return {
        host: resolve(undefined, ['POSTGRES_HOST', 'POSTGRES_HOSTNAME', 'DATABASE_HOST'], config, 'host', 'localhost'),
        port: resolveInt(undefined, ['POSTGRES_PORT', 'DATABASE_PORT'], config, 'port', 5432),
        user: resolve(undefined, ['POSTGRES_USER', 'POSTGRES_USERNAME', 'DATABASE_USER'], config, 'user', 'postgres'),
        password: resolve(undefined, ['POSTGRES_PASSWORD', 'DATABASE_PASSWORD'], config, 'password', undefined),
        database: resolve(undefined, ['POSTGRES_DB', 'POSTGRES_DATABASE', 'DATABASE_NAME'], config, 'database', 'postgres'),
        url: resolve(undefined, ['DATABASE_URL'], config, 'url', undefined),
        schema: resolve(undefined, ['POSTGRES_SCHEMA', 'DATABASE_SCHEMA'], config, 'schema', 'public'),
        sslMode: resolve(undefined, ['POSTGRES_SSL_MODE', 'DATABASE_SSL_MODE', 'POSTGRES_SSLMODE'], config, 'sslMode', 'prefer'),
        sslCaFile: resolve(undefined, ['POSTGRES_SSL_CA_FILE', 'POSTGRES_SSL_CA_CERTS'], config, 'sslCaFile', undefined),
        sslCheckHostname: resolveBool(undefined, ['POSTGRES_SSL_CHECK_HOSTNAME'], config, 'sslCheckHostname', true),
        poolSize: resolveInt(undefined, ['POSTGRES_POOL_SIZE', 'DATABASE_POOL_SIZE'], config, 'poolSize', 5),
        connectTimeout: resolveInt(undefined, ['POSTGRES_CONNECT_TIMEOUT'], config, 'connectTimeout', 30000),
        maxOverflow: resolveInt(undefined, ['POSTGRES_MAX_OVERFLOW', 'DATABASE_MAX_OVERFLOW'], config, 'maxOverflow', 10),
        poolTimeout: resolveInt(undefined, ['POSTGRES_POOL_TIMEOUT', 'DATABASE_POOL_TIMEOUT'], config, 'poolTimeout', 30),
        poolRecycle: resolveInt(undefined, ['POSTGRES_POOL_RECYCLE', 'DATABASE_POOL_RECYCLE'], config, 'poolRecycle', 3600),
        logging: resolveBool(undefined, ['SEQUELIZE_LOGGING'], config, 'logging', false),
        verbose: resolveBool(undefined, ['SEQUELIZE_VERBOSE', 'CI_SEQUELIZE_VERBOSE'], config, 'verbose', false),
        logQueryParameters: resolveBool(undefined, ['SEQUELIZE_LOG_QUERY_PARAMETERS'], config, 'logQueryParameters', false),
        echo: resolveBool(undefined, ['POSTGRES_ECHO', 'DATABASE_ECHO'], config, 'echo', false),
    };
}
