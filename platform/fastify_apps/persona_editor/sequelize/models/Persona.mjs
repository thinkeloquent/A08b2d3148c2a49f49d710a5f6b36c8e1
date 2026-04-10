import { DataTypes } from 'sequelize';
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function definePersona(sequelize, schema) {
  const Persona = sequelize.define('Persona', {
    // Primary Key
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      allowNull: false,
      comment: 'Format: persona-{uuid}'
    },

    // Basic Information
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { len: [3, 255] }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { len: [10, 10000] }
    },
    role: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
      comment: 'Dynamic role from llm-defaults'
    },
    tone: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
      comment: 'Dynamic tone from llm-defaults'
    },
    version: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: '1.0.0'
    },

    // LLM Configuration
    llm_provider: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'e.g., openai, anthropic, google'
    },
    llm_temperature: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.7,
      validate: { min: 0.0, max: 1.0 }
    },
    llm_parameters: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Provider-specific parameters'
    },

    // Persona Configuration (JSONB Arrays)
    goals: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      comment: 'Array of goal strings, max 10'
    },
    tools: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      comment: 'Array of tool enums: web-search, code-gen, analysis-engine, debugger, test-runner'
    },
    permitted_to: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      comment: 'Array of permission enums: read_repo, write_code, run_test, generate_report, access_docs'
    },

    // Prompt Templates (JSONB Arrays)
    prompt_system_template: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    },
    prompt_user_template: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    },
    prompt_context_template: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    },
    prompt_instruction: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    },

    // Agent Configuration
    agent_delegate: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      comment: 'Array of agent names this persona can delegate to'
    },
    agent_call: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      comment: 'Array of agent names this persona can call'
    },

    // Memory Configuration (Nested JSONB)
    memory: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: { enabled: false, scope: 'session', storage_id: '' },
      comment: '{ enabled: boolean, scope: session|persistent, storage_id: string }'
    },

    // Context Files
    context_files: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    },

    // Template data context (properties + resolved references) for rendering persona prompt
    persona_prompt_data: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: null,
      comment: 'Template data context object passed to Edge.js template engine',
    },

    // Edge.js template source for rendering persona prompt
    persona_prompt_template: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },

    // Metadata
    last_updated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: dbSchema.tableName('persona_editor_personas'),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
    indexes: [
      { fields: ['name'] },
      { fields: ['last_updated'] }
    ]
  });

  return Persona;
}
