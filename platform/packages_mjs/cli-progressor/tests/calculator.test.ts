import { describe, it, expect } from 'vitest';
import { StandardProgressCalculator } from '../src/calculator.js';

describe('StandardProgressCalculator', () => {
  it('calculates percentage correctly', () => {
    const calc = new StandardProgressCalculator();
    const result = calc.calculate(50, 100, performance.now() - 1000, performance.now());
    expect(result.percentage).toBe(50);
  });

  it('handles zero total (indeterminate)', () => {
    const calc = new StandardProgressCalculator();
    const result = calc.calculate(0, 0, performance.now(), performance.now());
    expect(result.percentage).toBe(0);
    expect(result.isIndeterminate).toBe(true);
    expect(result.isComplete).toBe(true);
  });

  it('detects completion', () => {
    const calc = new StandardProgressCalculator();
    const result = calc.calculate(100, 100, performance.now() - 1000, performance.now());
    expect(result.isComplete).toBe(true);
    expect(result.percentage).toBe(100);
  });

  it('avoids floating-point precision issues', () => {
    const calc = new StandardProgressCalculator();
    // 33/100 should not produce 33.00000000000001
    const result = calc.calculate(33, 100, performance.now() - 1000, performance.now());
    expect(result.percentage).toBe(33);
  });

  it('calculates ETA when in progress', () => {
    const calc = new StandardProgressCalculator();
    const start = performance.now() - 5000; // 5 seconds ago
    const result = calc.calculate(50, 100, start, performance.now());
    expect(result.eta).toBeGreaterThan(0);
  });

  it('returns zero ETA when complete', () => {
    const calc = new StandardProgressCalculator();
    const result = calc.calculate(100, 100, performance.now() - 1000, performance.now());
    expect(result.eta).toBe(0);
  });

  it('smooths speed with moving average', () => {
    const calc = new StandardProgressCalculator();
    const start = performance.now() - 2000;
    // Multiple calculations to build speed history
    calc.calculate(10, 100, start, performance.now());
    calc.calculate(20, 100, start, performance.now());
    const result = calc.calculate(30, 100, start, performance.now());
    expect(result.speed).toBeGreaterThan(0);
  });

  it('resets speed history', () => {
    const calc = new StandardProgressCalculator();
    const start = performance.now() - 1000;
    calc.calculate(50, 100, start, performance.now());
    calc.resetHistory();
    // After reset, next calculation starts fresh
    const result = calc.calculate(10, 100, performance.now() - 500, performance.now());
    expect(result.speed).toBeGreaterThan(0);
  });
});
