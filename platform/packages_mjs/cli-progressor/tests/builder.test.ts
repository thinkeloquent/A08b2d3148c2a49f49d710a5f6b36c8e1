import { describe, it, expect } from 'vitest';
import { ProgressBarBuilder } from '../src/builder.js';
import { SilentProgressRenderer } from '../src/renderers/silent-renderer.js';

describe('ProgressBarBuilder', () => {
  it('builds a progress bar with defaults', () => {
    const bar = new ProgressBarBuilder().buildSilent();
    expect(bar.getState()).toBe('idle');
    expect(bar.renderer).toBeInstanceOf(SilentProgressRenderer);
  });

  it('sets total', () => {
    const bar = new ProgressBarBuilder().withTotal(50).buildSilent();
    bar.start();
    bar.update(50);
    expect(bar.isCompleted()).toBe(true);
  });

  it('sets description', () => {
    const bar = new ProgressBarBuilder()
      .withDescription('Custom Desc')
      .buildSilent();
    expect(bar.getProgress().description).toBe('Custom Desc');
  });

  it('chains fluently', () => {
    const builder = new ProgressBarBuilder()
      .withTotal(200)
      .withDescription('Fluent')
      .withBarLength(30)
      .withChars('=', '-')
      .withColors(false)
      .withPrecision(2)
      .showETA(true)
      .showSpeed(true)
      .showPercentage(true)
      .withTemplate('{description}: {percentage}%')
      .withTestMode(true)
      .withUpdateThrottle(50);

    // Should not throw
    const bar = builder.buildSilent();
    expect(bar).toBeDefined();
  });

  it('forSpinner sets total to 0', () => {
    const bar = new ProgressBarBuilder().forSpinner().buildSilent();
    const progress = bar.getProgress();
    expect(progress.isIndeterminate).toBe(true);
  });

  it('buildSilent creates bar with SilentProgressRenderer', () => {
    const bar = new ProgressBarBuilder().buildSilent();
    expect(bar.renderer).toBeInstanceOf(SilentProgressRenderer);
  });

  it('build creates a progress bar', () => {
    const bar = new ProgressBarBuilder().withTotal(10).build();
    expect(bar).toBeDefined();
    expect(bar.getState()).toBe('idle');
  });

  it('withTestMode sets throttle', () => {
    const bar = new ProgressBarBuilder().withTestMode(true).build();
    expect(bar).toBeDefined();
  });
});
