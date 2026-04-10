import { describe, it, expect, vi } from 'vitest';
import { ProgressTracker } from '../src/tracker.js';

describe('ProgressTracker', () => {
  it('starts in idle state', () => {
    const tracker = new ProgressTracker(100);
    expect(tracker.getState()).toBe('idle');
  });

  it('increments current value', () => {
    const tracker = new ProgressTracker(100);
    const progress = tracker.increment(10);
    expect(progress.current).toBe(10);
    expect(progress.percentage).toBe(10);
  });

  it('does not exceed total', () => {
    const tracker = new ProgressTracker(10);
    tracker.increment(15);
    const progress = tracker.getProgress();
    expect(progress.current).toBe(10);
  });

  it('transitions to completed on reaching total', () => {
    const tracker = new ProgressTracker(10);
    tracker.increment(10);
    expect(tracker.getState()).toBe('completed');
    expect(tracker.isCompleted()).toBe(true);
  });

  it('ignores increments after completion', () => {
    const tracker = new ProgressTracker(10);
    tracker.increment(10);
    const progress = tracker.increment(5);
    expect(progress.current).toBe(10);
  });

  it('notifies progress observers', () => {
    const tracker = new ProgressTracker(100);
    const observer = vi.fn();
    tracker.addObserver(observer);

    tracker.increment(25);
    expect(observer).toHaveBeenCalledTimes(1);
    expect(observer).toHaveBeenCalledWith(
      expect.objectContaining({ current: 25, percentage: 25 }),
    );
  });

  it('notifies object-style progress observers', () => {
    const tracker = new ProgressTracker(100);
    const observer = { onProgress: vi.fn() };
    tracker.addObserver(observer);

    tracker.increment(10);
    expect(observer.onProgress).toHaveBeenCalledTimes(1);
  });

  it('returns unsubscribe function from addObserver', () => {
    const tracker = new ProgressTracker(100);
    const observer = vi.fn();
    const unsubscribe = tracker.addObserver(observer);

    tracker.increment(10);
    expect(observer).toHaveBeenCalledTimes(1);

    unsubscribe();
    tracker.increment(10);
    expect(observer).toHaveBeenCalledTimes(1);
  });

  it('removes observers via removeObserver', () => {
    const tracker = new ProgressTracker(100);
    const observer = vi.fn();
    tracker.addObserver(observer);

    tracker.removeObserver(observer);
    tracker.increment(10);
    expect(observer).not.toHaveBeenCalled();
  });

  it('notifies state observers on state change', () => {
    const tracker = new ProgressTracker(10);
    const stateObserver = vi.fn();
    tracker.addStateObserver(stateObserver);

    tracker.setState('active');
    expect(stateObserver).toHaveBeenCalledWith(
      expect.objectContaining({ newState: 'active', oldState: 'idle' }),
    );
  });

  it('notifies object-style state observers', () => {
    const tracker = new ProgressTracker(10);
    const observer = { onStateChange: vi.fn() };
    tracker.addStateObserver(observer);

    tracker.setState('active');
    expect(observer.onStateChange).toHaveBeenCalledTimes(1);
  });

  it('does not notify on same-state transition', () => {
    const tracker = new ProgressTracker(10);
    const stateObserver = vi.fn();
    tracker.addStateObserver(stateObserver);

    tracker.setState('idle'); // same as current
    expect(stateObserver).not.toHaveBeenCalled();
  });

  it('completes explicitly', () => {
    const tracker = new ProgressTracker(100);
    const progress = tracker.complete();
    expect(progress.isComplete).toBe(true);
    expect(tracker.getState()).toBe('completed');
  });

  it('complete() is idempotent', () => {
    const tracker = new ProgressTracker(100);
    tracker.complete();
    const stateObserver = vi.fn();
    tracker.addStateObserver(stateObserver);

    tracker.complete();
    expect(stateObserver).not.toHaveBeenCalled();
  });

  it('resets to initial state', () => {
    const tracker = new ProgressTracker(100);
    tracker.increment(50);
    tracker.setState('active');
    tracker.reset();

    expect(tracker.getState()).toBe('idle');
    expect(tracker.getProgress().current).toBe(0);
  });

  it('updates total via setTotal', () => {
    const tracker = new ProgressTracker(100);
    tracker.setTotal(200);
    tracker.increment(100);
    expect(tracker.getProgress().percentage).toBe(50);
  });

  it('silently catches observer errors', () => {
    const tracker = new ProgressTracker(100);
    const badObserver = () => {
      throw new Error('observer error');
    };
    tracker.addObserver(badObserver);

    // Should not throw
    expect(() => tracker.increment(10)).not.toThrow();
  });

  it('silently catches state observer errors', () => {
    const tracker = new ProgressTracker(100);
    const badObserver = () => {
      throw new Error('state observer error');
    };
    tracker.addStateObserver(badObserver);

    expect(() => tracker.setState('active')).not.toThrow();
  });

  it('includes description in progress data', () => {
    const tracker = new ProgressTracker(100, 'Test Task');
    const progress = tracker.getProgress();
    expect(progress.description).toBe('Test Task');
  });
});
