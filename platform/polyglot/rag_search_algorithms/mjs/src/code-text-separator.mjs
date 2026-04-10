/**
 * @fileoverview Code/text separation for RAG search results.
 *
 * Provides three-tier separation:
 * 1. File extension check (known code files)
 * 2. Markdown fenced code block extraction
 * 3. Regex heuristic line-by-line classification
 */

import { extname } from 'node:path';

export const CODE_FILE_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.css', '.less', '.scss', '.sass',
  '.json', '.yaml', '.yml',
  '.sh', '.bash', '.zsh',
  '.py', '.rb', '.java', '.go', '.rs', '.c', '.cpp', '.h', '.hpp',
  '.vue', '.svelte', '.astro',
]);

const HEURISTIC_CODE_RE = new RegExp(
  '^(' +
  String.raw`import\s+.+\s+from\s+['"]` +
  String.raw`|export\s+(?:default\s+)?(?:function|const|class|interface|type)\b` +
  String.raw`|(?:const|let|var)\s+\w+\s*=` +
  String.raw`|function\s+\w+\s*\(` +
  String.raw`|return\s*[(\<]` +
  String.raw`|<[A-Z][a-zA-Z0-9]*` +
  String.raw`|</[A-Z][a-zA-Z0-9]*` +
  String.raw`|(?:interface|type)\s+[A-Z]\w*` +
  String.raw`|[}\])];\s*$` +
  String.raw`|[}\])]\s*$` +
  String.raw`|\w+\.\w+\(` +
  String.raw`|@\w+` +
  String.raw`|(?:props|state|this)\.` +
  ')',
  'm',
);

const FENCED_CODE_RE = /```[\w]*\n([\s\S]*?)```/g;

/**
 * Heuristic line-by-line split into code and text.
 * @param {string} text
 * @returns {{ codeParts: string[], textParts: string[] }}
 */
function heuristicSplitLines(text) {
  const lines = text.split('\n');
  const codeParts = [];
  const textParts = [];
  let curCode = [];
  let curText = [];
  let inCode = false;

  function flushCode() {
    if (curCode.length) {
      while (curCode.length && !curCode[curCode.length - 1].trim()) {
        curCode.pop();
      }
      if (curCode.length) {
        codeParts.push(curCode.join('\n'));
      }
      curCode = [];
    }
  }

  function flushText() {
    if (curText.length) {
      textParts.push(curText.join('\n'));
      curText = [];
    }
  }

  for (const line of lines) {
    const stripped = line.trim();
    if (HEURISTIC_CODE_RE.test(stripped)) {
      if (!inCode) {
        flushText();
        inCode = true;
      }
      curCode.push(line.trimEnd());
    } else if (inCode && stripped === '') {
      curCode.push('');
    } else if (inCode) {
      flushCode();
      inCode = false;
      curText.push(line.trimEnd());
    } else {
      curText.push(line.trimEnd());
    }
  }

  if (inCode) flushCode();
  flushText();
  return { codeParts, textParts };
}

/**
 * 3-tier code/text separation: file extension, markdown fenced blocks, regex heuristics.
 *
 * @param {string} content
 * @param {string} [fileName='']
 * @returns {{ codeParts: string[], textParts: string[] }}
 */
export function separateCodeText(content, fileName = '') {
  const trimmed = content.trim();
  if (!trimmed) {
    return { codeParts: [], textParts: [] };
  }

  // Tier 1: file extension
  if (fileName) {
    const ext = extname(fileName).toLowerCase();
    if (CODE_FILE_EXTENSIONS.has(ext)) {
      return { codeParts: [trimmed], textParts: [] };
    }
  }

  // Tier 2: Extract markdown fenced code blocks
  const codeParts = [];
  const textParts = [];
  let lastIndex = 0;

  for (const match of trimmed.matchAll(FENCED_CODE_RE)) {
    const before = trimmed.slice(lastIndex, match.index).trim();
    if (before) {
      const sub = heuristicSplitLines(before);
      codeParts.push(...sub.codeParts);
      textParts.push(...sub.textParts);
    }
    const code = match[1].trim();
    if (code) {
      codeParts.push(code);
    }
    lastIndex = match.index + match[0].length;
  }

  const remainder = trimmed.slice(lastIndex).trim();
  if (remainder) {
    const sub = heuristicSplitLines(remainder);
    codeParts.push(...sub.codeParts);
    textParts.push(...sub.textParts);
  }

  // If no fenced blocks were found, the whole text went through heuristic
  if (lastIndex === 0) {
    return heuristicSplitLines(trimmed);
  }

  return { codeParts, textParts };
}
