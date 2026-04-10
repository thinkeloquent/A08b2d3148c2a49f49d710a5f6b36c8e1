import { DataTypes } from "sequelize";
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineChecklistInstance(sequelize, schema) {
  const ChecklistInstance = sequelize.define(
    "ChecklistInstance",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      checklist_id: {
        type: DataTypes.STRING(128),
        allowNull: false,
        unique: true,
      },
      template_ref: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      generated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
      },
    },
    {
      tableName: dbSchema.tableName("pc_checklist_instances"),
      schema: dbSchema.schemaFor(schema),
      ...dbSchema.defineDefaults,
      indexes: [
        { name: "idx_pc_checklist_id", fields: ["checklist_id"] },
        { name: "idx_pc_template_ref", fields: ["template_ref"] },
        { name: "idx_pc_generated_at", fields: ["generated_at"] },
      ],
    },
  );

  return ChecklistInstance;
}
