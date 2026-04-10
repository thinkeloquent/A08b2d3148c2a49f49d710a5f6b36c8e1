import { performance } from 'perf_hooks';
import { StandardProgressCalculator } from './calculator.js';
import type {
  IProgressCalculator,
  ProgressDataWithMeta,
  ProgressObserver,
  StateObserver,
  TrackerState,
  UnsubscribeFn,
} from './types.js';

export class ProgressTracker {
  total: number;
  private current = 0;
  private description: string;
  private startTime: number;
  private lastUpdateTime: number;
  private calculator: IProgressCalculator;
  private observers = new Set<ProgressObserver>();
  private state: TrackerState = 'idle';
  private stateObservers = new Set<StateObserver>();

  constructor(
    total: number,
    description = 'Progress',
    calculator?: IProgressCalculator,
  ) {
    this.total = total;
    this.description = description;
    this.startTime = performance.now();
    this.lastUpdateTime = this.startTime;
    this.calculator = calculator ?? new StandardProgressCalculator();
  }

  addObserver(observer: ProgressObserver): UnsubscribeFn {
    this.observers.add(observer);
    return () => {
      this.observers.delete(observer);
    };
  }

  removeObserver(observer: ProgressObserver): boolean {
    return this.observers.delete(observer);
  }

  addStateObserver(observer: StateObserver): UnsubscribeFn {
    this.stateObservers.add(observer);
    return () => {
      this.stateObservers.delete(observer);
    };
  }

  removeStateObserver(observer: StateObserver): boolean {
    return this.stateObservers.delete(observer);
  }

  private notifyObservers(progressData: ProgressDataWithMeta): void {
    this.observers.forEach((observer) => {
      try {
        if (typeof observer === 'function') {
          observer(progressData);
        } else if (observer.onProgress) {
          observer.onProgress(progressData);
        }
      } catch {
        // Silently caught — follows "never console.log" spirit
      }
    });
  }

  private notifyStateChange(
    newState: TrackerState,
    oldState: TrackerState,
  ): void {
    this.stateObservers.forEach((observer) => {
      try {
        if (typeof observer === 'function') {
          observer({ newState, oldState, tracker: this });
        } else if (observer.onStateChange) {
          observer.onStateChange({ newState, oldState, tracker: this });
        }
      } catch {
        // Silently caught
      }
    });
  }

  setState(newState: TrackerState): void {
    const oldState = this.state;
    if (oldState !== newState) {
      this.state = newState;
      this.notifyStateChange(newState, oldState);
    }
  }

  getState(): TrackerState {
    return this.state;
  }

  increment(amount = 1): ProgressDataWithMeta {
    if (this.state === 'completed') return this.getProgress();

    this.current = Math.min(this.total, this.current + amount);
    this.lastUpdateTime = performance.now();

    const progress = this.getProgress();

    // State transition detection
    if (progress.isComplete) {
      this.setState('completed');
    }

    this.notifyObservers(progress);
    return progress;
  }

  getProgress(): ProgressDataWithMeta {
    const calculatedData = this.calculator.calculate(
      this.current,
      this.total,
      this.startTime,
      this.lastUpdateTime,
    );

    return {
      ...calculatedData,
      description: this.description,
      state: this.state,
    };
  }

  reset(): void {
    this.current = 0;
    this.startTime = performance.now();
    this.lastUpdateTime = this.startTime;
    this.setState('idle');
    if (this.calculator instanceof StandardProgressCalculator) {
      this.calculator.resetHistory();
    }
  }

  complete(): ProgressDataWithMeta {
    if (this.state === 'completed') {
      return this.getProgress();
    }

    this.current = this.total;
    this.setState('completed');
    return this.getProgress();
  }

  setTotal(total: number): this {
    this.total = total;
    return this;
  }

  isCompleted(): boolean {
    return this.state === 'completed';
  }
}
