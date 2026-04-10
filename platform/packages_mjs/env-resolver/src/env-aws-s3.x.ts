import { resolve, resolveBool, resolveInt } from '@internal/env-resolve';

export interface AwsS3Env {
    bucket: string | undefined;
    region: string;
    keyPrefix: string;
    ttl: string | undefined;
    accessKey: string | undefined;
    secretKey: string | undefined;
    endpoint: string | undefined;
    forcePathStyle: boolean;
    proxy: string | undefined;
    connectTimeout: number;
    readTimeout: number;
    maxRetries: number;
    verifySsl: boolean;
    debug: boolean;
}

export function resolveAwsS3Env(config?: Record<string, any>): AwsS3Env {
    return {
        bucket: resolve(undefined, ['AWS_S3_BUCKET', 'AWS_S3_BUCKETNAME'], config, 'bucket', undefined),
        region: resolve(undefined, ['AWS_S3_REGION', 'AWS_REGION', 'AWS_DEFAULT_REGION'], config, 'region', 'us-east-1'),
        keyPrefix: resolve(undefined, ['AWS_S3_KEY_PREFIX'], config, 'keyPrefix', 'jss3:'),
        ttl: resolve(undefined, ['AWS_S3_TTL'], config, 'ttl', undefined),
        accessKey: resolve(undefined, ['AWS_S3_ACCESS_KEY', 'AWS_ACCESS_KEY_ID'], config, 'accessKey', undefined),
        secretKey: resolve(undefined, ['AWS_S3_SECRET_KEY', 'AWS_SECRET_ACCESS_KEY'], config, 'secretKey', undefined),
        endpoint: resolve(undefined, ['AWS_S3_ENDPOINT', 'AWS_ENDPOINT_URL'], config, 'endpoint', undefined),
        forcePathStyle: resolveBool(undefined, ['AWS_S3_FORCE_PATH_STYLE'], config, 'forcePathStyle', false),
        proxy: resolve(undefined, ['AWS_S3_PROXY', 'HTTPS_PROXY'], config, 'proxy', undefined),
        connectTimeout: resolveInt(undefined, ['AWS_S3_CONNECT_TIMEOUT'], config, 'connectTimeout', 10),
        readTimeout: resolveInt(undefined, ['AWS_S3_READ_TIMEOUT'], config, 'readTimeout', 60),
        maxRetries: resolveInt(undefined, ['AWS_S3_MAX_RETRIES'], config, 'maxRetries', 3),
        verifySsl: resolveBool(undefined, ['AWS_S3_VERIFY_SSL'], config, 'verifySsl', false),
        debug: resolveBool(undefined, ['AWS_S3_DEBUG'], config, 'debug', false),
    };
}
