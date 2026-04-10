import { DataTypes } from 'sequelize';
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineCsvInstance(sequelize, schema) {
  const CsvInstance = sequelize.define('CsvInstance', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    datasource_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    label: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    file_name: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    file_size_bytes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    row_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    column_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    instance_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'ready', 'failed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    column_headers: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
  }, {
    tableName: dbSchema.tableName('csv_dh_instances'),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
    indexes: [
      { fields: ['datasource_id'] },
      { fields: ['status'] },
      { fields: ['instance_date'] },
    ],
  });
  return CsvInstance;
}
