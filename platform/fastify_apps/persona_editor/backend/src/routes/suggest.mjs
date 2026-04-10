/**
 * Suggest Routes
 * AI-powered suggestion endpoints for persona fields
 */

import { GeminiClient } from 'gemini_openai_sdk';

const client = new GeminiClient({ model: 'flash' });

function formatProperties(properties) {
  const lines = [];
  for (const [key, value] of Object.entries(properties)) {
    if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) continue;
    const display = Array.isArray(value) ? value.join(', ') : String(value);
    lines.push(`- ${key}: ${display}`);
  }
  return lines.join('\n');
}

const PROMPTS = {
  name: (props) =>
    `Given these persona properties, suggest a concise, descriptive name (2-5 words, no quotes):\n\n${formatProperties(props)}\n\nRespond with ONLY the name, nothing else.`,

  description: (props) =>
    `Given these persona properties, write a 2-3 sentence description of this persona:\n\n${formatProperties(props)}\n\nRespond with ONLY the description, nothing else.`,

  persona_prompt: (props) =>
    `Combine all these persona properties into a system prompt that defines this persona's behavior for an LLM. The prompt should be clear, actionable, and ready to use as a system message.\n\nIMPORTANT: Any value wrapped in double brackets like [[some-id]] is a reference ID — preserve these exactly as-is in the output. Do NOT expand, rename, or remove the brackets.\n\n${formatProperties(props)}\n\nRespond with ONLY the system prompt, nothing else.`,
};

export default async function suggestRoutes(fastify, _options) {
  fastify.post('/', {
    schema: {
      description: 'Generate AI suggestion for a persona field',
      tags: ['Suggest'],
      body: {
        type: 'object',
        required: ['type', 'properties'],
        properties: {
          type: { type: 'string', enum: ['name', 'description', 'persona_prompt'] },
          properties: { type: 'object' },
        },
      },
    },
  }, async (request, reply) => {
    const { type, properties } = request.body;

    const promptFn = PROMPTS[type];
    if (!promptFn) {
      return reply.status(400).send({
        error: 'BadRequest',
        message: `Invalid suggestion type: ${type}`,
        statusCode: 400,
      });
    }

    const prompt = promptFn(properties);
    const result = await client.chat(prompt, { temperature: 0.7, maxTokens: 1000 });

    if (!result.success) {
      return reply.status(502).send({
        error: 'UpstreamError',
        message: 'Failed to generate suggestion',
        statusCode: 502,
      });
    }

    return reply.send({ suggestion: result.content.trim(), type });
  });
}
