/**
 * Extract all variable names referenced in a template via
 * double/triple mustache tokens and @if() directives.
 */
export function extractVariables(template: string): string[] {
  const vars = new Set<string>();
  const mustacheRe = /\{{2,3}\s*([\w.]+)\s*\}{2,3}/g;
  const ifRe = /@if\(\s*([\w.]+)\s*\)/g;
  let m: RegExpExecArray | null;
  while ((m = mustacheRe.exec(template)) !== null) vars.add(m[1]!);
  while ((m = ifRe.exec(template)) !== null) vars.add(m[1]!);
  return [...vars];
}

/**
 * Resolve a template string against a data dictionary.
 * Supports @if()...@end conditional blocks, triple-mustache (unescaped),
 * and double-mustache (HTML-escaped) interpolation.
 */
export function resolveTemplate(template: string, data: Record<string, string>): string {
  let output = template;
  output = output.replace(/@if\(\s*([\w.]+)\s*\)([^@]*(?:@(?!end)[^@]*)*)@end/g, (_, key, block) => {
    return data[key] ? block : '';
  });
  output = output.replace(/\{\{\{\s*([\w.]+(?:\(\))?)\s*\}\}\}/g, (_, key) => {
    return data[key] !== undefined ? String(data[key]) : `{{{ ${key} }}}`;
  });
  output = output.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => {
    const val = data[key] !== undefined ? String(data[key]) : `{{ ${key} }}`;
    return val.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  });
  output = output.replace(/\n{3,}/g, '\n\n');
  return output.trim();
}

/**
 * Syntax-highlight a template string, returning one HTML string per line.
 * Highlights mustache tokens, @if directives, code fences, comments, and headings.
 */
export function highlightSyntax(text: string): string[] {
  const lines = text.split('\n');
  return lines.map((line) => {
    let html = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    html = html.replace(
      /(\{{3}\s*)([\w.]+(?:\(\))?)(\s*\}{3})/g,
      '<span style="color:#7c3aed">$1</span><span style="color:#6d28d9;font-weight:600">$2</span><span style="color:#7c3aed">$3</span>',
    );
    html = html.replace(
      /(\{{2}\s*)([\w.]+)(\s*\}{2})/g,
      '<span style="color:#2563eb">$1</span><span style="color:#1d4ed8;font-weight:600">$2</span><span style="color:#2563eb">$3</span>',
    );
    html = html.replace(
      /(@(?:if|end|elseif|else|each)\b)(\([^)]*\))?/g,
      '<span style="color:#db2777;font-weight:600">$1</span><span style="color:#c2410c">$2</span>',
    );
    html = html.replace(
      /(```bash|```)/g,
      '<span style="color:#16a34a">$1</span>',
    );
    html = html.replace(
      /(\/\/.*$)/g,
      '<span style="color:#9ca3af;font-style:italic">$1</span>',
    );
    html = html.replace(
      /^(#{1,3}\s.*)$/g,
      '<span style="color:#b45309;font-weight:700">$1</span>',
    );
    return html;
  });
}

/**
 * Parse a flat key: value YAML string (no nesting, no arrays).
 * Comments (#) and empty lines are skipped.
 */
export function parseSimpleYaml(yamlStr: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of yamlStr.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;
    const key = trimmed.slice(0, colonIdx).trim().replace(/^["']|["']$/g, '');
    let val = trimmed.slice(colonIdx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (key) result[key] = val;
  }
  return result;
}

/**
 * Flatten a nested object into dot-separated keys with string values.
 */
export function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const flat: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(flat, flattenObject(v as Record<string, unknown>, key));
    } else {
      flat[key] = String(v ?? '');
    }
  }
  return flat;
}
