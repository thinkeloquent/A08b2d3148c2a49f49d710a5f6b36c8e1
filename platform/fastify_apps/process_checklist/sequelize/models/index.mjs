import { getSequelize, getConfig } from "@internal/db_connection_sequelize";
import defineTemplate from "./Template.mjs";
import defineStep from "./Step.mjs";
import defineChecklistInstance from "./ChecklistInstance.mjs";
import defineChecklistStep from "./ChecklistStep.mjs";
import { dbSchema } from '../../../../common/config/database_schema.mjs';

const config = getConfig();
const sequelize = getSequelize();
const SCHEMA = config.schema;

const Template = defineTemplate(sequelize, SCHEMA);
const Step = defineStep(sequelize, SCHEMA);
const ChecklistInstance = defineChecklistInstance(sequelize, SCHEMA);
const ChecklistStep = defineChecklistStep(sequelize, SCHEMA);

// One-to-Many: Template -> Steps (via template_id string FK)
Template.hasMany(Step, {
  sourceKey: "template_id",
  foreignKey: "template_id",
  as: "steps",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Step.belongsTo(Template, {
  targetKey: "template_id",
  foreignKey: "template_id",
  as: "template",
});

// One-to-Many: ChecklistInstance -> ChecklistSteps (via checklist_id string FK)
ChecklistInstance.hasMany(ChecklistStep, {
  sourceKey: "checklist_id",
  foreignKey: "checklist_id",
  as: "steps",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

ChecklistStep.belongsTo(ChecklistInstance, {
  targetKey: "checklist_id",
  foreignKey: "checklist_id",
  as: "checklistInstance",
});

// Tables owned by this schema - used for scoped setup/teardown
const OWNED_MODELS = [Template, Step, ChecklistInstance, ChecklistStep];
const OWNED_TABLE_NAMES = [
  dbSchema.tableName("pc_checklist_steps"),
  dbSchema.tableName("pc_checklist_instances"),
  dbSchema.tableName("pc_steps"),
  dbSchema.tableName("pc_templates"),
];

export {
  sequelize,
  config,
  SCHEMA,
  Template,
  Step,
  ChecklistInstance,
  ChecklistStep,
  OWNED_MODELS,
  OWNED_TABLE_NAMES,
};
