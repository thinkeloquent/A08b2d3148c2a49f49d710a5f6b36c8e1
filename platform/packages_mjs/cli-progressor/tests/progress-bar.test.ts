import { describe, it, expect, vi, afterEach } from 'vitest';
import { ProgressBar } from '../src/progress-bar.js';
import { SilentProgressRenderer } from '../src/renderers/silent-renderer.js';

describe('ProgressBar', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts in idle state', () => {
    const bar = new ProgressBar(100, 'Test', new SilentProgressRenderer());
    expect(bar.getState()).toBe('idle');
  });

  it('transitions to active on start', () => {
    const bar = new ProgressBar(100, 'Test', new SilentProgressRenderer());
    bar.start();
    expect(bar.getState()).toBe('active');
    bar.stop();
  });

  it('auto-starts on first update if idle', () => {
    const bar = new ProgressBar(100, 'Test', new SilentProgressRenderer());
    bar.update(10);
    expect(bar.getState()).not.toBe('idle');
    bar.stop();
  });

  it('updates progress through renderer', () => {
    const renderer = new SilentProgressRenderer();
    const bar = new ProgressBar(100, 'Test', renderer);
    bar.start();
    bar.update(25);

    const last = renderer.getLastProgress();
    expect(last).not.toBeNull();
    expect(last!.current).toBe(25);
    expect(last!.percentage).toBe(25);
    bar.stop();
  });

  it('completes and transitions to completed', () => {
    const renderer = new SilentProgressRenderer();
    const bar = new ProgressBar(10, 'Test', renderer);
    bar.start();
    bar.update(10);

    expect(bar.isCompleted()).toBe(true);
    expect(bar.getState()).toBe('completed');
  });

  it('complete() forces completion', () => {
    const renderer = new SilentProgressRenderer();
    const bar = new ProgressBar(100, 'Test', renderer);
    bar.start();
    bar.update(10);
    bar.complete();

    expect(bar.isCompleted()).toBe(true);
    const last = renderer.getLastProgress();
    expect(last!.isComplete).toBe(true);
  });

  it('complete() is idempotent', () => {
    const renderer = new SilentProgressRenderer();
    const bar = new ProgressBar(10, 'Test', renderer);
    bar.start();
    bar.complete();

    const historyBefore = renderer.getHistory().length;
    bar.complete();
    const historyAfter = renderer.getHistory().length;

    // Second complete() should not render again
    expect(historyAfter).toBe(historyBefore);
  });

  it('resets to idle', () => {
    const renderer = new SilentProgressRenderer();
    const bar = new ProgressBar(100, 'Test', renderer);
    bar.start();
    bar.update(50);
    bar.stop();
    bar.reset();

    expect(bar.getState()).toBe('idle');
    expect(bar.getProgress().current).toBe(0);
  });

  it('supports setTotal', () => {
    const renderer = new SilentProgressRenderer();
    const bar = new ProgressBar(100, 'Test', renderer);
    bar.setTotal(200);
    bar.start();
    bar.update(100);

    expect(bar.getProgress().percentage).toBe(50);
    expect(bar.isCompleted()).toBe(false);
    bar.stop();
  });

  it('supports onProgress observer', () => {
    const bar = new ProgressBar(100, 'Test', new SilentProgressRenderer());
    const observer = vi.fn();
    bar.onProgress(observer);
    bar.start();
    bar.update(10);

    expect(observer).toHaveBeenCalledTimes(1);
    bar.stop();
  });

  it('supports offProgress to remove observer', () => {
    const bar = new ProgressBar(100, 'Test', new SilentProgressRenderer());
    const observer = vi.fn();
    bar.onProgress(observer);
    bar.offProgress(observer);
    bar.start();
    bar.update(10);

    expect(observer).not.toHaveBeenCalled();
    bar.stop();
  });

  it('supports onStateChange observer', () => {
    const bar = new ProgressBar(100, 'Test', new SilentProgressRenderer());
    const observer = vi.fn();
    bar.onStateChange(observer);
    bar.start();

    expect(observer).toHaveBeenCalledWith(
      expect.objectContaining({ newState: 'active', oldState: 'idle' }),
    );
    bar.stop();
  });

  it('supports offStateChange to remove observer', () => {
    const bar = new ProgressBar(100, 'Test', new SilentProgressRenderer());
    const observer = vi.fn();
    bar.onStateChange(observer);
    bar.offStateChange(observer);
    bar.start();

    expect(observer).not.toHaveBeenCalled();
    bar.stop();
  });

  it('ignores updates after completion', () => {
    const renderer = new SilentProgressRenderer();
    const bar = new ProgressBar(10, 'Test', renderer);
    bar.start();
    bar.complete();

    const progress = bar.update(5);
    expect(progress.current).toBe(10);
  });

  describe('factory methods', () => {
    it('createSilent creates bar with SilentProgressRenderer', () => {
      const bar = ProgressBar.createSilent(100, 'Silent Test');
      expect(bar.renderer).toBeInstanceOf(SilentProgressRenderer);
    });
  });
});
