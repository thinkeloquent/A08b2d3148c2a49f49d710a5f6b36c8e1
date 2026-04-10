import crypto from 'node:crypto';
import type { TestIdGeneratorConfig } from './types.js';

export const DEFAULT_PARENT_TAGS = [
  'body', 'header', 'footer', 'main', 'article', 'section',
  'nav', 'aside', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'form',
];

export const DEFAULT_TARGET_TAGS = [
  'iframe', 'svg', 'canvas', 'details', 'summary', 'dialog',
];

export const DEFAULT_ATTRIBUTE = 'data-test-id' as const;

/** Default ID generator: `{tagName}-{8-char hex}` */
export function defaultIdGenerator(tagName: string): string {
  return `${tagName}-${crypto.randomBytes(4).toString('hex')}`;
}

/** Merge user config with defaults. */
export function resolveConfig(config?: TestIdGeneratorConfig): Required<TestIdGeneratorConfig> {
  return {
    attribute: config?.attribute ?? DEFAULT_ATTRIBUTE,
    prefix: config?.prefix ?? '',
    parentTags: config?.parentTags ?? DEFAULT_PARENT_TAGS,
    targetTags: config?.targetTags ?? DEFAULT_TARGET_TAGS,
    skipExisting: config?.skipExisting ?? true,
    idGenerator: config?.idGenerator ?? defaultIdGenerator,
    skipDirs: config?.skipDirs ?? [],
  };
}
