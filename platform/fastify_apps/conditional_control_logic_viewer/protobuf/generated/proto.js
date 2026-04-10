/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const conditional_control_logic_viewer = $root.conditional_control_logic_viewer = (() => {

    /**
     * Namespace conditional_control_logic_viewer.
     * @exports conditional_control_logic_viewer
     * @namespace
     */
    const conditional_control_logic_viewer = {};

    /**
     * FilterTreeStatus enum.
     * @name conditional_control_logic_viewer.FilterTreeStatus
     * @enum {number}
     * @property {number} FILTER_TREE_STATUS_UNSPECIFIED=0 FILTER_TREE_STATUS_UNSPECIFIED value
     * @property {number} FILTER_TREE_STATUS_ACTIVE=1 FILTER_TREE_STATUS_ACTIVE value
     * @property {number} FILTER_TREE_STATUS_ARCHIVED=2 FILTER_TREE_STATUS_ARCHIVED value
     */
    conditional_control_logic_viewer.FilterTreeStatus = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "FILTER_TREE_STATUS_UNSPECIFIED"] = 0;
        values[valuesById[1] = "FILTER_TREE_STATUS_ACTIVE"] = 1;
        values[valuesById[2] = "FILTER_TREE_STATUS_ARCHIVED"] = 2;
        return values;
    })();

    /**
     * LogicalOperator enum.
     * @name conditional_control_logic_viewer.LogicalOperator
     * @enum {number}
     * @property {number} LOGICAL_OPERATOR_UNSPECIFIED=0 LOGICAL_OPERATOR_UNSPECIFIED value
     * @property {number} LOGICAL_OPERATOR_AND=1 LOGICAL_OPERATOR_AND value
     * @property {number} LOGICAL_OPERATOR_OR=2 LOGICAL_OPERATOR_OR value
     */
    conditional_control_logic_viewer.LogicalOperator = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "LOGICAL_OPERATOR_UNSPECIFIED"] = 0;
        values[valuesById[1] = "LOGICAL_OPERATOR_AND"] = 1;
        values[valuesById[2] = "LOGICAL_OPERATOR_OR"] = 2;
        return values;
    })();

    /**
     * FilterNodeType enum.
     * @name conditional_control_logic_viewer.FilterNodeType
     * @enum {number}
     * @property {number} FILTER_NODE_TYPE_UNSPECIFIED=0 FILTER_NODE_TYPE_UNSPECIFIED value
     * @property {number} FILTER_NODE_TYPE_FILTER=1 FILTER_NODE_TYPE_FILTER value
     * @property {number} FILTER_NODE_TYPE_GROUP=2 FILTER_NODE_TYPE_GROUP value
     */
    conditional_control_logic_viewer.FilterNodeType = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "FILTER_NODE_TYPE_UNSPECIFIED"] = 0;
        values[valuesById[1] = "FILTER_NODE_TYPE_FILTER"] = 1;
        values[valuesById[2] = "FILTER_NODE_TYPE_GROUP"] = 2;
        return values;
    })();

    conditional_control_logic_viewer.PaginationRequest = (function() {

        /**
         * Properties of a PaginationRequest.
         * @memberof conditional_control_logic_viewer
         * @interface IPaginationRequest
         * @property {number|null} [page] PaginationRequest page
         * @property {number|null} [pageSize] PaginationRequest pageSize
         */

        /**
         * Constructs a new PaginationRequest.
         * @memberof conditional_control_logic_viewer
         * @classdesc Represents a PaginationRequest.
         * @implements IPaginationRequest
         * @constructor
         * @param {conditional_control_logic_viewer.IPaginationRequest=} [properties] Properties to set
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
         * @memberof conditional_control_logic_viewer.PaginationRequest
         * @instance
         */
        PaginationRequest.prototype.page = 0;

        /**
         * PaginationRequest pageSize.
         * @member {number} pageSize
         * @memberof conditional_control_logic_viewer.PaginationRequest
         * @instance
         */
        PaginationRequest.prototype.pageSize = 0;

        /**
         * Creates a new PaginationRequest instance using the specified properties.
         * @function create
         * @memberof conditional_control_logic_viewer.PaginationRequest
         * @static
         * @param {conditional_control_logic_viewer.IPaginationRequest=} [properties] Properties to set
         * @returns {conditional_control_logic_viewer.PaginationRequest} PaginationRequest instance
         */
        PaginationRequest.create = function create(properties) {
            return new PaginationRequest(properties);
        };

        /**
         * Encodes the specified PaginationRequest message. Does not implicitly {@link conditional_control_logic_viewer.PaginationRequest.verify|verify} messages.
         * @function encode
         * @memberof conditional_control_logic_viewer.PaginationRequest
         * @static
         * @param {conditional_control_logic_viewer.IPaginationRequest} message PaginationRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PaginationRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.page != null && Object.hasOwnProperty.call(message, "page"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.page);
            if (message.pageSize != null && Object.hasOwnProperty.call(message, "pageSize"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.pageSize);
            return writer;
        };

        /**
         * Encodes the specified PaginationRequest message, length delimited. Does not implicitly {@link conditional_control_logic_viewer.PaginationRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof conditional_control_logic_viewer.PaginationRequest
         * @static
         * @param {conditional_control_logic_viewer.IPaginationRequest} message PaginationRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PaginationRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PaginationRequest message from the specified reader or buffer.
         * @function decode
         * @memberof conditional_control_logic_viewer.PaginationRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {conditional_control_logic_viewer.PaginationRequest} PaginationRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PaginationRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.conditional_control_logic_viewer.PaginationRequest();
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
                        message.pageSize = reader.int32();
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
         * @memberof conditional_control_logic_viewer.PaginationRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {conditional_control_logic_viewer.PaginationRequest} PaginationRequest
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
         * @memberof conditional_control_logic_viewer.PaginationRequest
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
            if (message.pageSize != null && message.hasOwnProperty("pageSize"))
                if (!$util.isInteger(message.pageSize))
                    return "pageSize: integer expected";
            return null;
        };

        /**
         * Creates a PaginationRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof conditional_control_logic_viewer.PaginationRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {conditional_control_logic_viewer.PaginationRequest} PaginationRequest
         */
        PaginationRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.conditional_control_logic_viewer.PaginationRequest)
                return object;
            let message = new $root.conditional_control_logic_viewer.PaginationRequest();
            if (object.page != null)
                message.page = object.page | 0;
            if (object.pageSize != null)
                message.pageSize = object.pageSize | 0;
            return message;
        };

        /**
         * Creates a plain object from a PaginationRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof conditional_control_logic_viewer.PaginationRequest
         * @static
         * @param {conditional_control_logic_viewer.PaginationRequest} message PaginationRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PaginationRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.page = 0;
                object.pageSize = 0;
            }
            if (message.page != null && message.hasOwnProperty("page"))
                object.page = message.page;
            if (message.pageSize != null && message.hasOwnProperty("pageSize"))
                object.pageSize = message.pageSize;
            return object;
        };

        /**
         * Converts this PaginationRequest to JSON.
         * @function toJSON
         * @memberof conditional_control_logic_viewer.PaginationRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PaginationRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PaginationRequest
         * @function getTypeUrl
         * @memberof conditional_control_logic_viewer.PaginationRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PaginationRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/conditional_control_logic_viewer.PaginationRequest";
        };

        return PaginationRequest;
    })();

    conditional_control_logic_viewer.PaginationResponse = (function() {

        /**
         * Properties of a PaginationResponse.
         * @memberof conditional_control_logic_viewer
         * @interface IPaginationResponse
         * @property {number|null} [total] PaginationResponse total
         * @property {number|null} [page] PaginationResponse page
         * @property {number|null} [pageSize] PaginationResponse pageSize
         * @property {number|null} [totalPages] PaginationResponse totalPages
         */

        /**
         * Constructs a new PaginationResponse.
         * @memberof conditional_control_logic_viewer
         * @classdesc Represents a PaginationResponse.
         * @implements IPaginationResponse
         * @constructor
         * @param {conditional_control_logic_viewer.IPaginationResponse=} [properties] Properties to set
         */
        function PaginationResponse(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PaginationResponse total.
         * @member {number} total
         * @memberof conditional_control_logic_viewer.PaginationResponse
         * @instance
         */
        PaginationResponse.prototype.total = 0;

        /**
         * PaginationResponse page.
         * @member {number} page
         * @memberof conditional_control_logic_viewer.PaginationResponse
         * @instance
         */
        PaginationResponse.prototype.page = 0;

        /**
         * PaginationResponse pageSize.
         * @member {number} pageSize
         * @memberof conditional_control_logic_viewer.PaginationResponse
         * @instance
         */
        PaginationResponse.prototype.pageSize = 0;

        /**
         * PaginationResponse totalPages.
         * @member {number} totalPages
         * @memberof conditional_control_logic_viewer.PaginationResponse
         * @instance
         */
        PaginationResponse.prototype.totalPages = 0;

        /**
         * Creates a new PaginationResponse instance using the specified properties.
         * @function create
         * @memberof conditional_control_logic_viewer.PaginationResponse
         * @static
         * @param {conditional_control_logic_viewer.IPaginationResponse=} [properties] Properties to set
         * @returns {conditional_control_logic_viewer.PaginationResponse} PaginationResponse instance
         */
        PaginationResponse.create = function create(properties) {
            return new PaginationResponse(properties);
        };

        /**
         * Encodes the specified PaginationResponse message. Does not implicitly {@link conditional_control_logic_viewer.PaginationResponse.verify|verify} messages.
         * @function encode
         * @memberof conditional_control_logic_viewer.PaginationResponse
         * @static
         * @param {conditional_control_logic_viewer.IPaginationResponse} message PaginationResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PaginationResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.total != null && Object.hasOwnProperty.call(message, "total"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.total);
            if (message.page != null && Object.hasOwnProperty.call(message, "page"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.page);
            if (message.pageSize != null && Object.hasOwnProperty.call(message, "pageSize"))
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.pageSize);
            if (message.totalPages != null && Object.hasOwnProperty.call(message, "totalPages"))
                writer.uint32(/* id 4, wireType 0 =*/32).int32(message.totalPages);
            return writer;
        };

        /**
         * Encodes the specified PaginationResponse message, length delimited. Does not implicitly {@link conditional_control_logic_viewer.PaginationResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof conditional_control_logic_viewer.PaginationResponse
         * @static
         * @param {conditional_control_logic_viewer.IPaginationResponse} message PaginationResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PaginationResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PaginationResponse message from the specified reader or buffer.
         * @function decode
         * @memberof conditional_control_logic_viewer.PaginationResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {conditional_control_logic_viewer.PaginationResponse} PaginationResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PaginationResponse.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.conditional_control_logic_viewer.PaginationResponse();
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
                        message.pageSize = reader.int32();
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
         * @memberof conditional_control_logic_viewer.PaginationResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {conditional_control_logic_viewer.PaginationResponse} PaginationResponse
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
         * @memberof conditional_control_logic_viewer.PaginationResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PaginationResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.total != null && message.hasOwnProperty("total"))
                if (!$util.isInteger(message.total))
                    return "total: integer expected";
            if (message.page != null && message.hasOwnProperty("page"))
                if (!$util.isInteger(message.page))
                    return "page: integer expected";
            if (message.pageSize != null && message.hasOwnProperty("pageSize"))
                if (!$util.isInteger(message.pageSize))
                    return "pageSize: integer expected";
            if (message.totalPages != null && message.hasOwnProperty("totalPages"))
                if (!$util.isInteger(message.totalPages))
                    return "totalPages: integer expected";
            return null;
        };

        /**
         * Creates a PaginationResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof conditional_control_logic_viewer.PaginationResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {conditional_control_logic_viewer.PaginationResponse} PaginationResponse
         */
        PaginationResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.conditional_control_logic_viewer.PaginationResponse)
                return object;
            let message = new $root.conditional_control_logic_viewer.PaginationResponse();
            if (object.total != null)
                message.total = object.total | 0;
            if (object.page != null)
                message.page = object.page | 0;
            if (object.pageSize != null)
                message.pageSize = object.pageSize | 0;
            if (object.totalPages != null)
                message.totalPages = object.totalPages | 0;
            return message;
        };

        /**
         * Creates a plain object from a PaginationResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof conditional_control_logic_viewer.PaginationResponse
         * @static
         * @param {conditional_control_logic_viewer.PaginationResponse} message PaginationResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PaginationResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.total = 0;
                object.page = 0;
                object.pageSize = 0;
                object.totalPages = 0;
            }
            if (message.total != null && message.hasOwnProperty("total"))
                object.total = message.total;
            if (message.page != null && message.hasOwnProperty("page"))
                object.page = message.page;
            if (message.pageSize != null && message.hasOwnProperty("pageSize"))
                object.pageSize = message.pageSize;
            if (message.totalPages != null && message.hasOwnProperty("totalPages"))
                object.totalPages = message.totalPages;
            return object;
        };

        /**
         * Converts this PaginationResponse to JSON.
         * @function toJSON
         * @memberof conditional_control_logic_viewer.PaginationResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PaginationResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PaginationResponse
         * @function getTypeUrl
         * @memberof conditional_control_logic_viewer.PaginationResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PaginationResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/conditional_control_logic_viewer.PaginationResponse";
        };

        return PaginationResponse;
    })();

    conditional_control_logic_viewer.Timestamp = (function() {

        /**
         * Properties of a Timestamp.
         * @memberof conditional_control_logic_viewer
         * @interface ITimestamp
         * @property {number|Long|null} [seconds] Timestamp seconds
         * @property {number|null} [nanos] Timestamp nanos
         */

        /**
         * Constructs a new Timestamp.
         * @memberof conditional_control_logic_viewer
         * @classdesc Represents a Timestamp.
         * @implements ITimestamp
         * @constructor
         * @param {conditional_control_logic_viewer.ITimestamp=} [properties] Properties to set
         */
        function Timestamp(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Timestamp seconds.
         * @member {number|Long} seconds
         * @memberof conditional_control_logic_viewer.Timestamp
         * @instance
         */
        Timestamp.prototype.seconds = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Timestamp nanos.
         * @member {number} nanos
         * @memberof conditional_control_logic_viewer.Timestamp
         * @instance
         */
        Timestamp.prototype.nanos = 0;

        /**
         * Creates a new Timestamp instance using the specified properties.
         * @function create
         * @memberof conditional_control_logic_viewer.Timestamp
         * @static
         * @param {conditional_control_logic_viewer.ITimestamp=} [properties] Properties to set
         * @returns {conditional_control_logic_viewer.Timestamp} Timestamp instance
         */
        Timestamp.create = function create(properties) {
            return new Timestamp(properties);
        };

        /**
         * Encodes the specified Timestamp message. Does not implicitly {@link conditional_control_logic_viewer.Timestamp.verify|verify} messages.
         * @function encode
         * @memberof conditional_control_logic_viewer.Timestamp
         * @static
         * @param {conditional_control_logic_viewer.ITimestamp} message Timestamp message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Timestamp.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.seconds != null && Object.hasOwnProperty.call(message, "seconds"))
                writer.uint32(/* id 1, wireType 0 =*/8).int64(message.seconds);
            if (message.nanos != null && Object.hasOwnProperty.call(message, "nanos"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.nanos);
            return writer;
        };

        /**
         * Encodes the specified Timestamp message, length delimited. Does not implicitly {@link conditional_control_logic_viewer.Timestamp.verify|verify} messages.
         * @function encodeDelimited
         * @memberof conditional_control_logic_viewer.Timestamp
         * @static
         * @param {conditional_control_logic_viewer.ITimestamp} message Timestamp message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Timestamp.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Timestamp message from the specified reader or buffer.
         * @function decode
         * @memberof conditional_control_logic_viewer.Timestamp
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {conditional_control_logic_viewer.Timestamp} Timestamp
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Timestamp.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.conditional_control_logic_viewer.Timestamp();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.seconds = reader.int64();
                        break;
                    }
                case 2: {
                        message.nanos = reader.int32();
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
         * @memberof conditional_control_logic_viewer.Timestamp
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {conditional_control_logic_viewer.Timestamp} Timestamp
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
         * @memberof conditional_control_logic_viewer.Timestamp
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Timestamp.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.seconds != null && message.hasOwnProperty("seconds"))
                if (!$util.isInteger(message.seconds) && !(message.seconds && $util.isInteger(message.seconds.low) && $util.isInteger(message.seconds.high)))
                    return "seconds: integer|Long expected";
            if (message.nanos != null && message.hasOwnProperty("nanos"))
                if (!$util.isInteger(message.nanos))
                    return "nanos: integer expected";
            return null;
        };

        /**
         * Creates a Timestamp message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof conditional_control_logic_viewer.Timestamp
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {conditional_control_logic_viewer.Timestamp} Timestamp
         */
        Timestamp.fromObject = function fromObject(object) {
            if (object instanceof $root.conditional_control_logic_viewer.Timestamp)
                return object;
            let message = new $root.conditional_control_logic_viewer.Timestamp();
            if (object.seconds != null)
                if ($util.Long)
                    (message.seconds = $util.Long.fromValue(object.seconds)).unsigned = false;
                else if (typeof object.seconds === "string")
                    message.seconds = parseInt(object.seconds, 10);
                else if (typeof object.seconds === "number")
                    message.seconds = object.seconds;
                else if (typeof object.seconds === "object")
                    message.seconds = new $util.LongBits(object.seconds.low >>> 0, object.seconds.high >>> 0).toNumber();
            if (object.nanos != null)
                message.nanos = object.nanos | 0;
            return message;
        };

        /**
         * Creates a plain object from a Timestamp message. Also converts values to other types if specified.
         * @function toObject
         * @memberof conditional_control_logic_viewer.Timestamp
         * @static
         * @param {conditional_control_logic_viewer.Timestamp} message Timestamp
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Timestamp.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.seconds = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.seconds = options.longs === String ? "0" : 0;
                object.nanos = 0;
            }
            if (message.seconds != null && message.hasOwnProperty("seconds"))
                if (typeof message.seconds === "number")
                    object.seconds = options.longs === String ? String(message.seconds) : message.seconds;
                else
                    object.seconds = options.longs === String ? $util.Long.prototype.toString.call(message.seconds) : options.longs === Number ? new $util.LongBits(message.seconds.low >>> 0, message.seconds.high >>> 0).toNumber() : message.seconds;
            if (message.nanos != null && message.hasOwnProperty("nanos"))
                object.nanos = message.nanos;
            return object;
        };

        /**
         * Converts this Timestamp to JSON.
         * @function toJSON
         * @memberof conditional_control_logic_viewer.Timestamp
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Timestamp.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Timestamp
         * @function getTypeUrl
         * @memberof conditional_control_logic_viewer.Timestamp
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Timestamp.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/conditional_control_logic_viewer.Timestamp";
        };

        return Timestamp;
    })();

    conditional_control_logic_viewer.FilterCondition = (function() {

        /**
         * Properties of a FilterCondition.
         * @memberof conditional_control_logic_viewer
         * @interface IFilterCondition
         * @property {string|null} [field] FilterCondition field
         * @property {string|null} [operator] FilterCondition operator
         * @property {string|null} [value] FilterCondition value
         */

        /**
         * Constructs a new FilterCondition.
         * @memberof conditional_control_logic_viewer
         * @classdesc Represents a FilterCondition.
         * @implements IFilterCondition
         * @constructor
         * @param {conditional_control_logic_viewer.IFilterCondition=} [properties] Properties to set
         */
        function FilterCondition(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * FilterCondition field.
         * @member {string} field
         * @memberof conditional_control_logic_viewer.FilterCondition
         * @instance
         */
        FilterCondition.prototype.field = "";

        /**
         * FilterCondition operator.
         * @member {string} operator
         * @memberof conditional_control_logic_viewer.FilterCondition
         * @instance
         */
        FilterCondition.prototype.operator = "";

        /**
         * FilterCondition value.
         * @member {string} value
         * @memberof conditional_control_logic_viewer.FilterCondition
         * @instance
         */
        FilterCondition.prototype.value = "";

        /**
         * Creates a new FilterCondition instance using the specified properties.
         * @function create
         * @memberof conditional_control_logic_viewer.FilterCondition
         * @static
         * @param {conditional_control_logic_viewer.IFilterCondition=} [properties] Properties to set
         * @returns {conditional_control_logic_viewer.FilterCondition} FilterCondition instance
         */
        FilterCondition.create = function create(properties) {
            return new FilterCondition(properties);
        };

        /**
         * Encodes the specified FilterCondition message. Does not implicitly {@link conditional_control_logic_viewer.FilterCondition.verify|verify} messages.
         * @function encode
         * @memberof conditional_control_logic_viewer.FilterCondition
         * @static
         * @param {conditional_control_logic_viewer.IFilterCondition} message FilterCondition message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FilterCondition.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.field != null && Object.hasOwnProperty.call(message, "field"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.field);
            if (message.operator != null && Object.hasOwnProperty.call(message, "operator"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.operator);
            if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.value);
            return writer;
        };

        /**
         * Encodes the specified FilterCondition message, length delimited. Does not implicitly {@link conditional_control_logic_viewer.FilterCondition.verify|verify} messages.
         * @function encodeDelimited
         * @memberof conditional_control_logic_viewer.FilterCondition
         * @static
         * @param {conditional_control_logic_viewer.IFilterCondition} message FilterCondition message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FilterCondition.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a FilterCondition message from the specified reader or buffer.
         * @function decode
         * @memberof conditional_control_logic_viewer.FilterCondition
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {conditional_control_logic_viewer.FilterCondition} FilterCondition
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FilterCondition.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.conditional_control_logic_viewer.FilterCondition();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.field = reader.string();
                        break;
                    }
                case 2: {
                        message.operator = reader.string();
                        break;
                    }
                case 3: {
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
         * Decodes a FilterCondition message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof conditional_control_logic_viewer.FilterCondition
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {conditional_control_logic_viewer.FilterCondition} FilterCondition
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FilterCondition.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a FilterCondition message.
         * @function verify
         * @memberof conditional_control_logic_viewer.FilterCondition
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        FilterCondition.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.field != null && message.hasOwnProperty("field"))
                if (!$util.isString(message.field))
                    return "field: string expected";
            if (message.operator != null && message.hasOwnProperty("operator"))
                if (!$util.isString(message.operator))
                    return "operator: string expected";
            if (message.value != null && message.hasOwnProperty("value"))
                if (!$util.isString(message.value))
                    return "value: string expected";
            return null;
        };

        /**
         * Creates a FilterCondition message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof conditional_control_logic_viewer.FilterCondition
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {conditional_control_logic_viewer.FilterCondition} FilterCondition
         */
        FilterCondition.fromObject = function fromObject(object) {
            if (object instanceof $root.conditional_control_logic_viewer.FilterCondition)
                return object;
            let message = new $root.conditional_control_logic_viewer.FilterCondition();
            if (object.field != null)
                message.field = String(object.field);
            if (object.operator != null)
                message.operator = String(object.operator);
            if (object.value != null)
                message.value = String(object.value);
            return message;
        };

        /**
         * Creates a plain object from a FilterCondition message. Also converts values to other types if specified.
         * @function toObject
         * @memberof conditional_control_logic_viewer.FilterCondition
         * @static
         * @param {conditional_control_logic_viewer.FilterCondition} message FilterCondition
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        FilterCondition.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.field = "";
                object.operator = "";
                object.value = "";
            }
            if (message.field != null && message.hasOwnProperty("field"))
                object.field = message.field;
            if (message.operator != null && message.hasOwnProperty("operator"))
                object.operator = message.operator;
            if (message.value != null && message.hasOwnProperty("value"))
                object.value = message.value;
            return object;
        };

        /**
         * Converts this FilterCondition to JSON.
         * @function toJSON
         * @memberof conditional_control_logic_viewer.FilterCondition
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        FilterCondition.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for FilterCondition
         * @function getTypeUrl
         * @memberof conditional_control_logic_viewer.FilterCondition
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        FilterCondition.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/conditional_control_logic_viewer.FilterCondition";
        };

        return FilterCondition;
    })();

    conditional_control_logic_viewer.FilterNode = (function() {

        /**
         * Properties of a FilterNode.
         * @memberof conditional_control_logic_viewer
         * @interface IFilterNode
         * @property {string|null} [id] FilterNode id
         * @property {conditional_control_logic_viewer.FilterNodeType|null} [type] FilterNode type
         * @property {conditional_control_logic_viewer.IFilterCondition|null} [condition] FilterNode condition
         * @property {conditional_control_logic_viewer.LogicalOperator|null} [operator] FilterNode operator
         * @property {Array.<conditional_control_logic_viewer.IFilterNode>|null} [children] FilterNode children
         * @property {string|null} [text] FilterNode text
         */

        /**
         * Constructs a new FilterNode.
         * @memberof conditional_control_logic_viewer
         * @classdesc Represents a FilterNode.
         * @implements IFilterNode
         * @constructor
         * @param {conditional_control_logic_viewer.IFilterNode=} [properties] Properties to set
         */
        function FilterNode(properties) {
            this.children = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * FilterNode id.
         * @member {string} id
         * @memberof conditional_control_logic_viewer.FilterNode
         * @instance
         */
        FilterNode.prototype.id = "";

        /**
         * FilterNode type.
         * @member {conditional_control_logic_viewer.FilterNodeType} type
         * @memberof conditional_control_logic_viewer.FilterNode
         * @instance
         */
        FilterNode.prototype.type = 0;

        /**
         * FilterNode condition.
         * @member {conditional_control_logic_viewer.IFilterCondition|null|undefined} condition
         * @memberof conditional_control_logic_viewer.FilterNode
         * @instance
         */
        FilterNode.prototype.condition = null;

        /**
         * FilterNode operator.
         * @member {conditional_control_logic_viewer.LogicalOperator} operator
         * @memberof conditional_control_logic_viewer.FilterNode
         * @instance
         */
        FilterNode.prototype.operator = 0;

        /**
         * FilterNode children.
         * @member {Array.<conditional_control_logic_viewer.IFilterNode>} children
         * @memberof conditional_control_logic_viewer.FilterNode
         * @instance
         */
        FilterNode.prototype.children = $util.emptyArray;

        /**
         * FilterNode text.
         * @member {string} text
         * @memberof conditional_control_logic_viewer.FilterNode
         * @instance
         */
        FilterNode.prototype.text = "";

        /**
         * Creates a new FilterNode instance using the specified properties.
         * @function create
         * @memberof conditional_control_logic_viewer.FilterNode
         * @static
         * @param {conditional_control_logic_viewer.IFilterNode=} [properties] Properties to set
         * @returns {conditional_control_logic_viewer.FilterNode} FilterNode instance
         */
        FilterNode.create = function create(properties) {
            return new FilterNode(properties);
        };

        /**
         * Encodes the specified FilterNode message. Does not implicitly {@link conditional_control_logic_viewer.FilterNode.verify|verify} messages.
         * @function encode
         * @memberof conditional_control_logic_viewer.FilterNode
         * @static
         * @param {conditional_control_logic_viewer.IFilterNode} message FilterNode message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FilterNode.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.type);
            if (message.condition != null && Object.hasOwnProperty.call(message, "condition"))
                $root.conditional_control_logic_viewer.FilterCondition.encode(message.condition, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            if (message.operator != null && Object.hasOwnProperty.call(message, "operator"))
                writer.uint32(/* id 4, wireType 0 =*/32).int32(message.operator);
            if (message.children != null && message.children.length)
                for (let i = 0; i < message.children.length; ++i)
                    $root.conditional_control_logic_viewer.FilterNode.encode(message.children[i], writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
            if (message.text != null && Object.hasOwnProperty.call(message, "text"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.text);
            return writer;
        };

        /**
         * Encodes the specified FilterNode message, length delimited. Does not implicitly {@link conditional_control_logic_viewer.FilterNode.verify|verify} messages.
         * @function encodeDelimited
         * @memberof conditional_control_logic_viewer.FilterNode
         * @static
         * @param {conditional_control_logic_viewer.IFilterNode} message FilterNode message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FilterNode.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a FilterNode message from the specified reader or buffer.
         * @function decode
         * @memberof conditional_control_logic_viewer.FilterNode
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {conditional_control_logic_viewer.FilterNode} FilterNode
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FilterNode.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.conditional_control_logic_viewer.FilterNode();
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
                        message.type = reader.int32();
                        break;
                    }
                case 3: {
                        message.condition = $root.conditional_control_logic_viewer.FilterCondition.decode(reader, reader.uint32());
                        break;
                    }
                case 4: {
                        message.operator = reader.int32();
                        break;
                    }
                case 5: {
                        if (!(message.children && message.children.length))
                            message.children = [];
                        message.children.push($root.conditional_control_logic_viewer.FilterNode.decode(reader, reader.uint32()));
                        break;
                    }
                case 6: {
                        message.text = reader.string();
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
         * Decodes a FilterNode message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof conditional_control_logic_viewer.FilterNode
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {conditional_control_logic_viewer.FilterNode} FilterNode
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FilterNode.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a FilterNode message.
         * @function verify
         * @memberof conditional_control_logic_viewer.FilterNode
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        FilterNode.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.type != null && message.hasOwnProperty("type"))
                switch (message.type) {
                default:
                    return "type: enum value expected";
                case 0:
                case 1:
                case 2:
                    break;
                }
            if (message.condition != null && message.hasOwnProperty("condition")) {
                let error = $root.conditional_control_logic_viewer.FilterCondition.verify(message.condition);
                if (error)
                    return "condition." + error;
            }
            if (message.operator != null && message.hasOwnProperty("operator"))
                switch (message.operator) {
                default:
                    return "operator: enum value expected";
                case 0:
                case 1:
                case 2:
                    break;
                }
            if (message.children != null && message.hasOwnProperty("children")) {
                if (!Array.isArray(message.children))
                    return "children: array expected";
                for (let i = 0; i < message.children.length; ++i) {
                    let error = $root.conditional_control_logic_viewer.FilterNode.verify(message.children[i]);
                    if (error)
                        return "children." + error;
                }
            }
            if (message.text != null && message.hasOwnProperty("text"))
                if (!$util.isString(message.text))
                    return "text: string expected";
            return null;
        };

        /**
         * Creates a FilterNode message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof conditional_control_logic_viewer.FilterNode
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {conditional_control_logic_viewer.FilterNode} FilterNode
         */
        FilterNode.fromObject = function fromObject(object) {
            if (object instanceof $root.conditional_control_logic_viewer.FilterNode)
                return object;
            let message = new $root.conditional_control_logic_viewer.FilterNode();
            if (object.id != null)
                message.id = String(object.id);
            switch (object.type) {
            default:
                if (typeof object.type === "number") {
                    message.type = object.type;
                    break;
                }
                break;
            case "FILTER_NODE_TYPE_UNSPECIFIED":
            case 0:
                message.type = 0;
                break;
            case "FILTER_NODE_TYPE_FILTER":
            case 1:
                message.type = 1;
                break;
            case "FILTER_NODE_TYPE_GROUP":
            case 2:
                message.type = 2;
                break;
            }
            if (object.condition != null) {
                if (typeof object.condition !== "object")
                    throw TypeError(".conditional_control_logic_viewer.FilterNode.condition: object expected");
                message.condition = $root.conditional_control_logic_viewer.FilterCondition.fromObject(object.condition);
            }
            switch (object.operator) {
            default:
                if (typeof object.operator === "number") {
                    message.operator = object.operator;
                    break;
                }
                break;
            case "LOGICAL_OPERATOR_UNSPECIFIED":
            case 0:
                message.operator = 0;
                break;
            case "LOGICAL_OPERATOR_AND":
            case 1:
                message.operator = 1;
                break;
            case "LOGICAL_OPERATOR_OR":
            case 2:
                message.operator = 2;
                break;
            }
            if (object.children) {
                if (!Array.isArray(object.children))
                    throw TypeError(".conditional_control_logic_viewer.FilterNode.children: array expected");
                message.children = [];
                for (let i = 0; i < object.children.length; ++i) {
                    if (typeof object.children[i] !== "object")
                        throw TypeError(".conditional_control_logic_viewer.FilterNode.children: object expected");
                    message.children[i] = $root.conditional_control_logic_viewer.FilterNode.fromObject(object.children[i]);
                }
            }
            if (object.text != null)
                message.text = String(object.text);
            return message;
        };

        /**
         * Creates a plain object from a FilterNode message. Also converts values to other types if specified.
         * @function toObject
         * @memberof conditional_control_logic_viewer.FilterNode
         * @static
         * @param {conditional_control_logic_viewer.FilterNode} message FilterNode
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        FilterNode.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.children = [];
            if (options.defaults) {
                object.id = "";
                object.type = options.enums === String ? "FILTER_NODE_TYPE_UNSPECIFIED" : 0;
                object.condition = null;
                object.operator = options.enums === String ? "LOGICAL_OPERATOR_UNSPECIFIED" : 0;
                object.text = "";
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.type != null && message.hasOwnProperty("type"))
                object.type = options.enums === String ? $root.conditional_control_logic_viewer.FilterNodeType[message.type] === undefined ? message.type : $root.conditional_control_logic_viewer.FilterNodeType[message.type] : message.type;
            if (message.condition != null && message.hasOwnProperty("condition"))
                object.condition = $root.conditional_control_logic_viewer.FilterCondition.toObject(message.condition, options);
            if (message.operator != null && message.hasOwnProperty("operator"))
                object.operator = options.enums === String ? $root.conditional_control_logic_viewer.LogicalOperator[message.operator] === undefined ? message.operator : $root.conditional_control_logic_viewer.LogicalOperator[message.operator] : message.operator;
            if (message.children && message.children.length) {
                object.children = [];
                for (let j = 0; j < message.children.length; ++j)
                    object.children[j] = $root.conditional_control_logic_viewer.FilterNode.toObject(message.children[j], options);
            }
            if (message.text != null && message.hasOwnProperty("text"))
                object.text = message.text;
            return object;
        };

        /**
         * Converts this FilterNode to JSON.
         * @function toJSON
         * @memberof conditional_control_logic_viewer.FilterNode
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        FilterNode.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for FilterNode
         * @function getTypeUrl
         * @memberof conditional_control_logic_viewer.FilterNode
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        FilterNode.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/conditional_control_logic_viewer.FilterNode";
        };

        return FilterNode;
    })();

    conditional_control_logic_viewer.FilterTree = (function() {

        /**
         * Properties of a FilterTree.
         * @memberof conditional_control_logic_viewer
         * @interface IFilterTree
         * @property {string|null} [id] FilterTree id
         * @property {string|null} [name] FilterTree name
         * @property {string|null} [description] FilterTree description
         * @property {conditional_control_logic_viewer.FilterTreeStatus|null} [status] FilterTree status
         * @property {conditional_control_logic_viewer.IFilterNode|null} [treeData] FilterTree treeData
         * @property {number|null} [version] FilterTree version
         * @property {string|null} [createdBy] FilterTree createdBy
         * @property {string|null} [updatedBy] FilterTree updatedBy
         * @property {conditional_control_logic_viewer.ITimestamp|null} [createdAt] FilterTree createdAt
         * @property {conditional_control_logic_viewer.ITimestamp|null} [updatedAt] FilterTree updatedAt
         */

        /**
         * Constructs a new FilterTree.
         * @memberof conditional_control_logic_viewer
         * @classdesc Represents a FilterTree.
         * @implements IFilterTree
         * @constructor
         * @param {conditional_control_logic_viewer.IFilterTree=} [properties] Properties to set
         */
        function FilterTree(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * FilterTree id.
         * @member {string} id
         * @memberof conditional_control_logic_viewer.FilterTree
         * @instance
         */
        FilterTree.prototype.id = "";

        /**
         * FilterTree name.
         * @member {string} name
         * @memberof conditional_control_logic_viewer.FilterTree
         * @instance
         */
        FilterTree.prototype.name = "";

        /**
         * FilterTree description.
         * @member {string} description
         * @memberof conditional_control_logic_viewer.FilterTree
         * @instance
         */
        FilterTree.prototype.description = "";

        /**
         * FilterTree status.
         * @member {conditional_control_logic_viewer.FilterTreeStatus} status
         * @memberof conditional_control_logic_viewer.FilterTree
         * @instance
         */
        FilterTree.prototype.status = 0;

        /**
         * FilterTree treeData.
         * @member {conditional_control_logic_viewer.IFilterNode|null|undefined} treeData
         * @memberof conditional_control_logic_viewer.FilterTree
         * @instance
         */
        FilterTree.prototype.treeData = null;

        /**
         * FilterTree version.
         * @member {number} version
         * @memberof conditional_control_logic_viewer.FilterTree
         * @instance
         */
        FilterTree.prototype.version = 0;

        /**
         * FilterTree createdBy.
         * @member {string} createdBy
         * @memberof conditional_control_logic_viewer.FilterTree
         * @instance
         */
        FilterTree.prototype.createdBy = "";

        /**
         * FilterTree updatedBy.
         * @member {string} updatedBy
         * @memberof conditional_control_logic_viewer.FilterTree
         * @instance
         */
        FilterTree.prototype.updatedBy = "";

        /**
         * FilterTree createdAt.
         * @member {conditional_control_logic_viewer.ITimestamp|null|undefined} createdAt
         * @memberof conditional_control_logic_viewer.FilterTree
         * @instance
         */
        FilterTree.prototype.createdAt = null;

        /**
         * FilterTree updatedAt.
         * @member {conditional_control_logic_viewer.ITimestamp|null|undefined} updatedAt
         * @memberof conditional_control_logic_viewer.FilterTree
         * @instance
         */
        FilterTree.prototype.updatedAt = null;

        /**
         * Creates a new FilterTree instance using the specified properties.
         * @function create
         * @memberof conditional_control_logic_viewer.FilterTree
         * @static
         * @param {conditional_control_logic_viewer.IFilterTree=} [properties] Properties to set
         * @returns {conditional_control_logic_viewer.FilterTree} FilterTree instance
         */
        FilterTree.create = function create(properties) {
            return new FilterTree(properties);
        };

        /**
         * Encodes the specified FilterTree message. Does not implicitly {@link conditional_control_logic_viewer.FilterTree.verify|verify} messages.
         * @function encode
         * @memberof conditional_control_logic_viewer.FilterTree
         * @static
         * @param {conditional_control_logic_viewer.IFilterTree} message FilterTree message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FilterTree.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.description);
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 4, wireType 0 =*/32).int32(message.status);
            if (message.treeData != null && Object.hasOwnProperty.call(message, "treeData"))
                $root.conditional_control_logic_viewer.FilterNode.encode(message.treeData, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
            if (message.version != null && Object.hasOwnProperty.call(message, "version"))
                writer.uint32(/* id 6, wireType 0 =*/48).int32(message.version);
            if (message.createdBy != null && Object.hasOwnProperty.call(message, "createdBy"))
                writer.uint32(/* id 7, wireType 2 =*/58).string(message.createdBy);
            if (message.updatedBy != null && Object.hasOwnProperty.call(message, "updatedBy"))
                writer.uint32(/* id 8, wireType 2 =*/66).string(message.updatedBy);
            if (message.createdAt != null && Object.hasOwnProperty.call(message, "createdAt"))
                $root.conditional_control_logic_viewer.Timestamp.encode(message.createdAt, writer.uint32(/* id 9, wireType 2 =*/74).fork()).ldelim();
            if (message.updatedAt != null && Object.hasOwnProperty.call(message, "updatedAt"))
                $root.conditional_control_logic_viewer.Timestamp.encode(message.updatedAt, writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified FilterTree message, length delimited. Does not implicitly {@link conditional_control_logic_viewer.FilterTree.verify|verify} messages.
         * @function encodeDelimited
         * @memberof conditional_control_logic_viewer.FilterTree
         * @static
         * @param {conditional_control_logic_viewer.IFilterTree} message FilterTree message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FilterTree.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a FilterTree message from the specified reader or buffer.
         * @function decode
         * @memberof conditional_control_logic_viewer.FilterTree
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {conditional_control_logic_viewer.FilterTree} FilterTree
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FilterTree.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.conditional_control_logic_viewer.FilterTree();
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
                        message.status = reader.int32();
                        break;
                    }
                case 5: {
                        message.treeData = $root.conditional_control_logic_viewer.FilterNode.decode(reader, reader.uint32());
                        break;
                    }
                case 6: {
                        message.version = reader.int32();
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
                        message.createdAt = $root.conditional_control_logic_viewer.Timestamp.decode(reader, reader.uint32());
                        break;
                    }
                case 10: {
                        message.updatedAt = $root.conditional_control_logic_viewer.Timestamp.decode(reader, reader.uint32());
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
         * Decodes a FilterTree message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof conditional_control_logic_viewer.FilterTree
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {conditional_control_logic_viewer.FilterTree} FilterTree
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FilterTree.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a FilterTree message.
         * @function verify
         * @memberof conditional_control_logic_viewer.FilterTree
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        FilterTree.verify = function verify(message) {
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
                switch (message.status) {
                default:
                    return "status: enum value expected";
                case 0:
                case 1:
                case 2:
                    break;
                }
            if (message.treeData != null && message.hasOwnProperty("treeData")) {
                let error = $root.conditional_control_logic_viewer.FilterNode.verify(message.treeData);
                if (error)
                    return "treeData." + error;
            }
            if (message.version != null && message.hasOwnProperty("version"))
                if (!$util.isInteger(message.version))
                    return "version: integer expected";
            if (message.createdBy != null && message.hasOwnProperty("createdBy"))
                if (!$util.isString(message.createdBy))
                    return "createdBy: string expected";
            if (message.updatedBy != null && message.hasOwnProperty("updatedBy"))
                if (!$util.isString(message.updatedBy))
                    return "updatedBy: string expected";
            if (message.createdAt != null && message.hasOwnProperty("createdAt")) {
                let error = $root.conditional_control_logic_viewer.Timestamp.verify(message.createdAt);
                if (error)
                    return "createdAt." + error;
            }
            if (message.updatedAt != null && message.hasOwnProperty("updatedAt")) {
                let error = $root.conditional_control_logic_viewer.Timestamp.verify(message.updatedAt);
                if (error)
                    return "updatedAt." + error;
            }
            return null;
        };

        /**
         * Creates a FilterTree message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof conditional_control_logic_viewer.FilterTree
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {conditional_control_logic_viewer.FilterTree} FilterTree
         */
        FilterTree.fromObject = function fromObject(object) {
            if (object instanceof $root.conditional_control_logic_viewer.FilterTree)
                return object;
            let message = new $root.conditional_control_logic_viewer.FilterTree();
            if (object.id != null)
                message.id = String(object.id);
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
            case "FILTER_TREE_STATUS_UNSPECIFIED":
            case 0:
                message.status = 0;
                break;
            case "FILTER_TREE_STATUS_ACTIVE":
            case 1:
                message.status = 1;
                break;
            case "FILTER_TREE_STATUS_ARCHIVED":
            case 2:
                message.status = 2;
                break;
            }
            if (object.treeData != null) {
                if (typeof object.treeData !== "object")
                    throw TypeError(".conditional_control_logic_viewer.FilterTree.treeData: object expected");
                message.treeData = $root.conditional_control_logic_viewer.FilterNode.fromObject(object.treeData);
            }
            if (object.version != null)
                message.version = object.version | 0;
            if (object.createdBy != null)
                message.createdBy = String(object.createdBy);
            if (object.updatedBy != null)
                message.updatedBy = String(object.updatedBy);
            if (object.createdAt != null) {
                if (typeof object.createdAt !== "object")
                    throw TypeError(".conditional_control_logic_viewer.FilterTree.createdAt: object expected");
                message.createdAt = $root.conditional_control_logic_viewer.Timestamp.fromObject(object.createdAt);
            }
            if (object.updatedAt != null) {
                if (typeof object.updatedAt !== "object")
                    throw TypeError(".conditional_control_logic_viewer.FilterTree.updatedAt: object expected");
                message.updatedAt = $root.conditional_control_logic_viewer.Timestamp.fromObject(object.updatedAt);
            }
            return message;
        };

        /**
         * Creates a plain object from a FilterTree message. Also converts values to other types if specified.
         * @function toObject
         * @memberof conditional_control_logic_viewer.FilterTree
         * @static
         * @param {conditional_control_logic_viewer.FilterTree} message FilterTree
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        FilterTree.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.id = "";
                object.name = "";
                object.description = "";
                object.status = options.enums === String ? "FILTER_TREE_STATUS_UNSPECIFIED" : 0;
                object.treeData = null;
                object.version = 0;
                object.createdBy = "";
                object.updatedBy = "";
                object.createdAt = null;
                object.updatedAt = null;
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.description != null && message.hasOwnProperty("description"))
                object.description = message.description;
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = options.enums === String ? $root.conditional_control_logic_viewer.FilterTreeStatus[message.status] === undefined ? message.status : $root.conditional_control_logic_viewer.FilterTreeStatus[message.status] : message.status;
            if (message.treeData != null && message.hasOwnProperty("treeData"))
                object.treeData = $root.conditional_control_logic_viewer.FilterNode.toObject(message.treeData, options);
            if (message.version != null && message.hasOwnProperty("version"))
                object.version = message.version;
            if (message.createdBy != null && message.hasOwnProperty("createdBy"))
                object.createdBy = message.createdBy;
            if (message.updatedBy != null && message.hasOwnProperty("updatedBy"))
                object.updatedBy = message.updatedBy;
            if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                object.createdAt = $root.conditional_control_logic_viewer.Timestamp.toObject(message.createdAt, options);
            if (message.updatedAt != null && message.hasOwnProperty("updatedAt"))
                object.updatedAt = $root.conditional_control_logic_viewer.Timestamp.toObject(message.updatedAt, options);
            return object;
        };

        /**
         * Converts this FilterTree to JSON.
         * @function toJSON
         * @memberof conditional_control_logic_viewer.FilterTree
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        FilterTree.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for FilterTree
         * @function getTypeUrl
         * @memberof conditional_control_logic_viewer.FilterTree
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        FilterTree.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/conditional_control_logic_viewer.FilterTree";
        };

        return FilterTree;
    })();

    conditional_control_logic_viewer.CreateFilterTreeRequest = (function() {

        /**
         * Properties of a CreateFilterTreeRequest.
         * @memberof conditional_control_logic_viewer
         * @interface ICreateFilterTreeRequest
         * @property {string|null} [name] CreateFilterTreeRequest name
         * @property {string|null} [description] CreateFilterTreeRequest description
         * @property {conditional_control_logic_viewer.IFilterNode|null} [treeData] CreateFilterTreeRequest treeData
         */

        /**
         * Constructs a new CreateFilterTreeRequest.
         * @memberof conditional_control_logic_viewer
         * @classdesc Represents a CreateFilterTreeRequest.
         * @implements ICreateFilterTreeRequest
         * @constructor
         * @param {conditional_control_logic_viewer.ICreateFilterTreeRequest=} [properties] Properties to set
         */
        function CreateFilterTreeRequest(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * CreateFilterTreeRequest name.
         * @member {string} name
         * @memberof conditional_control_logic_viewer.CreateFilterTreeRequest
         * @instance
         */
        CreateFilterTreeRequest.prototype.name = "";

        /**
         * CreateFilterTreeRequest description.
         * @member {string} description
         * @memberof conditional_control_logic_viewer.CreateFilterTreeRequest
         * @instance
         */
        CreateFilterTreeRequest.prototype.description = "";

        /**
         * CreateFilterTreeRequest treeData.
         * @member {conditional_control_logic_viewer.IFilterNode|null|undefined} treeData
         * @memberof conditional_control_logic_viewer.CreateFilterTreeRequest
         * @instance
         */
        CreateFilterTreeRequest.prototype.treeData = null;

        /**
         * Creates a new CreateFilterTreeRequest instance using the specified properties.
         * @function create
         * @memberof conditional_control_logic_viewer.CreateFilterTreeRequest
         * @static
         * @param {conditional_control_logic_viewer.ICreateFilterTreeRequest=} [properties] Properties to set
         * @returns {conditional_control_logic_viewer.CreateFilterTreeRequest} CreateFilterTreeRequest instance
         */
        CreateFilterTreeRequest.create = function create(properties) {
            return new CreateFilterTreeRequest(properties);
        };

        /**
         * Encodes the specified CreateFilterTreeRequest message. Does not implicitly {@link conditional_control_logic_viewer.CreateFilterTreeRequest.verify|verify} messages.
         * @function encode
         * @memberof conditional_control_logic_viewer.CreateFilterTreeRequest
         * @static
         * @param {conditional_control_logic_viewer.ICreateFilterTreeRequest} message CreateFilterTreeRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CreateFilterTreeRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.description);
            if (message.treeData != null && Object.hasOwnProperty.call(message, "treeData"))
                $root.conditional_control_logic_viewer.FilterNode.encode(message.treeData, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified CreateFilterTreeRequest message, length delimited. Does not implicitly {@link conditional_control_logic_viewer.CreateFilterTreeRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof conditional_control_logic_viewer.CreateFilterTreeRequest
         * @static
         * @param {conditional_control_logic_viewer.ICreateFilterTreeRequest} message CreateFilterTreeRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CreateFilterTreeRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a CreateFilterTreeRequest message from the specified reader or buffer.
         * @function decode
         * @memberof conditional_control_logic_viewer.CreateFilterTreeRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {conditional_control_logic_viewer.CreateFilterTreeRequest} CreateFilterTreeRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CreateFilterTreeRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.conditional_control_logic_viewer.CreateFilterTreeRequest();
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
                        message.treeData = $root.conditional_control_logic_viewer.FilterNode.decode(reader, reader.uint32());
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
         * Decodes a CreateFilterTreeRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof conditional_control_logic_viewer.CreateFilterTreeRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {conditional_control_logic_viewer.CreateFilterTreeRequest} CreateFilterTreeRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CreateFilterTreeRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a CreateFilterTreeRequest message.
         * @function verify
         * @memberof conditional_control_logic_viewer.CreateFilterTreeRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CreateFilterTreeRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.description != null && message.hasOwnProperty("description"))
                if (!$util.isString(message.description))
                    return "description: string expected";
            if (message.treeData != null && message.hasOwnProperty("treeData")) {
                let error = $root.conditional_control_logic_viewer.FilterNode.verify(message.treeData);
                if (error)
                    return "treeData." + error;
            }
            return null;
        };

        /**
         * Creates a CreateFilterTreeRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof conditional_control_logic_viewer.CreateFilterTreeRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {conditional_control_logic_viewer.CreateFilterTreeRequest} CreateFilterTreeRequest
         */
        CreateFilterTreeRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.conditional_control_logic_viewer.CreateFilterTreeRequest)
                return object;
            let message = new $root.conditional_control_logic_viewer.CreateFilterTreeRequest();
            if (object.name != null)
                message.name = String(object.name);
            if (object.description != null)
                message.description = String(object.description);
            if (object.treeData != null) {
                if (typeof object.treeData !== "object")
                    throw TypeError(".conditional_control_logic_viewer.CreateFilterTreeRequest.treeData: object expected");
                message.treeData = $root.conditional_control_logic_viewer.FilterNode.fromObject(object.treeData);
            }
            return message;
        };

        /**
         * Creates a plain object from a CreateFilterTreeRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof conditional_control_logic_viewer.CreateFilterTreeRequest
         * @static
         * @param {conditional_control_logic_viewer.CreateFilterTreeRequest} message CreateFilterTreeRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CreateFilterTreeRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.name = "";
                object.description = "";
                object.treeData = null;
            }
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.description != null && message.hasOwnProperty("description"))
                object.description = message.description;
            if (message.treeData != null && message.hasOwnProperty("treeData"))
                object.treeData = $root.conditional_control_logic_viewer.FilterNode.toObject(message.treeData, options);
            return object;
        };

        /**
         * Converts this CreateFilterTreeRequest to JSON.
         * @function toJSON
         * @memberof conditional_control_logic_viewer.CreateFilterTreeRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CreateFilterTreeRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for CreateFilterTreeRequest
         * @function getTypeUrl
         * @memberof conditional_control_logic_viewer.CreateFilterTreeRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        CreateFilterTreeRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/conditional_control_logic_viewer.CreateFilterTreeRequest";
        };

        return CreateFilterTreeRequest;
    })();

    conditional_control_logic_viewer.CreateFilterTreeResponse = (function() {

        /**
         * Properties of a CreateFilterTreeResponse.
         * @memberof conditional_control_logic_viewer
         * @interface ICreateFilterTreeResponse
         * @property {conditional_control_logic_viewer.IFilterTree|null} [filterTree] CreateFilterTreeResponse filterTree
         */

        /**
         * Constructs a new CreateFilterTreeResponse.
         * @memberof conditional_control_logic_viewer
         * @classdesc Represents a CreateFilterTreeResponse.
         * @implements ICreateFilterTreeResponse
         * @constructor
         * @param {conditional_control_logic_viewer.ICreateFilterTreeResponse=} [properties] Properties to set
         */
        function CreateFilterTreeResponse(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * CreateFilterTreeResponse filterTree.
         * @member {conditional_control_logic_viewer.IFilterTree|null|undefined} filterTree
         * @memberof conditional_control_logic_viewer.CreateFilterTreeResponse
         * @instance
         */
        CreateFilterTreeResponse.prototype.filterTree = null;

        /**
         * Creates a new CreateFilterTreeResponse instance using the specified properties.
         * @function create
         * @memberof conditional_control_logic_viewer.CreateFilterTreeResponse
         * @static
         * @param {conditional_control_logic_viewer.ICreateFilterTreeResponse=} [properties] Properties to set
         * @returns {conditional_control_logic_viewer.CreateFilterTreeResponse} CreateFilterTreeResponse instance
         */
        CreateFilterTreeResponse.create = function create(properties) {
            return new CreateFilterTreeResponse(properties);
        };

        /**
         * Encodes the specified CreateFilterTreeResponse message. Does not implicitly {@link conditional_control_logic_viewer.CreateFilterTreeResponse.verify|verify} messages.
         * @function encode
         * @memberof conditional_control_logic_viewer.CreateFilterTreeResponse
         * @static
         * @param {conditional_control_logic_viewer.ICreateFilterTreeResponse} message CreateFilterTreeResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CreateFilterTreeResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.filterTree != null && Object.hasOwnProperty.call(message, "filterTree"))
                $root.conditional_control_logic_viewer.FilterTree.encode(message.filterTree, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified CreateFilterTreeResponse message, length delimited. Does not implicitly {@link conditional_control_logic_viewer.CreateFilterTreeResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof conditional_control_logic_viewer.CreateFilterTreeResponse
         * @static
         * @param {conditional_control_logic_viewer.ICreateFilterTreeResponse} message CreateFilterTreeResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CreateFilterTreeResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a CreateFilterTreeResponse message from the specified reader or buffer.
         * @function decode
         * @memberof conditional_control_logic_viewer.CreateFilterTreeResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {conditional_control_logic_viewer.CreateFilterTreeResponse} CreateFilterTreeResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CreateFilterTreeResponse.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.conditional_control_logic_viewer.CreateFilterTreeResponse();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.filterTree = $root.conditional_control_logic_viewer.FilterTree.decode(reader, reader.uint32());
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
         * Decodes a CreateFilterTreeResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof conditional_control_logic_viewer.CreateFilterTreeResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {conditional_control_logic_viewer.CreateFilterTreeResponse} CreateFilterTreeResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CreateFilterTreeResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a CreateFilterTreeResponse message.
         * @function verify
         * @memberof conditional_control_logic_viewer.CreateFilterTreeResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CreateFilterTreeResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.filterTree != null && message.hasOwnProperty("filterTree")) {
                let error = $root.conditional_control_logic_viewer.FilterTree.verify(message.filterTree);
                if (error)
                    return "filterTree." + error;
            }
            return null;
        };

        /**
         * Creates a CreateFilterTreeResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof conditional_control_logic_viewer.CreateFilterTreeResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {conditional_control_logic_viewer.CreateFilterTreeResponse} CreateFilterTreeResponse
         */
        CreateFilterTreeResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.conditional_control_logic_viewer.CreateFilterTreeResponse)
                return object;
            let message = new $root.conditional_control_logic_viewer.CreateFilterTreeResponse();
            if (object.filterTree != null) {
                if (typeof object.filterTree !== "object")
                    throw TypeError(".conditional_control_logic_viewer.CreateFilterTreeResponse.filterTree: object expected");
                message.filterTree = $root.conditional_control_logic_viewer.FilterTree.fromObject(object.filterTree);
            }
            return message;
        };

        /**
         * Creates a plain object from a CreateFilterTreeResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof conditional_control_logic_viewer.CreateFilterTreeResponse
         * @static
         * @param {conditional_control_logic_viewer.CreateFilterTreeResponse} message CreateFilterTreeResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CreateFilterTreeResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults)
                object.filterTree = null;
            if (message.filterTree != null && message.hasOwnProperty("filterTree"))
                object.filterTree = $root.conditional_control_logic_viewer.FilterTree.toObject(message.filterTree, options);
            return object;
        };

        /**
         * Converts this CreateFilterTreeResponse to JSON.
         * @function toJSON
         * @memberof conditional_control_logic_viewer.CreateFilterTreeResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CreateFilterTreeResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for CreateFilterTreeResponse
         * @function getTypeUrl
         * @memberof conditional_control_logic_viewer.CreateFilterTreeResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        CreateFilterTreeResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/conditional_control_logic_viewer.CreateFilterTreeResponse";
        };

        return CreateFilterTreeResponse;
    })();

    conditional_control_logic_viewer.ListFilterTreesRequest = (function() {

        /**
         * Properties of a ListFilterTreesRequest.
         * @memberof conditional_control_logic_viewer
         * @interface IListFilterTreesRequest
         * @property {conditional_control_logic_viewer.IPaginationRequest|null} [pagination] ListFilterTreesRequest pagination
         * @property {string|null} [search] ListFilterTreesRequest search
         * @property {conditional_control_logic_viewer.FilterTreeStatus|null} [status] ListFilterTreesRequest status
         */

        /**
         * Constructs a new ListFilterTreesRequest.
         * @memberof conditional_control_logic_viewer
         * @classdesc Represents a ListFilterTreesRequest.
         * @implements IListFilterTreesRequest
         * @constructor
         * @param {conditional_control_logic_viewer.IListFilterTreesRequest=} [properties] Properties to set
         */
        function ListFilterTreesRequest(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ListFilterTreesRequest pagination.
         * @member {conditional_control_logic_viewer.IPaginationRequest|null|undefined} pagination
         * @memberof conditional_control_logic_viewer.ListFilterTreesRequest
         * @instance
         */
        ListFilterTreesRequest.prototype.pagination = null;

        /**
         * ListFilterTreesRequest search.
         * @member {string} search
         * @memberof conditional_control_logic_viewer.ListFilterTreesRequest
         * @instance
         */
        ListFilterTreesRequest.prototype.search = "";

        /**
         * ListFilterTreesRequest status.
         * @member {conditional_control_logic_viewer.FilterTreeStatus} status
         * @memberof conditional_control_logic_viewer.ListFilterTreesRequest
         * @instance
         */
        ListFilterTreesRequest.prototype.status = 0;

        /**
         * Creates a new ListFilterTreesRequest instance using the specified properties.
         * @function create
         * @memberof conditional_control_logic_viewer.ListFilterTreesRequest
         * @static
         * @param {conditional_control_logic_viewer.IListFilterTreesRequest=} [properties] Properties to set
         * @returns {conditional_control_logic_viewer.ListFilterTreesRequest} ListFilterTreesRequest instance
         */
        ListFilterTreesRequest.create = function create(properties) {
            return new ListFilterTreesRequest(properties);
        };

        /**
         * Encodes the specified ListFilterTreesRequest message. Does not implicitly {@link conditional_control_logic_viewer.ListFilterTreesRequest.verify|verify} messages.
         * @function encode
         * @memberof conditional_control_logic_viewer.ListFilterTreesRequest
         * @static
         * @param {conditional_control_logic_viewer.IListFilterTreesRequest} message ListFilterTreesRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ListFilterTreesRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.pagination != null && Object.hasOwnProperty.call(message, "pagination"))
                $root.conditional_control_logic_viewer.PaginationRequest.encode(message.pagination, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.search != null && Object.hasOwnProperty.call(message, "search"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.search);
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.status);
            return writer;
        };

        /**
         * Encodes the specified ListFilterTreesRequest message, length delimited. Does not implicitly {@link conditional_control_logic_viewer.ListFilterTreesRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof conditional_control_logic_viewer.ListFilterTreesRequest
         * @static
         * @param {conditional_control_logic_viewer.IListFilterTreesRequest} message ListFilterTreesRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ListFilterTreesRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ListFilterTreesRequest message from the specified reader or buffer.
         * @function decode
         * @memberof conditional_control_logic_viewer.ListFilterTreesRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {conditional_control_logic_viewer.ListFilterTreesRequest} ListFilterTreesRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ListFilterTreesRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.conditional_control_logic_viewer.ListFilterTreesRequest();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.pagination = $root.conditional_control_logic_viewer.PaginationRequest.decode(reader, reader.uint32());
                        break;
                    }
                case 2: {
                        message.search = reader.string();
                        break;
                    }
                case 3: {
                        message.status = reader.int32();
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
         * Decodes a ListFilterTreesRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof conditional_control_logic_viewer.ListFilterTreesRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {conditional_control_logic_viewer.ListFilterTreesRequest} ListFilterTreesRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ListFilterTreesRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ListFilterTreesRequest message.
         * @function verify
         * @memberof conditional_control_logic_viewer.ListFilterTreesRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ListFilterTreesRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.pagination != null && message.hasOwnProperty("pagination")) {
                let error = $root.conditional_control_logic_viewer.PaginationRequest.verify(message.pagination);
                if (error)
                    return "pagination." + error;
            }
            if (message.search != null && message.hasOwnProperty("search"))
                if (!$util.isString(message.search))
                    return "search: string expected";
            if (message.status != null && message.hasOwnProperty("status"))
                switch (message.status) {
                default:
                    return "status: enum value expected";
                case 0:
                case 1:
                case 2:
                    break;
                }
            return null;
        };

        /**
         * Creates a ListFilterTreesRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof conditional_control_logic_viewer.ListFilterTreesRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {conditional_control_logic_viewer.ListFilterTreesRequest} ListFilterTreesRequest
         */
        ListFilterTreesRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.conditional_control_logic_viewer.ListFilterTreesRequest)
                return object;
            let message = new $root.conditional_control_logic_viewer.ListFilterTreesRequest();
            if (object.pagination != null) {
                if (typeof object.pagination !== "object")
                    throw TypeError(".conditional_control_logic_viewer.ListFilterTreesRequest.pagination: object expected");
                message.pagination = $root.conditional_control_logic_viewer.PaginationRequest.fromObject(object.pagination);
            }
            if (object.search != null)
                message.search = String(object.search);
            switch (object.status) {
            default:
                if (typeof object.status === "number") {
                    message.status = object.status;
                    break;
                }
                break;
            case "FILTER_TREE_STATUS_UNSPECIFIED":
            case 0:
                message.status = 0;
                break;
            case "FILTER_TREE_STATUS_ACTIVE":
            case 1:
                message.status = 1;
                break;
            case "FILTER_TREE_STATUS_ARCHIVED":
            case 2:
                message.status = 2;
                break;
            }
            return message;
        };

        /**
         * Creates a plain object from a ListFilterTreesRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof conditional_control_logic_viewer.ListFilterTreesRequest
         * @static
         * @param {conditional_control_logic_viewer.ListFilterTreesRequest} message ListFilterTreesRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ListFilterTreesRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.pagination = null;
                object.search = "";
                object.status = options.enums === String ? "FILTER_TREE_STATUS_UNSPECIFIED" : 0;
            }
            if (message.pagination != null && message.hasOwnProperty("pagination"))
                object.pagination = $root.conditional_control_logic_viewer.PaginationRequest.toObject(message.pagination, options);
            if (message.search != null && message.hasOwnProperty("search"))
                object.search = message.search;
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = options.enums === String ? $root.conditional_control_logic_viewer.FilterTreeStatus[message.status] === undefined ? message.status : $root.conditional_control_logic_viewer.FilterTreeStatus[message.status] : message.status;
            return object;
        };

        /**
         * Converts this ListFilterTreesRequest to JSON.
         * @function toJSON
         * @memberof conditional_control_logic_viewer.ListFilterTreesRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ListFilterTreesRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ListFilterTreesRequest
         * @function getTypeUrl
         * @memberof conditional_control_logic_viewer.ListFilterTreesRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ListFilterTreesRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/conditional_control_logic_viewer.ListFilterTreesRequest";
        };

        return ListFilterTreesRequest;
    })();

    conditional_control_logic_viewer.ListFilterTreesResponse = (function() {

        /**
         * Properties of a ListFilterTreesResponse.
         * @memberof conditional_control_logic_viewer
         * @interface IListFilterTreesResponse
         * @property {Array.<conditional_control_logic_viewer.IFilterTree>|null} [filterTrees] ListFilterTreesResponse filterTrees
         * @property {conditional_control_logic_viewer.IPaginationResponse|null} [pagination] ListFilterTreesResponse pagination
         */

        /**
         * Constructs a new ListFilterTreesResponse.
         * @memberof conditional_control_logic_viewer
         * @classdesc Represents a ListFilterTreesResponse.
         * @implements IListFilterTreesResponse
         * @constructor
         * @param {conditional_control_logic_viewer.IListFilterTreesResponse=} [properties] Properties to set
         */
        function ListFilterTreesResponse(properties) {
            this.filterTrees = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ListFilterTreesResponse filterTrees.
         * @member {Array.<conditional_control_logic_viewer.IFilterTree>} filterTrees
         * @memberof conditional_control_logic_viewer.ListFilterTreesResponse
         * @instance
         */
        ListFilterTreesResponse.prototype.filterTrees = $util.emptyArray;

        /**
         * ListFilterTreesResponse pagination.
         * @member {conditional_control_logic_viewer.IPaginationResponse|null|undefined} pagination
         * @memberof conditional_control_logic_viewer.ListFilterTreesResponse
         * @instance
         */
        ListFilterTreesResponse.prototype.pagination = null;

        /**
         * Creates a new ListFilterTreesResponse instance using the specified properties.
         * @function create
         * @memberof conditional_control_logic_viewer.ListFilterTreesResponse
         * @static
         * @param {conditional_control_logic_viewer.IListFilterTreesResponse=} [properties] Properties to set
         * @returns {conditional_control_logic_viewer.ListFilterTreesResponse} ListFilterTreesResponse instance
         */
        ListFilterTreesResponse.create = function create(properties) {
            return new ListFilterTreesResponse(properties);
        };

        /**
         * Encodes the specified ListFilterTreesResponse message. Does not implicitly {@link conditional_control_logic_viewer.ListFilterTreesResponse.verify|verify} messages.
         * @function encode
         * @memberof conditional_control_logic_viewer.ListFilterTreesResponse
         * @static
         * @param {conditional_control_logic_viewer.IListFilterTreesResponse} message ListFilterTreesResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ListFilterTreesResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.filterTrees != null && message.filterTrees.length)
                for (let i = 0; i < message.filterTrees.length; ++i)
                    $root.conditional_control_logic_viewer.FilterTree.encode(message.filterTrees[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.pagination != null && Object.hasOwnProperty.call(message, "pagination"))
                $root.conditional_control_logic_viewer.PaginationResponse.encode(message.pagination, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified ListFilterTreesResponse message, length delimited. Does not implicitly {@link conditional_control_logic_viewer.ListFilterTreesResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof conditional_control_logic_viewer.ListFilterTreesResponse
         * @static
         * @param {conditional_control_logic_viewer.IListFilterTreesResponse} message ListFilterTreesResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ListFilterTreesResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ListFilterTreesResponse message from the specified reader or buffer.
         * @function decode
         * @memberof conditional_control_logic_viewer.ListFilterTreesResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {conditional_control_logic_viewer.ListFilterTreesResponse} ListFilterTreesResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ListFilterTreesResponse.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.conditional_control_logic_viewer.ListFilterTreesResponse();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.filterTrees && message.filterTrees.length))
                            message.filterTrees = [];
                        message.filterTrees.push($root.conditional_control_logic_viewer.FilterTree.decode(reader, reader.uint32()));
                        break;
                    }
                case 2: {
                        message.pagination = $root.conditional_control_logic_viewer.PaginationResponse.decode(reader, reader.uint32());
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
         * Decodes a ListFilterTreesResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof conditional_control_logic_viewer.ListFilterTreesResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {conditional_control_logic_viewer.ListFilterTreesResponse} ListFilterTreesResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ListFilterTreesResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ListFilterTreesResponse message.
         * @function verify
         * @memberof conditional_control_logic_viewer.ListFilterTreesResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ListFilterTreesResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.filterTrees != null && message.hasOwnProperty("filterTrees")) {
                if (!Array.isArray(message.filterTrees))
                    return "filterTrees: array expected";
                for (let i = 0; i < message.filterTrees.length; ++i) {
                    let error = $root.conditional_control_logic_viewer.FilterTree.verify(message.filterTrees[i]);
                    if (error)
                        return "filterTrees." + error;
                }
            }
            if (message.pagination != null && message.hasOwnProperty("pagination")) {
                let error = $root.conditional_control_logic_viewer.PaginationResponse.verify(message.pagination);
                if (error)
                    return "pagination." + error;
            }
            return null;
        };

        /**
         * Creates a ListFilterTreesResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof conditional_control_logic_viewer.ListFilterTreesResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {conditional_control_logic_viewer.ListFilterTreesResponse} ListFilterTreesResponse
         */
        ListFilterTreesResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.conditional_control_logic_viewer.ListFilterTreesResponse)
                return object;
            let message = new $root.conditional_control_logic_viewer.ListFilterTreesResponse();
            if (object.filterTrees) {
                if (!Array.isArray(object.filterTrees))
                    throw TypeError(".conditional_control_logic_viewer.ListFilterTreesResponse.filterTrees: array expected");
                message.filterTrees = [];
                for (let i = 0; i < object.filterTrees.length; ++i) {
                    if (typeof object.filterTrees[i] !== "object")
                        throw TypeError(".conditional_control_logic_viewer.ListFilterTreesResponse.filterTrees: object expected");
                    message.filterTrees[i] = $root.conditional_control_logic_viewer.FilterTree.fromObject(object.filterTrees[i]);
                }
            }
            if (object.pagination != null) {
                if (typeof object.pagination !== "object")
                    throw TypeError(".conditional_control_logic_viewer.ListFilterTreesResponse.pagination: object expected");
                message.pagination = $root.conditional_control_logic_viewer.PaginationResponse.fromObject(object.pagination);
            }
            return message;
        };

        /**
         * Creates a plain object from a ListFilterTreesResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof conditional_control_logic_viewer.ListFilterTreesResponse
         * @static
         * @param {conditional_control_logic_viewer.ListFilterTreesResponse} message ListFilterTreesResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ListFilterTreesResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.filterTrees = [];
            if (options.defaults)
                object.pagination = null;
            if (message.filterTrees && message.filterTrees.length) {
                object.filterTrees = [];
                for (let j = 0; j < message.filterTrees.length; ++j)
                    object.filterTrees[j] = $root.conditional_control_logic_viewer.FilterTree.toObject(message.filterTrees[j], options);
            }
            if (message.pagination != null && message.hasOwnProperty("pagination"))
                object.pagination = $root.conditional_control_logic_viewer.PaginationResponse.toObject(message.pagination, options);
            return object;
        };

        /**
         * Converts this ListFilterTreesResponse to JSON.
         * @function toJSON
         * @memberof conditional_control_logic_viewer.ListFilterTreesResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ListFilterTreesResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ListFilterTreesResponse
         * @function getTypeUrl
         * @memberof conditional_control_logic_viewer.ListFilterTreesResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ListFilterTreesResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/conditional_control_logic_viewer.ListFilterTreesResponse";
        };

        return ListFilterTreesResponse;
    })();

    conditional_control_logic_viewer.GetFilterTreeRequest = (function() {

        /**
         * Properties of a GetFilterTreeRequest.
         * @memberof conditional_control_logic_viewer
         * @interface IGetFilterTreeRequest
         * @property {string|null} [id] GetFilterTreeRequest id
         */

        /**
         * Constructs a new GetFilterTreeRequest.
         * @memberof conditional_control_logic_viewer
         * @classdesc Represents a GetFilterTreeRequest.
         * @implements IGetFilterTreeRequest
         * @constructor
         * @param {conditional_control_logic_viewer.IGetFilterTreeRequest=} [properties] Properties to set
         */
        function GetFilterTreeRequest(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * GetFilterTreeRequest id.
         * @member {string} id
         * @memberof conditional_control_logic_viewer.GetFilterTreeRequest
         * @instance
         */
        GetFilterTreeRequest.prototype.id = "";

        /**
         * Creates a new GetFilterTreeRequest instance using the specified properties.
         * @function create
         * @memberof conditional_control_logic_viewer.GetFilterTreeRequest
         * @static
         * @param {conditional_control_logic_viewer.IGetFilterTreeRequest=} [properties] Properties to set
         * @returns {conditional_control_logic_viewer.GetFilterTreeRequest} GetFilterTreeRequest instance
         */
        GetFilterTreeRequest.create = function create(properties) {
            return new GetFilterTreeRequest(properties);
        };

        /**
         * Encodes the specified GetFilterTreeRequest message. Does not implicitly {@link conditional_control_logic_viewer.GetFilterTreeRequest.verify|verify} messages.
         * @function encode
         * @memberof conditional_control_logic_viewer.GetFilterTreeRequest
         * @static
         * @param {conditional_control_logic_viewer.IGetFilterTreeRequest} message GetFilterTreeRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GetFilterTreeRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            return writer;
        };

        /**
         * Encodes the specified GetFilterTreeRequest message, length delimited. Does not implicitly {@link conditional_control_logic_viewer.GetFilterTreeRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof conditional_control_logic_viewer.GetFilterTreeRequest
         * @static
         * @param {conditional_control_logic_viewer.IGetFilterTreeRequest} message GetFilterTreeRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GetFilterTreeRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a GetFilterTreeRequest message from the specified reader or buffer.
         * @function decode
         * @memberof conditional_control_logic_viewer.GetFilterTreeRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {conditional_control_logic_viewer.GetFilterTreeRequest} GetFilterTreeRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GetFilterTreeRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.conditional_control_logic_viewer.GetFilterTreeRequest();
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
         * Decodes a GetFilterTreeRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof conditional_control_logic_viewer.GetFilterTreeRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {conditional_control_logic_viewer.GetFilterTreeRequest} GetFilterTreeRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GetFilterTreeRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a GetFilterTreeRequest message.
         * @function verify
         * @memberof conditional_control_logic_viewer.GetFilterTreeRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        GetFilterTreeRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            return null;
        };

        /**
         * Creates a GetFilterTreeRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof conditional_control_logic_viewer.GetFilterTreeRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {conditional_control_logic_viewer.GetFilterTreeRequest} GetFilterTreeRequest
         */
        GetFilterTreeRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.conditional_control_logic_viewer.GetFilterTreeRequest)
                return object;
            let message = new $root.conditional_control_logic_viewer.GetFilterTreeRequest();
            if (object.id != null)
                message.id = String(object.id);
            return message;
        };

        /**
         * Creates a plain object from a GetFilterTreeRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof conditional_control_logic_viewer.GetFilterTreeRequest
         * @static
         * @param {conditional_control_logic_viewer.GetFilterTreeRequest} message GetFilterTreeRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        GetFilterTreeRequest.toObject = function toObject(message, options) {
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
         * Converts this GetFilterTreeRequest to JSON.
         * @function toJSON
         * @memberof conditional_control_logic_viewer.GetFilterTreeRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        GetFilterTreeRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for GetFilterTreeRequest
         * @function getTypeUrl
         * @memberof conditional_control_logic_viewer.GetFilterTreeRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        GetFilterTreeRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/conditional_control_logic_viewer.GetFilterTreeRequest";
        };

        return GetFilterTreeRequest;
    })();

    conditional_control_logic_viewer.GetFilterTreeResponse = (function() {

        /**
         * Properties of a GetFilterTreeResponse.
         * @memberof conditional_control_logic_viewer
         * @interface IGetFilterTreeResponse
         * @property {conditional_control_logic_viewer.IFilterTree|null} [filterTree] GetFilterTreeResponse filterTree
         */

        /**
         * Constructs a new GetFilterTreeResponse.
         * @memberof conditional_control_logic_viewer
         * @classdesc Represents a GetFilterTreeResponse.
         * @implements IGetFilterTreeResponse
         * @constructor
         * @param {conditional_control_logic_viewer.IGetFilterTreeResponse=} [properties] Properties to set
         */
        function GetFilterTreeResponse(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * GetFilterTreeResponse filterTree.
         * @member {conditional_control_logic_viewer.IFilterTree|null|undefined} filterTree
         * @memberof conditional_control_logic_viewer.GetFilterTreeResponse
         * @instance
         */
        GetFilterTreeResponse.prototype.filterTree = null;

        /**
         * Creates a new GetFilterTreeResponse instance using the specified properties.
         * @function create
         * @memberof conditional_control_logic_viewer.GetFilterTreeResponse
         * @static
         * @param {conditional_control_logic_viewer.IGetFilterTreeResponse=} [properties] Properties to set
         * @returns {conditional_control_logic_viewer.GetFilterTreeResponse} GetFilterTreeResponse instance
         */
        GetFilterTreeResponse.create = function create(properties) {
            return new GetFilterTreeResponse(properties);
        };

        /**
         * Encodes the specified GetFilterTreeResponse message. Does not implicitly {@link conditional_control_logic_viewer.GetFilterTreeResponse.verify|verify} messages.
         * @function encode
         * @memberof conditional_control_logic_viewer.GetFilterTreeResponse
         * @static
         * @param {conditional_control_logic_viewer.IGetFilterTreeResponse} message GetFilterTreeResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GetFilterTreeResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.filterTree != null && Object.hasOwnProperty.call(message, "filterTree"))
                $root.conditional_control_logic_viewer.FilterTree.encode(message.filterTree, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified GetFilterTreeResponse message, length delimited. Does not implicitly {@link conditional_control_logic_viewer.GetFilterTreeResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof conditional_control_logic_viewer.GetFilterTreeResponse
         * @static
         * @param {conditional_control_logic_viewer.IGetFilterTreeResponse} message GetFilterTreeResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GetFilterTreeResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a GetFilterTreeResponse message from the specified reader or buffer.
         * @function decode
         * @memberof conditional_control_logic_viewer.GetFilterTreeResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {conditional_control_logic_viewer.GetFilterTreeResponse} GetFilterTreeResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GetFilterTreeResponse.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.conditional_control_logic_viewer.GetFilterTreeResponse();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.filterTree = $root.conditional_control_logic_viewer.FilterTree.decode(reader, reader.uint32());
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
         * Decodes a GetFilterTreeResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof conditional_control_logic_viewer.GetFilterTreeResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {conditional_control_logic_viewer.GetFilterTreeResponse} GetFilterTreeResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GetFilterTreeResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a GetFilterTreeResponse message.
         * @function verify
         * @memberof conditional_control_logic_viewer.GetFilterTreeResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        GetFilterTreeResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.filterTree != null && message.hasOwnProperty("filterTree")) {
                let error = $root.conditional_control_logic_viewer.FilterTree.verify(message.filterTree);
                if (error)
                    return "filterTree." + error;
            }
            return null;
        };

        /**
         * Creates a GetFilterTreeResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof conditional_control_logic_viewer.GetFilterTreeResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {conditional_control_logic_viewer.GetFilterTreeResponse} GetFilterTreeResponse
         */
        GetFilterTreeResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.conditional_control_logic_viewer.GetFilterTreeResponse)
                return object;
            let message = new $root.conditional_control_logic_viewer.GetFilterTreeResponse();
            if (object.filterTree != null) {
                if (typeof object.filterTree !== "object")
                    throw TypeError(".conditional_control_logic_viewer.GetFilterTreeResponse.filterTree: object expected");
                message.filterTree = $root.conditional_control_logic_viewer.FilterTree.fromObject(object.filterTree);
            }
            return message;
        };

        /**
         * Creates a plain object from a GetFilterTreeResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof conditional_control_logic_viewer.GetFilterTreeResponse
         * @static
         * @param {conditional_control_logic_viewer.GetFilterTreeResponse} message GetFilterTreeResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        GetFilterTreeResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults)
                object.filterTree = null;
            if (message.filterTree != null && message.hasOwnProperty("filterTree"))
                object.filterTree = $root.conditional_control_logic_viewer.FilterTree.toObject(message.filterTree, options);
            return object;
        };

        /**
         * Converts this GetFilterTreeResponse to JSON.
         * @function toJSON
         * @memberof conditional_control_logic_viewer.GetFilterTreeResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        GetFilterTreeResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for GetFilterTreeResponse
         * @function getTypeUrl
         * @memberof conditional_control_logic_viewer.GetFilterTreeResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        GetFilterTreeResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/conditional_control_logic_viewer.GetFilterTreeResponse";
        };

        return GetFilterTreeResponse;
    })();

    conditional_control_logic_viewer.UpdateFilterTreeRequest = (function() {

        /**
         * Properties of an UpdateFilterTreeRequest.
         * @memberof conditional_control_logic_viewer
         * @interface IUpdateFilterTreeRequest
         * @property {string|null} [id] UpdateFilterTreeRequest id
         * @property {string|null} [name] UpdateFilterTreeRequest name
         * @property {string|null} [description] UpdateFilterTreeRequest description
         * @property {conditional_control_logic_viewer.IFilterNode|null} [treeData] UpdateFilterTreeRequest treeData
         * @property {conditional_control_logic_viewer.FilterTreeStatus|null} [status] UpdateFilterTreeRequest status
         */

        /**
         * Constructs a new UpdateFilterTreeRequest.
         * @memberof conditional_control_logic_viewer
         * @classdesc Represents an UpdateFilterTreeRequest.
         * @implements IUpdateFilterTreeRequest
         * @constructor
         * @param {conditional_control_logic_viewer.IUpdateFilterTreeRequest=} [properties] Properties to set
         */
        function UpdateFilterTreeRequest(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * UpdateFilterTreeRequest id.
         * @member {string} id
         * @memberof conditional_control_logic_viewer.UpdateFilterTreeRequest
         * @instance
         */
        UpdateFilterTreeRequest.prototype.id = "";

        /**
         * UpdateFilterTreeRequest name.
         * @member {string} name
         * @memberof conditional_control_logic_viewer.UpdateFilterTreeRequest
         * @instance
         */
        UpdateFilterTreeRequest.prototype.name = "";

        /**
         * UpdateFilterTreeRequest description.
         * @member {string} description
         * @memberof conditional_control_logic_viewer.UpdateFilterTreeRequest
         * @instance
         */
        UpdateFilterTreeRequest.prototype.description = "";

        /**
         * UpdateFilterTreeRequest treeData.
         * @member {conditional_control_logic_viewer.IFilterNode|null|undefined} treeData
         * @memberof conditional_control_logic_viewer.UpdateFilterTreeRequest
         * @instance
         */
        UpdateFilterTreeRequest.prototype.treeData = null;

        /**
         * UpdateFilterTreeRequest status.
         * @member {conditional_control_logic_viewer.FilterTreeStatus} status
         * @memberof conditional_control_logic_viewer.UpdateFilterTreeRequest
         * @instance
         */
        UpdateFilterTreeRequest.prototype.status = 0;

        /**
         * Creates a new UpdateFilterTreeRequest instance using the specified properties.
         * @function create
         * @memberof conditional_control_logic_viewer.UpdateFilterTreeRequest
         * @static
         * @param {conditional_control_logic_viewer.IUpdateFilterTreeRequest=} [properties] Properties to set
         * @returns {conditional_control_logic_viewer.UpdateFilterTreeRequest} UpdateFilterTreeRequest instance
         */
        UpdateFilterTreeRequest.create = function create(properties) {
            return new UpdateFilterTreeRequest(properties);
        };

        /**
         * Encodes the specified UpdateFilterTreeRequest message. Does not implicitly {@link conditional_control_logic_viewer.UpdateFilterTreeRequest.verify|verify} messages.
         * @function encode
         * @memberof conditional_control_logic_viewer.UpdateFilterTreeRequest
         * @static
         * @param {conditional_control_logic_viewer.IUpdateFilterTreeRequest} message UpdateFilterTreeRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UpdateFilterTreeRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.description);
            if (message.treeData != null && Object.hasOwnProperty.call(message, "treeData"))
                $root.conditional_control_logic_viewer.FilterNode.encode(message.treeData, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 5, wireType 0 =*/40).int32(message.status);
            return writer;
        };

        /**
         * Encodes the specified UpdateFilterTreeRequest message, length delimited. Does not implicitly {@link conditional_control_logic_viewer.UpdateFilterTreeRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof conditional_control_logic_viewer.UpdateFilterTreeRequest
         * @static
         * @param {conditional_control_logic_viewer.IUpdateFilterTreeRequest} message UpdateFilterTreeRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UpdateFilterTreeRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an UpdateFilterTreeRequest message from the specified reader or buffer.
         * @function decode
         * @memberof conditional_control_logic_viewer.UpdateFilterTreeRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {conditional_control_logic_viewer.UpdateFilterTreeRequest} UpdateFilterTreeRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UpdateFilterTreeRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.conditional_control_logic_viewer.UpdateFilterTreeRequest();
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
                        message.treeData = $root.conditional_control_logic_viewer.FilterNode.decode(reader, reader.uint32());
                        break;
                    }
                case 5: {
                        message.status = reader.int32();
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
         * Decodes an UpdateFilterTreeRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof conditional_control_logic_viewer.UpdateFilterTreeRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {conditional_control_logic_viewer.UpdateFilterTreeRequest} UpdateFilterTreeRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UpdateFilterTreeRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an UpdateFilterTreeRequest message.
         * @function verify
         * @memberof conditional_control_logic_viewer.UpdateFilterTreeRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        UpdateFilterTreeRequest.verify = function verify(message) {
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
            if (message.treeData != null && message.hasOwnProperty("treeData")) {
                let error = $root.conditional_control_logic_viewer.FilterNode.verify(message.treeData);
                if (error)
                    return "treeData." + error;
            }
            if (message.status != null && message.hasOwnProperty("status"))
                switch (message.status) {
                default:
                    return "status: enum value expected";
                case 0:
                case 1:
                case 2:
                    break;
                }
            return null;
        };

        /**
         * Creates an UpdateFilterTreeRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof conditional_control_logic_viewer.UpdateFilterTreeRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {conditional_control_logic_viewer.UpdateFilterTreeRequest} UpdateFilterTreeRequest
         */
        UpdateFilterTreeRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.conditional_control_logic_viewer.UpdateFilterTreeRequest)
                return object;
            let message = new $root.conditional_control_logic_viewer.UpdateFilterTreeRequest();
            if (object.id != null)
                message.id = String(object.id);
            if (object.name != null)
                message.name = String(object.name);
            if (object.description != null)
                message.description = String(object.description);
            if (object.treeData != null) {
                if (typeof object.treeData !== "object")
                    throw TypeError(".conditional_control_logic_viewer.UpdateFilterTreeRequest.treeData: object expected");
                message.treeData = $root.conditional_control_logic_viewer.FilterNode.fromObject(object.treeData);
            }
            switch (object.status) {
            default:
                if (typeof object.status === "number") {
                    message.status = object.status;
                    break;
                }
                break;
            case "FILTER_TREE_STATUS_UNSPECIFIED":
            case 0:
                message.status = 0;
                break;
            case "FILTER_TREE_STATUS_ACTIVE":
            case 1:
                message.status = 1;
                break;
            case "FILTER_TREE_STATUS_ARCHIVED":
            case 2:
                message.status = 2;
                break;
            }
            return message;
        };

        /**
         * Creates a plain object from an UpdateFilterTreeRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof conditional_control_logic_viewer.UpdateFilterTreeRequest
         * @static
         * @param {conditional_control_logic_viewer.UpdateFilterTreeRequest} message UpdateFilterTreeRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        UpdateFilterTreeRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.id = "";
                object.name = "";
                object.description = "";
                object.treeData = null;
                object.status = options.enums === String ? "FILTER_TREE_STATUS_UNSPECIFIED" : 0;
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.description != null && message.hasOwnProperty("description"))
                object.description = message.description;
            if (message.treeData != null && message.hasOwnProperty("treeData"))
                object.treeData = $root.conditional_control_logic_viewer.FilterNode.toObject(message.treeData, options);
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = options.enums === String ? $root.conditional_control_logic_viewer.FilterTreeStatus[message.status] === undefined ? message.status : $root.conditional_control_logic_viewer.FilterTreeStatus[message.status] : message.status;
            return object;
        };

        /**
         * Converts this UpdateFilterTreeRequest to JSON.
         * @function toJSON
         * @memberof conditional_control_logic_viewer.UpdateFilterTreeRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        UpdateFilterTreeRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for UpdateFilterTreeRequest
         * @function getTypeUrl
         * @memberof conditional_control_logic_viewer.UpdateFilterTreeRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        UpdateFilterTreeRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/conditional_control_logic_viewer.UpdateFilterTreeRequest";
        };

        return UpdateFilterTreeRequest;
    })();

    conditional_control_logic_viewer.UpdateFilterTreeResponse = (function() {

        /**
         * Properties of an UpdateFilterTreeResponse.
         * @memberof conditional_control_logic_viewer
         * @interface IUpdateFilterTreeResponse
         * @property {conditional_control_logic_viewer.IFilterTree|null} [filterTree] UpdateFilterTreeResponse filterTree
         */

        /**
         * Constructs a new UpdateFilterTreeResponse.
         * @memberof conditional_control_logic_viewer
         * @classdesc Represents an UpdateFilterTreeResponse.
         * @implements IUpdateFilterTreeResponse
         * @constructor
         * @param {conditional_control_logic_viewer.IUpdateFilterTreeResponse=} [properties] Properties to set
         */
        function UpdateFilterTreeResponse(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * UpdateFilterTreeResponse filterTree.
         * @member {conditional_control_logic_viewer.IFilterTree|null|undefined} filterTree
         * @memberof conditional_control_logic_viewer.UpdateFilterTreeResponse
         * @instance
         */
        UpdateFilterTreeResponse.prototype.filterTree = null;

        /**
         * Creates a new UpdateFilterTreeResponse instance using the specified properties.
         * @function create
         * @memberof conditional_control_logic_viewer.UpdateFilterTreeResponse
         * @static
         * @param {conditional_control_logic_viewer.IUpdateFilterTreeResponse=} [properties] Properties to set
         * @returns {conditional_control_logic_viewer.UpdateFilterTreeResponse} UpdateFilterTreeResponse instance
         */
        UpdateFilterTreeResponse.create = function create(properties) {
            return new UpdateFilterTreeResponse(properties);
        };

        /**
         * Encodes the specified UpdateFilterTreeResponse message. Does not implicitly {@link conditional_control_logic_viewer.UpdateFilterTreeResponse.verify|verify} messages.
         * @function encode
         * @memberof conditional_control_logic_viewer.UpdateFilterTreeResponse
         * @static
         * @param {conditional_control_logic_viewer.IUpdateFilterTreeResponse} message UpdateFilterTreeResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UpdateFilterTreeResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.filterTree != null && Object.hasOwnProperty.call(message, "filterTree"))
                $root.conditional_control_logic_viewer.FilterTree.encode(message.filterTree, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified UpdateFilterTreeResponse message, length delimited. Does not implicitly {@link conditional_control_logic_viewer.UpdateFilterTreeResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof conditional_control_logic_viewer.UpdateFilterTreeResponse
         * @static
         * @param {conditional_control_logic_viewer.IUpdateFilterTreeResponse} message UpdateFilterTreeResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UpdateFilterTreeResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an UpdateFilterTreeResponse message from the specified reader or buffer.
         * @function decode
         * @memberof conditional_control_logic_viewer.UpdateFilterTreeResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {conditional_control_logic_viewer.UpdateFilterTreeResponse} UpdateFilterTreeResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UpdateFilterTreeResponse.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.conditional_control_logic_viewer.UpdateFilterTreeResponse();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.filterTree = $root.conditional_control_logic_viewer.FilterTree.decode(reader, reader.uint32());
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
         * Decodes an UpdateFilterTreeResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof conditional_control_logic_viewer.UpdateFilterTreeResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {conditional_control_logic_viewer.UpdateFilterTreeResponse} UpdateFilterTreeResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UpdateFilterTreeResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an UpdateFilterTreeResponse message.
         * @function verify
         * @memberof conditional_control_logic_viewer.UpdateFilterTreeResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        UpdateFilterTreeResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.filterTree != null && message.hasOwnProperty("filterTree")) {
                let error = $root.conditional_control_logic_viewer.FilterTree.verify(message.filterTree);
                if (error)
                    return "filterTree." + error;
            }
            return null;
        };

        /**
         * Creates an UpdateFilterTreeResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof conditional_control_logic_viewer.UpdateFilterTreeResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {conditional_control_logic_viewer.UpdateFilterTreeResponse} UpdateFilterTreeResponse
         */
        UpdateFilterTreeResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.conditional_control_logic_viewer.UpdateFilterTreeResponse)
                return object;
            let message = new $root.conditional_control_logic_viewer.UpdateFilterTreeResponse();
            if (object.filterTree != null) {
                if (typeof object.filterTree !== "object")
                    throw TypeError(".conditional_control_logic_viewer.UpdateFilterTreeResponse.filterTree: object expected");
                message.filterTree = $root.conditional_control_logic_viewer.FilterTree.fromObject(object.filterTree);
            }
            return message;
        };

        /**
         * Creates a plain object from an UpdateFilterTreeResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof conditional_control_logic_viewer.UpdateFilterTreeResponse
         * @static
         * @param {conditional_control_logic_viewer.UpdateFilterTreeResponse} message UpdateFilterTreeResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        UpdateFilterTreeResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults)
                object.filterTree = null;
            if (message.filterTree != null && message.hasOwnProperty("filterTree"))
                object.filterTree = $root.conditional_control_logic_viewer.FilterTree.toObject(message.filterTree, options);
            return object;
        };

        /**
         * Converts this UpdateFilterTreeResponse to JSON.
         * @function toJSON
         * @memberof conditional_control_logic_viewer.UpdateFilterTreeResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        UpdateFilterTreeResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for UpdateFilterTreeResponse
         * @function getTypeUrl
         * @memberof conditional_control_logic_viewer.UpdateFilterTreeResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        UpdateFilterTreeResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/conditional_control_logic_viewer.UpdateFilterTreeResponse";
        };

        return UpdateFilterTreeResponse;
    })();

    conditional_control_logic_viewer.DeleteFilterTreeRequest = (function() {

        /**
         * Properties of a DeleteFilterTreeRequest.
         * @memberof conditional_control_logic_viewer
         * @interface IDeleteFilterTreeRequest
         * @property {string|null} [id] DeleteFilterTreeRequest id
         * @property {boolean|null} [permanent] DeleteFilterTreeRequest permanent
         */

        /**
         * Constructs a new DeleteFilterTreeRequest.
         * @memberof conditional_control_logic_viewer
         * @classdesc Represents a DeleteFilterTreeRequest.
         * @implements IDeleteFilterTreeRequest
         * @constructor
         * @param {conditional_control_logic_viewer.IDeleteFilterTreeRequest=} [properties] Properties to set
         */
        function DeleteFilterTreeRequest(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * DeleteFilterTreeRequest id.
         * @member {string} id
         * @memberof conditional_control_logic_viewer.DeleteFilterTreeRequest
         * @instance
         */
        DeleteFilterTreeRequest.prototype.id = "";

        /**
         * DeleteFilterTreeRequest permanent.
         * @member {boolean} permanent
         * @memberof conditional_control_logic_viewer.DeleteFilterTreeRequest
         * @instance
         */
        DeleteFilterTreeRequest.prototype.permanent = false;

        /**
         * Creates a new DeleteFilterTreeRequest instance using the specified properties.
         * @function create
         * @memberof conditional_control_logic_viewer.DeleteFilterTreeRequest
         * @static
         * @param {conditional_control_logic_viewer.IDeleteFilterTreeRequest=} [properties] Properties to set
         * @returns {conditional_control_logic_viewer.DeleteFilterTreeRequest} DeleteFilterTreeRequest instance
         */
        DeleteFilterTreeRequest.create = function create(properties) {
            return new DeleteFilterTreeRequest(properties);
        };

        /**
         * Encodes the specified DeleteFilterTreeRequest message. Does not implicitly {@link conditional_control_logic_viewer.DeleteFilterTreeRequest.verify|verify} messages.
         * @function encode
         * @memberof conditional_control_logic_viewer.DeleteFilterTreeRequest
         * @static
         * @param {conditional_control_logic_viewer.IDeleteFilterTreeRequest} message DeleteFilterTreeRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DeleteFilterTreeRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.permanent != null && Object.hasOwnProperty.call(message, "permanent"))
                writer.uint32(/* id 2, wireType 0 =*/16).bool(message.permanent);
            return writer;
        };

        /**
         * Encodes the specified DeleteFilterTreeRequest message, length delimited. Does not implicitly {@link conditional_control_logic_viewer.DeleteFilterTreeRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof conditional_control_logic_viewer.DeleteFilterTreeRequest
         * @static
         * @param {conditional_control_logic_viewer.IDeleteFilterTreeRequest} message DeleteFilterTreeRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DeleteFilterTreeRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a DeleteFilterTreeRequest message from the specified reader or buffer.
         * @function decode
         * @memberof conditional_control_logic_viewer.DeleteFilterTreeRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {conditional_control_logic_viewer.DeleteFilterTreeRequest} DeleteFilterTreeRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DeleteFilterTreeRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.conditional_control_logic_viewer.DeleteFilterTreeRequest();
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
                        message.permanent = reader.bool();
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
         * Decodes a DeleteFilterTreeRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof conditional_control_logic_viewer.DeleteFilterTreeRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {conditional_control_logic_viewer.DeleteFilterTreeRequest} DeleteFilterTreeRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DeleteFilterTreeRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a DeleteFilterTreeRequest message.
         * @function verify
         * @memberof conditional_control_logic_viewer.DeleteFilterTreeRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        DeleteFilterTreeRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.permanent != null && message.hasOwnProperty("permanent"))
                if (typeof message.permanent !== "boolean")
                    return "permanent: boolean expected";
            return null;
        };

        /**
         * Creates a DeleteFilterTreeRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof conditional_control_logic_viewer.DeleteFilterTreeRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {conditional_control_logic_viewer.DeleteFilterTreeRequest} DeleteFilterTreeRequest
         */
        DeleteFilterTreeRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.conditional_control_logic_viewer.DeleteFilterTreeRequest)
                return object;
            let message = new $root.conditional_control_logic_viewer.DeleteFilterTreeRequest();
            if (object.id != null)
                message.id = String(object.id);
            if (object.permanent != null)
                message.permanent = Boolean(object.permanent);
            return message;
        };

        /**
         * Creates a plain object from a DeleteFilterTreeRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof conditional_control_logic_viewer.DeleteFilterTreeRequest
         * @static
         * @param {conditional_control_logic_viewer.DeleteFilterTreeRequest} message DeleteFilterTreeRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        DeleteFilterTreeRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.id = "";
                object.permanent = false;
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.permanent != null && message.hasOwnProperty("permanent"))
                object.permanent = message.permanent;
            return object;
        };

        /**
         * Converts this DeleteFilterTreeRequest to JSON.
         * @function toJSON
         * @memberof conditional_control_logic_viewer.DeleteFilterTreeRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        DeleteFilterTreeRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for DeleteFilterTreeRequest
         * @function getTypeUrl
         * @memberof conditional_control_logic_viewer.DeleteFilterTreeRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        DeleteFilterTreeRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/conditional_control_logic_viewer.DeleteFilterTreeRequest";
        };

        return DeleteFilterTreeRequest;
    })();

    conditional_control_logic_viewer.CloneFilterTreeRequest = (function() {

        /**
         * Properties of a CloneFilterTreeRequest.
         * @memberof conditional_control_logic_viewer
         * @interface ICloneFilterTreeRequest
         * @property {string|null} [id] CloneFilterTreeRequest id
         * @property {string|null} [name] CloneFilterTreeRequest name
         */

        /**
         * Constructs a new CloneFilterTreeRequest.
         * @memberof conditional_control_logic_viewer
         * @classdesc Represents a CloneFilterTreeRequest.
         * @implements ICloneFilterTreeRequest
         * @constructor
         * @param {conditional_control_logic_viewer.ICloneFilterTreeRequest=} [properties] Properties to set
         */
        function CloneFilterTreeRequest(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * CloneFilterTreeRequest id.
         * @member {string} id
         * @memberof conditional_control_logic_viewer.CloneFilterTreeRequest
         * @instance
         */
        CloneFilterTreeRequest.prototype.id = "";

        /**
         * CloneFilterTreeRequest name.
         * @member {string} name
         * @memberof conditional_control_logic_viewer.CloneFilterTreeRequest
         * @instance
         */
        CloneFilterTreeRequest.prototype.name = "";

        /**
         * Creates a new CloneFilterTreeRequest instance using the specified properties.
         * @function create
         * @memberof conditional_control_logic_viewer.CloneFilterTreeRequest
         * @static
         * @param {conditional_control_logic_viewer.ICloneFilterTreeRequest=} [properties] Properties to set
         * @returns {conditional_control_logic_viewer.CloneFilterTreeRequest} CloneFilterTreeRequest instance
         */
        CloneFilterTreeRequest.create = function create(properties) {
            return new CloneFilterTreeRequest(properties);
        };

        /**
         * Encodes the specified CloneFilterTreeRequest message. Does not implicitly {@link conditional_control_logic_viewer.CloneFilterTreeRequest.verify|verify} messages.
         * @function encode
         * @memberof conditional_control_logic_viewer.CloneFilterTreeRequest
         * @static
         * @param {conditional_control_logic_viewer.ICloneFilterTreeRequest} message CloneFilterTreeRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CloneFilterTreeRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
            return writer;
        };

        /**
         * Encodes the specified CloneFilterTreeRequest message, length delimited. Does not implicitly {@link conditional_control_logic_viewer.CloneFilterTreeRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof conditional_control_logic_viewer.CloneFilterTreeRequest
         * @static
         * @param {conditional_control_logic_viewer.ICloneFilterTreeRequest} message CloneFilterTreeRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CloneFilterTreeRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a CloneFilterTreeRequest message from the specified reader or buffer.
         * @function decode
         * @memberof conditional_control_logic_viewer.CloneFilterTreeRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {conditional_control_logic_viewer.CloneFilterTreeRequest} CloneFilterTreeRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CloneFilterTreeRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.conditional_control_logic_viewer.CloneFilterTreeRequest();
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
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a CloneFilterTreeRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof conditional_control_logic_viewer.CloneFilterTreeRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {conditional_control_logic_viewer.CloneFilterTreeRequest} CloneFilterTreeRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CloneFilterTreeRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a CloneFilterTreeRequest message.
         * @function verify
         * @memberof conditional_control_logic_viewer.CloneFilterTreeRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CloneFilterTreeRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            return null;
        };

        /**
         * Creates a CloneFilterTreeRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof conditional_control_logic_viewer.CloneFilterTreeRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {conditional_control_logic_viewer.CloneFilterTreeRequest} CloneFilterTreeRequest
         */
        CloneFilterTreeRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.conditional_control_logic_viewer.CloneFilterTreeRequest)
                return object;
            let message = new $root.conditional_control_logic_viewer.CloneFilterTreeRequest();
            if (object.id != null)
                message.id = String(object.id);
            if (object.name != null)
                message.name = String(object.name);
            return message;
        };

        /**
         * Creates a plain object from a CloneFilterTreeRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof conditional_control_logic_viewer.CloneFilterTreeRequest
         * @static
         * @param {conditional_control_logic_viewer.CloneFilterTreeRequest} message CloneFilterTreeRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CloneFilterTreeRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.id = "";
                object.name = "";
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            return object;
        };

        /**
         * Converts this CloneFilterTreeRequest to JSON.
         * @function toJSON
         * @memberof conditional_control_logic_viewer.CloneFilterTreeRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CloneFilterTreeRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for CloneFilterTreeRequest
         * @function getTypeUrl
         * @memberof conditional_control_logic_viewer.CloneFilterTreeRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        CloneFilterTreeRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/conditional_control_logic_viewer.CloneFilterTreeRequest";
        };

        return CloneFilterTreeRequest;
    })();

    conditional_control_logic_viewer.CloneFilterTreeResponse = (function() {

        /**
         * Properties of a CloneFilterTreeResponse.
         * @memberof conditional_control_logic_viewer
         * @interface ICloneFilterTreeResponse
         * @property {conditional_control_logic_viewer.IFilterTree|null} [filterTree] CloneFilterTreeResponse filterTree
         */

        /**
         * Constructs a new CloneFilterTreeResponse.
         * @memberof conditional_control_logic_viewer
         * @classdesc Represents a CloneFilterTreeResponse.
         * @implements ICloneFilterTreeResponse
         * @constructor
         * @param {conditional_control_logic_viewer.ICloneFilterTreeResponse=} [properties] Properties to set
         */
        function CloneFilterTreeResponse(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * CloneFilterTreeResponse filterTree.
         * @member {conditional_control_logic_viewer.IFilterTree|null|undefined} filterTree
         * @memberof conditional_control_logic_viewer.CloneFilterTreeResponse
         * @instance
         */
        CloneFilterTreeResponse.prototype.filterTree = null;

        /**
         * Creates a new CloneFilterTreeResponse instance using the specified properties.
         * @function create
         * @memberof conditional_control_logic_viewer.CloneFilterTreeResponse
         * @static
         * @param {conditional_control_logic_viewer.ICloneFilterTreeResponse=} [properties] Properties to set
         * @returns {conditional_control_logic_viewer.CloneFilterTreeResponse} CloneFilterTreeResponse instance
         */
        CloneFilterTreeResponse.create = function create(properties) {
            return new CloneFilterTreeResponse(properties);
        };

        /**
         * Encodes the specified CloneFilterTreeResponse message. Does not implicitly {@link conditional_control_logic_viewer.CloneFilterTreeResponse.verify|verify} messages.
         * @function encode
         * @memberof conditional_control_logic_viewer.CloneFilterTreeResponse
         * @static
         * @param {conditional_control_logic_viewer.ICloneFilterTreeResponse} message CloneFilterTreeResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CloneFilterTreeResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.filterTree != null && Object.hasOwnProperty.call(message, "filterTree"))
                $root.conditional_control_logic_viewer.FilterTree.encode(message.filterTree, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified CloneFilterTreeResponse message, length delimited. Does not implicitly {@link conditional_control_logic_viewer.CloneFilterTreeResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof conditional_control_logic_viewer.CloneFilterTreeResponse
         * @static
         * @param {conditional_control_logic_viewer.ICloneFilterTreeResponse} message CloneFilterTreeResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CloneFilterTreeResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a CloneFilterTreeResponse message from the specified reader or buffer.
         * @function decode
         * @memberof conditional_control_logic_viewer.CloneFilterTreeResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {conditional_control_logic_viewer.CloneFilterTreeResponse} CloneFilterTreeResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CloneFilterTreeResponse.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.conditional_control_logic_viewer.CloneFilterTreeResponse();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.filterTree = $root.conditional_control_logic_viewer.FilterTree.decode(reader, reader.uint32());
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
         * Decodes a CloneFilterTreeResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof conditional_control_logic_viewer.CloneFilterTreeResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {conditional_control_logic_viewer.CloneFilterTreeResponse} CloneFilterTreeResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CloneFilterTreeResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a CloneFilterTreeResponse message.
         * @function verify
         * @memberof conditional_control_logic_viewer.CloneFilterTreeResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CloneFilterTreeResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.filterTree != null && message.hasOwnProperty("filterTree")) {
                let error = $root.conditional_control_logic_viewer.FilterTree.verify(message.filterTree);
                if (error)
                    return "filterTree." + error;
            }
            return null;
        };

        /**
         * Creates a CloneFilterTreeResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof conditional_control_logic_viewer.CloneFilterTreeResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {conditional_control_logic_viewer.CloneFilterTreeResponse} CloneFilterTreeResponse
         */
        CloneFilterTreeResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.conditional_control_logic_viewer.CloneFilterTreeResponse)
                return object;
            let message = new $root.conditional_control_logic_viewer.CloneFilterTreeResponse();
            if (object.filterTree != null) {
                if (typeof object.filterTree !== "object")
                    throw TypeError(".conditional_control_logic_viewer.CloneFilterTreeResponse.filterTree: object expected");
                message.filterTree = $root.conditional_control_logic_viewer.FilterTree.fromObject(object.filterTree);
            }
            return message;
        };

        /**
         * Creates a plain object from a CloneFilterTreeResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof conditional_control_logic_viewer.CloneFilterTreeResponse
         * @static
         * @param {conditional_control_logic_viewer.CloneFilterTreeResponse} message CloneFilterTreeResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CloneFilterTreeResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults)
                object.filterTree = null;
            if (message.filterTree != null && message.hasOwnProperty("filterTree"))
                object.filterTree = $root.conditional_control_logic_viewer.FilterTree.toObject(message.filterTree, options);
            return object;
        };

        /**
         * Converts this CloneFilterTreeResponse to JSON.
         * @function toJSON
         * @memberof conditional_control_logic_viewer.CloneFilterTreeResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CloneFilterTreeResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for CloneFilterTreeResponse
         * @function getTypeUrl
         * @memberof conditional_control_logic_viewer.CloneFilterTreeResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        CloneFilterTreeResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/conditional_control_logic_viewer.CloneFilterTreeResponse";
        };

        return CloneFilterTreeResponse;
    })();

    return conditional_control_logic_viewer;
})();

export { $root as default };
