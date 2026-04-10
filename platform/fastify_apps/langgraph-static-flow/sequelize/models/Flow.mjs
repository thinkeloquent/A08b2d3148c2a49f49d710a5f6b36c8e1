import { DataTypes } from 'sequelize';
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineFlow(sequelize, schema) {
  const Flow = sequelize.define('Flow', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
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
    viewport_x: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    viewport_y: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    viewport_zoom: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 1,
    },
    flow_data: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    source_format: {
      type: DataTypes.STRING(32),
      allowNull: false,
      defaultValue: 'native',
    },
  }, {
    tableName: dbSchema.tableName('lgsf_flows'),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
  });

  return Flow;
}
