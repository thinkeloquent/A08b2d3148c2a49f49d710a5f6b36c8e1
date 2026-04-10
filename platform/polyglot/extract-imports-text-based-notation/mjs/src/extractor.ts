import { createRequire } from 'node:module';

import { parse } from '@babel/parser';
import type { TraverseOptions } from '@babel/traverse';
import type {
  ExportDefaultDeclaration,
  ExportNamedDeclaration,
  Identifier,
  ImportDeclaration,
  Node,
  StringLiteral,
} from '@babel/types';

import { create } from './logger.js';
import {
  formatDefault,
  formatExportAll,
  formatExportDefault,
  formatExportNamed,
  formatExportNamespace,
  formatNamed,
  formatNamespace,
} from './specifier.js';
import type { ExtractionResult, ExtractorOptions } from './types.js';

// Handle CJS/ESM interop for @babel/traverse.
// Use createRequire to load the CJS module synchronously, avoiding
// async top-level await issues in test environments.
const require = createRequire(import.meta.url);
const _traverseModule = require('@babel/traverse');
const traverse: (parent: Node, opts: TraverseOptions) => void =
  typeof _traverseModule === 'function'
    ? _traverseModule
    : typeof _traverseModule.default === 'function'
      ? _traverseModule.default
      : _traverseModule;

/**
 * Runtime-only extension of ExportAllDeclaration that includes the `exported`
 * field produced by @babel/parser for `export * as ns from 'm'` syntax.
 * The @babel/types type definitions may not include this field.
 */
interface ExportAllDeclarationWithExported {
  type: 'ExportAllDeclaration';
  source: StringLiteral;
  exported?: Identifier | StringLiteral | null;
}

/**
 * Helper to read the name from an Identifier or StringLiteral node.
 */
function nameOf(node: Identifier | StringLiteral): string {
  return node.type === 'Identifier' ? node.name : node.value;
}

const PACKAGE_NAME = 'extract-imports-text-based-notation';
const SELF_MODULE = '<self>';

export class ImportExtractor {
  private logger;

  constructor(options?: ExtractorOptions) {
    this.logger = options?.logger ?? create(PACKAGE_NAME, 'extractor.ts');
  }

  extractImports(code: string): ExtractionResult {
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });

    const results: ExtractionResult = [];

    traverse(ast, {
      ImportDeclaration: (path: { node: ImportDeclaration }) => {
        const node = path.node;
        const source = node.source.value;
        const specifiers: string[] = [];

        for (const spec of node.specifiers) {
          switch (spec.type) {
            case 'ImportDefaultSpecifier':
              specifiers.push(formatDefault(spec.local.name));
              break;

            case 'ImportNamespaceSpecifier':
              specifiers.push(formatNamespace(spec.local.name));
              break;

            case 'ImportSpecifier': {
              const imported = nameOf(spec.imported);
              specifiers.push(formatNamed(imported, spec.local.name));
              break;
            }
          }
        }

        results.push([source, specifiers]);
        this.logger.debug('Extracted import from %s: %o', source, specifiers);
      },
    } as TraverseOptions);

    return this.format(results);
  }

  extractExports(code: string): ExtractionResult {
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });

    const results: ExtractionResult = [];

    traverse(ast, {
      ExportDefaultDeclaration: (path: {
        node: ExportDefaultDeclaration;
      }) => {
        const decl = path.node.declaration;
        let name: string;

        if (
          (decl.type === 'FunctionDeclaration' ||
            decl.type === 'ClassDeclaration') &&
          decl.id?.name
        ) {
          name = decl.id.name;
        } else {
          name = '<anonymous>';
        }

        results.push([SELF_MODULE, [formatExportDefault(name)]]);
        this.logger.debug('Extracted default export: %s', name);
      },

      ExportNamedDeclaration: (path: {
        node: ExportNamedDeclaration;
      }) => {
        const node = path.node;
        const source = node.source?.value ?? null;

        if (node.declaration) {
          const decl = node.declaration;
          const specifiers: string[] = [];

          if (decl.type === 'VariableDeclaration') {
            for (const declarator of decl.declarations) {
              if (declarator.id.type === 'Identifier') {
                specifiers.push(formatExportNamed(declarator.id.name));
              }
            }
          } else if (
            (decl.type === 'FunctionDeclaration' ||
              decl.type === 'ClassDeclaration') &&
            decl.id
          ) {
            specifiers.push(formatExportNamed(decl.id.name));
          }

          if (specifiers.length > 0) {
            results.push([SELF_MODULE, specifiers]);
          }
        } else if (node.specifiers.length > 0) {
          const moduleName = source ?? SELF_MODULE;
          const specifiers: string[] = [];

          for (const spec of node.specifiers) {
            if (spec.type === 'ExportSpecifier') {
              const localName = nameOf(spec.local);
              const exportedName = nameOf(spec.exported);

              specifiers.push(formatExportNamed(localName, exportedName));
            } else if (spec.type === 'ExportNamespaceSpecifier') {
              const exportedName = nameOf(spec.exported);
              specifiers.push(formatExportNamespace(exportedName));
            }
          }

          if (specifiers.length > 0) {
            results.push([moduleName, specifiers]);
          }
        }

        this.logger.debug(
          'Extracted named export from %s',
          source ?? SELF_MODULE,
        );
      },

      ExportAllDeclaration: (path: { node: Node }) => {
        const node = path.node as unknown as ExportAllDeclarationWithExported;
        const source = node.source.value;

        if (node.exported) {
          const name = nameOf(node.exported);
          results.push([source, [formatExportNamespace(name)]]);
        } else {
          results.push([source, [formatExportAll()]]);
        }

        this.logger.debug('Extracted export-all from %s', source);
      },
    } as TraverseOptions);

    return this.format(results);
  }

  format(imports: ExtractionResult): ExtractionResult {
    return imports;
  }
}
