/**
 * Supported ID attribute strategies.
 * - 'id': standard HTML `id` attribute
 * - 'data-testid': common React Testing Library convention
 * - custom string: any attribute name (e.g. 'data-test-id', 'data-cy')
 */
export type IdAttribute = 'id' | 'data-test-id' | (string & {});

/** Configuration for the test ID generator. */
export interface TestIdGeneratorConfig {
  /** The attribute name to inject. Defaults to 'data-test-id'. */
  attribute?: IdAttribute;

  /** Prefix for generated ID values. Defaults to the element's tag name. */
  prefix?: string;

  /**
   * Custom ID generator function.
   * Receives the tag name and must return a unique string.
   * Defaults to `${tagName}-${randomHex}`.
   */
  idGenerator?: (tagName: string) => string;

  /** Parent tags whose direct children should receive IDs. */
  parentTags?: string[];

  /** Tags that should always receive IDs regardless of parent. */
  targetTags?: string[];

  /** Skip elements that already have the configured attribute. Defaults to true. */
  skipExisting?: boolean;

  /** Additional directory names to skip during scanning (merged with built-in defaults). */
  skipDirs?: string[];
}

/** Result from processing a single source. */
export interface ProcessResult {
  /** The (possibly modified) source content. */
  code: string;

  /** Whether any IDs were injected. */
  modified: boolean;

  /** Number of IDs injected. */
  count: number;
}

/** Result from scanning a directory. */
export interface ScanResult {
  /** Files that were modified. */
  modifiedFiles: string[];

  /** Total number of IDs injected across all files. */
  totalInjected: number;

  /** Files that were scanned but not modified. */
  skippedFiles: string[];

  /** Files that errored during processing. */
  errorFiles: Array<{ file: string; error: string }>;
}

/** Supported file types for processing. */
export type FileType = 'jsx' | 'tsx' | 'html';
