import { DataTypes } from "sequelize";
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineCommentReply(sequelize, schema) {
  return sequelize.define(
    "CommentReply",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      comment_id: {
        type: DataTypes.UUID,
        allowNull: false,
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
      tableName: dbSchema.tableName("figma_component_inspector_comment_replies"),
      schema: dbSchema.schemaFor(schema),
      ...dbSchema.defineDefaults,
    },
  );
}
