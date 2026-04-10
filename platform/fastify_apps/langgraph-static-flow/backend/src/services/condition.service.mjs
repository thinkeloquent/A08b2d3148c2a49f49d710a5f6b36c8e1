/**
 * Condition Service
 * Business logic for condition CRUD within a Flow's flow_data.conditions JSONB array.
 * Does NOT create separate DB rows — mutates the JSONB column on the Flow record.
 */

const VALID_OPERATORS = new Set([
  'gte', 'gt', 'lte', 'lt', 'eq', 'neq', 'includes', 'startsWith',
]);

export function createConditionService(db) {
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

  async function listConditions(flowId) {
    const flow = await _requireFlow(flowId);
    return flow.flow_data?.conditions ?? [];
  }

  async function getCondition(flowId, conditionId) {
    const conditions = await listConditions(flowId);
    const condition = conditions.find((c) => c.id === conditionId);
    if (!condition) {
      const err = new Error(`Condition not found: ${conditionId}`);
      err.statusCode = 404;
      throw err;
    }
    return condition;
  }

  async function addCondition(flowId, conditionData) {
    if (!conditionData.id || typeof conditionData.id !== 'string') {
      const err = new Error('Condition id is required and must be a string');
      err.statusCode = 400;
      throw err;
    }
    if (conditionData.operator && !VALID_OPERATORS.has(conditionData.operator)) {
      const err = new Error(
        `Invalid operator "${conditionData.operator}". Valid operators: ${[...VALID_OPERATORS].join(', ')}`,
      );
      err.statusCode = 400;
      throw err;
    }

    const transaction = await sequelize.transaction();
    try {
      const flow = await _requireFlow(flowId, transaction);
      const flowData = structuredClone(flow.flow_data ?? { nodes: [], edges: [], conditions: [] });
      flowData.conditions = flowData.conditions ?? [];

      if (flowData.conditions.some((c) => c.id === conditionData.id)) {
        await transaction.rollback();
        const err = new Error(`Duplicate condition id: ${conditionData.id}`);
        err.statusCode = 409;
        throw err;
      }

      const newCondition = {
        id: conditionData.id,
        name: conditionData.name ?? conditionData.id,
        field: conditionData.field ?? '',
        operator: conditionData.operator ?? 'eq',
        value: conditionData.value ?? null,
        source_node: conditionData.source_node ?? null,
        target_node: conditionData.target_node ?? null,
      };
      flowData.conditions.push(newCondition);

      await flow.update({ flow_data: flowData }, { transaction });
      await _createVersionSnapshot(
        flowId, flowData, `Added condition: ${conditionData.id}`, transaction,
      );

      await transaction.commit();
      return newCondition;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async function updateCondition(flowId, conditionId, updates) {
    if (updates.operator !== undefined && !VALID_OPERATORS.has(updates.operator)) {
      const err = new Error(
        `Invalid operator "${updates.operator}". Valid operators: ${[...VALID_OPERATORS].join(', ')}`,
      );
      err.statusCode = 400;
      throw err;
    }

    const transaction = await sequelize.transaction();
    try {
      const flow = await _requireFlow(flowId, transaction);
      const flowData = structuredClone(flow.flow_data ?? { nodes: [], edges: [], conditions: [] });
      flowData.conditions = flowData.conditions ?? [];
      flowData.edges = flowData.edges ?? [];

      const idx = flowData.conditions.findIndex((c) => c.id === conditionId);
      if (idx === -1) {
        await transaction.rollback();
        const err = new Error(`Condition not found: ${conditionId}`);
        err.statusCode = 404;
        throw err;
      }

      const condition = flowData.conditions[idx];
      const allowedFields = ['name', 'field', 'operator', 'value', 'source_node', 'target_node'];
      for (const field of allowedFields) {
        if (updates[field] !== undefined) condition[field] = updates[field];
      }

      if (updates.name !== undefined) {
        for (const edge of flowData.edges) {
          if (edge.condition_id === conditionId) {
            edge.label = updates.name;
          }
        }
      }

      await flow.update({ flow_data: flowData }, { transaction });
      await _createVersionSnapshot(
        flowId, flowData, `Updated condition: ${conditionId}`, transaction,
      );

      await transaction.commit();
      return flowData.conditions[idx];
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async function deleteCondition(flowId, conditionId) {
    const transaction = await sequelize.transaction();
    try {
      const flow = await _requireFlow(flowId, transaction);
      const flowData = structuredClone(flow.flow_data ?? { nodes: [], edges: [], conditions: [] });
      flowData.conditions = flowData.conditions ?? [];
      flowData.edges = flowData.edges ?? [];

      const idx = flowData.conditions.findIndex((c) => c.id === conditionId);
      if (idx === -1) {
        await transaction.rollback();
        const err = new Error(`Condition not found: ${conditionId}`);
        err.statusCode = 404;
        throw err;
      }

      flowData.conditions.splice(idx, 1);

      for (const edge of flowData.edges) {
        if (edge.condition_id === conditionId) {
          delete edge.condition_id;
        }
      }

      await flow.update({ flow_data: flowData }, { transaction });
      await _createVersionSnapshot(
        flowId, flowData, `Deleted condition: ${conditionId}`, transaction,
      );

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  return {
    listConditions,
    getCondition,
    addCondition,
    updateCondition,
    deleteCondition,
  };
}
