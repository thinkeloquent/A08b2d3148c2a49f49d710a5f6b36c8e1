import { DataTypes } from 'sequelize';
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineRuleTree(sequelize, schema) {
  const RuleTree = sequelize.define('RuleTree', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    stats_total: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    stats_groups: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    stats_conditions: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    stats_folders: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    stats_enabled: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    repo_url: {
      type: DataTypes.STRING(512),
      allowNull: true,
    },
    branch: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    commit_sha: {
      type: DataTypes.STRING(40),
      allowNull: true,
    },
    git_tag: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    graph_type: {
      type: DataTypes.STRING(64),
      allowNull: false,
      defaultValue: 'conditional_logic',
    },
    language: {
      type: DataTypes.STRING(64),
      allowNull: false,
      defaultValue: '',
    },
  }, {
    tableName: dbSchema.tableName('rule_trees'),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
  });

  return RuleTree;
}
