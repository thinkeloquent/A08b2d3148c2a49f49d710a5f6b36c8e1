import { DataTypes } from 'sequelize';
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function definePrompt(sequelize, schema) {
  const Prompt = sequelize.define('Prompt', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    project_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'mta_prompt_management_system_projects', key: 'id' },
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'archived'),
      defaultValue: 'active',
    },
    created_by: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    updated_by: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
  }, {
    tableName: dbSchema.tableName('prompt_management_system_prompts'),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
    indexes: [
      { unique: true, fields: ['project_id', 'name'] },
      { unique: true, fields: ['project_id', 'slug'] },
    ],
  });

  return Prompt;
}
