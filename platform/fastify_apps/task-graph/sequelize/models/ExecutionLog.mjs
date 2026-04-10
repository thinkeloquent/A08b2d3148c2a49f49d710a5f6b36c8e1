/**
 * ExecutionLog Sequelize model.
 *
 * Audit log for task and step execution events.
 *
 * @module models/ExecutionLog
 */

import { DataTypes } from 'sequelize';
import { ExecutionEventType } from './enums.mjs';
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineExecutionLog(sequelize, schema) {
  const ExecutionLog = sequelize.define('ExecutionLog', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    eventType: {
      type: DataTypes.ENUM(...Object.values(ExecutionEventType)),
      allowNull: false,
    },
    eventData: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    correlationId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    executionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    parentEventId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    taskId: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: { tableName: dbSchema.tableName('task_graph_tasks'), schema: dbSchema.schemaFor(schema) },
        key: 'id',
      },
    },
    stepId: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: { tableName: dbSchema.tableName('task_graph_steps'), schema: dbSchema.schemaFor(schema) },
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: dbSchema.tableName('task_graph_execution_logs'),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
    createdAt: 'timestamp',
    updatedAt: false,
    indexes: [
      { fields: ['correlation_id'] },
      { fields: ['event_type', 'timestamp'] },
      { fields: ['execution_id'] },
      { fields: ['task_id', 'event_type', 'timestamp'] },
      { fields: ['task_id', 'timestamp'] },
    ],
    hooks: {
      beforeCreate(instance) {
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[ExecutionLog] [BeforeCreate]', {
            id: instance.id,
            eventType: instance.eventType,
            correlationId: instance.correlationId,
            taskId: instance.taskId,
            stepId: instance.stepId,
            timestamp: new Date().toISOString(),
          });
        }
      },
      beforeUpdate(instance) {
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[ExecutionLog] [BeforeUpdate]', {
            id: instance.id,
            eventType: instance.eventType,
            changed: instance.changed(),
            timestamp: new Date().toISOString(),
          });
        }
      },
    },
  });

  return ExecutionLog;
}
