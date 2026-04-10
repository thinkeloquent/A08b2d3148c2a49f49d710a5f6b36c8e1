import { DataTypes } from 'sequelize';
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function definePromptVersion(sequelize, schema) {
  const PromptVersion = sequelize.define('PromptVersion', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    prompt_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'mta_prompt_management_system_prompts', key: 'id' },
    },
    version_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    template: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    config: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Model parameters: temperature, top_p, max_tokens, stop_sequences, etc.',
    },
    input_schema: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'JSON Schema defining template variable types',
    },
    commit_message: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived', 'disabled'),
      defaultValue: 'draft',
    },
    created_by: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
  }, {
    tableName: dbSchema.tableName('prompt_management_system_prompt_versions'),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ['prompt_id', 'version_number'],
        name: 'uq_prompt_version_number',
      },
    ],
  });

  return PromptVersion;
}
