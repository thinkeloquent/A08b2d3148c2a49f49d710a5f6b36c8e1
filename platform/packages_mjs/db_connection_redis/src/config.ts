import fs from "fs";
import { URL } from "url";
import { RedisConfigSchema } from "./schemas.js";
import {
  DEFAULT_CONFIG,
  ENV_REDIS_HOST,
  ENV_REDIS_PORT,
  ENV_REDIS_USERNAME,
  ENV_REDIS_PASSWORD,
  ENV_REDIS_DB,
  ENV_REDIS_SSL,
  ENV_REDIS_SSL_CERT_REQS,
  ENV_REDIS_SSL_CA_CERTS,
  ENV_REDIS_SSL_CHECK_HOSTNAME,
  ENV_REDIS_SOCKET_TIMEOUT,
  ENV_REDIS_SOCKET_CONNECT_TIMEOUT,
  ENV_REDIS_MAX_CONNECTIONS,
  ENV_REDIS_MIN_CONNECTIONS,
} from "./constants.js";
import { RedisConfigError } from "./exceptions.js";
import {
  resolve,
  resolveBool,
  resolveInt,
  resolveFloat,
} from "@internal/env-resolve";
import { resolveRedisEnv } from "@internal/env-resolver";

export interface RedisConfigOptions {
  host?: string;
  port?: number;
  username?: string | null;
  password?: string | null;
  db?: number;
  useSsl?: boolean;
  sslCertReqs?: string;
  sslCaCerts?: string | null;
  sslCheckHostname?: boolean;
  socketTimeout?: number;
  socketConnectTimeout?: number;
  retryOnTimeout?: boolean;
  maxConnections?: number | null;
  minConnections?: number | null;
  healthCheckInterval?: number;
  vendorType?: string;
}

export interface TlsConfig {
  rejectUnauthorized?: boolean;
  ca?: string[];
  checkServerIdentity?: () => undefined;
}

export class RedisConfig {
  public host: string;
  public port: number;
  public username: string | null;
  public password: string | null;
  public db: number;
  public useSsl: boolean;
  public sslCertReqs: string;
  public sslCaCerts: string | null;
  public sslCheckHostname: boolean;
  public socketTimeout: number;
  public socketConnectTimeout: number;
  public retryOnTimeout: boolean;
  public maxConnections: number | null;
  public minConnections: number | null;
  public healthCheckInterval: number;
  public vendorType?: string;

