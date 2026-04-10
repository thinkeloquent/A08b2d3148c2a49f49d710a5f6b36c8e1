export interface RateLimitStatus {
  limit: number;
  remaining: number;
  reset: number;
  used?: number;
}

export interface QueuedRequest<T = unknown> {
  fn: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
  timestamp: number;
  priority?: number;
  retries: number;
  metadata: Record<string, unknown>;
}

export interface StorageAdapter {
  incr(key: string): Promise<number>;
  incrBy(key: string, n: number): Promise<number>;
  getCount(key: string): Promise<number>;
  getTTL(key: string): Promise<number>;
  reset(key: string): Promise<void>;
}

export interface CapacityResult {
  remaining: number;
  resetMs: number;
}

export interface RateLimiterOptions {
  maxRequests?: number;
  intervalMs?: number;
  maxQueueSize?: number;
  maxRetries?: number;
  retryDelayMs?: number;
  strategy?: import('./strategies.js').RateLimitStrategy;
  store?: StorageAdapter;
  redisClient?: RedisClientLike;
  getRateLimitStatus?: (resource: string) => Promise<RateLimitStatus | null>;
}

export interface ScheduleOptions {
  priority?: number;
  metadata?: Record<string, unknown>;
}

export interface LimiterStats {
  resourceType: string;
  queueSize: number;
  oldestRequest: number | null;
  processing: boolean;
  waitingUntil: number | null;
  lastCheck: number | null;
  errors: number;
}

export interface RedisClientLike {
  incr(key: string): Promise<number>;
  incrby(key: string, n: number): Promise<number>;
  get(key: string): Promise<string | null>;
  ttl(key: string): Promise<number>;
  del(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
}

export interface LimiterState {
  processing: boolean;
  waitingUntil: number | null;
  lastCheck: number | null;
  errors: number;
}
