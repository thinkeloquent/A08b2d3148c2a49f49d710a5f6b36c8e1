import { getSequelize, getConfig } from "@internal/db_connection_sequelize";
import defineComponentDefinition from "./ComponentDefinition.mjs";
import defineComponentTag from "./ComponentTag.mjs";
import { dbSchema } from '../../../../common/config/database_schema.mjs';

const config = getConfig();
const sequelize = getSequelize();
const SCHEMA = config.schema;

const ComponentDefinition = defineComponentDefinition(sequelize, SCHEMA);
const ComponentTag = defineComponentTag(sequelize, SCHEMA);

/** Extract plain table name string from Model.getTableName() (may return {tableName, schema} when schema is set). */
function plainTableName(model) {
  const t = model.getTableName();
  return typeof t === "string" ? t : t.tableName;
}

const FK_COMPONENT_DEFINITION_ID = "component_definition_id";
const FK_TAG_ID = "tag_id";
const TAG_REF_TABLE = `${plainTableName(ComponentTag)}_ref`;

// Many-to-Many: ComponentDefinition <-> ComponentTag (through join table)
ComponentDefinition.belongsToMany(ComponentTag, {
  through: TAG_REF_TABLE,
  foreignKey: FK_COMPONENT_DEFINITION_ID,
  otherKey: FK_TAG_ID,
  as: "tags",
  timestamps: true,
  uniqueKey: "uq_component_definition_tag",
});

ComponentTag.belongsToMany(ComponentDefinition, {
  through: TAG_REF_TABLE,
  foreignKey: FK_TAG_ID,
  otherKey: FK_COMPONENT_DEFINITION_ID,
  as: "componentDefinitions",
  timestamps: true,
  uniqueKey: "uq_component_definition_tag",
});

// Tables owned by this schema — used for scoped setup/teardown
const OWNED_MODELS = [
  ComponentDefinition,
  ComponentTag,
];
const OWNED_TABLE_NAMES = [
  TAG_REF_TABLE, // join table first (dependency order)
  plainTableName(ComponentTag),
  plainTableName(ComponentDefinition),
];

export {
  sequelize,
  config,
  SCHEMA,
  ComponentDefinition,
  ComponentTag,
  OWNED_MODELS,
  OWNED_TABLE_NAMES,
};
