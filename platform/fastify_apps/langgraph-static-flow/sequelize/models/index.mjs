import { getSequelize, getConfig } from '@internal/db_connection_sequelize';
import { dbSchema } from '../../../../common/config/database_schema.mjs';
import defineFlow from './Flow.mjs';
import defineFlowVersion from './FlowVersion.mjs';
import defineWorkflowSession from './WorkflowSession.mjs';
import defineStringTemplate from './StringTemplate.mjs';
import defineKvStore from './KvStore.mjs';
import defineWorkflowTemplate from './WorkflowTemplate.mjs';

const config = getConfig();
const sequelize = getSequelize();
const SCHEMA = config.schema;

const Flow = defineFlow(sequelize, SCHEMA);
const FlowVersion = defineFlowVersion(sequelize, SCHEMA);
const WorkflowSession = defineWorkflowSession(sequelize, SCHEMA);
const StringTemplate = defineStringTemplate(sequelize, SCHEMA);
const KvStore = defineKvStore(sequelize, SCHEMA);
const WorkflowTemplate = defineWorkflowTemplate(sequelize, SCHEMA);

function plainTableName(model) {
  const t = model.getTableName();
  return typeof t === 'string' ? t : t.tableName;
}

// One-to-Many: Flow -> FlowVersion
Flow.hasMany(FlowVersion, {
  foreignKey: 'flow_id',
  as: 'versions',
  onDelete: 'CASCADE',
});

FlowVersion.belongsTo(Flow, {
  foreignKey: 'flow_id',
  as: 'flow',
});

// One-to-Many: Flow -> WorkflowSession
Flow.hasMany(WorkflowSession, {
  foreignKey: 'flow_id',
  as: 'sessions',
  onDelete: 'CASCADE',
});

WorkflowSession.belongsTo(Flow, {
  foreignKey: 'flow_id',
  as: 'flow',
});

// One-to-Many: Flow -> StringTemplate (nullable FK — SET NULL on delete)
Flow.hasMany(StringTemplate, {
  foreignKey: 'flow_id',
  as: 'string_templates',
  onDelete: 'SET NULL',
});

StringTemplate.belongsTo(Flow, {
  foreignKey: 'flow_id',
  as: 'flow',
});

const OWNED_MODELS = [Flow, FlowVersion, WorkflowSession, StringTemplate, KvStore, WorkflowTemplate];

const OWNED_TABLE_NAMES = [
  plainTableName(FlowVersion),
  plainTableName(WorkflowSession),
  plainTableName(StringTemplate),
  plainTableName(WorkflowTemplate),
  plainTableName(Flow),
];

export {
  sequelize,
  config,
  SCHEMA,
  Flow,
  FlowVersion,
  WorkflowSession,
  StringTemplate,
  KvStore,
  WorkflowTemplate,
  OWNED_MODELS,
  OWNED_TABLE_NAMES,
};
