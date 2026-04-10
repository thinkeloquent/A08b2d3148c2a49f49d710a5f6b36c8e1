import * as cheerio from 'cheerio';
import { resolveConfig } from './defaults.js';
import type { TestIdGeneratorConfig, ProcessResult } from './types.js';

/**
 * Process HTML source content, injecting test ID attributes
 * into elements matching the configured rules.
 */
export function processHtml(content: string, config?: TestIdGeneratorConfig): ProcessResult {
  const resolved = resolveConfig(config);
  const { attribute, parentTags, targetTags, skipExisting, idGenerator } = resolved;

  const $ = cheerio.load(content, { recognizeSelfClosing: true } as any);
  let count = 0;

  // Direct children of parent tags
  const childSelector = parentTags.map(tag => `${tag} > *`).join(', ');

  // Target tags anywhere
  const targetSelector = targetTags.join(', ');

  const combinedSelector = [childSelector, targetSelector].filter(Boolean).join(', ');
  const elements = $(combinedSelector);

  elements.each((_: number, el: any) => {
    const $el = $(el);
    if (skipExisting && $el.attr(attribute)) return;

    const tagName = (el.tagName || el.name || 'el').toLowerCase();
    $el.attr(attribute, idGenerator(tagName));
    count++;
  });

  if (count === 0) {
    return { code: content, modified: false, count: 0 };
  }

  return { code: $.html(), modified: true, count };
}
