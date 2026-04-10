import type { IProgressRenderer, ProgressDataWithMeta } from '../types.js';

export class MultiProgressRenderer implements IProgressRenderer {
  private renderers = new Map<string, IProgressRenderer>();
  private lineCount = 0;

  addProgress(id: string, renderer: IProgressRenderer): void {
    this.renderers.set(id, renderer);
    this.lineCount++;
  }

  removeProgress(id: string): void {
    if (this.renderers.delete(id)) {
      this.lineCount--;
    }
  }

  getLineCount(): number {
    return this.lineCount;
  }

  render(progressData: ProgressDataWithMeta, id?: string): void {
    if (!id) return;
    const renderer = this.renderers.get(id);
    if (!renderer) return;
    renderer.render(progressData);
  }

  cleanup(): void {
    this.renderers.forEach((renderer) => renderer.cleanup());
  }

  reset(): void {
    this.renderers.forEach((renderer) => {
      if (renderer.reset) renderer.reset();
    });
  }
}
