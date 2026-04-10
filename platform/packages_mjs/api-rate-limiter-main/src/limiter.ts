import { EventEmitter } from 'events';
import type {
  RateLimiterOptions,
  ScheduleOptions,
  LimiterStats,
  LimiterState,
  StorageAdapter,
  RateLimitStatus,
  CapacityResult,
  QueuedRequest,
} from './types.js';
import { RateLimitError } from './errors.js';
import { FixedWindowStrategy, type RateLimitStrategy } from './strategies.js';
import { RequestQueue } from './queue.js';
import { MemoryStore, RedisStore } from './stores.js';

interface ResolvedOptions {
  maxRequests: number | undefined;
  intervalMs: number;
  maxQueueSize: number;
  maxRetries: number;
  retryDelayMs: number;
}

export class API_Rate_Limiter extends EventEmitter {
  readonly resourceType: string;
  private opts: ResolvedOptions;
  private strategy: RateLimitStrategy;
  private store: StorageAdapter;
  private requestQueue: RequestQueue;
  private getDynamicStatus: ((resource: string) => Promise<RateLimitStatus | null>) | null;
  private state: LimiterState;

  constructor(resourceType: string, options: RateLimiterOptions = {}) {
    super();

    this.resourceType = resourceType;
    this.opts = {
      maxRequests: options.maxRequests,
      intervalMs: options.intervalMs || 60000,
      maxQueueSize: options.maxQueueSize || 10000,
      maxRetries: options.maxRetries || 3,
      retryDelayMs: options.retryDelayMs || 1000,
    };

    this.strategy = options.strategy || new FixedWindowStrategy(this.opts);
    this.store = this._initializeStore(options);
    this.requestQueue = new RequestQueue({ maxQueueSize: this.opts.maxQueueSize });
    this.getDynamicStatus = options.getRateLimitStatus || null;

    this.state = {
      processing: false,
      waitingUntil: null,
      lastCheck: null,
      errors: 0,
    };

    this.schedule = this.schedule.bind(this);
    this._processQueue = this._processQueue.bind(this);
  }

  private _initializeStore(options: RateLimiterOptions): StorageAdapter {
    if (options.store) {
      return options.store;
    } else if (options.redisClient) {
      return new RedisStore(options.redisClient, this.opts.intervalMs);
    } else {
      return new MemoryStore(this.opts.intervalMs);
    }
  }

  schedule<T>(apiCallFunc: () => Promise<T>, options: ScheduleOptions = {}): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const request: QueuedRequest<T> = {
        fn: apiCallFunc,
        resolve,
        reject,
        timestamp: Date.now(),
        priority: options.priority,
        retries: 0,
        metadata: options.metadata || {},
      };

