/**
 * Task Graph Sequelize Models Index
 *
 * Initializes all models and defines associations.
 *
 * @module models/index
 */

import { getSequelize, getConfig } from '@internal/db_connection_sequelize';
import { dbSchema } from '../../../../common/config/database_schema.mjs';

import defineTask from './Task.mjs';
import defineStep from './Step.mjs';
import defineDependency from './Dependency.mjs';
import defineCheckpoint from './Checkpoint.mjs';
import defineExecutionLog from './ExecutionLog.mjs';
import defineWorkflowExecution from './WorkflowExecution.mjs';
import defineFile from './File.mjs';
import defineNote from './Note.mjs';
import defineTaskTemplate from './TaskTemplate.mjs';
import defineFailedJob from './FailedJob.mjs';

export * from './enums.mjs';

const config = getConfig();
const sequelize = getSequelize();
const SCHEMA = config.schema;

// Initialize models
const TaskTemplate = defineTaskTemplate(sequelize, SCHEMA);
const Task = defineTask(sequelize, SCHEMA);
const Step = defineStep(sequelize, SCHEMA);
const Dependency = defineDependency(sequelize, SCHEMA);
const Checkpoint = defineCheckpoint(sequelize, SCHEMA);
const ExecutionLog = defineExecutionLog(sequelize, SCHEMA);
const WorkflowExecution = defineWorkflowExecution(sequelize, SCHEMA);
const File = defineFile(sequelize, SCHEMA);
const Note = defineNote(sequelize, SCHEMA);
const FailedJob = defineFailedJob(sequelize, SCHEMA);

// Common foreign key constants
const FK_TASK_ID = 'task_id';
const FK_STEP_ID = 'step_id';

// ============================================================================
// Associations
// ============================================================================

// Task -> TaskTemplate
Task.belongsTo(TaskTemplate, { as: 'template', foreignKey: 'templateId' });
TaskTemplate.hasMany(Task, { as: 'tasks', foreignKey: 'templateId' });

// Task -> Step (one-to-many)
Task.hasMany(Step, { as: 'steps', foreignKey: 'taskId' });
Step.belongsTo(Task, { as: 'task', foreignKey: 'taskId' });

// Task -> Checkpoint (one-to-many)
Task.hasMany(Checkpoint, { as: 'checkpoints', foreignKey: 'taskId' });
Checkpoint.belongsTo(Task, { as: 'task', foreignKey: 'taskId' });

// Task -> ExecutionLog (one-to-many)
Task.hasMany(ExecutionLog, { as: 'executionLogs', foreignKey: 'taskId' });
ExecutionLog.belongsTo(Task, { as: 'task', foreignKey: 'taskId' });

// Step -> ExecutionLog (one-to-many)
Step.hasMany(ExecutionLog, { as: 'executionLogs', foreignKey: 'stepId' });
ExecutionLog.belongsTo(Step, { as: 'step', foreignKey: 'stepId' });

// Task -> WorkflowExecution (one-to-many)
Task.hasMany(WorkflowExecution, { as: 'workflowExecutions', foreignKey: 'taskId' });
WorkflowExecution.belongsTo(Task, { as: 'task', foreignKey: 'taskId' });

// Task -> File (one-to-many)
Task.hasMany(File, { as: 'files', foreignKey: 'taskId' });
File.belongsTo(Task, { as: 'task', foreignKey: 'taskId' });

// Step -> File (one-to-many)
Step.hasMany(File, { as: 'files', foreignKey: 'stepId' });
File.belongsTo(Step, { as: 'step', foreignKey: 'stepId' });

// Task -> Note (one-to-many)
Task.hasMany(Note, { as: 'notes', foreignKey: 'taskId' });
Note.belongsTo(Task, { as: 'task', foreignKey: 'taskId' });

// Task -> Dependency (self-referential many-to-many)
// Prerequisites: tasks that must complete before this task
Task.belongsToMany(Task, {
  as: 'prerequisites',
  through: Dependency,
  foreignKey: 'dependentId',
  otherKey: 'prerequisiteId',
});

// Dependents: tasks that depend on this task
Task.belongsToMany(Task, {
  as: 'dependents',
  through: Dependency,
  foreignKey: 'prerequisiteId',
  otherKey: 'dependentId',
});

// ============================================================================
// Exports
// ============================================================================

/** Extract plain table name string from Model.getTableName() (may return {tableName, schema} when schema is set). */
function plainTableName(model) {
  const t = model.getTableName();
  return typeof t === 'string' ? t : t.tableName;
}

const OWNED_MODELS = [
  TaskTemplate,
  Task,
  Step,
  Dependency,
  Checkpoint,
  ExecutionLog,
  WorkflowExecution,
  File,
  Note,
  FailedJob,
];

const OWNED_TABLE_NAMES = [
  plainTableName(FailedJob),
  plainTableName(Note),
  plainTableName(File),
  plainTableName(WorkflowExecution),
  plainTableName(ExecutionLog),
  plainTableName(Checkpoint),
  plainTableName(Dependency),
  plainTableName(Step),
  plainTableName(Task),
  plainTableName(TaskTemplate),
];

export {
  sequelize,
  config,
  SCHEMA,
  FK_TASK_ID,
  FK_STEP_ID,
  OWNED_MODELS,
  OWNED_TABLE_NAMES,
  TaskTemplate,
  Task,
  Step,
  Dependency,
  Checkpoint,
  ExecutionLog,
  WorkflowExecution,
  File,
  Note,
  FailedJob,
};
