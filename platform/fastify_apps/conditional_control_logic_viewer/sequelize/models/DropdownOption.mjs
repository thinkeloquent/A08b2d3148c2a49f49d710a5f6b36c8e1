import { DataTypes } from "sequelize";
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineDropdownOption(sequelize, schema) {
  return sequelize.define("DropdownOption", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    value: {
      type: DataTypes.STRING(200),
      allowNull: false,
      unique: true,
    },
    label: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM("active", "archived"),
      defaultValue: "active",
    },
  }, {
    tableName: dbSchema.tableName("conditional_control_logic_viewer_dropdown_options"),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
  });
}
