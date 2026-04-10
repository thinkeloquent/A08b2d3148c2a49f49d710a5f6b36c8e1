import { getSequelize, getConfig } from "@internal/db_connection_sequelize";
import defineRole from "./Role.mjs";
import defineGroup from "./Group.mjs";
import defineLabel from "./Label.mjs";
import defineAction from "./Action.mjs";
import defineRestriction from "./Restriction.mjs";
import { dbSchema } from '../../../../common/config/database_schema.mjs';

const config = getConfig();
const sequelize = getSequelize();
const SCHEMA = config.schema;

const Role = defineRole(sequelize, SCHEMA);
const Group = defineGroup(sequelize, SCHEMA);
const Label = defineLabel(sequelize, SCHEMA);
const Action = defineAction(sequelize, SCHEMA);
const Restriction = defineRestriction(sequelize, SCHEMA);

/** Extract plain table name string from Model.getTableName(). */
function plainTableName(model) {
  const t = model.getTableName();
  return typeof t === "string" ? t : t.tableName;
}

const ROLE_GROUPS_REF_TABLE = dbSchema.tableName("group_role_management_role_groups_ref");
const ROLE_LABELS_REF_TABLE = dbSchema.tableName("group_role_management_role_labels_ref");
const ROLE_ACTIONS_REF_TABLE = dbSchema.tableName("group_role_management_role_actions_ref");
const ROLE_RESTRICTIONS_REF_TABLE = dbSchema.tableName("group_role_management_role_restrictions_ref");
const GROUP_ACTIONS_REF_TABLE = dbSchema.tableName("group_role_management_group_actions_ref");
const GROUP_RESTRICTIONS_REF_TABLE = dbSchema.tableName("group_role_management_group_restrictions_ref");

// Many-to-Many: Role <-> Group
Role.belongsToMany(Group, {
  through: ROLE_GROUPS_REF_TABLE,
  foreignKey: "role_id",
  otherKey: "group_id",
  as: "groups",
  timestamps: true,
  uniqueKey: "uq_role_group",
});

Group.belongsToMany(Role, {
  through: ROLE_GROUPS_REF_TABLE,
  foreignKey: "group_id",
  otherKey: "role_id",
  as: "roles",
  timestamps: true,
  uniqueKey: "uq_role_group",
});

// Many-to-Many: Role <-> Label
Role.belongsToMany(Label, {
  through: ROLE_LABELS_REF_TABLE,
  foreignKey: "role_id",
  otherKey: "label_name",
  as: "labels",
  timestamps: true,
  uniqueKey: "uq_role_label",
});

Label.belongsToMany(Role, {
  through: ROLE_LABELS_REF_TABLE,
  foreignKey: "label_name",
  otherKey: "role_id",
  as: "roles",
  timestamps: true,
  uniqueKey: "uq_role_label",
});

// Many-to-Many: Role <-> Action
Role.belongsToMany(Action, {
  through: ROLE_ACTIONS_REF_TABLE,
  foreignKey: "role_id",
  otherKey: "action_id",
  as: "actions",
  timestamps: true,
  uniqueKey: "uq_role_action",
});

Action.belongsToMany(Role, {
  through: ROLE_ACTIONS_REF_TABLE,
  foreignKey: "action_id",
  otherKey: "role_id",
  as: "roles",
  timestamps: true,
  uniqueKey: "uq_role_action",
});

// Many-to-Many: Role <-> Restriction
Role.belongsToMany(Restriction, {
  through: ROLE_RESTRICTIONS_REF_TABLE,
  foreignKey: "role_id",
  otherKey: "restriction_id",
  as: "restrictions",
  timestamps: true,
  uniqueKey: "uq_role_restriction",
});

Restriction.belongsToMany(Role, {
  through: ROLE_RESTRICTIONS_REF_TABLE,
  foreignKey: "restriction_id",
  otherKey: "role_id",
  as: "roles",
  timestamps: true,
  uniqueKey: "uq_role_restriction",
});

// Many-to-Many: Group <-> Action
Group.belongsToMany(Action, {
  through: GROUP_ACTIONS_REF_TABLE,
  foreignKey: "group_id",
  otherKey: "action_id",
  as: "actions",
  timestamps: true,
  uniqueKey: "uq_group_action",
});

Action.belongsToMany(Group, {
  through: GROUP_ACTIONS_REF_TABLE,
  foreignKey: "action_id",
  otherKey: "group_id",
  as: "groups",
  timestamps: true,
  uniqueKey: "uq_group_action",
});

// Many-to-Many: Group <-> Restriction
Group.belongsToMany(Restriction, {
  through: GROUP_RESTRICTIONS_REF_TABLE,
  foreignKey: "group_id",
  otherKey: "restriction_id",
  as: "restrictions",
  timestamps: true,
  uniqueKey: "uq_group_restriction",
});

Restriction.belongsToMany(Group, {
  through: GROUP_RESTRICTIONS_REF_TABLE,
  foreignKey: "restriction_id",
  otherKey: "group_id",
  as: "groups",
  timestamps: true,
  uniqueKey: "uq_group_restriction",
});

// Tables owned by this schema — used for scoped setup/teardown
const OWNED_MODELS = [Role, Group, Label, Action, Restriction];
const OWNED_TABLE_NAMES = [
  ROLE_GROUPS_REF_TABLE,
  ROLE_LABELS_REF_TABLE,
  ROLE_ACTIONS_REF_TABLE,
  ROLE_RESTRICTIONS_REF_TABLE,
  GROUP_ACTIONS_REF_TABLE,
  GROUP_RESTRICTIONS_REF_TABLE,
  plainTableName(Label),
  plainTableName(Action),
  plainTableName(Restriction),
  plainTableName(Group),
  plainTableName(Role),
];

export {
  sequelize,
  config,
  SCHEMA,
  Role,
  Group,
  Label,
  Action,
  Restriction,
  ROLE_GROUPS_REF_TABLE,
  ROLE_LABELS_REF_TABLE,
  ROLE_ACTIONS_REF_TABLE,
  ROLE_RESTRICTIONS_REF_TABLE,
  GROUP_ACTIONS_REF_TABLE,
  GROUP_RESTRICTIONS_REF_TABLE,
  OWNED_MODELS,
  OWNED_TABLE_NAMES,
};
