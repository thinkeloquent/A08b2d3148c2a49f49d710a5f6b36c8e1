import { DataTypes } from 'sequelize';
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineComponent(sequelize, schema) {
  const Component = sequelize.define('Component', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    version: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: '1.0.0',
    },
    author: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    downloads: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    stars: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('stable', 'beta', 'alpha', 'deprecated'),
      defaultValue: 'alpha',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    branch: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    release: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    repoLink: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    shaCommit: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
  }, {
    tableName: dbSchema.tableName('component_registry_components'),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
  });

  return Component;
}
