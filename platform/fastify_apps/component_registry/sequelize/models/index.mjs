import { getSequelize, getConfig } from "@internal/db_connection_sequelize";
import defineComponent from "./Component.mjs";
import defineTag from "./Tag.mjs";
import defineCategory from "./Category.mjs";
import { dbSchema } from '../../../../common/config/database_schema.mjs';

const config = getConfig();
const sequelize = getSequelize();
const SCHEMA = config.schema;

const Component = defineComponent(sequelize, SCHEMA);
const Tag = defineTag(sequelize, SCHEMA);
const Category = defineCategory(sequelize, SCHEMA);

/** Extract plain table name string from Model.getTableName(). */
function plainTableName(model) {
  const t = model.getTableName();
  return typeof t === "string" ? t : t.tableName;
}

const COMPONENT_TAGS_REF_TABLE = dbSchema.tableName("component_registry_component_tags_ref");

// Many-to-Many: Component <-> Tag
Component.belongsToMany(Tag, {
  through: COMPONENT_TAGS_REF_TABLE,
  foreignKey: "component_id",
  otherKey: "tag_id",
  as: "tags",
  timestamps: true,
  uniqueKey: "uq_component_tag",
});

Tag.belongsToMany(Component, {
  through: COMPONENT_TAGS_REF_TABLE,
  foreignKey: "tag_id",
  otherKey: "component_id",
  as: "components",
  timestamps: true,
  uniqueKey: "uq_component_tag",
});

// Category hasMany Component (via slug — no FK constraint since it's a logical reference)
Category.hasMany(Component, {
  foreignKey: 'category',
  sourceKey: 'slug',
  as: 'components',
  constraints: false,
});

Component.belongsTo(Category, {
  foreignKey: 'category',
  targetKey: 'slug',
  as: 'categoryRecord',
  constraints: false,
});

// Tables owned by this schema — used for scoped setup/teardown
const OWNED_MODELS = [Category, Component, Tag];
const OWNED_TABLE_NAMES = [
  COMPONENT_TAGS_REF_TABLE,
  plainTableName(Tag),
  plainTableName(Component),
  plainTableName(Category),
];

export {
  sequelize,
  config,
  SCHEMA,
  Component,
  Tag,
  Category,
  COMPONENT_TAGS_REF_TABLE,
  OWNED_MODELS,
  OWNED_TABLE_NAMES,
};
