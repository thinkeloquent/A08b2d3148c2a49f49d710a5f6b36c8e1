export interface LoggerInstance {
  debug(msg: string, ...args: unknown[]): void;
  info(msg: string, ...args: unknown[]): void;
  warn(msg: string, ...args: unknown[]): void;
  error(msg: string, ...args: unknown[]): void;
}

export interface LoggerOptions {
  writer?: {
    debug: (...args: unknown[]) => void;
    info: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
  };
}

export function create(
  packageName: string,
  filename: string,
  options?: LoggerOptions,
): LoggerInstance {
  const prefix = `[${packageName}:${filename}]`;
  const writer = options?.writer ?? console;

  return {
    debug: (msg: string, ...args: unknown[]) =>
      writer.debug(prefix, msg, ...args),
    info: (msg: string, ...args: unknown[]) =>
      writer.info(prefix, msg, ...args),
    warn: (msg: string, ...args: unknown[]) =>
      writer.warn(prefix, msg, ...args),
    error: (msg: string, ...args: unknown[]) =>
      writer.error(prefix, msg, ...args),
  };
}
