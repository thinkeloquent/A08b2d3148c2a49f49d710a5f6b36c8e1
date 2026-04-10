import { DataTypes } from "sequelize";
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineNodeLabel(sequelize, schema) {
  return sequelize.define(
    "NodeLabel",
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
      display_name: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: "User-defined display name shown in tree view",
      },
    },
    {
      tableName: dbSchema.tableName("figma_component_inspector_node_labels"),
      schema: dbSchema.schemaFor(schema),
      ...dbSchema.defineDefaults,
      indexes: [
        {
          unique: true,
          fields: ["figma_file_id", "node_id"],
        },
      ],
    },
  );
}
