import { getSequelize, getConfig } from "@internal/db_connection_sequelize";
import defineCategoryType from "./CategoryType.mjs";
import defineTargetApp from "./TargetApp.mjs";
import defineCategory from "./Category.mjs";

const config = getConfig();
const sequelize = getSequelize();
const SCHEMA = config.schema;

const CategoryType = defineCategoryType(sequelize, SCHEMA);
const TargetApp = defineTargetApp(sequelize, SCHEMA);
const Category = defineCategory(sequelize, SCHEMA);

// Relationships
CategoryType.hasMany(Category, { foreignKey: 'category_type_id', as: 'categories' });
Category.belongsTo(CategoryType, { foreignKey: 'category_type_id', as: 'categoryType' });

TargetApp.hasMany(Category, { foreignKey: 'target_app_id', as: 'categories' });
Category.belongsTo(TargetApp, { foreignKey: 'target_app_id', as: 'targetApp' });

function plainTableName(model) {
  const t = model.getTableName();
  return typeof t === "string" ? t : t.tableName;
}

const OWNED_MODELS = [CategoryType, TargetApp, Category];
const OWNED_TABLE_NAMES = [
  plainTableName(Category),
  plainTableName(TargetApp),
  plainTableName(CategoryType),
];

export {
  sequelize,
  config,
  SCHEMA,
  Category,
  CategoryType,
  TargetApp,
  OWNED_MODELS,
  OWNED_TABLE_NAMES,
};
