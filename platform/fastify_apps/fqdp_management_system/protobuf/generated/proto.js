/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const fqdp = $root.fqdp = (() => {

    /**
     * Namespace fqdp.
     * @exports fqdp
     * @namespace
     */
    const fqdp = {};

    fqdp.Application = (function() {

        /**
         * Properties of an Application.
         * @memberof fqdp
         * @interface IApplication
         * @property {string|null} [id] Application id
         * @property {string|null} [name] Application name
         * @property {string|null} [slug] Application slug
         * @property {string|null} [description] Application description
         * @property {fqdp.EntityStatus|null} [status] Application status
         * @property {string|null} [metadataJson] Application metadataJson
         * @property {string|null} [teamId] Application teamId
         * @property {string|null} [teamName] Application teamName
         * @property {string|null} [workspaceId] Application workspaceId
         * @property {string|null} [workspaceName] Application workspaceName
         * @property {string|null} [organizationId] Application organizationId
         * @property {string|null} [organizationName] Application organizationName
         * @property {number|null} [projectCount] Application projectCount
         * @property {string|null} [createdBy] Application createdBy
         * @property {string|null} [updatedBy] Application updatedBy
         * @property {string|null} [createdAt] Application createdAt
         * @property {string|null} [updatedAt] Application updatedAt
         */

        /**
         * Constructs a new Application.
         * @memberof fqdp
         * @classdesc Represents an Application.
         * @implements IApplication
         * @constructor
         * @param {fqdp.IApplication=} [properties] Properties to set
         */
        function Application(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Application id.
         * @member {string} id
         * @memberof fqdp.Application
         * @instance
         */
        Application.prototype.id = "";

        /**
         * Application name.
         * @member {string} name
         * @memberof fqdp.Application
         * @instance
         */
        Application.prototype.name = "";

        /**
         * Application slug.
         * @member {string} slug
         * @memberof fqdp.Application
         * @instance
         */
        Application.prototype.slug = "";

        /**
         * Application description.
         * @member {string} description
         * @memberof fqdp.Application
         * @instance
         */
        Application.prototype.description = "";

        /**
         * Application status.
         * @member {fqdp.EntityStatus} status
         * @memberof fqdp.Application
         * @instance
         */
        Application.prototype.status = 0;

        /**
         * Application metadataJson.
         * @member {string} metadataJson
         * @memberof fqdp.Application
         * @instance
         */
        Application.prototype.metadataJson = "";

        /**
         * Application teamId.
         * @member {string} teamId
         * @memberof fqdp.Application
         * @instance
         */
        Application.prototype.teamId = "";

        /**
         * Application teamName.
         * @member {string} teamName
         * @memberof fqdp.Application
         * @instance
         */
        Application.prototype.teamName = "";

        /**
         * Application workspaceId.
         * @member {string} workspaceId
         * @memberof fqdp.Application
         * @instance
         */
        Application.prototype.workspaceId = "";

        /**
         * Application workspaceName.
         * @member {string} workspaceName
         * @memberof fqdp.Application
         * @instance
         */
        Application.prototype.workspaceName = "";

        /**
         * Application organizationId.
         * @member {string} organizationId
         * @memberof fqdp.Application
         * @instance
         */
        Application.prototype.organizationId = "";

        /**
         * Application organizationName.
         * @member {string} organizationName
         * @memberof fqdp.Application
         * @instance
         */
        Application.prototype.organizationName = "";

        /**
         * Application projectCount.
         * @member {number} projectCount
         * @memberof fqdp.Application
         * @instance
         */
        Application.prototype.projectCount = 0;

        /**
         * Application createdBy.
         * @member {string} createdBy
         * @memberof fqdp.Application
         * @instance
         */
        Application.prototype.createdBy = "";

        /**
         * Application updatedBy.
         * @member {string} updatedBy
         * @memberof fqdp.Application
         * @instance
         */
        Application.prototype.updatedBy = "";

        /**
         * Application createdAt.
         * @member {string} createdAt
         * @memberof fqdp.Application
         * @instance
         */
        Application.prototype.createdAt = "";

        /**
         * Application updatedAt.
         * @member {string} updatedAt
         * @memberof fqdp.Application
         * @instance
         */
        Application.prototype.updatedAt = "";

        /**
         * Creates a new Application instance using the specified properties.
         * @function create
         * @memberof fqdp.Application
         * @static
         * @param {fqdp.IApplication=} [properties] Properties to set
         * @returns {fqdp.Application} Application instance
         */
        Application.create = function create(properties) {
            return new Application(properties);
        };

        /**
         * Encodes the specified Application message. Does not implicitly {@link fqdp.Application.verify|verify} messages.
         * @function encode
         * @memberof fqdp.Application
         * @static
         * @param {fqdp.IApplication} message Application message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Application.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
            if (message.slug != null && Object.hasOwnProperty.call(message, "slug"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.slug);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.description);
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 5, wireType 0 =*/40).int32(message.status);
            if (message.metadataJson != null && Object.hasOwnProperty.call(message, "metadataJson"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.metadataJson);
            if (message.teamId != null && Object.hasOwnProperty.call(message, "teamId"))
                writer.uint32(/* id 7, wireType 2 =*/58).string(message.teamId);
            if (message.teamName != null && Object.hasOwnProperty.call(message, "teamName"))
                writer.uint32(/* id 8, wireType 2 =*/66).string(message.teamName);
            if (message.workspaceId != null && Object.hasOwnProperty.call(message, "workspaceId"))
                writer.uint32(/* id 9, wireType 2 =*/74).string(message.workspaceId);
            if (message.workspaceName != null && Object.hasOwnProperty.call(message, "workspaceName"))
                writer.uint32(/* id 10, wireType 2 =*/82).string(message.workspaceName);
            if (message.organizationId != null && Object.hasOwnProperty.call(message, "organizationId"))
                writer.uint32(/* id 11, wireType 2 =*/90).string(message.organizationId);
            if (message.organizationName != null && Object.hasOwnProperty.call(message, "organizationName"))
                writer.uint32(/* id 12, wireType 2 =*/98).string(message.organizationName);
            if (message.projectCount != null && Object.hasOwnProperty.call(message, "projectCount"))
                writer.uint32(/* id 13, wireType 0 =*/104).int32(message.projectCount);
            if (message.createdBy != null && Object.hasOwnProperty.call(message, "createdBy"))
                writer.uint32(/* id 14, wireType 2 =*/114).string(message.createdBy);
            if (message.updatedBy != null && Object.hasOwnProperty.call(message, "updatedBy"))
                writer.uint32(/* id 15, wireType 2 =*/122).string(message.updatedBy);
            if (message.createdAt != null && Object.hasOwnProperty.call(message, "createdAt"))
                writer.uint32(/* id 16, wireType 2 =*/130).string(message.createdAt);
            if (message.updatedAt != null && Object.hasOwnProperty.call(message, "updatedAt"))
                writer.uint32(/* id 17, wireType 2 =*/138).string(message.updatedAt);
            return writer;
        };

        /**
         * Encodes the specified Application message, length delimited. Does not implicitly {@link fqdp.Application.verify|verify} messages.
         * @function encodeDelimited
         * @memberof fqdp.Application
         * @static
         * @param {fqdp.IApplication} message Application message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Application.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an Application message from the specified reader or buffer.
         * @function decode
         * @memberof fqdp.Application
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {fqdp.Application} Application
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Application.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.fqdp.Application();
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
                        message.slug = reader.string();
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
                        message.metadataJson = reader.string();
                        break;
                    }
                case 7: {
                        message.teamId = reader.string();
                        break;
                    }
                case 8: {
                        message.teamName = reader.string();
                        break;
                    }
                case 9: {
                        message.workspaceId = reader.string();
                        break;
                    }
                case 10: {
                        message.workspaceName = reader.string();
                        break;
                    }
                case 11: {
                        message.organizationId = reader.string();
                        break;
                    }
                case 12: {
                        message.organizationName = reader.string();
                        break;
                    }
                case 13: {
                        message.projectCount = reader.int32();
                        break;
                    }
                case 14: {
                        message.createdBy = reader.string();
                        break;
                    }
                case 15: {
                        message.updatedBy = reader.string();
                        break;
                    }
                case 16: {
                        message.createdAt = reader.string();
                        break;
                    }
                case 17: {
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
         * Decodes an Application message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof fqdp.Application
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {fqdp.Application} Application
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Application.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Application message.
         * @function verify
         * @memberof fqdp.Application
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Application.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.slug != null && message.hasOwnProperty("slug"))
                if (!$util.isString(message.slug))
                    return "slug: string expected";
            if (message.description != null && message.hasOwnProperty("description"))
                if (!$util.isString(message.description))
                    return "description: string expected";
            if (message.status != null && message.hasOwnProperty("status"))
                switch (message.status) {
                default:
                    return "status: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                    break;
                }
            if (message.metadataJson != null && message.hasOwnProperty("metadataJson"))
                if (!$util.isString(message.metadataJson))
                    return "metadataJson: string expected";
            if (message.teamId != null && message.hasOwnProperty("teamId"))
                if (!$util.isString(message.teamId))
                    return "teamId: string expected";
            if (message.teamName != null && message.hasOwnProperty("teamName"))
                if (!$util.isString(message.teamName))
                    return "teamName: string expected";
            if (message.workspaceId != null && message.hasOwnProperty("workspaceId"))
                if (!$util.isString(message.workspaceId))
                    return "workspaceId: string expected";
            if (message.workspaceName != null && message.hasOwnProperty("workspaceName"))
                if (!$util.isString(message.workspaceName))
                    return "workspaceName: string expected";
            if (message.organizationId != null && message.hasOwnProperty("organizationId"))
                if (!$util.isString(message.organizationId))
                    return "organizationId: string expected";
            if (message.organizationName != null && message.hasOwnProperty("organizationName"))
                if (!$util.isString(message.organizationName))
                    return "organizationName: string expected";
            if (message.projectCount != null && message.hasOwnProperty("projectCount"))
                if (!$util.isInteger(message.projectCount))
                    return "projectCount: integer expected";
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
            return null;
        };

        /**
         * Creates an Application message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof fqdp.Application
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {fqdp.Application} Application
         */
        Application.fromObject = function fromObject(object) {
            if (object instanceof $root.fqdp.Application)
                return object;
            let message = new $root.fqdp.Application();
            if (object.id != null)
                message.id = String(object.id);
            if (object.name != null)
                message.name = String(object.name);
            if (object.slug != null)
                message.slug = String(object.slug);
            if (object.description != null)
                message.description = String(object.description);
            switch (object.status) {
            default:
                if (typeof object.status === "number") {
                    message.status = object.status;
                    break;
                }
                break;
            case "ENTITY_STATUS_UNSPECIFIED":
            case 0:
                message.status = 0;
                break;
            case "ACTIVE":
            case 1:
                message.status = 1;
                break;
            case "INACTIVE":
            case 2:
                message.status = 2;
                break;
            case "ARCHIVED":
            case 3:
                message.status = 3;
                break;
            }
            if (object.metadataJson != null)
                message.metadataJson = String(object.metadataJson);
            if (object.teamId != null)
                message.teamId = String(object.teamId);
            if (object.teamName != null)
                message.teamName = String(object.teamName);
            if (object.workspaceId != null)
                message.workspaceId = String(object.workspaceId);
            if (object.workspaceName != null)
                message.workspaceName = String(object.workspaceName);
            if (object.organizationId != null)
                message.organizationId = String(object.organizationId);
            if (object.organizationName != null)
                message.organizationName = String(object.organizationName);
            if (object.projectCount != null)
                message.projectCount = object.projectCount | 0;
            if (object.createdBy != null)
                message.createdBy = String(object.createdBy);
            if (object.updatedBy != null)
                message.updatedBy = String(object.updatedBy);
            if (object.createdAt != null)
                message.createdAt = String(object.createdAt);
            if (object.updatedAt != null)
                message.updatedAt = String(object.updatedAt);
            return message;
        };

        /**
         * Creates a plain object from an Application message. Also converts values to other types if specified.
         * @function toObject
         * @memberof fqdp.Application
         * @static
         * @param {fqdp.Application} message Application
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Application.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.id = "";
                object.name = "";
                object.slug = "";
                object.description = "";
                object.status = options.enums === String ? "ENTITY_STATUS_UNSPECIFIED" : 0;
                object.metadataJson = "";
                object.teamId = "";
                object.teamName = "";
                object.workspaceId = "";
                object.workspaceName = "";
                object.organizationId = "";
                object.organizationName = "";
                object.projectCount = 0;
                object.createdBy = "";
                object.updatedBy = "";
                object.createdAt = "";
                object.updatedAt = "";
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.slug != null && message.hasOwnProperty("slug"))
                object.slug = message.slug;
            if (message.description != null && message.hasOwnProperty("description"))
                object.description = message.description;
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = options.enums === String ? $root.fqdp.EntityStatus[message.status] === undefined ? message.status : $root.fqdp.EntityStatus[message.status] : message.status;
            if (message.metadataJson != null && message.hasOwnProperty("metadataJson"))
                object.metadataJson = message.metadataJson;
            if (message.teamId != null && message.hasOwnProperty("teamId"))
                object.teamId = message.teamId;
            if (message.teamName != null && message.hasOwnProperty("teamName"))
                object.teamName = message.teamName;
            if (message.workspaceId != null && message.hasOwnProperty("workspaceId"))
                object.workspaceId = message.workspaceId;
            if (message.workspaceName != null && message.hasOwnProperty("workspaceName"))
                object.workspaceName = message.workspaceName;
            if (message.organizationId != null && message.hasOwnProperty("organizationId"))
                object.organizationId = message.organizationId;
            if (message.organizationName != null && message.hasOwnProperty("organizationName"))
                object.organizationName = message.organizationName;
            if (message.projectCount != null && message.hasOwnProperty("projectCount"))
                object.projectCount = message.projectCount;
            if (message.createdBy != null && message.hasOwnProperty("createdBy"))
                object.createdBy = message.createdBy;
            if (message.updatedBy != null && message.hasOwnProperty("updatedBy"))
                object.updatedBy = message.updatedBy;
            if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                object.createdAt = message.createdAt;
            if (message.updatedAt != null && message.hasOwnProperty("updatedAt"))
                object.updatedAt = message.updatedAt;
            return object;
        };

        /**
         * Converts this Application to JSON.
         * @function toJSON
         * @memberof fqdp.Application
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Application.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Application
         * @function getTypeUrl
         * @memberof fqdp.Application
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Application.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/fqdp.Application";
        };

        return Application;
    })();

    fqdp.ApplicationList = (function() {

        /**
         * Properties of an ApplicationList.
         * @memberof fqdp
         * @interface IApplicationList
         * @property {Array.<fqdp.IApplication>|null} [data] ApplicationList data
         * @property {fqdp.IPaginationMeta|null} [meta] ApplicationList meta
         */

        /**
         * Constructs a new ApplicationList.
         * @memberof fqdp
         * @classdesc Represents an ApplicationList.
         * @implements IApplicationList
         * @constructor
         * @param {fqdp.IApplicationList=} [properties] Properties to set
         */
        function ApplicationList(properties) {
            this.data = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ApplicationList data.
         * @member {Array.<fqdp.IApplication>} data
         * @memberof fqdp.ApplicationList
         * @instance
         */
        ApplicationList.prototype.data = $util.emptyArray;

        /**
         * ApplicationList meta.
         * @member {fqdp.IPaginationMeta|null|undefined} meta
         * @memberof fqdp.ApplicationList
         * @instance
         */
        ApplicationList.prototype.meta = null;

        /**
         * Creates a new ApplicationList instance using the specified properties.
         * @function create
         * @memberof fqdp.ApplicationList
         * @static
         * @param {fqdp.IApplicationList=} [properties] Properties to set
         * @returns {fqdp.ApplicationList} ApplicationList instance
         */
        ApplicationList.create = function create(properties) {
            return new ApplicationList(properties);
        };

        /**
         * Encodes the specified ApplicationList message. Does not implicitly {@link fqdp.ApplicationList.verify|verify} messages.
         * @function encode
         * @memberof fqdp.ApplicationList
         * @static
         * @param {fqdp.IApplicationList} message ApplicationList message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ApplicationList.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.data != null && message.data.length)
                for (let i = 0; i < message.data.length; ++i)
                    $root.fqdp.Application.encode(message.data[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.meta != null && Object.hasOwnProperty.call(message, "meta"))
                $root.fqdp.PaginationMeta.encode(message.meta, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified ApplicationList message, length delimited. Does not implicitly {@link fqdp.ApplicationList.verify|verify} messages.
         * @function encodeDelimited
         * @memberof fqdp.ApplicationList
         * @static
         * @param {fqdp.IApplicationList} message ApplicationList message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ApplicationList.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an ApplicationList message from the specified reader or buffer.
         * @function decode
         * @memberof fqdp.ApplicationList
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {fqdp.ApplicationList} ApplicationList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ApplicationList.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.fqdp.ApplicationList();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.data && message.data.length))
                            message.data = [];
                        message.data.push($root.fqdp.Application.decode(reader, reader.uint32()));
                        break;
                    }
                case 2: {
                        message.meta = $root.fqdp.PaginationMeta.decode(reader, reader.uint32());
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
         * Decodes an ApplicationList message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof fqdp.ApplicationList
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {fqdp.ApplicationList} ApplicationList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ApplicationList.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an ApplicationList message.
         * @function verify
         * @memberof fqdp.ApplicationList
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ApplicationList.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.data != null && message.hasOwnProperty("data")) {
                if (!Array.isArray(message.data))
                    return "data: array expected";
                for (let i = 0; i < message.data.length; ++i) {
                    let error = $root.fqdp.Application.verify(message.data[i]);
                    if (error)
                        return "data." + error;
                }
            }
            if (message.meta != null && message.hasOwnProperty("meta")) {
                let error = $root.fqdp.PaginationMeta.verify(message.meta);
                if (error)
                    return "meta." + error;
            }
            return null;
        };

        /**
         * Creates an ApplicationList message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof fqdp.ApplicationList
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {fqdp.ApplicationList} ApplicationList
         */
        ApplicationList.fromObject = function fromObject(object) {
            if (object instanceof $root.fqdp.ApplicationList)
                return object;
            let message = new $root.fqdp.ApplicationList();
            if (object.data) {
                if (!Array.isArray(object.data))
                    throw TypeError(".fqdp.ApplicationList.data: array expected");
                message.data = [];
                for (let i = 0; i < object.data.length; ++i) {
                    if (typeof object.data[i] !== "object")
                        throw TypeError(".fqdp.ApplicationList.data: object expected");
                    message.data[i] = $root.fqdp.Application.fromObject(object.data[i]);
                }
            }
            if (object.meta != null) {
                if (typeof object.meta !== "object")
                    throw TypeError(".fqdp.ApplicationList.meta: object expected");
                message.meta = $root.fqdp.PaginationMeta.fromObject(object.meta);
            }
            return message;
        };

        /**
         * Creates a plain object from an ApplicationList message. Also converts values to other types if specified.
         * @function toObject
         * @memberof fqdp.ApplicationList
         * @static
         * @param {fqdp.ApplicationList} message ApplicationList
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ApplicationList.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.data = [];
            if (options.defaults)
                object.meta = null;
            if (message.data && message.data.length) {
                object.data = [];
                for (let j = 0; j < message.data.length; ++j)
                    object.data[j] = $root.fqdp.Application.toObject(message.data[j], options);
            }
            if (message.meta != null && message.hasOwnProperty("meta"))
                object.meta = $root.fqdp.PaginationMeta.toObject(message.meta, options);
            return object;
        };

        /**
         * Converts this ApplicationList to JSON.
         * @function toJSON
         * @memberof fqdp.ApplicationList
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ApplicationList.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ApplicationList
         * @function getTypeUrl
         * @memberof fqdp.ApplicationList
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ApplicationList.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/fqdp.ApplicationList";
        };

        return ApplicationList;
    })();

    fqdp.CreateApplicationRequest = (function() {

        /**
         * Properties of a CreateApplicationRequest.
         * @memberof fqdp
         * @interface ICreateApplicationRequest
         * @property {string|null} [name] CreateApplicationRequest name
         * @property {string|null} [description] CreateApplicationRequest description
         * @property {string|null} [teamId] CreateApplicationRequest teamId
         * @property {string|null} [metadataJson] CreateApplicationRequest metadataJson
         */

        /**
         * Constructs a new CreateApplicationRequest.
         * @memberof fqdp
         * @classdesc Represents a CreateApplicationRequest.
         * @implements ICreateApplicationRequest
         * @constructor
         * @param {fqdp.ICreateApplicationRequest=} [properties] Properties to set
         */
        function CreateApplicationRequest(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * CreateApplicationRequest name.
         * @member {string} name
         * @memberof fqdp.CreateApplicationRequest
         * @instance
         */
        CreateApplicationRequest.prototype.name = "";

        /**
         * CreateApplicationRequest description.
         * @member {string} description
         * @memberof fqdp.CreateApplicationRequest
         * @instance
         */
        CreateApplicationRequest.prototype.description = "";

        /**
         * CreateApplicationRequest teamId.
         * @member {string} teamId
         * @memberof fqdp.CreateApplicationRequest
         * @instance
         */
        CreateApplicationRequest.prototype.teamId = "";

        /**
         * CreateApplicationRequest metadataJson.
         * @member {string} metadataJson
         * @memberof fqdp.CreateApplicationRequest
         * @instance
         */
        CreateApplicationRequest.prototype.metadataJson = "";

        /**
         * Creates a new CreateApplicationRequest instance using the specified properties.
         * @function create
         * @memberof fqdp.CreateApplicationRequest
         * @static
         * @param {fqdp.ICreateApplicationRequest=} [properties] Properties to set
         * @returns {fqdp.CreateApplicationRequest} CreateApplicationRequest instance
         */
        CreateApplicationRequest.create = function create(properties) {
            return new CreateApplicationRequest(properties);
        };

        /**
         * Encodes the specified CreateApplicationRequest message. Does not implicitly {@link fqdp.CreateApplicationRequest.verify|verify} messages.
         * @function encode
         * @memberof fqdp.CreateApplicationRequest
         * @static
         * @param {fqdp.ICreateApplicationRequest} message CreateApplicationRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CreateApplicationRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.description);
            if (message.teamId != null && Object.hasOwnProperty.call(message, "teamId"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.teamId);
            if (message.metadataJson != null && Object.hasOwnProperty.call(message, "metadataJson"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.metadataJson);
            return writer;
        };

        /**
         * Encodes the specified CreateApplicationRequest message, length delimited. Does not implicitly {@link fqdp.CreateApplicationRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof fqdp.CreateApplicationRequest
         * @static
         * @param {fqdp.ICreateApplicationRequest} message CreateApplicationRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CreateApplicationRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a CreateApplicationRequest message from the specified reader or buffer.
         * @function decode
         * @memberof fqdp.CreateApplicationRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {fqdp.CreateApplicationRequest} CreateApplicationRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CreateApplicationRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.fqdp.CreateApplicationRequest();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.name = reader.string();
                        break;
                    }
                case 3: {
                        message.description = reader.string();
                        break;
                    }
                case 4: {
                        message.teamId = reader.string();
                        break;
                    }
                case 5: {
                        message.metadataJson = reader.string();
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
         * Decodes a CreateApplicationRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof fqdp.CreateApplicationRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {fqdp.CreateApplicationRequest} CreateApplicationRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CreateApplicationRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a CreateApplicationRequest message.
         * @function verify
         * @memberof fqdp.CreateApplicationRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CreateApplicationRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.description != null && message.hasOwnProperty("description"))
                if (!$util.isString(message.description))
                    return "description: string expected";
            if (message.teamId != null && message.hasOwnProperty("teamId"))
                if (!$util.isString(message.teamId))
                    return "teamId: string expected";
            if (message.metadataJson != null && message.hasOwnProperty("metadataJson"))
                if (!$util.isString(message.metadataJson))
                    return "metadataJson: string expected";
            return null;
        };

        /**
         * Creates a CreateApplicationRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof fqdp.CreateApplicationRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {fqdp.CreateApplicationRequest} CreateApplicationRequest
         */
        CreateApplicationRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.fqdp.CreateApplicationRequest)
                return object;
            let message = new $root.fqdp.CreateApplicationRequest();
            if (object.name != null)
                message.name = String(object.name);
            if (object.description != null)
                message.description = String(object.description);
            if (object.teamId != null)
                message.teamId = String(object.teamId);
            if (object.metadataJson != null)
                message.metadataJson = String(object.metadataJson);
            return message;
        };

        /**
         * Creates a plain object from a CreateApplicationRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof fqdp.CreateApplicationRequest
         * @static
         * @param {fqdp.CreateApplicationRequest} message CreateApplicationRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CreateApplicationRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.name = "";
                object.description = "";
                object.teamId = "";
                object.metadataJson = "";
            }
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.description != null && message.hasOwnProperty("description"))
                object.description = message.description;
            if (message.teamId != null && message.hasOwnProperty("teamId"))
                object.teamId = message.teamId;
            if (message.metadataJson != null && message.hasOwnProperty("metadataJson"))
                object.metadataJson = message.metadataJson;
            return object;
        };

        /**
         * Converts this CreateApplicationRequest to JSON.
         * @function toJSON
         * @memberof fqdp.CreateApplicationRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CreateApplicationRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for CreateApplicationRequest
         * @function getTypeUrl
         * @memberof fqdp.CreateApplicationRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        CreateApplicationRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/fqdp.CreateApplicationRequest";
        };

        return CreateApplicationRequest;
    })();

    fqdp.UpdateApplicationRequest = (function() {

        /**
         * Properties of an UpdateApplicationRequest.
         * @memberof fqdp
         * @interface IUpdateApplicationRequest
         * @property {string|null} [name] UpdateApplicationRequest name
         * @property {string|null} [description] UpdateApplicationRequest description
         * @property {fqdp.EntityStatus|null} [status] UpdateApplicationRequest status
         * @property {string|null} [metadataJson] UpdateApplicationRequest metadataJson
         */

        /**
         * Constructs a new UpdateApplicationRequest.
         * @memberof fqdp
         * @classdesc Represents an UpdateApplicationRequest.
         * @implements IUpdateApplicationRequest
         * @constructor
         * @param {fqdp.IUpdateApplicationRequest=} [properties] Properties to set
         */
        function UpdateApplicationRequest(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * UpdateApplicationRequest name.
         * @member {string} name
         * @memberof fqdp.UpdateApplicationRequest
         * @instance
         */
        UpdateApplicationRequest.prototype.name = "";

        /**
         * UpdateApplicationRequest description.
         * @member {string} description
         * @memberof fqdp.UpdateApplicationRequest
         * @instance
         */
        UpdateApplicationRequest.prototype.description = "";

        /**
         * UpdateApplicationRequest status.
         * @member {fqdp.EntityStatus} status
         * @memberof fqdp.UpdateApplicationRequest
         * @instance
         */
        UpdateApplicationRequest.prototype.status = 0;

        /**
         * UpdateApplicationRequest metadataJson.
         * @member {string} metadataJson
         * @memberof fqdp.UpdateApplicationRequest
         * @instance
         */
        UpdateApplicationRequest.prototype.metadataJson = "";

        /**
         * Creates a new UpdateApplicationRequest instance using the specified properties.
         * @function create
         * @memberof fqdp.UpdateApplicationRequest
         * @static
         * @param {fqdp.IUpdateApplicationRequest=} [properties] Properties to set
         * @returns {fqdp.UpdateApplicationRequest} UpdateApplicationRequest instance
         */
        UpdateApplicationRequest.create = function create(properties) {
            return new UpdateApplicationRequest(properties);
        };

        /**
         * Encodes the specified UpdateApplicationRequest message. Does not implicitly {@link fqdp.UpdateApplicationRequest.verify|verify} messages.
         * @function encode
         * @memberof fqdp.UpdateApplicationRequest
         * @static
         * @param {fqdp.IUpdateApplicationRequest} message UpdateApplicationRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UpdateApplicationRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.description);
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 4, wireType 0 =*/32).int32(message.status);
            if (message.metadataJson != null && Object.hasOwnProperty.call(message, "metadataJson"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.metadataJson);
            return writer;
        };

        /**
         * Encodes the specified UpdateApplicationRequest message, length delimited. Does not implicitly {@link fqdp.UpdateApplicationRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof fqdp.UpdateApplicationRequest
         * @static
         * @param {fqdp.IUpdateApplicationRequest} message UpdateApplicationRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UpdateApplicationRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an UpdateApplicationRequest message from the specified reader or buffer.
         * @function decode
         * @memberof fqdp.UpdateApplicationRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {fqdp.UpdateApplicationRequest} UpdateApplicationRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UpdateApplicationRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.fqdp.UpdateApplicationRequest();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.name = reader.string();
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
                        message.metadataJson = reader.string();
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
         * Decodes an UpdateApplicationRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof fqdp.UpdateApplicationRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {fqdp.UpdateApplicationRequest} UpdateApplicationRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UpdateApplicationRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an UpdateApplicationRequest message.
         * @function verify
         * @memberof fqdp.UpdateApplicationRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        UpdateApplicationRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.description != null && message.hasOwnProperty("description"))
                if (!$util.isString(message.description))
                    return "description: string expected";
            if (message.status != null && message.hasOwnProperty("status"))
                switch (message.status) {
                default:
                    return "status: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                    break;
                }
            if (message.metadataJson != null && message.hasOwnProperty("metadataJson"))
                if (!$util.isString(message.metadataJson))
                    return "metadataJson: string expected";
            return null;
        };

        /**
         * Creates an UpdateApplicationRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof fqdp.UpdateApplicationRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {fqdp.UpdateApplicationRequest} UpdateApplicationRequest
         */
        UpdateApplicationRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.fqdp.UpdateApplicationRequest)
                return object;
            let message = new $root.fqdp.UpdateApplicationRequest();
            if (object.name != null)
                message.name = String(object.name);
            if (object.description != null)
                message.description = String(object.description);
            switch (object.status) {
            default:
                if (typeof object.status === "number") {
                    message.status = object.status;
                    break;
                }
                break;
            case "ENTITY_STATUS_UNSPECIFIED":
            case 0:
                message.status = 0;
                break;
            case "ACTIVE":
            case 1:
                message.status = 1;
                break;
            case "INACTIVE":
            case 2:
                message.status = 2;
                break;
            case "ARCHIVED":
            case 3:
                message.status = 3;
                break;
            }
            if (object.metadataJson != null)
                message.metadataJson = String(object.metadataJson);
            return message;
        };

        /**
         * Creates a plain object from an UpdateApplicationRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof fqdp.UpdateApplicationRequest
         * @static
         * @param {fqdp.UpdateApplicationRequest} message UpdateApplicationRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        UpdateApplicationRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.name = "";
                object.description = "";
                object.status = options.enums === String ? "ENTITY_STATUS_UNSPECIFIED" : 0;
                object.metadataJson = "";
            }
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.description != null && message.hasOwnProperty("description"))
                object.description = message.description;
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = options.enums === String ? $root.fqdp.EntityStatus[message.status] === undefined ? message.status : $root.fqdp.EntityStatus[message.status] : message.status;
            if (message.metadataJson != null && message.hasOwnProperty("metadataJson"))
                object.metadataJson = message.metadataJson;
            return object;
        };

        /**
         * Converts this UpdateApplicationRequest to JSON.
         * @function toJSON
         * @memberof fqdp.UpdateApplicationRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        UpdateApplicationRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for UpdateApplicationRequest
         * @function getTypeUrl
         * @memberof fqdp.UpdateApplicationRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        UpdateApplicationRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/fqdp.UpdateApplicationRequest";
        };

        return UpdateApplicationRequest;
    })();

    /**
     * EntityStatus enum.
     * @name fqdp.EntityStatus
     * @enum {number}
     * @property {number} ENTITY_STATUS_UNSPECIFIED=0 ENTITY_STATUS_UNSPECIFIED value
     * @property {number} ACTIVE=1 ACTIVE value
     * @property {number} INACTIVE=2 INACTIVE value
     * @property {number} ARCHIVED=3 ARCHIVED value
     */
    fqdp.EntityStatus = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "ENTITY_STATUS_UNSPECIFIED"] = 0;
        values[valuesById[1] = "ACTIVE"] = 1;
        values[valuesById[2] = "INACTIVE"] = 2;
        values[valuesById[3] = "ARCHIVED"] = 3;
        return values;
    })();

    /**
     * ResourceType enum.
     * @name fqdp.ResourceType
     * @enum {number}
     * @property {number} RESOURCE_TYPE_UNSPECIFIED=0 RESOURCE_TYPE_UNSPECIFIED value
     * @property {number} FIGMA=1 FIGMA value
     * @property {number} SKETCH=2 SKETCH value
     * @property {number} XD=3 XD value
     * @property {number} PDF=4 PDF value
     * @property {number} IMAGE=5 IMAGE value
     * @property {number} CODE=6 CODE value
     * @property {number} DOCUMENT=7 DOCUMENT value
     * @property {number} OTHER=8 OTHER value
     */
    fqdp.ResourceType = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "RESOURCE_TYPE_UNSPECIFIED"] = 0;
        values[valuesById[1] = "FIGMA"] = 1;
        values[valuesById[2] = "SKETCH"] = 2;
        values[valuesById[3] = "XD"] = 3;
        values[valuesById[4] = "PDF"] = 4;
        values[valuesById[5] = "IMAGE"] = 5;
        values[valuesById[6] = "CODE"] = 6;
        values[valuesById[7] = "DOCUMENT"] = 7;
        values[valuesById[8] = "OTHER"] = 8;
        return values;
    })();

    /**
     * ReferenceType enum.
     * @name fqdp.ReferenceType
     * @enum {number}
     * @property {number} REFERENCE_TYPE_UNSPECIFIED=0 REFERENCE_TYPE_UNSPECIFIED value
     * @property {number} SERVICE=1 SERVICE value
     * @property {number} PAGE=2 PAGE value
     * @property {number} COMPONENT=3 COMPONENT value
     * @property {number} REPOSITORY=4 REPOSITORY value
     */
    fqdp.ReferenceType = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "REFERENCE_TYPE_UNSPECIFIED"] = 0;
        values[valuesById[1] = "SERVICE"] = 1;
        values[valuesById[2] = "PAGE"] = 2;
        values[valuesById[3] = "COMPONENT"] = 3;
        values[valuesById[4] = "REPOSITORY"] = 4;
        return values;
    })();

    fqdp.Metadata = (function() {

        /**
         * Properties of a Metadata.
         * @memberof fqdp
         * @interface IMetadata
         * @property {string|null} [key] Metadata key
         * @property {string|null} [value] Metadata value
         */

        /**
         * Constructs a new Metadata.
         * @memberof fqdp
         * @classdesc Represents a Metadata.
         * @implements IMetadata
         * @constructor
         * @param {fqdp.IMetadata=} [properties] Properties to set
         */
        function Metadata(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Metadata key.
         * @member {string} key
         * @memberof fqdp.Metadata
         * @instance
         */
        Metadata.prototype.key = "";

        /**
         * Metadata value.
         * @member {string} value
         * @memberof fqdp.Metadata
         * @instance
         */
        Metadata.prototype.value = "";

        /**
         * Creates a new Metadata instance using the specified properties.
         * @function create
         * @memberof fqdp.Metadata
         * @static
         * @param {fqdp.IMetadata=} [properties] Properties to set
         * @returns {fqdp.Metadata} Metadata instance
         */
        Metadata.create = function create(properties) {
            return new Metadata(properties);
        };

        /**
         * Encodes the specified Metadata message. Does not implicitly {@link fqdp.Metadata.verify|verify} messages.
         * @function encode
         * @memberof fqdp.Metadata
         * @static
         * @param {fqdp.IMetadata} message Metadata message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Metadata.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.key != null && Object.hasOwnProperty.call(message, "key"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.key);
            if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.value);
            return writer;
        };

        /**
         * Encodes the specified Metadata message, length delimited. Does not implicitly {@link fqdp.Metadata.verify|verify} messages.
         * @function encodeDelimited
         * @memberof fqdp.Metadata
         * @static
         * @param {fqdp.IMetadata} message Metadata message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Metadata.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Metadata message from the specified reader or buffer.
         * @function decode
         * @memberof fqdp.Metadata
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {fqdp.Metadata} Metadata
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Metadata.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.fqdp.Metadata();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.key = reader.string();
                        break;
                    }
                case 2: {
                        message.value = reader.string();
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
         * Decodes a Metadata message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof fqdp.Metadata
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {fqdp.Metadata} Metadata
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Metadata.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Metadata message.
         * @function verify
         * @memberof fqdp.Metadata
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Metadata.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.key != null && message.hasOwnProperty("key"))
                if (!$util.isString(message.key))
                    return "key: string expected";
            if (message.value != null && message.hasOwnProperty("value"))
                if (!$util.isString(message.value))
                    return "value: string expected";
            return null;
        };

        /**
         * Creates a Metadata message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof fqdp.Metadata
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {fqdp.Metadata} Metadata
         */
        Metadata.fromObject = function fromObject(object) {
            if (object instanceof $root.fqdp.Metadata)
                return object;
            let message = new $root.fqdp.Metadata();
            if (object.key != null)
                message.key = String(object.key);
            if (object.value != null)
                message.value = String(object.value);
            return message;
        };

        /**
         * Creates a plain object from a Metadata message. Also converts values to other types if specified.
         * @function toObject
         * @memberof fqdp.Metadata
         * @static
         * @param {fqdp.Metadata} message Metadata
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Metadata.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.key = "";
                object.value = "";
            }
            if (message.key != null && message.hasOwnProperty("key"))
                object.key = message.key;
            if (message.value != null && message.hasOwnProperty("value"))
                object.value = message.value;
            return object;
        };

        /**
         * Converts this Metadata to JSON.
         * @function toJSON
         * @memberof fqdp.Metadata
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Metadata.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Metadata
         * @function getTypeUrl
         * @memberof fqdp.Metadata
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Metadata.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/fqdp.Metadata";
        };

        return Metadata;
    })();

    fqdp.PaginationMeta = (function() {

        /**
         * Properties of a PaginationMeta.
         * @memberof fqdp
         * @interface IPaginationMeta
         * @property {number|null} [total] PaginationMeta total
         * @property {number|null} [page] PaginationMeta page
         * @property {number|null} [limit] PaginationMeta limit
         * @property {number|null} [totalPages] PaginationMeta totalPages
         */

        /**
         * Constructs a new PaginationMeta.
         * @memberof fqdp
         * @classdesc Represents a PaginationMeta.
         * @implements IPaginationMeta
         * @constructor
         * @param {fqdp.IPaginationMeta=} [properties] Properties to set
         */
        function PaginationMeta(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PaginationMeta total.
         * @member {number} total
         * @memberof fqdp.PaginationMeta
         * @instance
         */
        PaginationMeta.prototype.total = 0;

        /**
         * PaginationMeta page.
         * @member {number} page
         * @memberof fqdp.PaginationMeta
         * @instance
         */
        PaginationMeta.prototype.page = 0;

        /**
         * PaginationMeta limit.
         * @member {number} limit
         * @memberof fqdp.PaginationMeta
         * @instance
         */
        PaginationMeta.prototype.limit = 0;

        /**
         * PaginationMeta totalPages.
         * @member {number} totalPages
         * @memberof fqdp.PaginationMeta
         * @instance
         */
        PaginationMeta.prototype.totalPages = 0;

        /**
         * Creates a new PaginationMeta instance using the specified properties.
         * @function create
         * @memberof fqdp.PaginationMeta
         * @static
         * @param {fqdp.IPaginationMeta=} [properties] Properties to set
         * @returns {fqdp.PaginationMeta} PaginationMeta instance
         */
        PaginationMeta.create = function create(properties) {
            return new PaginationMeta(properties);
        };

        /**
         * Encodes the specified PaginationMeta message. Does not implicitly {@link fqdp.PaginationMeta.verify|verify} messages.
         * @function encode
         * @memberof fqdp.PaginationMeta
         * @static
         * @param {fqdp.IPaginationMeta} message PaginationMeta message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PaginationMeta.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.total != null && Object.hasOwnProperty.call(message, "total"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.total);
            if (message.page != null && Object.hasOwnProperty.call(message, "page"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.page);
            if (message.limit != null && Object.hasOwnProperty.call(message, "limit"))
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.limit);
            if (message.totalPages != null && Object.hasOwnProperty.call(message, "totalPages"))
                writer.uint32(/* id 4, wireType 0 =*/32).int32(message.totalPages);
            return writer;
        };

        /**
         * Encodes the specified PaginationMeta message, length delimited. Does not implicitly {@link fqdp.PaginationMeta.verify|verify} messages.
         * @function encodeDelimited
         * @memberof fqdp.PaginationMeta
         * @static
         * @param {fqdp.IPaginationMeta} message PaginationMeta message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PaginationMeta.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PaginationMeta message from the specified reader or buffer.
         * @function decode
         * @memberof fqdp.PaginationMeta
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {fqdp.PaginationMeta} PaginationMeta
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PaginationMeta.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.fqdp.PaginationMeta();
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
                        message.page = reader.int32();
                        break;
                    }
                case 3: {
                        message.limit = reader.int32();
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
         * Decodes a PaginationMeta message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof fqdp.PaginationMeta
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {fqdp.PaginationMeta} PaginationMeta
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PaginationMeta.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PaginationMeta message.
         * @function verify
         * @memberof fqdp.PaginationMeta
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PaginationMeta.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.total != null && message.hasOwnProperty("total"))
                if (!$util.isInteger(message.total))
                    return "total: integer expected";
            if (message.page != null && message.hasOwnProperty("page"))
                if (!$util.isInteger(message.page))
                    return "page: integer expected";
            if (message.limit != null && message.hasOwnProperty("limit"))
                if (!$util.isInteger(message.limit))
                    return "limit: integer expected";
            if (message.totalPages != null && message.hasOwnProperty("totalPages"))
                if (!$util.isInteger(message.totalPages))
                    return "totalPages: integer expected";
            return null;
        };

        /**
         * Creates a PaginationMeta message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof fqdp.PaginationMeta
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {fqdp.PaginationMeta} PaginationMeta
         */
        PaginationMeta.fromObject = function fromObject(object) {
            if (object instanceof $root.fqdp.PaginationMeta)
                return object;
            let message = new $root.fqdp.PaginationMeta();
            if (object.total != null)
                message.total = object.total | 0;
            if (object.page != null)
                message.page = object.page | 0;
            if (object.limit != null)
                message.limit = object.limit | 0;
            if (object.totalPages != null)
                message.totalPages = object.totalPages | 0;
            return message;
        };

        /**
         * Creates a plain object from a PaginationMeta message. Also converts values to other types if specified.
         * @function toObject
         * @memberof fqdp.PaginationMeta
         * @static
         * @param {fqdp.PaginationMeta} message PaginationMeta
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PaginationMeta.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.total = 0;
                object.page = 0;
                object.limit = 0;
                object.totalPages = 0;
            }
            if (message.total != null && message.hasOwnProperty("total"))
                object.total = message.total;
            if (message.page != null && message.hasOwnProperty("page"))
                object.page = message.page;
            if (message.limit != null && message.hasOwnProperty("limit"))
                object.limit = message.limit;
            if (message.totalPages != null && message.hasOwnProperty("totalPages"))
                object.totalPages = message.totalPages;
            return object;
        };

        /**
         * Converts this PaginationMeta to JSON.
         * @function toJSON
         * @memberof fqdp.PaginationMeta
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PaginationMeta.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PaginationMeta
         * @function getTypeUrl
         * @memberof fqdp.PaginationMeta
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PaginationMeta.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/fqdp.PaginationMeta";
        };

        return PaginationMeta;
    })();

    fqdp.Organization = (function() {

        /**
         * Properties of an Organization.
         * @memberof fqdp
         * @interface IOrganization
         * @property {string|null} [id] Organization id
         * @property {string|null} [name] Organization name
         * @property {string|null} [slug] Organization slug
         * @property {string|null} [description] Organization description
         * @property {fqdp.EntityStatus|null} [status] Organization status
         * @property {string|null} [metadataJson] Organization metadataJson
         * @property {number|null} [workspaceCount] Organization workspaceCount
         * @property {string|null} [createdBy] Organization createdBy
         * @property {string|null} [updatedBy] Organization updatedBy
         * @property {string|null} [createdAt] Organization createdAt
         * @property {string|null} [updatedAt] Organization updatedAt
         */

        /**
         * Constructs a new Organization.
         * @memberof fqdp
         * @classdesc Represents an Organization.
         * @implements IOrganization
         * @constructor
         * @param {fqdp.IOrganization=} [properties] Properties to set
         */
        function Organization(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Organization id.
         * @member {string} id
         * @memberof fqdp.Organization
         * @instance
         */
        Organization.prototype.id = "";

        /**
         * Organization name.
         * @member {string} name
         * @memberof fqdp.Organization
         * @instance
         */
        Organization.prototype.name = "";

        /**
         * Organization slug.
         * @member {string} slug
         * @memberof fqdp.Organization
         * @instance
         */
        Organization.prototype.slug = "";

        /**
         * Organization description.
         * @member {string} description
         * @memberof fqdp.Organization
         * @instance
         */
        Organization.prototype.description = "";

        /**
         * Organization status.
         * @member {fqdp.EntityStatus} status
         * @memberof fqdp.Organization
         * @instance
         */
        Organization.prototype.status = 0;

        /**
         * Organization metadataJson.
         * @member {string} metadataJson
         * @memberof fqdp.Organization
         * @instance
         */
        Organization.prototype.metadataJson = "";

        /**
         * Organization workspaceCount.
         * @member {number} workspaceCount
         * @memberof fqdp.Organization
         * @instance
         */
        Organization.prototype.workspaceCount = 0;

        /**
         * Organization createdBy.
         * @member {string} createdBy
         * @memberof fqdp.Organization
         * @instance
         */
        Organization.prototype.createdBy = "";

        /**
         * Organization updatedBy.
         * @member {string} updatedBy
         * @memberof fqdp.Organization
         * @instance
         */
        Organization.prototype.updatedBy = "";

        /**
         * Organization createdAt.
         * @member {string} createdAt
         * @memberof fqdp.Organization
         * @instance
         */
        Organization.prototype.createdAt = "";

        /**
         * Organization updatedAt.
         * @member {string} updatedAt
         * @memberof fqdp.Organization
         * @instance
         */
        Organization.prototype.updatedAt = "";

        /**
         * Creates a new Organization instance using the specified properties.
         * @function create
         * @memberof fqdp.Organization
         * @static
         * @param {fqdp.IOrganization=} [properties] Properties to set
         * @returns {fqdp.Organization} Organization instance
         */
        Organization.create = function create(properties) {
            return new Organization(properties);
        };

        /**
         * Encodes the specified Organization message. Does not implicitly {@link fqdp.Organization.verify|verify} messages.
         * @function encode
         * @memberof fqdp.Organization
         * @static
         * @param {fqdp.IOrganization} message Organization message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Organization.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
            if (message.slug != null && Object.hasOwnProperty.call(message, "slug"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.slug);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.description);
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 5, wireType 0 =*/40).int32(message.status);
            if (message.metadataJson != null && Object.hasOwnProperty.call(message, "metadataJson"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.metadataJson);
            if (message.workspaceCount != null && Object.hasOwnProperty.call(message, "workspaceCount"))
                writer.uint32(/* id 7, wireType 0 =*/56).int32(message.workspaceCount);
            if (message.createdBy != null && Object.hasOwnProperty.call(message, "createdBy"))
                writer.uint32(/* id 8, wireType 2 =*/66).string(message.createdBy);
            if (message.updatedBy != null && Object.hasOwnProperty.call(message, "updatedBy"))
                writer.uint32(/* id 9, wireType 2 =*/74).string(message.updatedBy);
            if (message.createdAt != null && Object.hasOwnProperty.call(message, "createdAt"))
                writer.uint32(/* id 10, wireType 2 =*/82).string(message.createdAt);
            if (message.updatedAt != null && Object.hasOwnProperty.call(message, "updatedAt"))
                writer.uint32(/* id 11, wireType 2 =*/90).string(message.updatedAt);
            return writer;
        };

        /**
         * Encodes the specified Organization message, length delimited. Does not implicitly {@link fqdp.Organization.verify|verify} messages.
         * @function encodeDelimited
         * @memberof fqdp.Organization
         * @static
         * @param {fqdp.IOrganization} message Organization message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Organization.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an Organization message from the specified reader or buffer.
         * @function decode
         * @memberof fqdp.Organization
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {fqdp.Organization} Organization
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Organization.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.fqdp.Organization();
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
                        message.slug = reader.string();
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
                        message.metadataJson = reader.string();
                        break;
                    }
                case 7: {
                        message.workspaceCount = reader.int32();
                        break;
                    }
                case 8: {
                        message.createdBy = reader.string();
                        break;
                    }
                case 9: {
                        message.updatedBy = reader.string();
                        break;
                    }
                case 10: {
                        message.createdAt = reader.string();
                        break;
                    }
                case 11: {
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
         * Decodes an Organization message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof fqdp.Organization
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {fqdp.Organization} Organization
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Organization.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Organization message.
         * @function verify
         * @memberof fqdp.Organization
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Organization.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.slug != null && message.hasOwnProperty("slug"))
                if (!$util.isString(message.slug))
                    return "slug: string expected";
            if (message.description != null && message.hasOwnProperty("description"))
                if (!$util.isString(message.description))
                    return "description: string expected";
            if (message.status != null && message.hasOwnProperty("status"))
                switch (message.status) {
                default:
                    return "status: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                    break;
                }
            if (message.metadataJson != null && message.hasOwnProperty("metadataJson"))
                if (!$util.isString(message.metadataJson))
                    return "metadataJson: string expected";
            if (message.workspaceCount != null && message.hasOwnProperty("workspaceCount"))
                if (!$util.isInteger(message.workspaceCount))
                    return "workspaceCount: integer expected";
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
            return null;
        };

        /**
         * Creates an Organization message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof fqdp.Organization
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {fqdp.Organization} Organization
         */
        Organization.fromObject = function fromObject(object) {
            if (object instanceof $root.fqdp.Organization)
                return object;
            let message = new $root.fqdp.Organization();
            if (object.id != null)
                message.id = String(object.id);
            if (object.name != null)
                message.name = String(object.name);
            if (object.slug != null)
                message.slug = String(object.slug);
            if (object.description != null)
                message.description = String(object.description);
            switch (object.status) {
            default:
                if (typeof object.status === "number") {
                    message.status = object.status;
                    break;
                }
                break;
            case "ENTITY_STATUS_UNSPECIFIED":
            case 0:
                message.status = 0;
                break;
            case "ACTIVE":
            case 1:
                message.status = 1;
                break;
            case "INACTIVE":
            case 2:
                message.status = 2;
                break;
            case "ARCHIVED":
            case 3:
                message.status = 3;
                break;
            }
            if (object.metadataJson != null)
                message.metadataJson = String(object.metadataJson);
            if (object.workspaceCount != null)
                message.workspaceCount = object.workspaceCount | 0;
            if (object.createdBy != null)
                message.createdBy = String(object.createdBy);
            if (object.updatedBy != null)
                message.updatedBy = String(object.updatedBy);
            if (object.createdAt != null)
                message.createdAt = String(object.createdAt);
            if (object.updatedAt != null)
                message.updatedAt = String(object.updatedAt);
            return message;
        };

        /**
         * Creates a plain object from an Organization message. Also converts values to other types if specified.
         * @function toObject
         * @memberof fqdp.Organization
         * @static
         * @param {fqdp.Organization} message Organization
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Organization.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.id = "";
                object.name = "";
                object.slug = "";
                object.description = "";
                object.status = options.enums === String ? "ENTITY_STATUS_UNSPECIFIED" : 0;
                object.metadataJson = "";
                object.workspaceCount = 0;
                object.createdBy = "";
                object.updatedBy = "";
                object.createdAt = "";
                object.updatedAt = "";
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.slug != null && message.hasOwnProperty("slug"))
                object.slug = message.slug;
            if (message.description != null && message.hasOwnProperty("description"))
                object.description = message.description;
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = options.enums === String ? $root.fqdp.EntityStatus[message.status] === undefined ? message.status : $root.fqdp.EntityStatus[message.status] : message.status;
            if (message.metadataJson != null && message.hasOwnProperty("metadataJson"))
                object.metadataJson = message.metadataJson;
            if (message.workspaceCount != null && message.hasOwnProperty("workspaceCount"))
                object.workspaceCount = message.workspaceCount;
            if (message.createdBy != null && message.hasOwnProperty("createdBy"))
                object.createdBy = message.createdBy;
            if (message.updatedBy != null && message.hasOwnProperty("updatedBy"))
                object.updatedBy = message.updatedBy;
            if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                object.createdAt = message.createdAt;
            if (message.updatedAt != null && message.hasOwnProperty("updatedAt"))
                object.updatedAt = message.updatedAt;
            return object;
        };

        /**
         * Converts this Organization to JSON.
         * @function toJSON
         * @memberof fqdp.Organization
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Organization.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Organization
         * @function getTypeUrl
         * @memberof fqdp.Organization
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Organization.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/fqdp.Organization";
        };

        return Organization;
    })();

    fqdp.OrganizationList = (function() {

        /**
         * Properties of an OrganizationList.
         * @memberof fqdp
         * @interface IOrganizationList
         * @property {Array.<fqdp.IOrganization>|null} [data] OrganizationList data
         * @property {fqdp.IPaginationMeta|null} [meta] OrganizationList meta
         */

        /**
         * Constructs a new OrganizationList.
         * @memberof fqdp
         * @classdesc Represents an OrganizationList.
         * @implements IOrganizationList
         * @constructor
         * @param {fqdp.IOrganizationList=} [properties] Properties to set
         */
        function OrganizationList(properties) {
            this.data = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * OrganizationList data.
         * @member {Array.<fqdp.IOrganization>} data
         * @memberof fqdp.OrganizationList
         * @instance
         */
        OrganizationList.prototype.data = $util.emptyArray;

        /**
         * OrganizationList meta.
         * @member {fqdp.IPaginationMeta|null|undefined} meta
         * @memberof fqdp.OrganizationList
         * @instance
         */
        OrganizationList.prototype.meta = null;

        /**
         * Creates a new OrganizationList instance using the specified properties.
         * @function create
         * @memberof fqdp.OrganizationList
         * @static
         * @param {fqdp.IOrganizationList=} [properties] Properties to set
         * @returns {fqdp.OrganizationList} OrganizationList instance
         */
        OrganizationList.create = function create(properties) {
            return new OrganizationList(properties);
        };

        /**
         * Encodes the specified OrganizationList message. Does not implicitly {@link fqdp.OrganizationList.verify|verify} messages.
         * @function encode
         * @memberof fqdp.OrganizationList
         * @static
         * @param {fqdp.IOrganizationList} message OrganizationList message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        OrganizationList.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.data != null && message.data.length)
                for (let i = 0; i < message.data.length; ++i)
                    $root.fqdp.Organization.encode(message.data[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.meta != null && Object.hasOwnProperty.call(message, "meta"))
                $root.fqdp.PaginationMeta.encode(message.meta, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified OrganizationList message, length delimited. Does not implicitly {@link fqdp.OrganizationList.verify|verify} messages.
         * @function encodeDelimited
         * @memberof fqdp.OrganizationList
         * @static
         * @param {fqdp.IOrganizationList} message OrganizationList message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        OrganizationList.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an OrganizationList message from the specified reader or buffer.
         * @function decode
         * @memberof fqdp.OrganizationList
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {fqdp.OrganizationList} OrganizationList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        OrganizationList.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.fqdp.OrganizationList();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.data && message.data.length))
                            message.data = [];
                        message.data.push($root.fqdp.Organization.decode(reader, reader.uint32()));
                        break;
                    }
                case 2: {
                        message.meta = $root.fqdp.PaginationMeta.decode(reader, reader.uint32());
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
         * Decodes an OrganizationList message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof fqdp.OrganizationList
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {fqdp.OrganizationList} OrganizationList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        OrganizationList.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an OrganizationList message.
         * @function verify
         * @memberof fqdp.OrganizationList
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        OrganizationList.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.data != null && message.hasOwnProperty("data")) {
                if (!Array.isArray(message.data))
                    return "data: array expected";
                for (let i = 0; i < message.data.length; ++i) {
                    let error = $root.fqdp.Organization.verify(message.data[i]);
                    if (error)
                        return "data." + error;
                }
            }
            if (message.meta != null && message.hasOwnProperty("meta")) {
                let error = $root.fqdp.PaginationMeta.verify(message.meta);
                if (error)
                    return "meta." + error;
            }
            return null;
        };

        /**
         * Creates an OrganizationList message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof fqdp.OrganizationList
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {fqdp.OrganizationList} OrganizationList
         */
        OrganizationList.fromObject = function fromObject(object) {
            if (object instanceof $root.fqdp.OrganizationList)
                return object;
            let message = new $root.fqdp.OrganizationList();
            if (object.data) {
                if (!Array.isArray(object.data))
                    throw TypeError(".fqdp.OrganizationList.data: array expected");
                message.data = [];
                for (let i = 0; i < object.data.length; ++i) {
                    if (typeof object.data[i] !== "object")
                        throw TypeError(".fqdp.OrganizationList.data: object expected");
                    message.data[i] = $root.fqdp.Organization.fromObject(object.data[i]);
                }
            }
            if (object.meta != null) {
                if (typeof object.meta !== "object")
                    throw TypeError(".fqdp.OrganizationList.meta: object expected");
                message.meta = $root.fqdp.PaginationMeta.fromObject(object.meta);
            }
            return message;
        };

        /**
         * Creates a plain object from an OrganizationList message. Also converts values to other types if specified.
         * @function toObject
         * @memberof fqdp.OrganizationList
         * @static
         * @param {fqdp.OrganizationList} message OrganizationList
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        OrganizationList.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.data = [];
            if (options.defaults)
                object.meta = null;
            if (message.data && message.data.length) {
                object.data = [];
                for (let j = 0; j < message.data.length; ++j)
                    object.data[j] = $root.fqdp.Organization.toObject(message.data[j], options);
            }
            if (message.meta != null && message.hasOwnProperty("meta"))
                object.meta = $root.fqdp.PaginationMeta.toObject(message.meta, options);
            return object;
        };

        /**
         * Converts this OrganizationList to JSON.
         * @function toJSON
         * @memberof fqdp.OrganizationList
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        OrganizationList.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for OrganizationList
         * @function getTypeUrl
         * @memberof fqdp.OrganizationList
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        OrganizationList.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/fqdp.OrganizationList";
        };

        return OrganizationList;
    })();

    fqdp.CreateOrganizationRequest = (function() {

        /**
         * Properties of a CreateOrganizationRequest.
         * @memberof fqdp
         * @interface ICreateOrganizationRequest
         * @property {string|null} [name] CreateOrganizationRequest name
         * @property {string|null} [description] CreateOrganizationRequest description
         * @property {string|null} [metadataJson] CreateOrganizationRequest metadataJson
         */

        /**
         * Constructs a new CreateOrganizationRequest.
         * @memberof fqdp
         * @classdesc Represents a CreateOrganizationRequest.
         * @implements ICreateOrganizationRequest
         * @constructor
         * @param {fqdp.ICreateOrganizationRequest=} [properties] Properties to set
         */
        function CreateOrganizationRequest(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * CreateOrganizationRequest name.
         * @member {string} name
         * @memberof fqdp.CreateOrganizationRequest
         * @instance
         */
        CreateOrganizationRequest.prototype.name = "";

        /**
         * CreateOrganizationRequest description.
         * @member {string} description
         * @memberof fqdp.CreateOrganizationRequest
         * @instance
         */
        CreateOrganizationRequest.prototype.description = "";

        /**
         * CreateOrganizationRequest metadataJson.
         * @member {string} metadataJson
         * @memberof fqdp.CreateOrganizationRequest
         * @instance
         */
        CreateOrganizationRequest.prototype.metadataJson = "";

        /**
         * Creates a new CreateOrganizationRequest instance using the specified properties.
         * @function create
         * @memberof fqdp.CreateOrganizationRequest
         * @static
         * @param {fqdp.ICreateOrganizationRequest=} [properties] Properties to set
         * @returns {fqdp.CreateOrganizationRequest} CreateOrganizationRequest instance
         */
        CreateOrganizationRequest.create = function create(properties) {
            return new CreateOrganizationRequest(properties);
        };

        /**
         * Encodes the specified CreateOrganizationRequest message. Does not implicitly {@link fqdp.CreateOrganizationRequest.verify|verify} messages.
         * @function encode
         * @memberof fqdp.CreateOrganizationRequest
         * @static
         * @param {fqdp.ICreateOrganizationRequest} message CreateOrganizationRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CreateOrganizationRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.description);
            if (message.metadataJson != null && Object.hasOwnProperty.call(message, "metadataJson"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.metadataJson);
            return writer;
        };

        /**
         * Encodes the specified CreateOrganizationRequest message, length delimited. Does not implicitly {@link fqdp.CreateOrganizationRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof fqdp.CreateOrganizationRequest
         * @static
         * @param {fqdp.ICreateOrganizationRequest} message CreateOrganizationRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CreateOrganizationRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a CreateOrganizationRequest message from the specified reader or buffer.
         * @function decode
         * @memberof fqdp.CreateOrganizationRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {fqdp.CreateOrganizationRequest} CreateOrganizationRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CreateOrganizationRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.fqdp.CreateOrganizationRequest();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.name = reader.string();
                        break;
                    }
                case 3: {
                        message.description = reader.string();
                        break;
                    }
                case 4: {
                        message.metadataJson = reader.string();
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
         * Decodes a CreateOrganizationRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof fqdp.CreateOrganizationRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {fqdp.CreateOrganizationRequest} CreateOrganizationRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CreateOrganizationRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a CreateOrganizationRequest message.
         * @function verify
         * @memberof fqdp.CreateOrganizationRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CreateOrganizationRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.description != null && message.hasOwnProperty("description"))
                if (!$util.isString(message.description))
                    return "description: string expected";
            if (message.metadataJson != null && message.hasOwnProperty("metadataJson"))
                if (!$util.isString(message.metadataJson))
                    return "metadataJson: string expected";
            return null;
        };

        /**
         * Creates a CreateOrganizationRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof fqdp.CreateOrganizationRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {fqdp.CreateOrganizationRequest} CreateOrganizationRequest
         */
        CreateOrganizationRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.fqdp.CreateOrganizationRequest)
                return object;
            let message = new $root.fqdp.CreateOrganizationRequest();
            if (object.name != null)
                message.name = String(object.name);
            if (object.description != null)
                message.description = String(object.description);
            if (object.metadataJson != null)
                message.metadataJson = String(object.metadataJson);
            return message;
        };

        /**
         * Creates a plain object from a CreateOrganizationRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof fqdp.CreateOrganizationRequest
         * @static
         * @param {fqdp.CreateOrganizationRequest} message CreateOrganizationRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CreateOrganizationRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.name = "";
                object.description = "";
                object.metadataJson = "";
            }
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.description != null && message.hasOwnProperty("description"))
                object.description = message.description;
            if (message.metadataJson != null && message.hasOwnProperty("metadataJson"))
                object.metadataJson = message.metadataJson;
            return object;
        };

        /**
         * Converts this CreateOrganizationRequest to JSON.
         * @function toJSON
         * @memberof fqdp.CreateOrganizationRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CreateOrganizationRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for CreateOrganizationRequest
         * @function getTypeUrl
         * @memberof fqdp.CreateOrganizationRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        CreateOrganizationRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/fqdp.CreateOrganizationRequest";
        };

        return CreateOrganizationRequest;
    })();

    fqdp.UpdateOrganizationRequest = (function() {

        /**
         * Properties of an UpdateOrganizationRequest.
         * @memberof fqdp
         * @interface IUpdateOrganizationRequest
         * @property {string|null} [name] UpdateOrganizationRequest name
         * @property {string|null} [description] UpdateOrganizationRequest description
         * @property {fqdp.EntityStatus|null} [status] UpdateOrganizationRequest status
         * @property {string|null} [metadataJson] UpdateOrganizationRequest metadataJson
         */

        /**
         * Constructs a new UpdateOrganizationRequest.
         * @memberof fqdp
         * @classdesc Represents an UpdateOrganizationRequest.
         * @implements IUpdateOrganizationRequest
         * @constructor
         * @param {fqdp.IUpdateOrganizationRequest=} [properties] Properties to set
         */
        function UpdateOrganizationRequest(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * UpdateOrganizationRequest name.
         * @member {string} name
         * @memberof fqdp.UpdateOrganizationRequest
         * @instance
         */
        UpdateOrganizationRequest.prototype.name = "";

        /**
         * UpdateOrganizationRequest description.
         * @member {string} description
         * @memberof fqdp.UpdateOrganizationRequest
         * @instance
         */
        UpdateOrganizationRequest.prototype.description = "";

        /**
         * UpdateOrganizationRequest status.
         * @member {fqdp.EntityStatus} status
         * @memberof fqdp.UpdateOrganizationRequest
         * @instance
         */
        UpdateOrganizationRequest.prototype.status = 0;

        /**
         * UpdateOrganizationRequest metadataJson.
         * @member {string} metadataJson
         * @memberof fqdp.UpdateOrganizationRequest
         * @instance
         */
        UpdateOrganizationRequest.prototype.metadataJson = "";

        /**
         * Creates a new UpdateOrganizationRequest instance using the specified properties.
         * @function create
         * @memberof fqdp.UpdateOrganizationRequest
         * @static
         * @param {fqdp.IUpdateOrganizationRequest=} [properties] Properties to set
         * @returns {fqdp.UpdateOrganizationRequest} UpdateOrganizationRequest instance
         */
        UpdateOrganizationRequest.create = function create(properties) {
            return new UpdateOrganizationRequest(properties);
        };

        /**
         * Encodes the specified UpdateOrganizationRequest message. Does not implicitly {@link fqdp.UpdateOrganizationRequest.verify|verify} messages.
         * @function encode
         * @memberof fqdp.UpdateOrganizationRequest
         * @static
         * @param {fqdp.IUpdateOrganizationRequest} message UpdateOrganizationRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UpdateOrganizationRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.description);
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 4, wireType 0 =*/32).int32(message.status);
            if (message.metadataJson != null && Object.hasOwnProperty.call(message, "metadataJson"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.metadataJson);
            return writer;
        };

        /**
         * Encodes the specified UpdateOrganizationRequest message, length delimited. Does not implicitly {@link fqdp.UpdateOrganizationRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof fqdp.UpdateOrganizationRequest
         * @static
         * @param {fqdp.IUpdateOrganizationRequest} message UpdateOrganizationRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UpdateOrganizationRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an UpdateOrganizationRequest message from the specified reader or buffer.
         * @function decode
         * @memberof fqdp.UpdateOrganizationRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {fqdp.UpdateOrganizationRequest} UpdateOrganizationRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UpdateOrganizationRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.fqdp.UpdateOrganizationRequest();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.name = reader.string();
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
                        message.metadataJson = reader.string();
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
         * Decodes an UpdateOrganizationRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof fqdp.UpdateOrganizationRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {fqdp.UpdateOrganizationRequest} UpdateOrganizationRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UpdateOrganizationRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an UpdateOrganizationRequest message.
         * @function verify
         * @memberof fqdp.UpdateOrganizationRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        UpdateOrganizationRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.description != null && message.hasOwnProperty("description"))
                if (!$util.isString(message.description))
                    return "description: string expected";
            if (message.status != null && message.hasOwnProperty("status"))
                switch (message.status) {
                default:
                    return "status: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                    break;
                }
            if (message.metadataJson != null && message.hasOwnProperty("metadataJson"))
                if (!$util.isString(message.metadataJson))
                    return "metadataJson: string expected";
            return null;
        };

        /**
         * Creates an UpdateOrganizationRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof fqdp.UpdateOrganizationRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {fqdp.UpdateOrganizationRequest} UpdateOrganizationRequest
         */
        UpdateOrganizationRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.fqdp.UpdateOrganizationRequest)
                return object;
            let message = new $root.fqdp.UpdateOrganizationRequest();
            if (object.name != null)
                message.name = String(object.name);
            if (object.description != null)
                message.description = String(object.description);
            switch (object.status) {
            default:
                if (typeof object.status === "number") {
                    message.status = object.status;
                    break;
                }
                break;
            case "ENTITY_STATUS_UNSPECIFIED":
            case 0:
                message.status = 0;
                break;
            case "ACTIVE":
            case 1:
                message.status = 1;
                break;
            case "INACTIVE":
            case 2:
                message.status = 2;
                break;
            case "ARCHIVED":
            case 3:
                message.status = 3;
                break;
            }
            if (object.metadataJson != null)
                message.metadataJson = String(object.metadataJson);
            return message;
        };

        /**
         * Creates a plain object from an UpdateOrganizationRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof fqdp.UpdateOrganizationRequest
         * @static
         * @param {fqdp.UpdateOrganizationRequest} message UpdateOrganizationRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        UpdateOrganizationRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.name = "";
                object.description = "";
                object.status = options.enums === String ? "ENTITY_STATUS_UNSPECIFIED" : 0;
                object.metadataJson = "";
            }
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.description != null && message.hasOwnProperty("description"))
                object.description = message.description;
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = options.enums === String ? $root.fqdp.EntityStatus[message.status] === undefined ? message.status : $root.fqdp.EntityStatus[message.status] : message.status;
            if (message.metadataJson != null && message.hasOwnProperty("metadataJson"))
                object.metadataJson = message.metadataJson;
            return object;
        };

        /**
         * Converts this UpdateOrganizationRequest to JSON.
         * @function toJSON
         * @memberof fqdp.UpdateOrganizationRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        UpdateOrganizationRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for UpdateOrganizationRequest
         * @function getTypeUrl
         * @memberof fqdp.UpdateOrganizationRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        UpdateOrganizationRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/fqdp.UpdateOrganizationRequest";
        };

        return UpdateOrganizationRequest;
    })();

    fqdp.Project = (function() {

        /**
         * Properties of a Project.
         * @memberof fqdp
         * @interface IProject
         * @property {string|null} [id] Project id
         * @property {string|null} [name] Project name
         * @property {string|null} [slug] Project slug
         * @property {string|null} [description] Project description
         * @property {fqdp.EntityStatus|null} [status] Project status
         * @property {string|null} [metadataJson] Project metadataJson
         * @property {string|null} [applicationId] Project applicationId
         * @property {string|null} [applicationName] Project applicationName
         * @property {string|null} [teamId] Project teamId
         * @property {string|null} [teamName] Project teamName
         * @property {string|null} [workspaceId] Project workspaceId
         * @property {string|null} [workspaceName] Project workspaceName
         * @property {string|null} [organizationId] Project organizationId
         * @property {string|null} [organizationName] Project organizationName
         * @property {number|null} [resourceCount] Project resourceCount
         * @property {string|null} [createdBy] Project createdBy
         * @property {string|null} [updatedBy] Project updatedBy
         * @property {string|null} [createdAt] Project createdAt
         * @property {string|null} [updatedAt] Project updatedAt
         */

        /**
         * Constructs a new Project.
         * @memberof fqdp
         * @classdesc Represents a Project.
         * @implements IProject
         * @constructor
         * @param {fqdp.IProject=} [properties] Properties to set
         */
        function Project(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Project id.
         * @member {string} id
         * @memberof fqdp.Project
         * @instance
         */
        Project.prototype.id = "";

        /**
         * Project name.
         * @member {string} name
         * @memberof fqdp.Project
         * @instance
         */
        Project.prototype.name = "";

        /**
         * Project slug.
         * @member {string} slug
         * @memberof fqdp.Project
         * @instance
         */
        Project.prototype.slug = "";

        /**
         * Project description.
         * @member {string} description
         * @memberof fqdp.Project
         * @instance
         */
        Project.prototype.description = "";

        /**
         * Project status.
         * @member {fqdp.EntityStatus} status
         * @memberof fqdp.Project
         * @instance
         */
        Project.prototype.status = 0;

        /**
         * Project metadataJson.
         * @member {string} metadataJson
         * @memberof fqdp.Project
         * @instance
         */
        Project.prototype.metadataJson = "";

        /**
         * Project applicationId.
         * @member {string} applicationId
         * @memberof fqdp.Project
         * @instance
         */
        Project.prototype.applicationId = "";

        /**
         * Project applicationName.
         * @member {string} applicationName
         * @memberof fqdp.Project
         * @instance
         */
        Project.prototype.applicationName = "";

        /**
         * Project teamId.
         * @member {string} teamId
         * @memberof fqdp.Project
         * @instance
         */
        Project.prototype.teamId = "";

        /**
         * Project teamName.
         * @member {string} teamName
         * @memberof fqdp.Project
         * @instance
         */
        Project.prototype.teamName = "";

        /**
         * Project workspaceId.
         * @member {string} workspaceId
         * @memberof fqdp.Project
         * @instance
         */
        Project.prototype.workspaceId = "";

        /**
         * Project workspaceName.
         * @member {string} workspaceName
         * @memberof fqdp.Project
         * @instance
         */
        Project.prototype.workspaceName = "";

        /**
         * Project organizationId.
         * @member {string} organizationId
         * @memberof fqdp.Project
         * @instance
         */
        Project.prototype.organizationId = "";

        /**
         * Project organizationName.
         * @member {string} organizationName
         * @memberof fqdp.Project
         * @instance
         */
        Project.prototype.organizationName = "";

        /**
         * Project resourceCount.
         * @member {number} resourceCount
         * @memberof fqdp.Project
         * @instance
         */
        Project.prototype.resourceCount = 0;

        /**
         * Project createdBy.
         * @member {string} createdBy
         * @memberof fqdp.Project
         * @instance
         */
        Project.prototype.createdBy = "";

        /**
         * Project updatedBy.
         * @member {string} updatedBy
         * @memberof fqdp.Project
         * @instance
         */
        Project.prototype.updatedBy = "";

        /**
         * Project createdAt.
         * @member {string} createdAt
         * @memberof fqdp.Project
         * @instance
         */
        Project.prototype.createdAt = "";

        /**
         * Project updatedAt.
         * @member {string} updatedAt
         * @memberof fqdp.Project
         * @instance
         */
        Project.prototype.updatedAt = "";

        /**
         * Creates a new Project instance using the specified properties.
         * @function create
         * @memberof fqdp.Project
         * @static
         * @param {fqdp.IProject=} [properties] Properties to set
         * @returns {fqdp.Project} Project instance
         */
        Project.create = function create(properties) {
            return new Project(properties);
        };

        /**
         * Encodes the specified Project message. Does not implicitly {@link fqdp.Project.verify|verify} messages.
         * @function encode
         * @memberof fqdp.Project
         * @static
         * @param {fqdp.IProject} message Project message or plain object to encode
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
            if (message.slug != null && Object.hasOwnProperty.call(message, "slug"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.slug);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.description);
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 5, wireType 0 =*/40).int32(message.status);
            if (message.metadataJson != null && Object.hasOwnProperty.call(message, "metadataJson"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.metadataJson);
            if (message.applicationId != null && Object.hasOwnProperty.call(message, "applicationId"))
                writer.uint32(/* id 7, wireType 2 =*/58).string(message.applicationId);
            if (message.applicationName != null && Object.hasOwnProperty.call(message, "applicationName"))
                writer.uint32(/* id 8, wireType 2 =*/66).string(message.applicationName);
            if (message.teamId != null && Object.hasOwnProperty.call(message, "teamId"))
                writer.uint32(/* id 9, wireType 2 =*/74).string(message.teamId);
            if (message.teamName != null && Object.hasOwnProperty.call(message, "teamName"))
                writer.uint32(/* id 10, wireType 2 =*/82).string(message.teamName);
            if (message.workspaceId != null && Object.hasOwnProperty.call(message, "workspaceId"))
                writer.uint32(/* id 11, wireType 2 =*/90).string(message.workspaceId);
            if (message.workspaceName != null && Object.hasOwnProperty.call(message, "workspaceName"))
                writer.uint32(/* id 12, wireType 2 =*/98).string(message.workspaceName);
            if (message.organizationId != null && Object.hasOwnProperty.call(message, "organizationId"))
                writer.uint32(/* id 13, wireType 2 =*/106).string(message.organizationId);
            if (message.organizationName != null && Object.hasOwnProperty.call(message, "organizationName"))
                writer.uint32(/* id 14, wireType 2 =*/114).string(message.organizationName);
            if (message.resourceCount != null && Object.hasOwnProperty.call(message, "resourceCount"))
                writer.uint32(/* id 15, wireType 0 =*/120).int32(message.resourceCount);
            if (message.createdBy != null && Object.hasOwnProperty.call(message, "createdBy"))
                writer.uint32(/* id 16, wireType 2 =*/130).string(message.createdBy);
            if (message.updatedBy != null && Object.hasOwnProperty.call(message, "updatedBy"))
                writer.uint32(/* id 17, wireType 2 =*/138).string(message.updatedBy);
            if (message.createdAt != null && Object.hasOwnProperty.call(message, "createdAt"))
                writer.uint32(/* id 18, wireType 2 =*/146).string(message.createdAt);
            if (message.updatedAt != null && Object.hasOwnProperty.call(message, "updatedAt"))
                writer.uint32(/* id 19, wireType 2 =*/154).string(message.updatedAt);
            return writer;
        };

        /**
         * Encodes the specified Project message, length delimited. Does not implicitly {@link fqdp.Project.verify|verify} messages.
         * @function encodeDelimited
         * @memberof fqdp.Project
         * @static
         * @param {fqdp.IProject} message Project message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Project.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Project message from the specified reader or buffer.
         * @function decode
         * @memberof fqdp.Project
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {fqdp.Project} Project
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Project.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.fqdp.Project();
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
                        message.slug = reader.string();
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
                        message.metadataJson = reader.string();
                        break;
                    }
                case 7: {
                        message.applicationId = reader.string();
                        break;
                    }
                case 8: {
                        message.applicationName = reader.string();
                        break;
                    }
                case 9: {
                        message.teamId = reader.string();
                        break;
                    }
                case 10: {
                        message.teamName = reader.string();
                        break;
                    }
                case 11: {
                        message.workspaceId = reader.string();
                        break;
                    }
                case 12: {
                        message.workspaceName = reader.string();
                        break;
                    }
                case 13: {
                        message.organizationId = reader.string();
                        break;
                    }
                case 14: {
                        message.organizationName = reader.string();
                        break;
                    }
                case 15: {
                        message.resourceCount = reader.int32();
                        break;
                    }
                case 16: {
                        message.createdBy = reader.string();
                        break;
                    }
                case 17: {
                        message.updatedBy = reader.string();
                        break;
                    }
                case 18: {
                        message.createdAt = reader.string();
                        break;
                    }
                case 19: {
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
         * Decodes a Project message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof fqdp.Project
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {fqdp.Project} Project
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
         * @memberof fqdp.Project
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
            if (message.slug != null && message.hasOwnProperty("slug"))
                if (!$util.isString(message.slug))
                    return "slug: string expected";
            if (message.description != null && message.hasOwnProperty("description"))
                if (!$util.isString(message.description))
                    return "description: string expected";
            if (message.status != null && message.hasOwnProperty("status"))
                switch (message.status) {
                default:
                    return "status: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                    break;
                }
            if (message.metadataJson != null && message.hasOwnProperty("metadataJson"))
                if (!$util.isString(message.metadataJson))
                    return "metadataJson: string expected";
            if (message.applicationId != null && message.hasOwnProperty("applicationId"))
                if (!$util.isString(message.applicationId))
                    return "applicationId: string expected";
            if (message.applicationName != null && message.hasOwnProperty("applicationName"))
                if (!$util.isString(message.applicationName))
                    return "applicationName: string expected";
            if (message.teamId != null && message.hasOwnProperty("teamId"))
                if (!$util.isString(message.teamId))
                    return "teamId: string expected";
            if (message.teamName != null && message.hasOwnProperty("teamName"))
                if (!$util.isString(message.teamName))
                    return "teamName: string expected";
            if (message.workspaceId != null && message.hasOwnProperty("workspaceId"))
                if (!$util.isString(message.workspaceId))
                    return "workspaceId: string expected";
            if (message.workspaceName != null && message.hasOwnProperty("workspaceName"))
                if (!$util.isString(message.workspaceName))
                    return "workspaceName: string expected";
            if (message.organizationId != null && message.hasOwnProperty("organizationId"))
                if (!$util.isString(message.organizationId))
                    return "organizationId: string expected";
            if (message.organizationName != null && message.hasOwnProperty("organizationName"))
                if (!$util.isString(message.organizationName))
                    return "organizationName: string expected";
            if (message.resourceCount != null && message.hasOwnProperty("resourceCount"))
                if (!$util.isInteger(message.resourceCount))
                    return "resourceCount: integer expected";
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
            return null;
        };

        /**
         * Creates a Project message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof fqdp.Project
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {fqdp.Project} Project
         */
        Project.fromObject = function fromObject(object) {
            if (object instanceof $root.fqdp.Project)
                return object;
            let message = new $root.fqdp.Project();
            if (object.id != null)
                message.id = String(object.id);
            if (object.name != null)
                message.name = String(object.name);
            if (object.slug != null)
                message.slug = String(object.slug);
            if (object.description != null)
                message.description = String(object.description);
            switch (object.status) {
            default:
                if (typeof object.status === "number") {
                    message.status = object.status;
                    break;
                }
                break;
            case "ENTITY_STATUS_UNSPECIFIED":
            case 0:
                message.status = 0;
                break;
            case "ACTIVE":
            case 1:
                message.status = 1;
                break;
            case "INACTIVE":
            case 2:
                message.status = 2;
                break;
            case "ARCHIVED":
            case 3:
                message.status = 3;
                break;
            }
            if (object.metadataJson != null)
                message.metadataJson = String(object.metadataJson);
            if (object.applicationId != null)
                message.applicationId = String(object.applicationId);
            if (object.applicationName != null)
                message.applicationName = String(object.applicationName);
            if (object.teamId != null)
                message.teamId = String(object.teamId);
            if (object.teamName != null)
                message.teamName = String(object.teamName);
            if (object.workspaceId != null)
                message.workspaceId = String(object.workspaceId);
            if (object.workspaceName != null)
                message.workspaceName = String(object.workspaceName);
            if (object.organizationId != null)
                message.organizationId = String(object.organizationId);
            if (object.organizationName != null)
                message.organizationName = String(object.organizationName);
            if (object.resourceCount != null)
                message.resourceCount = object.resourceCount | 0;
            if (object.createdBy != null)
                message.createdBy = String(object.createdBy);
            if (object.updatedBy != null)
                message.updatedBy = String(object.updatedBy);
            if (object.createdAt != null)
                message.createdAt = String(object.createdAt);
            if (object.updatedAt != null)
                message.updatedAt = String(object.updatedAt);
            return message;
        };

        /**
         * Creates a plain object from a Project message. Also converts values to other types if specified.
         * @function toObject
         * @memberof fqdp.Project
         * @static
         * @param {fqdp.Project} message Project
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Project.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.id = "";
                object.name = "";
                object.slug = "";
                object.description = "";
                object.status = options.enums === String ? "ENTITY_STATUS_UNSPECIFIED" : 0;
                object.metadataJson = "";
                object.applicationId = "";
                object.applicationName = "";
                object.teamId = "";
                object.teamName = "";
                object.workspaceId = "";
                object.workspaceName = "";
                object.organizationId = "";
                object.organizationName = "";
                object.resourceCount = 0;
                object.createdBy = "";
                object.updatedBy = "";
                object.createdAt = "";
                object.updatedAt = "";
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.slug != null && message.hasOwnProperty("slug"))
                object.slug = message.slug;
            if (message.description != null && message.hasOwnProperty("description"))
                object.description = message.description;
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = options.enums === String ? $root.fqdp.EntityStatus[message.status] === undefined ? message.status : $root.fqdp.EntityStatus[message.status] : message.status;
            if (message.metadataJson != null && message.hasOwnProperty("metadataJson"))
                object.metadataJson = message.metadataJson;
            if (message.applicationId != null && message.hasOwnProperty("applicationId"))
                object.applicationId = message.applicationId;
            if (message.applicationName != null && message.hasOwnProperty("applicationName"))
                object.applicationName = message.applicationName;
            if (message.teamId != null && message.hasOwnProperty("teamId"))
                object.teamId = message.teamId;
            if (message.teamName != null && message.hasOwnProperty("teamName"))
                object.teamName = message.teamName;
            if (message.workspaceId != null && message.hasOwnProperty("workspaceId"))
                object.workspaceId = message.workspaceId;
            if (message.workspaceName != null && message.hasOwnProperty("workspaceName"))
                object.workspaceName = message.workspaceName;
            if (message.organizationId != null && message.hasOwnProperty("organizationId"))
                object.organizationId = message.organizationId;
            if (message.organizationName != null && message.hasOwnProperty("organizationName"))
                object.organizationName = message.organizationName;
            if (message.resourceCount != null && message.hasOwnProperty("resourceCount"))
                object.resourceCount = message.resourceCount;
            if (message.createdBy != null && message.hasOwnProperty("createdBy"))
                object.createdBy = message.createdBy;
            if (message.updatedBy != null && message.hasOwnProperty("updatedBy"))
                object.updatedBy = message.updatedBy;
            if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                object.createdAt = message.createdAt;
            if (message.updatedAt != null && message.hasOwnProperty("updatedAt"))
                object.updatedAt = message.updatedAt;
            return object;
        };

        /**
         * Converts this Project to JSON.
         * @function toJSON
         * @memberof fqdp.Project
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Project.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Project
         * @function getTypeUrl
         * @memberof fqdp.Project
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Project.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/fqdp.Project";
        };

        return Project;
    })();

    fqdp.ProjectList = (function() {

        /**
         * Properties of a ProjectList.
         * @memberof fqdp
         * @interface IProjectList
         * @property {Array.<fqdp.IProject>|null} [data] ProjectList data
         * @property {fqdp.IPaginationMeta|null} [meta] ProjectList meta
         */

        /**
         * Constructs a new ProjectList.
         * @memberof fqdp
         * @classdesc Represents a ProjectList.
         * @implements IProjectList
         * @constructor
         * @param {fqdp.IProjectList=} [properties] Properties to set
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
         * @member {Array.<fqdp.IProject>} data
         * @memberof fqdp.ProjectList
         * @instance
         */
        ProjectList.prototype.data = $util.emptyArray;

        /**
         * ProjectList meta.
         * @member {fqdp.IPaginationMeta|null|undefined} meta
         * @memberof fqdp.ProjectList
         * @instance
         */
        ProjectList.prototype.meta = null;

        /**
         * Creates a new ProjectList instance using the specified properties.
         * @function create
         * @memberof fqdp.ProjectList
         * @static
         * @param {fqdp.IProjectList=} [properties] Properties to set
         * @returns {fqdp.ProjectList} ProjectList instance
         */
        ProjectList.create = function create(properties) {
            return new ProjectList(properties);
        };

        /**
         * Encodes the specified ProjectList message. Does not implicitly {@link fqdp.ProjectList.verify|verify} messages.
         * @function encode
         * @memberof fqdp.ProjectList
         * @static
         * @param {fqdp.IProjectList} message ProjectList message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ProjectList.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.data != null && message.data.length)
                for (let i = 0; i < message.data.length; ++i)
                    $root.fqdp.Project.encode(message.data[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.meta != null && Object.hasOwnProperty.call(message, "meta"))
                $root.fqdp.PaginationMeta.encode(message.meta, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified ProjectList message, length delimited. Does not implicitly {@link fqdp.ProjectList.verify|verify} messages.
         * @function encodeDelimited
         * @memberof fqdp.ProjectList
         * @static
         * @param {fqdp.IProjectList} message ProjectList message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ProjectList.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ProjectList message from the specified reader or buffer.
         * @function decode
         * @memberof fqdp.ProjectList
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {fqdp.ProjectList} ProjectList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ProjectList.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.fqdp.ProjectList();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.data && message.data.length))
                            message.data = [];
                        message.data.push($root.fqdp.Project.decode(reader, reader.uint32()));
                        break;
                    }
                case 2: {
                        message.meta = $root.fqdp.PaginationMeta.decode(reader, reader.uint32());
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
         * @memberof fqdp.ProjectList
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {fqdp.ProjectList} ProjectList
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
         * @memberof fqdp.ProjectList
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
                    let error = $root.fqdp.Project.verify(message.data[i]);
                    if (error)
                        return "data." + error;
                }
            }
            if (message.meta != null && message.hasOwnProperty("meta")) {
                let error = $root.fqdp.PaginationMeta.verify(message.meta);
                if (error)
                    return "meta." + error;
            }
            return null;
        };

        /**
         * Creates a ProjectList message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof fqdp.ProjectList
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {fqdp.ProjectList} ProjectList
         */
        ProjectList.fromObject = function fromObject(object) {
            if (object instanceof $root.fqdp.ProjectList)
                return object;
            let message = new $root.fqdp.ProjectList();
            if (object.data) {
                if (!Array.isArray(object.data))
                    throw TypeError(".fqdp.ProjectList.data: array expected");
                message.data = [];
                for (let i = 0; i < object.data.length; ++i) {
                    if (typeof object.data[i] !== "object")
                        throw TypeError(".fqdp.ProjectList.data: object expected");
                    message.data[i] = $root.fqdp.Project.fromObject(object.data[i]);
                }
            }
            if (object.meta != null) {
                if (typeof object.meta !== "object")
                    throw TypeError(".fqdp.ProjectList.meta: object expected");
                message.meta = $root.fqdp.PaginationMeta.fromObject(object.meta);
            }
            return message;
        };

        /**
         * Creates a plain object from a ProjectList message. Also converts values to other types if specified.
         * @function toObject
         * @memberof fqdp.ProjectList
         * @static
         * @param {fqdp.ProjectList} message ProjectList
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
                object.meta = null;
            if (message.data && message.data.length) {
                object.data = [];
                for (let j = 0; j < message.data.length; ++j)
                    object.data[j] = $root.fqdp.Project.toObject(message.data[j], options);
            }
            if (message.meta != null && message.hasOwnProperty("meta"))
                object.meta = $root.fqdp.PaginationMeta.toObject(message.meta, options);
            return object;
        };

        /**
         * Converts this ProjectList to JSON.
         * @function toJSON
         * @memberof fqdp.ProjectList
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ProjectList.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ProjectList
         * @function getTypeUrl
         * @memberof fqdp.ProjectList
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ProjectList.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/fqdp.ProjectList";
        };

        return ProjectList;
    })();

    fqdp.CreateProjectRequest = (function() {

        /**
         * Properties of a CreateProjectRequest.
         * @memberof fqdp
         * @interface ICreateProjectRequest
         * @property {string|null} [name] CreateProjectRequest name
         * @property {string|null} [description] CreateProjectRequest description
         * @property {string|null} [applicationId] CreateProjectRequest applicationId
         * @property {string|null} [metadataJson] CreateProjectRequest metadataJson
         */

        /**
         * Constructs a new CreateProjectRequest.
         * @memberof fqdp
         * @classdesc Represents a CreateProjectRequest.
         * @implements ICreateProjectRequest
         * @constructor
         * @param {fqdp.ICreateProjectRequest=} [properties] Properties to set
         */
        function CreateProjectRequest(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * CreateProjectRequest name.
         * @member {string} name
         * @memberof fqdp.CreateProjectRequest
         * @instance
         */
        CreateProjectRequest.prototype.name = "";

        /**
         * CreateProjectRequest description.
         * @member {string} description
         * @memberof fqdp.CreateProjectRequest
         * @instance
         */
        CreateProjectRequest.prototype.description = "";

        /**
         * CreateProjectRequest applicationId.
         * @member {string} applicationId
         * @memberof fqdp.CreateProjectRequest
         * @instance
         */
        CreateProjectRequest.prototype.applicationId = "";

        /**
         * CreateProjectRequest metadataJson.
         * @member {string} metadataJson
         * @memberof fqdp.CreateProjectRequest
         * @instance
         */
        CreateProjectRequest.prototype.metadataJson = "";

        /**
         * Creates a new CreateProjectRequest instance using the specified properties.
         * @function create
         * @memberof fqdp.CreateProjectRequest
         * @static
         * @param {fqdp.ICreateProjectRequest=} [properties] Properties to set
         * @returns {fqdp.CreateProjectRequest} CreateProjectRequest instance
         */
        CreateProjectRequest.create = function create(properties) {
            return new CreateProjectRequest(properties);
        };

        /**
         * Encodes the specified CreateProjectRequest message. Does not implicitly {@link fqdp.CreateProjectRequest.verify|verify} messages.
         * @function encode
         * @memberof fqdp.CreateProjectRequest
         * @static
         * @param {fqdp.ICreateProjectRequest} message CreateProjectRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CreateProjectRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.description);
            if (message.applicationId != null && Object.hasOwnProperty.call(message, "applicationId"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.applicationId);
            if (message.metadataJson != null && Object.hasOwnProperty.call(message, "metadataJson"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.metadataJson);
            return writer;
        };

        /**
         * Encodes the specified CreateProjectRequest message, length delimited. Does not implicitly {@link fqdp.CreateProjectRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof fqdp.CreateProjectRequest
         * @static
         * @param {fqdp.ICreateProjectRequest} message CreateProjectRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CreateProjectRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a CreateProjectRequest message from the specified reader or buffer.
         * @function decode
         * @memberof fqdp.CreateProjectRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {fqdp.CreateProjectRequest} CreateProjectRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CreateProjectRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.fqdp.CreateProjectRequest();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.name = reader.string();
                        break;
                    }
                case 3: {
                        message.description = reader.string();
                        break;
                    }
                case 4: {
                        message.applicationId = reader.string();
                        break;
                    }
                case 5: {
                        message.metadataJson = reader.string();
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
         * Decodes a CreateProjectRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof fqdp.CreateProjectRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {fqdp.CreateProjectRequest} CreateProjectRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CreateProjectRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a CreateProjectRequest message.
         * @function verify
         * @memberof fqdp.CreateProjectRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CreateProjectRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.description != null && message.hasOwnProperty("description"))
                if (!$util.isString(message.description))
                    return "description: string expected";
            if (message.applicationId != null && message.hasOwnProperty("applicationId"))
                if (!$util.isString(message.applicationId))
                    return "applicationId: string expected";
            if (message.metadataJson != null && message.hasOwnProperty("metadataJson"))
                if (!$util.isString(message.metadataJson))
                    return "metadataJson: string expected";
            return null;
        };

        /**
         * Creates a CreateProjectRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof fqdp.CreateProjectRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {fqdp.CreateProjectRequest} CreateProjectRequest
         */
        CreateProjectRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.fqdp.CreateProjectRequest)
                return object;
            let message = new $root.fqdp.CreateProjectRequest();
            if (object.name != null)
                message.name = String(object.name);
            if (object.description != null)
                message.description = String(object.description);
            if (object.applicationId != null)
                message.applicationId = String(object.applicationId);
            if (object.metadataJson != null)
                message.metadataJson = String(object.metadataJson);
            return message;
        };

        /**
         * Creates a plain object from a CreateProjectRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof fqdp.CreateProjectRequest
         * @static
         * @param {fqdp.CreateProjectRequest} message CreateProjectRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CreateProjectRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.name = "";
                object.description = "";
                object.applicationId = "";
                object.metadataJson = "";
            }
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.description != null && message.hasOwnProperty("description"))
                object.description = message.description;
            if (message.applicationId != null && message.hasOwnProperty("applicationId"))
                object.applicationId = message.applicationId;
            if (message.metadataJson != null && message.hasOwnProperty("metadataJson"))
                object.metadataJson = message.metadataJson;
            return object;
        };

        /**
         * Converts this CreateProjectRequest to JSON.
         * @function toJSON
         * @memberof fqdp.CreateProjectRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CreateProjectRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for CreateProjectRequest
         * @function getTypeUrl
         * @memberof fqdp.CreateProjectRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        CreateProjectRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/fqdp.CreateProjectRequest";
        };

        return CreateProjectRequest;
    })();

    fqdp.UpdateProjectRequest = (function() {

        /**
         * Properties of an UpdateProjectRequest.
         * @memberof fqdp
         * @interface IUpdateProjectRequest
         * @property {string|null} [name] UpdateProjectRequest name
         * @property {string|null} [description] UpdateProjectRequest description
         * @property {fqdp.EntityStatus|null} [status] UpdateProjectRequest status
         * @property {string|null} [metadataJson] UpdateProjectRequest metadataJson
         */

        /**
         * Constructs a new UpdateProjectRequest.
         * @memberof fqdp
         * @classdesc Represents an UpdateProjectRequest.
         * @implements IUpdateProjectRequest
         * @constructor
         * @param {fqdp.IUpdateProjectRequest=} [properties] Properties to set
         */
        function UpdateProjectRequest(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * UpdateProjectRequest name.
         * @member {string} name
         * @memberof fqdp.UpdateProjectRequest
         * @instance
         */
        UpdateProjectRequest.prototype.name = "";

        /**
         * UpdateProjectRequest description.
         * @member {string} description
         * @memberof fqdp.UpdateProjectRequest
         * @instance
         */
        UpdateProjectRequest.prototype.description = "";

        /**
         * UpdateProjectRequest status.
         * @member {fqdp.EntityStatus} status
         * @memberof fqdp.UpdateProjectRequest
         * @instance
         */
        UpdateProjectRequest.prototype.status = 0;

        /**
         * UpdateProjectRequest metadataJson.
         * @member {string} metadataJson
         * @memberof fqdp.UpdateProjectRequest
         * @instance
         */
        UpdateProjectRequest.prototype.metadataJson = "";

        /**
         * Creates a new UpdateProjectRequest instance using the specified properties.
         * @function create
         * @memberof fqdp.UpdateProjectRequest
         * @static
         * @param {fqdp.IUpdateProjectRequest=} [properties] Properties to set
         * @returns {fqdp.UpdateProjectRequest} UpdateProjectRequest instance
         */
        UpdateProjectRequest.create = function create(properties) {
            return new UpdateProjectRequest(properties);
        };

        /**
         * Encodes the specified UpdateProjectRequest message. Does not implicitly {@link fqdp.UpdateProjectRequest.verify|verify} messages.
         * @function encode
         * @memberof fqdp.UpdateProjectRequest
         * @static
         * @param {fqdp.IUpdateProjectRequest} message UpdateProjectRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UpdateProjectRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.description);
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 4, wireType 0 =*/32).int32(message.status);
            if (message.metadataJson != null && Object.hasOwnProperty.call(message, "metadataJson"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.metadataJson);
            return writer;
        };

        /**
         * Encodes the specified UpdateProjectRequest message, length delimited. Does not implicitly {@link fqdp.UpdateProjectRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof fqdp.UpdateProjectRequest
         * @static
         * @param {fqdp.IUpdateProjectRequest} message UpdateProjectRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UpdateProjectRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an UpdateProjectRequest message from the specified reader or buffer.
         * @function decode
         * @memberof fqdp.UpdateProjectRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {fqdp.UpdateProjectRequest} UpdateProjectRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UpdateProjectRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.fqdp.UpdateProjectRequest();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.name = reader.string();
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
                        message.metadataJson = reader.string();
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
         * Decodes an UpdateProjectRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof fqdp.UpdateProjectRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {fqdp.UpdateProjectRequest} UpdateProjectRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UpdateProjectRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an UpdateProjectRequest message.
         * @function verify
         * @memberof fqdp.UpdateProjectRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        UpdateProjectRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.description != null && message.hasOwnProperty("description"))
                if (!$util.isString(message.description))
                    return "description: string expected";
            if (message.status != null && message.hasOwnProperty("status"))
                switch (message.status) {
                default:
                    return "status: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                    break;
                }
            if (message.metadataJson != null && message.hasOwnProperty("metadataJson"))
                if (!$util.isString(message.metadataJson))
                    return "metadataJson: string expected";
            return null;
        };

        /**
         * Creates an UpdateProjectRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof fqdp.UpdateProjectRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {fqdp.UpdateProjectRequest} UpdateProjectRequest
         */
        UpdateProjectRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.fqdp.UpdateProjectRequest)
                return object;
            let message = new $root.fqdp.UpdateProjectRequest();
            if (object.name != null)
                message.name = String(object.name);
            if (object.description != null)
                message.description = String(object.description);
            switch (object.status) {
            default:
                if (typeof object.status === "number") {
                    message.status = object.status;
                    break;
                }
                break;
            case "ENTITY_STATUS_UNSPECIFIED":
            case 0:
                message.status = 0;
                break;
            case "ACTIVE":
            case 1:
                message.status = 1;
                break;
            case "INACTIVE":
            case 2:
                message.status = 2;
                break;
            case "ARCHIVED":
            case 3:
                message.status = 3;
                break;
            }
            if (object.metadataJson != null)
                message.metadataJson = String(object.metadataJson);
            return message;
        };

        /**
         * Creates a plain object from an UpdateProjectRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof fqdp.UpdateProjectRequest
         * @static
         * @param {fqdp.UpdateProjectRequest} message UpdateProjectRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        UpdateProjectRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.name = "";
                object.description = "";
                object.status = options.enums === String ? "ENTITY_STATUS_UNSPECIFIED" : 0;
                object.metadataJson = "";
            }
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.description != null && message.hasOwnProperty("description"))
                object.description = message.description;
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = options.enums === String ? $root.fqdp.EntityStatus[message.status] === undefined ? message.status : $root.fqdp.EntityStatus[message.status] : message.status;
            if (message.metadataJson != null && message.hasOwnProperty("metadataJson"))
                object.metadataJson = message.metadataJson;
            return object;
        };

        /**
         * Converts this UpdateProjectRequest to JSON.
         * @function toJSON
         * @memberof fqdp.UpdateProjectRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        UpdateProjectRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for UpdateProjectRequest
         * @function getTypeUrl
         * @memberof fqdp.UpdateProjectRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        UpdateProjectRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/fqdp.UpdateProjectRequest";
        };

        return UpdateProjectRequest;
    })();

    fqdp.Reference = (function() {

        /**
         * Properties of a Reference.
         * @memberof fqdp
         * @interface IReference
         * @property {string|null} [id] Reference id
         * @property {string|null} [entityType] Reference entityType
         * @property {string|null} [entityId] Reference entityId
         * @property {string|null} [name] Reference name
         * @property {string|null} [link] Reference link
         * @property {string|null} [type] Reference type
         * @property {string|null} [externalUid] Reference externalUid
         * @property {string|null} [description] Reference description
         * @property {string|null} [metadataJson] Reference metadataJson
         * @property {string|null} [status] Reference status
         * @property {string|null} [createdBy] Reference createdBy
         * @property {string|null} [updatedBy] Reference updatedBy
         * @property {string|null} [createdAt] Reference createdAt
         * @property {string|null} [updatedAt] Reference updatedAt
         */

        /**
         * Constructs a new Reference.
         * @memberof fqdp
         * @classdesc Represents a Reference.
         * @implements IReference
         * @constructor
         * @param {fqdp.IReference=} [properties] Properties to set
         */
        function Reference(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Reference id.
         * @member {string} id
         * @memberof fqdp.Reference
         * @instance
         */
        Reference.prototype.id = "";

        /**
         * Reference entityType.
         * @member {string} entityType
         * @memberof fqdp.Reference
         * @instance
         */
        Reference.prototype.entityType = "";

        /**
         * Reference entityId.
         * @member {string} entityId
         * @memberof fqdp.Reference
         * @instance
         */
        Reference.prototype.entityId = "";

        /**
         * Reference name.
         * @member {string} name
         * @memberof fqdp.Reference
         * @instance
         */
        Reference.prototype.name = "";

        /**
         * Reference link.
         * @member {string} link
         * @memberof fqdp.Reference
         * @instance
         */
        Reference.prototype.link = "";

        /**
         * Reference type.
         * @member {string} type
         * @memberof fqdp.Reference
         * @instance
         */
        Reference.prototype.type = "";

        /**
         * Reference externalUid.
         * @member {string} externalUid
         * @memberof fqdp.Reference
         * @instance
         */
        Reference.prototype.externalUid = "";

        /**
         * Reference description.
         * @member {string} description
         * @memberof fqdp.Reference
         * @instance
         */
        Reference.prototype.description = "";

        /**
         * Reference metadataJson.
         * @member {string} metadataJson
         * @memberof fqdp.Reference
         * @instance
         */
        Reference.prototype.metadataJson = "";

        /**
         * Reference status.
         * @member {string} status
         * @memberof fqdp.Reference
         * @instance
         */
        Reference.prototype.status = "";

        /**
         * Reference createdBy.
         * @member {string} createdBy
         * @memberof fqdp.Reference
         * @instance
         */
        Reference.prototype.createdBy = "";

        /**
         * Reference updatedBy.
         * @member {string} updatedBy
         * @memberof fqdp.Reference
         * @instance
         */
        Reference.prototype.updatedBy = "";

        /**
         * Reference createdAt.
         * @member {string} createdAt
         * @memberof fqdp.Reference
         * @instance
         */
        Reference.prototype.createdAt = "";

        /**
         * Reference updatedAt.
         * @member {string} updatedAt
         * @memberof fqdp.Reference
         * @instance
         */
        Reference.prototype.updatedAt = "";

        /**
         * Creates a new Reference instance using the specified properties.
         * @function create
         * @memberof fqdp.Reference
         * @static
         * @param {fqdp.IReference=} [properties] Properties to set
         * @returns {fqdp.Reference} Reference instance
         */
        Reference.create = function create(properties) {
            return new Reference(properties);
        };

        /**
         * Encodes the specified Reference message. Does not implicitly {@link fqdp.Reference.verify|verify} messages.
         * @function encode
         * @memberof fqdp.Reference
         * @static
         * @param {fqdp.IReference} message Reference message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Reference.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.entityType != null && Object.hasOwnProperty.call(message, "entityType"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.entityType);
            if (message.entityId != null && Object.hasOwnProperty.call(message, "entityId"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.entityId);
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.name);
            if (message.link != null && Object.hasOwnProperty.call(message, "link"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.link);
            if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.type);
            if (message.externalUid != null && Object.hasOwnProperty.call(message, "externalUid"))
                writer.uint32(/* id 7, wireType 2 =*/58).string(message.externalUid);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 8, wireType 2 =*/66).string(message.description);
            if (message.metadataJson != null && Object.hasOwnProperty.call(message, "metadataJson"))
                writer.uint32(/* id 9, wireType 2 =*/74).string(message.metadataJson);
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 10, wireType 2 =*/82).string(message.status);
            if (message.createdBy != null && Object.hasOwnProperty.call(message, "createdBy"))
                writer.uint32(/* id 11, wireType 2 =*/90).string(message.createdBy);
            if (message.updatedBy != null && Object.hasOwnProperty.call(message, "updatedBy"))
                writer.uint32(/* id 12, wireType 2 =*/98).string(message.updatedBy);
            if (message.createdAt != null && Object.hasOwnProperty.call(message, "createdAt"))
                writer.uint32(/* id 13, wireType 2 =*/106).string(message.createdAt);
            if (message.updatedAt != null && Object.hasOwnProperty.call(message, "updatedAt"))
                writer.uint32(/* id 14, wireType 2 =*/114).string(message.updatedAt);
            return writer;
        };

        /**
         * Encodes the specified Reference message, length delimited. Does not implicitly {@link fqdp.Reference.verify|verify} messages.
         * @function encodeDelimited
         * @memberof fqdp.Reference
         * @static
         * @param {fqdp.IReference} message Reference message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Reference.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Reference message from the specified reader or buffer.
         * @function decode
         * @memberof fqdp.Reference
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {fqdp.Reference} Reference
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Reference.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.fqdp.Reference();
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
                        message.entityType = reader.string();
                        break;
                    }
                case 3: {
                        message.entityId = reader.string();
                        break;
                    }
                case 4: {
                        message.name = reader.string();
                        break;
                    }
                case 5: {
                        message.link = reader.string();
                        break;
                    }
                case 6: {
                        message.type = reader.string();
                        break;
                    }
                case 7: {
                        message.externalUid = reader.string();
                        break;
                    }
                case 8: {
                        message.description = reader.string();
                        break;
                    }
                case 9: {
                        message.metadataJson = reader.string();
                        break;
                    }
                case 10: {
                        message.status = reader.string();
                        break;
                    }
                case 11: {
                        message.createdBy = reader.string();
                        break;
                    }
                case 12: {
                        message.updatedBy = reader.string();
                        break;
                    }
                case 13: {
                        message.createdAt = reader.string();
                        break;
                    }
                case 14: {
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
         * Decodes a Reference message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof fqdp.Reference
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {fqdp.Reference} Reference
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Reference.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Reference message.
         * @function verify
         * @memberof fqdp.Reference
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Reference.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.entityType != null && message.hasOwnProperty("entityType"))
                if (!$util.isString(message.entityType))
                    return "entityType: string expected";
            if (message.entityId != null && message.hasOwnProperty("entityId"))
                if (!$util.isString(message.entityId))
                    return "entityId: string expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.link != null && message.hasOwnProperty("link"))
                if (!$util.isString(message.link))
                    return "link: string expected";
            if (message.type != null && message.hasOwnProperty("type"))
                if (!$util.isString(message.type))
                    return "type: string expected";
            if (message.externalUid != null && message.hasOwnProperty("externalUid"))
                if (!$util.isString(message.externalUid))
                    return "externalUid: string expected";
            if (message.description != null && message.hasOwnProperty("description"))
                if (!$util.isString(message.description))
                    return "description: string expected";
            if (message.metadataJson != null && message.hasOwnProperty("metadataJson"))
                if (!$util.isString(message.metadataJson))
                    return "metadataJson: string expected";
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
            return null;
        };

        /**
         * Creates a Reference message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof fqdp.Reference
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {fqdp.Reference} Reference
         */
        Reference.fromObject = function fromObject(object) {
            if (object instanceof $root.fqdp.Reference)
                return object;
            let message = new $root.fqdp.Reference();
            if (object.id != null)
                message.id = String(object.id);
            if (object.entityType != null)
                message.entityType = String(object.entityType);
            if (object.entityId != null)
                message.entityId = String(object.entityId);
            if (object.name != null)
                message.name = String(object.name);
            if (object.link != null)
                message.link = String(object.link);
            if (object.type != null)
                message.type = String(object.type);
            if (object.externalUid != null)
                message.externalUid = String(object.externalUid);
            if (object.description != null)
                message.description = String(object.description);
            if (object.metadataJson != null)
                message.metadataJson = String(object.metadataJson);
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
            return message;
        };

        /**
         * Creates a plain object from a Reference message. Also converts values to other types if specified.
         * @function toObject
         * @memberof fqdp.Reference
         * @static
         * @param {fqdp.Reference} message Reference
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Reference.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.id = "";
                object.entityType = "";
                object.entityId = "";
                object.name = "";
                object.link = "";
                object.type = "";
                object.externalUid = "";
                object.description = "";
                object.metadataJson = "";
                object.status = "";
                object.createdBy = "";
                object.updatedBy = "";
                object.createdAt = "";
                object.updatedAt = "";
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.entityType != null && message.hasOwnProperty("entityType"))
                object.entityType = message.entityType;
            if (message.entityId != null && message.hasOwnProperty("entityId"))
                object.entityId = message.entityId;
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.link != null && message.hasOwnProperty("link"))
                object.link = message.link;
            if (message.type != null && message.hasOwnProperty("type"))
                object.type = message.type;
            if (message.externalUid != null && message.hasOwnProperty("externalUid"))
                object.externalUid = message.externalUid;
            if (message.description != null && message.hasOwnProperty("description"))
                object.description = message.description;
            if (message.metadataJson != null && message.hasOwnProperty("metadataJson"))
                object.metadataJson = message.metadataJson;
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
            return object;
        };

        /**
         * Converts this Reference to JSON.
         * @function toJSON
         * @memberof fqdp.Reference
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Reference.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Reference
         * @function getTypeUrl
         * @memberof fqdp.Reference
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Reference.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/fqdp.Reference";
        };

        return Reference;
    })();

    fqdp.ReferenceList = (function() {

        /**
         * Properties of a ReferenceList.
         * @memberof fqdp
         * @interface IReferenceList
         * @property {Array.<fqdp.IReference>|null} [data] ReferenceList data
         * @property {fqdp.IPaginationMeta|null} [meta] ReferenceList meta
         */

        /**
         * Constructs a new ReferenceList.
         * @memberof fqdp
         * @classdesc Represents a ReferenceList.
         * @implements IReferenceList
         * @constructor
         * @param {fqdp.IReferenceList=} [properties] Properties to set
         */
        function ReferenceList(properties) {
            this.data = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ReferenceList data.
         * @member {Array.<fqdp.IReference>} data
         * @memberof fqdp.ReferenceList
         * @instance
         */
        ReferenceList.prototype.data = $util.emptyArray;

        /**
         * ReferenceList meta.
         * @member {fqdp.IPaginationMeta|null|undefined} meta
         * @memberof fqdp.ReferenceList
         * @instance
         */
        ReferenceList.prototype.meta = null;

        /**
         * Creates a new ReferenceList instance using the specified properties.
         * @function create
         * @memberof fqdp.ReferenceList
         * @static
         * @param {fqdp.IReferenceList=} [properties] Properties to set
         * @returns {fqdp.ReferenceList} ReferenceList instance
         */
        ReferenceList.create = function create(properties) {
            return new ReferenceList(properties);
        };

        /**
         * Encodes the specified ReferenceList message. Does not implicitly {@link fqdp.ReferenceList.verify|verify} messages.
         * @function encode
         * @memberof fqdp.ReferenceList
         * @static
         * @param {fqdp.IReferenceList} message ReferenceList message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ReferenceList.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.data != null && message.data.length)
                for (let i = 0; i < message.data.length; ++i)
                    $root.fqdp.Reference.encode(message.data[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.meta != null && Object.hasOwnProperty.call(message, "meta"))
                $root.fqdp.PaginationMeta.encode(message.meta, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified ReferenceList message, length delimited. Does not implicitly {@link fqdp.ReferenceList.verify|verify} messages.
         * @function encodeDelimited
         * @memberof fqdp.ReferenceList
         * @static
         * @param {fqdp.IReferenceList} message ReferenceList message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ReferenceList.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ReferenceList message from the specified reader or buffer.
         * @function decode
         * @memberof fqdp.ReferenceList
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {fqdp.ReferenceList} ReferenceList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ReferenceList.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.fqdp.ReferenceList();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.data && message.data.length))
                            message.data = [];
                        message.data.push($root.fqdp.Reference.decode(reader, reader.uint32()));
                        break;
                    }
                case 2: {
                        message.meta = $root.fqdp.PaginationMeta.decode(reader, reader.uint32());
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
         * Decodes a ReferenceList message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof fqdp.ReferenceList
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {fqdp.ReferenceList} ReferenceList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ReferenceList.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ReferenceList message.
         * @function verify
         * @memberof fqdp.ReferenceList
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ReferenceList.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.data != null && message.hasOwnProperty("data")) {
                if (!Array.isArray(message.data))
                    return "data: array expected";
                for (let i = 0; i < message.data.length; ++i) {
                    let error = $root.fqdp.Reference.verify(message.data[i]);
                    if (error)
                        return "data." + error;
                }
            }
            if (message.meta != null && message.hasOwnProperty("meta")) {
                let error = $root.fqdp.PaginationMeta.verify(message.meta);
                if (error)
                    return "meta." + error;
            }
            return null;
        };

        /**
         * Creates a ReferenceList message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof fqdp.ReferenceList
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {fqdp.ReferenceList} ReferenceList
         */
        ReferenceList.fromObject = function fromObject(object) {
            if (object instanceof $root.fqdp.ReferenceList)
                return object;
            let message = new $root.fqdp.ReferenceList();
            if (object.data) {
                if (!Array.isArray(object.data))
                    throw TypeError(".fqdp.ReferenceList.data: array expected");
                message.data = [];
                for (let i = 0; i < object.data.length; ++i) {
                    if (typeof object.data[i] !== "object")
                        throw TypeError(".fqdp.ReferenceList.data: object expected");
                    message.data[i] = $root.fqdp.Reference.fromObject(object.data[i]);
                }
            }
            if (object.meta != null) {
                if (typeof object.meta !== "object")
                    throw TypeError(".fqdp.ReferenceList.meta: object expected");
                message.meta = $root.fqdp.PaginationMeta.fromObject(object.meta);
            }
            return message;
        };

        /**
         * Creates a plain object from a ReferenceList message. Also converts values to other types if specified.
         * @function toObject
         * @memberof fqdp.ReferenceList
         * @static
         * @param {fqdp.ReferenceList} message ReferenceList
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ReferenceList.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.data = [];
            if (options.defaults)
                object.meta = null;
            if (message.data && message.data.length) {
                object.data = [];
                for (let j = 0; j < message.data.length; ++j)
                    object.data[j] = $root.fqdp.Reference.toObject(message.data[j], options);
            }
            if (message.meta != null && message.hasOwnProperty("meta"))
                object.meta = $root.fqdp.PaginationMeta.toObject(message.meta, options);
            return object;
        };

        /**
         * Converts this ReferenceList to JSON.
         * @function toJSON
         * @memberof fqdp.ReferenceList
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ReferenceList.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ReferenceList
         * @function getTypeUrl
         * @memberof fqdp.ReferenceList
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ReferenceList.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/fqdp.ReferenceList";
        };

        return ReferenceList;
    })();

    fqdp.CreateReferenceRequest = (function() {

        /**
         * Properties of a CreateReferenceRequest.
         * @memberof fqdp
         * @interface ICreateReferenceRequest
         * @property {string|null} [entityType] CreateReferenceRequest entityType
         * @property {string|null} [entityId] CreateReferenceRequest entityId
         * @property {string|null} [name] CreateReferenceRequest name
         * @property {string|null} [link] CreateReferenceRequest link
         * @property {string|null} [type] CreateReferenceRequest type
         * @property {string|null} [externalUid] CreateReferenceRequest externalUid
         * @property {string|null} [description] CreateReferenceRequest description
         * @property {string|null} [metadataJson] CreateReferenceRequest metadataJson
         */

        /**
         * Constructs a new CreateReferenceRequest.
         * @memberof fqdp
         * @classdesc Represents a CreateReferenceRequest.
         * @implements ICreateReferenceRequest
         * @constructor
         * @param {fqdp.ICreateReferenceRequest=} [properties] Properties to set
         */
        function CreateReferenceRequest(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * CreateReferenceRequest entityType.
         * @member {string} entityType
         * @memberof fqdp.CreateReferenceRequest
         * @instance
         */
        CreateReferenceRequest.prototype.entityType = "";

        /**
         * CreateReferenceRequest entityId.
         * @member {string} entityId
         * @memberof fqdp.CreateReferenceRequest
         * @instance
         */
        CreateReferenceRequest.prototype.entityId = "";

        /**
         * CreateReferenceRequest name.
         * @member {string} name
         * @memberof fqdp.CreateReferenceRequest
         * @instance
         */
        CreateReferenceRequest.prototype.name = "";

        /**
         * CreateReferenceRequest link.
         * @member {string} link
         * @memberof fqdp.CreateReferenceRequest
         * @instance
         */
        CreateReferenceRequest.prototype.link = "";

        /**
         * CreateReferenceRequest type.
         * @member {string} type
         * @memberof fqdp.CreateReferenceRequest
         * @instance
         */
        CreateReferenceRequest.prototype.type = "";

        /**
         * CreateReferenceRequest externalUid.
         * @member {string} externalUid
         * @memberof fqdp.CreateReferenceRequest
         * @instance
         */
        CreateReferenceRequest.prototype.externalUid = "";

        /**
         * CreateReferenceRequest description.
         * @member {string} description
         * @memberof fqdp.CreateReferenceRequest
         * @instance
         */
        CreateReferenceRequest.prototype.description = "";

        /**
         * CreateReferenceRequest metadataJson.
         * @member {string} metadataJson
         * @memberof fqdp.CreateReferenceRequest
         * @instance
         */
        CreateReferenceRequest.prototype.metadataJson = "";

        /**
         * Creates a new CreateReferenceRequest instance using the specified properties.
         * @function create
         * @memberof fqdp.CreateReferenceRequest
         * @static
         * @param {fqdp.ICreateReferenceRequest=} [properties] Properties to set
         * @returns {fqdp.CreateReferenceRequest} CreateReferenceRequest instance
         */
        CreateReferenceRequest.create = function create(properties) {
            return new CreateReferenceRequest(properties);
        };

        /**
         * Encodes the specified CreateReferenceRequest message. Does not implicitly {@link fqdp.CreateReferenceRequest.verify|verify} messages.
         * @function encode
         * @memberof fqdp.CreateReferenceRequest
         * @static
         * @param {fqdp.ICreateReferenceRequest} message CreateReferenceRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CreateReferenceRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.entityType != null && Object.hasOwnProperty.call(message, "entityType"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.entityType);
            if (message.entityId != null && Object.hasOwnProperty.call(message, "entityId"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.entityId);
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.name);
            if (message.link != null && Object.hasOwnProperty.call(message, "link"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.link);
            if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.type);
            if (message.externalUid != null && Object.hasOwnProperty.call(message, "externalUid"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.externalUid);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 7, wireType 2 =*/58).string(message.description);
            if (message.metadataJson != null && Object.hasOwnProperty.call(message, "metadataJson"))
                writer.uint32(/* id 8, wireType 2 =*/66).string(message.metadataJson);
            return writer;
        };

        /**
         * Encodes the specified CreateReferenceRequest message, length delimited. Does not implicitly {@link fqdp.CreateReferenceRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof fqdp.CreateReferenceRequest
         * @static
         * @param {fqdp.ICreateReferenceRequest} message CreateReferenceRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CreateReferenceRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a CreateReferenceRequest message from the specified reader or buffer.
         * @function decode
         * @memberof fqdp.CreateReferenceRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {fqdp.CreateReferenceRequest} CreateReferenceRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CreateReferenceRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.fqdp.CreateReferenceRequest();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.entityType = reader.string();
                        break;
                    }
                case 2: {
                        message.entityId = reader.string();
                        break;
                    }
                case 3: {
                        message.name = reader.string();
                        break;
                    }
                case 4: {
                        message.link = reader.string();
                        break;
                    }
                case 5: {
                        message.type = reader.string();
                        break;
                    }
                case 6: {
                        message.externalUid = reader.string();
                        break;
                    }
                case 7: {
                        message.description = reader.string();
                        break;
                    }
                case 8: {
                        message.metadataJson = reader.string();
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
         * Decodes a CreateReferenceRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof fqdp.CreateReferenceRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {fqdp.CreateReferenceRequest} CreateReferenceRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CreateReferenceRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a CreateReferenceRequest message.
         * @function verify
         * @memberof fqdp.CreateReferenceRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CreateReferenceRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.entityType != null && message.hasOwnProperty("entityType"))
                if (!$util.isString(message.entityType))
                    return "entityType: string expected";
            if (message.entityId != null && message.hasOwnProperty("entityId"))
                if (!$util.isString(message.entityId))
                    return "entityId: string expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.link != null && message.hasOwnProperty("link"))
                if (!$util.isString(message.link))
                    return "link: string expected";
            if (message.type != null && message.hasOwnProperty("type"))
                if (!$util.isString(message.type))
                    return "type: string expected";
            if (message.externalUid != null && message.hasOwnProperty("externalUid"))
                if (!$util.isString(message.externalUid))
                    return "externalUid: string expected";
            if (message.description != null && message.hasOwnProperty("description"))
                if (!$util.isString(message.description))
                    return "description: string expected";
            if (message.metadataJson != null && message.hasOwnProperty("metadataJson"))
                if (!$util.isString(message.metadataJson))
                    return "metadataJson: string expected";
            return null;
        };

        /**
         * Creates a CreateReferenceRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof fqdp.CreateReferenceRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {fqdp.CreateReferenceRequest} CreateReferenceRequest
         */
        CreateReferenceRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.fqdp.CreateReferenceRequest)
                return object;
            let message = new $root.fqdp.CreateReferenceRequest();
            if (object.entityType != null)
                message.entityType = String(object.entityType);
            if (object.entityId != null)
                message.entityId = String(object.entityId);
            if (object.name != null)
                message.name = String(object.name);
            if (object.link != null)
                message.link = String(object.link);
            if (object.type != null)
                message.type = String(object.type);
            if (object.externalUid != null)
                message.externalUid = String(object.externalUid);
            if (object.description != null)
                message.description = String(object.description);
            if (object.metadataJson != null)
                message.metadataJson = String(object.metadataJson);
            return message;
        };

        /**
         * Creates a plain object from a CreateReferenceRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof fqdp.CreateReferenceRequest
         * @static
         * @param {fqdp.CreateReferenceRequest} message CreateReferenceRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CreateReferenceRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.entityType = "";
                object.entityId = "";
                object.name = "";
                object.link = "";
                object.type = "";
                object.externalUid = "";
                object.description = "";
                object.metadataJson = "";
            }
            if (message.entityType != null && message.hasOwnProperty("entityType"))
                object.entityType = message.entityType;
            if (message.entityId != null && message.hasOwnProperty("entityId"))
                object.entityId = message.entityId;
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.link != null && message.hasOwnProperty("link"))
                object.link = message.link;
            if (message.type != null && message.hasOwnProperty("type"))
                object.type = message.type;
            if (message.externalUid != null && message.hasOwnProperty("externalUid"))
                object.externalUid = message.externalUid;
            if (message.description != null && message.hasOwnProperty("description"))
                object.description = message.description;
            if (message.metadataJson != null && message.hasOwnProperty("metadataJson"))
                object.metadataJson = message.metadataJson;
            return object;
        };

        /**
         * Converts this CreateReferenceRequest to JSON.
         * @function toJSON
         * @memberof fqdp.CreateReferenceRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CreateReferenceRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for CreateReferenceRequest
         * @function getTypeUrl
         * @memberof fqdp.CreateReferenceRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        CreateReferenceRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/fqdp.CreateReferenceRequest";
        };

        return CreateReferenceRequest;
    })();

    fqdp.UpdateReferenceRequest = (function() {

        /**
         * Properties of an UpdateReferenceRequest.
         * @memberof fqdp
         * @interface IUpdateReferenceRequest
         * @property {string|null} [name] UpdateReferenceRequest name
         * @property {string|null} [link] UpdateReferenceRequest link
         * @property {string|null} [type] UpdateReferenceRequest type
         * @property {string|null} [externalUid] UpdateReferenceRequest externalUid
         * @property {string|null} [description] UpdateReferenceRequest description
         * @property {string|null} [metadataJson] UpdateReferenceRequest metadataJson
         * @property {string|null} [status] UpdateReferenceRequest status
         */

        /**
         * Constructs a new UpdateReferenceRequest.
         * @memberof fqdp
         * @classdesc Represents an UpdateReferenceRequest.
         * @implements IUpdateReferenceRequest
         * @constructor
         * @param {fqdp.IUpdateReferenceRequest=} [properties] Properties to set
         */
        function UpdateReferenceRequest(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * UpdateReferenceRequest name.
         * @member {string} name
         * @memberof fqdp.UpdateReferenceRequest
         * @instance
         */
        UpdateReferenceRequest.prototype.name = "";

        /**
         * UpdateReferenceRequest link.
         * @member {string} link
         * @memberof fqdp.UpdateReferenceRequest
         * @instance
         */
        UpdateReferenceRequest.prototype.link = "";

        /**
         * UpdateReferenceRequest type.
         * @member {string} type
         * @memberof fqdp.UpdateReferenceRequest
         * @instance
         */
        UpdateReferenceRequest.prototype.type = "";

        /**
         * UpdateReferenceRequest externalUid.
         * @member {string} externalUid
         * @memberof fqdp.UpdateReferenceRequest
         * @instance
         */
        UpdateReferenceRequest.prototype.externalUid = "";

        /**
         * UpdateReferenceRequest description.
         * @member {string} description
         * @memberof fqdp.UpdateReferenceRequest
         * @instance
         */
        UpdateReferenceRequest.prototype.description = "";

        /**
         * UpdateReferenceRequest metadataJson.
         * @member {string} metadataJson
         * @memberof fqdp.UpdateReferenceRequest
         * @instance
         */
        UpdateReferenceRequest.prototype.metadataJson = "";

        /**
         * UpdateReferenceRequest status.
         * @member {string} status
         * @memberof fqdp.UpdateReferenceRequest
         * @instance
         */
        UpdateReferenceRequest.prototype.status = "";

        /**
         * Creates a new UpdateReferenceRequest instance using the specified properties.
         * @function create
         * @memberof fqdp.UpdateReferenceRequest
         * @static
         * @param {fqdp.IUpdateReferenceRequest=} [properties] Properties to set
         * @returns {fqdp.UpdateReferenceRequest} UpdateReferenceRequest instance
         */
        UpdateReferenceRequest.create = function create(properties) {
            return new UpdateReferenceRequest(properties);
        };

        /**
         * Encodes the specified UpdateReferenceRequest message. Does not implicitly {@link fqdp.UpdateReferenceRequest.verify|verify} messages.
         * @function encode
         * @memberof fqdp.UpdateReferenceRequest
         * @static
         * @param {fqdp.IUpdateReferenceRequest} message UpdateReferenceRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UpdateReferenceRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
            if (message.link != null && Object.hasOwnProperty.call(message, "link"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.link);
            if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.type);
            if (message.externalUid != null && Object.hasOwnProperty.call(message, "externalUid"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.externalUid);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.description);
            if (message.metadataJson != null && Object.hasOwnProperty.call(message, "metadataJson"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.metadataJson);
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 7, wireType 2 =*/58).string(message.status);
            return writer;
        };

        /**
         * Encodes the specified UpdateReferenceRequest message, length delimited. Does not implicitly {@link fqdp.UpdateReferenceRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof fqdp.UpdateReferenceRequest
         * @static
         * @param {fqdp.IUpdateReferenceRequest} message UpdateReferenceRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UpdateReferenceRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an UpdateReferenceRequest message from the specified reader or buffer.
         * @function decode
         * @memberof fqdp.UpdateReferenceRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {fqdp.UpdateReferenceRequest} UpdateReferenceRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UpdateReferenceRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.fqdp.UpdateReferenceRequest();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.name = reader.string();
                        break;
                    }
                case 2: {
                        message.link = reader.string();
                        break;
                    }
                case 3: {
                        message.type = reader.string();
                        break;
                    }
                case 4: {
                        message.externalUid = reader.string();
                        break;
                    }
                case 5: {
                        message.description = reader.string();
                        break;
                    }
                case 6: {
                        message.metadataJson = reader.string();
                        break;
                    }
                case 7: {
                        message.status = reader.string();
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
         * Decodes an UpdateReferenceRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof fqdp.UpdateReferenceRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {fqdp.UpdateReferenceRequest} UpdateReferenceRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UpdateReferenceRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an UpdateReferenceRequest message.
         * @function verify
         * @memberof fqdp.UpdateReferenceRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        UpdateReferenceRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.link != null && message.hasOwnProperty("link"))
                if (!$util.isString(message.link))
                    return "link: string expected";
            if (message.type != null && message.hasOwnProperty("type"))
                if (!$util.isString(message.type))
                    return "type: string expected";
            if (message.externalUid != null && message.hasOwnProperty("externalUid"))
                if (!$util.isString(message.externalUid))
                    return "externalUid: string expected";
            if (message.description != null && message.hasOwnProperty("description"))
                if (!$util.isString(message.description))
                    return "description: string expected";
            if (message.metadataJson != null && message.hasOwnProperty("metadataJson"))
                if (!$util.isString(message.metadataJson))
                    return "metadataJson: string expected";
            if (message.status != null && message.hasOwnProperty("status"))
                if (!$util.isString(message.status))
                    return "status: string expected";
            return null;
        };

        /**
         * Creates an UpdateReferenceRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof fqdp.UpdateReferenceRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {fqdp.UpdateReferenceRequest} UpdateReferenceRequest
         */
        UpdateReferenceRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.fqdp.UpdateReferenceRequest)
                return object;
            let message = new $root.fqdp.UpdateReferenceRequest();
            if (object.name != null)
                message.name = String(object.name);
            if (object.link != null)
                message.link = String(object.link);
            if (object.type != null)
                message.type = String(object.type);
            if (object.externalUid != null)
                message.externalUid = String(object.externalUid);
            if (object.description != null)
                message.description = String(object.description);
            if (object.metadataJson != null)
                message.metadataJson = String(object.metadataJson);
            if (object.status != null)
                message.status = String(object.status);
            return message;
        };

        /**
         * Creates a plain object from an UpdateReferenceRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof fqdp.UpdateReferenceRequest
         * @static
         * @param {fqdp.UpdateReferenceRequest} message UpdateReferenceRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        UpdateReferenceRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.name = "";
                object.link = "";
                object.type = "";
                object.externalUid = "";
                object.description = "";
                object.metadataJson = "";
                object.status = "";
            }
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.link != null && message.hasOwnProperty("link"))
                object.link = message.link;
            if (message.type != null && message.hasOwnProperty("type"))
                object.type = message.type;
            if (message.externalUid != null && message.hasOwnProperty("externalUid"))
                object.externalUid = message.externalUid;
            if (message.description != null && message.hasOwnProperty("description"))
                object.description = message.description;
            if (message.metadataJson != null && message.hasOwnProperty("metadataJson"))
                object.metadataJson = message.metadataJson;
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = message.status;
            return object;
        };

        /**
         * Converts this UpdateReferenceRequest to JSON.
         * @function toJSON
         * @memberof fqdp.UpdateReferenceRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        UpdateReferenceRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for UpdateReferenceRequest
         * @function getTypeUrl
         * @memberof fqdp.UpdateReferenceRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        UpdateReferenceRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/fqdp.UpdateReferenceRequest";
        };

        return UpdateReferenceRequest;
    })();

    fqdp.Resource = (function() {

        /**
         * Properties of a Resource.
         * @memberof fqdp
         * @interface IResource
         * @property {string|null} [id] Resource id
         * @property {string|null} [name] Resource name
         * @property {string|null} [slug] Resource slug
         * @property {string|null} [description] Resource description
         * @property {fqdp.EntityStatus|null} [status] Resource status
         * @property {string|null} [metadataJson] Resource metadataJson
         * @property {string|null} [resourceName] Resource resourceName
         * @property {fqdp.ResourceType|null} [resourceType] Resource resourceType
         * @property {string|null} [resourceUrl] Resource resourceUrl
         * @property {number|null} [resourceSize] Resource resourceSize
         * @property {string|null} [fqdpId] Resource fqdpId
         * @property {string|null} [externalLinksJson] Resource externalLinksJson
         * @property {string|null} [projectId] Resource projectId
         * @property {string|null} [projectName] Resource projectName
         * @property {string|null} [applicationId] Resource applicationId
         * @property {string|null} [applicationName] Resource applicationName
         * @property {string|null} [teamId] Resource teamId
         * @property {string|null} [teamName] Resource teamName
         * @property {string|null} [workspaceId] Resource workspaceId
         * @property {string|null} [workspaceName] Resource workspaceName
         * @property {string|null} [organizationId] Resource organizationId
         * @property {string|null} [organizationName] Resource organizationName
         * @property {string|null} [createdBy] Resource createdBy
         * @property {string|null} [updatedBy] Resource updatedBy
         * @property {string|null} [createdAt] Resource createdAt
         * @property {string|null} [updatedAt] Resource updatedAt
         */

        /**
         * Constructs a new Resource.
         * @memberof fqdp
         * @classdesc Represents a Resource.
         * @implements IResource
         * @constructor
         * @param {fqdp.IResource=} [properties] Properties to set
         */
        function Resource(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Resource id.
         * @member {string} id
         * @memberof fqdp.Resource
         * @instance
         */
        Resource.prototype.id = "";

        /**
         * Resource name.
         * @member {string} name
         * @memberof fqdp.Resource
         * @instance
         */
        Resource.prototype.name = "";

        /**
         * Resource slug.
         * @member {string} slug
         * @memberof fqdp.Resource
         * @instance
         */
        Resource.prototype.slug = "";

        /**
         * Resource description.
         * @member {string} description
         * @memberof fqdp.Resource
         * @instance
         */
        Resource.prototype.description = "";

        /**
         * Resource status.
         * @member {fqdp.EntityStatus} status
         * @memberof fqdp.Resource
         * @instance
         */
        Resource.prototype.status = 0;

        /**
         * Resource metadataJson.
         * @member {string} metadataJson
         * @memberof fqdp.Resource
         * @instance
         */
        Resource.prototype.metadataJson = "";

        /**
         * Resource resourceName.
         * @member {string} resourceName
         * @memberof fqdp.Resource
         * @instance
         */
        Resource.prototype.resourceName = "";

        /**
         * Resource resourceType.
         * @member {fqdp.ResourceType} resourceType
         * @memberof fqdp.Resource
         * @instance
         */
        Resource.prototype.resourceType = 0;

        /**
         * Resource resourceUrl.
         * @member {string} resourceUrl
         * @memberof fqdp.Resource
         * @instance
         */
        Resource.prototype.resourceUrl = "";

        /**
         * Resource resourceSize.
         * @member {number} resourceSize
         * @memberof fqdp.Resource
         * @instance
         */
        Resource.prototype.resourceSize = 0;

        /**
         * Resource fqdpId.
         * @member {string} fqdpId
         * @memberof fqdp.Resource
         * @instance
         */
        Resource.prototype.fqdpId = "";

        /**
         * Resource externalLinksJson.
         * @member {string} externalLinksJson
         * @memberof fqdp.Resource
         * @instance
         */
        Resource.prototype.externalLinksJson = "";

        /**
         * Resource projectId.
         * @member {string} projectId
         * @memberof fqdp.Resource
         * @instance
         */
        Resource.prototype.projectId = "";

        /**
         * Resource projectName.
         * @member {string} projectName
         * @memberof fqdp.Resource
         * @instance
         */
        Resource.prototype.projectName = "";

        /**
         * Resource applicationId.
         * @member {string} applicationId
         * @memberof fqdp.Resource
         * @instance
         */
        Resource.prototype.applicationId = "";

        /**
         * Resource applicationName.
         * @member {string} applicationName
         * @memberof fqdp.Resource
         * @instance
         */
        Resource.prototype.applicationName = "";

        /**
         * Resource teamId.
         * @member {string} teamId
         * @memberof fqdp.Resource
         * @instance
         */
        Resource.prototype.teamId = "";

        /**
         * Resource teamName.
         * @member {string} teamName
         * @memberof fqdp.Resource
         * @instance
         */
        Resource.prototype.teamName = "";

        /**
         * Resource workspaceId.
         * @member {string} workspaceId
         * @memberof fqdp.Resource
         * @instance
         */
        Resource.prototype.workspaceId = "";

        /**
         * Resource workspaceName.
         * @member {string} workspaceName
         * @memberof fqdp.Resource
         * @instance
         */
        Resource.prototype.workspaceName = "";

        /**
         * Resource organizationId.
         * @member {string} organizationId
         * @memberof fqdp.Resource
         * @instance
         */
        Resource.prototype.organizationId = "";

        /**
         * Resource organizationName.
         * @member {string} organizationName
         * @memberof fqdp.Resource
         * @instance
         */
        Resource.prototype.organizationName = "";

        /**
         * Resource createdBy.
         * @member {string} createdBy
         * @memberof fqdp.Resource
         * @instance
         */
        Resource.prototype.createdBy = "";

        /**
         * Resource updatedBy.
         * @member {string} updatedBy
         * @memberof fqdp.Resource
         * @instance
         */
        Resource.prototype.updatedBy = "";

        /**
         * Resource createdAt.
         * @member {string} createdAt
         * @memberof fqdp.Resource
         * @instance
         */
        Resource.prototype.createdAt = "";

        /**
         * Resource updatedAt.
         * @member {string} updatedAt
         * @memberof fqdp.Resource
         * @instance
         */
        Resource.prototype.updatedAt = "";

        /**
         * Creates a new Resource instance using the specified properties.
         * @function create
         * @memberof fqdp.Resource
         * @static
         * @param {fqdp.IResource=} [properties] Properties to set
         * @returns {fqdp.Resource} Resource instance
         */
        Resource.create = function create(properties) {
            return new Resource(properties);
        };

        /**
         * Encodes the specified Resource message. Does not implicitly {@link fqdp.Resource.verify|verify} messages.
         * @function encode
         * @memberof fqdp.Resource
         * @static
         * @param {fqdp.IResource} message Resource message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Resource.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
            if (message.slug != null && Object.hasOwnProperty.call(message, "slug"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.slug);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.description);
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 5, wireType 0 =*/40).int32(message.status);
            if (message.metadataJson != null && Object.hasOwnProperty.call(message, "metadataJson"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.metadataJson);
            if (message.resourceName != null && Object.hasOwnProperty.call(message, "resourceName"))
                writer.uint32(/* id 7, wireType 2 =*/58).string(message.resourceName);
            if (message.resourceType != null && Object.hasOwnProperty.call(message, "resourceType"))
                writer.uint32(/* id 8, wireType 0 =*/64).int32(message.resourceType);
            if (message.resourceUrl != null && Object.hasOwnProperty.call(message, "resourceUrl"))
                writer.uint32(/* id 9, wireType 2 =*/74).string(message.resourceUrl);
            if (message.resourceSize != null && Object.hasOwnProperty.call(message, "resourceSize"))
                writer.uint32(/* id 10, wireType 0 =*/80).int32(message.resourceSize);
            if (message.fqdpId != null && Object.hasOwnProperty.call(message, "fqdpId"))
                writer.uint32(/* id 11, wireType 2 =*/90).string(message.fqdpId);
            if (message.externalLinksJson != null && Object.hasOwnProperty.call(message, "externalLinksJson"))
                writer.uint32(/* id 12, wireType 2 =*/98).string(message.externalLinksJson);
            if (message.projectId != null && Object.hasOwnProperty.call(message, "projectId"))
                writer.uint32(/* id 13, wireType 2 =*/106).string(message.projectId);
            if (message.projectName != null && Object.hasOwnProperty.call(message, "projectName"))
                writer.uint32(/* id 14, wireType 2 =*/114).string(message.projectName);
            if (message.applicationId != null && Object.hasOwnProperty.call(message, "applicationId"))
                writer.uint32(/* id 15, wireType 2 =*/122).string(message.applicationId);
            if (message.applicationName != null && Object.hasOwnProperty.call(message, "applicationName"))
                writer.uint32(/* id 16, wireType 2 =*/130).string(message.applicationName);
            if (message.teamId != null && Object.hasOwnProperty.call(message, "teamId"))
                writer.uint32(/* id 17, wireType 2 =*/138).string(message.teamId);
            if (message.teamName != null && Object.hasOwnProperty.call(message, "teamName"))
                writer.uint32(/* id 18, wireType 2 =*/146).string(message.teamName);
            if (message.workspaceId != null && Object.hasOwnProperty.call(message, "workspaceId"))
                writer.uint32(/* id 19, wireType 2 =*/154).string(message.workspaceId);
            if (message.workspaceName != null && Object.hasOwnProperty.call(message, "workspaceName"))
                writer.uint32(/* id 20, wireType 2 =*/162).string(message.workspaceName);
            if (message.organizationId != null && Object.hasOwnProperty.call(message, "organizationId"))
                writer.uint32(/* id 21, wireType 2 =*/170).string(message.organizationId);
            if (message.organizationName != null && Object.hasOwnProperty.call(message, "organizationName"))
                writer.uint32(/* id 22, wireType 2 =*/178).string(message.organizationName);
            if (message.createdBy != null && Object.hasOwnProperty.call(message, "createdBy"))
                writer.uint32(/* id 23, wireType 2 =*/186).string(message.createdBy);
            if (message.updatedBy != null && Object.hasOwnProperty.call(message, "updatedBy"))
                writer.uint32(/* id 24, wireType 2 =*/194).string(message.updatedBy);
            if (message.createdAt != null && Object.hasOwnProperty.call(message, "createdAt"))
                writer.uint32(/* id 25, wireType 2 =*/202).string(message.createdAt);
            if (message.updatedAt != null && Object.hasOwnProperty.call(message, "updatedAt"))
                writer.uint32(/* id 26, wireType 2 =*/210).string(message.updatedAt);
            return writer;
        };

        /**
         * Encodes the specified Resource message, length delimited. Does not implicitly {@link fqdp.Resource.verify|verify} messages.
         * @function encodeDelimited
         * @memberof fqdp.Resource
         * @static
         * @param {fqdp.IResource} message Resource message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Resource.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Resource message from the specified reader or buffer.
         * @function decode
         * @memberof fqdp.Resource
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {fqdp.Resource} Resource
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Resource.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.fqdp.Resource();
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
                        message.slug = reader.string();
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
                        message.metadataJson = reader.string();
                        break;
                    }
                case 7: {
                        message.resourceName = reader.string();
                        break;
                    }
                case 8: {
                        message.resourceType = reader.int32();
                        break;
                    }
                case 9: {
                        message.resourceUrl = reader.string();
                        break;
                    }
                case 10: {
                        message.resourceSize = reader.int32();
                        break;
                    }
                case 11: {
                        message.fqdpId = reader.string();
                        break;
                    }
                case 12: {
                        message.externalLinksJson = reader.string();
                        break;
                    }
                case 13: {
                        message.projectId = reader.string();
                        break;
                    }
                case 14: {
                        message.projectName = reader.string();
                        break;
                    }
                case 15: {
                        message.applicationId = reader.string();
                        break;
                    }
                case 16: {
                        message.applicationName = reader.string();
                        break;
                    }
                case 17: {
                        message.teamId = reader.string();
                        break;
                    }
                case 18: {
                        message.teamName = reader.string();
                        break;
                    }
                case 19: {
                        message.workspaceId = reader.string();
                        break;
                    }
                case 20: {
                        message.workspaceName = reader.string();
                        break;
                    }
                case 21: {
                        message.organizationId = reader.string();
                        break;
                    }
                case 22: {
                        message.organizationName = reader.string();
                        break;
                    }
                case 23: {
                        message.createdBy = reader.string();
                        break;
                    }
                case 24: {
                        message.updatedBy = reader.string();
                        break;
                    }
                case 25: {
                        message.createdAt = reader.string();
                        break;
                    }
                case 26: {
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
         * Decodes a Resource message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof fqdp.Resource
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {fqdp.Resource} Resource
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Resource.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Resource message.
         * @function verify
         * @memberof fqdp.Resource
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Resource.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.slug != null && message.hasOwnProperty("slug"))
                if (!$util.isString(message.slug))
                    return "slug: string expected";
            if (message.description != null && message.hasOwnProperty("description"))
                if (!$util.isString(message.description))
                    return "description: string expected";
            if (message.status != null && message.hasOwnProperty("status"))
                switch (message.status) {
                default:
                    return "status: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                    break;
                }
            if (message.metadataJson != null && message.hasOwnProperty("metadataJson"))
                if (!$util.isString(message.metadataJson))
                    return "metadataJson: string expected";
            if (message.resourceName != null && message.hasOwnProperty("resourceName"))
                if (!$util.isString(message.resourceName))
                    return "resourceName: string expected";
            if (message.resourceType != null && message.hasOwnProperty("resourceType"))
                switch (message.resourceType) {
                default:
                    return "resourceType: enum value expected";
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
            if (message.resourceUrl != null && message.hasOwnProperty("resourceUrl"))
                if (!$util.isString(message.resourceUrl))
                    return "resourceUrl: string expected";
            if (message.resourceSize != null && message.hasOwnProperty("resourceSize"))
                if (!$util.isInteger(message.resourceSize))
                    return "resourceSize: integer expected";
            if (message.fqdpId != null && message.hasOwnProperty("fqdpId"))
                if (!$util.isString(message.fqdpId))
                    return "fqdpId: string expected";
            if (message.externalLinksJson != null && message.hasOwnProperty("externalLinksJson"))
                if (!$util.isString(message.externalLinksJson))
                    return "externalLinksJson: string expected";
            if (message.projectId != null && message.hasOwnProperty("projectId"))
                if (!$util.isString(message.projectId))
                    return "projectId: string expected";
            if (message.projectName != null && message.hasOwnProperty("projectName"))
                if (!$util.isString(message.projectName))
                    return "projectName: string expected";
            if (message.applicationId != null && message.hasOwnProperty("applicationId"))
                if (!$util.isString(message.applicationId))
                    return "applicationId: string expected";
            if (message.applicationName != null && message.hasOwnProperty("applicationName"))
                if (!$util.isString(message.applicationName))
                    return "applicationName: string expected";
            if (message.teamId != null && message.hasOwnProperty("teamId"))
                if (!$util.isString(message.teamId))
                    return "teamId: string expected";
            if (message.teamName != null && message.hasOwnProperty("teamName"))
                if (!$util.isString(message.teamName))
                    return "teamName: string expected";
            if (message.workspaceId != null && message.hasOwnProperty("workspaceId"))
                if (!$util.isString(message.workspaceId))
                    return "workspaceId: string expected";
            if (message.workspaceName != null && message.hasOwnProperty("workspaceName"))
                if (!$util.isString(message.workspaceName))
                    return "workspaceName: string expected";
            if (message.organizationId != null && message.hasOwnProperty("organizationId"))
                if (!$util.isString(message.organizationId))
                    return "organizationId: string expected";
            if (message.organizationName != null && message.hasOwnProperty("organizationName"))
                if (!$util.isString(message.organizationName))
                    return "organizationName: string expected";
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
            return null;
        };

        /**
         * Creates a Resource message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof fqdp.Resource
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {fqdp.Resource} Resource
         */
        Resource.fromObject = function fromObject(object) {
            if (object instanceof $root.fqdp.Resource)
                return object;
            let message = new $root.fqdp.Resource();
            if (object.id != null)
                message.id = String(object.id);
            if (object.name != null)
                message.name = String(object.name);
            if (object.slug != null)
                message.slug = String(object.slug);
            if (object.description != null)
                message.description = String(object.description);
            switch (object.status) {
            default:
                if (typeof object.status === "number") {
                    message.status = object.status;
                    break;
                }
                break;
            case "ENTITY_STATUS_UNSPECIFIED":
            case 0:
                message.status = 0;
                break;
            case "ACTIVE":
            case 1:
                message.status = 1;
                break;
            case "INACTIVE":
            case 2:
                message.status = 2;
                break;
            case "ARCHIVED":
            case 3:
                message.status = 3;
                break;
            }
            if (object.metadataJson != null)
                message.metadataJson = String(object.metadataJson);
            if (object.resourceName != null)
                message.resourceName = String(object.resourceName);
            switch (object.resourceType) {
            default:
                if (typeof object.resourceType === "number") {
                    message.resourceType = object.resourceType;
                    break;
                }
                break;
            case "RESOURCE_TYPE_UNSPECIFIED":
            case 0:
                message.resourceType = 0;
                break;
            case "FIGMA":
            case 1:
                message.resourceType = 1;
                break;
            case "SKETCH":
            case 2:
                message.resourceType = 2;
                break;
            case "XD":
            case 3:
                message.resourceType = 3;
                break;
            case "PDF":
            case 4:
                message.resourceType = 4;
                break;
            case "IMAGE":
            case 5:
                message.resourceType = 5;
                break;
            case "CODE":
            case 6:
                message.resourceType = 6;
                break;
            case "DOCUMENT":
            case 7:
                message.resourceType = 7;
                break;
            case "OTHER":
            case 8:
                message.resourceType = 8;
                break;
            }
            if (object.resourceUrl != null)
                message.resourceUrl = String(object.resourceUrl);
            if (object.resourceSize != null)
                message.resourceSize = object.resourceSize | 0;
            if (object.fqdpId != null)
                message.fqdpId = String(object.fqdpId);
            if (object.externalLinksJson != null)
                message.externalLinksJson = String(object.externalLinksJson);
            if (object.projectId != null)
                message.projectId = String(object.projectId);
            if (object.projectName != null)
                message.projectName = String(object.projectName);
            if (object.applicationId != null)
                message.applicationId = String(object.applicationId);
            if (object.applicationName != null)
                message.applicationName = String(object.applicationName);
            if (object.teamId != null)
                message.teamId = String(object.teamId);
            if (object.teamName != null)
                message.teamName = String(object.teamName);
            if (object.workspaceId != null)
                message.workspaceId = String(object.workspaceId);
            if (object.workspaceName != null)
                message.workspaceName = String(object.workspaceName);
            if (object.organizationId != null)
                message.organizationId = String(object.organizationId);
            if (object.organizationName != null)
                message.organizationName = String(object.organizationName);
            if (object.createdBy != null)
                message.createdBy = String(object.createdBy);
            if (object.updatedBy != null)
                message.updatedBy = String(object.updatedBy);
            if (object.createdAt != null)
                message.createdAt = String(object.createdAt);
            if (object.updatedAt != null)
                message.updatedAt = String(object.updatedAt);
            return message;
        };

        /**
         * Creates a plain object from a Resource message. Also converts values to other types if specified.
         * @function toObject
         * @memberof fqdp.Resource
         * @static
         * @param {fqdp.Resource} message Resource
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Resource.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.id = "";
                object.name = "";
                object.slug = "";
                object.description = "";
                object.status = options.enums === String ? "ENTITY_STATUS_UNSPECIFIED" : 0;
                object.metadataJson = "";
                object.resourceName = "";
                object.resourceType = options.enums === String ? "RESOURCE_TYPE_UNSPECIFIED" : 0;
                object.resourceUrl = "";
                object.resourceSize = 0;
                object.fqdpId = "";
                object.externalLinksJson = "";
                object.projectId = "";
                object.projectName = "";
                object.applicationId = "";
                object.applicationName = "";
                object.teamId = "";
                object.teamName = "";
                object.workspaceId = "";
                object.workspaceName = "";
                object.organizationId = "";
                object.organizationName = "";
                object.createdBy = "";
                object.updatedBy = "";
                object.createdAt = "";
                object.updatedAt = "";
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.slug != null && message.hasOwnProperty("slug"))
                object.slug = message.slug;
            if (message.description != null && message.hasOwnProperty("description"))
                object.description = message.description;
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = options.enums === String ? $root.fqdp.EntityStatus[message.status] === undefined ? message.status : $root.fqdp.EntityStatus[message.status] : message.status;
            if (message.metadataJson != null && message.hasOwnProperty("metadataJson"))
                object.metadataJson = message.metadataJson;
            if (message.resourceName != null && message.hasOwnProperty("resourceName"))
                object.resourceName = message.resourceName;
            if (message.resourceType != null && message.hasOwnProperty("resourceType"))
                object.resourceType = options.enums === String ? $root.fqdp.ResourceType[message.resourceType] === undefined ? message.resourceType : $root.fqdp.ResourceType[message.resourceType] : message.resourceType;
            if (message.resourceUrl != null && message.hasOwnProperty("resourceUrl"))
                object.resourceUrl = message.resourceUrl;
            if (message.resourceSize != null && message.hasOwnProperty("resourceSize"))
                object.resourceSize = message.resourceSize;
            if (message.fqdpId != null && message.hasOwnProperty("fqdpId"))
                object.fqdpId = message.fqdpId;
            if (message.externalLinksJson != null && message.hasOwnProperty("externalLinksJson"))
                object.externalLinksJson = message.externalLinksJson;
            if (message.projectId != null && message.hasOwnProperty("projectId"))
                object.projectId = message.projectId;
            if (message.projectName != null && message.hasOwnProperty("projectName"))
                object.projectName = message.projectName;
            if (message.applicationId != null && message.hasOwnProperty("applicationId"))
                object.applicationId = message.applicationId;
            if (message.applicationName != null && message.hasOwnProperty("applicationName"))
                object.applicationName = message.applicationName;
            if (message.teamId != null && message.hasOwnProperty("teamId"))
                object.teamId = message.teamId;
            if (message.teamName != null && message.hasOwnProperty("teamName"))
                object.teamName = message.teamName;
            if (message.workspaceId != null && message.hasOwnProperty("workspaceId"))
                object.workspaceId = message.workspaceId;
            if (message.workspaceName != null && message.hasOwnProperty("workspaceName"))
                object.workspaceName = message.workspaceName;
            if (message.organizationId != null && message.hasOwnProperty("organizationId"))
                object.organizationId = message.organizationId;
            if (message.organizationName != null && message.hasOwnProperty("organizationName"))
                object.organizationName = message.organizationName;
            if (message.createdBy != null && message.hasOwnProperty("createdBy"))
                object.createdBy = message.createdBy;
            if (message.updatedBy != null && message.hasOwnProperty("updatedBy"))
                object.updatedBy = message.updatedBy;
            if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                object.createdAt = message.createdAt;
            if (message.updatedAt != null && message.hasOwnProperty("updatedAt"))
                object.updatedAt = message.updatedAt;
            return object;
        };

        /**
         * Converts this Resource to JSON.
         * @function toJSON
         * @memberof fqdp.Resource
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Resource.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Resource
         * @function getTypeUrl
         * @memberof fqdp.Resource
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Resource.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/fqdp.Resource";
        };

        return Resource;
    })();

    fqdp.ResourceList = (function() {

        /**
         * Properties of a ResourceList.
         * @memberof fqdp
         * @interface IResourceList
         * @property {Array.<fqdp.IResource>|null} [data] ResourceList data
         * @property {fqdp.IPaginationMeta|null} [meta] ResourceList meta
         */

        /**
         * Constructs a new ResourceList.
         * @memberof fqdp
         * @classdesc Represents a ResourceList.
         * @implements IResourceList
         * @constructor
         * @param {fqdp.IResourceList=} [properties] Properties to set
         */
        function ResourceList(properties) {
            this.data = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ResourceList data.
         * @member {Array.<fqdp.IResource>} data
         * @memberof fqdp.ResourceList
         * @instance
         */
        ResourceList.prototype.data = $util.emptyArray;

        /**
         * ResourceList meta.
         * @member {fqdp.IPaginationMeta|null|undefined} meta
         * @memberof fqdp.ResourceList
         * @instance
         */
        ResourceList.prototype.meta = null;

        /**
         * Creates a new ResourceList instance using the specified properties.
         * @function create
         * @memberof fqdp.ResourceList
         * @static
         * @param {fqdp.IResourceList=} [properties] Properties to set
         * @returns {fqdp.ResourceList} ResourceList instance
         */
        ResourceList.create = function create(properties) {
            return new ResourceList(properties);
        };

        /**
         * Encodes the specified ResourceList message. Does not implicitly {@link fqdp.ResourceList.verify|verify} messages.
         * @function encode
         * @memberof fqdp.ResourceList
         * @static
         * @param {fqdp.IResourceList} message ResourceList message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ResourceList.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.data != null && message.data.length)
                for (let i = 0; i < message.data.length; ++i)
                    $root.fqdp.Resource.encode(message.data[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.meta != null && Object.hasOwnProperty.call(message, "meta"))
                $root.fqdp.PaginationMeta.encode(message.meta, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified ResourceList message, length delimited. Does not implicitly {@link fqdp.ResourceList.verify|verify} messages.
         * @function encodeDelimited
         * @memberof fqdp.ResourceList
         * @static
         * @param {fqdp.IResourceList} message ResourceList message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ResourceList.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ResourceList message from the specified reader or buffer.
         * @function decode
         * @memberof fqdp.ResourceList
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {fqdp.ResourceList} ResourceList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ResourceList.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.fqdp.ResourceList();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.data && message.data.length))
                            message.data = [];
                        message.data.push($root.fqdp.Resource.decode(reader, reader.uint32()));
                        break;
                    }
                case 2: {
                        message.meta = $root.fqdp.PaginationMeta.decode(reader, reader.uint32());
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
         * Decodes a ResourceList message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof fqdp.ResourceList
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {fqdp.ResourceList} ResourceList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ResourceList.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ResourceList message.
         * @function verify
         * @memberof fqdp.ResourceList
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ResourceList.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.data != null && message.hasOwnProperty("data")) {
                if (!Array.isArray(message.data))
                    return "data: array expected";
                for (let i = 0; i < message.data.length; ++i) {
                    let error = $root.fqdp.Resource.verify(message.data[i]);
                    if (error)
                        return "data." + error;
                }
            }
            if (message.meta != null && message.hasOwnProperty("meta")) {
                let error = $root.fqdp.PaginationMeta.verify(message.meta);
                if (error)
                    return "meta." + error;
            }
            return null;
        };

        /**
         * Creates a ResourceList message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof fqdp.ResourceList
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {fqdp.ResourceList} ResourceList
         */
        ResourceList.fromObject = function fromObject(object) {
            if (object instanceof $root.fqdp.ResourceList)
                return object;
            let message = new $root.fqdp.ResourceList();
            if (object.data) {
                if (!Array.isArray(object.data))
                    throw TypeError(".fqdp.ResourceList.data: array expected");
                message.data = [];
                for (let i = 0; i < object.data.length; ++i) {
                    if (typeof object.data[i] !== "object")
                        throw TypeError(".fqdp.ResourceList.data: object expected");
                    message.data[i] = $root.fqdp.Resource.fromObject(object.data[i]);
                }
            }
            if (object.meta != null) {
                if (typeof object.meta !== "object")
                    throw TypeError(".fqdp.ResourceList.meta: object expected");
                message.meta = $root.fqdp.PaginationMeta.fromObject(object.meta);
            }
            return message;
        };

        /**
         * Creates a plain object from a ResourceList message. Also converts values to other types if specified.
         * @function toObject
         * @memberof fqdp.ResourceList
         * @static
         * @param {fqdp.ResourceList} message ResourceList
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ResourceList.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.data = [];
            if (options.defaults)
                object.meta = null;
            if (message.data && message.data.length) {
                object.data = [];
                for (let j = 0; j < message.data.length; ++j)
                    object.data[j] = $root.fqdp.Resource.toObject(message.data[j], options);
            }
            if (message.meta != null && message.hasOwnProperty("meta"))
                object.meta = $root.fqdp.PaginationMeta.toObject(message.meta, options);
            return object;
        };

        /**
         * Converts this ResourceList to JSON.
         * @function toJSON
         * @memberof fqdp.ResourceList
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ResourceList.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ResourceList
         * @function getTypeUrl
         * @memberof fqdp.ResourceList
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ResourceList.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/fqdp.ResourceList";
        };

        return ResourceList;
    })();

    fqdp.CreateResourceRequest = (function() {

        /**
         * Properties of a CreateResourceRequest.
         * @memberof fqdp
         * @interface ICreateResourceRequest
         * @property {string|null} [name] CreateResourceRequest name
         * @property {string|null} [description] CreateResourceRequest description
         * @property {string|null} [resourceName] CreateResourceRequest resourceName
         * @property {fqdp.ResourceType|null} [resourceType] CreateResourceRequest resourceType
         * @property {string|null} [resourceUrl] CreateResourceRequest resourceUrl
         * @property {number|null} [resourceSize] CreateResourceRequest resourceSize
         * @property {string|null} [projectId] CreateResourceRequest projectId
         * @property {string|null} [externalLinksJson] CreateResourceRequest externalLinksJson
         * @property {string|null} [metadataJson] CreateResourceRequest metadataJson
         */

        /**
         * Constructs a new CreateResourceRequest.
         * @memberof fqdp
         * @classdesc Represents a CreateResourceRequest.
         * @implements ICreateResourceRequest
         * @constructor
         * @param {fqdp.ICreateResourceRequest=} [properties] Properties to set
         */
        function CreateResourceRequest(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * CreateResourceRequest name.
         * @member {string} name
         * @memberof fqdp.CreateResourceRequest
         * @instance
         */
        CreateResourceRequest.prototype.name = "";

        /**
         * CreateResourceRequest description.
         * @member {string} description
         * @memberof fqdp.CreateResourceRequest
         * @instance
         */
        CreateResourceRequest.prototype.description = "";

        /**
         * CreateResourceRequest resourceName.
         * @member {string} resourceName
         * @memberof fqdp.CreateResourceRequest
         * @instance
         */
        CreateResourceRequest.prototype.resourceName = "";

        /**
         * CreateResourceRequest resourceType.
         * @member {fqdp.ResourceType} resourceType
         * @memberof fqdp.CreateResourceRequest
         * @instance
         */
        CreateResourceRequest.prototype.resourceType = 0;

        /**
         * CreateResourceRequest resourceUrl.
         * @member {string} resourceUrl
         * @memberof fqdp.CreateResourceRequest
         * @instance
         */
        CreateResourceRequest.prototype.resourceUrl = "";

        /**
         * CreateResourceRequest resourceSize.
         * @member {number} resourceSize
         * @memberof fqdp.CreateResourceRequest
         * @instance
         */
        CreateResourceRequest.prototype.resourceSize = 0;

        /**
         * CreateResourceRequest projectId.
         * @member {string} projectId
         * @memberof fqdp.CreateResourceRequest
         * @instance
         */
        CreateResourceRequest.prototype.projectId = "";

        /**
         * CreateResourceRequest externalLinksJson.
         * @member {string} externalLinksJson
         * @memberof fqdp.CreateResourceRequest
         * @instance
         */
        CreateResourceRequest.prototype.externalLinksJson = "";

        /**
         * CreateResourceRequest metadataJson.
         * @member {string} metadataJson
         * @memberof fqdp.CreateResourceRequest
         * @instance
         */
        CreateResourceRequest.prototype.metadataJson = "";

        /**
         * Creates a new CreateResourceRequest instance using the specified properties.
         * @function create
         * @memberof fqdp.CreateResourceRequest
         * @static
         * @param {fqdp.ICreateResourceRequest=} [properties] Properties to set
         * @returns {fqdp.CreateResourceRequest} CreateResourceRequest instance
         */
        CreateResourceRequest.create = function create(properties) {
            return new CreateResourceRequest(properties);
        };

        /**
         * Encodes the specified CreateResourceRequest message. Does not implicitly {@link fqdp.CreateResourceRequest.verify|verify} messages.
         * @function encode
         * @memberof fqdp.CreateResourceRequest
         * @static
         * @param {fqdp.ICreateResourceRequest} message CreateResourceRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CreateResourceRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.description);
            if (message.resourceName != null && Object.hasOwnProperty.call(message, "resourceName"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.resourceName);
            if (message.resourceType != null && Object.hasOwnProperty.call(message, "resourceType"))
                writer.uint32(/* id 5, wireType 0 =*/40).int32(message.resourceType);
            if (message.resourceUrl != null && Object.hasOwnProperty.call(message, "resourceUrl"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.resourceUrl);
            if (message.resourceSize != null && Object.hasOwnProperty.call(message, "resourceSize"))
                writer.uint32(/* id 7, wireType 0 =*/56).int32(message.resourceSize);
            if (message.projectId != null && Object.hasOwnProperty.call(message, "projectId"))
                writer.uint32(/* id 8, wireType 2 =*/66).string(message.projectId);
            if (message.externalLinksJson != null && Object.hasOwnProperty.call(message, "externalLinksJson"))
                writer.uint32(/* id 9, wireType 2 =*/74).string(message.externalLinksJson);
            if (message.metadataJson != null && Object.hasOwnProperty.call(message, "metadataJson"))
                writer.uint32(/* id 10, wireType 2 =*/82).string(message.metadataJson);
            return writer;
        };

        /**
         * Encodes the specified CreateResourceRequest message, length delimited. Does not implicitly {@link fqdp.CreateResourceRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof fqdp.CreateResourceRequest
         * @static
         * @param {fqdp.ICreateResourceRequest} message CreateResourceRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CreateResourceRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a CreateResourceRequest message from the specified reader or buffer.
         * @function decode
         * @memberof fqdp.CreateResourceRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {fqdp.CreateResourceRequest} CreateResourceRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CreateResourceRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.fqdp.CreateResourceRequest();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.name = reader.string();
                        break;
                    }
                case 3: {
                        message.description = reader.string();
                        break;
                    }
                case 4: {
                        message.resourceName = reader.string();
                        break;
                    }
                case 5: {
                        message.resourceType = reader.int32();
                        break;
                    }
                case 6: {
                        message.resourceUrl = reader.string();
                        break;
                    }
                case 7: {
                        message.resourceSize = reader.int32();
                        break;
                    }
                case 8: {
                        message.projectId = reader.string();
                        break;
                    }
                case 9: {
                        message.externalLinksJson = reader.string();
                        break;
                    }
                case 10: {
                        message.metadataJson = reader.string();
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
         * Decodes a CreateResourceRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof fqdp.CreateResourceRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {fqdp.CreateResourceRequest} CreateResourceRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CreateResourceRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a CreateResourceRequest message.
         * @function verify
         * @memberof fqdp.CreateResourceRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CreateResourceRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.description != null && message.hasOwnProperty("description"))
                if (!$util.isString(message.description))
                    return "description: string expected";
            if (message.resourceName != null && message.hasOwnProperty("resourceName"))
                if (!$util.isString(message.resourceName))
                    return "resourceName: string expected";
            if (message.resourceType != null && message.hasOwnProperty("resourceType"))
                switch (message.resourceType) {
                default:
                    return "resourceType: enum value expected";
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
            if (message.resourceUrl != null && message.hasOwnProperty("resourceUrl"))
                if (!$util.isString(message.resourceUrl))
                    return "resourceUrl: string expected";
            if (message.resourceSize != null && message.hasOwnProperty("resourceSize"))
                if (!$util.isInteger(message.resourceSize))
                    return "resourceSize: integer expected";
            if (message.projectId != null && message.hasOwnProperty("projectId"))
                if (!$util.isString(message.projectId))
                    return "projectId: string expected";
            if (message.externalLinksJson != null && message.hasOwnProperty("externalLinksJson"))
                if (!$util.isString(message.externalLinksJson))
                    return "externalLinksJson: string expected";
            if (message.metadataJson != null && message.hasOwnProperty("metadataJson"))
                if (!$util.isString(message.metadataJson))
                    return "metadataJson: string expected";
            return null;
        };

        /**
         * Creates a CreateResourceRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof fqdp.CreateResourceRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {fqdp.CreateResourceRequest} CreateResourceRequest
         */
        CreateResourceRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.fqdp.CreateResourceRequest)
                return object;
            let message = new $root.fqdp.CreateResourceRequest();
            if (object.name != null)
                message.name = String(object.name);
            if (object.description != null)
                message.description = String(object.description);
            if (object.resourceName != null)
                message.resourceName = String(object.resourceName);
            switch (object.resourceType) {
            default:
                if (typeof object.resourceType === "number") {
                    message.resourceType = object.resourceType;
                    break;
                }
                break;
            case "RESOURCE_TYPE_UNSPECIFIED":
            case 0:
                message.resourceType = 0;
                break;
            case "FIGMA":
            case 1:
                message.resourceType = 1;
                break;
            case "SKETCH":
            case 2:
                message.resourceType = 2;
                break;
            case "XD":
            case 3:
                message.resourceType = 3;
                break;
            case "PDF":
            case 4:
                message.resourceType = 4;
                break;
            case "IMAGE":
            case 5:
                message.resourceType = 5;
                break;
            case "CODE":
            case 6:
                message.resourceType = 6;
                break;
            case "DOCUMENT":
            case 7:
                message.resourceType = 7;
                break;
            case "OTHER":
            case 8:
                message.resourceType = 8;
                break;
            }
            if (object.resourceUrl != null)
                message.resourceUrl = String(object.resourceUrl);
            if (object.resourceSize != null)
                message.resourceSize = object.resourceSize | 0;
            if (object.projectId != null)
                message.projectId = String(object.projectId);
            if (object.externalLinksJson != null)
                message.externalLinksJson = String(object.externalLinksJson);
            if (object.metadataJson != null)
                message.metadataJson = String(object.metadataJson);
            return message;
        };

        /**
         * Creates a plain object from a CreateResourceRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof fqdp.CreateResourceRequest
         * @static
         * @param {fqdp.CreateResourceRequest} message CreateResourceRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CreateResourceRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.name = "";
                object.description = "";
                object.resourceName = "";
                object.resourceType = options.enums === String ? "RESOURCE_TYPE_UNSPECIFIED" : 0;
                object.resourceUrl = "";
                object.resourceSize = 0;
                object.projectId = "";
                object.externalLinksJson = "";
                object.metadataJson = "";
            }
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.description != null && message.hasOwnProperty("description"))
                object.description = message.description;
            if (message.resourceName != null && message.hasOwnProperty("resourceName"))
                object.resourceName = message.resourceName;
            if (message.resourceType != null && message.hasOwnProperty("resourceType"))
                object.resourceType = options.enums === String ? $root.fqdp.ResourceType[message.resourceType] === undefined ? message.resourceType : $root.fqdp.ResourceType[message.resourceType] : message.resourceType;
            if (message.resourceUrl != null && message.hasOwnProperty("resourceUrl"))
                object.resourceUrl = message.resourceUrl;
            if (message.resourceSize != null && message.hasOwnProperty("resourceSize"))
                object.resourceSize = message.resourceSize;
            if (message.projectId != null && message.hasOwnProperty("projectId"))
                object.projectId = message.projectId;
            if (message.externalLinksJson != null && message.hasOwnProperty("externalLinksJson"))
                object.externalLinksJson = message.externalLinksJson;
            if (message.metadataJson != null && message.hasOwnProperty("metadataJson"))
                object.metadataJson = message.metadataJson;
            return object;
        };

        /**
         * Converts this CreateResourceRequest to JSON.
         * @function toJSON
         * @memberof fqdp.CreateResourceRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CreateResourceRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for CreateResourceRequest
         * @function getTypeUrl
         * @memberof fqdp.CreateResourceRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        CreateResourceRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/fqdp.CreateResourceRequest";
        };

        return CreateResourceRequest;
    })();

    fqdp.UpdateResourceRequest = (function() {

        /**
         * Properties of an UpdateResourceRequest.
         * @memberof fqdp
         * @interface IUpdateResourceRequest
         * @property {string|null} [name] UpdateResourceRequest name
         * @property {string|null} [description] UpdateResourceRequest description
         * @property {fqdp.EntityStatus|null} [status] UpdateResourceRequest status
         * @property {string|null} [resourceName] UpdateResourceRequest resourceName
         * @property {fqdp.ResourceType|null} [resourceType] UpdateResourceRequest resourceType
         * @property {string|null} [resourceUrl] UpdateResourceRequest resourceUrl
         * @property {number|null} [resourceSize] UpdateResourceRequest resourceSize
         * @property {string|null} [externalLinksJson] UpdateResourceRequest externalLinksJson
         * @property {string|null} [metadataJson] UpdateResourceRequest metadataJson
         */

        /**
         * Constructs a new UpdateResourceRequest.
         * @memberof fqdp
         * @classdesc Represents an UpdateResourceRequest.
         * @implements IUpdateResourceRequest
         * @constructor
         * @param {fqdp.IUpdateResourceRequest=} [properties] Properties to set
         */
        function UpdateResourceRequest(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * UpdateResourceRequest name.
         * @member {string} name
         * @memberof fqdp.UpdateResourceRequest
         * @instance
         */
        UpdateResourceRequest.prototype.name = "";

        /**
         * UpdateResourceRequest description.
         * @member {string} description
         * @memberof fqdp.UpdateResourceRequest
         * @instance
         */
        UpdateResourceRequest.prototype.description = "";

        /**
         * UpdateResourceRequest status.
         * @member {fqdp.EntityStatus} status
         * @memberof fqdp.UpdateResourceRequest
         * @instance
         */
        UpdateResourceRequest.prototype.status = 0;

        /**
         * UpdateResourceRequest resourceName.
         * @member {string} resourceName
         * @memberof fqdp.UpdateResourceRequest
         * @instance
         */
        UpdateResourceRequest.prototype.resourceName = "";

        /**
         * UpdateResourceRequest resourceType.
         * @member {fqdp.ResourceType} resourceType
         * @memberof fqdp.UpdateResourceRequest
         * @instance
         */
        UpdateResourceRequest.prototype.resourceType = 0;

        /**
         * UpdateResourceRequest resourceUrl.
         * @member {string} resourceUrl
         * @memberof fqdp.UpdateResourceRequest
         * @instance
         */
        UpdateResourceRequest.prototype.resourceUrl = "";

        /**
         * UpdateResourceRequest resourceSize.
         * @member {number} resourceSize
         * @memberof fqdp.UpdateResourceRequest
         * @instance
         */
        UpdateResourceRequest.prototype.resourceSize = 0;

        /**
         * UpdateResourceRequest externalLinksJson.
         * @member {string} externalLinksJson
         * @memberof fqdp.UpdateResourceRequest
         * @instance
         */
        UpdateResourceRequest.prototype.externalLinksJson = "";

        /**
         * UpdateResourceRequest metadataJson.
         * @member {string} metadataJson
         * @memberof fqdp.UpdateResourceRequest
         * @instance
         */
        UpdateResourceRequest.prototype.metadataJson = "";

        /**
         * Creates a new UpdateResourceRequest instance using the specified properties.
         * @function create
         * @memberof fqdp.UpdateResourceRequest
         * @static
         * @param {fqdp.IUpdateResourceRequest=} [properties] Properties to set
         * @returns {fqdp.UpdateResourceRequest} UpdateResourceRequest instance
         */
        UpdateResourceRequest.create = function create(properties) {
            return new UpdateResourceRequest(properties);
        };

        /**
         * Encodes the specified UpdateResourceRequest message. Does not implicitly {@link fqdp.UpdateResourceRequest.verify|verify} messages.
         * @function encode
         * @memberof fqdp.UpdateResourceRequest
         * @static
         * @param {fqdp.IUpdateResourceRequest} message UpdateResourceRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UpdateResourceRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.description);
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 4, wireType 0 =*/32).int32(message.status);
            if (message.resourceName != null && Object.hasOwnProperty.call(message, "resourceName"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.resourceName);
            if (message.resourceType != null && Object.hasOwnProperty.call(message, "resourceType"))
                writer.uint32(/* id 6, wireType 0 =*/48).int32(message.resourceType);
            if (message.resourceUrl != null && Object.hasOwnProperty.call(message, "resourceUrl"))
                writer.uint32(/* id 7, wireType 2 =*/58).string(message.resourceUrl);
            if (message.resourceSize != null && Object.hasOwnProperty.call(message, "resourceSize"))
                writer.uint32(/* id 8, wireType 0 =*/64).int32(message.resourceSize);
            if (message.externalLinksJson != null && Object.hasOwnProperty.call(message, "externalLinksJson"))
                writer.uint32(/* id 9, wireType 2 =*/74).string(message.externalLinksJson);
            if (message.metadataJson != null && Object.hasOwnProperty.call(message, "metadataJson"))
                writer.uint32(/* id 10, wireType 2 =*/82).string(message.metadataJson);
            return writer;
        };

        /**
         * Encodes the specified UpdateResourceRequest message, length delimited. Does not implicitly {@link fqdp.UpdateResourceRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof fqdp.UpdateResourceRequest
         * @static
         * @param {fqdp.IUpdateResourceRequest} message UpdateResourceRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UpdateResourceRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an UpdateResourceRequest message from the specified reader or buffer.
         * @function decode
         * @memberof fqdp.UpdateResourceRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {fqdp.UpdateResourceRequest} UpdateResourceRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UpdateResourceRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.fqdp.UpdateResourceRequest();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.name = reader.string();
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
                        message.resourceName = reader.string();
                        break;
                    }
                case 6: {
                        message.resourceType = reader.int32();
                        break;
                    }
                case 7: {
                        message.resourceUrl = reader.string();
                        break;
                    }
                case 8: {
                        message.resourceSize = reader.int32();
                        break;
                    }
                case 9: {
                        message.externalLinksJson = reader.string();
                        break;
                    }
                case 10: {
                        message.metadataJson = reader.string();
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
         * Decodes an UpdateResourceRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof fqdp.UpdateResourceRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {fqdp.UpdateResourceRequest} UpdateResourceRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UpdateResourceRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an UpdateResourceRequest message.
         * @function verify
         * @memberof fqdp.UpdateResourceRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        UpdateResourceRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.description != null && message.hasOwnProperty("description"))
                if (!$util.isString(message.description))
                    return "description: string expected";
            if (message.status != null && message.hasOwnProperty("status"))
                switch (message.status) {
                default:
                    return "status: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                    break;
                }
            if (message.resourceName != null && message.hasOwnProperty("resourceName"))
                if (!$util.isString(message.resourceName))
                    return "resourceName: string expected";
            if (message.resourceType != null && message.hasOwnProperty("resourceType"))
                switch (message.resourceType) {
                default:
                    return "resourceType: enum value expected";
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
            if (message.resourceUrl != null && message.hasOwnProperty("resourceUrl"))
                if (!$util.isString(message.resourceUrl))
                    return "resourceUrl: string expected";
            if (message.resourceSize != null && message.hasOwnProperty("resourceSize"))
                if (!$util.isInteger(message.resourceSize))
                    return "resourceSize: integer expected";
            if (message.externalLinksJson != null && message.hasOwnProperty("externalLinksJson"))
                if (!$util.isString(message.externalLinksJson))
                    return "externalLinksJson: string expected";
            if (message.metadataJson != null && message.hasOwnProperty("metadataJson"))
                if (!$util.isString(message.metadataJson))
                    return "metadataJson: string expected";
            return null;
        };

        /**
         * Creates an UpdateResourceRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof fqdp.UpdateResourceRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {fqdp.UpdateResourceRequest} UpdateResourceRequest
         */
        UpdateResourceRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.fqdp.UpdateResourceRequest)
                return object;
            let message = new $root.fqdp.UpdateResourceRequest();
            if (object.name != null)
                message.name = String(object.name);
            if (object.description != null)
                message.description = String(object.description);
            switch (object.status) {
            default:
                if (typeof object.status === "number") {
                    message.status = object.status;
                    break;
                }
                break;
            case "ENTITY_STATUS_UNSPECIFIED":
            case 0:
                message.status = 0;
                break;
            case "ACTIVE":
            case 1:
                message.status = 1;
                break;
            case "INACTIVE":
            case 2:
                message.status = 2;
                break;
            case "ARCHIVED":
            case 3:
                message.status = 3;
                break;
            }
            if (object.resourceName != null)
                message.resourceName = String(object.resourceName);
            switch (object.resourceType) {
            default:
                if (typeof object.resourceType === "number") {
                    message.resourceType = object.resourceType;
                    break;
                }
                break;
            case "RESOURCE_TYPE_UNSPECIFIED":
            case 0:
                message.resourceType = 0;
                break;
            case "FIGMA":
            case 1:
                message.resourceType = 1;
                break;
            case "SKETCH":
            case 2:
                message.resourceType = 2;
                break;
            case "XD":
            case 3:
                message.resourceType = 3;
                break;
            case "PDF":
            case 4:
                message.resourceType = 4;
                break;
            case "IMAGE":
            case 5:
                message.resourceType = 5;
                break;
            case "CODE":
            case 6:
                message.resourceType = 6;
                break;
            case "DOCUMENT":
            case 7:
                message.resourceType = 7;
                break;
            case "OTHER":
            case 8:
                message.resourceType = 8;
                break;
            }
            if (object.resourceUrl != null)
                message.resourceUrl = String(object.resourceUrl);
            if (object.resourceSize != null)
                message.resourceSize = object.resourceSize | 0;
            if (object.externalLinksJson != null)
                message.externalLinksJson = String(object.externalLinksJson);
            if (object.metadataJson != null)
                message.metadataJson = String(object.metadataJson);
            return message;
        };

        /**
         * Creates a plain object from an UpdateResourceRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof fqdp.UpdateResourceRequest
         * @static
         * @param {fqdp.UpdateResourceRequest} message UpdateResourceRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        UpdateResourceRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.name = "";
                object.description = "";
                object.status = options.enums === String ? "ENTITY_STATUS_UNSPECIFIED" : 0;
                object.resourceName = "";
                object.resourceType = options.enums === String ? "RESOURCE_TYPE_UNSPECIFIED" : 0;
                object.resourceUrl = "";
                object.resourceSize = 0;
                object.externalLinksJson = "";
                object.metadataJson = "";
            }
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.description != null && message.hasOwnProperty("description"))
                object.description = message.description;
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = options.enums === String ? $root.fqdp.EntityStatus[message.status] === undefined ? message.status : $root.fqdp.EntityStatus[message.status] : message.status;
            if (message.resourceName != null && message.hasOwnProperty("resourceName"))
                object.resourceName = message.resourceName;
            if (message.resourceType != null && message.hasOwnProperty("resourceType"))
                object.resourceType = options.enums === String ? $root.fqdp.ResourceType[message.resourceType] === undefined ? message.resourceType : $root.fqdp.ResourceType[message.resourceType] : message.resourceType;
            if (message.resourceUrl != null && message.hasOwnProperty("resourceUrl"))
                object.resourceUrl = message.resourceUrl;
            if (message.resourceSize != null && message.hasOwnProperty("resourceSize"))
                object.resourceSize = message.resourceSize;
            if (message.externalLinksJson != null && message.hasOwnProperty("externalLinksJson"))
                object.externalLinksJson = message.externalLinksJson;
            if (message.metadataJson != null && message.hasOwnProperty("metadataJson"))
                object.metadataJson = message.metadataJson;
            return object;
        };

        /**
         * Converts this UpdateResourceRequest to JSON.
         * @function toJSON
         * @memberof fqdp.UpdateResourceRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        UpdateResourceRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for UpdateResourceRequest
         * @function getTypeUrl
         * @memberof fqdp.UpdateResourceRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        UpdateResourceRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/fqdp.UpdateResourceRequest";
        };

        return UpdateResourceRequest;
    })();

    fqdp.Team = (function() {

        /**
         * Properties of a Team.
         * @memberof fqdp
         * @interface ITeam
         * @property {string|null} [id] Team id
         * @property {string|null} [name] Team name
         * @property {string|null} [slug] Team slug
         * @property {string|null} [description] Team description
         * @property {fqdp.EntityStatus|null} [status] Team status
         * @property {string|null} [metadataJson] Team metadataJson
         * @property {string|null} [workspaceId] Team workspaceId
         * @property {string|null} [workspaceName] Team workspaceName
         * @property {string|null} [organizationId] Team organizationId
         * @property {string|null} [organizationName] Team organizationName
         * @property {number|null} [applicationCount] Team applicationCount
         * @property {string|null} [createdBy] Team createdBy
         * @property {string|null} [updatedBy] Team updatedBy
         * @property {string|null} [createdAt] Team createdAt
         * @property {string|null} [updatedAt] Team updatedAt
         */

        /**
         * Constructs a new Team.
         * @memberof fqdp
         * @classdesc Represents a Team.
         * @implements ITeam
         * @constructor
         * @param {fqdp.ITeam=} [properties] Properties to set
         */
        function Team(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Team id.
         * @member {string} id
         * @memberof fqdp.Team
         * @instance
         */
        Team.prototype.id = "";

        /**
         * Team name.
         * @member {string} name
         * @memberof fqdp.Team
         * @instance
         */
        Team.prototype.name = "";

        /**
         * Team slug.
         * @member {string} slug
         * @memberof fqdp.Team
         * @instance
         */
        Team.prototype.slug = "";

        /**
         * Team description.
         * @member {string} description
         * @memberof fqdp.Team
         * @instance
         */
        Team.prototype.description = "";

        /**
         * Team status.
         * @member {fqdp.EntityStatus} status
         * @memberof fqdp.Team
         * @instance
         */
        Team.prototype.status = 0;

        /**
         * Team metadataJson.
         * @member {string} metadataJson
         * @memberof fqdp.Team
         * @instance
         */
        Team.prototype.metadataJson = "";

        /**
         * Team workspaceId.
         * @member {string} workspaceId
         * @memberof fqdp.Team
         * @instance
         */
        Team.prototype.workspaceId = "";

        /**
         * Team workspaceName.
         * @member {string} workspaceName
         * @memberof fqdp.Team
         * @instance
         */
        Team.prototype.workspaceName = "";

        /**
         * Team organizationId.
         * @member {string} organizationId
         * @memberof fqdp.Team
         * @instance
         */
        Team.prototype.organizationId = "";

        /**
         * Team organizationName.
         * @member {string} organizationName
         * @memberof fqdp.Team
         * @instance
         */
        Team.prototype.organizationName = "";

        /**
         * Team applicationCount.
         * @member {number} applicationCount
         * @memberof fqdp.Team
         * @instance
         */
        Team.prototype.applicationCount = 0;

        /**
         * Team createdBy.
         * @member {string} createdBy
         * @memberof fqdp.Team
         * @instance
         */
        Team.prototype.createdBy = "";

        /**
         * Team updatedBy.
         * @member {string} updatedBy
         * @memberof fqdp.Team
         * @instance
         */
        Team.prototype.updatedBy = "";

        /**
         * Team createdAt.
         * @member {string} createdAt
         * @memberof fqdp.Team
         * @instance
         */
        Team.prototype.createdAt = "";

        /**
         * Team updatedAt.
         * @member {string} updatedAt
         * @memberof fqdp.Team
         * @instance
         */
        Team.prototype.updatedAt = "";

        /**
         * Creates a new Team instance using the specified properties.
         * @function create
         * @memberof fqdp.Team
         * @static
         * @param {fqdp.ITeam=} [properties] Properties to set
         * @returns {fqdp.Team} Team instance
         */
        Team.create = function create(properties) {
            return new Team(properties);
        };

        /**
         * Encodes the specified Team message. Does not implicitly {@link fqdp.Team.verify|verify} messages.
         * @function encode
         * @memberof fqdp.Team
         * @static
         * @param {fqdp.ITeam} message Team message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Team.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
            if (message.slug != null && Object.hasOwnProperty.call(message, "slug"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.slug);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.description);
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 5, wireType 0 =*/40).int32(message.status);
            if (message.metadataJson != null && Object.hasOwnProperty.call(message, "metadataJson"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.metadataJson);
            if (message.workspaceId != null && Object.hasOwnProperty.call(message, "workspaceId"))
                writer.uint32(/* id 7, wireType 2 =*/58).string(message.workspaceId);
            if (message.workspaceName != null && Object.hasOwnProperty.call(message, "workspaceName"))
                writer.uint32(/* id 8, wireType 2 =*/66).string(message.workspaceName);
            if (message.organizationId != null && Object.hasOwnProperty.call(message, "organizationId"))
                writer.uint32(/* id 9, wireType 2 =*/74).string(message.organizationId);
            if (message.organizationName != null && Object.hasOwnProperty.call(message, "organizationName"))
                writer.uint32(/* id 10, wireType 2 =*/82).string(message.organizationName);
            if (message.applicationCount != null && Object.hasOwnProperty.call(message, "applicationCount"))
                writer.uint32(/* id 11, wireType 0 =*/88).int32(message.applicationCount);
            if (message.createdBy != null && Object.hasOwnProperty.call(message, "createdBy"))
                writer.uint32(/* id 12, wireType 2 =*/98).string(message.createdBy);
            if (message.updatedBy != null && Object.hasOwnProperty.call(message, "updatedBy"))
                writer.uint32(/* id 13, wireType 2 =*/106).string(message.updatedBy);
            if (message.createdAt != null && Object.hasOwnProperty.call(message, "createdAt"))
                writer.uint32(/* id 14, wireType 2 =*/114).string(message.createdAt);
            if (message.updatedAt != null && Object.hasOwnProperty.call(message, "updatedAt"))
                writer.uint32(/* id 15, wireType 2 =*/122).string(message.updatedAt);
            return writer;
        };

        /**
         * Encodes the specified Team message, length delimited. Does not implicitly {@link fqdp.Team.verify|verify} messages.
         * @function encodeDelimited
         * @memberof fqdp.Team
         * @static
         * @param {fqdp.ITeam} message Team message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Team.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Team message from the specified reader or buffer.
         * @function decode
         * @memberof fqdp.Team
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {fqdp.Team} Team
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Team.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.fqdp.Team();
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
                        message.slug = reader.string();
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
                        message.metadataJson = reader.string();
                        break;
                    }
                case 7: {
                        message.workspaceId = reader.string();
                        break;
                    }
                case 8: {
                        message.workspaceName = reader.string();
                        break;
                    }
                case 9: {
                        message.organizationId = reader.string();
                        break;
                    }
                case 10: {
                        message.organizationName = reader.string();
                        break;
                    }
                case 11: {
                        message.applicationCount = reader.int32();
                        break;
                    }
                case 12: {
                        message.createdBy = reader.string();
                        break;
                    }
                case 13: {
                        message.updatedBy = reader.string();
                        break;
                    }
                case 14: {
                        message.createdAt = reader.string();
                        break;
                    }
                case 15: {
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
         * Decodes a Team message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof fqdp.Team
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {fqdp.Team} Team
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Team.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Team message.
         * @function verify
         * @memberof fqdp.Team
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Team.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.slug != null && message.hasOwnProperty("slug"))
                if (!$util.isString(message.slug))
                    return "slug: string expected";
            if (message.description != null && message.hasOwnProperty("description"))
                if (!$util.isString(message.description))
                    return "description: string expected";
            if (message.status != null && message.hasOwnProperty("status"))
                switch (message.status) {
                default:
                    return "status: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                    break;
                }
            if (message.metadataJson != null && message.hasOwnProperty("metadataJson"))
                if (!$util.isString(message.metadataJson))
                    return "metadataJson: string expected";
            if (message.workspaceId != null && message.hasOwnProperty("workspaceId"))
                if (!$util.isString(message.workspaceId))
                    return "workspaceId: string expected";
            if (message.workspaceName != null && message.hasOwnProperty("workspaceName"))
                if (!$util.isString(message.workspaceName))
                    return "workspaceName: string expected";
            if (message.organizationId != null && message.hasOwnProperty("organizationId"))
                if (!$util.isString(message.organizationId))
                    return "organizationId: string expected";
            if (message.organizationName != null && message.hasOwnProperty("organizationName"))
                if (!$util.isString(message.organizationName))
                    return "organizationName: string expected";
            if (message.applicationCount != null && message.hasOwnProperty("applicationCount"))
                if (!$util.isInteger(message.applicationCount))
                    return "applicationCount: integer expected";
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
            return null;
        };

        /**
         * Creates a Team message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof fqdp.Team
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {fqdp.Team} Team
         */
        Team.fromObject = function fromObject(object) {
            if (object instanceof $root.fqdp.Team)
                return object;
            let message = new $root.fqdp.Team();
            if (object.id != null)
                message.id = String(object.id);
            if (object.name != null)
                message.name = String(object.name);
            if (object.slug != null)
                message.slug = String(object.slug);
            if (object.description != null)
                message.description = String(object.description);
            switch (object.status) {
            default:
                if (typeof object.status === "number") {
                    message.status = object.status;
                    break;
                }
                break;
            case "ENTITY_STATUS_UNSPECIFIED":
            case 0:
                message.status = 0;
                break;
            case "ACTIVE":
            case 1:
                message.status = 1;
                break;
            case "INACTIVE":
            case 2:
                message.status = 2;
                break;
            case "ARCHIVED":
            case 3:
                message.status = 3;
                break;
            }
            if (object.metadataJson != null)
                message.metadataJson = String(object.metadataJson);
            if (object.workspaceId != null)
                message.workspaceId = String(object.workspaceId);
            if (object.workspaceName != null)
                message.workspaceName = String(object.workspaceName);
            if (object.organizationId != null)
                message.organizationId = String(object.organizationId);
            if (object.organizationName != null)
                message.organizationName = String(object.organizationName);
            if (object.applicationCount != null)
                message.applicationCount = object.applicationCount | 0;
            if (object.createdBy != null)
                message.createdBy = String(object.createdBy);
            if (object.updatedBy != null)
                message.updatedBy = String(object.updatedBy);
            if (object.createdAt != null)
                message.createdAt = String(object.createdAt);
            if (object.updatedAt != null)
                message.updatedAt = String(object.updatedAt);
            return message;
        };

        /**
         * Creates a plain object from a Team message. Also converts values to other types if specified.
         * @function toObject
         * @memberof fqdp.Team
         * @static
         * @param {fqdp.Team} message Team
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Team.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.id = "";
                object.name = "";
                object.slug = "";
                object.description = "";
                object.status = options.enums === String ? "ENTITY_STATUS_UNSPECIFIED" : 0;
                object.metadataJson = "";
                object.workspaceId = "";
                object.workspaceName = "";
                object.organizationId = "";
                object.organizationName = "";
                object.applicationCount = 0;
                object.createdBy = "";
                object.updatedBy = "";
                object.createdAt = "";
                object.updatedAt = "";
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.slug != null && message.hasOwnProperty("slug"))
                object.slug = message.slug;
            if (message.description != null && message.hasOwnProperty("description"))
                object.description = message.description;
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = options.enums === String ? $root.fqdp.EntityStatus[message.status] === undefined ? message.status : $root.fqdp.EntityStatus[message.status] : message.status;
            if (message.metadataJson != null && message.hasOwnProperty("metadataJson"))
                object.metadataJson = message.metadataJson;
            if (message.workspaceId != null && message.hasOwnProperty("workspaceId"))
                object.workspaceId = message.workspaceId;
            if (message.workspaceName != null && message.hasOwnProperty("workspaceName"))
                object.workspaceName = message.workspaceName;
            if (message.organizationId != null && message.hasOwnProperty("organizationId"))
                object.organizationId = message.organizationId;
            if (message.organizationName != null && message.hasOwnProperty("organizationName"))
                object.organizationName = message.organizationName;
            if (message.applicationCount != null && message.hasOwnProperty("applicationCount"))
                object.applicationCount = message.applicationCount;
            if (message.createdBy != null && message.hasOwnProperty("createdBy"))
                object.createdBy = message.createdBy;
            if (message.updatedBy != null && message.hasOwnProperty("updatedBy"))
                object.updatedBy = message.updatedBy;
            if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                object.createdAt = message.createdAt;
            if (message.updatedAt != null && message.hasOwnProperty("updatedAt"))
                object.updatedAt = message.updatedAt;
            return object;
        };

        /**
         * Converts this Team to JSON.
         * @function toJSON
         * @memberof fqdp.Team
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Team.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Team
         * @function getTypeUrl
         * @memberof fqdp.Team
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Team.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/fqdp.Team";
        };

        return Team;
    })();

    fqdp.TeamList = (function() {

        /**
         * Properties of a TeamList.
         * @memberof fqdp
         * @interface ITeamList
         * @property {Array.<fqdp.ITeam>|null} [data] TeamList data
         * @property {fqdp.IPaginationMeta|null} [meta] TeamList meta
         */

        /**
         * Constructs a new TeamList.
         * @memberof fqdp
         * @classdesc Represents a TeamList.
         * @implements ITeamList
         * @constructor
         * @param {fqdp.ITeamList=} [properties] Properties to set
         */
        function TeamList(properties) {
            this.data = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * TeamList data.
         * @member {Array.<fqdp.ITeam>} data
         * @memberof fqdp.TeamList
         * @instance
         */
        TeamList.prototype.data = $util.emptyArray;

        /**
         * TeamList meta.
         * @member {fqdp.IPaginationMeta|null|undefined} meta
         * @memberof fqdp.TeamList
         * @instance
         */
        TeamList.prototype.meta = null;

        /**
         * Creates a new TeamList instance using the specified properties.
         * @function create
         * @memberof fqdp.TeamList
         * @static
         * @param {fqdp.ITeamList=} [properties] Properties to set
         * @returns {fqdp.TeamList} TeamList instance
         */
        TeamList.create = function create(properties) {
            return new TeamList(properties);
        };

        /**
         * Encodes the specified TeamList message. Does not implicitly {@link fqdp.TeamList.verify|verify} messages.
         * @function encode
         * @memberof fqdp.TeamList
         * @static
         * @param {fqdp.ITeamList} message TeamList message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TeamList.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.data != null && message.data.length)
                for (let i = 0; i < message.data.length; ++i)
                    $root.fqdp.Team.encode(message.data[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.meta != null && Object.hasOwnProperty.call(message, "meta"))
                $root.fqdp.PaginationMeta.encode(message.meta, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified TeamList message, length delimited. Does not implicitly {@link fqdp.TeamList.verify|verify} messages.
         * @function encodeDelimited
         * @memberof fqdp.TeamList
         * @static
         * @param {fqdp.ITeamList} message TeamList message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TeamList.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a TeamList message from the specified reader or buffer.
         * @function decode
         * @memberof fqdp.TeamList
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {fqdp.TeamList} TeamList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TeamList.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.fqdp.TeamList();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.data && message.data.length))
                            message.data = [];
                        message.data.push($root.fqdp.Team.decode(reader, reader.uint32()));
                        break;
                    }
                case 2: {
                        message.meta = $root.fqdp.PaginationMeta.decode(reader, reader.uint32());
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
         * Decodes a TeamList message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof fqdp.TeamList
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {fqdp.TeamList} TeamList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TeamList.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a TeamList message.
         * @function verify
         * @memberof fqdp.TeamList
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        TeamList.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.data != null && message.hasOwnProperty("data")) {
                if (!Array.isArray(message.data))
                    return "data: array expected";
                for (let i = 0; i < message.data.length; ++i) {
                    let error = $root.fqdp.Team.verify(message.data[i]);
                    if (error)
                        return "data." + error;
                }
            }
            if (message.meta != null && message.hasOwnProperty("meta")) {
                let error = $root.fqdp.PaginationMeta.verify(message.meta);
                if (error)
                    return "meta." + error;
            }
            return null;
        };

        /**
         * Creates a TeamList message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof fqdp.TeamList
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {fqdp.TeamList} TeamList
         */
        TeamList.fromObject = function fromObject(object) {
            if (object instanceof $root.fqdp.TeamList)
                return object;
            let message = new $root.fqdp.TeamList();
            if (object.data) {
                if (!Array.isArray(object.data))
                    throw TypeError(".fqdp.TeamList.data: array expected");
                message.data = [];
                for (let i = 0; i < object.data.length; ++i) {
                    if (typeof object.data[i] !== "object")
                        throw TypeError(".fqdp.TeamList.data: object expected");
                    message.data[i] = $root.fqdp.Team.fromObject(object.data[i]);
                }
            }
            if (object.meta != null) {
                if (typeof object.meta !== "object")
                    throw TypeError(".fqdp.TeamList.meta: object expected");
                message.meta = $root.fqdp.PaginationMeta.fromObject(object.meta);
            }
            return message;
        };

        /**
         * Creates a plain object from a TeamList message. Also converts values to other types if specified.
         * @function toObject
         * @memberof fqdp.TeamList
         * @static
         * @param {fqdp.TeamList} message TeamList
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        TeamList.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.data = [];
            if (options.defaults)
                object.meta = null;
            if (message.data && message.data.length) {
                object.data = [];
                for (let j = 0; j < message.data.length; ++j)
                    object.data[j] = $root.fqdp.Team.toObject(message.data[j], options);
            }
            if (message.meta != null && message.hasOwnProperty("meta"))
                object.meta = $root.fqdp.PaginationMeta.toObject(message.meta, options);
            return object;
        };

        /**
         * Converts this TeamList to JSON.
         * @function toJSON
         * @memberof fqdp.TeamList
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        TeamList.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for TeamList
         * @function getTypeUrl
         * @memberof fqdp.TeamList
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        TeamList.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/fqdp.TeamList";
        };

        return TeamList;
    })();

    fqdp.CreateTeamRequest = (function() {

        /**
         * Properties of a CreateTeamRequest.
         * @memberof fqdp
         * @interface ICreateTeamRequest
         * @property {string|null} [name] CreateTeamRequest name
         * @property {string|null} [description] CreateTeamRequest description
         * @property {string|null} [workspaceId] CreateTeamRequest workspaceId
         * @property {string|null} [metadataJson] CreateTeamRequest metadataJson
         */

        /**
         * Constructs a new CreateTeamRequest.
         * @memberof fqdp
         * @classdesc Represents a CreateTeamRequest.
         * @implements ICreateTeamRequest
         * @constructor
         * @param {fqdp.ICreateTeamRequest=} [properties] Properties to set
         */
        function CreateTeamRequest(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * CreateTeamRequest name.
         * @member {string} name
         * @memberof fqdp.CreateTeamRequest
         * @instance
         */
        CreateTeamRequest.prototype.name = "";

        /**
         * CreateTeamRequest description.
         * @member {string} description
         * @memberof fqdp.CreateTeamRequest
         * @instance
         */
        CreateTeamRequest.prototype.description = "";

        /**
         * CreateTeamRequest workspaceId.
         * @member {string} workspaceId
         * @memberof fqdp.CreateTeamRequest
         * @instance
         */
        CreateTeamRequest.prototype.workspaceId = "";

        /**
         * CreateTeamRequest metadataJson.
         * @member {string} metadataJson
         * @memberof fqdp.CreateTeamRequest
         * @instance
         */
        CreateTeamRequest.prototype.metadataJson = "";

        /**
         * Creates a new CreateTeamRequest instance using the specified properties.
         * @function create
         * @memberof fqdp.CreateTeamRequest
         * @static
         * @param {fqdp.ICreateTeamRequest=} [properties] Properties to set
         * @returns {fqdp.CreateTeamRequest} CreateTeamRequest instance
         */
        CreateTeamRequest.create = function create(properties) {
            return new CreateTeamRequest(properties);
        };

        /**
         * Encodes the specified CreateTeamRequest message. Does not implicitly {@link fqdp.CreateTeamRequest.verify|verify} messages.
         * @function encode
         * @memberof fqdp.CreateTeamRequest
         * @static
         * @param {fqdp.ICreateTeamRequest} message CreateTeamRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CreateTeamRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.description);
            if (message.workspaceId != null && Object.hasOwnProperty.call(message, "workspaceId"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.workspaceId);
            if (message.metadataJson != null && Object.hasOwnProperty.call(message, "metadataJson"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.metadataJson);
            return writer;
        };

        /**
         * Encodes the specified CreateTeamRequest message, length delimited. Does not implicitly {@link fqdp.CreateTeamRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof fqdp.CreateTeamRequest
         * @static
         * @param {fqdp.ICreateTeamRequest} message CreateTeamRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CreateTeamRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a CreateTeamRequest message from the specified reader or buffer.
         * @function decode
         * @memberof fqdp.CreateTeamRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {fqdp.CreateTeamRequest} CreateTeamRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CreateTeamRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.fqdp.CreateTeamRequest();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.name = reader.string();
                        break;
                    }
                case 3: {
                        message.description = reader.string();
                        break;
                    }
                case 4: {
                        message.workspaceId = reader.string();
                        break;
                    }
                case 5: {
                        message.metadataJson = reader.string();
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
         * Decodes a CreateTeamRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof fqdp.CreateTeamRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {fqdp.CreateTeamRequest} CreateTeamRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CreateTeamRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a CreateTeamRequest message.
         * @function verify
         * @memberof fqdp.CreateTeamRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CreateTeamRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.description != null && message.hasOwnProperty("description"))
                if (!$util.isString(message.description))
                    return "description: string expected";
            if (message.workspaceId != null && message.hasOwnProperty("workspaceId"))
                if (!$util.isString(message.workspaceId))
                    return "workspaceId: string expected";
            if (message.metadataJson != null && message.hasOwnProperty("metadataJson"))
                if (!$util.isString(message.metadataJson))
                    return "metadataJson: string expected";
            return null;
        };

        /**
         * Creates a CreateTeamRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof fqdp.CreateTeamRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {fqdp.CreateTeamRequest} CreateTeamRequest
         */
        CreateTeamRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.fqdp.CreateTeamRequest)
                return object;
            let message = new $root.fqdp.CreateTeamRequest();
            if (object.name != null)
                message.name = String(object.name);
            if (object.description != null)
                message.description = String(object.description);
            if (object.workspaceId != null)
                message.workspaceId = String(object.workspaceId);
            if (object.metadataJson != null)
                message.metadataJson = String(object.metadataJson);
            return message;
        };

        /**
         * Creates a plain object from a CreateTeamRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof fqdp.CreateTeamRequest
         * @static
         * @param {fqdp.CreateTeamRequest} message CreateTeamRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CreateTeamRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.name = "";
                object.description = "";
                object.workspaceId = "";
                object.metadataJson = "";
            }
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.description != null && message.hasOwnProperty("description"))
                object.description = message.description;
            if (message.workspaceId != null && message.hasOwnProperty("workspaceId"))
                object.workspaceId = message.workspaceId;
            if (message.metadataJson != null && message.hasOwnProperty("metadataJson"))
                object.metadataJson = message.metadataJson;
            return object;
        };

        /**
         * Converts this CreateTeamRequest to JSON.
         * @function toJSON
         * @memberof fqdp.CreateTeamRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CreateTeamRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for CreateTeamRequest
         * @function getTypeUrl
         * @memberof fqdp.CreateTeamRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        CreateTeamRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/fqdp.CreateTeamRequest";
        };

        return CreateTeamRequest;
    })();

    fqdp.UpdateTeamRequest = (function() {

        /**
         * Properties of an UpdateTeamRequest.
         * @memberof fqdp
         * @interface IUpdateTeamRequest
         * @property {string|null} [name] UpdateTeamRequest name
         * @property {string|null} [description] UpdateTeamRequest description
         * @property {fqdp.EntityStatus|null} [status] UpdateTeamRequest status
         * @property {string|null} [metadataJson] UpdateTeamRequest metadataJson
         */

        /**
         * Constructs a new UpdateTeamRequest.
         * @memberof fqdp
         * @classdesc Represents an UpdateTeamRequest.
         * @implements IUpdateTeamRequest
         * @constructor
         * @param {fqdp.IUpdateTeamRequest=} [properties] Properties to set
         */
        function UpdateTeamRequest(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * UpdateTeamRequest name.
         * @member {string} name
         * @memberof fqdp.UpdateTeamRequest
         * @instance
         */
        UpdateTeamRequest.prototype.name = "";

        /**
         * UpdateTeamRequest description.
         * @member {string} description
         * @memberof fqdp.UpdateTeamRequest
         * @instance
         */
        UpdateTeamRequest.prototype.description = "";

        /**
         * UpdateTeamRequest status.
         * @member {fqdp.EntityStatus} status
         * @memberof fqdp.UpdateTeamRequest
         * @instance
         */
        UpdateTeamRequest.prototype.status = 0;

        /**
         * UpdateTeamRequest metadataJson.
         * @member {string} metadataJson
         * @memberof fqdp.UpdateTeamRequest
         * @instance
         */
        UpdateTeamRequest.prototype.metadataJson = "";

        /**
         * Creates a new UpdateTeamRequest instance using the specified properties.
         * @function create
         * @memberof fqdp.UpdateTeamRequest
         * @static
         * @param {fqdp.IUpdateTeamRequest=} [properties] Properties to set
         * @returns {fqdp.UpdateTeamRequest} UpdateTeamRequest instance
         */
        UpdateTeamRequest.create = function create(properties) {
            return new UpdateTeamRequest(properties);
        };

        /**
         * Encodes the specified UpdateTeamRequest message. Does not implicitly {@link fqdp.UpdateTeamRequest.verify|verify} messages.
         * @function encode
         * @memberof fqdp.UpdateTeamRequest
         * @static
         * @param {fqdp.IUpdateTeamRequest} message UpdateTeamRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UpdateTeamRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.description);
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 4, wireType 0 =*/32).int32(message.status);
            if (message.metadataJson != null && Object.hasOwnProperty.call(message, "metadataJson"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.metadataJson);
            return writer;
        };

        /**
         * Encodes the specified UpdateTeamRequest message, length delimited. Does not implicitly {@link fqdp.UpdateTeamRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof fqdp.UpdateTeamRequest
         * @static
         * @param {fqdp.IUpdateTeamRequest} message UpdateTeamRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UpdateTeamRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an UpdateTeamRequest message from the specified reader or buffer.
         * @function decode
         * @memberof fqdp.UpdateTeamRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {fqdp.UpdateTeamRequest} UpdateTeamRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UpdateTeamRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.fqdp.UpdateTeamRequest();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.name = reader.string();
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
                        message.metadataJson = reader.string();
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
         * Decodes an UpdateTeamRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof fqdp.UpdateTeamRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {fqdp.UpdateTeamRequest} UpdateTeamRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UpdateTeamRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an UpdateTeamRequest message.
         * @function verify
         * @memberof fqdp.UpdateTeamRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        UpdateTeamRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.description != null && message.hasOwnProperty("description"))
                if (!$util.isString(message.description))
                    return "description: string expected";
            if (message.status != null && message.hasOwnProperty("status"))
                switch (message.status) {
                default:
                    return "status: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                    break;
                }
            if (message.metadataJson != null && message.hasOwnProperty("metadataJson"))
                if (!$util.isString(message.metadataJson))
                    return "metadataJson: string expected";
            return null;
        };

        /**
         * Creates an UpdateTeamRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof fqdp.UpdateTeamRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {fqdp.UpdateTeamRequest} UpdateTeamRequest
         */
        UpdateTeamRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.fqdp.UpdateTeamRequest)
                return object;
            let message = new $root.fqdp.UpdateTeamRequest();
            if (object.name != null)
                message.name = String(object.name);
            if (object.description != null)
                message.description = String(object.description);
            switch (object.status) {
            default:
                if (typeof object.status === "number") {
                    message.status = object.status;
                    break;
                }
                break;
            case "ENTITY_STATUS_UNSPECIFIED":
            case 0:
                message.status = 0;
                break;
            case "ACTIVE":
            case 1:
                message.status = 1;
                break;
            case "INACTIVE":
            case 2:
                message.status = 2;
                break;
            case "ARCHIVED":
            case 3:
                message.status = 3;
                break;
            }
            if (object.metadataJson != null)
                message.metadataJson = String(object.metadataJson);
            return message;
        };

        /**
         * Creates a plain object from an UpdateTeamRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof fqdp.UpdateTeamRequest
         * @static
         * @param {fqdp.UpdateTeamRequest} message UpdateTeamRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        UpdateTeamRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.name = "";
                object.description = "";
                object.status = options.enums === String ? "ENTITY_STATUS_UNSPECIFIED" : 0;
                object.metadataJson = "";
            }
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.description != null && message.hasOwnProperty("description"))
                object.description = message.description;
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = options.enums === String ? $root.fqdp.EntityStatus[message.status] === undefined ? message.status : $root.fqdp.EntityStatus[message.status] : message.status;
            if (message.metadataJson != null && message.hasOwnProperty("metadataJson"))
                object.metadataJson = message.metadataJson;
            return object;
        };

        /**
         * Converts this UpdateTeamRequest to JSON.
         * @function toJSON
         * @memberof fqdp.UpdateTeamRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        UpdateTeamRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for UpdateTeamRequest
         * @function getTypeUrl
         * @memberof fqdp.UpdateTeamRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        UpdateTeamRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/fqdp.UpdateTeamRequest";
        };

        return UpdateTeamRequest;
    })();

    fqdp.Workspace = (function() {

        /**
         * Properties of a Workspace.
         * @memberof fqdp
         * @interface IWorkspace
         * @property {string|null} [id] Workspace id
         * @property {string|null} [name] Workspace name
         * @property {string|null} [slug] Workspace slug
         * @property {string|null} [description] Workspace description
         * @property {fqdp.EntityStatus|null} [status] Workspace status
         * @property {string|null} [metadataJson] Workspace metadataJson
         * @property {string|null} [organizationId] Workspace organizationId
         * @property {string|null} [organizationName] Workspace organizationName
         * @property {number|null} [teamCount] Workspace teamCount
         * @property {string|null} [createdBy] Workspace createdBy
         * @property {string|null} [updatedBy] Workspace updatedBy
         * @property {string|null} [createdAt] Workspace createdAt
         * @property {string|null} [updatedAt] Workspace updatedAt
         */

        /**
         * Constructs a new Workspace.
         * @memberof fqdp
         * @classdesc Represents a Workspace.
         * @implements IWorkspace
         * @constructor
         * @param {fqdp.IWorkspace=} [properties] Properties to set
         */
        function Workspace(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Workspace id.
         * @member {string} id
         * @memberof fqdp.Workspace
         * @instance
         */
        Workspace.prototype.id = "";

        /**
         * Workspace name.
         * @member {string} name
         * @memberof fqdp.Workspace
         * @instance
         */
        Workspace.prototype.name = "";

        /**
         * Workspace slug.
         * @member {string} slug
         * @memberof fqdp.Workspace
         * @instance
         */
        Workspace.prototype.slug = "";

        /**
         * Workspace description.
         * @member {string} description
         * @memberof fqdp.Workspace
         * @instance
         */
        Workspace.prototype.description = "";

        /**
         * Workspace status.
         * @member {fqdp.EntityStatus} status
         * @memberof fqdp.Workspace
         * @instance
         */
        Workspace.prototype.status = 0;

        /**
         * Workspace metadataJson.
         * @member {string} metadataJson
         * @memberof fqdp.Workspace
         * @instance
         */
        Workspace.prototype.metadataJson = "";

        /**
         * Workspace organizationId.
         * @member {string} organizationId
         * @memberof fqdp.Workspace
         * @instance
         */
        Workspace.prototype.organizationId = "";

        /**
         * Workspace organizationName.
         * @member {string} organizationName
         * @memberof fqdp.Workspace
         * @instance
         */
        Workspace.prototype.organizationName = "";

        /**
         * Workspace teamCount.
         * @member {number} teamCount
         * @memberof fqdp.Workspace
         * @instance
         */
        Workspace.prototype.teamCount = 0;

        /**
         * Workspace createdBy.
         * @member {string} createdBy
         * @memberof fqdp.Workspace
         * @instance
         */
        Workspace.prototype.createdBy = "";

        /**
         * Workspace updatedBy.
         * @member {string} updatedBy
         * @memberof fqdp.Workspace
         * @instance
         */
        Workspace.prototype.updatedBy = "";

        /**
         * Workspace createdAt.
         * @member {string} createdAt
         * @memberof fqdp.Workspace
         * @instance
         */
        Workspace.prototype.createdAt = "";

        /**
         * Workspace updatedAt.
         * @member {string} updatedAt
         * @memberof fqdp.Workspace
         * @instance
         */
        Workspace.prototype.updatedAt = "";

        /**
         * Creates a new Workspace instance using the specified properties.
         * @function create
         * @memberof fqdp.Workspace
         * @static
         * @param {fqdp.IWorkspace=} [properties] Properties to set
         * @returns {fqdp.Workspace} Workspace instance
         */
        Workspace.create = function create(properties) {
            return new Workspace(properties);
        };

        /**
         * Encodes the specified Workspace message. Does not implicitly {@link fqdp.Workspace.verify|verify} messages.
         * @function encode
         * @memberof fqdp.Workspace
         * @static
         * @param {fqdp.IWorkspace} message Workspace message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Workspace.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
            if (message.slug != null && Object.hasOwnProperty.call(message, "slug"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.slug);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.description);
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 5, wireType 0 =*/40).int32(message.status);
            if (message.metadataJson != null && Object.hasOwnProperty.call(message, "metadataJson"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.metadataJson);
            if (message.organizationId != null && Object.hasOwnProperty.call(message, "organizationId"))
                writer.uint32(/* id 7, wireType 2 =*/58).string(message.organizationId);
            if (message.organizationName != null && Object.hasOwnProperty.call(message, "organizationName"))
                writer.uint32(/* id 8, wireType 2 =*/66).string(message.organizationName);
            if (message.teamCount != null && Object.hasOwnProperty.call(message, "teamCount"))
                writer.uint32(/* id 9, wireType 0 =*/72).int32(message.teamCount);
            if (message.createdBy != null && Object.hasOwnProperty.call(message, "createdBy"))
                writer.uint32(/* id 10, wireType 2 =*/82).string(message.createdBy);
            if (message.updatedBy != null && Object.hasOwnProperty.call(message, "updatedBy"))
                writer.uint32(/* id 11, wireType 2 =*/90).string(message.updatedBy);
            if (message.createdAt != null && Object.hasOwnProperty.call(message, "createdAt"))
                writer.uint32(/* id 12, wireType 2 =*/98).string(message.createdAt);
            if (message.updatedAt != null && Object.hasOwnProperty.call(message, "updatedAt"))
                writer.uint32(/* id 13, wireType 2 =*/106).string(message.updatedAt);
            return writer;
        };

        /**
         * Encodes the specified Workspace message, length delimited. Does not implicitly {@link fqdp.Workspace.verify|verify} messages.
         * @function encodeDelimited
         * @memberof fqdp.Workspace
         * @static
         * @param {fqdp.IWorkspace} message Workspace message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Workspace.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Workspace message from the specified reader or buffer.
         * @function decode
         * @memberof fqdp.Workspace
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {fqdp.Workspace} Workspace
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Workspace.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.fqdp.Workspace();
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
                        message.slug = reader.string();
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
                        message.metadataJson = reader.string();
                        break;
                    }
                case 7: {
                        message.organizationId = reader.string();
                        break;
                    }
                case 8: {
                        message.organizationName = reader.string();
                        break;
                    }
                case 9: {
                        message.teamCount = reader.int32();
                        break;
                    }
                case 10: {
                        message.createdBy = reader.string();
                        break;
                    }
                case 11: {
                        message.updatedBy = reader.string();
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
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Workspace message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof fqdp.Workspace
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {fqdp.Workspace} Workspace
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Workspace.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Workspace message.
         * @function verify
         * @memberof fqdp.Workspace
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Workspace.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.slug != null && message.hasOwnProperty("slug"))
                if (!$util.isString(message.slug))
                    return "slug: string expected";
            if (message.description != null && message.hasOwnProperty("description"))
                if (!$util.isString(message.description))
                    return "description: string expected";
            if (message.status != null && message.hasOwnProperty("status"))
                switch (message.status) {
                default:
                    return "status: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                    break;
                }
            if (message.metadataJson != null && message.hasOwnProperty("metadataJson"))
                if (!$util.isString(message.metadataJson))
                    return "metadataJson: string expected";
            if (message.organizationId != null && message.hasOwnProperty("organizationId"))
                if (!$util.isString(message.organizationId))
                    return "organizationId: string expected";
            if (message.organizationName != null && message.hasOwnProperty("organizationName"))
                if (!$util.isString(message.organizationName))
                    return "organizationName: string expected";
            if (message.teamCount != null && message.hasOwnProperty("teamCount"))
                if (!$util.isInteger(message.teamCount))
                    return "teamCount: integer expected";
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
            return null;
        };

        /**
         * Creates a Workspace message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof fqdp.Workspace
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {fqdp.Workspace} Workspace
         */
        Workspace.fromObject = function fromObject(object) {
            if (object instanceof $root.fqdp.Workspace)
                return object;
            let message = new $root.fqdp.Workspace();
            if (object.id != null)
                message.id = String(object.id);
            if (object.name != null)
                message.name = String(object.name);
            if (object.slug != null)
                message.slug = String(object.slug);
            if (object.description != null)
                message.description = String(object.description);
            switch (object.status) {
            default:
                if (typeof object.status === "number") {
                    message.status = object.status;
                    break;
                }
                break;
            case "ENTITY_STATUS_UNSPECIFIED":
            case 0:
                message.status = 0;
                break;
            case "ACTIVE":
            case 1:
                message.status = 1;
                break;
            case "INACTIVE":
            case 2:
                message.status = 2;
                break;
            case "ARCHIVED":
            case 3:
                message.status = 3;
                break;
            }
            if (object.metadataJson != null)
                message.metadataJson = String(object.metadataJson);
            if (object.organizationId != null)
                message.organizationId = String(object.organizationId);
            if (object.organizationName != null)
                message.organizationName = String(object.organizationName);
            if (object.teamCount != null)
                message.teamCount = object.teamCount | 0;
            if (object.createdBy != null)
                message.createdBy = String(object.createdBy);
            if (object.updatedBy != null)
                message.updatedBy = String(object.updatedBy);
            if (object.createdAt != null)
                message.createdAt = String(object.createdAt);
            if (object.updatedAt != null)
                message.updatedAt = String(object.updatedAt);
            return message;
        };

        /**
         * Creates a plain object from a Workspace message. Also converts values to other types if specified.
         * @function toObject
         * @memberof fqdp.Workspace
         * @static
         * @param {fqdp.Workspace} message Workspace
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Workspace.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.id = "";
                object.name = "";
                object.slug = "";
                object.description = "";
                object.status = options.enums === String ? "ENTITY_STATUS_UNSPECIFIED" : 0;
                object.metadataJson = "";
                object.organizationId = "";
                object.organizationName = "";
                object.teamCount = 0;
                object.createdBy = "";
                object.updatedBy = "";
                object.createdAt = "";
                object.updatedAt = "";
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.slug != null && message.hasOwnProperty("slug"))
                object.slug = message.slug;
            if (message.description != null && message.hasOwnProperty("description"))
                object.description = message.description;
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = options.enums === String ? $root.fqdp.EntityStatus[message.status] === undefined ? message.status : $root.fqdp.EntityStatus[message.status] : message.status;
            if (message.metadataJson != null && message.hasOwnProperty("metadataJson"))
                object.metadataJson = message.metadataJson;
            if (message.organizationId != null && message.hasOwnProperty("organizationId"))
                object.organizationId = message.organizationId;
            if (message.organizationName != null && message.hasOwnProperty("organizationName"))
                object.organizationName = message.organizationName;
            if (message.teamCount != null && message.hasOwnProperty("teamCount"))
                object.teamCount = message.teamCount;
            if (message.createdBy != null && message.hasOwnProperty("createdBy"))
                object.createdBy = message.createdBy;
            if (message.updatedBy != null && message.hasOwnProperty("updatedBy"))
                object.updatedBy = message.updatedBy;
            if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                object.createdAt = message.createdAt;
            if (message.updatedAt != null && message.hasOwnProperty("updatedAt"))
                object.updatedAt = message.updatedAt;
            return object;
        };

        /**
         * Converts this Workspace to JSON.
         * @function toJSON
         * @memberof fqdp.Workspace
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Workspace.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Workspace
         * @function getTypeUrl
         * @memberof fqdp.Workspace
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Workspace.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/fqdp.Workspace";
        };

        return Workspace;
    })();

    fqdp.WorkspaceList = (function() {

        /**
         * Properties of a WorkspaceList.
         * @memberof fqdp
         * @interface IWorkspaceList
         * @property {Array.<fqdp.IWorkspace>|null} [data] WorkspaceList data
         * @property {fqdp.IPaginationMeta|null} [meta] WorkspaceList meta
         */

        /**
         * Constructs a new WorkspaceList.
         * @memberof fqdp
         * @classdesc Represents a WorkspaceList.
         * @implements IWorkspaceList
         * @constructor
         * @param {fqdp.IWorkspaceList=} [properties] Properties to set
         */
        function WorkspaceList(properties) {
            this.data = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * WorkspaceList data.
         * @member {Array.<fqdp.IWorkspace>} data
         * @memberof fqdp.WorkspaceList
         * @instance
         */
        WorkspaceList.prototype.data = $util.emptyArray;

        /**
         * WorkspaceList meta.
         * @member {fqdp.IPaginationMeta|null|undefined} meta
         * @memberof fqdp.WorkspaceList
         * @instance
         */
        WorkspaceList.prototype.meta = null;

        /**
         * Creates a new WorkspaceList instance using the specified properties.
         * @function create
         * @memberof fqdp.WorkspaceList
         * @static
         * @param {fqdp.IWorkspaceList=} [properties] Properties to set
         * @returns {fqdp.WorkspaceList} WorkspaceList instance
         */
        WorkspaceList.create = function create(properties) {
            return new WorkspaceList(properties);
        };

        /**
         * Encodes the specified WorkspaceList message. Does not implicitly {@link fqdp.WorkspaceList.verify|verify} messages.
         * @function encode
         * @memberof fqdp.WorkspaceList
         * @static
         * @param {fqdp.IWorkspaceList} message WorkspaceList message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        WorkspaceList.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.data != null && message.data.length)
                for (let i = 0; i < message.data.length; ++i)
                    $root.fqdp.Workspace.encode(message.data[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.meta != null && Object.hasOwnProperty.call(message, "meta"))
                $root.fqdp.PaginationMeta.encode(message.meta, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified WorkspaceList message, length delimited. Does not implicitly {@link fqdp.WorkspaceList.verify|verify} messages.
         * @function encodeDelimited
         * @memberof fqdp.WorkspaceList
         * @static
         * @param {fqdp.IWorkspaceList} message WorkspaceList message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        WorkspaceList.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a WorkspaceList message from the specified reader or buffer.
         * @function decode
         * @memberof fqdp.WorkspaceList
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {fqdp.WorkspaceList} WorkspaceList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        WorkspaceList.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.fqdp.WorkspaceList();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.data && message.data.length))
                            message.data = [];
                        message.data.push($root.fqdp.Workspace.decode(reader, reader.uint32()));
                        break;
                    }
                case 2: {
                        message.meta = $root.fqdp.PaginationMeta.decode(reader, reader.uint32());
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
         * Decodes a WorkspaceList message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof fqdp.WorkspaceList
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {fqdp.WorkspaceList} WorkspaceList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        WorkspaceList.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a WorkspaceList message.
         * @function verify
         * @memberof fqdp.WorkspaceList
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        WorkspaceList.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.data != null && message.hasOwnProperty("data")) {
                if (!Array.isArray(message.data))
                    return "data: array expected";
                for (let i = 0; i < message.data.length; ++i) {
                    let error = $root.fqdp.Workspace.verify(message.data[i]);
                    if (error)
                        return "data." + error;
                }
            }
            if (message.meta != null && message.hasOwnProperty("meta")) {
                let error = $root.fqdp.PaginationMeta.verify(message.meta);
                if (error)
                    return "meta." + error;
            }
            return null;
        };

        /**
         * Creates a WorkspaceList message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof fqdp.WorkspaceList
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {fqdp.WorkspaceList} WorkspaceList
         */
        WorkspaceList.fromObject = function fromObject(object) {
            if (object instanceof $root.fqdp.WorkspaceList)
                return object;
            let message = new $root.fqdp.WorkspaceList();
            if (object.data) {
                if (!Array.isArray(object.data))
                    throw TypeError(".fqdp.WorkspaceList.data: array expected");
                message.data = [];
                for (let i = 0; i < object.data.length; ++i) {
                    if (typeof object.data[i] !== "object")
                        throw TypeError(".fqdp.WorkspaceList.data: object expected");
                    message.data[i] = $root.fqdp.Workspace.fromObject(object.data[i]);
                }
            }
            if (object.meta != null) {
                if (typeof object.meta !== "object")
                    throw TypeError(".fqdp.WorkspaceList.meta: object expected");
                message.meta = $root.fqdp.PaginationMeta.fromObject(object.meta);
            }
            return message;
        };

        /**
         * Creates a plain object from a WorkspaceList message. Also converts values to other types if specified.
         * @function toObject
         * @memberof fqdp.WorkspaceList
         * @static
         * @param {fqdp.WorkspaceList} message WorkspaceList
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        WorkspaceList.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.data = [];
            if (options.defaults)
                object.meta = null;
            if (message.data && message.data.length) {
                object.data = [];
                for (let j = 0; j < message.data.length; ++j)
                    object.data[j] = $root.fqdp.Workspace.toObject(message.data[j], options);
            }
            if (message.meta != null && message.hasOwnProperty("meta"))
                object.meta = $root.fqdp.PaginationMeta.toObject(message.meta, options);
            return object;
        };

        /**
         * Converts this WorkspaceList to JSON.
         * @function toJSON
         * @memberof fqdp.WorkspaceList
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        WorkspaceList.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for WorkspaceList
         * @function getTypeUrl
         * @memberof fqdp.WorkspaceList
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        WorkspaceList.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/fqdp.WorkspaceList";
        };

        return WorkspaceList;
    })();

    fqdp.CreateWorkspaceRequest = (function() {

        /**
         * Properties of a CreateWorkspaceRequest.
         * @memberof fqdp
         * @interface ICreateWorkspaceRequest
         * @property {string|null} [name] CreateWorkspaceRequest name
         * @property {string|null} [description] CreateWorkspaceRequest description
         * @property {string|null} [organizationId] CreateWorkspaceRequest organizationId
         * @property {string|null} [metadataJson] CreateWorkspaceRequest metadataJson
         */

        /**
         * Constructs a new CreateWorkspaceRequest.
         * @memberof fqdp
         * @classdesc Represents a CreateWorkspaceRequest.
         * @implements ICreateWorkspaceRequest
         * @constructor
         * @param {fqdp.ICreateWorkspaceRequest=} [properties] Properties to set
         */
        function CreateWorkspaceRequest(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * CreateWorkspaceRequest name.
         * @member {string} name
         * @memberof fqdp.CreateWorkspaceRequest
         * @instance
         */
        CreateWorkspaceRequest.prototype.name = "";

        /**
         * CreateWorkspaceRequest description.
         * @member {string} description
         * @memberof fqdp.CreateWorkspaceRequest
         * @instance
         */
        CreateWorkspaceRequest.prototype.description = "";

        /**
         * CreateWorkspaceRequest organizationId.
         * @member {string} organizationId
         * @memberof fqdp.CreateWorkspaceRequest
         * @instance
         */
        CreateWorkspaceRequest.prototype.organizationId = "";

        /**
         * CreateWorkspaceRequest metadataJson.
         * @member {string} metadataJson
         * @memberof fqdp.CreateWorkspaceRequest
         * @instance
         */
        CreateWorkspaceRequest.prototype.metadataJson = "";

        /**
         * Creates a new CreateWorkspaceRequest instance using the specified properties.
         * @function create
         * @memberof fqdp.CreateWorkspaceRequest
         * @static
         * @param {fqdp.ICreateWorkspaceRequest=} [properties] Properties to set
         * @returns {fqdp.CreateWorkspaceRequest} CreateWorkspaceRequest instance
         */
        CreateWorkspaceRequest.create = function create(properties) {
            return new CreateWorkspaceRequest(properties);
        };

        /**
         * Encodes the specified CreateWorkspaceRequest message. Does not implicitly {@link fqdp.CreateWorkspaceRequest.verify|verify} messages.
         * @function encode
         * @memberof fqdp.CreateWorkspaceRequest
         * @static
         * @param {fqdp.ICreateWorkspaceRequest} message CreateWorkspaceRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CreateWorkspaceRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.description);
            if (message.organizationId != null && Object.hasOwnProperty.call(message, "organizationId"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.organizationId);
            if (message.metadataJson != null && Object.hasOwnProperty.call(message, "metadataJson"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.metadataJson);
            return writer;
        };

        /**
         * Encodes the specified CreateWorkspaceRequest message, length delimited. Does not implicitly {@link fqdp.CreateWorkspaceRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof fqdp.CreateWorkspaceRequest
         * @static
         * @param {fqdp.ICreateWorkspaceRequest} message CreateWorkspaceRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CreateWorkspaceRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a CreateWorkspaceRequest message from the specified reader or buffer.
         * @function decode
         * @memberof fqdp.CreateWorkspaceRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {fqdp.CreateWorkspaceRequest} CreateWorkspaceRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CreateWorkspaceRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.fqdp.CreateWorkspaceRequest();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.name = reader.string();
                        break;
                    }
                case 3: {
                        message.description = reader.string();
                        break;
                    }
                case 4: {
                        message.organizationId = reader.string();
                        break;
                    }
                case 5: {
                        message.metadataJson = reader.string();
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
         * Decodes a CreateWorkspaceRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof fqdp.CreateWorkspaceRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {fqdp.CreateWorkspaceRequest} CreateWorkspaceRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CreateWorkspaceRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a CreateWorkspaceRequest message.
         * @function verify
         * @memberof fqdp.CreateWorkspaceRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CreateWorkspaceRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.description != null && message.hasOwnProperty("description"))
                if (!$util.isString(message.description))
                    return "description: string expected";
            if (message.organizationId != null && message.hasOwnProperty("organizationId"))
                if (!$util.isString(message.organizationId))
                    return "organizationId: string expected";
            if (message.metadataJson != null && message.hasOwnProperty("metadataJson"))
                if (!$util.isString(message.metadataJson))
                    return "metadataJson: string expected";
            return null;
        };

        /**
         * Creates a CreateWorkspaceRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof fqdp.CreateWorkspaceRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {fqdp.CreateWorkspaceRequest} CreateWorkspaceRequest
         */
        CreateWorkspaceRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.fqdp.CreateWorkspaceRequest)
                return object;
            let message = new $root.fqdp.CreateWorkspaceRequest();
            if (object.name != null)
                message.name = String(object.name);
            if (object.description != null)
                message.description = String(object.description);
            if (object.organizationId != null)
                message.organizationId = String(object.organizationId);
            if (object.metadataJson != null)
                message.metadataJson = String(object.metadataJson);
            return message;
        };

        /**
         * Creates a plain object from a CreateWorkspaceRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof fqdp.CreateWorkspaceRequest
         * @static
         * @param {fqdp.CreateWorkspaceRequest} message CreateWorkspaceRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CreateWorkspaceRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.name = "";
                object.description = "";
                object.organizationId = "";
                object.metadataJson = "";
            }
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.description != null && message.hasOwnProperty("description"))
                object.description = message.description;
            if (message.organizationId != null && message.hasOwnProperty("organizationId"))
                object.organizationId = message.organizationId;
            if (message.metadataJson != null && message.hasOwnProperty("metadataJson"))
                object.metadataJson = message.metadataJson;
            return object;
        };

        /**
         * Converts this CreateWorkspaceRequest to JSON.
         * @function toJSON
         * @memberof fqdp.CreateWorkspaceRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CreateWorkspaceRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for CreateWorkspaceRequest
         * @function getTypeUrl
         * @memberof fqdp.CreateWorkspaceRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        CreateWorkspaceRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/fqdp.CreateWorkspaceRequest";
        };

        return CreateWorkspaceRequest;
    })();

    fqdp.UpdateWorkspaceRequest = (function() {

        /**
         * Properties of an UpdateWorkspaceRequest.
         * @memberof fqdp
         * @interface IUpdateWorkspaceRequest
         * @property {string|null} [name] UpdateWorkspaceRequest name
         * @property {string|null} [description] UpdateWorkspaceRequest description
         * @property {fqdp.EntityStatus|null} [status] UpdateWorkspaceRequest status
         * @property {string|null} [metadataJson] UpdateWorkspaceRequest metadataJson
         */

        /**
         * Constructs a new UpdateWorkspaceRequest.
         * @memberof fqdp
         * @classdesc Represents an UpdateWorkspaceRequest.
         * @implements IUpdateWorkspaceRequest
         * @constructor
         * @param {fqdp.IUpdateWorkspaceRequest=} [properties] Properties to set
         */
        function UpdateWorkspaceRequest(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * UpdateWorkspaceRequest name.
         * @member {string} name
         * @memberof fqdp.UpdateWorkspaceRequest
         * @instance
         */
        UpdateWorkspaceRequest.prototype.name = "";

        /**
         * UpdateWorkspaceRequest description.
         * @member {string} description
         * @memberof fqdp.UpdateWorkspaceRequest
         * @instance
         */
        UpdateWorkspaceRequest.prototype.description = "";

        /**
         * UpdateWorkspaceRequest status.
         * @member {fqdp.EntityStatus} status
         * @memberof fqdp.UpdateWorkspaceRequest
         * @instance
         */
        UpdateWorkspaceRequest.prototype.status = 0;

        /**
         * UpdateWorkspaceRequest metadataJson.
         * @member {string} metadataJson
         * @memberof fqdp.UpdateWorkspaceRequest
         * @instance
         */
        UpdateWorkspaceRequest.prototype.metadataJson = "";

        /**
         * Creates a new UpdateWorkspaceRequest instance using the specified properties.
         * @function create
         * @memberof fqdp.UpdateWorkspaceRequest
         * @static
         * @param {fqdp.IUpdateWorkspaceRequest=} [properties] Properties to set
         * @returns {fqdp.UpdateWorkspaceRequest} UpdateWorkspaceRequest instance
         */
        UpdateWorkspaceRequest.create = function create(properties) {
            return new UpdateWorkspaceRequest(properties);
        };

        /**
         * Encodes the specified UpdateWorkspaceRequest message. Does not implicitly {@link fqdp.UpdateWorkspaceRequest.verify|verify} messages.
         * @function encode
         * @memberof fqdp.UpdateWorkspaceRequest
         * @static
         * @param {fqdp.IUpdateWorkspaceRequest} message UpdateWorkspaceRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UpdateWorkspaceRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.description);
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 4, wireType 0 =*/32).int32(message.status);
            if (message.metadataJson != null && Object.hasOwnProperty.call(message, "metadataJson"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.metadataJson);
            return writer;
        };

        /**
         * Encodes the specified UpdateWorkspaceRequest message, length delimited. Does not implicitly {@link fqdp.UpdateWorkspaceRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof fqdp.UpdateWorkspaceRequest
         * @static
         * @param {fqdp.IUpdateWorkspaceRequest} message UpdateWorkspaceRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UpdateWorkspaceRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an UpdateWorkspaceRequest message from the specified reader or buffer.
         * @function decode
         * @memberof fqdp.UpdateWorkspaceRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {fqdp.UpdateWorkspaceRequest} UpdateWorkspaceRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UpdateWorkspaceRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.fqdp.UpdateWorkspaceRequest();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.name = reader.string();
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
                        message.metadataJson = reader.string();
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
         * Decodes an UpdateWorkspaceRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof fqdp.UpdateWorkspaceRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {fqdp.UpdateWorkspaceRequest} UpdateWorkspaceRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UpdateWorkspaceRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an UpdateWorkspaceRequest message.
         * @function verify
         * @memberof fqdp.UpdateWorkspaceRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        UpdateWorkspaceRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.description != null && message.hasOwnProperty("description"))
                if (!$util.isString(message.description))
                    return "description: string expected";
            if (message.status != null && message.hasOwnProperty("status"))
                switch (message.status) {
                default:
                    return "status: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                    break;
                }
            if (message.metadataJson != null && message.hasOwnProperty("metadataJson"))
                if (!$util.isString(message.metadataJson))
                    return "metadataJson: string expected";
            return null;
        };

        /**
         * Creates an UpdateWorkspaceRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof fqdp.UpdateWorkspaceRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {fqdp.UpdateWorkspaceRequest} UpdateWorkspaceRequest
         */
        UpdateWorkspaceRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.fqdp.UpdateWorkspaceRequest)
                return object;
            let message = new $root.fqdp.UpdateWorkspaceRequest();
            if (object.name != null)
                message.name = String(object.name);
            if (object.description != null)
                message.description = String(object.description);
            switch (object.status) {
            default:
                if (typeof object.status === "number") {
                    message.status = object.status;
                    break;
                }
                break;
            case "ENTITY_STATUS_UNSPECIFIED":
            case 0:
                message.status = 0;
                break;
            case "ACTIVE":
            case 1:
                message.status = 1;
                break;
            case "INACTIVE":
            case 2:
                message.status = 2;
                break;
            case "ARCHIVED":
            case 3:
                message.status = 3;
                break;
            }
            if (object.metadataJson != null)
                message.metadataJson = String(object.metadataJson);
            return message;
        };

        /**
         * Creates a plain object from an UpdateWorkspaceRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof fqdp.UpdateWorkspaceRequest
         * @static
         * @param {fqdp.UpdateWorkspaceRequest} message UpdateWorkspaceRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        UpdateWorkspaceRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.name = "";
                object.description = "";
                object.status = options.enums === String ? "ENTITY_STATUS_UNSPECIFIED" : 0;
                object.metadataJson = "";
            }
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.description != null && message.hasOwnProperty("description"))
                object.description = message.description;
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = options.enums === String ? $root.fqdp.EntityStatus[message.status] === undefined ? message.status : $root.fqdp.EntityStatus[message.status] : message.status;
            if (message.metadataJson != null && message.hasOwnProperty("metadataJson"))
                object.metadataJson = message.metadataJson;
            return object;
        };

        /**
         * Converts this UpdateWorkspaceRequest to JSON.
         * @function toJSON
         * @memberof fqdp.UpdateWorkspaceRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        UpdateWorkspaceRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for UpdateWorkspaceRequest
         * @function getTypeUrl
         * @memberof fqdp.UpdateWorkspaceRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        UpdateWorkspaceRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/fqdp.UpdateWorkspaceRequest";
        };

        return UpdateWorkspaceRequest;
    })();

    return fqdp;
})();

export { $root as default };
