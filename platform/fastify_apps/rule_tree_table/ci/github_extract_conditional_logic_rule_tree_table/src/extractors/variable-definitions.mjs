/**
 * Variable Definitions Extractor
 * Extracts variable declarations from JS/TS files using acorn-loose AST.
 *
 * Node mapping:
 *   folder     -> Source file grouping
 *   structural -> Scope (function/class)
 *   condition  -> Variable declaration (varName: kind = initType)
 *
 * Metadata per condition:
 *   { varName, kind: 'const' | 'let' | 'var', initType, scope }
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

function makeStructural({ name, parentScope = null, nodeType = 'FunctionScope', conditions = [], description = '' }) {
  return {
    id: randomUUID(),
    type: 'structural',
    name,
    parent_scope: parentScope,
    node_type: nodeType,
    evaluated_variables: [],
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
    operator: operator || 'declares',
    value_type: 'value',
    value: String(value ?? ''),
    data_type: 'string',
    enabled: true,
    description,
    metadata,
  };
}

/**
 * Infer the initialization type from an AST node.
 */
function inferInitType(node) {
  if (!node) return 'undefined';
  switch (node.type) {
    case 'Literal':
      return typeof node.value;
    case 'ArrayExpression':
      return 'Array';
    case 'ObjectExpression':
      return 'Object';
    case 'ArrowFunctionExpression':
    case 'FunctionExpression':
      return 'Function';
    case 'NewExpression':
      return node.callee?.name || 'Object';
    case 'CallExpression':
      return `${node.callee?.name || node.callee?.property?.name || 'call'}()`;
    case 'TemplateLiteral':
      return 'string';
    case 'TaggedTemplateExpression':
      return 'TaggedTemplate';
    case 'ClassExpression':
      return 'Class';
    default:
      return 'expression';
  }
}

/**
 * Resolve variable name from a pattern (handles destructuring).
 */
function resolvePattern(pattern) {
  if (!pattern) return ['unknown'];
  if (pattern.type === 'Identifier') return [pattern.name];
  if (pattern.type === 'ObjectPattern') {
    return (pattern.properties || []).flatMap(p => resolvePattern(p.value || p.key));
  }
  if (pattern.type === 'ArrayPattern') {
    return (pattern.elements || []).filter(Boolean).flatMap(resolvePattern);
  }
  if (pattern.type === 'AssignmentPattern') {
    return resolvePattern(pattern.left);
  }
  if (pattern.type === 'RestElement') {
    return resolvePattern(pattern.argument);
  }
  return ['unknown'];
}

/**
 * Walk AST and collect variable declarations.
 */
function walkForVariables(node, source, results, scope = null) {
  if (!node || typeof node !== 'object') return;

  if (node.type === 'VariableDeclaration') {
    const kind = node.kind; // const, let, var
    for (const decl of node.declarations || []) {
      const varNames = resolvePattern(decl.id);
      const initType = inferInitType(decl.init);

      for (const varName of varNames) {
        results.push(makeCondition({
          field: varName,
          operator: 'declares',
          value: `${kind} ${varName}: ${initType}`,
          description: source.slice(node.start, Math.min(node.end, node.start + 120)).trim(),
          metadata: { varName, kind, initType, scope: scope || 'module' },
        }));
      }
    }
    return;
  }

  // Recurse into child nodes
  for (const key of Object.keys(node)) {
    if (key === 'type' || key === 'start' || key === 'end' || key === 'loc') continue;
    const child = node[key];
    if (Array.isArray(child)) {
      for (const item of child) {
        if (item && typeof item === 'object' && item.type) {
          walkForVariables(item, source, results, scope);
        }
      }
    } else if (child && typeof child === 'object' && child.type) {
      walkForVariables(child, source, results, scope);
    }
  }
}

/**
 * Extract variable definitions from JS/TS source.
 * @param {string} source - File content
 * @param {string} filePath - File path
 * @param {string} _lang - Language hint
 * @returns {{ rules: object[], functionRules: object[] }}
 */
export function extractVariableDefinitions(source, filePath, _lang) {
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

  const globalVars = [];
  const functionRules = [];

  for (const node of ast.body || []) {
    // Function declarations
    if (node.type === 'FunctionDeclaration' && node.id?.name) {
      const fnVars = [];
      walkForVariables(node.body, source, fnVars, node.id.name);
      if (fnVars.length > 0) {
        functionRules.push({
          name: node.id.name,
          rules: [makeStructural({
            name: node.id.name,
            nodeType: 'FunctionScope',
            conditions: fnVars,
            description: `${fnVars.length} variables`,
          })],
        });
      }
      continue;
    }

    // Export declarations with functions
    if (node.type === 'ExportNamedDeclaration' || node.type === 'ExportDefaultDeclaration') {
      const decl = node.declaration;
      if (decl?.type === 'FunctionDeclaration' && decl.id?.name) {
        const fnVars = [];
        walkForVariables(decl.body, source, fnVars, decl.id.name);
        if (fnVars.length > 0) {
          functionRules.push({
            name: decl.id.name,
            rules: [makeStructural({
              name: decl.id.name,
              nodeType: 'FunctionScope',
              conditions: fnVars,
              description: `${fnVars.length} variables`,
            })],
          });
        }
        continue;
      }
    }

    // Arrow functions in variable declarations
    if (node.type === 'VariableDeclaration') {
      for (const declarator of node.declarations || []) {
        const init = declarator.init;
        const name = declarator.id?.name;
        if (name && init && (init.type === 'ArrowFunctionExpression' || init.type === 'FunctionExpression')) {
          const fnVars = [];
          walkForVariables(init.body, source, fnVars, name);
          if (fnVars.length > 0) {
            functionRules.push({
              name,
              rules: [makeStructural({
                name,
                nodeType: 'FunctionScope',
                conditions: fnVars,
                description: `${fnVars.length} variables`,
              })],
            });
          }
          continue;
        }
      }
      // Module-level variable declaration
      walkForVariables(node, source, globalVars, null);
    }
  }

  if (globalVars.length === 0 && functionRules.length === 0) {
    return { rules: [], functionRules: [] };
  }

  const rules = globalVars.length > 0 ? [makeFolder({
    name: filePath,
    conditions: globalVars,
    description: `${globalVars.length} module-level variables`,
  })] : [];

  return { rules, functionRules };
}