      try {
        this.requestQueue.enqueue(request as QueuedRequest);
        this.emit('request:queued', {
          queueSize: this.requestQueue.size(),
          metadata: request.metadata,
        });

        setImmediate(() => this._processQueue());
      } catch (error) {
        reject(error);
      }
    });
  }

  private async _processQueue(): Promise<void> {
    if (this.state.processing) return;

    if (this.state.waitingUntil && Date.now() < this.state.waitingUntil) {
      return;
    }

    this.state.processing = true;
    this.state.waitingUntil = null;

    try {
      const capacity = await this._getCurrentCapacity();

      if (capacity.remaining <= 0) {
        await this._scheduleRetry(capacity.resetMs);
        return;
      }

      const requests = this.requestQueue.dequeue(capacity.remaining);

      if (requests.length === 0) {
        return;
      }

      if (!this.getDynamicStatus) {
        await this.strategy.recordUsage(
          this.store,
          this.resourceType,
          requests.length,
        );
      }

      await this._executeRequests(requests);

      this.emit('status:update', {
        processed: requests.length,
        remaining: capacity.remaining - requests.length,
        queueSize: this.requestQueue.size(),
      });

      if (this.requestQueue.size() > 0) {
        setImmediate(() => this._processQueue());
      }
    } catch (error) {
      this.emit('error', error);
      this.state.errors++;

      const backoffMs = Math.min(
        this.opts.retryDelayMs * Math.pow(2, Math.min(this.state.errors, 5)),
        30000,
      );

      await this._scheduleRetry(backoffMs);
    } finally {
      this.state.processing = false;
    }
  }

  private async _getCurrentCapacity(): Promise<CapacityResult> {
    if (this.getDynamicStatus) {
      try {
        const status = await this.getDynamicStatus(this.resourceType);
        if (status) {
          this.state.lastCheck = Date.now();

          if (status.limit && !this.opts.maxRequests) {
            this.strategy.maxRequests = status.limit;
          }

          const resetMs = this._calculateResetMs(status.reset);
          return {
            remaining: status.remaining || 0,
            resetMs,
          };
        }
      } catch (error) {
        this.emit('warning', {
          message: 'Failed to get dynamic status',
          error,
        });
      }
    }

    return await this.strategy.getCapacity(this.store, this.resourceType);
  }

  private _calculateResetMs(resetTime: number | undefined): number {
    if (!resetTime) return this.opts.intervalMs;

    const resetEpochMs = resetTime > 1e12 ? resetTime : resetTime * 1000;
    const msUntilReset = Math.max(0, resetEpochMs - Date.now());

    return msUntilReset + 100;
  }

  private async _scheduleRetry(delayMs: number): Promise<void> {
    this.state.waitingUntil = Date.now() + delayMs;

    this.emit('rate:limited', {
      waitMs: delayMs,
      resumeAt: this.state.waitingUntil,
      queueSize: this.requestQueue.size(),
    });

    if (!this.getDynamicStatus) {
      setTimeout(async () => {
        try {
          await this.store.reset(this.resourceType);
          this.state.errors = 0;
        } catch (error) {
          this.emit('error', error);
        }
        setImmediate(() => this._processQueue());
      }, delayMs);
    } else {
      setTimeout(() => {
        this.state.errors = 0;
        setImmediate(() => this._processQueue());
      }, delayMs);
    }
  }

  private async _executeRequests(requests: QueuedRequest[]): Promise<void> {
    const executions = requests.map(async (request) => {
      try {
        const startTime = Date.now();
        const result = await request.fn();

        this.emit('request:completed', {
          duration: Date.now() - startTime,
          metadata: request.metadata,
        });

        request.resolve(result);
      } catch (error) {
        if (this._isRateLimitError(error)) {
          if (request.retries < this.opts.maxRetries) {
            request.retries++;
            this.requestQueue.enqueue(request);

            this.emit('request:requeued', {
              retries: request.retries,
              metadata: request.metadata,
            });
          } else {
            request.reject(
              new RateLimitError(
                'Max retries exceeded for rate-limited request',
                null,
                0,
              ),
            );
          }
        } else {
          request.reject(error);
        }
      }
    });

    await Promise.allSettled(executions);
  }

  private _isRateLimitError(error: unknown): boolean {
    if (error instanceof RateLimitError) return true;

    const err = error as Record<string, unknown> | undefined;
    const status =
      err?.status ?? err?.statusCode ?? (err?.response as Record<string, unknown>)?.status;
    return status === 429 || status === 403;
  }

  getStats(): LimiterStats {
    return {
      resourceType: this.resourceType,
      queueSize: this.requestQueue.size(),
      oldestRequest: this.requestQueue.getOldestTimestamp(),
      processing: this.state.processing,
      waitingUntil: this.state.waitingUntil,
      lastCheck: this.state.lastCheck,
      errors: this.state.errors,
    };
  }

  clearQueue(): number {
    const cleared = this.requestQueue.size();
    this.requestQueue.clear();

    this.emit('queue:cleared', { cleared });
    return cleared;
  }
}
