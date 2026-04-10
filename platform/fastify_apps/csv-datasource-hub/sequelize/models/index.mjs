import { getSequelize, getConfig } from "@internal/db_connection_sequelize";
import { dbSchema } from '../../../../common/config/database_schema.mjs';
import defineCsvDatasource from "./CsvDatasource.mjs";
import defineCsvDatasourceTag from "./CsvDatasourceTag.mjs";
import defineCsvDatasourceLabel from "./CsvDatasourceLabel.mjs";
import defineCsvInstance from "./CsvInstance.mjs";
import defineCsvPayload from "./CsvPayload.mjs";

const config = getConfig();
const sequelize = getSequelize();
const SCHEMA = config.schema;

const CsvDatasource = defineCsvDatasource(sequelize, SCHEMA);
const CsvDatasourceTag = defineCsvDatasourceTag(sequelize, SCHEMA);
const CsvDatasourceLabel = defineCsvDatasourceLabel(sequelize, SCHEMA);
const CsvInstance = defineCsvInstance(sequelize, SCHEMA);
const CsvPayload = defineCsvPayload(sequelize, SCHEMA);

/** Extract plain table name string from Model.getTableName() */
function plainTableName(model) {
  const t = model.getTableName();
  return typeof t === 'string' ? t : t.tableName;
}

// M:N — Datasource <-> Tag (through junction table)
const FK_DATASOURCE_ID = 'datasource_id';
const FK_TAG_ID = 'tag_id';
const TAG_REF_TABLE = `${plainTableName(CsvDatasourceTag)}_ref`;

CsvDatasource.belongsToMany(CsvDatasourceTag, {
  through: TAG_REF_TABLE,
  foreignKey: FK_DATASOURCE_ID,
  otherKey: FK_TAG_ID,
  as: 'tags',
  timestamps: true,
  uniqueKey: 'uq_csv_dh_datasource_tag',
});

CsvDatasourceTag.belongsToMany(CsvDatasource, {
  through: TAG_REF_TABLE,
  foreignKey: FK_TAG_ID,
  otherKey: FK_DATASOURCE_ID,
  as: 'datasources',
  timestamps: true,
  uniqueKey: 'uq_csv_dh_datasource_tag',
});

// 1:N — Datasource -> Labels
CsvDatasource.hasMany(CsvDatasourceLabel, {
  foreignKey: 'datasource_id',
  as: 'labels',
  onDelete: 'CASCADE',
});
CsvDatasourceLabel.belongsTo(CsvDatasource, {
  foreignKey: 'datasource_id',
  as: 'datasource',
});

// 1:N — Datasource -> Instances
CsvDatasource.hasMany(CsvInstance, {
  foreignKey: 'datasource_id',
  as: 'instances',
  onDelete: 'CASCADE',
});
CsvInstance.belongsTo(CsvDatasource, {
  foreignKey: 'datasource_id',
  as: 'datasource',
});

// 1:N — Instance -> Payloads
CsvInstance.hasMany(CsvPayload, {
  foreignKey: 'instance_id',
  as: 'payloads',
  onDelete: 'CASCADE',
});
CsvPayload.belongsTo(CsvInstance, {
  foreignKey: 'instance_id',
  as: 'instance',
});

const OWNED_MODELS = [
  CsvDatasource,
  CsvDatasourceTag,
  CsvDatasourceLabel,
  CsvInstance,
  CsvPayload,
];

// Drop order: children first (reverse dependency)
const OWNED_TABLE_NAMES = [
  plainTableName(CsvPayload),
  plainTableName(CsvInstance),
  plainTableName(CsvDatasourceLabel),
  TAG_REF_TABLE,
  plainTableName(CsvDatasourceTag),
  plainTableName(CsvDatasource),
];

export {
  sequelize,
  config,
  SCHEMA,
  CsvDatasource,
  CsvDatasourceTag,
  CsvDatasourceLabel,
  CsvInstance,
  CsvPayload,
  OWNED_MODELS,
  OWNED_TABLE_NAMES,
};
