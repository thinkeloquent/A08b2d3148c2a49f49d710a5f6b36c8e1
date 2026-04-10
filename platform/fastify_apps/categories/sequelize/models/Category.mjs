import { DataTypes } from 'sequelize';
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineCategory(sequelize, schema) {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category_type_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: dbSchema.tableName('category_types'), key: 'id' },
    },
    target_app_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: dbSchema.tableName('category_target_apps'), key: 'id' },
    },
  }, {
    tableName: dbSchema.tableName('categories'),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
  });

  return Category;
}
