import { ConsoleProgressRenderer } from './renderers/console-renderer.js';
import { SilentProgressRenderer } from './renderers/silent-renderer.js';
import { ProgressBar } from './progress-bar.js';
import type { BuilderConfig } from './types.js';

export class ProgressBarBuilder {
  private config: BuilderConfig = {};
  private _total = 100;
  private _description = 'Progress';

  withTotal(total: number): this {
    this._total = total;
    return this;
  }

  withDescription(description: string): this {
    this._description = description;
    return this;
  }

  withBarLength(length: number): this {
    this.config.barLength = length;
    return this;
  }

  withChars(filled: string, empty: string): this {
    this.config.filledChar = filled;
    this.config.emptyChar = empty;
    return this;
  }

  withColors(enabled = true): this {
    this.config.useColors = enabled;
    return this;
  }

  withPrecision(precision: number): this {
    this.config.precision = precision;
    return this;
  }

  showETA(show = true): this {
    this.config.showETA = show;
    return this;
  }

  showSpeed(show = true): this {
    this.config.showSpeed = show;
    return this;
  }

  showPercentage(show = true): this {
    this.config.showPercentage = show;
    return this;
  }

  withTemplate(template: string): this {
    this.config.template = template;
    return this;
  }

  withTestMode(enabled = true): this {
    this.config.testMode = enabled;
    this.config.updateThrottle = enabled ? 100 : 0;
    return this;
  }

  withUpdateThrottle(ms: number): this {
    this.config.updateThrottle = ms;
    return this;
  }

  forSpinner(): this {
    this._total = 0;
    this.config.showPercentage = false;
    this.config.showETA = false;
    return this;
  }

  build(): ProgressBar {
    if (this.config.testMode) {
      const renderer = new ConsoleProgressRenderer({
        ...this.config,
        updateThrottle: this.config.updateThrottle || 100,
      });
      return new ProgressBar(this._total, this._description, renderer);
    }

    const renderer = new ConsoleProgressRenderer(this.config);
    return new ProgressBar(this._total, this._description, renderer);
  }

  buildSilent(): ProgressBar {
    const renderer = new SilentProgressRenderer();
    return new ProgressBar(this._total, this._description, renderer);
  }
}
