/**
 * Import Dependency Extractor
 * Extracts module imports/exports from JS/TS files using acorn-loose AST.
 * For Python files, uses regex-based extraction.
 *
 * Node mapping:
 *   folder    -> Source file grouping
 *   condition -> Individual import specifier (module + specifier + kind)
 *
 * Metadata per condition:
 *   { module, specifiers, importKind: 'default' | 'named' | 'namespace' }
 */

import { parse as acornLooseParse } from 'acorn-loose';
import { randomUUID } from 'node:crypto';

function makeFolder({ name, conditions = [], description = '' }) {
  return {
    id: randomUUID(),
    type: 'folder',
    name,
    enabled: true,
    description,
    conditions,
  };
}

function makeCondition({ field, operator, value, description = '', metadata = null }) {
  return {
    id: randomUUID(),
    type: 'condition',
    field: field || 'unknown',
    operator: operator || 'imports',
    value_type: 'value',
    value: String(value ?? ''),
    data_type: 'string',
    enabled: true,
    description,
    metadata,
  };
}

/**
 * Extract imports from JS/TS source using AST.
 */
function extractFromJS(source, filePath) {
  let ast;
  try {
    ast = acornLooseParse(source, {
      ecmaVersion: 'latest',
      sourceType: 'module',
      allowImportExportEverywhere: true,
      allowAwaitOutsideFunction: true,
    });
  } catch {
    return { rules: [], functionRules: [] };
  }

  const imports = [];

  for (const node of ast.body || []) {
    if (node.type === 'ImportDeclaration') {
      const source_module = node.source?.value || 'unknown';
      const specifiers = node.specifiers || [];

      if (specifiers.length === 0) {
        // Side-effect import: import 'module'
        imports.push(makeCondition({
          field: source_module,
          operator: 'imports',
          value: '*',
          description: `import '${source_module}' (side-effect)`,
          metadata: { module: source_module, specifiers: ['*'], importKind: 'side-effect' },
        }));
      } else {
        for (const spec of specifiers) {
          let importKind = 'named';
          let specName = 'unknown';

          if (spec.type === 'ImportDefaultSpecifier') {
            importKind = 'default';
            specName = spec.local?.name || 'default';
          } else if (spec.type === 'ImportNamespaceSpecifier') {
            importKind = 'namespace';
            specName = `* as ${spec.local?.name || 'ns'}`;
          } else if (spec.type === 'ImportSpecifier') {
            importKind = 'named';
            const imported = spec.imported?.name || spec.local?.name || 'unknown';
            const local = spec.local?.name;
            specName = imported === local ? imported : `${imported} as ${local}`;
          }

          imports.push(makeCondition({
            field: source_module,
            operator: 'imports',
            value: specName,
            description: `import { ${specName} } from '${source_module}'`,
            metadata: { module: source_module, specifiers: [specName], importKind },
          }));
        }
      }
    }

    // Dynamic imports: import('module')
    if (node.type === 'ExpressionStatement' && node.expression?.type === 'ImportExpression') {
      const source_module = node.expression.source?.value || 'dynamic';
      imports.push(makeCondition({
        field: source_module,
        operator: 'imports',
        value: '*',
        description: `import('${source_module}') (dynamic)`,
        metadata: { module: source_module, specifiers: ['*'], importKind: 'dynamic' },
      }));
    }

    // require() calls in variable declarations
    if (node.type === 'VariableDeclaration') {
      for (const decl of node.declarations || []) {
        if (decl.init?.type === 'CallExpression' && decl.init.callee?.name === 'require') {
          const source_module = decl.init.arguments?.[0]?.value || 'unknown';
          const varName = decl.id?.name || 'unknown';
          imports.push(makeCondition({
            field: source_module,
            operator: 'imports',
            value: varName,
            description: `const ${varName} = require('${source_module}')`,
            metadata: { module: source_module, specifiers: [varName], importKind: 'require' },
          }));
        }
      }
    }
  }

  if (imports.length === 0) {
    return { rules: [], functionRules: [] };
  }

  return {
    rules: [makeFolder({
      name: filePath,
      conditions: imports,
      description: `${imports.length} imports`,
    })],
    functionRules: [],
  };
}

/**
 * Extract imports from Python source using regex.
 */
function extractFromPython(source, filePath) {
  const imports = [];
  const lines = source.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // from module import name1, name2
    const fromMatch = line.match(/^from\s+([\w.]+)\s+import\s+(.+)$/);
    if (fromMatch) {
      const module = fromMatch[1];
      const specs = fromMatch[2].split(',').map(s => s.trim()).filter(Boolean);
      for (const spec of specs) {
        const aliasMatch = spec.match(/^(\w+)\s+as\s+(\w+)$/);
        const specName = aliasMatch ? `${aliasMatch[1]} as ${aliasMatch[2]}` : spec;
        imports.push(makeCondition({
          field: module,
          operator: 'imports',
          value: specName,
          description: `from ${module} import ${specName}`,
          metadata: { module, specifiers: [specName], importKind: 'named' },
        }));
      }
      continue;
    }

    // import module
    const importMatch = line.match(/^import\s+([\w.]+)(?:\s+as\s+(\w+))?$/);
    if (importMatch) {
      const module = importMatch[1];
      const alias = importMatch[2];
      const specName = alias ? `${module} as ${alias}` : module;
      imports.push(makeCondition({
        field: module,
        operator: 'imports',
        value: specName,
        description: `import ${specName}`,
        metadata: { module, specifiers: [specName], importKind: 'default' },
      }));
    }
  }

  if (imports.length === 0) {
    return { rules: [], functionRules: [] };
  }

  return {
    rules: [makeFolder({
      name: filePath,
      conditions: imports,
      description: `${imports.length} imports`,
    })],
    functionRules: [],
  };
}

/**
 * Extract import dependencies from source.
 * @param {string} source - File content
 * @param {string} filePath - File path
 * @param {string} lang - Language hint
 * @returns {{ rules: object[], functionRules: object[] }}
 */
export function extractImportDependency(source, filePath, lang) {
  if (filePath.endsWith('.py') || lang === 'py') {
    return extractFromPython(source, filePath);
  }
  return extractFromJS(source, filePath);
}
