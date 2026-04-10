/**
 * Rule Extractor
 * Uses AST parsing to convert code conditionals into rule tree structures.
 *
 * Detects:
 *   - if/else if/else chains → groups with AND/OR logic + conditions
 *   - switch/case statements → OR groups with equality conditions
 *   - ternary expressions → conditions
 *   - logical expressions (&&, ||) → AND/OR groups
 *   - comparison expressions (===, !==, >, <, >=, <=) → conditions
 *
 * Supports: JavaScript (.js, .mjs, .jsx, .ts, .tsx) via acorn-loose
 * Python files use regex-based extraction (no AST).
 */

import { parse as acornLooseParse } from 'acorn-loose';
import { randomUUID } from 'node:crypto';

// ── Operator mapping ─────────────────────────────────────────────────────

const JS_OP_MAP = {
  '===': 'equals',
  '==': 'equals',
  '!==': 'not_equals',
  '!=': 'not_equals',
  '>': 'greater_than',
  '>=': 'greater_than_or_equal',
  '<': 'less_than',
  '<=': 'less_than_or_equal',
};

// Order matters: longer operators must come first to avoid partial matches
const PYTHON_OP_LIST = [
  [' not in ', 'not_in'],
  [' is not ', 'not_equals'],
  ['>=', 'greater_than_or_equal'],
  ['<=', 'less_than_or_equal'],
  ['!=', 'not_equals'],
  ['==', 'equals'],
  ['>', 'greater_than'],
  ['<', 'less_than'],
  [' in ', 'in'],
  [' is ', 'equals'],
];

// ── Helpers ──────────────────────────────────────────────────────────────

function logicColor(logic) {
  if (logic === 'AND') return '#3B82F6';
  if (logic === 'OR') return '#F59E0B';
  if (logic === 'NOT') return '#EF4444';
  if (logic === 'XOR') return '#A855F7';
  return '#6B7280'; // gray for null/unknown
}

function makeGroup({ name, logic = 'AND', conditions = [], description = '', enabled = true, source_line = null }) {
  return {
    id: randomUUID(),
    type: 'group',
    name,
    logic,
    enabled,
    color: logicColor(logic),
    description,
    conditions,
    source_line,
  };
}

function makeStructural({ name, parentScope = null, nodeType = 'IfStatement', evaluatedVariables = [], conditions = [], description = '', enabled = true, source_line = null }) {
  return {
    id: randomUUID(),
    type: 'structural',
    name,
    parent_scope: parentScope,
    node_type: nodeType,
    evaluated_variables: evaluatedVariables,
    enabled,
    color: '#6366F1', // indigo for structural
    description,
    conditions,
    source_line,
  };
}

function makeFolder({ name, conditions = [], description = '', enabled = true, source_line = null }) {
  return {
    id: randomUUID(),
    type: 'folder',
    name,
    enabled,
    description,
    conditions,
    source_line,
  };
}

function makeCondition({ field, operator, value, dataType = 'string', description = '', enabled = true, source_line = null }) {
  return {
    id: randomUUID(),
    type: 'condition',
    field: field || 'unknown',
    operator: operator || 'equals',
    value_type: 'value',
    value: String(value ?? ''),
    data_type: dataType,
    enabled,
    description,
    source_line,
  };
}

/**
 * Convert a byte offset in source to a 1-based line number.
 */
function offsetToLine(source, offset) {
  if (offset == null || offset < 0) return null;
  let line = 1;
  for (let i = 0; i < offset && i < source.length; i++) {
    if (source[i] === '\n') line++;
  }
  return line;
}

function inferDataType(value) {
  if (value === 'true' || value === 'false') return 'boolean';
  if (!isNaN(Number(value)) && value !== '' && value !== null) return 'number';
  return 'string';
}

/**
 * Resolve an AST node to a readable field name.
 */
