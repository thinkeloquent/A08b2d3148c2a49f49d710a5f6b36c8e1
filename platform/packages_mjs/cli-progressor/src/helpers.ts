import process from 'process';
import { Colors } from './terminal.js';
import { ProgressBar } from './progress-bar.js';
import { ProgressBarBuilder } from './builder.js';
import type {
  AsyncTask,
  AsyncTaskWithProgress,
  ProgressWithStateResult,
  StateChangeData,
} from './types.js';

export class CLIProgressHelper {
  static async withProgress<T>(
    total: number,
    description: string,
    asyncTask: AsyncTaskWithProgress<T>,
  ): Promise<T> {
    const progressBar = new ProgressBarBuilder()
      .withTotal(total)
      .withDescription(description)
      .build();

    progressBar.start();

    try {
      const result = await asyncTask((increment = 1) => {
        progressBar.update(increment);
      });

      if (!progressBar.isCompleted()) {
        progressBar.complete();
      }

      return result;
    } catch (error) {
      progressBar.stop();
      const message = error instanceof Error ? error.message : String(error);
      process.stdout.write(
        Colors.error(`\n✗ ${description} failed: ${message}`) + '\n',
      );
      throw error;
    }
  }

  static async withSpinner<T>(
    description: string,
    asyncTask: AsyncTask<T>,
  ): Promise<T> {
    const spinner = ProgressBar.createSpinner(description);
    spinner.start();

    try {
      const result = await asyncTask();
      spinner.stop();
      process.stdout.write(
        Colors.success(`✓ ${description} completed`) + '\n',
      );
      return result;
    } catch (error) {
      spinner.stop();
      const message = error instanceof Error ? error.message : String(error);
      process.stdout.write(
        Colors.error(`✗ ${description} failed: ${message}`) + '\n',
      );
      throw error;
    }
  }

  static async withProgressAndState<T>(
    total: number,
    description: string,
    asyncTask: AsyncTaskWithProgress<T>,
  ): Promise<ProgressWithStateResult<T>> {
    const progressBar = new ProgressBarBuilder()
      .withTotal(total)
      .withDescription(description)
      .build();

    const stateHistory: Array<StateChangeData & { timestamp: number }> = [];

    const unsubscribeState = progressBar.onStateChange((stateData) => {
      stateHistory.push({
        timestamp: Date.now(),
        ...stateData,
      });
    });

    progressBar.start();

    try {
      const result = await asyncTask((increment = 1) => {
        progressBar.update(increment);
      });

      if (!progressBar.isCompleted()) {
        progressBar.complete();
      }

      unsubscribeState();
      return { result, stateHistory };
    } catch (error) {
      progressBar.stop();
      unsubscribeState();
      const message = error instanceof Error ? error.message : String(error);
      process.stdout.write(
        Colors.error(`\n✗ ${description} failed: ${message}`) + '\n',
      );
      throw error;
    }
  }
}
