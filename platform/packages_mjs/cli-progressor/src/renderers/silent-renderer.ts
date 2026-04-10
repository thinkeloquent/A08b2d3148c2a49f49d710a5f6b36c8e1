import type {
  IProgressRenderer,
  ProgressDataWithMeta,
  ProgressHistoryEntry,
} from '../types.js';

export class SilentProgressRenderer implements IProgressRenderer {
  private progressHistory: ProgressHistoryEntry[] = [];
  private lastProgress: ProgressDataWithMeta | null = null;

  render(progressData: ProgressDataWithMeta): void {
    this.lastProgress = { ...progressData };
    this.progressHistory.push({ ...progressData, timestamp: Date.now() });
  }

  getLastProgress(): ProgressDataWithMeta | null {
    return this.lastProgress;
  }

  getHistory(): ProgressHistoryEntry[] {
    return [...this.progressHistory];
  }

  clear(): void {
    this.progressHistory = [];
    this.lastProgress = null;
  }

  cleanup(): void {
    // Silent renderer doesn't need cleanup
  }

  reset(): void {
    this.clear();
  }
}
