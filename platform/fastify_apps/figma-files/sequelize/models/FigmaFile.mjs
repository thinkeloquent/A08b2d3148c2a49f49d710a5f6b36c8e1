import { DataTypes } from 'sequelize';
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineFigmaFile(sequelize, schema) {
  const FigmaFile = sequelize.define('FigmaFile', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('design_system', 'component_library', 'prototype', 'illustration', 'icon_set'),
      allowNull: false,
    },
    figma_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    figma_file_key: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    thumbnail_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    page_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    component_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    style_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    last_modified_by: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    editor_type: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "'figma' or 'figjam'",
    },
    trending: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM('stable', 'beta', 'deprecated', 'experimental'),
      allowNull: true,
      defaultValue: 'stable',
    },
    source: {
      type: DataTypes.ENUM('figma', 'figma_community', 'manual'),
      allowNull: true,
    },
    external_ids: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of [registry, id] pairs, e.g. [["figma_community","12345"]]',
    },
  }, {
    tableName: dbSchema.tableName('figma_files'),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
  });

  return FigmaFile;
}
