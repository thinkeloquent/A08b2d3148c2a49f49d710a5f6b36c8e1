import { DataTypes } from 'sequelize';
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineCodeRepositoryMetadata(sequelize, schema) {
  const CodeRepositoryMetadata = sequelize.define('CodeRepositoryMetadata', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    source_url: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Original URL where this metadata was sourced from',
    },
    source_hash_id: {
      type: DataTypes.STRING(64),
      allowNull: true,
      comment: 'SHA-256 hash of source content for change detection in analysis pipelines',
    },
    labels: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of labels for categorization in analysis pipelines, e.g. ["readme", "api-docs", "needs-analysis"]',
    },
    repository_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: { tableName: dbSchema.tableName('code_repositories'), schema: dbSchema.schemaFor(schema) },
        key: 'id',
      },
    },
  }, {
    tableName: dbSchema.tableName('code_repositories_metadata'),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
  });

  return CodeRepositoryMetadata;
}
