/**
 * Step Sequelize model.
 *
 * Individual step within a task's execution plan.
 *
 * @module models/Step
 */

import { DataTypes } from 'sequelize';
import { StepStatus } from './enums.mjs';
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineStep(sequelize, schema) {
  const Step = sequelize.define('Step', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(StepStatus)),
      allowNull: false,
      defaultValue: StepStatus.PENDING,
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    skipReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    blockedReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
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
    tableName: dbSchema.tableName('task_graph_steps'),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
    indexes: [
      { fields: ['task_id'] },
      { fields: ['status'] },
      { fields: ['task_id', 'order'] },
    ],
    hooks: {
      beforeCreate(instance) {
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[Step] [BeforeCreate]', {
            id: instance.id,
            token: instance.token,
            taskId: instance.taskId,
            order: instance.order,
            timestamp: new Date().toISOString(),
          });
        }
      },
      beforeUpdate(instance) {
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[Step] [BeforeUpdate]', {
            id: instance.id,
            token: instance.token,
            status: instance.status,
            changed: instance.changed(),
            timestamp: new Date().toISOString(),
          });
        }
      },
    },
  });

  return Step;
}
