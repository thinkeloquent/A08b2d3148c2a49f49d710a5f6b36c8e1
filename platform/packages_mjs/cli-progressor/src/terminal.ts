import process from 'process';

export class TerminalUtils {
  static get isInteractive(): boolean {
    return (process.stdout.isTTY ?? false) && process.env['CI'] !== 'true';
  }

  static get columns(): number {
    return process.stdout.columns || 80;
  }

  static get supportsColor(): boolean {
    return (process.stdout.isTTY ?? false) && process.env['FORCE_COLOR'] !== '0';
  }

  static moveCursor(dx: number, dy: number): void {
    if (this.isInteractive) {
      process.stdout.write(`\x1b[${dy}A\x1b[${dx}G`);
    }
  }

  static clearLine(): void {
    if (this.isInteractive) {
      process.stdout.write('\x1b[2K\r');
    }
  }

  static hideCursor(): void {
    if (this.isInteractive) {
      process.stdout.write('\x1b[?25l');
    }
  }

  static showCursor(): void {
    if (this.isInteractive) {
      process.stdout.write('\x1b[?25h');
    }
  }
}

const COLOR_CODES = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
} as const;

export type ColorName = keyof typeof COLOR_CODES;

export class Colors {
  static get codes(): typeof COLOR_CODES {
    return COLOR_CODES;
  }

  static colorize(text: string, color: ColorName): string {
    if (!TerminalUtils.supportsColor) return text;
    return `${COLOR_CODES[color] ?? ''}${text}${COLOR_CODES.reset}`;
  }

  static success(text: string): string {
    return Colors.colorize(text, 'green');
  }

  static error(text: string): string {
    return Colors.colorize(text, 'red');
  }

  static warning(text: string): string {
    return Colors.colorize(text, 'yellow');
  }

  static info(text: string): string {
    return Colors.colorize(text, 'cyan');
  }

  static dim(text: string): string {
    return Colors.colorize(text, 'dim');
  }
}
