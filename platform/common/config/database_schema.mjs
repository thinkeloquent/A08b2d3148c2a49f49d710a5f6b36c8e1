/**
 * Shared Sequelize model configuration loader.
 *
 * Usage in a model file:
 *   import { dbSchema } from '../../../common/config/database_schema.mjs';
 *
 *   const TABLE = dbSchema.tableName('persona_editor_personas');
 *   // → "mta_persona_editor_personas"
 *
 *   sequelize.define('Persona', { ... }, {
 *     tableName: TABLE,
 *     schema: dbSchema.schemaFor(appSchema),
 *     ...dbSchema.defineDefaults,
 *   });
 */

/**
 * Configuration values matching database_schema.yaml.
 * Inlined to avoid a js-yaml dependency.
 */
const RAW = Object.freeze({
  table_prefix: 'mta_',
  fallback_schema: 'public',
  define_defaults: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  },
  primary_key: {
    type: 'UUID',
    default_value: 'UUIDV4',
    allow_null: false,
  },
});

/** Pre-built Sequelize define defaults. */
const defineDefaults = Object.freeze({ ...RAW.define_defaults });

/**
 * Prefix a bare table name with the global prefix.
 * If the name already starts with the prefix it is returned as-is.
 *
 * @param {string} name - e.g. "persona_editor_personas"
 * @returns {string}    - e.g. "mta_persona_editor_personas"
 */
function tableName(name) {
  const prefix = RAW.table_prefix;
  return name.startsWith(prefix) ? name : `${prefix}${name}`;
}

/**
 * Return the schema to use.
 * Falls back to the YAML-defined fallback_schema when none is provided.
 *
 * @param {string|undefined} schema - app-specific schema override
 * @returns {string}
 */
function schemaFor(schema) {
  return schema || RAW.fallback_schema;
}

const dbSchema = Object.freeze({
  /** Raw config values */
  raw: RAW,
  /** Global table-name prefix */
  tablePrefix: RAW.table_prefix,
  /** Fallback Postgres schema */
  fallbackSchema: RAW.fallback_schema,
  /** Spread-ready Sequelize define options */
  defineDefaults,
  /** Prefix a table name */
  tableName,
  /** Resolve schema with fallback */
  schemaFor,
});

export { dbSchema };
export default dbSchema;
