/**
 * Preset Templates Routes
 * Serves pre-configured starter values from YAML template files
 */

import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = resolve(__dirname, '../../../../../common/apps/persona-editor');
const TEMPLATE_FILES = [
  resolve(TEMPLATE_DIR, 'llm-default-categories.template.yaml'),
  resolve(TEMPLATE_DIR, 'llm-default-providers.template.yaml'),
  resolve(TEMPLATE_DIR, 'llm-default-roles.template.yaml'),
  resolve(TEMPLATE_DIR, 'llm-default-goals.template.yaml'),
  resolve(TEMPLATE_DIR, 'llm-default-prompts.template.yaml'),
  resolve(TEMPLATE_DIR, 'llm-default-permissions.template.yaml'),
];

const VALID_CATEGORIES = ['tools', 'permissions', 'goals', 'prompts', 'tones', 'roles', 'providers'];

const isDev = process.env.NODE_ENV === 'development';

/** @type {Record<string, unknown[]> | null} */
let cachedTemplate = null;

async function loadTemplate() {
  if (!isDev && cachedTemplate) return cachedTemplate;
  /** @type {Record<string, unknown[]>} */
  const merged = {};
  for (const filePath of TEMPLATE_FILES) {
    try {
      const raw = await readFile(filePath, 'utf8');
      const parsed = yaml.load(raw);
      if (parsed && typeof parsed === 'object') {
        Object.assign(merged, parsed);
      }
    } catch (err) {
      // Skip missing files silently — not all template files are required
      if (err.code !== 'ENOENT') throw err;
    }
  }
  cachedTemplate = merged;
  return cachedTemplate;
}

export default async function presetsRoutes(fastify, _options) {
  // GET /presets/:category — list presets for a category
  fastify.get('/:category', {
    schema: {
      description: 'Get preset templates for a category',
      tags: ['Presets'],
      params: {
        type: 'object',
        required: ['category'],
        properties: {
          category: { type: 'string', enum: VALID_CATEGORIES },
        },
      },
    },
  }, async (request, reply) => {
    const { category } = request.params;

    if (!VALID_CATEGORIES.includes(category)) {
      return reply.status(400).send({ message: `Invalid category: ${category}` });
    }

    try {
      const template = await loadTemplate();
      const presets = (template[category] || []).map((p) => ({
        name: p.name,
        description: p.description,
        value: p.value ?? p.values,
        context: p.context ?? null,
        is_default: p.is_default ?? false,
      }));
      return reply.send(presets);
    } catch (err) {
      fastify.log.warn(`Failed to load preset template: ${err.message}`);
      return reply.send([]);
    }
  });
}
