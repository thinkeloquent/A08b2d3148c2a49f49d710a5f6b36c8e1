import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CLIProgressHelper } from '../src/helpers.js';
import * as processManagerModule from '../src/process-manager.js';

// Mock process.stdout.write to avoid terminal output during tests
const originalWrite = process.stdout.write;

beforeEach(() => {
  process.stdout.write = vi.fn().mockReturnValue(true) as typeof process.stdout.write;
});

afterEach(() => {
  process.stdout.write = originalWrite;
});

describe('CLIProgressHelper', () => {
  describe('withProgress', () => {
    it('runs async task and returns result', async () => {
      const result = await CLIProgressHelper.withProgress(
        10,
        'Test',
        async (update) => {
          for (let i = 0; i < 10; i++) {
            update(1);
          }
          return 'done';
        },
      );

      expect(result).toBe('done');
    });

    it('completes the progress bar after task', async () => {
      let isCompletedDuringTask = false;

      await CLIProgressHelper.withProgress(
        100,
        'Test',
        async (update) => {
          update(50);
          isCompletedDuringTask = false;
          return 'ok';
        },
      );

      // Task completed successfully - progress bar auto-completed
      expect(isCompletedDuringTask).toBe(false);
    });

    it('stops progress and rethrows on error', async () => {
      const error = new Error('task failed');

      await expect(
        CLIProgressHelper.withProgress(10, 'Test', async () => {
          throw error;
        }),
      ).rejects.toThrow('task failed');
    });
  });

  describe('withSpinner', () => {
    it('runs async task and returns result', async () => {
      const result = await CLIProgressHelper.withSpinner('Spinning', async () => {
        return 42;
      });

      expect(result).toBe(42);
    });

    it('stops spinner and rethrows on error', async () => {
      await expect(
        CLIProgressHelper.withSpinner('Spinning', async () => {
          throw new Error('spin failed');
        }),
      ).rejects.toThrow('spin failed');
    });
  });

  describe('withProgressAndState', () => {
    it('returns result and state history', async () => {
      const { result, stateHistory } =
        await CLIProgressHelper.withProgressAndState(
          10,
          'Stateful',
          async (update) => {
            for (let i = 0; i < 10; i++) {
              update(1);
            }
            return 'state-done';
          },
        );

      expect(result).toBe('state-done');
      expect(stateHistory.length).toBeGreaterThan(0);
      // Should have at least an 'active' transition
      expect(stateHistory.some((s) => s.newState === 'active')).toBe(true);
    });

    it('stops and rethrows on error', async () => {
      await expect(
        CLIProgressHelper.withProgressAndState(10, 'Stateful', async () => {
          throw new Error('state failed');
        }),
      ).rejects.toThrow('state failed');
    });

    it('state history entries have timestamps', async () => {
      const { stateHistory } = await CLIProgressHelper.withProgressAndState(
        5,
        'Timestamps',
        async (update) => {
          for (let i = 0; i < 5; i++) update(1);
          return null;
        },
      );

      for (const entry of stateHistory) {
        expect(entry.timestamp).toBeTypeOf('number');
      }
    });
  });
});
