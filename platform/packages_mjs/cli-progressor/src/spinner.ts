const SPINNER_PRESETS = {
  dots: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  line: ['-', '\\', '|', '/'],
  arrow: ['←', '↖', '↑', '↗', '→', '↘', '↓', '↙'],
  bounce: ['⠁', '⠂', '⠄', '⠂'],
  clock: [
    '🕐', '🕑', '🕒', '🕓', '🕔', '🕕',
    '🕖', '🕗', '🕘', '🕙', '🕚', '🕛',
  ],
} as const;

export type SpinnerPreset = keyof typeof SPINNER_PRESETS;

export class Spinner {
  private frames: readonly string[];
  private current = 0;

  constructor(frames: readonly string[] = SPINNER_PRESETS.dots) {
    this.frames = frames;
  }

  next(): string {
    const frame = this.frames[this.current]!;
    this.current = (this.current + 1) % this.frames.length;
    return frame;
  }

  static get presets(): typeof SPINNER_PRESETS {
    return SPINNER_PRESETS;
  }
}
