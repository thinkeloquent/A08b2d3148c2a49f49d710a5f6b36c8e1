import { getSequelize, getConfig } from "@internal/db_connection_sequelize";
import defineFormDefinition from "./FormDefinition.mjs";
import defineFormDefinitionTag from "./FormDefinitionTag.mjs";
import defineFormDefinitionVersion from "./FormDefinitionVersion.mjs";
import { dbSchema } from '../../../../common/config/database_schema.mjs';

const config = getConfig();
const sequelize = getSequelize();
const SCHEMA = config.schema;

const FormDefinition = defineFormDefinition(sequelize, SCHEMA);
const FormDefinitionTag = defineFormDefinitionTag(sequelize, SCHEMA);
const FormDefinitionVersion = defineFormDefinitionVersion(sequelize, SCHEMA);

/** Extract plain table name string from Model.getTableName() (may return {tableName, schema} when schema is set). */
function plainTableName(model) {
  const t = model.getTableName();
  return typeof t === "string" ? t : t.tableName;
}

const FK_FORM_DEFINITION_ID = "form_definition_id";
const FK_TAG_ID = "tag_id";
const TAG_REF_TABLE = `${plainTableName(FormDefinitionTag)}_ref`;

// Many-to-Many: FormDefinition <-> FormDefinitionTag (through join table)
FormDefinition.belongsToMany(FormDefinitionTag, {
  through: TAG_REF_TABLE,
  foreignKey: FK_FORM_DEFINITION_ID,
  otherKey: FK_TAG_ID,
  as: "tags",
  timestamps: true,
  uniqueKey: "uq_form_definition_tag",
});

FormDefinitionTag.belongsToMany(FormDefinition, {
  through: TAG_REF_TABLE,
  foreignKey: FK_TAG_ID,
  otherKey: FK_FORM_DEFINITION_ID,
  as: "formDefinitions",
  timestamps: true,
  uniqueKey: "uq_form_definition_tag",
});

// One-to-Many: FormDefinition -> FormDefinitionVersion
FormDefinition.hasMany(FormDefinitionVersion, {
  foreignKey: FK_FORM_DEFINITION_ID,
  as: "versions",
});

FormDefinitionVersion.belongsTo(FormDefinition, {
  foreignKey: FK_FORM_DEFINITION_ID,
  as: "formDefinition",
});

// Tables owned by this schema — used for scoped setup/teardown
const OWNED_MODELS = [
  FormDefinition,
  FormDefinitionTag,
  FormDefinitionVersion,
];
const OWNED_TABLE_NAMES = [
  TAG_REF_TABLE, // join table
  plainTableName(FormDefinitionVersion),
  plainTableName(FormDefinitionTag),
  plainTableName(FormDefinition),
];

export {
  sequelize,
  config,
  SCHEMA,
  FormDefinition,
  FormDefinitionTag,
  FormDefinitionVersion,
  OWNED_MODELS,
  OWNED_TABLE_NAMES,
};
