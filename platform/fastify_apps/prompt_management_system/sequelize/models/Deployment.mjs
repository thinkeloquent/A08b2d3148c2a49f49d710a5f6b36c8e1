import { DataTypes } from 'sequelize';
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineDeployment(sequelize, schema) {
  const Deployment = sequelize.define('Deployment', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    prompt_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'mta_prompt_management_system_prompts', key: 'id' },
    },
    environment: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Alias label: production, staging, dev, etc.',
    },
    version_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'mta_prompt_management_system_prompt_versions', key: 'id' },
    },
    deployed_by: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
  }, {
    tableName: dbSchema.tableName('prompt_management_system_deployments'),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
    indexes: [
      {
        unique: true,
        fields: ['prompt_id', 'environment'],
        name: 'uq_prompt_environment',
      },
    ],
  });

  return Deployment;
}
