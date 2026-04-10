import { getSequelize, getConfig } from "@internal/db_connection_sequelize";
import { dbSchema } from '../../../../common/config/database_schema.mjs';
import defineCodeRepository from "./CodeRepository.mjs";
import defineCodeRepositoryTag from "./CodeRepositoryTag.mjs";
import defineCodeRepositoryMetadata from "./CodeRepositoryMetadata.mjs";

const config = getConfig();
const sequelize = getSequelize();
const SCHEMA = config.schema;

const CodeRepository = defineCodeRepository(sequelize, SCHEMA);
const CodeRepositoryTag = defineCodeRepositoryTag(sequelize, SCHEMA);
const CodeRepositoryMetadata = defineCodeRepositoryMetadata(sequelize, SCHEMA);

/** Extract plain table name string from Model.getTableName() (may return {tableName, schema} when schema is set). */
function plainTableName(model) {
  const t = model.getTableName();
  return typeof t === "string" ? t : t.tableName;
}

const FK_REPOSITORY_ID = "repository_id";
const FK_TAG_ID = "tag_id";
const TAG_REF_TABLE = `${plainTableName(CodeRepositoryTag)}_ref`;

// Many-to-Many: CodeRepository <-> CodeRepositoryTag (through join table)
CodeRepository.belongsToMany(CodeRepositoryTag, {
  through: TAG_REF_TABLE,
  foreignKey: FK_REPOSITORY_ID,
  otherKey: FK_TAG_ID,
  as: "tags",
  timestamps: true,
  uniqueKey: "uq_repository_tag",
});

CodeRepositoryTag.belongsToMany(CodeRepository, {
  through: TAG_REF_TABLE,
  foreignKey: FK_TAG_ID,
  otherKey: FK_REPOSITORY_ID,
  as: "repositories",
  timestamps: true,
  uniqueKey: "uq_repository_tag",
});

// One-to-Many: CodeRepository -> CodeRepositoryMetadata
CodeRepository.hasMany(CodeRepositoryMetadata, {
  foreignKey: FK_REPOSITORY_ID,
  as: "metadata",
});

CodeRepositoryMetadata.belongsTo(CodeRepository, {
  foreignKey: FK_REPOSITORY_ID,
  as: "repository",
});

// Tables owned by this schema — used for scoped setup/teardown
const OWNED_MODELS = [
  CodeRepository,
  CodeRepositoryTag,
  CodeRepositoryMetadata,
];
const OWNED_TABLE_NAMES = [
  TAG_REF_TABLE, // join table
  plainTableName(CodeRepositoryMetadata),
  plainTableName(CodeRepositoryTag),
  plainTableName(CodeRepository),
];

export {
  sequelize,
  config,
  SCHEMA,
  CodeRepository,
  CodeRepositoryTag,
  CodeRepositoryMetadata,
  OWNED_MODELS,
  OWNED_TABLE_NAMES,
};
