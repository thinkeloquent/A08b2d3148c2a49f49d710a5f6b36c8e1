import { DataTypes } from "sequelize";
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineFilterTree(sequelize, schema) {
  return sequelize.define("FilterTree", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "archived"),
      defaultValue: "active",
    },
    tree_data: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        id: "root",
        type: "group",
        operator: "AND",
        children: [],
      },
    },
    version: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    created_by: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    updated_by: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    archived_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  }, {
    tableName: dbSchema.tableName("conditional_control_logic_viewer_filter_trees"),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
  });
}
