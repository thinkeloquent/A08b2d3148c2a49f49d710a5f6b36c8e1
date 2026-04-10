import { DataTypes } from "sequelize";
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineTemplate(sequelize, schema) {
  const Template = sequelize.define(
    "Template",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      template_id: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      version: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      category: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
    },
    {
      tableName: dbSchema.tableName("pc_templates"),
      schema: dbSchema.schemaFor(schema),
      ...dbSchema.defineDefaults,
      indexes: [
        { name: "idx_pc_template_id", fields: ["template_id"] },
        { name: "idx_pc_template_category", fields: ["category"] },
        { name: "idx_pc_template_name", fields: ["name"] },
      ],
    },
  );

  return Template;
}
