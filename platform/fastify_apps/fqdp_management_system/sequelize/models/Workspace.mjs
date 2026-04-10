import { DataTypes } from "sequelize";
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineWorkspace(sequelize, schema) {
  const Workspace = sequelize.define(
    "Workspace",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING(2048),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive", "archived"),
        defaultValue: "active",
        allowNull: false,
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      organizationId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "organization_id",
        references: { model: { tableName: "fqdp_organizations", schema }, key: "id" },
        onDelete: "CASCADE",
      },
      organizationName: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: "organization_name",
      },
      teamCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        field: "team_count",
      },
      createdBy: {
        type: DataTypes.STRING(255),
        defaultValue: "system",
        allowNull: false,
        field: "created_by",
      },
      updatedBy: {
        type: DataTypes.STRING(255),
        defaultValue: "system",
        allowNull: false,
        field: "updated_by",
      },
    },
    {
      tableName: dbSchema.tableName("fqdp_workspaces"),
      schema: dbSchema.schemaFor(schema),
      ...dbSchema.defineDefaults,
      indexes: [
        { name: "idx_fqdp_ws_org_id", fields: ["organization_id"] },
        { name: "idx_fqdp_ws_slug", unique: true, fields: ["slug"] },
        { name: "idx_fqdp_ws_status", fields: ["status"] },
      ],
      hooks: {
        beforeCreate(instance) {
          console.log(`[Workspace] Creating: ${instance.name}`);
        },
        beforeUpdate(instance) {
          console.log(`[Workspace] Updating: ${instance.name}`);
        },
      },
    },
  );

  Workspace.prototype.toCleanJSON = function () {
    const values = this.get({ plain: true });
    delete values.createdAt;
    delete values.updatedAt;
    return values;
  };

  return Workspace;
}
