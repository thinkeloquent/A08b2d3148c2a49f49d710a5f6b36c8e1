/**
 * Compile an Edge.js-like template string by replacing `{{ variable }}` and
 * `@each(collection)` / `@endeach` blocks with values from a variables map.
 *
 * Supported syntax:
 *   {{ name }}          - variable interpolation
 *   {{ name ?? 'def' }} - variable with default
 *   @if(var)            - conditional block
 *   @endif
 *   @each(items)        - loop over array variable
 *     {{ $item }}       - current item in loop
 *     {{ $index }}      - current index in loop
 *   @endeach
 */
export function compileTemplate(
  template: string,
  variables: Record<string, unknown>,
): string {
  let result = template;

  // Process @each blocks first (they may contain variable references)
  result = result.replace(
    /@each\((\w+)\)[^\S\n]*\n?([^@]*(?:@(?!endeach)[^@]*)*)@endeach/g,
    (_match, key: string, body: string) => {
      const arr = variables[key];
      if (!Array.isArray(arr)) return '';
      return arr
        .map((item, index) =>
          body
            .replace(/\{\{\s*\$item\s*\}\}/g, String(item))
            .replace(/\{\{\s*\$index\s*\}\}/g, String(index)),
        )
        .join('');
    },
  );

  // Process @if / @endif blocks
  result = result.replace(
    /@if\((\w+)\)[^\S\n]*\n?([^@]*(?:@(?!endif)[^@]*)*)@endif/g,
    (_match, key: string, body: string) => {
      const val = variables[key];
      return val ? body : '';
    },
  );

  // Process variable interpolation with optional defaults: {{ var ?? 'default' }}
  result = result.replace(
    /\{\{\s*(\w+)(?:\s*\?\?\s*'([^']*)')?\s*\}\}/g,
    (_match, key: string, defaultVal?: string) => {
      const val = variables[key];
      if (val !== undefined && val !== null && val !== '') return String(val);
      return defaultVal ?? '';
    },
  );

  return result;
}
