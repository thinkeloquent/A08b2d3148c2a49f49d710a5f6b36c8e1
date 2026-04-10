import type { QueuedRequest } from './types.js';

export class RequestQueue {
  private maxSize: number;
  private queue: QueuedRequest[] = [];
  private priorityQueue: QueuedRequest[] = [];

  constructor(options: { maxQueueSize?: number } = {}) {
    this.maxSize = options.maxQueueSize || 10000;
  }

  enqueue(request: QueuedRequest): void {
    if (this.size() >= this.maxSize) {
      throw new Error(`Queue size limit reached (${this.maxSize})`);
    }

    if (request.priority !== undefined) {
      this.priorityQueue.push(request);
      this.priorityQueue.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    } else {
      this.queue.push(request);
    }
  }

  dequeue(count: number): QueuedRequest[] {
    const results: QueuedRequest[] = [];

    while (results.length < count && this.size() > 0) {
      if (this.priorityQueue.length > 0) {
        results.push(this.priorityQueue.shift()!);
      } else if (this.queue.length > 0) {
        results.push(this.queue.shift()!);
      }
    }

    return results;
  }

  size(): number {
    return this.queue.length + this.priorityQueue.length;
  }

  clear(): void {
    this.queue = [];
    this.priorityQueue = [];
  }

  getOldestTimestamp(): number | null {
    let oldest = Infinity;

    if (this.queue.length > 0) {
      oldest = Math.min(oldest, this.queue[0]!.timestamp);
    }
    if (this.priorityQueue.length > 0) {
      oldest = Math.min(oldest, this.priorityQueue[0]!.timestamp);
    }

    return oldest === Infinity ? null : oldest;
  }
}
