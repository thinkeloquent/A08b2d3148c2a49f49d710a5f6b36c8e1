/**
 * FailedJob Sequelize model.
 *
 * Record of failed background jobs for retry/debugging.
 *
 * @module models/FailedJob
 */

import { DataTypes } from 'sequelize';
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineFailedJob(sequelize, schema) {
  const FailedJob = sequelize.define('FailedJob', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    jobId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    jobType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    jobData: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    error: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    stack: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    retried: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
    tableName: dbSchema.tableName('task_graph_failed_jobs'),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
    createdAt: 'failedAt',
    updatedAt: false,
    indexes: [
      { fields: ['failed_at'] },
      { fields: ['job_type'] },
    ],
    hooks: {
      beforeCreate(instance) {
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[FailedJob] [BeforeCreate]', {
            id: instance.id,
            jobId: instance.jobId,
            jobType: instance.jobType,
            error: instance.error.substring(0, 100),
            timestamp: new Date().toISOString(),
          });
        }
      },
      beforeUpdate(instance) {
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[FailedJob] [BeforeUpdate]', {
            id: instance.id,
            jobId: instance.jobId,
            retried: instance.retried,
            changed: instance.changed(),
            timestamp: new Date().toISOString(),
          });
        }
      },
    },
  });

  return FailedJob;
}
