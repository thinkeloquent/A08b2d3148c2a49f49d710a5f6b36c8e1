import { DataTypes } from "sequelize";
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineApplication(sequelize, schema) {
  const Application = sequelize.define(
    "Application",
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
      teamId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "team_id",
        references: { model: { tableName: "fqdp_teams", schema }, key: "id" },
        onDelete: "CASCADE",
      },
      teamName: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: "team_name",
      },
      workspaceId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "workspace_id",
        references: { model: { tableName: "fqdp_workspaces", schema }, key: "id" },
        onDelete: "CASCADE",
      },
      workspaceName: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: "workspace_name",
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
      projectCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        field: "project_count",
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
      tableName: dbSchema.tableName("fqdp_applications"),
      schema: dbSchema.schemaFor(schema),
      ...dbSchema.defineDefaults,
      indexes: [
        { name: "idx_fqdp_app_team_id", fields: ["team_id"] },
        { name: "idx_fqdp_app_ws_id", fields: ["workspace_id"] },
        { name: "idx_fqdp_app_org_id", fields: ["organization_id"] },
        { name: "idx_fqdp_app_slug", unique: true, fields: ["slug"] },
        { name: "idx_fqdp_app_status", fields: ["status"] },
      ],
      hooks: {
        beforeCreate(instance) {
          console.log(`[Application] Creating: ${instance.name}`);
        },
        beforeUpdate(instance) {
          console.log(`[Application] Updating: ${instance.name}`);
        },
      },
    },
  );

  Application.prototype.toCleanJSON = function () {
    const values = this.get({ plain: true });
    delete values.createdAt;
    delete values.updatedAt;
    return values;
  };

  return Application;
}
