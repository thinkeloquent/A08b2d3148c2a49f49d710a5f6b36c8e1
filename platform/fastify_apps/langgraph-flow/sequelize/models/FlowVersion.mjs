import { DataTypes } from 'sequelize';
import { dbSchema } from '../../../../common/config/database_schema.mjs';

/**
 * Define the FlowVersion model.
 *
 * @param {import('sequelize').Sequelize} sequelize
 * @param {string} schema - Postgres schema name
 * @returns {import('sequelize').ModelStatic}
 */
export default function defineFlowVersion(sequelize, schema) {
  const FlowVersion = sequelize.define('FlowVersion', {
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
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    flow_data: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    change_summary: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: dbSchema.tableName('lgf_flow_versions'),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
  });

  return FlowVersion;
}
