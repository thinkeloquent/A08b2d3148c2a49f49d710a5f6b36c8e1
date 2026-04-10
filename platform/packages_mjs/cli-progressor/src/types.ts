import type { ProgressTracker } from './tracker.js';

// ===== State Types =====

export type TrackerState = 'idle' | 'active' | 'completed';

export type ProgressBarState = 'idle' | 'active' | 'completed' | 'stopped';

// ===== Data Types =====

export interface ProgressData {
  current: number;
  total: number;
  percentage: number;
  elapsed: number;
  eta: number;
  speed: number;
  isComplete: boolean;
  isIndeterminate: boolean;
}

export interface ProgressDataWithMeta extends ProgressData {
  description: string;
  state: TrackerState;
}

export interface ProgressHistoryEntry extends ProgressDataWithMeta {
  timestamp: number;
}

// ===== Observer Types =====

export type ProgressObserverFn = (data: ProgressDataWithMeta) => void;

export interface ProgressObserverObject {
  onProgress(data: ProgressDataWithMeta): void;
}

export type ProgressObserver = ProgressObserverFn | ProgressObserverObject;

export interface StateChangeData {
  newState: TrackerState;
  oldState: TrackerState;
  tracker: ProgressTracker;
}

export type StateObserverFn = (data: StateChangeData) => void;

export interface StateObserverObject {
  onStateChange(data: StateChangeData): void;
}

export type StateObserver = StateObserverFn | StateObserverObject;

export type UnsubscribeFn = () => void;

// ===== Renderer Interface =====

export interface IProgressRenderer {
  render(progressData: ProgressDataWithMeta, id?: string): void;
  cleanup(): void;
  reset?(): void;
}

// ===== Calculator Interface =====

export interface IProgressCalculator {
  calculate(
    current: number,
    total: number,
    startTime: number,
    lastUpdate: number,
  ): ProgressData;
}

// ===== Config Types =====

export interface ConsoleRendererConfig {
  barLength?: number;
  filledChar?: string;
  emptyChar?: string;
  showETA?: boolean;
  showSpeed?: boolean;
  showPercentage?: boolean;
  precision?: number;
  useColors?: boolean;
  template?: string | null;
  updateThrottle?: number;
  testMode?: boolean;
}

export interface BuilderConfig extends ConsoleRendererConfig {}

// ===== Helper Types =====

export type ProgressUpdateFn = (increment?: number) => void;

export type AsyncTaskWithProgress<T> = (
  updateProgress: ProgressUpdateFn,
) => Promise<T>;

export type AsyncTask<T> = () => Promise<T>;

export interface ProgressWithStateResult<T> {
  result: T;
  stateHistory: Array<StateChangeData & { timestamp: number }>;
}
