/**
 * WorkflowExecution Sequelize model.
 *
 * Tracks workflow/DAG execution state.
 *
 * @module models/WorkflowExecution
 */

import { DataTypes } from 'sequelize';
import { WorkflowStatus } from './enums.mjs';
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineWorkflowExecution(sequelize, schema) {
  const WorkflowExecution = sequelize.define('WorkflowExecution', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    workflowId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    executionId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    workflowType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'task_execution',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(WorkflowStatus)),
      allowNull: false,
      defaultValue: WorkflowStatus.PENDING,
    },
    graphDefinition: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    currentNode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    pausedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    checkpointId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    correlationId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    completedTasks: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    failedTasks: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    skippedTasks: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    taskId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: { tableName: dbSchema.tableName('task_graph_tasks'), schema: dbSchema.schemaFor(schema) },
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: dbSchema.tableName('task_graph_workflow_executions'),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
    createdAt: 'startedAt',
    updatedAt: false,
    indexes: [
      { fields: ['task_id'] },
      { fields: ['status'] },
      { fields: ['execution_id'] },
      { fields: ['workflow_id'] },
      { fields: ['correlation_id'] },
    ],
    hooks: {
      beforeCreate(instance) {
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[WorkflowExecution] [BeforeCreate]', {
            id: instance.id,
            workflowId: instance.workflowId,
            executionId: instance.executionId,
            taskId: instance.taskId,
            status: instance.status,
            timestamp: new Date().toISOString(),
          });
        }
      },
      beforeUpdate(instance) {
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[WorkflowExecution] [BeforeUpdate]', {
            id: instance.id,
            workflowId: instance.workflowId,
            status: instance.status,
            changed: instance.changed(),
            timestamp: new Date().toISOString(),
          });
        }
      },
    },
  });

  return WorkflowExecution;
}
