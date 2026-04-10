import { DataTypes } from "sequelize";
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineResource(sequelize, schema) {
  const Resource = sequelize.define(
    "Resource",
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
      resourceName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: "resource_name",
      },
      resourceType: {
        type: DataTypes.ENUM(
          "figma",
          "sketch",
          "xd",
          "pdf",
          "image",
          "code",
          "document",
          "other",
        ),
        allowNull: false,
        defaultValue: "other",
        field: "resource_type",
      },
      resourceUrl: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        field: "resource_url",
      },
      resourceSize: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "resource_size",
      },
      fqdpId: {
        type: DataTypes.STRING(2048),
        allowNull: true,
        unique: true,
        field: "fqdp_id",
      },
      externalLinks: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: "external_links",
      },
      projectId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "project_id",
        references: { model: { tableName: "fqdp_projects", schema }, key: "id" },
        onDelete: "CASCADE",
      },
      projectName: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: "project_name",
      },
      applicationId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "application_id",
        references: { model: { tableName: "fqdp_applications", schema }, key: "id" },
        onDelete: "CASCADE",
      },
      applicationName: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: "application_name",
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
      tableName: dbSchema.tableName("fqdp_resources"),
      schema: dbSchema.schemaFor(schema),
      ...dbSchema.defineDefaults,
      indexes: [
        { name: "idx_fqdp_resource_fqdp_id", unique: true, fields: ["fqdp_id"] },
        { name: "idx_fqdp_resource_proj_id", fields: ["project_id"] },
        { name: "idx_fqdp_resource_app_id", fields: ["application_id"] },
        { name: "idx_fqdp_resource_team_id", fields: ["team_id"] },
        { name: "idx_fqdp_resource_ws_id", fields: ["workspace_id"] },
        { name: "idx_fqdp_resource_org_id", fields: ["organization_id"] },
        { name: "idx_fqdp_resource_slug", unique: true, fields: ["slug"] },
        { name: "idx_fqdp_resource_type", fields: ["resource_type"] },
        { name: "idx_fqdp_resource_status", fields: ["status"] },
      ],
      hooks: {
        beforeCreate(instance) {
          console.log(`[Resource] Creating: ${instance.name}`);
        },
        beforeUpdate(instance) {
          console.log(`[Resource] Updating: ${instance.name}`);
        },
      },
    },
  );

  Resource.prototype.toCleanJSON = function () {
    const values = this.get({ plain: true });
    delete values.createdAt;
    delete values.updatedAt;
    return values;
  };

  return Resource;
}
