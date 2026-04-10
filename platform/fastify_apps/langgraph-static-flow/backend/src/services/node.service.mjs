/**
 * Node Service
 * Business logic for node CRUD within a Flow's flow_data.nodes JSONB array.
 * Does NOT create separate DB rows — mutates the JSONB column on the Flow record.
 */

export function createNodeService(db) {
  const { sequelize, Flow, FlowVersion } = db;

  async function _requireFlow(flowId, transaction) {
    const flow = await Flow.findByPk(flowId, { transaction });
    if (!flow) {
      const err = new Error(`Flow not found: ${flowId}`);
      err.statusCode = 404;
      throw err;
    }
    return flow;
  }

  async function _nextVersion(flowId, transaction) {
    const latest = await FlowVersion.findOne({
      where: { flow_id: flowId },
      order: [['version', 'DESC']],
      attributes: ['version'],
      transaction,
    });
    return latest ? latest.version + 1 : 1;
  }

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

  async function listNodes(flowId) {
    const flow = await _requireFlow(flowId);
    return (flow.flow_data?.nodes ?? []);
  }

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

        for (const edge of flowData.edges) {
          if (edge.source === nodeId) edge.source = newId;
          if (edge.target === nodeId) edge.target = newId;
        }

        for (const cond of flowData.conditions) {
          if (cond.source_node === nodeId) cond.source_node = newId;
          if (cond.target_node === nodeId) cond.target_node = newId;
        }
      }

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
