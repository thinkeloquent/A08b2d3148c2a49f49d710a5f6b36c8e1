/** Regex that matches both {{token}} and {{ token }} (with optional whitespace) */
export const TOKEN_REGEX = /\{\{\s*(\w+)\s*\}\}/g;

/** Extract unique {{token}} names from a template string, preserving order of first appearance */
export function extractTokens(template: string): string[] {
  const regex = new RegExp(TOKEN_REGEX.source, TOKEN_REGEX.flags);
  const tokens: string[] = [];
  const seen = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = regex.exec(template)) !== null) {
    if (!seen.has(match[1])) {
      seen.add(match[1]);
      tokens.push(match[1]);
    }
  }
  return tokens;
}

/** Highlight token placeholders in a template string with HTML mark tags */
export function highlightTokens(template: string): string {
  return template.replace(
    TOKEN_REGEX,
    '<mark class="bg-indigo-100 text-indigo-700 rounded px-0.5 font-mono">$&</mark>',
  );
}

/** Guess a token's data type from its name */
export function guessType(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('email')) return 'email';
  if (n.includes('url') || n.includes('link')) return 'url';
  if (n.includes('date')) return 'date';
  if (
    n.includes('quantity') ||
    n.includes('count') ||
    n.includes('num') ||
    n.includes('price') ||
    n.includes('amount')
  )
    return 'number';
  return 'text';
}
