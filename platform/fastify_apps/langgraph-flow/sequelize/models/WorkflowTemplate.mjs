import { DataTypes } from 'sequelize';
import { dbSchema } from '../../../../common/config/database_schema.mjs';

/**
 * Define the WorkflowTemplate model.
 *
 * Stores preset workflow templates including system builtins and user-defined
 * presets. Each template carries a full workflow definition in template_data.
 *
 * @param {import('sequelize').Sequelize} sequelize
 * @param {string} schema - Postgres schema name
 * @returns {import('sequelize').ModelStatic}
 */
export default function defineWorkflowTemplate(sequelize, schema) {
  const WorkflowTemplate = sequelize.define('WorkflowTemplate', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(128),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING(64),
      allowNull: false,
      defaultValue: 'general',
    },
    template_data: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    is_builtin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  }, {
    tableName: dbSchema.tableName('lgf_workflow_templates'),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
  });

  return WorkflowTemplate;
}
