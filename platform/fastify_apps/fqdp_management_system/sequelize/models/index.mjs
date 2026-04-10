import { getSequelize, getConfig } from "@internal/db_connection_sequelize";
import { dbSchema } from '../../../../common/config/database_schema.mjs';
import defineOrganization from "./Organization.mjs";
import defineWorkspace from "./Workspace.mjs";
import defineTeam from "./Team.mjs";
import defineApplication from "./Application.mjs";
import defineProject from "./Project.mjs";
import defineResource from "./Resource.mjs";
import defineReference from "./Reference.mjs";

const config = getConfig();
const sequelize = getSequelize();
const SCHEMA = config.schema;

const Organization = defineOrganization(sequelize, SCHEMA);
const Workspace = defineWorkspace(sequelize, SCHEMA);
const Team = defineTeam(sequelize, SCHEMA);
const Application = defineApplication(sequelize, SCHEMA);
const Project = defineProject(sequelize, SCHEMA);
const Resource = defineResource(sequelize, SCHEMA);
const Reference = defineReference(sequelize, SCHEMA);

// Associations: Organization -> Workspace
Organization.hasMany(Workspace, {
  foreignKey: "organization_id",
  as: "workspaces",
});
Workspace.belongsTo(Organization, {
  foreignKey: "organization_id",
  as: "organization",
});

// Associations: Workspace -> Team
Workspace.hasMany(Team, {
  foreignKey: "workspace_id",
  as: "teams",
});
Team.belongsTo(Workspace, {
  foreignKey: "workspace_id",
  as: "workspace",
});
Team.belongsTo(Organization, {
  foreignKey: "organization_id",
  as: "organization",
});

// Associations: Team -> Application
Team.hasMany(Application, {
  foreignKey: "team_id",
  as: "applications",
});
Application.belongsTo(Team, {
  foreignKey: "team_id",
  as: "team",
});
Application.belongsTo(Workspace, {
  foreignKey: "workspace_id",
  as: "workspace",
});
Application.belongsTo(Organization, {
  foreignKey: "organization_id",
  as: "organization",
});

// Associations: Application -> Project
Application.hasMany(Project, {
  foreignKey: "application_id",
  as: "projects",
});
Project.belongsTo(Application, {
  foreignKey: "application_id",
  as: "application",
});
Project.belongsTo(Team, {
  foreignKey: "team_id",
  as: "team",
});
Project.belongsTo(Workspace, {
  foreignKey: "workspace_id",
  as: "workspace",
});
Project.belongsTo(Organization, {
  foreignKey: "organization_id",
  as: "organization",
});

// Associations: Project -> Resource
Project.hasMany(Resource, {
  foreignKey: "project_id",
  as: "resources",
});
Resource.belongsTo(Project, {
  foreignKey: "project_id",
  as: "project",
});
Resource.belongsTo(Application, {
  foreignKey: "application_id",
  as: "application",
});
Resource.belongsTo(Team, {
  foreignKey: "team_id",
  as: "team",
});
Resource.belongsTo(Workspace, {
  foreignKey: "workspace_id",
  as: "workspace",
});
Resource.belongsTo(Organization, {
  foreignKey: "organization_id",
  as: "organization",
});

// Models owned by this schema — used for scoped setup/teardown
// Order matters for sync (parents first) and drop (children first)
const OWNED_MODELS = [
  Organization,
  Workspace,
  Team,
  Application,
  Project,
  Resource,
  Reference,
];

const OWNED_TABLE_NAMES = [
  dbSchema.tableName("fqdp_references"),
  dbSchema.tableName("fqdp_resources"),
  dbSchema.tableName("fqdp_projects"),
  dbSchema.tableName("fqdp_applications"),
  dbSchema.tableName("fqdp_teams"),
  dbSchema.tableName("fqdp_workspaces"),
  dbSchema.tableName("fqdp_organizations"),
];

export {
  sequelize,
  config,
  SCHEMA,
  Organization,
  Workspace,
  Team,
  Application,
  Project,
  Resource,
  Reference,
  OWNED_MODELS,
  OWNED_TABLE_NAMES,
};
