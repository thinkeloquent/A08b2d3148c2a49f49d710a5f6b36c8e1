import { DataTypes } from 'sequelize';
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineLabel(sequelize, schema) {
  const Label = sequelize.define('Label', {
    name: {
      type: DataTypes.STRING(30),
      primaryKey: true,
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    is_predefined: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    custom_created: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    created_by: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: dbSchema.tableName('group_role_management_labels'),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
    updatedAt: false,
  });

  return Label;
}
