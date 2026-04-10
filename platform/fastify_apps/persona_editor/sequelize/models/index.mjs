import { getSequelize, getConfig } from "@internal/db_connection_sequelize";
import { dbSchema } from '../../../../common/config/database_schema.mjs';
import definePersona from "./Persona.mjs";
import defineLLMDefault from "./LLMDefault.mjs";
import defineAuditLog from "./AuditLog.mjs";

const config = getConfig();
const sequelize = getSequelize();
const SCHEMA = config.schema;

const Persona = definePersona(sequelize, SCHEMA);
const LLMDefault = defineLLMDefault(sequelize, SCHEMA);
const AuditLog = defineAuditLog(sequelize, SCHEMA);

// AuditLog.persona_id is a plain string reference (no FK constraint).
// This ensures audit logs survive persona deletion with the original ID intact.

/** Extract plain table name string from Model.getTableName() (may return {tableName, schema} when schema is set). */
function plainTableName(model) {
  const t = model.getTableName();
  return typeof t === 'string' ? t : t.tableName;
}

// Tables owned by this schema — used for scoped setup/teardown
const OWNED_MODELS = [
  Persona,
  LLMDefault,
  AuditLog,
];

const OWNED_TABLE_NAMES = [
  plainTableName(AuditLog),
  plainTableName(LLMDefault),
  plainTableName(Persona),
];

export {
  sequelize,
  config,
  SCHEMA,
  Persona,
  LLMDefault,
  AuditLog,
  OWNED_MODELS,
  OWNED_TABLE_NAMES,
};
