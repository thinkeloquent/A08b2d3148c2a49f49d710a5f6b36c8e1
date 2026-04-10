/**
 * Logger Infrastructure for fetch-undici
 *
 * Provides structured logging with verbose output for defensive programming.
 * Usage: const log = logger.create('fetch-undici', import.meta.url)
 */

/** Log levels in order of verbosity */
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'silent'

/** Log level numeric values for comparison */
const LOG_LEVELS: Record<LogLevel, number> = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  silent: 5
}

/** Structure of a log entry */
export interface LogEntry {
  level: LogLevel
  timestamp: string
  package: string
  file: string
  message: string
  context?: Record<string, unknown>
}

/** Options for logger creation */
export interface LoggerOptions {
  level?: LogLevel
  transport?: (entry: LogEntry) => void
  json?: boolean
  redact?: string[]
}

/** Logger interface with level methods */
export interface Logger {
  trace(message: string, context?: Record<string, unknown>): void
  debug(message: string, context?: Record<string, unknown>): void
  info(message: string, context?: Record<string, unknown>): void
  warn(message: string, context?: Record<string, unknown>): void
  error(message: string, context?: Record<string, unknown>): void
  child(context: Record<string, unknown>): Logger
  setLevel(level: LogLevel): void
  getLevel(): LogLevel
}

/** Default keys to redact from logs */
const DEFAULT_REDACT_KEYS = [
  'password',
  'secret',
  'token',
  'apiKey',
  'api_key',
  'authorization',
  'auth',
  'credential',
  'private'
]

/**
 * Redact sensitive values from context object
 */
function redactSensitive(
  obj: Record<string, unknown>,
  redactKeys: string[]
): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase()
    const shouldRedact = redactKeys.some((k) => lowerKey.includes(k.toLowerCase()))

    if (shouldRedact) {
      result[key] = '[REDACTED]'
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = redactSensitive(value as Record<string, unknown>, redactKeys)
    } else {
      result[key] = value
    }
  }

  return result
}

/**
 * Extract filename from import.meta.url or string path
 */
function extractFilename(filename: string | URL): string {
  if (filename instanceof URL) {
    const pathname = filename.pathname
    return pathname.split('/').pop() || 'unknown'
  }

  if (filename.startsWith('file://')) {
    try {
      const url = new URL(filename)
      return url.pathname.split('/').pop() || 'unknown'
    } catch {
      return filename.split('/').pop() || 'unknown'
    }
  }

  return filename.split('/').pop() || 'unknown'
}

/**
 * Get log level from environment variable
 */
function getEnvLogLevel(): LogLevel {
  const envLevel = process.env['LOG_LEVEL']?.toLowerCase()
  if (envLevel && envLevel in LOG_LEVELS) {
    return envLevel as LogLevel
  }
  return 'info'
}

/**
 * Default console transport
 */
function defaultTransport(entry: LogEntry, json: boolean): void {
  const output = json ? JSON.stringify(entry) : formatLogEntry(entry)

  switch (entry.level) {
    case 'trace':
    case 'debug':
      // eslint-disable-next-line no-console
      console.debug(output)
      break
    case 'info':
      // eslint-disable-next-line no-console
      console.info(output)
      break
    case 'warn':
      // eslint-disable-next-line no-console
      console.warn(output)
      break
    case 'error':
      // eslint-disable-next-line no-console
      console.error(output)
      break
  }
}

/**
 * Format log entry for human-readable output
 */
function formatLogEntry(entry: LogEntry): string {
  const { timestamp, level, package: pkg, file, message, context } = entry
  const levelStr = level.toUpperCase().padEnd(5)
  const prefix = `${timestamp} [${levelStr}] ${pkg}/${file}:`

  if (context && Object.keys(context).length > 0) {
    return `${prefix} ${message} ${JSON.stringify(context)}`
  }

  return `${prefix} ${message}`
}

/**
 * Create a logger instance
 */
function createLoggerInstance(
  packageName: string,
  filename: string | URL,
  options: LoggerOptions = {},
  parentContext: Record<string, unknown> = {}
): Logger {
  const file = extractFilename(filename)
  let currentLevel = options.level ?? getEnvLogLevel()
  const transport = options.transport
  const json = options.json ?? (process.env['LOG_FORMAT'] === 'json')
  const redactKeys = [...DEFAULT_REDACT_KEYS, ...(options.redact ?? [])]

  function shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel]
  }

  function log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (!shouldLog(level)) return

    const mergedContext = { ...parentContext, ...context }
    const redactedContext =
      Object.keys(mergedContext).length > 0 ? redactSensitive(mergedContext, redactKeys) : undefined

    const entry: LogEntry = {
      level,
      timestamp: new Date().toISOString(),
      package: packageName,
      file,
      message,
      context: redactedContext
    }

    if (transport) {
      transport(entry)
    } else {
      defaultTransport(entry, json)
    }
  }

  return {
    trace: (message, context) => log('trace', message, context),
    debug: (message, context) => log('debug', message, context),
    info: (message, context) => log('info', message, context),
    warn: (message, context) => log('warn', message, context),
    error: (message, context) => log('error', message, context),

    child(context: Record<string, unknown>): Logger {
      return createLoggerInstance(packageName, filename, options, {
        ...parentContext,
        ...context
      })
    },

    setLevel(level: LogLevel): void {
      currentLevel = level
    },

    getLevel(): LogLevel {
      return currentLevel
    }
  }
}

/**
 * Logger factory
 *
 * @param packageName - Name of the package (e.g., 'fetch-undici')
 * @param filename - Module filename, typically import.meta.url
 * @param options - Optional logger configuration
 * @returns Logger instance
 *
 * @example
 * ```typescript
 * import { logger } from './logger.js'
 * const log = logger.create('fetch-undici', import.meta.url)
 *
 * log.debug('Request starting', { method: 'GET', url: '/users' })
 * log.info('Client created', { baseUrl: 'https://api.example.com' })
 * log.error('Request failed', { error: err.message })
 * ```
 */
export function create(
  packageName: string,
  filename: string | URL,
  options?: LoggerOptions
): Logger {
  return createLoggerInstance(packageName, filename, options)
}

/** Logger factory object */
export const logger = {
  create,
  LOG_LEVELS,
  getEnvLogLevel
}

export default logger
