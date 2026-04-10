/**
 * @fileoverview Extract JSON from LLM responses.
 */

/**
 * Extract JSON from LLM response, stripping markdown fences if present.
 *
 * @param {string} text - Raw LLM response text
 * @returns {string} Cleaned JSON string, or original text if no valid JSON found
 */
export function extractJson(text) {
  let stripped = text.trim();

  // Remove markdown code fences
  if (stripped.startsWith('```')) {
    const lines = stripped.split('\n');
    // Drop first line (```json) and last line (```)
    const inner = lines.slice(1);
    if (inner.length && inner[inner.length - 1].trim() === '```') {
      inner.pop();
    }
    stripped = inner.join('\n').trim();
  }

  // Validate it's parseable JSON
  try {
    JSON.parse(stripped);
    return stripped;
  } catch {
    // Try to find a JSON object in the text
    const match = stripped.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        JSON.parse(match[0]);
        return match[0];
      } catch {
        // fall through
      }
    }
    return text;
  }
}
