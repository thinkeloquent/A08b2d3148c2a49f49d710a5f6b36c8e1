import { DataTypes } from 'sequelize';
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineCsvDatasourceTag(sequelize, schema) {
  const CsvDatasourceTag = sequelize.define('CsvDatasourceTag', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    color: {
      type: DataTypes.STRING(7),
      allowNull: true,
      defaultValue: '#6366f1',
    },
  }, {
    tableName: dbSchema.tableName('csv_dh_tags'),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
  });
  return CsvDatasourceTag;
}
