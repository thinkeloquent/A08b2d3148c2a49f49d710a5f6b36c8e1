/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const ai_ask = $root.ai_ask = (() => {

    /**
     * Namespace ai_ask.
     * @exports ai_ask
     * @namespace
     */
    const ai_ask = {};

    ai_ask.Persona = (function() {

        /**
         * Properties of a Persona.
         * @memberof ai_ask
         * @interface IPersona
         * @property {string|null} [id] Persona id
         * @property {string|null} [name] Persona name
         * @property {string|null} [description] Persona description
         * @property {string|null} [role] Persona role
         * @property {string|null} [tone] Persona tone
         * @property {string|null} [llmProvider] Persona llmProvider
         * @property {number|null} [llmTemperature] Persona llmTemperature
         * @property {string|null} [llmParametersJson] Persona llmParametersJson
         * @property {Array.<string>|null} [goals] Persona goals
         * @property {Array.<string>|null} [tools] Persona tools
         * @property {Array.<string>|null} [permittedTo] Persona permittedTo
         * @property {Array.<string>|null} [promptSystemTemplate] Persona promptSystemTemplate
         * @property {Array.<string>|null} [promptUserTemplate] Persona promptUserTemplate
         * @property {Array.<string>|null} [promptContextTemplate] Persona promptContextTemplate
         * @property {Array.<string>|null} [promptInstruction] Persona promptInstruction
         * @property {Array.<string>|null} [agentDelegate] Persona agentDelegate
         * @property {Array.<string>|null} [agentCall] Persona agentCall
         * @property {Array.<string>|null} [contextFiles] Persona contextFiles
         * @property {string|null} [memoryJson] Persona memoryJson
         * @property {string|null} [version] Persona version
         * @property {string|null} [createdAt] Persona createdAt
         * @property {string|null} [updatedAt] Persona updatedAt
         */

        /**
         * Constructs a new Persona.
         * @memberof ai_ask
         * @classdesc Represents a Persona.
         * @implements IPersona
         * @constructor
         * @param {ai_ask.IPersona=} [properties] Properties to set
         */
        function Persona(properties) {
            this.goals = [];
            this.tools = [];
            this.permittedTo = [];
            this.promptSystemTemplate = [];
            this.promptUserTemplate = [];
            this.promptContextTemplate = [];
            this.promptInstruction = [];
            this.agentDelegate = [];
            this.agentCall = [];
            this.contextFiles = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Persona id.
         * @member {string} id
         * @memberof ai_ask.Persona
         * @instance
         */
        Persona.prototype.id = "";

        /**
         * Persona name.
         * @member {string} name
         * @memberof ai_ask.Persona
         * @instance
         */
        Persona.prototype.name = "";

        /**
         * Persona description.
         * @member {string} description
         * @memberof ai_ask.Persona
         * @instance
         */
        Persona.prototype.description = "";

        /**
         * Persona role.
         * @member {string} role
         * @memberof ai_ask.Persona
         * @instance
         */
        Persona.prototype.role = "";

        /**
         * Persona tone.
         * @member {string} tone
         * @memberof ai_ask.Persona
         * @instance
         */
        Persona.prototype.tone = "";

        /**
         * Persona llmProvider.
         * @member {string} llmProvider
         * @memberof ai_ask.Persona
         * @instance
         */
        Persona.prototype.llmProvider = "";

        /**
         * Persona llmTemperature.
         * @member {number} llmTemperature
         * @memberof ai_ask.Persona
         * @instance
         */
        Persona.prototype.llmTemperature = 0;

        /**
         * Persona llmParametersJson.
         * @member {string} llmParametersJson
         * @memberof ai_ask.Persona
         * @instance
         */
        Persona.prototype.llmParametersJson = "";

        /**
         * Persona goals.
         * @member {Array.<string>} goals
         * @memberof ai_ask.Persona
         * @instance
         */
        Persona.prototype.goals = $util.emptyArray;

        /**
         * Persona tools.
         * @member {Array.<string>} tools
         * @memberof ai_ask.Persona
         * @instance
         */
        Persona.prototype.tools = $util.emptyArray;

        /**
         * Persona permittedTo.
         * @member {Array.<string>} permittedTo
         * @memberof ai_ask.Persona
         * @instance
         */
        Persona.prototype.permittedTo = $util.emptyArray;

        /**
         * Persona promptSystemTemplate.
         * @member {Array.<string>} promptSystemTemplate
         * @memberof ai_ask.Persona
         * @instance
         */
        Persona.prototype.promptSystemTemplate = $util.emptyArray;

        /**
         * Persona promptUserTemplate.
         * @member {Array.<string>} promptUserTemplate
         * @memberof ai_ask.Persona
         * @instance
         */
        Persona.prototype.promptUserTemplate = $util.emptyArray;

        /**
         * Persona promptContextTemplate.
         * @member {Array.<string>} promptContextTemplate
         * @memberof ai_ask.Persona
         * @instance
         */
        Persona.prototype.promptContextTemplate = $util.emptyArray;

        /**
         * Persona promptInstruction.
         * @member {Array.<string>} promptInstruction
         * @memberof ai_ask.Persona
         * @instance
         */
        Persona.prototype.promptInstruction = $util.emptyArray;

        /**
         * Persona agentDelegate.
         * @member {Array.<string>} agentDelegate
         * @memberof ai_ask.Persona
         * @instance
         */
        Persona.prototype.agentDelegate = $util.emptyArray;

        /**
         * Persona agentCall.
         * @member {Array.<string>} agentCall
         * @memberof ai_ask.Persona
         * @instance
         */
        Persona.prototype.agentCall = $util.emptyArray;

        /**
         * Persona contextFiles.
         * @member {Array.<string>} contextFiles
         * @memberof ai_ask.Persona
         * @instance
         */
        Persona.prototype.contextFiles = $util.emptyArray;

        /**
         * Persona memoryJson.
         * @member {string} memoryJson
         * @memberof ai_ask.Persona
         * @instance
         */
        Persona.prototype.memoryJson = "";

        /**
         * Persona version.
         * @member {string} version
         * @memberof ai_ask.Persona
         * @instance
         */
        Persona.prototype.version = "";

        /**
         * Persona createdAt.
         * @member {string} createdAt
         * @memberof ai_ask.Persona
         * @instance
         */
        Persona.prototype.createdAt = "";

        /**
         * Persona updatedAt.
         * @member {string} updatedAt
         * @memberof ai_ask.Persona
         * @instance
         */
        Persona.prototype.updatedAt = "";

        /**
         * Creates a new Persona instance using the specified properties.
         * @function create
         * @memberof ai_ask.Persona
         * @static
         * @param {ai_ask.IPersona=} [properties] Properties to set
         * @returns {ai_ask.Persona} Persona instance
         */
        Persona.create = function create(properties) {
            return new Persona(properties);
        };

        /**
         * Encodes the specified Persona message. Does not implicitly {@link ai_ask.Persona.verify|verify} messages.
         * @function encode
         * @memberof ai_ask.Persona
         * @static
         * @param {ai_ask.IPersona} message Persona message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Persona.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.description);
            if (message.role != null && Object.hasOwnProperty.call(message, "role"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.role);
            if (message.tone != null && Object.hasOwnProperty.call(message, "tone"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.tone);
            if (message.llmProvider != null && Object.hasOwnProperty.call(message, "llmProvider"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.llmProvider);
            if (message.llmTemperature != null && Object.hasOwnProperty.call(message, "llmTemperature"))
                writer.uint32(/* id 7, wireType 5 =*/61).float(message.llmTemperature);
            if (message.llmParametersJson != null && Object.hasOwnProperty.call(message, "llmParametersJson"))
                writer.uint32(/* id 8, wireType 2 =*/66).string(message.llmParametersJson);
            if (message.goals != null && message.goals.length)
                for (let i = 0; i < message.goals.length; ++i)
                    writer.uint32(/* id 9, wireType 2 =*/74).string(message.goals[i]);
            if (message.tools != null && message.tools.length)
                for (let i = 0; i < message.tools.length; ++i)
                    writer.uint32(/* id 10, wireType 2 =*/82).string(message.tools[i]);
            if (message.permittedTo != null && message.permittedTo.length)
                for (let i = 0; i < message.permittedTo.length; ++i)
                    writer.uint32(/* id 11, wireType 2 =*/90).string(message.permittedTo[i]);
            if (message.promptSystemTemplate != null && message.promptSystemTemplate.length)
                for (let i = 0; i < message.promptSystemTemplate.length; ++i)
                    writer.uint32(/* id 12, wireType 2 =*/98).string(message.promptSystemTemplate[i]);
            if (message.promptUserTemplate != null && message.promptUserTemplate.length)
                for (let i = 0; i < message.promptUserTemplate.length; ++i)
                    writer.uint32(/* id 13, wireType 2 =*/106).string(message.promptUserTemplate[i]);
            if (message.promptContextTemplate != null && message.promptContextTemplate.length)
                for (let i = 0; i < message.promptContextTemplate.length; ++i)
                    writer.uint32(/* id 14, wireType 2 =*/114).string(message.promptContextTemplate[i]);
            if (message.promptInstruction != null && message.promptInstruction.length)
                for (let i = 0; i < message.promptInstruction.length; ++i)
                    writer.uint32(/* id 15, wireType 2 =*/122).string(message.promptInstruction[i]);
            if (message.agentDelegate != null && message.agentDelegate.length)
                for (let i = 0; i < message.agentDelegate.length; ++i)
                    writer.uint32(/* id 16, wireType 2 =*/130).string(message.agentDelegate[i]);
            if (message.agentCall != null && message.agentCall.length)
                for (let i = 0; i < message.agentCall.length; ++i)
                    writer.uint32(/* id 17, wireType 2 =*/138).string(message.agentCall[i]);
            if (message.contextFiles != null && message.contextFiles.length)
                for (let i = 0; i < message.contextFiles.length; ++i)
                    writer.uint32(/* id 18, wireType 2 =*/146).string(message.contextFiles[i]);
            if (message.memoryJson != null && Object.hasOwnProperty.call(message, "memoryJson"))
                writer.uint32(/* id 19, wireType 2 =*/154).string(message.memoryJson);
            if (message.version != null && Object.hasOwnProperty.call(message, "version"))
                writer.uint32(/* id 20, wireType 2 =*/162).string(message.version);
            if (message.createdAt != null && Object.hasOwnProperty.call(message, "createdAt"))
                writer.uint32(/* id 21, wireType 2 =*/170).string(message.createdAt);
            if (message.updatedAt != null && Object.hasOwnProperty.call(message, "updatedAt"))
                writer.uint32(/* id 22, wireType 2 =*/178).string(message.updatedAt);
            return writer;
        };

        /**
         * Encodes the specified Persona message, length delimited. Does not implicitly {@link ai_ask.Persona.verify|verify} messages.
         * @function encodeDelimited
         * @memberof ai_ask.Persona
         * @static
         * @param {ai_ask.IPersona} message Persona message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Persona.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Persona message from the specified reader or buffer.
         * @function decode
         * @memberof ai_ask.Persona
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {ai_ask.Persona} Persona
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Persona.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.ai_ask.Persona();
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
                        message.name = reader.string();
                        break;
                    }
                case 3: {
                        message.description = reader.string();
                        break;
                    }
                case 4: {
                        message.role = reader.string();
                        break;
                    }
                case 5: {
                        message.tone = reader.string();
                        break;
                    }
                case 6: {
                        message.llmProvider = reader.string();
                        break;
                    }
                case 7: {
                        message.llmTemperature = reader.float();
                        break;
                    }
                case 8: {
                        message.llmParametersJson = reader.string();
                        break;
                    }
                case 9: {
                        if (!(message.goals && message.goals.length))
                            message.goals = [];
                        message.goals.push(reader.string());
                        break;
                    }
                case 10: {
                        if (!(message.tools && message.tools.length))
                            message.tools = [];
                        message.tools.push(reader.string());
                        break;
                    }
                case 11: {
                        if (!(message.permittedTo && message.permittedTo.length))
                            message.permittedTo = [];
                        message.permittedTo.push(reader.string());
                        break;
                    }
                case 12: {
                        if (!(message.promptSystemTemplate && message.promptSystemTemplate.length))
                            message.promptSystemTemplate = [];
                        message.promptSystemTemplate.push(reader.string());
                        break;
                    }
                case 13: {
                        if (!(message.promptUserTemplate && message.promptUserTemplate.length))
                            message.promptUserTemplate = [];
                        message.promptUserTemplate.push(reader.string());
                        break;
                    }
                case 14: {
                        if (!(message.promptContextTemplate && message.promptContextTemplate.length))
                            message.promptContextTemplate = [];
                        message.promptContextTemplate.push(reader.string());
                        break;
                    }
                case 15: {
                        if (!(message.promptInstruction && message.promptInstruction.length))
                            message.promptInstruction = [];
                        message.promptInstruction.push(reader.string());
                        break;
                    }
                case 16: {
                        if (!(message.agentDelegate && message.agentDelegate.length))
                            message.agentDelegate = [];
                        message.agentDelegate.push(reader.string());
                        break;
                    }
                case 17: {
                        if (!(message.agentCall && message.agentCall.length))
                            message.agentCall = [];
                        message.agentCall.push(reader.string());
                        break;
                    }
                case 18: {
                        if (!(message.contextFiles && message.contextFiles.length))
                            message.contextFiles = [];
                        message.contextFiles.push(reader.string());
                        break;
                    }
                case 19: {
                        message.memoryJson = reader.string();
                        break;
                    }
                case 20: {
                        message.version = reader.string();
                        break;
                    }
                case 21: {
                        message.createdAt = reader.string();
                        break;
                    }
                case 22: {
                        message.updatedAt = reader.string();
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
         * Decodes a Persona message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof ai_ask.Persona
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {ai_ask.Persona} Persona
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Persona.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Persona message.
         * @function verify
         * @memberof ai_ask.Persona
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Persona.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.description != null && message.hasOwnProperty("description"))
                if (!$util.isString(message.description))
                    return "description: string expected";
            if (message.role != null && message.hasOwnProperty("role"))
                if (!$util.isString(message.role))
                    return "role: string expected";
            if (message.tone != null && message.hasOwnProperty("tone"))
                if (!$util.isString(message.tone))
                    return "tone: string expected";
            if (message.llmProvider != null && message.hasOwnProperty("llmProvider"))
                if (!$util.isString(message.llmProvider))
                    return "llmProvider: string expected";
            if (message.llmTemperature != null && message.hasOwnProperty("llmTemperature"))
                if (typeof message.llmTemperature !== "number")
                    return "llmTemperature: number expected";
            if (message.llmParametersJson != null && message.hasOwnProperty("llmParametersJson"))
                if (!$util.isString(message.llmParametersJson))
                    return "llmParametersJson: string expected";
            if (message.goals != null && message.hasOwnProperty("goals")) {
                if (!Array.isArray(message.goals))
                    return "goals: array expected";
                for (let i = 0; i < message.goals.length; ++i)
                    if (!$util.isString(message.goals[i]))
                        return "goals: string[] expected";
            }
            if (message.tools != null && message.hasOwnProperty("tools")) {
                if (!Array.isArray(message.tools))
                    return "tools: array expected";
                for (let i = 0; i < message.tools.length; ++i)
                    if (!$util.isString(message.tools[i]))
                        return "tools: string[] expected";
            }
            if (message.permittedTo != null && message.hasOwnProperty("permittedTo")) {
                if (!Array.isArray(message.permittedTo))
                    return "permittedTo: array expected";
                for (let i = 0; i < message.permittedTo.length; ++i)
                    if (!$util.isString(message.permittedTo[i]))
                        return "permittedTo: string[] expected";
            }
            if (message.promptSystemTemplate != null && message.hasOwnProperty("promptSystemTemplate")) {
                if (!Array.isArray(message.promptSystemTemplate))
                    return "promptSystemTemplate: array expected";
                for (let i = 0; i < message.promptSystemTemplate.length; ++i)
                    if (!$util.isString(message.promptSystemTemplate[i]))
                        return "promptSystemTemplate: string[] expected";
            }
            if (message.promptUserTemplate != null && message.hasOwnProperty("promptUserTemplate")) {
                if (!Array.isArray(message.promptUserTemplate))
                    return "promptUserTemplate: array expected";
                for (let i = 0; i < message.promptUserTemplate.length; ++i)
                    if (!$util.isString(message.promptUserTemplate[i]))
                        return "promptUserTemplate: string[] expected";
            }
            if (message.promptContextTemplate != null && message.hasOwnProperty("promptContextTemplate")) {
                if (!Array.isArray(message.promptContextTemplate))
                    return "promptContextTemplate: array expected";
                for (let i = 0; i < message.promptContextTemplate.length; ++i)
                    if (!$util.isString(message.promptContextTemplate[i]))
                        return "promptContextTemplate: string[] expected";
            }
            if (message.promptInstruction != null && message.hasOwnProperty("promptInstruction")) {
                if (!Array.isArray(message.promptInstruction))
                    return "promptInstruction: array expected";
                for (let i = 0; i < message.promptInstruction.length; ++i)
                    if (!$util.isString(message.promptInstruction[i]))
                        return "promptInstruction: string[] expected";
            }
            if (message.agentDelegate != null && message.hasOwnProperty("agentDelegate")) {
                if (!Array.isArray(message.agentDelegate))
                    return "agentDelegate: array expected";
                for (let i = 0; i < message.agentDelegate.length; ++i)
                    if (!$util.isString(message.agentDelegate[i]))
                        return "agentDelegate: string[] expected";
            }
            if (message.agentCall != null && message.hasOwnProperty("agentCall")) {
                if (!Array.isArray(message.agentCall))
                    return "agentCall: array expected";
                for (let i = 0; i < message.agentCall.length; ++i)
                    if (!$util.isString(message.agentCall[i]))
                        return "agentCall: string[] expected";
            }
            if (message.contextFiles != null && message.hasOwnProperty("contextFiles")) {
                if (!Array.isArray(message.contextFiles))
                    return "contextFiles: array expected";
                for (let i = 0; i < message.contextFiles.length; ++i)
                    if (!$util.isString(message.contextFiles[i]))
                        return "contextFiles: string[] expected";
            }
            if (message.memoryJson != null && message.hasOwnProperty("memoryJson"))
                if (!$util.isString(message.memoryJson))
                    return "memoryJson: string expected";
            if (message.version != null && message.hasOwnProperty("version"))
                if (!$util.isString(message.version))
                    return "version: string expected";
            if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                if (!$util.isString(message.createdAt))
                    return "createdAt: string expected";
            if (message.updatedAt != null && message.hasOwnProperty("updatedAt"))
                if (!$util.isString(message.updatedAt))
                    return "updatedAt: string expected";
            return null;
        };

        /**
         * Creates a Persona message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof ai_ask.Persona
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {ai_ask.Persona} Persona
         */
        Persona.fromObject = function fromObject(object) {
            if (object instanceof $root.ai_ask.Persona)
                return object;
            let message = new $root.ai_ask.Persona();
            if (object.id != null)
                message.id = String(object.id);
            if (object.name != null)
                message.name = String(object.name);
            if (object.description != null)
                message.description = String(object.description);
            if (object.role != null)
                message.role = String(object.role);
            if (object.tone != null)
                message.tone = String(object.tone);
            if (object.llmProvider != null)
                message.llmProvider = String(object.llmProvider);
            if (object.llmTemperature != null)
                message.llmTemperature = Number(object.llmTemperature);
            if (object.llmParametersJson != null)
                message.llmParametersJson = String(object.llmParametersJson);
            if (object.goals) {
                if (!Array.isArray(object.goals))
                    throw TypeError(".ai_ask.Persona.goals: array expected");
                message.goals = [];
                for (let i = 0; i < object.goals.length; ++i)
                    message.goals[i] = String(object.goals[i]);
            }
            if (object.tools) {
                if (!Array.isArray(object.tools))
                    throw TypeError(".ai_ask.Persona.tools: array expected");
                message.tools = [];
                for (let i = 0; i < object.tools.length; ++i)
                    message.tools[i] = String(object.tools[i]);
            }
            if (object.permittedTo) {
                if (!Array.isArray(object.permittedTo))
                    throw TypeError(".ai_ask.Persona.permittedTo: array expected");
                message.permittedTo = [];
                for (let i = 0; i < object.permittedTo.length; ++i)
                    message.permittedTo[i] = String(object.permittedTo[i]);
            }
            if (object.promptSystemTemplate) {
                if (!Array.isArray(object.promptSystemTemplate))
                    throw TypeError(".ai_ask.Persona.promptSystemTemplate: array expected");
                message.promptSystemTemplate = [];
                for (let i = 0; i < object.promptSystemTemplate.length; ++i)
                    message.promptSystemTemplate[i] = String(object.promptSystemTemplate[i]);
            }
            if (object.promptUserTemplate) {
                if (!Array.isArray(object.promptUserTemplate))
                    throw TypeError(".ai_ask.Persona.promptUserTemplate: array expected");
                message.promptUserTemplate = [];
                for (let i = 0; i < object.promptUserTemplate.length; ++i)
                    message.promptUserTemplate[i] = String(object.promptUserTemplate[i]);
            }
            if (object.promptContextTemplate) {
                if (!Array.isArray(object.promptContextTemplate))
                    throw TypeError(".ai_ask.Persona.promptContextTemplate: array expected");
                message.promptContextTemplate = [];
                for (let i = 0; i < object.promptContextTemplate.length; ++i)
                    message.promptContextTemplate[i] = String(object.promptContextTemplate[i]);
            }
            if (object.promptInstruction) {
                if (!Array.isArray(object.promptInstruction))
                    throw TypeError(".ai_ask.Persona.promptInstruction: array expected");
                message.promptInstruction = [];
                for (let i = 0; i < object.promptInstruction.length; ++i)
                    message.promptInstruction[i] = String(object.promptInstruction[i]);
            }
            if (object.agentDelegate) {
                if (!Array.isArray(object.agentDelegate))
                    throw TypeError(".ai_ask.Persona.agentDelegate: array expected");
                message.agentDelegate = [];
                for (let i = 0; i < object.agentDelegate.length; ++i)
                    message.agentDelegate[i] = String(object.agentDelegate[i]);
            }
            if (object.agentCall) {
                if (!Array.isArray(object.agentCall))
                    throw TypeError(".ai_ask.Persona.agentCall: array expected");
                message.agentCall = [];
                for (let i = 0; i < object.agentCall.length; ++i)
                    message.agentCall[i] = String(object.agentCall[i]);
            }
            if (object.contextFiles) {
                if (!Array.isArray(object.contextFiles))
                    throw TypeError(".ai_ask.Persona.contextFiles: array expected");
                message.contextFiles = [];
                for (let i = 0; i < object.contextFiles.length; ++i)
                    message.contextFiles[i] = String(object.contextFiles[i]);
            }
            if (object.memoryJson != null)
                message.memoryJson = String(object.memoryJson);
            if (object.version != null)
                message.version = String(object.version);
            if (object.createdAt != null)
                message.createdAt = String(object.createdAt);
            if (object.updatedAt != null)
                message.updatedAt = String(object.updatedAt);
            return message;
        };

        /**
         * Creates a plain object from a Persona message. Also converts values to other types if specified.
         * @function toObject
         * @memberof ai_ask.Persona
         * @static
         * @param {ai_ask.Persona} message Persona
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Persona.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults) {
                object.goals = [];
                object.tools = [];
                object.permittedTo = [];
                object.promptSystemTemplate = [];
                object.promptUserTemplate = [];
                object.promptContextTemplate = [];
                object.promptInstruction = [];
                object.agentDelegate = [];
                object.agentCall = [];
                object.contextFiles = [];
            }
            if (options.defaults) {
                object.id = "";
                object.name = "";
                object.description = "";
                object.role = "";
                object.tone = "";
                object.llmProvider = "";
                object.llmTemperature = 0;
                object.llmParametersJson = "";
                object.memoryJson = "";
                object.version = "";
                object.createdAt = "";
                object.updatedAt = "";
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.description != null && message.hasOwnProperty("description"))
                object.description = message.description;
            if (message.role != null && message.hasOwnProperty("role"))
                object.role = message.role;
            if (message.tone != null && message.hasOwnProperty("tone"))
                object.tone = message.tone;
            if (message.llmProvider != null && message.hasOwnProperty("llmProvider"))
                object.llmProvider = message.llmProvider;
            if (message.llmTemperature != null && message.hasOwnProperty("llmTemperature"))
                object.llmTemperature = options.json && !isFinite(message.llmTemperature) ? String(message.llmTemperature) : message.llmTemperature;
            if (message.llmParametersJson != null && message.hasOwnProperty("llmParametersJson"))
                object.llmParametersJson = message.llmParametersJson;
            if (message.goals && message.goals.length) {
                object.goals = [];
                for (let j = 0; j < message.goals.length; ++j)
                    object.goals[j] = message.goals[j];
            }
            if (message.tools && message.tools.length) {
                object.tools = [];
                for (let j = 0; j < message.tools.length; ++j)
                    object.tools[j] = message.tools[j];
            }
            if (message.permittedTo && message.permittedTo.length) {
                object.permittedTo = [];
                for (let j = 0; j < message.permittedTo.length; ++j)
                    object.permittedTo[j] = message.permittedTo[j];
            }
            if (message.promptSystemTemplate && message.promptSystemTemplate.length) {
                object.promptSystemTemplate = [];
                for (let j = 0; j < message.promptSystemTemplate.length; ++j)
                    object.promptSystemTemplate[j] = message.promptSystemTemplate[j];
            }
            if (message.promptUserTemplate && message.promptUserTemplate.length) {
                object.promptUserTemplate = [];
                for (let j = 0; j < message.promptUserTemplate.length; ++j)
                    object.promptUserTemplate[j] = message.promptUserTemplate[j];
            }
            if (message.promptContextTemplate && message.promptContextTemplate.length) {
                object.promptContextTemplate = [];
                for (let j = 0; j < message.promptContextTemplate.length; ++j)
                    object.promptContextTemplate[j] = message.promptContextTemplate[j];
            }
            if (message.promptInstruction && message.promptInstruction.length) {
                object.promptInstruction = [];
                for (let j = 0; j < message.promptInstruction.length; ++j)
                    object.promptInstruction[j] = message.promptInstruction[j];
            }
            if (message.agentDelegate && message.agentDelegate.length) {
                object.agentDelegate = [];
                for (let j = 0; j < message.agentDelegate.length; ++j)
                    object.agentDelegate[j] = message.agentDelegate[j];
            }
            if (message.agentCall && message.agentCall.length) {
                object.agentCall = [];
                for (let j = 0; j < message.agentCall.length; ++j)
                    object.agentCall[j] = message.agentCall[j];
            }
            if (message.contextFiles && message.contextFiles.length) {
                object.contextFiles = [];
                for (let j = 0; j < message.contextFiles.length; ++j)
                    object.contextFiles[j] = message.contextFiles[j];
            }
            if (message.memoryJson != null && message.hasOwnProperty("memoryJson"))
                object.memoryJson = message.memoryJson;
            if (message.version != null && message.hasOwnProperty("version"))
                object.version = message.version;
            if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                object.createdAt = message.createdAt;
            if (message.updatedAt != null && message.hasOwnProperty("updatedAt"))
                object.updatedAt = message.updatedAt;
            return object;
        };

        /**
         * Converts this Persona to JSON.
         * @function toJSON
         * @memberof ai_ask.Persona
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Persona.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Persona
         * @function getTypeUrl
         * @memberof ai_ask.Persona
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Persona.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/ai_ask.Persona";
        };

        return Persona;
    })();

    ai_ask.PersonaList = (function() {

        /**
         * Properties of a PersonaList.
         * @memberof ai_ask
         * @interface IPersonaList
         * @property {Array.<ai_ask.IPersona>|null} [personas] PersonaList personas
         */

        /**
         * Constructs a new PersonaList.
         * @memberof ai_ask
         * @classdesc Represents a PersonaList.
         * @implements IPersonaList
         * @constructor
         * @param {ai_ask.IPersonaList=} [properties] Properties to set
         */
        function PersonaList(properties) {
            this.personas = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PersonaList personas.
         * @member {Array.<ai_ask.IPersona>} personas
         * @memberof ai_ask.PersonaList
         * @instance
         */
        PersonaList.prototype.personas = $util.emptyArray;

        /**
         * Creates a new PersonaList instance using the specified properties.
         * @function create
         * @memberof ai_ask.PersonaList
         * @static
         * @param {ai_ask.IPersonaList=} [properties] Properties to set
         * @returns {ai_ask.PersonaList} PersonaList instance
         */
        PersonaList.create = function create(properties) {
            return new PersonaList(properties);
        };

        /**
         * Encodes the specified PersonaList message. Does not implicitly {@link ai_ask.PersonaList.verify|verify} messages.
         * @function encode
         * @memberof ai_ask.PersonaList
         * @static
         * @param {ai_ask.IPersonaList} message PersonaList message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PersonaList.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.personas != null && message.personas.length)
                for (let i = 0; i < message.personas.length; ++i)
                    $root.ai_ask.Persona.encode(message.personas[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified PersonaList message, length delimited. Does not implicitly {@link ai_ask.PersonaList.verify|verify} messages.
         * @function encodeDelimited
         * @memberof ai_ask.PersonaList
         * @static
         * @param {ai_ask.IPersonaList} message PersonaList message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PersonaList.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PersonaList message from the specified reader or buffer.
         * @function decode
         * @memberof ai_ask.PersonaList
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {ai_ask.PersonaList} PersonaList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PersonaList.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.ai_ask.PersonaList();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.personas && message.personas.length))
                            message.personas = [];
                        message.personas.push($root.ai_ask.Persona.decode(reader, reader.uint32()));
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
         * Decodes a PersonaList message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof ai_ask.PersonaList
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {ai_ask.PersonaList} PersonaList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PersonaList.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PersonaList message.
         * @function verify
         * @memberof ai_ask.PersonaList
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PersonaList.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.personas != null && message.hasOwnProperty("personas")) {
                if (!Array.isArray(message.personas))
                    return "personas: array expected";
                for (let i = 0; i < message.personas.length; ++i) {
                    let error = $root.ai_ask.Persona.verify(message.personas[i]);
                    if (error)
                        return "personas." + error;
                }
            }
            return null;
        };

        /**
         * Creates a PersonaList message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof ai_ask.PersonaList
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {ai_ask.PersonaList} PersonaList
         */
        PersonaList.fromObject = function fromObject(object) {
            if (object instanceof $root.ai_ask.PersonaList)
                return object;
            let message = new $root.ai_ask.PersonaList();
            if (object.personas) {
                if (!Array.isArray(object.personas))
                    throw TypeError(".ai_ask.PersonaList.personas: array expected");
                message.personas = [];
                for (let i = 0; i < object.personas.length; ++i) {
                    if (typeof object.personas[i] !== "object")
                        throw TypeError(".ai_ask.PersonaList.personas: object expected");
                    message.personas[i] = $root.ai_ask.Persona.fromObject(object.personas[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a PersonaList message. Also converts values to other types if specified.
         * @function toObject
         * @memberof ai_ask.PersonaList
         * @static
         * @param {ai_ask.PersonaList} message PersonaList
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PersonaList.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.personas = [];
            if (message.personas && message.personas.length) {
                object.personas = [];
                for (let j = 0; j < message.personas.length; ++j)
                    object.personas[j] = $root.ai_ask.Persona.toObject(message.personas[j], options);
            }
            return object;
        };

        /**
         * Converts this PersonaList to JSON.
         * @function toJSON
         * @memberof ai_ask.PersonaList
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PersonaList.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PersonaList
         * @function getTypeUrl
         * @memberof ai_ask.PersonaList
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PersonaList.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/ai_ask.PersonaList";
        };

        return PersonaList;
    })();

    ai_ask.LLMDefault = (function() {

        /**
         * Properties of a LLMDefault.
         * @memberof ai_ask
         * @interface ILLMDefault
         * @property {string|null} [id] LLMDefault id
         * @property {string|null} [category] LLMDefault category
         * @property {string|null} [name] LLMDefault name
         * @property {string|null} [description] LLMDefault description
         * @property {string|null} [valueJson] LLMDefault valueJson
         * @property {boolean|null} [isDefault] LLMDefault isDefault
         * @property {string|null} [createdAt] LLMDefault createdAt
         * @property {string|null} [updatedAt] LLMDefault updatedAt
         */

        /**
         * Constructs a new LLMDefault.
         * @memberof ai_ask
         * @classdesc Represents a LLMDefault.
         * @implements ILLMDefault
         * @constructor
         * @param {ai_ask.ILLMDefault=} [properties] Properties to set
         */
        function LLMDefault(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * LLMDefault id.
         * @member {string} id
         * @memberof ai_ask.LLMDefault
         * @instance
         */
        LLMDefault.prototype.id = "";

        /**
         * LLMDefault category.
         * @member {string} category
         * @memberof ai_ask.LLMDefault
         * @instance
         */
        LLMDefault.prototype.category = "";

        /**
         * LLMDefault name.
         * @member {string} name
         * @memberof ai_ask.LLMDefault
         * @instance
         */
        LLMDefault.prototype.name = "";

        /**
         * LLMDefault description.
         * @member {string} description
         * @memberof ai_ask.LLMDefault
         * @instance
         */
        LLMDefault.prototype.description = "";

        /**
         * LLMDefault valueJson.
         * @member {string} valueJson
         * @memberof ai_ask.LLMDefault
         * @instance
         */
        LLMDefault.prototype.valueJson = "";

        /**
         * LLMDefault isDefault.
         * @member {boolean} isDefault
         * @memberof ai_ask.LLMDefault
         * @instance
         */
        LLMDefault.prototype.isDefault = false;

        /**
         * LLMDefault createdAt.
         * @member {string} createdAt
         * @memberof ai_ask.LLMDefault
         * @instance
         */
        LLMDefault.prototype.createdAt = "";

        /**
         * LLMDefault updatedAt.
         * @member {string} updatedAt
         * @memberof ai_ask.LLMDefault
         * @instance
         */
        LLMDefault.prototype.updatedAt = "";

        /**
         * Creates a new LLMDefault instance using the specified properties.
         * @function create
         * @memberof ai_ask.LLMDefault
         * @static
         * @param {ai_ask.ILLMDefault=} [properties] Properties to set
         * @returns {ai_ask.LLMDefault} LLMDefault instance
         */
        LLMDefault.create = function create(properties) {
            return new LLMDefault(properties);
        };

        /**
         * Encodes the specified LLMDefault message. Does not implicitly {@link ai_ask.LLMDefault.verify|verify} messages.
         * @function encode
         * @memberof ai_ask.LLMDefault
         * @static
         * @param {ai_ask.ILLMDefault} message LLMDefault message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        LLMDefault.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.category != null && Object.hasOwnProperty.call(message, "category"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.category);
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.name);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.description);
            if (message.valueJson != null && Object.hasOwnProperty.call(message, "valueJson"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.valueJson);
            if (message.isDefault != null && Object.hasOwnProperty.call(message, "isDefault"))
                writer.uint32(/* id 6, wireType 0 =*/48).bool(message.isDefault);
            if (message.createdAt != null && Object.hasOwnProperty.call(message, "createdAt"))
                writer.uint32(/* id 7, wireType 2 =*/58).string(message.createdAt);
            if (message.updatedAt != null && Object.hasOwnProperty.call(message, "updatedAt"))
                writer.uint32(/* id 8, wireType 2 =*/66).string(message.updatedAt);
            return writer;
        };

        /**
         * Encodes the specified LLMDefault message, length delimited. Does not implicitly {@link ai_ask.LLMDefault.verify|verify} messages.
         * @function encodeDelimited
         * @memberof ai_ask.LLMDefault
         * @static
         * @param {ai_ask.ILLMDefault} message LLMDefault message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        LLMDefault.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a LLMDefault message from the specified reader or buffer.
         * @function decode
         * @memberof ai_ask.LLMDefault
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {ai_ask.LLMDefault} LLMDefault
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        LLMDefault.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.ai_ask.LLMDefault();
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
                        message.category = reader.string();
                        break;
                    }
                case 3: {
                        message.name = reader.string();
                        break;
                    }
                case 4: {
                        message.description = reader.string();
                        break;
                    }
                case 5: {
                        message.valueJson = reader.string();
                        break;
                    }
                case 6: {
                        message.isDefault = reader.bool();
                        break;
                    }
                case 7: {
                        message.createdAt = reader.string();
                        break;
                    }
                case 8: {
                        message.updatedAt = reader.string();
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
         * Decodes a LLMDefault message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof ai_ask.LLMDefault
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {ai_ask.LLMDefault} LLMDefault
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        LLMDefault.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a LLMDefault message.
         * @function verify
         * @memberof ai_ask.LLMDefault
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        LLMDefault.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.category != null && message.hasOwnProperty("category"))
                if (!$util.isString(message.category))
                    return "category: string expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.description != null && message.hasOwnProperty("description"))
                if (!$util.isString(message.description))
                    return "description: string expected";
            if (message.valueJson != null && message.hasOwnProperty("valueJson"))
                if (!$util.isString(message.valueJson))
                    return "valueJson: string expected";
            if (message.isDefault != null && message.hasOwnProperty("isDefault"))
                if (typeof message.isDefault !== "boolean")
                    return "isDefault: boolean expected";
            if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                if (!$util.isString(message.createdAt))
                    return "createdAt: string expected";
            if (message.updatedAt != null && message.hasOwnProperty("updatedAt"))
                if (!$util.isString(message.updatedAt))
                    return "updatedAt: string expected";
            return null;
        };

        /**
         * Creates a LLMDefault message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof ai_ask.LLMDefault
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {ai_ask.LLMDefault} LLMDefault
         */
        LLMDefault.fromObject = function fromObject(object) {
            if (object instanceof $root.ai_ask.LLMDefault)
                return object;
            let message = new $root.ai_ask.LLMDefault();
            if (object.id != null)
                message.id = String(object.id);
            if (object.category != null)
                message.category = String(object.category);
            if (object.name != null)
                message.name = String(object.name);
            if (object.description != null)
                message.description = String(object.description);
            if (object.valueJson != null)
                message.valueJson = String(object.valueJson);
            if (object.isDefault != null)
                message.isDefault = Boolean(object.isDefault);
            if (object.createdAt != null)
                message.createdAt = String(object.createdAt);
            if (object.updatedAt != null)
                message.updatedAt = String(object.updatedAt);
            return message;
        };

        /**
         * Creates a plain object from a LLMDefault message. Also converts values to other types if specified.
         * @function toObject
         * @memberof ai_ask.LLMDefault
         * @static
         * @param {ai_ask.LLMDefault} message LLMDefault
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        LLMDefault.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.id = "";
                object.category = "";
                object.name = "";
                object.description = "";
                object.valueJson = "";
                object.isDefault = false;
                object.createdAt = "";
                object.updatedAt = "";
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.category != null && message.hasOwnProperty("category"))
                object.category = message.category;
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.description != null && message.hasOwnProperty("description"))
                object.description = message.description;
            if (message.valueJson != null && message.hasOwnProperty("valueJson"))
                object.valueJson = message.valueJson;
            if (message.isDefault != null && message.hasOwnProperty("isDefault"))
                object.isDefault = message.isDefault;
            if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                object.createdAt = message.createdAt;
            if (message.updatedAt != null && message.hasOwnProperty("updatedAt"))
                object.updatedAt = message.updatedAt;
            return object;
        };

        /**
         * Converts this LLMDefault to JSON.
         * @function toJSON
         * @memberof ai_ask.LLMDefault
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        LLMDefault.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for LLMDefault
         * @function getTypeUrl
         * @memberof ai_ask.LLMDefault
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        LLMDefault.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/ai_ask.LLMDefault";
        };

        return LLMDefault;
    })();

    ai_ask.LLMDefaultList = (function() {

        /**
         * Properties of a LLMDefaultList.
         * @memberof ai_ask
         * @interface ILLMDefaultList
         * @property {Array.<ai_ask.ILLMDefault>|null} [defaults] LLMDefaultList defaults
         */

        /**
         * Constructs a new LLMDefaultList.
         * @memberof ai_ask
         * @classdesc Represents a LLMDefaultList.
         * @implements ILLMDefaultList
         * @constructor
         * @param {ai_ask.ILLMDefaultList=} [properties] Properties to set
         */
        function LLMDefaultList(properties) {
            this.defaults = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * LLMDefaultList defaults.
         * @member {Array.<ai_ask.ILLMDefault>} defaults
         * @memberof ai_ask.LLMDefaultList
         * @instance
         */
        LLMDefaultList.prototype.defaults = $util.emptyArray;

        /**
         * Creates a new LLMDefaultList instance using the specified properties.
         * @function create
         * @memberof ai_ask.LLMDefaultList
         * @static
         * @param {ai_ask.ILLMDefaultList=} [properties] Properties to set
         * @returns {ai_ask.LLMDefaultList} LLMDefaultList instance
         */
        LLMDefaultList.create = function create(properties) {
            return new LLMDefaultList(properties);
        };

        /**
         * Encodes the specified LLMDefaultList message. Does not implicitly {@link ai_ask.LLMDefaultList.verify|verify} messages.
         * @function encode
         * @memberof ai_ask.LLMDefaultList
         * @static
         * @param {ai_ask.ILLMDefaultList} message LLMDefaultList message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        LLMDefaultList.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.defaults != null && message.defaults.length)
                for (let i = 0; i < message.defaults.length; ++i)
                    $root.ai_ask.LLMDefault.encode(message.defaults[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified LLMDefaultList message, length delimited. Does not implicitly {@link ai_ask.LLMDefaultList.verify|verify} messages.
         * @function encodeDelimited
         * @memberof ai_ask.LLMDefaultList
         * @static
         * @param {ai_ask.ILLMDefaultList} message LLMDefaultList message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        LLMDefaultList.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a LLMDefaultList message from the specified reader or buffer.
         * @function decode
         * @memberof ai_ask.LLMDefaultList
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {ai_ask.LLMDefaultList} LLMDefaultList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        LLMDefaultList.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.ai_ask.LLMDefaultList();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.defaults && message.defaults.length))
                            message.defaults = [];
                        message.defaults.push($root.ai_ask.LLMDefault.decode(reader, reader.uint32()));
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
         * Decodes a LLMDefaultList message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof ai_ask.LLMDefaultList
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {ai_ask.LLMDefaultList} LLMDefaultList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        LLMDefaultList.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a LLMDefaultList message.
         * @function verify
         * @memberof ai_ask.LLMDefaultList
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        LLMDefaultList.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.defaults != null && message.hasOwnProperty("defaults")) {
                if (!Array.isArray(message.defaults))
                    return "defaults: array expected";
                for (let i = 0; i < message.defaults.length; ++i) {
                    let error = $root.ai_ask.LLMDefault.verify(message.defaults[i]);
                    if (error)
                        return "defaults." + error;
                }
            }
            return null;
        };

        /**
         * Creates a LLMDefaultList message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof ai_ask.LLMDefaultList
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {ai_ask.LLMDefaultList} LLMDefaultList
         */
        LLMDefaultList.fromObject = function fromObject(object) {
            if (object instanceof $root.ai_ask.LLMDefaultList)
                return object;
            let message = new $root.ai_ask.LLMDefaultList();
            if (object.defaults) {
                if (!Array.isArray(object.defaults))
                    throw TypeError(".ai_ask.LLMDefaultList.defaults: array expected");
                message.defaults = [];
                for (let i = 0; i < object.defaults.length; ++i) {
                    if (typeof object.defaults[i] !== "object")
                        throw TypeError(".ai_ask.LLMDefaultList.defaults: object expected");
                    message.defaults[i] = $root.ai_ask.LLMDefault.fromObject(object.defaults[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a LLMDefaultList message. Also converts values to other types if specified.
         * @function toObject
         * @memberof ai_ask.LLMDefaultList
         * @static
         * @param {ai_ask.LLMDefaultList} message LLMDefaultList
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        LLMDefaultList.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.defaults = [];
            if (message.defaults && message.defaults.length) {
                object.defaults = [];
                for (let j = 0; j < message.defaults.length; ++j)
                    object.defaults[j] = $root.ai_ask.LLMDefault.toObject(message.defaults[j], options);
            }
            return object;
        };

        /**
         * Converts this LLMDefaultList to JSON.
         * @function toJSON
         * @memberof ai_ask.LLMDefaultList
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        LLMDefaultList.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for LLMDefaultList
         * @function getTypeUrl
         * @memberof ai_ask.LLMDefaultList
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        LLMDefaultList.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/ai_ask.LLMDefaultList";
        };

        return LLMDefaultList;
    })();

    return ai_ask;
})();

export { $root as default };
