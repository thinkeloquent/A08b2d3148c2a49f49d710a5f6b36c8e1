import { DataTypes } from 'sequelize';
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineAction(sequelize, schema) {
  const Action = sequelize.define('Action', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
  }, {
    tableName: dbSchema.tableName('group_role_management_actions'),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
  });

  return Action;
}
