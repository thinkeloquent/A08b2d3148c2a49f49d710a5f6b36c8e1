/**
 * g11n (Globalization) template resolver.
 *
 * Resolves template strings using edge.js-style `{expression}` syntax.
 * Expressions are dot-path lookups into a context object.
 *
 * Resolution order (node-level overrides win over root-level defaults):
 *   1. node.data.g11n[section][key]   — stage-level override
 *   2. graphDef.g11n[section][key]     — root-level default
 *
 * Context object shape passed to templates:
 *   {
 *     stage: { id, label, icon, nodeType, category },
 *     iterationCount: number,
 *     count: number,           // generic count (e.g., timeline events)
 *     ...extra                 // caller-provided values
 *   }
 */

// ─── Template engine ─────────────────────────────────────────────────────────

/**
 * Resolve `{dotPath}` placeholders against a flat context object.
 * Supports nested paths like `{stage.label}`.
 *
 *   resolveTemplate("Hello {stage.label}", { stage: { label: "Reflect" } })
 *   → "Hello Reflect"
 */
export function resolveTemplate(template, ctx = {}) {
  if (typeof template !== 'string') return template ?? '';
  return template.replace(/\{([^}]+)\}/g, (match, path) => {
    const value = resolvePath(ctx, path.trim());
    return value !== undefined ? String(value) : match;
  });
}

function resolvePath(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

// ─── Resolution with override cascade ────────────────────────────────────────

/**
 * Resolve a g11n string for a given section + key, with node override support.
 *
 * @param {object} graphDef  - Full graph definition (has root g11n)
 * @param {string} nodeId    - The node whose data.g11n may override
 * @param {string} section   - g11n section (e.g., "feedback", "timeline", "node")
 * @param {string} key       - Key within the section (e.g., "title", "placeholder")
 * @param {object} ctx       - Context object for template resolution
 * @returns {string}
 */
export function resolveG11n(graphDef, nodeId, section, key, ctx = {}) {
  if (!graphDef) return '';
  const nodeDef = graphDef.nodes?.find((n) => n.id === nodeId);
  const nodeG11n = nodeDef?.data?.g11n;

  // 1. Node-level override
  const override = nodeG11n?.[section]?.[key];
  if (override !== undefined) return resolveTemplate(override, ctx);

  // 2. Root-level default
  const root = graphDef.g11n?.[section]?.[key];
  if (root !== undefined) return resolveTemplate(root, ctx);

  // 3. Fallback — return empty string
  return '';
}

// ─── Placeholder shortcut ───────────────────────────────────────────────────

/**
 * Shortcut for resolving app-level placeholder strings from
 * `g11n.langgraph_placeholders[key]`.
 *
 * These are non-node-specific UI strings (labels, titles, button text, etc.).
 *
 *   t(graphDef, 'controlsStart')              → "Start"
 *   t(graphDef, 'statusRunningIteration', {…}) → "Running — Iteration 2 of 3"
 */
export function t(graphDef, key, ctx = {}) {
  return resolveG11n(graphDef, null, 'langgraph_placeholders', key, ctx);
}

// ─── React helpers ───────────────────────────────────────────────────────────

/**
 * Build a stage context object from a node definition.
 * Used as the base context when resolving g11n templates.
 */
export function buildStageContext(nodeDef, extra = {}) {
  const data = nodeDef?.data ?? {};
  return {
    stage: {
      id: nodeDef?.id ?? '',
      label: data.label ?? nodeDef?.id ?? '',
      icon: data.icon ?? '',
      nodeType: data.nodeType ?? '',
      category: data.category ?? '',
    },
    ...extra,
  };
}
