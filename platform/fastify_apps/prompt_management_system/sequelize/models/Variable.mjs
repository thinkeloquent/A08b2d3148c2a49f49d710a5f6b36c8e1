import { DataTypes } from 'sequelize';
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineVariable(sequelize, schema) {
  const Variable = sequelize.define('Variable', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    version_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'mta_prompt_management_system_prompt_versions', key: 'id' },
    },
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('string', 'number', 'boolean', 'array', 'object'),
      allowNull: false,
      defaultValue: 'string',
    },
    description: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    default_value: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    required: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: dbSchema.tableName('prompt_management_system_variables'),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ['version_id', 'key'],
        name: 'uq_version_variable_key',
      },
    ],
  });

  return Variable;
}
