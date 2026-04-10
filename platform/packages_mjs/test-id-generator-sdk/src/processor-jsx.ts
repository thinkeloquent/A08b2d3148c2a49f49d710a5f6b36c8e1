import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
import generateModule from '@babel/generator';
import * as t from '@babel/types';
import { resolveConfig } from './defaults.js';
import type { TestIdGeneratorConfig, ProcessResult } from './types.js';

// ESM compatibility for Babel default exports
const traverse = (traverseModule as any).default || traverseModule;
const generate = (generateModule as any).default || generateModule;

/**
 * Process JSX/TSX source content, injecting test ID attributes
 * into elements matching the configured rules.
 */
export function processJsx(content: string, config?: TestIdGeneratorConfig): ProcessResult {
  const resolved = resolveConfig(config);
  const { attribute, parentTags, targetTags, skipExisting, idGenerator } = resolved;

  const ast = parse(content, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });

  let count = 0;

  traverse(ast, {
    JSXElement(path: any) {
      const openingElement = path.node.openingElement;
      const tagNameNode = openingElement.name;

      // Skip complex tags like <MyComponent.Sub>
      if (!t.isJSXIdentifier(tagNameNode)) return;

      const tagName = tagNameNode.name.toLowerCase();
      let needsId = false;

      // Rule: target tags always get IDs
      if (targetTags.includes(tagName)) {
        needsId = true;
      }

      // Rule: direct children of parent tags get IDs
      if (!needsId && path.parentPath.isJSXElement()) {
        const parentTagNameNode = path.parentPath.node.openingElement.name;
        if (t.isJSXIdentifier(parentTagNameNode)) {
          const parentTagName = parentTagNameNode.name.toLowerCase();
          if (parentTags.includes(parentTagName)) {
            needsId = true;
          }
        }
      }

      if (!needsId) return;

      // Check if the attribute already exists
      if (skipExisting) {
        const hasAttr = openingElement.attributes.some(
          (attr: any) => t.isJSXAttribute(attr) && (attr.name as any).name === attribute
        );
        if (hasAttr) return;
      }

      // Inject the attribute
      const idValue = idGenerator(tagName);
      openingElement.attributes.push(
        t.jsxAttribute(
          t.jsxIdentifier(attribute),
          t.stringLiteral(idValue)
        )
      );
      count++;
    },
  });

  if (count === 0) {
    return { code: content, modified: false, count: 0 };
  }

  const output = generate(ast, { retainLines: true }, content);
  return { code: output.code, modified: true, count };
}
