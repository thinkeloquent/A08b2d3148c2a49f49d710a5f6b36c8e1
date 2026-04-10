import { TerminalUtils } from './terminal.js';
import { ProgressTracker } from './tracker.js';
import { ConsoleProgressRenderer } from './renderers/console-renderer.js';
import { SilentProgressRenderer } from './renderers/silent-renderer.js';
import { processManager } from './process-manager.js';
import type {
  ConsoleRendererConfig,
  IProgressRenderer,
  ProgressBarState,
  ProgressDataWithMeta,
  ProgressObserver,
  StateObserver,
  UnsubscribeFn,
} from './types.js';

export class ProgressBar {
  readonly tracker: ProgressTracker;
  readonly renderer: IProgressRenderer;
  private state: ProgressBarState = 'idle';
  private updateInterval: ReturnType<typeof setInterval> | null = null;
  private cleanupFn: (() => void) | null = null;

  constructor(
    total: number,
    description = 'Progress',
    renderer?: IProgressRenderer,
  ) {
    this.tracker = new ProgressTracker(total, description);
    this.renderer = renderer ?? this.createDefaultRenderer();

    // Setup process management
    processManager.setup();

    // Listen to tracker state changes
    this.tracker.addStateObserver((stateData) => {
      if (stateData.newState === 'completed') {
        this.state = 'completed';
      }
    });
  }

  private createDefaultRenderer(): IProgressRenderer {
    if (!TerminalUtils.isInteractive) {
      return new SilentProgressRenderer();
    }
    return new ConsoleProgressRenderer();
  }

  start(): this {
    if (this.state !== 'idle') return this;

    this.state = 'active';
    this.tracker.setState('active');
    TerminalUtils.hideCursor();

    // Register cleanup
    this.cleanupFn = processManager.addCleanupTask(() => {
      this.stop();
      this.renderer.cleanup();
    });

    // For indeterminate progress, start auto-updating
    if (this.tracker.total <= 0) {
      this.updateInterval = setInterval(() => {
        if (this.state === 'active') {
          this.renderer.render(this.tracker.getProgress());
        }
      }, 100);
    }

    return this;
  }

  stop(): this {
    if (this.state === 'idle' || this.state === 'stopped') return this;

    // Preserve completed state — only set stopped if manually stopping
    if (this.state !== 'completed') {
      this.state = 'stopped';
    }
    TerminalUtils.showCursor();

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    if (this.cleanupFn) {
      this.cleanupFn();
      this.cleanupFn = null;
    }

    return this;
  }

  update(increment = 1): ProgressDataWithMeta {
    if (this.state === 'completed') return this.getProgress();

    if (this.state === 'idle') this.start();

    const progress = this.tracker.increment(increment);
    this.renderer.render(progress);

    if (progress.isComplete) {
      this.state = 'completed';
      this.stop();
    }

    return progress;
  }

  setTotal(total: number): this {
    this.tracker.setTotal(total);
    return this;
  }

  complete(): ProgressDataWithMeta {
    if (this.state === 'completed') {
      return this.getProgress();
    }

    this.state = 'completed';
    const progress = this.tracker.complete();
    this.renderer.render(progress);
    this.stop();
    return progress;
  }

  getProgress(): ProgressDataWithMeta {
    return this.tracker.getProgress();
  }

  reset(): this {
    this.tracker.reset();
    this.state = 'idle';
    if (this.renderer.reset) {
      this.renderer.reset();
    }
    return this;
  }

  isCompleted(): boolean {
    return this.state === 'completed';
  }

  getState(): ProgressBarState {
    return this.state;
  }

  // Observer pattern support
  onProgress(callback: ProgressObserver): UnsubscribeFn {
    return this.tracker.addObserver(callback);
  }

  offProgress(callback: ProgressObserver): boolean {
    return this.tracker.removeObserver(callback);
  }

  onStateChange(callback: StateObserver): UnsubscribeFn {
    return this.tracker.addStateObserver(callback);
  }

  offStateChange(callback: StateObserver): boolean {
    return this.tracker.removeStateObserver(callback);
  }

  // Factory methods for common configurations
  static createConsole(
    total: number,
    description: string,
    config: ConsoleRendererConfig = {},
  ): ProgressBar {
    const renderer = new ConsoleProgressRenderer(config);
    return new ProgressBar(total, description, renderer);
  }

  static createSilent(total: number, description: string): ProgressBar {
    const renderer = new SilentProgressRenderer();
    return new ProgressBar(total, description, renderer);
  }

  static createSpinner(
    description: string,
    config: ConsoleRendererConfig = {},
  ): ProgressBar {
    const renderer = new ConsoleProgressRenderer({
      ...config,
      showPercentage: false,
      showETA: false,
    });
    return new ProgressBar(0, description, renderer);
  }
}
