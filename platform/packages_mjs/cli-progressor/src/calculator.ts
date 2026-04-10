import { performance } from 'perf_hooks';
import type { IProgressCalculator, ProgressData } from './types.js';

export class StandardProgressCalculator implements IProgressCalculator {
  private speedHistory: number[] = [];
  private maxHistorySize = 10;

  calculate(
    current: number,
    total: number,
    startTime: number,
    _lastUpdate: number,
  ): ProgressData {
    const now = performance.now();
    const elapsed = (now - startTime) / 1000;

    // Fix floating-point precision issue
    const percentage =
      total > 0 ? Math.round((current / total) * 100 * 100) / 100 : 0;

    // Calculate speed with moving average
    const speed = this.calculateSpeed(current, elapsed);

    // Calculate ETA
    let eta = 0;
    if (current > 0 && current < total && speed > 0) {
      eta = (total - current) / speed;
    }

    return {
      current,
      total,
      percentage,
      elapsed,
      eta,
      speed,
      isComplete: current >= total,
      isIndeterminate: total <= 0,
    };
  }

  private calculateSpeed(current: number, elapsed: number): number {
    if (elapsed <= 0) return 0;

    const currentSpeed = current / elapsed;

    // Maintain speed history for smoothing
    this.speedHistory.push(currentSpeed);
    if (this.speedHistory.length > this.maxHistorySize) {
      this.speedHistory.shift();
    }

    // Return moving average
    return (
      this.speedHistory.reduce((a, b) => a + b, 0) / this.speedHistory.length
    );
  }

  resetHistory(): void {
    this.speedHistory = [];
  }
}
