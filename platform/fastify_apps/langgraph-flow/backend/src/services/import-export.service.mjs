/**
 * Import/Export Service
 * Handles importing flows from external JSON formats and exporting to various targets.
 *
 * Supported source formats: native, flowise, langflow
 * Supported export targets: native, flowise, langflow, mermaid
 */

/**
 * Convert a Flowise flow JSON into the native flow_data shape.
 *
 * @param {object} data - Parsed Flowise JSON
 * @returns {object} Native flow_data
 */
function fromFlowise(data) {
  // Flowise stores nodes under `nodes` and edges under `edges`
  // Map them through with minimal transformation — preserve IDs and positions
  const nodes = (data.nodes || []).map((n) => ({
    id: n.id,
    type: n.type || 'default',
    position: n.position || { x: 0, y: 0 },
    data: n.data || {},
  }));

  const edges = (data.edges || []).map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.sourceHandle || null,
    targetHandle: e.targetHandle || null,
  }));

  return { nodes, edges, viewport: data.viewport || { x: 0, y: 0, zoom: 1 } };
}

/**
 * Convert a LangFlow flow JSON into the native flow_data shape.
 *
 * @param {object} data - Parsed LangFlow JSON
 * @returns {object} Native flow_data
 */
function fromLangflow(data) {
  // LangFlow uses `data.nodes` and `data.edges`
  const flowData = data.data || data;
  const nodes = (flowData.nodes || []).map((n) => ({
    id: n.id,
    type: n.type || 'default',
    position: n.position || { x: 0, y: 0 },
    data: n.data || {},
  }));

  const edges = (flowData.edges || []).map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.sourceHandle || null,
    targetHandle: e.targetHandle || null,
  }));

  return {
    nodes,
    edges,
    viewport: flowData.viewport || { x: 0, y: 0, zoom: 1 },
  };
}

/**
 * Convert native flow_data to Flowise-compatible export shape.
 *
 * @param {object} flowData - Native flow_data
 * @returns {object}
 */
function toFlowise(flowData) {
  return {
    nodes: (flowData.nodes || []).map((n) => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: n.data,
    })),
    edges: (flowData.edges || []).map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle,
    })),
    viewport: flowData.viewport,
  };
}

/**
 * Convert native flow_data to LangFlow-compatible export shape.
 *
 * @param {object} flowData - Native flow_data
 * @returns {object}
 */
function toLangflow(flowData) {
  return {
    data: {
      nodes: (flowData.nodes || []).map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
      })),
      edges: (flowData.edges || []).map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
      })),
      viewport: flowData.viewport,
    },
  };
}

/**
 * Convert native flow_data to a Mermaid diagram string.
 *
 * @param {object} flowData - Native flow_data
 * @param {string} flowName - Human-readable name for the diagram title
 * @returns {string} Mermaid syntax
 */
function toMermaid(flowData, flowName) {
  const lines = ['graph TD'];

  // Add nodes
  for (const node of flowData.nodes || []) {
    const label = (node.data && node.data.label) || node.id;
    // Sanitize label for Mermaid (no quotes, brackets)
    const safeLabel = String(label).replace(/["\[\]()]/g, '');
    const safeId = String(node.id).replace(/[^a-zA-Z0-9_]/g, '_');
    lines.push(`  ${safeId}["${safeLabel}"]`);
  }

  // Add edges
  for (const edge of flowData.edges || []) {
    const safeSource = String(edge.source).replace(/[^a-zA-Z0-9_]/g, '_');
    const safeTarget = String(edge.target).replace(/[^a-zA-Z0-9_]/g, '_');
    const label = edge.label ? ` |${String(edge.label).replace(/[^a-zA-Z0-9 _]/g, '')}|` : '';
    lines.push(`  ${safeSource} -->${label} ${safeTarget}`);
  }

  return lines.join('\n');
}

/**
 * Create import/export service.
 *
 * @param {object} flowService - Instance of flow service (from createFlowService)
 * @returns {object} Import/export service methods
 */
export function createImportExportService(flowService) {
  /**
   * Import a flow from a JSON string in a given source format.
   * Validates required structure and persists via flowService.createFlow.
   *
   * @param {string} jsonString - Raw JSON string
   * @param {string} [sourceFormat='native'] - 'native' | 'flowise' | 'langflow'
   * @returns {Promise<object>} Created flow
   */
  async function importFlow(jsonString, sourceFormat = 'native') {
    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch {
      const err = new Error('Invalid JSON: could not parse input');
      err.statusCode = 400;
      throw err;
    }

    if (!parsed || typeof parsed !== 'object') {
      const err = new Error('Invalid flow: expected a JSON object');
      err.statusCode = 400;
      throw err;
    }

    let flowData;
    let name;
    let description;

    if (sourceFormat === 'flowise') {
      if (!parsed.nodes && !parsed.edges) {
        const err = new Error('Invalid Flowise format: missing nodes/edges');
        err.statusCode = 400;
        throw err;
      }
      flowData = fromFlowise(parsed);
      name = parsed.name || 'Imported Flowise Flow';
      description = parsed.description || null;
    } else if (sourceFormat === 'langflow') {
      const flowPayload = parsed.data || parsed;
      if (!flowPayload.nodes && !flowPayload.edges) {
        const err = new Error('Invalid LangFlow format: missing nodes/edges');
        err.statusCode = 400;
        throw err;
      }
      flowData = fromLangflow(parsed);
      name = parsed.name || 'Imported LangFlow Flow';
      description = parsed.description || null;
    } else {
      // native
      if (!parsed.flow_data || typeof parsed.flow_data !== 'object') {
        const err = new Error('Invalid native format: missing flow_data object');
        err.statusCode = 400;
        throw err;
      }
      flowData = parsed.flow_data;
      name = parsed.name;
      description = parsed.description || null;
    }

    if (!name) {
      const err = new Error('Flow name is required in the import payload');
      err.statusCode = 400;
      throw err;
    }

    const viewport = flowData.viewport || { x: 0, y: 0, zoom: 1 };

    return flowService.createFlow({
      name,
      description,
      viewport_x: viewport.x ?? 0,
      viewport_y: viewport.y ?? 0,
      viewport_zoom: viewport.zoom ?? 1,
      flow_data: flowData,
      source_format: sourceFormat,
    });
  }

  /**
   * Export a flow to the requested target format.
   * Returns a plain object for JSON formats, or a string for 'mermaid'.
   *
   * @param {object} flow - Serialized flow (from serializeFlow)
   * @param {string} [targetFormat='native'] - 'native' | 'flowise' | 'langflow' | 'mermaid'
   * @returns {object|string} Exported payload
   */
  function exportFlow(flow, targetFormat = 'native') {
    const flowData = flow.flow_data || { nodes: [], edges: [] };

    switch (targetFormat) {
      case 'flowise':
        return toFlowise(flowData);

      case 'langflow':
        return toLangflow(flowData);

      case 'mermaid':
        return toMermaid(flowData, flow.name);

      case 'native':
      default:
        return {
          name: flow.name,
          description: flow.description,
          flow_data: flowData,
          source_format: flow.source_format,
        };
    }
  }

  return { importFlow, exportFlow };
}
