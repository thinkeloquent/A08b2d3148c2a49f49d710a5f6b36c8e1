/**
 * TaskTemplate Sequelize model.
 *
 * Template for creating tasks with predefined structure.
 *
 * @module models/TaskTemplate
 */

import { DataTypes } from 'sequelize';
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineTaskTemplate(sequelize, schema) {
  const TaskTemplate = sequelize.define('TaskTemplate', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    template: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    usageCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  }, {
    tableName: dbSchema.tableName('task_graph_task_templates'),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
    indexes: [
      { fields: ['category'] },
      { fields: ['is_active'] },
    ],
    hooks: {
      beforeCreate(instance) {
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[TaskTemplate] [BeforeCreate]', {
            id: instance.id,
            name: instance.name,
            category: instance.category,
            timestamp: new Date().toISOString(),
          });
        }
      },
      beforeUpdate(instance) {
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[TaskTemplate] [BeforeUpdate]', {
            id: instance.id,
            name: instance.name,
            changed: instance.changed(),
            timestamp: new Date().toISOString(),
          });
        }
      },
    },
  });

  return TaskTemplate;
}
