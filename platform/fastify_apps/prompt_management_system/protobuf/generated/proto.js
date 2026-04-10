/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const prompt_management_system = $root.prompt_management_system = (() => {

    /**
     * Namespace prompt_management_system.
     * @exports prompt_management_system
     * @namespace
     */
    const prompt_management_system = {};

    prompt_management_system.Project = (function() {

        /**
         * Properties of a Project.
         * @memberof prompt_management_system
         * @interface IProject
         * @property {string|null} [id] Project id
         * @property {string|null} [name] Project name
         * @property {string|null} [description] Project description
         * @property {string|null} [status] Project status
         * @property {string|null} [createdBy] Project createdBy
         * @property {string|null} [updatedBy] Project updatedBy
         * @property {string|null} [createdAt] Project createdAt
         * @property {string|null} [updatedAt] Project updatedAt
         * @property {string|null} [metadata] Project metadata
         * @property {Array.<prompt_management_system.IPrompt>|null} [prompts] Project prompts
         */

        /**
         * Constructs a new Project.
         * @memberof prompt_management_system
         * @classdesc Represents a Project.
         * @implements IProject
         * @constructor
         * @param {prompt_management_system.IProject=} [properties] Properties to set
         */
        function Project(properties) {
            this.prompts = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Project id.
         * @member {string} id
         * @memberof prompt_management_system.Project
         * @instance
         */
        Project.prototype.id = "";

        /**
         * Project name.
         * @member {string} name
         * @memberof prompt_management_system.Project
         * @instance
         */
        Project.prototype.name = "";

        /**
         * Project description.
         * @member {string} description
         * @memberof prompt_management_system.Project
         * @instance
         */
        Project.prototype.description = "";

        /**
         * Project status.
         * @member {string} status
         * @memberof prompt_management_system.Project
         * @instance
         */
        Project.prototype.status = "";

        /**
         * Project createdBy.
         * @member {string} createdBy
         * @memberof prompt_management_system.Project
         * @instance
         */
        Project.prototype.createdBy = "";

        /**
         * Project updatedBy.
         * @member {string} updatedBy
         * @memberof prompt_management_system.Project
         * @instance
         */
        Project.prototype.updatedBy = "";

        /**
         * Project createdAt.
         * @member {string} createdAt
         * @memberof prompt_management_system.Project
         * @instance
         */
        Project.prototype.createdAt = "";

        /**
         * Project updatedAt.
         * @member {string} updatedAt
         * @memberof prompt_management_system.Project
         * @instance
         */
        Project.prototype.updatedAt = "";

        /**
         * Project metadata.
         * @member {string} metadata
         * @memberof prompt_management_system.Project
         * @instance
         */
        Project.prototype.metadata = "";

        /**
         * Project prompts.
         * @member {Array.<prompt_management_system.IPrompt>} prompts
         * @memberof prompt_management_system.Project
         * @instance
         */
        Project.prototype.prompts = $util.emptyArray;

        /**
         * Creates a new Project instance using the specified properties.
         * @function create
         * @memberof prompt_management_system.Project
         * @static
         * @param {prompt_management_system.IProject=} [properties] Properties to set
         * @returns {prompt_management_system.Project} Project instance
         */
        Project.create = function create(properties) {
            return new Project(properties);
        };

        /**
         * Encodes the specified Project message. Does not implicitly {@link prompt_management_system.Project.verify|verify} messages.
         * @function encode
         * @memberof prompt_management_system.Project
         * @static
         * @param {prompt_management_system.IProject} message Project message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Project.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.description);
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.status);
            if (message.createdBy != null && Object.hasOwnProperty.call(message, "createdBy"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.createdBy);
            if (message.updatedBy != null && Object.hasOwnProperty.call(message, "updatedBy"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.updatedBy);
            if (message.createdAt != null && Object.hasOwnProperty.call(message, "createdAt"))
                writer.uint32(/* id 7, wireType 2 =*/58).string(message.createdAt);
            if (message.updatedAt != null && Object.hasOwnProperty.call(message, "updatedAt"))
                writer.uint32(/* id 8, wireType 2 =*/66).string(message.updatedAt);
            if (message.metadata != null && Object.hasOwnProperty.call(message, "metadata"))
                writer.uint32(/* id 9, wireType 2 =*/74).string(message.metadata);
            if (message.prompts != null && message.prompts.length)
                for (let i = 0; i < message.prompts.length; ++i)
                    $root.prompt_management_system.Prompt.encode(message.prompts[i], writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified Project message, length delimited. Does not implicitly {@link prompt_management_system.Project.verify|verify} messages.
         * @function encodeDelimited
         * @memberof prompt_management_system.Project
         * @static
         * @param {prompt_management_system.IProject} message Project message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Project.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Project message from the specified reader or buffer.
         * @function decode
         * @memberof prompt_management_system.Project
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {prompt_management_system.Project} Project
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Project.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.prompt_management_system.Project();
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
                        message.status = reader.string();
                        break;
                    }
                case 5: {
                        message.createdBy = reader.string();
                        break;
                    }
                case 6: {
                        message.updatedBy = reader.string();
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
                case 9: {
                        message.metadata = reader.string();
                        break;
                    }
                case 10: {
                        if (!(message.prompts && message.prompts.length))
                            message.prompts = [];
                        message.prompts.push($root.prompt_management_system.Prompt.decode(reader, reader.uint32()));
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
         * Decodes a Project message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof prompt_management_system.Project
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {prompt_management_system.Project} Project
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Project.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Project message.
         * @function verify
         * @memberof prompt_management_system.Project
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Project.verify = function verify(message) {
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
            if (message.status != null && message.hasOwnProperty("status"))
                if (!$util.isString(message.status))
                    return "status: string expected";
            if (message.createdBy != null && message.hasOwnProperty("createdBy"))
                if (!$util.isString(message.createdBy))
                    return "createdBy: string expected";
            if (message.updatedBy != null && message.hasOwnProperty("updatedBy"))
                if (!$util.isString(message.updatedBy))
                    return "updatedBy: string expected";
            if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                if (!$util.isString(message.createdAt))
                    return "createdAt: string expected";
            if (message.updatedAt != null && message.hasOwnProperty("updatedAt"))
                if (!$util.isString(message.updatedAt))
                    return "updatedAt: string expected";
            if (message.metadata != null && message.hasOwnProperty("metadata"))
                if (!$util.isString(message.metadata))
                    return "metadata: string expected";
            if (message.prompts != null && message.hasOwnProperty("prompts")) {
                if (!Array.isArray(message.prompts))
                    return "prompts: array expected";
                for (let i = 0; i < message.prompts.length; ++i) {
                    let error = $root.prompt_management_system.Prompt.verify(message.prompts[i]);
                    if (error)
                        return "prompts." + error;
                }
            }
            return null;
        };

        /**
         * Creates a Project message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof prompt_management_system.Project
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {prompt_management_system.Project} Project
         */
        Project.fromObject = function fromObject(object) {
            if (object instanceof $root.prompt_management_system.Project)
                return object;
            let message = new $root.prompt_management_system.Project();
            if (object.id != null)
                message.id = String(object.id);
            if (object.name != null)
                message.name = String(object.name);
            if (object.description != null)
                message.description = String(object.description);
            if (object.status != null)
                message.status = String(object.status);
            if (object.createdBy != null)
                message.createdBy = String(object.createdBy);
            if (object.updatedBy != null)
                message.updatedBy = String(object.updatedBy);
            if (object.createdAt != null)
                message.createdAt = String(object.createdAt);
            if (object.updatedAt != null)
                message.updatedAt = String(object.updatedAt);
            if (object.metadata != null)
                message.metadata = String(object.metadata);
            if (object.prompts) {
                if (!Array.isArray(object.prompts))
                    throw TypeError(".prompt_management_system.Project.prompts: array expected");
                message.prompts = [];
                for (let i = 0; i < object.prompts.length; ++i) {
                    if (typeof object.prompts[i] !== "object")
                        throw TypeError(".prompt_management_system.Project.prompts: object expected");
                    message.prompts[i] = $root.prompt_management_system.Prompt.fromObject(object.prompts[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a Project message. Also converts values to other types if specified.
         * @function toObject
         * @memberof prompt_management_system.Project
         * @static
         * @param {prompt_management_system.Project} message Project
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Project.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.prompts = [];
            if (options.defaults) {
                object.id = "";
                object.name = "";
                object.description = "";
                object.status = "";
                object.createdBy = "";
                object.updatedBy = "";
                object.createdAt = "";
                object.updatedAt = "";
                object.metadata = "";
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.description != null && message.hasOwnProperty("description"))
                object.description = message.description;
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = message.status;
            if (message.createdBy != null && message.hasOwnProperty("createdBy"))
                object.createdBy = message.createdBy;
            if (message.updatedBy != null && message.hasOwnProperty("updatedBy"))
                object.updatedBy = message.updatedBy;
            if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                object.createdAt = message.createdAt;
            if (message.updatedAt != null && message.hasOwnProperty("updatedAt"))
                object.updatedAt = message.updatedAt;
            if (message.metadata != null && message.hasOwnProperty("metadata"))
                object.metadata = message.metadata;
            if (message.prompts && message.prompts.length) {
                object.prompts = [];
                for (let j = 0; j < message.prompts.length; ++j)
                    object.prompts[j] = $root.prompt_management_system.Prompt.toObject(message.prompts[j], options);
            }
            return object;
        };

        /**
         * Converts this Project to JSON.
         * @function toJSON
         * @memberof prompt_management_system.Project
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Project.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Project
         * @function getTypeUrl
         * @memberof prompt_management_system.Project
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Project.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/prompt_management_system.Project";
        };

        return Project;
    })();

    prompt_management_system.Prompt = (function() {

        /**
         * Properties of a Prompt.
         * @memberof prompt_management_system
         * @interface IPrompt
         * @property {string|null} [id] Prompt id
         * @property {string|null} [projectId] Prompt projectId
         * @property {string|null} [slug] Prompt slug
         * @property {string|null} [name] Prompt name
         * @property {string|null} [description] Prompt description
         * @property {string|null} [status] Prompt status
         * @property {string|null} [createdBy] Prompt createdBy
         * @property {string|null} [updatedBy] Prompt updatedBy
         * @property {string|null} [createdAt] Prompt createdAt
         * @property {string|null} [updatedAt] Prompt updatedAt
         * @property {string|null} [metadata] Prompt metadata
         * @property {Array.<prompt_management_system.IPromptVersion>|null} [versions] Prompt versions
         * @property {Array.<prompt_management_system.IDeployment>|null} [deployments] Prompt deployments
         */

        /**
         * Constructs a new Prompt.
         * @memberof prompt_management_system
         * @classdesc Represents a Prompt.
         * @implements IPrompt
         * @constructor
         * @param {prompt_management_system.IPrompt=} [properties] Properties to set
         */
        function Prompt(properties) {
            this.versions = [];
            this.deployments = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Prompt id.
         * @member {string} id
         * @memberof prompt_management_system.Prompt
         * @instance
         */
        Prompt.prototype.id = "";

        /**
         * Prompt projectId.
         * @member {string} projectId
         * @memberof prompt_management_system.Prompt
         * @instance
         */
        Prompt.prototype.projectId = "";

        /**
         * Prompt slug.
         * @member {string} slug
         * @memberof prompt_management_system.Prompt
         * @instance
         */
        Prompt.prototype.slug = "";

        /**
         * Prompt name.
         * @member {string} name
         * @memberof prompt_management_system.Prompt
         * @instance
         */
        Prompt.prototype.name = "";

        /**
         * Prompt description.
         * @member {string} description
         * @memberof prompt_management_system.Prompt
         * @instance
         */
        Prompt.prototype.description = "";

        /**
         * Prompt status.
         * @member {string} status
         * @memberof prompt_management_system.Prompt
         * @instance
         */
        Prompt.prototype.status = "";

        /**
         * Prompt createdBy.
         * @member {string} createdBy
         * @memberof prompt_management_system.Prompt
         * @instance
         */
        Prompt.prototype.createdBy = "";

        /**
         * Prompt updatedBy.
         * @member {string} updatedBy
         * @memberof prompt_management_system.Prompt
         * @instance
         */
        Prompt.prototype.updatedBy = "";

        /**
         * Prompt createdAt.
         * @member {string} createdAt
         * @memberof prompt_management_system.Prompt
         * @instance
         */
        Prompt.prototype.createdAt = "";

        /**
         * Prompt updatedAt.
         * @member {string} updatedAt
         * @memberof prompt_management_system.Prompt
         * @instance
         */
        Prompt.prototype.updatedAt = "";

        /**
         * Prompt metadata.
         * @member {string} metadata
         * @memberof prompt_management_system.Prompt
         * @instance
         */
        Prompt.prototype.metadata = "";

        /**
         * Prompt versions.
         * @member {Array.<prompt_management_system.IPromptVersion>} versions
         * @memberof prompt_management_system.Prompt
         * @instance
         */
        Prompt.prototype.versions = $util.emptyArray;

        /**
         * Prompt deployments.
         * @member {Array.<prompt_management_system.IDeployment>} deployments
         * @memberof prompt_management_system.Prompt
         * @instance
         */
        Prompt.prototype.deployments = $util.emptyArray;

        /**
         * Creates a new Prompt instance using the specified properties.
         * @function create
         * @memberof prompt_management_system.Prompt
         * @static
         * @param {prompt_management_system.IPrompt=} [properties] Properties to set
         * @returns {prompt_management_system.Prompt} Prompt instance
         */
        Prompt.create = function create(properties) {
            return new Prompt(properties);
        };

        /**
         * Encodes the specified Prompt message. Does not implicitly {@link prompt_management_system.Prompt.verify|verify} messages.
         * @function encode
         * @memberof prompt_management_system.Prompt
         * @static
         * @param {prompt_management_system.IPrompt} message Prompt message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Prompt.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.projectId != null && Object.hasOwnProperty.call(message, "projectId"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.projectId);
            if (message.slug != null && Object.hasOwnProperty.call(message, "slug"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.slug);
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.name);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.description);
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.status);
            if (message.createdBy != null && Object.hasOwnProperty.call(message, "createdBy"))
                writer.uint32(/* id 7, wireType 2 =*/58).string(message.createdBy);
            if (message.updatedBy != null && Object.hasOwnProperty.call(message, "updatedBy"))
                writer.uint32(/* id 8, wireType 2 =*/66).string(message.updatedBy);
            if (message.createdAt != null && Object.hasOwnProperty.call(message, "createdAt"))
                writer.uint32(/* id 9, wireType 2 =*/74).string(message.createdAt);
            if (message.updatedAt != null && Object.hasOwnProperty.call(message, "updatedAt"))
                writer.uint32(/* id 10, wireType 2 =*/82).string(message.updatedAt);
            if (message.metadata != null && Object.hasOwnProperty.call(message, "metadata"))
                writer.uint32(/* id 11, wireType 2 =*/90).string(message.metadata);
            if (message.versions != null && message.versions.length)
                for (let i = 0; i < message.versions.length; ++i)
                    $root.prompt_management_system.PromptVersion.encode(message.versions[i], writer.uint32(/* id 12, wireType 2 =*/98).fork()).ldelim();
            if (message.deployments != null && message.deployments.length)
                for (let i = 0; i < message.deployments.length; ++i)
                    $root.prompt_management_system.Deployment.encode(message.deployments[i], writer.uint32(/* id 13, wireType 2 =*/106).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified Prompt message, length delimited. Does not implicitly {@link prompt_management_system.Prompt.verify|verify} messages.
         * @function encodeDelimited
         * @memberof prompt_management_system.Prompt
         * @static
         * @param {prompt_management_system.IPrompt} message Prompt message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Prompt.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Prompt message from the specified reader or buffer.
         * @function decode
         * @memberof prompt_management_system.Prompt
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {prompt_management_system.Prompt} Prompt
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Prompt.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.prompt_management_system.Prompt();
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
                        message.projectId = reader.string();
                        break;
                    }
                case 3: {
                        message.slug = reader.string();
                        break;
                    }
                case 4: {
                        message.name = reader.string();
                        break;
                    }
                case 5: {
                        message.description = reader.string();
                        break;
                    }
                case 6: {
                        message.status = reader.string();
                        break;
                    }
                case 7: {
                        message.createdBy = reader.string();
                        break;
                    }
                case 8: {
                        message.updatedBy = reader.string();
                        break;
                    }
                case 9: {
                        message.createdAt = reader.string();
                        break;
                    }
                case 10: {
                        message.updatedAt = reader.string();
                        break;
                    }
                case 11: {
                        message.metadata = reader.string();
                        break;
                    }
                case 12: {
                        if (!(message.versions && message.versions.length))
                            message.versions = [];
                        message.versions.push($root.prompt_management_system.PromptVersion.decode(reader, reader.uint32()));
                        break;
                    }
                case 13: {
                        if (!(message.deployments && message.deployments.length))
                            message.deployments = [];
                        message.deployments.push($root.prompt_management_system.Deployment.decode(reader, reader.uint32()));
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
         * Decodes a Prompt message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof prompt_management_system.Prompt
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {prompt_management_system.Prompt} Prompt
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Prompt.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Prompt message.
         * @function verify
         * @memberof prompt_management_system.Prompt
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Prompt.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.projectId != null && message.hasOwnProperty("projectId"))
                if (!$util.isString(message.projectId))
                    return "projectId: string expected";
            if (message.slug != null && message.hasOwnProperty("slug"))
                if (!$util.isString(message.slug))
                    return "slug: string expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.description != null && message.hasOwnProperty("description"))
                if (!$util.isString(message.description))
                    return "description: string expected";
            if (message.status != null && message.hasOwnProperty("status"))
                if (!$util.isString(message.status))
                    return "status: string expected";
            if (message.createdBy != null && message.hasOwnProperty("createdBy"))
                if (!$util.isString(message.createdBy))
                    return "createdBy: string expected";
            if (message.updatedBy != null && message.hasOwnProperty("updatedBy"))
                if (!$util.isString(message.updatedBy))
                    return "updatedBy: string expected";
            if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                if (!$util.isString(message.createdAt))
                    return "createdAt: string expected";
            if (message.updatedAt != null && message.hasOwnProperty("updatedAt"))
                if (!$util.isString(message.updatedAt))
                    return "updatedAt: string expected";
            if (message.metadata != null && message.hasOwnProperty("metadata"))
                if (!$util.isString(message.metadata))
                    return "metadata: string expected";
            if (message.versions != null && message.hasOwnProperty("versions")) {
                if (!Array.isArray(message.versions))
                    return "versions: array expected";
                for (let i = 0; i < message.versions.length; ++i) {
                    let error = $root.prompt_management_system.PromptVersion.verify(message.versions[i]);
                    if (error)
                        return "versions." + error;
                }
            }
            if (message.deployments != null && message.hasOwnProperty("deployments")) {
                if (!Array.isArray(message.deployments))
                    return "deployments: array expected";
                for (let i = 0; i < message.deployments.length; ++i) {
                    let error = $root.prompt_management_system.Deployment.verify(message.deployments[i]);
                    if (error)
                        return "deployments." + error;
                }
            }
            return null;
        };

        /**
         * Creates a Prompt message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof prompt_management_system.Prompt
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {prompt_management_system.Prompt} Prompt
         */
        Prompt.fromObject = function fromObject(object) {
            if (object instanceof $root.prompt_management_system.Prompt)
                return object;
            let message = new $root.prompt_management_system.Prompt();
            if (object.id != null)
                message.id = String(object.id);
            if (object.projectId != null)
                message.projectId = String(object.projectId);
            if (object.slug != null)
                message.slug = String(object.slug);
            if (object.name != null)
                message.name = String(object.name);
            if (object.description != null)
                message.description = String(object.description);
            if (object.status != null)
                message.status = String(object.status);
            if (object.createdBy != null)
                message.createdBy = String(object.createdBy);
            if (object.updatedBy != null)
                message.updatedBy = String(object.updatedBy);
            if (object.createdAt != null)
                message.createdAt = String(object.createdAt);
            if (object.updatedAt != null)
                message.updatedAt = String(object.updatedAt);
            if (object.metadata != null)
                message.metadata = String(object.metadata);
            if (object.versions) {
                if (!Array.isArray(object.versions))
                    throw TypeError(".prompt_management_system.Prompt.versions: array expected");
                message.versions = [];
                for (let i = 0; i < object.versions.length; ++i) {
                    if (typeof object.versions[i] !== "object")
                        throw TypeError(".prompt_management_system.Prompt.versions: object expected");
                    message.versions[i] = $root.prompt_management_system.PromptVersion.fromObject(object.versions[i]);
                }
            }
            if (object.deployments) {
                if (!Array.isArray(object.deployments))
                    throw TypeError(".prompt_management_system.Prompt.deployments: array expected");
                message.deployments = [];
                for (let i = 0; i < object.deployments.length; ++i) {
                    if (typeof object.deployments[i] !== "object")
                        throw TypeError(".prompt_management_system.Prompt.deployments: object expected");
                    message.deployments[i] = $root.prompt_management_system.Deployment.fromObject(object.deployments[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a Prompt message. Also converts values to other types if specified.
         * @function toObject
         * @memberof prompt_management_system.Prompt
         * @static
         * @param {prompt_management_system.Prompt} message Prompt
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Prompt.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults) {
                object.versions = [];
                object.deployments = [];
            }
            if (options.defaults) {
                object.id = "";
                object.projectId = "";
                object.slug = "";
                object.name = "";
                object.description = "";
                object.status = "";
                object.createdBy = "";
                object.updatedBy = "";
                object.createdAt = "";
                object.updatedAt = "";
                object.metadata = "";
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.projectId != null && message.hasOwnProperty("projectId"))
                object.projectId = message.projectId;
            if (message.slug != null && message.hasOwnProperty("slug"))
                object.slug = message.slug;
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.description != null && message.hasOwnProperty("description"))
                object.description = message.description;
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = message.status;
            if (message.createdBy != null && message.hasOwnProperty("createdBy"))
                object.createdBy = message.createdBy;
            if (message.updatedBy != null && message.hasOwnProperty("updatedBy"))
                object.updatedBy = message.updatedBy;
            if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                object.createdAt = message.createdAt;
            if (message.updatedAt != null && message.hasOwnProperty("updatedAt"))
                object.updatedAt = message.updatedAt;
            if (message.metadata != null && message.hasOwnProperty("metadata"))
                object.metadata = message.metadata;
            if (message.versions && message.versions.length) {
                object.versions = [];
                for (let j = 0; j < message.versions.length; ++j)
                    object.versions[j] = $root.prompt_management_system.PromptVersion.toObject(message.versions[j], options);
            }
            if (message.deployments && message.deployments.length) {
                object.deployments = [];
                for (let j = 0; j < message.deployments.length; ++j)
                    object.deployments[j] = $root.prompt_management_system.Deployment.toObject(message.deployments[j], options);
            }
            return object;
        };

        /**
         * Converts this Prompt to JSON.
         * @function toJSON
         * @memberof prompt_management_system.Prompt
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Prompt.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Prompt
         * @function getTypeUrl
         * @memberof prompt_management_system.Prompt
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Prompt.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/prompt_management_system.Prompt";
        };

        return Prompt;
    })();

    prompt_management_system.PromptVersion = (function() {

        /**
         * Properties of a PromptVersion.
         * @memberof prompt_management_system
         * @interface IPromptVersion
         * @property {string|null} [id] PromptVersion id
         * @property {string|null} [promptId] PromptVersion promptId
         * @property {number|null} [versionNumber] PromptVersion versionNumber
         * @property {string|null} [template] PromptVersion template
         * @property {string|null} [config] PromptVersion config
         * @property {string|null} [inputSchema] PromptVersion inputSchema
         * @property {string|null} [commitMessage] PromptVersion commitMessage
         * @property {string|null} [status] PromptVersion status
         * @property {string|null} [createdBy] PromptVersion createdBy
         * @property {string|null} [createdAt] PromptVersion createdAt
         * @property {string|null} [metadata] PromptVersion metadata
         * @property {Array.<prompt_management_system.IVariable>|null} [variables] PromptVersion variables
         */

        /**
         * Constructs a new PromptVersion.
         * @memberof prompt_management_system
         * @classdesc Represents a PromptVersion.
         * @implements IPromptVersion
         * @constructor
         * @param {prompt_management_system.IPromptVersion=} [properties] Properties to set
         */
        function PromptVersion(properties) {
            this.variables = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PromptVersion id.
         * @member {string} id
         * @memberof prompt_management_system.PromptVersion
         * @instance
         */
        PromptVersion.prototype.id = "";

        /**
         * PromptVersion promptId.
         * @member {string} promptId
         * @memberof prompt_management_system.PromptVersion
         * @instance
         */
        PromptVersion.prototype.promptId = "";

        /**
         * PromptVersion versionNumber.
         * @member {number} versionNumber
         * @memberof prompt_management_system.PromptVersion
         * @instance
         */
        PromptVersion.prototype.versionNumber = 0;

        /**
         * PromptVersion template.
         * @member {string} template
         * @memberof prompt_management_system.PromptVersion
         * @instance
         */
        PromptVersion.prototype.template = "";

        /**
         * PromptVersion config.
         * @member {string} config
         * @memberof prompt_management_system.PromptVersion
         * @instance
         */
        PromptVersion.prototype.config = "";

        /**
         * PromptVersion inputSchema.
         * @member {string} inputSchema
         * @memberof prompt_management_system.PromptVersion
         * @instance
         */
        PromptVersion.prototype.inputSchema = "";

        /**
         * PromptVersion commitMessage.
         * @member {string} commitMessage
         * @memberof prompt_management_system.PromptVersion
         * @instance
         */
        PromptVersion.prototype.commitMessage = "";

        /**
         * PromptVersion status.
         * @member {string} status
         * @memberof prompt_management_system.PromptVersion
         * @instance
         */
        PromptVersion.prototype.status = "";

        /**
         * PromptVersion createdBy.
         * @member {string} createdBy
         * @memberof prompt_management_system.PromptVersion
         * @instance
         */
        PromptVersion.prototype.createdBy = "";

        /**
         * PromptVersion createdAt.
         * @member {string} createdAt
         * @memberof prompt_management_system.PromptVersion
         * @instance
         */
        PromptVersion.prototype.createdAt = "";

        /**
         * PromptVersion metadata.
         * @member {string} metadata
         * @memberof prompt_management_system.PromptVersion
         * @instance
         */
        PromptVersion.prototype.metadata = "";

        /**
         * PromptVersion variables.
         * @member {Array.<prompt_management_system.IVariable>} variables
         * @memberof prompt_management_system.PromptVersion
         * @instance
         */
        PromptVersion.prototype.variables = $util.emptyArray;

        /**
         * Creates a new PromptVersion instance using the specified properties.
         * @function create
         * @memberof prompt_management_system.PromptVersion
         * @static
         * @param {prompt_management_system.IPromptVersion=} [properties] Properties to set
         * @returns {prompt_management_system.PromptVersion} PromptVersion instance
         */
        PromptVersion.create = function create(properties) {
            return new PromptVersion(properties);
        };

        /**
         * Encodes the specified PromptVersion message. Does not implicitly {@link prompt_management_system.PromptVersion.verify|verify} messages.
         * @function encode
         * @memberof prompt_management_system.PromptVersion
         * @static
         * @param {prompt_management_system.IPromptVersion} message PromptVersion message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PromptVersion.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.promptId != null && Object.hasOwnProperty.call(message, "promptId"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.promptId);
            if (message.versionNumber != null && Object.hasOwnProperty.call(message, "versionNumber"))
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.versionNumber);
            if (message.template != null && Object.hasOwnProperty.call(message, "template"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.template);
            if (message.config != null && Object.hasOwnProperty.call(message, "config"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.config);
            if (message.inputSchema != null && Object.hasOwnProperty.call(message, "inputSchema"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.inputSchema);
            if (message.commitMessage != null && Object.hasOwnProperty.call(message, "commitMessage"))
                writer.uint32(/* id 7, wireType 2 =*/58).string(message.commitMessage);
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 8, wireType 2 =*/66).string(message.status);
            if (message.createdBy != null && Object.hasOwnProperty.call(message, "createdBy"))
                writer.uint32(/* id 9, wireType 2 =*/74).string(message.createdBy);
            if (message.createdAt != null && Object.hasOwnProperty.call(message, "createdAt"))
                writer.uint32(/* id 10, wireType 2 =*/82).string(message.createdAt);
            if (message.metadata != null && Object.hasOwnProperty.call(message, "metadata"))
                writer.uint32(/* id 11, wireType 2 =*/90).string(message.metadata);
            if (message.variables != null && message.variables.length)
                for (let i = 0; i < message.variables.length; ++i)
                    $root.prompt_management_system.Variable.encode(message.variables[i], writer.uint32(/* id 12, wireType 2 =*/98).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified PromptVersion message, length delimited. Does not implicitly {@link prompt_management_system.PromptVersion.verify|verify} messages.
         * @function encodeDelimited
         * @memberof prompt_management_system.PromptVersion
         * @static
         * @param {prompt_management_system.IPromptVersion} message PromptVersion message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PromptVersion.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PromptVersion message from the specified reader or buffer.
         * @function decode
         * @memberof prompt_management_system.PromptVersion
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {prompt_management_system.PromptVersion} PromptVersion
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PromptVersion.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.prompt_management_system.PromptVersion();
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
                        message.promptId = reader.string();
                        break;
                    }
                case 3: {
                        message.versionNumber = reader.int32();
                        break;
                    }
                case 4: {
                        message.template = reader.string();
                        break;
                    }
                case 5: {
                        message.config = reader.string();
                        break;
                    }
                case 6: {
                        message.inputSchema = reader.string();
                        break;
                    }
                case 7: {
                        message.commitMessage = reader.string();
                        break;
                    }
                case 8: {
                        message.status = reader.string();
                        break;
                    }
                case 9: {
                        message.createdBy = reader.string();
                        break;
                    }
                case 10: {
                        message.createdAt = reader.string();
                        break;
                    }
                case 11: {
                        message.metadata = reader.string();
                        break;
                    }
                case 12: {
                        if (!(message.variables && message.variables.length))
                            message.variables = [];
                        message.variables.push($root.prompt_management_system.Variable.decode(reader, reader.uint32()));
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
         * Decodes a PromptVersion message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof prompt_management_system.PromptVersion
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {prompt_management_system.PromptVersion} PromptVersion
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PromptVersion.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PromptVersion message.
         * @function verify
         * @memberof prompt_management_system.PromptVersion
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PromptVersion.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.promptId != null && message.hasOwnProperty("promptId"))
                if (!$util.isString(message.promptId))
                    return "promptId: string expected";
            if (message.versionNumber != null && message.hasOwnProperty("versionNumber"))
                if (!$util.isInteger(message.versionNumber))
                    return "versionNumber: integer expected";
            if (message.template != null && message.hasOwnProperty("template"))
                if (!$util.isString(message.template))
                    return "template: string expected";
            if (message.config != null && message.hasOwnProperty("config"))
                if (!$util.isString(message.config))
                    return "config: string expected";
            if (message.inputSchema != null && message.hasOwnProperty("inputSchema"))
                if (!$util.isString(message.inputSchema))
                    return "inputSchema: string expected";
            if (message.commitMessage != null && message.hasOwnProperty("commitMessage"))
                if (!$util.isString(message.commitMessage))
                    return "commitMessage: string expected";
            if (message.status != null && message.hasOwnProperty("status"))
                if (!$util.isString(message.status))
                    return "status: string expected";
            if (message.createdBy != null && message.hasOwnProperty("createdBy"))
                if (!$util.isString(message.createdBy))
                    return "createdBy: string expected";
            if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                if (!$util.isString(message.createdAt))
                    return "createdAt: string expected";
            if (message.metadata != null && message.hasOwnProperty("metadata"))
                if (!$util.isString(message.metadata))
                    return "metadata: string expected";
            if (message.variables != null && message.hasOwnProperty("variables")) {
                if (!Array.isArray(message.variables))
                    return "variables: array expected";
                for (let i = 0; i < message.variables.length; ++i) {
                    let error = $root.prompt_management_system.Variable.verify(message.variables[i]);
                    if (error)
                        return "variables." + error;
                }
            }
            return null;
        };

        /**
         * Creates a PromptVersion message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof prompt_management_system.PromptVersion
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {prompt_management_system.PromptVersion} PromptVersion
         */
        PromptVersion.fromObject = function fromObject(object) {
            if (object instanceof $root.prompt_management_system.PromptVersion)
                return object;
            let message = new $root.prompt_management_system.PromptVersion();
            if (object.id != null)
                message.id = String(object.id);
            if (object.promptId != null)
                message.promptId = String(object.promptId);
            if (object.versionNumber != null)
                message.versionNumber = object.versionNumber | 0;
            if (object.template != null)
                message.template = String(object.template);
            if (object.config != null)
                message.config = String(object.config);
            if (object.inputSchema != null)
                message.inputSchema = String(object.inputSchema);
            if (object.commitMessage != null)
                message.commitMessage = String(object.commitMessage);
            if (object.status != null)
                message.status = String(object.status);
            if (object.createdBy != null)
                message.createdBy = String(object.createdBy);
            if (object.createdAt != null)
                message.createdAt = String(object.createdAt);
            if (object.metadata != null)
                message.metadata = String(object.metadata);
            if (object.variables) {
                if (!Array.isArray(object.variables))
                    throw TypeError(".prompt_management_system.PromptVersion.variables: array expected");
                message.variables = [];
                for (let i = 0; i < object.variables.length; ++i) {
                    if (typeof object.variables[i] !== "object")
                        throw TypeError(".prompt_management_system.PromptVersion.variables: object expected");
                    message.variables[i] = $root.prompt_management_system.Variable.fromObject(object.variables[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a PromptVersion message. Also converts values to other types if specified.
         * @function toObject
         * @memberof prompt_management_system.PromptVersion
         * @static
         * @param {prompt_management_system.PromptVersion} message PromptVersion
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PromptVersion.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.variables = [];
            if (options.defaults) {
                object.id = "";
                object.promptId = "";
                object.versionNumber = 0;
                object.template = "";
                object.config = "";
                object.inputSchema = "";
                object.commitMessage = "";
                object.status = "";
                object.createdBy = "";
                object.createdAt = "";
                object.metadata = "";
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.promptId != null && message.hasOwnProperty("promptId"))
                object.promptId = message.promptId;
            if (message.versionNumber != null && message.hasOwnProperty("versionNumber"))
                object.versionNumber = message.versionNumber;
            if (message.template != null && message.hasOwnProperty("template"))
                object.template = message.template;
            if (message.config != null && message.hasOwnProperty("config"))
                object.config = message.config;
            if (message.inputSchema != null && message.hasOwnProperty("inputSchema"))
                object.inputSchema = message.inputSchema;
            if (message.commitMessage != null && message.hasOwnProperty("commitMessage"))
                object.commitMessage = message.commitMessage;
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = message.status;
            if (message.createdBy != null && message.hasOwnProperty("createdBy"))
                object.createdBy = message.createdBy;
            if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                object.createdAt = message.createdAt;
            if (message.metadata != null && message.hasOwnProperty("metadata"))
                object.metadata = message.metadata;
            if (message.variables && message.variables.length) {
                object.variables = [];
                for (let j = 0; j < message.variables.length; ++j)
                    object.variables[j] = $root.prompt_management_system.Variable.toObject(message.variables[j], options);
            }
            return object;
        };

        /**
         * Converts this PromptVersion to JSON.
         * @function toJSON
         * @memberof prompt_management_system.PromptVersion
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PromptVersion.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PromptVersion
         * @function getTypeUrl
         * @memberof prompt_management_system.PromptVersion
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PromptVersion.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/prompt_management_system.PromptVersion";
        };

        return PromptVersion;
    })();

    prompt_management_system.Deployment = (function() {

        /**
         * Properties of a Deployment.
         * @memberof prompt_management_system
         * @interface IDeployment
         * @property {string|null} [id] Deployment id
         * @property {string|null} [promptId] Deployment promptId
         * @property {string|null} [environment] Deployment environment
         * @property {string|null} [versionId] Deployment versionId
         * @property {string|null} [deployedBy] Deployment deployedBy
         * @property {string|null} [createdAt] Deployment createdAt
         * @property {string|null} [updatedAt] Deployment updatedAt
         * @property {string|null} [metadata] Deployment metadata
         * @property {prompt_management_system.IPromptVersion|null} [version] Deployment version
         */

        /**
         * Constructs a new Deployment.
         * @memberof prompt_management_system
         * @classdesc Represents a Deployment.
         * @implements IDeployment
         * @constructor
         * @param {prompt_management_system.IDeployment=} [properties] Properties to set
         */
        function Deployment(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Deployment id.
         * @member {string} id
         * @memberof prompt_management_system.Deployment
         * @instance
         */
        Deployment.prototype.id = "";

        /**
         * Deployment promptId.
         * @member {string} promptId
         * @memberof prompt_management_system.Deployment
         * @instance
         */
        Deployment.prototype.promptId = "";

        /**
         * Deployment environment.
         * @member {string} environment
         * @memberof prompt_management_system.Deployment
         * @instance
         */
        Deployment.prototype.environment = "";

        /**
         * Deployment versionId.
         * @member {string} versionId
         * @memberof prompt_management_system.Deployment
         * @instance
         */
        Deployment.prototype.versionId = "";

        /**
         * Deployment deployedBy.
         * @member {string} deployedBy
         * @memberof prompt_management_system.Deployment
         * @instance
         */
        Deployment.prototype.deployedBy = "";

        /**
         * Deployment createdAt.
         * @member {string} createdAt
         * @memberof prompt_management_system.Deployment
         * @instance
         */
        Deployment.prototype.createdAt = "";

        /**
         * Deployment updatedAt.
         * @member {string} updatedAt
         * @memberof prompt_management_system.Deployment
         * @instance
         */
        Deployment.prototype.updatedAt = "";

        /**
         * Deployment metadata.
         * @member {string} metadata
         * @memberof prompt_management_system.Deployment
         * @instance
         */
        Deployment.prototype.metadata = "";

        /**
         * Deployment version.
         * @member {prompt_management_system.IPromptVersion|null|undefined} version
         * @memberof prompt_management_system.Deployment
         * @instance
         */
        Deployment.prototype.version = null;

        /**
         * Creates a new Deployment instance using the specified properties.
         * @function create
         * @memberof prompt_management_system.Deployment
         * @static
         * @param {prompt_management_system.IDeployment=} [properties] Properties to set
         * @returns {prompt_management_system.Deployment} Deployment instance
         */
        Deployment.create = function create(properties) {
            return new Deployment(properties);
        };

        /**
         * Encodes the specified Deployment message. Does not implicitly {@link prompt_management_system.Deployment.verify|verify} messages.
         * @function encode
         * @memberof prompt_management_system.Deployment
         * @static
         * @param {prompt_management_system.IDeployment} message Deployment message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Deployment.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.promptId != null && Object.hasOwnProperty.call(message, "promptId"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.promptId);
            if (message.environment != null && Object.hasOwnProperty.call(message, "environment"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.environment);
            if (message.versionId != null && Object.hasOwnProperty.call(message, "versionId"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.versionId);
            if (message.deployedBy != null && Object.hasOwnProperty.call(message, "deployedBy"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.deployedBy);
            if (message.createdAt != null && Object.hasOwnProperty.call(message, "createdAt"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.createdAt);
            if (message.updatedAt != null && Object.hasOwnProperty.call(message, "updatedAt"))
                writer.uint32(/* id 7, wireType 2 =*/58).string(message.updatedAt);
            if (message.metadata != null && Object.hasOwnProperty.call(message, "metadata"))
                writer.uint32(/* id 8, wireType 2 =*/66).string(message.metadata);
            if (message.version != null && Object.hasOwnProperty.call(message, "version"))
                $root.prompt_management_system.PromptVersion.encode(message.version, writer.uint32(/* id 9, wireType 2 =*/74).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified Deployment message, length delimited. Does not implicitly {@link prompt_management_system.Deployment.verify|verify} messages.
         * @function encodeDelimited
         * @memberof prompt_management_system.Deployment
         * @static
         * @param {prompt_management_system.IDeployment} message Deployment message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Deployment.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Deployment message from the specified reader or buffer.
         * @function decode
         * @memberof prompt_management_system.Deployment
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {prompt_management_system.Deployment} Deployment
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Deployment.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.prompt_management_system.Deployment();
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
                        message.promptId = reader.string();
                        break;
                    }
                case 3: {
                        message.environment = reader.string();
                        break;
                    }
                case 4: {
                        message.versionId = reader.string();
                        break;
                    }
                case 5: {
                        message.deployedBy = reader.string();
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
                        message.metadata = reader.string();
                        break;
                    }
                case 9: {
                        message.version = $root.prompt_management_system.PromptVersion.decode(reader, reader.uint32());
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
         * Decodes a Deployment message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof prompt_management_system.Deployment
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {prompt_management_system.Deployment} Deployment
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Deployment.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Deployment message.
         * @function verify
         * @memberof prompt_management_system.Deployment
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Deployment.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.promptId != null && message.hasOwnProperty("promptId"))
                if (!$util.isString(message.promptId))
                    return "promptId: string expected";
            if (message.environment != null && message.hasOwnProperty("environment"))
                if (!$util.isString(message.environment))
                    return "environment: string expected";
            if (message.versionId != null && message.hasOwnProperty("versionId"))
                if (!$util.isString(message.versionId))
                    return "versionId: string expected";
            if (message.deployedBy != null && message.hasOwnProperty("deployedBy"))
                if (!$util.isString(message.deployedBy))
                    return "deployedBy: string expected";
            if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                if (!$util.isString(message.createdAt))
                    return "createdAt: string expected";
            if (message.updatedAt != null && message.hasOwnProperty("updatedAt"))
                if (!$util.isString(message.updatedAt))
                    return "updatedAt: string expected";
            if (message.metadata != null && message.hasOwnProperty("metadata"))
                if (!$util.isString(message.metadata))
                    return "metadata: string expected";
            if (message.version != null && message.hasOwnProperty("version")) {
                let error = $root.prompt_management_system.PromptVersion.verify(message.version);
                if (error)
                    return "version." + error;
            }
            return null;
        };

        /**
         * Creates a Deployment message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof prompt_management_system.Deployment
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {prompt_management_system.Deployment} Deployment
         */
        Deployment.fromObject = function fromObject(object) {
            if (object instanceof $root.prompt_management_system.Deployment)
                return object;
            let message = new $root.prompt_management_system.Deployment();
            if (object.id != null)
                message.id = String(object.id);
            if (object.promptId != null)
                message.promptId = String(object.promptId);
            if (object.environment != null)
                message.environment = String(object.environment);
            if (object.versionId != null)
                message.versionId = String(object.versionId);
            if (object.deployedBy != null)
                message.deployedBy = String(object.deployedBy);
            if (object.createdAt != null)
                message.createdAt = String(object.createdAt);
            if (object.updatedAt != null)
                message.updatedAt = String(object.updatedAt);
            if (object.metadata != null)
                message.metadata = String(object.metadata);
            if (object.version != null) {
                if (typeof object.version !== "object")
                    throw TypeError(".prompt_management_system.Deployment.version: object expected");
                message.version = $root.prompt_management_system.PromptVersion.fromObject(object.version);
            }
            return message;
        };

        /**
         * Creates a plain object from a Deployment message. Also converts values to other types if specified.
         * @function toObject
         * @memberof prompt_management_system.Deployment
         * @static
         * @param {prompt_management_system.Deployment} message Deployment
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Deployment.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.id = "";
                object.promptId = "";
                object.environment = "";
                object.versionId = "";
                object.deployedBy = "";
                object.createdAt = "";
                object.updatedAt = "";
                object.metadata = "";
                object.version = null;
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.promptId != null && message.hasOwnProperty("promptId"))
                object.promptId = message.promptId;
            if (message.environment != null && message.hasOwnProperty("environment"))
                object.environment = message.environment;
            if (message.versionId != null && message.hasOwnProperty("versionId"))
                object.versionId = message.versionId;
            if (message.deployedBy != null && message.hasOwnProperty("deployedBy"))
                object.deployedBy = message.deployedBy;
            if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                object.createdAt = message.createdAt;
            if (message.updatedAt != null && message.hasOwnProperty("updatedAt"))
                object.updatedAt = message.updatedAt;
            if (message.metadata != null && message.hasOwnProperty("metadata"))
                object.metadata = message.metadata;
            if (message.version != null && message.hasOwnProperty("version"))
                object.version = $root.prompt_management_system.PromptVersion.toObject(message.version, options);
            return object;
        };

        /**
         * Converts this Deployment to JSON.
         * @function toJSON
         * @memberof prompt_management_system.Deployment
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Deployment.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Deployment
         * @function getTypeUrl
         * @memberof prompt_management_system.Deployment
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Deployment.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/prompt_management_system.Deployment";
        };

        return Deployment;
    })();

    prompt_management_system.Variable = (function() {

        /**
         * Properties of a Variable.
         * @memberof prompt_management_system
         * @interface IVariable
         * @property {string|null} [id] Variable id
         * @property {string|null} [versionId] Variable versionId
         * @property {string|null} [key] Variable key
         * @property {string|null} [type] Variable type
         * @property {string|null} [description] Variable description
         * @property {string|null} [defaultValue] Variable defaultValue
         * @property {boolean|null} [required] Variable required
         * @property {string|null} [createdAt] Variable createdAt
         */

        /**
         * Constructs a new Variable.
         * @memberof prompt_management_system
         * @classdesc Represents a Variable.
         * @implements IVariable
         * @constructor
         * @param {prompt_management_system.IVariable=} [properties] Properties to set
         */
        function Variable(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Variable id.
         * @member {string} id
         * @memberof prompt_management_system.Variable
         * @instance
         */
        Variable.prototype.id = "";

        /**
         * Variable versionId.
         * @member {string} versionId
         * @memberof prompt_management_system.Variable
         * @instance
         */
        Variable.prototype.versionId = "";

        /**
         * Variable key.
         * @member {string} key
         * @memberof prompt_management_system.Variable
         * @instance
         */
        Variable.prototype.key = "";

        /**
         * Variable type.
         * @member {string} type
         * @memberof prompt_management_system.Variable
         * @instance
         */
        Variable.prototype.type = "";

        /**
         * Variable description.
         * @member {string} description
         * @memberof prompt_management_system.Variable
         * @instance
         */
        Variable.prototype.description = "";

        /**
         * Variable defaultValue.
         * @member {string} defaultValue
         * @memberof prompt_management_system.Variable
         * @instance
         */
        Variable.prototype.defaultValue = "";

        /**
         * Variable required.
         * @member {boolean} required
         * @memberof prompt_management_system.Variable
         * @instance
         */
        Variable.prototype.required = false;

        /**
         * Variable createdAt.
         * @member {string} createdAt
         * @memberof prompt_management_system.Variable
         * @instance
         */
        Variable.prototype.createdAt = "";

        /**
         * Creates a new Variable instance using the specified properties.
         * @function create
         * @memberof prompt_management_system.Variable
         * @static
         * @param {prompt_management_system.IVariable=} [properties] Properties to set
         * @returns {prompt_management_system.Variable} Variable instance
         */
        Variable.create = function create(properties) {
            return new Variable(properties);
        };

        /**
         * Encodes the specified Variable message. Does not implicitly {@link prompt_management_system.Variable.verify|verify} messages.
         * @function encode
         * @memberof prompt_management_system.Variable
         * @static
         * @param {prompt_management_system.IVariable} message Variable message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Variable.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.versionId != null && Object.hasOwnProperty.call(message, "versionId"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.versionId);
            if (message.key != null && Object.hasOwnProperty.call(message, "key"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.key);
            if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.type);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.description);
            if (message.defaultValue != null && Object.hasOwnProperty.call(message, "defaultValue"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.defaultValue);
            if (message.required != null && Object.hasOwnProperty.call(message, "required"))
                writer.uint32(/* id 7, wireType 0 =*/56).bool(message.required);
            if (message.createdAt != null && Object.hasOwnProperty.call(message, "createdAt"))
                writer.uint32(/* id 8, wireType 2 =*/66).string(message.createdAt);
            return writer;
        };

        /**
         * Encodes the specified Variable message, length delimited. Does not implicitly {@link prompt_management_system.Variable.verify|verify} messages.
         * @function encodeDelimited
         * @memberof prompt_management_system.Variable
         * @static
         * @param {prompt_management_system.IVariable} message Variable message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Variable.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Variable message from the specified reader or buffer.
         * @function decode
         * @memberof prompt_management_system.Variable
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {prompt_management_system.Variable} Variable
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Variable.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.prompt_management_system.Variable();
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
                        message.versionId = reader.string();
                        break;
                    }
                case 3: {
                        message.key = reader.string();
                        break;
                    }
                case 4: {
                        message.type = reader.string();
                        break;
                    }
                case 5: {
                        message.description = reader.string();
                        break;
                    }
                case 6: {
                        message.defaultValue = reader.string();
                        break;
                    }
                case 7: {
                        message.required = reader.bool();
                        break;
                    }
                case 8: {
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
         * Decodes a Variable message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof prompt_management_system.Variable
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {prompt_management_system.Variable} Variable
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Variable.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Variable message.
         * @function verify
         * @memberof prompt_management_system.Variable
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Variable.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.versionId != null && message.hasOwnProperty("versionId"))
                if (!$util.isString(message.versionId))
                    return "versionId: string expected";
            if (message.key != null && message.hasOwnProperty("key"))
                if (!$util.isString(message.key))
                    return "key: string expected";
            if (message.type != null && message.hasOwnProperty("type"))
                if (!$util.isString(message.type))
                    return "type: string expected";
            if (message.description != null && message.hasOwnProperty("description"))
                if (!$util.isString(message.description))
                    return "description: string expected";
            if (message.defaultValue != null && message.hasOwnProperty("defaultValue"))
                if (!$util.isString(message.defaultValue))
                    return "defaultValue: string expected";
            if (message.required != null && message.hasOwnProperty("required"))
                if (typeof message.required !== "boolean")
                    return "required: boolean expected";
            if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                if (!$util.isString(message.createdAt))
                    return "createdAt: string expected";
            return null;
        };

        /**
         * Creates a Variable message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof prompt_management_system.Variable
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {prompt_management_system.Variable} Variable
         */
        Variable.fromObject = function fromObject(object) {
            if (object instanceof $root.prompt_management_system.Variable)
                return object;
            let message = new $root.prompt_management_system.Variable();
            if (object.id != null)
                message.id = String(object.id);
            if (object.versionId != null)
                message.versionId = String(object.versionId);
            if (object.key != null)
                message.key = String(object.key);
            if (object.type != null)
                message.type = String(object.type);
            if (object.description != null)
                message.description = String(object.description);
            if (object.defaultValue != null)
                message.defaultValue = String(object.defaultValue);
            if (object.required != null)
                message.required = Boolean(object.required);
            if (object.createdAt != null)
                message.createdAt = String(object.createdAt);
            return message;
        };

        /**
         * Creates a plain object from a Variable message. Also converts values to other types if specified.
         * @function toObject
         * @memberof prompt_management_system.Variable
         * @static
         * @param {prompt_management_system.Variable} message Variable
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Variable.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.id = "";
                object.versionId = "";
                object.key = "";
                object.type = "";
                object.description = "";
                object.defaultValue = "";
                object.required = false;
                object.createdAt = "";
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.versionId != null && message.hasOwnProperty("versionId"))
                object.versionId = message.versionId;
            if (message.key != null && message.hasOwnProperty("key"))
                object.key = message.key;
            if (message.type != null && message.hasOwnProperty("type"))
                object.type = message.type;
            if (message.description != null && message.hasOwnProperty("description"))
                object.description = message.description;
            if (message.defaultValue != null && message.hasOwnProperty("defaultValue"))
                object.defaultValue = message.defaultValue;
            if (message.required != null && message.hasOwnProperty("required"))
                object.required = message.required;
            if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                object.createdAt = message.createdAt;
            return object;
        };

        /**
         * Converts this Variable to JSON.
         * @function toJSON
         * @memberof prompt_management_system.Variable
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Variable.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Variable
         * @function getTypeUrl
         * @memberof prompt_management_system.Variable
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Variable.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/prompt_management_system.Variable";
        };

        return Variable;
    })();

    prompt_management_system.ProjectList = (function() {

        /**
         * Properties of a ProjectList.
         * @memberof prompt_management_system
         * @interface IProjectList
         * @property {Array.<prompt_management_system.IProject>|null} [data] ProjectList data
         * @property {prompt_management_system.IPagination|null} [pagination] ProjectList pagination
         */

        /**
         * Constructs a new ProjectList.
         * @memberof prompt_management_system
         * @classdesc Represents a ProjectList.
         * @implements IProjectList
         * @constructor
         * @param {prompt_management_system.IProjectList=} [properties] Properties to set
         */
        function ProjectList(properties) {
            this.data = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ProjectList data.
         * @member {Array.<prompt_management_system.IProject>} data
         * @memberof prompt_management_system.ProjectList
         * @instance
         */
        ProjectList.prototype.data = $util.emptyArray;

        /**
         * ProjectList pagination.
         * @member {prompt_management_system.IPagination|null|undefined} pagination
         * @memberof prompt_management_system.ProjectList
         * @instance
         */
        ProjectList.prototype.pagination = null;

        /**
         * Creates a new ProjectList instance using the specified properties.
         * @function create
         * @memberof prompt_management_system.ProjectList
         * @static
         * @param {prompt_management_system.IProjectList=} [properties] Properties to set
         * @returns {prompt_management_system.ProjectList} ProjectList instance
         */
        ProjectList.create = function create(properties) {
            return new ProjectList(properties);
        };

        /**
         * Encodes the specified ProjectList message. Does not implicitly {@link prompt_management_system.ProjectList.verify|verify} messages.
         * @function encode
         * @memberof prompt_management_system.ProjectList
         * @static
         * @param {prompt_management_system.IProjectList} message ProjectList message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ProjectList.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.data != null && message.data.length)
                for (let i = 0; i < message.data.length; ++i)
                    $root.prompt_management_system.Project.encode(message.data[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.pagination != null && Object.hasOwnProperty.call(message, "pagination"))
                $root.prompt_management_system.Pagination.encode(message.pagination, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified ProjectList message, length delimited. Does not implicitly {@link prompt_management_system.ProjectList.verify|verify} messages.
         * @function encodeDelimited
         * @memberof prompt_management_system.ProjectList
         * @static
         * @param {prompt_management_system.IProjectList} message ProjectList message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ProjectList.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ProjectList message from the specified reader or buffer.
         * @function decode
         * @memberof prompt_management_system.ProjectList
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {prompt_management_system.ProjectList} ProjectList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ProjectList.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.prompt_management_system.ProjectList();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.data && message.data.length))
                            message.data = [];
                        message.data.push($root.prompt_management_system.Project.decode(reader, reader.uint32()));
                        break;
                    }
                case 2: {
                        message.pagination = $root.prompt_management_system.Pagination.decode(reader, reader.uint32());
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
         * Decodes a ProjectList message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof prompt_management_system.ProjectList
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {prompt_management_system.ProjectList} ProjectList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ProjectList.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ProjectList message.
         * @function verify
         * @memberof prompt_management_system.ProjectList
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ProjectList.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.data != null && message.hasOwnProperty("data")) {
                if (!Array.isArray(message.data))
                    return "data: array expected";
                for (let i = 0; i < message.data.length; ++i) {
                    let error = $root.prompt_management_system.Project.verify(message.data[i]);
                    if (error)
                        return "data." + error;
                }
            }
            if (message.pagination != null && message.hasOwnProperty("pagination")) {
                let error = $root.prompt_management_system.Pagination.verify(message.pagination);
                if (error)
                    return "pagination." + error;
            }
            return null;
        };

        /**
         * Creates a ProjectList message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof prompt_management_system.ProjectList
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {prompt_management_system.ProjectList} ProjectList
         */
        ProjectList.fromObject = function fromObject(object) {
            if (object instanceof $root.prompt_management_system.ProjectList)
                return object;
            let message = new $root.prompt_management_system.ProjectList();
            if (object.data) {
                if (!Array.isArray(object.data))
                    throw TypeError(".prompt_management_system.ProjectList.data: array expected");
                message.data = [];
                for (let i = 0; i < object.data.length; ++i) {
                    if (typeof object.data[i] !== "object")
                        throw TypeError(".prompt_management_system.ProjectList.data: object expected");
                    message.data[i] = $root.prompt_management_system.Project.fromObject(object.data[i]);
                }
            }
            if (object.pagination != null) {
                if (typeof object.pagination !== "object")
                    throw TypeError(".prompt_management_system.ProjectList.pagination: object expected");
                message.pagination = $root.prompt_management_system.Pagination.fromObject(object.pagination);
            }
            return message;
        };

        /**
         * Creates a plain object from a ProjectList message. Also converts values to other types if specified.
         * @function toObject
         * @memberof prompt_management_system.ProjectList
         * @static
         * @param {prompt_management_system.ProjectList} message ProjectList
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ProjectList.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.data = [];
            if (options.defaults)
                object.pagination = null;
            if (message.data && message.data.length) {
                object.data = [];
                for (let j = 0; j < message.data.length; ++j)
                    object.data[j] = $root.prompt_management_system.Project.toObject(message.data[j], options);
            }
            if (message.pagination != null && message.hasOwnProperty("pagination"))
                object.pagination = $root.prompt_management_system.Pagination.toObject(message.pagination, options);
            return object;
        };

        /**
         * Converts this ProjectList to JSON.
         * @function toJSON
         * @memberof prompt_management_system.ProjectList
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ProjectList.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ProjectList
         * @function getTypeUrl
         * @memberof prompt_management_system.ProjectList
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ProjectList.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/prompt_management_system.ProjectList";
        };

        return ProjectList;
    })();

    prompt_management_system.PromptList = (function() {

        /**
         * Properties of a PromptList.
         * @memberof prompt_management_system
         * @interface IPromptList
         * @property {Array.<prompt_management_system.IPrompt>|null} [data] PromptList data
         * @property {prompt_management_system.IPagination|null} [pagination] PromptList pagination
         */

        /**
         * Constructs a new PromptList.
         * @memberof prompt_management_system
         * @classdesc Represents a PromptList.
         * @implements IPromptList
         * @constructor
         * @param {prompt_management_system.IPromptList=} [properties] Properties to set
         */
        function PromptList(properties) {
            this.data = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PromptList data.
         * @member {Array.<prompt_management_system.IPrompt>} data
         * @memberof prompt_management_system.PromptList
         * @instance
         */
        PromptList.prototype.data = $util.emptyArray;

        /**
         * PromptList pagination.
         * @member {prompt_management_system.IPagination|null|undefined} pagination
         * @memberof prompt_management_system.PromptList
         * @instance
         */
        PromptList.prototype.pagination = null;

        /**
         * Creates a new PromptList instance using the specified properties.
         * @function create
         * @memberof prompt_management_system.PromptList
         * @static
         * @param {prompt_management_system.IPromptList=} [properties] Properties to set
         * @returns {prompt_management_system.PromptList} PromptList instance
         */
        PromptList.create = function create(properties) {
            return new PromptList(properties);
        };

        /**
         * Encodes the specified PromptList message. Does not implicitly {@link prompt_management_system.PromptList.verify|verify} messages.
         * @function encode
         * @memberof prompt_management_system.PromptList
         * @static
         * @param {prompt_management_system.IPromptList} message PromptList message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PromptList.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.data != null && message.data.length)
                for (let i = 0; i < message.data.length; ++i)
                    $root.prompt_management_system.Prompt.encode(message.data[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.pagination != null && Object.hasOwnProperty.call(message, "pagination"))
                $root.prompt_management_system.Pagination.encode(message.pagination, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified PromptList message, length delimited. Does not implicitly {@link prompt_management_system.PromptList.verify|verify} messages.
         * @function encodeDelimited
         * @memberof prompt_management_system.PromptList
         * @static
         * @param {prompt_management_system.IPromptList} message PromptList message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PromptList.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PromptList message from the specified reader or buffer.
         * @function decode
         * @memberof prompt_management_system.PromptList
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {prompt_management_system.PromptList} PromptList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PromptList.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.prompt_management_system.PromptList();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.data && message.data.length))
                            message.data = [];
                        message.data.push($root.prompt_management_system.Prompt.decode(reader, reader.uint32()));
                        break;
                    }
                case 2: {
                        message.pagination = $root.prompt_management_system.Pagination.decode(reader, reader.uint32());
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
         * Decodes a PromptList message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof prompt_management_system.PromptList
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {prompt_management_system.PromptList} PromptList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PromptList.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PromptList message.
         * @function verify
         * @memberof prompt_management_system.PromptList
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PromptList.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.data != null && message.hasOwnProperty("data")) {
                if (!Array.isArray(message.data))
                    return "data: array expected";
                for (let i = 0; i < message.data.length; ++i) {
                    let error = $root.prompt_management_system.Prompt.verify(message.data[i]);
                    if (error)
                        return "data." + error;
                }
            }
            if (message.pagination != null && message.hasOwnProperty("pagination")) {
                let error = $root.prompt_management_system.Pagination.verify(message.pagination);
                if (error)
                    return "pagination." + error;
            }
            return null;
        };

        /**
         * Creates a PromptList message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof prompt_management_system.PromptList
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {prompt_management_system.PromptList} PromptList
         */
        PromptList.fromObject = function fromObject(object) {
            if (object instanceof $root.prompt_management_system.PromptList)
                return object;
            let message = new $root.prompt_management_system.PromptList();
            if (object.data) {
                if (!Array.isArray(object.data))
                    throw TypeError(".prompt_management_system.PromptList.data: array expected");
                message.data = [];
                for (let i = 0; i < object.data.length; ++i) {
                    if (typeof object.data[i] !== "object")
                        throw TypeError(".prompt_management_system.PromptList.data: object expected");
                    message.data[i] = $root.prompt_management_system.Prompt.fromObject(object.data[i]);
                }
            }
            if (object.pagination != null) {
                if (typeof object.pagination !== "object")
                    throw TypeError(".prompt_management_system.PromptList.pagination: object expected");
                message.pagination = $root.prompt_management_system.Pagination.fromObject(object.pagination);
            }
            return message;
        };

        /**
         * Creates a plain object from a PromptList message. Also converts values to other types if specified.
         * @function toObject
         * @memberof prompt_management_system.PromptList
         * @static
         * @param {prompt_management_system.PromptList} message PromptList
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PromptList.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.data = [];
            if (options.defaults)
                object.pagination = null;
            if (message.data && message.data.length) {
                object.data = [];
                for (let j = 0; j < message.data.length; ++j)
                    object.data[j] = $root.prompt_management_system.Prompt.toObject(message.data[j], options);
            }
            if (message.pagination != null && message.hasOwnProperty("pagination"))
                object.pagination = $root.prompt_management_system.Pagination.toObject(message.pagination, options);
            return object;
        };

        /**
         * Converts this PromptList to JSON.
         * @function toJSON
         * @memberof prompt_management_system.PromptList
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PromptList.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PromptList
         * @function getTypeUrl
         * @memberof prompt_management_system.PromptList
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PromptList.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/prompt_management_system.PromptList";
        };

        return PromptList;
    })();

    prompt_management_system.VersionList = (function() {

        /**
         * Properties of a VersionList.
         * @memberof prompt_management_system
         * @interface IVersionList
         * @property {Array.<prompt_management_system.IPromptVersion>|null} [data] VersionList data
         * @property {prompt_management_system.IPagination|null} [pagination] VersionList pagination
         */

        /**
         * Constructs a new VersionList.
         * @memberof prompt_management_system
         * @classdesc Represents a VersionList.
         * @implements IVersionList
         * @constructor
         * @param {prompt_management_system.IVersionList=} [properties] Properties to set
         */
        function VersionList(properties) {
            this.data = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * VersionList data.
         * @member {Array.<prompt_management_system.IPromptVersion>} data
         * @memberof prompt_management_system.VersionList
         * @instance
         */
        VersionList.prototype.data = $util.emptyArray;

        /**
         * VersionList pagination.
         * @member {prompt_management_system.IPagination|null|undefined} pagination
         * @memberof prompt_management_system.VersionList
         * @instance
         */
        VersionList.prototype.pagination = null;

        /**
         * Creates a new VersionList instance using the specified properties.
         * @function create
         * @memberof prompt_management_system.VersionList
         * @static
         * @param {prompt_management_system.IVersionList=} [properties] Properties to set
         * @returns {prompt_management_system.VersionList} VersionList instance
         */
        VersionList.create = function create(properties) {
            return new VersionList(properties);
        };

        /**
         * Encodes the specified VersionList message. Does not implicitly {@link prompt_management_system.VersionList.verify|verify} messages.
         * @function encode
         * @memberof prompt_management_system.VersionList
         * @static
         * @param {prompt_management_system.IVersionList} message VersionList message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        VersionList.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.data != null && message.data.length)
                for (let i = 0; i < message.data.length; ++i)
                    $root.prompt_management_system.PromptVersion.encode(message.data[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.pagination != null && Object.hasOwnProperty.call(message, "pagination"))
                $root.prompt_management_system.Pagination.encode(message.pagination, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified VersionList message, length delimited. Does not implicitly {@link prompt_management_system.VersionList.verify|verify} messages.
         * @function encodeDelimited
         * @memberof prompt_management_system.VersionList
         * @static
         * @param {prompt_management_system.IVersionList} message VersionList message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        VersionList.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a VersionList message from the specified reader or buffer.
         * @function decode
         * @memberof prompt_management_system.VersionList
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {prompt_management_system.VersionList} VersionList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        VersionList.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.prompt_management_system.VersionList();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.data && message.data.length))
                            message.data = [];
                        message.data.push($root.prompt_management_system.PromptVersion.decode(reader, reader.uint32()));
                        break;
                    }
                case 2: {
                        message.pagination = $root.prompt_management_system.Pagination.decode(reader, reader.uint32());
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
         * Decodes a VersionList message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof prompt_management_system.VersionList
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {prompt_management_system.VersionList} VersionList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        VersionList.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a VersionList message.
         * @function verify
         * @memberof prompt_management_system.VersionList
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        VersionList.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.data != null && message.hasOwnProperty("data")) {
                if (!Array.isArray(message.data))
                    return "data: array expected";
                for (let i = 0; i < message.data.length; ++i) {
                    let error = $root.prompt_management_system.PromptVersion.verify(message.data[i]);
                    if (error)
                        return "data." + error;
                }
            }
            if (message.pagination != null && message.hasOwnProperty("pagination")) {
                let error = $root.prompt_management_system.Pagination.verify(message.pagination);
                if (error)
                    return "pagination." + error;
            }
            return null;
        };

        /**
         * Creates a VersionList message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof prompt_management_system.VersionList
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {prompt_management_system.VersionList} VersionList
         */
        VersionList.fromObject = function fromObject(object) {
            if (object instanceof $root.prompt_management_system.VersionList)
                return object;
            let message = new $root.prompt_management_system.VersionList();
            if (object.data) {
                if (!Array.isArray(object.data))
                    throw TypeError(".prompt_management_system.VersionList.data: array expected");
                message.data = [];
                for (let i = 0; i < object.data.length; ++i) {
                    if (typeof object.data[i] !== "object")
                        throw TypeError(".prompt_management_system.VersionList.data: object expected");
                    message.data[i] = $root.prompt_management_system.PromptVersion.fromObject(object.data[i]);
                }
            }
            if (object.pagination != null) {
                if (typeof object.pagination !== "object")
                    throw TypeError(".prompt_management_system.VersionList.pagination: object expected");
                message.pagination = $root.prompt_management_system.Pagination.fromObject(object.pagination);
            }
            return message;
        };

        /**
         * Creates a plain object from a VersionList message. Also converts values to other types if specified.
         * @function toObject
         * @memberof prompt_management_system.VersionList
         * @static
         * @param {prompt_management_system.VersionList} message VersionList
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        VersionList.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.data = [];
            if (options.defaults)
                object.pagination = null;
            if (message.data && message.data.length) {
                object.data = [];
                for (let j = 0; j < message.data.length; ++j)
                    object.data[j] = $root.prompt_management_system.PromptVersion.toObject(message.data[j], options);
            }
            if (message.pagination != null && message.hasOwnProperty("pagination"))
                object.pagination = $root.prompt_management_system.Pagination.toObject(message.pagination, options);
            return object;
        };

        /**
         * Converts this VersionList to JSON.
         * @function toJSON
         * @memberof prompt_management_system.VersionList
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        VersionList.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for VersionList
         * @function getTypeUrl
         * @memberof prompt_management_system.VersionList
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        VersionList.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/prompt_management_system.VersionList";
        };

        return VersionList;
    })();

    prompt_management_system.Pagination = (function() {

        /**
         * Properties of a Pagination.
         * @memberof prompt_management_system
         * @interface IPagination
         * @property {number|null} [page] Pagination page
         * @property {number|null} [limit] Pagination limit
         * @property {number|null} [total] Pagination total
         * @property {number|null} [totalPages] Pagination totalPages
         */

        /**
         * Constructs a new Pagination.
         * @memberof prompt_management_system
         * @classdesc Represents a Pagination.
         * @implements IPagination
         * @constructor
         * @param {prompt_management_system.IPagination=} [properties] Properties to set
         */
        function Pagination(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Pagination page.
         * @member {number} page
         * @memberof prompt_management_system.Pagination
         * @instance
         */
        Pagination.prototype.page = 0;

        /**
         * Pagination limit.
         * @member {number} limit
         * @memberof prompt_management_system.Pagination
         * @instance
         */
        Pagination.prototype.limit = 0;

        /**
         * Pagination total.
         * @member {number} total
         * @memberof prompt_management_system.Pagination
         * @instance
         */
        Pagination.prototype.total = 0;

        /**
         * Pagination totalPages.
         * @member {number} totalPages
         * @memberof prompt_management_system.Pagination
         * @instance
         */
        Pagination.prototype.totalPages = 0;

        /**
         * Creates a new Pagination instance using the specified properties.
         * @function create
         * @memberof prompt_management_system.Pagination
         * @static
         * @param {prompt_management_system.IPagination=} [properties] Properties to set
         * @returns {prompt_management_system.Pagination} Pagination instance
         */
        Pagination.create = function create(properties) {
            return new Pagination(properties);
        };

        /**
         * Encodes the specified Pagination message. Does not implicitly {@link prompt_management_system.Pagination.verify|verify} messages.
         * @function encode
         * @memberof prompt_management_system.Pagination
         * @static
         * @param {prompt_management_system.IPagination} message Pagination message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Pagination.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.page != null && Object.hasOwnProperty.call(message, "page"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.page);
            if (message.limit != null && Object.hasOwnProperty.call(message, "limit"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.limit);
            if (message.total != null && Object.hasOwnProperty.call(message, "total"))
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.total);
            if (message.totalPages != null && Object.hasOwnProperty.call(message, "totalPages"))
                writer.uint32(/* id 4, wireType 0 =*/32).int32(message.totalPages);
            return writer;
        };

        /**
         * Encodes the specified Pagination message, length delimited. Does not implicitly {@link prompt_management_system.Pagination.verify|verify} messages.
         * @function encodeDelimited
         * @memberof prompt_management_system.Pagination
         * @static
         * @param {prompt_management_system.IPagination} message Pagination message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Pagination.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Pagination message from the specified reader or buffer.
         * @function decode
         * @memberof prompt_management_system.Pagination
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {prompt_management_system.Pagination} Pagination
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Pagination.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.prompt_management_system.Pagination();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.page = reader.int32();
                        break;
                    }
                case 2: {
                        message.limit = reader.int32();
                        break;
                    }
                case 3: {
                        message.total = reader.int32();
                        break;
                    }
                case 4: {
                        message.totalPages = reader.int32();
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
         * @memberof prompt_management_system.Pagination
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {prompt_management_system.Pagination} Pagination
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
         * @memberof prompt_management_system.Pagination
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Pagination.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.page != null && message.hasOwnProperty("page"))
                if (!$util.isInteger(message.page))
                    return "page: integer expected";
            if (message.limit != null && message.hasOwnProperty("limit"))
                if (!$util.isInteger(message.limit))
                    return "limit: integer expected";
            if (message.total != null && message.hasOwnProperty("total"))
                if (!$util.isInteger(message.total))
                    return "total: integer expected";
            if (message.totalPages != null && message.hasOwnProperty("totalPages"))
                if (!$util.isInteger(message.totalPages))
                    return "totalPages: integer expected";
            return null;
        };

        /**
         * Creates a Pagination message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof prompt_management_system.Pagination
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {prompt_management_system.Pagination} Pagination
         */
        Pagination.fromObject = function fromObject(object) {
            if (object instanceof $root.prompt_management_system.Pagination)
                return object;
            let message = new $root.prompt_management_system.Pagination();
            if (object.page != null)
                message.page = object.page | 0;
            if (object.limit != null)
                message.limit = object.limit | 0;
            if (object.total != null)
                message.total = object.total | 0;
            if (object.totalPages != null)
                message.totalPages = object.totalPages | 0;
            return message;
        };

        /**
         * Creates a plain object from a Pagination message. Also converts values to other types if specified.
         * @function toObject
         * @memberof prompt_management_system.Pagination
         * @static
         * @param {prompt_management_system.Pagination} message Pagination
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Pagination.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.page = 0;
                object.limit = 0;
                object.total = 0;
                object.totalPages = 0;
            }
            if (message.page != null && message.hasOwnProperty("page"))
                object.page = message.page;
            if (message.limit != null && message.hasOwnProperty("limit"))
                object.limit = message.limit;
            if (message.total != null && message.hasOwnProperty("total"))
                object.total = message.total;
            if (message.totalPages != null && message.hasOwnProperty("totalPages"))
                object.totalPages = message.totalPages;
            return object;
        };

        /**
         * Converts this Pagination to JSON.
         * @function toJSON
         * @memberof prompt_management_system.Pagination
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Pagination.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Pagination
         * @function getTypeUrl
         * @memberof prompt_management_system.Pagination
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Pagination.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/prompt_management_system.Pagination";
        };

        return Pagination;
    })();

    prompt_management_system.RenderRequest = (function() {

        /**
         * Properties of a RenderRequest.
         * @memberof prompt_management_system
         * @interface IRenderRequest
         * @property {string|null} [environment] RenderRequest environment
         * @property {Object.<string,string>|null} [variables] RenderRequest variables
         */

        /**
         * Constructs a new RenderRequest.
         * @memberof prompt_management_system
         * @classdesc Represents a RenderRequest.
         * @implements IRenderRequest
         * @constructor
         * @param {prompt_management_system.IRenderRequest=} [properties] Properties to set
         */
        function RenderRequest(properties) {
            this.variables = {};
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * RenderRequest environment.
         * @member {string} environment
         * @memberof prompt_management_system.RenderRequest
         * @instance
         */
        RenderRequest.prototype.environment = "";

        /**
         * RenderRequest variables.
         * @member {Object.<string,string>} variables
         * @memberof prompt_management_system.RenderRequest
         * @instance
         */
        RenderRequest.prototype.variables = $util.emptyObject;

        /**
         * Creates a new RenderRequest instance using the specified properties.
         * @function create
         * @memberof prompt_management_system.RenderRequest
         * @static
         * @param {prompt_management_system.IRenderRequest=} [properties] Properties to set
         * @returns {prompt_management_system.RenderRequest} RenderRequest instance
         */
        RenderRequest.create = function create(properties) {
            return new RenderRequest(properties);
        };

        /**
         * Encodes the specified RenderRequest message. Does not implicitly {@link prompt_management_system.RenderRequest.verify|verify} messages.
         * @function encode
         * @memberof prompt_management_system.RenderRequest
         * @static
         * @param {prompt_management_system.IRenderRequest} message RenderRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RenderRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.environment != null && Object.hasOwnProperty.call(message, "environment"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.environment);
            if (message.variables != null && Object.hasOwnProperty.call(message, "variables"))
                for (let keys = Object.keys(message.variables), i = 0; i < keys.length; ++i)
                    writer.uint32(/* id 2, wireType 2 =*/18).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]).uint32(/* id 2, wireType 2 =*/18).string(message.variables[keys[i]]).ldelim();
            return writer;
        };

        /**
         * Encodes the specified RenderRequest message, length delimited. Does not implicitly {@link prompt_management_system.RenderRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof prompt_management_system.RenderRequest
         * @static
         * @param {prompt_management_system.IRenderRequest} message RenderRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RenderRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a RenderRequest message from the specified reader or buffer.
         * @function decode
         * @memberof prompt_management_system.RenderRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {prompt_management_system.RenderRequest} RenderRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RenderRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.prompt_management_system.RenderRequest(), key, value;
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.environment = reader.string();
                        break;
                    }
                case 2: {
                        if (message.variables === $util.emptyObject)
                            message.variables = {};
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
                        message.variables[key] = value;
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
         * Decodes a RenderRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof prompt_management_system.RenderRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {prompt_management_system.RenderRequest} RenderRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RenderRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a RenderRequest message.
         * @function verify
         * @memberof prompt_management_system.RenderRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        RenderRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.environment != null && message.hasOwnProperty("environment"))
                if (!$util.isString(message.environment))
                    return "environment: string expected";
            if (message.variables != null && message.hasOwnProperty("variables")) {
                if (!$util.isObject(message.variables))
                    return "variables: object expected";
                let key = Object.keys(message.variables);
                for (let i = 0; i < key.length; ++i)
                    if (!$util.isString(message.variables[key[i]]))
                        return "variables: string{k:string} expected";
            }
            return null;
        };

        /**
         * Creates a RenderRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof prompt_management_system.RenderRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {prompt_management_system.RenderRequest} RenderRequest
         */
        RenderRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.prompt_management_system.RenderRequest)
                return object;
            let message = new $root.prompt_management_system.RenderRequest();
            if (object.environment != null)
                message.environment = String(object.environment);
            if (object.variables) {
                if (typeof object.variables !== "object")
                    throw TypeError(".prompt_management_system.RenderRequest.variables: object expected");
                message.variables = {};
                for (let keys = Object.keys(object.variables), i = 0; i < keys.length; ++i)
                    message.variables[keys[i]] = String(object.variables[keys[i]]);
            }
            return message;
        };

        /**
         * Creates a plain object from a RenderRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof prompt_management_system.RenderRequest
         * @static
         * @param {prompt_management_system.RenderRequest} message RenderRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        RenderRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.objects || options.defaults)
                object.variables = {};
            if (options.defaults)
                object.environment = "";
            if (message.environment != null && message.hasOwnProperty("environment"))
                object.environment = message.environment;
            let keys2;
            if (message.variables && (keys2 = Object.keys(message.variables)).length) {
                object.variables = {};
                for (let j = 0; j < keys2.length; ++j)
                    object.variables[keys2[j]] = message.variables[keys2[j]];
            }
            return object;
        };

        /**
         * Converts this RenderRequest to JSON.
         * @function toJSON
         * @memberof prompt_management_system.RenderRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        RenderRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for RenderRequest
         * @function getTypeUrl
         * @memberof prompt_management_system.RenderRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        RenderRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/prompt_management_system.RenderRequest";
        };

        return RenderRequest;
    })();

    prompt_management_system.RenderResponse = (function() {

        /**
         * Properties of a RenderResponse.
         * @memberof prompt_management_system
         * @interface IRenderResponse
         * @property {string|null} [rendered] RenderResponse rendered
         * @property {string|null} [config] RenderResponse config
         * @property {prompt_management_system.IPromptVersion|null} [version] RenderResponse version
         * @property {prompt_management_system.IPrompt|null} [prompt] RenderResponse prompt
         */

        /**
         * Constructs a new RenderResponse.
         * @memberof prompt_management_system
         * @classdesc Represents a RenderResponse.
         * @implements IRenderResponse
         * @constructor
         * @param {prompt_management_system.IRenderResponse=} [properties] Properties to set
         */
        function RenderResponse(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * RenderResponse rendered.
         * @member {string} rendered
         * @memberof prompt_management_system.RenderResponse
         * @instance
         */
        RenderResponse.prototype.rendered = "";

        /**
         * RenderResponse config.
         * @member {string} config
         * @memberof prompt_management_system.RenderResponse
         * @instance
         */
        RenderResponse.prototype.config = "";

        /**
         * RenderResponse version.
         * @member {prompt_management_system.IPromptVersion|null|undefined} version
         * @memberof prompt_management_system.RenderResponse
         * @instance
         */
        RenderResponse.prototype.version = null;

        /**
         * RenderResponse prompt.
         * @member {prompt_management_system.IPrompt|null|undefined} prompt
         * @memberof prompt_management_system.RenderResponse
         * @instance
         */
        RenderResponse.prototype.prompt = null;

        /**
         * Creates a new RenderResponse instance using the specified properties.
         * @function create
         * @memberof prompt_management_system.RenderResponse
         * @static
         * @param {prompt_management_system.IRenderResponse=} [properties] Properties to set
         * @returns {prompt_management_system.RenderResponse} RenderResponse instance
         */
        RenderResponse.create = function create(properties) {
            return new RenderResponse(properties);
        };

        /**
         * Encodes the specified RenderResponse message. Does not implicitly {@link prompt_management_system.RenderResponse.verify|verify} messages.
         * @function encode
         * @memberof prompt_management_system.RenderResponse
         * @static
         * @param {prompt_management_system.IRenderResponse} message RenderResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RenderResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.rendered != null && Object.hasOwnProperty.call(message, "rendered"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.rendered);
            if (message.config != null && Object.hasOwnProperty.call(message, "config"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.config);
            if (message.version != null && Object.hasOwnProperty.call(message, "version"))
                $root.prompt_management_system.PromptVersion.encode(message.version, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            if (message.prompt != null && Object.hasOwnProperty.call(message, "prompt"))
                $root.prompt_management_system.Prompt.encode(message.prompt, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified RenderResponse message, length delimited. Does not implicitly {@link prompt_management_system.RenderResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof prompt_management_system.RenderResponse
         * @static
         * @param {prompt_management_system.IRenderResponse} message RenderResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RenderResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a RenderResponse message from the specified reader or buffer.
         * @function decode
         * @memberof prompt_management_system.RenderResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {prompt_management_system.RenderResponse} RenderResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RenderResponse.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.prompt_management_system.RenderResponse();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.rendered = reader.string();
                        break;
                    }
                case 2: {
                        message.config = reader.string();
                        break;
                    }
                case 3: {
                        message.version = $root.prompt_management_system.PromptVersion.decode(reader, reader.uint32());
                        break;
                    }
                case 4: {
                        message.prompt = $root.prompt_management_system.Prompt.decode(reader, reader.uint32());
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
         * Decodes a RenderResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof prompt_management_system.RenderResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {prompt_management_system.RenderResponse} RenderResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RenderResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a RenderResponse message.
         * @function verify
         * @memberof prompt_management_system.RenderResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        RenderResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.rendered != null && message.hasOwnProperty("rendered"))
                if (!$util.isString(message.rendered))
                    return "rendered: string expected";
            if (message.config != null && message.hasOwnProperty("config"))
                if (!$util.isString(message.config))
                    return "config: string expected";
            if (message.version != null && message.hasOwnProperty("version")) {
                let error = $root.prompt_management_system.PromptVersion.verify(message.version);
                if (error)
                    return "version." + error;
            }
            if (message.prompt != null && message.hasOwnProperty("prompt")) {
                let error = $root.prompt_management_system.Prompt.verify(message.prompt);
                if (error)
                    return "prompt." + error;
            }
            return null;
        };

        /**
         * Creates a RenderResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof prompt_management_system.RenderResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {prompt_management_system.RenderResponse} RenderResponse
         */
        RenderResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.prompt_management_system.RenderResponse)
                return object;
            let message = new $root.prompt_management_system.RenderResponse();
            if (object.rendered != null)
                message.rendered = String(object.rendered);
            if (object.config != null)
                message.config = String(object.config);
            if (object.version != null) {
                if (typeof object.version !== "object")
                    throw TypeError(".prompt_management_system.RenderResponse.version: object expected");
                message.version = $root.prompt_management_system.PromptVersion.fromObject(object.version);
            }
            if (object.prompt != null) {
                if (typeof object.prompt !== "object")
                    throw TypeError(".prompt_management_system.RenderResponse.prompt: object expected");
                message.prompt = $root.prompt_management_system.Prompt.fromObject(object.prompt);
            }
            return message;
        };

        /**
         * Creates a plain object from a RenderResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof prompt_management_system.RenderResponse
         * @static
         * @param {prompt_management_system.RenderResponse} message RenderResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        RenderResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.rendered = "";
                object.config = "";
                object.version = null;
                object.prompt = null;
            }
            if (message.rendered != null && message.hasOwnProperty("rendered"))
                object.rendered = message.rendered;
            if (message.config != null && message.hasOwnProperty("config"))
                object.config = message.config;
            if (message.version != null && message.hasOwnProperty("version"))
                object.version = $root.prompt_management_system.PromptVersion.toObject(message.version, options);
            if (message.prompt != null && message.hasOwnProperty("prompt"))
                object.prompt = $root.prompt_management_system.Prompt.toObject(message.prompt, options);
            return object;
        };

        /**
         * Converts this RenderResponse to JSON.
         * @function toJSON
         * @memberof prompt_management_system.RenderResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        RenderResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for RenderResponse
         * @function getTypeUrl
         * @memberof prompt_management_system.RenderResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        RenderResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/prompt_management_system.RenderResponse";
        };

        return RenderResponse;
    })();

    return prompt_management_system;
})();

export { $root as default };
