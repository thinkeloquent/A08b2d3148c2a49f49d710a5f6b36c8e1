import { DataTypes } from 'sequelize';
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineCodeRepository(sequelize, schema) {
  const CodeRepository = sequelize.define('CodeRepository', {
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
      type: DataTypes.ENUM('npm', 'docker', 'python'),
      allowNull: false,
    },
    github_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    package_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    stars: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    forks: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    version: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    maintainer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    last_updated: {
      type: DataTypes.STRING,
      allowNull: true,
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
    language: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    license: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    size: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dependencies: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    health_score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 100,
      },
    },
    status: {
      type: DataTypes.ENUM('stable', 'beta', 'deprecated', 'experimental'),
      allowNull: true,
      defaultValue: 'stable',
    },
    source: {
      type: DataTypes.ENUM('github', 'npm', 'dockerhub', 'pypi', 'manual'),
      allowNull: true,
    },
    external_ids: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of [registry, id] pairs, e.g. [["npm","fastify"],["github","fastify/fastify"]]',
    },
  }, {
    tableName: dbSchema.tableName('code_repositories'),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
  });

  return CodeRepository;
}
