import { getSequelize, getConfig } from "@internal/db_connection_sequelize";
import { dbSchema } from '../../../../common/config/database_schema.mjs';
import defineFigmaFile from "./FigmaFile.mjs";
import defineFigmaFileTag from "./FigmaFileTag.mjs";
import defineFigmaFileMetadata from "./FigmaFileMetadata.mjs";

const config = getConfig();
const sequelize = getSequelize();
const SCHEMA = config.schema;

const FigmaFile = defineFigmaFile(sequelize, SCHEMA);
const FigmaFileTag = defineFigmaFileTag(sequelize, SCHEMA);
const FigmaFileMetadata = defineFigmaFileMetadata(sequelize, SCHEMA);

/** Extract plain table name string from Model.getTableName() (may return {tableName, schema} when schema is set). */
function plainTableName(model) {
  const t = model.getTableName();
  return typeof t === "string" ? t : t.tableName;
}

const FK_FIGMA_FILE_ID = "figma_file_id";
const FK_TAG_ID = "tag_id";
const TAG_REF_TABLE = "figma_files_tags_ref";

// Many-to-Many: FigmaFile <-> FigmaFileTag (through join table)
FigmaFile.belongsToMany(FigmaFileTag, {
  through: TAG_REF_TABLE,
  foreignKey: FK_FIGMA_FILE_ID,
  otherKey: FK_TAG_ID,
  as: "tags",
  timestamps: true,
  uniqueKey: "uq_figma_file_tag",
});

FigmaFileTag.belongsToMany(FigmaFile, {
  through: TAG_REF_TABLE,
  foreignKey: FK_TAG_ID,
  otherKey: FK_FIGMA_FILE_ID,
  as: "figmaFiles",
  timestamps: true,
  uniqueKey: "uq_figma_file_tag",
});

// One-to-Many: FigmaFile -> FigmaFileMetadata
FigmaFile.hasMany(FigmaFileMetadata, {
  foreignKey: FK_FIGMA_FILE_ID,
  as: "metadata",
});

FigmaFileMetadata.belongsTo(FigmaFile, {
  foreignKey: FK_FIGMA_FILE_ID,
  as: "figmaFile",
});

// Tables owned by this schema — used for scoped setup/teardown
const OWNED_MODELS = [
  FigmaFile,
  FigmaFileTag,
  FigmaFileMetadata,
];
const OWNED_TABLE_NAMES = [
  TAG_REF_TABLE, // join table
  plainTableName(FigmaFileMetadata),
  plainTableName(FigmaFileTag),
  plainTableName(FigmaFile),
];

export {
  sequelize,
  config,
  SCHEMA,
  FigmaFile,
  FigmaFileTag,
  FigmaFileMetadata,
  OWNED_MODELS,
  OWNED_TABLE_NAMES,
};
