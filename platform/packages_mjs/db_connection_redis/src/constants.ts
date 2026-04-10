// Environment Variable Keys
export const ENV_REDIS_HOST: string[] = ['REDIS_HOST', 'REDIS_HOSTNAME'];
export const ENV_REDIS_PORT: string[] = ['REDIS_PORT'];
export const ENV_REDIS_USERNAME: string[] = ['REDIS_USERNAME', 'REDIS_USER'];
export const ENV_REDIS_PASSWORD: string[] = ['REDIS_PASSWORD', 'REDIS_AUTH'];
export const ENV_REDIS_DB: string[] = ['REDIS_DB', 'REDIS_DATABASE'];
export const ENV_REDIS_SSL: string[] = ['REDIS_SSL', 'REDIS_USE_SSL', 'REDIS_USE_TLS', 'REDIS_TLS'];
export const ENV_REDIS_SSL_CERT_REQS: string[] = ['REDIS_SSL_CERT_REQS'];
export const ENV_REDIS_SSL_CA_CERTS: string[] = ['REDIS_SSL_CA_CERTS'];
export const ENV_REDIS_SSL_CHECK_HOSTNAME: string[] = ['REDIS_SSL_CHECK_HOSTNAME'];
export const ENV_REDIS_SOCKET_TIMEOUT: string[] = ['REDIS_SOCKET_TIMEOUT'];
export const ENV_REDIS_SOCKET_CONNECT_TIMEOUT: string[] = ['REDIS_SOCKET_CONNECT_TIMEOUT'];
export const ENV_REDIS_MAX_CONNECTIONS: string[] = ['REDIS_MAX_CONNECTIONS'];
export const ENV_REDIS_MIN_CONNECTIONS: string[] = ['REDIS_MIN_CONNECTIONS'];

export interface DefaultRedisConfig {
    host: string;
    port: number;
    username: null;
    password: null;
    db: number;
    useSsl: boolean;
    sslCertReqs: string;
    sslCaCerts: null;
    sslCheckHostname: boolean;
    socketTimeout: number;
    socketConnectTimeout: number;
    retryOnTimeout: boolean;
    maxConnections: number;
    minConnections: number;
    healthCheckInterval: number;
}

export const DEFAULT_CONFIG: DefaultRedisConfig = {
    host: 'localhost',
    port: 6379,
    username: null,
    password: null,
    db: 0,
    useSsl: false,
    sslCertReqs: 'none',
    sslCaCerts: null,
    sslCheckHostname: false,
    socketTimeout: 5000,
    socketConnectTimeout: 5000,
    retryOnTimeout: false,
    maxConnections: 10,
    minConnections: 0,
    healthCheckInterval: 0,
};

export const VALID_VENDORS = [
    'aws-elasticache',
    'redis-cloud',
    'upstash',
    'digital-ocean',
    'on-prem',
] as const;

export type ValidVendor = (typeof VALID_VENDORS)[number];