function resolveFieldName(node) {
  if (!node) return 'unknown';
  if (node.type === 'Identifier') return node.name;
  if (node.type === 'MemberExpression') {
    const obj = resolveFieldName(node.object);
    const prop = node.computed
      ? `[${resolveFieldName(node.property)}]`
      : `.${resolveFieldName(node.property)}`;
    return `${obj}${prop}`;
  }
  if (node.type === 'CallExpression') {
    return `${resolveFieldName(node.callee)}()`;
  }
  if (node.type === 'Literal') return String(node.value);
  return 'expression';
}

/**
 * Resolve an AST node to a value string.
 */
function resolveValue(node) {
  if (!node) return '';
  if (node.type === 'Literal') return node.value;
  if (node.type === 'TemplateLiteral') {
    return node.quasis.map(q => q.value.raw).join('${...}');
  }
  if (node.type === 'UnaryExpression' && node.operator === '-' && node.argument?.type === 'Literal') {
    return -node.argument.value;
  }
  if (node.type === 'Identifier') return `\${${node.name}}`;
  if (node.type === 'MemberExpression') return `\${${resolveFieldName(node)}}`;
  return resolveFieldName(node);
}

/**
 * Extract evaluated variable names from a list of conditions/groups.
 */
function collectEvaluatedVars(items) {
  const vars = new Set();
  for (const item of items) {
    if (item.type === 'condition' && item.field && item.field !== 'unknown' && item.field !== 'expression') {
      vars.add(item.field);
    } else if (item.conditions) {
      for (const v of collectEvaluatedVars(item.conditions)) {
        vars.add(v);
      }
    }
  }
  return [...vars];
}

// ── JS/TS AST Extraction ─────────────────────────────────────────────────

/**
 * Extract a condition from a BinaryExpression node.
 */
function extractBinaryCondition(node, source) {
  const op = JS_OP_MAP[node.operator];
  if (!op) return null;

  const left = resolveFieldName(node.left);
  const right = resolveValue(node.right);
  const rawValue = right ?? '';
  const dataType = inferDataType(String(rawValue));

  return makeCondition({
    field: left,
    operator: op,
    value: rawValue,
    dataType,
    description: source.slice(node.start, node.end).trim(),
    source_line: offsetToLine(source, node.start),
  });
}

/**
 * Extract conditions from a test expression (the condition of an if/ternary).
 * Handles && (AND), || (OR), and single comparisons.
 */
function extractTestConditions(node, source) {
  if (!node) return [];

  // Logical expression: && or ||
  if (node.type === 'LogicalExpression') {
    const logic = node.operator === '&&' ? 'AND' : 'OR';
    const left = extractTestConditions(node.left, source);
    const right = extractTestConditions(node.right, source);
    const children = [...left, ...right];

    if (children.length > 1) {
      return [makeGroup({
        name: `${logic} group`,
        logic,
        conditions: children,
        description: source.slice(node.start, node.end).trim().slice(0, 120),
        source_line: offsetToLine(source, node.start),
      })];
    }
    return children;
  }

  // Binary comparison
  if (node.type === 'BinaryExpression' && JS_OP_MAP[node.operator]) {
    const cond = extractBinaryCondition(node, source);
    if (cond) return [cond];
  }

  // Unary negation: !expr
  if (node.type === 'UnaryExpression' && node.operator === '!') {
    const inner = extractTestConditions(node.argument, source);
    if (inner.length > 0) {
      return [makeGroup({
        name: 'NOT group',
        logic: 'NOT',
        conditions: inner,
        description: source.slice(node.start, node.end).trim().slice(0, 120),
        source_line: offsetToLine(source, node.start),
      })];
    }
    // Simple truthy check: !variable
    return [makeCondition({
      field: resolveFieldName(node.argument),
      operator: 'equals',
      value: 'false',
      dataType: 'boolean',
      description: source.slice(node.start, node.end).trim(),
      source_line: offsetToLine(source, node.start),
    })];
  }

  // Truthy check: if (variable) or if (obj.prop)
  if (node.type === 'Identifier' || node.type === 'MemberExpression') {
    return [makeCondition({
      field: resolveFieldName(node),
      operator: 'equals',
      value: 'true',
      dataType: 'boolean',
      description: source.slice(node.start, node.end).trim(),
      source_line: offsetToLine(source, node.start),
    })];
  }

  // CallExpression: if (someCheck())
  if (node.type === 'CallExpression') {
    return [makeCondition({
      field: resolveFieldName(node.callee),
      operator: 'equals',
      value: 'true',
      dataType: 'boolean',
      description: source.slice(node.start, node.end).trim().slice(0, 120),
      source_line: offsetToLine(source, node.start),
    })];
  }

  // includes/startsWith/endsWith: obj.includes(val)
  if (node.type === 'CallExpression' && node.callee?.type === 'MemberExpression') {
    const methodName = node.callee.property?.name;
    const methodMap = {
      'includes': 'contains',
      'startsWith': 'starts_with',
      'endsWith': 'ends_with',
    };
    if (methodMap[methodName] && node.arguments.length > 0) {
      return [makeCondition({
        field: resolveFieldName(node.callee.object),
        operator: methodMap[methodName],
        value: resolveValue(node.arguments[0]),
        description: source.slice(node.start, node.end).trim(),
        source_line: offsetToLine(source, node.start),
      })];
    }
  }

  return [];
}

