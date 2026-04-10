/**
 * Type declarations for computed-url-builder package.
 */

import { Logger, LoggerOptions } from './logger';

/**
 * Environment to URL mapping.
 * Values can be strings (host) or arrays (URL parts).
 */
export type UrlKeys = Record<string, string | string[]>;

/**
 * Options for creating a URL builder.
 */
export interface BuilderOptions {
  /**
   * Custom logger instance.
   */
  logger?: Logger;
}

/**
 * URL builder instance interface.
 */
export interface UrlBuilder {
  /**
   * The environment URL configuration.
   */
  readonly env: UrlKeys;

  /**
   * The base path appended to string URLs.
   */
  readonly basePath: string;

  /**
   * Build a URL for the specified environment key.
   *
   * @param key - Environment key (e.g., 'dev', 'prod')
   * @returns Complete URL
   * @throws Error if environment key is not found
   */
  build(key: string): string;

  /**
   * Serialize the builder state to a JSON-compatible object.
   *
   * @returns Object containing env and basePath
   */
  toJSON(): {
    env: UrlKeys;
    basePath: string;
  };
}

/**
 * Create a URL builder instance.
 *
 * @param urlKeys - Environment to URL mapping
 * @param basePath - Base path to append to string URLs
 * @param options - Builder options
 * @returns URL builder instance
 */
declare function createUrlBuilder(
  urlKeys?: UrlKeys,
  basePath?: string,
  options?: BuilderOptions
): UrlBuilder;

declare namespace createUrlBuilder {
  /**
   * Create a URL builder from environment variables.
   *
   * @param prefix - Environment variable prefix (default: 'URL_BUILDER_')
   * @param basePath - Base path to append to string URLs
   * @param options - Builder options
   * @returns URL builder instance
   */
  function fromEnv(
    prefix?: string,
    basePath?: string,
    options?: BuilderOptions
  ): UrlBuilder;
}

export default createUrlBuilder;

/**
 * Create a logger instance.
 */
export declare function createLogger(
  packageName: string,
  filename: string,
  options?: LoggerOptions
): Logger;

/**
 * Create a null logger that discards all messages.
 */
export declare function createNullLogger(): Logger;

export { Logger, LoggerOptions };
