/**
 * Review Service
 * Workflow review, validation, and staged-commit workflow.
 *
 * Staged workflows are held in a module-level Map (in-process memory).
 * Tokens are random hex strings — callers must treat them as opaque.
 */

import { randomBytes } from 'node:crypto';

/**
 * In-memory store for staged (uncommitted) workflows.
 * Map<token: string, StagedEntry>
 *
 * @typedef {{ name: string, description: string|null, flow_data: object, template_id: string|null, reviewed_at: Date }} StagedEntry
 * @type {Map<string, StagedEntry>}
 */
const _staged = new Map();

/**
 * Generate a cryptographically random staging token (32 hex chars).
 *
 * @returns {string}
 */
function _generateToken() {
  return randomBytes(16).toString('hex');
}

/**
 * Validate a flow_data object and return a list of error strings.
 * Pure function — no DB access.
 *
 * @param {object} flowData
 * @returns {{ valid: boolean, errors: string[] }}
 */
function _runValidation(flowData) {
  const errors = [];
  const nodes = flowData.nodes ?? [];
  const edges = flowData.edges ?? [];
  const conditions = flowData.conditions ?? [];

  // Node IDs must be unique
  const nodeIds = new Set();
  for (const node of nodes) {
    if (nodeIds.has(node.id)) {
      errors.push(`Duplicate node id: ${node.id}`);
    }
    nodeIds.add(node.id);
  }

  // Edge IDs must be unique
  const edgeIds = new Set();
  for (const edge of edges) {
    if (edgeIds.has(edge.id)) {
      errors.push(`Duplicate edge id: ${edge.id}`);
    }
    edgeIds.add(edge.id);
  }

  // Edge source/target must reference existing nodes
  for (const edge of edges) {
    if (!nodeIds.has(edge.source)) {
      errors.push(`Edge "${edge.id}" references unknown source node: ${edge.source}`);
    }
    if (!nodeIds.has(edge.target)) {
      errors.push(`Edge "${edge.id}" references unknown target node: ${edge.target}`);
    }
  }

  // Condition IDs must be unique
  const conditionIds = new Set();
  for (const cond of conditions) {
    if (conditionIds.has(cond.id)) {
      errors.push(`Duplicate condition id: ${cond.id}`);
    }
    conditionIds.add(cond.id);
  }

  // Conditions must reference existing nodes when source_node/target_node are set
  for (const cond of conditions) {
    if (cond.source_node && !nodeIds.has(cond.source_node)) {
      errors.push(`Condition "${cond.id}" references unknown source_node: ${cond.source_node}`);
    }
    if (cond.target_node && !nodeIds.has(cond.target_node)) {
      errors.push(`Condition "${cond.id}" references unknown target_node: ${cond.target_node}`);
    }
  }

  // Orphan nodes: nodes with no connecting edges
  const connectedNodeIds = new Set();
  for (const edge of edges) {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  }
  for (const node of nodes) {
    if (nodes.length > 1 && !connectedNodeIds.has(node.id)) {
      errors.push(`Orphan node (no edges): ${node.id}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Build per-node and aggregate statistics from flow_data.
 *
 * @param {object} flowData
 * @returns {{ node_counts_by_category: Record<string, number>, edge_count: number, condition_count: number }}
 */
function _buildStats(flowData) {
  const nodes = flowData.nodes ?? [];
  const edges = flowData.edges ?? [];
  const conditions = flowData.conditions ?? [];

  const node_counts_by_category = {};
  for (const node of nodes) {
    const cat = node.data?.category ?? 'uncategorized';
    node_counts_by_category[cat] = (node_counts_by_category[cat] ?? 0) + 1;
  }

  return {
    node_counts_by_category,
    edge_count: edges.length,
    condition_count: conditions.length,
  };
}

/**
 * Create review service with database models.
 *
 * @param {object} db - Fastify db decorator: { sequelize, Flow, FlowVersion }
 * @returns {object} Review service methods
 */
export function createReviewService(db) {
  const { sequelize, Flow, FlowVersion } = db;

  /**
   * Get full workflow review data for an existing flow.
   *
   * @param {string} flowId - UUID
   * @returns {Promise<object>} Review payload
   */
  async function reviewWorkflow(flowId) {
    const flow = await Flow.findByPk(flowId);
    if (!flow) {
      const err = new Error(`Flow not found: ${flowId}`);
      err.statusCode = 404;
      throw err;
    }

    const flowData = flow.flow_data ?? { nodes: [], edges: [], conditions: [] };
    const { valid, errors: validation_errors } = _runValidation(flowData);
    const stats = _buildStats(flowData);

    return {
      flow: {
        id: flow.id,
        name: flow.name,
        description: flow.description,
        source_format: flow.source_format,
        created_at: flow.created_at,
        updated_at: flow.updated_at,
      },
      nodes: flowData.nodes ?? [],
      edges: flowData.edges ?? [],
      conditions: flowData.conditions ?? [],
      ...stats,
      valid,
      validation_errors,
    };
  }

  /**
   * Validate a flow_data object without persisting it.
   *
   * @param {object} flowData
   * @returns {{ valid: boolean, errors: string[] }}
   */
  function validateWorkflow(flowData) {
    if (!flowData || typeof flowData !== 'object') {
      return { valid: false, errors: ['flow_data must be a non-null object'] };
    }
    return _runValidation(flowData);
  }

  /**
   * Stage a workflow for review before persisting.
   * Returns a staging token and the review data for the caller to inspect.
   *
   * @param {object} data
   * @param {string} data.name
   * @param {string} [data.description]
   * @param {object} data.flow_data
   * @param {string} [data.template_id]
   * @returns {{ token: string, review: object }}
   */
  function stageWorkflow(data) {
    if (!data.name) {
      const err = new Error('name is required');
      err.statusCode = 400;
      throw err;
    }
    if (!data.flow_data || typeof data.flow_data !== 'object') {
      const err = new Error('flow_data is required and must be an object');
      err.statusCode = 400;
      throw err;
    }

    const { valid, errors: validation_errors } = _runValidation(data.flow_data);
    const stats = _buildStats(data.flow_data);

    const token = _generateToken();
    _staged.set(token, {
      name: data.name,
      description: data.description ?? null,
      flow_data: structuredClone(data.flow_data),
      template_id: data.template_id ?? null,
      reviewed_at: new Date(),
    });

    return {
      token,
      review: {
        name: data.name,
        description: data.description ?? null,
        nodes: data.flow_data.nodes ?? [],
        edges: data.flow_data.edges ?? [],
        conditions: data.flow_data.conditions ?? [],
        ...stats,
        valid,
        validation_errors,
      },
    };
  }

  /**
   * Persist a staged workflow, creating a Flow and its initial FlowVersion.
   * Removes the entry from the staging map after committing.
   *
   * @param {string} token - Staging token from stageWorkflow
   * @returns {Promise<object>} Newly created flow
   */
  async function commitStagedWorkflow(token) {
    const staged = _staged.get(token);
    if (!staged) {
      const err = new Error(`Staged workflow not found for token: ${token}`);
      err.statusCode = 404;
      throw err;
    }

    const viewport = staged.flow_data.viewport ?? { x: 0, y: 0, zoom: 1 };
    const transaction = await sequelize.transaction();

    try {
      const flow = await Flow.create(
        {
          name: staged.name,
          description: staged.description,
          viewport_x: viewport.x ?? 0,
          viewport_y: viewport.y ?? 0,
          viewport_zoom: viewport.zoom ?? 1,
          flow_data: staged.flow_data,
          source_format: 'native',
        },
        { transaction },
      );

      await FlowVersion.create(
        {
          flow_id: flow.id,
          version: 1,
          flow_data: staged.flow_data,
          change_summary: 'Initial version (committed from staging)',
        },
        { transaction },
      );

      await transaction.commit();

      _staged.delete(token);

      return Flow.findByPk(flow.id, {
        include: [
          {
            model: FlowVersion,
            as: 'versions',
            attributes: ['id', 'version', 'created_at'],
            limit: 1,
            order: [['version', 'DESC']],
            separate: true,
          },
        ],
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Discard a staged workflow without persisting it.
   *
   * @param {string} token - Staging token from stageWorkflow
   * @returns {boolean} true if discarded, false if token not found
   */
  function discardStagedWorkflow(token) {
    return _staged.delete(token);
  }

  return {
    reviewWorkflow,
    validateWorkflow,
    stageWorkflow,
    commitStagedWorkflow,
    discardStagedWorkflow,
  };
}
