/**
 * Logger module for fetch-http-cache-response.
 */

const DEBUG = 10;
const INFO = 20;
const WARN = 30;
const ERROR = 40;

const LOG_LEVEL = parseInt(process.env.FETCH_CACHE_LOG_LEVEL || String(DEBUG), 10);

const PACKAGE_NAME = "fetch-http-cache-response";

function extractFilename(filename: string): string {
  if (filename.startsWith("file://")) filename = filename.split("/").pop()!;
  if (filename.includes("/")) filename = filename.split("/").pop()!;
  if (filename.endsWith(".ts")) filename = filename.slice(0, -3);
  if (filename.endsWith(".mjs")) filename = filename.slice(0, -4);
  if (filename.endsWith(".js")) filename = filename.slice(0, -3);
  return filename;
}

export interface LoggerLike {
  debug(message: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  child(instanceName: string): LoggerLike;
}

export class Logger implements LoggerLike {
  #package: string;
  #filename: string;
  #instance: string | null;
  #level: number;
  #output: (msg: string) => void;

  constructor(
    packageName: string,
    filename: string,
    instance: string | null = null,
    level: number = LOG_LEVEL,
    output: (msg: string) => void = console.log,
  ) {
    this.#package = packageName;
    this.#filename = extractFilename(filename);
    this.#instance = instance;
    this.#level = level;
    this.#output = output;
  }

  #log(level: string, levelValue: number, message: string): void {
    if (levelValue >= this.#level) {
      const prefix = this.#instance
        ? `[${level}] [${this.#package}:${this.#filename}] [${this.#instance}]`
        : `[${level}] [${this.#package}:${this.#filename}]`;
      this.#output(`${prefix} ${message}`);
    }
  }

  debug(message: string): void { this.#log("DEBUG", DEBUG, message); }
  info(message: string): void { this.#log("INFO", INFO, message); }
  warn(message: string): void { this.#log("WARN", WARN, message); }
  error(message: string): void { this.#log("ERROR", ERROR, message); }

  child(instanceName: string): Logger {
    return new Logger(
      this.#package,
      `${this.#filename}:${this.#instance || ""}`,
      instanceName,
      this.#level,
      this.#output,
    );
  }
}

export function createLogger(
  filename: string,
  options: { level?: number; output?: (msg: string) => void } = {},
): Logger {
  return new Logger(
    PACKAGE_NAME,
    filename,
    null,
    options.level ?? LOG_LEVEL,
    options.output ?? console.log,
  );
}
