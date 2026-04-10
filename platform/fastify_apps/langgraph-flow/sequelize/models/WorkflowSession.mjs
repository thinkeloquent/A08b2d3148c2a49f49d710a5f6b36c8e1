import { DataTypes } from 'sequelize';
import { dbSchema } from '../../../../common/config/database_schema.mjs';

/**
 * Define the WorkflowSession model.
 *
 * Tracks execution sessions for workflows. Each session corresponds to a
 * single run of a Flow, identified by a thread_id.
 *
 * @param {import('sequelize').Sequelize} sequelize
 * @param {string} schema - Postgres schema name
 * @returns {import('sequelize').ModelStatic}
 */
export default function defineWorkflowSession(sequelize, schema) {
  const WorkflowSession = sequelize.define('WorkflowSession', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    flow_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    thread_id: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    topic: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(32),
      allowNull: false,
      defaultValue: 'active',
    },
    iterations: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    max_iterations: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },
    current_stage: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    stage_history: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    checkpoints: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    session_data: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
  }, {
    tableName: dbSchema.tableName('lgf_workflow_sessions'),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
  });

  return WorkflowSession;
}
