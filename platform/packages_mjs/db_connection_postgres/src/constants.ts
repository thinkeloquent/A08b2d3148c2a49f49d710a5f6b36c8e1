// Environment Variable Keys
export const ENV_POSTGRES_HOST: string[] = [
  "POSTGRES_HOST",
  "POSTGRES_HOSTNAME",
  "DATABASE_HOST",
];
export const ENV_POSTGRES_PORT: string[] = ["POSTGRES_PORT", "DATABASE_PORT"];
export const ENV_POSTGRES_USER: string[] = [
  "POSTGRES_USER",
  "DATABASE_USER",
  "POSTGRES_USERNAME",
];
export const ENV_POSTGRES_PASSWORD: string[] = ["POSTGRES_PASSWORD", "DATABASE_PASSWORD"];
export const ENV_POSTGRES_DB: string[] = [
  "POSTGRES_DB",
  "POSTGRES_DATABASE",
  "DATABASE_NAME",
];
export const ENV_POSTGRES_SCHEMA: string[] = ["POSTGRES_SCHEMA", "DATABASE_SCHEMA"];
export const ENV_POSTGRES_SSL_MODE: string[] = ["POSTGRES_SSL_MODE", "DATABASE_SSL_MODE"];
export const ENV_POSTGRES_SSL_CA_FILE: string[] = [
  "POSTGRES_SSL_CA_CERTS",
  "POSTGRES_SSL_CA_FILE",
];
export const ENV_POSTGRES_CONNECT_TIMEOUT: string[] = ["POSTGRES_CONNECT_TIMEOUT"];
export const ENV_POSTGRES_MAX_CONNECTIONS: string[] = [
  "POSTGRES_POOL_SIZE",
  "DATABASE_POOL_SIZE",
];

export type SslMode = "disable" | "allow" | "prefer" | "require" | "verify-ca" | "verify-full";

export interface DefaultPostgresConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  schema: string;
  sslMode: SslMode;
  sslCaCerts: string | null;
  connectTimeout: number;
  maxConnections: number;
}

export const DEFAULT_CONFIG: DefaultPostgresConfig = {
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "",
  database: "postgres",
  schema: "public",
  sslMode: "prefer",
  sslCaCerts: null,
  connectTimeout: 30000,
  maxConnections: 10,
};

export const SSL_MODES = [
  "disable",
  "allow",
  "prefer",
  "require",
  "verify-ca",
  "verify-full",
] as const;
