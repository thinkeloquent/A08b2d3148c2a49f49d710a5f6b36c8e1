import { DataTypes } from 'sequelize';
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineStringTemplate(sequelize, schema) {
  const StringTemplate = sequelize.define('StringTemplate', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    flow_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    key: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    locale: {
      type: DataTypes.STRING(16),
      allowNull: false,
      defaultValue: 'en',
    },
    context: {
      type: DataTypes.STRING(64),
      allowNull: false,
      defaultValue: 'default',
    },
  }, {
    tableName: dbSchema.tableName('lgsf_string_templates'),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
  });

  return StringTemplate;
}
