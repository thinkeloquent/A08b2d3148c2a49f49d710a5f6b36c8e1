/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const figma_files = $root.figma_files = (() => {

    /**
     * Namespace figma_files.
     * @exports figma_files
     * @namespace
     */
    const figma_files = {};

    figma_files.common = (function() {

        /**
         * Namespace common.
         * @memberof figma_files
         * @namespace
         */
        const common = {};

        /**
         * FigmaFileType enum.
         * @name figma_files.common.FigmaFileType
         * @enum {number}
         * @property {number} FIGMA_FILE_TYPE_UNSPECIFIED=0 FIGMA_FILE_TYPE_UNSPECIFIED value
         * @property {number} FIGMA_FILE_TYPE_DESIGN_SYSTEM=1 FIGMA_FILE_TYPE_DESIGN_SYSTEM value
         * @property {number} FIGMA_FILE_TYPE_COMPONENT_LIBRARY=2 FIGMA_FILE_TYPE_COMPONENT_LIBRARY value
         * @property {number} FIGMA_FILE_TYPE_PROTOTYPE=3 FIGMA_FILE_TYPE_PROTOTYPE value
         * @property {number} FIGMA_FILE_TYPE_ILLUSTRATION=4 FIGMA_FILE_TYPE_ILLUSTRATION value
         * @property {number} FIGMA_FILE_TYPE_ICON_SET=5 FIGMA_FILE_TYPE_ICON_SET value
         */
        common.FigmaFileType = (function() {
            const valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "FIGMA_FILE_TYPE_UNSPECIFIED"] = 0;
            values[valuesById[1] = "FIGMA_FILE_TYPE_DESIGN_SYSTEM"] = 1;
            values[valuesById[2] = "FIGMA_FILE_TYPE_COMPONENT_LIBRARY"] = 2;
            values[valuesById[3] = "FIGMA_FILE_TYPE_PROTOTYPE"] = 3;
            values[valuesById[4] = "FIGMA_FILE_TYPE_ILLUSTRATION"] = 4;
            values[valuesById[5] = "FIGMA_FILE_TYPE_ICON_SET"] = 5;
            return values;
        })();

        /**
         * FigmaFileStatus enum.
         * @name figma_files.common.FigmaFileStatus
         * @enum {number}
         * @property {number} FIGMA_FILE_STATUS_UNSPECIFIED=0 FIGMA_FILE_STATUS_UNSPECIFIED value
         * @property {number} FIGMA_FILE_STATUS_STABLE=1 FIGMA_FILE_STATUS_STABLE value
         * @property {number} FIGMA_FILE_STATUS_BETA=2 FIGMA_FILE_STATUS_BETA value
         * @property {number} FIGMA_FILE_STATUS_DEPRECATED=3 FIGMA_FILE_STATUS_DEPRECATED value
         * @property {number} FIGMA_FILE_STATUS_EXPERIMENTAL=4 FIGMA_FILE_STATUS_EXPERIMENTAL value
         */
        common.FigmaFileStatus = (function() {
            const valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "FIGMA_FILE_STATUS_UNSPECIFIED"] = 0;
            values[valuesById[1] = "FIGMA_FILE_STATUS_STABLE"] = 1;
            values[valuesById[2] = "FIGMA_FILE_STATUS_BETA"] = 2;
            values[valuesById[3] = "FIGMA_FILE_STATUS_DEPRECATED"] = 3;
            values[valuesById[4] = "FIGMA_FILE_STATUS_EXPERIMENTAL"] = 4;
            return values;
        })();

        /**
         * FigmaFileSource enum.
         * @name figma_files.common.FigmaFileSource
         * @enum {number}
         * @property {number} FIGMA_FILE_SOURCE_UNSPECIFIED=0 FIGMA_FILE_SOURCE_UNSPECIFIED value
         * @property {number} FIGMA_FILE_SOURCE_FIGMA=1 FIGMA_FILE_SOURCE_FIGMA value
         * @property {number} FIGMA_FILE_SOURCE_FIGMA_COMMUNITY=2 FIGMA_FILE_SOURCE_FIGMA_COMMUNITY value
         * @property {number} FIGMA_FILE_SOURCE_MANUAL=3 FIGMA_FILE_SOURCE_MANUAL value
         */
        common.FigmaFileSource = (function() {
            const valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "FIGMA_FILE_SOURCE_UNSPECIFIED"] = 0;
            values[valuesById[1] = "FIGMA_FILE_SOURCE_FIGMA"] = 1;
            values[valuesById[2] = "FIGMA_FILE_SOURCE_FIGMA_COMMUNITY"] = 2;
            values[valuesById[3] = "FIGMA_FILE_SOURCE_MANUAL"] = 3;
            return values;
        })();

        common.ExternalId = (function() {

            /**
             * Properties of an ExternalId.
             * @memberof figma_files.common
             * @interface IExternalId
             * @property {string|null} [registry] ExternalId registry
             * @property {string|null} [id] ExternalId id
             */

            /**
             * Constructs a new ExternalId.
             * @memberof figma_files.common
             * @classdesc Represents an ExternalId.
             * @implements IExternalId
             * @constructor
             * @param {figma_files.common.IExternalId=} [properties] Properties to set
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
             * @memberof figma_files.common.ExternalId
             * @instance
             */
            ExternalId.prototype.registry = "";

            /**
             * ExternalId id.
             * @member {string} id
             * @memberof figma_files.common.ExternalId
             * @instance
             */
            ExternalId.prototype.id = "";

            /**
             * Creates a new ExternalId instance using the specified properties.
             * @function create
             * @memberof figma_files.common.ExternalId
             * @static
             * @param {figma_files.common.IExternalId=} [properties] Properties to set
             * @returns {figma_files.common.ExternalId} ExternalId instance
             */
            ExternalId.create = function create(properties) {
                return new ExternalId(properties);
            };

            /**
             * Encodes the specified ExternalId message. Does not implicitly {@link figma_files.common.ExternalId.verify|verify} messages.
             * @function encode
             * @memberof figma_files.common.ExternalId
             * @static
             * @param {figma_files.common.IExternalId} message ExternalId message or plain object to encode
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
             * Encodes the specified ExternalId message, length delimited. Does not implicitly {@link figma_files.common.ExternalId.verify|verify} messages.
             * @function encodeDelimited
             * @memberof figma_files.common.ExternalId
             * @static
             * @param {figma_files.common.IExternalId} message ExternalId message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ExternalId.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an ExternalId message from the specified reader or buffer.
             * @function decode
             * @memberof figma_files.common.ExternalId
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {figma_files.common.ExternalId} ExternalId
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ExternalId.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_files.common.ExternalId();
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
             * @memberof figma_files.common.ExternalId
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {figma_files.common.ExternalId} ExternalId
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
             * @memberof figma_files.common.ExternalId
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
             * @memberof figma_files.common.ExternalId
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {figma_files.common.ExternalId} ExternalId
             */
            ExternalId.fromObject = function fromObject(object) {
                if (object instanceof $root.figma_files.common.ExternalId)
                    return object;
                let message = new $root.figma_files.common.ExternalId();
                if (object.registry != null)
                    message.registry = String(object.registry);
                if (object.id != null)
                    message.id = String(object.id);
                return message;
            };

            /**
             * Creates a plain object from an ExternalId message. Also converts values to other types if specified.
             * @function toObject
             * @memberof figma_files.common.ExternalId
             * @static
             * @param {figma_files.common.ExternalId} message ExternalId
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
             * @memberof figma_files.common.ExternalId
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ExternalId.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ExternalId
             * @function getTypeUrl
             * @memberof figma_files.common.ExternalId
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ExternalId.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/figma_files.common.ExternalId";
            };

            return ExternalId;
        })();

        common.PaginationRequest = (function() {

            /**
             * Properties of a PaginationRequest.
             * @memberof figma_files.common
             * @interface IPaginationRequest
             * @property {number|null} [page] PaginationRequest page
             * @property {number|null} [limit] PaginationRequest limit
             */

            /**
             * Constructs a new PaginationRequest.
             * @memberof figma_files.common
             * @classdesc Represents a PaginationRequest.
             * @implements IPaginationRequest
             * @constructor
             * @param {figma_files.common.IPaginationRequest=} [properties] Properties to set
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
             * @memberof figma_files.common.PaginationRequest
             * @instance
             */
            PaginationRequest.prototype.page = 0;

            /**
             * PaginationRequest limit.
             * @member {number} limit
             * @memberof figma_files.common.PaginationRequest
             * @instance
             */
            PaginationRequest.prototype.limit = 0;

            /**
             * Creates a new PaginationRequest instance using the specified properties.
             * @function create
             * @memberof figma_files.common.PaginationRequest
             * @static
             * @param {figma_files.common.IPaginationRequest=} [properties] Properties to set
             * @returns {figma_files.common.PaginationRequest} PaginationRequest instance
             */
            PaginationRequest.create = function create(properties) {
                return new PaginationRequest(properties);
            };

            /**
             * Encodes the specified PaginationRequest message. Does not implicitly {@link figma_files.common.PaginationRequest.verify|verify} messages.
             * @function encode
             * @memberof figma_files.common.PaginationRequest
             * @static
             * @param {figma_files.common.IPaginationRequest} message PaginationRequest message or plain object to encode
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
             * Encodes the specified PaginationRequest message, length delimited. Does not implicitly {@link figma_files.common.PaginationRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof figma_files.common.PaginationRequest
             * @static
             * @param {figma_files.common.IPaginationRequest} message PaginationRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PaginationRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a PaginationRequest message from the specified reader or buffer.
             * @function decode
             * @memberof figma_files.common.PaginationRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {figma_files.common.PaginationRequest} PaginationRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PaginationRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_files.common.PaginationRequest();
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
             * @memberof figma_files.common.PaginationRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {figma_files.common.PaginationRequest} PaginationRequest
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
             * @memberof figma_files.common.PaginationRequest
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
             * @memberof figma_files.common.PaginationRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {figma_files.common.PaginationRequest} PaginationRequest
             */
            PaginationRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.figma_files.common.PaginationRequest)
                    return object;
                let message = new $root.figma_files.common.PaginationRequest();
                if (object.page != null)
                    message.page = object.page | 0;
                if (object.limit != null)
                    message.limit = object.limit | 0;
                return message;
            };

            /**
             * Creates a plain object from a PaginationRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof figma_files.common.PaginationRequest
             * @static
             * @param {figma_files.common.PaginationRequest} message PaginationRequest
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
             * @memberof figma_files.common.PaginationRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            PaginationRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for PaginationRequest
             * @function getTypeUrl
             * @memberof figma_files.common.PaginationRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            PaginationRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/figma_files.common.PaginationRequest";
            };

            return PaginationRequest;
        })();

        common.PaginationResponse = (function() {

            /**
             * Properties of a PaginationResponse.
             * @memberof figma_files.common
             * @interface IPaginationResponse
             * @property {number|null} [page] PaginationResponse page
             * @property {number|null} [limit] PaginationResponse limit
             * @property {number|null} [total] PaginationResponse total
             * @property {number|null} [totalPages] PaginationResponse totalPages
             */

            /**
             * Constructs a new PaginationResponse.
             * @memberof figma_files.common
             * @classdesc Represents a PaginationResponse.
             * @implements IPaginationResponse
             * @constructor
             * @param {figma_files.common.IPaginationResponse=} [properties] Properties to set
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
             * @memberof figma_files.common.PaginationResponse
             * @instance
             */
            PaginationResponse.prototype.page = 0;

            /**
             * PaginationResponse limit.
             * @member {number} limit
             * @memberof figma_files.common.PaginationResponse
             * @instance
             */
            PaginationResponse.prototype.limit = 0;

            /**
             * PaginationResponse total.
             * @member {number} total
             * @memberof figma_files.common.PaginationResponse
             * @instance
             */
            PaginationResponse.prototype.total = 0;

            /**
             * PaginationResponse totalPages.
             * @member {number} totalPages
             * @memberof figma_files.common.PaginationResponse
             * @instance
             */
            PaginationResponse.prototype.totalPages = 0;

            /**
             * Creates a new PaginationResponse instance using the specified properties.
             * @function create
             * @memberof figma_files.common.PaginationResponse
             * @static
             * @param {figma_files.common.IPaginationResponse=} [properties] Properties to set
             * @returns {figma_files.common.PaginationResponse} PaginationResponse instance
             */
            PaginationResponse.create = function create(properties) {
                return new PaginationResponse(properties);
            };

            /**
             * Encodes the specified PaginationResponse message. Does not implicitly {@link figma_files.common.PaginationResponse.verify|verify} messages.
             * @function encode
             * @memberof figma_files.common.PaginationResponse
             * @static
             * @param {figma_files.common.IPaginationResponse} message PaginationResponse message or plain object to encode
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
             * Encodes the specified PaginationResponse message, length delimited. Does not implicitly {@link figma_files.common.PaginationResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof figma_files.common.PaginationResponse
             * @static
             * @param {figma_files.common.IPaginationResponse} message PaginationResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PaginationResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a PaginationResponse message from the specified reader or buffer.
             * @function decode
             * @memberof figma_files.common.PaginationResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {figma_files.common.PaginationResponse} PaginationResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PaginationResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_files.common.PaginationResponse();
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
             * @memberof figma_files.common.PaginationResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {figma_files.common.PaginationResponse} PaginationResponse
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
             * @memberof figma_files.common.PaginationResponse
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
             * @memberof figma_files.common.PaginationResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {figma_files.common.PaginationResponse} PaginationResponse
             */
            PaginationResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.figma_files.common.PaginationResponse)
                    return object;
                let message = new $root.figma_files.common.PaginationResponse();
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
             * @memberof figma_files.common.PaginationResponse
             * @static
             * @param {figma_files.common.PaginationResponse} message PaginationResponse
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
             * @memberof figma_files.common.PaginationResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            PaginationResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for PaginationResponse
             * @function getTypeUrl
             * @memberof figma_files.common.PaginationResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            PaginationResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/figma_files.common.PaginationResponse";
            };

            return PaginationResponse;
        })();

        common.ErrorResponse = (function() {

            /**
             * Properties of an ErrorResponse.
             * @memberof figma_files.common
             * @interface IErrorResponse
             * @property {number|null} [code] ErrorResponse code
             * @property {string|null} [message] ErrorResponse message
             * @property {string|null} [details] ErrorResponse details
             */

            /**
             * Constructs a new ErrorResponse.
             * @memberof figma_files.common
             * @classdesc Represents an ErrorResponse.
             * @implements IErrorResponse
             * @constructor
             * @param {figma_files.common.IErrorResponse=} [properties] Properties to set
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
             * @memberof figma_files.common.ErrorResponse
             * @instance
             */
            ErrorResponse.prototype.code = 0;

            /**
             * ErrorResponse message.
             * @member {string} message
             * @memberof figma_files.common.ErrorResponse
             * @instance
             */
            ErrorResponse.prototype.message = "";

            /**
             * ErrorResponse details.
             * @member {string} details
             * @memberof figma_files.common.ErrorResponse
             * @instance
             */
            ErrorResponse.prototype.details = "";

            /**
             * Creates a new ErrorResponse instance using the specified properties.
             * @function create
             * @memberof figma_files.common.ErrorResponse
             * @static
             * @param {figma_files.common.IErrorResponse=} [properties] Properties to set
             * @returns {figma_files.common.ErrorResponse} ErrorResponse instance
             */
            ErrorResponse.create = function create(properties) {
                return new ErrorResponse(properties);
            };

            /**
             * Encodes the specified ErrorResponse message. Does not implicitly {@link figma_files.common.ErrorResponse.verify|verify} messages.
             * @function encode
             * @memberof figma_files.common.ErrorResponse
             * @static
             * @param {figma_files.common.IErrorResponse} message ErrorResponse message or plain object to encode
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
             * Encodes the specified ErrorResponse message, length delimited. Does not implicitly {@link figma_files.common.ErrorResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof figma_files.common.ErrorResponse
             * @static
             * @param {figma_files.common.IErrorResponse} message ErrorResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ErrorResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an ErrorResponse message from the specified reader or buffer.
             * @function decode
             * @memberof figma_files.common.ErrorResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {figma_files.common.ErrorResponse} ErrorResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ErrorResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_files.common.ErrorResponse();
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
             * @memberof figma_files.common.ErrorResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {figma_files.common.ErrorResponse} ErrorResponse
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
             * @memberof figma_files.common.ErrorResponse
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
             * @memberof figma_files.common.ErrorResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {figma_files.common.ErrorResponse} ErrorResponse
             */
            ErrorResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.figma_files.common.ErrorResponse)
                    return object;
                let message = new $root.figma_files.common.ErrorResponse();
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
             * @memberof figma_files.common.ErrorResponse
             * @static
             * @param {figma_files.common.ErrorResponse} message ErrorResponse
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
             * @memberof figma_files.common.ErrorResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ErrorResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ErrorResponse
             * @function getTypeUrl
             * @memberof figma_files.common.ErrorResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ErrorResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/figma_files.common.ErrorResponse";
            };

            return ErrorResponse;
        })();

        common.Timestamp = (function() {

            /**
             * Properties of a Timestamp.
             * @memberof figma_files.common
             * @interface ITimestamp
             * @property {string|null} [iso8601] Timestamp iso8601
             */

            /**
             * Constructs a new Timestamp.
             * @memberof figma_files.common
             * @classdesc Represents a Timestamp.
             * @implements ITimestamp
             * @constructor
             * @param {figma_files.common.ITimestamp=} [properties] Properties to set
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
             * @memberof figma_files.common.Timestamp
             * @instance
             */
            Timestamp.prototype.iso8601 = "";

            /**
             * Creates a new Timestamp instance using the specified properties.
             * @function create
             * @memberof figma_files.common.Timestamp
             * @static
             * @param {figma_files.common.ITimestamp=} [properties] Properties to set
             * @returns {figma_files.common.Timestamp} Timestamp instance
             */
            Timestamp.create = function create(properties) {
                return new Timestamp(properties);
            };

            /**
             * Encodes the specified Timestamp message. Does not implicitly {@link figma_files.common.Timestamp.verify|verify} messages.
             * @function encode
             * @memberof figma_files.common.Timestamp
             * @static
             * @param {figma_files.common.ITimestamp} message Timestamp message or plain object to encode
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
             * Encodes the specified Timestamp message, length delimited. Does not implicitly {@link figma_files.common.Timestamp.verify|verify} messages.
             * @function encodeDelimited
             * @memberof figma_files.common.Timestamp
             * @static
             * @param {figma_files.common.ITimestamp} message Timestamp message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Timestamp.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Timestamp message from the specified reader or buffer.
             * @function decode
             * @memberof figma_files.common.Timestamp
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {figma_files.common.Timestamp} Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Timestamp.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_files.common.Timestamp();
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
             * @memberof figma_files.common.Timestamp
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {figma_files.common.Timestamp} Timestamp
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
             * @memberof figma_files.common.Timestamp
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
             * @memberof figma_files.common.Timestamp
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {figma_files.common.Timestamp} Timestamp
             */
            Timestamp.fromObject = function fromObject(object) {
                if (object instanceof $root.figma_files.common.Timestamp)
                    return object;
                let message = new $root.figma_files.common.Timestamp();
                if (object.iso8601 != null)
                    message.iso8601 = String(object.iso8601);
                return message;
            };

            /**
             * Creates a plain object from a Timestamp message. Also converts values to other types if specified.
             * @function toObject
             * @memberof figma_files.common.Timestamp
             * @static
             * @param {figma_files.common.Timestamp} message Timestamp
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
             * @memberof figma_files.common.Timestamp
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Timestamp.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Timestamp
             * @function getTypeUrl
             * @memberof figma_files.common.Timestamp
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Timestamp.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/figma_files.common.Timestamp";
            };

            return Timestamp;
        })();

        return common;
    })();

    figma_files.figma_file = (function() {

        /**
         * Namespace figma_file.
         * @memberof figma_files
         * @namespace
         */
        const figma_file = {};

        figma_file.FigmaFile = (function() {

            /**
             * Properties of a FigmaFile.
             * @memberof figma_files.figma_file
             * @interface IFigmaFile
             * @property {string|null} [id] FigmaFile id
             * @property {string|null} [name] FigmaFile name
             * @property {string|null} [description] FigmaFile description
             * @property {figma_files.common.FigmaFileType|null} [type] FigmaFile type
             * @property {string|null} [figmaUrl] FigmaFile figmaUrl
             * @property {string|null} [figmaFileKey] FigmaFile figmaFileKey
             * @property {string|null} [thumbnailUrl] FigmaFile thumbnailUrl
             * @property {number|null} [pageCount] FigmaFile pageCount
             * @property {number|null} [componentCount] FigmaFile componentCount
             * @property {number|null} [styleCount] FigmaFile styleCount
             * @property {string|null} [lastModifiedBy] FigmaFile lastModifiedBy
             * @property {string|null} [editorType] FigmaFile editorType
             * @property {boolean|null} [trending] FigmaFile trending
             * @property {boolean|null} [verified] FigmaFile verified
             * @property {figma_files.common.FigmaFileStatus|null} [status] FigmaFile status
             * @property {figma_files.common.FigmaFileSource|null} [source] FigmaFile source
             * @property {Array.<figma_files.common.IExternalId>|null} [externalIds] FigmaFile externalIds
             * @property {Array.<figma_files.tag.ITag>|null} [tags] FigmaFile tags
             * @property {Array.<figma_files.metadata.IMetadata>|null} [metadata] FigmaFile metadata
             * @property {figma_files.common.ITimestamp|null} [createdAt] FigmaFile createdAt
             * @property {figma_files.common.ITimestamp|null} [updatedAt] FigmaFile updatedAt
             */

            /**
             * Constructs a new FigmaFile.
             * @memberof figma_files.figma_file
             * @classdesc Represents a FigmaFile.
             * @implements IFigmaFile
             * @constructor
             * @param {figma_files.figma_file.IFigmaFile=} [properties] Properties to set
             */
            function FigmaFile(properties) {
                this.externalIds = [];
                this.tags = [];
                this.metadata = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * FigmaFile id.
             * @member {string} id
             * @memberof figma_files.figma_file.FigmaFile
             * @instance
             */
            FigmaFile.prototype.id = "";

            /**
             * FigmaFile name.
             * @member {string} name
             * @memberof figma_files.figma_file.FigmaFile
             * @instance
             */
            FigmaFile.prototype.name = "";

            /**
             * FigmaFile description.
             * @member {string} description
             * @memberof figma_files.figma_file.FigmaFile
             * @instance
             */
            FigmaFile.prototype.description = "";

            /**
             * FigmaFile type.
             * @member {figma_files.common.FigmaFileType} type
             * @memberof figma_files.figma_file.FigmaFile
             * @instance
             */
            FigmaFile.prototype.type = 0;

            /**
             * FigmaFile figmaUrl.
             * @member {string} figmaUrl
             * @memberof figma_files.figma_file.FigmaFile
             * @instance
             */
            FigmaFile.prototype.figmaUrl = "";

            /**
             * FigmaFile figmaFileKey.
             * @member {string} figmaFileKey
             * @memberof figma_files.figma_file.FigmaFile
             * @instance
             */
            FigmaFile.prototype.figmaFileKey = "";

            /**
             * FigmaFile thumbnailUrl.
             * @member {string} thumbnailUrl
             * @memberof figma_files.figma_file.FigmaFile
             * @instance
             */
            FigmaFile.prototype.thumbnailUrl = "";

            /**
             * FigmaFile pageCount.
             * @member {number} pageCount
             * @memberof figma_files.figma_file.FigmaFile
             * @instance
             */
            FigmaFile.prototype.pageCount = 0;

            /**
             * FigmaFile componentCount.
             * @member {number} componentCount
             * @memberof figma_files.figma_file.FigmaFile
             * @instance
             */
            FigmaFile.prototype.componentCount = 0;

            /**
             * FigmaFile styleCount.
             * @member {number} styleCount
             * @memberof figma_files.figma_file.FigmaFile
             * @instance
             */
            FigmaFile.prototype.styleCount = 0;

            /**
             * FigmaFile lastModifiedBy.
             * @member {string} lastModifiedBy
             * @memberof figma_files.figma_file.FigmaFile
             * @instance
             */
            FigmaFile.prototype.lastModifiedBy = "";

            /**
             * FigmaFile editorType.
             * @member {string} editorType
             * @memberof figma_files.figma_file.FigmaFile
             * @instance
             */
            FigmaFile.prototype.editorType = "";

            /**
             * FigmaFile trending.
             * @member {boolean} trending
             * @memberof figma_files.figma_file.FigmaFile
             * @instance
             */
            FigmaFile.prototype.trending = false;

            /**
             * FigmaFile verified.
             * @member {boolean} verified
             * @memberof figma_files.figma_file.FigmaFile
             * @instance
             */
            FigmaFile.prototype.verified = false;

            /**
             * FigmaFile status.
             * @member {figma_files.common.FigmaFileStatus} status
             * @memberof figma_files.figma_file.FigmaFile
             * @instance
             */
            FigmaFile.prototype.status = 0;

            /**
             * FigmaFile source.
             * @member {figma_files.common.FigmaFileSource} source
             * @memberof figma_files.figma_file.FigmaFile
             * @instance
             */
            FigmaFile.prototype.source = 0;

            /**
             * FigmaFile externalIds.
             * @member {Array.<figma_files.common.IExternalId>} externalIds
             * @memberof figma_files.figma_file.FigmaFile
             * @instance
             */
            FigmaFile.prototype.externalIds = $util.emptyArray;

            /**
             * FigmaFile tags.
             * @member {Array.<figma_files.tag.ITag>} tags
             * @memberof figma_files.figma_file.FigmaFile
             * @instance
             */
            FigmaFile.prototype.tags = $util.emptyArray;

            /**
             * FigmaFile metadata.
             * @member {Array.<figma_files.metadata.IMetadata>} metadata
             * @memberof figma_files.figma_file.FigmaFile
             * @instance
             */
            FigmaFile.prototype.metadata = $util.emptyArray;

            /**
             * FigmaFile createdAt.
             * @member {figma_files.common.ITimestamp|null|undefined} createdAt
             * @memberof figma_files.figma_file.FigmaFile
             * @instance
             */
            FigmaFile.prototype.createdAt = null;

            /**
             * FigmaFile updatedAt.
             * @member {figma_files.common.ITimestamp|null|undefined} updatedAt
             * @memberof figma_files.figma_file.FigmaFile
             * @instance
             */
            FigmaFile.prototype.updatedAt = null;

            /**
             * Creates a new FigmaFile instance using the specified properties.
             * @function create
             * @memberof figma_files.figma_file.FigmaFile
             * @static
             * @param {figma_files.figma_file.IFigmaFile=} [properties] Properties to set
             * @returns {figma_files.figma_file.FigmaFile} FigmaFile instance
             */
            FigmaFile.create = function create(properties) {
                return new FigmaFile(properties);
            };

            /**
             * Encodes the specified FigmaFile message. Does not implicitly {@link figma_files.figma_file.FigmaFile.verify|verify} messages.
             * @function encode
             * @memberof figma_files.figma_file.FigmaFile
             * @static
             * @param {figma_files.figma_file.IFigmaFile} message FigmaFile message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            FigmaFile.encode = function encode(message, writer) {
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
                if (message.figmaUrl != null && Object.hasOwnProperty.call(message, "figmaUrl"))
                    writer.uint32(/* id 5, wireType 2 =*/42).string(message.figmaUrl);
                if (message.figmaFileKey != null && Object.hasOwnProperty.call(message, "figmaFileKey"))
                    writer.uint32(/* id 6, wireType 2 =*/50).string(message.figmaFileKey);
                if (message.thumbnailUrl != null && Object.hasOwnProperty.call(message, "thumbnailUrl"))
                    writer.uint32(/* id 7, wireType 2 =*/58).string(message.thumbnailUrl);
                if (message.pageCount != null && Object.hasOwnProperty.call(message, "pageCount"))
                    writer.uint32(/* id 8, wireType 0 =*/64).int32(message.pageCount);
                if (message.componentCount != null && Object.hasOwnProperty.call(message, "componentCount"))
                    writer.uint32(/* id 9, wireType 0 =*/72).int32(message.componentCount);
                if (message.styleCount != null && Object.hasOwnProperty.call(message, "styleCount"))
                    writer.uint32(/* id 10, wireType 0 =*/80).int32(message.styleCount);
                if (message.lastModifiedBy != null && Object.hasOwnProperty.call(message, "lastModifiedBy"))
                    writer.uint32(/* id 11, wireType 2 =*/90).string(message.lastModifiedBy);
                if (message.editorType != null && Object.hasOwnProperty.call(message, "editorType"))
                    writer.uint32(/* id 12, wireType 2 =*/98).string(message.editorType);
                if (message.trending != null && Object.hasOwnProperty.call(message, "trending"))
                    writer.uint32(/* id 13, wireType 0 =*/104).bool(message.trending);
                if (message.verified != null && Object.hasOwnProperty.call(message, "verified"))
                    writer.uint32(/* id 14, wireType 0 =*/112).bool(message.verified);
                if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                    writer.uint32(/* id 15, wireType 0 =*/120).int32(message.status);
                if (message.source != null && Object.hasOwnProperty.call(message, "source"))
                    writer.uint32(/* id 16, wireType 0 =*/128).int32(message.source);
                if (message.externalIds != null && message.externalIds.length)
                    for (let i = 0; i < message.externalIds.length; ++i)
                        $root.figma_files.common.ExternalId.encode(message.externalIds[i], writer.uint32(/* id 17, wireType 2 =*/138).fork()).ldelim();
                if (message.tags != null && message.tags.length)
                    for (let i = 0; i < message.tags.length; ++i)
                        $root.figma_files.tag.Tag.encode(message.tags[i], writer.uint32(/* id 18, wireType 2 =*/146).fork()).ldelim();
                if (message.metadata != null && message.metadata.length)
                    for (let i = 0; i < message.metadata.length; ++i)
                        $root.figma_files.metadata.Metadata.encode(message.metadata[i], writer.uint32(/* id 19, wireType 2 =*/154).fork()).ldelim();
                if (message.createdAt != null && Object.hasOwnProperty.call(message, "createdAt"))
                    $root.figma_files.common.Timestamp.encode(message.createdAt, writer.uint32(/* id 20, wireType 2 =*/162).fork()).ldelim();
                if (message.updatedAt != null && Object.hasOwnProperty.call(message, "updatedAt"))
                    $root.figma_files.common.Timestamp.encode(message.updatedAt, writer.uint32(/* id 21, wireType 2 =*/170).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified FigmaFile message, length delimited. Does not implicitly {@link figma_files.figma_file.FigmaFile.verify|verify} messages.
             * @function encodeDelimited
             * @memberof figma_files.figma_file.FigmaFile
             * @static
             * @param {figma_files.figma_file.IFigmaFile} message FigmaFile message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            FigmaFile.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a FigmaFile message from the specified reader or buffer.
             * @function decode
             * @memberof figma_files.figma_file.FigmaFile
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {figma_files.figma_file.FigmaFile} FigmaFile
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            FigmaFile.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_files.figma_file.FigmaFile();
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
                            message.figmaUrl = reader.string();
                            break;
                        }
                    case 6: {
                            message.figmaFileKey = reader.string();
                            break;
                        }
                    case 7: {
                            message.thumbnailUrl = reader.string();
                            break;
                        }
                    case 8: {
                            message.pageCount = reader.int32();
                            break;
                        }
                    case 9: {
                            message.componentCount = reader.int32();
                            break;
                        }
                    case 10: {
                            message.styleCount = reader.int32();
                            break;
                        }
                    case 11: {
                            message.lastModifiedBy = reader.string();
                            break;
                        }
                    case 12: {
                            message.editorType = reader.string();
                            break;
                        }
                    case 13: {
                            message.trending = reader.bool();
                            break;
                        }
                    case 14: {
                            message.verified = reader.bool();
                            break;
                        }
                    case 15: {
                            message.status = reader.int32();
                            break;
                        }
                    case 16: {
                            message.source = reader.int32();
                            break;
                        }
                    case 17: {
                            if (!(message.externalIds && message.externalIds.length))
                                message.externalIds = [];
                            message.externalIds.push($root.figma_files.common.ExternalId.decode(reader, reader.uint32()));
                            break;
                        }
                    case 18: {
                            if (!(message.tags && message.tags.length))
                                message.tags = [];
                            message.tags.push($root.figma_files.tag.Tag.decode(reader, reader.uint32()));
                            break;
                        }
                    case 19: {
                            if (!(message.metadata && message.metadata.length))
                                message.metadata = [];
                            message.metadata.push($root.figma_files.metadata.Metadata.decode(reader, reader.uint32()));
                            break;
                        }
                    case 20: {
                            message.createdAt = $root.figma_files.common.Timestamp.decode(reader, reader.uint32());
                            break;
                        }
                    case 21: {
                            message.updatedAt = $root.figma_files.common.Timestamp.decode(reader, reader.uint32());
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
             * Decodes a FigmaFile message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof figma_files.figma_file.FigmaFile
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {figma_files.figma_file.FigmaFile} FigmaFile
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            FigmaFile.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a FigmaFile message.
             * @function verify
             * @memberof figma_files.figma_file.FigmaFile
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            FigmaFile.verify = function verify(message) {
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
                    case 4:
                    case 5:
                        break;
                    }
                if (message.figmaUrl != null && message.hasOwnProperty("figmaUrl"))
                    if (!$util.isString(message.figmaUrl))
                        return "figmaUrl: string expected";
                if (message.figmaFileKey != null && message.hasOwnProperty("figmaFileKey"))
                    if (!$util.isString(message.figmaFileKey))
                        return "figmaFileKey: string expected";
                if (message.thumbnailUrl != null && message.hasOwnProperty("thumbnailUrl"))
                    if (!$util.isString(message.thumbnailUrl))
                        return "thumbnailUrl: string expected";
                if (message.pageCount != null && message.hasOwnProperty("pageCount"))
                    if (!$util.isInteger(message.pageCount))
                        return "pageCount: integer expected";
                if (message.componentCount != null && message.hasOwnProperty("componentCount"))
                    if (!$util.isInteger(message.componentCount))
                        return "componentCount: integer expected";
                if (message.styleCount != null && message.hasOwnProperty("styleCount"))
                    if (!$util.isInteger(message.styleCount))
                        return "styleCount: integer expected";
                if (message.lastModifiedBy != null && message.hasOwnProperty("lastModifiedBy"))
                    if (!$util.isString(message.lastModifiedBy))
                        return "lastModifiedBy: string expected";
                if (message.editorType != null && message.hasOwnProperty("editorType"))
                    if (!$util.isString(message.editorType))
                        return "editorType: string expected";
                if (message.trending != null && message.hasOwnProperty("trending"))
                    if (typeof message.trending !== "boolean")
                        return "trending: boolean expected";
                if (message.verified != null && message.hasOwnProperty("verified"))
                    if (typeof message.verified !== "boolean")
                        return "verified: boolean expected";
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
                        break;
                    }
                if (message.externalIds != null && message.hasOwnProperty("externalIds")) {
                    if (!Array.isArray(message.externalIds))
                        return "externalIds: array expected";
                    for (let i = 0; i < message.externalIds.length; ++i) {
                        let error = $root.figma_files.common.ExternalId.verify(message.externalIds[i]);
                        if (error)
                            return "externalIds." + error;
                    }
                }
                if (message.tags != null && message.hasOwnProperty("tags")) {
                    if (!Array.isArray(message.tags))
                        return "tags: array expected";
                    for (let i = 0; i < message.tags.length; ++i) {
                        let error = $root.figma_files.tag.Tag.verify(message.tags[i]);
                        if (error)
                            return "tags." + error;
                    }
                }
                if (message.metadata != null && message.hasOwnProperty("metadata")) {
                    if (!Array.isArray(message.metadata))
                        return "metadata: array expected";
                    for (let i = 0; i < message.metadata.length; ++i) {
                        let error = $root.figma_files.metadata.Metadata.verify(message.metadata[i]);
                        if (error)
                            return "metadata." + error;
                    }
                }
                if (message.createdAt != null && message.hasOwnProperty("createdAt")) {
                    let error = $root.figma_files.common.Timestamp.verify(message.createdAt);
                    if (error)
                        return "createdAt." + error;
                }
                if (message.updatedAt != null && message.hasOwnProperty("updatedAt")) {
                    let error = $root.figma_files.common.Timestamp.verify(message.updatedAt);
                    if (error)
                        return "updatedAt." + error;
                }
                return null;
            };

            /**
             * Creates a FigmaFile message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof figma_files.figma_file.FigmaFile
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {figma_files.figma_file.FigmaFile} FigmaFile
             */
            FigmaFile.fromObject = function fromObject(object) {
                if (object instanceof $root.figma_files.figma_file.FigmaFile)
                    return object;
                let message = new $root.figma_files.figma_file.FigmaFile();
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
                case "FIGMA_FILE_TYPE_UNSPECIFIED":
                case 0:
                    message.type = 0;
                    break;
                case "FIGMA_FILE_TYPE_DESIGN_SYSTEM":
                case 1:
                    message.type = 1;
                    break;
                case "FIGMA_FILE_TYPE_COMPONENT_LIBRARY":
                case 2:
                    message.type = 2;
                    break;
                case "FIGMA_FILE_TYPE_PROTOTYPE":
                case 3:
                    message.type = 3;
                    break;
                case "FIGMA_FILE_TYPE_ILLUSTRATION":
                case 4:
                    message.type = 4;
                    break;
                case "FIGMA_FILE_TYPE_ICON_SET":
                case 5:
                    message.type = 5;
                    break;
                }
                if (object.figmaUrl != null)
                    message.figmaUrl = String(object.figmaUrl);
                if (object.figmaFileKey != null)
                    message.figmaFileKey = String(object.figmaFileKey);
                if (object.thumbnailUrl != null)
                    message.thumbnailUrl = String(object.thumbnailUrl);
                if (object.pageCount != null)
                    message.pageCount = object.pageCount | 0;
                if (object.componentCount != null)
                    message.componentCount = object.componentCount | 0;
                if (object.styleCount != null)
                    message.styleCount = object.styleCount | 0;
                if (object.lastModifiedBy != null)
                    message.lastModifiedBy = String(object.lastModifiedBy);
                if (object.editorType != null)
                    message.editorType = String(object.editorType);
                if (object.trending != null)
                    message.trending = Boolean(object.trending);
                if (object.verified != null)
                    message.verified = Boolean(object.verified);
                switch (object.status) {
                default:
                    if (typeof object.status === "number") {
                        message.status = object.status;
                        break;
                    }
                    break;
                case "FIGMA_FILE_STATUS_UNSPECIFIED":
                case 0:
                    message.status = 0;
                    break;
                case "FIGMA_FILE_STATUS_STABLE":
                case 1:
                    message.status = 1;
                    break;
                case "FIGMA_FILE_STATUS_BETA":
                case 2:
                    message.status = 2;
                    break;
                case "FIGMA_FILE_STATUS_DEPRECATED":
                case 3:
                    message.status = 3;
                    break;
                case "FIGMA_FILE_STATUS_EXPERIMENTAL":
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
                case "FIGMA_FILE_SOURCE_UNSPECIFIED":
                case 0:
                    message.source = 0;
                    break;
                case "FIGMA_FILE_SOURCE_FIGMA":
                case 1:
                    message.source = 1;
                    break;
                case "FIGMA_FILE_SOURCE_FIGMA_COMMUNITY":
                case 2:
                    message.source = 2;
                    break;
                case "FIGMA_FILE_SOURCE_MANUAL":
                case 3:
                    message.source = 3;
                    break;
                }
                if (object.externalIds) {
                    if (!Array.isArray(object.externalIds))
                        throw TypeError(".figma_files.figma_file.FigmaFile.externalIds: array expected");
                    message.externalIds = [];
                    for (let i = 0; i < object.externalIds.length; ++i) {
                        if (typeof object.externalIds[i] !== "object")
                            throw TypeError(".figma_files.figma_file.FigmaFile.externalIds: object expected");
                        message.externalIds[i] = $root.figma_files.common.ExternalId.fromObject(object.externalIds[i]);
                    }
                }
                if (object.tags) {
                    if (!Array.isArray(object.tags))
                        throw TypeError(".figma_files.figma_file.FigmaFile.tags: array expected");
                    message.tags = [];
                    for (let i = 0; i < object.tags.length; ++i) {
                        if (typeof object.tags[i] !== "object")
                            throw TypeError(".figma_files.figma_file.FigmaFile.tags: object expected");
                        message.tags[i] = $root.figma_files.tag.Tag.fromObject(object.tags[i]);
                    }
                }
                if (object.metadata) {
                    if (!Array.isArray(object.metadata))
                        throw TypeError(".figma_files.figma_file.FigmaFile.metadata: array expected");
                    message.metadata = [];
                    for (let i = 0; i < object.metadata.length; ++i) {
                        if (typeof object.metadata[i] !== "object")
                            throw TypeError(".figma_files.figma_file.FigmaFile.metadata: object expected");
                        message.metadata[i] = $root.figma_files.metadata.Metadata.fromObject(object.metadata[i]);
                    }
                }
                if (object.createdAt != null) {
                    if (typeof object.createdAt !== "object")
                        throw TypeError(".figma_files.figma_file.FigmaFile.createdAt: object expected");
                    message.createdAt = $root.figma_files.common.Timestamp.fromObject(object.createdAt);
                }
                if (object.updatedAt != null) {
                    if (typeof object.updatedAt !== "object")
                        throw TypeError(".figma_files.figma_file.FigmaFile.updatedAt: object expected");
                    message.updatedAt = $root.figma_files.common.Timestamp.fromObject(object.updatedAt);
                }
                return message;
            };

            /**
             * Creates a plain object from a FigmaFile message. Also converts values to other types if specified.
             * @function toObject
             * @memberof figma_files.figma_file.FigmaFile
             * @static
             * @param {figma_files.figma_file.FigmaFile} message FigmaFile
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            FigmaFile.toObject = function toObject(message, options) {
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
                    object.type = options.enums === String ? "FIGMA_FILE_TYPE_UNSPECIFIED" : 0;
                    object.figmaUrl = "";
                    object.figmaFileKey = "";
                    object.thumbnailUrl = "";
                    object.pageCount = 0;
                    object.componentCount = 0;
                    object.styleCount = 0;
                    object.lastModifiedBy = "";
                    object.editorType = "";
                    object.trending = false;
                    object.verified = false;
                    object.status = options.enums === String ? "FIGMA_FILE_STATUS_UNSPECIFIED" : 0;
                    object.source = options.enums === String ? "FIGMA_FILE_SOURCE_UNSPECIFIED" : 0;
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
                    object.type = options.enums === String ? $root.figma_files.common.FigmaFileType[message.type] === undefined ? message.type : $root.figma_files.common.FigmaFileType[message.type] : message.type;
                if (message.figmaUrl != null && message.hasOwnProperty("figmaUrl"))
                    object.figmaUrl = message.figmaUrl;
                if (message.figmaFileKey != null && message.hasOwnProperty("figmaFileKey"))
                    object.figmaFileKey = message.figmaFileKey;
                if (message.thumbnailUrl != null && message.hasOwnProperty("thumbnailUrl"))
                    object.thumbnailUrl = message.thumbnailUrl;
                if (message.pageCount != null && message.hasOwnProperty("pageCount"))
                    object.pageCount = message.pageCount;
                if (message.componentCount != null && message.hasOwnProperty("componentCount"))
                    object.componentCount = message.componentCount;
                if (message.styleCount != null && message.hasOwnProperty("styleCount"))
                    object.styleCount = message.styleCount;
                if (message.lastModifiedBy != null && message.hasOwnProperty("lastModifiedBy"))
                    object.lastModifiedBy = message.lastModifiedBy;
                if (message.editorType != null && message.hasOwnProperty("editorType"))
                    object.editorType = message.editorType;
                if (message.trending != null && message.hasOwnProperty("trending"))
                    object.trending = message.trending;
                if (message.verified != null && message.hasOwnProperty("verified"))
                    object.verified = message.verified;
                if (message.status != null && message.hasOwnProperty("status"))
                    object.status = options.enums === String ? $root.figma_files.common.FigmaFileStatus[message.status] === undefined ? message.status : $root.figma_files.common.FigmaFileStatus[message.status] : message.status;
                if (message.source != null && message.hasOwnProperty("source"))
                    object.source = options.enums === String ? $root.figma_files.common.FigmaFileSource[message.source] === undefined ? message.source : $root.figma_files.common.FigmaFileSource[message.source] : message.source;
                if (message.externalIds && message.externalIds.length) {
                    object.externalIds = [];
                    for (let j = 0; j < message.externalIds.length; ++j)
                        object.externalIds[j] = $root.figma_files.common.ExternalId.toObject(message.externalIds[j], options);
                }
                if (message.tags && message.tags.length) {
                    object.tags = [];
                    for (let j = 0; j < message.tags.length; ++j)
                        object.tags[j] = $root.figma_files.tag.Tag.toObject(message.tags[j], options);
                }
                if (message.metadata && message.metadata.length) {
                    object.metadata = [];
                    for (let j = 0; j < message.metadata.length; ++j)
                        object.metadata[j] = $root.figma_files.metadata.Metadata.toObject(message.metadata[j], options);
                }
                if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                    object.createdAt = $root.figma_files.common.Timestamp.toObject(message.createdAt, options);
                if (message.updatedAt != null && message.hasOwnProperty("updatedAt"))
                    object.updatedAt = $root.figma_files.common.Timestamp.toObject(message.updatedAt, options);
                return object;
            };

            /**
             * Converts this FigmaFile to JSON.
             * @function toJSON
             * @memberof figma_files.figma_file.FigmaFile
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            FigmaFile.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for FigmaFile
             * @function getTypeUrl
             * @memberof figma_files.figma_file.FigmaFile
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            FigmaFile.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/figma_files.figma_file.FigmaFile";
            };

            return FigmaFile;
        })();

        figma_file.ListFigmaFilesRequest = (function() {

            /**
             * Properties of a ListFigmaFilesRequest.
             * @memberof figma_files.figma_file
             * @interface IListFigmaFilesRequest
             * @property {figma_files.common.IPaginationRequest|null} [pagination] ListFigmaFilesRequest pagination
             * @property {figma_files.common.FigmaFileType|null} [type] ListFigmaFilesRequest type
             * @property {figma_files.common.FigmaFileStatus|null} [status] ListFigmaFilesRequest status
             * @property {string|null} [search] ListFigmaFilesRequest search
             * @property {Array.<string>|null} [tags] ListFigmaFilesRequest tags
             * @property {boolean|null} [trending] ListFigmaFilesRequest trending
             * @property {boolean|null} [verified] ListFigmaFilesRequest verified
             * @property {boolean|null} [includeTags] ListFigmaFilesRequest includeTags
             * @property {boolean|null} [includeMetadata] ListFigmaFilesRequest includeMetadata
             */

            /**
             * Constructs a new ListFigmaFilesRequest.
             * @memberof figma_files.figma_file
             * @classdesc Represents a ListFigmaFilesRequest.
             * @implements IListFigmaFilesRequest
             * @constructor
             * @param {figma_files.figma_file.IListFigmaFilesRequest=} [properties] Properties to set
             */
            function ListFigmaFilesRequest(properties) {
                this.tags = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ListFigmaFilesRequest pagination.
             * @member {figma_files.common.IPaginationRequest|null|undefined} pagination
             * @memberof figma_files.figma_file.ListFigmaFilesRequest
             * @instance
             */
            ListFigmaFilesRequest.prototype.pagination = null;

            /**
             * ListFigmaFilesRequest type.
             * @member {figma_files.common.FigmaFileType} type
             * @memberof figma_files.figma_file.ListFigmaFilesRequest
             * @instance
             */
            ListFigmaFilesRequest.prototype.type = 0;

            /**
             * ListFigmaFilesRequest status.
             * @member {figma_files.common.FigmaFileStatus} status
             * @memberof figma_files.figma_file.ListFigmaFilesRequest
             * @instance
             */
            ListFigmaFilesRequest.prototype.status = 0;

            /**
             * ListFigmaFilesRequest search.
             * @member {string} search
             * @memberof figma_files.figma_file.ListFigmaFilesRequest
             * @instance
             */
            ListFigmaFilesRequest.prototype.search = "";

            /**
             * ListFigmaFilesRequest tags.
             * @member {Array.<string>} tags
             * @memberof figma_files.figma_file.ListFigmaFilesRequest
             * @instance
             */
            ListFigmaFilesRequest.prototype.tags = $util.emptyArray;

            /**
             * ListFigmaFilesRequest trending.
             * @member {boolean} trending
             * @memberof figma_files.figma_file.ListFigmaFilesRequest
             * @instance
             */
            ListFigmaFilesRequest.prototype.trending = false;

            /**
             * ListFigmaFilesRequest verified.
             * @member {boolean} verified
             * @memberof figma_files.figma_file.ListFigmaFilesRequest
             * @instance
             */
            ListFigmaFilesRequest.prototype.verified = false;

            /**
             * ListFigmaFilesRequest includeTags.
             * @member {boolean} includeTags
             * @memberof figma_files.figma_file.ListFigmaFilesRequest
             * @instance
             */
            ListFigmaFilesRequest.prototype.includeTags = false;

            /**
             * ListFigmaFilesRequest includeMetadata.
             * @member {boolean} includeMetadata
             * @memberof figma_files.figma_file.ListFigmaFilesRequest
             * @instance
             */
            ListFigmaFilesRequest.prototype.includeMetadata = false;

            /**
             * Creates a new ListFigmaFilesRequest instance using the specified properties.
             * @function create
             * @memberof figma_files.figma_file.ListFigmaFilesRequest
             * @static
             * @param {figma_files.figma_file.IListFigmaFilesRequest=} [properties] Properties to set
             * @returns {figma_files.figma_file.ListFigmaFilesRequest} ListFigmaFilesRequest instance
             */
            ListFigmaFilesRequest.create = function create(properties) {
                return new ListFigmaFilesRequest(properties);
            };

            /**
             * Encodes the specified ListFigmaFilesRequest message. Does not implicitly {@link figma_files.figma_file.ListFigmaFilesRequest.verify|verify} messages.
             * @function encode
             * @memberof figma_files.figma_file.ListFigmaFilesRequest
             * @static
             * @param {figma_files.figma_file.IListFigmaFilesRequest} message ListFigmaFilesRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ListFigmaFilesRequest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.pagination != null && Object.hasOwnProperty.call(message, "pagination"))
                    $root.figma_files.common.PaginationRequest.encode(message.pagination, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
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
             * Encodes the specified ListFigmaFilesRequest message, length delimited. Does not implicitly {@link figma_files.figma_file.ListFigmaFilesRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof figma_files.figma_file.ListFigmaFilesRequest
             * @static
             * @param {figma_files.figma_file.IListFigmaFilesRequest} message ListFigmaFilesRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ListFigmaFilesRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ListFigmaFilesRequest message from the specified reader or buffer.
             * @function decode
             * @memberof figma_files.figma_file.ListFigmaFilesRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {figma_files.figma_file.ListFigmaFilesRequest} ListFigmaFilesRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ListFigmaFilesRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_files.figma_file.ListFigmaFilesRequest();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.pagination = $root.figma_files.common.PaginationRequest.decode(reader, reader.uint32());
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
             * Decodes a ListFigmaFilesRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof figma_files.figma_file.ListFigmaFilesRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {figma_files.figma_file.ListFigmaFilesRequest} ListFigmaFilesRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ListFigmaFilesRequest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ListFigmaFilesRequest message.
             * @function verify
             * @memberof figma_files.figma_file.ListFigmaFilesRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ListFigmaFilesRequest.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.pagination != null && message.hasOwnProperty("pagination")) {
                    let error = $root.figma_files.common.PaginationRequest.verify(message.pagination);
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
                    case 4:
                    case 5:
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
             * Creates a ListFigmaFilesRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof figma_files.figma_file.ListFigmaFilesRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {figma_files.figma_file.ListFigmaFilesRequest} ListFigmaFilesRequest
             */
            ListFigmaFilesRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.figma_files.figma_file.ListFigmaFilesRequest)
                    return object;
                let message = new $root.figma_files.figma_file.ListFigmaFilesRequest();
                if (object.pagination != null) {
                    if (typeof object.pagination !== "object")
                        throw TypeError(".figma_files.figma_file.ListFigmaFilesRequest.pagination: object expected");
                    message.pagination = $root.figma_files.common.PaginationRequest.fromObject(object.pagination);
                }
                switch (object.type) {
                default:
                    if (typeof object.type === "number") {
                        message.type = object.type;
                        break;
                    }
                    break;
                case "FIGMA_FILE_TYPE_UNSPECIFIED":
                case 0:
                    message.type = 0;
                    break;
                case "FIGMA_FILE_TYPE_DESIGN_SYSTEM":
                case 1:
                    message.type = 1;
                    break;
                case "FIGMA_FILE_TYPE_COMPONENT_LIBRARY":
                case 2:
                    message.type = 2;
                    break;
                case "FIGMA_FILE_TYPE_PROTOTYPE":
                case 3:
                    message.type = 3;
                    break;
                case "FIGMA_FILE_TYPE_ILLUSTRATION":
                case 4:
                    message.type = 4;
                    break;
                case "FIGMA_FILE_TYPE_ICON_SET":
                case 5:
                    message.type = 5;
                    break;
                }
                switch (object.status) {
                default:
                    if (typeof object.status === "number") {
                        message.status = object.status;
                        break;
                    }
                    break;
                case "FIGMA_FILE_STATUS_UNSPECIFIED":
                case 0:
                    message.status = 0;
                    break;
                case "FIGMA_FILE_STATUS_STABLE":
                case 1:
                    message.status = 1;
                    break;
                case "FIGMA_FILE_STATUS_BETA":
                case 2:
                    message.status = 2;
                    break;
                case "FIGMA_FILE_STATUS_DEPRECATED":
                case 3:
                    message.status = 3;
                    break;
                case "FIGMA_FILE_STATUS_EXPERIMENTAL":
                case 4:
                    message.status = 4;
                    break;
                }
                if (object.search != null)
                    message.search = String(object.search);
                if (object.tags) {
                    if (!Array.isArray(object.tags))
                        throw TypeError(".figma_files.figma_file.ListFigmaFilesRequest.tags: array expected");
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
             * Creates a plain object from a ListFigmaFilesRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof figma_files.figma_file.ListFigmaFilesRequest
             * @static
             * @param {figma_files.figma_file.ListFigmaFilesRequest} message ListFigmaFilesRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ListFigmaFilesRequest.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.arrays || options.defaults)
                    object.tags = [];
                if (options.defaults) {
                    object.pagination = null;
                    object.type = options.enums === String ? "FIGMA_FILE_TYPE_UNSPECIFIED" : 0;
                    object.status = options.enums === String ? "FIGMA_FILE_STATUS_UNSPECIFIED" : 0;
                    object.search = "";
                    object.trending = false;
                    object.verified = false;
                    object.includeTags = false;
                    object.includeMetadata = false;
                }
                if (message.pagination != null && message.hasOwnProperty("pagination"))
                    object.pagination = $root.figma_files.common.PaginationRequest.toObject(message.pagination, options);
                if (message.type != null && message.hasOwnProperty("type"))
                    object.type = options.enums === String ? $root.figma_files.common.FigmaFileType[message.type] === undefined ? message.type : $root.figma_files.common.FigmaFileType[message.type] : message.type;
                if (message.status != null && message.hasOwnProperty("status"))
                    object.status = options.enums === String ? $root.figma_files.common.FigmaFileStatus[message.status] === undefined ? message.status : $root.figma_files.common.FigmaFileStatus[message.status] : message.status;
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
             * Converts this ListFigmaFilesRequest to JSON.
             * @function toJSON
             * @memberof figma_files.figma_file.ListFigmaFilesRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ListFigmaFilesRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ListFigmaFilesRequest
             * @function getTypeUrl
             * @memberof figma_files.figma_file.ListFigmaFilesRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ListFigmaFilesRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/figma_files.figma_file.ListFigmaFilesRequest";
            };

            return ListFigmaFilesRequest;
        })();

        figma_file.ListFigmaFilesResponse = (function() {

            /**
             * Properties of a ListFigmaFilesResponse.
             * @memberof figma_files.figma_file
             * @interface IListFigmaFilesResponse
             * @property {Array.<figma_files.figma_file.IFigmaFile>|null} [figmaFiles] ListFigmaFilesResponse figmaFiles
             * @property {figma_files.common.IPaginationResponse|null} [pagination] ListFigmaFilesResponse pagination
             */

            /**
             * Constructs a new ListFigmaFilesResponse.
             * @memberof figma_files.figma_file
             * @classdesc Represents a ListFigmaFilesResponse.
             * @implements IListFigmaFilesResponse
             * @constructor
             * @param {figma_files.figma_file.IListFigmaFilesResponse=} [properties] Properties to set
             */
            function ListFigmaFilesResponse(properties) {
                this.figmaFiles = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ListFigmaFilesResponse figmaFiles.
             * @member {Array.<figma_files.figma_file.IFigmaFile>} figmaFiles
             * @memberof figma_files.figma_file.ListFigmaFilesResponse
             * @instance
             */
            ListFigmaFilesResponse.prototype.figmaFiles = $util.emptyArray;

            /**
             * ListFigmaFilesResponse pagination.
             * @member {figma_files.common.IPaginationResponse|null|undefined} pagination
             * @memberof figma_files.figma_file.ListFigmaFilesResponse
             * @instance
             */
            ListFigmaFilesResponse.prototype.pagination = null;

            /**
             * Creates a new ListFigmaFilesResponse instance using the specified properties.
             * @function create
             * @memberof figma_files.figma_file.ListFigmaFilesResponse
             * @static
             * @param {figma_files.figma_file.IListFigmaFilesResponse=} [properties] Properties to set
             * @returns {figma_files.figma_file.ListFigmaFilesResponse} ListFigmaFilesResponse instance
             */
            ListFigmaFilesResponse.create = function create(properties) {
                return new ListFigmaFilesResponse(properties);
            };

            /**
             * Encodes the specified ListFigmaFilesResponse message. Does not implicitly {@link figma_files.figma_file.ListFigmaFilesResponse.verify|verify} messages.
             * @function encode
             * @memberof figma_files.figma_file.ListFigmaFilesResponse
             * @static
             * @param {figma_files.figma_file.IListFigmaFilesResponse} message ListFigmaFilesResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ListFigmaFilesResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.figmaFiles != null && message.figmaFiles.length)
                    for (let i = 0; i < message.figmaFiles.length; ++i)
                        $root.figma_files.figma_file.FigmaFile.encode(message.figmaFiles[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                if (message.pagination != null && Object.hasOwnProperty.call(message, "pagination"))
                    $root.figma_files.common.PaginationResponse.encode(message.pagination, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified ListFigmaFilesResponse message, length delimited. Does not implicitly {@link figma_files.figma_file.ListFigmaFilesResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof figma_files.figma_file.ListFigmaFilesResponse
             * @static
             * @param {figma_files.figma_file.IListFigmaFilesResponse} message ListFigmaFilesResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ListFigmaFilesResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ListFigmaFilesResponse message from the specified reader or buffer.
             * @function decode
             * @memberof figma_files.figma_file.ListFigmaFilesResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {figma_files.figma_file.ListFigmaFilesResponse} ListFigmaFilesResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ListFigmaFilesResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_files.figma_file.ListFigmaFilesResponse();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            if (!(message.figmaFiles && message.figmaFiles.length))
                                message.figmaFiles = [];
                            message.figmaFiles.push($root.figma_files.figma_file.FigmaFile.decode(reader, reader.uint32()));
                            break;
                        }
                    case 2: {
                            message.pagination = $root.figma_files.common.PaginationResponse.decode(reader, reader.uint32());
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
             * Decodes a ListFigmaFilesResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof figma_files.figma_file.ListFigmaFilesResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {figma_files.figma_file.ListFigmaFilesResponse} ListFigmaFilesResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ListFigmaFilesResponse.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ListFigmaFilesResponse message.
             * @function verify
             * @memberof figma_files.figma_file.ListFigmaFilesResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ListFigmaFilesResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.figmaFiles != null && message.hasOwnProperty("figmaFiles")) {
                    if (!Array.isArray(message.figmaFiles))
                        return "figmaFiles: array expected";
                    for (let i = 0; i < message.figmaFiles.length; ++i) {
                        let error = $root.figma_files.figma_file.FigmaFile.verify(message.figmaFiles[i]);
                        if (error)
                            return "figmaFiles." + error;
                    }
                }
                if (message.pagination != null && message.hasOwnProperty("pagination")) {
                    let error = $root.figma_files.common.PaginationResponse.verify(message.pagination);
                    if (error)
                        return "pagination." + error;
                }
                return null;
            };

            /**
             * Creates a ListFigmaFilesResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof figma_files.figma_file.ListFigmaFilesResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {figma_files.figma_file.ListFigmaFilesResponse} ListFigmaFilesResponse
             */
            ListFigmaFilesResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.figma_files.figma_file.ListFigmaFilesResponse)
                    return object;
                let message = new $root.figma_files.figma_file.ListFigmaFilesResponse();
                if (object.figmaFiles) {
                    if (!Array.isArray(object.figmaFiles))
                        throw TypeError(".figma_files.figma_file.ListFigmaFilesResponse.figmaFiles: array expected");
                    message.figmaFiles = [];
                    for (let i = 0; i < object.figmaFiles.length; ++i) {
                        if (typeof object.figmaFiles[i] !== "object")
                            throw TypeError(".figma_files.figma_file.ListFigmaFilesResponse.figmaFiles: object expected");
                        message.figmaFiles[i] = $root.figma_files.figma_file.FigmaFile.fromObject(object.figmaFiles[i]);
                    }
                }
                if (object.pagination != null) {
                    if (typeof object.pagination !== "object")
                        throw TypeError(".figma_files.figma_file.ListFigmaFilesResponse.pagination: object expected");
                    message.pagination = $root.figma_files.common.PaginationResponse.fromObject(object.pagination);
                }
                return message;
            };

            /**
             * Creates a plain object from a ListFigmaFilesResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof figma_files.figma_file.ListFigmaFilesResponse
             * @static
             * @param {figma_files.figma_file.ListFigmaFilesResponse} message ListFigmaFilesResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ListFigmaFilesResponse.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.arrays || options.defaults)
                    object.figmaFiles = [];
                if (options.defaults)
                    object.pagination = null;
                if (message.figmaFiles && message.figmaFiles.length) {
                    object.figmaFiles = [];
                    for (let j = 0; j < message.figmaFiles.length; ++j)
                        object.figmaFiles[j] = $root.figma_files.figma_file.FigmaFile.toObject(message.figmaFiles[j], options);
                }
                if (message.pagination != null && message.hasOwnProperty("pagination"))
                    object.pagination = $root.figma_files.common.PaginationResponse.toObject(message.pagination, options);
                return object;
            };

            /**
             * Converts this ListFigmaFilesResponse to JSON.
             * @function toJSON
             * @memberof figma_files.figma_file.ListFigmaFilesResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ListFigmaFilesResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ListFigmaFilesResponse
             * @function getTypeUrl
             * @memberof figma_files.figma_file.ListFigmaFilesResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ListFigmaFilesResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/figma_files.figma_file.ListFigmaFilesResponse";
            };

            return ListFigmaFilesResponse;
        })();

        figma_file.GetFigmaFileRequest = (function() {

            /**
             * Properties of a GetFigmaFileRequest.
             * @memberof figma_files.figma_file
             * @interface IGetFigmaFileRequest
             * @property {string|null} [id] GetFigmaFileRequest id
             * @property {boolean|null} [includeTags] GetFigmaFileRequest includeTags
             * @property {boolean|null} [includeMetadata] GetFigmaFileRequest includeMetadata
             */

            /**
             * Constructs a new GetFigmaFileRequest.
             * @memberof figma_files.figma_file
             * @classdesc Represents a GetFigmaFileRequest.
             * @implements IGetFigmaFileRequest
             * @constructor
             * @param {figma_files.figma_file.IGetFigmaFileRequest=} [properties] Properties to set
             */
            function GetFigmaFileRequest(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * GetFigmaFileRequest id.
             * @member {string} id
             * @memberof figma_files.figma_file.GetFigmaFileRequest
             * @instance
             */
            GetFigmaFileRequest.prototype.id = "";

            /**
             * GetFigmaFileRequest includeTags.
             * @member {boolean} includeTags
             * @memberof figma_files.figma_file.GetFigmaFileRequest
             * @instance
             */
            GetFigmaFileRequest.prototype.includeTags = false;

            /**
             * GetFigmaFileRequest includeMetadata.
             * @member {boolean} includeMetadata
             * @memberof figma_files.figma_file.GetFigmaFileRequest
             * @instance
             */
            GetFigmaFileRequest.prototype.includeMetadata = false;

            /**
             * Creates a new GetFigmaFileRequest instance using the specified properties.
             * @function create
             * @memberof figma_files.figma_file.GetFigmaFileRequest
             * @static
             * @param {figma_files.figma_file.IGetFigmaFileRequest=} [properties] Properties to set
             * @returns {figma_files.figma_file.GetFigmaFileRequest} GetFigmaFileRequest instance
             */
            GetFigmaFileRequest.create = function create(properties) {
                return new GetFigmaFileRequest(properties);
            };

            /**
             * Encodes the specified GetFigmaFileRequest message. Does not implicitly {@link figma_files.figma_file.GetFigmaFileRequest.verify|verify} messages.
             * @function encode
             * @memberof figma_files.figma_file.GetFigmaFileRequest
             * @static
             * @param {figma_files.figma_file.IGetFigmaFileRequest} message GetFigmaFileRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            GetFigmaFileRequest.encode = function encode(message, writer) {
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
             * Encodes the specified GetFigmaFileRequest message, length delimited. Does not implicitly {@link figma_files.figma_file.GetFigmaFileRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof figma_files.figma_file.GetFigmaFileRequest
             * @static
             * @param {figma_files.figma_file.IGetFigmaFileRequest} message GetFigmaFileRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            GetFigmaFileRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a GetFigmaFileRequest message from the specified reader or buffer.
             * @function decode
             * @memberof figma_files.figma_file.GetFigmaFileRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {figma_files.figma_file.GetFigmaFileRequest} GetFigmaFileRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            GetFigmaFileRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_files.figma_file.GetFigmaFileRequest();
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
             * Decodes a GetFigmaFileRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof figma_files.figma_file.GetFigmaFileRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {figma_files.figma_file.GetFigmaFileRequest} GetFigmaFileRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            GetFigmaFileRequest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a GetFigmaFileRequest message.
             * @function verify
             * @memberof figma_files.figma_file.GetFigmaFileRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            GetFigmaFileRequest.verify = function verify(message) {
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
             * Creates a GetFigmaFileRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof figma_files.figma_file.GetFigmaFileRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {figma_files.figma_file.GetFigmaFileRequest} GetFigmaFileRequest
             */
            GetFigmaFileRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.figma_files.figma_file.GetFigmaFileRequest)
                    return object;
                let message = new $root.figma_files.figma_file.GetFigmaFileRequest();
                if (object.id != null)
                    message.id = String(object.id);
                if (object.includeTags != null)
                    message.includeTags = Boolean(object.includeTags);
                if (object.includeMetadata != null)
                    message.includeMetadata = Boolean(object.includeMetadata);
                return message;
            };

            /**
             * Creates a plain object from a GetFigmaFileRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof figma_files.figma_file.GetFigmaFileRequest
             * @static
             * @param {figma_files.figma_file.GetFigmaFileRequest} message GetFigmaFileRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            GetFigmaFileRequest.toObject = function toObject(message, options) {
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
             * Converts this GetFigmaFileRequest to JSON.
             * @function toJSON
             * @memberof figma_files.figma_file.GetFigmaFileRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            GetFigmaFileRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for GetFigmaFileRequest
             * @function getTypeUrl
             * @memberof figma_files.figma_file.GetFigmaFileRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            GetFigmaFileRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/figma_files.figma_file.GetFigmaFileRequest";
            };

            return GetFigmaFileRequest;
        })();

        figma_file.GetFigmaFileResponse = (function() {

            /**
             * Properties of a GetFigmaFileResponse.
             * @memberof figma_files.figma_file
             * @interface IGetFigmaFileResponse
             * @property {figma_files.figma_file.IFigmaFile|null} [figmaFile] GetFigmaFileResponse figmaFile
             */

            /**
             * Constructs a new GetFigmaFileResponse.
             * @memberof figma_files.figma_file
             * @classdesc Represents a GetFigmaFileResponse.
             * @implements IGetFigmaFileResponse
             * @constructor
             * @param {figma_files.figma_file.IGetFigmaFileResponse=} [properties] Properties to set
             */
            function GetFigmaFileResponse(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * GetFigmaFileResponse figmaFile.
             * @member {figma_files.figma_file.IFigmaFile|null|undefined} figmaFile
             * @memberof figma_files.figma_file.GetFigmaFileResponse
             * @instance
             */
            GetFigmaFileResponse.prototype.figmaFile = null;

            /**
             * Creates a new GetFigmaFileResponse instance using the specified properties.
             * @function create
             * @memberof figma_files.figma_file.GetFigmaFileResponse
             * @static
             * @param {figma_files.figma_file.IGetFigmaFileResponse=} [properties] Properties to set
             * @returns {figma_files.figma_file.GetFigmaFileResponse} GetFigmaFileResponse instance
             */
            GetFigmaFileResponse.create = function create(properties) {
                return new GetFigmaFileResponse(properties);
            };

            /**
             * Encodes the specified GetFigmaFileResponse message. Does not implicitly {@link figma_files.figma_file.GetFigmaFileResponse.verify|verify} messages.
             * @function encode
             * @memberof figma_files.figma_file.GetFigmaFileResponse
             * @static
             * @param {figma_files.figma_file.IGetFigmaFileResponse} message GetFigmaFileResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            GetFigmaFileResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.figmaFile != null && Object.hasOwnProperty.call(message, "figmaFile"))
                    $root.figma_files.figma_file.FigmaFile.encode(message.figmaFile, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified GetFigmaFileResponse message, length delimited. Does not implicitly {@link figma_files.figma_file.GetFigmaFileResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof figma_files.figma_file.GetFigmaFileResponse
             * @static
             * @param {figma_files.figma_file.IGetFigmaFileResponse} message GetFigmaFileResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            GetFigmaFileResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a GetFigmaFileResponse message from the specified reader or buffer.
             * @function decode
             * @memberof figma_files.figma_file.GetFigmaFileResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {figma_files.figma_file.GetFigmaFileResponse} GetFigmaFileResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            GetFigmaFileResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_files.figma_file.GetFigmaFileResponse();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.figmaFile = $root.figma_files.figma_file.FigmaFile.decode(reader, reader.uint32());
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
             * Decodes a GetFigmaFileResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof figma_files.figma_file.GetFigmaFileResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {figma_files.figma_file.GetFigmaFileResponse} GetFigmaFileResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            GetFigmaFileResponse.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a GetFigmaFileResponse message.
             * @function verify
             * @memberof figma_files.figma_file.GetFigmaFileResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            GetFigmaFileResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.figmaFile != null && message.hasOwnProperty("figmaFile")) {
                    let error = $root.figma_files.figma_file.FigmaFile.verify(message.figmaFile);
                    if (error)
                        return "figmaFile." + error;
                }
                return null;
            };

            /**
             * Creates a GetFigmaFileResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof figma_files.figma_file.GetFigmaFileResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {figma_files.figma_file.GetFigmaFileResponse} GetFigmaFileResponse
             */
            GetFigmaFileResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.figma_files.figma_file.GetFigmaFileResponse)
                    return object;
                let message = new $root.figma_files.figma_file.GetFigmaFileResponse();
                if (object.figmaFile != null) {
                    if (typeof object.figmaFile !== "object")
                        throw TypeError(".figma_files.figma_file.GetFigmaFileResponse.figmaFile: object expected");
                    message.figmaFile = $root.figma_files.figma_file.FigmaFile.fromObject(object.figmaFile);
                }
                return message;
            };

            /**
             * Creates a plain object from a GetFigmaFileResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof figma_files.figma_file.GetFigmaFileResponse
             * @static
             * @param {figma_files.figma_file.GetFigmaFileResponse} message GetFigmaFileResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            GetFigmaFileResponse.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults)
                    object.figmaFile = null;
                if (message.figmaFile != null && message.hasOwnProperty("figmaFile"))
                    object.figmaFile = $root.figma_files.figma_file.FigmaFile.toObject(message.figmaFile, options);
                return object;
            };

            /**
             * Converts this GetFigmaFileResponse to JSON.
             * @function toJSON
             * @memberof figma_files.figma_file.GetFigmaFileResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            GetFigmaFileResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for GetFigmaFileResponse
             * @function getTypeUrl
             * @memberof figma_files.figma_file.GetFigmaFileResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            GetFigmaFileResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/figma_files.figma_file.GetFigmaFileResponse";
            };

            return GetFigmaFileResponse;
        })();

        figma_file.CreateFigmaFileRequest = (function() {

            /**
             * Properties of a CreateFigmaFileRequest.
             * @memberof figma_files.figma_file
             * @interface ICreateFigmaFileRequest
             * @property {string|null} [name] CreateFigmaFileRequest name
             * @property {string|null} [description] CreateFigmaFileRequest description
             * @property {figma_files.common.FigmaFileType|null} [type] CreateFigmaFileRequest type
             * @property {string|null} [figmaUrl] CreateFigmaFileRequest figmaUrl
             * @property {string|null} [figmaFileKey] CreateFigmaFileRequest figmaFileKey
             * @property {string|null} [thumbnailUrl] CreateFigmaFileRequest thumbnailUrl
             * @property {number|null} [pageCount] CreateFigmaFileRequest pageCount
             * @property {number|null} [componentCount] CreateFigmaFileRequest componentCount
             * @property {number|null} [styleCount] CreateFigmaFileRequest styleCount
             * @property {string|null} [lastModifiedBy] CreateFigmaFileRequest lastModifiedBy
             * @property {string|null} [editorType] CreateFigmaFileRequest editorType
             * @property {boolean|null} [trending] CreateFigmaFileRequest trending
             * @property {boolean|null} [verified] CreateFigmaFileRequest verified
             * @property {figma_files.common.FigmaFileStatus|null} [status] CreateFigmaFileRequest status
             * @property {figma_files.common.FigmaFileSource|null} [source] CreateFigmaFileRequest source
             * @property {Array.<figma_files.common.IExternalId>|null} [externalIds] CreateFigmaFileRequest externalIds
             * @property {Array.<string>|null} [tagNames] CreateFigmaFileRequest tagNames
             */

            /**
             * Constructs a new CreateFigmaFileRequest.
             * @memberof figma_files.figma_file
             * @classdesc Represents a CreateFigmaFileRequest.
             * @implements ICreateFigmaFileRequest
             * @constructor
             * @param {figma_files.figma_file.ICreateFigmaFileRequest=} [properties] Properties to set
             */
            function CreateFigmaFileRequest(properties) {
                this.externalIds = [];
                this.tagNames = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * CreateFigmaFileRequest name.
             * @member {string} name
             * @memberof figma_files.figma_file.CreateFigmaFileRequest
             * @instance
             */
            CreateFigmaFileRequest.prototype.name = "";

            /**
             * CreateFigmaFileRequest description.
             * @member {string} description
             * @memberof figma_files.figma_file.CreateFigmaFileRequest
             * @instance
             */
            CreateFigmaFileRequest.prototype.description = "";

            /**
             * CreateFigmaFileRequest type.
             * @member {figma_files.common.FigmaFileType} type
             * @memberof figma_files.figma_file.CreateFigmaFileRequest
             * @instance
             */
            CreateFigmaFileRequest.prototype.type = 0;

            /**
             * CreateFigmaFileRequest figmaUrl.
             * @member {string} figmaUrl
             * @memberof figma_files.figma_file.CreateFigmaFileRequest
             * @instance
             */
            CreateFigmaFileRequest.prototype.figmaUrl = "";

            /**
             * CreateFigmaFileRequest figmaFileKey.
             * @member {string} figmaFileKey
             * @memberof figma_files.figma_file.CreateFigmaFileRequest
             * @instance
             */
            CreateFigmaFileRequest.prototype.figmaFileKey = "";

            /**
             * CreateFigmaFileRequest thumbnailUrl.
             * @member {string} thumbnailUrl
             * @memberof figma_files.figma_file.CreateFigmaFileRequest
             * @instance
             */
            CreateFigmaFileRequest.prototype.thumbnailUrl = "";

            /**
             * CreateFigmaFileRequest pageCount.
             * @member {number} pageCount
             * @memberof figma_files.figma_file.CreateFigmaFileRequest
             * @instance
             */
            CreateFigmaFileRequest.prototype.pageCount = 0;

            /**
             * CreateFigmaFileRequest componentCount.
             * @member {number} componentCount
             * @memberof figma_files.figma_file.CreateFigmaFileRequest
             * @instance
             */
            CreateFigmaFileRequest.prototype.componentCount = 0;

            /**
             * CreateFigmaFileRequest styleCount.
             * @member {number} styleCount
             * @memberof figma_files.figma_file.CreateFigmaFileRequest
             * @instance
             */
            CreateFigmaFileRequest.prototype.styleCount = 0;

            /**
             * CreateFigmaFileRequest lastModifiedBy.
             * @member {string} lastModifiedBy
             * @memberof figma_files.figma_file.CreateFigmaFileRequest
             * @instance
             */
            CreateFigmaFileRequest.prototype.lastModifiedBy = "";

            /**
             * CreateFigmaFileRequest editorType.
             * @member {string} editorType
             * @memberof figma_files.figma_file.CreateFigmaFileRequest
             * @instance
             */
            CreateFigmaFileRequest.prototype.editorType = "";

            /**
             * CreateFigmaFileRequest trending.
             * @member {boolean} trending
             * @memberof figma_files.figma_file.CreateFigmaFileRequest
             * @instance
             */
            CreateFigmaFileRequest.prototype.trending = false;

            /**
             * CreateFigmaFileRequest verified.
             * @member {boolean} verified
             * @memberof figma_files.figma_file.CreateFigmaFileRequest
             * @instance
             */
            CreateFigmaFileRequest.prototype.verified = false;

            /**
             * CreateFigmaFileRequest status.
             * @member {figma_files.common.FigmaFileStatus} status
             * @memberof figma_files.figma_file.CreateFigmaFileRequest
             * @instance
             */
            CreateFigmaFileRequest.prototype.status = 0;

            /**
             * CreateFigmaFileRequest source.
             * @member {figma_files.common.FigmaFileSource} source
             * @memberof figma_files.figma_file.CreateFigmaFileRequest
             * @instance
             */
            CreateFigmaFileRequest.prototype.source = 0;

            /**
             * CreateFigmaFileRequest externalIds.
             * @member {Array.<figma_files.common.IExternalId>} externalIds
             * @memberof figma_files.figma_file.CreateFigmaFileRequest
             * @instance
             */
            CreateFigmaFileRequest.prototype.externalIds = $util.emptyArray;

            /**
             * CreateFigmaFileRequest tagNames.
             * @member {Array.<string>} tagNames
             * @memberof figma_files.figma_file.CreateFigmaFileRequest
             * @instance
             */
            CreateFigmaFileRequest.prototype.tagNames = $util.emptyArray;

            /**
             * Creates a new CreateFigmaFileRequest instance using the specified properties.
             * @function create
             * @memberof figma_files.figma_file.CreateFigmaFileRequest
             * @static
             * @param {figma_files.figma_file.ICreateFigmaFileRequest=} [properties] Properties to set
             * @returns {figma_files.figma_file.CreateFigmaFileRequest} CreateFigmaFileRequest instance
             */
            CreateFigmaFileRequest.create = function create(properties) {
                return new CreateFigmaFileRequest(properties);
            };

            /**
             * Encodes the specified CreateFigmaFileRequest message. Does not implicitly {@link figma_files.figma_file.CreateFigmaFileRequest.verify|verify} messages.
             * @function encode
             * @memberof figma_files.figma_file.CreateFigmaFileRequest
             * @static
             * @param {figma_files.figma_file.ICreateFigmaFileRequest} message CreateFigmaFileRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CreateFigmaFileRequest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
                if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.description);
                if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                    writer.uint32(/* id 3, wireType 0 =*/24).int32(message.type);
                if (message.figmaUrl != null && Object.hasOwnProperty.call(message, "figmaUrl"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.figmaUrl);
                if (message.figmaFileKey != null && Object.hasOwnProperty.call(message, "figmaFileKey"))
                    writer.uint32(/* id 5, wireType 2 =*/42).string(message.figmaFileKey);
                if (message.thumbnailUrl != null && Object.hasOwnProperty.call(message, "thumbnailUrl"))
                    writer.uint32(/* id 6, wireType 2 =*/50).string(message.thumbnailUrl);
                if (message.pageCount != null && Object.hasOwnProperty.call(message, "pageCount"))
                    writer.uint32(/* id 7, wireType 0 =*/56).int32(message.pageCount);
                if (message.componentCount != null && Object.hasOwnProperty.call(message, "componentCount"))
                    writer.uint32(/* id 8, wireType 0 =*/64).int32(message.componentCount);
                if (message.styleCount != null && Object.hasOwnProperty.call(message, "styleCount"))
                    writer.uint32(/* id 9, wireType 0 =*/72).int32(message.styleCount);
                if (message.lastModifiedBy != null && Object.hasOwnProperty.call(message, "lastModifiedBy"))
                    writer.uint32(/* id 10, wireType 2 =*/82).string(message.lastModifiedBy);
                if (message.editorType != null && Object.hasOwnProperty.call(message, "editorType"))
                    writer.uint32(/* id 11, wireType 2 =*/90).string(message.editorType);
                if (message.trending != null && Object.hasOwnProperty.call(message, "trending"))
                    writer.uint32(/* id 12, wireType 0 =*/96).bool(message.trending);
                if (message.verified != null && Object.hasOwnProperty.call(message, "verified"))
                    writer.uint32(/* id 13, wireType 0 =*/104).bool(message.verified);
                if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                    writer.uint32(/* id 14, wireType 0 =*/112).int32(message.status);
                if (message.source != null && Object.hasOwnProperty.call(message, "source"))
                    writer.uint32(/* id 15, wireType 0 =*/120).int32(message.source);
                if (message.externalIds != null && message.externalIds.length)
                    for (let i = 0; i < message.externalIds.length; ++i)
                        $root.figma_files.common.ExternalId.encode(message.externalIds[i], writer.uint32(/* id 16, wireType 2 =*/130).fork()).ldelim();
                if (message.tagNames != null && message.tagNames.length)
                    for (let i = 0; i < message.tagNames.length; ++i)
                        writer.uint32(/* id 17, wireType 2 =*/138).string(message.tagNames[i]);
                return writer;
            };

            /**
             * Encodes the specified CreateFigmaFileRequest message, length delimited. Does not implicitly {@link figma_files.figma_file.CreateFigmaFileRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof figma_files.figma_file.CreateFigmaFileRequest
             * @static
             * @param {figma_files.figma_file.ICreateFigmaFileRequest} message CreateFigmaFileRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CreateFigmaFileRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a CreateFigmaFileRequest message from the specified reader or buffer.
             * @function decode
             * @memberof figma_files.figma_file.CreateFigmaFileRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {figma_files.figma_file.CreateFigmaFileRequest} CreateFigmaFileRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CreateFigmaFileRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_files.figma_file.CreateFigmaFileRequest();
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
                            message.figmaUrl = reader.string();
                            break;
                        }
                    case 5: {
                            message.figmaFileKey = reader.string();
                            break;
                        }
                    case 6: {
                            message.thumbnailUrl = reader.string();
                            break;
                        }
                    case 7: {
                            message.pageCount = reader.int32();
                            break;
                        }
                    case 8: {
                            message.componentCount = reader.int32();
                            break;
                        }
                    case 9: {
                            message.styleCount = reader.int32();
                            break;
                        }
                    case 10: {
                            message.lastModifiedBy = reader.string();
                            break;
                        }
                    case 11: {
                            message.editorType = reader.string();
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
                            message.status = reader.int32();
                            break;
                        }
                    case 15: {
                            message.source = reader.int32();
                            break;
                        }
                    case 16: {
                            if (!(message.externalIds && message.externalIds.length))
                                message.externalIds = [];
                            message.externalIds.push($root.figma_files.common.ExternalId.decode(reader, reader.uint32()));
                            break;
                        }
                    case 17: {
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
             * Decodes a CreateFigmaFileRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof figma_files.figma_file.CreateFigmaFileRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {figma_files.figma_file.CreateFigmaFileRequest} CreateFigmaFileRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CreateFigmaFileRequest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a CreateFigmaFileRequest message.
             * @function verify
             * @memberof figma_files.figma_file.CreateFigmaFileRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            CreateFigmaFileRequest.verify = function verify(message) {
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
                    case 4:
                    case 5:
                        break;
                    }
                if (message.figmaUrl != null && message.hasOwnProperty("figmaUrl"))
                    if (!$util.isString(message.figmaUrl))
                        return "figmaUrl: string expected";
                if (message.figmaFileKey != null && message.hasOwnProperty("figmaFileKey"))
                    if (!$util.isString(message.figmaFileKey))
                        return "figmaFileKey: string expected";
                if (message.thumbnailUrl != null && message.hasOwnProperty("thumbnailUrl"))
                    if (!$util.isString(message.thumbnailUrl))
                        return "thumbnailUrl: string expected";
                if (message.pageCount != null && message.hasOwnProperty("pageCount"))
                    if (!$util.isInteger(message.pageCount))
                        return "pageCount: integer expected";
                if (message.componentCount != null && message.hasOwnProperty("componentCount"))
                    if (!$util.isInteger(message.componentCount))
                        return "componentCount: integer expected";
                if (message.styleCount != null && message.hasOwnProperty("styleCount"))
                    if (!$util.isInteger(message.styleCount))
                        return "styleCount: integer expected";
                if (message.lastModifiedBy != null && message.hasOwnProperty("lastModifiedBy"))
                    if (!$util.isString(message.lastModifiedBy))
                        return "lastModifiedBy: string expected";
                if (message.editorType != null && message.hasOwnProperty("editorType"))
                    if (!$util.isString(message.editorType))
                        return "editorType: string expected";
                if (message.trending != null && message.hasOwnProperty("trending"))
                    if (typeof message.trending !== "boolean")
                        return "trending: boolean expected";
                if (message.verified != null && message.hasOwnProperty("verified"))
                    if (typeof message.verified !== "boolean")
                        return "verified: boolean expected";
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
                        break;
                    }
                if (message.externalIds != null && message.hasOwnProperty("externalIds")) {
                    if (!Array.isArray(message.externalIds))
                        return "externalIds: array expected";
                    for (let i = 0; i < message.externalIds.length; ++i) {
                        let error = $root.figma_files.common.ExternalId.verify(message.externalIds[i]);
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
             * Creates a CreateFigmaFileRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof figma_files.figma_file.CreateFigmaFileRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {figma_files.figma_file.CreateFigmaFileRequest} CreateFigmaFileRequest
             */
            CreateFigmaFileRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.figma_files.figma_file.CreateFigmaFileRequest)
                    return object;
                let message = new $root.figma_files.figma_file.CreateFigmaFileRequest();
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
                case "FIGMA_FILE_TYPE_UNSPECIFIED":
                case 0:
                    message.type = 0;
                    break;
                case "FIGMA_FILE_TYPE_DESIGN_SYSTEM":
                case 1:
                    message.type = 1;
                    break;
                case "FIGMA_FILE_TYPE_COMPONENT_LIBRARY":
                case 2:
                    message.type = 2;
                    break;
                case "FIGMA_FILE_TYPE_PROTOTYPE":
                case 3:
                    message.type = 3;
                    break;
                case "FIGMA_FILE_TYPE_ILLUSTRATION":
                case 4:
                    message.type = 4;
                    break;
                case "FIGMA_FILE_TYPE_ICON_SET":
                case 5:
                    message.type = 5;
                    break;
                }
                if (object.figmaUrl != null)
                    message.figmaUrl = String(object.figmaUrl);
                if (object.figmaFileKey != null)
                    message.figmaFileKey = String(object.figmaFileKey);
                if (object.thumbnailUrl != null)
                    message.thumbnailUrl = String(object.thumbnailUrl);
                if (object.pageCount != null)
                    message.pageCount = object.pageCount | 0;
                if (object.componentCount != null)
                    message.componentCount = object.componentCount | 0;
                if (object.styleCount != null)
                    message.styleCount = object.styleCount | 0;
                if (object.lastModifiedBy != null)
                    message.lastModifiedBy = String(object.lastModifiedBy);
                if (object.editorType != null)
                    message.editorType = String(object.editorType);
                if (object.trending != null)
                    message.trending = Boolean(object.trending);
                if (object.verified != null)
                    message.verified = Boolean(object.verified);
                switch (object.status) {
                default:
                    if (typeof object.status === "number") {
                        message.status = object.status;
                        break;
                    }
                    break;
                case "FIGMA_FILE_STATUS_UNSPECIFIED":
                case 0:
                    message.status = 0;
                    break;
                case "FIGMA_FILE_STATUS_STABLE":
                case 1:
                    message.status = 1;
                    break;
                case "FIGMA_FILE_STATUS_BETA":
                case 2:
                    message.status = 2;
                    break;
                case "FIGMA_FILE_STATUS_DEPRECATED":
                case 3:
                    message.status = 3;
                    break;
                case "FIGMA_FILE_STATUS_EXPERIMENTAL":
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
                case "FIGMA_FILE_SOURCE_UNSPECIFIED":
                case 0:
                    message.source = 0;
                    break;
                case "FIGMA_FILE_SOURCE_FIGMA":
                case 1:
                    message.source = 1;
                    break;
                case "FIGMA_FILE_SOURCE_FIGMA_COMMUNITY":
                case 2:
                    message.source = 2;
                    break;
                case "FIGMA_FILE_SOURCE_MANUAL":
                case 3:
                    message.source = 3;
                    break;
                }
                if (object.externalIds) {
                    if (!Array.isArray(object.externalIds))
                        throw TypeError(".figma_files.figma_file.CreateFigmaFileRequest.externalIds: array expected");
                    message.externalIds = [];
                    for (let i = 0; i < object.externalIds.length; ++i) {
                        if (typeof object.externalIds[i] !== "object")
                            throw TypeError(".figma_files.figma_file.CreateFigmaFileRequest.externalIds: object expected");
                        message.externalIds[i] = $root.figma_files.common.ExternalId.fromObject(object.externalIds[i]);
                    }
                }
                if (object.tagNames) {
                    if (!Array.isArray(object.tagNames))
                        throw TypeError(".figma_files.figma_file.CreateFigmaFileRequest.tagNames: array expected");
                    message.tagNames = [];
                    for (let i = 0; i < object.tagNames.length; ++i)
                        message.tagNames[i] = String(object.tagNames[i]);
                }
                return message;
            };

            /**
             * Creates a plain object from a CreateFigmaFileRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof figma_files.figma_file.CreateFigmaFileRequest
             * @static
             * @param {figma_files.figma_file.CreateFigmaFileRequest} message CreateFigmaFileRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            CreateFigmaFileRequest.toObject = function toObject(message, options) {
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
                    object.type = options.enums === String ? "FIGMA_FILE_TYPE_UNSPECIFIED" : 0;
                    object.figmaUrl = "";
                    object.figmaFileKey = "";
                    object.thumbnailUrl = "";
                    object.pageCount = 0;
                    object.componentCount = 0;
                    object.styleCount = 0;
                    object.lastModifiedBy = "";
                    object.editorType = "";
                    object.trending = false;
                    object.verified = false;
                    object.status = options.enums === String ? "FIGMA_FILE_STATUS_UNSPECIFIED" : 0;
                    object.source = options.enums === String ? "FIGMA_FILE_SOURCE_UNSPECIFIED" : 0;
                }
                if (message.name != null && message.hasOwnProperty("name"))
                    object.name = message.name;
                if (message.description != null && message.hasOwnProperty("description"))
                    object.description = message.description;
                if (message.type != null && message.hasOwnProperty("type"))
                    object.type = options.enums === String ? $root.figma_files.common.FigmaFileType[message.type] === undefined ? message.type : $root.figma_files.common.FigmaFileType[message.type] : message.type;
                if (message.figmaUrl != null && message.hasOwnProperty("figmaUrl"))
                    object.figmaUrl = message.figmaUrl;
                if (message.figmaFileKey != null && message.hasOwnProperty("figmaFileKey"))
                    object.figmaFileKey = message.figmaFileKey;
                if (message.thumbnailUrl != null && message.hasOwnProperty("thumbnailUrl"))
                    object.thumbnailUrl = message.thumbnailUrl;
                if (message.pageCount != null && message.hasOwnProperty("pageCount"))
                    object.pageCount = message.pageCount;
                if (message.componentCount != null && message.hasOwnProperty("componentCount"))
                    object.componentCount = message.componentCount;
                if (message.styleCount != null && message.hasOwnProperty("styleCount"))
                    object.styleCount = message.styleCount;
                if (message.lastModifiedBy != null && message.hasOwnProperty("lastModifiedBy"))
                    object.lastModifiedBy = message.lastModifiedBy;
                if (message.editorType != null && message.hasOwnProperty("editorType"))
                    object.editorType = message.editorType;
                if (message.trending != null && message.hasOwnProperty("trending"))
                    object.trending = message.trending;
                if (message.verified != null && message.hasOwnProperty("verified"))
                    object.verified = message.verified;
                if (message.status != null && message.hasOwnProperty("status"))
                    object.status = options.enums === String ? $root.figma_files.common.FigmaFileStatus[message.status] === undefined ? message.status : $root.figma_files.common.FigmaFileStatus[message.status] : message.status;
                if (message.source != null && message.hasOwnProperty("source"))
                    object.source = options.enums === String ? $root.figma_files.common.FigmaFileSource[message.source] === undefined ? message.source : $root.figma_files.common.FigmaFileSource[message.source] : message.source;
                if (message.externalIds && message.externalIds.length) {
                    object.externalIds = [];
                    for (let j = 0; j < message.externalIds.length; ++j)
                        object.externalIds[j] = $root.figma_files.common.ExternalId.toObject(message.externalIds[j], options);
                }
                if (message.tagNames && message.tagNames.length) {
                    object.tagNames = [];
                    for (let j = 0; j < message.tagNames.length; ++j)
                        object.tagNames[j] = message.tagNames[j];
                }
                return object;
            };

            /**
             * Converts this CreateFigmaFileRequest to JSON.
             * @function toJSON
             * @memberof figma_files.figma_file.CreateFigmaFileRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            CreateFigmaFileRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for CreateFigmaFileRequest
             * @function getTypeUrl
             * @memberof figma_files.figma_file.CreateFigmaFileRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            CreateFigmaFileRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/figma_files.figma_file.CreateFigmaFileRequest";
            };

            return CreateFigmaFileRequest;
        })();

        figma_file.CreateFigmaFileResponse = (function() {

            /**
             * Properties of a CreateFigmaFileResponse.
             * @memberof figma_files.figma_file
             * @interface ICreateFigmaFileResponse
             * @property {figma_files.figma_file.IFigmaFile|null} [figmaFile] CreateFigmaFileResponse figmaFile
             */

            /**
             * Constructs a new CreateFigmaFileResponse.
             * @memberof figma_files.figma_file
             * @classdesc Represents a CreateFigmaFileResponse.
             * @implements ICreateFigmaFileResponse
             * @constructor
             * @param {figma_files.figma_file.ICreateFigmaFileResponse=} [properties] Properties to set
             */
            function CreateFigmaFileResponse(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * CreateFigmaFileResponse figmaFile.
             * @member {figma_files.figma_file.IFigmaFile|null|undefined} figmaFile
             * @memberof figma_files.figma_file.CreateFigmaFileResponse
             * @instance
             */
            CreateFigmaFileResponse.prototype.figmaFile = null;

            /**
             * Creates a new CreateFigmaFileResponse instance using the specified properties.
             * @function create
             * @memberof figma_files.figma_file.CreateFigmaFileResponse
             * @static
             * @param {figma_files.figma_file.ICreateFigmaFileResponse=} [properties] Properties to set
             * @returns {figma_files.figma_file.CreateFigmaFileResponse} CreateFigmaFileResponse instance
             */
            CreateFigmaFileResponse.create = function create(properties) {
                return new CreateFigmaFileResponse(properties);
            };

            /**
             * Encodes the specified CreateFigmaFileResponse message. Does not implicitly {@link figma_files.figma_file.CreateFigmaFileResponse.verify|verify} messages.
             * @function encode
             * @memberof figma_files.figma_file.CreateFigmaFileResponse
             * @static
             * @param {figma_files.figma_file.ICreateFigmaFileResponse} message CreateFigmaFileResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CreateFigmaFileResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.figmaFile != null && Object.hasOwnProperty.call(message, "figmaFile"))
                    $root.figma_files.figma_file.FigmaFile.encode(message.figmaFile, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified CreateFigmaFileResponse message, length delimited. Does not implicitly {@link figma_files.figma_file.CreateFigmaFileResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof figma_files.figma_file.CreateFigmaFileResponse
             * @static
             * @param {figma_files.figma_file.ICreateFigmaFileResponse} message CreateFigmaFileResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CreateFigmaFileResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a CreateFigmaFileResponse message from the specified reader or buffer.
             * @function decode
             * @memberof figma_files.figma_file.CreateFigmaFileResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {figma_files.figma_file.CreateFigmaFileResponse} CreateFigmaFileResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CreateFigmaFileResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_files.figma_file.CreateFigmaFileResponse();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.figmaFile = $root.figma_files.figma_file.FigmaFile.decode(reader, reader.uint32());
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
             * Decodes a CreateFigmaFileResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof figma_files.figma_file.CreateFigmaFileResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {figma_files.figma_file.CreateFigmaFileResponse} CreateFigmaFileResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CreateFigmaFileResponse.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a CreateFigmaFileResponse message.
             * @function verify
             * @memberof figma_files.figma_file.CreateFigmaFileResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            CreateFigmaFileResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.figmaFile != null && message.hasOwnProperty("figmaFile")) {
                    let error = $root.figma_files.figma_file.FigmaFile.verify(message.figmaFile);
                    if (error)
                        return "figmaFile." + error;
                }
                return null;
            };

            /**
             * Creates a CreateFigmaFileResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof figma_files.figma_file.CreateFigmaFileResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {figma_files.figma_file.CreateFigmaFileResponse} CreateFigmaFileResponse
             */
            CreateFigmaFileResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.figma_files.figma_file.CreateFigmaFileResponse)
                    return object;
                let message = new $root.figma_files.figma_file.CreateFigmaFileResponse();
                if (object.figmaFile != null) {
                    if (typeof object.figmaFile !== "object")
                        throw TypeError(".figma_files.figma_file.CreateFigmaFileResponse.figmaFile: object expected");
                    message.figmaFile = $root.figma_files.figma_file.FigmaFile.fromObject(object.figmaFile);
                }
                return message;
            };

            /**
             * Creates a plain object from a CreateFigmaFileResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof figma_files.figma_file.CreateFigmaFileResponse
             * @static
             * @param {figma_files.figma_file.CreateFigmaFileResponse} message CreateFigmaFileResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            CreateFigmaFileResponse.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults)
                    object.figmaFile = null;
                if (message.figmaFile != null && message.hasOwnProperty("figmaFile"))
                    object.figmaFile = $root.figma_files.figma_file.FigmaFile.toObject(message.figmaFile, options);
                return object;
            };

            /**
             * Converts this CreateFigmaFileResponse to JSON.
             * @function toJSON
             * @memberof figma_files.figma_file.CreateFigmaFileResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            CreateFigmaFileResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for CreateFigmaFileResponse
             * @function getTypeUrl
             * @memberof figma_files.figma_file.CreateFigmaFileResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            CreateFigmaFileResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/figma_files.figma_file.CreateFigmaFileResponse";
            };

            return CreateFigmaFileResponse;
        })();

        figma_file.UpdateFigmaFileRequest = (function() {

            /**
             * Properties of an UpdateFigmaFileRequest.
             * @memberof figma_files.figma_file
             * @interface IUpdateFigmaFileRequest
             * @property {string|null} [id] UpdateFigmaFileRequest id
             * @property {string|null} [name] UpdateFigmaFileRequest name
             * @property {string|null} [description] UpdateFigmaFileRequest description
             * @property {figma_files.common.FigmaFileType|null} [type] UpdateFigmaFileRequest type
             * @property {string|null} [figmaUrl] UpdateFigmaFileRequest figmaUrl
             * @property {string|null} [figmaFileKey] UpdateFigmaFileRequest figmaFileKey
             * @property {string|null} [thumbnailUrl] UpdateFigmaFileRequest thumbnailUrl
             * @property {number|null} [pageCount] UpdateFigmaFileRequest pageCount
             * @property {number|null} [componentCount] UpdateFigmaFileRequest componentCount
             * @property {number|null} [styleCount] UpdateFigmaFileRequest styleCount
             * @property {string|null} [lastModifiedBy] UpdateFigmaFileRequest lastModifiedBy
             * @property {string|null} [editorType] UpdateFigmaFileRequest editorType
             * @property {boolean|null} [trending] UpdateFigmaFileRequest trending
             * @property {boolean|null} [verified] UpdateFigmaFileRequest verified
             * @property {figma_files.common.FigmaFileStatus|null} [status] UpdateFigmaFileRequest status
             * @property {figma_files.common.FigmaFileSource|null} [source] UpdateFigmaFileRequest source
             * @property {Array.<figma_files.common.IExternalId>|null} [externalIds] UpdateFigmaFileRequest externalIds
             * @property {Array.<string>|null} [tagNames] UpdateFigmaFileRequest tagNames
             */

            /**
             * Constructs a new UpdateFigmaFileRequest.
             * @memberof figma_files.figma_file
             * @classdesc Represents an UpdateFigmaFileRequest.
             * @implements IUpdateFigmaFileRequest
             * @constructor
             * @param {figma_files.figma_file.IUpdateFigmaFileRequest=} [properties] Properties to set
             */
            function UpdateFigmaFileRequest(properties) {
                this.externalIds = [];
                this.tagNames = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * UpdateFigmaFileRequest id.
             * @member {string} id
             * @memberof figma_files.figma_file.UpdateFigmaFileRequest
             * @instance
             */
            UpdateFigmaFileRequest.prototype.id = "";

            /**
             * UpdateFigmaFileRequest name.
             * @member {string} name
             * @memberof figma_files.figma_file.UpdateFigmaFileRequest
             * @instance
             */
            UpdateFigmaFileRequest.prototype.name = "";

            /**
             * UpdateFigmaFileRequest description.
             * @member {string} description
             * @memberof figma_files.figma_file.UpdateFigmaFileRequest
             * @instance
             */
            UpdateFigmaFileRequest.prototype.description = "";

            /**
             * UpdateFigmaFileRequest type.
             * @member {figma_files.common.FigmaFileType} type
             * @memberof figma_files.figma_file.UpdateFigmaFileRequest
             * @instance
             */
            UpdateFigmaFileRequest.prototype.type = 0;

            /**
             * UpdateFigmaFileRequest figmaUrl.
             * @member {string} figmaUrl
             * @memberof figma_files.figma_file.UpdateFigmaFileRequest
             * @instance
             */
            UpdateFigmaFileRequest.prototype.figmaUrl = "";

            /**
             * UpdateFigmaFileRequest figmaFileKey.
             * @member {string} figmaFileKey
             * @memberof figma_files.figma_file.UpdateFigmaFileRequest
             * @instance
             */
            UpdateFigmaFileRequest.prototype.figmaFileKey = "";

            /**
             * UpdateFigmaFileRequest thumbnailUrl.
             * @member {string} thumbnailUrl
             * @memberof figma_files.figma_file.UpdateFigmaFileRequest
             * @instance
             */
            UpdateFigmaFileRequest.prototype.thumbnailUrl = "";

            /**
             * UpdateFigmaFileRequest pageCount.
             * @member {number} pageCount
             * @memberof figma_files.figma_file.UpdateFigmaFileRequest
             * @instance
             */
            UpdateFigmaFileRequest.prototype.pageCount = 0;

            /**
             * UpdateFigmaFileRequest componentCount.
             * @member {number} componentCount
             * @memberof figma_files.figma_file.UpdateFigmaFileRequest
             * @instance
             */
            UpdateFigmaFileRequest.prototype.componentCount = 0;

            /**
             * UpdateFigmaFileRequest styleCount.
             * @member {number} styleCount
             * @memberof figma_files.figma_file.UpdateFigmaFileRequest
             * @instance
             */
            UpdateFigmaFileRequest.prototype.styleCount = 0;

            /**
             * UpdateFigmaFileRequest lastModifiedBy.
             * @member {string} lastModifiedBy
             * @memberof figma_files.figma_file.UpdateFigmaFileRequest
             * @instance
             */
            UpdateFigmaFileRequest.prototype.lastModifiedBy = "";

            /**
             * UpdateFigmaFileRequest editorType.
             * @member {string} editorType
             * @memberof figma_files.figma_file.UpdateFigmaFileRequest
             * @instance
             */
            UpdateFigmaFileRequest.prototype.editorType = "";

            /**
             * UpdateFigmaFileRequest trending.
             * @member {boolean} trending
             * @memberof figma_files.figma_file.UpdateFigmaFileRequest
             * @instance
             */
            UpdateFigmaFileRequest.prototype.trending = false;

            /**
             * UpdateFigmaFileRequest verified.
             * @member {boolean} verified
             * @memberof figma_files.figma_file.UpdateFigmaFileRequest
             * @instance
             */
            UpdateFigmaFileRequest.prototype.verified = false;

            /**
             * UpdateFigmaFileRequest status.
             * @member {figma_files.common.FigmaFileStatus} status
             * @memberof figma_files.figma_file.UpdateFigmaFileRequest
             * @instance
             */
            UpdateFigmaFileRequest.prototype.status = 0;

            /**
             * UpdateFigmaFileRequest source.
             * @member {figma_files.common.FigmaFileSource} source
             * @memberof figma_files.figma_file.UpdateFigmaFileRequest
             * @instance
             */
            UpdateFigmaFileRequest.prototype.source = 0;

            /**
             * UpdateFigmaFileRequest externalIds.
             * @member {Array.<figma_files.common.IExternalId>} externalIds
             * @memberof figma_files.figma_file.UpdateFigmaFileRequest
             * @instance
             */
            UpdateFigmaFileRequest.prototype.externalIds = $util.emptyArray;

            /**
             * UpdateFigmaFileRequest tagNames.
             * @member {Array.<string>} tagNames
             * @memberof figma_files.figma_file.UpdateFigmaFileRequest
             * @instance
             */
            UpdateFigmaFileRequest.prototype.tagNames = $util.emptyArray;

            /**
             * Creates a new UpdateFigmaFileRequest instance using the specified properties.
             * @function create
             * @memberof figma_files.figma_file.UpdateFigmaFileRequest
             * @static
             * @param {figma_files.figma_file.IUpdateFigmaFileRequest=} [properties] Properties to set
             * @returns {figma_files.figma_file.UpdateFigmaFileRequest} UpdateFigmaFileRequest instance
             */
            UpdateFigmaFileRequest.create = function create(properties) {
                return new UpdateFigmaFileRequest(properties);
            };

            /**
             * Encodes the specified UpdateFigmaFileRequest message. Does not implicitly {@link figma_files.figma_file.UpdateFigmaFileRequest.verify|verify} messages.
             * @function encode
             * @memberof figma_files.figma_file.UpdateFigmaFileRequest
             * @static
             * @param {figma_files.figma_file.IUpdateFigmaFileRequest} message UpdateFigmaFileRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            UpdateFigmaFileRequest.encode = function encode(message, writer) {
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
                if (message.figmaUrl != null && Object.hasOwnProperty.call(message, "figmaUrl"))
                    writer.uint32(/* id 5, wireType 2 =*/42).string(message.figmaUrl);
                if (message.figmaFileKey != null && Object.hasOwnProperty.call(message, "figmaFileKey"))
                    writer.uint32(/* id 6, wireType 2 =*/50).string(message.figmaFileKey);
                if (message.thumbnailUrl != null && Object.hasOwnProperty.call(message, "thumbnailUrl"))
                    writer.uint32(/* id 7, wireType 2 =*/58).string(message.thumbnailUrl);
                if (message.pageCount != null && Object.hasOwnProperty.call(message, "pageCount"))
                    writer.uint32(/* id 8, wireType 0 =*/64).int32(message.pageCount);
                if (message.componentCount != null && Object.hasOwnProperty.call(message, "componentCount"))
                    writer.uint32(/* id 9, wireType 0 =*/72).int32(message.componentCount);
                if (message.styleCount != null && Object.hasOwnProperty.call(message, "styleCount"))
                    writer.uint32(/* id 10, wireType 0 =*/80).int32(message.styleCount);
                if (message.lastModifiedBy != null && Object.hasOwnProperty.call(message, "lastModifiedBy"))
                    writer.uint32(/* id 11, wireType 2 =*/90).string(message.lastModifiedBy);
                if (message.editorType != null && Object.hasOwnProperty.call(message, "editorType"))
                    writer.uint32(/* id 12, wireType 2 =*/98).string(message.editorType);
                if (message.trending != null && Object.hasOwnProperty.call(message, "trending"))
                    writer.uint32(/* id 13, wireType 0 =*/104).bool(message.trending);
                if (message.verified != null && Object.hasOwnProperty.call(message, "verified"))
                    writer.uint32(/* id 14, wireType 0 =*/112).bool(message.verified);
                if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                    writer.uint32(/* id 15, wireType 0 =*/120).int32(message.status);
                if (message.source != null && Object.hasOwnProperty.call(message, "source"))
                    writer.uint32(/* id 16, wireType 0 =*/128).int32(message.source);
                if (message.externalIds != null && message.externalIds.length)
                    for (let i = 0; i < message.externalIds.length; ++i)
                        $root.figma_files.common.ExternalId.encode(message.externalIds[i], writer.uint32(/* id 17, wireType 2 =*/138).fork()).ldelim();
                if (message.tagNames != null && message.tagNames.length)
                    for (let i = 0; i < message.tagNames.length; ++i)
                        writer.uint32(/* id 18, wireType 2 =*/146).string(message.tagNames[i]);
                return writer;
            };

            /**
             * Encodes the specified UpdateFigmaFileRequest message, length delimited. Does not implicitly {@link figma_files.figma_file.UpdateFigmaFileRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof figma_files.figma_file.UpdateFigmaFileRequest
             * @static
             * @param {figma_files.figma_file.IUpdateFigmaFileRequest} message UpdateFigmaFileRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            UpdateFigmaFileRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an UpdateFigmaFileRequest message from the specified reader or buffer.
             * @function decode
             * @memberof figma_files.figma_file.UpdateFigmaFileRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {figma_files.figma_file.UpdateFigmaFileRequest} UpdateFigmaFileRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            UpdateFigmaFileRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_files.figma_file.UpdateFigmaFileRequest();
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
                            message.figmaUrl = reader.string();
                            break;
                        }
                    case 6: {
                            message.figmaFileKey = reader.string();
                            break;
                        }
                    case 7: {
                            message.thumbnailUrl = reader.string();
                            break;
                        }
                    case 8: {
                            message.pageCount = reader.int32();
                            break;
                        }
                    case 9: {
                            message.componentCount = reader.int32();
                            break;
                        }
                    case 10: {
                            message.styleCount = reader.int32();
                            break;
                        }
                    case 11: {
                            message.lastModifiedBy = reader.string();
                            break;
                        }
                    case 12: {
                            message.editorType = reader.string();
                            break;
                        }
                    case 13: {
                            message.trending = reader.bool();
                            break;
                        }
                    case 14: {
                            message.verified = reader.bool();
                            break;
                        }
                    case 15: {
                            message.status = reader.int32();
                            break;
                        }
                    case 16: {
                            message.source = reader.int32();
                            break;
                        }
                    case 17: {
                            if (!(message.externalIds && message.externalIds.length))
                                message.externalIds = [];
                            message.externalIds.push($root.figma_files.common.ExternalId.decode(reader, reader.uint32()));
                            break;
                        }
                    case 18: {
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
             * Decodes an UpdateFigmaFileRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof figma_files.figma_file.UpdateFigmaFileRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {figma_files.figma_file.UpdateFigmaFileRequest} UpdateFigmaFileRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            UpdateFigmaFileRequest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an UpdateFigmaFileRequest message.
             * @function verify
             * @memberof figma_files.figma_file.UpdateFigmaFileRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            UpdateFigmaFileRequest.verify = function verify(message) {
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
                    case 4:
                    case 5:
                        break;
                    }
                if (message.figmaUrl != null && message.hasOwnProperty("figmaUrl"))
                    if (!$util.isString(message.figmaUrl))
                        return "figmaUrl: string expected";
                if (message.figmaFileKey != null && message.hasOwnProperty("figmaFileKey"))
                    if (!$util.isString(message.figmaFileKey))
                        return "figmaFileKey: string expected";
                if (message.thumbnailUrl != null && message.hasOwnProperty("thumbnailUrl"))
                    if (!$util.isString(message.thumbnailUrl))
                        return "thumbnailUrl: string expected";
                if (message.pageCount != null && message.hasOwnProperty("pageCount"))
                    if (!$util.isInteger(message.pageCount))
                        return "pageCount: integer expected";
                if (message.componentCount != null && message.hasOwnProperty("componentCount"))
                    if (!$util.isInteger(message.componentCount))
                        return "componentCount: integer expected";
                if (message.styleCount != null && message.hasOwnProperty("styleCount"))
                    if (!$util.isInteger(message.styleCount))
                        return "styleCount: integer expected";
                if (message.lastModifiedBy != null && message.hasOwnProperty("lastModifiedBy"))
                    if (!$util.isString(message.lastModifiedBy))
                        return "lastModifiedBy: string expected";
                if (message.editorType != null && message.hasOwnProperty("editorType"))
                    if (!$util.isString(message.editorType))
                        return "editorType: string expected";
                if (message.trending != null && message.hasOwnProperty("trending"))
                    if (typeof message.trending !== "boolean")
                        return "trending: boolean expected";
                if (message.verified != null && message.hasOwnProperty("verified"))
                    if (typeof message.verified !== "boolean")
                        return "verified: boolean expected";
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
                        break;
                    }
                if (message.externalIds != null && message.hasOwnProperty("externalIds")) {
                    if (!Array.isArray(message.externalIds))
                        return "externalIds: array expected";
                    for (let i = 0; i < message.externalIds.length; ++i) {
                        let error = $root.figma_files.common.ExternalId.verify(message.externalIds[i]);
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
             * Creates an UpdateFigmaFileRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof figma_files.figma_file.UpdateFigmaFileRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {figma_files.figma_file.UpdateFigmaFileRequest} UpdateFigmaFileRequest
             */
            UpdateFigmaFileRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.figma_files.figma_file.UpdateFigmaFileRequest)
                    return object;
                let message = new $root.figma_files.figma_file.UpdateFigmaFileRequest();
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
                case "FIGMA_FILE_TYPE_UNSPECIFIED":
                case 0:
                    message.type = 0;
                    break;
                case "FIGMA_FILE_TYPE_DESIGN_SYSTEM":
                case 1:
                    message.type = 1;
                    break;
                case "FIGMA_FILE_TYPE_COMPONENT_LIBRARY":
                case 2:
                    message.type = 2;
                    break;
                case "FIGMA_FILE_TYPE_PROTOTYPE":
                case 3:
                    message.type = 3;
                    break;
                case "FIGMA_FILE_TYPE_ILLUSTRATION":
                case 4:
                    message.type = 4;
                    break;
                case "FIGMA_FILE_TYPE_ICON_SET":
                case 5:
                    message.type = 5;
                    break;
                }
                if (object.figmaUrl != null)
                    message.figmaUrl = String(object.figmaUrl);
                if (object.figmaFileKey != null)
                    message.figmaFileKey = String(object.figmaFileKey);
                if (object.thumbnailUrl != null)
                    message.thumbnailUrl = String(object.thumbnailUrl);
                if (object.pageCount != null)
                    message.pageCount = object.pageCount | 0;
                if (object.componentCount != null)
                    message.componentCount = object.componentCount | 0;
                if (object.styleCount != null)
                    message.styleCount = object.styleCount | 0;
                if (object.lastModifiedBy != null)
                    message.lastModifiedBy = String(object.lastModifiedBy);
                if (object.editorType != null)
                    message.editorType = String(object.editorType);
                if (object.trending != null)
                    message.trending = Boolean(object.trending);
                if (object.verified != null)
                    message.verified = Boolean(object.verified);
                switch (object.status) {
                default:
                    if (typeof object.status === "number") {
                        message.status = object.status;
                        break;
                    }
                    break;
                case "FIGMA_FILE_STATUS_UNSPECIFIED":
                case 0:
                    message.status = 0;
                    break;
                case "FIGMA_FILE_STATUS_STABLE":
                case 1:
                    message.status = 1;
                    break;
                case "FIGMA_FILE_STATUS_BETA":
                case 2:
                    message.status = 2;
                    break;
                case "FIGMA_FILE_STATUS_DEPRECATED":
                case 3:
                    message.status = 3;
                    break;
                case "FIGMA_FILE_STATUS_EXPERIMENTAL":
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
                case "FIGMA_FILE_SOURCE_UNSPECIFIED":
                case 0:
                    message.source = 0;
                    break;
                case "FIGMA_FILE_SOURCE_FIGMA":
                case 1:
                    message.source = 1;
                    break;
                case "FIGMA_FILE_SOURCE_FIGMA_COMMUNITY":
                case 2:
                    message.source = 2;
                    break;
                case "FIGMA_FILE_SOURCE_MANUAL":
                case 3:
                    message.source = 3;
                    break;
                }
                if (object.externalIds) {
                    if (!Array.isArray(object.externalIds))
                        throw TypeError(".figma_files.figma_file.UpdateFigmaFileRequest.externalIds: array expected");
                    message.externalIds = [];
                    for (let i = 0; i < object.externalIds.length; ++i) {
                        if (typeof object.externalIds[i] !== "object")
                            throw TypeError(".figma_files.figma_file.UpdateFigmaFileRequest.externalIds: object expected");
                        message.externalIds[i] = $root.figma_files.common.ExternalId.fromObject(object.externalIds[i]);
                    }
                }
                if (object.tagNames) {
                    if (!Array.isArray(object.tagNames))
                        throw TypeError(".figma_files.figma_file.UpdateFigmaFileRequest.tagNames: array expected");
                    message.tagNames = [];
                    for (let i = 0; i < object.tagNames.length; ++i)
                        message.tagNames[i] = String(object.tagNames[i]);
                }
                return message;
            };

            /**
             * Creates a plain object from an UpdateFigmaFileRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof figma_files.figma_file.UpdateFigmaFileRequest
             * @static
             * @param {figma_files.figma_file.UpdateFigmaFileRequest} message UpdateFigmaFileRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            UpdateFigmaFileRequest.toObject = function toObject(message, options) {
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
                    object.type = options.enums === String ? "FIGMA_FILE_TYPE_UNSPECIFIED" : 0;
                    object.figmaUrl = "";
                    object.figmaFileKey = "";
                    object.thumbnailUrl = "";
                    object.pageCount = 0;
                    object.componentCount = 0;
                    object.styleCount = 0;
                    object.lastModifiedBy = "";
                    object.editorType = "";
                    object.trending = false;
                    object.verified = false;
                    object.status = options.enums === String ? "FIGMA_FILE_STATUS_UNSPECIFIED" : 0;
                    object.source = options.enums === String ? "FIGMA_FILE_SOURCE_UNSPECIFIED" : 0;
                }
                if (message.id != null && message.hasOwnProperty("id"))
                    object.id = message.id;
                if (message.name != null && message.hasOwnProperty("name"))
                    object.name = message.name;
                if (message.description != null && message.hasOwnProperty("description"))
                    object.description = message.description;
                if (message.type != null && message.hasOwnProperty("type"))
                    object.type = options.enums === String ? $root.figma_files.common.FigmaFileType[message.type] === undefined ? message.type : $root.figma_files.common.FigmaFileType[message.type] : message.type;
                if (message.figmaUrl != null && message.hasOwnProperty("figmaUrl"))
                    object.figmaUrl = message.figmaUrl;
                if (message.figmaFileKey != null && message.hasOwnProperty("figmaFileKey"))
                    object.figmaFileKey = message.figmaFileKey;
                if (message.thumbnailUrl != null && message.hasOwnProperty("thumbnailUrl"))
                    object.thumbnailUrl = message.thumbnailUrl;
                if (message.pageCount != null && message.hasOwnProperty("pageCount"))
                    object.pageCount = message.pageCount;
                if (message.componentCount != null && message.hasOwnProperty("componentCount"))
                    object.componentCount = message.componentCount;
                if (message.styleCount != null && message.hasOwnProperty("styleCount"))
                    object.styleCount = message.styleCount;
                if (message.lastModifiedBy != null && message.hasOwnProperty("lastModifiedBy"))
                    object.lastModifiedBy = message.lastModifiedBy;
                if (message.editorType != null && message.hasOwnProperty("editorType"))
                    object.editorType = message.editorType;
                if (message.trending != null && message.hasOwnProperty("trending"))
                    object.trending = message.trending;
                if (message.verified != null && message.hasOwnProperty("verified"))
                    object.verified = message.verified;
                if (message.status != null && message.hasOwnProperty("status"))
                    object.status = options.enums === String ? $root.figma_files.common.FigmaFileStatus[message.status] === undefined ? message.status : $root.figma_files.common.FigmaFileStatus[message.status] : message.status;
                if (message.source != null && message.hasOwnProperty("source"))
                    object.source = options.enums === String ? $root.figma_files.common.FigmaFileSource[message.source] === undefined ? message.source : $root.figma_files.common.FigmaFileSource[message.source] : message.source;
                if (message.externalIds && message.externalIds.length) {
                    object.externalIds = [];
                    for (let j = 0; j < message.externalIds.length; ++j)
                        object.externalIds[j] = $root.figma_files.common.ExternalId.toObject(message.externalIds[j], options);
                }
                if (message.tagNames && message.tagNames.length) {
                    object.tagNames = [];
                    for (let j = 0; j < message.tagNames.length; ++j)
                        object.tagNames[j] = message.tagNames[j];
                }
                return object;
            };

            /**
             * Converts this UpdateFigmaFileRequest to JSON.
             * @function toJSON
             * @memberof figma_files.figma_file.UpdateFigmaFileRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            UpdateFigmaFileRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for UpdateFigmaFileRequest
             * @function getTypeUrl
             * @memberof figma_files.figma_file.UpdateFigmaFileRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            UpdateFigmaFileRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/figma_files.figma_file.UpdateFigmaFileRequest";
            };

            return UpdateFigmaFileRequest;
        })();

        figma_file.UpdateFigmaFileResponse = (function() {

            /**
             * Properties of an UpdateFigmaFileResponse.
             * @memberof figma_files.figma_file
             * @interface IUpdateFigmaFileResponse
             * @property {figma_files.figma_file.IFigmaFile|null} [figmaFile] UpdateFigmaFileResponse figmaFile
             */

            /**
             * Constructs a new UpdateFigmaFileResponse.
             * @memberof figma_files.figma_file
             * @classdesc Represents an UpdateFigmaFileResponse.
             * @implements IUpdateFigmaFileResponse
             * @constructor
             * @param {figma_files.figma_file.IUpdateFigmaFileResponse=} [properties] Properties to set
             */
            function UpdateFigmaFileResponse(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * UpdateFigmaFileResponse figmaFile.
             * @member {figma_files.figma_file.IFigmaFile|null|undefined} figmaFile
             * @memberof figma_files.figma_file.UpdateFigmaFileResponse
             * @instance
             */
            UpdateFigmaFileResponse.prototype.figmaFile = null;

            /**
             * Creates a new UpdateFigmaFileResponse instance using the specified properties.
             * @function create
             * @memberof figma_files.figma_file.UpdateFigmaFileResponse
             * @static
             * @param {figma_files.figma_file.IUpdateFigmaFileResponse=} [properties] Properties to set
             * @returns {figma_files.figma_file.UpdateFigmaFileResponse} UpdateFigmaFileResponse instance
             */
            UpdateFigmaFileResponse.create = function create(properties) {
                return new UpdateFigmaFileResponse(properties);
            };

            /**
             * Encodes the specified UpdateFigmaFileResponse message. Does not implicitly {@link figma_files.figma_file.UpdateFigmaFileResponse.verify|verify} messages.
             * @function encode
             * @memberof figma_files.figma_file.UpdateFigmaFileResponse
             * @static
             * @param {figma_files.figma_file.IUpdateFigmaFileResponse} message UpdateFigmaFileResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            UpdateFigmaFileResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.figmaFile != null && Object.hasOwnProperty.call(message, "figmaFile"))
                    $root.figma_files.figma_file.FigmaFile.encode(message.figmaFile, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified UpdateFigmaFileResponse message, length delimited. Does not implicitly {@link figma_files.figma_file.UpdateFigmaFileResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof figma_files.figma_file.UpdateFigmaFileResponse
             * @static
             * @param {figma_files.figma_file.IUpdateFigmaFileResponse} message UpdateFigmaFileResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            UpdateFigmaFileResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an UpdateFigmaFileResponse message from the specified reader or buffer.
             * @function decode
             * @memberof figma_files.figma_file.UpdateFigmaFileResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {figma_files.figma_file.UpdateFigmaFileResponse} UpdateFigmaFileResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            UpdateFigmaFileResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_files.figma_file.UpdateFigmaFileResponse();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.figmaFile = $root.figma_files.figma_file.FigmaFile.decode(reader, reader.uint32());
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
             * Decodes an UpdateFigmaFileResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof figma_files.figma_file.UpdateFigmaFileResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {figma_files.figma_file.UpdateFigmaFileResponse} UpdateFigmaFileResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            UpdateFigmaFileResponse.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an UpdateFigmaFileResponse message.
             * @function verify
             * @memberof figma_files.figma_file.UpdateFigmaFileResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            UpdateFigmaFileResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.figmaFile != null && message.hasOwnProperty("figmaFile")) {
                    let error = $root.figma_files.figma_file.FigmaFile.verify(message.figmaFile);
                    if (error)
                        return "figmaFile." + error;
                }
                return null;
            };

            /**
             * Creates an UpdateFigmaFileResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof figma_files.figma_file.UpdateFigmaFileResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {figma_files.figma_file.UpdateFigmaFileResponse} UpdateFigmaFileResponse
             */
            UpdateFigmaFileResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.figma_files.figma_file.UpdateFigmaFileResponse)
                    return object;
                let message = new $root.figma_files.figma_file.UpdateFigmaFileResponse();
                if (object.figmaFile != null) {
                    if (typeof object.figmaFile !== "object")
                        throw TypeError(".figma_files.figma_file.UpdateFigmaFileResponse.figmaFile: object expected");
                    message.figmaFile = $root.figma_files.figma_file.FigmaFile.fromObject(object.figmaFile);
                }
                return message;
            };

            /**
             * Creates a plain object from an UpdateFigmaFileResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof figma_files.figma_file.UpdateFigmaFileResponse
             * @static
             * @param {figma_files.figma_file.UpdateFigmaFileResponse} message UpdateFigmaFileResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            UpdateFigmaFileResponse.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults)
                    object.figmaFile = null;
                if (message.figmaFile != null && message.hasOwnProperty("figmaFile"))
                    object.figmaFile = $root.figma_files.figma_file.FigmaFile.toObject(message.figmaFile, options);
                return object;
            };

            /**
             * Converts this UpdateFigmaFileResponse to JSON.
             * @function toJSON
             * @memberof figma_files.figma_file.UpdateFigmaFileResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            UpdateFigmaFileResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for UpdateFigmaFileResponse
             * @function getTypeUrl
             * @memberof figma_files.figma_file.UpdateFigmaFileResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            UpdateFigmaFileResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/figma_files.figma_file.UpdateFigmaFileResponse";
            };

            return UpdateFigmaFileResponse;
        })();

        figma_file.DeleteFigmaFileRequest = (function() {

            /**
             * Properties of a DeleteFigmaFileRequest.
             * @memberof figma_files.figma_file
             * @interface IDeleteFigmaFileRequest
             * @property {string|null} [id] DeleteFigmaFileRequest id
             */

            /**
             * Constructs a new DeleteFigmaFileRequest.
             * @memberof figma_files.figma_file
             * @classdesc Represents a DeleteFigmaFileRequest.
             * @implements IDeleteFigmaFileRequest
             * @constructor
             * @param {figma_files.figma_file.IDeleteFigmaFileRequest=} [properties] Properties to set
             */
            function DeleteFigmaFileRequest(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * DeleteFigmaFileRequest id.
             * @member {string} id
             * @memberof figma_files.figma_file.DeleteFigmaFileRequest
             * @instance
             */
            DeleteFigmaFileRequest.prototype.id = "";

            /**
             * Creates a new DeleteFigmaFileRequest instance using the specified properties.
             * @function create
             * @memberof figma_files.figma_file.DeleteFigmaFileRequest
             * @static
             * @param {figma_files.figma_file.IDeleteFigmaFileRequest=} [properties] Properties to set
             * @returns {figma_files.figma_file.DeleteFigmaFileRequest} DeleteFigmaFileRequest instance
             */
            DeleteFigmaFileRequest.create = function create(properties) {
                return new DeleteFigmaFileRequest(properties);
            };

            /**
             * Encodes the specified DeleteFigmaFileRequest message. Does not implicitly {@link figma_files.figma_file.DeleteFigmaFileRequest.verify|verify} messages.
             * @function encode
             * @memberof figma_files.figma_file.DeleteFigmaFileRequest
             * @static
             * @param {figma_files.figma_file.IDeleteFigmaFileRequest} message DeleteFigmaFileRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DeleteFigmaFileRequest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
                return writer;
            };

            /**
             * Encodes the specified DeleteFigmaFileRequest message, length delimited. Does not implicitly {@link figma_files.figma_file.DeleteFigmaFileRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof figma_files.figma_file.DeleteFigmaFileRequest
             * @static
             * @param {figma_files.figma_file.IDeleteFigmaFileRequest} message DeleteFigmaFileRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DeleteFigmaFileRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a DeleteFigmaFileRequest message from the specified reader or buffer.
             * @function decode
             * @memberof figma_files.figma_file.DeleteFigmaFileRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {figma_files.figma_file.DeleteFigmaFileRequest} DeleteFigmaFileRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DeleteFigmaFileRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_files.figma_file.DeleteFigmaFileRequest();
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
             * Decodes a DeleteFigmaFileRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof figma_files.figma_file.DeleteFigmaFileRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {figma_files.figma_file.DeleteFigmaFileRequest} DeleteFigmaFileRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DeleteFigmaFileRequest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a DeleteFigmaFileRequest message.
             * @function verify
             * @memberof figma_files.figma_file.DeleteFigmaFileRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            DeleteFigmaFileRequest.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.id != null && message.hasOwnProperty("id"))
                    if (!$util.isString(message.id))
                        return "id: string expected";
                return null;
            };

            /**
             * Creates a DeleteFigmaFileRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof figma_files.figma_file.DeleteFigmaFileRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {figma_files.figma_file.DeleteFigmaFileRequest} DeleteFigmaFileRequest
             */
            DeleteFigmaFileRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.figma_files.figma_file.DeleteFigmaFileRequest)
                    return object;
                let message = new $root.figma_files.figma_file.DeleteFigmaFileRequest();
                if (object.id != null)
                    message.id = String(object.id);
                return message;
            };

            /**
             * Creates a plain object from a DeleteFigmaFileRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof figma_files.figma_file.DeleteFigmaFileRequest
             * @static
             * @param {figma_files.figma_file.DeleteFigmaFileRequest} message DeleteFigmaFileRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            DeleteFigmaFileRequest.toObject = function toObject(message, options) {
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
             * Converts this DeleteFigmaFileRequest to JSON.
             * @function toJSON
             * @memberof figma_files.figma_file.DeleteFigmaFileRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            DeleteFigmaFileRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for DeleteFigmaFileRequest
             * @function getTypeUrl
             * @memberof figma_files.figma_file.DeleteFigmaFileRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            DeleteFigmaFileRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/figma_files.figma_file.DeleteFigmaFileRequest";
            };

            return DeleteFigmaFileRequest;
        })();

        figma_file.DeleteFigmaFileResponse = (function() {

            /**
             * Properties of a DeleteFigmaFileResponse.
             * @memberof figma_files.figma_file
             * @interface IDeleteFigmaFileResponse
             * @property {boolean|null} [success] DeleteFigmaFileResponse success
             */

            /**
             * Constructs a new DeleteFigmaFileResponse.
             * @memberof figma_files.figma_file
             * @classdesc Represents a DeleteFigmaFileResponse.
             * @implements IDeleteFigmaFileResponse
             * @constructor
             * @param {figma_files.figma_file.IDeleteFigmaFileResponse=} [properties] Properties to set
             */
            function DeleteFigmaFileResponse(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * DeleteFigmaFileResponse success.
             * @member {boolean} success
             * @memberof figma_files.figma_file.DeleteFigmaFileResponse
             * @instance
             */
            DeleteFigmaFileResponse.prototype.success = false;

            /**
             * Creates a new DeleteFigmaFileResponse instance using the specified properties.
             * @function create
             * @memberof figma_files.figma_file.DeleteFigmaFileResponse
             * @static
             * @param {figma_files.figma_file.IDeleteFigmaFileResponse=} [properties] Properties to set
             * @returns {figma_files.figma_file.DeleteFigmaFileResponse} DeleteFigmaFileResponse instance
             */
            DeleteFigmaFileResponse.create = function create(properties) {
                return new DeleteFigmaFileResponse(properties);
            };

            /**
             * Encodes the specified DeleteFigmaFileResponse message. Does not implicitly {@link figma_files.figma_file.DeleteFigmaFileResponse.verify|verify} messages.
             * @function encode
             * @memberof figma_files.figma_file.DeleteFigmaFileResponse
             * @static
             * @param {figma_files.figma_file.IDeleteFigmaFileResponse} message DeleteFigmaFileResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DeleteFigmaFileResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.success != null && Object.hasOwnProperty.call(message, "success"))
                    writer.uint32(/* id 1, wireType 0 =*/8).bool(message.success);
                return writer;
            };

            /**
             * Encodes the specified DeleteFigmaFileResponse message, length delimited. Does not implicitly {@link figma_files.figma_file.DeleteFigmaFileResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof figma_files.figma_file.DeleteFigmaFileResponse
             * @static
             * @param {figma_files.figma_file.IDeleteFigmaFileResponse} message DeleteFigmaFileResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DeleteFigmaFileResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a DeleteFigmaFileResponse message from the specified reader or buffer.
             * @function decode
             * @memberof figma_files.figma_file.DeleteFigmaFileResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {figma_files.figma_file.DeleteFigmaFileResponse} DeleteFigmaFileResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DeleteFigmaFileResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_files.figma_file.DeleteFigmaFileResponse();
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
             * Decodes a DeleteFigmaFileResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof figma_files.figma_file.DeleteFigmaFileResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {figma_files.figma_file.DeleteFigmaFileResponse} DeleteFigmaFileResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DeleteFigmaFileResponse.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a DeleteFigmaFileResponse message.
             * @function verify
             * @memberof figma_files.figma_file.DeleteFigmaFileResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            DeleteFigmaFileResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.success != null && message.hasOwnProperty("success"))
                    if (typeof message.success !== "boolean")
                        return "success: boolean expected";
                return null;
            };

            /**
             * Creates a DeleteFigmaFileResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof figma_files.figma_file.DeleteFigmaFileResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {figma_files.figma_file.DeleteFigmaFileResponse} DeleteFigmaFileResponse
             */
            DeleteFigmaFileResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.figma_files.figma_file.DeleteFigmaFileResponse)
                    return object;
                let message = new $root.figma_files.figma_file.DeleteFigmaFileResponse();
                if (object.success != null)
                    message.success = Boolean(object.success);
                return message;
            };

            /**
             * Creates a plain object from a DeleteFigmaFileResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof figma_files.figma_file.DeleteFigmaFileResponse
             * @static
             * @param {figma_files.figma_file.DeleteFigmaFileResponse} message DeleteFigmaFileResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            DeleteFigmaFileResponse.toObject = function toObject(message, options) {
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
             * Converts this DeleteFigmaFileResponse to JSON.
             * @function toJSON
             * @memberof figma_files.figma_file.DeleteFigmaFileResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            DeleteFigmaFileResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for DeleteFigmaFileResponse
             * @function getTypeUrl
             * @memberof figma_files.figma_file.DeleteFigmaFileResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            DeleteFigmaFileResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/figma_files.figma_file.DeleteFigmaFileResponse";
            };

            return DeleteFigmaFileResponse;
        })();

        return figma_file;
    })();

    figma_files.tag = (function() {

        /**
         * Namespace tag.
         * @memberof figma_files
         * @namespace
         */
        const tag = {};

        tag.Tag = (function() {

            /**
             * Properties of a Tag.
             * @memberof figma_files.tag
             * @interface ITag
             * @property {number|null} [id] Tag id
             * @property {string|null} [name] Tag name
             * @property {figma_files.common.ITimestamp|null} [createdAt] Tag createdAt
             * @property {figma_files.common.ITimestamp|null} [updatedAt] Tag updatedAt
             */

            /**
             * Constructs a new Tag.
             * @memberof figma_files.tag
             * @classdesc Represents a Tag.
             * @implements ITag
             * @constructor
             * @param {figma_files.tag.ITag=} [properties] Properties to set
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
             * @memberof figma_files.tag.Tag
             * @instance
             */
            Tag.prototype.id = 0;

            /**
             * Tag name.
             * @member {string} name
             * @memberof figma_files.tag.Tag
             * @instance
             */
            Tag.prototype.name = "";

            /**
             * Tag createdAt.
             * @member {figma_files.common.ITimestamp|null|undefined} createdAt
             * @memberof figma_files.tag.Tag
             * @instance
             */
            Tag.prototype.createdAt = null;

            /**
             * Tag updatedAt.
             * @member {figma_files.common.ITimestamp|null|undefined} updatedAt
             * @memberof figma_files.tag.Tag
             * @instance
             */
            Tag.prototype.updatedAt = null;

            /**
             * Creates a new Tag instance using the specified properties.
             * @function create
             * @memberof figma_files.tag.Tag
             * @static
             * @param {figma_files.tag.ITag=} [properties] Properties to set
             * @returns {figma_files.tag.Tag} Tag instance
             */
            Tag.create = function create(properties) {
                return new Tag(properties);
            };

            /**
             * Encodes the specified Tag message. Does not implicitly {@link figma_files.tag.Tag.verify|verify} messages.
             * @function encode
             * @memberof figma_files.tag.Tag
             * @static
             * @param {figma_files.tag.ITag} message Tag message or plain object to encode
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
                    $root.figma_files.common.Timestamp.encode(message.createdAt, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.updatedAt != null && Object.hasOwnProperty.call(message, "updatedAt"))
                    $root.figma_files.common.Timestamp.encode(message.updatedAt, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified Tag message, length delimited. Does not implicitly {@link figma_files.tag.Tag.verify|verify} messages.
             * @function encodeDelimited
             * @memberof figma_files.tag.Tag
             * @static
             * @param {figma_files.tag.ITag} message Tag message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Tag.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Tag message from the specified reader or buffer.
             * @function decode
             * @memberof figma_files.tag.Tag
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {figma_files.tag.Tag} Tag
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Tag.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_files.tag.Tag();
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
                            message.createdAt = $root.figma_files.common.Timestamp.decode(reader, reader.uint32());
                            break;
                        }
                    case 4: {
                            message.updatedAt = $root.figma_files.common.Timestamp.decode(reader, reader.uint32());
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
             * @memberof figma_files.tag.Tag
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {figma_files.tag.Tag} Tag
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
             * @memberof figma_files.tag.Tag
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
                    let error = $root.figma_files.common.Timestamp.verify(message.createdAt);
                    if (error)
                        return "createdAt." + error;
                }
                if (message.updatedAt != null && message.hasOwnProperty("updatedAt")) {
                    let error = $root.figma_files.common.Timestamp.verify(message.updatedAt);
                    if (error)
                        return "updatedAt." + error;
                }
                return null;
            };

            /**
             * Creates a Tag message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof figma_files.tag.Tag
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {figma_files.tag.Tag} Tag
             */
            Tag.fromObject = function fromObject(object) {
                if (object instanceof $root.figma_files.tag.Tag)
                    return object;
                let message = new $root.figma_files.tag.Tag();
                if (object.id != null)
                    message.id = object.id | 0;
                if (object.name != null)
                    message.name = String(object.name);
                if (object.createdAt != null) {
                    if (typeof object.createdAt !== "object")
                        throw TypeError(".figma_files.tag.Tag.createdAt: object expected");
                    message.createdAt = $root.figma_files.common.Timestamp.fromObject(object.createdAt);
                }
                if (object.updatedAt != null) {
                    if (typeof object.updatedAt !== "object")
                        throw TypeError(".figma_files.tag.Tag.updatedAt: object expected");
                    message.updatedAt = $root.figma_files.common.Timestamp.fromObject(object.updatedAt);
                }
                return message;
            };

            /**
             * Creates a plain object from a Tag message. Also converts values to other types if specified.
             * @function toObject
             * @memberof figma_files.tag.Tag
             * @static
             * @param {figma_files.tag.Tag} message Tag
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
                    object.createdAt = $root.figma_files.common.Timestamp.toObject(message.createdAt, options);
                if (message.updatedAt != null && message.hasOwnProperty("updatedAt"))
                    object.updatedAt = $root.figma_files.common.Timestamp.toObject(message.updatedAt, options);
                return object;
            };

            /**
             * Converts this Tag to JSON.
             * @function toJSON
             * @memberof figma_files.tag.Tag
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Tag.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Tag
             * @function getTypeUrl
             * @memberof figma_files.tag.Tag
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Tag.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/figma_files.tag.Tag";
            };

            return Tag;
        })();

        tag.TagListResponse = (function() {

            /**
             * Properties of a TagListResponse.
             * @memberof figma_files.tag
             * @interface ITagListResponse
             * @property {Array.<figma_files.tag.ITag>|null} [tags] TagListResponse tags
             */

            /**
             * Constructs a new TagListResponse.
             * @memberof figma_files.tag
             * @classdesc Represents a TagListResponse.
             * @implements ITagListResponse
             * @constructor
             * @param {figma_files.tag.ITagListResponse=} [properties] Properties to set
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
             * @member {Array.<figma_files.tag.ITag>} tags
             * @memberof figma_files.tag.TagListResponse
             * @instance
             */
            TagListResponse.prototype.tags = $util.emptyArray;

            /**
             * Creates a new TagListResponse instance using the specified properties.
             * @function create
             * @memberof figma_files.tag.TagListResponse
             * @static
             * @param {figma_files.tag.ITagListResponse=} [properties] Properties to set
             * @returns {figma_files.tag.TagListResponse} TagListResponse instance
             */
            TagListResponse.create = function create(properties) {
                return new TagListResponse(properties);
            };

            /**
             * Encodes the specified TagListResponse message. Does not implicitly {@link figma_files.tag.TagListResponse.verify|verify} messages.
             * @function encode
             * @memberof figma_files.tag.TagListResponse
             * @static
             * @param {figma_files.tag.ITagListResponse} message TagListResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TagListResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.tags != null && message.tags.length)
                    for (let i = 0; i < message.tags.length; ++i)
                        $root.figma_files.tag.Tag.encode(message.tags[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified TagListResponse message, length delimited. Does not implicitly {@link figma_files.tag.TagListResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof figma_files.tag.TagListResponse
             * @static
             * @param {figma_files.tag.ITagListResponse} message TagListResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TagListResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a TagListResponse message from the specified reader or buffer.
             * @function decode
             * @memberof figma_files.tag.TagListResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {figma_files.tag.TagListResponse} TagListResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TagListResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_files.tag.TagListResponse();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            if (!(message.tags && message.tags.length))
                                message.tags = [];
                            message.tags.push($root.figma_files.tag.Tag.decode(reader, reader.uint32()));
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
             * @memberof figma_files.tag.TagListResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {figma_files.tag.TagListResponse} TagListResponse
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
             * @memberof figma_files.tag.TagListResponse
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
                        let error = $root.figma_files.tag.Tag.verify(message.tags[i]);
                        if (error)
                            return "tags." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a TagListResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof figma_files.tag.TagListResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {figma_files.tag.TagListResponse} TagListResponse
             */
            TagListResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.figma_files.tag.TagListResponse)
                    return object;
                let message = new $root.figma_files.tag.TagListResponse();
                if (object.tags) {
                    if (!Array.isArray(object.tags))
                        throw TypeError(".figma_files.tag.TagListResponse.tags: array expected");
                    message.tags = [];
                    for (let i = 0; i < object.tags.length; ++i) {
                        if (typeof object.tags[i] !== "object")
                            throw TypeError(".figma_files.tag.TagListResponse.tags: object expected");
                        message.tags[i] = $root.figma_files.tag.Tag.fromObject(object.tags[i]);
                    }
                }
                return message;
            };

            /**
             * Creates a plain object from a TagListResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof figma_files.tag.TagListResponse
             * @static
             * @param {figma_files.tag.TagListResponse} message TagListResponse
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
                        object.tags[j] = $root.figma_files.tag.Tag.toObject(message.tags[j], options);
                }
                return object;
            };

            /**
             * Converts this TagListResponse to JSON.
             * @function toJSON
             * @memberof figma_files.tag.TagListResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            TagListResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for TagListResponse
             * @function getTypeUrl
             * @memberof figma_files.tag.TagListResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            TagListResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/figma_files.tag.TagListResponse";
            };

            return TagListResponse;
        })();

        tag.CreateTagRequest = (function() {

            /**
             * Properties of a CreateTagRequest.
             * @memberof figma_files.tag
             * @interface ICreateTagRequest
             * @property {string|null} [name] CreateTagRequest name
             */

            /**
             * Constructs a new CreateTagRequest.
             * @memberof figma_files.tag
             * @classdesc Represents a CreateTagRequest.
             * @implements ICreateTagRequest
             * @constructor
             * @param {figma_files.tag.ICreateTagRequest=} [properties] Properties to set
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
             * @memberof figma_files.tag.CreateTagRequest
             * @instance
             */
            CreateTagRequest.prototype.name = "";

            /**
             * Creates a new CreateTagRequest instance using the specified properties.
             * @function create
             * @memberof figma_files.tag.CreateTagRequest
             * @static
             * @param {figma_files.tag.ICreateTagRequest=} [properties] Properties to set
             * @returns {figma_files.tag.CreateTagRequest} CreateTagRequest instance
             */
            CreateTagRequest.create = function create(properties) {
                return new CreateTagRequest(properties);
            };

            /**
             * Encodes the specified CreateTagRequest message. Does not implicitly {@link figma_files.tag.CreateTagRequest.verify|verify} messages.
             * @function encode
             * @memberof figma_files.tag.CreateTagRequest
             * @static
             * @param {figma_files.tag.ICreateTagRequest} message CreateTagRequest message or plain object to encode
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
             * Encodes the specified CreateTagRequest message, length delimited. Does not implicitly {@link figma_files.tag.CreateTagRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof figma_files.tag.CreateTagRequest
             * @static
             * @param {figma_files.tag.ICreateTagRequest} message CreateTagRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CreateTagRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a CreateTagRequest message from the specified reader or buffer.
             * @function decode
             * @memberof figma_files.tag.CreateTagRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {figma_files.tag.CreateTagRequest} CreateTagRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CreateTagRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_files.tag.CreateTagRequest();
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
             * @memberof figma_files.tag.CreateTagRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {figma_files.tag.CreateTagRequest} CreateTagRequest
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
             * @memberof figma_files.tag.CreateTagRequest
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
             * @memberof figma_files.tag.CreateTagRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {figma_files.tag.CreateTagRequest} CreateTagRequest
             */
            CreateTagRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.figma_files.tag.CreateTagRequest)
                    return object;
                let message = new $root.figma_files.tag.CreateTagRequest();
                if (object.name != null)
                    message.name = String(object.name);
                return message;
            };

            /**
             * Creates a plain object from a CreateTagRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof figma_files.tag.CreateTagRequest
             * @static
             * @param {figma_files.tag.CreateTagRequest} message CreateTagRequest
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
             * @memberof figma_files.tag.CreateTagRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            CreateTagRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for CreateTagRequest
             * @function getTypeUrl
             * @memberof figma_files.tag.CreateTagRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            CreateTagRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/figma_files.tag.CreateTagRequest";
            };

            return CreateTagRequest;
        })();

        tag.CreateTagResponse = (function() {

            /**
             * Properties of a CreateTagResponse.
             * @memberof figma_files.tag
             * @interface ICreateTagResponse
             * @property {figma_files.tag.ITag|null} [tag] CreateTagResponse tag
             */

            /**
             * Constructs a new CreateTagResponse.
             * @memberof figma_files.tag
             * @classdesc Represents a CreateTagResponse.
             * @implements ICreateTagResponse
             * @constructor
             * @param {figma_files.tag.ICreateTagResponse=} [properties] Properties to set
             */
            function CreateTagResponse(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * CreateTagResponse tag.
             * @member {figma_files.tag.ITag|null|undefined} tag
             * @memberof figma_files.tag.CreateTagResponse
             * @instance
             */
            CreateTagResponse.prototype.tag = null;

            /**
             * Creates a new CreateTagResponse instance using the specified properties.
             * @function create
             * @memberof figma_files.tag.CreateTagResponse
             * @static
             * @param {figma_files.tag.ICreateTagResponse=} [properties] Properties to set
             * @returns {figma_files.tag.CreateTagResponse} CreateTagResponse instance
             */
            CreateTagResponse.create = function create(properties) {
                return new CreateTagResponse(properties);
            };

            /**
             * Encodes the specified CreateTagResponse message. Does not implicitly {@link figma_files.tag.CreateTagResponse.verify|verify} messages.
             * @function encode
             * @memberof figma_files.tag.CreateTagResponse
             * @static
             * @param {figma_files.tag.ICreateTagResponse} message CreateTagResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CreateTagResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.tag != null && Object.hasOwnProperty.call(message, "tag"))
                    $root.figma_files.tag.Tag.encode(message.tag, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified CreateTagResponse message, length delimited. Does not implicitly {@link figma_files.tag.CreateTagResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof figma_files.tag.CreateTagResponse
             * @static
             * @param {figma_files.tag.ICreateTagResponse} message CreateTagResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CreateTagResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a CreateTagResponse message from the specified reader or buffer.
             * @function decode
             * @memberof figma_files.tag.CreateTagResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {figma_files.tag.CreateTagResponse} CreateTagResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CreateTagResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_files.tag.CreateTagResponse();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.tag = $root.figma_files.tag.Tag.decode(reader, reader.uint32());
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
             * @memberof figma_files.tag.CreateTagResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {figma_files.tag.CreateTagResponse} CreateTagResponse
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
             * @memberof figma_files.tag.CreateTagResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            CreateTagResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.tag != null && message.hasOwnProperty("tag")) {
                    let error = $root.figma_files.tag.Tag.verify(message.tag);
                    if (error)
                        return "tag." + error;
                }
                return null;
            };

            /**
             * Creates a CreateTagResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof figma_files.tag.CreateTagResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {figma_files.tag.CreateTagResponse} CreateTagResponse
             */
            CreateTagResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.figma_files.tag.CreateTagResponse)
                    return object;
                let message = new $root.figma_files.tag.CreateTagResponse();
                if (object.tag != null) {
                    if (typeof object.tag !== "object")
                        throw TypeError(".figma_files.tag.CreateTagResponse.tag: object expected");
                    message.tag = $root.figma_files.tag.Tag.fromObject(object.tag);
                }
                return message;
            };

            /**
             * Creates a plain object from a CreateTagResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof figma_files.tag.CreateTagResponse
             * @static
             * @param {figma_files.tag.CreateTagResponse} message CreateTagResponse
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
                    object.tag = $root.figma_files.tag.Tag.toObject(message.tag, options);
                return object;
            };

            /**
             * Converts this CreateTagResponse to JSON.
             * @function toJSON
             * @memberof figma_files.tag.CreateTagResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            CreateTagResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for CreateTagResponse
             * @function getTypeUrl
             * @memberof figma_files.tag.CreateTagResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            CreateTagResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/figma_files.tag.CreateTagResponse";
            };

            return CreateTagResponse;
        })();

        tag.UpdateTagRequest = (function() {

            /**
             * Properties of an UpdateTagRequest.
             * @memberof figma_files.tag
             * @interface IUpdateTagRequest
             * @property {number|null} [id] UpdateTagRequest id
             * @property {string|null} [name] UpdateTagRequest name
             */

            /**
             * Constructs a new UpdateTagRequest.
             * @memberof figma_files.tag
             * @classdesc Represents an UpdateTagRequest.
             * @implements IUpdateTagRequest
             * @constructor
             * @param {figma_files.tag.IUpdateTagRequest=} [properties] Properties to set
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
             * @memberof figma_files.tag.UpdateTagRequest
             * @instance
             */
            UpdateTagRequest.prototype.id = 0;

            /**
             * UpdateTagRequest name.
             * @member {string} name
             * @memberof figma_files.tag.UpdateTagRequest
             * @instance
             */
            UpdateTagRequest.prototype.name = "";

            /**
             * Creates a new UpdateTagRequest instance using the specified properties.
             * @function create
             * @memberof figma_files.tag.UpdateTagRequest
             * @static
             * @param {figma_files.tag.IUpdateTagRequest=} [properties] Properties to set
             * @returns {figma_files.tag.UpdateTagRequest} UpdateTagRequest instance
             */
            UpdateTagRequest.create = function create(properties) {
                return new UpdateTagRequest(properties);
            };

            /**
             * Encodes the specified UpdateTagRequest message. Does not implicitly {@link figma_files.tag.UpdateTagRequest.verify|verify} messages.
             * @function encode
             * @memberof figma_files.tag.UpdateTagRequest
             * @static
             * @param {figma_files.tag.IUpdateTagRequest} message UpdateTagRequest message or plain object to encode
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
             * Encodes the specified UpdateTagRequest message, length delimited. Does not implicitly {@link figma_files.tag.UpdateTagRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof figma_files.tag.UpdateTagRequest
             * @static
             * @param {figma_files.tag.IUpdateTagRequest} message UpdateTagRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            UpdateTagRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an UpdateTagRequest message from the specified reader or buffer.
             * @function decode
             * @memberof figma_files.tag.UpdateTagRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {figma_files.tag.UpdateTagRequest} UpdateTagRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            UpdateTagRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_files.tag.UpdateTagRequest();
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
             * @memberof figma_files.tag.UpdateTagRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {figma_files.tag.UpdateTagRequest} UpdateTagRequest
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
             * @memberof figma_files.tag.UpdateTagRequest
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
             * @memberof figma_files.tag.UpdateTagRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {figma_files.tag.UpdateTagRequest} UpdateTagRequest
             */
            UpdateTagRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.figma_files.tag.UpdateTagRequest)
                    return object;
                let message = new $root.figma_files.tag.UpdateTagRequest();
                if (object.id != null)
                    message.id = object.id | 0;
                if (object.name != null)
                    message.name = String(object.name);
                return message;
            };

            /**
             * Creates a plain object from an UpdateTagRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof figma_files.tag.UpdateTagRequest
             * @static
             * @param {figma_files.tag.UpdateTagRequest} message UpdateTagRequest
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
             * @memberof figma_files.tag.UpdateTagRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            UpdateTagRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for UpdateTagRequest
             * @function getTypeUrl
             * @memberof figma_files.tag.UpdateTagRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            UpdateTagRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/figma_files.tag.UpdateTagRequest";
            };

            return UpdateTagRequest;
        })();

        tag.UpdateTagResponse = (function() {

            /**
             * Properties of an UpdateTagResponse.
             * @memberof figma_files.tag
             * @interface IUpdateTagResponse
             * @property {figma_files.tag.ITag|null} [tag] UpdateTagResponse tag
             */

            /**
             * Constructs a new UpdateTagResponse.
             * @memberof figma_files.tag
             * @classdesc Represents an UpdateTagResponse.
             * @implements IUpdateTagResponse
             * @constructor
             * @param {figma_files.tag.IUpdateTagResponse=} [properties] Properties to set
             */
            function UpdateTagResponse(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * UpdateTagResponse tag.
             * @member {figma_files.tag.ITag|null|undefined} tag
             * @memberof figma_files.tag.UpdateTagResponse
             * @instance
             */
            UpdateTagResponse.prototype.tag = null;

            /**
             * Creates a new UpdateTagResponse instance using the specified properties.
             * @function create
             * @memberof figma_files.tag.UpdateTagResponse
             * @static
             * @param {figma_files.tag.IUpdateTagResponse=} [properties] Properties to set
             * @returns {figma_files.tag.UpdateTagResponse} UpdateTagResponse instance
             */
            UpdateTagResponse.create = function create(properties) {
                return new UpdateTagResponse(properties);
            };

            /**
             * Encodes the specified UpdateTagResponse message. Does not implicitly {@link figma_files.tag.UpdateTagResponse.verify|verify} messages.
             * @function encode
             * @memberof figma_files.tag.UpdateTagResponse
             * @static
             * @param {figma_files.tag.IUpdateTagResponse} message UpdateTagResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            UpdateTagResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.tag != null && Object.hasOwnProperty.call(message, "tag"))
                    $root.figma_files.tag.Tag.encode(message.tag, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified UpdateTagResponse message, length delimited. Does not implicitly {@link figma_files.tag.UpdateTagResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof figma_files.tag.UpdateTagResponse
             * @static
             * @param {figma_files.tag.IUpdateTagResponse} message UpdateTagResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            UpdateTagResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an UpdateTagResponse message from the specified reader or buffer.
             * @function decode
             * @memberof figma_files.tag.UpdateTagResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {figma_files.tag.UpdateTagResponse} UpdateTagResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            UpdateTagResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_files.tag.UpdateTagResponse();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.tag = $root.figma_files.tag.Tag.decode(reader, reader.uint32());
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
             * @memberof figma_files.tag.UpdateTagResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {figma_files.tag.UpdateTagResponse} UpdateTagResponse
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
             * @memberof figma_files.tag.UpdateTagResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            UpdateTagResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.tag != null && message.hasOwnProperty("tag")) {
                    let error = $root.figma_files.tag.Tag.verify(message.tag);
                    if (error)
                        return "tag." + error;
                }
                return null;
            };

            /**
             * Creates an UpdateTagResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof figma_files.tag.UpdateTagResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {figma_files.tag.UpdateTagResponse} UpdateTagResponse
             */
            UpdateTagResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.figma_files.tag.UpdateTagResponse)
                    return object;
                let message = new $root.figma_files.tag.UpdateTagResponse();
                if (object.tag != null) {
                    if (typeof object.tag !== "object")
                        throw TypeError(".figma_files.tag.UpdateTagResponse.tag: object expected");
                    message.tag = $root.figma_files.tag.Tag.fromObject(object.tag);
                }
                return message;
            };

            /**
             * Creates a plain object from an UpdateTagResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof figma_files.tag.UpdateTagResponse
             * @static
             * @param {figma_files.tag.UpdateTagResponse} message UpdateTagResponse
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
                    object.tag = $root.figma_files.tag.Tag.toObject(message.tag, options);
                return object;
            };

            /**
             * Converts this UpdateTagResponse to JSON.
             * @function toJSON
             * @memberof figma_files.tag.UpdateTagResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            UpdateTagResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for UpdateTagResponse
             * @function getTypeUrl
             * @memberof figma_files.tag.UpdateTagResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            UpdateTagResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/figma_files.tag.UpdateTagResponse";
            };

            return UpdateTagResponse;
        })();

        tag.GetTagRequest = (function() {

            /**
             * Properties of a GetTagRequest.
             * @memberof figma_files.tag
             * @interface IGetTagRequest
             * @property {number|null} [id] GetTagRequest id
             */

            /**
             * Constructs a new GetTagRequest.
             * @memberof figma_files.tag
             * @classdesc Represents a GetTagRequest.
             * @implements IGetTagRequest
             * @constructor
             * @param {figma_files.tag.IGetTagRequest=} [properties] Properties to set
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
             * @memberof figma_files.tag.GetTagRequest
             * @instance
             */
            GetTagRequest.prototype.id = 0;

            /**
             * Creates a new GetTagRequest instance using the specified properties.
             * @function create
             * @memberof figma_files.tag.GetTagRequest
             * @static
             * @param {figma_files.tag.IGetTagRequest=} [properties] Properties to set
             * @returns {figma_files.tag.GetTagRequest} GetTagRequest instance
             */
            GetTagRequest.create = function create(properties) {
                return new GetTagRequest(properties);
            };

            /**
             * Encodes the specified GetTagRequest message. Does not implicitly {@link figma_files.tag.GetTagRequest.verify|verify} messages.
             * @function encode
             * @memberof figma_files.tag.GetTagRequest
             * @static
             * @param {figma_files.tag.IGetTagRequest} message GetTagRequest message or plain object to encode
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
             * Encodes the specified GetTagRequest message, length delimited. Does not implicitly {@link figma_files.tag.GetTagRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof figma_files.tag.GetTagRequest
             * @static
             * @param {figma_files.tag.IGetTagRequest} message GetTagRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            GetTagRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a GetTagRequest message from the specified reader or buffer.
             * @function decode
             * @memberof figma_files.tag.GetTagRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {figma_files.tag.GetTagRequest} GetTagRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            GetTagRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_files.tag.GetTagRequest();
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
             * @memberof figma_files.tag.GetTagRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {figma_files.tag.GetTagRequest} GetTagRequest
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
             * @memberof figma_files.tag.GetTagRequest
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
             * @memberof figma_files.tag.GetTagRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {figma_files.tag.GetTagRequest} GetTagRequest
             */
            GetTagRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.figma_files.tag.GetTagRequest)
                    return object;
                let message = new $root.figma_files.tag.GetTagRequest();
                if (object.id != null)
                    message.id = object.id | 0;
                return message;
            };

            /**
             * Creates a plain object from a GetTagRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof figma_files.tag.GetTagRequest
             * @static
             * @param {figma_files.tag.GetTagRequest} message GetTagRequest
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
             * @memberof figma_files.tag.GetTagRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            GetTagRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for GetTagRequest
             * @function getTypeUrl
             * @memberof figma_files.tag.GetTagRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            GetTagRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/figma_files.tag.GetTagRequest";
            };

            return GetTagRequest;
        })();

        tag.GetTagResponse = (function() {

            /**
             * Properties of a GetTagResponse.
             * @memberof figma_files.tag
             * @interface IGetTagResponse
             * @property {figma_files.tag.ITag|null} [tag] GetTagResponse tag
             */

            /**
             * Constructs a new GetTagResponse.
             * @memberof figma_files.tag
             * @classdesc Represents a GetTagResponse.
             * @implements IGetTagResponse
             * @constructor
             * @param {figma_files.tag.IGetTagResponse=} [properties] Properties to set
             */
            function GetTagResponse(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * GetTagResponse tag.
             * @member {figma_files.tag.ITag|null|undefined} tag
             * @memberof figma_files.tag.GetTagResponse
             * @instance
             */
            GetTagResponse.prototype.tag = null;

            /**
             * Creates a new GetTagResponse instance using the specified properties.
             * @function create
             * @memberof figma_files.tag.GetTagResponse
             * @static
             * @param {figma_files.tag.IGetTagResponse=} [properties] Properties to set
             * @returns {figma_files.tag.GetTagResponse} GetTagResponse instance
             */
            GetTagResponse.create = function create(properties) {
                return new GetTagResponse(properties);
            };

            /**
             * Encodes the specified GetTagResponse message. Does not implicitly {@link figma_files.tag.GetTagResponse.verify|verify} messages.
             * @function encode
             * @memberof figma_files.tag.GetTagResponse
             * @static
             * @param {figma_files.tag.IGetTagResponse} message GetTagResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            GetTagResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.tag != null && Object.hasOwnProperty.call(message, "tag"))
                    $root.figma_files.tag.Tag.encode(message.tag, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified GetTagResponse message, length delimited. Does not implicitly {@link figma_files.tag.GetTagResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof figma_files.tag.GetTagResponse
             * @static
             * @param {figma_files.tag.IGetTagResponse} message GetTagResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            GetTagResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a GetTagResponse message from the specified reader or buffer.
             * @function decode
             * @memberof figma_files.tag.GetTagResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {figma_files.tag.GetTagResponse} GetTagResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            GetTagResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_files.tag.GetTagResponse();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.tag = $root.figma_files.tag.Tag.decode(reader, reader.uint32());
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
             * @memberof figma_files.tag.GetTagResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {figma_files.tag.GetTagResponse} GetTagResponse
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
             * @memberof figma_files.tag.GetTagResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            GetTagResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.tag != null && message.hasOwnProperty("tag")) {
                    let error = $root.figma_files.tag.Tag.verify(message.tag);
                    if (error)
                        return "tag." + error;
                }
                return null;
            };

            /**
             * Creates a GetTagResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof figma_files.tag.GetTagResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {figma_files.tag.GetTagResponse} GetTagResponse
             */
            GetTagResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.figma_files.tag.GetTagResponse)
                    return object;
                let message = new $root.figma_files.tag.GetTagResponse();
                if (object.tag != null) {
                    if (typeof object.tag !== "object")
                        throw TypeError(".figma_files.tag.GetTagResponse.tag: object expected");
                    message.tag = $root.figma_files.tag.Tag.fromObject(object.tag);
                }
                return message;
            };

            /**
             * Creates a plain object from a GetTagResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof figma_files.tag.GetTagResponse
             * @static
             * @param {figma_files.tag.GetTagResponse} message GetTagResponse
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
                    object.tag = $root.figma_files.tag.Tag.toObject(message.tag, options);
                return object;
            };

            /**
             * Converts this GetTagResponse to JSON.
             * @function toJSON
             * @memberof figma_files.tag.GetTagResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            GetTagResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for GetTagResponse
             * @function getTypeUrl
             * @memberof figma_files.tag.GetTagResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            GetTagResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/figma_files.tag.GetTagResponse";
            };

            return GetTagResponse;
        })();

        tag.DeleteTagRequest = (function() {

            /**
             * Properties of a DeleteTagRequest.
             * @memberof figma_files.tag
             * @interface IDeleteTagRequest
             * @property {number|null} [id] DeleteTagRequest id
             */

            /**
             * Constructs a new DeleteTagRequest.
             * @memberof figma_files.tag
             * @classdesc Represents a DeleteTagRequest.
             * @implements IDeleteTagRequest
             * @constructor
             * @param {figma_files.tag.IDeleteTagRequest=} [properties] Properties to set
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
             * @memberof figma_files.tag.DeleteTagRequest
             * @instance
             */
            DeleteTagRequest.prototype.id = 0;

            /**
             * Creates a new DeleteTagRequest instance using the specified properties.
             * @function create
             * @memberof figma_files.tag.DeleteTagRequest
             * @static
             * @param {figma_files.tag.IDeleteTagRequest=} [properties] Properties to set
             * @returns {figma_files.tag.DeleteTagRequest} DeleteTagRequest instance
             */
            DeleteTagRequest.create = function create(properties) {
                return new DeleteTagRequest(properties);
            };

            /**
             * Encodes the specified DeleteTagRequest message. Does not implicitly {@link figma_files.tag.DeleteTagRequest.verify|verify} messages.
             * @function encode
             * @memberof figma_files.tag.DeleteTagRequest
             * @static
             * @param {figma_files.tag.IDeleteTagRequest} message DeleteTagRequest message or plain object to encode
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
             * Encodes the specified DeleteTagRequest message, length delimited. Does not implicitly {@link figma_files.tag.DeleteTagRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof figma_files.tag.DeleteTagRequest
             * @static
             * @param {figma_files.tag.IDeleteTagRequest} message DeleteTagRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DeleteTagRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a DeleteTagRequest message from the specified reader or buffer.
             * @function decode
             * @memberof figma_files.tag.DeleteTagRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {figma_files.tag.DeleteTagRequest} DeleteTagRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DeleteTagRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_files.tag.DeleteTagRequest();
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
             * @memberof figma_files.tag.DeleteTagRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {figma_files.tag.DeleteTagRequest} DeleteTagRequest
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
             * @memberof figma_files.tag.DeleteTagRequest
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
             * @memberof figma_files.tag.DeleteTagRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {figma_files.tag.DeleteTagRequest} DeleteTagRequest
             */
            DeleteTagRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.figma_files.tag.DeleteTagRequest)
                    return object;
                let message = new $root.figma_files.tag.DeleteTagRequest();
                if (object.id != null)
                    message.id = object.id | 0;
                return message;
            };

            /**
             * Creates a plain object from a DeleteTagRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof figma_files.tag.DeleteTagRequest
             * @static
             * @param {figma_files.tag.DeleteTagRequest} message DeleteTagRequest
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
             * @memberof figma_files.tag.DeleteTagRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            DeleteTagRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for DeleteTagRequest
             * @function getTypeUrl
             * @memberof figma_files.tag.DeleteTagRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            DeleteTagRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/figma_files.tag.DeleteTagRequest";
            };

            return DeleteTagRequest;
        })();

        tag.DeleteTagResponse = (function() {

            /**
             * Properties of a DeleteTagResponse.
             * @memberof figma_files.tag
             * @interface IDeleteTagResponse
             * @property {boolean|null} [success] DeleteTagResponse success
             */

            /**
             * Constructs a new DeleteTagResponse.
             * @memberof figma_files.tag
             * @classdesc Represents a DeleteTagResponse.
             * @implements IDeleteTagResponse
             * @constructor
             * @param {figma_files.tag.IDeleteTagResponse=} [properties] Properties to set
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
             * @memberof figma_files.tag.DeleteTagResponse
             * @instance
             */
            DeleteTagResponse.prototype.success = false;

            /**
             * Creates a new DeleteTagResponse instance using the specified properties.
             * @function create
             * @memberof figma_files.tag.DeleteTagResponse
             * @static
             * @param {figma_files.tag.IDeleteTagResponse=} [properties] Properties to set
             * @returns {figma_files.tag.DeleteTagResponse} DeleteTagResponse instance
             */
            DeleteTagResponse.create = function create(properties) {
                return new DeleteTagResponse(properties);
            };

            /**
             * Encodes the specified DeleteTagResponse message. Does not implicitly {@link figma_files.tag.DeleteTagResponse.verify|verify} messages.
             * @function encode
             * @memberof figma_files.tag.DeleteTagResponse
             * @static
             * @param {figma_files.tag.IDeleteTagResponse} message DeleteTagResponse message or plain object to encode
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
             * Encodes the specified DeleteTagResponse message, length delimited. Does not implicitly {@link figma_files.tag.DeleteTagResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof figma_files.tag.DeleteTagResponse
             * @static
             * @param {figma_files.tag.IDeleteTagResponse} message DeleteTagResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DeleteTagResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a DeleteTagResponse message from the specified reader or buffer.
             * @function decode
             * @memberof figma_files.tag.DeleteTagResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {figma_files.tag.DeleteTagResponse} DeleteTagResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DeleteTagResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_files.tag.DeleteTagResponse();
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
             * @memberof figma_files.tag.DeleteTagResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {figma_files.tag.DeleteTagResponse} DeleteTagResponse
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
             * @memberof figma_files.tag.DeleteTagResponse
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
             * @memberof figma_files.tag.DeleteTagResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {figma_files.tag.DeleteTagResponse} DeleteTagResponse
             */
            DeleteTagResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.figma_files.tag.DeleteTagResponse)
                    return object;
                let message = new $root.figma_files.tag.DeleteTagResponse();
                if (object.success != null)
                    message.success = Boolean(object.success);
                return message;
            };

            /**
             * Creates a plain object from a DeleteTagResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof figma_files.tag.DeleteTagResponse
             * @static
             * @param {figma_files.tag.DeleteTagResponse} message DeleteTagResponse
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
             * @memberof figma_files.tag.DeleteTagResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            DeleteTagResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for DeleteTagResponse
             * @function getTypeUrl
             * @memberof figma_files.tag.DeleteTagResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            DeleteTagResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/figma_files.tag.DeleteTagResponse";
            };

            return DeleteTagResponse;
        })();

        return tag;
    })();

    figma_files.metadata = (function() {

        /**
         * Namespace metadata.
         * @memberof figma_files
         * @namespace
         */
        const metadata = {};

        metadata.Metadata = (function() {

            /**
             * Properties of a Metadata.
             * @memberof figma_files.metadata
             * @interface IMetadata
             * @property {number|null} [id] Metadata id
             * @property {string|null} [name] Metadata name
             * @property {string|null} [contentType] Metadata contentType
             * @property {string|null} [sourceUrl] Metadata sourceUrl
             * @property {string|null} [sourceHashId] Metadata sourceHashId
             * @property {Array.<string>|null} [labels] Metadata labels
             * @property {string|null} [figmaFileId] Metadata figmaFileId
             * @property {figma_files.common.ITimestamp|null} [createdAt] Metadata createdAt
             * @property {figma_files.common.ITimestamp|null} [updatedAt] Metadata updatedAt
             */

            /**
             * Constructs a new Metadata.
             * @memberof figma_files.metadata
             * @classdesc Represents a Metadata.
             * @implements IMetadata
             * @constructor
             * @param {figma_files.metadata.IMetadata=} [properties] Properties to set
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
             * @memberof figma_files.metadata.Metadata
             * @instance
             */
            Metadata.prototype.id = 0;

            /**
             * Metadata name.
             * @member {string} name
             * @memberof figma_files.metadata.Metadata
             * @instance
             */
            Metadata.prototype.name = "";

            /**
             * Metadata contentType.
             * @member {string} contentType
             * @memberof figma_files.metadata.Metadata
             * @instance
             */
            Metadata.prototype.contentType = "";

            /**
             * Metadata sourceUrl.
             * @member {string} sourceUrl
             * @memberof figma_files.metadata.Metadata
             * @instance
             */
            Metadata.prototype.sourceUrl = "";

            /**
             * Metadata sourceHashId.
             * @member {string} sourceHashId
             * @memberof figma_files.metadata.Metadata
             * @instance
             */
            Metadata.prototype.sourceHashId = "";

            /**
             * Metadata labels.
             * @member {Array.<string>} labels
             * @memberof figma_files.metadata.Metadata
             * @instance
             */
            Metadata.prototype.labels = $util.emptyArray;

            /**
             * Metadata figmaFileId.
             * @member {string} figmaFileId
             * @memberof figma_files.metadata.Metadata
             * @instance
             */
            Metadata.prototype.figmaFileId = "";

            /**
             * Metadata createdAt.
             * @member {figma_files.common.ITimestamp|null|undefined} createdAt
             * @memberof figma_files.metadata.Metadata
             * @instance
             */
            Metadata.prototype.createdAt = null;

            /**
             * Metadata updatedAt.
             * @member {figma_files.common.ITimestamp|null|undefined} updatedAt
             * @memberof figma_files.metadata.Metadata
             * @instance
             */
            Metadata.prototype.updatedAt = null;

            /**
             * Creates a new Metadata instance using the specified properties.
             * @function create
             * @memberof figma_files.metadata.Metadata
             * @static
             * @param {figma_files.metadata.IMetadata=} [properties] Properties to set
             * @returns {figma_files.metadata.Metadata} Metadata instance
             */
            Metadata.create = function create(properties) {
                return new Metadata(properties);
            };

            /**
             * Encodes the specified Metadata message. Does not implicitly {@link figma_files.metadata.Metadata.verify|verify} messages.
             * @function encode
             * @memberof figma_files.metadata.Metadata
             * @static
             * @param {figma_files.metadata.IMetadata} message Metadata message or plain object to encode
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
                if (message.figmaFileId != null && Object.hasOwnProperty.call(message, "figmaFileId"))
                    writer.uint32(/* id 7, wireType 2 =*/58).string(message.figmaFileId);
                if (message.createdAt != null && Object.hasOwnProperty.call(message, "createdAt"))
                    $root.figma_files.common.Timestamp.encode(message.createdAt, writer.uint32(/* id 8, wireType 2 =*/66).fork()).ldelim();
                if (message.updatedAt != null && Object.hasOwnProperty.call(message, "updatedAt"))
                    $root.figma_files.common.Timestamp.encode(message.updatedAt, writer.uint32(/* id 9, wireType 2 =*/74).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified Metadata message, length delimited. Does not implicitly {@link figma_files.metadata.Metadata.verify|verify} messages.
             * @function encodeDelimited
             * @memberof figma_files.metadata.Metadata
             * @static
             * @param {figma_files.metadata.IMetadata} message Metadata message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Metadata.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Metadata message from the specified reader or buffer.
             * @function decode
             * @memberof figma_files.metadata.Metadata
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {figma_files.metadata.Metadata} Metadata
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Metadata.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_files.metadata.Metadata();
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
                            message.figmaFileId = reader.string();
                            break;
                        }
                    case 8: {
                            message.createdAt = $root.figma_files.common.Timestamp.decode(reader, reader.uint32());
                            break;
                        }
                    case 9: {
                            message.updatedAt = $root.figma_files.common.Timestamp.decode(reader, reader.uint32());
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
             * @memberof figma_files.metadata.Metadata
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {figma_files.metadata.Metadata} Metadata
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
             * @memberof figma_files.metadata.Metadata
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
                if (message.figmaFileId != null && message.hasOwnProperty("figmaFileId"))
                    if (!$util.isString(message.figmaFileId))
                        return "figmaFileId: string expected";
                if (message.createdAt != null && message.hasOwnProperty("createdAt")) {
                    let error = $root.figma_files.common.Timestamp.verify(message.createdAt);
                    if (error)
                        return "createdAt." + error;
                }
                if (message.updatedAt != null && message.hasOwnProperty("updatedAt")) {
                    let error = $root.figma_files.common.Timestamp.verify(message.updatedAt);
                    if (error)
                        return "updatedAt." + error;
                }
                return null;
            };

            /**
             * Creates a Metadata message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof figma_files.metadata.Metadata
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {figma_files.metadata.Metadata} Metadata
             */
            Metadata.fromObject = function fromObject(object) {
                if (object instanceof $root.figma_files.metadata.Metadata)
                    return object;
                let message = new $root.figma_files.metadata.Metadata();
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
                        throw TypeError(".figma_files.metadata.Metadata.labels: array expected");
                    message.labels = [];
                    for (let i = 0; i < object.labels.length; ++i)
                        message.labels[i] = String(object.labels[i]);
                }
                if (object.figmaFileId != null)
                    message.figmaFileId = String(object.figmaFileId);
                if (object.createdAt != null) {
                    if (typeof object.createdAt !== "object")
                        throw TypeError(".figma_files.metadata.Metadata.createdAt: object expected");
                    message.createdAt = $root.figma_files.common.Timestamp.fromObject(object.createdAt);
                }
                if (object.updatedAt != null) {
                    if (typeof object.updatedAt !== "object")
                        throw TypeError(".figma_files.metadata.Metadata.updatedAt: object expected");
                    message.updatedAt = $root.figma_files.common.Timestamp.fromObject(object.updatedAt);
                }
                return message;
            };

            /**
             * Creates a plain object from a Metadata message. Also converts values to other types if specified.
             * @function toObject
             * @memberof figma_files.metadata.Metadata
             * @static
             * @param {figma_files.metadata.Metadata} message Metadata
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
                    object.figmaFileId = "";
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
                if (message.figmaFileId != null && message.hasOwnProperty("figmaFileId"))
                    object.figmaFileId = message.figmaFileId;
                if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                    object.createdAt = $root.figma_files.common.Timestamp.toObject(message.createdAt, options);
                if (message.updatedAt != null && message.hasOwnProperty("updatedAt"))
                    object.updatedAt = $root.figma_files.common.Timestamp.toObject(message.updatedAt, options);
                return object;
            };

            /**
             * Converts this Metadata to JSON.
             * @function toJSON
             * @memberof figma_files.metadata.Metadata
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Metadata.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Metadata
             * @function getTypeUrl
             * @memberof figma_files.metadata.Metadata
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Metadata.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/figma_files.metadata.Metadata";
            };

            return Metadata;
        })();

        metadata.MetadataListResponse = (function() {

            /**
             * Properties of a MetadataListResponse.
             * @memberof figma_files.metadata
             * @interface IMetadataListResponse
             * @property {Array.<figma_files.metadata.IMetadata>|null} [items] MetadataListResponse items
             */

            /**
             * Constructs a new MetadataListResponse.
             * @memberof figma_files.metadata
             * @classdesc Represents a MetadataListResponse.
             * @implements IMetadataListResponse
             * @constructor
             * @param {figma_files.metadata.IMetadataListResponse=} [properties] Properties to set
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
             * @member {Array.<figma_files.metadata.IMetadata>} items
             * @memberof figma_files.metadata.MetadataListResponse
             * @instance
             */
            MetadataListResponse.prototype.items = $util.emptyArray;

            /**
             * Creates a new MetadataListResponse instance using the specified properties.
             * @function create
             * @memberof figma_files.metadata.MetadataListResponse
             * @static
             * @param {figma_files.metadata.IMetadataListResponse=} [properties] Properties to set
             * @returns {figma_files.metadata.MetadataListResponse} MetadataListResponse instance
             */
            MetadataListResponse.create = function create(properties) {
                return new MetadataListResponse(properties);
            };

            /**
             * Encodes the specified MetadataListResponse message. Does not implicitly {@link figma_files.metadata.MetadataListResponse.verify|verify} messages.
             * @function encode
             * @memberof figma_files.metadata.MetadataListResponse
             * @static
             * @param {figma_files.metadata.IMetadataListResponse} message MetadataListResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            MetadataListResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.items != null && message.items.length)
                    for (let i = 0; i < message.items.length; ++i)
                        $root.figma_files.metadata.Metadata.encode(message.items[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified MetadataListResponse message, length delimited. Does not implicitly {@link figma_files.metadata.MetadataListResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof figma_files.metadata.MetadataListResponse
             * @static
             * @param {figma_files.metadata.IMetadataListResponse} message MetadataListResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            MetadataListResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a MetadataListResponse message from the specified reader or buffer.
             * @function decode
             * @memberof figma_files.metadata.MetadataListResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {figma_files.metadata.MetadataListResponse} MetadataListResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            MetadataListResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_files.metadata.MetadataListResponse();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            if (!(message.items && message.items.length))
                                message.items = [];
                            message.items.push($root.figma_files.metadata.Metadata.decode(reader, reader.uint32()));
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
             * @memberof figma_files.metadata.MetadataListResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {figma_files.metadata.MetadataListResponse} MetadataListResponse
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
             * @memberof figma_files.metadata.MetadataListResponse
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
                        let error = $root.figma_files.metadata.Metadata.verify(message.items[i]);
                        if (error)
                            return "items." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a MetadataListResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof figma_files.metadata.MetadataListResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {figma_files.metadata.MetadataListResponse} MetadataListResponse
             */
            MetadataListResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.figma_files.metadata.MetadataListResponse)
                    return object;
                let message = new $root.figma_files.metadata.MetadataListResponse();
                if (object.items) {
                    if (!Array.isArray(object.items))
                        throw TypeError(".figma_files.metadata.MetadataListResponse.items: array expected");
                    message.items = [];
                    for (let i = 0; i < object.items.length; ++i) {
                        if (typeof object.items[i] !== "object")
                            throw TypeError(".figma_files.metadata.MetadataListResponse.items: object expected");
                        message.items[i] = $root.figma_files.metadata.Metadata.fromObject(object.items[i]);
                    }
                }
                return message;
            };

            /**
             * Creates a plain object from a MetadataListResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof figma_files.metadata.MetadataListResponse
             * @static
             * @param {figma_files.metadata.MetadataListResponse} message MetadataListResponse
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
                        object.items[j] = $root.figma_files.metadata.Metadata.toObject(message.items[j], options);
                }
                return object;
            };

            /**
             * Converts this MetadataListResponse to JSON.
             * @function toJSON
             * @memberof figma_files.metadata.MetadataListResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            MetadataListResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for MetadataListResponse
             * @function getTypeUrl
             * @memberof figma_files.metadata.MetadataListResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            MetadataListResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/figma_files.metadata.MetadataListResponse";
            };

            return MetadataListResponse;
        })();

        metadata.CreateMetadataRequest = (function() {

            /**
             * Properties of a CreateMetadataRequest.
             * @memberof figma_files.metadata
             * @interface ICreateMetadataRequest
             * @property {string|null} [name] CreateMetadataRequest name
             * @property {string|null} [contentType] CreateMetadataRequest contentType
             * @property {string|null} [sourceUrl] CreateMetadataRequest sourceUrl
             * @property {string|null} [sourceHashId] CreateMetadataRequest sourceHashId
             * @property {Array.<string>|null} [labels] CreateMetadataRequest labels
             * @property {string|null} [figmaFileId] CreateMetadataRequest figmaFileId
             */

            /**
             * Constructs a new CreateMetadataRequest.
             * @memberof figma_files.metadata
             * @classdesc Represents a CreateMetadataRequest.
             * @implements ICreateMetadataRequest
             * @constructor
             * @param {figma_files.metadata.ICreateMetadataRequest=} [properties] Properties to set
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
             * @memberof figma_files.metadata.CreateMetadataRequest
             * @instance
             */
            CreateMetadataRequest.prototype.name = "";

            /**
             * CreateMetadataRequest contentType.
             * @member {string} contentType
             * @memberof figma_files.metadata.CreateMetadataRequest
             * @instance
             */
            CreateMetadataRequest.prototype.contentType = "";

            /**
             * CreateMetadataRequest sourceUrl.
             * @member {string} sourceUrl
             * @memberof figma_files.metadata.CreateMetadataRequest
             * @instance
             */
            CreateMetadataRequest.prototype.sourceUrl = "";

            /**
             * CreateMetadataRequest sourceHashId.
             * @member {string} sourceHashId
             * @memberof figma_files.metadata.CreateMetadataRequest
             * @instance
             */
            CreateMetadataRequest.prototype.sourceHashId = "";

            /**
             * CreateMetadataRequest labels.
             * @member {Array.<string>} labels
             * @memberof figma_files.metadata.CreateMetadataRequest
             * @instance
             */
            CreateMetadataRequest.prototype.labels = $util.emptyArray;

            /**
             * CreateMetadataRequest figmaFileId.
             * @member {string} figmaFileId
             * @memberof figma_files.metadata.CreateMetadataRequest
             * @instance
             */
            CreateMetadataRequest.prototype.figmaFileId = "";

            /**
             * Creates a new CreateMetadataRequest instance using the specified properties.
             * @function create
             * @memberof figma_files.metadata.CreateMetadataRequest
             * @static
             * @param {figma_files.metadata.ICreateMetadataRequest=} [properties] Properties to set
             * @returns {figma_files.metadata.CreateMetadataRequest} CreateMetadataRequest instance
             */
            CreateMetadataRequest.create = function create(properties) {
                return new CreateMetadataRequest(properties);
            };

            /**
             * Encodes the specified CreateMetadataRequest message. Does not implicitly {@link figma_files.metadata.CreateMetadataRequest.verify|verify} messages.
             * @function encode
             * @memberof figma_files.metadata.CreateMetadataRequest
             * @static
             * @param {figma_files.metadata.ICreateMetadataRequest} message CreateMetadataRequest message or plain object to encode
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
                if (message.figmaFileId != null && Object.hasOwnProperty.call(message, "figmaFileId"))
                    writer.uint32(/* id 6, wireType 2 =*/50).string(message.figmaFileId);
                return writer;
            };

            /**
             * Encodes the specified CreateMetadataRequest message, length delimited. Does not implicitly {@link figma_files.metadata.CreateMetadataRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof figma_files.metadata.CreateMetadataRequest
             * @static
             * @param {figma_files.metadata.ICreateMetadataRequest} message CreateMetadataRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CreateMetadataRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a CreateMetadataRequest message from the specified reader or buffer.
             * @function decode
             * @memberof figma_files.metadata.CreateMetadataRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {figma_files.metadata.CreateMetadataRequest} CreateMetadataRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CreateMetadataRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_files.metadata.CreateMetadataRequest();
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
                            message.figmaFileId = reader.string();
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
             * @memberof figma_files.metadata.CreateMetadataRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {figma_files.metadata.CreateMetadataRequest} CreateMetadataRequest
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
             * @memberof figma_files.metadata.CreateMetadataRequest
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
                if (message.figmaFileId != null && message.hasOwnProperty("figmaFileId"))
                    if (!$util.isString(message.figmaFileId))
                        return "figmaFileId: string expected";
                return null;
            };

            /**
             * Creates a CreateMetadataRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof figma_files.metadata.CreateMetadataRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {figma_files.metadata.CreateMetadataRequest} CreateMetadataRequest
             */
            CreateMetadataRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.figma_files.metadata.CreateMetadataRequest)
                    return object;
                let message = new $root.figma_files.metadata.CreateMetadataRequest();
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
                        throw TypeError(".figma_files.metadata.CreateMetadataRequest.labels: array expected");
                    message.labels = [];
                    for (let i = 0; i < object.labels.length; ++i)
                        message.labels[i] = String(object.labels[i]);
                }
                if (object.figmaFileId != null)
                    message.figmaFileId = String(object.figmaFileId);
                return message;
            };

            /**
             * Creates a plain object from a CreateMetadataRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof figma_files.metadata.CreateMetadataRequest
             * @static
             * @param {figma_files.metadata.CreateMetadataRequest} message CreateMetadataRequest
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
                    object.figmaFileId = "";
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
                if (message.figmaFileId != null && message.hasOwnProperty("figmaFileId"))
                    object.figmaFileId = message.figmaFileId;
                return object;
            };

            /**
             * Converts this CreateMetadataRequest to JSON.
             * @function toJSON
             * @memberof figma_files.metadata.CreateMetadataRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            CreateMetadataRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for CreateMetadataRequest
             * @function getTypeUrl
             * @memberof figma_files.metadata.CreateMetadataRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            CreateMetadataRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/figma_files.metadata.CreateMetadataRequest";
            };

            return CreateMetadataRequest;
        })();

        metadata.CreateMetadataResponse = (function() {

            /**
             * Properties of a CreateMetadataResponse.
             * @memberof figma_files.metadata
             * @interface ICreateMetadataResponse
             * @property {figma_files.metadata.IMetadata|null} [metadata] CreateMetadataResponse metadata
             */

            /**
             * Constructs a new CreateMetadataResponse.
             * @memberof figma_files.metadata
             * @classdesc Represents a CreateMetadataResponse.
             * @implements ICreateMetadataResponse
             * @constructor
             * @param {figma_files.metadata.ICreateMetadataResponse=} [properties] Properties to set
             */
            function CreateMetadataResponse(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * CreateMetadataResponse metadata.
             * @member {figma_files.metadata.IMetadata|null|undefined} metadata
             * @memberof figma_files.metadata.CreateMetadataResponse
             * @instance
             */
            CreateMetadataResponse.prototype.metadata = null;

            /**
             * Creates a new CreateMetadataResponse instance using the specified properties.
             * @function create
             * @memberof figma_files.metadata.CreateMetadataResponse
             * @static
             * @param {figma_files.metadata.ICreateMetadataResponse=} [properties] Properties to set
             * @returns {figma_files.metadata.CreateMetadataResponse} CreateMetadataResponse instance
             */
            CreateMetadataResponse.create = function create(properties) {
                return new CreateMetadataResponse(properties);
            };

            /**
             * Encodes the specified CreateMetadataResponse message. Does not implicitly {@link figma_files.metadata.CreateMetadataResponse.verify|verify} messages.
             * @function encode
             * @memberof figma_files.metadata.CreateMetadataResponse
             * @static
             * @param {figma_files.metadata.ICreateMetadataResponse} message CreateMetadataResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CreateMetadataResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.metadata != null && Object.hasOwnProperty.call(message, "metadata"))
                    $root.figma_files.metadata.Metadata.encode(message.metadata, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified CreateMetadataResponse message, length delimited. Does not implicitly {@link figma_files.metadata.CreateMetadataResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof figma_files.metadata.CreateMetadataResponse
             * @static
             * @param {figma_files.metadata.ICreateMetadataResponse} message CreateMetadataResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CreateMetadataResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a CreateMetadataResponse message from the specified reader or buffer.
             * @function decode
             * @memberof figma_files.metadata.CreateMetadataResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {figma_files.metadata.CreateMetadataResponse} CreateMetadataResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CreateMetadataResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_files.metadata.CreateMetadataResponse();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.metadata = $root.figma_files.metadata.Metadata.decode(reader, reader.uint32());
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
             * @memberof figma_files.metadata.CreateMetadataResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {figma_files.metadata.CreateMetadataResponse} CreateMetadataResponse
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
             * @memberof figma_files.metadata.CreateMetadataResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            CreateMetadataResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.metadata != null && message.hasOwnProperty("metadata")) {
                    let error = $root.figma_files.metadata.Metadata.verify(message.metadata);
                    if (error)
                        return "metadata." + error;
                }
                return null;
            };

            /**
             * Creates a CreateMetadataResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof figma_files.metadata.CreateMetadataResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {figma_files.metadata.CreateMetadataResponse} CreateMetadataResponse
             */
            CreateMetadataResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.figma_files.metadata.CreateMetadataResponse)
                    return object;
                let message = new $root.figma_files.metadata.CreateMetadataResponse();
                if (object.metadata != null) {
                    if (typeof object.metadata !== "object")
                        throw TypeError(".figma_files.metadata.CreateMetadataResponse.metadata: object expected");
                    message.metadata = $root.figma_files.metadata.Metadata.fromObject(object.metadata);
                }
                return message;
            };

            /**
             * Creates a plain object from a CreateMetadataResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof figma_files.metadata.CreateMetadataResponse
             * @static
             * @param {figma_files.metadata.CreateMetadataResponse} message CreateMetadataResponse
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
                    object.metadata = $root.figma_files.metadata.Metadata.toObject(message.metadata, options);
                return object;
            };

            /**
             * Converts this CreateMetadataResponse to JSON.
             * @function toJSON
             * @memberof figma_files.metadata.CreateMetadataResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            CreateMetadataResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for CreateMetadataResponse
             * @function getTypeUrl
             * @memberof figma_files.metadata.CreateMetadataResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            CreateMetadataResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/figma_files.metadata.CreateMetadataResponse";
            };

            return CreateMetadataResponse;
        })();

        metadata.UpdateMetadataRequest = (function() {

            /**
             * Properties of an UpdateMetadataRequest.
             * @memberof figma_files.metadata
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
             * @memberof figma_files.metadata
             * @classdesc Represents an UpdateMetadataRequest.
             * @implements IUpdateMetadataRequest
             * @constructor
             * @param {figma_files.metadata.IUpdateMetadataRequest=} [properties] Properties to set
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
             * @memberof figma_files.metadata.UpdateMetadataRequest
             * @instance
             */
            UpdateMetadataRequest.prototype.id = 0;

            /**
             * UpdateMetadataRequest name.
             * @member {string} name
             * @memberof figma_files.metadata.UpdateMetadataRequest
             * @instance
             */
            UpdateMetadataRequest.prototype.name = "";

            /**
             * UpdateMetadataRequest contentType.
             * @member {string} contentType
             * @memberof figma_files.metadata.UpdateMetadataRequest
             * @instance
             */
            UpdateMetadataRequest.prototype.contentType = "";

            /**
             * UpdateMetadataRequest sourceUrl.
             * @member {string} sourceUrl
             * @memberof figma_files.metadata.UpdateMetadataRequest
             * @instance
             */
            UpdateMetadataRequest.prototype.sourceUrl = "";

            /**
             * UpdateMetadataRequest sourceHashId.
             * @member {string} sourceHashId
             * @memberof figma_files.metadata.UpdateMetadataRequest
             * @instance
             */
            UpdateMetadataRequest.prototype.sourceHashId = "";

            /**
             * UpdateMetadataRequest labels.
             * @member {Array.<string>} labels
             * @memberof figma_files.metadata.UpdateMetadataRequest
             * @instance
             */
            UpdateMetadataRequest.prototype.labels = $util.emptyArray;

            /**
             * Creates a new UpdateMetadataRequest instance using the specified properties.
             * @function create
             * @memberof figma_files.metadata.UpdateMetadataRequest
             * @static
             * @param {figma_files.metadata.IUpdateMetadataRequest=} [properties] Properties to set
             * @returns {figma_files.metadata.UpdateMetadataRequest} UpdateMetadataRequest instance
             */
            UpdateMetadataRequest.create = function create(properties) {
                return new UpdateMetadataRequest(properties);
            };

            /**
             * Encodes the specified UpdateMetadataRequest message. Does not implicitly {@link figma_files.metadata.UpdateMetadataRequest.verify|verify} messages.
             * @function encode
             * @memberof figma_files.metadata.UpdateMetadataRequest
             * @static
             * @param {figma_files.metadata.IUpdateMetadataRequest} message UpdateMetadataRequest message or plain object to encode
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
             * Encodes the specified UpdateMetadataRequest message, length delimited. Does not implicitly {@link figma_files.metadata.UpdateMetadataRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof figma_files.metadata.UpdateMetadataRequest
             * @static
             * @param {figma_files.metadata.IUpdateMetadataRequest} message UpdateMetadataRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            UpdateMetadataRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an UpdateMetadataRequest message from the specified reader or buffer.
             * @function decode
             * @memberof figma_files.metadata.UpdateMetadataRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {figma_files.metadata.UpdateMetadataRequest} UpdateMetadataRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            UpdateMetadataRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_files.metadata.UpdateMetadataRequest();
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
             * @memberof figma_files.metadata.UpdateMetadataRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {figma_files.metadata.UpdateMetadataRequest} UpdateMetadataRequest
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
             * @memberof figma_files.metadata.UpdateMetadataRequest
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
             * @memberof figma_files.metadata.UpdateMetadataRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {figma_files.metadata.UpdateMetadataRequest} UpdateMetadataRequest
             */
            UpdateMetadataRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.figma_files.metadata.UpdateMetadataRequest)
                    return object;
                let message = new $root.figma_files.metadata.UpdateMetadataRequest();
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
                        throw TypeError(".figma_files.metadata.UpdateMetadataRequest.labels: array expected");
                    message.labels = [];
                    for (let i = 0; i < object.labels.length; ++i)
                        message.labels[i] = String(object.labels[i]);
                }
                return message;
            };

            /**
             * Creates a plain object from an UpdateMetadataRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof figma_files.metadata.UpdateMetadataRequest
             * @static
             * @param {figma_files.metadata.UpdateMetadataRequest} message UpdateMetadataRequest
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
             * @memberof figma_files.metadata.UpdateMetadataRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            UpdateMetadataRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for UpdateMetadataRequest
             * @function getTypeUrl
             * @memberof figma_files.metadata.UpdateMetadataRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            UpdateMetadataRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/figma_files.metadata.UpdateMetadataRequest";
            };

            return UpdateMetadataRequest;
        })();

        metadata.UpdateMetadataResponse = (function() {

            /**
             * Properties of an UpdateMetadataResponse.
             * @memberof figma_files.metadata
             * @interface IUpdateMetadataResponse
             * @property {figma_files.metadata.IMetadata|null} [metadata] UpdateMetadataResponse metadata
             */

            /**
             * Constructs a new UpdateMetadataResponse.
             * @memberof figma_files.metadata
             * @classdesc Represents an UpdateMetadataResponse.
             * @implements IUpdateMetadataResponse
             * @constructor
             * @param {figma_files.metadata.IUpdateMetadataResponse=} [properties] Properties to set
             */
            function UpdateMetadataResponse(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * UpdateMetadataResponse metadata.
             * @member {figma_files.metadata.IMetadata|null|undefined} metadata
             * @memberof figma_files.metadata.UpdateMetadataResponse
             * @instance
             */
            UpdateMetadataResponse.prototype.metadata = null;

            /**
             * Creates a new UpdateMetadataResponse instance using the specified properties.
             * @function create
             * @memberof figma_files.metadata.UpdateMetadataResponse
             * @static
             * @param {figma_files.metadata.IUpdateMetadataResponse=} [properties] Properties to set
             * @returns {figma_files.metadata.UpdateMetadataResponse} UpdateMetadataResponse instance
             */
            UpdateMetadataResponse.create = function create(properties) {
                return new UpdateMetadataResponse(properties);
            };

            /**
             * Encodes the specified UpdateMetadataResponse message. Does not implicitly {@link figma_files.metadata.UpdateMetadataResponse.verify|verify} messages.
             * @function encode
             * @memberof figma_files.metadata.UpdateMetadataResponse
             * @static
             * @param {figma_files.metadata.IUpdateMetadataResponse} message UpdateMetadataResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            UpdateMetadataResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.metadata != null && Object.hasOwnProperty.call(message, "metadata"))
                    $root.figma_files.metadata.Metadata.encode(message.metadata, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified UpdateMetadataResponse message, length delimited. Does not implicitly {@link figma_files.metadata.UpdateMetadataResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof figma_files.metadata.UpdateMetadataResponse
             * @static
             * @param {figma_files.metadata.IUpdateMetadataResponse} message UpdateMetadataResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            UpdateMetadataResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an UpdateMetadataResponse message from the specified reader or buffer.
             * @function decode
             * @memberof figma_files.metadata.UpdateMetadataResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {figma_files.metadata.UpdateMetadataResponse} UpdateMetadataResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            UpdateMetadataResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_files.metadata.UpdateMetadataResponse();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.metadata = $root.figma_files.metadata.Metadata.decode(reader, reader.uint32());
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
             * @memberof figma_files.metadata.UpdateMetadataResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {figma_files.metadata.UpdateMetadataResponse} UpdateMetadataResponse
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
             * @memberof figma_files.metadata.UpdateMetadataResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            UpdateMetadataResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.metadata != null && message.hasOwnProperty("metadata")) {
                    let error = $root.figma_files.metadata.Metadata.verify(message.metadata);
                    if (error)
                        return "metadata." + error;
                }
                return null;
            };

            /**
             * Creates an UpdateMetadataResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof figma_files.metadata.UpdateMetadataResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {figma_files.metadata.UpdateMetadataResponse} UpdateMetadataResponse
             */
            UpdateMetadataResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.figma_files.metadata.UpdateMetadataResponse)
                    return object;
                let message = new $root.figma_files.metadata.UpdateMetadataResponse();
                if (object.metadata != null) {
                    if (typeof object.metadata !== "object")
                        throw TypeError(".figma_files.metadata.UpdateMetadataResponse.metadata: object expected");
                    message.metadata = $root.figma_files.metadata.Metadata.fromObject(object.metadata);
                }
                return message;
            };

            /**
             * Creates a plain object from an UpdateMetadataResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof figma_files.metadata.UpdateMetadataResponse
             * @static
             * @param {figma_files.metadata.UpdateMetadataResponse} message UpdateMetadataResponse
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
                    object.metadata = $root.figma_files.metadata.Metadata.toObject(message.metadata, options);
                return object;
            };

            /**
             * Converts this UpdateMetadataResponse to JSON.
             * @function toJSON
             * @memberof figma_files.metadata.UpdateMetadataResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            UpdateMetadataResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for UpdateMetadataResponse
             * @function getTypeUrl
             * @memberof figma_files.metadata.UpdateMetadataResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            UpdateMetadataResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/figma_files.metadata.UpdateMetadataResponse";
            };

            return UpdateMetadataResponse;
        })();

        metadata.GetMetadataRequest = (function() {

            /**
             * Properties of a GetMetadataRequest.
             * @memberof figma_files.metadata
             * @interface IGetMetadataRequest
             * @property {number|null} [id] GetMetadataRequest id
             */

            /**
             * Constructs a new GetMetadataRequest.
             * @memberof figma_files.metadata
             * @classdesc Represents a GetMetadataRequest.
             * @implements IGetMetadataRequest
             * @constructor
             * @param {figma_files.metadata.IGetMetadataRequest=} [properties] Properties to set
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
             * @memberof figma_files.metadata.GetMetadataRequest
             * @instance
             */
            GetMetadataRequest.prototype.id = 0;

            /**
             * Creates a new GetMetadataRequest instance using the specified properties.
             * @function create
             * @memberof figma_files.metadata.GetMetadataRequest
             * @static
             * @param {figma_files.metadata.IGetMetadataRequest=} [properties] Properties to set
             * @returns {figma_files.metadata.GetMetadataRequest} GetMetadataRequest instance
             */
            GetMetadataRequest.create = function create(properties) {
                return new GetMetadataRequest(properties);
            };

            /**
             * Encodes the specified GetMetadataRequest message. Does not implicitly {@link figma_files.metadata.GetMetadataRequest.verify|verify} messages.
             * @function encode
             * @memberof figma_files.metadata.GetMetadataRequest
             * @static
             * @param {figma_files.metadata.IGetMetadataRequest} message GetMetadataRequest message or plain object to encode
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
             * Encodes the specified GetMetadataRequest message, length delimited. Does not implicitly {@link figma_files.metadata.GetMetadataRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof figma_files.metadata.GetMetadataRequest
             * @static
             * @param {figma_files.metadata.IGetMetadataRequest} message GetMetadataRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            GetMetadataRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a GetMetadataRequest message from the specified reader or buffer.
             * @function decode
             * @memberof figma_files.metadata.GetMetadataRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {figma_files.metadata.GetMetadataRequest} GetMetadataRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            GetMetadataRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_files.metadata.GetMetadataRequest();
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
             * @memberof figma_files.metadata.GetMetadataRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {figma_files.metadata.GetMetadataRequest} GetMetadataRequest
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
             * @memberof figma_files.metadata.GetMetadataRequest
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
             * @memberof figma_files.metadata.GetMetadataRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {figma_files.metadata.GetMetadataRequest} GetMetadataRequest
             */
            GetMetadataRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.figma_files.metadata.GetMetadataRequest)
                    return object;
                let message = new $root.figma_files.metadata.GetMetadataRequest();
                if (object.id != null)
                    message.id = object.id | 0;
                return message;
            };

            /**
             * Creates a plain object from a GetMetadataRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof figma_files.metadata.GetMetadataRequest
             * @static
             * @param {figma_files.metadata.GetMetadataRequest} message GetMetadataRequest
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
             * @memberof figma_files.metadata.GetMetadataRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            GetMetadataRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for GetMetadataRequest
             * @function getTypeUrl
             * @memberof figma_files.metadata.GetMetadataRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            GetMetadataRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/figma_files.metadata.GetMetadataRequest";
            };

            return GetMetadataRequest;
        })();

        metadata.GetMetadataResponse = (function() {

            /**
             * Properties of a GetMetadataResponse.
             * @memberof figma_files.metadata
             * @interface IGetMetadataResponse
             * @property {figma_files.metadata.IMetadata|null} [metadata] GetMetadataResponse metadata
             */

            /**
             * Constructs a new GetMetadataResponse.
             * @memberof figma_files.metadata
             * @classdesc Represents a GetMetadataResponse.
             * @implements IGetMetadataResponse
             * @constructor
             * @param {figma_files.metadata.IGetMetadataResponse=} [properties] Properties to set
             */
            function GetMetadataResponse(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * GetMetadataResponse metadata.
             * @member {figma_files.metadata.IMetadata|null|undefined} metadata
             * @memberof figma_files.metadata.GetMetadataResponse
             * @instance
             */
            GetMetadataResponse.prototype.metadata = null;

            /**
             * Creates a new GetMetadataResponse instance using the specified properties.
             * @function create
             * @memberof figma_files.metadata.GetMetadataResponse
             * @static
             * @param {figma_files.metadata.IGetMetadataResponse=} [properties] Properties to set
             * @returns {figma_files.metadata.GetMetadataResponse} GetMetadataResponse instance
             */
            GetMetadataResponse.create = function create(properties) {
                return new GetMetadataResponse(properties);
            };

            /**
             * Encodes the specified GetMetadataResponse message. Does not implicitly {@link figma_files.metadata.GetMetadataResponse.verify|verify} messages.
             * @function encode
             * @memberof figma_files.metadata.GetMetadataResponse
             * @static
             * @param {figma_files.metadata.IGetMetadataResponse} message GetMetadataResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            GetMetadataResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.metadata != null && Object.hasOwnProperty.call(message, "metadata"))
                    $root.figma_files.metadata.Metadata.encode(message.metadata, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified GetMetadataResponse message, length delimited. Does not implicitly {@link figma_files.metadata.GetMetadataResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof figma_files.metadata.GetMetadataResponse
             * @static
             * @param {figma_files.metadata.IGetMetadataResponse} message GetMetadataResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            GetMetadataResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a GetMetadataResponse message from the specified reader or buffer.
             * @function decode
             * @memberof figma_files.metadata.GetMetadataResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {figma_files.metadata.GetMetadataResponse} GetMetadataResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            GetMetadataResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_files.metadata.GetMetadataResponse();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.metadata = $root.figma_files.metadata.Metadata.decode(reader, reader.uint32());
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
             * @memberof figma_files.metadata.GetMetadataResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {figma_files.metadata.GetMetadataResponse} GetMetadataResponse
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
             * @memberof figma_files.metadata.GetMetadataResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            GetMetadataResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.metadata != null && message.hasOwnProperty("metadata")) {
                    let error = $root.figma_files.metadata.Metadata.verify(message.metadata);
                    if (error)
                        return "metadata." + error;
                }
                return null;
            };

            /**
             * Creates a GetMetadataResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof figma_files.metadata.GetMetadataResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {figma_files.metadata.GetMetadataResponse} GetMetadataResponse
             */
            GetMetadataResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.figma_files.metadata.GetMetadataResponse)
                    return object;
                let message = new $root.figma_files.metadata.GetMetadataResponse();
                if (object.metadata != null) {
                    if (typeof object.metadata !== "object")
                        throw TypeError(".figma_files.metadata.GetMetadataResponse.metadata: object expected");
                    message.metadata = $root.figma_files.metadata.Metadata.fromObject(object.metadata);
                }
                return message;
            };

            /**
             * Creates a plain object from a GetMetadataResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof figma_files.metadata.GetMetadataResponse
             * @static
             * @param {figma_files.metadata.GetMetadataResponse} message GetMetadataResponse
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
                    object.metadata = $root.figma_files.metadata.Metadata.toObject(message.metadata, options);
                return object;
            };

            /**
             * Converts this GetMetadataResponse to JSON.
             * @function toJSON
             * @memberof figma_files.metadata.GetMetadataResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            GetMetadataResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for GetMetadataResponse
             * @function getTypeUrl
             * @memberof figma_files.metadata.GetMetadataResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            GetMetadataResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/figma_files.metadata.GetMetadataResponse";
            };

            return GetMetadataResponse;
        })();

        metadata.DeleteMetadataRequest = (function() {

            /**
             * Properties of a DeleteMetadataRequest.
             * @memberof figma_files.metadata
             * @interface IDeleteMetadataRequest
             * @property {number|null} [id] DeleteMetadataRequest id
             */

            /**
             * Constructs a new DeleteMetadataRequest.
             * @memberof figma_files.metadata
             * @classdesc Represents a DeleteMetadataRequest.
             * @implements IDeleteMetadataRequest
             * @constructor
             * @param {figma_files.metadata.IDeleteMetadataRequest=} [properties] Properties to set
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
             * @memberof figma_files.metadata.DeleteMetadataRequest
             * @instance
             */
            DeleteMetadataRequest.prototype.id = 0;

            /**
             * Creates a new DeleteMetadataRequest instance using the specified properties.
             * @function create
             * @memberof figma_files.metadata.DeleteMetadataRequest
             * @static
             * @param {figma_files.metadata.IDeleteMetadataRequest=} [properties] Properties to set
             * @returns {figma_files.metadata.DeleteMetadataRequest} DeleteMetadataRequest instance
             */
            DeleteMetadataRequest.create = function create(properties) {
                return new DeleteMetadataRequest(properties);
            };

            /**
             * Encodes the specified DeleteMetadataRequest message. Does not implicitly {@link figma_files.metadata.DeleteMetadataRequest.verify|verify} messages.
             * @function encode
             * @memberof figma_files.metadata.DeleteMetadataRequest
             * @static
             * @param {figma_files.metadata.IDeleteMetadataRequest} message DeleteMetadataRequest message or plain object to encode
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
             * Encodes the specified DeleteMetadataRequest message, length delimited. Does not implicitly {@link figma_files.metadata.DeleteMetadataRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof figma_files.metadata.DeleteMetadataRequest
             * @static
             * @param {figma_files.metadata.IDeleteMetadataRequest} message DeleteMetadataRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DeleteMetadataRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a DeleteMetadataRequest message from the specified reader or buffer.
             * @function decode
             * @memberof figma_files.metadata.DeleteMetadataRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {figma_files.metadata.DeleteMetadataRequest} DeleteMetadataRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DeleteMetadataRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_files.metadata.DeleteMetadataRequest();
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
             * @memberof figma_files.metadata.DeleteMetadataRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {figma_files.metadata.DeleteMetadataRequest} DeleteMetadataRequest
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
             * @memberof figma_files.metadata.DeleteMetadataRequest
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
             * @memberof figma_files.metadata.DeleteMetadataRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {figma_files.metadata.DeleteMetadataRequest} DeleteMetadataRequest
             */
            DeleteMetadataRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.figma_files.metadata.DeleteMetadataRequest)
                    return object;
                let message = new $root.figma_files.metadata.DeleteMetadataRequest();
                if (object.id != null)
                    message.id = object.id | 0;
                return message;
            };

            /**
             * Creates a plain object from a DeleteMetadataRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof figma_files.metadata.DeleteMetadataRequest
             * @static
             * @param {figma_files.metadata.DeleteMetadataRequest} message DeleteMetadataRequest
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
             * @memberof figma_files.metadata.DeleteMetadataRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            DeleteMetadataRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for DeleteMetadataRequest
             * @function getTypeUrl
             * @memberof figma_files.metadata.DeleteMetadataRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            DeleteMetadataRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/figma_files.metadata.DeleteMetadataRequest";
            };

            return DeleteMetadataRequest;
        })();

        metadata.DeleteMetadataResponse = (function() {

            /**
             * Properties of a DeleteMetadataResponse.
             * @memberof figma_files.metadata
             * @interface IDeleteMetadataResponse
             * @property {boolean|null} [success] DeleteMetadataResponse success
             */

            /**
             * Constructs a new DeleteMetadataResponse.
             * @memberof figma_files.metadata
             * @classdesc Represents a DeleteMetadataResponse.
             * @implements IDeleteMetadataResponse
             * @constructor
             * @param {figma_files.metadata.IDeleteMetadataResponse=} [properties] Properties to set
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
             * @memberof figma_files.metadata.DeleteMetadataResponse
             * @instance
             */
            DeleteMetadataResponse.prototype.success = false;

            /**
             * Creates a new DeleteMetadataResponse instance using the specified properties.
             * @function create
             * @memberof figma_files.metadata.DeleteMetadataResponse
             * @static
             * @param {figma_files.metadata.IDeleteMetadataResponse=} [properties] Properties to set
             * @returns {figma_files.metadata.DeleteMetadataResponse} DeleteMetadataResponse instance
             */
            DeleteMetadataResponse.create = function create(properties) {
                return new DeleteMetadataResponse(properties);
            };

            /**
             * Encodes the specified DeleteMetadataResponse message. Does not implicitly {@link figma_files.metadata.DeleteMetadataResponse.verify|verify} messages.
             * @function encode
             * @memberof figma_files.metadata.DeleteMetadataResponse
             * @static
             * @param {figma_files.metadata.IDeleteMetadataResponse} message DeleteMetadataResponse message or plain object to encode
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
             * Encodes the specified DeleteMetadataResponse message, length delimited. Does not implicitly {@link figma_files.metadata.DeleteMetadataResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof figma_files.metadata.DeleteMetadataResponse
             * @static
             * @param {figma_files.metadata.IDeleteMetadataResponse} message DeleteMetadataResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DeleteMetadataResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a DeleteMetadataResponse message from the specified reader or buffer.
             * @function decode
             * @memberof figma_files.metadata.DeleteMetadataResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {figma_files.metadata.DeleteMetadataResponse} DeleteMetadataResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DeleteMetadataResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_files.metadata.DeleteMetadataResponse();
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
             * @memberof figma_files.metadata.DeleteMetadataResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {figma_files.metadata.DeleteMetadataResponse} DeleteMetadataResponse
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
             * @memberof figma_files.metadata.DeleteMetadataResponse
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
             * @memberof figma_files.metadata.DeleteMetadataResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {figma_files.metadata.DeleteMetadataResponse} DeleteMetadataResponse
             */
            DeleteMetadataResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.figma_files.metadata.DeleteMetadataResponse)
                    return object;
                let message = new $root.figma_files.metadata.DeleteMetadataResponse();
                if (object.success != null)
                    message.success = Boolean(object.success);
                return message;
            };

            /**
             * Creates a plain object from a DeleteMetadataResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof figma_files.metadata.DeleteMetadataResponse
             * @static
             * @param {figma_files.metadata.DeleteMetadataResponse} message DeleteMetadataResponse
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
             * @memberof figma_files.metadata.DeleteMetadataResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            DeleteMetadataResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for DeleteMetadataResponse
             * @function getTypeUrl
             * @memberof figma_files.metadata.DeleteMetadataResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            DeleteMetadataResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/figma_files.metadata.DeleteMetadataResponse";
            };

            return DeleteMetadataResponse;
        })();

        return metadata;
    })();

    return figma_files;
})();

export { $root as default };
