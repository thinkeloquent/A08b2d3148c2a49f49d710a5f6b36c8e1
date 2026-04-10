import { DataTypes } from "sequelize";
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function definePersona(sequelize, schema) {
  return sequelize.define("Persona", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    description: { type: DataTypes.STRING(500) },
    role: {
      type: DataTypes.ENUM("assistant", "architect", "developer", "analyst"),
      defaultValue: "assistant",
    },
    tone: {
      type: DataTypes.ENUM("neutral", "analytical", "friendly", "professional", "casual"),
      defaultValue: "neutral",
    },
    llm_provider: { type: DataTypes.STRING(50), allowNull: false, defaultValue: "openai" },
    llm_temperature: { type: DataTypes.FLOAT, defaultValue: 0.7 },
    llm_parameters: { type: DataTypes.JSONB, defaultValue: {} },
    goals: { type: DataTypes.JSONB, defaultValue: [] },
    tools: { type: DataTypes.JSONB, defaultValue: [] },
    permitted_to: { type: DataTypes.JSONB, defaultValue: [] },
    prompt_system_template: { type: DataTypes.JSONB, defaultValue: [] },
    prompt_user_template: { type: DataTypes.JSONB, defaultValue: [] },
    prompt_context_template: { type: DataTypes.JSONB, defaultValue: [] },
    prompt_instruction: { type: DataTypes.JSONB, defaultValue: [] },
    agent_delegate: { type: DataTypes.JSONB, defaultValue: [] },
    agent_call: { type: DataTypes.JSONB, defaultValue: [] },
    context_files: { type: DataTypes.JSONB, defaultValue: [] },
    memory: { type: DataTypes.JSONB, defaultValue: { enabled: false, scope: "session", storage_id: "" } },
    version: { type: DataTypes.STRING(20), defaultValue: "1.0.0" },
  }, {
    tableName: dbSchema.tableName("ai_ask_v2_personas"),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
  });
}
