import { getSequelize, getConfig } from "@internal/db_connection_sequelize";
import defineFilterTree from "./FilterTree.mjs";
import defineDropdownOption from "./DropdownOption.mjs";
import { dbSchema } from '../../../../common/config/database_schema.mjs';

const config = getConfig();
const sequelize = getSequelize();
const SCHEMA = config.schema;

const FilterTree = defineFilterTree(sequelize, SCHEMA);
const DropdownOption = defineDropdownOption(sequelize, SCHEMA);

/** Extract plain table name string from Model.getTableName(). */
function plainTableName(model) {
  const t = model.getTableName();
  return typeof t === "string" ? t : t.tableName;
}

// Tables owned by this schema — used for scoped setup/teardown
const OWNED_MODELS = [FilterTree, DropdownOption];
const OWNED_TABLE_NAMES = [
  plainTableName(FilterTree),
  plainTableName(DropdownOption),
];

export {
  sequelize,
  config,
  SCHEMA,
  FilterTree,
  DropdownOption,
  OWNED_MODELS,
  OWNED_TABLE_NAMES,
};
