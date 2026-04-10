import { DataTypes } from 'sequelize';
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineComponentDefinition(sequelize, schema) {
  const ComponentDefinition = sequelize.define('ComponentDefinition', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    taxonomy_level: {
      type: DataTypes.ENUM('Atom', 'Molecule', 'Organism', 'Template', 'Page'),
      allowNull: false,
      defaultValue: 'Organism',
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      allowNull: false,
      defaultValue: 'draft',
    },
    aliases: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Semantic alias names for LLM matching',
    },
    directives: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Contextual markdown directives for when/how to use this component',
    },
    few_shot_examples: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of {prompt, action, payload} few-shot pairs',
    },
    input_schema: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'JSON Schema for component input props',
    },
    output_schema: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'JSON Schema for component output payload',
    },
    lifecycle_config: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Lifecycle metadata: {mounting, streamMutable, resolution, cleanup}',
    },
    interactions: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of {name, type, interrupt, payloadKey} interaction triggers',
    },
    service_dependencies: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of {name, operationId, authScope} service bindings',
    },
    composition_rules: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Spatial rules: {allowedParents, allowedChildren, ariaRole, ariaLabel, viewport}',
    },
    created_by: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: dbSchema.tableName('component_definitions'),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
  });

  return ComponentDefinition;
}
