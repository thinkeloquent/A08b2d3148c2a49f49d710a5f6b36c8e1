import { ProgressBarBuilder } from './builder.js';
import { ProgressBar } from './progress-bar.js';
import type { ProgressDataWithMeta } from './types.js';

export class MultiProgressManager {
  private progressBars = new Map<string, ProgressBar>();

  add(
    id: string,
    total: number,
    description: string,
  ): ProgressBar {
    const progressBar = new ProgressBarBuilder()
      .withTotal(total)
      .withDescription(description)
      .build();

    this.progressBars.set(id, progressBar);
    return progressBar;
  }

  get(id: string): ProgressBar | undefined {
    return this.progressBars.get(id);
  }

  remove(id: string): void {
    const progressBar = this.progressBars.get(id);
    if (progressBar) {
      progressBar.stop();
      this.progressBars.delete(id);
    }
  }

  update(id: string, increment = 1): ProgressDataWithMeta | null {
    const progressBar = this.progressBars.get(id);
    return progressBar ? progressBar.update(increment) : null;
  }

  complete(id: string): ProgressDataWithMeta | null {
    const progressBar = this.progressBars.get(id);
    return progressBar ? progressBar.complete() : null;
  }

  clear(): void {
    this.progressBars.forEach((progressBar) => progressBar.stop());
    this.progressBars.clear();
  }
}
