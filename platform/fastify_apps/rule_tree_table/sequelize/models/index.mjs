import { getSequelize, getConfig } from "@internal/db_connection_sequelize";
import defineRuleTree from "./RuleTree.mjs";
import defineRuleItem from "./RuleItem.mjs";
import { dbSchema } from '../../../../common/config/database_schema.mjs';

const config = getConfig();
const sequelize = getSequelize();
const SCHEMA = config.schema;

const RuleTree = defineRuleTree(sequelize, SCHEMA);
const RuleItem = defineRuleItem(sequelize, SCHEMA);

// One-to-Many: RuleTree -> RuleItem
RuleTree.hasMany(RuleItem, {
  foreignKey: 'rule_tree_id',
  as: 'items',
  onDelete: 'CASCADE',
});

RuleItem.belongsTo(RuleTree, {
  foreignKey: 'rule_tree_id',
  as: 'ruleTree',
});

// Self-referential: RuleItem -> RuleItem (parent/children)
RuleItem.belongsTo(RuleItem, {
  foreignKey: 'parent_id',
  as: 'parent',
});

RuleItem.hasMany(RuleItem, {
  foreignKey: 'parent_id',
  as: 'children',
  onDelete: 'CASCADE',
});

// Tables owned by this schema -- used for scoped setup/teardown
const OWNED_MODELS = [RuleTree, RuleItem];

// Reverse dependency order for teardown (children first)
const OWNED_TABLE_NAMES = [dbSchema.tableName('rule_items'), dbSchema.tableName('rule_trees')];

export {
  sequelize,
  SCHEMA,
  RuleTree,
  RuleItem,
  OWNED_MODELS,
  OWNED_TABLE_NAMES,
};