/**
 * Walk AST nodes recursively, extracting rule groups from control flow.
 */
function walkNode(node, source, results, context = '') {
  if (!node || typeof node !== 'object') return;

  // ── If / else-if / else chains ────────────────────────────────
  if (node.type === 'IfStatement') {
    const chainItems = [];
    let current = node;
    let branchIndex = 0;

    while (current && current.type === 'IfStatement') {
      branchIndex++;
      const testConditions = extractTestConditions(current.test, source);

      if (testConditions.length > 0) {
        const branchName = branchIndex === 1 ? 'if' : `else if #${branchIndex}`;
        const desc = source.slice(current.test.start, current.test.end).trim().slice(0, 200);
        const srcLine = offsetToLine(source, current.start);
        const evalVars = collectEvaluatedVars(testConditions);

        if (testConditions.length === 1 && testConditions[0].type === 'group') {
          // Single nested group (e.g., `if (a && b)`) — structural wraps the AND/OR group
          const inner = testConditions[0];
          chainItems.push(makeStructural({
            name: `${context ? context + ' → ' : ''}${branchName}`,
            parentScope: context || null,
            nodeType: 'IfStatement',
            evaluatedVariables: evalVars,
            conditions: [inner],
            description: desc,
            source_line: srcLine,
          }));
        } else if (testConditions.length === 1 && testConditions[0].type === 'condition') {
          // Single condition (e.g., `if (isBrowser)`) — structural wraps condition directly
          chainItems.push(makeStructural({
            name: `${context ? context + ' → ' : ''}${branchName}`,
            parentScope: context || null,
            nodeType: 'IfStatement',
            evaluatedVariables: evalVars,
            conditions: testConditions,
            description: desc,
            source_line: srcLine,
          }));
        } else {
          // Multiple top-level conditions — wrap in AND group inside structural
          chainItems.push(makeStructural({
            name: `${context ? context + ' → ' : ''}${branchName}`,
            parentScope: context || null,
            nodeType: 'IfStatement',
            evaluatedVariables: evalVars,
            conditions: [makeGroup({
              name: `${branchName} conditions`,
              logic: 'AND',
              conditions: testConditions,
              description: desc,
              source_line: srcLine,
            })],
            description: desc,
            source_line: srcLine,
          }));
        }
      }

      // Recurse into consequent body for nested ifs
      if (current.consequent) {
        walkNode(current.consequent, source, results, `${context ? context + ' → ' : ''}branch #${branchIndex}`);
      }

      current = current.alternate?.type === 'IfStatement' ? current.alternate : null;
    }

    if (chainItems.length > 0) {
      if (chainItems.length === 1) {
        results.push(chainItems[0]);
      } else {
        // Multiple if/else-if branches — wrap in OR group
        results.push(makeGroup({
          name: `${context ? context + ' → ' : ''}if/else-if chain`,
          logic: 'OR',
          conditions: chainItems,
          description: `${chainItems.length} branches`,
          source_line: offsetToLine(source, node.start),
        }));
      }
    }
    return; // Don't double-walk children
  }

  // ── Switch statements ─────────────────────────────────────────
  if (node.type === 'SwitchStatement') {
    const discriminant = resolveFieldName(node.discriminant);
    const cases = [];

    for (const caseNode of node.cases || []) {
      if (caseNode.test) {
        const value = resolveValue(caseNode.test);
        cases.push(makeCondition({
          field: discriminant,
          operator: 'equals',
          value,
          dataType: inferDataType(String(value)),
          description: `case ${JSON.stringify(value)}`,
          source_line: offsetToLine(source, caseNode.start),
        }));
      }
    }

    if (cases.length > 0) {
      results.push(makeStructural({
        name: `${context ? context + ' → ' : ''}switch (${discriminant})`,
        parentScope: context || null,
        nodeType: 'SwitchStatement',
        evaluatedVariables: [discriminant],
        conditions: [makeGroup({
          name: `switch cases`,
          logic: 'OR',
          conditions: cases,
          description: `switch on ${discriminant} with ${cases.length} cases`,
          source_line: offsetToLine(source, node.start),
        })],
        description: `switch on ${discriminant} with ${cases.length} cases`,
        source_line: offsetToLine(source, node.start),
      }));
    }
    return;
  }

  // ── Ternary (ConditionalExpression) ───────────────────────────
  if (node.type === 'ConditionalExpression') {
    const testConditions = extractTestConditions(node.test, source);
    if (testConditions.length > 0) {
      results.push(...testConditions);
    }
    return;
  }

  // ── Recurse into child nodes ──────────────────────────────────
  for (const key of Object.keys(node)) {
    if (key === 'type' || key === 'start' || key === 'end' || key === 'loc') continue;
    const child = node[key];
    if (Array.isArray(child)) {
      for (const item of child) {
        if (item && typeof item === 'object' && item.type) {
          walkNode(item, source, results, context);
        }
      }
    } else if (child && typeof child === 'object' && child.type) {
      walkNode(child, source, results, context);
    }
  }
}

