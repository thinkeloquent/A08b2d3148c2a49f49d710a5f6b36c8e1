import { DataTypes } from 'sequelize';
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineLLMDefault(sequelize, schema) {
  const LLMDefault = sequelize.define('LLMDefault', {
    // Primary Key
    id: {
      type: DataTypes.STRING(30),
      primaryKey: true,
      allowNull: false,
      comment: 'nanoid format'
    },

    // Configuration
    category: {
      type: DataTypes.ENUM('tools', 'permissions', 'goals', 'prompts', 'tones', 'roles', 'providers'),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { len: [3, 255] }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { len: [5, 5000] }
    },
    value: {
      type: DataTypes.JSONB,
      allowNull: false,
      comment: 'Flexible structure for different category types'
    },
    context: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: null,
      comment: 'Additional context or metadata for this default entry'
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Only one default per category'
    }
  }, {
    tableName: dbSchema.tableName('persona_editor_llm_defaults'),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
    indexes: [
      { fields: ['category'] },
      { fields: ['is_default'] },
      { fields: ['category', 'is_default'], name: 'idx_llm_defaults_category_is_default' }
    ]
  });

  return LLMDefault;
}
