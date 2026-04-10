import { DataTypes } from "sequelize";
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineChecklistStep(sequelize, schema) {
  const ChecklistStep = sequelize.define(
    "ChecklistStep",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      checklist_id: {
        type: DataTypes.STRING(128),
        allowNull: false,
        references: {
          model: { tableName: dbSchema.tableName("pc_checklist_instances"), schema: dbSchema.schemaFor(schema) },
          key: "checklist_id",
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
      tableName: dbSchema.tableName("pc_checklist_steps"),
      schema: dbSchema.schemaFor(schema),
      ...dbSchema.defineDefaults,
      indexes: [
        {
          name: "idx_pc_checklist_steps_checklist_id",
          fields: ["checklist_id"],
        },
        {
          name: "idx_pc_checklist_steps_order",
          fields: ["checklist_id", "order"],
        },
      ],
    },
  );

  return ChecklistStep;
}
