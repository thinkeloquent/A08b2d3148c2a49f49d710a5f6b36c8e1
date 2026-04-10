import { getSequelize, getConfig } from "@internal/db_connection_sequelize";
import { dbSchema } from '../../../../common/config/database_schema.mjs';
import defineComment from "./Comment.mjs";
import defineCommentReply from "./CommentReply.mjs";
import definePinnedNode from "./PinnedNode.mjs";
import defineNodeLabel from "./NodeLabel.mjs";

const config = getConfig();
const sequelize = getSequelize();
const SCHEMA = config.schema;

const Comment = defineComment(sequelize, SCHEMA);
const CommentReply = defineCommentReply(sequelize, SCHEMA);
const PinnedNode = definePinnedNode(sequelize, SCHEMA);
const NodeLabel = defineNodeLabel(sequelize, SCHEMA);

// Associations: Comment -> CommentReply
Comment.hasMany(CommentReply, {
  foreignKey: "comment_id",
  as: "replies",
});
CommentReply.belongsTo(Comment, {
  foreignKey: "comment_id",
  as: "comment",
});

// Models owned by this schema — used for scoped setup/teardown
// Order matters for sync (parents first) and drop (children first)
const OWNED_MODELS = [Comment, CommentReply, PinnedNode, NodeLabel];

const OWNED_TABLE_NAMES = [
  dbSchema.tableName("figma_component_inspector_comment_replies"),
  dbSchema.tableName("figma_component_inspector_comments"),
  dbSchema.tableName("figma_component_inspector_pinned_nodes"),
  dbSchema.tableName("figma_component_inspector_node_labels"),
];

export {
  sequelize,
  config,
  SCHEMA,
  Comment,
  CommentReply,
  PinnedNode,
  NodeLabel,
  OWNED_MODELS,
  OWNED_TABLE_NAMES,
};
