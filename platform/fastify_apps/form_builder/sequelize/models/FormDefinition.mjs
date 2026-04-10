import { DataTypes } from 'sequelize';
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineFormDefinition(sequelize, schema) {
  const FormDefinition = sequelize.define('FormDefinition', {
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
    version: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '1.0.0',
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      allowNull: false,
      defaultValue: 'draft',
    },
    schema_data: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Full ExportableFormSchema JSON',
    },
    metadata_data: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'ExportableFormMetadata JSON',
    },
    created_by: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: dbSchema.tableName('form_definitions'),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
  });

  return FormDefinition;
}
