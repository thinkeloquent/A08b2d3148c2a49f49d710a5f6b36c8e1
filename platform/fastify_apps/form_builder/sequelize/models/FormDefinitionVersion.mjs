import { DataTypes } from 'sequelize';
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineFormDefinitionVersion(sequelize, schema) {
  const FormDefinitionVersion = sequelize.define('FormDefinitionVersion', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    form_definition_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    version: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    schema_data: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    metadata_data: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    change_summary: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: dbSchema.tableName('form_definition_versions'),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
  });

  return FormDefinitionVersion;
}
