import { DataTypes } from 'sequelize';
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineCsvDatasource(sequelize, schema) {
  const CsvDatasource = sequelize.define('CsvDatasource', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'custom',
    },
    status: {
      type: DataTypes.ENUM('active', 'archived'),
      allowNull: false,
      defaultValue: 'active',
    },
    schema_contract: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: null,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
  }, {
    tableName: dbSchema.tableName('csv_dh_datasources'),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
    indexes: [
      { fields: ['category'] },
      { fields: ['status'] },
      { fields: ['name'] },
    ],
  });
  return CsvDatasource;
}
