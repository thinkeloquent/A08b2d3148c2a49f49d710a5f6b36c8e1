import { resolve, resolveBool, resolveInt } from '@internal/env-resolve';

export interface ElasticsearchEnv {
    vendorType: string;
    host: string;
    port: number;
    scheme: string;
    cloudId: string | undefined;
    index: string | undefined;
    apiKey: string | undefined;
    username: string | undefined;
    password: string | undefined;
    accessKey: string | undefined;
    apiAuthType: string | undefined;
    useTls: boolean;
    verifyCerts: boolean;
    sslShowWarn: boolean;
    caCerts: string | undefined;
    clientCert: string | undefined;
    clientKey: string | undefined;
    requestTimeout: number;
    connectTimeout: number;
    maxRetries: number;
    retryOnTimeout: boolean;
    verifyClusterConnection: boolean;
}

export function resolveElasticsearchEnv(config?: Record<string, any>): ElasticsearchEnv {
    return {
        vendorType: resolve(undefined, ['ELASTIC_DB_VENDOR_TYPE'], config, 'vendorType', 'on-prem'),
        host: resolve(undefined, ['ELASTIC_DB_HOST'], config, 'host', 'localhost'),
        port: resolveInt(undefined, ['ELASTIC_DB_PORT'], config, 'port', 9200),
        scheme: resolve(undefined, ['ELASTIC_DB_SCHEME'], config, 'scheme', 'https'),
        cloudId: resolve(undefined, ['ELASTIC_DB_CLOUD_ID'], config, 'cloudId', undefined),
        index: resolve(undefined, ['ELASTIC_DB_INDEX'], config, 'index', undefined),
        apiKey: resolve(undefined, ['ELASTIC_DB_API_KEY'], config, 'apiKey', undefined),
        username: resolve(undefined, ['ELASTIC_DB_USERNAME'], config, 'username', undefined),
        password: resolve(undefined, ['ELASTIC_DB_PASSWORD'], config, 'password', undefined),
        accessKey: resolve(undefined, ['ELASTIC_DB_ACCESS_KEY'], config, 'accessKey', undefined),
        apiAuthType: resolve(undefined, ['ELASTIC_DB_API_AUTH_TYPE'], config, 'apiAuthType', undefined),
        useTls: resolveBool(undefined, ['ELASTIC_DB_USE_TLS'], config, 'useTls', false),
        verifyCerts: resolveBool(undefined, ['ELASTIC_DB_VERIFY_CERTS'], config, 'verifyCerts', false),
        sslShowWarn: resolveBool(undefined, ['ELASTIC_DB_SSL_SHOW_WARN'], config, 'sslShowWarn', false),
        caCerts: resolve(undefined, ['ELASTIC_DB_CA_CERTS'], config, 'caCerts', undefined),
        clientCert: resolve(undefined, ['ELASTIC_DB_CLIENT_CERT'], config, 'clientCert', undefined),
        clientKey: resolve(undefined, ['ELASTIC_DB_CLIENT_KEY'], config, 'clientKey', undefined),
        requestTimeout: resolveInt(undefined, ['ELASTIC_DB_REQUEST_TIMEOUT'], config, 'requestTimeout', 30000),
        connectTimeout: resolveInt(undefined, ['ELASTIC_DB_CONNECT_TIMEOUT'], config, 'connectTimeout', 10000),
        maxRetries: resolveInt(undefined, ['ELASTIC_DB_MAX_RETRIES'], config, 'maxRetries', 3),
        retryOnTimeout: resolveBool(undefined, ['ELASTIC_DB_RETRY_ON_TIMEOUT'], config, 'retryOnTimeout', true),
        verifyClusterConnection: resolveBool(undefined, ['ELASTIC_DB_VERIFY_CLUSTER_CONNECTION'], config, 'verifyClusterConnection', false),
    };
}
