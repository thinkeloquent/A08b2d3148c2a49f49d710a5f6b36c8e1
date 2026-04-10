/**
 * @fileoverview Component detection from search results.
 */

const JSX_TAG_RE = /<([A-Z][a-zA-Z0-9]*(?:\.[A-Z][a-zA-Z0-9]*)?)/g;

const DEFAULT_IMPORT_PACKAGES = ['antd', '@ant-design/icons', '@ant-design/pro-components'];

/** @type {Map<string, RegExp[]>} */
const extractPatternCache = new Map();

/**
 * Get cached import extract patterns for the given packages.
 * @param {string[]} [importPackages]
 * @returns {RegExp[]}
 */
function getImportExtractPatterns(importPackages) {
  const pkgs = importPackages || DEFAULT_IMPORT_PACKAGES;
  const key = pkgs.join(',');
  if (!extractPatternCache.has(key)) {
    // Build import patterns: match destructured imports from the packages
    const patterns = pkgs.map((pkg) => {
      const escaped = pkg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(
        String.raw`import\s*\{([^}]+)\}\s*from\s*['"]` + escaped + String.raw`['"]`,
        'g',
      );
    });
    extractPatternCache.set(key, patterns);
  }
  return extractPatternCache.get(key);
}

/**
 * Detect component names from document metadata.
 *
 * @param {Array<[{metadata: Record<string, any>}, number]>} results
 * @returns {string[]} Sorted unique lowercase component names.
 */
export function detectComponentsMetadata(results) {
  const components = new Set();
  for (const [doc] of results) {
    const comp = doc.metadata?.component;
    if (comp) {
      components.add(comp.toLowerCase().trim());
    }
  }
  return [...components].sort();
}

/**
 * Detect component names by parsing document content.
 *
 * @param {Array<[{metadata: Record<string, any>, pageContent: string}, number]>} results
 * @param {string[]} [importPackages]
 * @returns {string[]} Sorted unique lowercase component names.
 */
export function detectComponentsParse(results, importPackages) {
  const components = new Set(detectComponentsMetadata(results));
  const extractPatterns = getImportExtractPatterns(importPackages);

  for (const [doc] of results) {
    const text = doc.pageContent || doc.page_content || '';

    // JSX tags
    for (const m of text.matchAll(JSX_TAG_RE)) {
      components.add(m[1].toLowerCase());
    }

    // Import patterns
    for (const pat of extractPatterns) {
      pat.lastIndex = 0; // reset since we reuse global regexes
      for (const m of text.matchAll(pat)) {
        for (const name of m[1].split(',')) {
          const trimmed = name.trim();
          if (trimmed) {
            components.add(trimmed.toLowerCase());
          }
        }
      }
    }
  }

  return [...components].sort();
}
