import { DataTypes } from "sequelize";
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineLLMDefault(sequelize, schema) {
  return sequelize.define("LLMDefault", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    category: {
      type: DataTypes.ENUM("tools", "permissions", "goals", "prompts", "tones", "roles"),
      allowNull: false,
    },
    name: { type: DataTypes.STRING(100), allowNull: false },
    description: { type: DataTypes.STRING(500) },
    value: { type: DataTypes.JSONB },
    is_default: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, {
    tableName: dbSchema.tableName("ai_ask_v2_llm_defaults"),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
  });
}
