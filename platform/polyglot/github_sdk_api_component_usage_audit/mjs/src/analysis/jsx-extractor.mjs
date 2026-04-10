/**
 * JSX Usage Extractor + Reference Extractor
 *
 * Dual-state regex extraction for React component usage patterns:
 *   1. Self-closing: <Component prop="val" />
 *   2. Paired tags:  <Component prop="val">...children...</Component>
 *
 * Supports compound component patterns (e.g. <Accordion.Root />,
 * <Accordion.Item.Header>...</Accordion.Item.Header>) and JSX generic
 * type parameters (e.g. <Accordion.Root<'a'> ... />).
 *
 * Non-JSX references (type declarations, const assignments, namespace
 * access like Accordion.Root.Props) are extracted separately.
 *
 * Max snippet length is capped at 500 characters.
 */

const MAX_SNIPPET_LENGTH = 500;

/**
 * Extract all JSX usages of a named component from source text.
 *
 * Matches direct usage, compound sub-components, and JSX generics:
 *   - `<Component />`
 *   - `<Component.Sub />`
 *   - `<Component.Sub<TypeParam> prop="val" />`
 *   - `<Component.Sub>...</Component.Sub>`
 *
 * @param {string} source - File contents (JSX/TSX/JS/TS/MJS/CJS).
 * @param {string} componentName - Component name to search for (e.g. "Accordion").
 * @returns {string[]} Array of matched JSX snippets (trimmed, max 500 chars each).
 */
export function extractJsxUsages(source, componentName) {
  const escaped = escapeRegExp(componentName);

  // Optional compound suffix: .Root, .Item.Header, etc.
  // Captured as group 1 so paired tags can backreference it.
  const compoundSuffix = "((?:\\.\\w+)*)";

  // Optional generic type parameter: <'a'>, <string>, <Foo<Bar>>, etc.
  // Handles one level of nesting. Uses non-capturing groups only
  // so group numbering for the backreference is preserved.
  const genericParam = "(?:<[^<>]*(?:<[^<>]*>[^<>]*)*>)?";

  // Self-closing: <Component.Sub<TypeParam> ... />
  const selfClosingRe = new RegExp(
    `<${escaped}${compoundSuffix}${genericParam}(\\s[^>]*)?\\s*\\/>`,
    "gms",
  );

  // Paired: <Component.Sub<TypeParam> ...>...</Component.Sub>
  // \\1 backreferences group 1 so the closing tag matches the same sub-component.
  const pairedRe = new RegExp(
    `<${escaped}${compoundSuffix}${genericParam}(\\s[^>]*)?>[\\s\\S]*?<\\/${escaped}\\1>`,
    "gms",
  );

  const matches = new Set();

  for (const m of source.matchAll(selfClosingRe)) {
    matches.add(truncate(m[0].trim()));
  }
  for (const m of source.matchAll(pairedRe)) {
    matches.add(truncate(m[0].trim()));
  }

  return [...matches];
}

/**
 * Extract non-JSX references to a named component from source text.
 *
 * Captures lines where the component name appears outside of JSX tags:
 * type declarations, const/variable assignments, function signatures,
 * import/export statements, namespace access (e.g. Accordion.Root.Props).
 *
 * @param {string} source - File contents (JSX/TSX/JS/TS/MJS/CJS).
 * @param {string} componentName - Component name to search for (e.g. "Accordion").
 * @returns {string[]} Array of reference lines (trimmed, max 500 chars each).
 */
export function extractReferences(source, componentName) {
  const escaped = escapeRegExp(componentName);

  // Match component name (with optional dot-path) NOT preceded by < or </
  // so JSX tag positions are excluded.
  const refRe = new RegExp(
    `(?<!<\\/?)\\b${escaped}(?:\\.\\w+)*`,
    "g",
  );

  const lines = source.split("\n");
  const references = new Set();

  for (const line of lines) {
    refRe.lastIndex = 0;

    let match;
    while ((match = refRe.exec(line)) !== null) {
      // Skip if preceded by a word char (e.g. "NotAccordion")
      const charBefore = match.index > 0 ? line[match.index - 1] : " ";
      if (/\w/.test(charBefore)) continue;

      const trimmed = line.trim();
      if (trimmed) {
        references.add(truncate(trimmed));
      }
      break; // one reference per line is enough
    }
  }

  return [...references];
}

/**
 * Escape special regex characters in a string.
 *
 * @param {string} str
 * @returns {string}
 */
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Truncate a snippet to MAX_SNIPPET_LENGTH characters.
 *
 * @param {string} snippet
 * @returns {string}
 */
function truncate(snippet) {
  if (snippet.length <= MAX_SNIPPET_LENGTH) return snippet;
  return snippet.slice(0, MAX_SNIPPET_LENGTH) + "...";
}