/**
 * Extract rule tree items from JavaScript/TypeScript source code using AST.
 * @param {string} source - File content
 * @param {string} filePath - File path (for context)
 * @returns {{ rules: object[], functionRules: Array<{ name: string, rules: object[] }> }}
 */
export function extractRulesFromJS(source, filePath) {
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

  const globalRules = [];
  const functionRules = [];

  // Walk top-level looking for function/class declarations with conditionals
  for (const node of ast.body || []) {
    // Function declarations
    if (node.type === 'FunctionDeclaration' && node.id?.name) {
      const fnRules = [];
      walkNode(node.body, source, fnRules, node.id.name);
      if (fnRules.length > 0) {
        functionRules.push({ name: node.id.name, rules: fnRules });
      }
      continue;
    }

    // export function / export default function
    if (node.type === 'ExportNamedDeclaration' || node.type === 'ExportDefaultDeclaration') {
      const decl = node.declaration;
      if (decl?.type === 'FunctionDeclaration' && decl.id?.name) {
        const fnRules = [];
        walkNode(decl.body, source, fnRules, decl.id.name);
        if (fnRules.length > 0) {
          functionRules.push({ name: decl.id.name, rules: fnRules });
        }
        continue;
      }
      // Arrow function in variable: export const foo = () => { ... }
      if (decl?.type === 'VariableDeclaration') {
        for (const declarator of decl.declarations || []) {
          const init = declarator.init;
          const name = declarator.id?.name;
          if (name && init && (init.type === 'ArrowFunctionExpression' || init.type === 'FunctionExpression')) {
            const fnRules = [];
            walkNode(init.body, source, fnRules, name);
            if (fnRules.length > 0) {
              functionRules.push({ name, rules: fnRules });
            }
          }
        }
        continue;
      }
    }

    // Variable declarations with arrow functions
    if (node.type === 'VariableDeclaration') {
      for (const declarator of node.declarations || []) {
        const init = declarator.init;
        const name = declarator.id?.name;
        if (name && init && (init.type === 'ArrowFunctionExpression' || init.type === 'FunctionExpression')) {
          const fnRules = [];
          walkNode(init.body, source, fnRules, name);
          if (fnRules.length > 0) {
            functionRules.push({ name, rules: fnRules });
          }
          continue;
        }
      }
    }

    // Class methods
    if (node.type === 'ClassDeclaration' || (node.type === 'ExportNamedDeclaration' && node.declaration?.type === 'ClassDeclaration')) {
      const classNode = node.type === 'ClassDeclaration' ? node : node.declaration;
      const className = classNode.id?.name || 'AnonymousClass';
      for (const member of classNode.body?.body || []) {
        if (member.type === 'MethodDefinition' && member.value?.body) {
          const methodName = member.key?.name || 'method';
          const fnRules = [];
          walkNode(member.value.body, source, fnRules, `${className}.${methodName}`);
          if (fnRules.length > 0) {
            functionRules.push({ name: `${className}.${methodName}`, rules: fnRules });
          }
        }
      }
      continue;
    }

    // Top-level conditionals (not in a function)
    walkNode(node, source, globalRules);
  }

  return { rules: globalRules, functionRules };
}

