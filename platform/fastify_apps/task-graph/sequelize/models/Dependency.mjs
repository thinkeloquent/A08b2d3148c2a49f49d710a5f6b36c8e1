/**
 * Dependency Sequelize model.
 *
 * Defines prerequisite relationships between tasks.
 *
 * @module models/Dependency
 */

import { DataTypes } from 'sequelize';
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineDependency(sequelize, schema) {
  const Dependency = sequelize.define('Dependency', {
    prerequisiteId: {
      type: DataTypes.STRING,
      primaryKey: true,
      references: {
        model: { tableName: dbSchema.tableName('task_graph_tasks'), schema: dbSchema.schemaFor(schema) },
        key: 'id',
      },
    },
    dependentId: {
      type: DataTypes.STRING,
      primaryKey: true,
      references: {
        model: { tableName: dbSchema.tableName('task_graph_tasks'), schema: dbSchema.schemaFor(schema) },
        key: 'id',
      },
    },
    allowSkip: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
    tableName: dbSchema.tableName('task_graph_dependencies'),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
    updatedAt: false,
    indexes: [
      { fields: ['dependent_id'] },
    ],
    hooks: {
      beforeCreate(instance) {
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[Dependency] [BeforeCreate]', {
            prerequisiteId: instance.prerequisiteId,
            dependentId: instance.dependentId,
            allowSkip: instance.allowSkip,
            timestamp: new Date().toISOString(),
          });
        }
      },
      beforeUpdate(instance) {
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[Dependency] [BeforeUpdate]', {
            prerequisiteId: instance.prerequisiteId,
            dependentId: instance.dependentId,
            changed: instance.changed(),
            timestamp: new Date().toISOString(),
          });
        }
      },
    },
  });

  return Dependency;
}
