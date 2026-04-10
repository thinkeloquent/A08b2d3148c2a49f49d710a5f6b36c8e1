export const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Markdown: '#083fa1',
  JSON: '#292929',
  YAML: '#cb171e',
  Text: '#555555',
  Python: '#3572a5',
  Ruby: '#701516',
  Rust: '#dea584',
  Go: '#00add8',
  Java: '#b07219',
  Kotlin: '#a97bff',
  'C++': '#f34b7d',
  'C#': '#178600',
  C: '#555555',
  Swift: '#f05138',
  PHP: '#4f5d95',
  Shell: '#89e051',
  HTML: '#e34c26',
  CSS: '#563d7c',
  SCSS: '#c6538c',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  SQL: '#e38c00',
  GraphQL: '#e10098',
  Protobuf: '#5a67d8',
  Dockerfile: '#384d54',
  Makefile: '#427819',
  TOML: '#9c4221',
  SVG: '#ff9900',
  CSV: '#237346',
  Lua: '#000080',
  R: '#198ce7',
  Scala: '#c22d40',
};

const AVATAR_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#f39c12', '#1abc9c', '#e67e22', '#34495e'];

export function hashColor(s: string): string {
  return AVATAR_COLORS[s.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length];
}
