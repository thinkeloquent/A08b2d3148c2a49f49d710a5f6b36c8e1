import { DataTypes } from "sequelize";
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineComment(sequelize, schema) {
  return sequelize.define(
    "Comment",
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
        allowNull: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      author_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      author_handle: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: dbSchema.tableName("figma_component_inspector_comments"),
      schema: dbSchema.schemaFor(schema),
      ...dbSchema.defineDefaults,
    },
  );
}
