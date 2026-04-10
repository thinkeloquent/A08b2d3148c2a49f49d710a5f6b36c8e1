/**
 * File Sequelize model.
 *
 * File attachment for tasks and steps.
 *
 * @module models/File
 */

import { DataTypes } from 'sequelize';
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineFile(sequelize, schema) {
  const File = sequelize.define('File', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    uploaderId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: dbSchema.tableName('task_graph_files'),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
    createdAt: 'uploadedAt',
    updatedAt: false,
    indexes: [
      { fields: ['step_id'] },
      { fields: ['task_id'] },
    ],
    hooks: {
      beforeCreate(instance) {
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[File] [BeforeCreate]', {
            id: instance.id,
            fileName: instance.fileName,
            mimeType: instance.mimeType,
            size: instance.size,
            taskId: instance.taskId,
            stepId: instance.stepId,
            timestamp: new Date().toISOString(),
          });
        }
      },
      beforeUpdate(instance) {
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[File] [BeforeUpdate]', {
            id: instance.id,
            fileName: instance.fileName,
            changed: instance.changed(),
            timestamp: new Date().toISOString(),
          });
        }
      },
    },
  });

  return File;
}
