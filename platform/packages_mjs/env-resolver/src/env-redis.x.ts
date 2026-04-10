import { resolve, resolveBool, resolveInt } from '@internal/env-resolve';

export interface RedisEnv {
    host: string;
    port: number;
    username: string | undefined;
    password: string | undefined;
    db: number;
    url: string | undefined;
    ssl: boolean;
    sslCertReqs: string;
    sslCaCerts: string | undefined;
    sslCheckHostname: boolean;
    socketTimeout: number;
    socketConnectTimeout: number;
    maxConnections: number;
    minConnections: number;
    cacheDefaultTtl: number;
    cacheBackend: string;
}

export function resolveRedisEnv(config?: Record<string, any>): RedisEnv {
    return {
        host: resolve(undefined, ['REDIS_HOST', 'REDIS_HOSTNAME'], config, 'host', 'localhost'),
        port: resolveInt(undefined, ['REDIS_PORT'], config, 'port', 6379),
        username: resolve(undefined, ['REDIS_USERNAME', 'REDIS_USER'], config, 'username', undefined),
        password: resolve(undefined, ['REDIS_PASSWORD', 'REDIS_AUTH'], config, 'password', undefined),
        db: resolveInt(undefined, ['REDIS_DB', 'REDIS_DATABASE'], config, 'db', 0),
        url: resolve(undefined, ['REDIS_URL'], config, 'url', undefined),
        ssl: resolveBool(undefined, ['REDIS_SSL', 'REDIS_USE_SSL', 'REDIS_USE_TLS', 'REDIS_TLS'], config, 'ssl', false),
        sslCertReqs: resolve(undefined, ['REDIS_SSL_CERT_REQS'], config, 'sslCertReqs', 'none'),
        sslCaCerts: resolve(undefined, ['REDIS_SSL_CA_CERTS'], config, 'sslCaCerts', undefined),
        sslCheckHostname: resolveBool(undefined, ['REDIS_SSL_CHECK_HOSTNAME'], config, 'sslCheckHostname', false),
        socketTimeout: resolveInt(undefined, ['REDIS_SOCKET_TIMEOUT'], config, 'socketTimeout', 5000),
        socketConnectTimeout: resolveInt(undefined, ['REDIS_SOCKET_CONNECT_TIMEOUT'], config, 'socketConnectTimeout', 5000),
        maxConnections: resolveInt(undefined, ['REDIS_MAX_CONNECTIONS'], config, 'maxConnections', 10),
        minConnections: resolveInt(undefined, ['REDIS_MIN_CONNECTIONS'], config, 'minConnections', 0),
        cacheDefaultTtl: resolveInt(undefined, ['CACHE_DEFAULT_TTL'], config, 'cacheDefaultTtl', 300),
        cacheBackend: resolve(undefined, ['CACHE_BACKEND'], config, 'cacheBackend', 'memory'),
    };
}
