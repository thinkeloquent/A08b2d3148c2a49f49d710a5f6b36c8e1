/**
 * Checkpoint Sequelize model.
 *
 * Stores task execution checkpoints for resumable workflows.
 *
 * @module models/Checkpoint
 */

import { DataTypes } from 'sequelize';
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineCheckpoint(sequelize, schema) {
  const Checkpoint = sequelize.define('Checkpoint', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    checkpointData: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    checkpointType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'task_state',
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    restoredCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    taskId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: { tableName: dbSchema.tableName('task_graph_tasks'), schema: dbSchema.schemaFor(schema) },
        key: 'id',
      },
    },
  }, {
    tableName: dbSchema.tableName('task_graph_checkpoints'),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
    indexes: [
      { fields: ['task_id'] },
      { fields: ['expires_at'] },
      { fields: ['task_id', 'created_at'] },
    ],
    hooks: {
      beforeCreate(instance) {
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[Checkpoint] [BeforeCreate]', {
            id: instance.id,
            checkpointType: instance.checkpointType,
            taskId: instance.taskId,
            timestamp: new Date().toISOString(),
          });
        }
      },
      beforeUpdate(instance) {
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[Checkpoint] [BeforeUpdate]', {
            id: instance.id,
            checkpointType: instance.checkpointType,
            changed: instance.changed(),
            timestamp: new Date().toISOString(),
          });
        }
      },
    },
  });

  return Checkpoint;
}
