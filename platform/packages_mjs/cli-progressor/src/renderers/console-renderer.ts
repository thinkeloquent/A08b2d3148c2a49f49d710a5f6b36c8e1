import process from 'process';
import { performance } from 'perf_hooks';
import { Colors } from '../terminal.js';
import { TerminalUtils } from '../terminal.js';
import { Spinner } from '../spinner.js';
import type {
  ConsoleRendererConfig,
  IProgressRenderer,
  ProgressDataWithMeta,
} from '../types.js';

const DEFAULTS: Required<ConsoleRendererConfig> = {
  barLength: 40,
  filledChar: '█',
  emptyChar: '░',
  showETA: true,
  showSpeed: true,
  showPercentage: true,
  precision: 1,
  useColors: true,
  template: null,
  updateThrottle: 0,
  testMode: false,
};

export class ConsoleProgressRenderer implements IProgressRenderer {
  private config: Required<ConsoleRendererConfig>;
  private spinner: Spinner | null = null;
  private lastRenderTime = 0;
  private hasRenderedCompletion = false;

  constructor(config: ConsoleRendererConfig = {}) {
    this.config = {
      ...DEFAULTS,
      ...config,
      barLength: Math.min(
        config.barLength ?? DEFAULTS.barLength,
        TerminalUtils.columns - 30,
      ),
    };
  }

  private formatTime(seconds: number): string {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600)
      return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor(
      (seconds % 3600) / 60,
    )}m`;
  }

  private formatSpeed(speed: number): string {
    if (speed < 1) return `${(speed * 1000).toFixed(0)}ms/item`;
    if (speed < 100) return `${speed.toFixed(1)}/s`;
    return `${Math.round(speed)}/s`;
  }

  render(progressData: ProgressDataWithMeta): void {
    const now = performance.now();

    // Throttle updates if configured
    if (
      this.config.updateThrottle > 0 &&
      now - this.lastRenderTime < this.config.updateThrottle
    ) {
      return;
    }
    this.lastRenderTime = now;

    const {
      current,
      total,
      percentage,
      eta,
      speed,
      description,
      isComplete,
      isIndeterminate,
    } = progressData;

    // Prevent duplicate completion messages
    if (isComplete && this.hasRenderedCompletion) {
      return;
    }

    if (this.config.template) {
      this.renderTemplate(progressData);
      return;
    }

    let output = '';

    if (isIndeterminate) {
      if (!this.spinner) this.spinner = new Spinner();
      const spinnerFrame = this.spinner.next();
      output = `${description}: ${Colors.info(spinnerFrame)} Working...`;
    } else {
      const filledLength = Math.floor(
        (percentage / 100) * this.config.barLength,
      );
      const emptyLength = this.config.barLength - filledLength;

      const filledColor = isComplete ? 'green' : 'cyan';
      const filledBar = this.config.useColors
        ? Colors.colorize(
            this.config.filledChar.repeat(filledLength),
            filledColor,
          )
        : this.config.filledChar.repeat(filledLength);

      const emptyBar = this.config.useColors
        ? Colors.dim(this.config.emptyChar.repeat(emptyLength))
        : this.config.emptyChar.repeat(emptyLength);

      const bar = `[${filledBar}${emptyBar}]`;

      let stats = '';
      if (this.config.showPercentage) {
        const pct = this.config.useColors
          ? Colors.colorize(
              `${percentage.toFixed(this.config.precision)}%`,
              'bright',
            )
          : `${percentage.toFixed(this.config.precision)}%`;
        stats += ` ${pct}`;
      }

      stats += ` (${current}/${total})`;

      if (this.config.showSpeed && speed > 0) {
        stats += ` ${Colors.dim(this.formatSpeed(speed))}`;
      }

      if (this.config.showETA && eta > 0) {
        stats += ` ETA: ${Colors.dim(this.formatTime(eta))}`;
      }

      output = `${description}: ${bar}${stats}`;
    }

    // Clear previous line and write new one
    if (TerminalUtils.isInteractive) {
      TerminalUtils.clearLine();
      process.stdout.write(output);

      if (isComplete && !this.hasRenderedCompletion) {
        const completedMsg = this.config.useColors
          ? Colors.success(' ✓ Complete!')
          : ' Complete!';
        process.stdout.write(completedMsg + '\n');
        this.hasRenderedCompletion = true;
      }
    } else {
      // Non-interactive mode - only show milestones
      if (
        isComplete ||
        current === 0 ||
        current % Math.ceil(total / 10) === 0
      ) {
        process.stdout.write(output + '\n');
      }
    }

  }

  private renderTemplate(progressData: ProgressDataWithMeta): void {
    const template = this.config.template;
    if (!template) return;
    const output = template.replace(/\{(\w+)\}/g, (match, key: string) => {
      const value = (progressData as unknown as Record<string, unknown>)[key];
      return value !== undefined ? String(value) : match;
    });
    process.stdout.write(output);
  }

  cleanup(): void {
    if (TerminalUtils.isInteractive) {
      TerminalUtils.showCursor();
    }
    this.hasRenderedCompletion = false;
  }

  reset(): void {
    this.hasRenderedCompletion = false;
    this.lastRenderTime = 0;
  }
}
