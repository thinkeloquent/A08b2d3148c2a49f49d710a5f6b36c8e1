/**
 * Component Extractor
 * Detects React component definitions in JSX/TSX source files.
 */

/**
 * Extract React component definitions from source code.
 * Detects PascalCase exported functions/classes that are likely React components.
 *
 * @param {string} source - File content
 * @param {string} filePath - File path (for context)
 * @returns {Array<{ name: string, exportType: string, kind: string, filePath: string }>}
 */
export function extractComponentDefinitions(source, filePath) {
  const components = [];
  const seen = new Set();

  function add(name, exportType, kind) {
    if (seen.has(name)) return;
    // Must be PascalCase (starts with uppercase letter)
    if (!/^[A-Z]/.test(name)) return;
    // Skip common non-component patterns
    if (/^(Props|State|Context|Provider|Consumer|Type|Interface|Enum|Schema|Config|Options|Ref|Style)$/i.test(name)) return;
    seen.add(name);
    components.push({ name, exportType, kind, filePath });
  }

  // 1. export function ComponentName(
  const exportFnRe = /export\s+function\s+([A-Z][a-zA-Z0-9]+)\s*[<(]/g;
  for (const m of source.matchAll(exportFnRe)) {
    add(m[1], 'named', 'function');
  }

  // 2. export const ComponentName = (React.forwardRef|React.memo|memo|forwardRef|styled|...|(props) =>)
  const exportConstRe = /export\s+const\s+([A-Z][a-zA-Z0-9]+)\s*(?::\s*\w[^=]*)?\s*=/g;
  for (const m of source.matchAll(exportConstRe)) {
    add(m[1], 'named', 'const');
  }

  // 3. export default function ComponentName(
  const exportDefaultFnRe = /export\s+default\s+function\s+([A-Z][a-zA-Z0-9]+)\s*[<(]/g;
  for (const m of source.matchAll(exportDefaultFnRe)) {
    add(m[1], 'default', 'function');
  }

  // 4. export default class ComponentName extends (React.)?(Component|PureComponent)
  const exportClassRe = /export\s+(?:default\s+)?class\s+([A-Z][a-zA-Z0-9]+)\s+extends\s+(?:React\.)?(?:Component|PureComponent)/g;
  for (const m of source.matchAll(exportClassRe)) {
    const isDefault = m[0].includes('default');
    add(m[1], isDefault ? 'default' : 'named', 'class');
  }

  // 5. Re-exports: export { ComponentName } from or export { default as ComponentName } from
  const reExportRe = /export\s*\{([^}]+)\}\s*from/g;
  for (const m of source.matchAll(reExportRe)) {
    const exports = m[1].split(',');
    for (const exp of exports) {
      const trimmed = exp.trim();
      // Handle "default as ComponentName"
      const asMatch = trimmed.match(/(?:default\s+as\s+)?([A-Z][a-zA-Z0-9]+)/);
      if (asMatch) {
        add(asMatch[1], 'named', 're-export');
      }
    }
  }

  return components;
}

/**
 * Extract a brief description from source (first JSDoc comment or first line comment above the component).
 * @param {string} source
 * @param {string} componentName
 * @returns {string|null}
 */
export function extractDescription(source, componentName) {
  // Try to find JSDoc above the component declaration
  const jsdocRe = new RegExp(
    `/\\*\\*([\\s\\S]*?)\\*/\\s*(?:export\\s+)?(?:default\\s+)?(?:function|const|class)\\s+${componentName}`,
  );
  const jsdocMatch = source.match(jsdocRe);
  if (jsdocMatch) {
    const comment = jsdocMatch[1]
      .replace(/^\s*\*\s?/gm, '') // strip leading * from each line
      .replace(/@\w+.*$/gm, '')    // remove @tags
      .trim()
      .split('\n')[0]              // first line only
      .trim();
    if (comment.length > 5) return comment;
  }

  return null;
}

/**
 * Attempt to infer taxonomy level from file path heuristics.
 * @param {string} filePath
 * @returns {string}
 */
export function inferTaxonomyLevel(filePath) {
  const lower = filePath.toLowerCase();
  if (/atoms?[/\\]/i.test(lower)) return 'Atom';
  if (/molecules?[/\\]/i.test(lower)) return 'Molecule';
  if (/organisms?[/\\]/i.test(lower)) return 'Organism';
  if (/templates?[/\\]/i.test(lower)) return 'Template';
  if (/pages?[/\\]/i.test(lower) || /views?[/\\]/i.test(lower)) return 'Page';
  if (/layout/i.test(lower)) return 'Template';
  if (/button|badge|icon|chip|avatar|tag|label|divider|spinner|tooltip/i.test(lower)) return 'Atom';
  if (/card|list|menu|tab|modal|dialog|drawer|popover|dropdown/i.test(lower)) return 'Molecule';
  if (/form|table|grid|nav|header|footer|sidebar/i.test(lower)) return 'Organism';
  return 'Organism'; // default
}
