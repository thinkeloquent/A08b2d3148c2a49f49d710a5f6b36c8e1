/**
 * Task Sequelize model.
 *
 * Core entity representing a unit of work in the task graph.
 *
 * @module models/Task
 */

import { DataTypes } from 'sequelize';
import { TaskStatus, RepeatInterval } from './enums.mjs';
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineTask(sequelize, schema) {
  const Task = sequelize.define('Task', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    idempotencyKey: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(TaskStatus)),
      allowNull: false,
      defaultValue: TaskStatus.PENDING,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    repeatInterval: {
      type: DataTypes.ENUM(...Object.values(RepeatInterval)),
      allowNull: false,
      defaultValue: RepeatInterval.NONE,
    },
    retryCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    maxRetries: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    creatorId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    assignedToId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    templateId: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: { tableName: dbSchema.tableName('task_graph_task_templates'), schema: dbSchema.schemaFor(schema) },
        key: 'id',
      },
    },
  }, {
    tableName: dbSchema.tableName('task_graph_tasks'),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
    indexes: [
      { fields: ['status'] },
      { fields: ['due_date'] },
      { fields: ['creator_id'] },
      { fields: ['assigned_to_id'] },
    ],
    hooks: {
      beforeCreate(instance) {
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[Task] [BeforeCreate]', {
            id: instance.id,
            title: instance.title,
            status: instance.status,
            timestamp: new Date().toISOString(),
          });
        }
      },
      beforeUpdate(instance) {
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[Task] [BeforeUpdate]', {
            id: instance.id,
            title: instance.title,
            changed: instance.changed(),
            timestamp: new Date().toISOString(),
          });
        }
      },
    },
  });

  return Task;
}
