import { DataTypes } from 'sequelize';
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineCsvPayload(sequelize, schema) {
  const CsvPayload = sequelize.define('CsvPayload', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    instance_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    row_index: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    data: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
  }, {
    tableName: dbSchema.tableName('csv_dh_payloads'),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
    updatedAt: false,
    indexes: [
      { fields: ['instance_id'] },
      { fields: ['instance_id', 'row_index'] },
    ],
  });
  return CsvPayload;
}
