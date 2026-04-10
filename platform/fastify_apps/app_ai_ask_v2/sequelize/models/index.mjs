import { getSequelize, getConfig } from "@internal/db_connection_sequelize";
import definePersona from "./Persona.mjs";
import defineLLMDefault from "./LLMDefault.mjs";
import { dbSchema } from '../../../../common/config/database_schema.mjs';

const config = getConfig();
const sequelize = getSequelize();
const SCHEMA = config.schema;

const Persona = definePersona(sequelize, SCHEMA);
const LLMDefault = defineLLMDefault(sequelize, SCHEMA);

function plainTableName(model) {
  const t = model.getTableName();
  return typeof t === "string" ? t : t.tableName;
}

const OWNED_MODELS = [Persona, LLMDefault];
const OWNED_TABLE_NAMES = [
  plainTableName(LLMDefault),
  plainTableName(Persona),
];

export {
  sequelize,
  config,
  SCHEMA,
  Persona,
  LLMDefault,
  OWNED_MODELS,
  OWNED_TABLE_NAMES,
};
