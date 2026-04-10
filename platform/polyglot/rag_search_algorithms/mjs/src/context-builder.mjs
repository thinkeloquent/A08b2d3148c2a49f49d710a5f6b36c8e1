/**
 * @fileoverview Context builder for LLM prompts.
 */

/**
 * Build a formatted context string from search result documents.
 *
 * @param {Array<{metadata: Record<string, any>, pageContent?: string, page_content?: string}>} docs
 * @returns {string}
 */
export function buildContext(docs) {
  const contextParts = [];
  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i];
    const meta = doc.metadata || {};
    const parts = [];
    if (meta.component) {
      parts.push(`component=${meta.component}`);
    }
    if (meta.file_name) {
      parts.push(meta.file_name);
    }
    const header = parts.join(' | ');
    const content = doc.pageContent || doc.page_content || '';
    contextParts.push(`--- Source ${i + 1}: ${header} ---\n${content}`);
  }
  return contextParts.join('\n\n');
}
