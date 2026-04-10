/**
 * Task Graph Protobuf
 *
 * Protocol Buffer definitions for task-graph serialization
 *
 * @module index
 */

import protobuf from 'protobufjs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROTO_PATH = join(__dirname, '..', 'proto', 'task_graph.proto');

let root = null;
let types = null;

/**
 * Load the protobuf definitions
 */
export async function loadProto() {
  if (root) {
    return types;
  }

  root = await protobuf.load(PROTO_PATH);

  types = {
    // Enums
    TaskStatus: root.lookupEnum('taskgraph.TaskStatus'),
    StepStatus: root.lookupEnum('taskgraph.StepStatus'),
    WorkflowStatus: root.lookupEnum('taskgraph.WorkflowStatus'),
    RepeatInterval: root.lookupEnum('taskgraph.RepeatInterval'),

    // Task messages
    Task: root.lookupType('taskgraph.Task'),
    CreateTaskRequest: root.lookupType('taskgraph.CreateTaskRequest'),
    UpdateTaskRequest: root.lookupType('taskgraph.UpdateTaskRequest'),
    GetTaskRequest: root.lookupType('taskgraph.GetTaskRequest'),
    ListTasksRequest: root.lookupType('taskgraph.ListTasksRequest'),
    ListTasksResponse: root.lookupType('taskgraph.ListTasksResponse'),
    TaskResponse: root.lookupType('taskgraph.TaskResponse'),

    // Step messages
    Step: root.lookupType('taskgraph.Step'),
    CreateStepRequest: root.lookupType('taskgraph.CreateStepRequest'),
    ListStepsResponse: root.lookupType('taskgraph.ListStepsResponse'),

    // Dependency messages
    Dependency: root.lookupType('taskgraph.Dependency'),
    CreateDependencyRequest: root.lookupType('taskgraph.CreateDependencyRequest'),
    DependencyGraph: root.lookupType('taskgraph.DependencyGraph'),
    DependencyGraphNode: root.lookupType('taskgraph.DependencyGraphNode'),
    DependencyEdge: root.lookupType('taskgraph.DependencyEdge'),

    // Checkpoint messages
    Checkpoint: root.lookupType('taskgraph.Checkpoint'),
    SaveCheckpointRequest: root.lookupType('taskgraph.SaveCheckpointRequest'),
    RestoreCheckpointRequest: root.lookupType('taskgraph.RestoreCheckpointRequest'),

    // Execution log messages
    ExecutionLog: root.lookupType('taskgraph.ExecutionLog'),
    ListExecutionLogsRequest: root.lookupType('taskgraph.ListExecutionLogsRequest'),
    ListExecutionLogsResponse: root.lookupType('taskgraph.ListExecutionLogsResponse'),

    // Workflow messages
    WorkflowExecution: root.lookupType('taskgraph.WorkflowExecution'),
    StartWorkflowRequest: root.lookupType('taskgraph.StartWorkflowRequest'),
    WorkflowStatusResponse: root.lookupType('taskgraph.WorkflowStatusResponse'),
    WorkflowProgress: root.lookupType('taskgraph.WorkflowProgress'),

    // Common messages
    Pagination: root.lookupType('taskgraph.Pagination'),
    Error: root.lookupType('taskgraph.Error'),
    SuccessResponse: root.lookupType('taskgraph.SuccessResponse'),
  };

  return types;
}

/**
 * Encode a message to a buffer
 */
export async function encode(typeName, data) {
  const protoTypes = await loadProto();
  const Type = protoTypes[typeName];
  if (!Type) {
    throw new Error(`Unknown type: ${typeName}`);
  }
  const message = Type.create(data);
  return Type.encode(message).finish();
}

/**
 * Decode a buffer to a message
 */
export async function decode(typeName, buffer) {
  const protoTypes = await loadProto();
  const Type = protoTypes[typeName];
  if (!Type) {
    throw new Error(`Unknown type: ${typeName}`);
  }
  return Type.decode(buffer);
}

/**
 * Convert a message to JSON
 */
export async function toJSON(typeName, data) {
  const protoTypes = await loadProto();
  const Type = protoTypes[typeName];
  if (!Type) {
    throw new Error(`Unknown type: ${typeName}`);
  }
  const message = Type.create(data);
  return Type.toObject(message, {
    longs: String,
    enums: String,
    bytes: String,
    defaults: true,
  });
}

/**
 * Convert JSON to a message
 */
export async function fromJSON(typeName, json) {
  const protoTypes = await loadProto();
  const Type = protoTypes[typeName];
  if (!Type) {
    throw new Error(`Unknown type: ${typeName}`);
  }
  return Type.fromObject(json);
}

export { types };
