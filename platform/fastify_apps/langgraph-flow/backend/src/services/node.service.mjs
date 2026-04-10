/**
 * Node Service
 * Business logic for node CRUD within a Flow's flow_data.nodes JSONB array.
 * Does NOT create separate DB rows — mutates the JSONB column on the Flow record.
 */

/**
 * Create node service with database models.
 *
 * @param {object} db - Fastify db decorator: { sequelize, Flow, FlowVersion }
 * @returns {object} Node service methods
 */
export function createNodeService(db) {
  const { sequelize, Flow, FlowVersion } = db;

  /**
   * Fetch a flow by ID within an optional transaction.
   * Throws a 404-coded error if not found.
   *
   * @param {string} flowId
   * @param {import('sequelize').Transaction} [transaction]
   * @returns {Promise<import('sequelize').Model>}
   */
  async function _requireFlow(flowId, transaction) {
    const flow = await Flow.findByPk(flowId, { transaction });
    if (!flow) {
      const err = new Error(`Flow not found: ${flowId}`);
      err.statusCode = 404;
      throw err;
    }
    return flow;
  }

  /**
   * Determine the next version number for a flow.
   *
   * @param {string} flowId
   * @param {import('sequelize').Transaction} transaction
   * @returns {Promise<number>}
   */
  async function _nextVersion(flowId, transaction) {
    const latest = await FlowVersion.findOne({
      where: { flow_id: flowId },
      order: [['version', 'DESC']],
      attributes: ['version'],
      transaction,
    });
    return latest ? latest.version + 1 : 1;
  }

  /**
   * Create a FlowVersion snapshot of the given flow_data.
   *
   * @param {string} flowId
   * @param {object} flowData
   * @param {string} summary
   * @param {import('sequelize').Transaction} transaction
   * @returns {Promise<void>}
   */
  async function _createVersionSnapshot(flowId, flowData, summary, transaction) {
    const version = await _nextVersion(flowId, transaction);
    await FlowVersion.create(
      {
        flow_id: flowId,
        version,
        flow_data: flowData,
        change_summary: summary,
      },
      { transaction },
    );
  }

  /**
   * Return all nodes from a flow's flow_data.nodes.
   *
   * @param {string} flowId - UUID
   * @returns {Promise<object[]>}
   */
  async function listNodes(flowId) {
    const flow = await _requireFlow(flowId);
    return (flow.flow_data?.nodes ?? []);
  }

  /**
   * Find a single node by ID within a flow's flow_data.nodes.
   *
   * @param {string} flowId - UUID
   * @param {string} nodeId
   * @returns {Promise<object>} Node object
   */
  async function getNode(flowId, nodeId) {
    const nodes = await listNodes(flowId);
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) {
      const err = new Error(`Node not found: ${nodeId}`);
      err.statusCode = 404;
      throw err;
    }
    return node;
  }

  /**
   * Add a node to a flow's flow_data.nodes.
   * Validates that the node ID is unique and contains no spaces.
   * Creates a new FlowVersion snapshot.
   *
   * @param {string} flowId - UUID
   * @param {object} nodeData
   * @param {string} nodeData.id
   * @param {string} nodeData.type
   * @param {{ x: number, y: number }} nodeData.position
   * @param {object} nodeData.data - Node metadata (label, handler, category, icon, …)
   * @returns {Promise<object>} The added node
   */
  async function addNode(flowId, nodeData) {
    if (!nodeData.id || typeof nodeData.id !== 'string') {
      const err = new Error('Node id is required and must be a string');
      err.statusCode = 400;
      throw err;
    }
    if (/\s/.test(nodeData.id)) {
      const err = new Error('Node id must not contain spaces');
      err.statusCode = 400;
      throw err;
    }

    const transaction = await sequelize.transaction();
    try {
      const flow = await _requireFlow(flowId, transaction);
      const flowData = structuredClone(flow.flow_data ?? { nodes: [], edges: [], conditions: [] });
      flowData.nodes = flowData.nodes ?? [];

      if (flowData.nodes.some((n) => n.id === nodeData.id)) {
        await transaction.rollback();
        const err = new Error(`Duplicate node id: ${nodeData.id}`);
        err.statusCode = 409;
        throw err;
      }

      const newNode = {
        id: nodeData.id,
        type: nodeData.type ?? 'default',
        position: nodeData.position ?? { x: 0, y: 0 },
        data: nodeData.data ?? {},
      };
      flowData.nodes.push(newNode);

      await flow.update({ flow_data: flowData }, { transaction });
      await _createVersionSnapshot(flowId, flowData, `Added node: ${nodeData.id}`, transaction);

      await transaction.commit();
      return newNode;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Update properties of an existing node.
   * If the node id changes, all edge source/target references and condition
   * source_node/target_node references are updated accordingly.
   * Creates a new FlowVersion snapshot.
   *
   * @param {string} flowId - UUID
   * @param {string} nodeId
   * @param {object} updates - Partial node fields (id, type, position, data)
   * @returns {Promise<object>} Updated node
   */
  async function updateNode(flowId, nodeId, updates) {
    const transaction = await sequelize.transaction();
    try {
      const flow = await _requireFlow(flowId, transaction);
      const flowData = structuredClone(flow.flow_data ?? { nodes: [], edges: [], conditions: [] });
      flowData.nodes = flowData.nodes ?? [];
      flowData.edges = flowData.edges ?? [];
      flowData.conditions = flowData.conditions ?? [];

      const idx = flowData.nodes.findIndex((n) => n.id === nodeId);
      if (idx === -1) {
        await transaction.rollback();
        const err = new Error(`Node not found: ${nodeId}`);
        err.statusCode = 404;
        throw err;
      }

      const newId = updates.id !== undefined ? updates.id : nodeId;

      // Validate the new id if it is changing
      if (newId !== nodeId) {
        if (/\s/.test(newId)) {
          await transaction.rollback();
          const err = new Error('Node id must not contain spaces');
          err.statusCode = 400;
          throw err;
        }
        if (flowData.nodes.some((n, i) => n.id === newId && i !== idx)) {
          await transaction.rollback();
          const err = new Error(`Duplicate node id: ${newId}`);
          err.statusCode = 409;
          throw err;
        }

        // Update edge references
        for (const edge of flowData.edges) {
          if (edge.source === nodeId) edge.source = newId;
          if (edge.target === nodeId) edge.target = newId;
        }

        // Update condition references
        for (const cond of flowData.conditions) {
          if (cond.source_node === nodeId) cond.source_node = newId;
          if (cond.target_node === nodeId) cond.target_node = newId;
        }
      }

      // Apply updates to node
      const node = flowData.nodes[idx];
      if (updates.id !== undefined) node.id = updates.id;
      if (updates.type !== undefined) node.type = updates.type;
      if (updates.position !== undefined) node.position = updates.position;
      if (updates.data !== undefined) node.data = { ...node.data, ...updates.data };

      await flow.update({ flow_data: flowData }, { transaction });
      await _createVersionSnapshot(flowId, flowData, `Updated node: ${nodeId}`, transaction);

      await transaction.commit();
      return flowData.nodes[idx];
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Remove a node and all edges/conditions that reference it.
   * Removes edges where source === nodeId or target === nodeId.
   * Removes conditions where source_node === nodeId or target_node === nodeId.
   * Creates a new FlowVersion snapshot.
   *
   * @param {string} flowId - UUID
   * @param {string} nodeId
   * @returns {Promise<boolean>} true if deleted
   */
  async function deleteNode(flowId, nodeId) {
    const transaction = await sequelize.transaction();
    try {
      const flow = await _requireFlow(flowId, transaction);
      const flowData = structuredClone(flow.flow_data ?? { nodes: [], edges: [], conditions: [] });
      flowData.nodes = flowData.nodes ?? [];
      flowData.edges = flowData.edges ?? [];
      flowData.conditions = flowData.conditions ?? [];

      const idx = flowData.nodes.findIndex((n) => n.id === nodeId);
      if (idx === -1) {
        await transaction.rollback();
        const err = new Error(`Node not found: ${nodeId}`);
        err.statusCode = 404;
        throw err;
      }

      flowData.nodes.splice(idx, 1);
      flowData.edges = flowData.edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId,
      );
      flowData.conditions = flowData.conditions.filter(
        (c) => c.source_node !== nodeId && c.target_node !== nodeId,
      );

      await flow.update({ flow_data: flowData }, { transaction });
      await _createVersionSnapshot(flowId, flowData, `Deleted node: ${nodeId}`, transaction);

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  return {
    listNodes,
    getNode,
    addNode,
    updateNode,
    deleteNode,
  };
}