  constructor(options: RedisConfigOptions = {}) {
    this.host = resolve(
      options.host,
      ENV_REDIS_HOST,
      options,
      "host",
      DEFAULT_CONFIG.host
    );
    this.port = resolveInt(
      options.port,
      ENV_REDIS_PORT,
      options,
      "port",
      DEFAULT_CONFIG.port
    );
    this.username = resolve(
      options.username,
      ENV_REDIS_USERNAME,
      options,
      "username",
      DEFAULT_CONFIG.username
    );
    this.password = resolve(
      options.password,
      ENV_REDIS_PASSWORD,
      options,
      "password",
      DEFAULT_CONFIG.password
    );
    this.db = resolveInt(
      options.db,
      ENV_REDIS_DB,
      options,
      "db",
      DEFAULT_CONFIG.db
    );

    this.useSsl = resolveBool(
      options.useSsl,
      ENV_REDIS_SSL,
      options,
      "useSsl",
      DEFAULT_CONFIG.useSsl
    );
    this.sslCertReqs = resolve(
      options.sslCertReqs,
      ENV_REDIS_SSL_CERT_REQS,
      options,
      "sslCertReqs",
      DEFAULT_CONFIG.sslCertReqs
    );

    let caCerts: string | null = resolve(
      options.sslCaCerts,
      ENV_REDIS_SSL_CA_CERTS,
      options,
      "sslCaCerts",
      DEFAULT_CONFIG.sslCaCerts
    );
    if (caCerts && fs.existsSync(caCerts)) {
      try {
        caCerts = fs.readFileSync(caCerts, "utf8");
      } catch (_e) {
        // ignore
      }
    }
    this.sslCaCerts = caCerts;

    this.sslCheckHostname = resolveBool(
      options.sslCheckHostname,
      ENV_REDIS_SSL_CHECK_HOSTNAME,
      options,
      "sslCheckHostname",
      DEFAULT_CONFIG.sslCheckHostname
    );

    // Socket timeout from env is in seconds, convert to milliseconds for ioredis
    const socketTimeoutRaw: number = resolveFloat(
      options.socketTimeout,
      ENV_REDIS_SOCKET_TIMEOUT,
      options,
      "socketTimeout",
      null as unknown as number
    );
    if (socketTimeoutRaw !== null && socketTimeoutRaw < 100) {
      // If value is small (< 100), assume it's in seconds and convert to ms
      this.socketTimeout = socketTimeoutRaw * 1000;
    } else {
      this.socketTimeout = socketTimeoutRaw || DEFAULT_CONFIG.socketTimeout;
    }

    const socketConnectTimeoutRaw: number = resolveFloat(
      options.socketConnectTimeout,
      ENV_REDIS_SOCKET_CONNECT_TIMEOUT,
      options,
      "socketConnectTimeout",
      null as unknown as number
    );
    if (socketConnectTimeoutRaw !== null && socketConnectTimeoutRaw < 100) {
      this.socketConnectTimeout = socketConnectTimeoutRaw * 1000;
    } else {
      this.socketConnectTimeout =
        socketConnectTimeoutRaw || DEFAULT_CONFIG.socketConnectTimeout;
    }
    this.retryOnTimeout = resolveBool(
      options.retryOnTimeout,
      [],
      options,
      "retryOnTimeout",
      DEFAULT_CONFIG.retryOnTimeout
    );

    this.maxConnections = resolveInt(
      options.maxConnections,
      ENV_REDIS_MAX_CONNECTIONS,
      options,
      "maxConnections",
      DEFAULT_CONFIG.maxConnections
    );
    this.minConnections = resolveInt(
      options.minConnections,
      ENV_REDIS_MIN_CONNECTIONS,
      options,
      "minConnections",
      DEFAULT_CONFIG.minConnections
    );
    this.healthCheckInterval = resolveFloat(
      options.healthCheckInterval,
      [],
      options,
      "healthCheckInterval",
      DEFAULT_CONFIG.healthCheckInterval
    );

    // URL override
    const { url: redisUrl } = resolveRedisEnv();
    if (redisUrl) {
      this._parseUrl(redisUrl);
    }

    // Vendor detection
    this._detectVendor();

    this.validate();
  }

  private _parseUrl(urlString: string): void {
    try {
      const url = new URL(urlString);
      if (url.protocol === "rediss:") this.useSsl = true;
      this.host = url.hostname || this.host;
      this.port = url.port ? parseInt(url.port, 10) : this.port;
      this.username = url.username || this.username;
      this.password = url.password || this.password;
      if (url.pathname && url.pathname.length > 1) {
        this.db = parseInt(url.pathname.substring(1), 10);
      }
    } catch (_e) {
      // ignore invalid url in env
    }
  }

  private _detectVendor(): void {
    if (
      this.host.includes("cache.amazonaws.com") ||
      this.host.includes("redis-cloud.com") ||
      this.host.includes("upstash.io") ||
      (this.host.includes("db.ondigitalocean.com") && this.port === 25061)
    ) {
      if (!this.useSsl) {
        this.useSsl = true;
      }
    }
  }

  public validate(): void {
    try {
      RedisConfigSchema.parse(this);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new RedisConfigError(`Invalid configuration: ${message}`);
    }
  }

  public getTlsConfig(): TlsConfig | undefined {
    if (this.useSsl === undefined) return undefined;

    const ssl: TlsConfig = {};

    if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === "0") {
      ssl.rejectUnauthorized = false;
    }

    if (this.useSsl === true) {
      ssl.rejectUnauthorized = true;
    }

    // Similar to PostgreSQL ssl_mode:
    // - 'none' or 'required': use TLS but don't verify certificate
    // - 'verify-ca' or 'verify-full': verify certificate
    if (
      this.sslCertReqs === "verify-ca" ||
      this.sslCertReqs === "verify-full"
    ) {
      ssl.rejectUnauthorized = true;
    }

    if (
      this.sslCertReqs === "none" ||
      this.sslCertReqs === "required" ||
      this.useSsl === false
    ) {
      ssl.rejectUnauthorized = false;
    }

    if (this.sslCaCerts) {
      ssl.ca = [this.sslCaCerts];
    }

    if (!this.sslCheckHostname || this.sslCertReqs !== "verify-full") {
      ssl.checkServerIdentity = () => undefined;
    }

    return ssl;
  }
}
