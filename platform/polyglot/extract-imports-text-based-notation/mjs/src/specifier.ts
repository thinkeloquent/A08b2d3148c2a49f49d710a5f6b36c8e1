// ── Import specifier formatters ──────────────────────────────────────────────

export function formatDefault(localName: string): string {
  return `default: ${localName}`;
}

export function formatNamed(importedName: string, localName: string): string {
  if (importedName === localName) {
    return `named: ${importedName}`;
  }
  return `named: ${importedName} as ${localName}`;
}

export function formatNamespace(localName: string): string {
  return `namespace: ${localName}`;
}

// ── Export specifier formatters ─────────────────────────────────────────────

export function formatExportDefault(name: string): string {
  return `export-default: ${name}`;
}

export function formatExportNamed(name: string, alias?: string): string {
  if (alias !== undefined && alias !== name) {
    return `export-named: ${name} as ${alias}`;
  }
  return `export-named: ${name}`;
}

export function formatExportAll(): string {
  return 'export-all';
}

export function formatExportNamespace(name: string): string {
  return `export-namespace: ${name}`;
}
