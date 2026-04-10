/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const taskgraph = $root.taskgraph = (() => {

    /**
     * Namespace taskgraph.
     * @exports taskgraph
     * @namespace
     */
    const taskgraph = {};

    /**
     * TaskStatus enum.
     * @name taskgraph.TaskStatus
     * @enum {number}
     * @property {number} TASK_STATUS_UNSPECIFIED=0 TASK_STATUS_UNSPECIFIED value
     * @property {number} TASK_STATUS_PENDING=1 TASK_STATUS_PENDING value
     * @property {number} TASK_STATUS_TODO=2 TASK_STATUS_TODO value
     * @property {number} TASK_STATUS_IN_PROGRESS=3 TASK_STATUS_IN_PROGRESS value
     * @property {number} TASK_STATUS_DONE=4 TASK_STATUS_DONE value
     * @property {number} TASK_STATUS_BLOCKED=5 TASK_STATUS_BLOCKED value
     * @property {number} TASK_STATUS_SKIPPED=6 TASK_STATUS_SKIPPED value
     * @property {number} TASK_STATUS_RETRYING=7 TASK_STATUS_RETRYING value
     * @property {number} TASK_STATUS_FAILED=8 TASK_STATUS_FAILED value
     */
    taskgraph.TaskStatus = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "TASK_STATUS_UNSPECIFIED"] = 0;
        values[valuesById[1] = "TASK_STATUS_PENDING"] = 1;
        values[valuesById[2] = "TASK_STATUS_TODO"] = 2;
        values[valuesById[3] = "TASK_STATUS_IN_PROGRESS"] = 3;
        values[valuesById[4] = "TASK_STATUS_DONE"] = 4;
        values[valuesById[5] = "TASK_STATUS_BLOCKED"] = 5;
        values[valuesById[6] = "TASK_STATUS_SKIPPED"] = 6;
        values[valuesById[7] = "TASK_STATUS_RETRYING"] = 7;
        values[valuesById[8] = "TASK_STATUS_FAILED"] = 8;
        return values;
    })();

    /**
     * StepStatus enum.
     * @name taskgraph.StepStatus
     * @enum {number}
     * @property {number} STEP_STATUS_UNSPECIFIED=0 STEP_STATUS_UNSPECIFIED value
     * @property {number} STEP_STATUS_PENDING=1 STEP_STATUS_PENDING value
     * @property {number} STEP_STATUS_IN_PROGRESS=2 STEP_STATUS_IN_PROGRESS value
     * @property {number} STEP_STATUS_COMPLETED=3 STEP_STATUS_COMPLETED value
     * @property {number} STEP_STATUS_SKIPPED=4 STEP_STATUS_SKIPPED value
     * @property {number} STEP_STATUS_BLOCKED=5 STEP_STATUS_BLOCKED value
     */
    taskgraph.StepStatus = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "STEP_STATUS_UNSPECIFIED"] = 0;
        values[valuesById[1] = "STEP_STATUS_PENDING"] = 1;
        values[valuesById[2] = "STEP_STATUS_IN_PROGRESS"] = 2;
        values[valuesById[3] = "STEP_STATUS_COMPLETED"] = 3;
        values[valuesById[4] = "STEP_STATUS_SKIPPED"] = 4;
        values[valuesById[5] = "STEP_STATUS_BLOCKED"] = 5;
        return values;
    })();

    /**
     * WorkflowStatus enum.
     * @name taskgraph.WorkflowStatus
     * @enum {number}
     * @property {number} WORKFLOW_STATUS_UNSPECIFIED=0 WORKFLOW_STATUS_UNSPECIFIED value
     * @property {number} WORKFLOW_STATUS_PENDING=1 WORKFLOW_STATUS_PENDING value
     * @property {number} WORKFLOW_STATUS_RUNNING=2 WORKFLOW_STATUS_RUNNING value
     * @property {number} WORKFLOW_STATUS_PAUSED=3 WORKFLOW_STATUS_PAUSED value
     * @property {number} WORKFLOW_STATUS_COMPLETED=4 WORKFLOW_STATUS_COMPLETED value
     * @property {number} WORKFLOW_STATUS_FAILED=5 WORKFLOW_STATUS_FAILED value
     * @property {number} WORKFLOW_STATUS_CANCELLED=6 WORKFLOW_STATUS_CANCELLED value
     */
    taskgraph.WorkflowStatus = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "WORKFLOW_STATUS_UNSPECIFIED"] = 0;
        values[valuesById[1] = "WORKFLOW_STATUS_PENDING"] = 1;
        values[valuesById[2] = "WORKFLOW_STATUS_RUNNING"] = 2;
        values[valuesById[3] = "WORKFLOW_STATUS_PAUSED"] = 3;
        values[valuesById[4] = "WORKFLOW_STATUS_COMPLETED"] = 4;
        values[valuesById[5] = "WORKFLOW_STATUS_FAILED"] = 5;
        values[valuesById[6] = "WORKFLOW_STATUS_CANCELLED"] = 6;
        return values;
    })();

    /**
     * RepeatInterval enum.
     * @name taskgraph.RepeatInterval
     * @enum {number}
     * @property {number} REPEAT_INTERVAL_UNSPECIFIED=0 REPEAT_INTERVAL_UNSPECIFIED value
     * @property {number} REPEAT_INTERVAL_NONE=1 REPEAT_INTERVAL_NONE value
     * @property {number} REPEAT_INTERVAL_DAILY=2 REPEAT_INTERVAL_DAILY value
     * @property {number} REPEAT_INTERVAL_WEEKLY=3 REPEAT_INTERVAL_WEEKLY value
     * @property {number} REPEAT_INTERVAL_MONTHLY=4 REPEAT_INTERVAL_MONTHLY value
     */
    taskgraph.RepeatInterval = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "REPEAT_INTERVAL_UNSPECIFIED"] = 0;
        values[valuesById[1] = "REPEAT_INTERVAL_NONE"] = 1;
        values[valuesById[2] = "REPEAT_INTERVAL_DAILY"] = 2;
        values[valuesById[3] = "REPEAT_INTERVAL_WEEKLY"] = 3;
        values[valuesById[4] = "REPEAT_INTERVAL_MONTHLY"] = 4;
        return values;
    })();

    taskgraph.Task = (function() {

        /**
         * Properties of a Task.
         * @memberof taskgraph
         * @interface ITask
         * @property {string|null} [id] Task id
         * @property {string|null} [idempotencyKey] Task idempotencyKey
         * @property {string|null} [title] Task title
         * @property {string|null} [description] Task description
         * @property {taskgraph.TaskStatus|null} [status] Task status
         * @property {string|null} [dueDate] Task dueDate
         * @property {taskgraph.RepeatInterval|null} [repeatInterval] Task repeatInterval
         * @property {number|null} [retryCount] Task retryCount
         * @property {number|null} [maxRetries] Task maxRetries
         * @property {string|null} [skipReason] Task skipReason
         * @property {Object.<string,string>|null} [metadata] Task metadata
         * @property {string|null} [createdAt] Task createdAt
         * @property {string|null} [updatedAt] Task updatedAt
         * @property {string|null} [creatorId] Task creatorId
         * @property {string|null} [assignedToId] Task assignedToId
         * @property {string|null} [templateId] Task templateId
         * @property {number|null} [stepsCount] Task stepsCount
         * @property {number|null} [prerequisitesCount] Task prerequisitesCount
         * @property {number|null} [dependentsCount] Task dependentsCount
         */

        /**
         * Constructs a new Task.
         * @memberof taskgraph
         * @classdesc Represents a Task.
         * @implements ITask
         * @constructor
         * @param {taskgraph.ITask=} [properties] Properties to set
         */
        function Task(properties) {
            this.metadata = {};
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Task id.
         * @member {string} id
         * @memberof taskgraph.Task
         * @instance
         */
        Task.prototype.id = "";

        /**
         * Task idempotencyKey.
         * @member {string|null|undefined} idempotencyKey
         * @memberof taskgraph.Task
         * @instance
         */
        Task.prototype.idempotencyKey = null;

        /**
         * Task title.
         * @member {string} title
         * @memberof taskgraph.Task
         * @instance
         */
        Task.prototype.title = "";

        /**
         * Task description.
         * @member {string|null|undefined} description
         * @memberof taskgraph.Task
         * @instance
         */
        Task.prototype.description = null;

        /**
         * Task status.
         * @member {taskgraph.TaskStatus} status
         * @memberof taskgraph.Task
         * @instance
         */
        Task.prototype.status = 0;

        /**
         * Task dueDate.
         * @member {string|null|undefined} dueDate
         * @memberof taskgraph.Task
         * @instance
         */
        Task.prototype.dueDate = null;

        /**
         * Task repeatInterval.
         * @member {taskgraph.RepeatInterval} repeatInterval
         * @memberof taskgraph.Task
         * @instance
         */
        Task.prototype.repeatInterval = 0;

        /**
         * Task retryCount.
         * @member {number} retryCount
         * @memberof taskgraph.Task
         * @instance
         */
        Task.prototype.retryCount = 0;

        /**
         * Task maxRetries.
         * @member {number} maxRetries
         * @memberof taskgraph.Task
         * @instance
         */
        Task.prototype.maxRetries = 0;

        /**
         * Task skipReason.
         * @member {string|null|undefined} skipReason
         * @memberof taskgraph.Task
         * @instance
         */
        Task.prototype.skipReason = null;

        /**
         * Task metadata.
         * @member {Object.<string,string>} metadata
         * @memberof taskgraph.Task
         * @instance
         */
        Task.prototype.metadata = $util.emptyObject;

        /**
         * Task createdAt.
         * @member {string} createdAt
         * @memberof taskgraph.Task
         * @instance
         */
        Task.prototype.createdAt = "";

        /**
         * Task updatedAt.
         * @member {string} updatedAt
         * @memberof taskgraph.Task
         * @instance
         */
        Task.prototype.updatedAt = "";

        /**
         * Task creatorId.
         * @member {string|null|undefined} creatorId
         * @memberof taskgraph.Task
         * @instance
         */
        Task.prototype.creatorId = null;

        /**
         * Task assignedToId.
         * @member {string|null|undefined} assignedToId
         * @memberof taskgraph.Task
         * @instance
         */
        Task.prototype.assignedToId = null;

        /**
         * Task templateId.
         * @member {string|null|undefined} templateId
         * @memberof taskgraph.Task
         * @instance
         */
        Task.prototype.templateId = null;

        /**
         * Task stepsCount.
         * @member {number} stepsCount
         * @memberof taskgraph.Task
         * @instance
         */
        Task.prototype.stepsCount = 0;

        /**
         * Task prerequisitesCount.
         * @member {number} prerequisitesCount
         * @memberof taskgraph.Task
         * @instance
         */
        Task.prototype.prerequisitesCount = 0;

        /**
         * Task dependentsCount.
         * @member {number} dependentsCount
         * @memberof taskgraph.Task
         * @instance
         */
        Task.prototype.dependentsCount = 0;

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(Task.prototype, "_idempotencyKey", {
            get: $util.oneOfGetter($oneOfFields = ["idempotencyKey"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(Task.prototype, "_description", {
            get: $util.oneOfGetter($oneOfFields = ["description"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(Task.prototype, "_dueDate", {
            get: $util.oneOfGetter($oneOfFields = ["dueDate"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(Task.prototype, "_skipReason", {
            get: $util.oneOfGetter($oneOfFields = ["skipReason"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(Task.prototype, "_creatorId", {
            get: $util.oneOfGetter($oneOfFields = ["creatorId"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(Task.prototype, "_assignedToId", {
            get: $util.oneOfGetter($oneOfFields = ["assignedToId"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(Task.prototype, "_templateId", {
            get: $util.oneOfGetter($oneOfFields = ["templateId"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new Task instance using the specified properties.
         * @function create
         * @memberof taskgraph.Task
         * @static
         * @param {taskgraph.ITask=} [properties] Properties to set
         * @returns {taskgraph.Task} Task instance
         */
        Task.create = function create(properties) {
            return new Task(properties);
        };

        /**
         * Encodes the specified Task message. Does not implicitly {@link taskgraph.Task.verify|verify} messages.
         * @function encode
         * @memberof taskgraph.Task
         * @static
         * @param {taskgraph.ITask} message Task message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Task.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.idempotencyKey != null && Object.hasOwnProperty.call(message, "idempotencyKey"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.idempotencyKey);
            if (message.title != null && Object.hasOwnProperty.call(message, "title"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.title);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.description);
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 5, wireType 0 =*/40).int32(message.status);
            if (message.dueDate != null && Object.hasOwnProperty.call(message, "dueDate"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.dueDate);
            if (message.repeatInterval != null && Object.hasOwnProperty.call(message, "repeatInterval"))
                writer.uint32(/* id 7, wireType 0 =*/56).int32(message.repeatInterval);
            if (message.retryCount != null && Object.hasOwnProperty.call(message, "retryCount"))
                writer.uint32(/* id 8, wireType 0 =*/64).int32(message.retryCount);
            if (message.maxRetries != null && Object.hasOwnProperty.call(message, "maxRetries"))
                writer.uint32(/* id 9, wireType 0 =*/72).int32(message.maxRetries);
            if (message.skipReason != null && Object.hasOwnProperty.call(message, "skipReason"))
                writer.uint32(/* id 10, wireType 2 =*/82).string(message.skipReason);
            if (message.metadata != null && Object.hasOwnProperty.call(message, "metadata"))
                for (let keys = Object.keys(message.metadata), i = 0; i < keys.length; ++i)
                    writer.uint32(/* id 11, wireType 2 =*/90).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]).uint32(/* id 2, wireType 2 =*/18).string(message.metadata[keys[i]]).ldelim();
            if (message.createdAt != null && Object.hasOwnProperty.call(message, "createdAt"))
                writer.uint32(/* id 12, wireType 2 =*/98).string(message.createdAt);
            if (message.updatedAt != null && Object.hasOwnProperty.call(message, "updatedAt"))
                writer.uint32(/* id 13, wireType 2 =*/106).string(message.updatedAt);
            if (message.creatorId != null && Object.hasOwnProperty.call(message, "creatorId"))
                writer.uint32(/* id 14, wireType 2 =*/114).string(message.creatorId);
            if (message.assignedToId != null && Object.hasOwnProperty.call(message, "assignedToId"))
                writer.uint32(/* id 15, wireType 2 =*/122).string(message.assignedToId);
            if (message.templateId != null && Object.hasOwnProperty.call(message, "templateId"))
                writer.uint32(/* id 16, wireType 2 =*/130).string(message.templateId);
            if (message.stepsCount != null && Object.hasOwnProperty.call(message, "stepsCount"))
                writer.uint32(/* id 17, wireType 0 =*/136).int32(message.stepsCount);
            if (message.prerequisitesCount != null && Object.hasOwnProperty.call(message, "prerequisitesCount"))
                writer.uint32(/* id 18, wireType 0 =*/144).int32(message.prerequisitesCount);
            if (message.dependentsCount != null && Object.hasOwnProperty.call(message, "dependentsCount"))
                writer.uint32(/* id 19, wireType 0 =*/152).int32(message.dependentsCount);
            return writer;
        };

        /**
         * Encodes the specified Task message, length delimited. Does not implicitly {@link taskgraph.Task.verify|verify} messages.
         * @function encodeDelimited
         * @memberof taskgraph.Task
         * @static
         * @param {taskgraph.ITask} message Task message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Task.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Task message from the specified reader or buffer.
         * @function decode
         * @memberof taskgraph.Task
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {taskgraph.Task} Task
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Task.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.taskgraph.Task(), key, value;
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.id = reader.string();
                        break;
                    }
                case 2: {
                        message.idempotencyKey = reader.string();
                        break;
                    }
                case 3: {
                        message.title = reader.string();
                        break;
                    }
                case 4: {
                        message.description = reader.string();
                        break;
                    }
                case 5: {
                        message.status = reader.int32();
                        break;
                    }
                case 6: {
                        message.dueDate = reader.string();
                        break;
                    }
                case 7: {
                        message.repeatInterval = reader.int32();
                        break;
                    }
                case 8: {
                        message.retryCount = reader.int32();
                        break;
                    }
                case 9: {
                        message.maxRetries = reader.int32();
                        break;
                    }
                case 10: {
                        message.skipReason = reader.string();
                        break;
                    }
                case 11: {
                        if (message.metadata === $util.emptyObject)
                            message.metadata = {};
                        let end2 = reader.uint32() + reader.pos;
                        key = "";
                        value = "";
                        while (reader.pos < end2) {
                            let tag2 = reader.uint32();
                            switch (tag2 >>> 3) {
                            case 1:
                                key = reader.string();
                                break;
                            case 2:
                                value = reader.string();
                                break;
                            default:
                                reader.skipType(tag2 & 7);
                                break;
                            }
                        }
                        message.metadata[key] = value;
                        break;
                    }
                case 12: {
                        message.createdAt = reader.string();
                        break;
                    }
                case 13: {
                        message.updatedAt = reader.string();
                        break;
                    }
                case 14: {
                        message.creatorId = reader.string();
                        break;
                    }
                case 15: {
                        message.assignedToId = reader.string();
                        break;
                    }
                case 16: {
                        message.templateId = reader.string();
                        break;
                    }
                case 17: {
                        message.stepsCount = reader.int32();
                        break;
                    }
                case 18: {
                        message.prerequisitesCount = reader.int32();
                        break;
                    }
                case 19: {
                        message.dependentsCount = reader.int32();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Task message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof taskgraph.Task
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {taskgraph.Task} Task
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Task.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Task message.
         * @function verify
         * @memberof taskgraph.Task
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Task.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.idempotencyKey != null && message.hasOwnProperty("idempotencyKey")) {
                properties._idempotencyKey = 1;
                if (!$util.isString(message.idempotencyKey))
                    return "idempotencyKey: string expected";
            }
            if (message.title != null && message.hasOwnProperty("title"))
                if (!$util.isString(message.title))
                    return "title: string expected";
            if (message.description != null && message.hasOwnProperty("description")) {
                properties._description = 1;
                if (!$util.isString(message.description))
                    return "description: string expected";
            }
            if (message.status != null && message.hasOwnProperty("status"))
                switch (message.status) {
                default:
                    return "status: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                    break;
                }
            if (message.dueDate != null && message.hasOwnProperty("dueDate")) {
                properties._dueDate = 1;
                if (!$util.isString(message.dueDate))
                    return "dueDate: string expected";
            }
            if (message.repeatInterval != null && message.hasOwnProperty("repeatInterval"))
                switch (message.repeatInterval) {
                default:
                    return "repeatInterval: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                    break;
                }
            if (message.retryCount != null && message.hasOwnProperty("retryCount"))
                if (!$util.isInteger(message.retryCount))
                    return "retryCount: integer expected";
            if (message.maxRetries != null && message.hasOwnProperty("maxRetries"))
                if (!$util.isInteger(message.maxRetries))
                    return "maxRetries: integer expected";
            if (message.skipReason != null && message.hasOwnProperty("skipReason")) {
                properties._skipReason = 1;
                if (!$util.isString(message.skipReason))
                    return "skipReason: string expected";
            }
            if (message.metadata != null && message.hasOwnProperty("metadata")) {
                if (!$util.isObject(message.metadata))
                    return "metadata: object expected";
                let key = Object.keys(message.metadata);
                for (let i = 0; i < key.length; ++i)
                    if (!$util.isString(message.metadata[key[i]]))
                        return "metadata: string{k:string} expected";
            }
            if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                if (!$util.isString(message.createdAt))
                    return "createdAt: string expected";
            if (message.updatedAt != null && message.hasOwnProperty("updatedAt"))
                if (!$util.isString(message.updatedAt))
                    return "updatedAt: string expected";
            if (message.creatorId != null && message.hasOwnProperty("creatorId")) {
                properties._creatorId = 1;
                if (!$util.isString(message.creatorId))
                    return "creatorId: string expected";
            }
            if (message.assignedToId != null && message.hasOwnProperty("assignedToId")) {
                properties._assignedToId = 1;
                if (!$util.isString(message.assignedToId))
                    return "assignedToId: string expected";
            }
            if (message.templateId != null && message.hasOwnProperty("templateId")) {
                properties._templateId = 1;
                if (!$util.isString(message.templateId))
                    return "templateId: string expected";
            }
            if (message.stepsCount != null && message.hasOwnProperty("stepsCount"))
                if (!$util.isInteger(message.stepsCount))
                    return "stepsCount: integer expected";
            if (message.prerequisitesCount != null && message.hasOwnProperty("prerequisitesCount"))
                if (!$util.isInteger(message.prerequisitesCount))
                    return "prerequisitesCount: integer expected";
            if (message.dependentsCount != null && message.hasOwnProperty("dependentsCount"))
                if (!$util.isInteger(message.dependentsCount))
                    return "dependentsCount: integer expected";
            return null;
        };

        /**
         * Creates a Task message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof taskgraph.Task
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {taskgraph.Task} Task
         */
        Task.fromObject = function fromObject(object) {
            if (object instanceof $root.taskgraph.Task)
                return object;
            let message = new $root.taskgraph.Task();
            if (object.id != null)
                message.id = String(object.id);
            if (object.idempotencyKey != null)
                message.idempotencyKey = String(object.idempotencyKey);
            if (object.title != null)
                message.title = String(object.title);
            if (object.description != null)
                message.description = String(object.description);
            switch (object.status) {
            default:
                if (typeof object.status === "number") {
                    message.status = object.status;
                    break;
                }
                break;
            case "TASK_STATUS_UNSPECIFIED":
            case 0:
                message.status = 0;
                break;
            case "TASK_STATUS_PENDING":
            case 1:
                message.status = 1;
                break;
            case "TASK_STATUS_TODO":
            case 2:
                message.status = 2;
                break;
            case "TASK_STATUS_IN_PROGRESS":
            case 3:
                message.status = 3;
                break;
            case "TASK_STATUS_DONE":
            case 4:
                message.status = 4;
                break;
            case "TASK_STATUS_BLOCKED":
            case 5:
                message.status = 5;
                break;
            case "TASK_STATUS_SKIPPED":
            case 6:
                message.status = 6;
                break;
            case "TASK_STATUS_RETRYING":
            case 7:
                message.status = 7;
                break;
            case "TASK_STATUS_FAILED":
            case 8:
                message.status = 8;
                break;
            }
            if (object.dueDate != null)
                message.dueDate = String(object.dueDate);
            switch (object.repeatInterval) {
            default:
                if (typeof object.repeatInterval === "number") {
                    message.repeatInterval = object.repeatInterval;
                    break;
                }
                break;
            case "REPEAT_INTERVAL_UNSPECIFIED":
            case 0:
                message.repeatInterval = 0;
                break;
            case "REPEAT_INTERVAL_NONE":
            case 1:
                message.repeatInterval = 1;
                break;
            case "REPEAT_INTERVAL_DAILY":
            case 2:
                message.repeatInterval = 2;
                break;
            case "REPEAT_INTERVAL_WEEKLY":
            case 3:
                message.repeatInterval = 3;
                break;
            case "REPEAT_INTERVAL_MONTHLY":
            case 4:
                message.repeatInterval = 4;
                break;
            }
            if (object.retryCount != null)
                message.retryCount = object.retryCount | 0;
            if (object.maxRetries != null)
                message.maxRetries = object.maxRetries | 0;
            if (object.skipReason != null)
                message.skipReason = String(object.skipReason);
            if (object.metadata) {
                if (typeof object.metadata !== "object")
                    throw TypeError(".taskgraph.Task.metadata: object expected");
                message.metadata = {};
                for (let keys = Object.keys(object.metadata), i = 0; i < keys.length; ++i)
                    message.metadata[keys[i]] = String(object.metadata[keys[i]]);
            }
            if (object.createdAt != null)
                message.createdAt = String(object.createdAt);
            if (object.updatedAt != null)
                message.updatedAt = String(object.updatedAt);
            if (object.creatorId != null)
                message.creatorId = String(object.creatorId);
            if (object.assignedToId != null)
                message.assignedToId = String(object.assignedToId);
            if (object.templateId != null)
                message.templateId = String(object.templateId);
            if (object.stepsCount != null)
                message.stepsCount = object.stepsCount | 0;
            if (object.prerequisitesCount != null)
                message.prerequisitesCount = object.prerequisitesCount | 0;
            if (object.dependentsCount != null)
                message.dependentsCount = object.dependentsCount | 0;
            return message;
        };

        /**
         * Creates a plain object from a Task message. Also converts values to other types if specified.
         * @function toObject
         * @memberof taskgraph.Task
         * @static
         * @param {taskgraph.Task} message Task
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Task.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.objects || options.defaults)
                object.metadata = {};
            if (options.defaults) {
                object.id = "";
                object.title = "";
                object.status = options.enums === String ? "TASK_STATUS_UNSPECIFIED" : 0;
                object.repeatInterval = options.enums === String ? "REPEAT_INTERVAL_UNSPECIFIED" : 0;
                object.retryCount = 0;
                object.maxRetries = 0;
                object.createdAt = "";
                object.updatedAt = "";
                object.stepsCount = 0;
                object.prerequisitesCount = 0;
                object.dependentsCount = 0;
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.idempotencyKey != null && message.hasOwnProperty("idempotencyKey")) {
                object.idempotencyKey = message.idempotencyKey;
                if (options.oneofs)
                    object._idempotencyKey = "idempotencyKey";
            }
            if (message.title != null && message.hasOwnProperty("title"))
                object.title = message.title;
            if (message.description != null && message.hasOwnProperty("description")) {
                object.description = message.description;
                if (options.oneofs)
                    object._description = "description";
            }
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = options.enums === String ? $root.taskgraph.TaskStatus[message.status] === undefined ? message.status : $root.taskgraph.TaskStatus[message.status] : message.status;
            if (message.dueDate != null && message.hasOwnProperty("dueDate")) {
                object.dueDate = message.dueDate;
                if (options.oneofs)
                    object._dueDate = "dueDate";
            }
            if (message.repeatInterval != null && message.hasOwnProperty("repeatInterval"))
                object.repeatInterval = options.enums === String ? $root.taskgraph.RepeatInterval[message.repeatInterval] === undefined ? message.repeatInterval : $root.taskgraph.RepeatInterval[message.repeatInterval] : message.repeatInterval;
            if (message.retryCount != null && message.hasOwnProperty("retryCount"))
                object.retryCount = message.retryCount;
            if (message.maxRetries != null && message.hasOwnProperty("maxRetries"))
                object.maxRetries = message.maxRetries;
            if (message.skipReason != null && message.hasOwnProperty("skipReason")) {
                object.skipReason = message.skipReason;
                if (options.oneofs)
                    object._skipReason = "skipReason";
            }
            let keys2;
            if (message.metadata && (keys2 = Object.keys(message.metadata)).length) {
                object.metadata = {};
                for (let j = 0; j < keys2.length; ++j)
                    object.metadata[keys2[j]] = message.metadata[keys2[j]];
            }
            if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                object.createdAt = message.createdAt;
            if (message.updatedAt != null && message.hasOwnProperty("updatedAt"))
                object.updatedAt = message.updatedAt;
            if (message.creatorId != null && message.hasOwnProperty("creatorId")) {
                object.creatorId = message.creatorId;
                if (options.oneofs)
                    object._creatorId = "creatorId";
            }
            if (message.assignedToId != null && message.hasOwnProperty("assignedToId")) {
                object.assignedToId = message.assignedToId;
                if (options.oneofs)
                    object._assignedToId = "assignedToId";
            }
            if (message.templateId != null && message.hasOwnProperty("templateId")) {
                object.templateId = message.templateId;
                if (options.oneofs)
                    object._templateId = "templateId";
            }
            if (message.stepsCount != null && message.hasOwnProperty("stepsCount"))
                object.stepsCount = message.stepsCount;
            if (message.prerequisitesCount != null && message.hasOwnProperty("prerequisitesCount"))
                object.prerequisitesCount = message.prerequisitesCount;
            if (message.dependentsCount != null && message.hasOwnProperty("dependentsCount"))
                object.dependentsCount = message.dependentsCount;
            return object;
        };

        /**
         * Converts this Task to JSON.
         * @function toJSON
         * @memberof taskgraph.Task
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Task.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Task
         * @function getTypeUrl
         * @memberof taskgraph.Task
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Task.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/taskgraph.Task";
        };

        return Task;
    })();

    taskgraph.CreateTaskRequest = (function() {

        /**
         * Properties of a CreateTaskRequest.
         * @memberof taskgraph
         * @interface ICreateTaskRequest
         * @property {string|null} [idempotencyKey] CreateTaskRequest idempotencyKey
         * @property {string|null} [title] CreateTaskRequest title
         * @property {string|null} [description] CreateTaskRequest description
         * @property {taskgraph.TaskStatus|null} [status] CreateTaskRequest status
         * @property {string|null} [dueDate] CreateTaskRequest dueDate
         * @property {taskgraph.RepeatInterval|null} [repeatInterval] CreateTaskRequest repeatInterval
         * @property {number|null} [maxRetries] CreateTaskRequest maxRetries
         * @property {Object.<string,string>|null} [metadata] CreateTaskRequest metadata
         * @property {string|null} [assignedToId] CreateTaskRequest assignedToId
         * @property {string|null} [templateId] CreateTaskRequest templateId
         */

        /**
         * Constructs a new CreateTaskRequest.
         * @memberof taskgraph
         * @classdesc Represents a CreateTaskRequest.
         * @implements ICreateTaskRequest
         * @constructor
         * @param {taskgraph.ICreateTaskRequest=} [properties] Properties to set
         */
        function CreateTaskRequest(properties) {
            this.metadata = {};
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * CreateTaskRequest idempotencyKey.
         * @member {string|null|undefined} idempotencyKey
         * @memberof taskgraph.CreateTaskRequest
         * @instance
         */
        CreateTaskRequest.prototype.idempotencyKey = null;

        /**
         * CreateTaskRequest title.
         * @member {string} title
         * @memberof taskgraph.CreateTaskRequest
         * @instance
         */
        CreateTaskRequest.prototype.title = "";

        /**
         * CreateTaskRequest description.
         * @member {string|null|undefined} description
         * @memberof taskgraph.CreateTaskRequest
         * @instance
         */
        CreateTaskRequest.prototype.description = null;

        /**
         * CreateTaskRequest status.
         * @member {taskgraph.TaskStatus} status
         * @memberof taskgraph.CreateTaskRequest
         * @instance
         */
        CreateTaskRequest.prototype.status = 0;

        /**
         * CreateTaskRequest dueDate.
         * @member {string|null|undefined} dueDate
         * @memberof taskgraph.CreateTaskRequest
         * @instance
         */
        CreateTaskRequest.prototype.dueDate = null;

        /**
         * CreateTaskRequest repeatInterval.
         * @member {taskgraph.RepeatInterval} repeatInterval
         * @memberof taskgraph.CreateTaskRequest
         * @instance
         */
        CreateTaskRequest.prototype.repeatInterval = 0;

        /**
         * CreateTaskRequest maxRetries.
         * @member {number} maxRetries
         * @memberof taskgraph.CreateTaskRequest
         * @instance
         */
        CreateTaskRequest.prototype.maxRetries = 0;

        /**
         * CreateTaskRequest metadata.
         * @member {Object.<string,string>} metadata
         * @memberof taskgraph.CreateTaskRequest
         * @instance
         */
        CreateTaskRequest.prototype.metadata = $util.emptyObject;

        /**
         * CreateTaskRequest assignedToId.
         * @member {string|null|undefined} assignedToId
         * @memberof taskgraph.CreateTaskRequest
         * @instance
         */
        CreateTaskRequest.prototype.assignedToId = null;

        /**
         * CreateTaskRequest templateId.
         * @member {string|null|undefined} templateId
         * @memberof taskgraph.CreateTaskRequest
         * @instance
         */
        CreateTaskRequest.prototype.templateId = null;

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(CreateTaskRequest.prototype, "_idempotencyKey", {
            get: $util.oneOfGetter($oneOfFields = ["idempotencyKey"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(CreateTaskRequest.prototype, "_description", {
            get: $util.oneOfGetter($oneOfFields = ["description"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(CreateTaskRequest.prototype, "_dueDate", {
            get: $util.oneOfGetter($oneOfFields = ["dueDate"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(CreateTaskRequest.prototype, "_assignedToId", {
            get: $util.oneOfGetter($oneOfFields = ["assignedToId"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(CreateTaskRequest.prototype, "_templateId", {
            get: $util.oneOfGetter($oneOfFields = ["templateId"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new CreateTaskRequest instance using the specified properties.
         * @function create
         * @memberof taskgraph.CreateTaskRequest
         * @static
         * @param {taskgraph.ICreateTaskRequest=} [properties] Properties to set
         * @returns {taskgraph.CreateTaskRequest} CreateTaskRequest instance
         */
        CreateTaskRequest.create = function create(properties) {
            return new CreateTaskRequest(properties);
        };

        /**
         * Encodes the specified CreateTaskRequest message. Does not implicitly {@link taskgraph.CreateTaskRequest.verify|verify} messages.
         * @function encode
         * @memberof taskgraph.CreateTaskRequest
         * @static
         * @param {taskgraph.ICreateTaskRequest} message CreateTaskRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CreateTaskRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.idempotencyKey != null && Object.hasOwnProperty.call(message, "idempotencyKey"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.idempotencyKey);
            if (message.title != null && Object.hasOwnProperty.call(message, "title"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.title);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.description);
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 4, wireType 0 =*/32).int32(message.status);
            if (message.dueDate != null && Object.hasOwnProperty.call(message, "dueDate"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.dueDate);
            if (message.repeatInterval != null && Object.hasOwnProperty.call(message, "repeatInterval"))
                writer.uint32(/* id 6, wireType 0 =*/48).int32(message.repeatInterval);
            if (message.maxRetries != null && Object.hasOwnProperty.call(message, "maxRetries"))
                writer.uint32(/* id 7, wireType 0 =*/56).int32(message.maxRetries);
            if (message.metadata != null && Object.hasOwnProperty.call(message, "metadata"))
                for (let keys = Object.keys(message.metadata), i = 0; i < keys.length; ++i)
                    writer.uint32(/* id 8, wireType 2 =*/66).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]).uint32(/* id 2, wireType 2 =*/18).string(message.metadata[keys[i]]).ldelim();
            if (message.assignedToId != null && Object.hasOwnProperty.call(message, "assignedToId"))
                writer.uint32(/* id 9, wireType 2 =*/74).string(message.assignedToId);
            if (message.templateId != null && Object.hasOwnProperty.call(message, "templateId"))
                writer.uint32(/* id 10, wireType 2 =*/82).string(message.templateId);
            return writer;
        };

        /**
         * Encodes the specified CreateTaskRequest message, length delimited. Does not implicitly {@link taskgraph.CreateTaskRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof taskgraph.CreateTaskRequest
         * @static
         * @param {taskgraph.ICreateTaskRequest} message CreateTaskRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CreateTaskRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a CreateTaskRequest message from the specified reader or buffer.
         * @function decode
         * @memberof taskgraph.CreateTaskRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {taskgraph.CreateTaskRequest} CreateTaskRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CreateTaskRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.taskgraph.CreateTaskRequest(), key, value;
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.idempotencyKey = reader.string();
                        break;
                    }
                case 2: {
                        message.title = reader.string();
                        break;
                    }
                case 3: {
                        message.description = reader.string();
                        break;
                    }
                case 4: {
                        message.status = reader.int32();
                        break;
                    }
                case 5: {
                        message.dueDate = reader.string();
                        break;
                    }
                case 6: {
                        message.repeatInterval = reader.int32();
                        break;
                    }
                case 7: {
                        message.maxRetries = reader.int32();
                        break;
                    }
                case 8: {
                        if (message.metadata === $util.emptyObject)
                            message.metadata = {};
                        let end2 = reader.uint32() + reader.pos;
                        key = "";
                        value = "";
                        while (reader.pos < end2) {
                            let tag2 = reader.uint32();
                            switch (tag2 >>> 3) {
                            case 1:
                                key = reader.string();
                                break;
                            case 2:
                                value = reader.string();
                                break;
                            default:
                                reader.skipType(tag2 & 7);
                                break;
                            }
                        }
                        message.metadata[key] = value;
                        break;
                    }
                case 9: {
                        message.assignedToId = reader.string();
                        break;
                    }
                case 10: {
                        message.templateId = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a CreateTaskRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof taskgraph.CreateTaskRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {taskgraph.CreateTaskRequest} CreateTaskRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CreateTaskRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a CreateTaskRequest message.
         * @function verify
         * @memberof taskgraph.CreateTaskRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CreateTaskRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
            if (message.idempotencyKey != null && message.hasOwnProperty("idempotencyKey")) {
                properties._idempotencyKey = 1;
                if (!$util.isString(message.idempotencyKey))
                    return "idempotencyKey: string expected";
            }
            if (message.title != null && message.hasOwnProperty("title"))
                if (!$util.isString(message.title))
                    return "title: string expected";
            if (message.description != null && message.hasOwnProperty("description")) {
                properties._description = 1;
                if (!$util.isString(message.description))
                    return "description: string expected";
            }
            if (message.status != null && message.hasOwnProperty("status"))
                switch (message.status) {
                default:
                    return "status: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                    break;
                }
            if (message.dueDate != null && message.hasOwnProperty("dueDate")) {
                properties._dueDate = 1;
                if (!$util.isString(message.dueDate))
                    return "dueDate: string expected";
            }
            if (message.repeatInterval != null && message.hasOwnProperty("repeatInterval"))
                switch (message.repeatInterval) {
                default:
                    return "repeatInterval: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                    break;
                }
            if (message.maxRetries != null && message.hasOwnProperty("maxRetries"))
                if (!$util.isInteger(message.maxRetries))
                    return "maxRetries: integer expected";
            if (message.metadata != null && message.hasOwnProperty("metadata")) {
                if (!$util.isObject(message.metadata))
                    return "metadata: object expected";
                let key = Object.keys(message.metadata);
                for (let i = 0; i < key.length; ++i)
                    if (!$util.isString(message.metadata[key[i]]))
                        return "metadata: string{k:string} expected";
            }
            if (message.assignedToId != null && message.hasOwnProperty("assignedToId")) {
                properties._assignedToId = 1;
                if (!$util.isString(message.assignedToId))
                    return "assignedToId: string expected";
            }
            if (message.templateId != null && message.hasOwnProperty("templateId")) {
                properties._templateId = 1;
                if (!$util.isString(message.templateId))
                    return "templateId: string expected";
            }
            return null;
        };

        /**
         * Creates a CreateTaskRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof taskgraph.CreateTaskRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {taskgraph.CreateTaskRequest} CreateTaskRequest
         */
        CreateTaskRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.taskgraph.CreateTaskRequest)
                return object;
            let message = new $root.taskgraph.CreateTaskRequest();
            if (object.idempotencyKey != null)
                message.idempotencyKey = String(object.idempotencyKey);
            if (object.title != null)
                message.title = String(object.title);
            if (object.description != null)
                message.description = String(object.description);
            switch (object.status) {
            default:
                if (typeof object.status === "number") {
                    message.status = object.status;
                    break;
                }
                break;
            case "TASK_STATUS_UNSPECIFIED":
            case 0:
                message.status = 0;
                break;
            case "TASK_STATUS_PENDING":
            case 1:
                message.status = 1;
                break;
            case "TASK_STATUS_TODO":
            case 2:
                message.status = 2;
                break;
            case "TASK_STATUS_IN_PROGRESS":
            case 3:
                message.status = 3;
                break;
            case "TASK_STATUS_DONE":
            case 4:
                message.status = 4;
                break;
            case "TASK_STATUS_BLOCKED":
            case 5:
                message.status = 5;
                break;
            case "TASK_STATUS_SKIPPED":
            case 6:
                message.status = 6;
                break;
            case "TASK_STATUS_RETRYING":
            case 7:
                message.status = 7;
                break;
            case "TASK_STATUS_FAILED":
            case 8:
                message.status = 8;
                break;
            }
            if (object.dueDate != null)
                message.dueDate = String(object.dueDate);
            switch (object.repeatInterval) {
            default:
                if (typeof object.repeatInterval === "number") {
                    message.repeatInterval = object.repeatInterval;
                    break;
                }
                break;
            case "REPEAT_INTERVAL_UNSPECIFIED":
            case 0:
                message.repeatInterval = 0;
                break;
            case "REPEAT_INTERVAL_NONE":
            case 1:
                message.repeatInterval = 1;
                break;
            case "REPEAT_INTERVAL_DAILY":
            case 2:
                message.repeatInterval = 2;
                break;
            case "REPEAT_INTERVAL_WEEKLY":
            case 3:
                message.repeatInterval = 3;
                break;
            case "REPEAT_INTERVAL_MONTHLY":
            case 4:
                message.repeatInterval = 4;
                break;
            }
            if (object.maxRetries != null)
                message.maxRetries = object.maxRetries | 0;
            if (object.metadata) {
                if (typeof object.metadata !== "object")
                    throw TypeError(".taskgraph.CreateTaskRequest.metadata: object expected");
                message.metadata = {};
                for (let keys = Object.keys(object.metadata), i = 0; i < keys.length; ++i)
                    message.metadata[keys[i]] = String(object.metadata[keys[i]]);
            }
            if (object.assignedToId != null)
                message.assignedToId = String(object.assignedToId);
            if (object.templateId != null)
                message.templateId = String(object.templateId);
            return message;
        };

        /**
         * Creates a plain object from a CreateTaskRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof taskgraph.CreateTaskRequest
         * @static
         * @param {taskgraph.CreateTaskRequest} message CreateTaskRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CreateTaskRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.objects || options.defaults)
                object.metadata = {};
            if (options.defaults) {
                object.title = "";
                object.status = options.enums === String ? "TASK_STATUS_UNSPECIFIED" : 0;
                object.repeatInterval = options.enums === String ? "REPEAT_INTERVAL_UNSPECIFIED" : 0;
                object.maxRetries = 0;
            }
            if (message.idempotencyKey != null && message.hasOwnProperty("idempotencyKey")) {
                object.idempotencyKey = message.idempotencyKey;
                if (options.oneofs)
                    object._idempotencyKey = "idempotencyKey";
            }
            if (message.title != null && message.hasOwnProperty("title"))
                object.title = message.title;
            if (message.description != null && message.hasOwnProperty("description")) {
                object.description = message.description;
                if (options.oneofs)
                    object._description = "description";
            }
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = options.enums === String ? $root.taskgraph.TaskStatus[message.status] === undefined ? message.status : $root.taskgraph.TaskStatus[message.status] : message.status;
            if (message.dueDate != null && message.hasOwnProperty("dueDate")) {
                object.dueDate = message.dueDate;
                if (options.oneofs)
                    object._dueDate = "dueDate";
            }
            if (message.repeatInterval != null && message.hasOwnProperty("repeatInterval"))
                object.repeatInterval = options.enums === String ? $root.taskgraph.RepeatInterval[message.repeatInterval] === undefined ? message.repeatInterval : $root.taskgraph.RepeatInterval[message.repeatInterval] : message.repeatInterval;
            if (message.maxRetries != null && message.hasOwnProperty("maxRetries"))
                object.maxRetries = message.maxRetries;
            let keys2;
            if (message.metadata && (keys2 = Object.keys(message.metadata)).length) {
                object.metadata = {};
                for (let j = 0; j < keys2.length; ++j)
                    object.metadata[keys2[j]] = message.metadata[keys2[j]];
            }
            if (message.assignedToId != null && message.hasOwnProperty("assignedToId")) {
                object.assignedToId = message.assignedToId;
                if (options.oneofs)
                    object._assignedToId = "assignedToId";
            }
            if (message.templateId != null && message.hasOwnProperty("templateId")) {
                object.templateId = message.templateId;
                if (options.oneofs)
                    object._templateId = "templateId";
            }
            return object;
        };

        /**
         * Converts this CreateTaskRequest to JSON.
         * @function toJSON
         * @memberof taskgraph.CreateTaskRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CreateTaskRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for CreateTaskRequest
         * @function getTypeUrl
         * @memberof taskgraph.CreateTaskRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        CreateTaskRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/taskgraph.CreateTaskRequest";
        };

        return CreateTaskRequest;
    })();

    taskgraph.UpdateTaskRequest = (function() {

        /**
         * Properties of an UpdateTaskRequest.
         * @memberof taskgraph
         * @interface IUpdateTaskRequest
         * @property {string|null} [taskId] UpdateTaskRequest taskId
         * @property {string|null} [title] UpdateTaskRequest title
         * @property {string|null} [description] UpdateTaskRequest description
         * @property {taskgraph.TaskStatus|null} [status] UpdateTaskRequest status
         * @property {string|null} [dueDate] UpdateTaskRequest dueDate
         * @property {taskgraph.RepeatInterval|null} [repeatInterval] UpdateTaskRequest repeatInterval
         * @property {number|null} [maxRetries] UpdateTaskRequest maxRetries
         * @property {string|null} [skipReason] UpdateTaskRequest skipReason
         * @property {Object.<string,string>|null} [metadata] UpdateTaskRequest metadata
         * @property {string|null} [assignedToId] UpdateTaskRequest assignedToId
         */

        /**
         * Constructs a new UpdateTaskRequest.
         * @memberof taskgraph
         * @classdesc Represents an UpdateTaskRequest.
         * @implements IUpdateTaskRequest
         * @constructor
         * @param {taskgraph.IUpdateTaskRequest=} [properties] Properties to set
         */
        function UpdateTaskRequest(properties) {
            this.metadata = {};
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * UpdateTaskRequest taskId.
         * @member {string} taskId
         * @memberof taskgraph.UpdateTaskRequest
         * @instance
         */
        UpdateTaskRequest.prototype.taskId = "";

        /**
         * UpdateTaskRequest title.
         * @member {string|null|undefined} title
         * @memberof taskgraph.UpdateTaskRequest
         * @instance
         */
        UpdateTaskRequest.prototype.title = null;

        /**
         * UpdateTaskRequest description.
         * @member {string|null|undefined} description
         * @memberof taskgraph.UpdateTaskRequest
         * @instance
         */
        UpdateTaskRequest.prototype.description = null;

        /**
         * UpdateTaskRequest status.
         * @member {taskgraph.TaskStatus} status
         * @memberof taskgraph.UpdateTaskRequest
         * @instance
         */
        UpdateTaskRequest.prototype.status = 0;

        /**
         * UpdateTaskRequest dueDate.
         * @member {string|null|undefined} dueDate
         * @memberof taskgraph.UpdateTaskRequest
         * @instance
         */
        UpdateTaskRequest.prototype.dueDate = null;

        /**
         * UpdateTaskRequest repeatInterval.
         * @member {taskgraph.RepeatInterval} repeatInterval
         * @memberof taskgraph.UpdateTaskRequest
         * @instance
         */
        UpdateTaskRequest.prototype.repeatInterval = 0;

        /**
         * UpdateTaskRequest maxRetries.
         * @member {number} maxRetries
         * @memberof taskgraph.UpdateTaskRequest
         * @instance
         */
        UpdateTaskRequest.prototype.maxRetries = 0;

        /**
         * UpdateTaskRequest skipReason.
         * @member {string|null|undefined} skipReason
         * @memberof taskgraph.UpdateTaskRequest
         * @instance
         */
        UpdateTaskRequest.prototype.skipReason = null;

        /**
         * UpdateTaskRequest metadata.
         * @member {Object.<string,string>} metadata
         * @memberof taskgraph.UpdateTaskRequest
         * @instance
         */
        UpdateTaskRequest.prototype.metadata = $util.emptyObject;

        /**
         * UpdateTaskRequest assignedToId.
         * @member {string|null|undefined} assignedToId
         * @memberof taskgraph.UpdateTaskRequest
         * @instance
         */
        UpdateTaskRequest.prototype.assignedToId = null;

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(UpdateTaskRequest.prototype, "_title", {
            get: $util.oneOfGetter($oneOfFields = ["title"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(UpdateTaskRequest.prototype, "_description", {
            get: $util.oneOfGetter($oneOfFields = ["description"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(UpdateTaskRequest.prototype, "_dueDate", {
            get: $util.oneOfGetter($oneOfFields = ["dueDate"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(UpdateTaskRequest.prototype, "_skipReason", {
            get: $util.oneOfGetter($oneOfFields = ["skipReason"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(UpdateTaskRequest.prototype, "_assignedToId", {
            get: $util.oneOfGetter($oneOfFields = ["assignedToId"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new UpdateTaskRequest instance using the specified properties.
         * @function create
         * @memberof taskgraph.UpdateTaskRequest
         * @static
         * @param {taskgraph.IUpdateTaskRequest=} [properties] Properties to set
         * @returns {taskgraph.UpdateTaskRequest} UpdateTaskRequest instance
         */
        UpdateTaskRequest.create = function create(properties) {
            return new UpdateTaskRequest(properties);
        };

        /**
         * Encodes the specified UpdateTaskRequest message. Does not implicitly {@link taskgraph.UpdateTaskRequest.verify|verify} messages.
         * @function encode
         * @memberof taskgraph.UpdateTaskRequest
         * @static
         * @param {taskgraph.IUpdateTaskRequest} message UpdateTaskRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UpdateTaskRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.taskId != null && Object.hasOwnProperty.call(message, "taskId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.taskId);
            if (message.title != null && Object.hasOwnProperty.call(message, "title"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.title);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.description);
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 4, wireType 0 =*/32).int32(message.status);
            if (message.dueDate != null && Object.hasOwnProperty.call(message, "dueDate"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.dueDate);
            if (message.repeatInterval != null && Object.hasOwnProperty.call(message, "repeatInterval"))
                writer.uint32(/* id 6, wireType 0 =*/48).int32(message.repeatInterval);
            if (message.maxRetries != null && Object.hasOwnProperty.call(message, "maxRetries"))
                writer.uint32(/* id 7, wireType 0 =*/56).int32(message.maxRetries);
            if (message.skipReason != null && Object.hasOwnProperty.call(message, "skipReason"))
                writer.uint32(/* id 8, wireType 2 =*/66).string(message.skipReason);
            if (message.metadata != null && Object.hasOwnProperty.call(message, "metadata"))
                for (let keys = Object.keys(message.metadata), i = 0; i < keys.length; ++i)
                    writer.uint32(/* id 9, wireType 2 =*/74).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]).uint32(/* id 2, wireType 2 =*/18).string(message.metadata[keys[i]]).ldelim();
            if (message.assignedToId != null && Object.hasOwnProperty.call(message, "assignedToId"))
                writer.uint32(/* id 10, wireType 2 =*/82).string(message.assignedToId);
            return writer;
        };

        /**
         * Encodes the specified UpdateTaskRequest message, length delimited. Does not implicitly {@link taskgraph.UpdateTaskRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof taskgraph.UpdateTaskRequest
         * @static
         * @param {taskgraph.IUpdateTaskRequest} message UpdateTaskRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UpdateTaskRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an UpdateTaskRequest message from the specified reader or buffer.
         * @function decode
         * @memberof taskgraph.UpdateTaskRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {taskgraph.UpdateTaskRequest} UpdateTaskRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UpdateTaskRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.taskgraph.UpdateTaskRequest(), key, value;
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.taskId = reader.string();
                        break;
                    }
                case 2: {
                        message.title = reader.string();
                        break;
                    }
                case 3: {
                        message.description = reader.string();
                        break;
                    }
                case 4: {
                        message.status = reader.int32();
                        break;
                    }
                case 5: {
                        message.dueDate = reader.string();
                        break;
                    }
                case 6: {
                        message.repeatInterval = reader.int32();
                        break;
                    }
                case 7: {
                        message.maxRetries = reader.int32();
                        break;
                    }
                case 8: {
                        message.skipReason = reader.string();
                        break;
                    }
                case 9: {
                        if (message.metadata === $util.emptyObject)
                            message.metadata = {};
                        let end2 = reader.uint32() + reader.pos;
                        key = "";
                        value = "";
                        while (reader.pos < end2) {
                            let tag2 = reader.uint32();
                            switch (tag2 >>> 3) {
                            case 1:
                                key = reader.string();
                                break;
                            case 2:
                                value = reader.string();
                                break;
                            default:
                                reader.skipType(tag2 & 7);
                                break;
                            }
                        }
                        message.metadata[key] = value;
                        break;
                    }
                case 10: {
                        message.assignedToId = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an UpdateTaskRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof taskgraph.UpdateTaskRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {taskgraph.UpdateTaskRequest} UpdateTaskRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UpdateTaskRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an UpdateTaskRequest message.
         * @function verify
         * @memberof taskgraph.UpdateTaskRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        UpdateTaskRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
            if (message.taskId != null && message.hasOwnProperty("taskId"))
                if (!$util.isString(message.taskId))
                    return "taskId: string expected";
            if (message.title != null && message.hasOwnProperty("title")) {
                properties._title = 1;
                if (!$util.isString(message.title))
                    return "title: string expected";
            }
            if (message.description != null && message.hasOwnProperty("description")) {
                properties._description = 1;
                if (!$util.isString(message.description))
                    return "description: string expected";
            }
            if (message.status != null && message.hasOwnProperty("status"))
                switch (message.status) {
                default:
                    return "status: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                    break;
                }
            if (message.dueDate != null && message.hasOwnProperty("dueDate")) {
                properties._dueDate = 1;
                if (!$util.isString(message.dueDate))
                    return "dueDate: string expected";
            }
            if (message.repeatInterval != null && message.hasOwnProperty("repeatInterval"))
                switch (message.repeatInterval) {
                default:
                    return "repeatInterval: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                    break;
                }
            if (message.maxRetries != null && message.hasOwnProperty("maxRetries"))
                if (!$util.isInteger(message.maxRetries))
                    return "maxRetries: integer expected";
            if (message.skipReason != null && message.hasOwnProperty("skipReason")) {
                properties._skipReason = 1;
                if (!$util.isString(message.skipReason))
                    return "skipReason: string expected";
            }
            if (message.metadata != null && message.hasOwnProperty("metadata")) {
                if (!$util.isObject(message.metadata))
                    return "metadata: object expected";
                let key = Object.keys(message.metadata);
                for (let i = 0; i < key.length; ++i)
                    if (!$util.isString(message.metadata[key[i]]))
                        return "metadata: string{k:string} expected";
            }
            if (message.assignedToId != null && message.hasOwnProperty("assignedToId")) {
                properties._assignedToId = 1;
                if (!$util.isString(message.assignedToId))
                    return "assignedToId: string expected";
            }
            return null;
        };

        /**
         * Creates an UpdateTaskRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof taskgraph.UpdateTaskRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {taskgraph.UpdateTaskRequest} UpdateTaskRequest
         */
        UpdateTaskRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.taskgraph.UpdateTaskRequest)
                return object;
            let message = new $root.taskgraph.UpdateTaskRequest();
            if (object.taskId != null)
                message.taskId = String(object.taskId);
            if (object.title != null)
                message.title = String(object.title);
            if (object.description != null)
                message.description = String(object.description);
            switch (object.status) {
            default:
                if (typeof object.status === "number") {
                    message.status = object.status;
                    break;
                }
                break;
            case "TASK_STATUS_UNSPECIFIED":
            case 0:
                message.status = 0;
                break;
            case "TASK_STATUS_PENDING":
            case 1:
                message.status = 1;
                break;
            case "TASK_STATUS_TODO":
            case 2:
                message.status = 2;
                break;
            case "TASK_STATUS_IN_PROGRESS":
            case 3:
                message.status = 3;
                break;
            case "TASK_STATUS_DONE":
            case 4:
                message.status = 4;
                break;
            case "TASK_STATUS_BLOCKED":
            case 5:
                message.status = 5;
                break;
            case "TASK_STATUS_SKIPPED":
            case 6:
                message.status = 6;
                break;
            case "TASK_STATUS_RETRYING":
            case 7:
                message.status = 7;
                break;
            case "TASK_STATUS_FAILED":
            case 8:
                message.status = 8;
                break;
            }
            if (object.dueDate != null)
                message.dueDate = String(object.dueDate);
            switch (object.repeatInterval) {
            default:
                if (typeof object.repeatInterval === "number") {
                    message.repeatInterval = object.repeatInterval;
                    break;
                }
                break;
            case "REPEAT_INTERVAL_UNSPECIFIED":
            case 0:
                message.repeatInterval = 0;
                break;
            case "REPEAT_INTERVAL_NONE":
            case 1:
                message.repeatInterval = 1;
                break;
            case "REPEAT_INTERVAL_DAILY":
            case 2:
                message.repeatInterval = 2;
                break;
            case "REPEAT_INTERVAL_WEEKLY":
            case 3:
                message.repeatInterval = 3;
                break;
            case "REPEAT_INTERVAL_MONTHLY":
            case 4:
                message.repeatInterval = 4;
                break;
            }
            if (object.maxRetries != null)
                message.maxRetries = object.maxRetries | 0;
            if (object.skipReason != null)
                message.skipReason = String(object.skipReason);
            if (object.metadata) {
                if (typeof object.metadata !== "object")
                    throw TypeError(".taskgraph.UpdateTaskRequest.metadata: object expected");
                message.metadata = {};
                for (let keys = Object.keys(object.metadata), i = 0; i < keys.length; ++i)
                    message.metadata[keys[i]] = String(object.metadata[keys[i]]);
            }
            if (object.assignedToId != null)
                message.assignedToId = String(object.assignedToId);
            return message;
        };

        /**
         * Creates a plain object from an UpdateTaskRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof taskgraph.UpdateTaskRequest
         * @static
         * @param {taskgraph.UpdateTaskRequest} message UpdateTaskRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        UpdateTaskRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.objects || options.defaults)
                object.metadata = {};
            if (options.defaults) {
                object.taskId = "";
                object.status = options.enums === String ? "TASK_STATUS_UNSPECIFIED" : 0;
                object.repeatInterval = options.enums === String ? "REPEAT_INTERVAL_UNSPECIFIED" : 0;
                object.maxRetries = 0;
            }
            if (message.taskId != null && message.hasOwnProperty("taskId"))
                object.taskId = message.taskId;
            if (message.title != null && message.hasOwnProperty("title")) {
                object.title = message.title;
                if (options.oneofs)
                    object._title = "title";
            }
            if (message.description != null && message.hasOwnProperty("description")) {
                object.description = message.description;
                if (options.oneofs)
                    object._description = "description";
            }
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = options.enums === String ? $root.taskgraph.TaskStatus[message.status] === undefined ? message.status : $root.taskgraph.TaskStatus[message.status] : message.status;
            if (message.dueDate != null && message.hasOwnProperty("dueDate")) {
                object.dueDate = message.dueDate;
                if (options.oneofs)
                    object._dueDate = "dueDate";
            }
            if (message.repeatInterval != null && message.hasOwnProperty("repeatInterval"))
                object.repeatInterval = options.enums === String ? $root.taskgraph.RepeatInterval[message.repeatInterval] === undefined ? message.repeatInterval : $root.taskgraph.RepeatInterval[message.repeatInterval] : message.repeatInterval;
            if (message.maxRetries != null && message.hasOwnProperty("maxRetries"))
                object.maxRetries = message.maxRetries;
            if (message.skipReason != null && message.hasOwnProperty("skipReason")) {
                object.skipReason = message.skipReason;
                if (options.oneofs)
                    object._skipReason = "skipReason";
            }
            let keys2;
            if (message.metadata && (keys2 = Object.keys(message.metadata)).length) {
                object.metadata = {};
                for (let j = 0; j < keys2.length; ++j)
                    object.metadata[keys2[j]] = message.metadata[keys2[j]];
            }
            if (message.assignedToId != null && message.hasOwnProperty("assignedToId")) {
                object.assignedToId = message.assignedToId;
                if (options.oneofs)
                    object._assignedToId = "assignedToId";
            }
            return object;
        };

        /**
         * Converts this UpdateTaskRequest to JSON.
         * @function toJSON
         * @memberof taskgraph.UpdateTaskRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        UpdateTaskRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for UpdateTaskRequest
         * @function getTypeUrl
         * @memberof taskgraph.UpdateTaskRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        UpdateTaskRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/taskgraph.UpdateTaskRequest";
        };

        return UpdateTaskRequest;
    })();

    taskgraph.GetTaskRequest = (function() {

        /**
         * Properties of a GetTaskRequest.
         * @memberof taskgraph
         * @interface IGetTaskRequest
         * @property {string|null} [taskId] GetTaskRequest taskId
         * @property {boolean|null} [includeSteps] GetTaskRequest includeSteps
         * @property {boolean|null} [includeDependencies] GetTaskRequest includeDependencies
         * @property {boolean|null} [includeFiles] GetTaskRequest includeFiles
         * @property {boolean|null} [includeNotes] GetTaskRequest includeNotes
         */

        /**
         * Constructs a new GetTaskRequest.
         * @memberof taskgraph
         * @classdesc Represents a GetTaskRequest.
         * @implements IGetTaskRequest
         * @constructor
         * @param {taskgraph.IGetTaskRequest=} [properties] Properties to set
         */
        function GetTaskRequest(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * GetTaskRequest taskId.
         * @member {string} taskId
         * @memberof taskgraph.GetTaskRequest
         * @instance
         */
        GetTaskRequest.prototype.taskId = "";

        /**
         * GetTaskRequest includeSteps.
         * @member {boolean} includeSteps
         * @memberof taskgraph.GetTaskRequest
         * @instance
         */
        GetTaskRequest.prototype.includeSteps = false;

        /**
         * GetTaskRequest includeDependencies.
         * @member {boolean} includeDependencies
         * @memberof taskgraph.GetTaskRequest
         * @instance
         */
        GetTaskRequest.prototype.includeDependencies = false;

        /**
         * GetTaskRequest includeFiles.
         * @member {boolean} includeFiles
         * @memberof taskgraph.GetTaskRequest
         * @instance
         */
        GetTaskRequest.prototype.includeFiles = false;

        /**
         * GetTaskRequest includeNotes.
         * @member {boolean} includeNotes
         * @memberof taskgraph.GetTaskRequest
         * @instance
         */
        GetTaskRequest.prototype.includeNotes = false;

        /**
         * Creates a new GetTaskRequest instance using the specified properties.
         * @function create
         * @memberof taskgraph.GetTaskRequest
         * @static
         * @param {taskgraph.IGetTaskRequest=} [properties] Properties to set
         * @returns {taskgraph.GetTaskRequest} GetTaskRequest instance
         */
        GetTaskRequest.create = function create(properties) {
            return new GetTaskRequest(properties);
        };

        /**
         * Encodes the specified GetTaskRequest message. Does not implicitly {@link taskgraph.GetTaskRequest.verify|verify} messages.
         * @function encode
         * @memberof taskgraph.GetTaskRequest
         * @static
         * @param {taskgraph.IGetTaskRequest} message GetTaskRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GetTaskRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.taskId != null && Object.hasOwnProperty.call(message, "taskId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.taskId);
            if (message.includeSteps != null && Object.hasOwnProperty.call(message, "includeSteps"))
                writer.uint32(/* id 2, wireType 0 =*/16).bool(message.includeSteps);
            if (message.includeDependencies != null && Object.hasOwnProperty.call(message, "includeDependencies"))
                writer.uint32(/* id 3, wireType 0 =*/24).bool(message.includeDependencies);
            if (message.includeFiles != null && Object.hasOwnProperty.call(message, "includeFiles"))
                writer.uint32(/* id 4, wireType 0 =*/32).bool(message.includeFiles);
            if (message.includeNotes != null && Object.hasOwnProperty.call(message, "includeNotes"))
                writer.uint32(/* id 5, wireType 0 =*/40).bool(message.includeNotes);
            return writer;
        };

        /**
         * Encodes the specified GetTaskRequest message, length delimited. Does not implicitly {@link taskgraph.GetTaskRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof taskgraph.GetTaskRequest
         * @static
         * @param {taskgraph.IGetTaskRequest} message GetTaskRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GetTaskRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a GetTaskRequest message from the specified reader or buffer.
         * @function decode
         * @memberof taskgraph.GetTaskRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {taskgraph.GetTaskRequest} GetTaskRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GetTaskRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.taskgraph.GetTaskRequest();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.taskId = reader.string();
                        break;
                    }
                case 2: {
                        message.includeSteps = reader.bool();
                        break;
                    }
                case 3: {
                        message.includeDependencies = reader.bool();
                        break;
                    }
                case 4: {
                        message.includeFiles = reader.bool();
                        break;
                    }
                case 5: {
                        message.includeNotes = reader.bool();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a GetTaskRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof taskgraph.GetTaskRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {taskgraph.GetTaskRequest} GetTaskRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GetTaskRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a GetTaskRequest message.
         * @function verify
         * @memberof taskgraph.GetTaskRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        GetTaskRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.taskId != null && message.hasOwnProperty("taskId"))
                if (!$util.isString(message.taskId))
                    return "taskId: string expected";
            if (message.includeSteps != null && message.hasOwnProperty("includeSteps"))
                if (typeof message.includeSteps !== "boolean")
                    return "includeSteps: boolean expected";
            if (message.includeDependencies != null && message.hasOwnProperty("includeDependencies"))
                if (typeof message.includeDependencies !== "boolean")
                    return "includeDependencies: boolean expected";
            if (message.includeFiles != null && message.hasOwnProperty("includeFiles"))
                if (typeof message.includeFiles !== "boolean")
                    return "includeFiles: boolean expected";
            if (message.includeNotes != null && message.hasOwnProperty("includeNotes"))
                if (typeof message.includeNotes !== "boolean")
                    return "includeNotes: boolean expected";
            return null;
        };

        /**
         * Creates a GetTaskRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof taskgraph.GetTaskRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {taskgraph.GetTaskRequest} GetTaskRequest
         */
        GetTaskRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.taskgraph.GetTaskRequest)
                return object;
            let message = new $root.taskgraph.GetTaskRequest();
            if (object.taskId != null)
                message.taskId = String(object.taskId);
            if (object.includeSteps != null)
                message.includeSteps = Boolean(object.includeSteps);
            if (object.includeDependencies != null)
                message.includeDependencies = Boolean(object.includeDependencies);
            if (object.includeFiles != null)
                message.includeFiles = Boolean(object.includeFiles);
            if (object.includeNotes != null)
                message.includeNotes = Boolean(object.includeNotes);
            return message;
        };

        /**
         * Creates a plain object from a GetTaskRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof taskgraph.GetTaskRequest
         * @static
         * @param {taskgraph.GetTaskRequest} message GetTaskRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        GetTaskRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.taskId = "";
                object.includeSteps = false;
                object.includeDependencies = false;
                object.includeFiles = false;
                object.includeNotes = false;
            }
            if (message.taskId != null && message.hasOwnProperty("taskId"))
                object.taskId = message.taskId;
            if (message.includeSteps != null && message.hasOwnProperty("includeSteps"))
                object.includeSteps = message.includeSteps;
            if (message.includeDependencies != null && message.hasOwnProperty("includeDependencies"))
                object.includeDependencies = message.includeDependencies;
            if (message.includeFiles != null && message.hasOwnProperty("includeFiles"))
                object.includeFiles = message.includeFiles;
            if (message.includeNotes != null && message.hasOwnProperty("includeNotes"))
                object.includeNotes = message.includeNotes;
            return object;
        };

        /**
         * Converts this GetTaskRequest to JSON.
         * @function toJSON
         * @memberof taskgraph.GetTaskRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        GetTaskRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for GetTaskRequest
         * @function getTypeUrl
         * @memberof taskgraph.GetTaskRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        GetTaskRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/taskgraph.GetTaskRequest";
        };

        return GetTaskRequest;
    })();

    taskgraph.ListTasksRequest = (function() {

        /**
         * Properties of a ListTasksRequest.
         * @memberof taskgraph
         * @interface IListTasksRequest
         * @property {number|null} [limit] ListTasksRequest limit
         * @property {number|null} [offset] ListTasksRequest offset
         * @property {Array.<taskgraph.TaskStatus>|null} [status] ListTasksRequest status
         * @property {string|null} [assignedToId] ListTasksRequest assignedToId
         * @property {string|null} [creatorId] ListTasksRequest creatorId
         * @property {string|null} [search] ListTasksRequest search
         * @property {string|null} [sortField] ListTasksRequest sortField
         * @property {string|null} [sortOrder] ListTasksRequest sortOrder
         * @property {boolean|null} [includeSteps] ListTasksRequest includeSteps
         */

        /**
         * Constructs a new ListTasksRequest.
         * @memberof taskgraph
         * @classdesc Represents a ListTasksRequest.
         * @implements IListTasksRequest
         * @constructor
         * @param {taskgraph.IListTasksRequest=} [properties] Properties to set
         */
        function ListTasksRequest(properties) {
            this.status = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ListTasksRequest limit.
         * @member {number} limit
         * @memberof taskgraph.ListTasksRequest
         * @instance
         */
        ListTasksRequest.prototype.limit = 0;

        /**
         * ListTasksRequest offset.
         * @member {number} offset
         * @memberof taskgraph.ListTasksRequest
         * @instance
         */
        ListTasksRequest.prototype.offset = 0;

        /**
         * ListTasksRequest status.
         * @member {Array.<taskgraph.TaskStatus>} status
         * @memberof taskgraph.ListTasksRequest
         * @instance
         */
        ListTasksRequest.prototype.status = $util.emptyArray;

        /**
         * ListTasksRequest assignedToId.
         * @member {string|null|undefined} assignedToId
         * @memberof taskgraph.ListTasksRequest
         * @instance
         */
        ListTasksRequest.prototype.assignedToId = null;

        /**
         * ListTasksRequest creatorId.
         * @member {string|null|undefined} creatorId
         * @memberof taskgraph.ListTasksRequest
         * @instance
         */
        ListTasksRequest.prototype.creatorId = null;

        /**
         * ListTasksRequest search.
         * @member {string|null|undefined} search
         * @memberof taskgraph.ListTasksRequest
         * @instance
         */
        ListTasksRequest.prototype.search = null;

        /**
         * ListTasksRequest sortField.
         * @member {string|null|undefined} sortField
         * @memberof taskgraph.ListTasksRequest
         * @instance
         */
        ListTasksRequest.prototype.sortField = null;

        /**
         * ListTasksRequest sortOrder.
         * @member {string|null|undefined} sortOrder
         * @memberof taskgraph.ListTasksRequest
         * @instance
         */
        ListTasksRequest.prototype.sortOrder = null;

        /**
         * ListTasksRequest includeSteps.
         * @member {boolean} includeSteps
         * @memberof taskgraph.ListTasksRequest
         * @instance
         */
        ListTasksRequest.prototype.includeSteps = false;

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(ListTasksRequest.prototype, "_assignedToId", {
            get: $util.oneOfGetter($oneOfFields = ["assignedToId"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(ListTasksRequest.prototype, "_creatorId", {
            get: $util.oneOfGetter($oneOfFields = ["creatorId"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(ListTasksRequest.prototype, "_search", {
            get: $util.oneOfGetter($oneOfFields = ["search"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(ListTasksRequest.prototype, "_sortField", {
            get: $util.oneOfGetter($oneOfFields = ["sortField"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(ListTasksRequest.prototype, "_sortOrder", {
            get: $util.oneOfGetter($oneOfFields = ["sortOrder"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new ListTasksRequest instance using the specified properties.
         * @function create
         * @memberof taskgraph.ListTasksRequest
         * @static
         * @param {taskgraph.IListTasksRequest=} [properties] Properties to set
         * @returns {taskgraph.ListTasksRequest} ListTasksRequest instance
         */
        ListTasksRequest.create = function create(properties) {
            return new ListTasksRequest(properties);
        };

        /**
         * Encodes the specified ListTasksRequest message. Does not implicitly {@link taskgraph.ListTasksRequest.verify|verify} messages.
         * @function encode
         * @memberof taskgraph.ListTasksRequest
         * @static
         * @param {taskgraph.IListTasksRequest} message ListTasksRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ListTasksRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.limit != null && Object.hasOwnProperty.call(message, "limit"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.limit);
            if (message.offset != null && Object.hasOwnProperty.call(message, "offset"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.offset);
            if (message.status != null && message.status.length) {
                writer.uint32(/* id 3, wireType 2 =*/26).fork();
                for (let i = 0; i < message.status.length; ++i)
                    writer.int32(message.status[i]);
                writer.ldelim();
            }
            if (message.assignedToId != null && Object.hasOwnProperty.call(message, "assignedToId"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.assignedToId);
            if (message.creatorId != null && Object.hasOwnProperty.call(message, "creatorId"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.creatorId);
            if (message.search != null && Object.hasOwnProperty.call(message, "search"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.search);
            if (message.sortField != null && Object.hasOwnProperty.call(message, "sortField"))
                writer.uint32(/* id 7, wireType 2 =*/58).string(message.sortField);
            if (message.sortOrder != null && Object.hasOwnProperty.call(message, "sortOrder"))
                writer.uint32(/* id 8, wireType 2 =*/66).string(message.sortOrder);
            if (message.includeSteps != null && Object.hasOwnProperty.call(message, "includeSteps"))
                writer.uint32(/* id 9, wireType 0 =*/72).bool(message.includeSteps);
            return writer;
        };

        /**
         * Encodes the specified ListTasksRequest message, length delimited. Does not implicitly {@link taskgraph.ListTasksRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof taskgraph.ListTasksRequest
         * @static
         * @param {taskgraph.IListTasksRequest} message ListTasksRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ListTasksRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ListTasksRequest message from the specified reader or buffer.
         * @function decode
         * @memberof taskgraph.ListTasksRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {taskgraph.ListTasksRequest} ListTasksRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ListTasksRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.taskgraph.ListTasksRequest();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.limit = reader.int32();
                        break;
                    }
                case 2: {
                        message.offset = reader.int32();
                        break;
                    }
                case 3: {
                        if (!(message.status && message.status.length))
                            message.status = [];
                        if ((tag & 7) === 2) {
                            let end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.status.push(reader.int32());
                        } else
                            message.status.push(reader.int32());
                        break;
                    }
                case 4: {
                        message.assignedToId = reader.string();
                        break;
                    }
                case 5: {
                        message.creatorId = reader.string();
                        break;
                    }
                case 6: {
                        message.search = reader.string();
                        break;
                    }
                case 7: {
                        message.sortField = reader.string();
                        break;
                    }
                case 8: {
                        message.sortOrder = reader.string();
                        break;
                    }
                case 9: {
                        message.includeSteps = reader.bool();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a ListTasksRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof taskgraph.ListTasksRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {taskgraph.ListTasksRequest} ListTasksRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ListTasksRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ListTasksRequest message.
         * @function verify
         * @memberof taskgraph.ListTasksRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ListTasksRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
            if (message.limit != null && message.hasOwnProperty("limit"))
                if (!$util.isInteger(message.limit))
                    return "limit: integer expected";
            if (message.offset != null && message.hasOwnProperty("offset"))
                if (!$util.isInteger(message.offset))
                    return "offset: integer expected";
            if (message.status != null && message.hasOwnProperty("status")) {
                if (!Array.isArray(message.status))
                    return "status: array expected";
                for (let i = 0; i < message.status.length; ++i)
                    switch (message.status[i]) {
                    default:
                        return "status: enum value[] expected";
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                    case 8:
                        break;
                    }
            }
            if (message.assignedToId != null && message.hasOwnProperty("assignedToId")) {
                properties._assignedToId = 1;
                if (!$util.isString(message.assignedToId))
                    return "assignedToId: string expected";
            }
            if (message.creatorId != null && message.hasOwnProperty("creatorId")) {
                properties._creatorId = 1;
                if (!$util.isString(message.creatorId))
                    return "creatorId: string expected";
            }
            if (message.search != null && message.hasOwnProperty("search")) {
                properties._search = 1;
                if (!$util.isString(message.search))
                    return "search: string expected";
            }
            if (message.sortField != null && message.hasOwnProperty("sortField")) {
                properties._sortField = 1;
                if (!$util.isString(message.sortField))
                    return "sortField: string expected";
            }
            if (message.sortOrder != null && message.hasOwnProperty("sortOrder")) {
                properties._sortOrder = 1;
                if (!$util.isString(message.sortOrder))
                    return "sortOrder: string expected";
            }
            if (message.includeSteps != null && message.hasOwnProperty("includeSteps"))
                if (typeof message.includeSteps !== "boolean")
                    return "includeSteps: boolean expected";
            return null;
        };

        /**
         * Creates a ListTasksRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof taskgraph.ListTasksRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {taskgraph.ListTasksRequest} ListTasksRequest
         */
        ListTasksRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.taskgraph.ListTasksRequest)
                return object;
            let message = new $root.taskgraph.ListTasksRequest();
            if (object.limit != null)
                message.limit = object.limit | 0;
            if (object.offset != null)
                message.offset = object.offset | 0;
            if (object.status) {
                if (!Array.isArray(object.status))
                    throw TypeError(".taskgraph.ListTasksRequest.status: array expected");
                message.status = [];
                for (let i = 0; i < object.status.length; ++i)
                    switch (object.status[i]) {
                    default:
                        if (typeof object.status[i] === "number") {
                            message.status[i] = object.status[i];
                            break;
                        }
                    case "TASK_STATUS_UNSPECIFIED":
                    case 0:
                        message.status[i] = 0;
                        break;
                    case "TASK_STATUS_PENDING":
                    case 1:
                        message.status[i] = 1;
                        break;
                    case "TASK_STATUS_TODO":
                    case 2:
                        message.status[i] = 2;
                        break;
                    case "TASK_STATUS_IN_PROGRESS":
                    case 3:
                        message.status[i] = 3;
                        break;
                    case "TASK_STATUS_DONE":
                    case 4:
                        message.status[i] = 4;
                        break;
                    case "TASK_STATUS_BLOCKED":
                    case 5:
                        message.status[i] = 5;
                        break;
                    case "TASK_STATUS_SKIPPED":
                    case 6:
                        message.status[i] = 6;
                        break;
                    case "TASK_STATUS_RETRYING":
                    case 7:
                        message.status[i] = 7;
                        break;
                    case "TASK_STATUS_FAILED":
                    case 8:
                        message.status[i] = 8;
                        break;
                    }
            }
            if (object.assignedToId != null)
                message.assignedToId = String(object.assignedToId);
            if (object.creatorId != null)
                message.creatorId = String(object.creatorId);
            if (object.search != null)
                message.search = String(object.search);
            if (object.sortField != null)
                message.sortField = String(object.sortField);
            if (object.sortOrder != null)
                message.sortOrder = String(object.sortOrder);
            if (object.includeSteps != null)
                message.includeSteps = Boolean(object.includeSteps);
            return message;
        };

        /**
         * Creates a plain object from a ListTasksRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof taskgraph.ListTasksRequest
         * @static
         * @param {taskgraph.ListTasksRequest} message ListTasksRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ListTasksRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.status = [];
            if (options.defaults) {
                object.limit = 0;
                object.offset = 0;
                object.includeSteps = false;
            }
            if (message.limit != null && message.hasOwnProperty("limit"))
                object.limit = message.limit;
            if (message.offset != null && message.hasOwnProperty("offset"))
                object.offset = message.offset;
            if (message.status && message.status.length) {
                object.status = [];
                for (let j = 0; j < message.status.length; ++j)
                    object.status[j] = options.enums === String ? $root.taskgraph.TaskStatus[message.status[j]] === undefined ? message.status[j] : $root.taskgraph.TaskStatus[message.status[j]] : message.status[j];
            }
            if (message.assignedToId != null && message.hasOwnProperty("assignedToId")) {
                object.assignedToId = message.assignedToId;
                if (options.oneofs)
                    object._assignedToId = "assignedToId";
            }
            if (message.creatorId != null && message.hasOwnProperty("creatorId")) {
                object.creatorId = message.creatorId;
                if (options.oneofs)
                    object._creatorId = "creatorId";
            }
            if (message.search != null && message.hasOwnProperty("search")) {
                object.search = message.search;
                if (options.oneofs)
                    object._search = "search";
            }
            if (message.sortField != null && message.hasOwnProperty("sortField")) {
                object.sortField = message.sortField;
                if (options.oneofs)
                    object._sortField = "sortField";
            }
            if (message.sortOrder != null && message.hasOwnProperty("sortOrder")) {
                object.sortOrder = message.sortOrder;
                if (options.oneofs)
                    object._sortOrder = "sortOrder";
            }
            if (message.includeSteps != null && message.hasOwnProperty("includeSteps"))
                object.includeSteps = message.includeSteps;
            return object;
        };

        /**
         * Converts this ListTasksRequest to JSON.
         * @function toJSON
         * @memberof taskgraph.ListTasksRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ListTasksRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ListTasksRequest
         * @function getTypeUrl
         * @memberof taskgraph.ListTasksRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ListTasksRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/taskgraph.ListTasksRequest";
        };

        return ListTasksRequest;
    })();

    taskgraph.ListTasksResponse = (function() {

        /**
         * Properties of a ListTasksResponse.
         * @memberof taskgraph
         * @interface IListTasksResponse
         * @property {Array.<taskgraph.ITask>|null} [tasks] ListTasksResponse tasks
         * @property {taskgraph.IPagination|null} [pagination] ListTasksResponse pagination
         */

        /**
         * Constructs a new ListTasksResponse.
         * @memberof taskgraph
         * @classdesc Represents a ListTasksResponse.
         * @implements IListTasksResponse
         * @constructor
         * @param {taskgraph.IListTasksResponse=} [properties] Properties to set
         */
        function ListTasksResponse(properties) {
            this.tasks = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ListTasksResponse tasks.
         * @member {Array.<taskgraph.ITask>} tasks
         * @memberof taskgraph.ListTasksResponse
         * @instance
         */
        ListTasksResponse.prototype.tasks = $util.emptyArray;

        /**
         * ListTasksResponse pagination.
         * @member {taskgraph.IPagination|null|undefined} pagination
         * @memberof taskgraph.ListTasksResponse
         * @instance
         */
        ListTasksResponse.prototype.pagination = null;

        /**
         * Creates a new ListTasksResponse instance using the specified properties.
         * @function create
         * @memberof taskgraph.ListTasksResponse
         * @static
         * @param {taskgraph.IListTasksResponse=} [properties] Properties to set
         * @returns {taskgraph.ListTasksResponse} ListTasksResponse instance
         */
        ListTasksResponse.create = function create(properties) {
            return new ListTasksResponse(properties);
        };

        /**
         * Encodes the specified ListTasksResponse message. Does not implicitly {@link taskgraph.ListTasksResponse.verify|verify} messages.
         * @function encode
         * @memberof taskgraph.ListTasksResponse
         * @static
         * @param {taskgraph.IListTasksResponse} message ListTasksResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ListTasksResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.tasks != null && message.tasks.length)
                for (let i = 0; i < message.tasks.length; ++i)
                    $root.taskgraph.Task.encode(message.tasks[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.pagination != null && Object.hasOwnProperty.call(message, "pagination"))
                $root.taskgraph.Pagination.encode(message.pagination, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified ListTasksResponse message, length delimited. Does not implicitly {@link taskgraph.ListTasksResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof taskgraph.ListTasksResponse
         * @static
         * @param {taskgraph.IListTasksResponse} message ListTasksResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ListTasksResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ListTasksResponse message from the specified reader or buffer.
         * @function decode
         * @memberof taskgraph.ListTasksResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {taskgraph.ListTasksResponse} ListTasksResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ListTasksResponse.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.taskgraph.ListTasksResponse();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.tasks && message.tasks.length))
                            message.tasks = [];
                        message.tasks.push($root.taskgraph.Task.decode(reader, reader.uint32()));
                        break;
                    }
                case 2: {
                        message.pagination = $root.taskgraph.Pagination.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a ListTasksResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof taskgraph.ListTasksResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {taskgraph.ListTasksResponse} ListTasksResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ListTasksResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ListTasksResponse message.
         * @function verify
         * @memberof taskgraph.ListTasksResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ListTasksResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.tasks != null && message.hasOwnProperty("tasks")) {
                if (!Array.isArray(message.tasks))
                    return "tasks: array expected";
                for (let i = 0; i < message.tasks.length; ++i) {
                    let error = $root.taskgraph.Task.verify(message.tasks[i]);
                    if (error)
                        return "tasks." + error;
                }
            }
            if (message.pagination != null && message.hasOwnProperty("pagination")) {
                let error = $root.taskgraph.Pagination.verify(message.pagination);
                if (error)
                    return "pagination." + error;
            }
            return null;
        };

        /**
         * Creates a ListTasksResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof taskgraph.ListTasksResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {taskgraph.ListTasksResponse} ListTasksResponse
         */
        ListTasksResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.taskgraph.ListTasksResponse)
                return object;
            let message = new $root.taskgraph.ListTasksResponse();
            if (object.tasks) {
                if (!Array.isArray(object.tasks))
                    throw TypeError(".taskgraph.ListTasksResponse.tasks: array expected");
                message.tasks = [];
                for (let i = 0; i < object.tasks.length; ++i) {
                    if (typeof object.tasks[i] !== "object")
                        throw TypeError(".taskgraph.ListTasksResponse.tasks: object expected");
                    message.tasks[i] = $root.taskgraph.Task.fromObject(object.tasks[i]);
                }
            }
            if (object.pagination != null) {
                if (typeof object.pagination !== "object")
                    throw TypeError(".taskgraph.ListTasksResponse.pagination: object expected");
                message.pagination = $root.taskgraph.Pagination.fromObject(object.pagination);
            }
            return message;
        };

        /**
         * Creates a plain object from a ListTasksResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof taskgraph.ListTasksResponse
         * @static
         * @param {taskgraph.ListTasksResponse} message ListTasksResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ListTasksResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.tasks = [];
            if (options.defaults)
                object.pagination = null;
            if (message.tasks && message.tasks.length) {
                object.tasks = [];
                for (let j = 0; j < message.tasks.length; ++j)
                    object.tasks[j] = $root.taskgraph.Task.toObject(message.tasks[j], options);
            }
            if (message.pagination != null && message.hasOwnProperty("pagination"))
                object.pagination = $root.taskgraph.Pagination.toObject(message.pagination, options);
            return object;
        };

        /**
         * Converts this ListTasksResponse to JSON.
         * @function toJSON
         * @memberof taskgraph.ListTasksResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ListTasksResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ListTasksResponse
         * @function getTypeUrl
         * @memberof taskgraph.ListTasksResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ListTasksResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/taskgraph.ListTasksResponse";
        };

        return ListTasksResponse;
    })();

    taskgraph.TaskResponse = (function() {

        /**
         * Properties of a TaskResponse.
         * @memberof taskgraph
         * @interface ITaskResponse
         * @property {boolean|null} [success] TaskResponse success
         * @property {taskgraph.ITask|null} [data] TaskResponse data
         * @property {taskgraph.IError|null} [error] TaskResponse error
         */

        /**
         * Constructs a new TaskResponse.
         * @memberof taskgraph
         * @classdesc Represents a TaskResponse.
         * @implements ITaskResponse
         * @constructor
         * @param {taskgraph.ITaskResponse=} [properties] Properties to set
         */
        function TaskResponse(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * TaskResponse success.
         * @member {boolean} success
         * @memberof taskgraph.TaskResponse
         * @instance
         */
        TaskResponse.prototype.success = false;

        /**
         * TaskResponse data.
         * @member {taskgraph.ITask|null|undefined} data
         * @memberof taskgraph.TaskResponse
         * @instance
         */
        TaskResponse.prototype.data = null;

        /**
         * TaskResponse error.
         * @member {taskgraph.IError|null|undefined} error
         * @memberof taskgraph.TaskResponse
         * @instance
         */
        TaskResponse.prototype.error = null;

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(TaskResponse.prototype, "_error", {
            get: $util.oneOfGetter($oneOfFields = ["error"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new TaskResponse instance using the specified properties.
         * @function create
         * @memberof taskgraph.TaskResponse
         * @static
         * @param {taskgraph.ITaskResponse=} [properties] Properties to set
         * @returns {taskgraph.TaskResponse} TaskResponse instance
         */
        TaskResponse.create = function create(properties) {
            return new TaskResponse(properties);
        };

        /**
         * Encodes the specified TaskResponse message. Does not implicitly {@link taskgraph.TaskResponse.verify|verify} messages.
         * @function encode
         * @memberof taskgraph.TaskResponse
         * @static
         * @param {taskgraph.ITaskResponse} message TaskResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TaskResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.success != null && Object.hasOwnProperty.call(message, "success"))
                writer.uint32(/* id 1, wireType 0 =*/8).bool(message.success);
            if (message.data != null && Object.hasOwnProperty.call(message, "data"))
                $root.taskgraph.Task.encode(message.data, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.error != null && Object.hasOwnProperty.call(message, "error"))
                $root.taskgraph.Error.encode(message.error, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified TaskResponse message, length delimited. Does not implicitly {@link taskgraph.TaskResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof taskgraph.TaskResponse
         * @static
         * @param {taskgraph.ITaskResponse} message TaskResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TaskResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a TaskResponse message from the specified reader or buffer.
         * @function decode
         * @memberof taskgraph.TaskResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {taskgraph.TaskResponse} TaskResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TaskResponse.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.taskgraph.TaskResponse();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.success = reader.bool();
                        break;
                    }
                case 2: {
                        message.data = $root.taskgraph.Task.decode(reader, reader.uint32());
                        break;
                    }
                case 3: {
                        message.error = $root.taskgraph.Error.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a TaskResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof taskgraph.TaskResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {taskgraph.TaskResponse} TaskResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TaskResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a TaskResponse message.
         * @function verify
         * @memberof taskgraph.TaskResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        TaskResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
            if (message.success != null && message.hasOwnProperty("success"))
                if (typeof message.success !== "boolean")
                    return "success: boolean expected";
            if (message.data != null && message.hasOwnProperty("data")) {
                let error = $root.taskgraph.Task.verify(message.data);
                if (error)
                    return "data." + error;
            }
            if (message.error != null && message.hasOwnProperty("error")) {
                properties._error = 1;
                {
                    let error = $root.taskgraph.Error.verify(message.error);
                    if (error)
                        return "error." + error;
                }
            }
            return null;
        };

        /**
         * Creates a TaskResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof taskgraph.TaskResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {taskgraph.TaskResponse} TaskResponse
         */
        TaskResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.taskgraph.TaskResponse)
                return object;
            let message = new $root.taskgraph.TaskResponse();
            if (object.success != null)
                message.success = Boolean(object.success);
            if (object.data != null) {
                if (typeof object.data !== "object")
                    throw TypeError(".taskgraph.TaskResponse.data: object expected");
                message.data = $root.taskgraph.Task.fromObject(object.data);
            }
            if (object.error != null) {
                if (typeof object.error !== "object")
                    throw TypeError(".taskgraph.TaskResponse.error: object expected");
                message.error = $root.taskgraph.Error.fromObject(object.error);
            }
            return message;
        };

        /**
         * Creates a plain object from a TaskResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof taskgraph.TaskResponse
         * @static
         * @param {taskgraph.TaskResponse} message TaskResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        TaskResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.success = false;
                object.data = null;
            }
            if (message.success != null && message.hasOwnProperty("success"))
                object.success = message.success;
            if (message.data != null && message.hasOwnProperty("data"))
                object.data = $root.taskgraph.Task.toObject(message.data, options);
            if (message.error != null && message.hasOwnProperty("error")) {
                object.error = $root.taskgraph.Error.toObject(message.error, options);
                if (options.oneofs)
                    object._error = "error";
            }
            return object;
        };

        /**
         * Converts this TaskResponse to JSON.
         * @function toJSON
         * @memberof taskgraph.TaskResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        TaskResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for TaskResponse
         * @function getTypeUrl
         * @memberof taskgraph.TaskResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        TaskResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/taskgraph.TaskResponse";
        };

        return TaskResponse;
    })();

    taskgraph.Step = (function() {

        /**
         * Properties of a Step.
         * @memberof taskgraph
         * @interface IStep
         * @property {string|null} [id] Step id
         * @property {string|null} [token] Step token
         * @property {string|null} [content] Step content
         * @property {number|null} [order] Step order
         * @property {taskgraph.StepStatus|null} [status] Step status
         * @property {string|null} [startedAt] Step startedAt
         * @property {string|null} [completedAt] Step completedAt
         * @property {string|null} [skipReason] Step skipReason
         * @property {string|null} [blockedReason] Step blockedReason
         * @property {Object.<string,string>|null} [metadata] Step metadata
         * @property {string|null} [createdAt] Step createdAt
         * @property {string|null} [updatedAt] Step updatedAt
         * @property {string|null} [taskId] Step taskId
         */

        /**
         * Constructs a new Step.
         * @memberof taskgraph
         * @classdesc Represents a Step.
         * @implements IStep
         * @constructor
         * @param {taskgraph.IStep=} [properties] Properties to set
         */
        function Step(properties) {
            this.metadata = {};
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Step id.
         * @member {string} id
         * @memberof taskgraph.Step
         * @instance
         */
        Step.prototype.id = "";

        /**
         * Step token.
         * @member {string} token
         * @memberof taskgraph.Step
         * @instance
         */
        Step.prototype.token = "";

        /**
         * Step content.
         * @member {string} content
         * @memberof taskgraph.Step
         * @instance
         */
        Step.prototype.content = "";

        /**
         * Step order.
         * @member {number} order
         * @memberof taskgraph.Step
         * @instance
         */
        Step.prototype.order = 0;

        /**
         * Step status.
         * @member {taskgraph.StepStatus} status
         * @memberof taskgraph.Step
         * @instance
         */
        Step.prototype.status = 0;

        /**
         * Step startedAt.
         * @member {string|null|undefined} startedAt
         * @memberof taskgraph.Step
         * @instance
         */
        Step.prototype.startedAt = null;

        /**
         * Step completedAt.
         * @member {string|null|undefined} completedAt
         * @memberof taskgraph.Step
         * @instance
         */
        Step.prototype.completedAt = null;

        /**
         * Step skipReason.
         * @member {string|null|undefined} skipReason
         * @memberof taskgraph.Step
         * @instance
         */
        Step.prototype.skipReason = null;

        /**
         * Step blockedReason.
         * @member {string|null|undefined} blockedReason
         * @memberof taskgraph.Step
         * @instance
         */
        Step.prototype.blockedReason = null;

        /**
         * Step metadata.
         * @member {Object.<string,string>} metadata
         * @memberof taskgraph.Step
         * @instance
         */
        Step.prototype.metadata = $util.emptyObject;

        /**
         * Step createdAt.
         * @member {string} createdAt
         * @memberof taskgraph.Step
         * @instance
         */
        Step.prototype.createdAt = "";

        /**
         * Step updatedAt.
         * @member {string} updatedAt
         * @memberof taskgraph.Step
         * @instance
         */
        Step.prototype.updatedAt = "";

        /**
         * Step taskId.
         * @member {string} taskId
         * @memberof taskgraph.Step
         * @instance
         */
        Step.prototype.taskId = "";

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(Step.prototype, "_startedAt", {
            get: $util.oneOfGetter($oneOfFields = ["startedAt"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(Step.prototype, "_completedAt", {
            get: $util.oneOfGetter($oneOfFields = ["completedAt"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(Step.prototype, "_skipReason", {
            get: $util.oneOfGetter($oneOfFields = ["skipReason"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(Step.prototype, "_blockedReason", {
            get: $util.oneOfGetter($oneOfFields = ["blockedReason"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new Step instance using the specified properties.
         * @function create
         * @memberof taskgraph.Step
         * @static
         * @param {taskgraph.IStep=} [properties] Properties to set
         * @returns {taskgraph.Step} Step instance
         */
        Step.create = function create(properties) {
            return new Step(properties);
        };

        /**
         * Encodes the specified Step message. Does not implicitly {@link taskgraph.Step.verify|verify} messages.
         * @function encode
         * @memberof taskgraph.Step
         * @static
         * @param {taskgraph.IStep} message Step message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Step.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.token != null && Object.hasOwnProperty.call(message, "token"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.token);
            if (message.content != null && Object.hasOwnProperty.call(message, "content"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.content);
            if (message.order != null && Object.hasOwnProperty.call(message, "order"))
                writer.uint32(/* id 4, wireType 0 =*/32).int32(message.order);
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 5, wireType 0 =*/40).int32(message.status);
            if (message.startedAt != null && Object.hasOwnProperty.call(message, "startedAt"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.startedAt);
            if (message.completedAt != null && Object.hasOwnProperty.call(message, "completedAt"))
                writer.uint32(/* id 7, wireType 2 =*/58).string(message.completedAt);
            if (message.skipReason != null && Object.hasOwnProperty.call(message, "skipReason"))
                writer.uint32(/* id 8, wireType 2 =*/66).string(message.skipReason);
            if (message.blockedReason != null && Object.hasOwnProperty.call(message, "blockedReason"))
                writer.uint32(/* id 9, wireType 2 =*/74).string(message.blockedReason);
            if (message.metadata != null && Object.hasOwnProperty.call(message, "metadata"))
                for (let keys = Object.keys(message.metadata), i = 0; i < keys.length; ++i)
                    writer.uint32(/* id 10, wireType 2 =*/82).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]).uint32(/* id 2, wireType 2 =*/18).string(message.metadata[keys[i]]).ldelim();
            if (message.createdAt != null && Object.hasOwnProperty.call(message, "createdAt"))
                writer.uint32(/* id 11, wireType 2 =*/90).string(message.createdAt);
            if (message.updatedAt != null && Object.hasOwnProperty.call(message, "updatedAt"))
                writer.uint32(/* id 12, wireType 2 =*/98).string(message.updatedAt);
            if (message.taskId != null && Object.hasOwnProperty.call(message, "taskId"))
                writer.uint32(/* id 13, wireType 2 =*/106).string(message.taskId);
            return writer;
        };

        /**
         * Encodes the specified Step message, length delimited. Does not implicitly {@link taskgraph.Step.verify|verify} messages.
         * @function encodeDelimited
         * @memberof taskgraph.Step
         * @static
         * @param {taskgraph.IStep} message Step message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Step.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Step message from the specified reader or buffer.
         * @function decode
         * @memberof taskgraph.Step
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {taskgraph.Step} Step
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Step.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.taskgraph.Step(), key, value;
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.id = reader.string();
                        break;
                    }
                case 2: {
                        message.token = reader.string();
                        break;
                    }
                case 3: {
                        message.content = reader.string();
                        break;
                    }
                case 4: {
                        message.order = reader.int32();
                        break;
                    }
                case 5: {
                        message.status = reader.int32();
                        break;
                    }
                case 6: {
                        message.startedAt = reader.string();
                        break;
                    }
                case 7: {
                        message.completedAt = reader.string();
                        break;
                    }
                case 8: {
                        message.skipReason = reader.string();
                        break;
                    }
                case 9: {
                        message.blockedReason = reader.string();
                        break;
                    }
                case 10: {
                        if (message.metadata === $util.emptyObject)
                            message.metadata = {};
                        let end2 = reader.uint32() + reader.pos;
                        key = "";
                        value = "";
                        while (reader.pos < end2) {
                            let tag2 = reader.uint32();
                            switch (tag2 >>> 3) {
                            case 1:
                                key = reader.string();
                                break;
                            case 2:
                                value = reader.string();
                                break;
                            default:
                                reader.skipType(tag2 & 7);
                                break;
                            }
                        }
                        message.metadata[key] = value;
                        break;
                    }
                case 11: {
                        message.createdAt = reader.string();
                        break;
                    }
                case 12: {
                        message.updatedAt = reader.string();
                        break;
                    }
                case 13: {
                        message.taskId = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Step message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof taskgraph.Step
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {taskgraph.Step} Step
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Step.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Step message.
         * @function verify
         * @memberof taskgraph.Step
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Step.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.token != null && message.hasOwnProperty("token"))
                if (!$util.isString(message.token))
                    return "token: string expected";
            if (message.content != null && message.hasOwnProperty("content"))
                if (!$util.isString(message.content))
                    return "content: string expected";
            if (message.order != null && message.hasOwnProperty("order"))
                if (!$util.isInteger(message.order))
                    return "order: integer expected";
            if (message.status != null && message.hasOwnProperty("status"))
                switch (message.status) {
                default:
                    return "status: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                    break;
                }
            if (message.startedAt != null && message.hasOwnProperty("startedAt")) {
                properties._startedAt = 1;
                if (!$util.isString(message.startedAt))
                    return "startedAt: string expected";
            }
            if (message.completedAt != null && message.hasOwnProperty("completedAt")) {
                properties._completedAt = 1;
                if (!$util.isString(message.completedAt))
                    return "completedAt: string expected";
            }
            if (message.skipReason != null && message.hasOwnProperty("skipReason")) {
                properties._skipReason = 1;
                if (!$util.isString(message.skipReason))
                    return "skipReason: string expected";
            }
            if (message.blockedReason != null && message.hasOwnProperty("blockedReason")) {
                properties._blockedReason = 1;
                if (!$util.isString(message.blockedReason))
                    return "blockedReason: string expected";
            }
            if (message.metadata != null && message.hasOwnProperty("metadata")) {
                if (!$util.isObject(message.metadata))
                    return "metadata: object expected";
                let key = Object.keys(message.metadata);
                for (let i = 0; i < key.length; ++i)
                    if (!$util.isString(message.metadata[key[i]]))
                        return "metadata: string{k:string} expected";
            }
            if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                if (!$util.isString(message.createdAt))
                    return "createdAt: string expected";
            if (message.updatedAt != null && message.hasOwnProperty("updatedAt"))
                if (!$util.isString(message.updatedAt))
                    return "updatedAt: string expected";
            if (message.taskId != null && message.hasOwnProperty("taskId"))
                if (!$util.isString(message.taskId))
                    return "taskId: string expected";
            return null;
        };

        /**
         * Creates a Step message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof taskgraph.Step
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {taskgraph.Step} Step
         */
        Step.fromObject = function fromObject(object) {
            if (object instanceof $root.taskgraph.Step)
                return object;
            let message = new $root.taskgraph.Step();
            if (object.id != null)
                message.id = String(object.id);
            if (object.token != null)
                message.token = String(object.token);
            if (object.content != null)
                message.content = String(object.content);
            if (object.order != null)
                message.order = object.order | 0;
            switch (object.status) {
            default:
                if (typeof object.status === "number") {
                    message.status = object.status;
                    break;
                }
                break;
            case "STEP_STATUS_UNSPECIFIED":
            case 0:
                message.status = 0;
                break;
            case "STEP_STATUS_PENDING":
            case 1:
                message.status = 1;
                break;
            case "STEP_STATUS_IN_PROGRESS":
            case 2:
                message.status = 2;
                break;
            case "STEP_STATUS_COMPLETED":
            case 3:
                message.status = 3;
                break;
            case "STEP_STATUS_SKIPPED":
            case 4:
                message.status = 4;
                break;
            case "STEP_STATUS_BLOCKED":
            case 5:
                message.status = 5;
                break;
            }
            if (object.startedAt != null)
                message.startedAt = String(object.startedAt);
            if (object.completedAt != null)
                message.completedAt = String(object.completedAt);
            if (object.skipReason != null)
                message.skipReason = String(object.skipReason);
            if (object.blockedReason != null)
                message.blockedReason = String(object.blockedReason);
            if (object.metadata) {
                if (typeof object.metadata !== "object")
                    throw TypeError(".taskgraph.Step.metadata: object expected");
                message.metadata = {};
                for (let keys = Object.keys(object.metadata), i = 0; i < keys.length; ++i)
                    message.metadata[keys[i]] = String(object.metadata[keys[i]]);
            }
            if (object.createdAt != null)
                message.createdAt = String(object.createdAt);
            if (object.updatedAt != null)
                message.updatedAt = String(object.updatedAt);
            if (object.taskId != null)
                message.taskId = String(object.taskId);
            return message;
        };

        /**
         * Creates a plain object from a Step message. Also converts values to other types if specified.
         * @function toObject
         * @memberof taskgraph.Step
         * @static
         * @param {taskgraph.Step} message Step
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Step.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.objects || options.defaults)
                object.metadata = {};
            if (options.defaults) {
                object.id = "";
                object.token = "";
                object.content = "";
                object.order = 0;
                object.status = options.enums === String ? "STEP_STATUS_UNSPECIFIED" : 0;
                object.createdAt = "";
                object.updatedAt = "";
                object.taskId = "";
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.token != null && message.hasOwnProperty("token"))
                object.token = message.token;
            if (message.content != null && message.hasOwnProperty("content"))
                object.content = message.content;
            if (message.order != null && message.hasOwnProperty("order"))
                object.order = message.order;
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = options.enums === String ? $root.taskgraph.StepStatus[message.status] === undefined ? message.status : $root.taskgraph.StepStatus[message.status] : message.status;
            if (message.startedAt != null && message.hasOwnProperty("startedAt")) {
                object.startedAt = message.startedAt;
                if (options.oneofs)
                    object._startedAt = "startedAt";
            }
            if (message.completedAt != null && message.hasOwnProperty("completedAt")) {
                object.completedAt = message.completedAt;
                if (options.oneofs)
                    object._completedAt = "completedAt";
            }
            if (message.skipReason != null && message.hasOwnProperty("skipReason")) {
                object.skipReason = message.skipReason;
                if (options.oneofs)
                    object._skipReason = "skipReason";
            }
            if (message.blockedReason != null && message.hasOwnProperty("blockedReason")) {
                object.blockedReason = message.blockedReason;
                if (options.oneofs)
                    object._blockedReason = "blockedReason";
            }
            let keys2;
            if (message.metadata && (keys2 = Object.keys(message.metadata)).length) {
                object.metadata = {};
                for (let j = 0; j < keys2.length; ++j)
                    object.metadata[keys2[j]] = message.metadata[keys2[j]];
            }
            if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                object.createdAt = message.createdAt;
            if (message.updatedAt != null && message.hasOwnProperty("updatedAt"))
                object.updatedAt = message.updatedAt;
            if (message.taskId != null && message.hasOwnProperty("taskId"))
                object.taskId = message.taskId;
            return object;
        };

        /**
         * Converts this Step to JSON.
         * @function toJSON
         * @memberof taskgraph.Step
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Step.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Step
         * @function getTypeUrl
         * @memberof taskgraph.Step
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Step.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/taskgraph.Step";
        };

        return Step;
    })();

    taskgraph.CreateStepRequest = (function() {

        /**
         * Properties of a CreateStepRequest.
         * @memberof taskgraph
         * @interface ICreateStepRequest
         * @property {string|null} [taskId] CreateStepRequest taskId
         * @property {string|null} [token] CreateStepRequest token
         * @property {string|null} [content] CreateStepRequest content
         * @property {number|null} [order] CreateStepRequest order
         * @property {Object.<string,string>|null} [metadata] CreateStepRequest metadata
         */

        /**
         * Constructs a new CreateStepRequest.
         * @memberof taskgraph
         * @classdesc Represents a CreateStepRequest.
         * @implements ICreateStepRequest
         * @constructor
         * @param {taskgraph.ICreateStepRequest=} [properties] Properties to set
         */
        function CreateStepRequest(properties) {
            this.metadata = {};
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * CreateStepRequest taskId.
         * @member {string} taskId
         * @memberof taskgraph.CreateStepRequest
         * @instance
         */
        CreateStepRequest.prototype.taskId = "";

        /**
         * CreateStepRequest token.
         * @member {string} token
         * @memberof taskgraph.CreateStepRequest
         * @instance
         */
        CreateStepRequest.prototype.token = "";

        /**
         * CreateStepRequest content.
         * @member {string} content
         * @memberof taskgraph.CreateStepRequest
         * @instance
         */
        CreateStepRequest.prototype.content = "";

        /**
         * CreateStepRequest order.
         * @member {number|null|undefined} order
         * @memberof taskgraph.CreateStepRequest
         * @instance
         */
        CreateStepRequest.prototype.order = null;

        /**
         * CreateStepRequest metadata.
         * @member {Object.<string,string>} metadata
         * @memberof taskgraph.CreateStepRequest
         * @instance
         */
        CreateStepRequest.prototype.metadata = $util.emptyObject;

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(CreateStepRequest.prototype, "_order", {
            get: $util.oneOfGetter($oneOfFields = ["order"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new CreateStepRequest instance using the specified properties.
         * @function create
         * @memberof taskgraph.CreateStepRequest
         * @static
         * @param {taskgraph.ICreateStepRequest=} [properties] Properties to set
         * @returns {taskgraph.CreateStepRequest} CreateStepRequest instance
         */
        CreateStepRequest.create = function create(properties) {
            return new CreateStepRequest(properties);
        };

        /**
         * Encodes the specified CreateStepRequest message. Does not implicitly {@link taskgraph.CreateStepRequest.verify|verify} messages.
         * @function encode
         * @memberof taskgraph.CreateStepRequest
         * @static
         * @param {taskgraph.ICreateStepRequest} message CreateStepRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CreateStepRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.taskId != null && Object.hasOwnProperty.call(message, "taskId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.taskId);
            if (message.token != null && Object.hasOwnProperty.call(message, "token"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.token);
            if (message.content != null && Object.hasOwnProperty.call(message, "content"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.content);
            if (message.order != null && Object.hasOwnProperty.call(message, "order"))
                writer.uint32(/* id 4, wireType 0 =*/32).int32(message.order);
            if (message.metadata != null && Object.hasOwnProperty.call(message, "metadata"))
                for (let keys = Object.keys(message.metadata), i = 0; i < keys.length; ++i)
                    writer.uint32(/* id 5, wireType 2 =*/42).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]).uint32(/* id 2, wireType 2 =*/18).string(message.metadata[keys[i]]).ldelim();
            return writer;
        };

        /**
         * Encodes the specified CreateStepRequest message, length delimited. Does not implicitly {@link taskgraph.CreateStepRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof taskgraph.CreateStepRequest
         * @static
         * @param {taskgraph.ICreateStepRequest} message CreateStepRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CreateStepRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a CreateStepRequest message from the specified reader or buffer.
         * @function decode
         * @memberof taskgraph.CreateStepRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {taskgraph.CreateStepRequest} CreateStepRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CreateStepRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.taskgraph.CreateStepRequest(), key, value;
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.taskId = reader.string();
                        break;
                    }
                case 2: {
                        message.token = reader.string();
                        break;
                    }
                case 3: {
                        message.content = reader.string();
                        break;
                    }
                case 4: {
                        message.order = reader.int32();
                        break;
                    }
                case 5: {
                        if (message.metadata === $util.emptyObject)
                            message.metadata = {};
                        let end2 = reader.uint32() + reader.pos;
                        key = "";
                        value = "";
                        while (reader.pos < end2) {
                            let tag2 = reader.uint32();
                            switch (tag2 >>> 3) {
                            case 1:
                                key = reader.string();
                                break;
                            case 2:
                                value = reader.string();
                                break;
                            default:
                                reader.skipType(tag2 & 7);
                                break;
                            }
                        }
                        message.metadata[key] = value;
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a CreateStepRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof taskgraph.CreateStepRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {taskgraph.CreateStepRequest} CreateStepRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CreateStepRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a CreateStepRequest message.
         * @function verify
         * @memberof taskgraph.CreateStepRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CreateStepRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
            if (message.taskId != null && message.hasOwnProperty("taskId"))
                if (!$util.isString(message.taskId))
                    return "taskId: string expected";
            if (message.token != null && message.hasOwnProperty("token"))
                if (!$util.isString(message.token))
                    return "token: string expected";
            if (message.content != null && message.hasOwnProperty("content"))
                if (!$util.isString(message.content))
                    return "content: string expected";
            if (message.order != null && message.hasOwnProperty("order")) {
                properties._order = 1;
                if (!$util.isInteger(message.order))
                    return "order: integer expected";
            }
            if (message.metadata != null && message.hasOwnProperty("metadata")) {
                if (!$util.isObject(message.metadata))
                    return "metadata: object expected";
                let key = Object.keys(message.metadata);
                for (let i = 0; i < key.length; ++i)
                    if (!$util.isString(message.metadata[key[i]]))
                        return "metadata: string{k:string} expected";
            }
            return null;
        };

        /**
         * Creates a CreateStepRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof taskgraph.CreateStepRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {taskgraph.CreateStepRequest} CreateStepRequest
         */
        CreateStepRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.taskgraph.CreateStepRequest)
                return object;
            let message = new $root.taskgraph.CreateStepRequest();
            if (object.taskId != null)
                message.taskId = String(object.taskId);
            if (object.token != null)
                message.token = String(object.token);
            if (object.content != null)
                message.content = String(object.content);
            if (object.order != null)
                message.order = object.order | 0;
            if (object.metadata) {
                if (typeof object.metadata !== "object")
                    throw TypeError(".taskgraph.CreateStepRequest.metadata: object expected");
                message.metadata = {};
                for (let keys = Object.keys(object.metadata), i = 0; i < keys.length; ++i)
                    message.metadata[keys[i]] = String(object.metadata[keys[i]]);
            }
            return message;
        };

        /**
         * Creates a plain object from a CreateStepRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof taskgraph.CreateStepRequest
         * @static
         * @param {taskgraph.CreateStepRequest} message CreateStepRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CreateStepRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.objects || options.defaults)
                object.metadata = {};
            if (options.defaults) {
                object.taskId = "";
                object.token = "";
                object.content = "";
            }
            if (message.taskId != null && message.hasOwnProperty("taskId"))
                object.taskId = message.taskId;
            if (message.token != null && message.hasOwnProperty("token"))
                object.token = message.token;
            if (message.content != null && message.hasOwnProperty("content"))
                object.content = message.content;
            if (message.order != null && message.hasOwnProperty("order")) {
                object.order = message.order;
                if (options.oneofs)
                    object._order = "order";
            }
            let keys2;
            if (message.metadata && (keys2 = Object.keys(message.metadata)).length) {
                object.metadata = {};
                for (let j = 0; j < keys2.length; ++j)
                    object.metadata[keys2[j]] = message.metadata[keys2[j]];
            }
            return object;
        };

        /**
         * Converts this CreateStepRequest to JSON.
         * @function toJSON
         * @memberof taskgraph.CreateStepRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CreateStepRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for CreateStepRequest
         * @function getTypeUrl
         * @memberof taskgraph.CreateStepRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        CreateStepRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/taskgraph.CreateStepRequest";
        };

        return CreateStepRequest;
    })();

    taskgraph.ListStepsResponse = (function() {

        /**
         * Properties of a ListStepsResponse.
         * @memberof taskgraph
         * @interface IListStepsResponse
         * @property {Array.<taskgraph.IStep>|null} [steps] ListStepsResponse steps
         */

        /**
         * Constructs a new ListStepsResponse.
         * @memberof taskgraph
         * @classdesc Represents a ListStepsResponse.
         * @implements IListStepsResponse
         * @constructor
         * @param {taskgraph.IListStepsResponse=} [properties] Properties to set
         */
        function ListStepsResponse(properties) {
            this.steps = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ListStepsResponse steps.
         * @member {Array.<taskgraph.IStep>} steps
         * @memberof taskgraph.ListStepsResponse
         * @instance
         */
        ListStepsResponse.prototype.steps = $util.emptyArray;

        /**
         * Creates a new ListStepsResponse instance using the specified properties.
         * @function create
         * @memberof taskgraph.ListStepsResponse
         * @static
         * @param {taskgraph.IListStepsResponse=} [properties] Properties to set
         * @returns {taskgraph.ListStepsResponse} ListStepsResponse instance
         */
        ListStepsResponse.create = function create(properties) {
            return new ListStepsResponse(properties);
        };

        /**
         * Encodes the specified ListStepsResponse message. Does not implicitly {@link taskgraph.ListStepsResponse.verify|verify} messages.
         * @function encode
         * @memberof taskgraph.ListStepsResponse
         * @static
         * @param {taskgraph.IListStepsResponse} message ListStepsResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ListStepsResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.steps != null && message.steps.length)
                for (let i = 0; i < message.steps.length; ++i)
                    $root.taskgraph.Step.encode(message.steps[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified ListStepsResponse message, length delimited. Does not implicitly {@link taskgraph.ListStepsResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof taskgraph.ListStepsResponse
         * @static
         * @param {taskgraph.IListStepsResponse} message ListStepsResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ListStepsResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ListStepsResponse message from the specified reader or buffer.
         * @function decode
         * @memberof taskgraph.ListStepsResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {taskgraph.ListStepsResponse} ListStepsResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ListStepsResponse.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.taskgraph.ListStepsResponse();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.steps && message.steps.length))
                            message.steps = [];
                        message.steps.push($root.taskgraph.Step.decode(reader, reader.uint32()));
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a ListStepsResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof taskgraph.ListStepsResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {taskgraph.ListStepsResponse} ListStepsResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ListStepsResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ListStepsResponse message.
         * @function verify
         * @memberof taskgraph.ListStepsResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ListStepsResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.steps != null && message.hasOwnProperty("steps")) {
                if (!Array.isArray(message.steps))
                    return "steps: array expected";
                for (let i = 0; i < message.steps.length; ++i) {
                    let error = $root.taskgraph.Step.verify(message.steps[i]);
                    if (error)
                        return "steps." + error;
                }
            }
            return null;
        };

        /**
         * Creates a ListStepsResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof taskgraph.ListStepsResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {taskgraph.ListStepsResponse} ListStepsResponse
         */
        ListStepsResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.taskgraph.ListStepsResponse)
                return object;
            let message = new $root.taskgraph.ListStepsResponse();
            if (object.steps) {
                if (!Array.isArray(object.steps))
                    throw TypeError(".taskgraph.ListStepsResponse.steps: array expected");
                message.steps = [];
                for (let i = 0; i < object.steps.length; ++i) {
                    if (typeof object.steps[i] !== "object")
                        throw TypeError(".taskgraph.ListStepsResponse.steps: object expected");
                    message.steps[i] = $root.taskgraph.Step.fromObject(object.steps[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a ListStepsResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof taskgraph.ListStepsResponse
         * @static
         * @param {taskgraph.ListStepsResponse} message ListStepsResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ListStepsResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.steps = [];
            if (message.steps && message.steps.length) {
                object.steps = [];
                for (let j = 0; j < message.steps.length; ++j)
                    object.steps[j] = $root.taskgraph.Step.toObject(message.steps[j], options);
            }
            return object;
        };

        /**
         * Converts this ListStepsResponse to JSON.
         * @function toJSON
         * @memberof taskgraph.ListStepsResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ListStepsResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ListStepsResponse
         * @function getTypeUrl
         * @memberof taskgraph.ListStepsResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ListStepsResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/taskgraph.ListStepsResponse";
        };

        return ListStepsResponse;
    })();

    taskgraph.Dependency = (function() {

        /**
         * Properties of a Dependency.
         * @memberof taskgraph
         * @interface IDependency
         * @property {string|null} [prerequisiteId] Dependency prerequisiteId
         * @property {string|null} [dependentId] Dependency dependentId
         * @property {boolean|null} [allowSkip] Dependency allowSkip
         * @property {string|null} [createdAt] Dependency createdAt
         */

        /**
         * Constructs a new Dependency.
         * @memberof taskgraph
         * @classdesc Represents a Dependency.
         * @implements IDependency
         * @constructor
         * @param {taskgraph.IDependency=} [properties] Properties to set
         */
        function Dependency(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Dependency prerequisiteId.
         * @member {string} prerequisiteId
         * @memberof taskgraph.Dependency
         * @instance
         */
        Dependency.prototype.prerequisiteId = "";

        /**
         * Dependency dependentId.
         * @member {string} dependentId
         * @memberof taskgraph.Dependency
         * @instance
         */
        Dependency.prototype.dependentId = "";

        /**
         * Dependency allowSkip.
         * @member {boolean} allowSkip
         * @memberof taskgraph.Dependency
         * @instance
         */
        Dependency.prototype.allowSkip = false;

        /**
         * Dependency createdAt.
         * @member {string} createdAt
         * @memberof taskgraph.Dependency
         * @instance
         */
        Dependency.prototype.createdAt = "";

        /**
         * Creates a new Dependency instance using the specified properties.
         * @function create
         * @memberof taskgraph.Dependency
         * @static
         * @param {taskgraph.IDependency=} [properties] Properties to set
         * @returns {taskgraph.Dependency} Dependency instance
         */
        Dependency.create = function create(properties) {
            return new Dependency(properties);
        };

        /**
         * Encodes the specified Dependency message. Does not implicitly {@link taskgraph.Dependency.verify|verify} messages.
         * @function encode
         * @memberof taskgraph.Dependency
         * @static
         * @param {taskgraph.IDependency} message Dependency message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Dependency.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.prerequisiteId != null && Object.hasOwnProperty.call(message, "prerequisiteId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.prerequisiteId);
            if (message.dependentId != null && Object.hasOwnProperty.call(message, "dependentId"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.dependentId);
            if (message.allowSkip != null && Object.hasOwnProperty.call(message, "allowSkip"))
                writer.uint32(/* id 3, wireType 0 =*/24).bool(message.allowSkip);
            if (message.createdAt != null && Object.hasOwnProperty.call(message, "createdAt"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.createdAt);
            return writer;
        };

        /**
         * Encodes the specified Dependency message, length delimited. Does not implicitly {@link taskgraph.Dependency.verify|verify} messages.
         * @function encodeDelimited
         * @memberof taskgraph.Dependency
         * @static
         * @param {taskgraph.IDependency} message Dependency message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Dependency.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Dependency message from the specified reader or buffer.
         * @function decode
         * @memberof taskgraph.Dependency
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {taskgraph.Dependency} Dependency
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Dependency.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.taskgraph.Dependency();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.prerequisiteId = reader.string();
                        break;
                    }
                case 2: {
                        message.dependentId = reader.string();
                        break;
                    }
                case 3: {
                        message.allowSkip = reader.bool();
                        break;
                    }
                case 4: {
                        message.createdAt = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Dependency message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof taskgraph.Dependency
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {taskgraph.Dependency} Dependency
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Dependency.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Dependency message.
         * @function verify
         * @memberof taskgraph.Dependency
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Dependency.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.prerequisiteId != null && message.hasOwnProperty("prerequisiteId"))
                if (!$util.isString(message.prerequisiteId))
                    return "prerequisiteId: string expected";
            if (message.dependentId != null && message.hasOwnProperty("dependentId"))
                if (!$util.isString(message.dependentId))
                    return "dependentId: string expected";
            if (message.allowSkip != null && message.hasOwnProperty("allowSkip"))
                if (typeof message.allowSkip !== "boolean")
                    return "allowSkip: boolean expected";
            if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                if (!$util.isString(message.createdAt))
                    return "createdAt: string expected";
            return null;
        };

        /**
         * Creates a Dependency message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof taskgraph.Dependency
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {taskgraph.Dependency} Dependency
         */
        Dependency.fromObject = function fromObject(object) {
            if (object instanceof $root.taskgraph.Dependency)
                return object;
            let message = new $root.taskgraph.Dependency();
            if (object.prerequisiteId != null)
                message.prerequisiteId = String(object.prerequisiteId);
            if (object.dependentId != null)
                message.dependentId = String(object.dependentId);
            if (object.allowSkip != null)
                message.allowSkip = Boolean(object.allowSkip);
            if (object.createdAt != null)
                message.createdAt = String(object.createdAt);
            return message;
        };

        /**
         * Creates a plain object from a Dependency message. Also converts values to other types if specified.
         * @function toObject
         * @memberof taskgraph.Dependency
         * @static
         * @param {taskgraph.Dependency} message Dependency
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Dependency.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.prerequisiteId = "";
                object.dependentId = "";
                object.allowSkip = false;
                object.createdAt = "";
            }
            if (message.prerequisiteId != null && message.hasOwnProperty("prerequisiteId"))
                object.prerequisiteId = message.prerequisiteId;
            if (message.dependentId != null && message.hasOwnProperty("dependentId"))
                object.dependentId = message.dependentId;
            if (message.allowSkip != null && message.hasOwnProperty("allowSkip"))
                object.allowSkip = message.allowSkip;
            if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                object.createdAt = message.createdAt;
            return object;
        };

        /**
         * Converts this Dependency to JSON.
         * @function toJSON
         * @memberof taskgraph.Dependency
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Dependency.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Dependency
         * @function getTypeUrl
         * @memberof taskgraph.Dependency
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Dependency.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/taskgraph.Dependency";
        };

        return Dependency;
    })();

    taskgraph.CreateDependencyRequest = (function() {

        /**
         * Properties of a CreateDependencyRequest.
         * @memberof taskgraph
         * @interface ICreateDependencyRequest
         * @property {string|null} [prerequisiteId] CreateDependencyRequest prerequisiteId
         * @property {string|null} [dependentId] CreateDependencyRequest dependentId
         * @property {boolean|null} [allowSkip] CreateDependencyRequest allowSkip
         */

        /**
         * Constructs a new CreateDependencyRequest.
         * @memberof taskgraph
         * @classdesc Represents a CreateDependencyRequest.
         * @implements ICreateDependencyRequest
         * @constructor
         * @param {taskgraph.ICreateDependencyRequest=} [properties] Properties to set
         */
        function CreateDependencyRequest(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * CreateDependencyRequest prerequisiteId.
         * @member {string} prerequisiteId
         * @memberof taskgraph.CreateDependencyRequest
         * @instance
         */
        CreateDependencyRequest.prototype.prerequisiteId = "";

        /**
         * CreateDependencyRequest dependentId.
         * @member {string} dependentId
         * @memberof taskgraph.CreateDependencyRequest
         * @instance
         */
        CreateDependencyRequest.prototype.dependentId = "";

        /**
         * CreateDependencyRequest allowSkip.
         * @member {boolean} allowSkip
         * @memberof taskgraph.CreateDependencyRequest
         * @instance
         */
        CreateDependencyRequest.prototype.allowSkip = false;

        /**
         * Creates a new CreateDependencyRequest instance using the specified properties.
         * @function create
         * @memberof taskgraph.CreateDependencyRequest
         * @static
         * @param {taskgraph.ICreateDependencyRequest=} [properties] Properties to set
         * @returns {taskgraph.CreateDependencyRequest} CreateDependencyRequest instance
         */
        CreateDependencyRequest.create = function create(properties) {
            return new CreateDependencyRequest(properties);
        };

        /**
         * Encodes the specified CreateDependencyRequest message. Does not implicitly {@link taskgraph.CreateDependencyRequest.verify|verify} messages.
         * @function encode
         * @memberof taskgraph.CreateDependencyRequest
         * @static
         * @param {taskgraph.ICreateDependencyRequest} message CreateDependencyRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CreateDependencyRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.prerequisiteId != null && Object.hasOwnProperty.call(message, "prerequisiteId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.prerequisiteId);
            if (message.dependentId != null && Object.hasOwnProperty.call(message, "dependentId"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.dependentId);
            if (message.allowSkip != null && Object.hasOwnProperty.call(message, "allowSkip"))
                writer.uint32(/* id 3, wireType 0 =*/24).bool(message.allowSkip);
            return writer;
        };

        /**
         * Encodes the specified CreateDependencyRequest message, length delimited. Does not implicitly {@link taskgraph.CreateDependencyRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof taskgraph.CreateDependencyRequest
         * @static
         * @param {taskgraph.ICreateDependencyRequest} message CreateDependencyRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CreateDependencyRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a CreateDependencyRequest message from the specified reader or buffer.
         * @function decode
         * @memberof taskgraph.CreateDependencyRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {taskgraph.CreateDependencyRequest} CreateDependencyRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CreateDependencyRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.taskgraph.CreateDependencyRequest();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.prerequisiteId = reader.string();
                        break;
                    }
                case 2: {
                        message.dependentId = reader.string();
                        break;
                    }
                case 3: {
                        message.allowSkip = reader.bool();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a CreateDependencyRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof taskgraph.CreateDependencyRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {taskgraph.CreateDependencyRequest} CreateDependencyRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CreateDependencyRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a CreateDependencyRequest message.
         * @function verify
         * @memberof taskgraph.CreateDependencyRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CreateDependencyRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.prerequisiteId != null && message.hasOwnProperty("prerequisiteId"))
                if (!$util.isString(message.prerequisiteId))
                    return "prerequisiteId: string expected";
            if (message.dependentId != null && message.hasOwnProperty("dependentId"))
                if (!$util.isString(message.dependentId))
                    return "dependentId: string expected";
            if (message.allowSkip != null && message.hasOwnProperty("allowSkip"))
                if (typeof message.allowSkip !== "boolean")
                    return "allowSkip: boolean expected";
            return null;
        };

        /**
         * Creates a CreateDependencyRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof taskgraph.CreateDependencyRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {taskgraph.CreateDependencyRequest} CreateDependencyRequest
         */
        CreateDependencyRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.taskgraph.CreateDependencyRequest)
                return object;
            let message = new $root.taskgraph.CreateDependencyRequest();
            if (object.prerequisiteId != null)
                message.prerequisiteId = String(object.prerequisiteId);
            if (object.dependentId != null)
                message.dependentId = String(object.dependentId);
            if (object.allowSkip != null)
                message.allowSkip = Boolean(object.allowSkip);
            return message;
        };

        /**
         * Creates a plain object from a CreateDependencyRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof taskgraph.CreateDependencyRequest
         * @static
         * @param {taskgraph.CreateDependencyRequest} message CreateDependencyRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CreateDependencyRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.prerequisiteId = "";
                object.dependentId = "";
                object.allowSkip = false;
            }
            if (message.prerequisiteId != null && message.hasOwnProperty("prerequisiteId"))
                object.prerequisiteId = message.prerequisiteId;
            if (message.dependentId != null && message.hasOwnProperty("dependentId"))
                object.dependentId = message.dependentId;
            if (message.allowSkip != null && message.hasOwnProperty("allowSkip"))
                object.allowSkip = message.allowSkip;
            return object;
        };

        /**
         * Converts this CreateDependencyRequest to JSON.
         * @function toJSON
         * @memberof taskgraph.CreateDependencyRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CreateDependencyRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for CreateDependencyRequest
         * @function getTypeUrl
         * @memberof taskgraph.CreateDependencyRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        CreateDependencyRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/taskgraph.CreateDependencyRequest";
        };

        return CreateDependencyRequest;
    })();

    taskgraph.DependencyGraphNode = (function() {

        /**
         * Properties of a DependencyGraphNode.
         * @memberof taskgraph
         * @interface IDependencyGraphNode
         * @property {string|null} [id] DependencyGraphNode id
         * @property {string|null} [title] DependencyGraphNode title
         * @property {taskgraph.TaskStatus|null} [status] DependencyGraphNode status
         * @property {Array.<string>|null} [prerequisites] DependencyGraphNode prerequisites
         * @property {Array.<string>|null} [dependents] DependencyGraphNode dependents
         */

        /**
         * Constructs a new DependencyGraphNode.
         * @memberof taskgraph
         * @classdesc Represents a DependencyGraphNode.
         * @implements IDependencyGraphNode
         * @constructor
         * @param {taskgraph.IDependencyGraphNode=} [properties] Properties to set
         */
        function DependencyGraphNode(properties) {
            this.prerequisites = [];
            this.dependents = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * DependencyGraphNode id.
         * @member {string} id
         * @memberof taskgraph.DependencyGraphNode
         * @instance
         */
        DependencyGraphNode.prototype.id = "";

        /**
         * DependencyGraphNode title.
         * @member {string} title
         * @memberof taskgraph.DependencyGraphNode
         * @instance
         */
        DependencyGraphNode.prototype.title = "";

        /**
         * DependencyGraphNode status.
         * @member {taskgraph.TaskStatus} status
         * @memberof taskgraph.DependencyGraphNode
         * @instance
         */
        DependencyGraphNode.prototype.status = 0;

        /**
         * DependencyGraphNode prerequisites.
         * @member {Array.<string>} prerequisites
         * @memberof taskgraph.DependencyGraphNode
         * @instance
         */
        DependencyGraphNode.prototype.prerequisites = $util.emptyArray;

        /**
         * DependencyGraphNode dependents.
         * @member {Array.<string>} dependents
         * @memberof taskgraph.DependencyGraphNode
         * @instance
         */
        DependencyGraphNode.prototype.dependents = $util.emptyArray;

        /**
         * Creates a new DependencyGraphNode instance using the specified properties.
         * @function create
         * @memberof taskgraph.DependencyGraphNode
         * @static
         * @param {taskgraph.IDependencyGraphNode=} [properties] Properties to set
         * @returns {taskgraph.DependencyGraphNode} DependencyGraphNode instance
         */
        DependencyGraphNode.create = function create(properties) {
            return new DependencyGraphNode(properties);
        };

        /**
         * Encodes the specified DependencyGraphNode message. Does not implicitly {@link taskgraph.DependencyGraphNode.verify|verify} messages.
         * @function encode
         * @memberof taskgraph.DependencyGraphNode
         * @static
         * @param {taskgraph.IDependencyGraphNode} message DependencyGraphNode message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DependencyGraphNode.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.title != null && Object.hasOwnProperty.call(message, "title"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.title);
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.status);
            if (message.prerequisites != null && message.prerequisites.length)
                for (let i = 0; i < message.prerequisites.length; ++i)
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.prerequisites[i]);
            if (message.dependents != null && message.dependents.length)
                for (let i = 0; i < message.dependents.length; ++i)
                    writer.uint32(/* id 5, wireType 2 =*/42).string(message.dependents[i]);
            return writer;
        };

        /**
         * Encodes the specified DependencyGraphNode message, length delimited. Does not implicitly {@link taskgraph.DependencyGraphNode.verify|verify} messages.
         * @function encodeDelimited
         * @memberof taskgraph.DependencyGraphNode
         * @static
         * @param {taskgraph.IDependencyGraphNode} message DependencyGraphNode message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DependencyGraphNode.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a DependencyGraphNode message from the specified reader or buffer.
         * @function decode
         * @memberof taskgraph.DependencyGraphNode
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {taskgraph.DependencyGraphNode} DependencyGraphNode
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DependencyGraphNode.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.taskgraph.DependencyGraphNode();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.id = reader.string();
                        break;
                    }
                case 2: {
                        message.title = reader.string();
                        break;
                    }
                case 3: {
                        message.status = reader.int32();
                        break;
                    }
                case 4: {
                        if (!(message.prerequisites && message.prerequisites.length))
                            message.prerequisites = [];
                        message.prerequisites.push(reader.string());
                        break;
                    }
                case 5: {
                        if (!(message.dependents && message.dependents.length))
                            message.dependents = [];
                        message.dependents.push(reader.string());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a DependencyGraphNode message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof taskgraph.DependencyGraphNode
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {taskgraph.DependencyGraphNode} DependencyGraphNode
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DependencyGraphNode.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a DependencyGraphNode message.
         * @function verify
         * @memberof taskgraph.DependencyGraphNode
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        DependencyGraphNode.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.title != null && message.hasOwnProperty("title"))
                if (!$util.isString(message.title))
                    return "title: string expected";
            if (message.status != null && message.hasOwnProperty("status"))
                switch (message.status) {
                default:
                    return "status: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                    break;
                }
            if (message.prerequisites != null && message.hasOwnProperty("prerequisites")) {
                if (!Array.isArray(message.prerequisites))
                    return "prerequisites: array expected";
                for (let i = 0; i < message.prerequisites.length; ++i)
                    if (!$util.isString(message.prerequisites[i]))
                        return "prerequisites: string[] expected";
            }
            if (message.dependents != null && message.hasOwnProperty("dependents")) {
                if (!Array.isArray(message.dependents))
                    return "dependents: array expected";
                for (let i = 0; i < message.dependents.length; ++i)
                    if (!$util.isString(message.dependents[i]))
                        return "dependents: string[] expected";
            }
            return null;
        };

        /**
         * Creates a DependencyGraphNode message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof taskgraph.DependencyGraphNode
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {taskgraph.DependencyGraphNode} DependencyGraphNode
         */
        DependencyGraphNode.fromObject = function fromObject(object) {
            if (object instanceof $root.taskgraph.DependencyGraphNode)
                return object;
            let message = new $root.taskgraph.DependencyGraphNode();
            if (object.id != null)
                message.id = String(object.id);
            if (object.title != null)
                message.title = String(object.title);
            switch (object.status) {
            default:
                if (typeof object.status === "number") {
                    message.status = object.status;
                    break;
                }
                break;
            case "TASK_STATUS_UNSPECIFIED":
            case 0:
                message.status = 0;
                break;
            case "TASK_STATUS_PENDING":
            case 1:
                message.status = 1;
                break;
            case "TASK_STATUS_TODO":
            case 2:
                message.status = 2;
                break;
            case "TASK_STATUS_IN_PROGRESS":
            case 3:
                message.status = 3;
                break;
            case "TASK_STATUS_DONE":
            case 4:
                message.status = 4;
                break;
            case "TASK_STATUS_BLOCKED":
            case 5:
                message.status = 5;
                break;
            case "TASK_STATUS_SKIPPED":
            case 6:
                message.status = 6;
                break;
            case "TASK_STATUS_RETRYING":
            case 7:
                message.status = 7;
                break;
            case "TASK_STATUS_FAILED":
            case 8:
                message.status = 8;
                break;
            }
            if (object.prerequisites) {
                if (!Array.isArray(object.prerequisites))
                    throw TypeError(".taskgraph.DependencyGraphNode.prerequisites: array expected");
                message.prerequisites = [];
                for (let i = 0; i < object.prerequisites.length; ++i)
                    message.prerequisites[i] = String(object.prerequisites[i]);
            }
            if (object.dependents) {
                if (!Array.isArray(object.dependents))
                    throw TypeError(".taskgraph.DependencyGraphNode.dependents: array expected");
                message.dependents = [];
                for (let i = 0; i < object.dependents.length; ++i)
                    message.dependents[i] = String(object.dependents[i]);
            }
            return message;
        };

        /**
         * Creates a plain object from a DependencyGraphNode message. Also converts values to other types if specified.
         * @function toObject
         * @memberof taskgraph.DependencyGraphNode
         * @static
         * @param {taskgraph.DependencyGraphNode} message DependencyGraphNode
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        DependencyGraphNode.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults) {
                object.prerequisites = [];
                object.dependents = [];
            }
            if (options.defaults) {
                object.id = "";
                object.title = "";
                object.status = options.enums === String ? "TASK_STATUS_UNSPECIFIED" : 0;
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.title != null && message.hasOwnProperty("title"))
                object.title = message.title;
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = options.enums === String ? $root.taskgraph.TaskStatus[message.status] === undefined ? message.status : $root.taskgraph.TaskStatus[message.status] : message.status;
            if (message.prerequisites && message.prerequisites.length) {
                object.prerequisites = [];
                for (let j = 0; j < message.prerequisites.length; ++j)
                    object.prerequisites[j] = message.prerequisites[j];
            }
            if (message.dependents && message.dependents.length) {
                object.dependents = [];
                for (let j = 0; j < message.dependents.length; ++j)
                    object.dependents[j] = message.dependents[j];
            }
            return object;
        };

        /**
         * Converts this DependencyGraphNode to JSON.
         * @function toJSON
         * @memberof taskgraph.DependencyGraphNode
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        DependencyGraphNode.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for DependencyGraphNode
         * @function getTypeUrl
         * @memberof taskgraph.DependencyGraphNode
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        DependencyGraphNode.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/taskgraph.DependencyGraphNode";
        };

        return DependencyGraphNode;
    })();

    taskgraph.DependencyGraph = (function() {

        /**
         * Properties of a DependencyGraph.
         * @memberof taskgraph
         * @interface IDependencyGraph
         * @property {Array.<taskgraph.IDependencyGraphNode>|null} [nodes] DependencyGraph nodes
         * @property {Array.<taskgraph.IDependencyEdge>|null} [edges] DependencyGraph edges
         */

        /**
         * Constructs a new DependencyGraph.
         * @memberof taskgraph
         * @classdesc Represents a DependencyGraph.
         * @implements IDependencyGraph
         * @constructor
         * @param {taskgraph.IDependencyGraph=} [properties] Properties to set
         */
        function DependencyGraph(properties) {
            this.nodes = [];
            this.edges = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * DependencyGraph nodes.
         * @member {Array.<taskgraph.IDependencyGraphNode>} nodes
         * @memberof taskgraph.DependencyGraph
         * @instance
         */
        DependencyGraph.prototype.nodes = $util.emptyArray;

        /**
         * DependencyGraph edges.
         * @member {Array.<taskgraph.IDependencyEdge>} edges
         * @memberof taskgraph.DependencyGraph
         * @instance
         */
        DependencyGraph.prototype.edges = $util.emptyArray;

        /**
         * Creates a new DependencyGraph instance using the specified properties.
         * @function create
         * @memberof taskgraph.DependencyGraph
         * @static
         * @param {taskgraph.IDependencyGraph=} [properties] Properties to set
         * @returns {taskgraph.DependencyGraph} DependencyGraph instance
         */
        DependencyGraph.create = function create(properties) {
            return new DependencyGraph(properties);
        };

        /**
         * Encodes the specified DependencyGraph message. Does not implicitly {@link taskgraph.DependencyGraph.verify|verify} messages.
         * @function encode
         * @memberof taskgraph.DependencyGraph
         * @static
         * @param {taskgraph.IDependencyGraph} message DependencyGraph message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DependencyGraph.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.nodes != null && message.nodes.length)
                for (let i = 0; i < message.nodes.length; ++i)
                    $root.taskgraph.DependencyGraphNode.encode(message.nodes[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.edges != null && message.edges.length)
                for (let i = 0; i < message.edges.length; ++i)
                    $root.taskgraph.DependencyEdge.encode(message.edges[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified DependencyGraph message, length delimited. Does not implicitly {@link taskgraph.DependencyGraph.verify|verify} messages.
         * @function encodeDelimited
         * @memberof taskgraph.DependencyGraph
         * @static
         * @param {taskgraph.IDependencyGraph} message DependencyGraph message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DependencyGraph.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a DependencyGraph message from the specified reader or buffer.
         * @function decode
         * @memberof taskgraph.DependencyGraph
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {taskgraph.DependencyGraph} DependencyGraph
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DependencyGraph.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.taskgraph.DependencyGraph();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.nodes && message.nodes.length))
                            message.nodes = [];
                        message.nodes.push($root.taskgraph.DependencyGraphNode.decode(reader, reader.uint32()));
                        break;
                    }
                case 2: {
                        if (!(message.edges && message.edges.length))
                            message.edges = [];
                        message.edges.push($root.taskgraph.DependencyEdge.decode(reader, reader.uint32()));
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a DependencyGraph message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof taskgraph.DependencyGraph
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {taskgraph.DependencyGraph} DependencyGraph
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DependencyGraph.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a DependencyGraph message.
         * @function verify
         * @memberof taskgraph.DependencyGraph
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        DependencyGraph.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.nodes != null && message.hasOwnProperty("nodes")) {
                if (!Array.isArray(message.nodes))
                    return "nodes: array expected";
                for (let i = 0; i < message.nodes.length; ++i) {
                    let error = $root.taskgraph.DependencyGraphNode.verify(message.nodes[i]);
                    if (error)
                        return "nodes." + error;
                }
            }
            if (message.edges != null && message.hasOwnProperty("edges")) {
                if (!Array.isArray(message.edges))
                    return "edges: array expected";
                for (let i = 0; i < message.edges.length; ++i) {
                    let error = $root.taskgraph.DependencyEdge.verify(message.edges[i]);
                    if (error)
                        return "edges." + error;
                }
            }
            return null;
        };

        /**
         * Creates a DependencyGraph message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof taskgraph.DependencyGraph
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {taskgraph.DependencyGraph} DependencyGraph
         */
        DependencyGraph.fromObject = function fromObject(object) {
            if (object instanceof $root.taskgraph.DependencyGraph)
                return object;
            let message = new $root.taskgraph.DependencyGraph();
            if (object.nodes) {
                if (!Array.isArray(object.nodes))
                    throw TypeError(".taskgraph.DependencyGraph.nodes: array expected");
                message.nodes = [];
                for (let i = 0; i < object.nodes.length; ++i) {
                    if (typeof object.nodes[i] !== "object")
                        throw TypeError(".taskgraph.DependencyGraph.nodes: object expected");
                    message.nodes[i] = $root.taskgraph.DependencyGraphNode.fromObject(object.nodes[i]);
                }
            }
            if (object.edges) {
                if (!Array.isArray(object.edges))
                    throw TypeError(".taskgraph.DependencyGraph.edges: array expected");
                message.edges = [];
                for (let i = 0; i < object.edges.length; ++i) {
                    if (typeof object.edges[i] !== "object")
                        throw TypeError(".taskgraph.DependencyGraph.edges: object expected");
                    message.edges[i] = $root.taskgraph.DependencyEdge.fromObject(object.edges[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a DependencyGraph message. Also converts values to other types if specified.
         * @function toObject
         * @memberof taskgraph.DependencyGraph
         * @static
         * @param {taskgraph.DependencyGraph} message DependencyGraph
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        DependencyGraph.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults) {
                object.nodes = [];
                object.edges = [];
            }
            if (message.nodes && message.nodes.length) {
                object.nodes = [];
                for (let j = 0; j < message.nodes.length; ++j)
                    object.nodes[j] = $root.taskgraph.DependencyGraphNode.toObject(message.nodes[j], options);
            }
            if (message.edges && message.edges.length) {
                object.edges = [];
                for (let j = 0; j < message.edges.length; ++j)
                    object.edges[j] = $root.taskgraph.DependencyEdge.toObject(message.edges[j], options);
            }
            return object;
        };

        /**
         * Converts this DependencyGraph to JSON.
         * @function toJSON
         * @memberof taskgraph.DependencyGraph
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        DependencyGraph.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for DependencyGraph
         * @function getTypeUrl
         * @memberof taskgraph.DependencyGraph
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        DependencyGraph.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/taskgraph.DependencyGraph";
        };

        return DependencyGraph;
    })();

    taskgraph.DependencyEdge = (function() {

        /**
         * Properties of a DependencyEdge.
         * @memberof taskgraph
         * @interface IDependencyEdge
         * @property {string|null} [from] DependencyEdge from
         * @property {string|null} [to] DependencyEdge to
         * @property {boolean|null} [allowSkip] DependencyEdge allowSkip
         */

        /**
         * Constructs a new DependencyEdge.
         * @memberof taskgraph
         * @classdesc Represents a DependencyEdge.
         * @implements IDependencyEdge
         * @constructor
         * @param {taskgraph.IDependencyEdge=} [properties] Properties to set
         */
        function DependencyEdge(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * DependencyEdge from.
         * @member {string} from
         * @memberof taskgraph.DependencyEdge
         * @instance
         */
        DependencyEdge.prototype.from = "";

        /**
         * DependencyEdge to.
         * @member {string} to
         * @memberof taskgraph.DependencyEdge
         * @instance
         */
        DependencyEdge.prototype.to = "";

        /**
         * DependencyEdge allowSkip.
         * @member {boolean} allowSkip
         * @memberof taskgraph.DependencyEdge
         * @instance
         */
        DependencyEdge.prototype.allowSkip = false;

        /**
         * Creates a new DependencyEdge instance using the specified properties.
         * @function create
         * @memberof taskgraph.DependencyEdge
         * @static
         * @param {taskgraph.IDependencyEdge=} [properties] Properties to set
         * @returns {taskgraph.DependencyEdge} DependencyEdge instance
         */
        DependencyEdge.create = function create(properties) {
            return new DependencyEdge(properties);
        };

        /**
         * Encodes the specified DependencyEdge message. Does not implicitly {@link taskgraph.DependencyEdge.verify|verify} messages.
         * @function encode
         * @memberof taskgraph.DependencyEdge
         * @static
         * @param {taskgraph.IDependencyEdge} message DependencyEdge message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DependencyEdge.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.from != null && Object.hasOwnProperty.call(message, "from"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.from);
            if (message.to != null && Object.hasOwnProperty.call(message, "to"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.to);
            if (message.allowSkip != null && Object.hasOwnProperty.call(message, "allowSkip"))
                writer.uint32(/* id 3, wireType 0 =*/24).bool(message.allowSkip);
            return writer;
        };

        /**
         * Encodes the specified DependencyEdge message, length delimited. Does not implicitly {@link taskgraph.DependencyEdge.verify|verify} messages.
         * @function encodeDelimited
         * @memberof taskgraph.DependencyEdge
         * @static
         * @param {taskgraph.IDependencyEdge} message DependencyEdge message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DependencyEdge.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a DependencyEdge message from the specified reader or buffer.
         * @function decode
         * @memberof taskgraph.DependencyEdge
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {taskgraph.DependencyEdge} DependencyEdge
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DependencyEdge.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.taskgraph.DependencyEdge();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.from = reader.string();
                        break;
                    }
                case 2: {
                        message.to = reader.string();
                        break;
                    }
                case 3: {
                        message.allowSkip = reader.bool();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a DependencyEdge message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof taskgraph.DependencyEdge
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {taskgraph.DependencyEdge} DependencyEdge
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DependencyEdge.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a DependencyEdge message.
         * @function verify
         * @memberof taskgraph.DependencyEdge
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        DependencyEdge.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.from != null && message.hasOwnProperty("from"))
                if (!$util.isString(message.from))
                    return "from: string expected";
            if (message.to != null && message.hasOwnProperty("to"))
                if (!$util.isString(message.to))
                    return "to: string expected";
            if (message.allowSkip != null && message.hasOwnProperty("allowSkip"))
                if (typeof message.allowSkip !== "boolean")
                    return "allowSkip: boolean expected";
            return null;
        };

        /**
         * Creates a DependencyEdge message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof taskgraph.DependencyEdge
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {taskgraph.DependencyEdge} DependencyEdge
         */
        DependencyEdge.fromObject = function fromObject(object) {
            if (object instanceof $root.taskgraph.DependencyEdge)
                return object;
            let message = new $root.taskgraph.DependencyEdge();
            if (object.from != null)
                message.from = String(object.from);
            if (object.to != null)
                message.to = String(object.to);
            if (object.allowSkip != null)
                message.allowSkip = Boolean(object.allowSkip);
            return message;
        };

        /**
         * Creates a plain object from a DependencyEdge message. Also converts values to other types if specified.
         * @function toObject
         * @memberof taskgraph.DependencyEdge
         * @static
         * @param {taskgraph.DependencyEdge} message DependencyEdge
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        DependencyEdge.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.from = "";
                object.to = "";
                object.allowSkip = false;
            }
            if (message.from != null && message.hasOwnProperty("from"))
                object.from = message.from;
            if (message.to != null && message.hasOwnProperty("to"))
                object.to = message.to;
            if (message.allowSkip != null && message.hasOwnProperty("allowSkip"))
                object.allowSkip = message.allowSkip;
            return object;
        };

        /**
         * Converts this DependencyEdge to JSON.
         * @function toJSON
         * @memberof taskgraph.DependencyEdge
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        DependencyEdge.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for DependencyEdge
         * @function getTypeUrl
         * @memberof taskgraph.DependencyEdge
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        DependencyEdge.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/taskgraph.DependencyEdge";
        };

        return DependencyEdge;
    })();

    taskgraph.Checkpoint = (function() {

        /**
         * Properties of a Checkpoint.
         * @memberof taskgraph
         * @interface ICheckpoint
         * @property {string|null} [id] Checkpoint id
         * @property {Uint8Array|null} [checkpointData] Checkpoint checkpointData
         * @property {string|null} [checkpointType] Checkpoint checkpointType
         * @property {string|null} [expiresAt] Checkpoint expiresAt
         * @property {number|null} [restoredCount] Checkpoint restoredCount
         * @property {string|null} [createdAt] Checkpoint createdAt
         * @property {string|null} [updatedAt] Checkpoint updatedAt
         * @property {string|null} [taskId] Checkpoint taskId
         */

        /**
         * Constructs a new Checkpoint.
         * @memberof taskgraph
         * @classdesc Represents a Checkpoint.
         * @implements ICheckpoint
         * @constructor
         * @param {taskgraph.ICheckpoint=} [properties] Properties to set
         */
        function Checkpoint(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Checkpoint id.
         * @member {string} id
         * @memberof taskgraph.Checkpoint
         * @instance
         */
        Checkpoint.prototype.id = "";

        /**
         * Checkpoint checkpointData.
         * @member {Uint8Array} checkpointData
         * @memberof taskgraph.Checkpoint
         * @instance
         */
        Checkpoint.prototype.checkpointData = $util.newBuffer([]);

        /**
         * Checkpoint checkpointType.
         * @member {string} checkpointType
         * @memberof taskgraph.Checkpoint
         * @instance
         */
        Checkpoint.prototype.checkpointType = "";

        /**
         * Checkpoint expiresAt.
         * @member {string|null|undefined} expiresAt
         * @memberof taskgraph.Checkpoint
         * @instance
         */
        Checkpoint.prototype.expiresAt = null;

        /**
         * Checkpoint restoredCount.
         * @member {number} restoredCount
         * @memberof taskgraph.Checkpoint
         * @instance
         */
        Checkpoint.prototype.restoredCount = 0;

        /**
         * Checkpoint createdAt.
         * @member {string} createdAt
         * @memberof taskgraph.Checkpoint
         * @instance
         */
        Checkpoint.prototype.createdAt = "";

        /**
         * Checkpoint updatedAt.
         * @member {string} updatedAt
         * @memberof taskgraph.Checkpoint
         * @instance
         */
        Checkpoint.prototype.updatedAt = "";

        /**
         * Checkpoint taskId.
         * @member {string} taskId
         * @memberof taskgraph.Checkpoint
         * @instance
         */
        Checkpoint.prototype.taskId = "";

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(Checkpoint.prototype, "_expiresAt", {
            get: $util.oneOfGetter($oneOfFields = ["expiresAt"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new Checkpoint instance using the specified properties.
         * @function create
         * @memberof taskgraph.Checkpoint
         * @static
         * @param {taskgraph.ICheckpoint=} [properties] Properties to set
         * @returns {taskgraph.Checkpoint} Checkpoint instance
         */
        Checkpoint.create = function create(properties) {
            return new Checkpoint(properties);
        };

        /**
         * Encodes the specified Checkpoint message. Does not implicitly {@link taskgraph.Checkpoint.verify|verify} messages.
         * @function encode
         * @memberof taskgraph.Checkpoint
         * @static
         * @param {taskgraph.ICheckpoint} message Checkpoint message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Checkpoint.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.checkpointData != null && Object.hasOwnProperty.call(message, "checkpointData"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.checkpointData);
            if (message.checkpointType != null && Object.hasOwnProperty.call(message, "checkpointType"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.checkpointType);
            if (message.expiresAt != null && Object.hasOwnProperty.call(message, "expiresAt"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.expiresAt);
            if (message.restoredCount != null && Object.hasOwnProperty.call(message, "restoredCount"))
                writer.uint32(/* id 5, wireType 0 =*/40).int32(message.restoredCount);
            if (message.createdAt != null && Object.hasOwnProperty.call(message, "createdAt"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.createdAt);
            if (message.updatedAt != null && Object.hasOwnProperty.call(message, "updatedAt"))
                writer.uint32(/* id 7, wireType 2 =*/58).string(message.updatedAt);
            if (message.taskId != null && Object.hasOwnProperty.call(message, "taskId"))
                writer.uint32(/* id 8, wireType 2 =*/66).string(message.taskId);
            return writer;
        };

        /**
         * Encodes the specified Checkpoint message, length delimited. Does not implicitly {@link taskgraph.Checkpoint.verify|verify} messages.
         * @function encodeDelimited
         * @memberof taskgraph.Checkpoint
         * @static
         * @param {taskgraph.ICheckpoint} message Checkpoint message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Checkpoint.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Checkpoint message from the specified reader or buffer.
         * @function decode
         * @memberof taskgraph.Checkpoint
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {taskgraph.Checkpoint} Checkpoint
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Checkpoint.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.taskgraph.Checkpoint();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.id = reader.string();
                        break;
                    }
                case 2: {
                        message.checkpointData = reader.bytes();
                        break;
                    }
                case 3: {
                        message.checkpointType = reader.string();
                        break;
                    }
                case 4: {
                        message.expiresAt = reader.string();
                        break;
                    }
                case 5: {
                        message.restoredCount = reader.int32();
                        break;
                    }
                case 6: {
                        message.createdAt = reader.string();
                        break;
                    }
                case 7: {
                        message.updatedAt = reader.string();
                        break;
                    }
                case 8: {
                        message.taskId = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Checkpoint message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof taskgraph.Checkpoint
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {taskgraph.Checkpoint} Checkpoint
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Checkpoint.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Checkpoint message.
         * @function verify
         * @memberof taskgraph.Checkpoint
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Checkpoint.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.checkpointData != null && message.hasOwnProperty("checkpointData"))
                if (!(message.checkpointData && typeof message.checkpointData.length === "number" || $util.isString(message.checkpointData)))
                    return "checkpointData: buffer expected";
            if (message.checkpointType != null && message.hasOwnProperty("checkpointType"))
                if (!$util.isString(message.checkpointType))
                    return "checkpointType: string expected";
            if (message.expiresAt != null && message.hasOwnProperty("expiresAt")) {
                properties._expiresAt = 1;
                if (!$util.isString(message.expiresAt))
                    return "expiresAt: string expected";
            }
            if (message.restoredCount != null && message.hasOwnProperty("restoredCount"))
                if (!$util.isInteger(message.restoredCount))
                    return "restoredCount: integer expected";
            if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                if (!$util.isString(message.createdAt))
                    return "createdAt: string expected";
            if (message.updatedAt != null && message.hasOwnProperty("updatedAt"))
                if (!$util.isString(message.updatedAt))
                    return "updatedAt: string expected";
            if (message.taskId != null && message.hasOwnProperty("taskId"))
                if (!$util.isString(message.taskId))
                    return "taskId: string expected";
            return null;
        };

        /**
         * Creates a Checkpoint message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof taskgraph.Checkpoint
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {taskgraph.Checkpoint} Checkpoint
         */
        Checkpoint.fromObject = function fromObject(object) {
            if (object instanceof $root.taskgraph.Checkpoint)
                return object;
            let message = new $root.taskgraph.Checkpoint();
            if (object.id != null)
                message.id = String(object.id);
            if (object.checkpointData != null)
                if (typeof object.checkpointData === "string")
                    $util.base64.decode(object.checkpointData, message.checkpointData = $util.newBuffer($util.base64.length(object.checkpointData)), 0);
                else if (object.checkpointData.length >= 0)
                    message.checkpointData = object.checkpointData;
            if (object.checkpointType != null)
                message.checkpointType = String(object.checkpointType);
            if (object.expiresAt != null)
                message.expiresAt = String(object.expiresAt);
            if (object.restoredCount != null)
                message.restoredCount = object.restoredCount | 0;
            if (object.createdAt != null)
                message.createdAt = String(object.createdAt);
            if (object.updatedAt != null)
                message.updatedAt = String(object.updatedAt);
            if (object.taskId != null)
                message.taskId = String(object.taskId);
            return message;
        };

        /**
         * Creates a plain object from a Checkpoint message. Also converts values to other types if specified.
         * @function toObject
         * @memberof taskgraph.Checkpoint
         * @static
         * @param {taskgraph.Checkpoint} message Checkpoint
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Checkpoint.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.id = "";
                if (options.bytes === String)
                    object.checkpointData = "";
                else {
                    object.checkpointData = [];
                    if (options.bytes !== Array)
                        object.checkpointData = $util.newBuffer(object.checkpointData);
                }
                object.checkpointType = "";
                object.restoredCount = 0;
                object.createdAt = "";
                object.updatedAt = "";
                object.taskId = "";
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.checkpointData != null && message.hasOwnProperty("checkpointData"))
                object.checkpointData = options.bytes === String ? $util.base64.encode(message.checkpointData, 0, message.checkpointData.length) : options.bytes === Array ? Array.prototype.slice.call(message.checkpointData) : message.checkpointData;
            if (message.checkpointType != null && message.hasOwnProperty("checkpointType"))
                object.checkpointType = message.checkpointType;
            if (message.expiresAt != null && message.hasOwnProperty("expiresAt")) {
                object.expiresAt = message.expiresAt;
                if (options.oneofs)
                    object._expiresAt = "expiresAt";
            }
            if (message.restoredCount != null && message.hasOwnProperty("restoredCount"))
                object.restoredCount = message.restoredCount;
            if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                object.createdAt = message.createdAt;
            if (message.updatedAt != null && message.hasOwnProperty("updatedAt"))
                object.updatedAt = message.updatedAt;
            if (message.taskId != null && message.hasOwnProperty("taskId"))
                object.taskId = message.taskId;
            return object;
        };

        /**
         * Converts this Checkpoint to JSON.
         * @function toJSON
         * @memberof taskgraph.Checkpoint
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Checkpoint.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Checkpoint
         * @function getTypeUrl
         * @memberof taskgraph.Checkpoint
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Checkpoint.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/taskgraph.Checkpoint";
        };

        return Checkpoint;
    })();

    taskgraph.SaveCheckpointRequest = (function() {

        /**
         * Properties of a SaveCheckpointRequest.
         * @memberof taskgraph
         * @interface ISaveCheckpointRequest
         * @property {string|null} [taskId] SaveCheckpointRequest taskId
         * @property {Uint8Array|null} [checkpointData] SaveCheckpointRequest checkpointData
         * @property {string|null} [checkpointType] SaveCheckpointRequest checkpointType
         * @property {string|null} [description] SaveCheckpointRequest description
         * @property {number|null} [ttlSeconds] SaveCheckpointRequest ttlSeconds
         */

        /**
         * Constructs a new SaveCheckpointRequest.
         * @memberof taskgraph
         * @classdesc Represents a SaveCheckpointRequest.
         * @implements ISaveCheckpointRequest
         * @constructor
         * @param {taskgraph.ISaveCheckpointRequest=} [properties] Properties to set
         */
        function SaveCheckpointRequest(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * SaveCheckpointRequest taskId.
         * @member {string} taskId
         * @memberof taskgraph.SaveCheckpointRequest
         * @instance
         */
        SaveCheckpointRequest.prototype.taskId = "";

        /**
         * SaveCheckpointRequest checkpointData.
         * @member {Uint8Array} checkpointData
         * @memberof taskgraph.SaveCheckpointRequest
         * @instance
         */
        SaveCheckpointRequest.prototype.checkpointData = $util.newBuffer([]);

        /**
         * SaveCheckpointRequest checkpointType.
         * @member {string} checkpointType
         * @memberof taskgraph.SaveCheckpointRequest
         * @instance
         */
        SaveCheckpointRequest.prototype.checkpointType = "";

        /**
         * SaveCheckpointRequest description.
         * @member {string|null|undefined} description
         * @memberof taskgraph.SaveCheckpointRequest
         * @instance
         */
        SaveCheckpointRequest.prototype.description = null;

        /**
         * SaveCheckpointRequest ttlSeconds.
         * @member {number|null|undefined} ttlSeconds
         * @memberof taskgraph.SaveCheckpointRequest
         * @instance
         */
        SaveCheckpointRequest.prototype.ttlSeconds = null;

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(SaveCheckpointRequest.prototype, "_description", {
            get: $util.oneOfGetter($oneOfFields = ["description"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(SaveCheckpointRequest.prototype, "_ttlSeconds", {
            get: $util.oneOfGetter($oneOfFields = ["ttlSeconds"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new SaveCheckpointRequest instance using the specified properties.
         * @function create
         * @memberof taskgraph.SaveCheckpointRequest
         * @static
         * @param {taskgraph.ISaveCheckpointRequest=} [properties] Properties to set
         * @returns {taskgraph.SaveCheckpointRequest} SaveCheckpointRequest instance
         */
        SaveCheckpointRequest.create = function create(properties) {
            return new SaveCheckpointRequest(properties);
        };

        /**
         * Encodes the specified SaveCheckpointRequest message. Does not implicitly {@link taskgraph.SaveCheckpointRequest.verify|verify} messages.
         * @function encode
         * @memberof taskgraph.SaveCheckpointRequest
         * @static
         * @param {taskgraph.ISaveCheckpointRequest} message SaveCheckpointRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        SaveCheckpointRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.taskId != null && Object.hasOwnProperty.call(message, "taskId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.taskId);
            if (message.checkpointData != null && Object.hasOwnProperty.call(message, "checkpointData"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.checkpointData);
            if (message.checkpointType != null && Object.hasOwnProperty.call(message, "checkpointType"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.checkpointType);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.description);
            if (message.ttlSeconds != null && Object.hasOwnProperty.call(message, "ttlSeconds"))
                writer.uint32(/* id 5, wireType 0 =*/40).int32(message.ttlSeconds);
            return writer;
        };

        /**
         * Encodes the specified SaveCheckpointRequest message, length delimited. Does not implicitly {@link taskgraph.SaveCheckpointRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof taskgraph.SaveCheckpointRequest
         * @static
         * @param {taskgraph.ISaveCheckpointRequest} message SaveCheckpointRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        SaveCheckpointRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a SaveCheckpointRequest message from the specified reader or buffer.
         * @function decode
         * @memberof taskgraph.SaveCheckpointRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {taskgraph.SaveCheckpointRequest} SaveCheckpointRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        SaveCheckpointRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.taskgraph.SaveCheckpointRequest();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.taskId = reader.string();
                        break;
                    }
                case 2: {
                        message.checkpointData = reader.bytes();
                        break;
                    }
                case 3: {
                        message.checkpointType = reader.string();
                        break;
                    }
                case 4: {
                        message.description = reader.string();
                        break;
                    }
                case 5: {
                        message.ttlSeconds = reader.int32();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a SaveCheckpointRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof taskgraph.SaveCheckpointRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {taskgraph.SaveCheckpointRequest} SaveCheckpointRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        SaveCheckpointRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a SaveCheckpointRequest message.
         * @function verify
         * @memberof taskgraph.SaveCheckpointRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        SaveCheckpointRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
            if (message.taskId != null && message.hasOwnProperty("taskId"))
                if (!$util.isString(message.taskId))
                    return "taskId: string expected";
            if (message.checkpointData != null && message.hasOwnProperty("checkpointData"))
                if (!(message.checkpointData && typeof message.checkpointData.length === "number" || $util.isString(message.checkpointData)))
                    return "checkpointData: buffer expected";
            if (message.checkpointType != null && message.hasOwnProperty("checkpointType"))
                if (!$util.isString(message.checkpointType))
                    return "checkpointType: string expected";
            if (message.description != null && message.hasOwnProperty("description")) {
                properties._description = 1;
                if (!$util.isString(message.description))
                    return "description: string expected";
            }
            if (message.ttlSeconds != null && message.hasOwnProperty("ttlSeconds")) {
                properties._ttlSeconds = 1;
                if (!$util.isInteger(message.ttlSeconds))
                    return "ttlSeconds: integer expected";
            }
            return null;
        };

        /**
         * Creates a SaveCheckpointRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof taskgraph.SaveCheckpointRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {taskgraph.SaveCheckpointRequest} SaveCheckpointRequest
         */
        SaveCheckpointRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.taskgraph.SaveCheckpointRequest)
                return object;
            let message = new $root.taskgraph.SaveCheckpointRequest();
            if (object.taskId != null)
                message.taskId = String(object.taskId);
            if (object.checkpointData != null)
                if (typeof object.checkpointData === "string")
                    $util.base64.decode(object.checkpointData, message.checkpointData = $util.newBuffer($util.base64.length(object.checkpointData)), 0);
                else if (object.checkpointData.length >= 0)
                    message.checkpointData = object.checkpointData;
            if (object.checkpointType != null)
                message.checkpointType = String(object.checkpointType);
            if (object.description != null)
                message.description = String(object.description);
            if (object.ttlSeconds != null)
                message.ttlSeconds = object.ttlSeconds | 0;
            return message;
        };

        /**
         * Creates a plain object from a SaveCheckpointRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof taskgraph.SaveCheckpointRequest
         * @static
         * @param {taskgraph.SaveCheckpointRequest} message SaveCheckpointRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        SaveCheckpointRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.taskId = "";
                if (options.bytes === String)
                    object.checkpointData = "";
                else {
                    object.checkpointData = [];
                    if (options.bytes !== Array)
                        object.checkpointData = $util.newBuffer(object.checkpointData);
                }
                object.checkpointType = "";
            }
            if (message.taskId != null && message.hasOwnProperty("taskId"))
                object.taskId = message.taskId;
            if (message.checkpointData != null && message.hasOwnProperty("checkpointData"))
                object.checkpointData = options.bytes === String ? $util.base64.encode(message.checkpointData, 0, message.checkpointData.length) : options.bytes === Array ? Array.prototype.slice.call(message.checkpointData) : message.checkpointData;
            if (message.checkpointType != null && message.hasOwnProperty("checkpointType"))
                object.checkpointType = message.checkpointType;
            if (message.description != null && message.hasOwnProperty("description")) {
                object.description = message.description;
                if (options.oneofs)
                    object._description = "description";
            }
            if (message.ttlSeconds != null && message.hasOwnProperty("ttlSeconds")) {
                object.ttlSeconds = message.ttlSeconds;
                if (options.oneofs)
                    object._ttlSeconds = "ttlSeconds";
            }
            return object;
        };

        /**
         * Converts this SaveCheckpointRequest to JSON.
         * @function toJSON
         * @memberof taskgraph.SaveCheckpointRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        SaveCheckpointRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for SaveCheckpointRequest
         * @function getTypeUrl
         * @memberof taskgraph.SaveCheckpointRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        SaveCheckpointRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/taskgraph.SaveCheckpointRequest";
        };

        return SaveCheckpointRequest;
    })();

    taskgraph.RestoreCheckpointRequest = (function() {

        /**
         * Properties of a RestoreCheckpointRequest.
         * @memberof taskgraph
         * @interface IRestoreCheckpointRequest
         * @property {string|null} [checkpointId] RestoreCheckpointRequest checkpointId
         */

        /**
         * Constructs a new RestoreCheckpointRequest.
         * @memberof taskgraph
         * @classdesc Represents a RestoreCheckpointRequest.
         * @implements IRestoreCheckpointRequest
         * @constructor
         * @param {taskgraph.IRestoreCheckpointRequest=} [properties] Properties to set
         */
        function RestoreCheckpointRequest(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * RestoreCheckpointRequest checkpointId.
         * @member {string} checkpointId
         * @memberof taskgraph.RestoreCheckpointRequest
         * @instance
         */
        RestoreCheckpointRequest.prototype.checkpointId = "";

        /**
         * Creates a new RestoreCheckpointRequest instance using the specified properties.
         * @function create
         * @memberof taskgraph.RestoreCheckpointRequest
         * @static
         * @param {taskgraph.IRestoreCheckpointRequest=} [properties] Properties to set
         * @returns {taskgraph.RestoreCheckpointRequest} RestoreCheckpointRequest instance
         */
        RestoreCheckpointRequest.create = function create(properties) {
            return new RestoreCheckpointRequest(properties);
        };

        /**
         * Encodes the specified RestoreCheckpointRequest message. Does not implicitly {@link taskgraph.RestoreCheckpointRequest.verify|verify} messages.
         * @function encode
         * @memberof taskgraph.RestoreCheckpointRequest
         * @static
         * @param {taskgraph.IRestoreCheckpointRequest} message RestoreCheckpointRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RestoreCheckpointRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.checkpointId != null && Object.hasOwnProperty.call(message, "checkpointId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.checkpointId);
            return writer;
        };

        /**
         * Encodes the specified RestoreCheckpointRequest message, length delimited. Does not implicitly {@link taskgraph.RestoreCheckpointRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof taskgraph.RestoreCheckpointRequest
         * @static
         * @param {taskgraph.IRestoreCheckpointRequest} message RestoreCheckpointRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RestoreCheckpointRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a RestoreCheckpointRequest message from the specified reader or buffer.
         * @function decode
         * @memberof taskgraph.RestoreCheckpointRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {taskgraph.RestoreCheckpointRequest} RestoreCheckpointRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RestoreCheckpointRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.taskgraph.RestoreCheckpointRequest();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.checkpointId = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a RestoreCheckpointRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof taskgraph.RestoreCheckpointRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {taskgraph.RestoreCheckpointRequest} RestoreCheckpointRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RestoreCheckpointRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a RestoreCheckpointRequest message.
         * @function verify
         * @memberof taskgraph.RestoreCheckpointRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        RestoreCheckpointRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.checkpointId != null && message.hasOwnProperty("checkpointId"))
                if (!$util.isString(message.checkpointId))
                    return "checkpointId: string expected";
            return null;
        };

        /**
         * Creates a RestoreCheckpointRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof taskgraph.RestoreCheckpointRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {taskgraph.RestoreCheckpointRequest} RestoreCheckpointRequest
         */
        RestoreCheckpointRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.taskgraph.RestoreCheckpointRequest)
                return object;
            let message = new $root.taskgraph.RestoreCheckpointRequest();
            if (object.checkpointId != null)
                message.checkpointId = String(object.checkpointId);
            return message;
        };

        /**
         * Creates a plain object from a RestoreCheckpointRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof taskgraph.RestoreCheckpointRequest
         * @static
         * @param {taskgraph.RestoreCheckpointRequest} message RestoreCheckpointRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        RestoreCheckpointRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults)
                object.checkpointId = "";
            if (message.checkpointId != null && message.hasOwnProperty("checkpointId"))
                object.checkpointId = message.checkpointId;
            return object;
        };

        /**
         * Converts this RestoreCheckpointRequest to JSON.
         * @function toJSON
         * @memberof taskgraph.RestoreCheckpointRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        RestoreCheckpointRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for RestoreCheckpointRequest
         * @function getTypeUrl
         * @memberof taskgraph.RestoreCheckpointRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        RestoreCheckpointRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/taskgraph.RestoreCheckpointRequest";
        };

        return RestoreCheckpointRequest;
    })();

    taskgraph.ExecutionLog = (function() {

        /**
         * Properties of an ExecutionLog.
         * @memberof taskgraph
         * @interface IExecutionLog
         * @property {string|null} [id] ExecutionLog id
         * @property {string|null} [eventType] ExecutionLog eventType
         * @property {Uint8Array|null} [eventData] ExecutionLog eventData
         * @property {string|null} [correlationId] ExecutionLog correlationId
         * @property {string|null} [executionId] ExecutionLog executionId
         * @property {string|null} [parentEventId] ExecutionLog parentEventId
         * @property {string|null} [timestamp] ExecutionLog timestamp
         * @property {string|null} [taskId] ExecutionLog taskId
         * @property {string|null} [stepId] ExecutionLog stepId
         * @property {string|null} [userId] ExecutionLog userId
         */

        /**
         * Constructs a new ExecutionLog.
         * @memberof taskgraph
         * @classdesc Represents an ExecutionLog.
         * @implements IExecutionLog
         * @constructor
         * @param {taskgraph.IExecutionLog=} [properties] Properties to set
         */
        function ExecutionLog(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ExecutionLog id.
         * @member {string} id
         * @memberof taskgraph.ExecutionLog
         * @instance
         */
        ExecutionLog.prototype.id = "";

        /**
         * ExecutionLog eventType.
         * @member {string} eventType
         * @memberof taskgraph.ExecutionLog
         * @instance
         */
        ExecutionLog.prototype.eventType = "";

        /**
         * ExecutionLog eventData.
         * @member {Uint8Array} eventData
         * @memberof taskgraph.ExecutionLog
         * @instance
         */
        ExecutionLog.prototype.eventData = $util.newBuffer([]);

        /**
         * ExecutionLog correlationId.
         * @member {string} correlationId
         * @memberof taskgraph.ExecutionLog
         * @instance
         */
        ExecutionLog.prototype.correlationId = "";

        /**
         * ExecutionLog executionId.
         * @member {string|null|undefined} executionId
         * @memberof taskgraph.ExecutionLog
         * @instance
         */
        ExecutionLog.prototype.executionId = null;

        /**
         * ExecutionLog parentEventId.
         * @member {string|null|undefined} parentEventId
         * @memberof taskgraph.ExecutionLog
         * @instance
         */
        ExecutionLog.prototype.parentEventId = null;

        /**
         * ExecutionLog timestamp.
         * @member {string} timestamp
         * @memberof taskgraph.ExecutionLog
         * @instance
         */
        ExecutionLog.prototype.timestamp = "";

        /**
         * ExecutionLog taskId.
         * @member {string|null|undefined} taskId
         * @memberof taskgraph.ExecutionLog
         * @instance
         */
        ExecutionLog.prototype.taskId = null;

        /**
         * ExecutionLog stepId.
         * @member {string|null|undefined} stepId
         * @memberof taskgraph.ExecutionLog
         * @instance
         */
        ExecutionLog.prototype.stepId = null;

        /**
         * ExecutionLog userId.
         * @member {string|null|undefined} userId
         * @memberof taskgraph.ExecutionLog
         * @instance
         */
        ExecutionLog.prototype.userId = null;

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(ExecutionLog.prototype, "_executionId", {
            get: $util.oneOfGetter($oneOfFields = ["executionId"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(ExecutionLog.prototype, "_parentEventId", {
            get: $util.oneOfGetter($oneOfFields = ["parentEventId"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(ExecutionLog.prototype, "_taskId", {
            get: $util.oneOfGetter($oneOfFields = ["taskId"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(ExecutionLog.prototype, "_stepId", {
            get: $util.oneOfGetter($oneOfFields = ["stepId"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(ExecutionLog.prototype, "_userId", {
            get: $util.oneOfGetter($oneOfFields = ["userId"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new ExecutionLog instance using the specified properties.
         * @function create
         * @memberof taskgraph.ExecutionLog
         * @static
         * @param {taskgraph.IExecutionLog=} [properties] Properties to set
         * @returns {taskgraph.ExecutionLog} ExecutionLog instance
         */
        ExecutionLog.create = function create(properties) {
            return new ExecutionLog(properties);
        };

        /**
         * Encodes the specified ExecutionLog message. Does not implicitly {@link taskgraph.ExecutionLog.verify|verify} messages.
         * @function encode
         * @memberof taskgraph.ExecutionLog
         * @static
         * @param {taskgraph.IExecutionLog} message ExecutionLog message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ExecutionLog.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.eventType != null && Object.hasOwnProperty.call(message, "eventType"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.eventType);
            if (message.eventData != null && Object.hasOwnProperty.call(message, "eventData"))
                writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.eventData);
            if (message.correlationId != null && Object.hasOwnProperty.call(message, "correlationId"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.correlationId);
            if (message.executionId != null && Object.hasOwnProperty.call(message, "executionId"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.executionId);
            if (message.parentEventId != null && Object.hasOwnProperty.call(message, "parentEventId"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.parentEventId);
            if (message.timestamp != null && Object.hasOwnProperty.call(message, "timestamp"))
                writer.uint32(/* id 7, wireType 2 =*/58).string(message.timestamp);
            if (message.taskId != null && Object.hasOwnProperty.call(message, "taskId"))
                writer.uint32(/* id 8, wireType 2 =*/66).string(message.taskId);
            if (message.stepId != null && Object.hasOwnProperty.call(message, "stepId"))
                writer.uint32(/* id 9, wireType 2 =*/74).string(message.stepId);
            if (message.userId != null && Object.hasOwnProperty.call(message, "userId"))
                writer.uint32(/* id 10, wireType 2 =*/82).string(message.userId);
            return writer;
        };

        /**
         * Encodes the specified ExecutionLog message, length delimited. Does not implicitly {@link taskgraph.ExecutionLog.verify|verify} messages.
         * @function encodeDelimited
         * @memberof taskgraph.ExecutionLog
         * @static
         * @param {taskgraph.IExecutionLog} message ExecutionLog message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ExecutionLog.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an ExecutionLog message from the specified reader or buffer.
         * @function decode
         * @memberof taskgraph.ExecutionLog
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {taskgraph.ExecutionLog} ExecutionLog
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ExecutionLog.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.taskgraph.ExecutionLog();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.id = reader.string();
                        break;
                    }
                case 2: {
                        message.eventType = reader.string();
                        break;
                    }
                case 3: {
                        message.eventData = reader.bytes();
                        break;
                    }
                case 4: {
                        message.correlationId = reader.string();
                        break;
                    }
                case 5: {
                        message.executionId = reader.string();
                        break;
                    }
                case 6: {
                        message.parentEventId = reader.string();
                        break;
                    }
                case 7: {
                        message.timestamp = reader.string();
                        break;
                    }
                case 8: {
                        message.taskId = reader.string();
                        break;
                    }
                case 9: {
                        message.stepId = reader.string();
                        break;
                    }
                case 10: {
                        message.userId = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an ExecutionLog message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof taskgraph.ExecutionLog
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {taskgraph.ExecutionLog} ExecutionLog
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ExecutionLog.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an ExecutionLog message.
         * @function verify
         * @memberof taskgraph.ExecutionLog
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ExecutionLog.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.eventType != null && message.hasOwnProperty("eventType"))
                if (!$util.isString(message.eventType))
                    return "eventType: string expected";
            if (message.eventData != null && message.hasOwnProperty("eventData"))
                if (!(message.eventData && typeof message.eventData.length === "number" || $util.isString(message.eventData)))
                    return "eventData: buffer expected";
            if (message.correlationId != null && message.hasOwnProperty("correlationId"))
                if (!$util.isString(message.correlationId))
                    return "correlationId: string expected";
            if (message.executionId != null && message.hasOwnProperty("executionId")) {
                properties._executionId = 1;
                if (!$util.isString(message.executionId))
                    return "executionId: string expected";
            }
            if (message.parentEventId != null && message.hasOwnProperty("parentEventId")) {
                properties._parentEventId = 1;
                if (!$util.isString(message.parentEventId))
                    return "parentEventId: string expected";
            }
            if (message.timestamp != null && message.hasOwnProperty("timestamp"))
                if (!$util.isString(message.timestamp))
                    return "timestamp: string expected";
            if (message.taskId != null && message.hasOwnProperty("taskId")) {
                properties._taskId = 1;
                if (!$util.isString(message.taskId))
                    return "taskId: string expected";
            }
            if (message.stepId != null && message.hasOwnProperty("stepId")) {
                properties._stepId = 1;
                if (!$util.isString(message.stepId))
                    return "stepId: string expected";
            }
            if (message.userId != null && message.hasOwnProperty("userId")) {
                properties._userId = 1;
                if (!$util.isString(message.userId))
                    return "userId: string expected";
            }
            return null;
        };

        /**
         * Creates an ExecutionLog message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof taskgraph.ExecutionLog
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {taskgraph.ExecutionLog} ExecutionLog
         */
        ExecutionLog.fromObject = function fromObject(object) {
            if (object instanceof $root.taskgraph.ExecutionLog)
                return object;
            let message = new $root.taskgraph.ExecutionLog();
            if (object.id != null)
                message.id = String(object.id);
            if (object.eventType != null)
                message.eventType = String(object.eventType);
            if (object.eventData != null)
                if (typeof object.eventData === "string")
                    $util.base64.decode(object.eventData, message.eventData = $util.newBuffer($util.base64.length(object.eventData)), 0);
                else if (object.eventData.length >= 0)
                    message.eventData = object.eventData;
            if (object.correlationId != null)
                message.correlationId = String(object.correlationId);
            if (object.executionId != null)
                message.executionId = String(object.executionId);
            if (object.parentEventId != null)
                message.parentEventId = String(object.parentEventId);
            if (object.timestamp != null)
                message.timestamp = String(object.timestamp);
            if (object.taskId != null)
                message.taskId = String(object.taskId);
            if (object.stepId != null)
                message.stepId = String(object.stepId);
            if (object.userId != null)
                message.userId = String(object.userId);
            return message;
        };

        /**
         * Creates a plain object from an ExecutionLog message. Also converts values to other types if specified.
         * @function toObject
         * @memberof taskgraph.ExecutionLog
         * @static
         * @param {taskgraph.ExecutionLog} message ExecutionLog
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ExecutionLog.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.id = "";
                object.eventType = "";
                if (options.bytes === String)
                    object.eventData = "";
                else {
                    object.eventData = [];
                    if (options.bytes !== Array)
                        object.eventData = $util.newBuffer(object.eventData);
                }
                object.correlationId = "";
                object.timestamp = "";
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.eventType != null && message.hasOwnProperty("eventType"))
                object.eventType = message.eventType;
            if (message.eventData != null && message.hasOwnProperty("eventData"))
                object.eventData = options.bytes === String ? $util.base64.encode(message.eventData, 0, message.eventData.length) : options.bytes === Array ? Array.prototype.slice.call(message.eventData) : message.eventData;
            if (message.correlationId != null && message.hasOwnProperty("correlationId"))
                object.correlationId = message.correlationId;
            if (message.executionId != null && message.hasOwnProperty("executionId")) {
                object.executionId = message.executionId;
                if (options.oneofs)
                    object._executionId = "executionId";
            }
            if (message.parentEventId != null && message.hasOwnProperty("parentEventId")) {
                object.parentEventId = message.parentEventId;
                if (options.oneofs)
                    object._parentEventId = "parentEventId";
            }
            if (message.timestamp != null && message.hasOwnProperty("timestamp"))
                object.timestamp = message.timestamp;
            if (message.taskId != null && message.hasOwnProperty("taskId")) {
                object.taskId = message.taskId;
                if (options.oneofs)
                    object._taskId = "taskId";
            }
            if (message.stepId != null && message.hasOwnProperty("stepId")) {
                object.stepId = message.stepId;
                if (options.oneofs)
                    object._stepId = "stepId";
            }
            if (message.userId != null && message.hasOwnProperty("userId")) {
                object.userId = message.userId;
                if (options.oneofs)
                    object._userId = "userId";
            }
            return object;
        };

        /**
         * Converts this ExecutionLog to JSON.
         * @function toJSON
         * @memberof taskgraph.ExecutionLog
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ExecutionLog.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ExecutionLog
         * @function getTypeUrl
         * @memberof taskgraph.ExecutionLog
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ExecutionLog.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/taskgraph.ExecutionLog";
        };

        return ExecutionLog;
    })();

    taskgraph.ListExecutionLogsRequest = (function() {

        /**
         * Properties of a ListExecutionLogsRequest.
         * @memberof taskgraph
         * @interface IListExecutionLogsRequest
         * @property {number|null} [limit] ListExecutionLogsRequest limit
         * @property {number|null} [offset] ListExecutionLogsRequest offset
         * @property {string|null} [taskId] ListExecutionLogsRequest taskId
         * @property {string|null} [stepId] ListExecutionLogsRequest stepId
         * @property {string|null} [eventType] ListExecutionLogsRequest eventType
         * @property {string|null} [correlationId] ListExecutionLogsRequest correlationId
         * @property {string|null} [executionId] ListExecutionLogsRequest executionId
         */

        /**
         * Constructs a new ListExecutionLogsRequest.
         * @memberof taskgraph
         * @classdesc Represents a ListExecutionLogsRequest.
         * @implements IListExecutionLogsRequest
         * @constructor
         * @param {taskgraph.IListExecutionLogsRequest=} [properties] Properties to set
         */
        function ListExecutionLogsRequest(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ListExecutionLogsRequest limit.
         * @member {number} limit
         * @memberof taskgraph.ListExecutionLogsRequest
         * @instance
         */
        ListExecutionLogsRequest.prototype.limit = 0;

        /**
         * ListExecutionLogsRequest offset.
         * @member {number} offset
         * @memberof taskgraph.ListExecutionLogsRequest
         * @instance
         */
        ListExecutionLogsRequest.prototype.offset = 0;

        /**
         * ListExecutionLogsRequest taskId.
         * @member {string|null|undefined} taskId
         * @memberof taskgraph.ListExecutionLogsRequest
         * @instance
         */
        ListExecutionLogsRequest.prototype.taskId = null;

        /**
         * ListExecutionLogsRequest stepId.
         * @member {string|null|undefined} stepId
         * @memberof taskgraph.ListExecutionLogsRequest
         * @instance
         */
        ListExecutionLogsRequest.prototype.stepId = null;

        /**
         * ListExecutionLogsRequest eventType.
         * @member {string|null|undefined} eventType
         * @memberof taskgraph.ListExecutionLogsRequest
         * @instance
         */
        ListExecutionLogsRequest.prototype.eventType = null;

        /**
         * ListExecutionLogsRequest correlationId.
         * @member {string|null|undefined} correlationId
         * @memberof taskgraph.ListExecutionLogsRequest
         * @instance
         */
        ListExecutionLogsRequest.prototype.correlationId = null;

        /**
         * ListExecutionLogsRequest executionId.
         * @member {string|null|undefined} executionId
         * @memberof taskgraph.ListExecutionLogsRequest
         * @instance
         */
        ListExecutionLogsRequest.prototype.executionId = null;

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(ListExecutionLogsRequest.prototype, "_taskId", {
            get: $util.oneOfGetter($oneOfFields = ["taskId"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(ListExecutionLogsRequest.prototype, "_stepId", {
            get: $util.oneOfGetter($oneOfFields = ["stepId"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(ListExecutionLogsRequest.prototype, "_eventType", {
            get: $util.oneOfGetter($oneOfFields = ["eventType"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(ListExecutionLogsRequest.prototype, "_correlationId", {
            get: $util.oneOfGetter($oneOfFields = ["correlationId"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(ListExecutionLogsRequest.prototype, "_executionId", {
            get: $util.oneOfGetter($oneOfFields = ["executionId"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new ListExecutionLogsRequest instance using the specified properties.
         * @function create
         * @memberof taskgraph.ListExecutionLogsRequest
         * @static
         * @param {taskgraph.IListExecutionLogsRequest=} [properties] Properties to set
         * @returns {taskgraph.ListExecutionLogsRequest} ListExecutionLogsRequest instance
         */
        ListExecutionLogsRequest.create = function create(properties) {
            return new ListExecutionLogsRequest(properties);
        };

        /**
         * Encodes the specified ListExecutionLogsRequest message. Does not implicitly {@link taskgraph.ListExecutionLogsRequest.verify|verify} messages.
         * @function encode
         * @memberof taskgraph.ListExecutionLogsRequest
         * @static
         * @param {taskgraph.IListExecutionLogsRequest} message ListExecutionLogsRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ListExecutionLogsRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.limit != null && Object.hasOwnProperty.call(message, "limit"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.limit);
            if (message.offset != null && Object.hasOwnProperty.call(message, "offset"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.offset);
            if (message.taskId != null && Object.hasOwnProperty.call(message, "taskId"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.taskId);
            if (message.stepId != null && Object.hasOwnProperty.call(message, "stepId"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.stepId);
            if (message.eventType != null && Object.hasOwnProperty.call(message, "eventType"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.eventType);
            if (message.correlationId != null && Object.hasOwnProperty.call(message, "correlationId"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.correlationId);
            if (message.executionId != null && Object.hasOwnProperty.call(message, "executionId"))
                writer.uint32(/* id 7, wireType 2 =*/58).string(message.executionId);
            return writer;
        };

        /**
         * Encodes the specified ListExecutionLogsRequest message, length delimited. Does not implicitly {@link taskgraph.ListExecutionLogsRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof taskgraph.ListExecutionLogsRequest
         * @static
         * @param {taskgraph.IListExecutionLogsRequest} message ListExecutionLogsRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ListExecutionLogsRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ListExecutionLogsRequest message from the specified reader or buffer.
         * @function decode
         * @memberof taskgraph.ListExecutionLogsRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {taskgraph.ListExecutionLogsRequest} ListExecutionLogsRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ListExecutionLogsRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.taskgraph.ListExecutionLogsRequest();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.limit = reader.int32();
                        break;
                    }
                case 2: {
                        message.offset = reader.int32();
                        break;
                    }
                case 3: {
                        message.taskId = reader.string();
                        break;
                    }
                case 4: {
                        message.stepId = reader.string();
                        break;
                    }
                case 5: {
                        message.eventType = reader.string();
                        break;
                    }
                case 6: {
                        message.correlationId = reader.string();
                        break;
                    }
                case 7: {
                        message.executionId = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a ListExecutionLogsRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof taskgraph.ListExecutionLogsRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {taskgraph.ListExecutionLogsRequest} ListExecutionLogsRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ListExecutionLogsRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ListExecutionLogsRequest message.
         * @function verify
         * @memberof taskgraph.ListExecutionLogsRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ListExecutionLogsRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
            if (message.limit != null && message.hasOwnProperty("limit"))
                if (!$util.isInteger(message.limit))
                    return "limit: integer expected";
            if (message.offset != null && message.hasOwnProperty("offset"))
                if (!$util.isInteger(message.offset))
                    return "offset: integer expected";
            if (message.taskId != null && message.hasOwnProperty("taskId")) {
                properties._taskId = 1;
                if (!$util.isString(message.taskId))
                    return "taskId: string expected";
            }
            if (message.stepId != null && message.hasOwnProperty("stepId")) {
                properties._stepId = 1;
                if (!$util.isString(message.stepId))
                    return "stepId: string expected";
            }
            if (message.eventType != null && message.hasOwnProperty("eventType")) {
                properties._eventType = 1;
                if (!$util.isString(message.eventType))
                    return "eventType: string expected";
            }
            if (message.correlationId != null && message.hasOwnProperty("correlationId")) {
                properties._correlationId = 1;
                if (!$util.isString(message.correlationId))
                    return "correlationId: string expected";
            }
            if (message.executionId != null && message.hasOwnProperty("executionId")) {
                properties._executionId = 1;
                if (!$util.isString(message.executionId))
                    return "executionId: string expected";
            }
            return null;
        };

        /**
         * Creates a ListExecutionLogsRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof taskgraph.ListExecutionLogsRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {taskgraph.ListExecutionLogsRequest} ListExecutionLogsRequest
         */
        ListExecutionLogsRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.taskgraph.ListExecutionLogsRequest)
                return object;
            let message = new $root.taskgraph.ListExecutionLogsRequest();
            if (object.limit != null)
                message.limit = object.limit | 0;
            if (object.offset != null)
                message.offset = object.offset | 0;
            if (object.taskId != null)
                message.taskId = String(object.taskId);
            if (object.stepId != null)
                message.stepId = String(object.stepId);
            if (object.eventType != null)
                message.eventType = String(object.eventType);
            if (object.correlationId != null)
                message.correlationId = String(object.correlationId);
            if (object.executionId != null)
                message.executionId = String(object.executionId);
            return message;
        };

        /**
         * Creates a plain object from a ListExecutionLogsRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof taskgraph.ListExecutionLogsRequest
         * @static
         * @param {taskgraph.ListExecutionLogsRequest} message ListExecutionLogsRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ListExecutionLogsRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.limit = 0;
                object.offset = 0;
            }
            if (message.limit != null && message.hasOwnProperty("limit"))
                object.limit = message.limit;
            if (message.offset != null && message.hasOwnProperty("offset"))
                object.offset = message.offset;
            if (message.taskId != null && message.hasOwnProperty("taskId")) {
                object.taskId = message.taskId;
                if (options.oneofs)
                    object._taskId = "taskId";
            }
            if (message.stepId != null && message.hasOwnProperty("stepId")) {
                object.stepId = message.stepId;
                if (options.oneofs)
                    object._stepId = "stepId";
            }
            if (message.eventType != null && message.hasOwnProperty("eventType")) {
                object.eventType = message.eventType;
                if (options.oneofs)
                    object._eventType = "eventType";
            }
            if (message.correlationId != null && message.hasOwnProperty("correlationId")) {
                object.correlationId = message.correlationId;
                if (options.oneofs)
                    object._correlationId = "correlationId";
            }
            if (message.executionId != null && message.hasOwnProperty("executionId")) {
                object.executionId = message.executionId;
                if (options.oneofs)
                    object._executionId = "executionId";
            }
            return object;
        };

        /**
         * Converts this ListExecutionLogsRequest to JSON.
         * @function toJSON
         * @memberof taskgraph.ListExecutionLogsRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ListExecutionLogsRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ListExecutionLogsRequest
         * @function getTypeUrl
         * @memberof taskgraph.ListExecutionLogsRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ListExecutionLogsRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/taskgraph.ListExecutionLogsRequest";
        };

        return ListExecutionLogsRequest;
    })();

    taskgraph.ListExecutionLogsResponse = (function() {

        /**
         * Properties of a ListExecutionLogsResponse.
         * @memberof taskgraph
         * @interface IListExecutionLogsResponse
         * @property {Array.<taskgraph.IExecutionLog>|null} [logs] ListExecutionLogsResponse logs
         * @property {taskgraph.IPagination|null} [pagination] ListExecutionLogsResponse pagination
         */

        /**
         * Constructs a new ListExecutionLogsResponse.
         * @memberof taskgraph
         * @classdesc Represents a ListExecutionLogsResponse.
         * @implements IListExecutionLogsResponse
         * @constructor
         * @param {taskgraph.IListExecutionLogsResponse=} [properties] Properties to set
         */
        function ListExecutionLogsResponse(properties) {
            this.logs = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ListExecutionLogsResponse logs.
         * @member {Array.<taskgraph.IExecutionLog>} logs
         * @memberof taskgraph.ListExecutionLogsResponse
         * @instance
         */
        ListExecutionLogsResponse.prototype.logs = $util.emptyArray;

        /**
         * ListExecutionLogsResponse pagination.
         * @member {taskgraph.IPagination|null|undefined} pagination
         * @memberof taskgraph.ListExecutionLogsResponse
         * @instance
         */
        ListExecutionLogsResponse.prototype.pagination = null;

        /**
         * Creates a new ListExecutionLogsResponse instance using the specified properties.
         * @function create
         * @memberof taskgraph.ListExecutionLogsResponse
         * @static
         * @param {taskgraph.IListExecutionLogsResponse=} [properties] Properties to set
         * @returns {taskgraph.ListExecutionLogsResponse} ListExecutionLogsResponse instance
         */
        ListExecutionLogsResponse.create = function create(properties) {
            return new ListExecutionLogsResponse(properties);
        };

        /**
         * Encodes the specified ListExecutionLogsResponse message. Does not implicitly {@link taskgraph.ListExecutionLogsResponse.verify|verify} messages.
         * @function encode
         * @memberof taskgraph.ListExecutionLogsResponse
         * @static
         * @param {taskgraph.IListExecutionLogsResponse} message ListExecutionLogsResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ListExecutionLogsResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.logs != null && message.logs.length)
                for (let i = 0; i < message.logs.length; ++i)
                    $root.taskgraph.ExecutionLog.encode(message.logs[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.pagination != null && Object.hasOwnProperty.call(message, "pagination"))
                $root.taskgraph.Pagination.encode(message.pagination, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified ListExecutionLogsResponse message, length delimited. Does not implicitly {@link taskgraph.ListExecutionLogsResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof taskgraph.ListExecutionLogsResponse
         * @static
         * @param {taskgraph.IListExecutionLogsResponse} message ListExecutionLogsResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ListExecutionLogsResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ListExecutionLogsResponse message from the specified reader or buffer.
         * @function decode
         * @memberof taskgraph.ListExecutionLogsResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {taskgraph.ListExecutionLogsResponse} ListExecutionLogsResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ListExecutionLogsResponse.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.taskgraph.ListExecutionLogsResponse();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.logs && message.logs.length))
                            message.logs = [];
                        message.logs.push($root.taskgraph.ExecutionLog.decode(reader, reader.uint32()));
                        break;
                    }
                case 2: {
                        message.pagination = $root.taskgraph.Pagination.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a ListExecutionLogsResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof taskgraph.ListExecutionLogsResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {taskgraph.ListExecutionLogsResponse} ListExecutionLogsResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ListExecutionLogsResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ListExecutionLogsResponse message.
         * @function verify
         * @memberof taskgraph.ListExecutionLogsResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ListExecutionLogsResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.logs != null && message.hasOwnProperty("logs")) {
                if (!Array.isArray(message.logs))
                    return "logs: array expected";
                for (let i = 0; i < message.logs.length; ++i) {
                    let error = $root.taskgraph.ExecutionLog.verify(message.logs[i]);
                    if (error)
                        return "logs." + error;
                }
            }
            if (message.pagination != null && message.hasOwnProperty("pagination")) {
                let error = $root.taskgraph.Pagination.verify(message.pagination);
                if (error)
                    return "pagination." + error;
            }
            return null;
        };

        /**
         * Creates a ListExecutionLogsResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof taskgraph.ListExecutionLogsResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {taskgraph.ListExecutionLogsResponse} ListExecutionLogsResponse
         */
        ListExecutionLogsResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.taskgraph.ListExecutionLogsResponse)
                return object;
            let message = new $root.taskgraph.ListExecutionLogsResponse();
            if (object.logs) {
                if (!Array.isArray(object.logs))
                    throw TypeError(".taskgraph.ListExecutionLogsResponse.logs: array expected");
                message.logs = [];
                for (let i = 0; i < object.logs.length; ++i) {
                    if (typeof object.logs[i] !== "object")
                        throw TypeError(".taskgraph.ListExecutionLogsResponse.logs: object expected");
                    message.logs[i] = $root.taskgraph.ExecutionLog.fromObject(object.logs[i]);
                }
            }
            if (object.pagination != null) {
                if (typeof object.pagination !== "object")
                    throw TypeError(".taskgraph.ListExecutionLogsResponse.pagination: object expected");
                message.pagination = $root.taskgraph.Pagination.fromObject(object.pagination);
            }
            return message;
        };

        /**
         * Creates a plain object from a ListExecutionLogsResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof taskgraph.ListExecutionLogsResponse
         * @static
         * @param {taskgraph.ListExecutionLogsResponse} message ListExecutionLogsResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ListExecutionLogsResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.logs = [];
            if (options.defaults)
                object.pagination = null;
            if (message.logs && message.logs.length) {
                object.logs = [];
                for (let j = 0; j < message.logs.length; ++j)
                    object.logs[j] = $root.taskgraph.ExecutionLog.toObject(message.logs[j], options);
            }
            if (message.pagination != null && message.hasOwnProperty("pagination"))
                object.pagination = $root.taskgraph.Pagination.toObject(message.pagination, options);
            return object;
        };

        /**
         * Converts this ListExecutionLogsResponse to JSON.
         * @function toJSON
         * @memberof taskgraph.ListExecutionLogsResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ListExecutionLogsResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ListExecutionLogsResponse
         * @function getTypeUrl
         * @memberof taskgraph.ListExecutionLogsResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ListExecutionLogsResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/taskgraph.ListExecutionLogsResponse";
        };

        return ListExecutionLogsResponse;
    })();

    taskgraph.WorkflowExecution = (function() {

        /**
         * Properties of a WorkflowExecution.
         * @memberof taskgraph
         * @interface IWorkflowExecution
         * @property {string|null} [id] WorkflowExecution id
         * @property {string|null} [workflowId] WorkflowExecution workflowId
         * @property {string|null} [executionId] WorkflowExecution executionId
         * @property {string|null} [workflowType] WorkflowExecution workflowType
         * @property {taskgraph.WorkflowStatus|null} [status] WorkflowExecution status
         * @property {Uint8Array|null} [graphDefinition] WorkflowExecution graphDefinition
         * @property {string|null} [currentNode] WorkflowExecution currentNode
         * @property {string|null} [startedAt] WorkflowExecution startedAt
         * @property {string|null} [completedAt] WorkflowExecution completedAt
         * @property {string|null} [pausedAt] WorkflowExecution pausedAt
         * @property {string|null} [checkpointId] WorkflowExecution checkpointId
         * @property {string|null} [errorMessage] WorkflowExecution errorMessage
         * @property {Object.<string,string>|null} [metadata] WorkflowExecution metadata
         * @property {string|null} [correlationId] WorkflowExecution correlationId
         * @property {Array.<string>|null} [completedTasks] WorkflowExecution completedTasks
         * @property {Array.<string>|null} [failedTasks] WorkflowExecution failedTasks
         * @property {Array.<string>|null} [skippedTasks] WorkflowExecution skippedTasks
         * @property {string|null} [taskId] WorkflowExecution taskId
         * @property {string|null} [userId] WorkflowExecution userId
         */

        /**
         * Constructs a new WorkflowExecution.
         * @memberof taskgraph
         * @classdesc Represents a WorkflowExecution.
         * @implements IWorkflowExecution
         * @constructor
         * @param {taskgraph.IWorkflowExecution=} [properties] Properties to set
         */
        function WorkflowExecution(properties) {
            this.metadata = {};
            this.completedTasks = [];
            this.failedTasks = [];
            this.skippedTasks = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * WorkflowExecution id.
         * @member {string} id
         * @memberof taskgraph.WorkflowExecution
         * @instance
         */
        WorkflowExecution.prototype.id = "";

        /**
         * WorkflowExecution workflowId.
         * @member {string} workflowId
         * @memberof taskgraph.WorkflowExecution
         * @instance
         */
        WorkflowExecution.prototype.workflowId = "";

        /**
         * WorkflowExecution executionId.
         * @member {string} executionId
         * @memberof taskgraph.WorkflowExecution
         * @instance
         */
        WorkflowExecution.prototype.executionId = "";

        /**
         * WorkflowExecution workflowType.
         * @member {string} workflowType
         * @memberof taskgraph.WorkflowExecution
         * @instance
         */
        WorkflowExecution.prototype.workflowType = "";

        /**
         * WorkflowExecution status.
         * @member {taskgraph.WorkflowStatus} status
         * @memberof taskgraph.WorkflowExecution
         * @instance
         */
        WorkflowExecution.prototype.status = 0;

        /**
         * WorkflowExecution graphDefinition.
         * @member {Uint8Array} graphDefinition
         * @memberof taskgraph.WorkflowExecution
         * @instance
         */
        WorkflowExecution.prototype.graphDefinition = $util.newBuffer([]);

        /**
         * WorkflowExecution currentNode.
         * @member {string|null|undefined} currentNode
         * @memberof taskgraph.WorkflowExecution
         * @instance
         */
        WorkflowExecution.prototype.currentNode = null;

        /**
         * WorkflowExecution startedAt.
         * @member {string} startedAt
         * @memberof taskgraph.WorkflowExecution
         * @instance
         */
        WorkflowExecution.prototype.startedAt = "";

        /**
         * WorkflowExecution completedAt.
         * @member {string|null|undefined} completedAt
         * @memberof taskgraph.WorkflowExecution
         * @instance
         */
        WorkflowExecution.prototype.completedAt = null;

        /**
         * WorkflowExecution pausedAt.
         * @member {string|null|undefined} pausedAt
         * @memberof taskgraph.WorkflowExecution
         * @instance
         */
        WorkflowExecution.prototype.pausedAt = null;

        /**
         * WorkflowExecution checkpointId.
         * @member {string|null|undefined} checkpointId
         * @memberof taskgraph.WorkflowExecution
         * @instance
         */
        WorkflowExecution.prototype.checkpointId = null;

        /**
         * WorkflowExecution errorMessage.
         * @member {string|null|undefined} errorMessage
         * @memberof taskgraph.WorkflowExecution
         * @instance
         */
        WorkflowExecution.prototype.errorMessage = null;

        /**
         * WorkflowExecution metadata.
         * @member {Object.<string,string>} metadata
         * @memberof taskgraph.WorkflowExecution
         * @instance
         */
        WorkflowExecution.prototype.metadata = $util.emptyObject;

        /**
         * WorkflowExecution correlationId.
         * @member {string} correlationId
         * @memberof taskgraph.WorkflowExecution
         * @instance
         */
        WorkflowExecution.prototype.correlationId = "";

        /**
         * WorkflowExecution completedTasks.
         * @member {Array.<string>} completedTasks
         * @memberof taskgraph.WorkflowExecution
         * @instance
         */
        WorkflowExecution.prototype.completedTasks = $util.emptyArray;

        /**
         * WorkflowExecution failedTasks.
         * @member {Array.<string>} failedTasks
         * @memberof taskgraph.WorkflowExecution
         * @instance
         */
        WorkflowExecution.prototype.failedTasks = $util.emptyArray;

        /**
         * WorkflowExecution skippedTasks.
         * @member {Array.<string>} skippedTasks
         * @memberof taskgraph.WorkflowExecution
         * @instance
         */
        WorkflowExecution.prototype.skippedTasks = $util.emptyArray;

        /**
         * WorkflowExecution taskId.
         * @member {string} taskId
         * @memberof taskgraph.WorkflowExecution
         * @instance
         */
        WorkflowExecution.prototype.taskId = "";

        /**
         * WorkflowExecution userId.
         * @member {string|null|undefined} userId
         * @memberof taskgraph.WorkflowExecution
         * @instance
         */
        WorkflowExecution.prototype.userId = null;

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(WorkflowExecution.prototype, "_currentNode", {
            get: $util.oneOfGetter($oneOfFields = ["currentNode"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(WorkflowExecution.prototype, "_completedAt", {
            get: $util.oneOfGetter($oneOfFields = ["completedAt"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(WorkflowExecution.prototype, "_pausedAt", {
            get: $util.oneOfGetter($oneOfFields = ["pausedAt"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(WorkflowExecution.prototype, "_checkpointId", {
            get: $util.oneOfGetter($oneOfFields = ["checkpointId"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(WorkflowExecution.prototype, "_errorMessage", {
            get: $util.oneOfGetter($oneOfFields = ["errorMessage"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(WorkflowExecution.prototype, "_userId", {
            get: $util.oneOfGetter($oneOfFields = ["userId"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new WorkflowExecution instance using the specified properties.
         * @function create
         * @memberof taskgraph.WorkflowExecution
         * @static
         * @param {taskgraph.IWorkflowExecution=} [properties] Properties to set
         * @returns {taskgraph.WorkflowExecution} WorkflowExecution instance
         */
        WorkflowExecution.create = function create(properties) {
            return new WorkflowExecution(properties);
        };

        /**
         * Encodes the specified WorkflowExecution message. Does not implicitly {@link taskgraph.WorkflowExecution.verify|verify} messages.
         * @function encode
         * @memberof taskgraph.WorkflowExecution
         * @static
         * @param {taskgraph.IWorkflowExecution} message WorkflowExecution message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        WorkflowExecution.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.workflowId != null && Object.hasOwnProperty.call(message, "workflowId"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.workflowId);
            if (message.executionId != null && Object.hasOwnProperty.call(message, "executionId"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.executionId);
            if (message.workflowType != null && Object.hasOwnProperty.call(message, "workflowType"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.workflowType);
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 5, wireType 0 =*/40).int32(message.status);
            if (message.graphDefinition != null && Object.hasOwnProperty.call(message, "graphDefinition"))
                writer.uint32(/* id 6, wireType 2 =*/50).bytes(message.graphDefinition);
            if (message.currentNode != null && Object.hasOwnProperty.call(message, "currentNode"))
                writer.uint32(/* id 7, wireType 2 =*/58).string(message.currentNode);
            if (message.startedAt != null && Object.hasOwnProperty.call(message, "startedAt"))
                writer.uint32(/* id 8, wireType 2 =*/66).string(message.startedAt);
            if (message.completedAt != null && Object.hasOwnProperty.call(message, "completedAt"))
                writer.uint32(/* id 9, wireType 2 =*/74).string(message.completedAt);
            if (message.pausedAt != null && Object.hasOwnProperty.call(message, "pausedAt"))
                writer.uint32(/* id 10, wireType 2 =*/82).string(message.pausedAt);
            if (message.checkpointId != null && Object.hasOwnProperty.call(message, "checkpointId"))
                writer.uint32(/* id 11, wireType 2 =*/90).string(message.checkpointId);
            if (message.errorMessage != null && Object.hasOwnProperty.call(message, "errorMessage"))
                writer.uint32(/* id 12, wireType 2 =*/98).string(message.errorMessage);
            if (message.metadata != null && Object.hasOwnProperty.call(message, "metadata"))
                for (let keys = Object.keys(message.metadata), i = 0; i < keys.length; ++i)
                    writer.uint32(/* id 13, wireType 2 =*/106).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]).uint32(/* id 2, wireType 2 =*/18).string(message.metadata[keys[i]]).ldelim();
            if (message.correlationId != null && Object.hasOwnProperty.call(message, "correlationId"))
                writer.uint32(/* id 14, wireType 2 =*/114).string(message.correlationId);
            if (message.completedTasks != null && message.completedTasks.length)
                for (let i = 0; i < message.completedTasks.length; ++i)
                    writer.uint32(/* id 15, wireType 2 =*/122).string(message.completedTasks[i]);
            if (message.failedTasks != null && message.failedTasks.length)
                for (let i = 0; i < message.failedTasks.length; ++i)
                    writer.uint32(/* id 16, wireType 2 =*/130).string(message.failedTasks[i]);
            if (message.skippedTasks != null && message.skippedTasks.length)
                for (let i = 0; i < message.skippedTasks.length; ++i)
                    writer.uint32(/* id 17, wireType 2 =*/138).string(message.skippedTasks[i]);
            if (message.taskId != null && Object.hasOwnProperty.call(message, "taskId"))
                writer.uint32(/* id 18, wireType 2 =*/146).string(message.taskId);
            if (message.userId != null && Object.hasOwnProperty.call(message, "userId"))
                writer.uint32(/* id 19, wireType 2 =*/154).string(message.userId);
            return writer;
        };

        /**
         * Encodes the specified WorkflowExecution message, length delimited. Does not implicitly {@link taskgraph.WorkflowExecution.verify|verify} messages.
         * @function encodeDelimited
         * @memberof taskgraph.WorkflowExecution
         * @static
         * @param {taskgraph.IWorkflowExecution} message WorkflowExecution message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        WorkflowExecution.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a WorkflowExecution message from the specified reader or buffer.
         * @function decode
         * @memberof taskgraph.WorkflowExecution
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {taskgraph.WorkflowExecution} WorkflowExecution
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        WorkflowExecution.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.taskgraph.WorkflowExecution(), key, value;
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.id = reader.string();
                        break;
                    }
                case 2: {
                        message.workflowId = reader.string();
                        break;
                    }
                case 3: {
                        message.executionId = reader.string();
                        break;
                    }
                case 4: {
                        message.workflowType = reader.string();
                        break;
                    }
                case 5: {
                        message.status = reader.int32();
                        break;
                    }
                case 6: {
                        message.graphDefinition = reader.bytes();
                        break;
                    }
                case 7: {
                        message.currentNode = reader.string();
                        break;
                    }
                case 8: {
                        message.startedAt = reader.string();
                        break;
                    }
                case 9: {
                        message.completedAt = reader.string();
                        break;
                    }
                case 10: {
                        message.pausedAt = reader.string();
                        break;
                    }
                case 11: {
                        message.checkpointId = reader.string();
                        break;
                    }
                case 12: {
                        message.errorMessage = reader.string();
                        break;
                    }
                case 13: {
                        if (message.metadata === $util.emptyObject)
                            message.metadata = {};
                        let end2 = reader.uint32() + reader.pos;
                        key = "";
                        value = "";
                        while (reader.pos < end2) {
                            let tag2 = reader.uint32();
                            switch (tag2 >>> 3) {
                            case 1:
                                key = reader.string();
                                break;
                            case 2:
                                value = reader.string();
                                break;
                            default:
                                reader.skipType(tag2 & 7);
                                break;
                            }
                        }
                        message.metadata[key] = value;
                        break;
                    }
                case 14: {
                        message.correlationId = reader.string();
                        break;
                    }
                case 15: {
                        if (!(message.completedTasks && message.completedTasks.length))
                            message.completedTasks = [];
                        message.completedTasks.push(reader.string());
                        break;
                    }
                case 16: {
                        if (!(message.failedTasks && message.failedTasks.length))
                            message.failedTasks = [];
                        message.failedTasks.push(reader.string());
                        break;
                    }
                case 17: {
                        if (!(message.skippedTasks && message.skippedTasks.length))
                            message.skippedTasks = [];
                        message.skippedTasks.push(reader.string());
                        break;
                    }
                case 18: {
                        message.taskId = reader.string();
                        break;
                    }
                case 19: {
                        message.userId = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a WorkflowExecution message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof taskgraph.WorkflowExecution
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {taskgraph.WorkflowExecution} WorkflowExecution
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        WorkflowExecution.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a WorkflowExecution message.
         * @function verify
         * @memberof taskgraph.WorkflowExecution
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        WorkflowExecution.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.workflowId != null && message.hasOwnProperty("workflowId"))
                if (!$util.isString(message.workflowId))
                    return "workflowId: string expected";
            if (message.executionId != null && message.hasOwnProperty("executionId"))
                if (!$util.isString(message.executionId))
                    return "executionId: string expected";
            if (message.workflowType != null && message.hasOwnProperty("workflowType"))
                if (!$util.isString(message.workflowType))
                    return "workflowType: string expected";
            if (message.status != null && message.hasOwnProperty("status"))
                switch (message.status) {
                default:
                    return "status: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                    break;
                }
            if (message.graphDefinition != null && message.hasOwnProperty("graphDefinition"))
                if (!(message.graphDefinition && typeof message.graphDefinition.length === "number" || $util.isString(message.graphDefinition)))
                    return "graphDefinition: buffer expected";
            if (message.currentNode != null && message.hasOwnProperty("currentNode")) {
                properties._currentNode = 1;
                if (!$util.isString(message.currentNode))
                    return "currentNode: string expected";
            }
            if (message.startedAt != null && message.hasOwnProperty("startedAt"))
                if (!$util.isString(message.startedAt))
                    return "startedAt: string expected";
            if (message.completedAt != null && message.hasOwnProperty("completedAt")) {
                properties._completedAt = 1;
                if (!$util.isString(message.completedAt))
                    return "completedAt: string expected";
            }
            if (message.pausedAt != null && message.hasOwnProperty("pausedAt")) {
                properties._pausedAt = 1;
                if (!$util.isString(message.pausedAt))
                    return "pausedAt: string expected";
            }
            if (message.checkpointId != null && message.hasOwnProperty("checkpointId")) {
                properties._checkpointId = 1;
                if (!$util.isString(message.checkpointId))
                    return "checkpointId: string expected";
            }
            if (message.errorMessage != null && message.hasOwnProperty("errorMessage")) {
                properties._errorMessage = 1;
                if (!$util.isString(message.errorMessage))
                    return "errorMessage: string expected";
            }
            if (message.metadata != null && message.hasOwnProperty("metadata")) {
                if (!$util.isObject(message.metadata))
                    return "metadata: object expected";
                let key = Object.keys(message.metadata);
                for (let i = 0; i < key.length; ++i)
                    if (!$util.isString(message.metadata[key[i]]))
                        return "metadata: string{k:string} expected";
            }
            if (message.correlationId != null && message.hasOwnProperty("correlationId"))
                if (!$util.isString(message.correlationId))
                    return "correlationId: string expected";
            if (message.completedTasks != null && message.hasOwnProperty("completedTasks")) {
                if (!Array.isArray(message.completedTasks))
                    return "completedTasks: array expected";
                for (let i = 0; i < message.completedTasks.length; ++i)
                    if (!$util.isString(message.completedTasks[i]))
                        return "completedTasks: string[] expected";
            }
            if (message.failedTasks != null && message.hasOwnProperty("failedTasks")) {
                if (!Array.isArray(message.failedTasks))
                    return "failedTasks: array expected";
                for (let i = 0; i < message.failedTasks.length; ++i)
                    if (!$util.isString(message.failedTasks[i]))
                        return "failedTasks: string[] expected";
            }
            if (message.skippedTasks != null && message.hasOwnProperty("skippedTasks")) {
                if (!Array.isArray(message.skippedTasks))
                    return "skippedTasks: array expected";
                for (let i = 0; i < message.skippedTasks.length; ++i)
                    if (!$util.isString(message.skippedTasks[i]))
                        return "skippedTasks: string[] expected";
            }
            if (message.taskId != null && message.hasOwnProperty("taskId"))
                if (!$util.isString(message.taskId))
                    return "taskId: string expected";
            if (message.userId != null && message.hasOwnProperty("userId")) {
                properties._userId = 1;
                if (!$util.isString(message.userId))
                    return "userId: string expected";
            }
            return null;
        };

        /**
         * Creates a WorkflowExecution message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof taskgraph.WorkflowExecution
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {taskgraph.WorkflowExecution} WorkflowExecution
         */
        WorkflowExecution.fromObject = function fromObject(object) {
            if (object instanceof $root.taskgraph.WorkflowExecution)
                return object;
            let message = new $root.taskgraph.WorkflowExecution();
            if (object.id != null)
                message.id = String(object.id);
            if (object.workflowId != null)
                message.workflowId = String(object.workflowId);
            if (object.executionId != null)
                message.executionId = String(object.executionId);
            if (object.workflowType != null)
                message.workflowType = String(object.workflowType);
            switch (object.status) {
            default:
                if (typeof object.status === "number") {
                    message.status = object.status;
                    break;
                }
                break;
            case "WORKFLOW_STATUS_UNSPECIFIED":
            case 0:
                message.status = 0;
                break;
            case "WORKFLOW_STATUS_PENDING":
            case 1:
                message.status = 1;
                break;
            case "WORKFLOW_STATUS_RUNNING":
            case 2:
                message.status = 2;
                break;
            case "WORKFLOW_STATUS_PAUSED":
            case 3:
                message.status = 3;
                break;
            case "WORKFLOW_STATUS_COMPLETED":
            case 4:
                message.status = 4;
                break;
            case "WORKFLOW_STATUS_FAILED":
            case 5:
                message.status = 5;
                break;
            case "WORKFLOW_STATUS_CANCELLED":
            case 6:
                message.status = 6;
                break;
            }
            if (object.graphDefinition != null)
                if (typeof object.graphDefinition === "string")
                    $util.base64.decode(object.graphDefinition, message.graphDefinition = $util.newBuffer($util.base64.length(object.graphDefinition)), 0);
                else if (object.graphDefinition.length >= 0)
                    message.graphDefinition = object.graphDefinition;
            if (object.currentNode != null)
                message.currentNode = String(object.currentNode);
            if (object.startedAt != null)
                message.startedAt = String(object.startedAt);
            if (object.completedAt != null)
                message.completedAt = String(object.completedAt);
            if (object.pausedAt != null)
                message.pausedAt = String(object.pausedAt);
            if (object.checkpointId != null)
                message.checkpointId = String(object.checkpointId);
            if (object.errorMessage != null)
                message.errorMessage = String(object.errorMessage);
            if (object.metadata) {
                if (typeof object.metadata !== "object")
                    throw TypeError(".taskgraph.WorkflowExecution.metadata: object expected");
                message.metadata = {};
                for (let keys = Object.keys(object.metadata), i = 0; i < keys.length; ++i)
                    message.metadata[keys[i]] = String(object.metadata[keys[i]]);
            }
            if (object.correlationId != null)
                message.correlationId = String(object.correlationId);
            if (object.completedTasks) {
                if (!Array.isArray(object.completedTasks))
                    throw TypeError(".taskgraph.WorkflowExecution.completedTasks: array expected");
                message.completedTasks = [];
                for (let i = 0; i < object.completedTasks.length; ++i)
                    message.completedTasks[i] = String(object.completedTasks[i]);
            }
            if (object.failedTasks) {
                if (!Array.isArray(object.failedTasks))
                    throw TypeError(".taskgraph.WorkflowExecution.failedTasks: array expected");
                message.failedTasks = [];
                for (let i = 0; i < object.failedTasks.length; ++i)
                    message.failedTasks[i] = String(object.failedTasks[i]);
            }
            if (object.skippedTasks) {
                if (!Array.isArray(object.skippedTasks))
                    throw TypeError(".taskgraph.WorkflowExecution.skippedTasks: array expected");
                message.skippedTasks = [];
                for (let i = 0; i < object.skippedTasks.length; ++i)
                    message.skippedTasks[i] = String(object.skippedTasks[i]);
            }
            if (object.taskId != null)
                message.taskId = String(object.taskId);
            if (object.userId != null)
                message.userId = String(object.userId);
            return message;
        };

        /**
         * Creates a plain object from a WorkflowExecution message. Also converts values to other types if specified.
         * @function toObject
         * @memberof taskgraph.WorkflowExecution
         * @static
         * @param {taskgraph.WorkflowExecution} message WorkflowExecution
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        WorkflowExecution.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults) {
                object.completedTasks = [];
                object.failedTasks = [];
                object.skippedTasks = [];
            }
            if (options.objects || options.defaults)
                object.metadata = {};
            if (options.defaults) {
                object.id = "";
                object.workflowId = "";
                object.executionId = "";
                object.workflowType = "";
                object.status = options.enums === String ? "WORKFLOW_STATUS_UNSPECIFIED" : 0;
                if (options.bytes === String)
                    object.graphDefinition = "";
                else {
                    object.graphDefinition = [];
                    if (options.bytes !== Array)
                        object.graphDefinition = $util.newBuffer(object.graphDefinition);
                }
                object.startedAt = "";
                object.correlationId = "";
                object.taskId = "";
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.workflowId != null && message.hasOwnProperty("workflowId"))
                object.workflowId = message.workflowId;
            if (message.executionId != null && message.hasOwnProperty("executionId"))
                object.executionId = message.executionId;
            if (message.workflowType != null && message.hasOwnProperty("workflowType"))
                object.workflowType = message.workflowType;
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = options.enums === String ? $root.taskgraph.WorkflowStatus[message.status] === undefined ? message.status : $root.taskgraph.WorkflowStatus[message.status] : message.status;
            if (message.graphDefinition != null && message.hasOwnProperty("graphDefinition"))
                object.graphDefinition = options.bytes === String ? $util.base64.encode(message.graphDefinition, 0, message.graphDefinition.length) : options.bytes === Array ? Array.prototype.slice.call(message.graphDefinition) : message.graphDefinition;
            if (message.currentNode != null && message.hasOwnProperty("currentNode")) {
                object.currentNode = message.currentNode;
                if (options.oneofs)
                    object._currentNode = "currentNode";
            }
            if (message.startedAt != null && message.hasOwnProperty("startedAt"))
                object.startedAt = message.startedAt;
            if (message.completedAt != null && message.hasOwnProperty("completedAt")) {
                object.completedAt = message.completedAt;
                if (options.oneofs)
                    object._completedAt = "completedAt";
            }
            if (message.pausedAt != null && message.hasOwnProperty("pausedAt")) {
                object.pausedAt = message.pausedAt;
                if (options.oneofs)
                    object._pausedAt = "pausedAt";
            }
            if (message.checkpointId != null && message.hasOwnProperty("checkpointId")) {
                object.checkpointId = message.checkpointId;
                if (options.oneofs)
                    object._checkpointId = "checkpointId";
            }
            if (message.errorMessage != null && message.hasOwnProperty("errorMessage")) {
                object.errorMessage = message.errorMessage;
                if (options.oneofs)
                    object._errorMessage = "errorMessage";
            }
            let keys2;
            if (message.metadata && (keys2 = Object.keys(message.metadata)).length) {
                object.metadata = {};
                for (let j = 0; j < keys2.length; ++j)
                    object.metadata[keys2[j]] = message.metadata[keys2[j]];
            }
            if (message.correlationId != null && message.hasOwnProperty("correlationId"))
                object.correlationId = message.correlationId;
            if (message.completedTasks && message.completedTasks.length) {
                object.completedTasks = [];
                for (let j = 0; j < message.completedTasks.length; ++j)
                    object.completedTasks[j] = message.completedTasks[j];
            }
            if (message.failedTasks && message.failedTasks.length) {
                object.failedTasks = [];
                for (let j = 0; j < message.failedTasks.length; ++j)
                    object.failedTasks[j] = message.failedTasks[j];
            }
            if (message.skippedTasks && message.skippedTasks.length) {
                object.skippedTasks = [];
                for (let j = 0; j < message.skippedTasks.length; ++j)
                    object.skippedTasks[j] = message.skippedTasks[j];
            }
            if (message.taskId != null && message.hasOwnProperty("taskId"))
                object.taskId = message.taskId;
            if (message.userId != null && message.hasOwnProperty("userId")) {
                object.userId = message.userId;
                if (options.oneofs)
                    object._userId = "userId";
            }
            return object;
        };

        /**
         * Converts this WorkflowExecution to JSON.
         * @function toJSON
         * @memberof taskgraph.WorkflowExecution
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        WorkflowExecution.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for WorkflowExecution
         * @function getTypeUrl
         * @memberof taskgraph.WorkflowExecution
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        WorkflowExecution.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/taskgraph.WorkflowExecution";
        };

        return WorkflowExecution;
    })();

    taskgraph.StartWorkflowRequest = (function() {

        /**
         * Properties of a StartWorkflowRequest.
         * @memberof taskgraph
         * @interface IStartWorkflowRequest
         * @property {string|null} [taskId] StartWorkflowRequest taskId
         * @property {string|null} [workflowType] StartWorkflowRequest workflowType
         * @property {Uint8Array|null} [graphDefinition] StartWorkflowRequest graphDefinition
         * @property {Object.<string,string>|null} [metadata] StartWorkflowRequest metadata
         */

        /**
         * Constructs a new StartWorkflowRequest.
         * @memberof taskgraph
         * @classdesc Represents a StartWorkflowRequest.
         * @implements IStartWorkflowRequest
         * @constructor
         * @param {taskgraph.IStartWorkflowRequest=} [properties] Properties to set
         */
        function StartWorkflowRequest(properties) {
            this.metadata = {};
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * StartWorkflowRequest taskId.
         * @member {string} taskId
         * @memberof taskgraph.StartWorkflowRequest
         * @instance
         */
        StartWorkflowRequest.prototype.taskId = "";

        /**
         * StartWorkflowRequest workflowType.
         * @member {string} workflowType
         * @memberof taskgraph.StartWorkflowRequest
         * @instance
         */
        StartWorkflowRequest.prototype.workflowType = "";

        /**
         * StartWorkflowRequest graphDefinition.
         * @member {Uint8Array|null|undefined} graphDefinition
         * @memberof taskgraph.StartWorkflowRequest
         * @instance
         */
        StartWorkflowRequest.prototype.graphDefinition = null;

        /**
         * StartWorkflowRequest metadata.
         * @member {Object.<string,string>} metadata
         * @memberof taskgraph.StartWorkflowRequest
         * @instance
         */
        StartWorkflowRequest.prototype.metadata = $util.emptyObject;

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(StartWorkflowRequest.prototype, "_graphDefinition", {
            get: $util.oneOfGetter($oneOfFields = ["graphDefinition"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new StartWorkflowRequest instance using the specified properties.
         * @function create
         * @memberof taskgraph.StartWorkflowRequest
         * @static
         * @param {taskgraph.IStartWorkflowRequest=} [properties] Properties to set
         * @returns {taskgraph.StartWorkflowRequest} StartWorkflowRequest instance
         */
        StartWorkflowRequest.create = function create(properties) {
            return new StartWorkflowRequest(properties);
        };

        /**
         * Encodes the specified StartWorkflowRequest message. Does not implicitly {@link taskgraph.StartWorkflowRequest.verify|verify} messages.
         * @function encode
         * @memberof taskgraph.StartWorkflowRequest
         * @static
         * @param {taskgraph.IStartWorkflowRequest} message StartWorkflowRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        StartWorkflowRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.taskId != null && Object.hasOwnProperty.call(message, "taskId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.taskId);
            if (message.workflowType != null && Object.hasOwnProperty.call(message, "workflowType"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.workflowType);
            if (message.graphDefinition != null && Object.hasOwnProperty.call(message, "graphDefinition"))
                writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.graphDefinition);
            if (message.metadata != null && Object.hasOwnProperty.call(message, "metadata"))
                for (let keys = Object.keys(message.metadata), i = 0; i < keys.length; ++i)
                    writer.uint32(/* id 4, wireType 2 =*/34).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]).uint32(/* id 2, wireType 2 =*/18).string(message.metadata[keys[i]]).ldelim();
            return writer;
        };

        /**
         * Encodes the specified StartWorkflowRequest message, length delimited. Does not implicitly {@link taskgraph.StartWorkflowRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof taskgraph.StartWorkflowRequest
         * @static
         * @param {taskgraph.IStartWorkflowRequest} message StartWorkflowRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        StartWorkflowRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a StartWorkflowRequest message from the specified reader or buffer.
         * @function decode
         * @memberof taskgraph.StartWorkflowRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {taskgraph.StartWorkflowRequest} StartWorkflowRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        StartWorkflowRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.taskgraph.StartWorkflowRequest(), key, value;
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.taskId = reader.string();
                        break;
                    }
                case 2: {
                        message.workflowType = reader.string();
                        break;
                    }
                case 3: {
                        message.graphDefinition = reader.bytes();
                        break;
                    }
                case 4: {
                        if (message.metadata === $util.emptyObject)
                            message.metadata = {};
                        let end2 = reader.uint32() + reader.pos;
                        key = "";
                        value = "";
                        while (reader.pos < end2) {
                            let tag2 = reader.uint32();
                            switch (tag2 >>> 3) {
                            case 1:
                                key = reader.string();
                                break;
                            case 2:
                                value = reader.string();
                                break;
                            default:
                                reader.skipType(tag2 & 7);
                                break;
                            }
                        }
                        message.metadata[key] = value;
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a StartWorkflowRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof taskgraph.StartWorkflowRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {taskgraph.StartWorkflowRequest} StartWorkflowRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        StartWorkflowRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a StartWorkflowRequest message.
         * @function verify
         * @memberof taskgraph.StartWorkflowRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        StartWorkflowRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
            if (message.taskId != null && message.hasOwnProperty("taskId"))
                if (!$util.isString(message.taskId))
                    return "taskId: string expected";
            if (message.workflowType != null && message.hasOwnProperty("workflowType"))
                if (!$util.isString(message.workflowType))
                    return "workflowType: string expected";
            if (message.graphDefinition != null && message.hasOwnProperty("graphDefinition")) {
                properties._graphDefinition = 1;
                if (!(message.graphDefinition && typeof message.graphDefinition.length === "number" || $util.isString(message.graphDefinition)))
                    return "graphDefinition: buffer expected";
            }
            if (message.metadata != null && message.hasOwnProperty("metadata")) {
                if (!$util.isObject(message.metadata))
                    return "metadata: object expected";
                let key = Object.keys(message.metadata);
                for (let i = 0; i < key.length; ++i)
                    if (!$util.isString(message.metadata[key[i]]))
                        return "metadata: string{k:string} expected";
            }
            return null;
        };

        /**
         * Creates a StartWorkflowRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof taskgraph.StartWorkflowRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {taskgraph.StartWorkflowRequest} StartWorkflowRequest
         */
        StartWorkflowRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.taskgraph.StartWorkflowRequest)
                return object;
            let message = new $root.taskgraph.StartWorkflowRequest();
            if (object.taskId != null)
                message.taskId = String(object.taskId);
            if (object.workflowType != null)
                message.workflowType = String(object.workflowType);
            if (object.graphDefinition != null)
                if (typeof object.graphDefinition === "string")
                    $util.base64.decode(object.graphDefinition, message.graphDefinition = $util.newBuffer($util.base64.length(object.graphDefinition)), 0);
                else if (object.graphDefinition.length >= 0)
                    message.graphDefinition = object.graphDefinition;
            if (object.metadata) {
                if (typeof object.metadata !== "object")
                    throw TypeError(".taskgraph.StartWorkflowRequest.metadata: object expected");
                message.metadata = {};
                for (let keys = Object.keys(object.metadata), i = 0; i < keys.length; ++i)
                    message.metadata[keys[i]] = String(object.metadata[keys[i]]);
            }
            return message;
        };

        /**
         * Creates a plain object from a StartWorkflowRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof taskgraph.StartWorkflowRequest
         * @static
         * @param {taskgraph.StartWorkflowRequest} message StartWorkflowRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        StartWorkflowRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.objects || options.defaults)
                object.metadata = {};
            if (options.defaults) {
                object.taskId = "";
                object.workflowType = "";
            }
            if (message.taskId != null && message.hasOwnProperty("taskId"))
                object.taskId = message.taskId;
            if (message.workflowType != null && message.hasOwnProperty("workflowType"))
                object.workflowType = message.workflowType;
            if (message.graphDefinition != null && message.hasOwnProperty("graphDefinition")) {
                object.graphDefinition = options.bytes === String ? $util.base64.encode(message.graphDefinition, 0, message.graphDefinition.length) : options.bytes === Array ? Array.prototype.slice.call(message.graphDefinition) : message.graphDefinition;
                if (options.oneofs)
                    object._graphDefinition = "graphDefinition";
            }
            let keys2;
            if (message.metadata && (keys2 = Object.keys(message.metadata)).length) {
                object.metadata = {};
                for (let j = 0; j < keys2.length; ++j)
                    object.metadata[keys2[j]] = message.metadata[keys2[j]];
            }
            return object;
        };

        /**
         * Converts this StartWorkflowRequest to JSON.
         * @function toJSON
         * @memberof taskgraph.StartWorkflowRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        StartWorkflowRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for StartWorkflowRequest
         * @function getTypeUrl
         * @memberof taskgraph.StartWorkflowRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        StartWorkflowRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/taskgraph.StartWorkflowRequest";
        };

        return StartWorkflowRequest;
    })();

    taskgraph.WorkflowStatusResponse = (function() {

        /**
         * Properties of a WorkflowStatusResponse.
         * @memberof taskgraph
         * @interface IWorkflowStatusResponse
         * @property {string|null} [workflowId] WorkflowStatusResponse workflowId
         * @property {string|null} [executionId] WorkflowStatusResponse executionId
         * @property {taskgraph.WorkflowStatus|null} [status] WorkflowStatusResponse status
         * @property {string|null} [currentNode] WorkflowStatusResponse currentNode
         * @property {taskgraph.IWorkflowProgress|null} [progress] WorkflowStatusResponse progress
         * @property {string|null} [startedAt] WorkflowStatusResponse startedAt
         * @property {string|null} [completedAt] WorkflowStatusResponse completedAt
         * @property {string|null} [pausedAt] WorkflowStatusResponse pausedAt
         * @property {string|null} [errorMessage] WorkflowStatusResponse errorMessage
         */

        /**
         * Constructs a new WorkflowStatusResponse.
         * @memberof taskgraph
         * @classdesc Represents a WorkflowStatusResponse.
         * @implements IWorkflowStatusResponse
         * @constructor
         * @param {taskgraph.IWorkflowStatusResponse=} [properties] Properties to set
         */
        function WorkflowStatusResponse(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * WorkflowStatusResponse workflowId.
         * @member {string} workflowId
         * @memberof taskgraph.WorkflowStatusResponse
         * @instance
         */
        WorkflowStatusResponse.prototype.workflowId = "";

        /**
         * WorkflowStatusResponse executionId.
         * @member {string} executionId
         * @memberof taskgraph.WorkflowStatusResponse
         * @instance
         */
        WorkflowStatusResponse.prototype.executionId = "";

        /**
         * WorkflowStatusResponse status.
         * @member {taskgraph.WorkflowStatus} status
         * @memberof taskgraph.WorkflowStatusResponse
         * @instance
         */
        WorkflowStatusResponse.prototype.status = 0;

        /**
         * WorkflowStatusResponse currentNode.
         * @member {string|null|undefined} currentNode
         * @memberof taskgraph.WorkflowStatusResponse
         * @instance
         */
        WorkflowStatusResponse.prototype.currentNode = null;

        /**
         * WorkflowStatusResponse progress.
         * @member {taskgraph.IWorkflowProgress|null|undefined} progress
         * @memberof taskgraph.WorkflowStatusResponse
         * @instance
         */
        WorkflowStatusResponse.prototype.progress = null;

        /**
         * WorkflowStatusResponse startedAt.
         * @member {string} startedAt
         * @memberof taskgraph.WorkflowStatusResponse
         * @instance
         */
        WorkflowStatusResponse.prototype.startedAt = "";

        /**
         * WorkflowStatusResponse completedAt.
         * @member {string|null|undefined} completedAt
         * @memberof taskgraph.WorkflowStatusResponse
         * @instance
         */
        WorkflowStatusResponse.prototype.completedAt = null;

        /**
         * WorkflowStatusResponse pausedAt.
         * @member {string|null|undefined} pausedAt
         * @memberof taskgraph.WorkflowStatusResponse
         * @instance
         */
        WorkflowStatusResponse.prototype.pausedAt = null;

        /**
         * WorkflowStatusResponse errorMessage.
         * @member {string|null|undefined} errorMessage
         * @memberof taskgraph.WorkflowStatusResponse
         * @instance
         */
        WorkflowStatusResponse.prototype.errorMessage = null;

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(WorkflowStatusResponse.prototype, "_currentNode", {
            get: $util.oneOfGetter($oneOfFields = ["currentNode"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(WorkflowStatusResponse.prototype, "_completedAt", {
            get: $util.oneOfGetter($oneOfFields = ["completedAt"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(WorkflowStatusResponse.prototype, "_pausedAt", {
            get: $util.oneOfGetter($oneOfFields = ["pausedAt"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(WorkflowStatusResponse.prototype, "_errorMessage", {
            get: $util.oneOfGetter($oneOfFields = ["errorMessage"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new WorkflowStatusResponse instance using the specified properties.
         * @function create
         * @memberof taskgraph.WorkflowStatusResponse
         * @static
         * @param {taskgraph.IWorkflowStatusResponse=} [properties] Properties to set
         * @returns {taskgraph.WorkflowStatusResponse} WorkflowStatusResponse instance
         */
        WorkflowStatusResponse.create = function create(properties) {
            return new WorkflowStatusResponse(properties);
        };

        /**
         * Encodes the specified WorkflowStatusResponse message. Does not implicitly {@link taskgraph.WorkflowStatusResponse.verify|verify} messages.
         * @function encode
         * @memberof taskgraph.WorkflowStatusResponse
         * @static
         * @param {taskgraph.IWorkflowStatusResponse} message WorkflowStatusResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        WorkflowStatusResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.workflowId != null && Object.hasOwnProperty.call(message, "workflowId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.workflowId);
            if (message.executionId != null && Object.hasOwnProperty.call(message, "executionId"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.executionId);
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.status);
            if (message.currentNode != null && Object.hasOwnProperty.call(message, "currentNode"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.currentNode);
            if (message.progress != null && Object.hasOwnProperty.call(message, "progress"))
                $root.taskgraph.WorkflowProgress.encode(message.progress, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
            if (message.startedAt != null && Object.hasOwnProperty.call(message, "startedAt"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.startedAt);
            if (message.completedAt != null && Object.hasOwnProperty.call(message, "completedAt"))
                writer.uint32(/* id 7, wireType 2 =*/58).string(message.completedAt);
            if (message.pausedAt != null && Object.hasOwnProperty.call(message, "pausedAt"))
                writer.uint32(/* id 8, wireType 2 =*/66).string(message.pausedAt);
            if (message.errorMessage != null && Object.hasOwnProperty.call(message, "errorMessage"))
                writer.uint32(/* id 9, wireType 2 =*/74).string(message.errorMessage);
            return writer;
        };

        /**
         * Encodes the specified WorkflowStatusResponse message, length delimited. Does not implicitly {@link taskgraph.WorkflowStatusResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof taskgraph.WorkflowStatusResponse
         * @static
         * @param {taskgraph.IWorkflowStatusResponse} message WorkflowStatusResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        WorkflowStatusResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a WorkflowStatusResponse message from the specified reader or buffer.
         * @function decode
         * @memberof taskgraph.WorkflowStatusResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {taskgraph.WorkflowStatusResponse} WorkflowStatusResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        WorkflowStatusResponse.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.taskgraph.WorkflowStatusResponse();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.workflowId = reader.string();
                        break;
                    }
                case 2: {
                        message.executionId = reader.string();
                        break;
                    }
                case 3: {
                        message.status = reader.int32();
                        break;
                    }
                case 4: {
                        message.currentNode = reader.string();
                        break;
                    }
                case 5: {
                        message.progress = $root.taskgraph.WorkflowProgress.decode(reader, reader.uint32());
                        break;
                    }
                case 6: {
                        message.startedAt = reader.string();
                        break;
                    }
                case 7: {
                        message.completedAt = reader.string();
                        break;
                    }
                case 8: {
                        message.pausedAt = reader.string();
                        break;
                    }
                case 9: {
                        message.errorMessage = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a WorkflowStatusResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof taskgraph.WorkflowStatusResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {taskgraph.WorkflowStatusResponse} WorkflowStatusResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        WorkflowStatusResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a WorkflowStatusResponse message.
         * @function verify
         * @memberof taskgraph.WorkflowStatusResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        WorkflowStatusResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
            if (message.workflowId != null && message.hasOwnProperty("workflowId"))
                if (!$util.isString(message.workflowId))
                    return "workflowId: string expected";
            if (message.executionId != null && message.hasOwnProperty("executionId"))
                if (!$util.isString(message.executionId))
                    return "executionId: string expected";
            if (message.status != null && message.hasOwnProperty("status"))
                switch (message.status) {
                default:
                    return "status: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                    break;
                }
            if (message.currentNode != null && message.hasOwnProperty("currentNode")) {
                properties._currentNode = 1;
                if (!$util.isString(message.currentNode))
                    return "currentNode: string expected";
            }
            if (message.progress != null && message.hasOwnProperty("progress")) {
                let error = $root.taskgraph.WorkflowProgress.verify(message.progress);
                if (error)
                    return "progress." + error;
            }
            if (message.startedAt != null && message.hasOwnProperty("startedAt"))
                if (!$util.isString(message.startedAt))
                    return "startedAt: string expected";
            if (message.completedAt != null && message.hasOwnProperty("completedAt")) {
                properties._completedAt = 1;
                if (!$util.isString(message.completedAt))
                    return "completedAt: string expected";
            }
            if (message.pausedAt != null && message.hasOwnProperty("pausedAt")) {
                properties._pausedAt = 1;
                if (!$util.isString(message.pausedAt))
                    return "pausedAt: string expected";
            }
            if (message.errorMessage != null && message.hasOwnProperty("errorMessage")) {
                properties._errorMessage = 1;
                if (!$util.isString(message.errorMessage))
                    return "errorMessage: string expected";
            }
            return null;
        };

        /**
         * Creates a WorkflowStatusResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof taskgraph.WorkflowStatusResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {taskgraph.WorkflowStatusResponse} WorkflowStatusResponse
         */
        WorkflowStatusResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.taskgraph.WorkflowStatusResponse)
                return object;
            let message = new $root.taskgraph.WorkflowStatusResponse();
            if (object.workflowId != null)
                message.workflowId = String(object.workflowId);
            if (object.executionId != null)
                message.executionId = String(object.executionId);
            switch (object.status) {
            default:
                if (typeof object.status === "number") {
                    message.status = object.status;
                    break;
                }
                break;
            case "WORKFLOW_STATUS_UNSPECIFIED":
            case 0:
                message.status = 0;
                break;
            case "WORKFLOW_STATUS_PENDING":
            case 1:
                message.status = 1;
                break;
            case "WORKFLOW_STATUS_RUNNING":
            case 2:
                message.status = 2;
                break;
            case "WORKFLOW_STATUS_PAUSED":
            case 3:
                message.status = 3;
                break;
            case "WORKFLOW_STATUS_COMPLETED":
            case 4:
                message.status = 4;
                break;
            case "WORKFLOW_STATUS_FAILED":
            case 5:
                message.status = 5;
                break;
            case "WORKFLOW_STATUS_CANCELLED":
            case 6:
                message.status = 6;
                break;
            }
            if (object.currentNode != null)
                message.currentNode = String(object.currentNode);
            if (object.progress != null) {
                if (typeof object.progress !== "object")
                    throw TypeError(".taskgraph.WorkflowStatusResponse.progress: object expected");
                message.progress = $root.taskgraph.WorkflowProgress.fromObject(object.progress);
            }
            if (object.startedAt != null)
                message.startedAt = String(object.startedAt);
            if (object.completedAt != null)
                message.completedAt = String(object.completedAt);
            if (object.pausedAt != null)
                message.pausedAt = String(object.pausedAt);
            if (object.errorMessage != null)
                message.errorMessage = String(object.errorMessage);
            return message;
        };

        /**
         * Creates a plain object from a WorkflowStatusResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof taskgraph.WorkflowStatusResponse
         * @static
         * @param {taskgraph.WorkflowStatusResponse} message WorkflowStatusResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        WorkflowStatusResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.workflowId = "";
                object.executionId = "";
                object.status = options.enums === String ? "WORKFLOW_STATUS_UNSPECIFIED" : 0;
                object.progress = null;
                object.startedAt = "";
            }
            if (message.workflowId != null && message.hasOwnProperty("workflowId"))
                object.workflowId = message.workflowId;
            if (message.executionId != null && message.hasOwnProperty("executionId"))
                object.executionId = message.executionId;
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = options.enums === String ? $root.taskgraph.WorkflowStatus[message.status] === undefined ? message.status : $root.taskgraph.WorkflowStatus[message.status] : message.status;
            if (message.currentNode != null && message.hasOwnProperty("currentNode")) {
                object.currentNode = message.currentNode;
                if (options.oneofs)
                    object._currentNode = "currentNode";
            }
            if (message.progress != null && message.hasOwnProperty("progress"))
                object.progress = $root.taskgraph.WorkflowProgress.toObject(message.progress, options);
            if (message.startedAt != null && message.hasOwnProperty("startedAt"))
                object.startedAt = message.startedAt;
            if (message.completedAt != null && message.hasOwnProperty("completedAt")) {
                object.completedAt = message.completedAt;
                if (options.oneofs)
                    object._completedAt = "completedAt";
            }
            if (message.pausedAt != null && message.hasOwnProperty("pausedAt")) {
                object.pausedAt = message.pausedAt;
                if (options.oneofs)
                    object._pausedAt = "pausedAt";
            }
            if (message.errorMessage != null && message.hasOwnProperty("errorMessage")) {
                object.errorMessage = message.errorMessage;
                if (options.oneofs)
                    object._errorMessage = "errorMessage";
            }
            return object;
        };

        /**
         * Converts this WorkflowStatusResponse to JSON.
         * @function toJSON
         * @memberof taskgraph.WorkflowStatusResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        WorkflowStatusResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for WorkflowStatusResponse
         * @function getTypeUrl
         * @memberof taskgraph.WorkflowStatusResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        WorkflowStatusResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/taskgraph.WorkflowStatusResponse";
        };

        return WorkflowStatusResponse;
    })();

    taskgraph.WorkflowProgress = (function() {

        /**
         * Properties of a WorkflowProgress.
         * @memberof taskgraph
         * @interface IWorkflowProgress
         * @property {number|null} [completedTasks] WorkflowProgress completedTasks
         * @property {number|null} [failedTasks] WorkflowProgress failedTasks
         * @property {number|null} [skippedTasks] WorkflowProgress skippedTasks
         * @property {number|null} [totalTasks] WorkflowProgress totalTasks
         * @property {number|null} [percentComplete] WorkflowProgress percentComplete
         */

        /**
         * Constructs a new WorkflowProgress.
         * @memberof taskgraph
         * @classdesc Represents a WorkflowProgress.
         * @implements IWorkflowProgress
         * @constructor
         * @param {taskgraph.IWorkflowProgress=} [properties] Properties to set
         */
        function WorkflowProgress(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * WorkflowProgress completedTasks.
         * @member {number} completedTasks
         * @memberof taskgraph.WorkflowProgress
         * @instance
         */
        WorkflowProgress.prototype.completedTasks = 0;

        /**
         * WorkflowProgress failedTasks.
         * @member {number} failedTasks
         * @memberof taskgraph.WorkflowProgress
         * @instance
         */
        WorkflowProgress.prototype.failedTasks = 0;

        /**
         * WorkflowProgress skippedTasks.
         * @member {number} skippedTasks
         * @memberof taskgraph.WorkflowProgress
         * @instance
         */
        WorkflowProgress.prototype.skippedTasks = 0;

        /**
         * WorkflowProgress totalTasks.
         * @member {number} totalTasks
         * @memberof taskgraph.WorkflowProgress
         * @instance
         */
        WorkflowProgress.prototype.totalTasks = 0;

        /**
         * WorkflowProgress percentComplete.
         * @member {number} percentComplete
         * @memberof taskgraph.WorkflowProgress
         * @instance
         */
        WorkflowProgress.prototype.percentComplete = 0;

        /**
         * Creates a new WorkflowProgress instance using the specified properties.
         * @function create
         * @memberof taskgraph.WorkflowProgress
         * @static
         * @param {taskgraph.IWorkflowProgress=} [properties] Properties to set
         * @returns {taskgraph.WorkflowProgress} WorkflowProgress instance
         */
        WorkflowProgress.create = function create(properties) {
            return new WorkflowProgress(properties);
        };

        /**
         * Encodes the specified WorkflowProgress message. Does not implicitly {@link taskgraph.WorkflowProgress.verify|verify} messages.
         * @function encode
         * @memberof taskgraph.WorkflowProgress
         * @static
         * @param {taskgraph.IWorkflowProgress} message WorkflowProgress message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        WorkflowProgress.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.completedTasks != null && Object.hasOwnProperty.call(message, "completedTasks"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.completedTasks);
            if (message.failedTasks != null && Object.hasOwnProperty.call(message, "failedTasks"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.failedTasks);
            if (message.skippedTasks != null && Object.hasOwnProperty.call(message, "skippedTasks"))
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.skippedTasks);
            if (message.totalTasks != null && Object.hasOwnProperty.call(message, "totalTasks"))
                writer.uint32(/* id 4, wireType 0 =*/32).int32(message.totalTasks);
            if (message.percentComplete != null && Object.hasOwnProperty.call(message, "percentComplete"))
                writer.uint32(/* id 5, wireType 5 =*/45).float(message.percentComplete);
            return writer;
        };

        /**
         * Encodes the specified WorkflowProgress message, length delimited. Does not implicitly {@link taskgraph.WorkflowProgress.verify|verify} messages.
         * @function encodeDelimited
         * @memberof taskgraph.WorkflowProgress
         * @static
         * @param {taskgraph.IWorkflowProgress} message WorkflowProgress message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        WorkflowProgress.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a WorkflowProgress message from the specified reader or buffer.
         * @function decode
         * @memberof taskgraph.WorkflowProgress
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {taskgraph.WorkflowProgress} WorkflowProgress
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        WorkflowProgress.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.taskgraph.WorkflowProgress();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.completedTasks = reader.int32();
                        break;
                    }
                case 2: {
                        message.failedTasks = reader.int32();
                        break;
                    }
                case 3: {
                        message.skippedTasks = reader.int32();
                        break;
                    }
                case 4: {
                        message.totalTasks = reader.int32();
                        break;
                    }
                case 5: {
                        message.percentComplete = reader.float();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a WorkflowProgress message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof taskgraph.WorkflowProgress
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {taskgraph.WorkflowProgress} WorkflowProgress
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        WorkflowProgress.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a WorkflowProgress message.
         * @function verify
         * @memberof taskgraph.WorkflowProgress
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        WorkflowProgress.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.completedTasks != null && message.hasOwnProperty("completedTasks"))
                if (!$util.isInteger(message.completedTasks))
                    return "completedTasks: integer expected";
            if (message.failedTasks != null && message.hasOwnProperty("failedTasks"))
                if (!$util.isInteger(message.failedTasks))
                    return "failedTasks: integer expected";
            if (message.skippedTasks != null && message.hasOwnProperty("skippedTasks"))
                if (!$util.isInteger(message.skippedTasks))
                    return "skippedTasks: integer expected";
            if (message.totalTasks != null && message.hasOwnProperty("totalTasks"))
                if (!$util.isInteger(message.totalTasks))
                    return "totalTasks: integer expected";
            if (message.percentComplete != null && message.hasOwnProperty("percentComplete"))
                if (typeof message.percentComplete !== "number")
                    return "percentComplete: number expected";
            return null;
        };

        /**
         * Creates a WorkflowProgress message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof taskgraph.WorkflowProgress
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {taskgraph.WorkflowProgress} WorkflowProgress
         */
        WorkflowProgress.fromObject = function fromObject(object) {
            if (object instanceof $root.taskgraph.WorkflowProgress)
                return object;
            let message = new $root.taskgraph.WorkflowProgress();
            if (object.completedTasks != null)
                message.completedTasks = object.completedTasks | 0;
            if (object.failedTasks != null)
                message.failedTasks = object.failedTasks | 0;
            if (object.skippedTasks != null)
                message.skippedTasks = object.skippedTasks | 0;
            if (object.totalTasks != null)
                message.totalTasks = object.totalTasks | 0;
            if (object.percentComplete != null)
                message.percentComplete = Number(object.percentComplete);
            return message;
        };

        /**
         * Creates a plain object from a WorkflowProgress message. Also converts values to other types if specified.
         * @function toObject
         * @memberof taskgraph.WorkflowProgress
         * @static
         * @param {taskgraph.WorkflowProgress} message WorkflowProgress
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        WorkflowProgress.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.completedTasks = 0;
                object.failedTasks = 0;
                object.skippedTasks = 0;
                object.totalTasks = 0;
                object.percentComplete = 0;
            }
            if (message.completedTasks != null && message.hasOwnProperty("completedTasks"))
                object.completedTasks = message.completedTasks;
            if (message.failedTasks != null && message.hasOwnProperty("failedTasks"))
                object.failedTasks = message.failedTasks;
            if (message.skippedTasks != null && message.hasOwnProperty("skippedTasks"))
                object.skippedTasks = message.skippedTasks;
            if (message.totalTasks != null && message.hasOwnProperty("totalTasks"))
                object.totalTasks = message.totalTasks;
            if (message.percentComplete != null && message.hasOwnProperty("percentComplete"))
                object.percentComplete = options.json && !isFinite(message.percentComplete) ? String(message.percentComplete) : message.percentComplete;
            return object;
        };

        /**
         * Converts this WorkflowProgress to JSON.
         * @function toJSON
         * @memberof taskgraph.WorkflowProgress
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        WorkflowProgress.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for WorkflowProgress
         * @function getTypeUrl
         * @memberof taskgraph.WorkflowProgress
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        WorkflowProgress.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/taskgraph.WorkflowProgress";
        };

        return WorkflowProgress;
    })();

    taskgraph.Pagination = (function() {

        /**
         * Properties of a Pagination.
         * @memberof taskgraph
         * @interface IPagination
         * @property {number|null} [total] Pagination total
         * @property {number|null} [limit] Pagination limit
         * @property {number|null} [offset] Pagination offset
         * @property {boolean|null} [hasMore] Pagination hasMore
         */

        /**
         * Constructs a new Pagination.
         * @memberof taskgraph
         * @classdesc Represents a Pagination.
         * @implements IPagination
         * @constructor
         * @param {taskgraph.IPagination=} [properties] Properties to set
         */
        function Pagination(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Pagination total.
         * @member {number} total
         * @memberof taskgraph.Pagination
         * @instance
         */
        Pagination.prototype.total = 0;

        /**
         * Pagination limit.
         * @member {number} limit
         * @memberof taskgraph.Pagination
         * @instance
         */
        Pagination.prototype.limit = 0;

        /**
         * Pagination offset.
         * @member {number} offset
         * @memberof taskgraph.Pagination
         * @instance
         */
        Pagination.prototype.offset = 0;

        /**
         * Pagination hasMore.
         * @member {boolean} hasMore
         * @memberof taskgraph.Pagination
         * @instance
         */
        Pagination.prototype.hasMore = false;

        /**
         * Creates a new Pagination instance using the specified properties.
         * @function create
         * @memberof taskgraph.Pagination
         * @static
         * @param {taskgraph.IPagination=} [properties] Properties to set
         * @returns {taskgraph.Pagination} Pagination instance
         */
        Pagination.create = function create(properties) {
            return new Pagination(properties);
        };

        /**
         * Encodes the specified Pagination message. Does not implicitly {@link taskgraph.Pagination.verify|verify} messages.
         * @function encode
         * @memberof taskgraph.Pagination
         * @static
         * @param {taskgraph.IPagination} message Pagination message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Pagination.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.total != null && Object.hasOwnProperty.call(message, "total"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.total);
            if (message.limit != null && Object.hasOwnProperty.call(message, "limit"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.limit);
            if (message.offset != null && Object.hasOwnProperty.call(message, "offset"))
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.offset);
            if (message.hasMore != null && Object.hasOwnProperty.call(message, "hasMore"))
                writer.uint32(/* id 4, wireType 0 =*/32).bool(message.hasMore);
            return writer;
        };

        /**
         * Encodes the specified Pagination message, length delimited. Does not implicitly {@link taskgraph.Pagination.verify|verify} messages.
         * @function encodeDelimited
         * @memberof taskgraph.Pagination
         * @static
         * @param {taskgraph.IPagination} message Pagination message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Pagination.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Pagination message from the specified reader or buffer.
         * @function decode
         * @memberof taskgraph.Pagination
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {taskgraph.Pagination} Pagination
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Pagination.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.taskgraph.Pagination();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.total = reader.int32();
                        break;
                    }
                case 2: {
                        message.limit = reader.int32();
                        break;
                    }
                case 3: {
                        message.offset = reader.int32();
                        break;
                    }
                case 4: {
                        message.hasMore = reader.bool();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Pagination message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof taskgraph.Pagination
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {taskgraph.Pagination} Pagination
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Pagination.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Pagination message.
         * @function verify
         * @memberof taskgraph.Pagination
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Pagination.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.total != null && message.hasOwnProperty("total"))
                if (!$util.isInteger(message.total))
                    return "total: integer expected";
            if (message.limit != null && message.hasOwnProperty("limit"))
                if (!$util.isInteger(message.limit))
                    return "limit: integer expected";
            if (message.offset != null && message.hasOwnProperty("offset"))
                if (!$util.isInteger(message.offset))
                    return "offset: integer expected";
            if (message.hasMore != null && message.hasOwnProperty("hasMore"))
                if (typeof message.hasMore !== "boolean")
                    return "hasMore: boolean expected";
            return null;
        };

        /**
         * Creates a Pagination message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof taskgraph.Pagination
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {taskgraph.Pagination} Pagination
         */
        Pagination.fromObject = function fromObject(object) {
            if (object instanceof $root.taskgraph.Pagination)
                return object;
            let message = new $root.taskgraph.Pagination();
            if (object.total != null)
                message.total = object.total | 0;
            if (object.limit != null)
                message.limit = object.limit | 0;
            if (object.offset != null)
                message.offset = object.offset | 0;
            if (object.hasMore != null)
                message.hasMore = Boolean(object.hasMore);
            return message;
        };

        /**
         * Creates a plain object from a Pagination message. Also converts values to other types if specified.
         * @function toObject
         * @memberof taskgraph.Pagination
         * @static
         * @param {taskgraph.Pagination} message Pagination
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Pagination.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.total = 0;
                object.limit = 0;
                object.offset = 0;
                object.hasMore = false;
            }
            if (message.total != null && message.hasOwnProperty("total"))
                object.total = message.total;
            if (message.limit != null && message.hasOwnProperty("limit"))
                object.limit = message.limit;
            if (message.offset != null && message.hasOwnProperty("offset"))
                object.offset = message.offset;
            if (message.hasMore != null && message.hasOwnProperty("hasMore"))
                object.hasMore = message.hasMore;
            return object;
        };

        /**
         * Converts this Pagination to JSON.
         * @function toJSON
         * @memberof taskgraph.Pagination
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Pagination.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Pagination
         * @function getTypeUrl
         * @memberof taskgraph.Pagination
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Pagination.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/taskgraph.Pagination";
        };

        return Pagination;
    })();

    taskgraph.Error = (function() {

        /**
         * Properties of an Error.
         * @memberof taskgraph
         * @interface IError
         * @property {string|null} [code] Error code
         * @property {string|null} [message] Error message
         * @property {Object.<string,string>|null} [details] Error details
         */

        /**
         * Constructs a new Error.
         * @memberof taskgraph
         * @classdesc Represents an Error.
         * @implements IError
         * @constructor
         * @param {taskgraph.IError=} [properties] Properties to set
         */
        function Error(properties) {
            this.details = {};
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Error code.
         * @member {string} code
         * @memberof taskgraph.Error
         * @instance
         */
        Error.prototype.code = "";

        /**
         * Error message.
         * @member {string} message
         * @memberof taskgraph.Error
         * @instance
         */
        Error.prototype.message = "";

        /**
         * Error details.
         * @member {Object.<string,string>} details
         * @memberof taskgraph.Error
         * @instance
         */
        Error.prototype.details = $util.emptyObject;

        /**
         * Creates a new Error instance using the specified properties.
         * @function create
         * @memberof taskgraph.Error
         * @static
         * @param {taskgraph.IError=} [properties] Properties to set
         * @returns {taskgraph.Error} Error instance
         */
        Error.create = function create(properties) {
            return new Error(properties);
        };

        /**
         * Encodes the specified Error message. Does not implicitly {@link taskgraph.Error.verify|verify} messages.
         * @function encode
         * @memberof taskgraph.Error
         * @static
         * @param {taskgraph.IError} message Error message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Error.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.code != null && Object.hasOwnProperty.call(message, "code"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.code);
            if (message.message != null && Object.hasOwnProperty.call(message, "message"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.message);
            if (message.details != null && Object.hasOwnProperty.call(message, "details"))
                for (let keys = Object.keys(message.details), i = 0; i < keys.length; ++i)
                    writer.uint32(/* id 3, wireType 2 =*/26).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]).uint32(/* id 2, wireType 2 =*/18).string(message.details[keys[i]]).ldelim();
            return writer;
        };

        /**
         * Encodes the specified Error message, length delimited. Does not implicitly {@link taskgraph.Error.verify|verify} messages.
         * @function encodeDelimited
         * @memberof taskgraph.Error
         * @static
         * @param {taskgraph.IError} message Error message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Error.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an Error message from the specified reader or buffer.
         * @function decode
         * @memberof taskgraph.Error
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {taskgraph.Error} Error
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Error.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.taskgraph.Error(), key, value;
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.code = reader.string();
                        break;
                    }
                case 2: {
                        message.message = reader.string();
                        break;
                    }
                case 3: {
                        if (message.details === $util.emptyObject)
                            message.details = {};
                        let end2 = reader.uint32() + reader.pos;
                        key = "";
                        value = "";
                        while (reader.pos < end2) {
                            let tag2 = reader.uint32();
                            switch (tag2 >>> 3) {
                            case 1:
                                key = reader.string();
                                break;
                            case 2:
                                value = reader.string();
                                break;
                            default:
                                reader.skipType(tag2 & 7);
                                break;
                            }
                        }
                        message.details[key] = value;
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an Error message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof taskgraph.Error
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {taskgraph.Error} Error
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Error.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Error message.
         * @function verify
         * @memberof taskgraph.Error
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Error.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.code != null && message.hasOwnProperty("code"))
                if (!$util.isString(message.code))
                    return "code: string expected";
            if (message.message != null && message.hasOwnProperty("message"))
                if (!$util.isString(message.message))
                    return "message: string expected";
            if (message.details != null && message.hasOwnProperty("details")) {
                if (!$util.isObject(message.details))
                    return "details: object expected";
                let key = Object.keys(message.details);
                for (let i = 0; i < key.length; ++i)
                    if (!$util.isString(message.details[key[i]]))
                        return "details: string{k:string} expected";
            }
            return null;
        };

        /**
         * Creates an Error message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof taskgraph.Error
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {taskgraph.Error} Error
         */
        Error.fromObject = function fromObject(object) {
            if (object instanceof $root.taskgraph.Error)
                return object;
            let message = new $root.taskgraph.Error();
            if (object.code != null)
                message.code = String(object.code);
            if (object.message != null)
                message.message = String(object.message);
            if (object.details) {
                if (typeof object.details !== "object")
                    throw TypeError(".taskgraph.Error.details: object expected");
                message.details = {};
                for (let keys = Object.keys(object.details), i = 0; i < keys.length; ++i)
                    message.details[keys[i]] = String(object.details[keys[i]]);
            }
            return message;
        };

        /**
         * Creates a plain object from an Error message. Also converts values to other types if specified.
         * @function toObject
         * @memberof taskgraph.Error
         * @static
         * @param {taskgraph.Error} message Error
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Error.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.objects || options.defaults)
                object.details = {};
            if (options.defaults) {
                object.code = "";
                object.message = "";
            }
            if (message.code != null && message.hasOwnProperty("code"))
                object.code = message.code;
            if (message.message != null && message.hasOwnProperty("message"))
                object.message = message.message;
            let keys2;
            if (message.details && (keys2 = Object.keys(message.details)).length) {
                object.details = {};
                for (let j = 0; j < keys2.length; ++j)
                    object.details[keys2[j]] = message.details[keys2[j]];
            }
            return object;
        };

        /**
         * Converts this Error to JSON.
         * @function toJSON
         * @memberof taskgraph.Error
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Error.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Error
         * @function getTypeUrl
         * @memberof taskgraph.Error
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Error.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/taskgraph.Error";
        };

        return Error;
    })();

    taskgraph.SuccessResponse = (function() {

        /**
         * Properties of a SuccessResponse.
         * @memberof taskgraph
         * @interface ISuccessResponse
         * @property {boolean|null} [success] SuccessResponse success
         * @property {taskgraph.IError|null} [error] SuccessResponse error
         */

        /**
         * Constructs a new SuccessResponse.
         * @memberof taskgraph
         * @classdesc Represents a SuccessResponse.
         * @implements ISuccessResponse
         * @constructor
         * @param {taskgraph.ISuccessResponse=} [properties] Properties to set
         */
        function SuccessResponse(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * SuccessResponse success.
         * @member {boolean} success
         * @memberof taskgraph.SuccessResponse
         * @instance
         */
        SuccessResponse.prototype.success = false;

        /**
         * SuccessResponse error.
         * @member {taskgraph.IError|null|undefined} error
         * @memberof taskgraph.SuccessResponse
         * @instance
         */
        SuccessResponse.prototype.error = null;

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(SuccessResponse.prototype, "_error", {
            get: $util.oneOfGetter($oneOfFields = ["error"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new SuccessResponse instance using the specified properties.
         * @function create
         * @memberof taskgraph.SuccessResponse
         * @static
         * @param {taskgraph.ISuccessResponse=} [properties] Properties to set
         * @returns {taskgraph.SuccessResponse} SuccessResponse instance
         */
        SuccessResponse.create = function create(properties) {
            return new SuccessResponse(properties);
        };

        /**
         * Encodes the specified SuccessResponse message. Does not implicitly {@link taskgraph.SuccessResponse.verify|verify} messages.
         * @function encode
         * @memberof taskgraph.SuccessResponse
         * @static
         * @param {taskgraph.ISuccessResponse} message SuccessResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        SuccessResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.success != null && Object.hasOwnProperty.call(message, "success"))
                writer.uint32(/* id 1, wireType 0 =*/8).bool(message.success);
            if (message.error != null && Object.hasOwnProperty.call(message, "error"))
                $root.taskgraph.Error.encode(message.error, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified SuccessResponse message, length delimited. Does not implicitly {@link taskgraph.SuccessResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof taskgraph.SuccessResponse
         * @static
         * @param {taskgraph.ISuccessResponse} message SuccessResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        SuccessResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a SuccessResponse message from the specified reader or buffer.
         * @function decode
         * @memberof taskgraph.SuccessResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {taskgraph.SuccessResponse} SuccessResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        SuccessResponse.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.taskgraph.SuccessResponse();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.success = reader.bool();
                        break;
                    }
                case 2: {
                        message.error = $root.taskgraph.Error.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a SuccessResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof taskgraph.SuccessResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {taskgraph.SuccessResponse} SuccessResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        SuccessResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a SuccessResponse message.
         * @function verify
         * @memberof taskgraph.SuccessResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        SuccessResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
            if (message.success != null && message.hasOwnProperty("success"))
                if (typeof message.success !== "boolean")
                    return "success: boolean expected";
            if (message.error != null && message.hasOwnProperty("error")) {
                properties._error = 1;
                {
                    let error = $root.taskgraph.Error.verify(message.error);
                    if (error)
                        return "error." + error;
                }
            }
            return null;
        };

        /**
         * Creates a SuccessResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof taskgraph.SuccessResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {taskgraph.SuccessResponse} SuccessResponse
         */
        SuccessResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.taskgraph.SuccessResponse)
                return object;
            let message = new $root.taskgraph.SuccessResponse();
            if (object.success != null)
                message.success = Boolean(object.success);
            if (object.error != null) {
                if (typeof object.error !== "object")
                    throw TypeError(".taskgraph.SuccessResponse.error: object expected");
                message.error = $root.taskgraph.Error.fromObject(object.error);
            }
            return message;
        };

        /**
         * Creates a plain object from a SuccessResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof taskgraph.SuccessResponse
         * @static
         * @param {taskgraph.SuccessResponse} message SuccessResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        SuccessResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults)
                object.success = false;
            if (message.success != null && message.hasOwnProperty("success"))
                object.success = message.success;
            if (message.error != null && message.hasOwnProperty("error")) {
                object.error = $root.taskgraph.Error.toObject(message.error, options);
                if (options.oneofs)
                    object._error = "error";
            }
            return object;
        };

        /**
         * Converts this SuccessResponse to JSON.
         * @function toJSON
         * @memberof taskgraph.SuccessResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        SuccessResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for SuccessResponse
         * @function getTypeUrl
         * @memberof taskgraph.SuccessResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        SuccessResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/taskgraph.SuccessResponse";
        };

        return SuccessResponse;
    })();

    return taskgraph;
})();

export { $root as default };