// ── Python Regex-Based Extraction ────────────────────────────────────────

/**
 * Extract conditions from Python source using regex patterns.
 * (No Python AST available in Node — uses line-by-line analysis.)
 * @param {string} source
 * @param {string} filePath
 * @returns {{ rules: object[], functionRules: Array<{ name: string, rules: object[] }> }}
 */
export function extractRulesFromPython(source, filePath) {
  const functionRules = [];
  const globalRules = [];

  const lines = source.split('\n');
  let currentFn = null;
  let currentRules = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trimStart();
    const indent = line.length - line.trimStart().length;

    // Detect function definitions
    const fnMatch = trimmed.match(/^(?:async\s+)?def\s+(\w+)\s*\(/);
    if (fnMatch) {
      // Save previous function rules
      if (currentFn && currentRules.length > 0) {
        functionRules.push({ name: currentFn, rules: currentRules });
      }
      currentFn = fnMatch[1];
      currentRules = [];
      continue;
    }

    // Detect class method (class def resets context)
    const classMatch = trimmed.match(/^class\s+(\w+)/);
    if (classMatch) {
      if (currentFn && currentRules.length > 0) {
        functionRules.push({ name: currentFn, rules: currentRules });
      }
      currentFn = classMatch[1];
      currentRules = [];
      continue;
    }

    // Detect if/elif conditions
    const ifMatch = trimmed.match(/^(?:if|elif)\s+(.+):\s*$/);
    if (ifMatch) {
      const condStr = ifMatch[1];
      const conditions = parsePythonCondition(condStr, i + 1);
      if (conditions.length > 0) {
        const target = currentFn ? currentRules : globalRules;
        target.push(...conditions);
      }
      continue;
    }

    // Detect match/case (Python 3.10+)
    const matchMatch = trimmed.match(/^match\s+(.+):\s*$/);
    if (matchMatch) {
      const discriminant = matchMatch[1].trim();
      const cases = [];

      // Read subsequent case lines (they are indented under match)
      for (let j = i + 1; j < lines.length; j++) {
        const rawLine = lines[j];
        const caseLine = rawLine.trimStart();
        // Stop at non-indented, non-empty line (end of match block)
        if (rawLine.length > 0 && rawLine === rawLine.trimStart() && caseLine !== '') break;
        const caseMatch = caseLine.match(/^case\s+(.+?)(?:\s+if\s+.+)?:\s*$/);
        if (caseMatch && caseMatch[1] !== '_') {
          cases.push(makeCondition({
            field: discriminant,
            operator: 'equals',
            value: caseMatch[1].replace(/^["']|["']$/g, ''),
            description: `case ${caseMatch[1]}`,
            source_line: j + 1,
          }));
        }
      }

      if (cases.length > 0) {
        const group = makeGroup({
          name: `match (${discriminant})`,
          logic: 'OR',
          conditions: cases,
          description: `match on ${discriminant} with ${cases.length} cases`,
          source_line: i + 1,
        });
        const target = currentFn ? currentRules : globalRules;
        target.push(group);
      }
      continue;
    }
  }

  // Save last function
  if (currentFn && currentRules.length > 0) {
    functionRules.push({ name: currentFn, rules: currentRules });
  }

  return { rules: globalRules, functionRules };
}

/**
 * Parse a Python condition string into rule items.
 */
function parsePythonCondition(condStr, source_line = null) {
  const results = [];

  // Split on ' and ' / ' or ' (top-level only — naive split)
  const orParts = condStr.split(/\s+or\s+/);
  if (orParts.length > 1) {
    const children = orParts.flatMap(part => parsePythonCondition(part, source_line));
    if (children.length > 1) {
      return [makeGroup({ name: 'OR group', logic: 'OR', conditions: children, description: condStr.slice(0, 120), source_line })];
    }
    return children;
  }

  const andParts = condStr.split(/\s+and\s+/);
  if (andParts.length > 1) {
    const children = andParts.flatMap(part => parsePythonCondition(part, source_line));
    if (children.length > 1) {
      return [makeGroup({ name: 'AND group', logic: 'AND', conditions: children, description: condStr.slice(0, 120), source_line })];
    }
    return children;
  }

  // Negation: not expr
  const notMatch = condStr.match(/^not\s+(.+)/);
  if (notMatch) {
    const inner = parsePythonCondition(notMatch[1], source_line);
    if (inner.length > 0) {
      return [makeGroup({ name: 'NOT group', logic: 'NOT', conditions: inner, description: condStr.slice(0, 120), source_line })];
    }
  }

  // Comparison operators (ordered longest-first to avoid partial matches)
  for (const [pyOp, ruleOp] of PYTHON_OP_LIST) {
    const idx = condStr.indexOf(pyOp);
    if (idx !== -1) {
      const field = condStr.slice(0, idx).trim();
      const value = condStr.slice(idx + pyOp.length).trim().replace(/^["']|["']$/g, '');
      if (field) {
        return [makeCondition({
          field,
          operator: ruleOp,
          value,
          dataType: inferDataType(value),
          description: condStr.trim(),
          source_line,
        })];
      }
    }
  }

  // Truthy check
  if (condStr.trim()) {
    return [makeCondition({
      field: condStr.trim(),
      operator: 'equals',
      value: 'true',
      dataType: 'boolean',
      description: condStr.trim(),
      source_line,
    })];
  }

  return results;
}

// ── Public API ───────────────────────────────────────────────────────────

/**
 * Extract rules from a source file based on its extension.
 * @param {string} source - File content
 * @param {string} filePath - File path
 * @returns {{ rules: object[], functionRules: Array<{ name: string, rules: object[] }> }}
 */
export function extractRules(source, filePath) {
  if (filePath.endsWith('.py')) {
    return extractRulesFromPython(source, filePath);
  }
  return extractRulesFromJS(source, filePath);
}

/**
 * Count total rule items in an extraction result.
 */
export function countItems(extraction) {
  let total = 0;
  function countNode(node) {
    total++;
    if (node.conditions) {
      for (const child of node.conditions) countNode(child);
    }
  }
  for (const rule of extraction.rules) countNode(rule);
  for (const fn of extraction.functionRules) {
    for (const rule of fn.rules) countNode(rule);
  }
  return total;
}
