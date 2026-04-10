import { DataTypes } from "sequelize";
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function definePinnedNode(sequelize, schema) {
  return sequelize.define(
    "PinnedNode",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      figma_file_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      node_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      node_name: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: "Original Figma node name at pin time",
      },
      node_type: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "Figma node type (FRAME, COMPONENT, etc.)",
      },
      tags: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
        comment: "Array of string tags",
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      node_path: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Breadcrumb path at pin time, e.g. Page 1 / Frame / Button",
      },
      pinned_by: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: dbSchema.tableName("figma_component_inspector_pinned_nodes"),
      schema: dbSchema.schemaFor(schema),
      ...dbSchema.defineDefaults,
    },
  );
}
