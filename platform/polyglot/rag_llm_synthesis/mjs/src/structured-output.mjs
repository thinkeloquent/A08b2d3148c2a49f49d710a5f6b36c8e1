/**
 * @fileoverview Structured output enforcement helpers.
 */

export const SCHEMA_LANGUAGE_LABELS = {
  json_schema: 'JSON Schema',
  zod: 'Zod',
  typescript: 'TypeScript types',
  graphql: 'GraphQL schema',
  pydantic: 'Pydantic model',
  dataclass: 'Python dataclass',
  typeddict: 'Python TypedDict',
};

/**
 * Build format instruction text to append to a system prompt.
 *
 * @param {string} outputFormat - Desired output format ("markdown", "json", "yaml")
 * @param {string} [schemaLanguage] - Schema language identifier
 * @param {string} [schemaText] - Schema definition text
 * @returns {string} Instruction string (empty for "markdown")
 */
export function buildFormatInstructions(outputFormat, schemaLanguage, schemaText) {
  if (outputFormat === 'markdown') {
    return '';
  }

  if (schemaLanguage && schemaText) {
    const label = SCHEMA_LANGUAGE_LABELS[schemaLanguage] || schemaLanguage;
    const fmtLabel = outputFormat.toUpperCase();
    return (
      `\n\nYou MUST respond with valid ${fmtLabel} that conforms to the following ` +
      `${label} definition:\n\`\`\`\n${schemaText}\n\`\`\`\n` +
      `Output ONLY the ${fmtLabel}, no markdown fences or commentary.`
    );
  }

  if (outputFormat === 'json' || outputFormat === 'yaml') {
    return (
      `\n\nYou MUST respond in ${outputFormat.toUpperCase()} format. ` +
      `Output ONLY valid ${outputFormat.toUpperCase()}, no markdown fences or commentary.`
    );
  }

  return '';
}
