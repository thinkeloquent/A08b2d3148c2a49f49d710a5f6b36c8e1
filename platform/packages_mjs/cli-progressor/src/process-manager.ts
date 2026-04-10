import process from 'process';

export class ProcessManager {
  private cleanupTasks = new Set<() => void>();
  private isSetup = false;

  setup(): void {
    if (this.isSetup) return;

    const cleanup = (): void => {
      this.cleanup();
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('exit', () => {
      this.cleanup();
    });

    this.isSetup = true;
  }

  addCleanupTask(task: () => void): () => void {
    this.cleanupTasks.add(task);
    return () => {
      this.cleanupTasks.delete(task);
    };
  }

  cleanup(): void {
    this.cleanupTasks.forEach((task) => {
      try {
        task();
      } catch {
        // Silently caught
      }
    });
  }
}

export const processManager = new ProcessManager();
