import { getSequelize, getConfig } from "@internal/db_connection_sequelize";
import defineProject from "./Project.mjs";
import definePrompt from "./Prompt.mjs";
import definePromptVersion from "./PromptVersion.mjs";
import defineDeployment from "./Deployment.mjs";
import defineVariable from "./Variable.mjs";
import { dbSchema } from '../../../../common/config/database_schema.mjs';

const config = getConfig();
const sequelize = getSequelize();
const SCHEMA = config.schema;

const Project = defineProject(sequelize, SCHEMA);
const Prompt = definePrompt(sequelize, SCHEMA);
const PromptVersion = definePromptVersion(sequelize, SCHEMA);
const Deployment = defineDeployment(sequelize, SCHEMA);
const Variable = defineVariable(sequelize, SCHEMA);

/** Extract plain table name string from Model.getTableName(). */
function plainTableName(model) {
  const t = model.getTableName();
  return typeof t === "string" ? t : t.tableName;
}

// Associations
// Project hasMany Prompts
Project.hasMany(Prompt, { foreignKey: 'project_id', as: 'prompts' });
Prompt.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// Prompt hasMany PromptVersions
Prompt.hasMany(PromptVersion, { foreignKey: 'prompt_id', as: 'versions' });
PromptVersion.belongsTo(Prompt, { foreignKey: 'prompt_id', as: 'prompt' });

// Prompt hasMany Deployments
Prompt.hasMany(Deployment, { foreignKey: 'prompt_id', as: 'deployments' });
Deployment.belongsTo(Prompt, { foreignKey: 'prompt_id', as: 'prompt' });

// PromptVersion hasMany Variables
PromptVersion.hasMany(Variable, { foreignKey: 'version_id', as: 'variables' });
Variable.belongsTo(PromptVersion, { foreignKey: 'version_id', as: 'version' });

// Deployment belongsTo PromptVersion
Deployment.belongsTo(PromptVersion, { foreignKey: 'version_id', as: 'version' });
PromptVersion.hasMany(Deployment, { foreignKey: 'version_id', as: 'deployments' });

// Tables owned by this schema — used for scoped setup/teardown
// Order: dependents first for teardown
const OWNED_MODELS = [Project, Prompt, PromptVersion, Deployment, Variable];
const OWNED_TABLE_NAMES = [
  plainTableName(Variable),
  plainTableName(Deployment),
  plainTableName(PromptVersion),
  plainTableName(Prompt),
  plainTableName(Project),
];

export {
  sequelize,
  config,
  SCHEMA,
  Project,
  Prompt,
  PromptVersion,
  Deployment,
  Variable,
  OWNED_MODELS,
  OWNED_TABLE_NAMES,
};
