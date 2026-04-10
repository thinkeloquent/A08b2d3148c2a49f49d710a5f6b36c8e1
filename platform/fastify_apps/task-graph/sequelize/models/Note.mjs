/**
 * Note Sequelize model.
 *
 * Notes/comments attached to tasks.
 *
 * @module models/Note
 */

import { DataTypes } from 'sequelize';
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineNote(sequelize, schema) {
  const Note = sequelize.define('Note', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    taskId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: { tableName: dbSchema.tableName('task_graph_tasks'), schema: dbSchema.schemaFor(schema) },
        key: 'id',
      },
    },
    authorId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: dbSchema.tableName('task_graph_notes'),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
    indexes: [
      { fields: ['author_id'] },
      { fields: ['task_id', 'created_at'] },
      { fields: ['task_id'] },
    ],
    hooks: {
      beforeCreate(instance) {
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[Note] [BeforeCreate]', {
            id: instance.id,
            taskId: instance.taskId,
            authorId: instance.authorId,
            contentLength: instance.content.length,
            timestamp: new Date().toISOString(),
          });
        }
      },
      beforeUpdate(instance) {
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[Note] [BeforeUpdate]', {
            id: instance.id,
            taskId: instance.taskId,
            changed: instance.changed(),
            timestamp: new Date().toISOString(),
          });
        }
      },
    },
  });

  return Note;
}
