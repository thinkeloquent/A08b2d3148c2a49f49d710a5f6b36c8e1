import { DataTypes } from 'sequelize';
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineKvStore(sequelize, schema) {
  const KvStore = sequelize.define('KvStore', {
    key: {
      type: DataTypes.STRING(512),
      primaryKey: true,
      allowNull: false,
    },
    value: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
  }, {
    tableName: dbSchema.tableName('lgsf_kv_store'),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
  });

  return KvStore;
}
