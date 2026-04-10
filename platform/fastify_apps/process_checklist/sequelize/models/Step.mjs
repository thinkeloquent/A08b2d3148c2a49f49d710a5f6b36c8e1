import { DataTypes } from "sequelize";
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineStep(sequelize, schema) {
  const Step = sequelize.define(
    "Step",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      step_id: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      template_id: {
        type: DataTypes.STRING(64),
        allowNull: false,
        references: {
          model: { tableName: dbSchema.tableName("pc_templates"), schema: dbSchema.schemaFor(schema) },
          key: "template_id",
        },
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      required: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      tags: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      dependencies: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
      },
    },
    {
      tableName: dbSchema.tableName("pc_steps"),
      schema: dbSchema.schemaFor(schema),
      ...dbSchema.defineDefaults,
      indexes: [
        { name: "idx_pc_steps_step_id", fields: ["step_id"] },
        { name: "idx_pc_steps_template_id", fields: ["template_id"] },
        {
          name: "idx_pc_steps_template_step",
          unique: true,
          fields: ["template_id", "step_id"],
        },
        {
          name: "idx_pc_steps_template_order",
          fields: ["template_id", "order"],
        },
      ],
    },
  );

  return Step;
}
