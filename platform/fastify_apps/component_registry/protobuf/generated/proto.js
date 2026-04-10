/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const component_registry = $root.component_registry = (() => {

    /**
     * Namespace component_registry.
     * @exports component_registry
     * @namespace
     */
    const component_registry = {};

    /**
     * ComponentCategory enum.
     * @name component_registry.ComponentCategory
     * @enum {number}
     * @property {number} COMPONENT_CATEGORY_UNSPECIFIED=0 COMPONENT_CATEGORY_UNSPECIFIED value
     * @property {number} COMPONENT_CATEGORY_FORMS=1 COMPONENT_CATEGORY_FORMS value
     * @property {number} COMPONENT_CATEGORY_DATA=2 COMPONENT_CATEGORY_DATA value
     * @property {number} COMPONENT_CATEGORY_LAYOUT=3 COMPONENT_CATEGORY_LAYOUT value
     * @property {number} COMPONENT_CATEGORY_FEEDBACK=4 COMPONENT_CATEGORY_FEEDBACK value
     * @property {number} COMPONENT_CATEGORY_NAVIGATION=5 COMPONENT_CATEGORY_NAVIGATION value
     * @property {number} COMPONENT_CATEGORY_OVERLAY=6 COMPONENT_CATEGORY_OVERLAY value
     */
    component_registry.ComponentCategory = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "COMPONENT_CATEGORY_UNSPECIFIED"] = 0;
        values[valuesById[1] = "COMPONENT_CATEGORY_FORMS"] = 1;
        values[valuesById[2] = "COMPONENT_CATEGORY_DATA"] = 2;
        values[valuesById[3] = "COMPONENT_CATEGORY_LAYOUT"] = 3;
        values[valuesById[4] = "COMPONENT_CATEGORY_FEEDBACK"] = 4;
        values[valuesById[5] = "COMPONENT_CATEGORY_NAVIGATION"] = 5;
        values[valuesById[6] = "COMPONENT_CATEGORY_OVERLAY"] = 6;
        return values;
    })();

    /**
     * ComponentStatus enum.
     * @name component_registry.ComponentStatus
     * @enum {number}
     * @property {number} COMPONENT_STATUS_UNSPECIFIED=0 COMPONENT_STATUS_UNSPECIFIED value
     * @property {number} COMPONENT_STATUS_STABLE=1 COMPONENT_STATUS_STABLE value
     * @property {number} COMPONENT_STATUS_BETA=2 COMPONENT_STATUS_BETA value
     * @property {number} COMPONENT_STATUS_ALPHA=3 COMPONENT_STATUS_ALPHA value
     * @property {number} COMPONENT_STATUS_DEPRECATED=4 COMPONENT_STATUS_DEPRECATED value
     */
    component_registry.ComponentStatus = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "COMPONENT_STATUS_UNSPECIFIED"] = 0;
        values[valuesById[1] = "COMPONENT_STATUS_STABLE"] = 1;
        values[valuesById[2] = "COMPONENT_STATUS_BETA"] = 2;
        values[valuesById[3] = "COMPONENT_STATUS_ALPHA"] = 3;
        values[valuesById[4] = "COMPONENT_STATUS_DEPRECATED"] = 4;
        return values;
    })();

    component_registry.PaginationRequest = (function() {

        /**
         * Properties of a PaginationRequest.
         * @memberof component_registry
         * @interface IPaginationRequest
         * @property {number|null} [page] PaginationRequest page
         * @property {number|null} [pageSize] PaginationRequest pageSize
         */

        /**
         * Constructs a new PaginationRequest.
         * @memberof component_registry
         * @classdesc Represents a PaginationRequest.
         * @implements IPaginationRequest
         * @constructor
         * @param {component_registry.IPaginationRequest=} [properties] Properties to set
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
         * @memberof component_registry.PaginationRequest
         * @instance
         */
        PaginationRequest.prototype.page = 0;

        /**
         * PaginationRequest pageSize.
         * @member {number} pageSize
         * @memberof component_registry.PaginationRequest
         * @instance
         */
        PaginationRequest.prototype.pageSize = 0;

        /**
         * Creates a new PaginationRequest instance using the specified properties.
         * @function create
         * @memberof component_registry.PaginationRequest
         * @static
         * @param {component_registry.IPaginationRequest=} [properties] Properties to set
         * @returns {component_registry.PaginationRequest} PaginationRequest instance
         */
        PaginationRequest.create = function create(properties) {
            return new PaginationRequest(properties);
        };

        /**
         * Encodes the specified PaginationRequest message. Does not implicitly {@link component_registry.PaginationRequest.verify|verify} messages.
         * @function encode
         * @memberof component_registry.PaginationRequest
         * @static
         * @param {component_registry.IPaginationRequest} message PaginationRequest message or plain object to encode
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
         * Encodes the specified PaginationRequest message, length delimited. Does not implicitly {@link component_registry.PaginationRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof component_registry.PaginationRequest
         * @static
         * @param {component_registry.IPaginationRequest} message PaginationRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PaginationRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PaginationRequest message from the specified reader or buffer.
         * @function decode
         * @memberof component_registry.PaginationRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {component_registry.PaginationRequest} PaginationRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PaginationRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.component_registry.PaginationRequest();
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
         * @memberof component_registry.PaginationRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {component_registry.PaginationRequest} PaginationRequest
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
         * @memberof component_registry.PaginationRequest
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
         * @memberof component_registry.PaginationRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {component_registry.PaginationRequest} PaginationRequest
         */
        PaginationRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.component_registry.PaginationRequest)
                return object;
            let message = new $root.component_registry.PaginationRequest();
            if (object.page != null)
                message.page = object.page | 0;
            if (object.pageSize != null)
                message.pageSize = object.pageSize | 0;
            return message;
        };

        /**
         * Creates a plain object from a PaginationRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof component_registry.PaginationRequest
         * @static
         * @param {component_registry.PaginationRequest} message PaginationRequest
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
         * @memberof component_registry.PaginationRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PaginationRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PaginationRequest
         * @function getTypeUrl
         * @memberof component_registry.PaginationRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PaginationRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/component_registry.PaginationRequest";
        };

        return PaginationRequest;
    })();

    component_registry.PaginationResponse = (function() {

        /**
         * Properties of a PaginationResponse.
         * @memberof component_registry
         * @interface IPaginationResponse
         * @property {number|null} [total] PaginationResponse total
         * @property {number|null} [page] PaginationResponse page
         * @property {number|null} [pageSize] PaginationResponse pageSize
         * @property {number|null} [totalPages] PaginationResponse totalPages
         */

        /**
         * Constructs a new PaginationResponse.
         * @memberof component_registry
         * @classdesc Represents a PaginationResponse.
         * @implements IPaginationResponse
         * @constructor
         * @param {component_registry.IPaginationResponse=} [properties] Properties to set
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
         * @memberof component_registry.PaginationResponse
         * @instance
         */
        PaginationResponse.prototype.total = 0;

        /**
         * PaginationResponse page.
         * @member {number} page
         * @memberof component_registry.PaginationResponse
         * @instance
         */
        PaginationResponse.prototype.page = 0;

        /**
         * PaginationResponse pageSize.
         * @member {number} pageSize
         * @memberof component_registry.PaginationResponse
         * @instance
         */
        PaginationResponse.prototype.pageSize = 0;

        /**
         * PaginationResponse totalPages.
         * @member {number} totalPages
         * @memberof component_registry.PaginationResponse
         * @instance
         */
        PaginationResponse.prototype.totalPages = 0;

        /**
         * Creates a new PaginationResponse instance using the specified properties.
         * @function create
         * @memberof component_registry.PaginationResponse
         * @static
         * @param {component_registry.IPaginationResponse=} [properties] Properties to set
         * @returns {component_registry.PaginationResponse} PaginationResponse instance
         */
        PaginationResponse.create = function create(properties) {
            return new PaginationResponse(properties);
        };

        /**
         * Encodes the specified PaginationResponse message. Does not implicitly {@link component_registry.PaginationResponse.verify|verify} messages.
         * @function encode
         * @memberof component_registry.PaginationResponse
         * @static
         * @param {component_registry.IPaginationResponse} message PaginationResponse message or plain object to encode
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
         * Encodes the specified PaginationResponse message, length delimited. Does not implicitly {@link component_registry.PaginationResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof component_registry.PaginationResponse
         * @static
         * @param {component_registry.IPaginationResponse} message PaginationResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PaginationResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PaginationResponse message from the specified reader or buffer.
         * @function decode
         * @memberof component_registry.PaginationResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {component_registry.PaginationResponse} PaginationResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PaginationResponse.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.component_registry.PaginationResponse();
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
         * @memberof component_registry.PaginationResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {component_registry.PaginationResponse} PaginationResponse
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
         * @memberof component_registry.PaginationResponse
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
         * @memberof component_registry.PaginationResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {component_registry.PaginationResponse} PaginationResponse
         */
        PaginationResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.component_registry.PaginationResponse)
                return object;
            let message = new $root.component_registry.PaginationResponse();
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
         * @memberof component_registry.PaginationResponse
         * @static
         * @param {component_registry.PaginationResponse} message PaginationResponse
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
         * @memberof component_registry.PaginationResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PaginationResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PaginationResponse
         * @function getTypeUrl
         * @memberof component_registry.PaginationResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PaginationResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/component_registry.PaginationResponse";
        };

        return PaginationResponse;
    })();

    component_registry.Timestamp = (function() {

        /**
         * Properties of a Timestamp.
         * @memberof component_registry
         * @interface ITimestamp
         * @property {number|Long|null} [seconds] Timestamp seconds
         * @property {number|null} [nanos] Timestamp nanos
         */

        /**
         * Constructs a new Timestamp.
         * @memberof component_registry
         * @classdesc Represents a Timestamp.
         * @implements ITimestamp
         * @constructor
         * @param {component_registry.ITimestamp=} [properties] Properties to set
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
         * @memberof component_registry.Timestamp
         * @instance
         */
        Timestamp.prototype.seconds = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Timestamp nanos.
         * @member {number} nanos
         * @memberof component_registry.Timestamp
         * @instance
         */
        Timestamp.prototype.nanos = 0;

        /**
         * Creates a new Timestamp instance using the specified properties.
         * @function create
         * @memberof component_registry.Timestamp
         * @static
         * @param {component_registry.ITimestamp=} [properties] Properties to set
         * @returns {component_registry.Timestamp} Timestamp instance
         */
        Timestamp.create = function create(properties) {
            return new Timestamp(properties);
        };

        /**
         * Encodes the specified Timestamp message. Does not implicitly {@link component_registry.Timestamp.verify|verify} messages.
         * @function encode
         * @memberof component_registry.Timestamp
         * @static
         * @param {component_registry.ITimestamp} message Timestamp message or plain object to encode
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
         * Encodes the specified Timestamp message, length delimited. Does not implicitly {@link component_registry.Timestamp.verify|verify} messages.
         * @function encodeDelimited
         * @memberof component_registry.Timestamp
         * @static
         * @param {component_registry.ITimestamp} message Timestamp message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Timestamp.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Timestamp message from the specified reader or buffer.
         * @function decode
         * @memberof component_registry.Timestamp
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {component_registry.Timestamp} Timestamp
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Timestamp.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.component_registry.Timestamp();
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
         * @memberof component_registry.Timestamp
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {component_registry.Timestamp} Timestamp
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
         * @memberof component_registry.Timestamp
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
         * @memberof component_registry.Timestamp
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {component_registry.Timestamp} Timestamp
         */
        Timestamp.fromObject = function fromObject(object) {
            if (object instanceof $root.component_registry.Timestamp)
                return object;
            let message = new $root.component_registry.Timestamp();
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
         * @memberof component_registry.Timestamp
         * @static
         * @param {component_registry.Timestamp} message Timestamp
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
         * @memberof component_registry.Timestamp
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Timestamp.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Timestamp
         * @function getTypeUrl
         * @memberof component_registry.Timestamp
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Timestamp.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/component_registry.Timestamp";
        };

        return Timestamp;
    })();

    component_registry.Component = (function() {

        /**
         * Properties of a Component.
         * @memberof component_registry
         * @interface IComponent
         * @property {string|null} [id] Component id
         * @property {string|null} [name] Component name
         * @property {component_registry.ComponentCategory|null} [category] Component category
         * @property {string|null} [version] Component version
         * @property {string|null} [author] Component author
         * @property {number|null} [downloads] Component downloads
         * @property {number|null} [stars] Component stars
         * @property {component_registry.ComponentStatus|null} [status] Component status
         * @property {string|null} [description] Component description
         * @property {Array.<component_registry.ITag>|null} [tags] Component tags
         * @property {string|null} [createdAt] Component createdAt
         * @property {string|null} [updatedAt] Component updatedAt
         */

        /**
         * Constructs a new Component.
         * @memberof component_registry
         * @classdesc Represents a Component.
         * @implements IComponent
         * @constructor
         * @param {component_registry.IComponent=} [properties] Properties to set
         */
        function Component(properties) {
            this.tags = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Component id.
         * @member {string} id
         * @memberof component_registry.Component
         * @instance
         */
        Component.prototype.id = "";

        /**
         * Component name.
         * @member {string} name
         * @memberof component_registry.Component
         * @instance
         */
        Component.prototype.name = "";

        /**
         * Component category.
         * @member {component_registry.ComponentCategory} category
         * @memberof component_registry.Component
         * @instance
         */
        Component.prototype.category = 0;

        /**
         * Component version.
         * @member {string} version
         * @memberof component_registry.Component
         * @instance
         */
        Component.prototype.version = "";

        /**
         * Component author.
         * @member {string} author
         * @memberof component_registry.Component
         * @instance
         */
        Component.prototype.author = "";

        /**
         * Component downloads.
         * @member {number} downloads
         * @memberof component_registry.Component
         * @instance
         */
        Component.prototype.downloads = 0;

        /**
         * Component stars.
         * @member {number} stars
         * @memberof component_registry.Component
         * @instance
         */
        Component.prototype.stars = 0;

        /**
         * Component status.
         * @member {component_registry.ComponentStatus} status
         * @memberof component_registry.Component
         * @instance
         */
        Component.prototype.status = 0;

        /**
         * Component description.
         * @member {string} description
         * @memberof component_registry.Component
         * @instance
         */
        Component.prototype.description = "";

        /**
         * Component tags.
         * @member {Array.<component_registry.ITag>} tags
         * @memberof component_registry.Component
         * @instance
         */
        Component.prototype.tags = $util.emptyArray;

        /**
         * Component createdAt.
         * @member {string} createdAt
         * @memberof component_registry.Component
         * @instance
         */
        Component.prototype.createdAt = "";

        /**
         * Component updatedAt.
         * @member {string} updatedAt
         * @memberof component_registry.Component
         * @instance
         */
        Component.prototype.updatedAt = "";

        /**
         * Creates a new Component instance using the specified properties.
         * @function create
         * @memberof component_registry.Component
         * @static
         * @param {component_registry.IComponent=} [properties] Properties to set
         * @returns {component_registry.Component} Component instance
         */
        Component.create = function create(properties) {
            return new Component(properties);
        };

        /**
         * Encodes the specified Component message. Does not implicitly {@link component_registry.Component.verify|verify} messages.
         * @function encode
         * @memberof component_registry.Component
         * @static
         * @param {component_registry.IComponent} message Component message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Component.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
            if (message.category != null && Object.hasOwnProperty.call(message, "category"))
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.category);
            if (message.version != null && Object.hasOwnProperty.call(message, "version"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.version);
            if (message.author != null && Object.hasOwnProperty.call(message, "author"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.author);
            if (message.downloads != null && Object.hasOwnProperty.call(message, "downloads"))
                writer.uint32(/* id 6, wireType 0 =*/48).int32(message.downloads);
            if (message.stars != null && Object.hasOwnProperty.call(message, "stars"))
                writer.uint32(/* id 7, wireType 0 =*/56).int32(message.stars);
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 8, wireType 0 =*/64).int32(message.status);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 9, wireType 2 =*/74).string(message.description);
            if (message.tags != null && message.tags.length)
                for (let i = 0; i < message.tags.length; ++i)
                    $root.component_registry.Tag.encode(message.tags[i], writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
            if (message.createdAt != null && Object.hasOwnProperty.call(message, "createdAt"))
                writer.uint32(/* id 11, wireType 2 =*/90).string(message.createdAt);
            if (message.updatedAt != null && Object.hasOwnProperty.call(message, "updatedAt"))
                writer.uint32(/* id 12, wireType 2 =*/98).string(message.updatedAt);
            return writer;
        };

        /**
         * Encodes the specified Component message, length delimited. Does not implicitly {@link component_registry.Component.verify|verify} messages.
         * @function encodeDelimited
         * @memberof component_registry.Component
         * @static
         * @param {component_registry.IComponent} message Component message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Component.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Component message from the specified reader or buffer.
         * @function decode
         * @memberof component_registry.Component
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {component_registry.Component} Component
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Component.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.component_registry.Component();
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
                        message.category = reader.int32();
                        break;
                    }
                case 4: {
                        message.version = reader.string();
                        break;
                    }
                case 5: {
                        message.author = reader.string();
                        break;
                    }
                case 6: {
                        message.downloads = reader.int32();
                        break;
                    }
                case 7: {
                        message.stars = reader.int32();
                        break;
                    }
                case 8: {
                        message.status = reader.int32();
                        break;
                    }
                case 9: {
                        message.description = reader.string();
                        break;
                    }
                case 10: {
                        if (!(message.tags && message.tags.length))
                            message.tags = [];
                        message.tags.push($root.component_registry.Tag.decode(reader, reader.uint32()));
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
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Component message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof component_registry.Component
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {component_registry.Component} Component
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Component.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Component message.
         * @function verify
         * @memberof component_registry.Component
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Component.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.category != null && message.hasOwnProperty("category"))
                switch (message.category) {
                default:
                    return "category: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                    break;
                }
            if (message.version != null && message.hasOwnProperty("version"))
                if (!$util.isString(message.version))
                    return "version: string expected";
            if (message.author != null && message.hasOwnProperty("author"))
                if (!$util.isString(message.author))
                    return "author: string expected";
            if (message.downloads != null && message.hasOwnProperty("downloads"))
                if (!$util.isInteger(message.downloads))
                    return "downloads: integer expected";
            if (message.stars != null && message.hasOwnProperty("stars"))
                if (!$util.isInteger(message.stars))
                    return "stars: integer expected";
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
            if (message.description != null && message.hasOwnProperty("description"))
                if (!$util.isString(message.description))
                    return "description: string expected";
            if (message.tags != null && message.hasOwnProperty("tags")) {
                if (!Array.isArray(message.tags))
                    return "tags: array expected";
                for (let i = 0; i < message.tags.length; ++i) {
                    let error = $root.component_registry.Tag.verify(message.tags[i]);
                    if (error)
                        return "tags." + error;
                }
            }
            if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                if (!$util.isString(message.createdAt))
                    return "createdAt: string expected";
            if (message.updatedAt != null && message.hasOwnProperty("updatedAt"))
                if (!$util.isString(message.updatedAt))
                    return "updatedAt: string expected";
            return null;
        };

        /**
         * Creates a Component message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof component_registry.Component
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {component_registry.Component} Component
         */
        Component.fromObject = function fromObject(object) {
            if (object instanceof $root.component_registry.Component)
                return object;
            let message = new $root.component_registry.Component();
            if (object.id != null)
                message.id = String(object.id);
            if (object.name != null)
                message.name = String(object.name);
            switch (object.category) {
            default:
                if (typeof object.category === "number") {
                    message.category = object.category;
                    break;
                }
                break;
            case "COMPONENT_CATEGORY_UNSPECIFIED":
            case 0:
                message.category = 0;
                break;
            case "COMPONENT_CATEGORY_FORMS":
            case 1:
                message.category = 1;
                break;
            case "COMPONENT_CATEGORY_DATA":
            case 2:
                message.category = 2;
                break;
            case "COMPONENT_CATEGORY_LAYOUT":
            case 3:
                message.category = 3;
                break;
            case "COMPONENT_CATEGORY_FEEDBACK":
            case 4:
                message.category = 4;
                break;
            case "COMPONENT_CATEGORY_NAVIGATION":
            case 5:
                message.category = 5;
                break;
            case "COMPONENT_CATEGORY_OVERLAY":
            case 6:
                message.category = 6;
                break;
            }
            if (object.version != null)
                message.version = String(object.version);
            if (object.author != null)
                message.author = String(object.author);
            if (object.downloads != null)
                message.downloads = object.downloads | 0;
            if (object.stars != null)
                message.stars = object.stars | 0;
            switch (object.status) {
            default:
                if (typeof object.status === "number") {
                    message.status = object.status;
                    break;
                }
                break;
            case "COMPONENT_STATUS_UNSPECIFIED":
            case 0:
                message.status = 0;
                break;
            case "COMPONENT_STATUS_STABLE":
            case 1:
                message.status = 1;
                break;
            case "COMPONENT_STATUS_BETA":
            case 2:
                message.status = 2;
                break;
            case "COMPONENT_STATUS_ALPHA":
            case 3:
                message.status = 3;
                break;
            case "COMPONENT_STATUS_DEPRECATED":
            case 4:
                message.status = 4;
                break;
            }
            if (object.description != null)
                message.description = String(object.description);
            if (object.tags) {
                if (!Array.isArray(object.tags))
                    throw TypeError(".component_registry.Component.tags: array expected");
                message.tags = [];
                for (let i = 0; i < object.tags.length; ++i) {
                    if (typeof object.tags[i] !== "object")
                        throw TypeError(".component_registry.Component.tags: object expected");
                    message.tags[i] = $root.component_registry.Tag.fromObject(object.tags[i]);
                }
            }
            if (object.createdAt != null)
                message.createdAt = String(object.createdAt);
            if (object.updatedAt != null)
                message.updatedAt = String(object.updatedAt);
            return message;
        };

        /**
         * Creates a plain object from a Component message. Also converts values to other types if specified.
         * @function toObject
         * @memberof component_registry.Component
         * @static
         * @param {component_registry.Component} message Component
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Component.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.tags = [];
            if (options.defaults) {
                object.id = "";
                object.name = "";
                object.category = options.enums === String ? "COMPONENT_CATEGORY_UNSPECIFIED" : 0;
                object.version = "";
                object.author = "";
                object.downloads = 0;
                object.stars = 0;
                object.status = options.enums === String ? "COMPONENT_STATUS_UNSPECIFIED" : 0;
                object.description = "";
                object.createdAt = "";
                object.updatedAt = "";
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.category != null && message.hasOwnProperty("category"))
                object.category = options.enums === String ? $root.component_registry.ComponentCategory[message.category] === undefined ? message.category : $root.component_registry.ComponentCategory[message.category] : message.category;
            if (message.version != null && message.hasOwnProperty("version"))
                object.version = message.version;
            if (message.author != null && message.hasOwnProperty("author"))
                object.author = message.author;
            if (message.downloads != null && message.hasOwnProperty("downloads"))
                object.downloads = message.downloads;
            if (message.stars != null && message.hasOwnProperty("stars"))
                object.stars = message.stars;
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = options.enums === String ? $root.component_registry.ComponentStatus[message.status] === undefined ? message.status : $root.component_registry.ComponentStatus[message.status] : message.status;
            if (message.description != null && message.hasOwnProperty("description"))
                object.description = message.description;
            if (message.tags && message.tags.length) {
                object.tags = [];
                for (let j = 0; j < message.tags.length; ++j)
                    object.tags[j] = $root.component_registry.Tag.toObject(message.tags[j], options);
            }
            if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                object.createdAt = message.createdAt;
            if (message.updatedAt != null && message.hasOwnProperty("updatedAt"))
                object.updatedAt = message.updatedAt;
            return object;
        };

        /**
         * Converts this Component to JSON.
         * @function toJSON
         * @memberof component_registry.Component
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Component.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Component
         * @function getTypeUrl
         * @memberof component_registry.Component
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Component.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/component_registry.Component";
        };

        return Component;
    })();

    component_registry.CreateComponentRequest = (function() {

        /**
         * Properties of a CreateComponentRequest.
         * @memberof component_registry
         * @interface ICreateComponentRequest
         * @property {string|null} [name] CreateComponentRequest name
         * @property {component_registry.ComponentCategory|null} [category] CreateComponentRequest category
         * @property {string|null} [version] CreateComponentRequest version
         * @property {string|null} [author] CreateComponentRequest author
         * @property {component_registry.ComponentStatus|null} [status] CreateComponentRequest status
         * @property {string|null} [description] CreateComponentRequest description
         * @property {Array.<string>|null} [tagIds] CreateComponentRequest tagIds
         */

        /**
         * Constructs a new CreateComponentRequest.
         * @memberof component_registry
         * @classdesc Represents a CreateComponentRequest.
         * @implements ICreateComponentRequest
         * @constructor
         * @param {component_registry.ICreateComponentRequest=} [properties] Properties to set
         */
        function CreateComponentRequest(properties) {
            this.tagIds = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * CreateComponentRequest name.
         * @member {string} name
         * @memberof component_registry.CreateComponentRequest
         * @instance
         */
        CreateComponentRequest.prototype.name = "";

        /**
         * CreateComponentRequest category.
         * @member {component_registry.ComponentCategory} category
         * @memberof component_registry.CreateComponentRequest
         * @instance
         */
        CreateComponentRequest.prototype.category = 0;

        /**
         * CreateComponentRequest version.
         * @member {string} version
         * @memberof component_registry.CreateComponentRequest
         * @instance
         */
        CreateComponentRequest.prototype.version = "";

        /**
         * CreateComponentRequest author.
         * @member {string} author
         * @memberof component_registry.CreateComponentRequest
         * @instance
         */
        CreateComponentRequest.prototype.author = "";

        /**
         * CreateComponentRequest status.
         * @member {component_registry.ComponentStatus} status
         * @memberof component_registry.CreateComponentRequest
         * @instance
         */
        CreateComponentRequest.prototype.status = 0;

        /**
         * CreateComponentRequest description.
         * @member {string} description
         * @memberof component_registry.CreateComponentRequest
         * @instance
         */
        CreateComponentRequest.prototype.description = "";

        /**
         * CreateComponentRequest tagIds.
         * @member {Array.<string>} tagIds
         * @memberof component_registry.CreateComponentRequest
         * @instance
         */
        CreateComponentRequest.prototype.tagIds = $util.emptyArray;

        /**
         * Creates a new CreateComponentRequest instance using the specified properties.
         * @function create
         * @memberof component_registry.CreateComponentRequest
         * @static
         * @param {component_registry.ICreateComponentRequest=} [properties] Properties to set
         * @returns {component_registry.CreateComponentRequest} CreateComponentRequest instance
         */
        CreateComponentRequest.create = function create(properties) {
            return new CreateComponentRequest(properties);
        };

        /**
         * Encodes the specified CreateComponentRequest message. Does not implicitly {@link component_registry.CreateComponentRequest.verify|verify} messages.
         * @function encode
         * @memberof component_registry.CreateComponentRequest
         * @static
         * @param {component_registry.ICreateComponentRequest} message CreateComponentRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CreateComponentRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
            if (message.category != null && Object.hasOwnProperty.call(message, "category"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.category);
            if (message.version != null && Object.hasOwnProperty.call(message, "version"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.version);
            if (message.author != null && Object.hasOwnProperty.call(message, "author"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.author);
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 5, wireType 0 =*/40).int32(message.status);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.description);
            if (message.tagIds != null && message.tagIds.length)
                for (let i = 0; i < message.tagIds.length; ++i)
                    writer.uint32(/* id 7, wireType 2 =*/58).string(message.tagIds[i]);
            return writer;
        };

        /**
         * Encodes the specified CreateComponentRequest message, length delimited. Does not implicitly {@link component_registry.CreateComponentRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof component_registry.CreateComponentRequest
         * @static
         * @param {component_registry.ICreateComponentRequest} message CreateComponentRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CreateComponentRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a CreateComponentRequest message from the specified reader or buffer.
         * @function decode
         * @memberof component_registry.CreateComponentRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {component_registry.CreateComponentRequest} CreateComponentRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CreateComponentRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.component_registry.CreateComponentRequest();
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
                        message.category = reader.int32();
                        break;
                    }
                case 3: {
                        message.version = reader.string();
                        break;
                    }
                case 4: {
                        message.author = reader.string();
                        break;
                    }
                case 5: {
                        message.status = reader.int32();
                        break;
                    }
                case 6: {
                        message.description = reader.string();
                        break;
                    }
                case 7: {
                        if (!(message.tagIds && message.tagIds.length))
                            message.tagIds = [];
                        message.tagIds.push(reader.string());
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
         * Decodes a CreateComponentRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof component_registry.CreateComponentRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {component_registry.CreateComponentRequest} CreateComponentRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CreateComponentRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a CreateComponentRequest message.
         * @function verify
         * @memberof component_registry.CreateComponentRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CreateComponentRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.category != null && message.hasOwnProperty("category"))
                switch (message.category) {
                default:
                    return "category: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                    break;
                }
            if (message.version != null && message.hasOwnProperty("version"))
                if (!$util.isString(message.version))
                    return "version: string expected";
            if (message.author != null && message.hasOwnProperty("author"))
                if (!$util.isString(message.author))
                    return "author: string expected";
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
            if (message.description != null && message.hasOwnProperty("description"))
                if (!$util.isString(message.description))
                    return "description: string expected";
            if (message.tagIds != null && message.hasOwnProperty("tagIds")) {
                if (!Array.isArray(message.tagIds))
                    return "tagIds: array expected";
                for (let i = 0; i < message.tagIds.length; ++i)
                    if (!$util.isString(message.tagIds[i]))
                        return "tagIds: string[] expected";
            }
            return null;
        };

        /**
         * Creates a CreateComponentRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof component_registry.CreateComponentRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {component_registry.CreateComponentRequest} CreateComponentRequest
         */
        CreateComponentRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.component_registry.CreateComponentRequest)
                return object;
            let message = new $root.component_registry.CreateComponentRequest();
            if (object.name != null)
                message.name = String(object.name);
            switch (object.category) {
            default:
                if (typeof object.category === "number") {
                    message.category = object.category;
                    break;
                }
                break;
            case "COMPONENT_CATEGORY_UNSPECIFIED":
            case 0:
                message.category = 0;
                break;
            case "COMPONENT_CATEGORY_FORMS":
            case 1:
                message.category = 1;
                break;
            case "COMPONENT_CATEGORY_DATA":
            case 2:
                message.category = 2;
                break;
            case "COMPONENT_CATEGORY_LAYOUT":
            case 3:
                message.category = 3;
                break;
            case "COMPONENT_CATEGORY_FEEDBACK":
            case 4:
                message.category = 4;
                break;
            case "COMPONENT_CATEGORY_NAVIGATION":
            case 5:
                message.category = 5;
                break;
            case "COMPONENT_CATEGORY_OVERLAY":
            case 6:
                message.category = 6;
                break;
            }
            if (object.version != null)
                message.version = String(object.version);
            if (object.author != null)
                message.author = String(object.author);
            switch (object.status) {
            default:
                if (typeof object.status === "number") {
                    message.status = object.status;
                    break;
                }
                break;
            case "COMPONENT_STATUS_UNSPECIFIED":
            case 0:
                message.status = 0;
                break;
            case "COMPONENT_STATUS_STABLE":
            case 1:
                message.status = 1;
                break;
            case "COMPONENT_STATUS_BETA":
            case 2:
                message.status = 2;
                break;
            case "COMPONENT_STATUS_ALPHA":
            case 3:
                message.status = 3;
                break;
            case "COMPONENT_STATUS_DEPRECATED":
            case 4:
                message.status = 4;
                break;
            }
            if (object.description != null)
                message.description = String(object.description);
            if (object.tagIds) {
                if (!Array.isArray(object.tagIds))
                    throw TypeError(".component_registry.CreateComponentRequest.tagIds: array expected");
                message.tagIds = [];
                for (let i = 0; i < object.tagIds.length; ++i)
                    message.tagIds[i] = String(object.tagIds[i]);
            }
            return message;
        };

        /**
         * Creates a plain object from a CreateComponentRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof component_registry.CreateComponentRequest
         * @static
         * @param {component_registry.CreateComponentRequest} message CreateComponentRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CreateComponentRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.tagIds = [];
            if (options.defaults) {
                object.name = "";
                object.category = options.enums === String ? "COMPONENT_CATEGORY_UNSPECIFIED" : 0;
                object.version = "";
                object.author = "";
                object.status = options.enums === String ? "COMPONENT_STATUS_UNSPECIFIED" : 0;
                object.description = "";
            }
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.category != null && message.hasOwnProperty("category"))
                object.category = options.enums === String ? $root.component_registry.ComponentCategory[message.category] === undefined ? message.category : $root.component_registry.ComponentCategory[message.category] : message.category;
            if (message.version != null && message.hasOwnProperty("version"))
                object.version = message.version;
            if (message.author != null && message.hasOwnProperty("author"))
                object.author = message.author;
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = options.enums === String ? $root.component_registry.ComponentStatus[message.status] === undefined ? message.status : $root.component_registry.ComponentStatus[message.status] : message.status;
            if (message.description != null && message.hasOwnProperty("description"))
                object.description = message.description;
            if (message.tagIds && message.tagIds.length) {
                object.tagIds = [];
                for (let j = 0; j < message.tagIds.length; ++j)
                    object.tagIds[j] = message.tagIds[j];
            }
            return object;
        };

        /**
         * Converts this CreateComponentRequest to JSON.
         * @function toJSON
         * @memberof component_registry.CreateComponentRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CreateComponentRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for CreateComponentRequest
         * @function getTypeUrl
         * @memberof component_registry.CreateComponentRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        CreateComponentRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/component_registry.CreateComponentRequest";
        };

        return CreateComponentRequest;
    })();

    component_registry.UpdateComponentRequest = (function() {

        /**
         * Properties of an UpdateComponentRequest.
         * @memberof component_registry
         * @interface IUpdateComponentRequest
         * @property {string|null} [id] UpdateComponentRequest id
         * @property {string|null} [name] UpdateComponentRequest name
         * @property {component_registry.ComponentCategory|null} [category] UpdateComponentRequest category
         * @property {string|null} [version] UpdateComponentRequest version
         * @property {string|null} [author] UpdateComponentRequest author
         * @property {component_registry.ComponentStatus|null} [status] UpdateComponentRequest status
         * @property {string|null} [description] UpdateComponentRequest description
         * @property {Array.<string>|null} [tagIds] UpdateComponentRequest tagIds
         */

        /**
         * Constructs a new UpdateComponentRequest.
         * @memberof component_registry
         * @classdesc Represents an UpdateComponentRequest.
         * @implements IUpdateComponentRequest
         * @constructor
         * @param {component_registry.IUpdateComponentRequest=} [properties] Properties to set
         */
        function UpdateComponentRequest(properties) {
            this.tagIds = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * UpdateComponentRequest id.
         * @member {string} id
         * @memberof component_registry.UpdateComponentRequest
         * @instance
         */
        UpdateComponentRequest.prototype.id = "";

        /**
         * UpdateComponentRequest name.
         * @member {string} name
         * @memberof component_registry.UpdateComponentRequest
         * @instance
         */
        UpdateComponentRequest.prototype.name = "";

        /**
         * UpdateComponentRequest category.
         * @member {component_registry.ComponentCategory} category
         * @memberof component_registry.UpdateComponentRequest
         * @instance
         */
        UpdateComponentRequest.prototype.category = 0;

        /**
         * UpdateComponentRequest version.
         * @member {string} version
         * @memberof component_registry.UpdateComponentRequest
         * @instance
         */
        UpdateComponentRequest.prototype.version = "";

        /**
         * UpdateComponentRequest author.
         * @member {string} author
         * @memberof component_registry.UpdateComponentRequest
         * @instance
         */
        UpdateComponentRequest.prototype.author = "";

        /**
         * UpdateComponentRequest status.
         * @member {component_registry.ComponentStatus} status
         * @memberof component_registry.UpdateComponentRequest
         * @instance
         */
        UpdateComponentRequest.prototype.status = 0;

        /**
         * UpdateComponentRequest description.
         * @member {string} description
         * @memberof component_registry.UpdateComponentRequest
         * @instance
         */
        UpdateComponentRequest.prototype.description = "";

        /**
         * UpdateComponentRequest tagIds.
         * @member {Array.<string>} tagIds
         * @memberof component_registry.UpdateComponentRequest
         * @instance
         */
        UpdateComponentRequest.prototype.tagIds = $util.emptyArray;

        /**
         * Creates a new UpdateComponentRequest instance using the specified properties.
         * @function create
         * @memberof component_registry.UpdateComponentRequest
         * @static
         * @param {component_registry.IUpdateComponentRequest=} [properties] Properties to set
         * @returns {component_registry.UpdateComponentRequest} UpdateComponentRequest instance
         */
        UpdateComponentRequest.create = function create(properties) {
            return new UpdateComponentRequest(properties);
        };

        /**
         * Encodes the specified UpdateComponentRequest message. Does not implicitly {@link component_registry.UpdateComponentRequest.verify|verify} messages.
         * @function encode
         * @memberof component_registry.UpdateComponentRequest
         * @static
         * @param {component_registry.IUpdateComponentRequest} message UpdateComponentRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UpdateComponentRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
            if (message.category != null && Object.hasOwnProperty.call(message, "category"))
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.category);
            if (message.version != null && Object.hasOwnProperty.call(message, "version"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.version);
            if (message.author != null && Object.hasOwnProperty.call(message, "author"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.author);
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 6, wireType 0 =*/48).int32(message.status);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 7, wireType 2 =*/58).string(message.description);
            if (message.tagIds != null && message.tagIds.length)
                for (let i = 0; i < message.tagIds.length; ++i)
                    writer.uint32(/* id 8, wireType 2 =*/66).string(message.tagIds[i]);
            return writer;
        };

        /**
         * Encodes the specified UpdateComponentRequest message, length delimited. Does not implicitly {@link component_registry.UpdateComponentRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof component_registry.UpdateComponentRequest
         * @static
         * @param {component_registry.IUpdateComponentRequest} message UpdateComponentRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UpdateComponentRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an UpdateComponentRequest message from the specified reader or buffer.
         * @function decode
         * @memberof component_registry.UpdateComponentRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {component_registry.UpdateComponentRequest} UpdateComponentRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UpdateComponentRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.component_registry.UpdateComponentRequest();
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
                        message.category = reader.int32();
                        break;
                    }
                case 4: {
                        message.version = reader.string();
                        break;
                    }
                case 5: {
                        message.author = reader.string();
                        break;
                    }
                case 6: {
                        message.status = reader.int32();
                        break;
                    }
                case 7: {
                        message.description = reader.string();
                        break;
                    }
                case 8: {
                        if (!(message.tagIds && message.tagIds.length))
                            message.tagIds = [];
                        message.tagIds.push(reader.string());
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
         * Decodes an UpdateComponentRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof component_registry.UpdateComponentRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {component_registry.UpdateComponentRequest} UpdateComponentRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UpdateComponentRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an UpdateComponentRequest message.
         * @function verify
         * @memberof component_registry.UpdateComponentRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        UpdateComponentRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.category != null && message.hasOwnProperty("category"))
                switch (message.category) {
                default:
                    return "category: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                    break;
                }
            if (message.version != null && message.hasOwnProperty("version"))
                if (!$util.isString(message.version))
                    return "version: string expected";
            if (message.author != null && message.hasOwnProperty("author"))
                if (!$util.isString(message.author))
                    return "author: string expected";
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
            if (message.description != null && message.hasOwnProperty("description"))
                if (!$util.isString(message.description))
                    return "description: string expected";
            if (message.tagIds != null && message.hasOwnProperty("tagIds")) {
                if (!Array.isArray(message.tagIds))
                    return "tagIds: array expected";
                for (let i = 0; i < message.tagIds.length; ++i)
                    if (!$util.isString(message.tagIds[i]))
                        return "tagIds: string[] expected";
            }
            return null;
        };

        /**
         * Creates an UpdateComponentRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof component_registry.UpdateComponentRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {component_registry.UpdateComponentRequest} UpdateComponentRequest
         */
        UpdateComponentRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.component_registry.UpdateComponentRequest)
                return object;
            let message = new $root.component_registry.UpdateComponentRequest();
            if (object.id != null)
                message.id = String(object.id);
            if (object.name != null)
                message.name = String(object.name);
            switch (object.category) {
            default:
                if (typeof object.category === "number") {
                    message.category = object.category;
                    break;
                }
                break;
            case "COMPONENT_CATEGORY_UNSPECIFIED":
            case 0:
                message.category = 0;
                break;
            case "COMPONENT_CATEGORY_FORMS":
            case 1:
                message.category = 1;
                break;
            case "COMPONENT_CATEGORY_DATA":
            case 2:
                message.category = 2;
                break;
            case "COMPONENT_CATEGORY_LAYOUT":
            case 3:
                message.category = 3;
                break;
            case "COMPONENT_CATEGORY_FEEDBACK":
            case 4:
                message.category = 4;
                break;
            case "COMPONENT_CATEGORY_NAVIGATION":
            case 5:
                message.category = 5;
                break;
            case "COMPONENT_CATEGORY_OVERLAY":
            case 6:
                message.category = 6;
                break;
            }
            if (object.version != null)
                message.version = String(object.version);
            if (object.author != null)
                message.author = String(object.author);
            switch (object.status) {
            default:
                if (typeof object.status === "number") {
                    message.status = object.status;
                    break;
                }
                break;
            case "COMPONENT_STATUS_UNSPECIFIED":
            case 0:
                message.status = 0;
                break;
            case "COMPONENT_STATUS_STABLE":
            case 1:
                message.status = 1;
                break;
            case "COMPONENT_STATUS_BETA":
            case 2:
                message.status = 2;
                break;
            case "COMPONENT_STATUS_ALPHA":
            case 3:
                message.status = 3;
                break;
            case "COMPONENT_STATUS_DEPRECATED":
            case 4:
                message.status = 4;
                break;
            }
            if (object.description != null)
                message.description = String(object.description);
            if (object.tagIds) {
                if (!Array.isArray(object.tagIds))
                    throw TypeError(".component_registry.UpdateComponentRequest.tagIds: array expected");
                message.tagIds = [];
                for (let i = 0; i < object.tagIds.length; ++i)
                    message.tagIds[i] = String(object.tagIds[i]);
            }
            return message;
        };

        /**
         * Creates a plain object from an UpdateComponentRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof component_registry.UpdateComponentRequest
         * @static
         * @param {component_registry.UpdateComponentRequest} message UpdateComponentRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        UpdateComponentRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.tagIds = [];
            if (options.defaults) {
                object.id = "";
                object.name = "";
                object.category = options.enums === String ? "COMPONENT_CATEGORY_UNSPECIFIED" : 0;
                object.version = "";
                object.author = "";
                object.status = options.enums === String ? "COMPONENT_STATUS_UNSPECIFIED" : 0;
                object.description = "";
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.category != null && message.hasOwnProperty("category"))
                object.category = options.enums === String ? $root.component_registry.ComponentCategory[message.category] === undefined ? message.category : $root.component_registry.ComponentCategory[message.category] : message.category;
            if (message.version != null && message.hasOwnProperty("version"))
                object.version = message.version;
            if (message.author != null && message.hasOwnProperty("author"))
                object.author = message.author;
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = options.enums === String ? $root.component_registry.ComponentStatus[message.status] === undefined ? message.status : $root.component_registry.ComponentStatus[message.status] : message.status;
            if (message.description != null && message.hasOwnProperty("description"))
                object.description = message.description;
            if (message.tagIds && message.tagIds.length) {
                object.tagIds = [];
                for (let j = 0; j < message.tagIds.length; ++j)
                    object.tagIds[j] = message.tagIds[j];
            }
            return object;
        };

        /**
         * Converts this UpdateComponentRequest to JSON.
         * @function toJSON
         * @memberof component_registry.UpdateComponentRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        UpdateComponentRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for UpdateComponentRequest
         * @function getTypeUrl
         * @memberof component_registry.UpdateComponentRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        UpdateComponentRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/component_registry.UpdateComponentRequest";
        };

        return UpdateComponentRequest;
    })();

    component_registry.ListComponentsRequest = (function() {

        /**
         * Properties of a ListComponentsRequest.
         * @memberof component_registry
         * @interface IListComponentsRequest
         * @property {component_registry.IPaginationRequest|null} [pagination] ListComponentsRequest pagination
         * @property {string|null} [search] ListComponentsRequest search
         * @property {component_registry.ComponentStatus|null} [status] ListComponentsRequest status
         * @property {component_registry.ComponentCategory|null} [category] ListComponentsRequest category
         * @property {string|null} [author] ListComponentsRequest author
         * @property {string|null} [sort] ListComponentsRequest sort
         * @property {string|null} [order] ListComponentsRequest order
         */

        /**
         * Constructs a new ListComponentsRequest.
         * @memberof component_registry
         * @classdesc Represents a ListComponentsRequest.
         * @implements IListComponentsRequest
         * @constructor
         * @param {component_registry.IListComponentsRequest=} [properties] Properties to set
         */
        function ListComponentsRequest(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ListComponentsRequest pagination.
         * @member {component_registry.IPaginationRequest|null|undefined} pagination
         * @memberof component_registry.ListComponentsRequest
         * @instance
         */
        ListComponentsRequest.prototype.pagination = null;

        /**
         * ListComponentsRequest search.
         * @member {string} search
         * @memberof component_registry.ListComponentsRequest
         * @instance
         */
        ListComponentsRequest.prototype.search = "";

        /**
         * ListComponentsRequest status.
         * @member {component_registry.ComponentStatus} status
         * @memberof component_registry.ListComponentsRequest
         * @instance
         */
        ListComponentsRequest.prototype.status = 0;

        /**
         * ListComponentsRequest category.
         * @member {component_registry.ComponentCategory} category
         * @memberof component_registry.ListComponentsRequest
         * @instance
         */
        ListComponentsRequest.prototype.category = 0;

        /**
         * ListComponentsRequest author.
         * @member {string} author
         * @memberof component_registry.ListComponentsRequest
         * @instance
         */
        ListComponentsRequest.prototype.author = "";

        /**
         * ListComponentsRequest sort.
         * @member {string} sort
         * @memberof component_registry.ListComponentsRequest
         * @instance
         */
        ListComponentsRequest.prototype.sort = "";

        /**
         * ListComponentsRequest order.
         * @member {string} order
         * @memberof component_registry.ListComponentsRequest
         * @instance
         */
        ListComponentsRequest.prototype.order = "";

        /**
         * Creates a new ListComponentsRequest instance using the specified properties.
         * @function create
         * @memberof component_registry.ListComponentsRequest
         * @static
         * @param {component_registry.IListComponentsRequest=} [properties] Properties to set
         * @returns {component_registry.ListComponentsRequest} ListComponentsRequest instance
         */
        ListComponentsRequest.create = function create(properties) {
            return new ListComponentsRequest(properties);
        };

        /**
         * Encodes the specified ListComponentsRequest message. Does not implicitly {@link component_registry.ListComponentsRequest.verify|verify} messages.
         * @function encode
         * @memberof component_registry.ListComponentsRequest
         * @static
         * @param {component_registry.IListComponentsRequest} message ListComponentsRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ListComponentsRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.pagination != null && Object.hasOwnProperty.call(message, "pagination"))
                $root.component_registry.PaginationRequest.encode(message.pagination, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.search != null && Object.hasOwnProperty.call(message, "search"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.search);
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.status);
            if (message.category != null && Object.hasOwnProperty.call(message, "category"))
                writer.uint32(/* id 4, wireType 0 =*/32).int32(message.category);
            if (message.author != null && Object.hasOwnProperty.call(message, "author"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.author);
            if (message.sort != null && Object.hasOwnProperty.call(message, "sort"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.sort);
            if (message.order != null && Object.hasOwnProperty.call(message, "order"))
                writer.uint32(/* id 7, wireType 2 =*/58).string(message.order);
            return writer;
        };

        /**
         * Encodes the specified ListComponentsRequest message, length delimited. Does not implicitly {@link component_registry.ListComponentsRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof component_registry.ListComponentsRequest
         * @static
         * @param {component_registry.IListComponentsRequest} message ListComponentsRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ListComponentsRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ListComponentsRequest message from the specified reader or buffer.
         * @function decode
         * @memberof component_registry.ListComponentsRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {component_registry.ListComponentsRequest} ListComponentsRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ListComponentsRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.component_registry.ListComponentsRequest();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.pagination = $root.component_registry.PaginationRequest.decode(reader, reader.uint32());
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
                case 4: {
                        message.category = reader.int32();
                        break;
                    }
                case 5: {
                        message.author = reader.string();
                        break;
                    }
                case 6: {
                        message.sort = reader.string();
                        break;
                    }
                case 7: {
                        message.order = reader.string();
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
         * Decodes a ListComponentsRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof component_registry.ListComponentsRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {component_registry.ListComponentsRequest} ListComponentsRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ListComponentsRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ListComponentsRequest message.
         * @function verify
         * @memberof component_registry.ListComponentsRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ListComponentsRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.pagination != null && message.hasOwnProperty("pagination")) {
                let error = $root.component_registry.PaginationRequest.verify(message.pagination);
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
                case 3:
                case 4:
                    break;
                }
            if (message.category != null && message.hasOwnProperty("category"))
                switch (message.category) {
                default:
                    return "category: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                    break;
                }
            if (message.author != null && message.hasOwnProperty("author"))
                if (!$util.isString(message.author))
                    return "author: string expected";
            if (message.sort != null && message.hasOwnProperty("sort"))
                if (!$util.isString(message.sort))
                    return "sort: string expected";
            if (message.order != null && message.hasOwnProperty("order"))
                if (!$util.isString(message.order))
                    return "order: string expected";
            return null;
        };

        /**
         * Creates a ListComponentsRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof component_registry.ListComponentsRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {component_registry.ListComponentsRequest} ListComponentsRequest
         */
        ListComponentsRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.component_registry.ListComponentsRequest)
                return object;
            let message = new $root.component_registry.ListComponentsRequest();
            if (object.pagination != null) {
                if (typeof object.pagination !== "object")
                    throw TypeError(".component_registry.ListComponentsRequest.pagination: object expected");
                message.pagination = $root.component_registry.PaginationRequest.fromObject(object.pagination);
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
            case "COMPONENT_STATUS_UNSPECIFIED":
            case 0:
                message.status = 0;
                break;
            case "COMPONENT_STATUS_STABLE":
            case 1:
                message.status = 1;
                break;
            case "COMPONENT_STATUS_BETA":
            case 2:
                message.status = 2;
                break;
            case "COMPONENT_STATUS_ALPHA":
            case 3:
                message.status = 3;
                break;
            case "COMPONENT_STATUS_DEPRECATED":
            case 4:
                message.status = 4;
                break;
            }
            switch (object.category) {
            default:
                if (typeof object.category === "number") {
                    message.category = object.category;
                    break;
                }
                break;
            case "COMPONENT_CATEGORY_UNSPECIFIED":
            case 0:
                message.category = 0;
                break;
            case "COMPONENT_CATEGORY_FORMS":
            case 1:
                message.category = 1;
                break;
            case "COMPONENT_CATEGORY_DATA":
            case 2:
                message.category = 2;
                break;
            case "COMPONENT_CATEGORY_LAYOUT":
            case 3:
                message.category = 3;
                break;
            case "COMPONENT_CATEGORY_FEEDBACK":
            case 4:
                message.category = 4;
                break;
            case "COMPONENT_CATEGORY_NAVIGATION":
            case 5:
                message.category = 5;
                break;
            case "COMPONENT_CATEGORY_OVERLAY":
            case 6:
                message.category = 6;
                break;
            }
            if (object.author != null)
                message.author = String(object.author);
            if (object.sort != null)
                message.sort = String(object.sort);
            if (object.order != null)
                message.order = String(object.order);
            return message;
        };

        /**
         * Creates a plain object from a ListComponentsRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof component_registry.ListComponentsRequest
         * @static
         * @param {component_registry.ListComponentsRequest} message ListComponentsRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ListComponentsRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.pagination = null;
                object.search = "";
                object.status = options.enums === String ? "COMPONENT_STATUS_UNSPECIFIED" : 0;
                object.category = options.enums === String ? "COMPONENT_CATEGORY_UNSPECIFIED" : 0;
                object.author = "";
                object.sort = "";
                object.order = "";
            }
            if (message.pagination != null && message.hasOwnProperty("pagination"))
                object.pagination = $root.component_registry.PaginationRequest.toObject(message.pagination, options);
            if (message.search != null && message.hasOwnProperty("search"))
                object.search = message.search;
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = options.enums === String ? $root.component_registry.ComponentStatus[message.status] === undefined ? message.status : $root.component_registry.ComponentStatus[message.status] : message.status;
            if (message.category != null && message.hasOwnProperty("category"))
                object.category = options.enums === String ? $root.component_registry.ComponentCategory[message.category] === undefined ? message.category : $root.component_registry.ComponentCategory[message.category] : message.category;
            if (message.author != null && message.hasOwnProperty("author"))
                object.author = message.author;
            if (message.sort != null && message.hasOwnProperty("sort"))
                object.sort = message.sort;
            if (message.order != null && message.hasOwnProperty("order"))
                object.order = message.order;
            return object;
        };

        /**
         * Converts this ListComponentsRequest to JSON.
         * @function toJSON
         * @memberof component_registry.ListComponentsRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ListComponentsRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ListComponentsRequest
         * @function getTypeUrl
         * @memberof component_registry.ListComponentsRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ListComponentsRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/component_registry.ListComponentsRequest";
        };

        return ListComponentsRequest;
    })();

    component_registry.ListComponentsResponse = (function() {

        /**
         * Properties of a ListComponentsResponse.
         * @memberof component_registry
         * @interface IListComponentsResponse
         * @property {Array.<component_registry.IComponent>|null} [components] ListComponentsResponse components
         * @property {component_registry.IPaginationResponse|null} [pagination] ListComponentsResponse pagination
         */

        /**
         * Constructs a new ListComponentsResponse.
         * @memberof component_registry
         * @classdesc Represents a ListComponentsResponse.
         * @implements IListComponentsResponse
         * @constructor
         * @param {component_registry.IListComponentsResponse=} [properties] Properties to set
         */
        function ListComponentsResponse(properties) {
            this.components = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ListComponentsResponse components.
         * @member {Array.<component_registry.IComponent>} components
         * @memberof component_registry.ListComponentsResponse
         * @instance
         */
        ListComponentsResponse.prototype.components = $util.emptyArray;

        /**
         * ListComponentsResponse pagination.
         * @member {component_registry.IPaginationResponse|null|undefined} pagination
         * @memberof component_registry.ListComponentsResponse
         * @instance
         */
        ListComponentsResponse.prototype.pagination = null;

        /**
         * Creates a new ListComponentsResponse instance using the specified properties.
         * @function create
         * @memberof component_registry.ListComponentsResponse
         * @static
         * @param {component_registry.IListComponentsResponse=} [properties] Properties to set
         * @returns {component_registry.ListComponentsResponse} ListComponentsResponse instance
         */
        ListComponentsResponse.create = function create(properties) {
            return new ListComponentsResponse(properties);
        };

        /**
         * Encodes the specified ListComponentsResponse message. Does not implicitly {@link component_registry.ListComponentsResponse.verify|verify} messages.
         * @function encode
         * @memberof component_registry.ListComponentsResponse
         * @static
         * @param {component_registry.IListComponentsResponse} message ListComponentsResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ListComponentsResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.components != null && message.components.length)
                for (let i = 0; i < message.components.length; ++i)
                    $root.component_registry.Component.encode(message.components[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.pagination != null && Object.hasOwnProperty.call(message, "pagination"))
                $root.component_registry.PaginationResponse.encode(message.pagination, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified ListComponentsResponse message, length delimited. Does not implicitly {@link component_registry.ListComponentsResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof component_registry.ListComponentsResponse
         * @static
         * @param {component_registry.IListComponentsResponse} message ListComponentsResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ListComponentsResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ListComponentsResponse message from the specified reader or buffer.
         * @function decode
         * @memberof component_registry.ListComponentsResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {component_registry.ListComponentsResponse} ListComponentsResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ListComponentsResponse.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.component_registry.ListComponentsResponse();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.components && message.components.length))
                            message.components = [];
                        message.components.push($root.component_registry.Component.decode(reader, reader.uint32()));
                        break;
                    }
                case 2: {
                        message.pagination = $root.component_registry.PaginationResponse.decode(reader, reader.uint32());
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
         * Decodes a ListComponentsResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof component_registry.ListComponentsResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {component_registry.ListComponentsResponse} ListComponentsResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ListComponentsResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ListComponentsResponse message.
         * @function verify
         * @memberof component_registry.ListComponentsResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ListComponentsResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.components != null && message.hasOwnProperty("components")) {
                if (!Array.isArray(message.components))
                    return "components: array expected";
                for (let i = 0; i < message.components.length; ++i) {
                    let error = $root.component_registry.Component.verify(message.components[i]);
                    if (error)
                        return "components." + error;
                }
            }
            if (message.pagination != null && message.hasOwnProperty("pagination")) {
                let error = $root.component_registry.PaginationResponse.verify(message.pagination);
                if (error)
                    return "pagination." + error;
            }
            return null;
        };

        /**
         * Creates a ListComponentsResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof component_registry.ListComponentsResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {component_registry.ListComponentsResponse} ListComponentsResponse
         */
        ListComponentsResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.component_registry.ListComponentsResponse)
                return object;
            let message = new $root.component_registry.ListComponentsResponse();
            if (object.components) {
                if (!Array.isArray(object.components))
                    throw TypeError(".component_registry.ListComponentsResponse.components: array expected");
                message.components = [];
                for (let i = 0; i < object.components.length; ++i) {
                    if (typeof object.components[i] !== "object")
                        throw TypeError(".component_registry.ListComponentsResponse.components: object expected");
                    message.components[i] = $root.component_registry.Component.fromObject(object.components[i]);
                }
            }
            if (object.pagination != null) {
                if (typeof object.pagination !== "object")
                    throw TypeError(".component_registry.ListComponentsResponse.pagination: object expected");
                message.pagination = $root.component_registry.PaginationResponse.fromObject(object.pagination);
            }
            return message;
        };

        /**
         * Creates a plain object from a ListComponentsResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof component_registry.ListComponentsResponse
         * @static
         * @param {component_registry.ListComponentsResponse} message ListComponentsResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ListComponentsResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.components = [];
            if (options.defaults)
                object.pagination = null;
            if (message.components && message.components.length) {
                object.components = [];
                for (let j = 0; j < message.components.length; ++j)
                    object.components[j] = $root.component_registry.Component.toObject(message.components[j], options);
            }
            if (message.pagination != null && message.hasOwnProperty("pagination"))
                object.pagination = $root.component_registry.PaginationResponse.toObject(message.pagination, options);
            return object;
        };

        /**
         * Converts this ListComponentsResponse to JSON.
         * @function toJSON
         * @memberof component_registry.ListComponentsResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ListComponentsResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ListComponentsResponse
         * @function getTypeUrl
         * @memberof component_registry.ListComponentsResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ListComponentsResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/component_registry.ListComponentsResponse";
        };

        return ListComponentsResponse;
    })();

    component_registry.ComponentStatsResponse = (function() {

        /**
         * Properties of a ComponentStatsResponse.
         * @memberof component_registry
         * @interface IComponentStatsResponse
         * @property {number|null} [totalComponents] ComponentStatsResponse totalComponents
         * @property {number|Long|null} [totalDownloads] ComponentStatsResponse totalDownloads
         * @property {number|null} [activePublishers] ComponentStatsResponse activePublishers
         */

        /**
         * Constructs a new ComponentStatsResponse.
         * @memberof component_registry
         * @classdesc Represents a ComponentStatsResponse.
         * @implements IComponentStatsResponse
         * @constructor
         * @param {component_registry.IComponentStatsResponse=} [properties] Properties to set
         */
        function ComponentStatsResponse(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ComponentStatsResponse totalComponents.
         * @member {number} totalComponents
         * @memberof component_registry.ComponentStatsResponse
         * @instance
         */
        ComponentStatsResponse.prototype.totalComponents = 0;

        /**
         * ComponentStatsResponse totalDownloads.
         * @member {number|Long} totalDownloads
         * @memberof component_registry.ComponentStatsResponse
         * @instance
         */
        ComponentStatsResponse.prototype.totalDownloads = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * ComponentStatsResponse activePublishers.
         * @member {number} activePublishers
         * @memberof component_registry.ComponentStatsResponse
         * @instance
         */
        ComponentStatsResponse.prototype.activePublishers = 0;

        /**
         * Creates a new ComponentStatsResponse instance using the specified properties.
         * @function create
         * @memberof component_registry.ComponentStatsResponse
         * @static
         * @param {component_registry.IComponentStatsResponse=} [properties] Properties to set
         * @returns {component_registry.ComponentStatsResponse} ComponentStatsResponse instance
         */
        ComponentStatsResponse.create = function create(properties) {
            return new ComponentStatsResponse(properties);
        };

        /**
         * Encodes the specified ComponentStatsResponse message. Does not implicitly {@link component_registry.ComponentStatsResponse.verify|verify} messages.
         * @function encode
         * @memberof component_registry.ComponentStatsResponse
         * @static
         * @param {component_registry.IComponentStatsResponse} message ComponentStatsResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ComponentStatsResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.totalComponents != null && Object.hasOwnProperty.call(message, "totalComponents"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.totalComponents);
            if (message.totalDownloads != null && Object.hasOwnProperty.call(message, "totalDownloads"))
                writer.uint32(/* id 2, wireType 0 =*/16).int64(message.totalDownloads);
            if (message.activePublishers != null && Object.hasOwnProperty.call(message, "activePublishers"))
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.activePublishers);
            return writer;
        };

        /**
         * Encodes the specified ComponentStatsResponse message, length delimited. Does not implicitly {@link component_registry.ComponentStatsResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof component_registry.ComponentStatsResponse
         * @static
         * @param {component_registry.IComponentStatsResponse} message ComponentStatsResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ComponentStatsResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ComponentStatsResponse message from the specified reader or buffer.
         * @function decode
         * @memberof component_registry.ComponentStatsResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {component_registry.ComponentStatsResponse} ComponentStatsResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ComponentStatsResponse.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.component_registry.ComponentStatsResponse();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.totalComponents = reader.int32();
                        break;
                    }
                case 2: {
                        message.totalDownloads = reader.int64();
                        break;
                    }
                case 3: {
                        message.activePublishers = reader.int32();
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
         * Decodes a ComponentStatsResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof component_registry.ComponentStatsResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {component_registry.ComponentStatsResponse} ComponentStatsResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ComponentStatsResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ComponentStatsResponse message.
         * @function verify
         * @memberof component_registry.ComponentStatsResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ComponentStatsResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.totalComponents != null && message.hasOwnProperty("totalComponents"))
                if (!$util.isInteger(message.totalComponents))
                    return "totalComponents: integer expected";
            if (message.totalDownloads != null && message.hasOwnProperty("totalDownloads"))
                if (!$util.isInteger(message.totalDownloads) && !(message.totalDownloads && $util.isInteger(message.totalDownloads.low) && $util.isInteger(message.totalDownloads.high)))
                    return "totalDownloads: integer|Long expected";
            if (message.activePublishers != null && message.hasOwnProperty("activePublishers"))
                if (!$util.isInteger(message.activePublishers))
                    return "activePublishers: integer expected";
            return null;
        };

        /**
         * Creates a ComponentStatsResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof component_registry.ComponentStatsResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {component_registry.ComponentStatsResponse} ComponentStatsResponse
         */
        ComponentStatsResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.component_registry.ComponentStatsResponse)
                return object;
            let message = new $root.component_registry.ComponentStatsResponse();
            if (object.totalComponents != null)
                message.totalComponents = object.totalComponents | 0;
            if (object.totalDownloads != null)
                if ($util.Long)
                    (message.totalDownloads = $util.Long.fromValue(object.totalDownloads)).unsigned = false;
                else if (typeof object.totalDownloads === "string")
                    message.totalDownloads = parseInt(object.totalDownloads, 10);
                else if (typeof object.totalDownloads === "number")
                    message.totalDownloads = object.totalDownloads;
                else if (typeof object.totalDownloads === "object")
                    message.totalDownloads = new $util.LongBits(object.totalDownloads.low >>> 0, object.totalDownloads.high >>> 0).toNumber();
            if (object.activePublishers != null)
                message.activePublishers = object.activePublishers | 0;
            return message;
        };

        /**
         * Creates a plain object from a ComponentStatsResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof component_registry.ComponentStatsResponse
         * @static
         * @param {component_registry.ComponentStatsResponse} message ComponentStatsResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ComponentStatsResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.totalComponents = 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.totalDownloads = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.totalDownloads = options.longs === String ? "0" : 0;
                object.activePublishers = 0;
            }
            if (message.totalComponents != null && message.hasOwnProperty("totalComponents"))
                object.totalComponents = message.totalComponents;
            if (message.totalDownloads != null && message.hasOwnProperty("totalDownloads"))
                if (typeof message.totalDownloads === "number")
                    object.totalDownloads = options.longs === String ? String(message.totalDownloads) : message.totalDownloads;
                else
                    object.totalDownloads = options.longs === String ? $util.Long.prototype.toString.call(message.totalDownloads) : options.longs === Number ? new $util.LongBits(message.totalDownloads.low >>> 0, message.totalDownloads.high >>> 0).toNumber() : message.totalDownloads;
            if (message.activePublishers != null && message.hasOwnProperty("activePublishers"))
                object.activePublishers = message.activePublishers;
            return object;
        };

        /**
         * Converts this ComponentStatsResponse to JSON.
         * @function toJSON
         * @memberof component_registry.ComponentStatsResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ComponentStatsResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ComponentStatsResponse
         * @function getTypeUrl
         * @memberof component_registry.ComponentStatsResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ComponentStatsResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/component_registry.ComponentStatsResponse";
        };

        return ComponentStatsResponse;
    })();

    component_registry.Tag = (function() {

        /**
         * Properties of a Tag.
         * @memberof component_registry
         * @interface ITag
         * @property {string|null} [id] Tag id
         * @property {string|null} [name] Tag name
         * @property {string|null} [createdAt] Tag createdAt
         * @property {string|null} [updatedAt] Tag updatedAt
         */

        /**
         * Constructs a new Tag.
         * @memberof component_registry
         * @classdesc Represents a Tag.
         * @implements ITag
         * @constructor
         * @param {component_registry.ITag=} [properties] Properties to set
         */
        function Tag(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Tag id.
         * @member {string} id
         * @memberof component_registry.Tag
         * @instance
         */
        Tag.prototype.id = "";

        /**
         * Tag name.
         * @member {string} name
         * @memberof component_registry.Tag
         * @instance
         */
        Tag.prototype.name = "";

        /**
         * Tag createdAt.
         * @member {string} createdAt
         * @memberof component_registry.Tag
         * @instance
         */
        Tag.prototype.createdAt = "";

        /**
         * Tag updatedAt.
         * @member {string} updatedAt
         * @memberof component_registry.Tag
         * @instance
         */
        Tag.prototype.updatedAt = "";

        /**
         * Creates a new Tag instance using the specified properties.
         * @function create
         * @memberof component_registry.Tag
         * @static
         * @param {component_registry.ITag=} [properties] Properties to set
         * @returns {component_registry.Tag} Tag instance
         */
        Tag.create = function create(properties) {
            return new Tag(properties);
        };

        /**
         * Encodes the specified Tag message. Does not implicitly {@link component_registry.Tag.verify|verify} messages.
         * @function encode
         * @memberof component_registry.Tag
         * @static
         * @param {component_registry.ITag} message Tag message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Tag.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
            if (message.createdAt != null && Object.hasOwnProperty.call(message, "createdAt"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.createdAt);
            if (message.updatedAt != null && Object.hasOwnProperty.call(message, "updatedAt"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.updatedAt);
            return writer;
        };

        /**
         * Encodes the specified Tag message, length delimited. Does not implicitly {@link component_registry.Tag.verify|verify} messages.
         * @function encodeDelimited
         * @memberof component_registry.Tag
         * @static
         * @param {component_registry.ITag} message Tag message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Tag.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Tag message from the specified reader or buffer.
         * @function decode
         * @memberof component_registry.Tag
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {component_registry.Tag} Tag
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Tag.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.component_registry.Tag();
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
                        message.createdAt = reader.string();
                        break;
                    }
                case 4: {
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
         * Decodes a Tag message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof component_registry.Tag
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {component_registry.Tag} Tag
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
         * @memberof component_registry.Tag
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Tag.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                if (!$util.isString(message.createdAt))
                    return "createdAt: string expected";
            if (message.updatedAt != null && message.hasOwnProperty("updatedAt"))
                if (!$util.isString(message.updatedAt))
                    return "updatedAt: string expected";
            return null;
        };

        /**
         * Creates a Tag message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof component_registry.Tag
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {component_registry.Tag} Tag
         */
        Tag.fromObject = function fromObject(object) {
            if (object instanceof $root.component_registry.Tag)
                return object;
            let message = new $root.component_registry.Tag();
            if (object.id != null)
                message.id = String(object.id);
            if (object.name != null)
                message.name = String(object.name);
            if (object.createdAt != null)
                message.createdAt = String(object.createdAt);
            if (object.updatedAt != null)
                message.updatedAt = String(object.updatedAt);
            return message;
        };

        /**
         * Creates a plain object from a Tag message. Also converts values to other types if specified.
         * @function toObject
         * @memberof component_registry.Tag
         * @static
         * @param {component_registry.Tag} message Tag
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Tag.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.id = "";
                object.name = "";
                object.createdAt = "";
                object.updatedAt = "";
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                object.createdAt = message.createdAt;
            if (message.updatedAt != null && message.hasOwnProperty("updatedAt"))
                object.updatedAt = message.updatedAt;
            return object;
        };

        /**
         * Converts this Tag to JSON.
         * @function toJSON
         * @memberof component_registry.Tag
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Tag.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Tag
         * @function getTypeUrl
         * @memberof component_registry.Tag
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Tag.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/component_registry.Tag";
        };

        return Tag;
    })();

    component_registry.TagWithUsage = (function() {

        /**
         * Properties of a TagWithUsage.
         * @memberof component_registry
         * @interface ITagWithUsage
         * @property {string|null} [id] TagWithUsage id
         * @property {string|null} [name] TagWithUsage name
         * @property {number|null} [usageCount] TagWithUsage usageCount
         * @property {string|null} [createdAt] TagWithUsage createdAt
         */

        /**
         * Constructs a new TagWithUsage.
         * @memberof component_registry
         * @classdesc Represents a TagWithUsage.
         * @implements ITagWithUsage
         * @constructor
         * @param {component_registry.ITagWithUsage=} [properties] Properties to set
         */
        function TagWithUsage(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * TagWithUsage id.
         * @member {string} id
         * @memberof component_registry.TagWithUsage
         * @instance
         */
        TagWithUsage.prototype.id = "";

        /**
         * TagWithUsage name.
         * @member {string} name
         * @memberof component_registry.TagWithUsage
         * @instance
         */
        TagWithUsage.prototype.name = "";

        /**
         * TagWithUsage usageCount.
         * @member {number} usageCount
         * @memberof component_registry.TagWithUsage
         * @instance
         */
        TagWithUsage.prototype.usageCount = 0;

        /**
         * TagWithUsage createdAt.
         * @member {string} createdAt
         * @memberof component_registry.TagWithUsage
         * @instance
         */
        TagWithUsage.prototype.createdAt = "";

        /**
         * Creates a new TagWithUsage instance using the specified properties.
         * @function create
         * @memberof component_registry.TagWithUsage
         * @static
         * @param {component_registry.ITagWithUsage=} [properties] Properties to set
         * @returns {component_registry.TagWithUsage} TagWithUsage instance
         */
        TagWithUsage.create = function create(properties) {
            return new TagWithUsage(properties);
        };

        /**
         * Encodes the specified TagWithUsage message. Does not implicitly {@link component_registry.TagWithUsage.verify|verify} messages.
         * @function encode
         * @memberof component_registry.TagWithUsage
         * @static
         * @param {component_registry.ITagWithUsage} message TagWithUsage message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TagWithUsage.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
            if (message.usageCount != null && Object.hasOwnProperty.call(message, "usageCount"))
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.usageCount);
            if (message.createdAt != null && Object.hasOwnProperty.call(message, "createdAt"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.createdAt);
            return writer;
        };

        /**
         * Encodes the specified TagWithUsage message, length delimited. Does not implicitly {@link component_registry.TagWithUsage.verify|verify} messages.
         * @function encodeDelimited
         * @memberof component_registry.TagWithUsage
         * @static
         * @param {component_registry.ITagWithUsage} message TagWithUsage message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TagWithUsage.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a TagWithUsage message from the specified reader or buffer.
         * @function decode
         * @memberof component_registry.TagWithUsage
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {component_registry.TagWithUsage} TagWithUsage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TagWithUsage.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.component_registry.TagWithUsage();
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
                        message.usageCount = reader.int32();
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
         * Decodes a TagWithUsage message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof component_registry.TagWithUsage
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {component_registry.TagWithUsage} TagWithUsage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TagWithUsage.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a TagWithUsage message.
         * @function verify
         * @memberof component_registry.TagWithUsage
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        TagWithUsage.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.usageCount != null && message.hasOwnProperty("usageCount"))
                if (!$util.isInteger(message.usageCount))
                    return "usageCount: integer expected";
            if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                if (!$util.isString(message.createdAt))
                    return "createdAt: string expected";
            return null;
        };

        /**
         * Creates a TagWithUsage message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof component_registry.TagWithUsage
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {component_registry.TagWithUsage} TagWithUsage
         */
        TagWithUsage.fromObject = function fromObject(object) {
            if (object instanceof $root.component_registry.TagWithUsage)
                return object;
            let message = new $root.component_registry.TagWithUsage();
            if (object.id != null)
                message.id = String(object.id);
            if (object.name != null)
                message.name = String(object.name);
            if (object.usageCount != null)
                message.usageCount = object.usageCount | 0;
            if (object.createdAt != null)
                message.createdAt = String(object.createdAt);
            return message;
        };

        /**
         * Creates a plain object from a TagWithUsage message. Also converts values to other types if specified.
         * @function toObject
         * @memberof component_registry.TagWithUsage
         * @static
         * @param {component_registry.TagWithUsage} message TagWithUsage
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        TagWithUsage.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.id = "";
                object.name = "";
                object.usageCount = 0;
                object.createdAt = "";
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.usageCount != null && message.hasOwnProperty("usageCount"))
                object.usageCount = message.usageCount;
            if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                object.createdAt = message.createdAt;
            return object;
        };

        /**
         * Converts this TagWithUsage to JSON.
         * @function toJSON
         * @memberof component_registry.TagWithUsage
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        TagWithUsage.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for TagWithUsage
         * @function getTypeUrl
         * @memberof component_registry.TagWithUsage
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        TagWithUsage.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/component_registry.TagWithUsage";
        };

        return TagWithUsage;
    })();

    component_registry.ListTagsResponse = (function() {

        /**
         * Properties of a ListTagsResponse.
         * @memberof component_registry
         * @interface IListTagsResponse
         * @property {Array.<component_registry.ITagWithUsage>|null} [tags] ListTagsResponse tags
         */

        /**
         * Constructs a new ListTagsResponse.
         * @memberof component_registry
         * @classdesc Represents a ListTagsResponse.
         * @implements IListTagsResponse
         * @constructor
         * @param {component_registry.IListTagsResponse=} [properties] Properties to set
         */
        function ListTagsResponse(properties) {
            this.tags = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ListTagsResponse tags.
         * @member {Array.<component_registry.ITagWithUsage>} tags
         * @memberof component_registry.ListTagsResponse
         * @instance
         */
        ListTagsResponse.prototype.tags = $util.emptyArray;

        /**
         * Creates a new ListTagsResponse instance using the specified properties.
         * @function create
         * @memberof component_registry.ListTagsResponse
         * @static
         * @param {component_registry.IListTagsResponse=} [properties] Properties to set
         * @returns {component_registry.ListTagsResponse} ListTagsResponse instance
         */
        ListTagsResponse.create = function create(properties) {
            return new ListTagsResponse(properties);
        };

        /**
         * Encodes the specified ListTagsResponse message. Does not implicitly {@link component_registry.ListTagsResponse.verify|verify} messages.
         * @function encode
         * @memberof component_registry.ListTagsResponse
         * @static
         * @param {component_registry.IListTagsResponse} message ListTagsResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ListTagsResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.tags != null && message.tags.length)
                for (let i = 0; i < message.tags.length; ++i)
                    $root.component_registry.TagWithUsage.encode(message.tags[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified ListTagsResponse message, length delimited. Does not implicitly {@link component_registry.ListTagsResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof component_registry.ListTagsResponse
         * @static
         * @param {component_registry.IListTagsResponse} message ListTagsResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ListTagsResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ListTagsResponse message from the specified reader or buffer.
         * @function decode
         * @memberof component_registry.ListTagsResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {component_registry.ListTagsResponse} ListTagsResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ListTagsResponse.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.component_registry.ListTagsResponse();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.tags && message.tags.length))
                            message.tags = [];
                        message.tags.push($root.component_registry.TagWithUsage.decode(reader, reader.uint32()));
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
         * Decodes a ListTagsResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof component_registry.ListTagsResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {component_registry.ListTagsResponse} ListTagsResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ListTagsResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ListTagsResponse message.
         * @function verify
         * @memberof component_registry.ListTagsResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ListTagsResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.tags != null && message.hasOwnProperty("tags")) {
                if (!Array.isArray(message.tags))
                    return "tags: array expected";
                for (let i = 0; i < message.tags.length; ++i) {
                    let error = $root.component_registry.TagWithUsage.verify(message.tags[i]);
                    if (error)
                        return "tags." + error;
                }
            }
            return null;
        };

        /**
         * Creates a ListTagsResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof component_registry.ListTagsResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {component_registry.ListTagsResponse} ListTagsResponse
         */
        ListTagsResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.component_registry.ListTagsResponse)
                return object;
            let message = new $root.component_registry.ListTagsResponse();
            if (object.tags) {
                if (!Array.isArray(object.tags))
                    throw TypeError(".component_registry.ListTagsResponse.tags: array expected");
                message.tags = [];
                for (let i = 0; i < object.tags.length; ++i) {
                    if (typeof object.tags[i] !== "object")
                        throw TypeError(".component_registry.ListTagsResponse.tags: object expected");
                    message.tags[i] = $root.component_registry.TagWithUsage.fromObject(object.tags[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a ListTagsResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof component_registry.ListTagsResponse
         * @static
         * @param {component_registry.ListTagsResponse} message ListTagsResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ListTagsResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.tags = [];
            if (message.tags && message.tags.length) {
                object.tags = [];
                for (let j = 0; j < message.tags.length; ++j)
                    object.tags[j] = $root.component_registry.TagWithUsage.toObject(message.tags[j], options);
            }
            return object;
        };

        /**
         * Converts this ListTagsResponse to JSON.
         * @function toJSON
         * @memberof component_registry.ListTagsResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ListTagsResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ListTagsResponse
         * @function getTypeUrl
         * @memberof component_registry.ListTagsResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ListTagsResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/component_registry.ListTagsResponse";
        };

        return ListTagsResponse;
    })();

    component_registry.CreateTagRequest = (function() {

        /**
         * Properties of a CreateTagRequest.
         * @memberof component_registry
         * @interface ICreateTagRequest
         * @property {string|null} [name] CreateTagRequest name
         */

        /**
         * Constructs a new CreateTagRequest.
         * @memberof component_registry
         * @classdesc Represents a CreateTagRequest.
         * @implements ICreateTagRequest
         * @constructor
         * @param {component_registry.ICreateTagRequest=} [properties] Properties to set
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
         * @memberof component_registry.CreateTagRequest
         * @instance
         */
        CreateTagRequest.prototype.name = "";

        /**
         * Creates a new CreateTagRequest instance using the specified properties.
         * @function create
         * @memberof component_registry.CreateTagRequest
         * @static
         * @param {component_registry.ICreateTagRequest=} [properties] Properties to set
         * @returns {component_registry.CreateTagRequest} CreateTagRequest instance
         */
        CreateTagRequest.create = function create(properties) {
            return new CreateTagRequest(properties);
        };

        /**
         * Encodes the specified CreateTagRequest message. Does not implicitly {@link component_registry.CreateTagRequest.verify|verify} messages.
         * @function encode
         * @memberof component_registry.CreateTagRequest
         * @static
         * @param {component_registry.ICreateTagRequest} message CreateTagRequest message or plain object to encode
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
         * Encodes the specified CreateTagRequest message, length delimited. Does not implicitly {@link component_registry.CreateTagRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof component_registry.CreateTagRequest
         * @static
         * @param {component_registry.ICreateTagRequest} message CreateTagRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CreateTagRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a CreateTagRequest message from the specified reader or buffer.
         * @function decode
         * @memberof component_registry.CreateTagRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {component_registry.CreateTagRequest} CreateTagRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CreateTagRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.component_registry.CreateTagRequest();
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
         * @memberof component_registry.CreateTagRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {component_registry.CreateTagRequest} CreateTagRequest
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
         * @memberof component_registry.CreateTagRequest
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
         * @memberof component_registry.CreateTagRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {component_registry.CreateTagRequest} CreateTagRequest
         */
        CreateTagRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.component_registry.CreateTagRequest)
                return object;
            let message = new $root.component_registry.CreateTagRequest();
            if (object.name != null)
                message.name = String(object.name);
            return message;
        };

        /**
         * Creates a plain object from a CreateTagRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof component_registry.CreateTagRequest
         * @static
         * @param {component_registry.CreateTagRequest} message CreateTagRequest
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
         * @memberof component_registry.CreateTagRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CreateTagRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for CreateTagRequest
         * @function getTypeUrl
         * @memberof component_registry.CreateTagRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        CreateTagRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/component_registry.CreateTagRequest";
        };

        return CreateTagRequest;
    })();

    return component_registry;
})();

export { $root as default };
