import { DataTypes } from 'sequelize';
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineGroup(sequelize, schema) {
  const Group = sequelize.define('Group', {
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
      allowNull: false,
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
    archived_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
  }, {
    tableName: dbSchema.tableName('group_role_management_groups'),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
  });

  return Group;
}
