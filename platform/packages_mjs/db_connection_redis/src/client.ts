import { Redis } from "ioredis";
import type { RedisOptions } from "ioredis";
import { RedisConfig } from "./config.js";
import type { RedisConfigOptions } from "./config.js";

export function getRedisClient(config: RedisConfig | RedisConfigOptions): Redis {
  const resolvedConfig = config instanceof RedisConfig ? config : new RedisConfig(config);

  const options: RedisOptions = {
    host: resolvedConfig.host,
    port: resolvedConfig.port,
    db: resolvedConfig.db,
    connectTimeout: resolvedConfig.socketConnectTimeout,
    commandTimeout: resolvedConfig.socketTimeout, // ioredis uses commandTimeout
    retryStrategy: (times: number): number | null => {
      if (resolvedConfig.retryOnTimeout) {
        return Math.min(times * 50, 2000);
      }
      return null;
    },
  };

  if (resolvedConfig.username) options.username = resolvedConfig.username;
  if (resolvedConfig.password) options.password = resolvedConfig.password;

  const tlsConfig = resolvedConfig.getTlsConfig();
  if (tlsConfig) {
    options.tls = tlsConfig;
  }

  return new Redis(options);
}
