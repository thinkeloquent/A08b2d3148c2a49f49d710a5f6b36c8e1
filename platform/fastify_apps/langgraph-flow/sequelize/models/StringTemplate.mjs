import { DataTypes } from 'sequelize';
import { dbSchema } from '../../../../common/config/database_schema.mjs';

/**
 * Define the StringTemplate model.
 *
 * Manages g11n/string templates for flows. A null flow_id indicates a global
 * template shared across all flows. Keys use dot-path notation and values may
 * contain {placeholder} tokens.
 *
 * @param {import('sequelize').Sequelize} sequelize
 * @param {string} schema - Postgres schema name
 * @returns {import('sequelize').ModelStatic}
 */
export default function defineStringTemplate(sequelize, schema) {
  const StringTemplate = sequelize.define('StringTemplate', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    flow_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    key: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    locale: {
      type: DataTypes.STRING(16),
      allowNull: false,
      defaultValue: 'en',
    },
    context: {
      type: DataTypes.STRING(64),
      allowNull: false,
      defaultValue: 'default',
    },
  }, {
    tableName: dbSchema.tableName('lgf_string_templates'),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
  });

  return StringTemplate;
}
