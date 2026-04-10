import { describe, it, expect } from 'vitest';
import { SilentProgressRenderer } from '../src/renderers/silent-renderer.js';
import { MultiProgressRenderer } from '../src/renderers/multi-renderer.js';
import type { ProgressDataWithMeta } from '../src/types.js';

function makeProgressData(
  overrides: Partial<ProgressDataWithMeta> = {},
): ProgressDataWithMeta {
  return {
    current: 50,
    total: 100,
    percentage: 50,
    elapsed: 2.5,
    eta: 2.5,
    speed: 20,
    isComplete: false,
    isIndeterminate: false,
    description: 'Test',
    state: 'active',
    ...overrides,
  };
}

describe('SilentProgressRenderer', () => {
  it('captures progress data', () => {
    const renderer = new SilentProgressRenderer();
    const data = makeProgressData();
    renderer.render(data);

    expect(renderer.getLastProgress()).toEqual(data);
  });

  it('stores history', () => {
    const renderer = new SilentProgressRenderer();
    renderer.render(makeProgressData({ current: 10, percentage: 10 }));
    renderer.render(makeProgressData({ current: 20, percentage: 20 }));
    renderer.render(makeProgressData({ current: 30, percentage: 30 }));

    const history = renderer.getHistory();
    expect(history).toHaveLength(3);
    expect(history[0]!.current).toBe(10);
    expect(history[2]!.current).toBe(30);
  });

  it('returns copy of history (no external mutation)', () => {
    const renderer = new SilentProgressRenderer();
    renderer.render(makeProgressData());

    const history1 = renderer.getHistory();
    const history2 = renderer.getHistory();
    expect(history1).not.toBe(history2);
    expect(history1).toEqual(history2);
  });

  it('adds timestamp to history entries', () => {
    const renderer = new SilentProgressRenderer();
    renderer.render(makeProgressData());

    const history = renderer.getHistory();
    expect(history[0]!.timestamp).toBeTypeOf('number');
  });

  it('clears history', () => {
    const renderer = new SilentProgressRenderer();
    renderer.render(makeProgressData());
    renderer.clear();

    expect(renderer.getLastProgress()).toBeNull();
    expect(renderer.getHistory()).toHaveLength(0);
  });

  it('resets via reset()', () => {
    const renderer = new SilentProgressRenderer();
    renderer.render(makeProgressData());
    renderer.reset();

    expect(renderer.getLastProgress()).toBeNull();
    expect(renderer.getHistory()).toHaveLength(0);
  });

  it('returns null for lastProgress before any render', () => {
    const renderer = new SilentProgressRenderer();
    expect(renderer.getLastProgress()).toBeNull();
  });
});

describe('MultiProgressRenderer', () => {
  it('delegates render to sub-renderer by id', () => {
    const multi = new MultiProgressRenderer();
    const silent = new SilentProgressRenderer();
    multi.addProgress('task-1', silent);

    const data = makeProgressData({ description: 'Task 1' });
    multi.render(data, 'task-1');

    expect(silent.getLastProgress()).toEqual(data);
  });

  it('ignores render for unknown id', () => {
    const multi = new MultiProgressRenderer();
    // Should not throw
    multi.render(makeProgressData(), 'unknown');
  });

  it('ignores render without id', () => {
    const multi = new MultiProgressRenderer();
    const silent = new SilentProgressRenderer();
    multi.addProgress('task-1', silent);

    multi.render(makeProgressData());
    expect(silent.getLastProgress()).toBeNull();
  });

  it('removes sub-renderers', () => {
    const multi = new MultiProgressRenderer();
    const silent = new SilentProgressRenderer();
    multi.addProgress('task-1', silent);
    multi.removeProgress('task-1');

    multi.render(makeProgressData(), 'task-1');
    expect(silent.getLastProgress()).toBeNull();
  });

  it('tracks line count', () => {
    const multi = new MultiProgressRenderer();
    multi.addProgress('a', new SilentProgressRenderer());
    multi.addProgress('b', new SilentProgressRenderer());
    expect(multi.getLineCount()).toBe(2);

    multi.removeProgress('a');
    expect(multi.getLineCount()).toBe(1);
  });

  it('calls cleanup on all sub-renderers', () => {
    const multi = new MultiProgressRenderer();
    const s1 = new SilentProgressRenderer();
    const s2 = new SilentProgressRenderer();
    multi.addProgress('a', s1);
    multi.addProgress('b', s2);

    // cleanup() should not throw
    expect(() => multi.cleanup()).not.toThrow();
  });

  it('calls reset on all sub-renderers', () => {
    const multi = new MultiProgressRenderer();
    const silent = new SilentProgressRenderer();
    silent.render(makeProgressData());
    multi.addProgress('a', silent);

    multi.reset();
    expect(silent.getLastProgress()).toBeNull();
  });
});
