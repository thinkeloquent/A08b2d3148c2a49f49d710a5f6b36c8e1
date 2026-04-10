import { DataTypes } from 'sequelize';
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineRuleItem(sequelize, schema) {
  const RuleItem = sequelize.define('RuleItem', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    rule_tree_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: { tableName: dbSchema.tableName('rule_trees'), schema: dbSchema.schemaFor(schema) },
        key: 'id',
      },
    },
    parent_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: { tableName: dbSchema.tableName('rule_items'), schema: dbSchema.schemaFor(schema) },
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM('group', 'condition', 'folder', 'structural'),
      allowNull: false,
    },
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    logic: {
      type: DataTypes.ENUM('AND', 'OR', 'NOT', 'XOR'),
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING(7),
      allowNull: true,
    },
    field: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    operator: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    value_type: {
      type: DataTypes.ENUM('value', 'field', 'function', 'regex'),
      allowNull: true,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    data_type: {
      type: DataTypes.ENUM('string', 'number', 'boolean', 'date'),
      allowNull: true,
    },
    source_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Structural / AST context fields
    parent_scope: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    node_type: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    evaluated_variables: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  }, {
    tableName: dbSchema.tableName('rule_items'),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
  });

  return RuleItem;
}
