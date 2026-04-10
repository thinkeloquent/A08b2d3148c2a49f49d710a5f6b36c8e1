import { DataTypes } from 'sequelize';
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineCsvDatasourceLabel(sequelize, schema) {
  const CsvDatasourceLabel = sequelize.define('CsvDatasourceLabel', {
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
    key: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    value: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
  }, {
    tableName: dbSchema.tableName('csv_dh_labels'),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
    indexes: [
      {
        unique: true,
        fields: ['datasource_id', 'key'],
        name: 'uq_csv_dh_label_ds_key',
      },
    ],
  });
  return CsvDatasourceLabel;
}
