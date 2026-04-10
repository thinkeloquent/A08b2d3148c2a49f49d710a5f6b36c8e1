/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const code_repositories = $root.code_repositories = (() => {

    /**
     * Namespace code_repositories.
     * @exports code_repositories
     * @namespace
     */
    const code_repositories = {};

    code_repositories.repository = (function() {

        /**
         * Namespace repository.
         * @memberof code_repositories
         * @namespace
         */
        const repository = {};

        repository.Repository = (function() {

            /**
             * Properties of a Repository.
             * @memberof code_repositories.repository
             * @interface IRepository
             * @property {string|null} [id] Repository id
             * @property {string|null} [name] Repository name
             * @property {string|null} [description] Repository description
             * @property {code_repositories.common.RepositoryType|null} [type] Repository type
             * @property {string|null} [githubUrl] Repository githubUrl
             * @property {string|null} [packageUrl] Repository packageUrl
             * @property {number|null} [stars] Repository stars
             * @property {number|null} [forks] Repository forks
             * @property {string|null} [version] Repository version
             * @property {string|null} [maintainer] Repository maintainer
             * @property {string|null} [lastUpdated] Repository lastUpdated
             * @property {boolean|null} [trending] Repository trending
             * @property {boolean|null} [verified] Repository verified
             * @property {string|null} [language] Repository language
             * @property {string|null} [license] Repository license
             * @property {string|null} [size] Repository size
             * @property {number|null} [dependencies] Repository dependencies
             * @property {number|null} [healthScore] Repository healthScore
             * @property {code_repositories.common.RepositoryStatus|null} [status] Repository status
             * @property {code_repositories.common.RepositorySource|null} [source] Repository source
             * @property {Array.<code_repositories.common.IExternalId>|null} [externalIds] Repository externalIds
             * @property {Array.<code_repositories.tag.ITag>|null} [tags] Repository tags
             * @property {Array.<code_repositories.metadata.IMetadata>|null} [metadata] Repository metadata
             * @property {code_repositories.common.ITimestamp|null} [createdAt] Repository createdAt
             * @property {code_repositories.common.ITimestamp|null} [updatedAt] Repository updatedAt
             */

            /**
             * Constructs a new Repository.
             * @memberof code_repositories.repository
             * @classdesc Represents a Repository.
             * @implements IRepository
             * @constructor
             * @param {code_repositories.repository.IRepository=} [properties] Properties to set
             */
            function Repository(properties) {
                this.externalIds = [];
                this.tags = [];
                this.metadata = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Repository id.
             * @member {string} id
             * @memberof code_repositories.repository.Repository
             * @instance
             */
            Repository.prototype.id = "";

            /**
             * Repository name.
             * @member {string} name
             * @memberof code_repositories.repository.Repository
             * @instance
             */
            Repository.prototype.name = "";

            /**
             * Repository description.
             * @member {string} description
             * @memberof code_repositories.repository.Repository
             * @instance
             */
            Repository.prototype.description = "";

            /**
             * Repository type.
             * @member {code_repositories.common.RepositoryType} type
             * @memberof code_repositories.repository.Repository
             * @instance
             */
            Repository.prototype.type = 0;

            /**
             * Repository githubUrl.
             * @member {string} githubUrl
             * @memberof code_repositories.repository.Repository
             * @instance
             */
            Repository.prototype.githubUrl = "";

            /**
             * Repository packageUrl.
             * @member {string} packageUrl
             * @memberof code_repositories.repository.Repository
             * @instance
             */
            Repository.prototype.packageUrl = "";

            /**
             * Repository stars.
             * @member {number} stars
             * @memberof code_repositories.repository.Repository
             * @instance
             */
            Repository.prototype.stars = 0;

            /**
             * Repository forks.
             * @member {number} forks
             * @memberof code_repositories.repository.Repository
             * @instance
             */
            Repository.prototype.forks = 0;

            /**
             * Repository version.
             * @member {string} version
             * @memberof code_repositories.repository.Repository
             * @instance
             */
            Repository.prototype.version = "";

            /**
             * Repository maintainer.
             * @member {string} maintainer
             * @memberof code_repositories.repository.Repository
             * @instance
             */
            Repository.prototype.maintainer = "";

            /**
             * Repository lastUpdated.
             * @member {string} lastUpdated
             * @memberof code_repositories.repository.Repository
             * @instance
             */
            Repository.prototype.lastUpdated = "";

            /**
             * Repository trending.
             * @member {boolean} trending
             * @memberof code_repositories.repository.Repository
             * @instance
             */
            Repository.prototype.trending = false;

            /**
             * Repository verified.
             * @member {boolean} verified
             * @memberof code_repositories.repository.Repository
             * @instance
             */
            Repository.prototype.verified = false;

            /**
             * Repository language.
             * @member {string} language
             * @memberof code_repositories.repository.Repository
             * @instance
             */
            Repository.prototype.language = "";

            /**
             * Repository license.
             * @member {string} license
             * @memberof code_repositories.repository.Repository
             * @instance
             */
            Repository.prototype.license = "";

            /**
             * Repository size.
             * @member {string} size
             * @memberof code_repositories.repository.Repository
             * @instance
             */
            Repository.prototype.size = "";

            /**
             * Repository dependencies.
             * @member {number} dependencies
             * @memberof code_repositories.repository.Repository
             * @instance
             */
            Repository.prototype.dependencies = 0;

            /**
             * Repository healthScore.
             * @member {number} healthScore
             * @memberof code_repositories.repository.Repository
             * @instance
             */
            Repository.prototype.healthScore = 0;

            /**
             * Repository status.
             * @member {code_repositories.common.RepositoryStatus} status
             * @memberof code_repositories.repository.Repository
             * @instance
             */
            Repository.prototype.status = 0;

            /**
             * Repository source.
             * @member {code_repositories.common.RepositorySource} source
             * @memberof code_repositories.repository.Repository
             * @instance
             */
            Repository.prototype.source = 0;

            /**
             * Repository externalIds.
             * @member {Array.<code_repositories.common.IExternalId>} externalIds
             * @memberof code_repositories.repository.Repository
             * @instance
             */
            Repository.prototype.externalIds = $util.emptyArray;

            /**
             * Repository tags.
             * @member {Array.<code_repositories.tag.ITag>} tags
             * @memberof code_repositories.repository.Repository
             * @instance
             */
            Repository.prototype.tags = $util.emptyArray;

            /**
             * Repository metadata.
             * @member {Array.<code_repositories.metadata.IMetadata>} metadata
             * @memberof code_repositories.repository.Repository
             * @instance
             */
            Repository.prototype.metadata = $util.emptyArray;

            /**
             * Repository createdAt.
             * @member {code_repositories.common.ITimestamp|null|undefined} createdAt
             * @memberof code_repositories.repository.Repository
             * @instance
             */
            Repository.prototype.createdAt = null;

            /**
             * Repository updatedAt.
             * @member {code_repositories.common.ITimestamp|null|undefined} updatedAt
             * @memberof code_repositories.repository.Repository
             * @instance
             */
            Repository.prototype.updatedAt = null;

            /**
             * Creates a new Repository instance using the specified properties.
             * @function create
             * @memberof code_repositories.repository.Repository
             * @static
             * @param {code_repositories.repository.IRepository=} [properties] Properties to set
             * @returns {code_repositories.repository.Repository} Repository instance
             */
            Repository.create = function create(properties) {
                return new Repository(properties);
            };

            /**
             * Encodes the specified Repository message. Does not implicitly {@link code_repositories.repository.Repository.verify|verify} messages.
             * @function encode
             * @memberof code_repositories.repository.Repository
             * @static
             * @param {code_repositories.repository.IRepository} message Repository message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Repository.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
                if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
                if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.description);
                if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                    writer.uint32(/* id 4, wireType 0 =*/32).int32(message.type);
                if (message.githubUrl != null && Object.hasOwnProperty.call(message, "githubUrl"))
                    writer.uint32(/* id 5, wireType 2 =*/42).string(message.githubUrl);
                if (message.packageUrl != null && Object.hasOwnProperty.call(message, "packageUrl"))
                    writer.uint32(/* id 6, wireType 2 =*/50).string(message.packageUrl);
                if (message.stars != null && Object.hasOwnProperty.call(message, "stars"))
                    writer.uint32(/* id 7, wireType 0 =*/56).int32(message.stars);
                if (message.forks != null && Object.hasOwnProperty.call(message, "forks"))
                    writer.uint32(/* id 8, wireType 0 =*/64).int32(message.forks);
                if (message.version != null && Object.hasOwnProperty.call(message, "version"))
                    writer.uint32(/* id 9, wireType 2 =*/74).string(message.version);
                if (message.maintainer != null && Object.hasOwnProperty.call(message, "maintainer"))
                    writer.uint32(/* id 10, wireType 2 =*/82).string(message.maintainer);
                if (message.lastUpdated != null && Object.hasOwnProperty.call(message, "lastUpdated"))
                    writer.uint32(/* id 11, wireType 2 =*/90).string(message.lastUpdated);
                if (message.trending != null && Object.hasOwnProperty.call(message, "trending"))
                    writer.uint32(/* id 12, wireType 0 =*/96).bool(message.trending);
                if (message.verified != null && Object.hasOwnProperty.call(message, "verified"))
                    writer.uint32(/* id 13, wireType 0 =*/104).bool(message.verified);
                if (message.language != null && Object.hasOwnProperty.call(message, "language"))
                    writer.uint32(/* id 14, wireType 2 =*/114).string(message.language);
                if (message.license != null && Object.hasOwnProperty.call(message, "license"))
                    writer.uint32(/* id 15, wireType 2 =*/122).string(message.license);
                if (message.size != null && Object.hasOwnProperty.call(message, "size"))
                    writer.uint32(/* id 16, wireType 2 =*/130).string(message.size);
                if (message.dependencies != null && Object.hasOwnProperty.call(message, "dependencies"))
                    writer.uint32(/* id 17, wireType 0 =*/136).int32(message.dependencies);
                if (message.healthScore != null && Object.hasOwnProperty.call(message, "healthScore"))
                    writer.uint32(/* id 18, wireType 0 =*/144).int32(message.healthScore);
                if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                    writer.uint32(/* id 19, wireType 0 =*/152).int32(message.status);
                if (message.source != null && Object.hasOwnProperty.call(message, "source"))
                    writer.uint32(/* id 20, wireType 0 =*/160).int32(message.source);
                if (message.externalIds != null && message.externalIds.length)
                    for (let i = 0; i < message.externalIds.length; ++i)
                        $root.code_repositories.common.ExternalId.encode(message.externalIds[i], writer.uint32(/* id 21, wireType 2 =*/170).fork()).ldelim();
                if (message.tags != null && message.tags.length)
                    for (let i = 0; i < message.tags.length; ++i)
                        $root.code_repositories.tag.Tag.encode(message.tags[i], writer.uint32(/* id 22, wireType 2 =*/178).fork()).ldelim();
                if (message.metadata != null && message.metadata.length)
                    for (let i = 0; i < message.metadata.length; ++i)
                        $root.code_repositories.metadata.Metadata.encode(message.metadata[i], writer.uint32(/* id 23, wireType 2 =*/186).fork()).ldelim();
                if (message.createdAt != null && Object.hasOwnProperty.call(message, "createdAt"))
                    $root.code_repositories.common.Timestamp.encode(message.createdAt, writer.uint32(/* id 24, wireType 2 =*/194).fork()).ldelim();
                if (message.updatedAt != null && Object.hasOwnProperty.call(message, "updatedAt"))
                    $root.code_repositories.common.Timestamp.encode(message.updatedAt, writer.uint32(/* id 25, wireType 2 =*/202).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified Repository message, length delimited. Does not implicitly {@link code_repositories.repository.Repository.verify|verify} messages.
             * @function encodeDelimited
             * @memberof code_repositories.repository.Repository
             * @static
             * @param {code_repositories.repository.IRepository} message Repository message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Repository.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Repository message from the specified reader or buffer.
             * @function decode
             * @memberof code_repositories.repository.Repository
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {code_repositories.repository.Repository} Repository
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Repository.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.code_repositories.repository.Repository();
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
                            message.type = reader.int32();
                            break;
                        }
                    case 5: {
                            message.githubUrl = reader.string();
                            break;
                        }
                    case 6: {
                            message.packageUrl = reader.string();
                            break;
                        }
                    case 7: {
                            message.stars = reader.int32();
                            break;
                        }
                    case 8: {
                            message.forks = reader.int32();
                            break;
                        }
                    case 9: {
                            message.version = reader.string();
                            break;
                        }
                    case 10: {
                            message.maintainer = reader.string();
                            break;
                        }
                    case 11: {
                            message.lastUpdated = reader.string();
                            break;
                        }
                    case 12: {
                            message.trending = reader.bool();
                            break;
                        }
                    case 13: {
                            message.verified = reader.bool();
                            break;
                        }
                    case 14: {
                            message.language = reader.string();
                            break;
                        }
                    case 15: {
                            message.license = reader.string();
                            break;
                        }
                    case 16: {
                            message.size = reader.string();
                            break;
                        }
                    case 17: {
                            message.dependencies = reader.int32();
                            break;
                        }
                    case 18: {
                            message.healthScore = reader.int32();
                            break;
                        }
                    case 19: {
                            message.status = reader.int32();
                            break;
                        }
                    case 20: {
                            message.source = reader.int32();
                            break;
                        }
                    case 21: {
                            if (!(message.externalIds && message.externalIds.length))
                                message.externalIds = [];
                            message.externalIds.push($root.code_repositories.common.ExternalId.decode(reader, reader.uint32()));
                            break;
                        }
                    case 22: {
                            if (!(message.tags && message.tags.length))
                                message.tags = [];
                            message.tags.push($root.code_repositories.tag.Tag.decode(reader, reader.uint32()));
                            break;
                        }
                    case 23: {
                            if (!(message.metadata && message.metadata.length))
                                message.metadata = [];
                            message.metadata.push($root.code_repositories.metadata.Metadata.decode(reader, reader.uint32()));
                            break;
                        }
                    case 24: {
                            message.createdAt = $root.code_repositories.common.Timestamp.decode(reader, reader.uint32());
                            break;
                        }
                    case 25: {
                            message.updatedAt = $root.code_repositories.common.Timestamp.decode(reader, reader.uint32());
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
             * Decodes a Repository message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof code_repositories.repository.Repository
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {code_repositories.repository.Repository} Repository
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Repository.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Repository message.
             * @function verify
             * @memberof code_repositories.repository.Repository
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Repository.verify = function verify(message) {
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
                if (message.type != null && message.hasOwnProperty("type"))
                    switch (message.type) {
                    default:
                        return "type: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                        break;
                    }
                if (message.githubUrl != null && message.hasOwnProperty("githubUrl"))
                    if (!$util.isString(message.githubUrl))
                        return "githubUrl: string expected";
                if (message.packageUrl != null && message.hasOwnProperty("packageUrl"))
                    if (!$util.isString(message.packageUrl))
                        return "packageUrl: string expected";
                if (message.stars != null && message.hasOwnProperty("stars"))
                    if (!$util.isInteger(message.stars))
                        return "stars: integer expected";
                if (message.forks != null && message.hasOwnProperty("forks"))
                    if (!$util.isInteger(message.forks))
                        return "forks: integer expected";
                if (message.version != null && message.hasOwnProperty("version"))
                    if (!$util.isString(message.version))
                        return "version: string expected";
                if (message.maintainer != null && message.hasOwnProperty("maintainer"))
                    if (!$util.isString(message.maintainer))
                        return "maintainer: string expected";
                if (message.lastUpdated != null && message.hasOwnProperty("lastUpdated"))
                    if (!$util.isString(message.lastUpdated))
                        return "lastUpdated: string expected";
                if (message.trending != null && message.hasOwnProperty("trending"))
                    if (typeof message.trending !== "boolean")
                        return "trending: boolean expected";
                if (message.verified != null && message.hasOwnProperty("verified"))
                    if (typeof message.verified !== "boolean")
                        return "verified: boolean expected";
                if (message.language != null && message.hasOwnProperty("language"))
                    if (!$util.isString(message.language))
                        return "language: string expected";
                if (message.license != null && message.hasOwnProperty("license"))
                    if (!$util.isString(message.license))
                        return "license: string expected";
                if (message.size != null && message.hasOwnProperty("size"))
                    if (!$util.isString(message.size))
                        return "size: string expected";
                if (message.dependencies != null && message.hasOwnProperty("dependencies"))
                    if (!$util.isInteger(message.dependencies))
                        return "dependencies: integer expected";
                if (message.healthScore != null && message.hasOwnProperty("healthScore"))
                    if (!$util.isInteger(message.healthScore))
                        return "healthScore: integer expected";
                if (message.status != null && message.hasOwnProperty("status"))
                    switch (message.status) {
                    default:
                        return "status: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                        break;
                    }
                if (message.source != null && message.hasOwnProperty("source"))
                    switch (message.source) {
                    default:
                        return "source: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                        break;
                    }
                if (message.externalIds != null && message.hasOwnProperty("externalIds")) {
                    if (!Array.isArray(message.externalIds))
                        return "externalIds: array expected";
                    for (let i = 0; i < message.externalIds.length; ++i) {
                        let error = $root.code_repositories.common.ExternalId.verify(message.externalIds[i]);
                        if (error)
                            return "externalIds." + error;
                    }
                }
                if (message.tags != null && message.hasOwnProperty("tags")) {
                    if (!Array.isArray(message.tags))
                        return "tags: array expected";
                    for (let i = 0; i < message.tags.length; ++i) {
                        let error = $root.code_repositories.tag.Tag.verify(message.tags[i]);
                        if (error)
                            return "tags." + error;
                    }
                }
                if (message.metadata != null && message.hasOwnProperty("metadata")) {
                    if (!Array.isArray(message.metadata))
                        return "metadata: array expected";
                    for (let i = 0; i < message.metadata.length; ++i) {
                        let error = $root.code_repositories.metadata.Metadata.verify(message.metadata[i]);
                        if (error)
                            return "metadata." + error;
                    }
                }
                if (message.createdAt != null && message.hasOwnProperty("createdAt")) {
                    let error = $root.code_repositories.common.Timestamp.verify(message.createdAt);
                    if (error)
                        return "createdAt." + error;
                }
                if (message.updatedAt != null && message.hasOwnProperty("updatedAt")) {
                    let error = $root.code_repositories.common.Timestamp.verify(message.updatedAt);
                    if (error)
                        return "updatedAt." + error;
                }
                return null;
            };

            /**
             * Creates a Repository message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof code_repositories.repository.Repository
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {code_repositories.repository.Repository} Repository
             */
            Repository.fromObject = function fromObject(object) {
                if (object instanceof $root.code_repositories.repository.Repository)
                    return object;
                let message = new $root.code_repositories.repository.Repository();
                if (object.id != null)
                    message.id = String(object.id);
                if (object.name != null)
                    message.name = String(object.name);
                if (object.description != null)
                    message.description = String(object.description);
                switch (object.type) {
                default:
                    if (typeof object.type === "number") {
                        message.type = object.type;
                        break;
                    }
                    break;
                case "REPOSITORY_TYPE_UNSPECIFIED":
                case 0:
                    message.type = 0;
                    break;
                case "REPOSITORY_TYPE_NPM":
                case 1:
                    message.type = 1;
                    break;
                case "REPOSITORY_TYPE_DOCKER":
                case 2:
                    message.type = 2;
                    break;
                case "REPOSITORY_TYPE_PYTHON":
                case 3:
                    message.type = 3;
                    break;
                }
                if (object.githubUrl != null)
                    message.githubUrl = String(object.githubUrl);
                if (object.packageUrl != null)
                    message.packageUrl = String(object.packageUrl);
                if (object.stars != null)
                    message.stars = object.stars | 0;
                if (object.forks != null)
                    message.forks = object.forks | 0;
                if (object.version != null)
                    message.version = String(object.version);
                if (object.maintainer != null)
                    message.maintainer = String(object.maintainer);
                if (object.lastUpdated != null)
                    message.lastUpdated = String(object.lastUpdated);
                if (object.trending != null)
                    message.trending = Boolean(object.trending);
                if (object.verified != null)
                    message.verified = Boolean(object.verified);
                if (object.language != null)
                    message.language = String(object.language);
                if (object.license != null)
                    message.license = String(object.license);
                if (object.size != null)
                    message.size = String(object.size);
                if (object.dependencies != null)
                    message.dependencies = object.dependencies | 0;
                if (object.healthScore != null)
                    message.healthScore = object.healthScore | 0;
                switch (object.status) {
                default:
                    if (typeof object.status === "number") {
                        message.status = object.status;
                        break;
                    }
                    break;
                case "REPOSITORY_STATUS_UNSPECIFIED":
                case 0:
                    message.status = 0;
                    break;
                case "REPOSITORY_STATUS_STABLE":
                case 1:
                    message.status = 1;
                    break;
                case "REPOSITORY_STATUS_BETA":
                case 2:
                    message.status = 2;
                    break;
                case "REPOSITORY_STATUS_DEPRECATED":
                case 3:
                    message.status = 3;
                    break;
                case "REPOSITORY_STATUS_EXPERIMENTAL":
                case 4:
                    message.status = 4;
                    break;
                }
                switch (object.source) {
                default:
                    if (typeof object.source === "number") {
                        message.source = object.source;
                        break;
                    }
                    break;
                case "REPOSITORY_SOURCE_UNSPECIFIED":
                case 0:
                    message.source = 0;
                    break;
                case "REPOSITORY_SOURCE_GITHUB":
                case 1:
                    message.source = 1;
                    break;
                case "REPOSITORY_SOURCE_NPM":
                case 2:
                    message.source = 2;
                    break;
                case "REPOSITORY_SOURCE_DOCKERHUB":
                case 3:
                    message.source = 3;
                    break;
                case "REPOSITORY_SOURCE_PYPI":
                case 4:
                    message.source = 4;
                    break;
                case "REPOSITORY_SOURCE_MANUAL":
                case 5:
                    message.source = 5;
                    break;
                }
                if (object.externalIds) {
                    if (!Array.isArray(object.externalIds))
                        throw TypeError(".code_repositories.repository.Repository.externalIds: array expected");
                    message.externalIds = [];
                    for (let i = 0; i < object.externalIds.length; ++i) {
                        if (typeof object.externalIds[i] !== "object")
                            throw TypeError(".code_repositories.repository.Repository.externalIds: object expected");
                        message.externalIds[i] = $root.code_repositories.common.ExternalId.fromObject(object.externalIds[i]);
                    }
                }
                if (object.tags) {
                    if (!Array.isArray(object.tags))
                        throw TypeError(".code_repositories.repository.Repository.tags: array expected");
                    message.tags = [];
                    for (let i = 0; i < object.tags.length; ++i) {
                        if (typeof object.tags[i] !== "object")
                            throw TypeError(".code_repositories.repository.Repository.tags: object expected");
                        message.tags[i] = $root.code_repositories.tag.Tag.fromObject(object.tags[i]);
                    }
                }
                if (object.metadata) {
                    if (!Array.isArray(object.metadata))
                        throw TypeError(".code_repositories.repository.Repository.metadata: array expected");
                    message.metadata = [];
                    for (let i = 0; i < object.metadata.length; ++i) {
                        if (typeof object.metadata[i] !== "object")
                            throw TypeError(".code_repositories.repository.Repository.metadata: object expected");
                        message.metadata[i] = $root.code_repositories.metadata.Metadata.fromObject(object.metadata[i]);
                    }
                }
                if (object.createdAt != null) {
                    if (typeof object.createdAt !== "object")
                        throw TypeError(".code_repositories.repository.Repository.createdAt: object expected");
                    message.createdAt = $root.code_repositories.common.Timestamp.fromObject(object.createdAt);
                }
                if (object.updatedAt != null) {
                    if (typeof object.updatedAt !== "object")
                        throw TypeError(".code_repositories.repository.Repository.updatedAt: object expected");
                    message.updatedAt = $root.code_repositories.common.Timestamp.fromObject(object.updatedAt);
                }
                return message;
            };

            /**
             * Creates a plain object from a Repository message. Also converts values to other types if specified.
             * @function toObject
             * @memberof code_repositories.repository.Repository
             * @static
             * @param {code_repositories.repository.Repository} message Repository
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Repository.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.arrays || options.defaults) {
                    object.externalIds = [];
                    object.tags = [];
                    object.metadata = [];
                }
                if (options.defaults) {
                    object.id = "";
                    object.name = "";
                    object.description = "";
                    object.type = options.enums === String ? "REPOSITORY_TYPE_UNSPECIFIED" : 0;
                    object.githubUrl = "";
                    object.packageUrl = "";
                    object.stars = 0;
                    object.forks = 0;
                    object.version = "";
                    object.maintainer = "";
                    object.lastUpdated = "";
                    object.trending = false;
                    object.verified = false;
                    object.language = "";
                    object.license = "";
                    object.size = "";
                    object.dependencies = 0;
                    object.healthScore = 0;
                    object.status = options.enums === String ? "REPOSITORY_STATUS_UNSPECIFIED" : 0;
                    object.source = options.enums === String ? "REPOSITORY_SOURCE_UNSPECIFIED" : 0;
                    object.createdAt = null;
                    object.updatedAt = null;
                }
                if (message.id != null && message.hasOwnProperty("id"))
                    object.id = message.id;
                if (message.name != null && message.hasOwnProperty("name"))
                    object.name = message.name;
                if (message.description != null && message.hasOwnProperty("description"))
                    object.description = message.description;
                if (message.type != null && message.hasOwnProperty("type"))
                    object.type = options.enums === String ? $root.code_repositories.common.RepositoryType[message.type] === undefined ? message.type : $root.code_repositories.common.RepositoryType[message.type] : message.type;
                if (message.githubUrl != null && message.hasOwnProperty("githubUrl"))
                    object.githubUrl = message.githubUrl;
                if (message.packageUrl != null && message.hasOwnProperty("packageUrl"))
                    object.packageUrl = message.packageUrl;
                if (message.stars != null && message.hasOwnProperty("stars"))
                    object.stars = message.stars;
                if (message.forks != null && message.hasOwnProperty("forks"))
                    object.forks = message.forks;
                if (message.version != null && message.hasOwnProperty("version"))
                    object.version = message.version;
                if (message.maintainer != null && message.hasOwnProperty("maintainer"))
                    object.maintainer = message.maintainer;
                if (message.lastUpdated != null && message.hasOwnProperty("lastUpdated"))
                    object.lastUpdated = message.lastUpdated;
                if (message.trending != null && message.hasOwnProperty("trending"))
                    object.trending = message.trending;
                if (message.verified != null && message.hasOwnProperty("verified"))
                    object.verified = message.verified;
                if (message.language != null && message.hasOwnProperty("language"))
                    object.language = message.language;
                if (message.license != null && message.hasOwnProperty("license"))
                    object.license = message.license;
                if (message.size != null && message.hasOwnProperty("size"))
                    object.size = message.size;
                if (message.dependencies != null && message.hasOwnProperty("dependencies"))
                    object.dependencies = message.dependencies;
                if (message.healthScore != null && message.hasOwnProperty("healthScore"))
                    object.healthScore = message.healthScore;
                if (message.status != null && message.hasOwnProperty("status"))
                    object.status = options.enums === String ? $root.code_repositories.common.RepositoryStatus[message.status] === undefined ? message.status : $root.code_repositories.common.RepositoryStatus[message.status] : message.status;
                if (message.source != null && message.hasOwnProperty("source"))
                    object.source = options.enums === String ? $root.code_repositories.common.RepositorySource[message.source] === undefined ? message.source : $root.code_repositories.common.RepositorySource[message.source] : message.source;
                if (message.externalIds && message.externalIds.length) {
                    object.externalIds = [];
                    for (let j = 0; j < message.externalIds.length; ++j)
                        object.externalIds[j] = $root.code_repositories.common.ExternalId.toObject(message.externalIds[j], options);
                }
                if (message.tags && message.tags.length) {
                    object.tags = [];
                    for (let j = 0; j < message.tags.length; ++j)
                        object.tags[j] = $root.code_repositories.tag.Tag.toObject(message.tags[j], options);
                }
                if (message.metadata && message.metadata.length) {
                    object.metadata = [];
                    for (let j = 0; j < message.metadata.length; ++j)
                        object.metadata[j] = $root.code_repositories.metadata.Metadata.toObject(message.metadata[j], options);
                }
                if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                    object.createdAt = $root.code_repositories.common.Timestamp.toObject(message.createdAt, options);
                if (message.updatedAt != null && message.hasOwnProperty("updatedAt"))
                    object.updatedAt = $root.code_repositories.common.Timestamp.toObject(message.updatedAt, options);
                return object;
            };

            /**
             * Converts this Repository to JSON.
             * @function toJSON
             * @memberof code_repositories.repository.Repository
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Repository.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Repository
             * @function getTypeUrl
             * @memberof code_repositories.repository.Repository
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Repository.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/code_repositories.repository.Repository";
            };

            return Repository;
        })();

        repository.ListRepositoriesRequest = (function() {

            /**
             * Properties of a ListRepositoriesRequest.
             * @memberof code_repositories.repository
             * @interface IListRepositoriesRequest
             * @property {code_repositories.common.IPaginationRequest|null} [pagination] ListRepositoriesRequest pagination
             * @property {code_repositories.common.RepositoryType|null} [type] ListRepositoriesRequest type
             * @property {code_repositories.common.RepositoryStatus|null} [status] ListRepositoriesRequest status
             * @property {string|null} [search] ListRepositoriesRequest search
             * @property {Array.<string>|null} [tags] ListRepositoriesRequest tags
             * @property {boolean|null} [trending] ListRepositoriesRequest trending
             * @property {boolean|null} [verified] ListRepositoriesRequest verified
             * @property {boolean|null} [includeTags] ListRepositoriesRequest includeTags
             * @property {boolean|null} [includeMetadata] ListRepositoriesRequest includeMetadata
             */

            /**
             * Constructs a new ListRepositoriesRequest.
             * @memberof code_repositories.repository
             * @classdesc Represents a ListRepositoriesRequest.
             * @implements IListRepositoriesRequest
             * @constructor
             * @param {code_repositories.repository.IListRepositoriesRequest=} [properties] Properties to set
             */
            function ListRepositoriesRequest(properties) {
                this.tags = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ListRepositoriesRequest pagination.
             * @member {code_repositories.common.IPaginationRequest|null|undefined} pagination
             * @memberof code_repositories.repository.ListRepositoriesRequest
             * @instance
             */
            ListRepositoriesRequest.prototype.pagination = null;

            /**
             * ListRepositoriesRequest type.
             * @member {code_repositories.common.RepositoryType} type
             * @memberof code_repositories.repository.ListRepositoriesRequest
             * @instance
             */
            ListRepositoriesRequest.prototype.type = 0;

            /**
             * ListRepositoriesRequest status.
             * @member {code_repositories.common.RepositoryStatus} status
             * @memberof code_repositories.repository.ListRepositoriesRequest
             * @instance
             */
            ListRepositoriesRequest.prototype.status = 0;

            /**
             * ListRepositoriesRequest search.
             * @member {string} search
             * @memberof code_repositories.repository.ListRepositoriesRequest
             * @instance
             */
            ListRepositoriesRequest.prototype.search = "";

            /**
             * ListRepositoriesRequest tags.
             * @member {Array.<string>} tags
             * @memberof code_repositories.repository.ListRepositoriesRequest
             * @instance
             */
            ListRepositoriesRequest.prototype.tags = $util.emptyArray;

            /**
             * ListRepositoriesRequest trending.
             * @member {boolean} trending
             * @memberof code_repositories.repository.ListRepositoriesRequest
             * @instance
             */
            ListRepositoriesRequest.prototype.trending = false;

            /**
             * ListRepositoriesRequest verified.
             * @member {boolean} verified
             * @memberof code_repositories.repository.ListRepositoriesRequest
             * @instance
             */
            ListRepositoriesRequest.prototype.verified = false;

            /**
             * ListRepositoriesRequest includeTags.
             * @member {boolean} includeTags
             * @memberof code_repositories.repository.ListRepositoriesRequest
             * @instance
             */
            ListRepositoriesRequest.prototype.includeTags = false;

            /**
             * ListRepositoriesRequest includeMetadata.
             * @member {boolean} includeMetadata
             * @memberof code_repositories.repository.ListRepositoriesRequest
             * @instance
             */
            ListRepositoriesRequest.prototype.includeMetadata = false;

            /**
             * Creates a new ListRepositoriesRequest instance using the specified properties.
             * @function create
             * @memberof code_repositories.repository.ListRepositoriesRequest
             * @static
             * @param {code_repositories.repository.IListRepositoriesRequest=} [properties] Properties to set
             * @returns {code_repositories.repository.ListRepositoriesRequest} ListRepositoriesRequest instance
             */
            ListRepositoriesRequest.create = function create(properties) {
                return new ListRepositoriesRequest(properties);
            };

            /**
             * Encodes the specified ListRepositoriesRequest message. Does not implicitly {@link code_repositories.repository.ListRepositoriesRequest.verify|verify} messages.
             * @function encode
             * @memberof code_repositories.repository.ListRepositoriesRequest
             * @static
             * @param {code_repositories.repository.IListRepositoriesRequest} message ListRepositoriesRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ListRepositoriesRequest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.pagination != null && Object.hasOwnProperty.call(message, "pagination"))
                    $root.code_repositories.common.PaginationRequest.encode(message.pagination, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int32(message.type);
                if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                    writer.uint32(/* id 3, wireType 0 =*/24).int32(message.status);
                if (message.search != null && Object.hasOwnProperty.call(message, "search"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.search);
                if (message.tags != null && message.tags.length)
                    for (let i = 0; i < message.tags.length; ++i)
                        writer.uint32(/* id 5, wireType 2 =*/42).string(message.tags[i]);
                if (message.trending != null && Object.hasOwnProperty.call(message, "trending"))
                    writer.uint32(/* id 6, wireType 0 =*/48).bool(message.trending);
                if (message.verified != null && Object.hasOwnProperty.call(message, "verified"))
                    writer.uint32(/* id 7, wireType 0 =*/56).bool(message.verified);
                if (message.includeTags != null && Object.hasOwnProperty.call(message, "includeTags"))
                    writer.uint32(/* id 8, wireType 0 =*/64).bool(message.includeTags);
                if (message.includeMetadata != null && Object.hasOwnProperty.call(message, "includeMetadata"))
                    writer.uint32(/* id 9, wireType 0 =*/72).bool(message.includeMetadata);
                return writer;
            };

            /**
             * Encodes the specified ListRepositoriesRequest message, length delimited. Does not implicitly {@link code_repositories.repository.ListRepositoriesRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof code_repositories.repository.ListRepositoriesRequest
             * @static
             * @param {code_repositories.repository.IListRepositoriesRequest} message ListRepositoriesRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ListRepositoriesRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ListRepositoriesRequest message from the specified reader or buffer.
             * @function decode
             * @memberof code_repositories.repository.ListRepositoriesRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {code_repositories.repository.ListRepositoriesRequest} ListRepositoriesRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ListRepositoriesRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.code_repositories.repository.ListRepositoriesRequest();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.pagination = $root.code_repositories.common.PaginationRequest.decode(reader, reader.uint32());
                            break;
                        }
                    case 2: {
                            message.type = reader.int32();
                            break;
                        }
                    case 3: {
                            message.status = reader.int32();
                            break;
                        }
                    case 4: {
                            message.search = reader.string();
                            break;
                        }
                    case 5: {
                            if (!(message.tags && message.tags.length))
                                message.tags = [];
                            message.tags.push(reader.string());
                            break;
                        }
                    case 6: {
                            message.trending = reader.bool();
                            break;
                        }
                    case 7: {
                            message.verified = reader.bool();
                            break;
                        }
                    case 8: {
                            message.includeTags = reader.bool();
                            break;
                        }
                    case 9: {
                            message.includeMetadata = reader.bool();
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
             * Decodes a ListRepositoriesRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof code_repositories.repository.ListRepositoriesRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {code_repositories.repository.ListRepositoriesRequest} ListRepositoriesRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ListRepositoriesRequest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ListRepositoriesRequest message.
             * @function verify
             * @memberof code_repositories.repository.ListRepositoriesRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ListRepositoriesRequest.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.pagination != null && message.hasOwnProperty("pagination")) {
                    let error = $root.code_repositories.common.PaginationRequest.verify(message.pagination);
                    if (error)
                        return "pagination." + error;
                }
                if (message.type != null && message.hasOwnProperty("type"))
                    switch (message.type) {
                    default:
                        return "type: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                        break;
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
                        break;
                    }
                if (message.search != null && message.hasOwnProperty("search"))
                    if (!$util.isString(message.search))
                        return "search: string expected";
                if (message.tags != null && message.hasOwnProperty("tags")) {
                    if (!Array.isArray(message.tags))
                        return "tags: array expected";
                    for (let i = 0; i < message.tags.length; ++i)
                        if (!$util.isString(message.tags[i]))
                            return "tags: string[] expected";
                }
                if (message.trending != null && message.hasOwnProperty("trending"))
                    if (typeof message.trending !== "boolean")
                        return "trending: boolean expected";
                if (message.verified != null && message.hasOwnProperty("verified"))
                    if (typeof message.verified !== "boolean")
                        return "verified: boolean expected";
                if (message.includeTags != null && message.hasOwnProperty("includeTags"))
                    if (typeof message.includeTags !== "boolean")
                        return "includeTags: boolean expected";
                if (message.includeMetadata != null && message.hasOwnProperty("includeMetadata"))
                    if (typeof message.includeMetadata !== "boolean")
                        return "includeMetadata: boolean expected";
                return null;
            };

            /**
             * Creates a ListRepositoriesRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof code_repositories.repository.ListRepositoriesRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {code_repositories.repository.ListRepositoriesRequest} ListRepositoriesRequest
             */
            ListRepositoriesRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.code_repositories.repository.ListRepositoriesRequest)
                    return object;
                let message = new $root.code_repositories.repository.ListRepositoriesRequest();
                if (object.pagination != null) {
                    if (typeof object.pagination !== "object")
                        throw TypeError(".code_repositories.repository.ListRepositoriesRequest.pagination: object expected");
                    message.pagination = $root.code_repositories.common.PaginationRequest.fromObject(object.pagination);
                }
                switch (object.type) {
                default:
                    if (typeof object.type === "number") {
                        message.type = object.type;
                        break;
                    }
                    break;
                case "REPOSITORY_TYPE_UNSPECIFIED":
                case 0:
                    message.type = 0;
                    break;
                case "REPOSITORY_TYPE_NPM":
                case 1:
                    message.type = 1;
                    break;
                case "REPOSITORY_TYPE_DOCKER":
                case 2:
                    message.type = 2;
                    break;
                case "REPOSITORY_TYPE_PYTHON":
                case 3:
                    message.type = 3;
                    break;
                }
                switch (object.status) {
                default:
                    if (typeof object.status === "number") {
                        message.status = object.status;
                        break;
                    }
                    break;
                case "REPOSITORY_STATUS_UNSPECIFIED":
                case 0:
                    message.status = 0;
                    break;
                case "REPOSITORY_STATUS_STABLE":
                case 1:
                    message.status = 1;
                    break;
                case "REPOSITORY_STATUS_BETA":
                case 2:
                    message.status = 2;
                    break;
                case "REPOSITORY_STATUS_DEPRECATED":
                case 3:
                    message.status = 3;
                    break;
                case "REPOSITORY_STATUS_EXPERIMENTAL":
                case 4:
                    message.status = 4;
                    break;
                }
                if (object.search != null)
                    message.search = String(object.search);
                if (object.tags) {
                    if (!Array.isArray(object.tags))
                        throw TypeError(".code_repositories.repository.ListRepositoriesRequest.tags: array expected");
                    message.tags = [];
                    for (let i = 0; i < object.tags.length; ++i)
                        message.tags[i] = String(object.tags[i]);
                }
                if (object.trending != null)
                    message.trending = Boolean(object.trending);
                if (object.verified != null)
                    message.verified = Boolean(object.verified);
                if (object.includeTags != null)
                    message.includeTags = Boolean(object.includeTags);
                if (object.includeMetadata != null)
                    message.includeMetadata = Boolean(object.includeMetadata);
                return message;
            };

            /**
             * Creates a plain object from a ListRepositoriesRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof code_repositories.repository.ListRepositoriesRequest
             * @static
             * @param {code_repositories.repository.ListRepositoriesRequest} message ListRepositoriesRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ListRepositoriesRequest.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.arrays || options.defaults)
                    object.tags = [];
                if (options.defaults) {
                    object.pagination = null;
                    object.type = options.enums === String ? "REPOSITORY_TYPE_UNSPECIFIED" : 0;
                    object.status = options.enums === String ? "REPOSITORY_STATUS_UNSPECIFIED" : 0;
                    object.search = "";
                    object.trending = false;
                    object.verified = false;
                    object.includeTags = false;
                    object.includeMetadata = false;
                }
                if (message.pagination != null && message.hasOwnProperty("pagination"))
                    object.pagination = $root.code_repositories.common.PaginationRequest.toObject(message.pagination, options);
                if (message.type != null && message.hasOwnProperty("type"))
                    object.type = options.enums === String ? $root.code_repositories.common.RepositoryType[message.type] === undefined ? message.type : $root.code_repositories.common.RepositoryType[message.type] : message.type;
                if (message.status != null && message.hasOwnProperty("status"))
                    object.status = options.enums === String ? $root.code_repositories.common.RepositoryStatus[message.status] === undefined ? message.status : $root.code_repositories.common.RepositoryStatus[message.status] : message.status;
                if (message.search != null && message.hasOwnProperty("search"))
                    object.search = message.search;
                if (message.tags && message.tags.length) {
                    object.tags = [];
                    for (let j = 0; j < message.tags.length; ++j)
                        object.tags[j] = message.tags[j];
                }
                if (message.trending != null && message.hasOwnProperty("trending"))
                    object.trending = message.trending;
                if (message.verified != null && message.hasOwnProperty("verified"))
                    object.verified = message.verified;
                if (message.includeTags != null && message.hasOwnProperty("includeTags"))
                    object.includeTags = message.includeTags;
                if (message.includeMetadata != null && message.hasOwnProperty("includeMetadata"))
                    object.includeMetadata = message.includeMetadata;
                return object;
            };

            /**
             * Converts this ListRepositoriesRequest to JSON.
             * @function toJSON
             * @memberof code_repositories.repository.ListRepositoriesRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ListRepositoriesRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ListRepositoriesRequest
             * @function getTypeUrl
             * @memberof code_repositories.repository.ListRepositoriesRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ListRepositoriesRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/code_repositories.repository.ListRepositoriesRequest";
            };

            return ListRepositoriesRequest;
        })();

        repository.ListRepositoriesResponse = (function() {

            /**
             * Properties of a ListRepositoriesResponse.
             * @memberof code_repositories.repository
             * @interface IListRepositoriesResponse
             * @property {Array.<code_repositories.repository.IRepository>|null} [repositories] ListRepositoriesResponse repositories
             * @property {code_repositories.common.IPaginationResponse|null} [pagination] ListRepositoriesResponse pagination
             */

            /**
             * Constructs a new ListRepositoriesResponse.
             * @memberof code_repositories.repository
             * @classdesc Represents a ListRepositoriesResponse.
             * @implements IListRepositoriesResponse
             * @constructor
             * @param {code_repositories.repository.IListRepositoriesResponse=} [properties] Properties to set
             */
            function ListRepositoriesResponse(properties) {
                this.repositories = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ListRepositoriesResponse repositories.
             * @member {Array.<code_repositories.repository.IRepository>} repositories
             * @memberof code_repositories.repository.ListRepositoriesResponse
             * @instance
             */
            ListRepositoriesResponse.prototype.repositories = $util.emptyArray;

            /**
             * ListRepositoriesResponse pagination.
             * @member {code_repositories.common.IPaginationResponse|null|undefined} pagination
             * @memberof code_repositories.repository.ListRepositoriesResponse
             * @instance
             */
            ListRepositoriesResponse.prototype.pagination = null;

            /**
             * Creates a new ListRepositoriesResponse instance using the specified properties.
             * @function create
             * @memberof code_repositories.repository.ListRepositoriesResponse
             * @static
             * @param {code_repositories.repository.IListRepositoriesResponse=} [properties] Properties to set
             * @returns {code_repositories.repository.ListRepositoriesResponse} ListRepositoriesResponse instance
             */
            ListRepositoriesResponse.create = function create(properties) {
                return new ListRepositoriesResponse(properties);
            };

            /**
             * Encodes the specified ListRepositoriesResponse message. Does not implicitly {@link code_repositories.repository.ListRepositoriesResponse.verify|verify} messages.
             * @function encode
             * @memberof code_repositories.repository.ListRepositoriesResponse
             * @static
             * @param {code_repositories.repository.IListRepositoriesResponse} message ListRepositoriesResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ListRepositoriesResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.repositories != null && message.repositories.length)
                    for (let i = 0; i < message.repositories.length; ++i)
                        $root.code_repositories.repository.Repository.encode(message.repositories[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                if (message.pagination != null && Object.hasOwnProperty.call(message, "pagination"))
                    $root.code_repositories.common.PaginationResponse.encode(message.pagination, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified ListRepositoriesResponse message, length delimited. Does not implicitly {@link code_repositories.repository.ListRepositoriesResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof code_repositories.repository.ListRepositoriesResponse
             * @static
             * @param {code_repositories.repository.IListRepositoriesResponse} message ListRepositoriesResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ListRepositoriesResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ListRepositoriesResponse message from the specified reader or buffer.
             * @function decode
             * @memberof code_repositories.repository.ListRepositoriesResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {code_repositories.repository.ListRepositoriesResponse} ListRepositoriesResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ListRepositoriesResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.code_repositories.repository.ListRepositoriesResponse();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            if (!(message.repositories && message.repositories.length))
                                message.repositories = [];
                            message.repositories.push($root.code_repositories.repository.Repository.decode(reader, reader.uint32()));
                            break;
                        }
                    case 2: {
                            message.pagination = $root.code_repositories.common.PaginationResponse.decode(reader, reader.uint32());
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
             * Decodes a ListRepositoriesResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof code_repositories.repository.ListRepositoriesResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {code_repositories.repository.ListRepositoriesResponse} ListRepositoriesResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ListRepositoriesResponse.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ListRepositoriesResponse message.
             * @function verify
             * @memberof code_repositories.repository.ListRepositoriesResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ListRepositoriesResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.repositories != null && message.hasOwnProperty("repositories")) {
                    if (!Array.isArray(message.repositories))
                        return "repositories: array expected";
                    for (let i = 0; i < message.repositories.length; ++i) {
                        let error = $root.code_repositories.repository.Repository.verify(message.repositories[i]);
                        if (error)
                            return "repositories." + error;
                    }
                }
                if (message.pagination != null && message.hasOwnProperty("pagination")) {
                    let error = $root.code_repositories.common.PaginationResponse.verify(message.pagination);
                    if (error)
                        return "pagination." + error;
                }
                return null;
            };

            /**
             * Creates a ListRepositoriesResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof code_repositories.repository.ListRepositoriesResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {code_repositories.repository.ListRepositoriesResponse} ListRepositoriesResponse
             */
            ListRepositoriesResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.code_repositories.repository.ListRepositoriesResponse)
                    return object;
                let message = new $root.code_repositories.repository.ListRepositoriesResponse();
                if (object.repositories) {
                    if (!Array.isArray(object.repositories))
                        throw TypeError(".code_repositories.repository.ListRepositoriesResponse.repositories: array expected");
                    message.repositories = [];
                    for (let i = 0; i < object.repositories.length; ++i) {
                        if (typeof object.repositories[i] !== "object")
                            throw TypeError(".code_repositories.repository.ListRepositoriesResponse.repositories: object expected");
                        message.repositories[i] = $root.code_repositories.repository.Repository.fromObject(object.repositories[i]);
                    }
                }
                if (object.pagination != null) {
                    if (typeof object.pagination !== "object")
                        throw TypeError(".code_repositories.repository.ListRepositoriesResponse.pagination: object expected");
                    message.pagination = $root.code_repositories.common.PaginationResponse.fromObject(object.pagination);
                }
                return message;
            };

            /**
             * Creates a plain object from a ListRepositoriesResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof code_repositories.repository.ListRepositoriesResponse
             * @static
             * @param {code_repositories.repository.ListRepositoriesResponse} message ListRepositoriesResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ListRepositoriesResponse.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.arrays || options.defaults)
                    object.repositories = [];
                if (options.defaults)
                    object.pagination = null;
                if (message.repositories && message.repositories.length) {
                    object.repositories = [];
                    for (let j = 0; j < message.repositories.length; ++j)
                        object.repositories[j] = $root.code_repositories.repository.Repository.toObject(message.repositories[j], options);
                }
                if (message.pagination != null && message.hasOwnProperty("pagination"))
                    object.pagination = $root.code_repositories.common.PaginationResponse.toObject(message.pagination, options);
                return object;
            };

            /**
             * Converts this ListRepositoriesResponse to JSON.
             * @function toJSON
             * @memberof code_repositories.repository.ListRepositoriesResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ListRepositoriesResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ListRepositoriesResponse
             * @function getTypeUrl
             * @memberof code_repositories.repository.ListRepositoriesResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ListRepositoriesResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/code_repositories.repository.ListRepositoriesResponse";
            };

            return ListRepositoriesResponse;
        })();

        repository.GetRepositoryRequest = (function() {

            /**
             * Properties of a GetRepositoryRequest.
             * @memberof code_repositories.repository
             * @interface IGetRepositoryRequest
             * @property {string|null} [id] GetRepositoryRequest id
             * @property {boolean|null} [includeTags] GetRepositoryRequest includeTags
             * @property {boolean|null} [includeMetadata] GetRepositoryRequest includeMetadata
             */

            /**
             * Constructs a new GetRepositoryRequest.
             * @memberof code_repositories.repository
             * @classdesc Represents a GetRepositoryRequest.
             * @implements IGetRepositoryRequest
             * @constructor
             * @param {code_repositories.repository.IGetRepositoryRequest=} [properties] Properties to set
             */
            function GetRepositoryRequest(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * GetRepositoryRequest id.
             * @member {string} id
             * @memberof code_repositories.repository.GetRepositoryRequest
             * @instance
             */
            GetRepositoryRequest.prototype.id = "";

            /**
             * GetRepositoryRequest includeTags.
             * @member {boolean} includeTags
             * @memberof code_repositories.repository.GetRepositoryRequest
             * @instance
             */
            GetRepositoryRequest.prototype.includeTags = false;

            /**
             * GetRepositoryRequest includeMetadata.
             * @member {boolean} includeMetadata
             * @memberof code_repositories.repository.GetRepositoryRequest
             * @instance
             */
            GetRepositoryRequest.prototype.includeMetadata = false;

            /**
             * Creates a new GetRepositoryRequest instance using the specified properties.
             * @function create
             * @memberof code_repositories.repository.GetRepositoryRequest
             * @static
             * @param {code_repositories.repository.IGetRepositoryRequest=} [properties] Properties to set
             * @returns {code_repositories.repository.GetRepositoryRequest} GetRepositoryRequest instance
             */
            GetRepositoryRequest.create = function create(properties) {
                return new GetRepositoryRequest(properties);
            };

            /**
             * Encodes the specified GetRepositoryRequest message. Does not implicitly {@link code_repositories.repository.GetRepositoryRequest.verify|verify} messages.
             * @function encode
             * @memberof code_repositories.repository.GetRepositoryRequest
             * @static
             * @param {code_repositories.repository.IGetRepositoryRequest} message GetRepositoryRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            GetRepositoryRequest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
                if (message.includeTags != null && Object.hasOwnProperty.call(message, "includeTags"))
                    writer.uint32(/* id 2, wireType 0 =*/16).bool(message.includeTags);
                if (message.includeMetadata != null && Object.hasOwnProperty.call(message, "includeMetadata"))
                    writer.uint32(/* id 3, wireType 0 =*/24).bool(message.includeMetadata);
                return writer;
            };

            /**
             * Encodes the specified GetRepositoryRequest message, length delimited. Does not implicitly {@link code_repositories.repository.GetRepositoryRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof code_repositories.repository.GetRepositoryRequest
             * @static
             * @param {code_repositories.repository.IGetRepositoryRequest} message GetRepositoryRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            GetRepositoryRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a GetRepositoryRequest message from the specified reader or buffer.
             * @function decode
             * @memberof code_repositories.repository.GetRepositoryRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {code_repositories.repository.GetRepositoryRequest} GetRepositoryRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            GetRepositoryRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.code_repositories.repository.GetRepositoryRequest();
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
                            message.includeTags = reader.bool();
                            break;
                        }
                    case 3: {
                            message.includeMetadata = reader.bool();
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
             * Decodes a GetRepositoryRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof code_repositories.repository.GetRepositoryRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {code_repositories.repository.GetRepositoryRequest} GetRepositoryRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            GetRepositoryRequest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a GetRepositoryRequest message.
             * @function verify
             * @memberof code_repositories.repository.GetRepositoryRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            GetRepositoryRequest.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.id != null && message.hasOwnProperty("id"))
                    if (!$util.isString(message.id))
                        return "id: string expected";
                if (message.includeTags != null && message.hasOwnProperty("includeTags"))
                    if (typeof message.includeTags !== "boolean")
                        return "includeTags: boolean expected";
                if (message.includeMetadata != null && message.hasOwnProperty("includeMetadata"))
                    if (typeof message.includeMetadata !== "boolean")
                        return "includeMetadata: boolean expected";
                return null;
            };

            /**
             * Creates a GetRepositoryRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof code_repositories.repository.GetRepositoryRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {code_repositories.repository.GetRepositoryRequest} GetRepositoryRequest
             */
            GetRepositoryRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.code_repositories.repository.GetRepositoryRequest)
                    return object;
                let message = new $root.code_repositories.repository.GetRepositoryRequest();
                if (object.id != null)
                    message.id = String(object.id);
                if (object.includeTags != null)
                    message.includeTags = Boolean(object.includeTags);
                if (object.includeMetadata != null)
                    message.includeMetadata = Boolean(object.includeMetadata);
                return message;
            };

            /**
             * Creates a plain object from a GetRepositoryRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof code_repositories.repository.GetRepositoryRequest
             * @static
             * @param {code_repositories.repository.GetRepositoryRequest} message GetRepositoryRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            GetRepositoryRequest.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.id = "";
                    object.includeTags = false;
                    object.includeMetadata = false;
                }
                if (message.id != null && message.hasOwnProperty("id"))
                    object.id = message.id;
                if (message.includeTags != null && message.hasOwnProperty("includeTags"))
                    object.includeTags = message.includeTags;
                if (message.includeMetadata != null && message.hasOwnProperty("includeMetadata"))
                    object.includeMetadata = message.includeMetadata;
                return object;
            };

            /**
             * Converts this GetRepositoryRequest to JSON.
             * @function toJSON
             * @memberof code_repositories.repository.GetRepositoryRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            GetRepositoryRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for GetRepositoryRequest
             * @function getTypeUrl
             * @memberof code_repositories.repository.GetRepositoryRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            GetRepositoryRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/code_repositories.repository.GetRepositoryRequest";
            };

            return GetRepositoryRequest;
        })();

        repository.GetRepositoryResponse = (function() {

            /**
             * Properties of a GetRepositoryResponse.
             * @memberof code_repositories.repository
             * @interface IGetRepositoryResponse
             * @property {code_repositories.repository.IRepository|null} [repository] GetRepositoryResponse repository
             */

            /**
             * Constructs a new GetRepositoryResponse.
             * @memberof code_repositories.repository
             * @classdesc Represents a GetRepositoryResponse.
             * @implements IGetRepositoryResponse
             * @constructor
             * @param {code_repositories.repository.IGetRepositoryResponse=} [properties] Properties to set
             */
            function GetRepositoryResponse(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * GetRepositoryResponse repository.
             * @member {code_repositories.repository.IRepository|null|undefined} repository
             * @memberof code_repositories.repository.GetRepositoryResponse
             * @instance
             */
            GetRepositoryResponse.prototype.repository = null;

            /**
             * Creates a new GetRepositoryResponse instance using the specified properties.
             * @function create
             * @memberof code_repositories.repository.GetRepositoryResponse
             * @static
             * @param {code_repositories.repository.IGetRepositoryResponse=} [properties] Properties to set
             * @returns {code_repositories.repository.GetRepositoryResponse} GetRepositoryResponse instance
             */
            GetRepositoryResponse.create = function create(properties) {
                return new GetRepositoryResponse(properties);
            };

            /**
             * Encodes the specified GetRepositoryResponse message. Does not implicitly {@link code_repositories.repository.GetRepositoryResponse.verify|verify} messages.
             * @function encode
             * @memberof code_repositories.repository.GetRepositoryResponse
             * @static
             * @param {code_repositories.repository.IGetRepositoryResponse} message GetRepositoryResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            GetRepositoryResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.repository != null && Object.hasOwnProperty.call(message, "repository"))
                    $root.code_repositories.repository.Repository.encode(message.repository, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified GetRepositoryResponse message, length delimited. Does not implicitly {@link code_repositories.repository.GetRepositoryResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof code_repositories.repository.GetRepositoryResponse
             * @static
             * @param {code_repositories.repository.IGetRepositoryResponse} message GetRepositoryResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            GetRepositoryResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a GetRepositoryResponse message from the specified reader or buffer.
             * @function decode
             * @memberof code_repositories.repository.GetRepositoryResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {code_repositories.repository.GetRepositoryResponse} GetRepositoryResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            GetRepositoryResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.code_repositories.repository.GetRepositoryResponse();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.repository = $root.code_repositories.repository.Repository.decode(reader, reader.uint32());
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
             * Decodes a GetRepositoryResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof code_repositories.repository.GetRepositoryResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {code_repositories.repository.GetRepositoryResponse} GetRepositoryResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            GetRepositoryResponse.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a GetRepositoryResponse message.
             * @function verify
             * @memberof code_repositories.repository.GetRepositoryResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            GetRepositoryResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.repository != null && message.hasOwnProperty("repository")) {
                    let error = $root.code_repositories.repository.Repository.verify(message.repository);
                    if (error)
                        return "repository." + error;
                }
                return null;
            };

            /**
             * Creates a GetRepositoryResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof code_repositories.repository.GetRepositoryResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {code_repositories.repository.GetRepositoryResponse} GetRepositoryResponse
             */
            GetRepositoryResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.code_repositories.repository.GetRepositoryResponse)
                    return object;
                let message = new $root.code_repositories.repository.GetRepositoryResponse();
                if (object.repository != null) {
                    if (typeof object.repository !== "object")
                        throw TypeError(".code_repositories.repository.GetRepositoryResponse.repository: object expected");
                    message.repository = $root.code_repositories.repository.Repository.fromObject(object.repository);
                }
                return message;
            };

            /**
             * Creates a plain object from a GetRepositoryResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof code_repositories.repository.GetRepositoryResponse
             * @static
             * @param {code_repositories.repository.GetRepositoryResponse} message GetRepositoryResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            GetRepositoryResponse.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults)
                    object.repository = null;
                if (message.repository != null && message.hasOwnProperty("repository"))
                    object.repository = $root.code_repositories.repository.Repository.toObject(message.repository, options);
                return object;
            };

            /**
             * Converts this GetRepositoryResponse to JSON.
             * @function toJSON
             * @memberof code_repositories.repository.GetRepositoryResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            GetRepositoryResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for GetRepositoryResponse
             * @function getTypeUrl
             * @memberof code_repositories.repository.GetRepositoryResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            GetRepositoryResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/code_repositories.repository.GetRepositoryResponse";
            };

            return GetRepositoryResponse;
        })();

        repository.CreateRepositoryRequest = (function() {

            /**
             * Properties of a CreateRepositoryRequest.
             * @memberof code_repositories.repository
             * @interface ICreateRepositoryRequest
             * @property {string|null} [name] CreateRepositoryRequest name
             * @property {string|null} [description] CreateRepositoryRequest description
             * @property {code_repositories.common.RepositoryType|null} [type] CreateRepositoryRequest type
             * @property {string|null} [githubUrl] CreateRepositoryRequest githubUrl
             * @property {string|null} [packageUrl] CreateRepositoryRequest packageUrl
             * @property {number|null} [stars] CreateRepositoryRequest stars
             * @property {number|null} [forks] CreateRepositoryRequest forks
             * @property {string|null} [version] CreateRepositoryRequest version
             * @property {string|null} [maintainer] CreateRepositoryRequest maintainer
             * @property {string|null} [lastUpdated] CreateRepositoryRequest lastUpdated
             * @property {boolean|null} [trending] CreateRepositoryRequest trending
             * @property {boolean|null} [verified] CreateRepositoryRequest verified
             * @property {string|null} [language] CreateRepositoryRequest language
             * @property {string|null} [license] CreateRepositoryRequest license
             * @property {string|null} [size] CreateRepositoryRequest size
             * @property {number|null} [dependencies] CreateRepositoryRequest dependencies
             * @property {number|null} [healthScore] CreateRepositoryRequest healthScore
             * @property {code_repositories.common.RepositoryStatus|null} [status] CreateRepositoryRequest status
             * @property {code_repositories.common.RepositorySource|null} [source] CreateRepositoryRequest source
             * @property {Array.<code_repositories.common.IExternalId>|null} [externalIds] CreateRepositoryRequest externalIds
             * @property {Array.<string>|null} [tagNames] CreateRepositoryRequest tagNames
             */

            /**
             * Constructs a new CreateRepositoryRequest.
             * @memberof code_repositories.repository
             * @classdesc Represents a CreateRepositoryRequest.
             * @implements ICreateRepositoryRequest
             * @constructor
             * @param {code_repositories.repository.ICreateRepositoryRequest=} [properties] Properties to set
             */
            function CreateRepositoryRequest(properties) {
                this.externalIds = [];
                this.tagNames = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * CreateRepositoryRequest name.
             * @member {string} name
             * @memberof code_repositories.repository.CreateRepositoryRequest
             * @instance
             */
            CreateRepositoryRequest.prototype.name = "";

            /**
             * CreateRepositoryRequest description.
             * @member {string} description
             * @memberof code_repositories.repository.CreateRepositoryRequest
             * @instance
             */
            CreateRepositoryRequest.prototype.description = "";

            /**
             * CreateRepositoryRequest type.
             * @member {code_repositories.common.RepositoryType} type
             * @memberof code_repositories.repository.CreateRepositoryRequest
             * @instance
             */
            CreateRepositoryRequest.prototype.type = 0;

            /**
             * CreateRepositoryRequest githubUrl.
             * @member {string} githubUrl
             * @memberof code_repositories.repository.CreateRepositoryRequest
             * @instance
             */
            CreateRepositoryRequest.prototype.githubUrl = "";

            /**
             * CreateRepositoryRequest packageUrl.
             * @member {string} packageUrl
             * @memberof code_repositories.repository.CreateRepositoryRequest
             * @instance
             */
            CreateRepositoryRequest.prototype.packageUrl = "";

            /**
             * CreateRepositoryRequest stars.
             * @member {number} stars
             * @memberof code_repositories.repository.CreateRepositoryRequest
             * @instance
             */
            CreateRepositoryRequest.prototype.stars = 0;

            /**
             * CreateRepositoryRequest forks.
             * @member {number} forks
             * @memberof code_repositories.repository.CreateRepositoryRequest
             * @instance
             */
            CreateRepositoryRequest.prototype.forks = 0;

            /**
             * CreateRepositoryRequest version.
             * @member {string} version
             * @memberof code_repositories.repository.CreateRepositoryRequest
             * @instance
             */
            CreateRepositoryRequest.prototype.version = "";

            /**
             * CreateRepositoryRequest maintainer.
             * @member {string} maintainer
             * @memberof code_repositories.repository.CreateRepositoryRequest
             * @instance
             */
            CreateRepositoryRequest.prototype.maintainer = "";

            /**
             * CreateRepositoryRequest lastUpdated.
             * @member {string} lastUpdated
             * @memberof code_repositories.repository.CreateRepositoryRequest
             * @instance
             */
            CreateRepositoryRequest.prototype.lastUpdated = "";

            /**
             * CreateRepositoryRequest trending.
             * @member {boolean} trending
             * @memberof code_repositories.repository.CreateRepositoryRequest
             * @instance
             */
            CreateRepositoryRequest.prototype.trending = false;

            /**
             * CreateRepositoryRequest verified.
             * @member {boolean} verified
             * @memberof code_repositories.repository.CreateRepositoryRequest
             * @instance
             */
            CreateRepositoryRequest.prototype.verified = false;

            /**
             * CreateRepositoryRequest language.
             * @member {string} language
             * @memberof code_repositories.repository.CreateRepositoryRequest
             * @instance
             */
            CreateRepositoryRequest.prototype.language = "";

            /**
             * CreateRepositoryRequest license.
             * @member {string} license
             * @memberof code_repositories.repository.CreateRepositoryRequest
             * @instance
             */
            CreateRepositoryRequest.prototype.license = "";

            /**
             * CreateRepositoryRequest size.
             * @member {string} size
             * @memberof code_repositories.repository.CreateRepositoryRequest
             * @instance
             */
            CreateRepositoryRequest.prototype.size = "";

            /**
             * CreateRepositoryRequest dependencies.
             * @member {number} dependencies
             * @memberof code_repositories.repository.CreateRepositoryRequest
             * @instance
             */
            CreateRepositoryRequest.prototype.dependencies = 0;

            /**
             * CreateRepositoryRequest healthScore.
             * @member {number} healthScore
             * @memberof code_repositories.repository.CreateRepositoryRequest
             * @instance
             */
            CreateRepositoryRequest.prototype.healthScore = 0;

            /**
             * CreateRepositoryRequest status.
             * @member {code_repositories.common.RepositoryStatus} status
             * @memberof code_repositories.repository.CreateRepositoryRequest
             * @instance
             */
            CreateRepositoryRequest.prototype.status = 0;

            /**
             * CreateRepositoryRequest source.
             * @member {code_repositories.common.RepositorySource} source
             * @memberof code_repositories.repository.CreateRepositoryRequest
             * @instance
             */
            CreateRepositoryRequest.prototype.source = 0;

            /**
             * CreateRepositoryRequest externalIds.
             * @member {Array.<code_repositories.common.IExternalId>} externalIds
             * @memberof code_repositories.repository.CreateRepositoryRequest
             * @instance
             */
            CreateRepositoryRequest.prototype.externalIds = $util.emptyArray;

            /**
             * CreateRepositoryRequest tagNames.
             * @member {Array.<string>} tagNames
             * @memberof code_repositories.repository.CreateRepositoryRequest
             * @instance
             */
            CreateRepositoryRequest.prototype.tagNames = $util.emptyArray;

            /**
             * Creates a new CreateRepositoryRequest instance using the specified properties.
             * @function create
             * @memberof code_repositories.repository.CreateRepositoryRequest
             * @static
             * @param {code_repositories.repository.ICreateRepositoryRequest=} [properties] Properties to set
             * @returns {code_repositories.repository.CreateRepositoryRequest} CreateRepositoryRequest instance
             */
            CreateRepositoryRequest.create = function create(properties) {
                return new CreateRepositoryRequest(properties);
            };

            /**
             * Encodes the specified CreateRepositoryRequest message. Does not implicitly {@link code_repositories.repository.CreateRepositoryRequest.verify|verify} messages.
             * @function encode
             * @memberof code_repositories.repository.CreateRepositoryRequest
             * @static
             * @param {code_repositories.repository.ICreateRepositoryRequest} message CreateRepositoryRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CreateRepositoryRequest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
                if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.description);
                if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                    writer.uint32(/* id 3, wireType 0 =*/24).int32(message.type);
                if (message.githubUrl != null && Object.hasOwnProperty.call(message, "githubUrl"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.githubUrl);
                if (message.packageUrl != null && Object.hasOwnProperty.call(message, "packageUrl"))
                    writer.uint32(/* id 5, wireType 2 =*/42).string(message.packageUrl);
                if (message.stars != null && Object.hasOwnProperty.call(message, "stars"))
                    writer.uint32(/* id 6, wireType 0 =*/48).int32(message.stars);
                if (message.forks != null && Object.hasOwnProperty.call(message, "forks"))
                    writer.uint32(/* id 7, wireType 0 =*/56).int32(message.forks);
                if (message.version != null && Object.hasOwnProperty.call(message, "version"))
                    writer.uint32(/* id 8, wireType 2 =*/66).string(message.version);
                if (message.maintainer != null && Object.hasOwnProperty.call(message, "maintainer"))
                    writer.uint32(/* id 9, wireType 2 =*/74).string(message.maintainer);
                if (message.lastUpdated != null && Object.hasOwnProperty.call(message, "lastUpdated"))
                    writer.uint32(/* id 10, wireType 2 =*/82).string(message.lastUpdated);
                if (message.trending != null && Object.hasOwnProperty.call(message, "trending"))
                    writer.uint32(/* id 11, wireType 0 =*/88).bool(message.trending);
                if (message.verified != null && Object.hasOwnProperty.call(message, "verified"))
                    writer.uint32(/* id 12, wireType 0 =*/96).bool(message.verified);
                if (message.language != null && Object.hasOwnProperty.call(message, "language"))
                    writer.uint32(/* id 13, wireType 2 =*/106).string(message.language);
                if (message.license != null && Object.hasOwnProperty.call(message, "license"))
                    writer.uint32(/* id 14, wireType 2 =*/114).string(message.license);
                if (message.size != null && Object.hasOwnProperty.call(message, "size"))
                    writer.uint32(/* id 15, wireType 2 =*/122).string(message.size);
                if (message.dependencies != null && Object.hasOwnProperty.call(message, "dependencies"))
                    writer.uint32(/* id 16, wireType 0 =*/128).int32(message.dependencies);
                if (message.healthScore != null && Object.hasOwnProperty.call(message, "healthScore"))
                    writer.uint32(/* id 17, wireType 0 =*/136).int32(message.healthScore);
                if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                    writer.uint32(/* id 18, wireType 0 =*/144).int32(message.status);
                if (message.source != null && Object.hasOwnProperty.call(message, "source"))
                    writer.uint32(/* id 19, wireType 0 =*/152).int32(message.source);
                if (message.externalIds != null && message.externalIds.length)
                    for (let i = 0; i < message.externalIds.length; ++i)
                        $root.code_repositories.common.ExternalId.encode(message.externalIds[i], writer.uint32(/* id 20, wireType 2 =*/162).fork()).ldelim();
                if (message.tagNames != null && message.tagNames.length)
                    for (let i = 0; i < message.tagNames.length; ++i)
                        writer.uint32(/* id 21, wireType 2 =*/170).string(message.tagNames[i]);
                return writer;
            };

            /**
             * Encodes the specified CreateRepositoryRequest message, length delimited. Does not implicitly {@link code_repositories.repository.CreateRepositoryRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof code_repositories.repository.CreateRepositoryRequest
             * @static
             * @param {code_repositories.repository.ICreateRepositoryRequest} message CreateRepositoryRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CreateRepositoryRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a CreateRepositoryRequest message from the specified reader or buffer.
             * @function decode
             * @memberof code_repositories.repository.CreateRepositoryRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {code_repositories.repository.CreateRepositoryRequest} CreateRepositoryRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CreateRepositoryRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.code_repositories.repository.CreateRepositoryRequest();
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
                            message.description = reader.string();
                            break;
                        }
                    case 3: {
                            message.type = reader.int32();
                            break;
                        }
                    case 4: {
                            message.githubUrl = reader.string();
                            break;
                        }
                    case 5: {
                            message.packageUrl = reader.string();
                            break;
                        }
                    case 6: {
                            message.stars = reader.int32();
                            break;
                        }
                    case 7: {
                            message.forks = reader.int32();
                            break;
                        }
                    case 8: {
                            message.version = reader.string();
                            break;
                        }
                    case 9: {
                            message.maintainer = reader.string();
                            break;
                        }
                    case 10: {
                            message.lastUpdated = reader.string();
                            break;
                        }
                    case 11: {
                            message.trending = reader.bool();
                            break;
                        }
                    case 12: {
                            message.verified = reader.bool();
                            break;
                        }
                    case 13: {
                            message.language = reader.string();
                            break;
                        }
                    case 14: {
                            message.license = reader.string();
                            break;
                        }
                    case 15: {
                            message.size = reader.string();
                            break;
                        }
                    case 16: {
                            message.dependencies = reader.int32();
                            break;
                        }
                    case 17: {
                            message.healthScore = reader.int32();
                            break;
                        }
                    case 18: {
                            message.status = reader.int32();
                            break;
                        }
                    case 19: {
                            message.source = reader.int32();
                            break;
                        }
                    case 20: {
                            if (!(message.externalIds && message.externalIds.length))
                                message.externalIds = [];
                            message.externalIds.push($root.code_repositories.common.ExternalId.decode(reader, reader.uint32()));
                            break;
                        }
                    case 21: {
                            if (!(message.tagNames && message.tagNames.length))
                                message.tagNames = [];
                            message.tagNames.push(reader.string());
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
             * Decodes a CreateRepositoryRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof code_repositories.repository.CreateRepositoryRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {code_repositories.repository.CreateRepositoryRequest} CreateRepositoryRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CreateRepositoryRequest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a CreateRepositoryRequest message.
             * @function verify
             * @memberof code_repositories.repository.CreateRepositoryRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            CreateRepositoryRequest.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.name != null && message.hasOwnProperty("name"))
                    if (!$util.isString(message.name))
                        return "name: string expected";
                if (message.description != null && message.hasOwnProperty("description"))
                    if (!$util.isString(message.description))
                        return "description: string expected";
                if (message.type != null && message.hasOwnProperty("type"))
                    switch (message.type) {
                    default:
                        return "type: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                        break;
                    }
                if (message.githubUrl != null && message.hasOwnProperty("githubUrl"))
                    if (!$util.isString(message.githubUrl))
                        return "githubUrl: string expected";
                if (message.packageUrl != null && message.hasOwnProperty("packageUrl"))
                    if (!$util.isString(message.packageUrl))
                        return "packageUrl: string expected";
                if (message.stars != null && message.hasOwnProperty("stars"))
                    if (!$util.isInteger(message.stars))
                        return "stars: integer expected";
                if (message.forks != null && message.hasOwnProperty("forks"))
                    if (!$util.isInteger(message.forks))
                        return "forks: integer expected";
                if (message.version != null && message.hasOwnProperty("version"))
                    if (!$util.isString(message.version))
                        return "version: string expected";
                if (message.maintainer != null && message.hasOwnProperty("maintainer"))
                    if (!$util.isString(message.maintainer))
                        return "maintainer: string expected";
                if (message.lastUpdated != null && message.hasOwnProperty("lastUpdated"))
                    if (!$util.isString(message.lastUpdated))
                        return "lastUpdated: string expected";
                if (message.trending != null && message.hasOwnProperty("trending"))
                    if (typeof message.trending !== "boolean")
                        return "trending: boolean expected";
                if (message.verified != null && message.hasOwnProperty("verified"))
                    if (typeof message.verified !== "boolean")
                        return "verified: boolean expected";
                if (message.language != null && message.hasOwnProperty("language"))
                    if (!$util.isString(message.language))
                        return "language: string expected";
                if (message.license != null && message.hasOwnProperty("license"))
                    if (!$util.isString(message.license))
                        return "license: string expected";
                if (message.size != null && message.hasOwnProperty("size"))
                    if (!$util.isString(message.size))
                        return "size: string expected";
                if (message.dependencies != null && message.hasOwnProperty("dependencies"))
                    if (!$util.isInteger(message.dependencies))
                        return "dependencies: integer expected";
                if (message.healthScore != null && message.hasOwnProperty("healthScore"))
                    if (!$util.isInteger(message.healthScore))
                        return "healthScore: integer expected";
                if (message.status != null && message.hasOwnProperty("status"))
                    switch (message.status) {
                    default:
                        return "status: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                        break;
                    }
                if (message.source != null && message.hasOwnProperty("source"))
                    switch (message.source) {
                    default:
                        return "source: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                        break;
                    }
                if (message.externalIds != null && message.hasOwnProperty("externalIds")) {
                    if (!Array.isArray(message.externalIds))
                        return "externalIds: array expected";
                    for (let i = 0; i < message.externalIds.length; ++i) {
                        let error = $root.code_repositories.common.ExternalId.verify(message.externalIds[i]);
                        if (error)
                            return "externalIds." + error;
                    }
                }
                if (message.tagNames != null && message.hasOwnProperty("tagNames")) {
                    if (!Array.isArray(message.tagNames))
                        return "tagNames: array expected";
                    for (let i = 0; i < message.tagNames.length; ++i)
                        if (!$util.isString(message.tagNames[i]))
                            return "tagNames: string[] expected";
                }
                return null;
            };

            /**
             * Creates a CreateRepositoryRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof code_repositories.repository.CreateRepositoryRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {code_repositories.repository.CreateRepositoryRequest} CreateRepositoryRequest
             */
            CreateRepositoryRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.code_repositories.repository.CreateRepositoryRequest)
                    return object;
                let message = new $root.code_repositories.repository.CreateRepositoryRequest();
                if (object.name != null)
                    message.name = String(object.name);
                if (object.description != null)
                    message.description = String(object.description);
                switch (object.type) {
                default:
                    if (typeof object.type === "number") {
                        message.type = object.type;
                        break;
                    }
                    break;
                case "REPOSITORY_TYPE_UNSPECIFIED":
                case 0:
                    message.type = 0;
                    break;
                case "REPOSITORY_TYPE_NPM":
                case 1:
                    message.type = 1;
                    break;
                case "REPOSITORY_TYPE_DOCKER":
                case 2:
                    message.type = 2;
                    break;
                case "REPOSITORY_TYPE_PYTHON":
                case 3:
                    message.type = 3;
                    break;
                }
                if (object.githubUrl != null)
                    message.githubUrl = String(object.githubUrl);
                if (object.packageUrl != null)
                    message.packageUrl = String(object.packageUrl);
                if (object.stars != null)
                    message.stars = object.stars | 0;
                if (object.forks != null)
                    message.forks = object.forks | 0;
                if (object.version != null)
                    message.version = String(object.version);
                if (object.maintainer != null)
                    message.maintainer = String(object.maintainer);
                if (object.lastUpdated != null)
                    message.lastUpdated = String(object.lastUpdated);
                if (object.trending != null)
                    message.trending = Boolean(object.trending);
                if (object.verified != null)
                    message.verified = Boolean(object.verified);
                if (object.language != null)
                    message.language = String(object.language);
                if (object.license != null)
                    message.license = String(object.license);
                if (object.size != null)
                    message.size = String(object.size);
                if (object.dependencies != null)
                    message.dependencies = object.dependencies | 0;
                if (object.healthScore != null)
                    message.healthScore = object.healthScore | 0;
                switch (object.status) {
                default:
                    if (typeof object.status === "number") {
                        message.status = object.status;
                        break;
                    }
                    break;
                case "REPOSITORY_STATUS_UNSPECIFIED":
                case 0:
                    message.status = 0;
                    break;
                case "REPOSITORY_STATUS_STABLE":
                case 1:
                    message.status = 1;
                    break;
                case "REPOSITORY_STATUS_BETA":
                case 2:
                    message.status = 2;
                    break;
                case "REPOSITORY_STATUS_DEPRECATED":
                case 3:
                    message.status = 3;
                    break;
                case "REPOSITORY_STATUS_EXPERIMENTAL":
                case 4:
                    message.status = 4;
                    break;
                }
                switch (object.source) {
                default:
                    if (typeof object.source === "number") {
                        message.source = object.source;
                        break;
                    }
                    break;
                case "REPOSITORY_SOURCE_UNSPECIFIED":
                case 0:
                    message.source = 0;
                    break;
                case "REPOSITORY_SOURCE_GITHUB":
                case 1:
                    message.source = 1;
                    break;
                case "REPOSITORY_SOURCE_NPM":
                case 2:
                    message.source = 2;
                    break;
                case "REPOSITORY_SOURCE_DOCKERHUB":
                case 3:
                    message.source = 3;
                    break;
                case "REPOSITORY_SOURCE_PYPI":
                case 4:
                    message.source = 4;
                    break;
                case "REPOSITORY_SOURCE_MANUAL":
                case 5:
                    message.source = 5;
                    break;
                }
                if (object.externalIds) {
                    if (!Array.isArray(object.externalIds))
                        throw TypeError(".code_repositories.repository.CreateRepositoryRequest.externalIds: array expected");
                    message.externalIds = [];
                    for (let i = 0; i < object.externalIds.length; ++i) {
                        if (typeof object.externalIds[i] !== "object")
                            throw TypeError(".code_repositories.repository.CreateRepositoryRequest.externalIds: object expected");
                        message.externalIds[i] = $root.code_repositories.common.ExternalId.fromObject(object.externalIds[i]);
                    }
                }
                if (object.tagNames) {
                    if (!Array.isArray(object.tagNames))
                        throw TypeError(".code_repositories.repository.CreateRepositoryRequest.tagNames: array expected");
                    message.tagNames = [];
                    for (let i = 0; i < object.tagNames.length; ++i)
                        message.tagNames[i] = String(object.tagNames[i]);
                }
                return message;
            };

            /**
             * Creates a plain object from a CreateRepositoryRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof code_repositories.repository.CreateRepositoryRequest
             * @static
             * @param {code_repositories.repository.CreateRepositoryRequest} message CreateRepositoryRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            CreateRepositoryRequest.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.arrays || options.defaults) {
                    object.externalIds = [];
                    object.tagNames = [];
                }
                if (options.defaults) {
                    object.name = "";
                    object.description = "";
                    object.type = options.enums === String ? "REPOSITORY_TYPE_UNSPECIFIED" : 0;
                    object.githubUrl = "";
                    object.packageUrl = "";
                    object.stars = 0;
                    object.forks = 0;
                    object.version = "";
                    object.maintainer = "";
                    object.lastUpdated = "";
                    object.trending = false;
                    object.verified = false;
                    object.language = "";
                    object.license = "";
                    object.size = "";
                    object.dependencies = 0;
                    object.healthScore = 0;
                    object.status = options.enums === String ? "REPOSITORY_STATUS_UNSPECIFIED" : 0;
                    object.source = options.enums === String ? "REPOSITORY_SOURCE_UNSPECIFIED" : 0;
                }
                if (message.name != null && message.hasOwnProperty("name"))
                    object.name = message.name;
                if (message.description != null && message.hasOwnProperty("description"))
                    object.description = message.description;
                if (message.type != null && message.hasOwnProperty("type"))
                    object.type = options.enums === String ? $root.code_repositories.common.RepositoryType[message.type] === undefined ? message.type : $root.code_repositories.common.RepositoryType[message.type] : message.type;
                if (message.githubUrl != null && message.hasOwnProperty("githubUrl"))
                    object.githubUrl = message.githubUrl;
                if (message.packageUrl != null && message.hasOwnProperty("packageUrl"))
                    object.packageUrl = message.packageUrl;
                if (message.stars != null && message.hasOwnProperty("stars"))
                    object.stars = message.stars;
                if (message.forks != null && message.hasOwnProperty("forks"))
                    object.forks = message.forks;
                if (message.version != null && message.hasOwnProperty("version"))
                    object.version = message.version;
                if (message.maintainer != null && message.hasOwnProperty("maintainer"))
                    object.maintainer = message.maintainer;
                if (message.lastUpdated != null && message.hasOwnProperty("lastUpdated"))
                    object.lastUpdated = message.lastUpdated;
                if (message.trending != null && message.hasOwnProperty("trending"))
                    object.trending = message.trending;
                if (message.verified != null && message.hasOwnProperty("verified"))
                    object.verified = message.verified;
                if (message.language != null && message.hasOwnProperty("language"))
                    object.language = message.language;
                if (message.license != null && message.hasOwnProperty("license"))
                    object.license = message.license;
                if (message.size != null && message.hasOwnProperty("size"))
                    object.size = message.size;
                if (message.dependencies != null && message.hasOwnProperty("dependencies"))
                    object.dependencies = message.dependencies;
                if (message.healthScore != null && message.hasOwnProperty("healthScore"))
                    object.healthScore = message.healthScore;
                if (message.status != null && message.hasOwnProperty("status"))
                    object.status = options.enums === String ? $root.code_repositories.common.RepositoryStatus[message.status] === undefined ? message.status : $root.code_repositories.common.RepositoryStatus[message.status] : message.status;
                if (message.source != null && message.hasOwnProperty("source"))
                    object.source = options.enums === String ? $root.code_repositories.common.RepositorySource[message.source] === undefined ? message.source : $root.code_repositories.common.RepositorySource[message.source] : message.source;
                if (message.externalIds && message.externalIds.length) {
                    object.externalIds = [];
                    for (let j = 0; j < message.externalIds.length; ++j)
                        object.externalIds[j] = $root.code_repositories.common.ExternalId.toObject(message.externalIds[j], options);
                }
                if (message.tagNames && message.tagNames.length) {
                    object.tagNames = [];
                    for (let j = 0; j < message.tagNames.length; ++j)
                        object.tagNames[j] = message.tagNames[j];
                }
                return object;
            };

            /**
             * Converts this CreateRepositoryRequest to JSON.
             * @function toJSON
             * @memberof code_repositories.repository.CreateRepositoryRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            CreateRepositoryRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for CreateRepositoryRequest
             * @function getTypeUrl
             * @memberof code_repositories.repository.CreateRepositoryRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            CreateRepositoryRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/code_repositories.repository.CreateRepositoryRequest";
            };

            return CreateRepositoryRequest;
        })();

        repository.CreateRepositoryResponse = (function() {

            /**
             * Properties of a CreateRepositoryResponse.
             * @memberof code_repositories.repository
             * @interface ICreateRepositoryResponse
             * @property {code_repositories.repository.IRepository|null} [repository] CreateRepositoryResponse repository
             */

            /**
             * Constructs a new CreateRepositoryResponse.
             * @memberof code_repositories.repository
             * @classdesc Represents a CreateRepositoryResponse.
             * @implements ICreateRepositoryResponse
             * @constructor
             * @param {code_repositories.repository.ICreateRepositoryResponse=} [properties] Properties to set
             */
            function CreateRepositoryResponse(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * CreateRepositoryResponse repository.
             * @member {code_repositories.repository.IRepository|null|undefined} repository
             * @memberof code_repositories.repository.CreateRepositoryResponse
             * @instance
             */
            CreateRepositoryResponse.prototype.repository = null;

            /**
             * Creates a new CreateRepositoryResponse instance using the specified properties.
             * @function create
             * @memberof code_repositories.repository.CreateRepositoryResponse
             * @static
             * @param {code_repositories.repository.ICreateRepositoryResponse=} [properties] Properties to set
             * @returns {code_repositories.repository.CreateRepositoryResponse} CreateRepositoryResponse instance
             */
            CreateRepositoryResponse.create = function create(properties) {
                return new CreateRepositoryResponse(properties);
            };

            /**
             * Encodes the specified CreateRepositoryResponse message. Does not implicitly {@link code_repositories.repository.CreateRepositoryResponse.verify|verify} messages.
             * @function encode
             * @memberof code_repositories.repository.CreateRepositoryResponse
             * @static
             * @param {code_repositories.repository.ICreateRepositoryResponse} message CreateRepositoryResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CreateRepositoryResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.repository != null && Object.hasOwnProperty.call(message, "repository"))
                    $root.code_repositories.repository.Repository.encode(message.repository, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified CreateRepositoryResponse message, length delimited. Does not implicitly {@link code_repositories.repository.CreateRepositoryResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof code_repositories.repository.CreateRepositoryResponse
             * @static
             * @param {code_repositories.repository.ICreateRepositoryResponse} message CreateRepositoryResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CreateRepositoryResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a CreateRepositoryResponse message from the specified reader or buffer.
             * @function decode
             * @memberof code_repositories.repository.CreateRepositoryResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {code_repositories.repository.CreateRepositoryResponse} CreateRepositoryResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CreateRepositoryResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.code_repositories.repository.CreateRepositoryResponse();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.repository = $root.code_repositories.repository.Repository.decode(reader, reader.uint32());
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
             * Decodes a CreateRepositoryResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof code_repositories.repository.CreateRepositoryResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {code_repositories.repository.CreateRepositoryResponse} CreateRepositoryResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CreateRepositoryResponse.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a CreateRepositoryResponse message.
             * @function verify
             * @memberof code_repositories.repository.CreateRepositoryResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            CreateRepositoryResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.repository != null && message.hasOwnProperty("repository")) {
                    let error = $root.code_repositories.repository.Repository.verify(message.repository);
                    if (error)
                        return "repository." + error;
                }
                return null;
            };

            /**
             * Creates a CreateRepositoryResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof code_repositories.repository.CreateRepositoryResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {code_repositories.repository.CreateRepositoryResponse} CreateRepositoryResponse
             */
            CreateRepositoryResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.code_repositories.repository.CreateRepositoryResponse)
                    return object;
                let message = new $root.code_repositories.repository.CreateRepositoryResponse();
                if (object.repository != null) {
                    if (typeof object.repository !== "object")
                        throw TypeError(".code_repositories.repository.CreateRepositoryResponse.repository: object expected");
                    message.repository = $root.code_repositories.repository.Repository.fromObject(object.repository);
                }
                return message;
            };

            /**
             * Creates a plain object from a CreateRepositoryResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof code_repositories.repository.CreateRepositoryResponse
             * @static
             * @param {code_repositories.repository.CreateRepositoryResponse} message CreateRepositoryResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            CreateRepositoryResponse.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults)
                    object.repository = null;
                if (message.repository != null && message.hasOwnProperty("repository"))
                    object.repository = $root.code_repositories.repository.Repository.toObject(message.repository, options);
                return object;
            };

            /**
             * Converts this CreateRepositoryResponse to JSON.
             * @function toJSON
             * @memberof code_repositories.repository.CreateRepositoryResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            CreateRepositoryResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for CreateRepositoryResponse
             * @function getTypeUrl
             * @memberof code_repositories.repository.CreateRepositoryResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            CreateRepositoryResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/code_repositories.repository.CreateRepositoryResponse";
            };

            return CreateRepositoryResponse;
        })();

        repository.UpdateRepositoryRequest = (function() {

            /**
             * Properties of an UpdateRepositoryRequest.
             * @memberof code_repositories.repository
             * @interface IUpdateRepositoryRequest
             * @property {string|null} [id] UpdateRepositoryRequest id
             * @property {string|null} [name] UpdateRepositoryRequest name
             * @property {string|null} [description] UpdateRepositoryRequest description
             * @property {code_repositories.common.RepositoryType|null} [type] UpdateRepositoryRequest type
             * @property {string|null} [githubUrl] UpdateRepositoryRequest githubUrl
             * @property {string|null} [packageUrl] UpdateRepositoryRequest packageUrl
             * @property {number|null} [stars] UpdateRepositoryRequest stars
             * @property {number|null} [forks] UpdateRepositoryRequest forks
             * @property {string|null} [version] UpdateRepositoryRequest version
             * @property {string|null} [maintainer] UpdateRepositoryRequest maintainer
             * @property {string|null} [lastUpdated] UpdateRepositoryRequest lastUpdated
             * @property {boolean|null} [trending] UpdateRepositoryRequest trending
             * @property {boolean|null} [verified] UpdateRepositoryRequest verified
             * @property {string|null} [language] UpdateRepositoryRequest language
             * @property {string|null} [license] UpdateRepositoryRequest license
             * @property {string|null} [size] UpdateRepositoryRequest size
             * @property {number|null} [dependencies] UpdateRepositoryRequest dependencies
             * @property {number|null} [healthScore] UpdateRepositoryRequest healthScore
             * @property {code_repositories.common.RepositoryStatus|null} [status] UpdateRepositoryRequest status
             * @property {code_repositories.common.RepositorySource|null} [source] UpdateRepositoryRequest source
             * @property {Array.<code_repositories.common.IExternalId>|null} [externalIds] UpdateRepositoryRequest externalIds
             * @property {Array.<string>|null} [tagNames] UpdateRepositoryRequest tagNames
             */

            /**
             * Constructs a new UpdateRepositoryRequest.
             * @memberof code_repositories.repository
             * @classdesc Represents an UpdateRepositoryRequest.
             * @implements IUpdateRepositoryRequest
             * @constructor
             * @param {code_repositories.repository.IUpdateRepositoryRequest=} [properties] Properties to set
             */
            function UpdateRepositoryRequest(properties) {
                this.externalIds = [];
                this.tagNames = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * UpdateRepositoryRequest id.
             * @member {string} id
             * @memberof code_repositories.repository.UpdateRepositoryRequest
             * @instance
             */
            UpdateRepositoryRequest.prototype.id = "";

            /**
             * UpdateRepositoryRequest name.
             * @member {string} name
             * @memberof code_repositories.repository.UpdateRepositoryRequest
             * @instance
             */
            UpdateRepositoryRequest.prototype.name = "";

            /**
             * UpdateRepositoryRequest description.
             * @member {string} description
             * @memberof code_repositories.repository.UpdateRepositoryRequest
             * @instance
             */
            UpdateRepositoryRequest.prototype.description = "";

            /**
             * UpdateRepositoryRequest type.
             * @member {code_repositories.common.RepositoryType} type
             * @memberof code_repositories.repository.UpdateRepositoryRequest
             * @instance
             */
            UpdateRepositoryRequest.prototype.type = 0;

            /**
             * UpdateRepositoryRequest githubUrl.
             * @member {string} githubUrl
             * @memberof code_repositories.repository.UpdateRepositoryRequest
             * @instance
             */
            UpdateRepositoryRequest.prototype.githubUrl = "";

            /**
             * UpdateRepositoryRequest packageUrl.
             * @member {string} packageUrl
             * @memberof code_repositories.repository.UpdateRepositoryRequest
             * @instance
             */
            UpdateRepositoryRequest.prototype.packageUrl = "";

            /**
             * UpdateRepositoryRequest stars.
             * @member {number} stars
             * @memberof code_repositories.repository.UpdateRepositoryRequest
             * @instance
             */
            UpdateRepositoryRequest.prototype.stars = 0;

            /**
             * UpdateRepositoryRequest forks.
             * @member {number} forks
             * @memberof code_repositories.repository.UpdateRepositoryRequest
             * @instance
             */
            UpdateRepositoryRequest.prototype.forks = 0;

            /**
             * UpdateRepositoryRequest version.
             * @member {string} version
             * @memberof code_repositories.repository.UpdateRepositoryRequest
             * @instance
             */
            UpdateRepositoryRequest.prototype.version = "";

            /**
             * UpdateRepositoryRequest maintainer.
             * @member {string} maintainer
             * @memberof code_repositories.repository.UpdateRepositoryRequest
             * @instance
             */
            UpdateRepositoryRequest.prototype.maintainer = "";

            /**
             * UpdateRepositoryRequest lastUpdated.
             * @member {string} lastUpdated
             * @memberof code_repositories.repository.UpdateRepositoryRequest
             * @instance
             */
            UpdateRepositoryRequest.prototype.lastUpdated = "";

            /**
             * UpdateRepositoryRequest trending.
             * @member {boolean} trending
             * @memberof code_repositories.repository.UpdateRepositoryRequest
             * @instance
             */
            UpdateRepositoryRequest.prototype.trending = false;

            /**
             * UpdateRepositoryRequest verified.
             * @member {boolean} verified
             * @memberof code_repositories.repository.UpdateRepositoryRequest
             * @instance
             */
            UpdateRepositoryRequest.prototype.verified = false;

            /**
             * UpdateRepositoryRequest language.
             * @member {string} language
             * @memberof code_repositories.repository.UpdateRepositoryRequest
             * @instance
             */
            UpdateRepositoryRequest.prototype.language = "";

            /**
             * UpdateRepositoryRequest license.
             * @member {string} license
             * @memberof code_repositories.repository.UpdateRepositoryRequest
             * @instance
             */
            UpdateRepositoryRequest.prototype.license = "";

            /**
             * UpdateRepositoryRequest size.
             * @member {string} size
             * @memberof code_repositories.repository.UpdateRepositoryRequest
             * @instance
             */
            UpdateRepositoryRequest.prototype.size = "";

            /**
             * UpdateRepositoryRequest dependencies.
             * @member {number} dependencies
             * @memberof code_repositories.repository.UpdateRepositoryRequest
             * @instance
             */
            UpdateRepositoryRequest.prototype.dependencies = 0;

            /**
             * UpdateRepositoryRequest healthScore.
             * @member {number} healthScore
             * @memberof code_repositories.repository.UpdateRepositoryRequest
             * @instance
             */
            UpdateRepositoryRequest.prototype.healthScore = 0;

            /**
             * UpdateRepositoryRequest status.
             * @member {code_repositories.common.RepositoryStatus} status
             * @memberof code_repositories.repository.UpdateRepositoryRequest
             * @instance
             */
            UpdateRepositoryRequest.prototype.status = 0;

            /**
             * UpdateRepositoryRequest source.
             * @member {code_repositories.common.RepositorySource} source
             * @memberof code_repositories.repository.UpdateRepositoryRequest
             * @instance
             */
            UpdateRepositoryRequest.prototype.source = 0;

            /**
             * UpdateRepositoryRequest externalIds.
             * @member {Array.<code_repositories.common.IExternalId>} externalIds
             * @memberof code_repositories.repository.UpdateRepositoryRequest
             * @instance
             */
            UpdateRepositoryRequest.prototype.externalIds = $util.emptyArray;

            /**
             * UpdateRepositoryRequest tagNames.
             * @member {Array.<string>} tagNames
             * @memberof code_repositories.repository.UpdateRepositoryRequest
             * @instance
             */
            UpdateRepositoryRequest.prototype.tagNames = $util.emptyArray;

            /**
             * Creates a new UpdateRepositoryRequest instance using the specified properties.
             * @function create
             * @memberof code_repositories.repository.UpdateRepositoryRequest
             * @static
             * @param {code_repositories.repository.IUpdateRepositoryRequest=} [properties] Properties to set
             * @returns {code_repositories.repository.UpdateRepositoryRequest} UpdateRepositoryRequest instance
             */
            UpdateRepositoryRequest.create = function create(properties) {
                return new UpdateRepositoryRequest(properties);
            };

            /**
             * Encodes the specified UpdateRepositoryRequest message. Does not implicitly {@link code_repositories.repository.UpdateRepositoryRequest.verify|verify} messages.
             * @function encode
             * @memberof code_repositories.repository.UpdateRepositoryRequest
             * @static
             * @param {code_repositories.repository.IUpdateRepositoryRequest} message UpdateRepositoryRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            UpdateRepositoryRequest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
                if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
                if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.description);
                if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                    writer.uint32(/* id 4, wireType 0 =*/32).int32(message.type);
                if (message.githubUrl != null && Object.hasOwnProperty.call(message, "githubUrl"))
                    writer.uint32(/* id 5, wireType 2 =*/42).string(message.githubUrl);
                if (message.packageUrl != null && Object.hasOwnProperty.call(message, "packageUrl"))
                    writer.uint32(/* id 6, wireType 2 =*/50).string(message.packageUrl);
                if (message.stars != null && Object.hasOwnProperty.call(message, "stars"))
                    writer.uint32(/* id 7, wireType 0 =*/56).int32(message.stars);
                if (message.forks != null && Object.hasOwnProperty.call(message, "forks"))
                    writer.uint32(/* id 8, wireType 0 =*/64).int32(message.forks);
                if (message.version != null && Object.hasOwnProperty.call(message, "version"))
                    writer.uint32(/* id 9, wireType 2 =*/74).string(message.version);
                if (message.maintainer != null && Object.hasOwnProperty.call(message, "maintainer"))
                    writer.uint32(/* id 10, wireType 2 =*/82).string(message.maintainer);
                if (message.lastUpdated != null && Object.hasOwnProperty.call(message, "lastUpdated"))
                    writer.uint32(/* id 11, wireType 2 =*/90).string(message.lastUpdated);
                if (message.trending != null && Object.hasOwnProperty.call(message, "trending"))
                    writer.uint32(/* id 12, wireType 0 =*/96).bool(message.trending);
                if (message.verified != null && Object.hasOwnProperty.call(message, "verified"))
                    writer.uint32(/* id 13, wireType 0 =*/104).bool(message.verified);
                if (message.language != null && Object.hasOwnProperty.call(message, "language"))
                    writer.uint32(/* id 14, wireType 2 =*/114).string(message.language);
                if (message.license != null && Object.hasOwnProperty.call(message, "license"))
                    writer.uint32(/* id 15, wireType 2 =*/122).string(message.license);
                if (message.size != null && Object.hasOwnProperty.call(message, "size"))
                    writer.uint32(/* id 16, wireType 2 =*/130).string(message.size);
                if (message.dependencies != null && Object.hasOwnProperty.call(message, "dependencies"))
                    writer.uint32(/* id 17, wireType 0 =*/136).int32(message.dependencies);
                if (message.healthScore != null && Object.hasOwnProperty.call(message, "healthScore"))
                    writer.uint32(/* id 18, wireType 0 =*/144).int32(message.healthScore);
                if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                    writer.uint32(/* id 19, wireType 0 =*/152).int32(message.status);
                if (message.source != null && Object.hasOwnProperty.call(message, "source"))
                    writer.uint32(/* id 20, wireType 0 =*/160).int32(message.source);
                if (message.externalIds != null && message.externalIds.length)
                    for (let i = 0; i < message.externalIds.length; ++i)
                        $root.code_repositories.common.ExternalId.encode(message.externalIds[i], writer.uint32(/* id 21, wireType 2 =*/170).fork()).ldelim();
                if (message.tagNames != null && message.tagNames.length)
                    for (let i = 0; i < message.tagNames.length; ++i)
                        writer.uint32(/* id 22, wireType 2 =*/178).string(message.tagNames[i]);
                return writer;
            };

            /**
             * Encodes the specified UpdateRepositoryRequest message, length delimited. Does not implicitly {@link code_repositories.repository.UpdateRepositoryRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof code_repositories.repository.UpdateRepositoryRequest
             * @static
             * @param {code_repositories.repository.IUpdateRepositoryRequest} message UpdateRepositoryRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            UpdateRepositoryRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an UpdateRepositoryRequest message from the specified reader or buffer.
             * @function decode
             * @memberof code_repositories.repository.UpdateRepositoryRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {code_repositories.repository.UpdateRepositoryRequest} UpdateRepositoryRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            UpdateRepositoryRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.code_repositories.repository.UpdateRepositoryRequest();
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
                            message.type = reader.int32();
                            break;
                        }
                    case 5: {
                            message.githubUrl = reader.string();
                            break;
                        }
                    case 6: {
                            message.packageUrl = reader.string();
                            break;
                        }
                    case 7: {
                            message.stars = reader.int32();
                            break;
                        }
                    case 8: {
                            message.forks = reader.int32();
                            break;
                        }
                    case 9: {
                            message.version = reader.string();
                            break;
                        }
                    case 10: {
                            message.maintainer = reader.string();
                            break;
                        }
                    case 11: {
                            message.lastUpdated = reader.string();
                            break;
                        }
                    case 12: {
                            message.trending = reader.bool();
                            break;
                        }
                    case 13: {
                            message.verified = reader.bool();
                            break;
                        }
                    case 14: {
                            message.language = reader.string();
                            break;
                        }
                    case 15: {
                            message.license = reader.string();
                            break;
                        }
                    case 16: {
                            message.size = reader.string();
                            break;
                        }
                    case 17: {
                            message.dependencies = reader.int32();
                            break;
                        }
                    case 18: {
                            message.healthScore = reader.int32();
                            break;
                        }
                    case 19: {
                            message.status = reader.int32();
                            break;
                        }
                    case 20: {
                            message.source = reader.int32();
                            break;
                        }
                    case 21: {
                            if (!(message.externalIds && message.externalIds.length))
                                message.externalIds = [];
                            message.externalIds.push($root.code_repositories.common.ExternalId.decode(reader, reader.uint32()));
                            break;
                        }
                    case 22: {
                            if (!(message.tagNames && message.tagNames.length))
                                message.tagNames = [];
                            message.tagNames.push(reader.string());
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
             * Decodes an UpdateRepositoryRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof code_repositories.repository.UpdateRepositoryRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {code_repositories.repository.UpdateRepositoryRequest} UpdateRepositoryRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            UpdateRepositoryRequest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an UpdateRepositoryRequest message.
             * @function verify
             * @memberof code_repositories.repository.UpdateRepositoryRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            UpdateRepositoryRequest.verify = function verify(message) {
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
                if (message.type != null && message.hasOwnProperty("type"))
                    switch (message.type) {
                    default:
                        return "type: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                        break;
                    }
                if (message.githubUrl != null && message.hasOwnProperty("githubUrl"))
                    if (!$util.isString(message.githubUrl))
                        return "githubUrl: string expected";
                if (message.packageUrl != null && message.hasOwnProperty("packageUrl"))
                    if (!$util.isString(message.packageUrl))
                        return "packageUrl: string expected";
                if (message.stars != null && message.hasOwnProperty("stars"))
                    if (!$util.isInteger(message.stars))
                        return "stars: integer expected";
                if (message.forks != null && message.hasOwnProperty("forks"))
                    if (!$util.isInteger(message.forks))
                        return "forks: integer expected";
                if (message.version != null && message.hasOwnProperty("version"))
                    if (!$util.isString(message.version))
                        return "version: string expected";
                if (message.maintainer != null && message.hasOwnProperty("maintainer"))
                    if (!$util.isString(message.maintainer))
                        return "maintainer: string expected";
                if (message.lastUpdated != null && message.hasOwnProperty("lastUpdated"))
                    if (!$util.isString(message.lastUpdated))
                        return "lastUpdated: string expected";
                if (message.trending != null && message.hasOwnProperty("trending"))
                    if (typeof message.trending !== "boolean")
                        return "trending: boolean expected";
                if (message.verified != null && message.hasOwnProperty("verified"))
                    if (typeof message.verified !== "boolean")
                        return "verified: boolean expected";
                if (message.language != null && message.hasOwnProperty("language"))
                    if (!$util.isString(message.language))
                        return "language: string expected";
                if (message.license != null && message.hasOwnProperty("license"))
                    if (!$util.isString(message.license))
                        return "license: string expected";
                if (message.size != null && message.hasOwnProperty("size"))
                    if (!$util.isString(message.size))
                        return "size: string expected";
                if (message.dependencies != null && message.hasOwnProperty("dependencies"))
                    if (!$util.isInteger(message.dependencies))
                        return "dependencies: integer expected";
                if (message.healthScore != null && message.hasOwnProperty("healthScore"))
                    if (!$util.isInteger(message.healthScore))
                        return "healthScore: integer expected";
                if (message.status != null && message.hasOwnProperty("status"))
                    switch (message.status) {
                    default:
                        return "status: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                        break;
                    }
                if (message.source != null && message.hasOwnProperty("source"))
                    switch (message.source) {
                    default:
                        return "source: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                        break;
                    }
                if (message.externalIds != null && message.hasOwnProperty("externalIds")) {
                    if (!Array.isArray(message.externalIds))
                        return "externalIds: array expected";
                    for (let i = 0; i < message.externalIds.length; ++i) {
                        let error = $root.code_repositories.common.ExternalId.verify(message.externalIds[i]);
                        if (error)
                            return "externalIds." + error;
                    }
                }
                if (message.tagNames != null && message.hasOwnProperty("tagNames")) {
                    if (!Array.isArray(message.tagNames))
                        return "tagNames: array expected";
                    for (let i = 0; i < message.tagNames.length; ++i)
                        if (!$util.isString(message.tagNames[i]))
                            return "tagNames: string[] expected";
                }
                return null;
            };

            /**
             * Creates an UpdateRepositoryRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof code_repositories.repository.UpdateRepositoryRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {code_repositories.repository.UpdateRepositoryRequest} UpdateRepositoryRequest
             */
            UpdateRepositoryRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.code_repositories.repository.UpdateRepositoryRequest)
                    return object;
                let message = new $root.code_repositories.repository.UpdateRepositoryRequest();
                if (object.id != null)
                    message.id = String(object.id);
                if (object.name != null)
                    message.name = String(object.name);
                if (object.description != null)
                    message.description = String(object.description);
                switch (object.type) {
                default:
                    if (typeof object.type === "number") {
                        message.type = object.type;
                        break;
                    }
                    break;
                case "REPOSITORY_TYPE_UNSPECIFIED":
                case 0:
                    message.type = 0;
                    break;
                case "REPOSITORY_TYPE_NPM":
                case 1:
                    message.type = 1;
                    break;
                case "REPOSITORY_TYPE_DOCKER":
                case 2:
                    message.type = 2;
                    break;
                case "REPOSITORY_TYPE_PYTHON":
                case 3:
                    message.type = 3;
                    break;
                }
                if (object.githubUrl != null)
                    message.githubUrl = String(object.githubUrl);
                if (object.packageUrl != null)
                    message.packageUrl = String(object.packageUrl);
                if (object.stars != null)
                    message.stars = object.stars | 0;
                if (object.forks != null)
                    message.forks = object.forks | 0;
                if (object.version != null)
                    message.version = String(object.version);
                if (object.maintainer != null)
                    message.maintainer = String(object.maintainer);
                if (object.lastUpdated != null)
                    message.lastUpdated = String(object.lastUpdated);
                if (object.trending != null)
                    message.trending = Boolean(object.trending);
                if (object.verified != null)
                    message.verified = Boolean(object.verified);
                if (object.language != null)
                    message.language = String(object.language);
                if (object.license != null)
                    message.license = String(object.license);
                if (object.size != null)
                    message.size = String(object.size);
                if (object.dependencies != null)
                    message.dependencies = object.dependencies | 0;
                if (object.healthScore != null)
                    message.healthScore = object.healthScore | 0;
                switch (object.status) {
                default:
                    if (typeof object.status === "number") {
                        message.status = object.status;
                        break;
                    }
                    break;
                case "REPOSITORY_STATUS_UNSPECIFIED":
                case 0:
                    message.status = 0;
                    break;
                case "REPOSITORY_STATUS_STABLE":
                case 1:
                    message.status = 1;
                    break;
                case "REPOSITORY_STATUS_BETA":
                case 2:
                    message.status = 2;
                    break;
                case "REPOSITORY_STATUS_DEPRECATED":
                case 3:
                    message.status = 3;
                    break;
                case "REPOSITORY_STATUS_EXPERIMENTAL":
                case 4:
                    message.status = 4;
                    break;
                }
                switch (object.source) {
                default:
                    if (typeof object.source === "number") {
                        message.source = object.source;
                        break;
                    }
                    break;
                case "REPOSITORY_SOURCE_UNSPECIFIED":
                case 0:
                    message.source = 0;
                    break;
                case "REPOSITORY_SOURCE_GITHUB":
                case 1:
                    message.source = 1;
                    break;
                case "REPOSITORY_SOURCE_NPM":
                case 2:
                    message.source = 2;
                    break;
                case "REPOSITORY_SOURCE_DOCKERHUB":
                case 3:
                    message.source = 3;
                    break;
                case "REPOSITORY_SOURCE_PYPI":
                case 4:
                    message.source = 4;
                    break;
                case "REPOSITORY_SOURCE_MANUAL":
                case 5:
                    message.source = 5;
                    break;
                }
                if (object.externalIds) {
                    if (!Array.isArray(object.externalIds))
                        throw TypeError(".code_repositories.repository.UpdateRepositoryRequest.externalIds: array expected");
                    message.externalIds = [];
                    for (let i = 0; i < object.externalIds.length; ++i) {
                        if (typeof object.externalIds[i] !== "object")
                            throw TypeError(".code_repositories.repository.UpdateRepositoryRequest.externalIds: object expected");
                        message.externalIds[i] = $root.code_repositories.common.ExternalId.fromObject(object.externalIds[i]);
                    }
                }
                if (object.tagNames) {
                    if (!Array.isArray(object.tagNames))
                        throw TypeError(".code_repositories.repository.UpdateRepositoryRequest.tagNames: array expected");
                    message.tagNames = [];
                    for (let i = 0; i < object.tagNames.length; ++i)
                        message.tagNames[i] = String(object.tagNames[i]);
                }
                return message;
            };

            /**
             * Creates a plain object from an UpdateRepositoryRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof code_repositories.repository.UpdateRepositoryRequest
             * @static
             * @param {code_repositories.repository.UpdateRepositoryRequest} message UpdateRepositoryRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            UpdateRepositoryRequest.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.arrays || options.defaults) {
                    object.externalIds = [];
                    object.tagNames = [];
                }
                if (options.defaults) {
                    object.id = "";
                    object.name = "";
                    object.description = "";
                    object.type = options.enums === String ? "REPOSITORY_TYPE_UNSPECIFIED" : 0;
                    object.githubUrl = "";
                    object.packageUrl = "";
                    object.stars = 0;
                    object.forks = 0;
                    object.version = "";
                    object.maintainer = "";
                    object.lastUpdated = "";
                    object.trending = false;
                    object.verified = false;
                    object.language = "";
                    object.license = "";
                    object.size = "";
                    object.dependencies = 0;
                    object.healthScore = 0;
                    object.status = options.enums === String ? "REPOSITORY_STATUS_UNSPECIFIED" : 0;
                    object.source = options.enums === String ? "REPOSITORY_SOURCE_UNSPECIFIED" : 0;
                }
                if (message.id != null && message.hasOwnProperty("id"))
                    object.id = message.id;
                if (message.name != null && message.hasOwnProperty("name"))
                    object.name = message.name;
                if (message.description != null && message.hasOwnProperty("description"))
                    object.description = message.description;
                if (message.type != null && message.hasOwnProperty("type"))
                    object.type = options.enums === String ? $root.code_repositories.common.RepositoryType[message.type] === undefined ? message.type : $root.code_repositories.common.RepositoryType[message.type] : message.type;
                if (message.githubUrl != null && message.hasOwnProperty("githubUrl"))
                    object.githubUrl = message.githubUrl;
                if (message.packageUrl != null && message.hasOwnProperty("packageUrl"))
                    object.packageUrl = message.packageUrl;
                if (message.stars != null && message.hasOwnProperty("stars"))
                    object.stars = message.stars;
                if (message.forks != null && message.hasOwnProperty("forks"))
                    object.forks = message.forks;
                if (message.version != null && message.hasOwnProperty("version"))
                    object.version = message.version;
                if (message.maintainer != null && message.hasOwnProperty("maintainer"))
                    object.maintainer = message.maintainer;
                if (message.lastUpdated != null && message.hasOwnProperty("lastUpdated"))
                    object.lastUpdated = message.lastUpdated;
                if (message.trending != null && message.hasOwnProperty("trending"))
                    object.trending = message.trending;
                if (message.verified != null && message.hasOwnProperty("verified"))
                    object.verified = message.verified;
                if (message.language != null && message.hasOwnProperty("language"))
                    object.language = message.language;
                if (message.license != null && message.hasOwnProperty("license"))
                    object.license = message.license;
                if (message.size != null && message.hasOwnProperty("size"))
                    object.size = message.size;
                if (message.dependencies != null && message.hasOwnProperty("dependencies"))
                    object.dependencies = message.dependencies;
                if (message.healthScore != null && message.hasOwnProperty("healthScore"))
                    object.healthScore = message.healthScore;
                if (message.status != null && message.hasOwnProperty("status"))
                    object.status = options.enums === String ? $root.code_repositories.common.RepositoryStatus[message.status] === undefined ? message.status : $root.code_repositories.common.RepositoryStatus[message.status] : message.status;
                if (message.source != null && message.hasOwnProperty("source"))
                    object.source = options.enums === String ? $root.code_repositories.common.RepositorySource[message.source] === undefined ? message.source : $root.code_repositories.common.RepositorySource[message.source] : message.source;
                if (message.externalIds && message.externalIds.length) {
                    object.externalIds = [];
                    for (let j = 0; j < message.externalIds.length; ++j)
                        object.externalIds[j] = $root.code_repositories.common.ExternalId.toObject(message.externalIds[j], options);
                }
                if (message.tagNames && message.tagNames.length) {
                    object.tagNames = [];
                    for (let j = 0; j < message.tagNames.length; ++j)
                        object.tagNames[j] = message.tagNames[j];
                }
                return object;
            };

            /**
             * Converts this UpdateRepositoryRequest to JSON.
             * @function toJSON
             * @memberof code_repositories.repository.UpdateRepositoryRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            UpdateRepositoryRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for UpdateRepositoryRequest
             * @function getTypeUrl
             * @memberof code_repositories.repository.UpdateRepositoryRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            UpdateRepositoryRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/code_repositories.repository.UpdateRepositoryRequest";
            };

            return UpdateRepositoryRequest;
        })();

        repository.UpdateRepositoryResponse = (function() {

            /**
             * Properties of an UpdateRepositoryResponse.
             * @memberof code_repositories.repository
             * @interface IUpdateRepositoryResponse
             * @property {code_repositories.repository.IRepository|null} [repository] UpdateRepositoryResponse repository
             */

            /**
             * Constructs a new UpdateRepositoryResponse.
             * @memberof code_repositories.repository
             * @classdesc Represents an UpdateRepositoryResponse.
             * @implements IUpdateRepositoryResponse
             * @constructor
             * @param {code_repositories.repository.IUpdateRepositoryResponse=} [properties] Properties to set
             */
            function UpdateRepositoryResponse(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * UpdateRepositoryResponse repository.
             * @member {code_repositories.repository.IRepository|null|undefined} repository
             * @memberof code_repositories.repository.UpdateRepositoryResponse
             * @instance
             */
            UpdateRepositoryResponse.prototype.repository = null;

            /**
             * Creates a new UpdateRepositoryResponse instance using the specified properties.
             * @function create
             * @memberof code_repositories.repository.UpdateRepositoryResponse
             * @static
             * @param {code_repositories.repository.IUpdateRepositoryResponse=} [properties] Properties to set
             * @returns {code_repositories.repository.UpdateRepositoryResponse} UpdateRepositoryResponse instance
             */
            UpdateRepositoryResponse.create = function create(properties) {
                return new UpdateRepositoryResponse(properties);
            };

            /**
             * Encodes the specified UpdateRepositoryResponse message. Does not implicitly {@link code_repositories.repository.UpdateRepositoryResponse.verify|verify} messages.
             * @function encode
             * @memberof code_repositories.repository.UpdateRepositoryResponse
             * @static
             * @param {code_repositories.repository.IUpdateRepositoryResponse} message UpdateRepositoryResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            UpdateRepositoryResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.repository != null && Object.hasOwnProperty.call(message, "repository"))
                    $root.code_repositories.repository.Repository.encode(message.repository, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified UpdateRepositoryResponse message, length delimited. Does not implicitly {@link code_repositories.repository.UpdateRepositoryResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof code_repositories.repository.UpdateRepositoryResponse
             * @static
             * @param {code_repositories.repository.IUpdateRepositoryResponse} message UpdateRepositoryResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            UpdateRepositoryResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an UpdateRepositoryResponse message from the specified reader or buffer.
             * @function decode
             * @memberof code_repositories.repository.UpdateRepositoryResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {code_repositories.repository.UpdateRepositoryResponse} UpdateRepositoryResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            UpdateRepositoryResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.code_repositories.repository.UpdateRepositoryResponse();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.repository = $root.code_repositories.repository.Repository.decode(reader, reader.uint32());
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
             * Decodes an UpdateRepositoryResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof code_repositories.repository.UpdateRepositoryResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {code_repositories.repository.UpdateRepositoryResponse} UpdateRepositoryResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            UpdateRepositoryResponse.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an UpdateRepositoryResponse message.
             * @function verify
             * @memberof code_repositories.repository.UpdateRepositoryResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            UpdateRepositoryResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.repository != null && message.hasOwnProperty("repository")) {
                    let error = $root.code_repositories.repository.Repository.verify(message.repository);
                    if (error)
                        return "repository." + error;
                }
                return null;
            };

            /**
             * Creates an UpdateRepositoryResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof code_repositories.repository.UpdateRepositoryResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {code_repositories.repository.UpdateRepositoryResponse} UpdateRepositoryResponse
             */
            UpdateRepositoryResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.code_repositories.repository.UpdateRepositoryResponse)
                    return object;
                let message = new $root.code_repositories.repository.UpdateRepositoryResponse();
                if (object.repository != null) {
                    if (typeof object.repository !== "object")
                        throw TypeError(".code_repositories.repository.UpdateRepositoryResponse.repository: object expected");
                    message.repository = $root.code_repositories.repository.Repository.fromObject(object.repository);
                }
                return message;
            };

            /**
             * Creates a plain object from an UpdateRepositoryResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof code_repositories.repository.UpdateRepositoryResponse
             * @static
             * @param {code_repositories.repository.UpdateRepositoryResponse} message UpdateRepositoryResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            UpdateRepositoryResponse.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults)
                    object.repository = null;
                if (message.repository != null && message.hasOwnProperty("repository"))
                    object.repository = $root.code_repositories.repository.Repository.toObject(message.repository, options);
                return object;
            };

            /**
             * Converts this UpdateRepositoryResponse to JSON.
             * @function toJSON
             * @memberof code_repositories.repository.UpdateRepositoryResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            UpdateRepositoryResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for UpdateRepositoryResponse
             * @function getTypeUrl
             * @memberof code_repositories.repository.UpdateRepositoryResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            UpdateRepositoryResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/code_repositories.repository.UpdateRepositoryResponse";
            };

            return UpdateRepositoryResponse;
        })();

        repository.DeleteRepositoryRequest = (function() {

            /**
             * Properties of a DeleteRepositoryRequest.
             * @memberof code_repositories.repository
             * @interface IDeleteRepositoryRequest
             * @property {string|null} [id] DeleteRepositoryRequest id
             */

            /**
             * Constructs a new DeleteRepositoryRequest.
             * @memberof code_repositories.repository
             * @classdesc Represents a DeleteRepositoryRequest.
             * @implements IDeleteRepositoryRequest
             * @constructor
             * @param {code_repositories.repository.IDeleteRepositoryRequest=} [properties] Properties to set
             */
            function DeleteRepositoryRequest(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * DeleteRepositoryRequest id.
             * @member {string} id
             * @memberof code_repositories.repository.DeleteRepositoryRequest
             * @instance
             */
            DeleteRepositoryRequest.prototype.id = "";

            /**
             * Creates a new DeleteRepositoryRequest instance using the specified properties.
             * @function create
             * @memberof code_repositories.repository.DeleteRepositoryRequest
             * @static
             * @param {code_repositories.repository.IDeleteRepositoryRequest=} [properties] Properties to set
             * @returns {code_repositories.repository.DeleteRepositoryRequest} DeleteRepositoryRequest instance
             */
            DeleteRepositoryRequest.create = function create(properties) {
                return new DeleteRepositoryRequest(properties);
            };

            /**
             * Encodes the specified DeleteRepositoryRequest message. Does not implicitly {@link code_repositories.repository.DeleteRepositoryRequest.verify|verify} messages.
             * @function encode
             * @memberof code_repositories.repository.DeleteRepositoryRequest
             * @static
             * @param {code_repositories.repository.IDeleteRepositoryRequest} message DeleteRepositoryRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DeleteRepositoryRequest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
                return writer;
            };

            /**
             * Encodes the specified DeleteRepositoryRequest message, length delimited. Does not implicitly {@link code_repositories.repository.DeleteRepositoryRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof code_repositories.repository.DeleteRepositoryRequest
             * @static
             * @param {code_repositories.repository.IDeleteRepositoryRequest} message DeleteRepositoryRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DeleteRepositoryRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a DeleteRepositoryRequest message from the specified reader or buffer.
             * @function decode
             * @memberof code_repositories.repository.DeleteRepositoryRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {code_repositories.repository.DeleteRepositoryRequest} DeleteRepositoryRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DeleteRepositoryRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.code_repositories.repository.DeleteRepositoryRequest();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.id = reader.string();
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
             * Decodes a DeleteRepositoryRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof code_repositories.repository.DeleteRepositoryRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {code_repositories.repository.DeleteRepositoryRequest} DeleteRepositoryRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DeleteRepositoryRequest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a DeleteRepositoryRequest message.
             * @function verify
             * @memberof code_repositories.repository.DeleteRepositoryRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            DeleteRepositoryRequest.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.id != null && message.hasOwnProperty("id"))
                    if (!$util.isString(message.id))
                        return "id: string expected";
                return null;
            };

            /**
             * Creates a DeleteRepositoryRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof code_repositories.repository.DeleteRepositoryRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {code_repositories.repository.DeleteRepositoryRequest} DeleteRepositoryRequest
             */
            DeleteRepositoryRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.code_repositories.repository.DeleteRepositoryRequest)
                    return object;
                let message = new $root.code_repositories.repository.DeleteRepositoryRequest();
                if (object.id != null)
                    message.id = String(object.id);
                return message;
            };

            /**
             * Creates a plain object from a DeleteRepositoryRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof code_repositories.repository.DeleteRepositoryRequest
             * @static
             * @param {code_repositories.repository.DeleteRepositoryRequest} message DeleteRepositoryRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            DeleteRepositoryRequest.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults)
                    object.id = "";
                if (message.id != null && message.hasOwnProperty("id"))
                    object.id = message.id;
                return object;
            };

            /**
             * Converts this DeleteRepositoryRequest to JSON.
             * @function toJSON
             * @memberof code_repositories.repository.DeleteRepositoryRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            DeleteRepositoryRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for DeleteRepositoryRequest
             * @function getTypeUrl
             * @memberof code_repositories.repository.DeleteRepositoryRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            DeleteRepositoryRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/code_repositories.repository.DeleteRepositoryRequest";
            };

            return DeleteRepositoryRequest;
        })();

        repository.DeleteRepositoryResponse = (function() {

            /**
             * Properties of a DeleteRepositoryResponse.
             * @memberof code_repositories.repository
             * @interface IDeleteRepositoryResponse
             * @property {boolean|null} [success] DeleteRepositoryResponse success
             */

            /**
             * Constructs a new DeleteRepositoryResponse.
             * @memberof code_repositories.repository
             * @classdesc Represents a DeleteRepositoryResponse.
             * @implements IDeleteRepositoryResponse
             * @constructor
             * @param {code_repositories.repository.IDeleteRepositoryResponse=} [properties] Properties to set
             */
            function DeleteRepositoryResponse(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * DeleteRepositoryResponse success.
             * @member {boolean} success
             * @memberof code_repositories.repository.DeleteRepositoryResponse
             * @instance
             */
            DeleteRepositoryResponse.prototype.success = false;

            /**
             * Creates a new DeleteRepositoryResponse instance using the specified properties.
             * @function create
             * @memberof code_repositories.repository.DeleteRepositoryResponse
             * @static
             * @param {code_repositories.repository.IDeleteRepositoryResponse=} [properties] Properties to set
             * @returns {code_repositories.repository.DeleteRepositoryResponse} DeleteRepositoryResponse instance
             */
            DeleteRepositoryResponse.create = function create(properties) {
                return new DeleteRepositoryResponse(properties);
            };

            /**
             * Encodes the specified DeleteRepositoryResponse message. Does not implicitly {@link code_repositories.repository.DeleteRepositoryResponse.verify|verify} messages.
             * @function encode
             * @memberof code_repositories.repository.DeleteRepositoryResponse
             * @static
             * @param {code_repositories.repository.IDeleteRepositoryResponse} message DeleteRepositoryResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DeleteRepositoryResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.success != null && Object.hasOwnProperty.call(message, "success"))
                    writer.uint32(/* id 1, wireType 0 =*/8).bool(message.success);
                return writer;
            };

            /**
             * Encodes the specified DeleteRepositoryResponse message, length delimited. Does not implicitly {@link code_repositories.repository.DeleteRepositoryResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof code_repositories.repository.DeleteRepositoryResponse
             * @static
             * @param {code_repositories.repository.IDeleteRepositoryResponse} message DeleteRepositoryResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DeleteRepositoryResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a DeleteRepositoryResponse message from the specified reader or buffer.
             * @function decode
             * @memberof code_repositories.repository.DeleteRepositoryResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {code_repositories.repository.DeleteRepositoryResponse} DeleteRepositoryResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DeleteRepositoryResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.code_repositories.repository.DeleteRepositoryResponse();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.success = reader.bool();
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
             * Decodes a DeleteRepositoryResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof code_repositories.repository.DeleteRepositoryResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {code_repositories.repository.DeleteRepositoryResponse} DeleteRepositoryResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DeleteRepositoryResponse.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a DeleteRepositoryResponse message.
             * @function verify
             * @memberof code_repositories.repository.DeleteRepositoryResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            DeleteRepositoryResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.success != null && message.hasOwnProperty("success"))
                    if (typeof message.success !== "boolean")
                        return "success: boolean expected";
                return null;
            };

            /**
             * Creates a DeleteRepositoryResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof code_repositories.repository.DeleteRepositoryResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {code_repositories.repository.DeleteRepositoryResponse} DeleteRepositoryResponse
             */
            DeleteRepositoryResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.code_repositories.repository.DeleteRepositoryResponse)
                    return object;
                let message = new $root.code_repositories.repository.DeleteRepositoryResponse();
                if (object.success != null)
                    message.success = Boolean(object.success);
                return message;
            };

            /**
             * Creates a plain object from a DeleteRepositoryResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof code_repositories.repository.DeleteRepositoryResponse
             * @static
             * @param {code_repositories.repository.DeleteRepositoryResponse} message DeleteRepositoryResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            DeleteRepositoryResponse.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults)
                    object.success = false;
                if (message.success != null && message.hasOwnProperty("success"))
                    object.success = message.success;
                return object;
            };

            /**
             * Converts this DeleteRepositoryResponse to JSON.
             * @function toJSON
             * @memberof code_repositories.repository.DeleteRepositoryResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            DeleteRepositoryResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for DeleteRepositoryResponse
             * @function getTypeUrl
             * @memberof code_repositories.repository.DeleteRepositoryResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            DeleteRepositoryResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/code_repositories.repository.DeleteRepositoryResponse";
            };

            return DeleteRepositoryResponse;
        })();

        return repository;
    })();

    code_repositories.common = (function() {

        /**
         * Namespace common.
         * @memberof code_repositories
         * @namespace
         */
        const common = {};

        /**
         * RepositoryType enum.
         * @name code_repositories.common.RepositoryType
         * @enum {number}
         * @property {number} REPOSITORY_TYPE_UNSPECIFIED=0 REPOSITORY_TYPE_UNSPECIFIED value
         * @property {number} REPOSITORY_TYPE_NPM=1 REPOSITORY_TYPE_NPM value
         * @property {number} REPOSITORY_TYPE_DOCKER=2 REPOSITORY_TYPE_DOCKER value
         * @property {number} REPOSITORY_TYPE_PYTHON=3 REPOSITORY_TYPE_PYTHON value
         */
        common.RepositoryType = (function() {
            const valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "REPOSITORY_TYPE_UNSPECIFIED"] = 0;
            values[valuesById[1] = "REPOSITORY_TYPE_NPM"] = 1;
            values[valuesById[2] = "REPOSITORY_TYPE_DOCKER"] = 2;
            values[valuesById[3] = "REPOSITORY_TYPE_PYTHON"] = 3;
            return values;
        })();

        /**
         * RepositoryStatus enum.
         * @name code_repositories.common.RepositoryStatus
         * @enum {number}
         * @property {number} REPOSITORY_STATUS_UNSPECIFIED=0 REPOSITORY_STATUS_UNSPECIFIED value
         * @property {number} REPOSITORY_STATUS_STABLE=1 REPOSITORY_STATUS_STABLE value
         * @property {number} REPOSITORY_STATUS_BETA=2 REPOSITORY_STATUS_BETA value
         * @property {number} REPOSITORY_STATUS_DEPRECATED=3 REPOSITORY_STATUS_DEPRECATED value
         * @property {number} REPOSITORY_STATUS_EXPERIMENTAL=4 REPOSITORY_STATUS_EXPERIMENTAL value
         */
        common.RepositoryStatus = (function() {
            const valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "REPOSITORY_STATUS_UNSPECIFIED"] = 0;
            values[valuesById[1] = "REPOSITORY_STATUS_STABLE"] = 1;
            values[valuesById[2] = "REPOSITORY_STATUS_BETA"] = 2;
            values[valuesById[3] = "REPOSITORY_STATUS_DEPRECATED"] = 3;
            values[valuesById[4] = "REPOSITORY_STATUS_EXPERIMENTAL"] = 4;
            return values;
        })();

        /**
         * RepositorySource enum.
         * @name code_repositories.common.RepositorySource
         * @enum {number}
         * @property {number} REPOSITORY_SOURCE_UNSPECIFIED=0 REPOSITORY_SOURCE_UNSPECIFIED value
         * @property {number} REPOSITORY_SOURCE_GITHUB=1 REPOSITORY_SOURCE_GITHUB value
         * @property {number} REPOSITORY_SOURCE_NPM=2 REPOSITORY_SOURCE_NPM value
         * @property {number} REPOSITORY_SOURCE_DOCKERHUB=3 REPOSITORY_SOURCE_DOCKERHUB value
         * @property {number} REPOSITORY_SOURCE_PYPI=4 REPOSITORY_SOURCE_PYPI value
         * @property {number} REPOSITORY_SOURCE_MANUAL=5 REPOSITORY_SOURCE_MANUAL value
         */
        common.RepositorySource = (function() {
            const valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "REPOSITORY_SOURCE_UNSPECIFIED"] = 0;
            values[valuesById[1] = "REPOSITORY_SOURCE_GITHUB"] = 1;
            values[valuesById[2] = "REPOSITORY_SOURCE_NPM"] = 2;
            values[valuesById[3] = "REPOSITORY_SOURCE_DOCKERHUB"] = 3;
            values[valuesById[4] = "REPOSITORY_SOURCE_PYPI"] = 4;
            values[valuesById[5] = "REPOSITORY_SOURCE_MANUAL"] = 5;
            return values;
        })();

        common.ExternalId = (function() {

            /**
             * Properties of an ExternalId.
             * @memberof code_repositories.common
             * @interface IExternalId
             * @property {string|null} [registry] ExternalId registry
             * @property {string|null} [id] ExternalId id
             */

            /**
             * Constructs a new ExternalId.
             * @memberof code_repositories.common
             * @classdesc Represents an ExternalId.
             * @implements IExternalId
             * @constructor
             * @param {code_repositories.common.IExternalId=} [properties] Properties to set
             */
            function ExternalId(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ExternalId registry.
             * @member {string} registry
             * @memberof code_repositories.common.ExternalId
             * @instance
             */
            ExternalId.prototype.registry = "";

            /**
             * ExternalId id.
             * @member {string} id
             * @memberof code_repositories.common.ExternalId
             * @instance
             */
            ExternalId.prototype.id = "";

            /**
             * Creates a new ExternalId instance using the specified properties.
             * @function create
             * @memberof code_repositories.common.ExternalId
             * @static
             * @param {code_repositories.common.IExternalId=} [properties] Properties to set
             * @returns {code_repositories.common.ExternalId} ExternalId instance
             */
            ExternalId.create = function create(properties) {
                return new ExternalId(properties);
            };

            /**
             * Encodes the specified ExternalId message. Does not implicitly {@link code_repositories.common.ExternalId.verify|verify} messages.
             * @function encode
             * @memberof code_repositories.common.ExternalId
             * @static
             * @param {code_repositories.common.IExternalId} message ExternalId message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ExternalId.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.registry != null && Object.hasOwnProperty.call(message, "registry"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.registry);
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.id);
                return writer;
            };

            /**
             * Encodes the specified ExternalId message, length delimited. Does not implicitly {@link code_repositories.common.ExternalId.verify|verify} messages.
             * @function encodeDelimited
             * @memberof code_repositories.common.ExternalId
             * @static
             * @param {code_repositories.common.IExternalId} message ExternalId message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ExternalId.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an ExternalId message from the specified reader or buffer.
             * @function decode
             * @memberof code_repositories.common.ExternalId
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {code_repositories.common.ExternalId} ExternalId
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ExternalId.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.code_repositories.common.ExternalId();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.registry = reader.string();
                            break;
                        }
                    case 2: {
                            message.id = reader.string();
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
             * Decodes an ExternalId message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof code_repositories.common.ExternalId
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {code_repositories.common.ExternalId} ExternalId
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ExternalId.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an ExternalId message.
             * @function verify
             * @memberof code_repositories.common.ExternalId
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ExternalId.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.registry != null && message.hasOwnProperty("registry"))
                    if (!$util.isString(message.registry))
                        return "registry: string expected";
                if (message.id != null && message.hasOwnProperty("id"))
                    if (!$util.isString(message.id))
                        return "id: string expected";
                return null;
            };

            /**
             * Creates an ExternalId message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof code_repositories.common.ExternalId
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {code_repositories.common.ExternalId} ExternalId
             */
            ExternalId.fromObject = function fromObject(object) {
                if (object instanceof $root.code_repositories.common.ExternalId)
                    return object;
                let message = new $root.code_repositories.common.ExternalId();
                if (object.registry != null)
                    message.registry = String(object.registry);
                if (object.id != null)
                    message.id = String(object.id);
                return message;
            };

            /**
             * Creates a plain object from an ExternalId message. Also converts values to other types if specified.
             * @function toObject
             * @memberof code_repositories.common.ExternalId
             * @static
             * @param {code_repositories.common.ExternalId} message ExternalId
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ExternalId.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.registry = "";
                    object.id = "";
                }
                if (message.registry != null && message.hasOwnProperty("registry"))
                    object.registry = message.registry;
                if (message.id != null && message.hasOwnProperty("id"))
                    object.id = message.id;
                return object;
            };

            /**
             * Converts this ExternalId to JSON.
             * @function toJSON
             * @memberof code_repositories.common.ExternalId
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ExternalId.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ExternalId
             * @function getTypeUrl
             * @memberof code_repositories.common.ExternalId
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ExternalId.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/code_repositories.common.ExternalId";
            };

            return ExternalId;
        })();

        common.PaginationRequest = (function() {

            /**
             * Properties of a PaginationRequest.
             * @memberof code_repositories.common
             * @interface IPaginationRequest
             * @property {number|null} [page] PaginationRequest page
             * @property {number|null} [limit] PaginationRequest limit
             */

            /**
             * Constructs a new PaginationRequest.
             * @memberof code_repositories.common
             * @classdesc Represents a PaginationRequest.
             * @implements IPaginationRequest
             * @constructor
             * @param {code_repositories.common.IPaginationRequest=} [properties] Properties to set
             */
            function PaginationRequest(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * PaginationRequest page.
             * @member {number} page
             * @memberof code_repositories.common.PaginationRequest
             * @instance
             */
            PaginationRequest.prototype.page = 0;

            /**
             * PaginationRequest limit.
             * @member {number} limit
             * @memberof code_repositories.common.PaginationRequest
             * @instance
             */
            PaginationRequest.prototype.limit = 0;

            /**
             * Creates a new PaginationRequest instance using the specified properties.
             * @function create
             * @memberof code_repositories.common.PaginationRequest
             * @static
             * @param {code_repositories.common.IPaginationRequest=} [properties] Properties to set
             * @returns {code_repositories.common.PaginationRequest} PaginationRequest instance
             */
            PaginationRequest.create = function create(properties) {
                return new PaginationRequest(properties);
            };

            /**
             * Encodes the specified PaginationRequest message. Does not implicitly {@link code_repositories.common.PaginationRequest.verify|verify} messages.
             * @function encode
             * @memberof code_repositories.common.PaginationRequest
             * @static
             * @param {code_repositories.common.IPaginationRequest} message PaginationRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PaginationRequest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.page != null && Object.hasOwnProperty.call(message, "page"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.page);
                if (message.limit != null && Object.hasOwnProperty.call(message, "limit"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int32(message.limit);
                return writer;
            };

            /**
             * Encodes the specified PaginationRequest message, length delimited. Does not implicitly {@link code_repositories.common.PaginationRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof code_repositories.common.PaginationRequest
             * @static
             * @param {code_repositories.common.IPaginationRequest} message PaginationRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PaginationRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a PaginationRequest message from the specified reader or buffer.
             * @function decode
             * @memberof code_repositories.common.PaginationRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {code_repositories.common.PaginationRequest} PaginationRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PaginationRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.code_repositories.common.PaginationRequest();
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
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a PaginationRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof code_repositories.common.PaginationRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {code_repositories.common.PaginationRequest} PaginationRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PaginationRequest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a PaginationRequest message.
             * @function verify
             * @memberof code_repositories.common.PaginationRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            PaginationRequest.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.page != null && message.hasOwnProperty("page"))
                    if (!$util.isInteger(message.page))
                        return "page: integer expected";
                if (message.limit != null && message.hasOwnProperty("limit"))
                    if (!$util.isInteger(message.limit))
                        return "limit: integer expected";
                return null;
            };

            /**
             * Creates a PaginationRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof code_repositories.common.PaginationRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {code_repositories.common.PaginationRequest} PaginationRequest
             */
            PaginationRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.code_repositories.common.PaginationRequest)
                    return object;
                let message = new $root.code_repositories.common.PaginationRequest();
                if (object.page != null)
                    message.page = object.page | 0;
                if (object.limit != null)
                    message.limit = object.limit | 0;
                return message;
            };

            /**
             * Creates a plain object from a PaginationRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof code_repositories.common.PaginationRequest
             * @static
             * @param {code_repositories.common.PaginationRequest} message PaginationRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            PaginationRequest.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.page = 0;
                    object.limit = 0;
                }
                if (message.page != null && message.hasOwnProperty("page"))
                    object.page = message.page;
                if (message.limit != null && message.hasOwnProperty("limit"))
                    object.limit = message.limit;
                return object;
            };

            /**
             * Converts this PaginationRequest to JSON.
             * @function toJSON
             * @memberof code_repositories.common.PaginationRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            PaginationRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for PaginationRequest
             * @function getTypeUrl
             * @memberof code_repositories.common.PaginationRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            PaginationRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/code_repositories.common.PaginationRequest";
            };

            return PaginationRequest;
        })();

        common.PaginationResponse = (function() {

            /**
             * Properties of a PaginationResponse.
             * @memberof code_repositories.common
             * @interface IPaginationResponse
             * @property {number|null} [page] PaginationResponse page
             * @property {number|null} [limit] PaginationResponse limit
             * @property {number|null} [total] PaginationResponse total
             * @property {number|null} [totalPages] PaginationResponse totalPages
             */

            /**
             * Constructs a new PaginationResponse.
             * @memberof code_repositories.common
             * @classdesc Represents a PaginationResponse.
             * @implements IPaginationResponse
             * @constructor
             * @param {code_repositories.common.IPaginationResponse=} [properties] Properties to set
             */
            function PaginationResponse(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * PaginationResponse page.
             * @member {number} page
             * @memberof code_repositories.common.PaginationResponse
             * @instance
             */
            PaginationResponse.prototype.page = 0;

            /**
             * PaginationResponse limit.
             * @member {number} limit
             * @memberof code_repositories.common.PaginationResponse
             * @instance
             */
            PaginationResponse.prototype.limit = 0;

            /**
             * PaginationResponse total.
             * @member {number} total
             * @memberof code_repositories.common.PaginationResponse
             * @instance
             */
            PaginationResponse.prototype.total = 0;

            /**
             * PaginationResponse totalPages.
             * @member {number} totalPages
             * @memberof code_repositories.common.PaginationResponse
             * @instance
             */
            PaginationResponse.prototype.totalPages = 0;

            /**
             * Creates a new PaginationResponse instance using the specified properties.
             * @function create
             * @memberof code_repositories.common.PaginationResponse
             * @static
             * @param {code_repositories.common.IPaginationResponse=} [properties] Properties to set
             * @returns {code_repositories.common.PaginationResponse} PaginationResponse instance
             */
            PaginationResponse.create = function create(properties) {
                return new PaginationResponse(properties);
            };

            /**
             * Encodes the specified PaginationResponse message. Does not implicitly {@link code_repositories.common.PaginationResponse.verify|verify} messages.
             * @function encode
             * @memberof code_repositories.common.PaginationResponse
             * @static
             * @param {code_repositories.common.IPaginationResponse} message PaginationResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PaginationResponse.encode = function encode(message, writer) {
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
             * Encodes the specified PaginationResponse message, length delimited. Does not implicitly {@link code_repositories.common.PaginationResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof code_repositories.common.PaginationResponse
             * @static
             * @param {code_repositories.common.IPaginationResponse} message PaginationResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PaginationResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a PaginationResponse message from the specified reader or buffer.
             * @function decode
             * @memberof code_repositories.common.PaginationResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {code_repositories.common.PaginationResponse} PaginationResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PaginationResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.code_repositories.common.PaginationResponse();
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
             * Decodes a PaginationResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof code_repositories.common.PaginationResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {code_repositories.common.PaginationResponse} PaginationResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PaginationResponse.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a PaginationResponse message.
             * @function verify
             * @memberof code_repositories.common.PaginationResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            PaginationResponse.verify = function verify(message) {
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
             * Creates a PaginationResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof code_repositories.common.PaginationResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {code_repositories.common.PaginationResponse} PaginationResponse
             */
            PaginationResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.code_repositories.common.PaginationResponse)
                    return object;
                let message = new $root.code_repositories.common.PaginationResponse();
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
             * Creates a plain object from a PaginationResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof code_repositories.common.PaginationResponse
             * @static
             * @param {code_repositories.common.PaginationResponse} message PaginationResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            PaginationResponse.toObject = function toObject(message, options) {
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
             * Converts this PaginationResponse to JSON.
             * @function toJSON
             * @memberof code_repositories.common.PaginationResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            PaginationResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for PaginationResponse
             * @function getTypeUrl
             * @memberof code_repositories.common.PaginationResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            PaginationResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/code_repositories.common.PaginationResponse";
            };

            return PaginationResponse;
        })();

        common.ErrorResponse = (function() {

            /**
             * Properties of an ErrorResponse.
             * @memberof code_repositories.common
             * @interface IErrorResponse
             * @property {number|null} [code] ErrorResponse code
             * @property {string|null} [message] ErrorResponse message
             * @property {string|null} [details] ErrorResponse details
             */

            /**
             * Constructs a new ErrorResponse.
             * @memberof code_repositories.common
             * @classdesc Represents an ErrorResponse.
             * @implements IErrorResponse
             * @constructor
             * @param {code_repositories.common.IErrorResponse=} [properties] Properties to set
             */
            function ErrorResponse(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ErrorResponse code.
             * @member {number} code
             * @memberof code_repositories.common.ErrorResponse
             * @instance
             */
            ErrorResponse.prototype.code = 0;

            /**
             * ErrorResponse message.
             * @member {string} message
             * @memberof code_repositories.common.ErrorResponse
             * @instance
             */
            ErrorResponse.prototype.message = "";

            /**
             * ErrorResponse details.
             * @member {string} details
             * @memberof code_repositories.common.ErrorResponse
             * @instance
             */
            ErrorResponse.prototype.details = "";

            /**
             * Creates a new ErrorResponse instance using the specified properties.
             * @function create
             * @memberof code_repositories.common.ErrorResponse
             * @static
             * @param {code_repositories.common.IErrorResponse=} [properties] Properties to set
             * @returns {code_repositories.common.ErrorResponse} ErrorResponse instance
             */
            ErrorResponse.create = function create(properties) {
                return new ErrorResponse(properties);
            };

            /**
             * Encodes the specified ErrorResponse message. Does not implicitly {@link code_repositories.common.ErrorResponse.verify|verify} messages.
             * @function encode
             * @memberof code_repositories.common.ErrorResponse
             * @static
             * @param {code_repositories.common.IErrorResponse} message ErrorResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ErrorResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.code != null && Object.hasOwnProperty.call(message, "code"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.code);
                if (message.message != null && Object.hasOwnProperty.call(message, "message"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.message);
                if (message.details != null && Object.hasOwnProperty.call(message, "details"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.details);
                return writer;
            };

            /**
             * Encodes the specified ErrorResponse message, length delimited. Does not implicitly {@link code_repositories.common.ErrorResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof code_repositories.common.ErrorResponse
             * @static
             * @param {code_repositories.common.IErrorResponse} message ErrorResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ErrorResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an ErrorResponse message from the specified reader or buffer.
             * @function decode
             * @memberof code_repositories.common.ErrorResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {code_repositories.common.ErrorResponse} ErrorResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ErrorResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.code_repositories.common.ErrorResponse();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.code = reader.int32();
                            break;
                        }
                    case 2: {
                            message.message = reader.string();
                            break;
                        }
                    case 3: {
                            message.details = reader.string();
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
             * Decodes an ErrorResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof code_repositories.common.ErrorResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {code_repositories.common.ErrorResponse} ErrorResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ErrorResponse.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an ErrorResponse message.
             * @function verify
             * @memberof code_repositories.common.ErrorResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ErrorResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.code != null && message.hasOwnProperty("code"))
                    if (!$util.isInteger(message.code))
                        return "code: integer expected";
                if (message.message != null && message.hasOwnProperty("message"))
                    if (!$util.isString(message.message))
                        return "message: string expected";
                if (message.details != null && message.hasOwnProperty("details"))
                    if (!$util.isString(message.details))
                        return "details: string expected";
                return null;
            };

            /**
             * Creates an ErrorResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof code_repositories.common.ErrorResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {code_repositories.common.ErrorResponse} ErrorResponse
             */
            ErrorResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.code_repositories.common.ErrorResponse)
                    return object;
                let message = new $root.code_repositories.common.ErrorResponse();
                if (object.code != null)
                    message.code = object.code | 0;
                if (object.message != null)
                    message.message = String(object.message);
                if (object.details != null)
                    message.details = String(object.details);
                return message;
            };

            /**
             * Creates a plain object from an ErrorResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof code_repositories.common.ErrorResponse
             * @static
             * @param {code_repositories.common.ErrorResponse} message ErrorResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ErrorResponse.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.code = 0;
                    object.message = "";
                    object.details = "";
                }
                if (message.code != null && message.hasOwnProperty("code"))
                    object.code = message.code;
                if (message.message != null && message.hasOwnProperty("message"))
                    object.message = message.message;
                if (message.details != null && message.hasOwnProperty("details"))
                    object.details = message.details;
                return object;
            };

            /**
             * Converts this ErrorResponse to JSON.
             * @function toJSON
             * @memberof code_repositories.common.ErrorResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ErrorResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ErrorResponse
             * @function getTypeUrl
             * @memberof code_repositories.common.ErrorResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ErrorResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/code_repositories.common.ErrorResponse";
            };

            return ErrorResponse;
        })();

        common.Timestamp = (function() {

            /**
             * Properties of a Timestamp.
             * @memberof code_repositories.common
             * @interface ITimestamp
             * @property {string|null} [iso8601] Timestamp iso8601
             */

            /**
             * Constructs a new Timestamp.
             * @memberof code_repositories.common
             * @classdesc Represents a Timestamp.
             * @implements ITimestamp
             * @constructor
             * @param {code_repositories.common.ITimestamp=} [properties] Properties to set
             */
            function Timestamp(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Timestamp iso8601.
             * @member {string} iso8601
             * @memberof code_repositories.common.Timestamp
             * @instance
             */
            Timestamp.prototype.iso8601 = "";

            /**
             * Creates a new Timestamp instance using the specified properties.
             * @function create
             * @memberof code_repositories.common.Timestamp
             * @static
             * @param {code_repositories.common.ITimestamp=} [properties] Properties to set
             * @returns {code_repositories.common.Timestamp} Timestamp instance
             */
            Timestamp.create = function create(properties) {
                return new Timestamp(properties);
            };

            /**
             * Encodes the specified Timestamp message. Does not implicitly {@link code_repositories.common.Timestamp.verify|verify} messages.
             * @function encode
             * @memberof code_repositories.common.Timestamp
             * @static
             * @param {code_repositories.common.ITimestamp} message Timestamp message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Timestamp.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.iso8601 != null && Object.hasOwnProperty.call(message, "iso8601"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.iso8601);
                return writer;
            };

            /**
             * Encodes the specified Timestamp message, length delimited. Does not implicitly {@link code_repositories.common.Timestamp.verify|verify} messages.
             * @function encodeDelimited
             * @memberof code_repositories.common.Timestamp
             * @static
             * @param {code_repositories.common.ITimestamp} message Timestamp message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Timestamp.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Timestamp message from the specified reader or buffer.
             * @function decode
             * @memberof code_repositories.common.Timestamp
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {code_repositories.common.Timestamp} Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Timestamp.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.code_repositories.common.Timestamp();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.iso8601 = reader.string();
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
             * Decodes a Timestamp message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof code_repositories.common.Timestamp
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {code_repositories.common.Timestamp} Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Timestamp.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Timestamp message.
             * @function verify
             * @memberof code_repositories.common.Timestamp
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Timestamp.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.iso8601 != null && message.hasOwnProperty("iso8601"))
                    if (!$util.isString(message.iso8601))
                        return "iso8601: string expected";
                return null;
            };

            /**
             * Creates a Timestamp message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof code_repositories.common.Timestamp
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {code_repositories.common.Timestamp} Timestamp
             */
            Timestamp.fromObject = function fromObject(object) {
                if (object instanceof $root.code_repositories.common.Timestamp)
                    return object;
                let message = new $root.code_repositories.common.Timestamp();
                if (object.iso8601 != null)
                    message.iso8601 = String(object.iso8601);
                return message;
            };

            /**
             * Creates a plain object from a Timestamp message. Also converts values to other types if specified.
             * @function toObject
             * @memberof code_repositories.common.Timestamp
             * @static
             * @param {code_repositories.common.Timestamp} message Timestamp
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Timestamp.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults)
                    object.iso8601 = "";
                if (message.iso8601 != null && message.hasOwnProperty("iso8601"))
                    object.iso8601 = message.iso8601;
                return object;
            };

            /**
             * Converts this Timestamp to JSON.
             * @function toJSON
             * @memberof code_repositories.common.Timestamp
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Timestamp.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Timestamp
             * @function getTypeUrl
             * @memberof code_repositories.common.Timestamp
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Timestamp.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/code_repositories.common.Timestamp";
            };

            return Timestamp;
        })();

        return common;
    })();

    code_repositories.tag = (function() {

        /**
         * Namespace tag.
         * @memberof code_repositories
         * @namespace
         */
        const tag = {};

        tag.Tag = (function() {

            /**
             * Properties of a Tag.
             * @memberof code_repositories.tag
             * @interface ITag
             * @property {number|null} [id] Tag id
             * @property {string|null} [name] Tag name
             * @property {code_repositories.common.ITimestamp|null} [createdAt] Tag createdAt
             * @property {code_repositories.common.ITimestamp|null} [updatedAt] Tag updatedAt
             */

            /**
             * Constructs a new Tag.
             * @memberof code_repositories.tag
             * @classdesc Represents a Tag.
             * @implements ITag
             * @constructor
             * @param {code_repositories.tag.ITag=} [properties] Properties to set
             */
            function Tag(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Tag id.
             * @member {number} id
             * @memberof code_repositories.tag.Tag
             * @instance
             */
            Tag.prototype.id = 0;

            /**
             * Tag name.
             * @member {string} name
             * @memberof code_repositories.tag.Tag
             * @instance
             */
            Tag.prototype.name = "";

            /**
             * Tag createdAt.
             * @member {code_repositories.common.ITimestamp|null|undefined} createdAt
             * @memberof code_repositories.tag.Tag
             * @instance
             */
            Tag.prototype.createdAt = null;

            /**
             * Tag updatedAt.
             * @member {code_repositories.common.ITimestamp|null|undefined} updatedAt
             * @memberof code_repositories.tag.Tag
             * @instance
             */
            Tag.prototype.updatedAt = null;

            /**
             * Creates a new Tag instance using the specified properties.
             * @function create
             * @memberof code_repositories.tag.Tag
             * @static
             * @param {code_repositories.tag.ITag=} [properties] Properties to set
             * @returns {code_repositories.tag.Tag} Tag instance
             */
            Tag.create = function create(properties) {
                return new Tag(properties);
            };

            /**
             * Encodes the specified Tag message. Does not implicitly {@link code_repositories.tag.Tag.verify|verify} messages.
             * @function encode
             * @memberof code_repositories.tag.Tag
             * @static
             * @param {code_repositories.tag.ITag} message Tag message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Tag.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.id);
                if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
                if (message.createdAt != null && Object.hasOwnProperty.call(message, "createdAt"))
                    $root.code_repositories.common.Timestamp.encode(message.createdAt, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.updatedAt != null && Object.hasOwnProperty.call(message, "updatedAt"))
                    $root.code_repositories.common.Timestamp.encode(message.updatedAt, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified Tag message, length delimited. Does not implicitly {@link code_repositories.tag.Tag.verify|verify} messages.
             * @function encodeDelimited
             * @memberof code_repositories.tag.Tag
             * @static
             * @param {code_repositories.tag.ITag} message Tag message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Tag.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Tag message from the specified reader or buffer.
             * @function decode
             * @memberof code_repositories.tag.Tag
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {code_repositories.tag.Tag} Tag
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Tag.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.code_repositories.tag.Tag();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.id = reader.int32();
                            break;
                        }
                    case 2: {
                            message.name = reader.string();
                            break;
                        }
                    case 3: {
                            message.createdAt = $root.code_repositories.common.Timestamp.decode(reader, reader.uint32());
                            break;
                        }
                    case 4: {
                            message.updatedAt = $root.code_repositories.common.Timestamp.decode(reader, reader.uint32());
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
             * Decodes a Tag message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof code_repositories.tag.Tag
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {code_repositories.tag.Tag} Tag
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Tag.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Tag message.
             * @function verify
             * @memberof code_repositories.tag.Tag
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Tag.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.id != null && message.hasOwnProperty("id"))
                    if (!$util.isInteger(message.id))
                        return "id: integer expected";
                if (message.name != null && message.hasOwnProperty("name"))
                    if (!$util.isString(message.name))
                        return "name: string expected";
                if (message.createdAt != null && message.hasOwnProperty("createdAt")) {
                    let error = $root.code_repositories.common.Timestamp.verify(message.createdAt);
                    if (error)
                        return "createdAt." + error;
                }
                if (message.updatedAt != null && message.hasOwnProperty("updatedAt")) {
                    let error = $root.code_repositories.common.Timestamp.verify(message.updatedAt);
                    if (error)
                        return "updatedAt." + error;
                }
                return null;
            };

            /**
             * Creates a Tag message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof code_repositories.tag.Tag
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {code_repositories.tag.Tag} Tag
             */
            Tag.fromObject = function fromObject(object) {
                if (object instanceof $root.code_repositories.tag.Tag)
                    return object;
                let message = new $root.code_repositories.tag.Tag();
                if (object.id != null)
                    message.id = object.id | 0;
                if (object.name != null)
                    message.name = String(object.name);
                if (object.createdAt != null) {
                    if (typeof object.createdAt !== "object")
                        throw TypeError(".code_repositories.tag.Tag.createdAt: object expected");
                    message.createdAt = $root.code_repositories.common.Timestamp.fromObject(object.createdAt);
                }
                if (object.updatedAt != null) {
                    if (typeof object.updatedAt !== "object")
                        throw TypeError(".code_repositories.tag.Tag.updatedAt: object expected");
                    message.updatedAt = $root.code_repositories.common.Timestamp.fromObject(object.updatedAt);
                }
                return message;
            };

            /**
             * Creates a plain object from a Tag message. Also converts values to other types if specified.
             * @function toObject
             * @memberof code_repositories.tag.Tag
             * @static
             * @param {code_repositories.tag.Tag} message Tag
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Tag.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.id = 0;
                    object.name = "";
                    object.createdAt = null;
                    object.updatedAt = null;
                }
                if (message.id != null && message.hasOwnProperty("id"))
                    object.id = message.id;
                if (message.name != null && message.hasOwnProperty("name"))
                    object.name = message.name;
                if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                    object.createdAt = $root.code_repositories.common.Timestamp.toObject(message.createdAt, options);
                if (message.updatedAt != null && message.hasOwnProperty("updatedAt"))
                    object.updatedAt = $root.code_repositories.common.Timestamp.toObject(message.updatedAt, options);
                return object;
            };

            /**
             * Converts this Tag to JSON.
             * @function toJSON
             * @memberof code_repositories.tag.Tag
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Tag.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Tag
             * @function getTypeUrl
             * @memberof code_repositories.tag.Tag
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Tag.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/code_repositories.tag.Tag";
            };

            return Tag;
        })();

        tag.TagListResponse = (function() {

            /**
             * Properties of a TagListResponse.
             * @memberof code_repositories.tag
             * @interface ITagListResponse
             * @property {Array.<code_repositories.tag.ITag>|null} [tags] TagListResponse tags
             */

            /**
             * Constructs a new TagListResponse.
             * @memberof code_repositories.tag
             * @classdesc Represents a TagListResponse.
             * @implements ITagListResponse
             * @constructor
             * @param {code_repositories.tag.ITagListResponse=} [properties] Properties to set
             */
            function TagListResponse(properties) {
                this.tags = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * TagListResponse tags.
             * @member {Array.<code_repositories.tag.ITag>} tags
             * @memberof code_repositories.tag.TagListResponse
             * @instance
             */
            TagListResponse.prototype.tags = $util.emptyArray;

            /**
             * Creates a new TagListResponse instance using the specified properties.
             * @function create
             * @memberof code_repositories.tag.TagListResponse
             * @static
             * @param {code_repositories.tag.ITagListResponse=} [properties] Properties to set
             * @returns {code_repositories.tag.TagListResponse} TagListResponse instance
             */
            TagListResponse.create = function create(properties) {
                return new TagListResponse(properties);
            };

            /**
             * Encodes the specified TagListResponse message. Does not implicitly {@link code_repositories.tag.TagListResponse.verify|verify} messages.
             * @function encode
             * @memberof code_repositories.tag.TagListResponse
             * @static
             * @param {code_repositories.tag.ITagListResponse} message TagListResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TagListResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.tags != null && message.tags.length)
                    for (let i = 0; i < message.tags.length; ++i)
                        $root.code_repositories.tag.Tag.encode(message.tags[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified TagListResponse message, length delimited. Does not implicitly {@link code_repositories.tag.TagListResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof code_repositories.tag.TagListResponse
             * @static
             * @param {code_repositories.tag.ITagListResponse} message TagListResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TagListResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a TagListResponse message from the specified reader or buffer.
             * @function decode
             * @memberof code_repositories.tag.TagListResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {code_repositories.tag.TagListResponse} TagListResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TagListResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.code_repositories.tag.TagListResponse();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            if (!(message.tags && message.tags.length))
                                message.tags = [];
                            message.tags.push($root.code_repositories.tag.Tag.decode(reader, reader.uint32()));
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
             * Decodes a TagListResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof code_repositories.tag.TagListResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {code_repositories.tag.TagListResponse} TagListResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TagListResponse.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a TagListResponse message.
             * @function verify
             * @memberof code_repositories.tag.TagListResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            TagListResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.tags != null && message.hasOwnProperty("tags")) {
                    if (!Array.isArray(message.tags))
                        return "tags: array expected";
                    for (let i = 0; i < message.tags.length; ++i) {
                        let error = $root.code_repositories.tag.Tag.verify(message.tags[i]);
                        if (error)
                            return "tags." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a TagListResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof code_repositories.tag.TagListResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {code_repositories.tag.TagListResponse} TagListResponse
             */
            TagListResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.code_repositories.tag.TagListResponse)
                    return object;
                let message = new $root.code_repositories.tag.TagListResponse();
                if (object.tags) {
                    if (!Array.isArray(object.tags))
                        throw TypeError(".code_repositories.tag.TagListResponse.tags: array expected");
                    message.tags = [];
                    for (let i = 0; i < object.tags.length; ++i) {
                        if (typeof object.tags[i] !== "object")
                            throw TypeError(".code_repositories.tag.TagListResponse.tags: object expected");
                        message.tags[i] = $root.code_repositories.tag.Tag.fromObject(object.tags[i]);
                    }
                }
                return message;
            };

            /**
             * Creates a plain object from a TagListResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof code_repositories.tag.TagListResponse
             * @static
             * @param {code_repositories.tag.TagListResponse} message TagListResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            TagListResponse.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.arrays || options.defaults)
                    object.tags = [];
                if (message.tags && message.tags.length) {
                    object.tags = [];
                    for (let j = 0; j < message.tags.length; ++j)
                        object.tags[j] = $root.code_repositories.tag.Tag.toObject(message.tags[j], options);
                }
                return object;
            };

            /**
             * Converts this TagListResponse to JSON.
             * @function toJSON
             * @memberof code_repositories.tag.TagListResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            TagListResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for TagListResponse
             * @function getTypeUrl
             * @memberof code_repositories.tag.TagListResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            TagListResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/code_repositories.tag.TagListResponse";
            };

            return TagListResponse;
        })();

        tag.CreateTagRequest = (function() {

            /**
             * Properties of a CreateTagRequest.
             * @memberof code_repositories.tag
             * @interface ICreateTagRequest
             * @property {string|null} [name] CreateTagRequest name
             */

            /**
             * Constructs a new CreateTagRequest.
             * @memberof code_repositories.tag
             * @classdesc Represents a CreateTagRequest.
             * @implements ICreateTagRequest
             * @constructor
             * @param {code_repositories.tag.ICreateTagRequest=} [properties] Properties to set
             */
            function CreateTagRequest(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * CreateTagRequest name.
             * @member {string} name
             * @memberof code_repositories.tag.CreateTagRequest
             * @instance
             */
            CreateTagRequest.prototype.name = "";

            /**
             * Creates a new CreateTagRequest instance using the specified properties.
             * @function create
             * @memberof code_repositories.tag.CreateTagRequest
             * @static
             * @param {code_repositories.tag.ICreateTagRequest=} [properties] Properties to set
             * @returns {code_repositories.tag.CreateTagRequest} CreateTagRequest instance
             */
            CreateTagRequest.create = function create(properties) {
                return new CreateTagRequest(properties);
            };

            /**
             * Encodes the specified CreateTagRequest message. Does not implicitly {@link code_repositories.tag.CreateTagRequest.verify|verify} messages.
             * @function encode
             * @memberof code_repositories.tag.CreateTagRequest
             * @static
             * @param {code_repositories.tag.ICreateTagRequest} message CreateTagRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CreateTagRequest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
                return writer;
            };

            /**
             * Encodes the specified CreateTagRequest message, length delimited. Does not implicitly {@link code_repositories.tag.CreateTagRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof code_repositories.tag.CreateTagRequest
             * @static
             * @param {code_repositories.tag.ICreateTagRequest} message CreateTagRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CreateTagRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a CreateTagRequest message from the specified reader or buffer.
             * @function decode
             * @memberof code_repositories.tag.CreateTagRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {code_repositories.tag.CreateTagRequest} CreateTagRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CreateTagRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.code_repositories.tag.CreateTagRequest();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.name = reader.string();
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
             * Decodes a CreateTagRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof code_repositories.tag.CreateTagRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {code_repositories.tag.CreateTagRequest} CreateTagRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CreateTagRequest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a CreateTagRequest message.
             * @function verify
             * @memberof code_repositories.tag.CreateTagRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            CreateTagRequest.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.name != null && message.hasOwnProperty("name"))
                    if (!$util.isString(message.name))
                        return "name: string expected";
                return null;
            };

            /**
             * Creates a CreateTagRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof code_repositories.tag.CreateTagRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {code_repositories.tag.CreateTagRequest} CreateTagRequest
             */
            CreateTagRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.code_repositories.tag.CreateTagRequest)
                    return object;
                let message = new $root.code_repositories.tag.CreateTagRequest();
                if (object.name != null)
                    message.name = String(object.name);
                return message;
            };

            /**
             * Creates a plain object from a CreateTagRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof code_repositories.tag.CreateTagRequest
             * @static
             * @param {code_repositories.tag.CreateTagRequest} message CreateTagRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            CreateTagRequest.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults)
                    object.name = "";
                if (message.name != null && message.hasOwnProperty("name"))
                    object.name = message.name;
                return object;
            };

            /**
             * Converts this CreateTagRequest to JSON.
             * @function toJSON
             * @memberof code_repositories.tag.CreateTagRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            CreateTagRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for CreateTagRequest
             * @function getTypeUrl
             * @memberof code_repositories.tag.CreateTagRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            CreateTagRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/code_repositories.tag.CreateTagRequest";
            };

            return CreateTagRequest;
        })();

        tag.CreateTagResponse = (function() {

            /**
             * Properties of a CreateTagResponse.
             * @memberof code_repositories.tag
             * @interface ICreateTagResponse
             * @property {code_repositories.tag.ITag|null} [tag] CreateTagResponse tag
             */

            /**
             * Constructs a new CreateTagResponse.
             * @memberof code_repositories.tag
             * @classdesc Represents a CreateTagResponse.
             * @implements ICreateTagResponse
             * @constructor
             * @param {code_repositories.tag.ICreateTagResponse=} [properties] Properties to set
             */
            function CreateTagResponse(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * CreateTagResponse tag.
             * @member {code_repositories.tag.ITag|null|undefined} tag
             * @memberof code_repositories.tag.CreateTagResponse
             * @instance
             */
            CreateTagResponse.prototype.tag = null;

            /**
             * Creates a new CreateTagResponse instance using the specified properties.
             * @function create
             * @memberof code_repositories.tag.CreateTagResponse
             * @static
             * @param {code_repositories.tag.ICreateTagResponse=} [properties] Properties to set
             * @returns {code_repositories.tag.CreateTagResponse} CreateTagResponse instance
             */
            CreateTagResponse.create = function create(properties) {
                return new CreateTagResponse(properties);
            };

            /**
             * Encodes the specified CreateTagResponse message. Does not implicitly {@link code_repositories.tag.CreateTagResponse.verify|verify} messages.
             * @function encode
             * @memberof code_repositories.tag.CreateTagResponse
             * @static
             * @param {code_repositories.tag.ICreateTagResponse} message CreateTagResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CreateTagResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.tag != null && Object.hasOwnProperty.call(message, "tag"))
                    $root.code_repositories.tag.Tag.encode(message.tag, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified CreateTagResponse message, length delimited. Does not implicitly {@link code_repositories.tag.CreateTagResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof code_repositories.tag.CreateTagResponse
             * @static
             * @param {code_repositories.tag.ICreateTagResponse} message CreateTagResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CreateTagResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a CreateTagResponse message from the specified reader or buffer.
             * @function decode
             * @memberof code_repositories.tag.CreateTagResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {code_repositories.tag.CreateTagResponse} CreateTagResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CreateTagResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.code_repositories.tag.CreateTagResponse();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.tag = $root.code_repositories.tag.Tag.decode(reader, reader.uint32());
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
             * Decodes a CreateTagResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof code_repositories.tag.CreateTagResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {code_repositories.tag.CreateTagResponse} CreateTagResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CreateTagResponse.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a CreateTagResponse message.
             * @function verify
             * @memberof code_repositories.tag.CreateTagResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            CreateTagResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.tag != null && message.hasOwnProperty("tag")) {
                    let error = $root.code_repositories.tag.Tag.verify(message.tag);
                    if (error)
                        return "tag." + error;
                }
                return null;
            };

            /**
             * Creates a CreateTagResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof code_repositories.tag.CreateTagResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {code_repositories.tag.CreateTagResponse} CreateTagResponse
             */
            CreateTagResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.code_repositories.tag.CreateTagResponse)
                    return object;
                let message = new $root.code_repositories.tag.CreateTagResponse();
                if (object.tag != null) {
                    if (typeof object.tag !== "object")
                        throw TypeError(".code_repositories.tag.CreateTagResponse.tag: object expected");
                    message.tag = $root.code_repositories.tag.Tag.fromObject(object.tag);
                }
                return message;
            };

            /**
             * Creates a plain object from a CreateTagResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof code_repositories.tag.CreateTagResponse
             * @static
             * @param {code_repositories.tag.CreateTagResponse} message CreateTagResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            CreateTagResponse.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults)
                    object.tag = null;
                if (message.tag != null && message.hasOwnProperty("tag"))
                    object.tag = $root.code_repositories.tag.Tag.toObject(message.tag, options);
                return object;
            };

            /**
             * Converts this CreateTagResponse to JSON.
             * @function toJSON
             * @memberof code_repositories.tag.CreateTagResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            CreateTagResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for CreateTagResponse
             * @function getTypeUrl
             * @memberof code_repositories.tag.CreateTagResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            CreateTagResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/code_repositories.tag.CreateTagResponse";
            };

            return CreateTagResponse;
        })();

        tag.UpdateTagRequest = (function() {

            /**
             * Properties of an UpdateTagRequest.
             * @memberof code_repositories.tag
             * @interface IUpdateTagRequest
             * @property {number|null} [id] UpdateTagRequest id
             * @property {string|null} [name] UpdateTagRequest name
             */

            /**
             * Constructs a new UpdateTagRequest.
             * @memberof code_repositories.tag
             * @classdesc Represents an UpdateTagRequest.
             * @implements IUpdateTagRequest
             * @constructor
             * @param {code_repositories.tag.IUpdateTagRequest=} [properties] Properties to set
             */
            function UpdateTagRequest(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * UpdateTagRequest id.
             * @member {number} id
             * @memberof code_repositories.tag.UpdateTagRequest
             * @instance
             */
            UpdateTagRequest.prototype.id = 0;

            /**
             * UpdateTagRequest name.
             * @member {string} name
             * @memberof code_repositories.tag.UpdateTagRequest
             * @instance
             */
            UpdateTagRequest.prototype.name = "";

            /**
             * Creates a new UpdateTagRequest instance using the specified properties.
             * @function create
             * @memberof code_repositories.tag.UpdateTagRequest
             * @static
             * @param {code_repositories.tag.IUpdateTagRequest=} [properties] Properties to set
             * @returns {code_repositories.tag.UpdateTagRequest} UpdateTagRequest instance
             */
            UpdateTagRequest.create = function create(properties) {
                return new UpdateTagRequest(properties);
            };

            /**
             * Encodes the specified UpdateTagRequest message. Does not implicitly {@link code_repositories.tag.UpdateTagRequest.verify|verify} messages.
             * @function encode
             * @memberof code_repositories.tag.UpdateTagRequest
             * @static
             * @param {code_repositories.tag.IUpdateTagRequest} message UpdateTagRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            UpdateTagRequest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.id);
                if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
                return writer;
            };

            /**
             * Encodes the specified UpdateTagRequest message, length delimited. Does not implicitly {@link code_repositories.tag.UpdateTagRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof code_repositories.tag.UpdateTagRequest
             * @static
             * @param {code_repositories.tag.IUpdateTagRequest} message UpdateTagRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            UpdateTagRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an UpdateTagRequest message from the specified reader or buffer.
             * @function decode
             * @memberof code_repositories.tag.UpdateTagRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {code_repositories.tag.UpdateTagRequest} UpdateTagRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            UpdateTagRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.code_repositories.tag.UpdateTagRequest();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.id = reader.int32();
                            break;
                        }
                    case 2: {
                            message.name = reader.string();
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
             * Decodes an UpdateTagRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof code_repositories.tag.UpdateTagRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {code_repositories.tag.UpdateTagRequest} UpdateTagRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            UpdateTagRequest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an UpdateTagRequest message.
             * @function verify
             * @memberof code_repositories.tag.UpdateTagRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            UpdateTagRequest.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.id != null && message.hasOwnProperty("id"))
                    if (!$util.isInteger(message.id))
                        return "id: integer expected";
                if (message.name != null && message.hasOwnProperty("name"))
                    if (!$util.isString(message.name))
                        return "name: string expected";
                return null;
            };

            /**
             * Creates an UpdateTagRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof code_repositories.tag.UpdateTagRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {code_repositories.tag.UpdateTagRequest} UpdateTagRequest
             */
            UpdateTagRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.code_repositories.tag.UpdateTagRequest)
                    return object;
                let message = new $root.code_repositories.tag.UpdateTagRequest();
                if (object.id != null)
                    message.id = object.id | 0;
                if (object.name != null)
                    message.name = String(object.name);
                return message;
            };

            /**
             * Creates a plain object from an UpdateTagRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof code_repositories.tag.UpdateTagRequest
             * @static
             * @param {code_repositories.tag.UpdateTagRequest} message UpdateTagRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            UpdateTagRequest.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.id = 0;
                    object.name = "";
                }
                if (message.id != null && message.hasOwnProperty("id"))
                    object.id = message.id;
                if (message.name != null && message.hasOwnProperty("name"))
                    object.name = message.name;
                return object;
            };

            /**
             * Converts this UpdateTagRequest to JSON.
             * @function toJSON
             * @memberof code_repositories.tag.UpdateTagRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            UpdateTagRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for UpdateTagRequest
             * @function getTypeUrl
             * @memberof code_repositories.tag.UpdateTagRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            UpdateTagRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/code_repositories.tag.UpdateTagRequest";
            };

            return UpdateTagRequest;
        })();

        tag.UpdateTagResponse = (function() {

            /**
             * Properties of an UpdateTagResponse.
             * @memberof code_repositories.tag
             * @interface IUpdateTagResponse
             * @property {code_repositories.tag.ITag|null} [tag] UpdateTagResponse tag
             */

            /**
             * Constructs a new UpdateTagResponse.
             * @memberof code_repositories.tag
             * @classdesc Represents an UpdateTagResponse.
             * @implements IUpdateTagResponse
             * @constructor
             * @param {code_repositories.tag.IUpdateTagResponse=} [properties] Properties to set
             */
            function UpdateTagResponse(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * UpdateTagResponse tag.
             * @member {code_repositories.tag.ITag|null|undefined} tag
             * @memberof code_repositories.tag.UpdateTagResponse
             * @instance
             */
            UpdateTagResponse.prototype.tag = null;

            /**
             * Creates a new UpdateTagResponse instance using the specified properties.
             * @function create
             * @memberof code_repositories.tag.UpdateTagResponse
             * @static
             * @param {code_repositories.tag.IUpdateTagResponse=} [properties] Properties to set
             * @returns {code_repositories.tag.UpdateTagResponse} UpdateTagResponse instance
             */
            UpdateTagResponse.create = function create(properties) {
                return new UpdateTagResponse(properties);
            };

            /**
             * Encodes the specified UpdateTagResponse message. Does not implicitly {@link code_repositories.tag.UpdateTagResponse.verify|verify} messages.
             * @function encode
             * @memberof code_repositories.tag.UpdateTagResponse
             * @static
             * @param {code_repositories.tag.IUpdateTagResponse} message UpdateTagResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            UpdateTagResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.tag != null && Object.hasOwnProperty.call(message, "tag"))
                    $root.code_repositories.tag.Tag.encode(message.tag, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified UpdateTagResponse message, length delimited. Does not implicitly {@link code_repositories.tag.UpdateTagResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof code_repositories.tag.UpdateTagResponse
             * @static
             * @param {code_repositories.tag.IUpdateTagResponse} message UpdateTagResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            UpdateTagResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an UpdateTagResponse message from the specified reader or buffer.
             * @function decode
             * @memberof code_repositories.tag.UpdateTagResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {code_repositories.tag.UpdateTagResponse} UpdateTagResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            UpdateTagResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.code_repositories.tag.UpdateTagResponse();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.tag = $root.code_repositories.tag.Tag.decode(reader, reader.uint32());
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
             * Decodes an UpdateTagResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof code_repositories.tag.UpdateTagResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {code_repositories.tag.UpdateTagResponse} UpdateTagResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            UpdateTagResponse.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an UpdateTagResponse message.
             * @function verify
             * @memberof code_repositories.tag.UpdateTagResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            UpdateTagResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.tag != null && message.hasOwnProperty("tag")) {
                    let error = $root.code_repositories.tag.Tag.verify(message.tag);
                    if (error)
                        return "tag." + error;
                }
                return null;
            };

            /**
             * Creates an UpdateTagResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof code_repositories.tag.UpdateTagResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {code_repositories.tag.UpdateTagResponse} UpdateTagResponse
             */
            UpdateTagResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.code_repositories.tag.UpdateTagResponse)
                    return object;
                let message = new $root.code_repositories.tag.UpdateTagResponse();
                if (object.tag != null) {
                    if (typeof object.tag !== "object")
                        throw TypeError(".code_repositories.tag.UpdateTagResponse.tag: object expected");
                    message.tag = $root.code_repositories.tag.Tag.fromObject(object.tag);
                }
                return message;
            };

            /**
             * Creates a plain object from an UpdateTagResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof code_repositories.tag.UpdateTagResponse
             * @static
             * @param {code_repositories.tag.UpdateTagResponse} message UpdateTagResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            UpdateTagResponse.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults)
                    object.tag = null;
                if (message.tag != null && message.hasOwnProperty("tag"))
                    object.tag = $root.code_repositories.tag.Tag.toObject(message.tag, options);
                return object;
            };

            /**
             * Converts this UpdateTagResponse to JSON.
             * @function toJSON
             * @memberof code_repositories.tag.UpdateTagResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            UpdateTagResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for UpdateTagResponse
             * @function getTypeUrl
             * @memberof code_repositories.tag.UpdateTagResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            UpdateTagResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/code_repositories.tag.UpdateTagResponse";
            };

            return UpdateTagResponse;
        })();

        tag.GetTagRequest = (function() {

            /**
             * Properties of a GetTagRequest.
             * @memberof code_repositories.tag
             * @interface IGetTagRequest
             * @property {number|null} [id] GetTagRequest id
             */

            /**
             * Constructs a new GetTagRequest.
             * @memberof code_repositories.tag
             * @classdesc Represents a GetTagRequest.
             * @implements IGetTagRequest
             * @constructor
             * @param {code_repositories.tag.IGetTagRequest=} [properties] Properties to set
             */
            function GetTagRequest(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * GetTagRequest id.
             * @member {number} id
             * @memberof code_repositories.tag.GetTagRequest
             * @instance
             */
            GetTagRequest.prototype.id = 0;

            /**
             * Creates a new GetTagRequest instance using the specified properties.
             * @function create
             * @memberof code_repositories.tag.GetTagRequest
             * @static
             * @param {code_repositories.tag.IGetTagRequest=} [properties] Properties to set
             * @returns {code_repositories.tag.GetTagRequest} GetTagRequest instance
             */
            GetTagRequest.create = function create(properties) {
                return new GetTagRequest(properties);
            };

            /**
             * Encodes the specified GetTagRequest message. Does not implicitly {@link code_repositories.tag.GetTagRequest.verify|verify} messages.
             * @function encode
             * @memberof code_repositories.tag.GetTagRequest
             * @static
             * @param {code_repositories.tag.IGetTagRequest} message GetTagRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            GetTagRequest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.id);
                return writer;
            };

            /**
             * Encodes the specified GetTagRequest message, length delimited. Does not implicitly {@link code_repositories.tag.GetTagRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof code_repositories.tag.GetTagRequest
             * @static
             * @param {code_repositories.tag.IGetTagRequest} message GetTagRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            GetTagRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a GetTagRequest message from the specified reader or buffer.
             * @function decode
             * @memberof code_repositories.tag.GetTagRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {code_repositories.tag.GetTagRequest} GetTagRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            GetTagRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.code_repositories.tag.GetTagRequest();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.id = reader.int32();
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
             * Decodes a GetTagRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof code_repositories.tag.GetTagRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {code_repositories.tag.GetTagRequest} GetTagRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            GetTagRequest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a GetTagRequest message.
             * @function verify
             * @memberof code_repositories.tag.GetTagRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            GetTagRequest.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.id != null && message.hasOwnProperty("id"))
                    if (!$util.isInteger(message.id))
                        return "id: integer expected";
                return null;
            };

            /**
             * Creates a GetTagRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof code_repositories.tag.GetTagRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {code_repositories.tag.GetTagRequest} GetTagRequest
             */
            GetTagRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.code_repositories.tag.GetTagRequest)
                    return object;
                let message = new $root.code_repositories.tag.GetTagRequest();
                if (object.id != null)
                    message.id = object.id | 0;
                return message;
            };

            /**
             * Creates a plain object from a GetTagRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof code_repositories.tag.GetTagRequest
             * @static
             * @param {code_repositories.tag.GetTagRequest} message GetTagRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            GetTagRequest.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults)
                    object.id = 0;
                if (message.id != null && message.hasOwnProperty("id"))
                    object.id = message.id;
                return object;
            };

            /**
             * Converts this GetTagRequest to JSON.
             * @function toJSON
             * @memberof code_repositories.tag.GetTagRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            GetTagRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for GetTagRequest
             * @function getTypeUrl
             * @memberof code_repositories.tag.GetTagRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            GetTagRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/code_repositories.tag.GetTagRequest";
            };

            return GetTagRequest;
        })();

        tag.GetTagResponse = (function() {

            /**
             * Properties of a GetTagResponse.
             * @memberof code_repositories.tag
             * @interface IGetTagResponse
             * @property {code_repositories.tag.ITag|null} [tag] GetTagResponse tag
             */

            /**
             * Constructs a new GetTagResponse.
             * @memberof code_repositories.tag
             * @classdesc Represents a GetTagResponse.
             * @implements IGetTagResponse
             * @constructor
             * @param {code_repositories.tag.IGetTagResponse=} [properties] Properties to set
             */
            function GetTagResponse(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * GetTagResponse tag.
             * @member {code_repositories.tag.ITag|null|undefined} tag
             * @memberof code_repositories.tag.GetTagResponse
             * @instance
             */
            GetTagResponse.prototype.tag = null;

            /**
             * Creates a new GetTagResponse instance using the specified properties.
             * @function create
             * @memberof code_repositories.tag.GetTagResponse
             * @static
             * @param {code_repositories.tag.IGetTagResponse=} [properties] Properties to set
             * @returns {code_repositories.tag.GetTagResponse} GetTagResponse instance
             */
            GetTagResponse.create = function create(properties) {
                return new GetTagResponse(properties);
            };

            /**
             * Encodes the specified GetTagResponse message. Does not implicitly {@link code_repositories.tag.GetTagResponse.verify|verify} messages.
             * @function encode
             * @memberof code_repositories.tag.GetTagResponse
             * @static
             * @param {code_repositories.tag.IGetTagResponse} message GetTagResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            GetTagResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.tag != null && Object.hasOwnProperty.call(message, "tag"))
                    $root.code_repositories.tag.Tag.encode(message.tag, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified GetTagResponse message, length delimited. Does not implicitly {@link code_repositories.tag.GetTagResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof code_repositories.tag.GetTagResponse
             * @static
             * @param {code_repositories.tag.IGetTagResponse} message GetTagResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            GetTagResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a GetTagResponse message from the specified reader or buffer.
             * @function decode
             * @memberof code_repositories.tag.GetTagResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {code_repositories.tag.GetTagResponse} GetTagResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            GetTagResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.code_repositories.tag.GetTagResponse();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.tag = $root.code_repositories.tag.Tag.decode(reader, reader.uint32());
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
             * Decodes a GetTagResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof code_repositories.tag.GetTagResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {code_repositories.tag.GetTagResponse} GetTagResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            GetTagResponse.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a GetTagResponse message.
             * @function verify
             * @memberof code_repositories.tag.GetTagResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            GetTagResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.tag != null && message.hasOwnProperty("tag")) {
                    let error = $root.code_repositories.tag.Tag.verify(message.tag);
                    if (error)
                        return "tag." + error;
                }
                return null;
            };

            /**
             * Creates a GetTagResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof code_repositories.tag.GetTagResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {code_repositories.tag.GetTagResponse} GetTagResponse
             */
            GetTagResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.code_repositories.tag.GetTagResponse)
                    return object;
                let message = new $root.code_repositories.tag.GetTagResponse();
                if (object.tag != null) {
                    if (typeof object.tag !== "object")
                        throw TypeError(".code_repositories.tag.GetTagResponse.tag: object expected");
                    message.tag = $root.code_repositories.tag.Tag.fromObject(object.tag);
                }
                return message;
            };

            /**
             * Creates a plain object from a GetTagResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof code_repositories.tag.GetTagResponse
             * @static
             * @param {code_repositories.tag.GetTagResponse} message GetTagResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            GetTagResponse.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults)
                    object.tag = null;
                if (message.tag != null && message.hasOwnProperty("tag"))
                    object.tag = $root.code_repositories.tag.Tag.toObject(message.tag, options);
                return object;
            };

            /**
             * Converts this GetTagResponse to JSON.
             * @function toJSON
             * @memberof code_repositories.tag.GetTagResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            GetTagResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for GetTagResponse
             * @function getTypeUrl
             * @memberof code_repositories.tag.GetTagResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            GetTagResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/code_repositories.tag.GetTagResponse";
            };

            return GetTagResponse;
        })();

        tag.DeleteTagRequest = (function() {

            /**
             * Properties of a DeleteTagRequest.
             * @memberof code_repositories.tag
             * @interface IDeleteTagRequest
             * @property {number|null} [id] DeleteTagRequest id
             */

            /**
             * Constructs a new DeleteTagRequest.
             * @memberof code_repositories.tag
             * @classdesc Represents a DeleteTagRequest.
             * @implements IDeleteTagRequest
             * @constructor
             * @param {code_repositories.tag.IDeleteTagRequest=} [properties] Properties to set
             */
            function DeleteTagRequest(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * DeleteTagRequest id.
             * @member {number} id
             * @memberof code_repositories.tag.DeleteTagRequest
             * @instance
             */
            DeleteTagRequest.prototype.id = 0;

            /**
             * Creates a new DeleteTagRequest instance using the specified properties.
             * @function create
             * @memberof code_repositories.tag.DeleteTagRequest
             * @static
             * @param {code_repositories.tag.IDeleteTagRequest=} [properties] Properties to set
             * @returns {code_repositories.tag.DeleteTagRequest} DeleteTagRequest instance
             */
            DeleteTagRequest.create = function create(properties) {
                return new DeleteTagRequest(properties);
            };

            /**
             * Encodes the specified DeleteTagRequest message. Does not implicitly {@link code_repositories.tag.DeleteTagRequest.verify|verify} messages.
             * @function encode
             * @memberof code_repositories.tag.DeleteTagRequest
             * @static
             * @param {code_repositories.tag.IDeleteTagRequest} message DeleteTagRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DeleteTagRequest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.id);
                return writer;
            };

            /**
             * Encodes the specified DeleteTagRequest message, length delimited. Does not implicitly {@link code_repositories.tag.DeleteTagRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof code_repositories.tag.DeleteTagRequest
             * @static
             * @param {code_repositories.tag.IDeleteTagRequest} message DeleteTagRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DeleteTagRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a DeleteTagRequest message from the specified reader or buffer.
             * @function decode
             * @memberof code_repositories.tag.DeleteTagRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {code_repositories.tag.DeleteTagRequest} DeleteTagRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DeleteTagRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.code_repositories.tag.DeleteTagRequest();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.id = reader.int32();
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
             * Decodes a DeleteTagRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof code_repositories.tag.DeleteTagRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {code_repositories.tag.DeleteTagRequest} DeleteTagRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DeleteTagRequest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a DeleteTagRequest message.
             * @function verify
             * @memberof code_repositories.tag.DeleteTagRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            DeleteTagRequest.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.id != null && message.hasOwnProperty("id"))
                    if (!$util.isInteger(message.id))
                        return "id: integer expected";
                return null;
            };

            /**
             * Creates a DeleteTagRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof code_repositories.tag.DeleteTagRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {code_repositories.tag.DeleteTagRequest} DeleteTagRequest
             */
            DeleteTagRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.code_repositories.tag.DeleteTagRequest)
                    return object;
                let message = new $root.code_repositories.tag.DeleteTagRequest();
                if (object.id != null)
                    message.id = object.id | 0;
                return message;
            };

            /**
             * Creates a plain object from a DeleteTagRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof code_repositories.tag.DeleteTagRequest
             * @static
             * @param {code_repositories.tag.DeleteTagRequest} message DeleteTagRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            DeleteTagRequest.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults)
                    object.id = 0;
                if (message.id != null && message.hasOwnProperty("id"))
                    object.id = message.id;
                return object;
            };

            /**
             * Converts this DeleteTagRequest to JSON.
             * @function toJSON
             * @memberof code_repositories.tag.DeleteTagRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            DeleteTagRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for DeleteTagRequest
             * @function getTypeUrl
             * @memberof code_repositories.tag.DeleteTagRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            DeleteTagRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/code_repositories.tag.DeleteTagRequest";
            };

            return DeleteTagRequest;
        })();

        tag.DeleteTagResponse = (function() {

            /**
             * Properties of a DeleteTagResponse.
             * @memberof code_repositories.tag
             * @interface IDeleteTagResponse
             * @property {boolean|null} [success] DeleteTagResponse success
             */

            /**
             * Constructs a new DeleteTagResponse.
             * @memberof code_repositories.tag
             * @classdesc Represents a DeleteTagResponse.
             * @implements IDeleteTagResponse
             * @constructor
             * @param {code_repositories.tag.IDeleteTagResponse=} [properties] Properties to set
             */
            function DeleteTagResponse(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * DeleteTagResponse success.
             * @member {boolean} success
             * @memberof code_repositories.tag.DeleteTagResponse
             * @instance
             */
            DeleteTagResponse.prototype.success = false;

            /**
             * Creates a new DeleteTagResponse instance using the specified properties.
             * @function create
             * @memberof code_repositories.tag.DeleteTagResponse
             * @static
             * @param {code_repositories.tag.IDeleteTagResponse=} [properties] Properties to set
             * @returns {code_repositories.tag.DeleteTagResponse} DeleteTagResponse instance
             */
            DeleteTagResponse.create = function create(properties) {
                return new DeleteTagResponse(properties);
            };

            /**
             * Encodes the specified DeleteTagResponse message. Does not implicitly {@link code_repositories.tag.DeleteTagResponse.verify|verify} messages.
             * @function encode
             * @memberof code_repositories.tag.DeleteTagResponse
             * @static
             * @param {code_repositories.tag.IDeleteTagResponse} message DeleteTagResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DeleteTagResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.success != null && Object.hasOwnProperty.call(message, "success"))
                    writer.uint32(/* id 1, wireType 0 =*/8).bool(message.success);
                return writer;
            };

            /**
             * Encodes the specified DeleteTagResponse message, length delimited. Does not implicitly {@link code_repositories.tag.DeleteTagResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof code_repositories.tag.DeleteTagResponse
             * @static
             * @param {code_repositories.tag.IDeleteTagResponse} message DeleteTagResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DeleteTagResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a DeleteTagResponse message from the specified reader or buffer.
             * @function decode
             * @memberof code_repositories.tag.DeleteTagResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {code_repositories.tag.DeleteTagResponse} DeleteTagResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DeleteTagResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.code_repositories.tag.DeleteTagResponse();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.success = reader.bool();
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
             * Decodes a DeleteTagResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof code_repositories.tag.DeleteTagResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {code_repositories.tag.DeleteTagResponse} DeleteTagResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DeleteTagResponse.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a DeleteTagResponse message.
             * @function verify
             * @memberof code_repositories.tag.DeleteTagResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            DeleteTagResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.success != null && message.hasOwnProperty("success"))
                    if (typeof message.success !== "boolean")
                        return "success: boolean expected";
                return null;
            };

            /**
             * Creates a DeleteTagResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof code_repositories.tag.DeleteTagResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {code_repositories.tag.DeleteTagResponse} DeleteTagResponse
             */
            DeleteTagResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.code_repositories.tag.DeleteTagResponse)
                    return object;
                let message = new $root.code_repositories.tag.DeleteTagResponse();
                if (object.success != null)
                    message.success = Boolean(object.success);
                return message;
            };

            /**
             * Creates a plain object from a DeleteTagResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof code_repositories.tag.DeleteTagResponse
             * @static
             * @param {code_repositories.tag.DeleteTagResponse} message DeleteTagResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            DeleteTagResponse.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults)
                    object.success = false;
                if (message.success != null && message.hasOwnProperty("success"))
                    object.success = message.success;
                return object;
            };

            /**
             * Converts this DeleteTagResponse to JSON.
             * @function toJSON
             * @memberof code_repositories.tag.DeleteTagResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            DeleteTagResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for DeleteTagResponse
             * @function getTypeUrl
             * @memberof code_repositories.tag.DeleteTagResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            DeleteTagResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/code_repositories.tag.DeleteTagResponse";
            };

            return DeleteTagResponse;
        })();

        return tag;
    })();

    code_repositories.metadata = (function() {

        /**
         * Namespace metadata.
         * @memberof code_repositories
         * @namespace
         */
        const metadata = {};

        metadata.Metadata = (function() {

            /**
             * Properties of a Metadata.
             * @memberof code_repositories.metadata
             * @interface IMetadata
             * @property {number|null} [id] Metadata id
             * @property {string|null} [name] Metadata name
             * @property {string|null} [contentType] Metadata contentType
             * @property {string|null} [sourceUrl] Metadata sourceUrl
             * @property {string|null} [sourceHashId] Metadata sourceHashId
             * @property {Array.<string>|null} [labels] Metadata labels
             * @property {string|null} [repositoryId] Metadata repositoryId
             * @property {code_repositories.common.ITimestamp|null} [createdAt] Metadata createdAt
             * @property {code_repositories.common.ITimestamp|null} [updatedAt] Metadata updatedAt
             */

            /**
             * Constructs a new Metadata.
             * @memberof code_repositories.metadata
             * @classdesc Represents a Metadata.
             * @implements IMetadata
             * @constructor
             * @param {code_repositories.metadata.IMetadata=} [properties] Properties to set
             */
            function Metadata(properties) {
                this.labels = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Metadata id.
             * @member {number} id
             * @memberof code_repositories.metadata.Metadata
             * @instance
             */
            Metadata.prototype.id = 0;

            /**
             * Metadata name.
             * @member {string} name
             * @memberof code_repositories.metadata.Metadata
             * @instance
             */
            Metadata.prototype.name = "";

            /**
             * Metadata contentType.
             * @member {string} contentType
             * @memberof code_repositories.metadata.Metadata
             * @instance
             */
            Metadata.prototype.contentType = "";

            /**
             * Metadata sourceUrl.
             * @member {string} sourceUrl
             * @memberof code_repositories.metadata.Metadata
             * @instance
             */
            Metadata.prototype.sourceUrl = "";

            /**
             * Metadata sourceHashId.
             * @member {string} sourceHashId
             * @memberof code_repositories.metadata.Metadata
             * @instance
             */
            Metadata.prototype.sourceHashId = "";

            /**
             * Metadata labels.
             * @member {Array.<string>} labels
             * @memberof code_repositories.metadata.Metadata
             * @instance
             */
            Metadata.prototype.labels = $util.emptyArray;

            /**
             * Metadata repositoryId.
             * @member {string} repositoryId
             * @memberof code_repositories.metadata.Metadata
             * @instance
             */
            Metadata.prototype.repositoryId = "";

            /**
             * Metadata createdAt.
             * @member {code_repositories.common.ITimestamp|null|undefined} createdAt
             * @memberof code_repositories.metadata.Metadata
             * @instance
             */
            Metadata.prototype.createdAt = null;

            /**
             * Metadata updatedAt.
             * @member {code_repositories.common.ITimestamp|null|undefined} updatedAt
             * @memberof code_repositories.metadata.Metadata
             * @instance
             */
            Metadata.prototype.updatedAt = null;

            /**
             * Creates a new Metadata instance using the specified properties.
             * @function create
             * @memberof code_repositories.metadata.Metadata
             * @static
             * @param {code_repositories.metadata.IMetadata=} [properties] Properties to set
             * @returns {code_repositories.metadata.Metadata} Metadata instance
             */
            Metadata.create = function create(properties) {
                return new Metadata(properties);
            };

            /**
             * Encodes the specified Metadata message. Does not implicitly {@link code_repositories.metadata.Metadata.verify|verify} messages.
             * @function encode
             * @memberof code_repositories.metadata.Metadata
             * @static
             * @param {code_repositories.metadata.IMetadata} message Metadata message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Metadata.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.id);
                if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
                if (message.contentType != null && Object.hasOwnProperty.call(message, "contentType"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.contentType);
                if (message.sourceUrl != null && Object.hasOwnProperty.call(message, "sourceUrl"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.sourceUrl);
                if (message.sourceHashId != null && Object.hasOwnProperty.call(message, "sourceHashId"))
                    writer.uint32(/* id 5, wireType 2 =*/42).string(message.sourceHashId);
                if (message.labels != null && message.labels.length)
                    for (let i = 0; i < message.labels.length; ++i)
                        writer.uint32(/* id 6, wireType 2 =*/50).string(message.labels[i]);
                if (message.repositoryId != null && Object.hasOwnProperty.call(message, "repositoryId"))
                    writer.uint32(/* id 7, wireType 2 =*/58).string(message.repositoryId);
                if (message.createdAt != null && Object.hasOwnProperty.call(message, "createdAt"))
                    $root.code_repositories.common.Timestamp.encode(message.createdAt, writer.uint32(/* id 8, wireType 2 =*/66).fork()).ldelim();
                if (message.updatedAt != null && Object.hasOwnProperty.call(message, "updatedAt"))
                    $root.code_repositories.common.Timestamp.encode(message.updatedAt, writer.uint32(/* id 9, wireType 2 =*/74).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified Metadata message, length delimited. Does not implicitly {@link code_repositories.metadata.Metadata.verify|verify} messages.
             * @function encodeDelimited
             * @memberof code_repositories.metadata.Metadata
             * @static
             * @param {code_repositories.metadata.IMetadata} message Metadata message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Metadata.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Metadata message from the specified reader or buffer.
             * @function decode
             * @memberof code_repositories.metadata.Metadata
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {code_repositories.metadata.Metadata} Metadata
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Metadata.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.code_repositories.metadata.Metadata();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.id = reader.int32();
                            break;
                        }
                    case 2: {
                            message.name = reader.string();
                            break;
                        }
                    case 3: {
                            message.contentType = reader.string();
                            break;
                        }
                    case 4: {
                            message.sourceUrl = reader.string();
                            break;
                        }
                    case 5: {
                            message.sourceHashId = reader.string();
                            break;
                        }
                    case 6: {
                            if (!(message.labels && message.labels.length))
                                message.labels = [];
                            message.labels.push(reader.string());
                            break;
                        }
                    case 7: {
                            message.repositoryId = reader.string();
                            break;
                        }
                    case 8: {
                            message.createdAt = $root.code_repositories.common.Timestamp.decode(reader, reader.uint32());
                            break;
                        }
                    case 9: {
                            message.updatedAt = $root.code_repositories.common.Timestamp.decode(reader, reader.uint32());
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
             * @memberof code_repositories.metadata.Metadata
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {code_repositories.metadata.Metadata} Metadata
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
             * @memberof code_repositories.metadata.Metadata
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Metadata.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.id != null && message.hasOwnProperty("id"))
                    if (!$util.isInteger(message.id))
                        return "id: integer expected";
                if (message.name != null && message.hasOwnProperty("name"))
                    if (!$util.isString(message.name))
                        return "name: string expected";
                if (message.contentType != null && message.hasOwnProperty("contentType"))
                    if (!$util.isString(message.contentType))
                        return "contentType: string expected";
                if (message.sourceUrl != null && message.hasOwnProperty("sourceUrl"))
                    if (!$util.isString(message.sourceUrl))
                        return "sourceUrl: string expected";
                if (message.sourceHashId != null && message.hasOwnProperty("sourceHashId"))
                    if (!$util.isString(message.sourceHashId))
                        return "sourceHashId: string expected";
                if (message.labels != null && message.hasOwnProperty("labels")) {
                    if (!Array.isArray(message.labels))
                        return "labels: array expected";
                    for (let i = 0; i < message.labels.length; ++i)
                        if (!$util.isString(message.labels[i]))
                            return "labels: string[] expected";
                }
                if (message.repositoryId != null && message.hasOwnProperty("repositoryId"))
                    if (!$util.isString(message.repositoryId))
                        return "repositoryId: string expected";
                if (message.createdAt != null && message.hasOwnProperty("createdAt")) {
                    let error = $root.code_repositories.common.Timestamp.verify(message.createdAt);
                    if (error)
                        return "createdAt." + error;
                }
                if (message.updatedAt != null && message.hasOwnProperty("updatedAt")) {
                    let error = $root.code_repositories.common.Timestamp.verify(message.updatedAt);
                    if (error)
                        return "updatedAt." + error;
                }
                return null;
            };

            /**
             * Creates a Metadata message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof code_repositories.metadata.Metadata
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {code_repositories.metadata.Metadata} Metadata
             */
            Metadata.fromObject = function fromObject(object) {
                if (object instanceof $root.code_repositories.metadata.Metadata)
                    return object;
                let message = new $root.code_repositories.metadata.Metadata();
                if (object.id != null)
                    message.id = object.id | 0;
                if (object.name != null)
                    message.name = String(object.name);
                if (object.contentType != null)
                    message.contentType = String(object.contentType);
                if (object.sourceUrl != null)
                    message.sourceUrl = String(object.sourceUrl);
                if (object.sourceHashId != null)
                    message.sourceHashId = String(object.sourceHashId);
                if (object.labels) {
                    if (!Array.isArray(object.labels))
                        throw TypeError(".code_repositories.metadata.Metadata.labels: array expected");
                    message.labels = [];
                    for (let i = 0; i < object.labels.length; ++i)
                        message.labels[i] = String(object.labels[i]);
                }
                if (object.repositoryId != null)
                    message.repositoryId = String(object.repositoryId);
                if (object.createdAt != null) {
                    if (typeof object.createdAt !== "object")
                        throw TypeError(".code_repositories.metadata.Metadata.createdAt: object expected");
                    message.createdAt = $root.code_repositories.common.Timestamp.fromObject(object.createdAt);
                }
                if (object.updatedAt != null) {
                    if (typeof object.updatedAt !== "object")
                        throw TypeError(".code_repositories.metadata.Metadata.updatedAt: object expected");
                    message.updatedAt = $root.code_repositories.common.Timestamp.fromObject(object.updatedAt);
                }
                return message;
            };

            /**
             * Creates a plain object from a Metadata message. Also converts values to other types if specified.
             * @function toObject
             * @memberof code_repositories.metadata.Metadata
             * @static
             * @param {code_repositories.metadata.Metadata} message Metadata
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Metadata.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.arrays || options.defaults)
                    object.labels = [];
                if (options.defaults) {
                    object.id = 0;
                    object.name = "";
                    object.contentType = "";
                    object.sourceUrl = "";
                    object.sourceHashId = "";
                    object.repositoryId = "";
                    object.createdAt = null;
                    object.updatedAt = null;
                }
                if (message.id != null && message.hasOwnProperty("id"))
                    object.id = message.id;
                if (message.name != null && message.hasOwnProperty("name"))
                    object.name = message.name;
                if (message.contentType != null && message.hasOwnProperty("contentType"))
                    object.contentType = message.contentType;
                if (message.sourceUrl != null && message.hasOwnProperty("sourceUrl"))
                    object.sourceUrl = message.sourceUrl;
                if (message.sourceHashId != null && message.hasOwnProperty("sourceHashId"))
                    object.sourceHashId = message.sourceHashId;
                if (message.labels && message.labels.length) {
                    object.labels = [];
                    for (let j = 0; j < message.labels.length; ++j)
                        object.labels[j] = message.labels[j];
                }
                if (message.repositoryId != null && message.hasOwnProperty("repositoryId"))
                    object.repositoryId = message.repositoryId;
                if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                    object.createdAt = $root.code_repositories.common.Timestamp.toObject(message.createdAt, options);
                if (message.updatedAt != null && message.hasOwnProperty("updatedAt"))
                    object.updatedAt = $root.code_repositories.common.Timestamp.toObject(message.updatedAt, options);
                return object;
            };

            /**
             * Converts this Metadata to JSON.
             * @function toJSON
             * @memberof code_repositories.metadata.Metadata
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Metadata.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Metadata
             * @function getTypeUrl
             * @memberof code_repositories.metadata.Metadata
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Metadata.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/code_repositories.metadata.Metadata";
            };

            return Metadata;
        })();

        metadata.MetadataListResponse = (function() {

            /**
             * Properties of a MetadataListResponse.
             * @memberof code_repositories.metadata
             * @interface IMetadataListResponse
             * @property {Array.<code_repositories.metadata.IMetadata>|null} [items] MetadataListResponse items
             */

            /**
             * Constructs a new MetadataListResponse.
             * @memberof code_repositories.metadata
             * @classdesc Represents a MetadataListResponse.
             * @implements IMetadataListResponse
             * @constructor
             * @param {code_repositories.metadata.IMetadataListResponse=} [properties] Properties to set
             */
            function MetadataListResponse(properties) {
                this.items = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * MetadataListResponse items.
             * @member {Array.<code_repositories.metadata.IMetadata>} items
             * @memberof code_repositories.metadata.MetadataListResponse
             * @instance
             */
            MetadataListResponse.prototype.items = $util.emptyArray;

            /**
             * Creates a new MetadataListResponse instance using the specified properties.
             * @function create
             * @memberof code_repositories.metadata.MetadataListResponse
             * @static
             * @param {code_repositories.metadata.IMetadataListResponse=} [properties] Properties to set
             * @returns {code_repositories.metadata.MetadataListResponse} MetadataListResponse instance
             */
            MetadataListResponse.create = function create(properties) {
                return new MetadataListResponse(properties);
            };

            /**
             * Encodes the specified MetadataListResponse message. Does not implicitly {@link code_repositories.metadata.MetadataListResponse.verify|verify} messages.
             * @function encode
             * @memberof code_repositories.metadata.MetadataListResponse
             * @static
             * @param {code_repositories.metadata.IMetadataListResponse} message MetadataListResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            MetadataListResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.items != null && message.items.length)
                    for (let i = 0; i < message.items.length; ++i)
                        $root.code_repositories.metadata.Metadata.encode(message.items[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified MetadataListResponse message, length delimited. Does not implicitly {@link code_repositories.metadata.MetadataListResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof code_repositories.metadata.MetadataListResponse
             * @static
             * @param {code_repositories.metadata.IMetadataListResponse} message MetadataListResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            MetadataListResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a MetadataListResponse message from the specified reader or buffer.
             * @function decode
             * @memberof code_repositories.metadata.MetadataListResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {code_repositories.metadata.MetadataListResponse} MetadataListResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            MetadataListResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.code_repositories.metadata.MetadataListResponse();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            if (!(message.items && message.items.length))
                                message.items = [];
                            message.items.push($root.code_repositories.metadata.Metadata.decode(reader, reader.uint32()));
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
             * Decodes a MetadataListResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof code_repositories.metadata.MetadataListResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {code_repositories.metadata.MetadataListResponse} MetadataListResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            MetadataListResponse.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a MetadataListResponse message.
             * @function verify
             * @memberof code_repositories.metadata.MetadataListResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            MetadataListResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.items != null && message.hasOwnProperty("items")) {
                    if (!Array.isArray(message.items))
                        return "items: array expected";
                    for (let i = 0; i < message.items.length; ++i) {
                        let error = $root.code_repositories.metadata.Metadata.verify(message.items[i]);
                        if (error)
                            return "items." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a MetadataListResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof code_repositories.metadata.MetadataListResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {code_repositories.metadata.MetadataListResponse} MetadataListResponse
             */
            MetadataListResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.code_repositories.metadata.MetadataListResponse)
                    return object;
                let message = new $root.code_repositories.metadata.MetadataListResponse();
                if (object.items) {
                    if (!Array.isArray(object.items))
                        throw TypeError(".code_repositories.metadata.MetadataListResponse.items: array expected");
                    message.items = [];
                    for (let i = 0; i < object.items.length; ++i) {
                        if (typeof object.items[i] !== "object")
                            throw TypeError(".code_repositories.metadata.MetadataListResponse.items: object expected");
                        message.items[i] = $root.code_repositories.metadata.Metadata.fromObject(object.items[i]);
                    }
                }
                return message;
            };

            /**
             * Creates a plain object from a MetadataListResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof code_repositories.metadata.MetadataListResponse
             * @static
             * @param {code_repositories.metadata.MetadataListResponse} message MetadataListResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            MetadataListResponse.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.arrays || options.defaults)
                    object.items = [];
                if (message.items && message.items.length) {
                    object.items = [];
                    for (let j = 0; j < message.items.length; ++j)
                        object.items[j] = $root.code_repositories.metadata.Metadata.toObject(message.items[j], options);
                }
                return object;
            };

            /**
             * Converts this MetadataListResponse to JSON.
             * @function toJSON
             * @memberof code_repositories.metadata.MetadataListResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            MetadataListResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for MetadataListResponse
             * @function getTypeUrl
             * @memberof code_repositories.metadata.MetadataListResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            MetadataListResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/code_repositories.metadata.MetadataListResponse";
            };

            return MetadataListResponse;
        })();

        metadata.CreateMetadataRequest = (function() {

            /**
             * Properties of a CreateMetadataRequest.
             * @memberof code_repositories.metadata
             * @interface ICreateMetadataRequest
             * @property {string|null} [name] CreateMetadataRequest name
             * @property {string|null} [contentType] CreateMetadataRequest contentType
             * @property {string|null} [sourceUrl] CreateMetadataRequest sourceUrl
             * @property {string|null} [sourceHashId] CreateMetadataRequest sourceHashId
             * @property {Array.<string>|null} [labels] CreateMetadataRequest labels
             * @property {string|null} [repositoryId] CreateMetadataRequest repositoryId
             */

            /**
             * Constructs a new CreateMetadataRequest.
             * @memberof code_repositories.metadata
             * @classdesc Represents a CreateMetadataRequest.
             * @implements ICreateMetadataRequest
             * @constructor
             * @param {code_repositories.metadata.ICreateMetadataRequest=} [properties] Properties to set
             */
            function CreateMetadataRequest(properties) {
                this.labels = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * CreateMetadataRequest name.
             * @member {string} name
             * @memberof code_repositories.metadata.CreateMetadataRequest
             * @instance
             */
            CreateMetadataRequest.prototype.name = "";

            /**
             * CreateMetadataRequest contentType.
             * @member {string} contentType
             * @memberof code_repositories.metadata.CreateMetadataRequest
             * @instance
             */
            CreateMetadataRequest.prototype.contentType = "";

            /**
             * CreateMetadataRequest sourceUrl.
             * @member {string} sourceUrl
             * @memberof code_repositories.metadata.CreateMetadataRequest
             * @instance
             */
            CreateMetadataRequest.prototype.sourceUrl = "";

            /**
             * CreateMetadataRequest sourceHashId.
             * @member {string} sourceHashId
             * @memberof code_repositories.metadata.CreateMetadataRequest
             * @instance
             */
            CreateMetadataRequest.prototype.sourceHashId = "";

            /**
             * CreateMetadataRequest labels.
             * @member {Array.<string>} labels
             * @memberof code_repositories.metadata.CreateMetadataRequest
             * @instance
             */
            CreateMetadataRequest.prototype.labels = $util.emptyArray;

            /**
             * CreateMetadataRequest repositoryId.
             * @member {string} repositoryId
             * @memberof code_repositories.metadata.CreateMetadataRequest
             * @instance
             */
            CreateMetadataRequest.prototype.repositoryId = "";

            /**
             * Creates a new CreateMetadataRequest instance using the specified properties.
             * @function create
             * @memberof code_repositories.metadata.CreateMetadataRequest
             * @static
             * @param {code_repositories.metadata.ICreateMetadataRequest=} [properties] Properties to set
             * @returns {code_repositories.metadata.CreateMetadataRequest} CreateMetadataRequest instance
             */
            CreateMetadataRequest.create = function create(properties) {
                return new CreateMetadataRequest(properties);
            };

            /**
             * Encodes the specified CreateMetadataRequest message. Does not implicitly {@link code_repositories.metadata.CreateMetadataRequest.verify|verify} messages.
             * @function encode
             * @memberof code_repositories.metadata.CreateMetadataRequest
             * @static
             * @param {code_repositories.metadata.ICreateMetadataRequest} message CreateMetadataRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CreateMetadataRequest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
                if (message.contentType != null && Object.hasOwnProperty.call(message, "contentType"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.contentType);
                if (message.sourceUrl != null && Object.hasOwnProperty.call(message, "sourceUrl"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.sourceUrl);
                if (message.sourceHashId != null && Object.hasOwnProperty.call(message, "sourceHashId"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.sourceHashId);
                if (message.labels != null && message.labels.length)
                    for (let i = 0; i < message.labels.length; ++i)
                        writer.uint32(/* id 5, wireType 2 =*/42).string(message.labels[i]);
                if (message.repositoryId != null && Object.hasOwnProperty.call(message, "repositoryId"))
                    writer.uint32(/* id 6, wireType 2 =*/50).string(message.repositoryId);
                return writer;
            };

            /**
             * Encodes the specified CreateMetadataRequest message, length delimited. Does not implicitly {@link code_repositories.metadata.CreateMetadataRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof code_repositories.metadata.CreateMetadataRequest
             * @static
             * @param {code_repositories.metadata.ICreateMetadataRequest} message CreateMetadataRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CreateMetadataRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a CreateMetadataRequest message from the specified reader or buffer.
             * @function decode
             * @memberof code_repositories.metadata.CreateMetadataRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {code_repositories.metadata.CreateMetadataRequest} CreateMetadataRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CreateMetadataRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.code_repositories.metadata.CreateMetadataRequest();
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
                            message.contentType = reader.string();
                            break;
                        }
                    case 3: {
                            message.sourceUrl = reader.string();
                            break;
                        }
                    case 4: {
                            message.sourceHashId = reader.string();
                            break;
                        }
                    case 5: {
                            if (!(message.labels && message.labels.length))
                                message.labels = [];
                            message.labels.push(reader.string());
                            break;
                        }
                    case 6: {
                            message.repositoryId = reader.string();
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
             * Decodes a CreateMetadataRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof code_repositories.metadata.CreateMetadataRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {code_repositories.metadata.CreateMetadataRequest} CreateMetadataRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CreateMetadataRequest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a CreateMetadataRequest message.
             * @function verify
             * @memberof code_repositories.metadata.CreateMetadataRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            CreateMetadataRequest.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.name != null && message.hasOwnProperty("name"))
                    if (!$util.isString(message.name))
                        return "name: string expected";
                if (message.contentType != null && message.hasOwnProperty("contentType"))
                    if (!$util.isString(message.contentType))
                        return "contentType: string expected";
                if (message.sourceUrl != null && message.hasOwnProperty("sourceUrl"))
                    if (!$util.isString(message.sourceUrl))
                        return "sourceUrl: string expected";
                if (message.sourceHashId != null && message.hasOwnProperty("sourceHashId"))
                    if (!$util.isString(message.sourceHashId))
                        return "sourceHashId: string expected";
                if (message.labels != null && message.hasOwnProperty("labels")) {
                    if (!Array.isArray(message.labels))
                        return "labels: array expected";
                    for (let i = 0; i < message.labels.length; ++i)
                        if (!$util.isString(message.labels[i]))
                            return "labels: string[] expected";
                }
                if (message.repositoryId != null && message.hasOwnProperty("repositoryId"))
                    if (!$util.isString(message.repositoryId))
                        return "repositoryId: string expected";
                return null;
            };

            /**
             * Creates a CreateMetadataRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof code_repositories.metadata.CreateMetadataRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {code_repositories.metadata.CreateMetadataRequest} CreateMetadataRequest
             */
            CreateMetadataRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.code_repositories.metadata.CreateMetadataRequest)
                    return object;
                let message = new $root.code_repositories.metadata.CreateMetadataRequest();
                if (object.name != null)
                    message.name = String(object.name);
                if (object.contentType != null)
                    message.contentType = String(object.contentType);
                if (object.sourceUrl != null)
                    message.sourceUrl = String(object.sourceUrl);
                if (object.sourceHashId != null)
                    message.sourceHashId = String(object.sourceHashId);
                if (object.labels) {
                    if (!Array.isArray(object.labels))
                        throw TypeError(".code_repositories.metadata.CreateMetadataRequest.labels: array expected");
                    message.labels = [];
                    for (let i = 0; i < object.labels.length; ++i)
                        message.labels[i] = String(object.labels[i]);
                }
                if (object.repositoryId != null)
                    message.repositoryId = String(object.repositoryId);
                return message;
            };

            /**
             * Creates a plain object from a CreateMetadataRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof code_repositories.metadata.CreateMetadataRequest
             * @static
             * @param {code_repositories.metadata.CreateMetadataRequest} message CreateMetadataRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            CreateMetadataRequest.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.arrays || options.defaults)
                    object.labels = [];
                if (options.defaults) {
                    object.name = "";
                    object.contentType = "";
                    object.sourceUrl = "";
                    object.sourceHashId = "";
                    object.repositoryId = "";
                }
                if (message.name != null && message.hasOwnProperty("name"))
                    object.name = message.name;
                if (message.contentType != null && message.hasOwnProperty("contentType"))
                    object.contentType = message.contentType;
                if (message.sourceUrl != null && message.hasOwnProperty("sourceUrl"))
                    object.sourceUrl = message.sourceUrl;
                if (message.sourceHashId != null && message.hasOwnProperty("sourceHashId"))
                    object.sourceHashId = message.sourceHashId;
                if (message.labels && message.labels.length) {
                    object.labels = [];
                    for (let j = 0; j < message.labels.length; ++j)
                        object.labels[j] = message.labels[j];
                }
                if (message.repositoryId != null && message.hasOwnProperty("repositoryId"))
                    object.repositoryId = message.repositoryId;
                return object;
            };

            /**
             * Converts this CreateMetadataRequest to JSON.
             * @function toJSON
             * @memberof code_repositories.metadata.CreateMetadataRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            CreateMetadataRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for CreateMetadataRequest
             * @function getTypeUrl
             * @memberof code_repositories.metadata.CreateMetadataRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            CreateMetadataRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/code_repositories.metadata.CreateMetadataRequest";
            };

            return CreateMetadataRequest;
        })();

        metadata.CreateMetadataResponse = (function() {

            /**
             * Properties of a CreateMetadataResponse.
             * @memberof code_repositories.metadata
             * @interface ICreateMetadataResponse
             * @property {code_repositories.metadata.IMetadata|null} [metadata] CreateMetadataResponse metadata
             */

            /**
             * Constructs a new CreateMetadataResponse.
             * @memberof code_repositories.metadata
             * @classdesc Represents a CreateMetadataResponse.
             * @implements ICreateMetadataResponse
             * @constructor
             * @param {code_repositories.metadata.ICreateMetadataResponse=} [properties] Properties to set
             */
            function CreateMetadataResponse(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * CreateMetadataResponse metadata.
             * @member {code_repositories.metadata.IMetadata|null|undefined} metadata
             * @memberof code_repositories.metadata.CreateMetadataResponse
             * @instance
             */
            CreateMetadataResponse.prototype.metadata = null;

            /**
             * Creates a new CreateMetadataResponse instance using the specified properties.
             * @function create
             * @memberof code_repositories.metadata.CreateMetadataResponse
             * @static
             * @param {code_repositories.metadata.ICreateMetadataResponse=} [properties] Properties to set
             * @returns {code_repositories.metadata.CreateMetadataResponse} CreateMetadataResponse instance
             */
            CreateMetadataResponse.create = function create(properties) {
                return new CreateMetadataResponse(properties);
            };

            /**
             * Encodes the specified CreateMetadataResponse message. Does not implicitly {@link code_repositories.metadata.CreateMetadataResponse.verify|verify} messages.
             * @function encode
             * @memberof code_repositories.metadata.CreateMetadataResponse
             * @static
             * @param {code_repositories.metadata.ICreateMetadataResponse} message CreateMetadataResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CreateMetadataResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.metadata != null && Object.hasOwnProperty.call(message, "metadata"))
                    $root.code_repositories.metadata.Metadata.encode(message.metadata, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified CreateMetadataResponse message, length delimited. Does not implicitly {@link code_repositories.metadata.CreateMetadataResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof code_repositories.metadata.CreateMetadataResponse
             * @static
             * @param {code_repositories.metadata.ICreateMetadataResponse} message CreateMetadataResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CreateMetadataResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a CreateMetadataResponse message from the specified reader or buffer.
             * @function decode
             * @memberof code_repositories.metadata.CreateMetadataResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {code_repositories.metadata.CreateMetadataResponse} CreateMetadataResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CreateMetadataResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.code_repositories.metadata.CreateMetadataResponse();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.metadata = $root.code_repositories.metadata.Metadata.decode(reader, reader.uint32());
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
             * Decodes a CreateMetadataResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof code_repositories.metadata.CreateMetadataResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {code_repositories.metadata.CreateMetadataResponse} CreateMetadataResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CreateMetadataResponse.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a CreateMetadataResponse message.
             * @function verify
             * @memberof code_repositories.metadata.CreateMetadataResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            CreateMetadataResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.metadata != null && message.hasOwnProperty("metadata")) {
                    let error = $root.code_repositories.metadata.Metadata.verify(message.metadata);
                    if (error)
                        return "metadata." + error;
                }
                return null;
            };

            /**
             * Creates a CreateMetadataResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof code_repositories.metadata.CreateMetadataResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {code_repositories.metadata.CreateMetadataResponse} CreateMetadataResponse
             */
            CreateMetadataResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.code_repositories.metadata.CreateMetadataResponse)
                    return object;
                let message = new $root.code_repositories.metadata.CreateMetadataResponse();
                if (object.metadata != null) {
                    if (typeof object.metadata !== "object")
                        throw TypeError(".code_repositories.metadata.CreateMetadataResponse.metadata: object expected");
                    message.metadata = $root.code_repositories.metadata.Metadata.fromObject(object.metadata);
                }
                return message;
            };

            /**
             * Creates a plain object from a CreateMetadataResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof code_repositories.metadata.CreateMetadataResponse
             * @static
             * @param {code_repositories.metadata.CreateMetadataResponse} message CreateMetadataResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            CreateMetadataResponse.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults)
                    object.metadata = null;
                if (message.metadata != null && message.hasOwnProperty("metadata"))
                    object.metadata = $root.code_repositories.metadata.Metadata.toObject(message.metadata, options);
                return object;
            };

            /**
             * Converts this CreateMetadataResponse to JSON.
             * @function toJSON
             * @memberof code_repositories.metadata.CreateMetadataResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            CreateMetadataResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for CreateMetadataResponse
             * @function getTypeUrl
             * @memberof code_repositories.metadata.CreateMetadataResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            CreateMetadataResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/code_repositories.metadata.CreateMetadataResponse";
            };

            return CreateMetadataResponse;
        })();

        metadata.UpdateMetadataRequest = (function() {

            /**
             * Properties of an UpdateMetadataRequest.
             * @memberof code_repositories.metadata
             * @interface IUpdateMetadataRequest
             * @property {number|null} [id] UpdateMetadataRequest id
             * @property {string|null} [name] UpdateMetadataRequest name
             * @property {string|null} [contentType] UpdateMetadataRequest contentType
             * @property {string|null} [sourceUrl] UpdateMetadataRequest sourceUrl
             * @property {string|null} [sourceHashId] UpdateMetadataRequest sourceHashId
             * @property {Array.<string>|null} [labels] UpdateMetadataRequest labels
             */

            /**
             * Constructs a new UpdateMetadataRequest.
             * @memberof code_repositories.metadata
             * @classdesc Represents an UpdateMetadataRequest.
             * @implements IUpdateMetadataRequest
             * @constructor
             * @param {code_repositories.metadata.IUpdateMetadataRequest=} [properties] Properties to set
             */
            function UpdateMetadataRequest(properties) {
                this.labels = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * UpdateMetadataRequest id.
             * @member {number} id
             * @memberof code_repositories.metadata.UpdateMetadataRequest
             * @instance
             */
            UpdateMetadataRequest.prototype.id = 0;

            /**
             * UpdateMetadataRequest name.
             * @member {string} name
             * @memberof code_repositories.metadata.UpdateMetadataRequest
             * @instance
             */
            UpdateMetadataRequest.prototype.name = "";

            /**
             * UpdateMetadataRequest contentType.
             * @member {string} contentType
             * @memberof code_repositories.metadata.UpdateMetadataRequest
             * @instance
             */
            UpdateMetadataRequest.prototype.contentType = "";

            /**
             * UpdateMetadataRequest sourceUrl.
             * @member {string} sourceUrl
             * @memberof code_repositories.metadata.UpdateMetadataRequest
             * @instance
             */
            UpdateMetadataRequest.prototype.sourceUrl = "";

            /**
             * UpdateMetadataRequest sourceHashId.
             * @member {string} sourceHashId
             * @memberof code_repositories.metadata.UpdateMetadataRequest
             * @instance
             */
            UpdateMetadataRequest.prototype.sourceHashId = "";

            /**
             * UpdateMetadataRequest labels.
             * @member {Array.<string>} labels
             * @memberof code_repositories.metadata.UpdateMetadataRequest
             * @instance
             */
            UpdateMetadataRequest.prototype.labels = $util.emptyArray;

            /**
             * Creates a new UpdateMetadataRequest instance using the specified properties.
             * @function create
             * @memberof code_repositories.metadata.UpdateMetadataRequest
             * @static
             * @param {code_repositories.metadata.IUpdateMetadataRequest=} [properties] Properties to set
             * @returns {code_repositories.metadata.UpdateMetadataRequest} UpdateMetadataRequest instance
             */
            UpdateMetadataRequest.create = function create(properties) {
                return new UpdateMetadataRequest(properties);
            };

            /**
             * Encodes the specified UpdateMetadataRequest message. Does not implicitly {@link code_repositories.metadata.UpdateMetadataRequest.verify|verify} messages.
             * @function encode
             * @memberof code_repositories.metadata.UpdateMetadataRequest
             * @static
             * @param {code_repositories.metadata.IUpdateMetadataRequest} message UpdateMetadataRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            UpdateMetadataRequest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.id);
                if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
                if (message.contentType != null && Object.hasOwnProperty.call(message, "contentType"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.contentType);
                if (message.sourceUrl != null && Object.hasOwnProperty.call(message, "sourceUrl"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.sourceUrl);
                if (message.sourceHashId != null && Object.hasOwnProperty.call(message, "sourceHashId"))
                    writer.uint32(/* id 5, wireType 2 =*/42).string(message.sourceHashId);
                if (message.labels != null && message.labels.length)
                    for (let i = 0; i < message.labels.length; ++i)
                        writer.uint32(/* id 6, wireType 2 =*/50).string(message.labels[i]);
                return writer;
            };

            /**
             * Encodes the specified UpdateMetadataRequest message, length delimited. Does not implicitly {@link code_repositories.metadata.UpdateMetadataRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof code_repositories.metadata.UpdateMetadataRequest
             * @static
             * @param {code_repositories.metadata.IUpdateMetadataRequest} message UpdateMetadataRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            UpdateMetadataRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an UpdateMetadataRequest message from the specified reader or buffer.
             * @function decode
             * @memberof code_repositories.metadata.UpdateMetadataRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {code_repositories.metadata.UpdateMetadataRequest} UpdateMetadataRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            UpdateMetadataRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.code_repositories.metadata.UpdateMetadataRequest();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.id = reader.int32();
                            break;
                        }
                    case 2: {
                            message.name = reader.string();
                            break;
                        }
                    case 3: {
                            message.contentType = reader.string();
                            break;
                        }
                    case 4: {
                            message.sourceUrl = reader.string();
                            break;
                        }
                    case 5: {
                            message.sourceHashId = reader.string();
                            break;
                        }
                    case 6: {
                            if (!(message.labels && message.labels.length))
                                message.labels = [];
                            message.labels.push(reader.string());
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
             * Decodes an UpdateMetadataRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof code_repositories.metadata.UpdateMetadataRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {code_repositories.metadata.UpdateMetadataRequest} UpdateMetadataRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            UpdateMetadataRequest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an UpdateMetadataRequest message.
             * @function verify
             * @memberof code_repositories.metadata.UpdateMetadataRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            UpdateMetadataRequest.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.id != null && message.hasOwnProperty("id"))
                    if (!$util.isInteger(message.id))
                        return "id: integer expected";
                if (message.name != null && message.hasOwnProperty("name"))
                    if (!$util.isString(message.name))
                        return "name: string expected";
                if (message.contentType != null && message.hasOwnProperty("contentType"))
                    if (!$util.isString(message.contentType))
                        return "contentType: string expected";
                if (message.sourceUrl != null && message.hasOwnProperty("sourceUrl"))
                    if (!$util.isString(message.sourceUrl))
                        return "sourceUrl: string expected";
                if (message.sourceHashId != null && message.hasOwnProperty("sourceHashId"))
                    if (!$util.isString(message.sourceHashId))
                        return "sourceHashId: string expected";
                if (message.labels != null && message.hasOwnProperty("labels")) {
                    if (!Array.isArray(message.labels))
                        return "labels: array expected";
                    for (let i = 0; i < message.labels.length; ++i)
                        if (!$util.isString(message.labels[i]))
                            return "labels: string[] expected";
                }
                return null;
            };

            /**
             * Creates an UpdateMetadataRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof code_repositories.metadata.UpdateMetadataRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {code_repositories.metadata.UpdateMetadataRequest} UpdateMetadataRequest
             */
            UpdateMetadataRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.code_repositories.metadata.UpdateMetadataRequest)
                    return object;
                let message = new $root.code_repositories.metadata.UpdateMetadataRequest();
                if (object.id != null)
                    message.id = object.id | 0;
                if (object.name != null)
                    message.name = String(object.name);
                if (object.contentType != null)
                    message.contentType = String(object.contentType);
                if (object.sourceUrl != null)
                    message.sourceUrl = String(object.sourceUrl);
                if (object.sourceHashId != null)
                    message.sourceHashId = String(object.sourceHashId);
                if (object.labels) {
                    if (!Array.isArray(object.labels))
                        throw TypeError(".code_repositories.metadata.UpdateMetadataRequest.labels: array expected");
                    message.labels = [];
                    for (let i = 0; i < object.labels.length; ++i)
                        message.labels[i] = String(object.labels[i]);
                }
                return message;
            };

            /**
             * Creates a plain object from an UpdateMetadataRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof code_repositories.metadata.UpdateMetadataRequest
             * @static
             * @param {code_repositories.metadata.UpdateMetadataRequest} message UpdateMetadataRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            UpdateMetadataRequest.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.arrays || options.defaults)
                    object.labels = [];
                if (options.defaults) {
                    object.id = 0;
                    object.name = "";
                    object.contentType = "";
                    object.sourceUrl = "";
                    object.sourceHashId = "";
                }
                if (message.id != null && message.hasOwnProperty("id"))
                    object.id = message.id;
                if (message.name != null && message.hasOwnProperty("name"))
                    object.name = message.name;
                if (message.contentType != null && message.hasOwnProperty("contentType"))
                    object.contentType = message.contentType;
                if (message.sourceUrl != null && message.hasOwnProperty("sourceUrl"))
                    object.sourceUrl = message.sourceUrl;
                if (message.sourceHashId != null && message.hasOwnProperty("sourceHashId"))
                    object.sourceHashId = message.sourceHashId;
                if (message.labels && message.labels.length) {
                    object.labels = [];
                    for (let j = 0; j < message.labels.length; ++j)
                        object.labels[j] = message.labels[j];
                }
                return object;
            };

            /**
             * Converts this UpdateMetadataRequest to JSON.
             * @function toJSON
             * @memberof code_repositories.metadata.UpdateMetadataRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            UpdateMetadataRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for UpdateMetadataRequest
             * @function getTypeUrl
             * @memberof code_repositories.metadata.UpdateMetadataRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            UpdateMetadataRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/code_repositories.metadata.UpdateMetadataRequest";
            };

            return UpdateMetadataRequest;
        })();

        metadata.UpdateMetadataResponse = (function() {

            /**
             * Properties of an UpdateMetadataResponse.
             * @memberof code_repositories.metadata
             * @interface IUpdateMetadataResponse
             * @property {code_repositories.metadata.IMetadata|null} [metadata] UpdateMetadataResponse metadata
             */

            /**
             * Constructs a new UpdateMetadataResponse.
             * @memberof code_repositories.metadata
             * @classdesc Represents an UpdateMetadataResponse.
             * @implements IUpdateMetadataResponse
             * @constructor
             * @param {code_repositories.metadata.IUpdateMetadataResponse=} [properties] Properties to set
             */
            function UpdateMetadataResponse(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * UpdateMetadataResponse metadata.
             * @member {code_repositories.metadata.IMetadata|null|undefined} metadata
             * @memberof code_repositories.metadata.UpdateMetadataResponse
             * @instance
             */
            UpdateMetadataResponse.prototype.metadata = null;

            /**
             * Creates a new UpdateMetadataResponse instance using the specified properties.
             * @function create
             * @memberof code_repositories.metadata.UpdateMetadataResponse
             * @static
             * @param {code_repositories.metadata.IUpdateMetadataResponse=} [properties] Properties to set
             * @returns {code_repositories.metadata.UpdateMetadataResponse} UpdateMetadataResponse instance
             */
            UpdateMetadataResponse.create = function create(properties) {
                return new UpdateMetadataResponse(properties);
            };

            /**
             * Encodes the specified UpdateMetadataResponse message. Does not implicitly {@link code_repositories.metadata.UpdateMetadataResponse.verify|verify} messages.
             * @function encode
             * @memberof code_repositories.metadata.UpdateMetadataResponse
             * @static
             * @param {code_repositories.metadata.IUpdateMetadataResponse} message UpdateMetadataResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            UpdateMetadataResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.metadata != null && Object.hasOwnProperty.call(message, "metadata"))
                    $root.code_repositories.metadata.Metadata.encode(message.metadata, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified UpdateMetadataResponse message, length delimited. Does not implicitly {@link code_repositories.metadata.UpdateMetadataResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof code_repositories.metadata.UpdateMetadataResponse
             * @static
             * @param {code_repositories.metadata.IUpdateMetadataResponse} message UpdateMetadataResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            UpdateMetadataResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an UpdateMetadataResponse message from the specified reader or buffer.
             * @function decode
             * @memberof code_repositories.metadata.UpdateMetadataResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {code_repositories.metadata.UpdateMetadataResponse} UpdateMetadataResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            UpdateMetadataResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.code_repositories.metadata.UpdateMetadataResponse();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.metadata = $root.code_repositories.metadata.Metadata.decode(reader, reader.uint32());
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
             * Decodes an UpdateMetadataResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof code_repositories.metadata.UpdateMetadataResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {code_repositories.metadata.UpdateMetadataResponse} UpdateMetadataResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            UpdateMetadataResponse.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an UpdateMetadataResponse message.
             * @function verify
             * @memberof code_repositories.metadata.UpdateMetadataResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            UpdateMetadataResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.metadata != null && message.hasOwnProperty("metadata")) {
                    let error = $root.code_repositories.metadata.Metadata.verify(message.metadata);
                    if (error)
                        return "metadata." + error;
                }
                return null;
            };

            /**
             * Creates an UpdateMetadataResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof code_repositories.metadata.UpdateMetadataResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {code_repositories.metadata.UpdateMetadataResponse} UpdateMetadataResponse
             */
            UpdateMetadataResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.code_repositories.metadata.UpdateMetadataResponse)
                    return object;
                let message = new $root.code_repositories.metadata.UpdateMetadataResponse();
                if (object.metadata != null) {
                    if (typeof object.metadata !== "object")
                        throw TypeError(".code_repositories.metadata.UpdateMetadataResponse.metadata: object expected");
                    message.metadata = $root.code_repositories.metadata.Metadata.fromObject(object.metadata);
                }
                return message;
            };

            /**
             * Creates a plain object from an UpdateMetadataResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof code_repositories.metadata.UpdateMetadataResponse
             * @static
             * @param {code_repositories.metadata.UpdateMetadataResponse} message UpdateMetadataResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            UpdateMetadataResponse.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults)
                    object.metadata = null;
                if (message.metadata != null && message.hasOwnProperty("metadata"))
                    object.metadata = $root.code_repositories.metadata.Metadata.toObject(message.metadata, options);
                return object;
            };

            /**
             * Converts this UpdateMetadataResponse to JSON.
             * @function toJSON
             * @memberof code_repositories.metadata.UpdateMetadataResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            UpdateMetadataResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for UpdateMetadataResponse
             * @function getTypeUrl
             * @memberof code_repositories.metadata.UpdateMetadataResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            UpdateMetadataResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/code_repositories.metadata.UpdateMetadataResponse";
            };

            return UpdateMetadataResponse;
        })();

        metadata.GetMetadataRequest = (function() {

            /**
             * Properties of a GetMetadataRequest.
             * @memberof code_repositories.metadata
             * @interface IGetMetadataRequest
             * @property {number|null} [id] GetMetadataRequest id
             */

            /**
             * Constructs a new GetMetadataRequest.
             * @memberof code_repositories.metadata
             * @classdesc Represents a GetMetadataRequest.
             * @implements IGetMetadataRequest
             * @constructor
             * @param {code_repositories.metadata.IGetMetadataRequest=} [properties] Properties to set
             */
            function GetMetadataRequest(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * GetMetadataRequest id.
             * @member {number} id
             * @memberof code_repositories.metadata.GetMetadataRequest
             * @instance
             */
            GetMetadataRequest.prototype.id = 0;

            /**
             * Creates a new GetMetadataRequest instance using the specified properties.
             * @function create
             * @memberof code_repositories.metadata.GetMetadataRequest
             * @static
             * @param {code_repositories.metadata.IGetMetadataRequest=} [properties] Properties to set
             * @returns {code_repositories.metadata.GetMetadataRequest} GetMetadataRequest instance
             */
            GetMetadataRequest.create = function create(properties) {
                return new GetMetadataRequest(properties);
            };

            /**
             * Encodes the specified GetMetadataRequest message. Does not implicitly {@link code_repositories.metadata.GetMetadataRequest.verify|verify} messages.
             * @function encode
             * @memberof code_repositories.metadata.GetMetadataRequest
             * @static
             * @param {code_repositories.metadata.IGetMetadataRequest} message GetMetadataRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            GetMetadataRequest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.id);
                return writer;
            };

            /**
             * Encodes the specified GetMetadataRequest message, length delimited. Does not implicitly {@link code_repositories.metadata.GetMetadataRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof code_repositories.metadata.GetMetadataRequest
             * @static
             * @param {code_repositories.metadata.IGetMetadataRequest} message GetMetadataRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            GetMetadataRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a GetMetadataRequest message from the specified reader or buffer.
             * @function decode
             * @memberof code_repositories.metadata.GetMetadataRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {code_repositories.metadata.GetMetadataRequest} GetMetadataRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            GetMetadataRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.code_repositories.metadata.GetMetadataRequest();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.id = reader.int32();
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
             * Decodes a GetMetadataRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof code_repositories.metadata.GetMetadataRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {code_repositories.metadata.GetMetadataRequest} GetMetadataRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            GetMetadataRequest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a GetMetadataRequest message.
             * @function verify
             * @memberof code_repositories.metadata.GetMetadataRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            GetMetadataRequest.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.id != null && message.hasOwnProperty("id"))
                    if (!$util.isInteger(message.id))
                        return "id: integer expected";
                return null;
            };

            /**
             * Creates a GetMetadataRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof code_repositories.metadata.GetMetadataRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {code_repositories.metadata.GetMetadataRequest} GetMetadataRequest
             */
            GetMetadataRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.code_repositories.metadata.GetMetadataRequest)
                    return object;
                let message = new $root.code_repositories.metadata.GetMetadataRequest();
                if (object.id != null)
                    message.id = object.id | 0;
                return message;
            };

            /**
             * Creates a plain object from a GetMetadataRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof code_repositories.metadata.GetMetadataRequest
             * @static
             * @param {code_repositories.metadata.GetMetadataRequest} message GetMetadataRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            GetMetadataRequest.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults)
                    object.id = 0;
                if (message.id != null && message.hasOwnProperty("id"))
                    object.id = message.id;
                return object;
            };

            /**
             * Converts this GetMetadataRequest to JSON.
             * @function toJSON
             * @memberof code_repositories.metadata.GetMetadataRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            GetMetadataRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for GetMetadataRequest
             * @function getTypeUrl
             * @memberof code_repositories.metadata.GetMetadataRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            GetMetadataRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/code_repositories.metadata.GetMetadataRequest";
            };

            return GetMetadataRequest;
        })();

        metadata.GetMetadataResponse = (function() {

            /**
             * Properties of a GetMetadataResponse.
             * @memberof code_repositories.metadata
             * @interface IGetMetadataResponse
             * @property {code_repositories.metadata.IMetadata|null} [metadata] GetMetadataResponse metadata
             */

            /**
             * Constructs a new GetMetadataResponse.
             * @memberof code_repositories.metadata
             * @classdesc Represents a GetMetadataResponse.
             * @implements IGetMetadataResponse
             * @constructor
             * @param {code_repositories.metadata.IGetMetadataResponse=} [properties] Properties to set
             */
            function GetMetadataResponse(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * GetMetadataResponse metadata.
             * @member {code_repositories.metadata.IMetadata|null|undefined} metadata
             * @memberof code_repositories.metadata.GetMetadataResponse
             * @instance
             */
            GetMetadataResponse.prototype.metadata = null;

            /**
             * Creates a new GetMetadataResponse instance using the specified properties.
             * @function create
             * @memberof code_repositories.metadata.GetMetadataResponse
             * @static
             * @param {code_repositories.metadata.IGetMetadataResponse=} [properties] Properties to set
             * @returns {code_repositories.metadata.GetMetadataResponse} GetMetadataResponse instance
             */
            GetMetadataResponse.create = function create(properties) {
                return new GetMetadataResponse(properties);
            };

            /**
             * Encodes the specified GetMetadataResponse message. Does not implicitly {@link code_repositories.metadata.GetMetadataResponse.verify|verify} messages.
             * @function encode
             * @memberof code_repositories.metadata.GetMetadataResponse
             * @static
             * @param {code_repositories.metadata.IGetMetadataResponse} message GetMetadataResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            GetMetadataResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.metadata != null && Object.hasOwnProperty.call(message, "metadata"))
                    $root.code_repositories.metadata.Metadata.encode(message.metadata, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified GetMetadataResponse message, length delimited. Does not implicitly {@link code_repositories.metadata.GetMetadataResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof code_repositories.metadata.GetMetadataResponse
             * @static
             * @param {code_repositories.metadata.IGetMetadataResponse} message GetMetadataResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            GetMetadataResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a GetMetadataResponse message from the specified reader or buffer.
             * @function decode
             * @memberof code_repositories.metadata.GetMetadataResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {code_repositories.metadata.GetMetadataResponse} GetMetadataResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            GetMetadataResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.code_repositories.metadata.GetMetadataResponse();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.metadata = $root.code_repositories.metadata.Metadata.decode(reader, reader.uint32());
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
             * Decodes a GetMetadataResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof code_repositories.metadata.GetMetadataResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {code_repositories.metadata.GetMetadataResponse} GetMetadataResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            GetMetadataResponse.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a GetMetadataResponse message.
             * @function verify
             * @memberof code_repositories.metadata.GetMetadataResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            GetMetadataResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.metadata != null && message.hasOwnProperty("metadata")) {
                    let error = $root.code_repositories.metadata.Metadata.verify(message.metadata);
                    if (error)
                        return "metadata." + error;
                }
                return null;
            };

            /**
             * Creates a GetMetadataResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof code_repositories.metadata.GetMetadataResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {code_repositories.metadata.GetMetadataResponse} GetMetadataResponse
             */
            GetMetadataResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.code_repositories.metadata.GetMetadataResponse)
                    return object;
                let message = new $root.code_repositories.metadata.GetMetadataResponse();
                if (object.metadata != null) {
                    if (typeof object.metadata !== "object")
                        throw TypeError(".code_repositories.metadata.GetMetadataResponse.metadata: object expected");
                    message.metadata = $root.code_repositories.metadata.Metadata.fromObject(object.metadata);
                }
                return message;
            };

            /**
             * Creates a plain object from a GetMetadataResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof code_repositories.metadata.GetMetadataResponse
             * @static
             * @param {code_repositories.metadata.GetMetadataResponse} message GetMetadataResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            GetMetadataResponse.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults)
                    object.metadata = null;
                if (message.metadata != null && message.hasOwnProperty("metadata"))
                    object.metadata = $root.code_repositories.metadata.Metadata.toObject(message.metadata, options);
                return object;
            };

            /**
             * Converts this GetMetadataResponse to JSON.
             * @function toJSON
             * @memberof code_repositories.metadata.GetMetadataResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            GetMetadataResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for GetMetadataResponse
             * @function getTypeUrl
             * @memberof code_repositories.metadata.GetMetadataResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            GetMetadataResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/code_repositories.metadata.GetMetadataResponse";
            };

            return GetMetadataResponse;
        })();

        metadata.DeleteMetadataRequest = (function() {

            /**
             * Properties of a DeleteMetadataRequest.
             * @memberof code_repositories.metadata
             * @interface IDeleteMetadataRequest
             * @property {number|null} [id] DeleteMetadataRequest id
             */

            /**
             * Constructs a new DeleteMetadataRequest.
             * @memberof code_repositories.metadata
             * @classdesc Represents a DeleteMetadataRequest.
             * @implements IDeleteMetadataRequest
             * @constructor
             * @param {code_repositories.metadata.IDeleteMetadataRequest=} [properties] Properties to set
             */
            function DeleteMetadataRequest(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * DeleteMetadataRequest id.
             * @member {number} id
             * @memberof code_repositories.metadata.DeleteMetadataRequest
             * @instance
             */
            DeleteMetadataRequest.prototype.id = 0;

            /**
             * Creates a new DeleteMetadataRequest instance using the specified properties.
             * @function create
             * @memberof code_repositories.metadata.DeleteMetadataRequest
             * @static
             * @param {code_repositories.metadata.IDeleteMetadataRequest=} [properties] Properties to set
             * @returns {code_repositories.metadata.DeleteMetadataRequest} DeleteMetadataRequest instance
             */
            DeleteMetadataRequest.create = function create(properties) {
                return new DeleteMetadataRequest(properties);
            };

            /**
             * Encodes the specified DeleteMetadataRequest message. Does not implicitly {@link code_repositories.metadata.DeleteMetadataRequest.verify|verify} messages.
             * @function encode
             * @memberof code_repositories.metadata.DeleteMetadataRequest
             * @static
             * @param {code_repositories.metadata.IDeleteMetadataRequest} message DeleteMetadataRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DeleteMetadataRequest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.id);
                return writer;
            };

            /**
             * Encodes the specified DeleteMetadataRequest message, length delimited. Does not implicitly {@link code_repositories.metadata.DeleteMetadataRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof code_repositories.metadata.DeleteMetadataRequest
             * @static
             * @param {code_repositories.metadata.IDeleteMetadataRequest} message DeleteMetadataRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DeleteMetadataRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a DeleteMetadataRequest message from the specified reader or buffer.
             * @function decode
             * @memberof code_repositories.metadata.DeleteMetadataRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {code_repositories.metadata.DeleteMetadataRequest} DeleteMetadataRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DeleteMetadataRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.code_repositories.metadata.DeleteMetadataRequest();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.id = reader.int32();
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
             * Decodes a DeleteMetadataRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof code_repositories.metadata.DeleteMetadataRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {code_repositories.metadata.DeleteMetadataRequest} DeleteMetadataRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DeleteMetadataRequest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a DeleteMetadataRequest message.
             * @function verify
             * @memberof code_repositories.metadata.DeleteMetadataRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            DeleteMetadataRequest.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.id != null && message.hasOwnProperty("id"))
                    if (!$util.isInteger(message.id))
                        return "id: integer expected";
                return null;
            };

            /**
             * Creates a DeleteMetadataRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof code_repositories.metadata.DeleteMetadataRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {code_repositories.metadata.DeleteMetadataRequest} DeleteMetadataRequest
             */
            DeleteMetadataRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.code_repositories.metadata.DeleteMetadataRequest)
                    return object;
                let message = new $root.code_repositories.metadata.DeleteMetadataRequest();
                if (object.id != null)
                    message.id = object.id | 0;
                return message;
            };

            /**
             * Creates a plain object from a DeleteMetadataRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof code_repositories.metadata.DeleteMetadataRequest
             * @static
             * @param {code_repositories.metadata.DeleteMetadataRequest} message DeleteMetadataRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            DeleteMetadataRequest.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults)
                    object.id = 0;
                if (message.id != null && message.hasOwnProperty("id"))
                    object.id = message.id;
                return object;
            };

            /**
             * Converts this DeleteMetadataRequest to JSON.
             * @function toJSON
             * @memberof code_repositories.metadata.DeleteMetadataRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            DeleteMetadataRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for DeleteMetadataRequest
             * @function getTypeUrl
             * @memberof code_repositories.metadata.DeleteMetadataRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            DeleteMetadataRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/code_repositories.metadata.DeleteMetadataRequest";
            };

            return DeleteMetadataRequest;
        })();

        metadata.DeleteMetadataResponse = (function() {

            /**
             * Properties of a DeleteMetadataResponse.
             * @memberof code_repositories.metadata
             * @interface IDeleteMetadataResponse
             * @property {boolean|null} [success] DeleteMetadataResponse success
             */

            /**
             * Constructs a new DeleteMetadataResponse.
             * @memberof code_repositories.metadata
             * @classdesc Represents a DeleteMetadataResponse.
             * @implements IDeleteMetadataResponse
             * @constructor
             * @param {code_repositories.metadata.IDeleteMetadataResponse=} [properties] Properties to set
             */
            function DeleteMetadataResponse(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * DeleteMetadataResponse success.
             * @member {boolean} success
             * @memberof code_repositories.metadata.DeleteMetadataResponse
             * @instance
             */
            DeleteMetadataResponse.prototype.success = false;

            /**
             * Creates a new DeleteMetadataResponse instance using the specified properties.
             * @function create
             * @memberof code_repositories.metadata.DeleteMetadataResponse
             * @static
             * @param {code_repositories.metadata.IDeleteMetadataResponse=} [properties] Properties to set
             * @returns {code_repositories.metadata.DeleteMetadataResponse} DeleteMetadataResponse instance
             */
            DeleteMetadataResponse.create = function create(properties) {
                return new DeleteMetadataResponse(properties);
            };

            /**
             * Encodes the specified DeleteMetadataResponse message. Does not implicitly {@link code_repositories.metadata.DeleteMetadataResponse.verify|verify} messages.
             * @function encode
             * @memberof code_repositories.metadata.DeleteMetadataResponse
             * @static
             * @param {code_repositories.metadata.IDeleteMetadataResponse} message DeleteMetadataResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DeleteMetadataResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.success != null && Object.hasOwnProperty.call(message, "success"))
                    writer.uint32(/* id 1, wireType 0 =*/8).bool(message.success);
                return writer;
            };

            /**
             * Encodes the specified DeleteMetadataResponse message, length delimited. Does not implicitly {@link code_repositories.metadata.DeleteMetadataResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof code_repositories.metadata.DeleteMetadataResponse
             * @static
             * @param {code_repositories.metadata.IDeleteMetadataResponse} message DeleteMetadataResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DeleteMetadataResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a DeleteMetadataResponse message from the specified reader or buffer.
             * @function decode
             * @memberof code_repositories.metadata.DeleteMetadataResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {code_repositories.metadata.DeleteMetadataResponse} DeleteMetadataResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DeleteMetadataResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.code_repositories.metadata.DeleteMetadataResponse();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.success = reader.bool();
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
             * Decodes a DeleteMetadataResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof code_repositories.metadata.DeleteMetadataResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {code_repositories.metadata.DeleteMetadataResponse} DeleteMetadataResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DeleteMetadataResponse.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a DeleteMetadataResponse message.
             * @function verify
             * @memberof code_repositories.metadata.DeleteMetadataResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            DeleteMetadataResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.success != null && message.hasOwnProperty("success"))
                    if (typeof message.success !== "boolean")
                        return "success: boolean expected";
                return null;
            };

            /**
             * Creates a DeleteMetadataResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof code_repositories.metadata.DeleteMetadataResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {code_repositories.metadata.DeleteMetadataResponse} DeleteMetadataResponse
             */
            DeleteMetadataResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.code_repositories.metadata.DeleteMetadataResponse)
                    return object;
                let message = new $root.code_repositories.metadata.DeleteMetadataResponse();
                if (object.success != null)
                    message.success = Boolean(object.success);
                return message;
            };

            /**
             * Creates a plain object from a DeleteMetadataResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof code_repositories.metadata.DeleteMetadataResponse
             * @static
             * @param {code_repositories.metadata.DeleteMetadataResponse} message DeleteMetadataResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            DeleteMetadataResponse.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults)
                    object.success = false;
                if (message.success != null && message.hasOwnProperty("success"))
                    object.success = message.success;
                return object;
            };

            /**
             * Converts this DeleteMetadataResponse to JSON.
             * @function toJSON
             * @memberof code_repositories.metadata.DeleteMetadataResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            DeleteMetadataResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for DeleteMetadataResponse
             * @function getTypeUrl
             * @memberof code_repositories.metadata.DeleteMetadataResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            DeleteMetadataResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/code_repositories.metadata.DeleteMetadataResponse";
            };

            return DeleteMetadataResponse;
        })();

        return metadata;
    })();

    return code_repositories;
})();

export { $root as default };
