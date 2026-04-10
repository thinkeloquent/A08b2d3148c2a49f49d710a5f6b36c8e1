/**
 * Fetches the app-level graph definition from /graph.json, then merges
 * with a workflow definition from either storage (active workflow) or
 * /graph-workflow.json as fallback.  Validates the result and caches it.
 */
let _cache = null;

/**
 * Deep-merge two plain objects. Arrays and non-object values from `src`
 * replace those in `base`; nested objects are merged recursively.
 */
function deepMerge(base, src) {
  const out = { ...base };
  for (const key of Object.keys(src)) {
    const bVal = base[key];
    const sVal = src[key];
    if (
      sVal && typeof sVal === 'object' && !Array.isArray(sVal) &&
      bVal && typeof bVal === 'object' && !Array.isArray(bVal)
    ) {
      out[key] = deepMerge(bVal, sVal);
    } else {
      out[key] = sVal;
    }
  }
  return out;
}

/**
 * Validate that the graph definition follows the universal schema.
 * Throws descriptive errors for missing required fields.
 */
function validateGraphDef(def) {
  if (!Array.isArray(def.nodes) || def.nodes.length === 0) {
    throw new Error('Graph definition must have a non-empty "nodes" array');
  }
  if (!Array.isArray(def.edges)) {
    throw new Error('Graph definition must have an "edges" array');
  }
  if (!def.config?.entryPoint) {
    throw new Error('Graph definition must have "config.entryPoint"');
  }

  for (const node of def.nodes) {
    if (!node.id) throw new Error('Every node must have an "id"');
    if (!node.type) throw new Error(`Node "${node.id}" must have a "type"`);
    if (!node.data) throw new Error(`Node "${node.id}" must have a "data" object`);
    if (!node.data.nodeType) throw new Error(`Node "${node.id}" data must have a "nodeType"`);
  }

  for (const edge of def.edges) {
    if (!edge.id) throw new Error('Every edge must have an "id"');
    if (!edge.source || !edge.target) {
      throw new Error(`Edge "${edge.id}" must have "source" and "target"`);
    }
  }
}

import { getStorageAdapter } from '../storage/index.js';

/**
 * Load the workflow definition. Checks storage for an active instance first,
 * then active workflow, then falls back to /graph-workflow.json.
 */
async function loadWorkflowDef() {
  const storage = getStorageAdapter();

  // Prefer active instance snapshot (frozen workflow copy for execution)
  const activeInstId = await storage.get('instance_active_id');
  if (activeInstId) {
    const instSnapshot = await storage.get(`instance_${activeInstId}`);
    if (instSnapshot) return instSnapshot;
  }

  // Fall back to active workflow
  const activeId = await storage.get('workflow_active_id');
  if (activeId) {
    const stored = await storage.get(`workflow_${activeId}`);
    if (stored) return stored;
  }

  // Fallback to static file
  const res = await fetch(import.meta.env.BASE_URL + 'graph-workflow.json');
  if (!res.ok) throw new Error(`Failed to load workflow definition: ${res.status}`);
  return res.json();
}

export async function loadGraphDefinition({ force = false } = {}) {
  if (_cache && !force) return _cache;

  const [appRes, workflowDef] = await Promise.all([
    fetch(import.meta.env.BASE_URL + 'graph.json'),
    loadWorkflowDef(),
  ]);

  if (!appRes.ok) throw new Error(`Failed to load app definition: ${appRes.status}`);
  const appDef = await appRes.json();

  // Workflow overrides app defaults; nodes/edges/config/state/conditions
  // come entirely from the workflow file, g11n sections are deep-merged.
  const def = deepMerge(appDef, workflowDef);
  validateGraphDef(def);

  _cache = def;
  return _cache;
}

/** Clear the cache so next loadGraphDefinition() re-fetches. */
export function clearGraphCache() {
  _cache = null;
}

/**
 * Synchronous access after initial load (for components that render after boot).
 */
export function getGraphDefinition() {
  if (!_cache) throw new Error('Graph definition not loaded yet — call loadGraphDefinition() first');
  return _cache;
}

/**
 * Resolve a condition from the JSON definition against graph state.
 */
export function evaluateCondition(graphDef, conditionName, state) {
  const cond = graphDef.conditions?.[conditionName];
  if (!cond) throw new Error(`Unknown condition: ${conditionName}`);

  // Resolve field value — support "state.x.y" dot paths
  let fieldValue = state[cond.field];
  if (fieldValue === undefined && typeof cond.field === 'string' && cond.field.includes('.')) {
    fieldValue = cond.field.split('.').reduce((obj, key) => obj?.[key], state);
  }

  let threshold = cond.value;

  // Resolve "config.maxIterations" → graphDef.config.maxIterations
  if (typeof threshold === 'string' && threshold.startsWith('config.')) {
    const key = threshold.slice('config.'.length);
    threshold = graphDef.config[key];
  }

  // Resolve "state.vulnerabilities.length" → state.vulnerabilities.length
  if (typeof threshold === 'string' && threshold.startsWith('state.')) {
    const path = threshold.slice('state.'.length);
    threshold = path.split('.').reduce((obj, key) => obj?.[key], state);
  }

  // Coerce undefined to 0 for numeric comparisons to prevent NaN loops
  if (fieldValue === undefined) {
    console.warn(`[condition] ${conditionName}: field "${cond.field}" is undefined in state, defaulting to 0`);
    fieldValue = 0;
  }
  if (threshold === undefined) {
    console.warn(`[condition] ${conditionName}: threshold "${cond.value}" resolved to undefined, defaulting to 0`);
    threshold = 0;
  }

  let result;
  switch (cond.operator) {
    case 'gte': result = fieldValue >= threshold ? cond.trueResult : cond.falseResult; break;
    case 'gt':  result = fieldValue > threshold  ? cond.trueResult : cond.falseResult; break;
    case 'lte': result = fieldValue <= threshold ? cond.trueResult : cond.falseResult; break;
    case 'lt':  result = fieldValue < threshold  ? cond.trueResult : cond.falseResult; break;
    case 'eq':  result = fieldValue === threshold ? cond.trueResult : cond.falseResult; break;
    case 'neq': result = fieldValue !== threshold ? cond.trueResult : cond.falseResult; break;
    case 'includes': result = String(fieldValue).includes(String(threshold)) ? cond.trueResult : cond.falseResult; break;
    case 'startsWith': result = String(fieldValue).startsWith(String(threshold)) ? cond.trueResult : cond.falseResult; break;
    default: throw new Error(`Unknown operator: ${cond.operator}`);
  }

  console.log(`[condition] ${conditionName}: ${cond.field}(${fieldValue}) ${cond.operator} ${threshold} → ${result} (true=${cond.trueResult}, false=${cond.falseResult})`);
  return result;
}
