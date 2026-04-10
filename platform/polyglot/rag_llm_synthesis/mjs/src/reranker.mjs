/**
 * @fileoverview Gemini-based listwise reranker.
 */

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/';

/**
 * Rerank candidates using Gemini as a listwise reranker.
 *
 * Each candidate is a [document, score] tuple where document has a
 * pageContent (or page_content) property.
 *
 * @param {string} query - The search query
 * @param {Array<[{pageContent?: string, page_content?: string}, number]>} candidates
 * @param {number} k - Number of top results to return
 * @param {Object} [opts]
 * @param {string} [opts.apiKey] - Gemini API key (falls back to GEMINI_API_KEY env)
 * @param {string} [opts.model='gemini-2.0-flash'] - Gemini model name
 * @returns {Promise<Array<[any, number]>>}
 */
export async function geminiRerank(query, candidates, k, opts = {}) {
  if (!candidates.length) {
    return candidates;
  }

  const cap = Math.min(candidates.length, 30);
  const capped = candidates.slice(0, cap);

  let chunksText = '';
  for (let i = 0; i < capped.length; i++) {
    const [doc] = capped[i];
    const content = (doc.pageContent || doc.page_content || '').slice(0, 600).replace(/\n/g, ' ').trim();
    chunksText += `[${i}] ${content}\n\n`;
  }

  const prompt =
    `You are a relevance ranker. Given a query and ${cap} text chunks, ` +
    `rank them by relevance to the query. Return ONLY a JSON array of indices ` +
    `from most relevant to least relevant. Example: [3, 0, 7, 1, ...]\n\n` +
    `Query: ${query}\n\nChunks:\n${chunksText}`;

  try {
    const apiKey = opts.apiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return candidates.slice(0, k);
    }

    const model = opts.model || 'gemini-2.0-flash';
    const resp = await fetch(`${GEMINI_BASE_URL}chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.0,
      }),
    });

    if (!resp.ok) {
      return candidates.slice(0, k);
    }

    const data = await resp.json();
    const content = data.choices[0].message.content.trim();

    let indices;
    try {
      indices = JSON.parse(content);
    } catch {
      const match = content.match(/\[[\d,\s]+\]/);
      if (match) {
        indices = JSON.parse(match[0]);
      } else {
        return candidates.slice(0, k);
      }
    }

    if (!Array.isArray(indices)) {
      return candidates.slice(0, k);
    }

    const reranked = [];
    const seen = new Set();
    for (const idx of indices) {
      if (Number.isInteger(idx) && idx >= 0 && idx < cap && !seen.has(idx)) {
        seen.add(idx);
        reranked.push(capped[idx]);
      }
    }
    for (let i = 0; i < capped.length; i++) {
      if (!seen.has(i)) {
        reranked.push(capped[i]);
      }
    }

    return reranked.slice(0, k);
  } catch {
    return candidates.slice(0, k);
  }
}
