/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const figma_component_inspector = $root.figma_component_inspector = (() => {

    /**
     * Namespace figma_component_inspector.
     * @exports figma_component_inspector
     * @namespace
     */
    const figma_component_inspector = {};

    figma_component_inspector.Timestamp = (function() {

        /**
         * Properties of a Timestamp.
         * @memberof figma_component_inspector
         * @interface ITimestamp
         * @property {number|Long|null} [seconds] Timestamp seconds
         * @property {number|null} [nanos] Timestamp nanos
         */

        /**
         * Constructs a new Timestamp.
         * @memberof figma_component_inspector
         * @classdesc Represents a Timestamp.
         * @implements ITimestamp
         * @constructor
         * @param {figma_component_inspector.ITimestamp=} [properties] Properties to set
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
         * @memberof figma_component_inspector.Timestamp
         * @instance
         */
        Timestamp.prototype.seconds = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Timestamp nanos.
         * @member {number} nanos
         * @memberof figma_component_inspector.Timestamp
         * @instance
         */
        Timestamp.prototype.nanos = 0;

        /**
         * Creates a new Timestamp instance using the specified properties.
         * @function create
         * @memberof figma_component_inspector.Timestamp
         * @static
         * @param {figma_component_inspector.ITimestamp=} [properties] Properties to set
         * @returns {figma_component_inspector.Timestamp} Timestamp instance
         */
        Timestamp.create = function create(properties) {
            return new Timestamp(properties);
        };

        /**
         * Encodes the specified Timestamp message. Does not implicitly {@link figma_component_inspector.Timestamp.verify|verify} messages.
         * @function encode
         * @memberof figma_component_inspector.Timestamp
         * @static
         * @param {figma_component_inspector.ITimestamp} message Timestamp message or plain object to encode
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
         * Encodes the specified Timestamp message, length delimited. Does not implicitly {@link figma_component_inspector.Timestamp.verify|verify} messages.
         * @function encodeDelimited
         * @memberof figma_component_inspector.Timestamp
         * @static
         * @param {figma_component_inspector.ITimestamp} message Timestamp message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Timestamp.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Timestamp message from the specified reader or buffer.
         * @function decode
         * @memberof figma_component_inspector.Timestamp
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {figma_component_inspector.Timestamp} Timestamp
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Timestamp.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_component_inspector.Timestamp();
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
         * @memberof figma_component_inspector.Timestamp
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {figma_component_inspector.Timestamp} Timestamp
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
         * @memberof figma_component_inspector.Timestamp
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
         * @memberof figma_component_inspector.Timestamp
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {figma_component_inspector.Timestamp} Timestamp
         */
        Timestamp.fromObject = function fromObject(object) {
            if (object instanceof $root.figma_component_inspector.Timestamp)
                return object;
            let message = new $root.figma_component_inspector.Timestamp();
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
         * @memberof figma_component_inspector.Timestamp
         * @static
         * @param {figma_component_inspector.Timestamp} message Timestamp
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
         * @memberof figma_component_inspector.Timestamp
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Timestamp.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Timestamp
         * @function getTypeUrl
         * @memberof figma_component_inspector.Timestamp
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Timestamp.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/figma_component_inspector.Timestamp";
        };

        return Timestamp;
    })();

    figma_component_inspector.PaginationRequest = (function() {

        /**
         * Properties of a PaginationRequest.
         * @memberof figma_component_inspector
         * @interface IPaginationRequest
         * @property {number|null} [page] PaginationRequest page
         * @property {number|null} [pageSize] PaginationRequest pageSize
         */

        /**
         * Constructs a new PaginationRequest.
         * @memberof figma_component_inspector
         * @classdesc Represents a PaginationRequest.
         * @implements IPaginationRequest
         * @constructor
         * @param {figma_component_inspector.IPaginationRequest=} [properties] Properties to set
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
         * @memberof figma_component_inspector.PaginationRequest
         * @instance
         */
        PaginationRequest.prototype.page = 0;

        /**
         * PaginationRequest pageSize.
         * @member {number} pageSize
         * @memberof figma_component_inspector.PaginationRequest
         * @instance
         */
        PaginationRequest.prototype.pageSize = 0;

        /**
         * Creates a new PaginationRequest instance using the specified properties.
         * @function create
         * @memberof figma_component_inspector.PaginationRequest
         * @static
         * @param {figma_component_inspector.IPaginationRequest=} [properties] Properties to set
         * @returns {figma_component_inspector.PaginationRequest} PaginationRequest instance
         */
        PaginationRequest.create = function create(properties) {
            return new PaginationRequest(properties);
        };

        /**
         * Encodes the specified PaginationRequest message. Does not implicitly {@link figma_component_inspector.PaginationRequest.verify|verify} messages.
         * @function encode
         * @memberof figma_component_inspector.PaginationRequest
         * @static
         * @param {figma_component_inspector.IPaginationRequest} message PaginationRequest message or plain object to encode
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
         * Encodes the specified PaginationRequest message, length delimited. Does not implicitly {@link figma_component_inspector.PaginationRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof figma_component_inspector.PaginationRequest
         * @static
         * @param {figma_component_inspector.IPaginationRequest} message PaginationRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PaginationRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PaginationRequest message from the specified reader or buffer.
         * @function decode
         * @memberof figma_component_inspector.PaginationRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {figma_component_inspector.PaginationRequest} PaginationRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PaginationRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_component_inspector.PaginationRequest();
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
         * @memberof figma_component_inspector.PaginationRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {figma_component_inspector.PaginationRequest} PaginationRequest
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
         * @memberof figma_component_inspector.PaginationRequest
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
         * @memberof figma_component_inspector.PaginationRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {figma_component_inspector.PaginationRequest} PaginationRequest
         */
        PaginationRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.figma_component_inspector.PaginationRequest)
                return object;
            let message = new $root.figma_component_inspector.PaginationRequest();
            if (object.page != null)
                message.page = object.page | 0;
            if (object.pageSize != null)
                message.pageSize = object.pageSize | 0;
            return message;
        };

        /**
         * Creates a plain object from a PaginationRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof figma_component_inspector.PaginationRequest
         * @static
         * @param {figma_component_inspector.PaginationRequest} message PaginationRequest
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
         * @memberof figma_component_inspector.PaginationRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PaginationRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PaginationRequest
         * @function getTypeUrl
         * @memberof figma_component_inspector.PaginationRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PaginationRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/figma_component_inspector.PaginationRequest";
        };

        return PaginationRequest;
    })();

    figma_component_inspector.PaginationResponse = (function() {

        /**
         * Properties of a PaginationResponse.
         * @memberof figma_component_inspector
         * @interface IPaginationResponse
         * @property {number|null} [total] PaginationResponse total
         * @property {number|null} [page] PaginationResponse page
         * @property {number|null} [pageSize] PaginationResponse pageSize
         * @property {number|null} [totalPages] PaginationResponse totalPages
         */

        /**
         * Constructs a new PaginationResponse.
         * @memberof figma_component_inspector
         * @classdesc Represents a PaginationResponse.
         * @implements IPaginationResponse
         * @constructor
         * @param {figma_component_inspector.IPaginationResponse=} [properties] Properties to set
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
         * @memberof figma_component_inspector.PaginationResponse
         * @instance
         */
        PaginationResponse.prototype.total = 0;

        /**
         * PaginationResponse page.
         * @member {number} page
         * @memberof figma_component_inspector.PaginationResponse
         * @instance
         */
        PaginationResponse.prototype.page = 0;

        /**
         * PaginationResponse pageSize.
         * @member {number} pageSize
         * @memberof figma_component_inspector.PaginationResponse
         * @instance
         */
        PaginationResponse.prototype.pageSize = 0;

        /**
         * PaginationResponse totalPages.
         * @member {number} totalPages
         * @memberof figma_component_inspector.PaginationResponse
         * @instance
         */
        PaginationResponse.prototype.totalPages = 0;

        /**
         * Creates a new PaginationResponse instance using the specified properties.
         * @function create
         * @memberof figma_component_inspector.PaginationResponse
         * @static
         * @param {figma_component_inspector.IPaginationResponse=} [properties] Properties to set
         * @returns {figma_component_inspector.PaginationResponse} PaginationResponse instance
         */
        PaginationResponse.create = function create(properties) {
            return new PaginationResponse(properties);
        };

        /**
         * Encodes the specified PaginationResponse message. Does not implicitly {@link figma_component_inspector.PaginationResponse.verify|verify} messages.
         * @function encode
         * @memberof figma_component_inspector.PaginationResponse
         * @static
         * @param {figma_component_inspector.IPaginationResponse} message PaginationResponse message or plain object to encode
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
         * Encodes the specified PaginationResponse message, length delimited. Does not implicitly {@link figma_component_inspector.PaginationResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof figma_component_inspector.PaginationResponse
         * @static
         * @param {figma_component_inspector.IPaginationResponse} message PaginationResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PaginationResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PaginationResponse message from the specified reader or buffer.
         * @function decode
         * @memberof figma_component_inspector.PaginationResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {figma_component_inspector.PaginationResponse} PaginationResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PaginationResponse.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_component_inspector.PaginationResponse();
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
         * @memberof figma_component_inspector.PaginationResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {figma_component_inspector.PaginationResponse} PaginationResponse
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
         * @memberof figma_component_inspector.PaginationResponse
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
         * @memberof figma_component_inspector.PaginationResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {figma_component_inspector.PaginationResponse} PaginationResponse
         */
        PaginationResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.figma_component_inspector.PaginationResponse)
                return object;
            let message = new $root.figma_component_inspector.PaginationResponse();
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
         * @memberof figma_component_inspector.PaginationResponse
         * @static
         * @param {figma_component_inspector.PaginationResponse} message PaginationResponse
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
         * @memberof figma_component_inspector.PaginationResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PaginationResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PaginationResponse
         * @function getTypeUrl
         * @memberof figma_component_inspector.PaginationResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PaginationResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/figma_component_inspector.PaginationResponse";
        };

        return PaginationResponse;
    })();

    figma_component_inspector.RGBAColor = (function() {

        /**
         * Properties of a RGBAColor.
         * @memberof figma_component_inspector
         * @interface IRGBAColor
         * @property {number|null} [r] RGBAColor r
         * @property {number|null} [g] RGBAColor g
         * @property {number|null} [b] RGBAColor b
         * @property {number|null} [a] RGBAColor a
         */

        /**
         * Constructs a new RGBAColor.
         * @memberof figma_component_inspector
         * @classdesc Represents a RGBAColor.
         * @implements IRGBAColor
         * @constructor
         * @param {figma_component_inspector.IRGBAColor=} [properties] Properties to set
         */
        function RGBAColor(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * RGBAColor r.
         * @member {number} r
         * @memberof figma_component_inspector.RGBAColor
         * @instance
         */
        RGBAColor.prototype.r = 0;

        /**
         * RGBAColor g.
         * @member {number} g
         * @memberof figma_component_inspector.RGBAColor
         * @instance
         */
        RGBAColor.prototype.g = 0;

        /**
         * RGBAColor b.
         * @member {number} b
         * @memberof figma_component_inspector.RGBAColor
         * @instance
         */
        RGBAColor.prototype.b = 0;

        /**
         * RGBAColor a.
         * @member {number} a
         * @memberof figma_component_inspector.RGBAColor
         * @instance
         */
        RGBAColor.prototype.a = 0;

        /**
         * Creates a new RGBAColor instance using the specified properties.
         * @function create
         * @memberof figma_component_inspector.RGBAColor
         * @static
         * @param {figma_component_inspector.IRGBAColor=} [properties] Properties to set
         * @returns {figma_component_inspector.RGBAColor} RGBAColor instance
         */
        RGBAColor.create = function create(properties) {
            return new RGBAColor(properties);
        };

        /**
         * Encodes the specified RGBAColor message. Does not implicitly {@link figma_component_inspector.RGBAColor.verify|verify} messages.
         * @function encode
         * @memberof figma_component_inspector.RGBAColor
         * @static
         * @param {figma_component_inspector.IRGBAColor} message RGBAColor message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RGBAColor.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.r != null && Object.hasOwnProperty.call(message, "r"))
                writer.uint32(/* id 1, wireType 1 =*/9).double(message.r);
            if (message.g != null && Object.hasOwnProperty.call(message, "g"))
                writer.uint32(/* id 2, wireType 1 =*/17).double(message.g);
            if (message.b != null && Object.hasOwnProperty.call(message, "b"))
                writer.uint32(/* id 3, wireType 1 =*/25).double(message.b);
            if (message.a != null && Object.hasOwnProperty.call(message, "a"))
                writer.uint32(/* id 4, wireType 1 =*/33).double(message.a);
            return writer;
        };

        /**
         * Encodes the specified RGBAColor message, length delimited. Does not implicitly {@link figma_component_inspector.RGBAColor.verify|verify} messages.
         * @function encodeDelimited
         * @memberof figma_component_inspector.RGBAColor
         * @static
         * @param {figma_component_inspector.IRGBAColor} message RGBAColor message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RGBAColor.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a RGBAColor message from the specified reader or buffer.
         * @function decode
         * @memberof figma_component_inspector.RGBAColor
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {figma_component_inspector.RGBAColor} RGBAColor
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RGBAColor.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_component_inspector.RGBAColor();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.r = reader.double();
                        break;
                    }
                case 2: {
                        message.g = reader.double();
                        break;
                    }
                case 3: {
                        message.b = reader.double();
                        break;
                    }
                case 4: {
                        message.a = reader.double();
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
         * Decodes a RGBAColor message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof figma_component_inspector.RGBAColor
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {figma_component_inspector.RGBAColor} RGBAColor
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RGBAColor.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a RGBAColor message.
         * @function verify
         * @memberof figma_component_inspector.RGBAColor
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        RGBAColor.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.r != null && message.hasOwnProperty("r"))
                if (typeof message.r !== "number")
                    return "r: number expected";
            if (message.g != null && message.hasOwnProperty("g"))
                if (typeof message.g !== "number")
                    return "g: number expected";
            if (message.b != null && message.hasOwnProperty("b"))
                if (typeof message.b !== "number")
                    return "b: number expected";
            if (message.a != null && message.hasOwnProperty("a"))
                if (typeof message.a !== "number")
                    return "a: number expected";
            return null;
        };

        /**
         * Creates a RGBAColor message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof figma_component_inspector.RGBAColor
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {figma_component_inspector.RGBAColor} RGBAColor
         */
        RGBAColor.fromObject = function fromObject(object) {
            if (object instanceof $root.figma_component_inspector.RGBAColor)
                return object;
            let message = new $root.figma_component_inspector.RGBAColor();
            if (object.r != null)
                message.r = Number(object.r);
            if (object.g != null)
                message.g = Number(object.g);
            if (object.b != null)
                message.b = Number(object.b);
            if (object.a != null)
                message.a = Number(object.a);
            return message;
        };

        /**
         * Creates a plain object from a RGBAColor message. Also converts values to other types if specified.
         * @function toObject
         * @memberof figma_component_inspector.RGBAColor
         * @static
         * @param {figma_component_inspector.RGBAColor} message RGBAColor
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        RGBAColor.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.r = 0;
                object.g = 0;
                object.b = 0;
                object.a = 0;
            }
            if (message.r != null && message.hasOwnProperty("r"))
                object.r = options.json && !isFinite(message.r) ? String(message.r) : message.r;
            if (message.g != null && message.hasOwnProperty("g"))
                object.g = options.json && !isFinite(message.g) ? String(message.g) : message.g;
            if (message.b != null && message.hasOwnProperty("b"))
                object.b = options.json && !isFinite(message.b) ? String(message.b) : message.b;
            if (message.a != null && message.hasOwnProperty("a"))
                object.a = options.json && !isFinite(message.a) ? String(message.a) : message.a;
            return object;
        };

        /**
         * Converts this RGBAColor to JSON.
         * @function toJSON
         * @memberof figma_component_inspector.RGBAColor
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        RGBAColor.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for RGBAColor
         * @function getTypeUrl
         * @memberof figma_component_inspector.RGBAColor
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        RGBAColor.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/figma_component_inspector.RGBAColor";
        };

        return RGBAColor;
    })();

    figma_component_inspector.BoundingBox = (function() {

        /**
         * Properties of a BoundingBox.
         * @memberof figma_component_inspector
         * @interface IBoundingBox
         * @property {number|null} [x] BoundingBox x
         * @property {number|null} [y] BoundingBox y
         * @property {number|null} [width] BoundingBox width
         * @property {number|null} [height] BoundingBox height
         */

        /**
         * Constructs a new BoundingBox.
         * @memberof figma_component_inspector
         * @classdesc Represents a BoundingBox.
         * @implements IBoundingBox
         * @constructor
         * @param {figma_component_inspector.IBoundingBox=} [properties] Properties to set
         */
        function BoundingBox(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * BoundingBox x.
         * @member {number} x
         * @memberof figma_component_inspector.BoundingBox
         * @instance
         */
        BoundingBox.prototype.x = 0;

        /**
         * BoundingBox y.
         * @member {number} y
         * @memberof figma_component_inspector.BoundingBox
         * @instance
         */
        BoundingBox.prototype.y = 0;

        /**
         * BoundingBox width.
         * @member {number} width
         * @memberof figma_component_inspector.BoundingBox
         * @instance
         */
        BoundingBox.prototype.width = 0;

        /**
         * BoundingBox height.
         * @member {number} height
         * @memberof figma_component_inspector.BoundingBox
         * @instance
         */
        BoundingBox.prototype.height = 0;

        /**
         * Creates a new BoundingBox instance using the specified properties.
         * @function create
         * @memberof figma_component_inspector.BoundingBox
         * @static
         * @param {figma_component_inspector.IBoundingBox=} [properties] Properties to set
         * @returns {figma_component_inspector.BoundingBox} BoundingBox instance
         */
        BoundingBox.create = function create(properties) {
            return new BoundingBox(properties);
        };

        /**
         * Encodes the specified BoundingBox message. Does not implicitly {@link figma_component_inspector.BoundingBox.verify|verify} messages.
         * @function encode
         * @memberof figma_component_inspector.BoundingBox
         * @static
         * @param {figma_component_inspector.IBoundingBox} message BoundingBox message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        BoundingBox.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.x != null && Object.hasOwnProperty.call(message, "x"))
                writer.uint32(/* id 1, wireType 1 =*/9).double(message.x);
            if (message.y != null && Object.hasOwnProperty.call(message, "y"))
                writer.uint32(/* id 2, wireType 1 =*/17).double(message.y);
            if (message.width != null && Object.hasOwnProperty.call(message, "width"))
                writer.uint32(/* id 3, wireType 1 =*/25).double(message.width);
            if (message.height != null && Object.hasOwnProperty.call(message, "height"))
                writer.uint32(/* id 4, wireType 1 =*/33).double(message.height);
            return writer;
        };

        /**
         * Encodes the specified BoundingBox message, length delimited. Does not implicitly {@link figma_component_inspector.BoundingBox.verify|verify} messages.
         * @function encodeDelimited
         * @memberof figma_component_inspector.BoundingBox
         * @static
         * @param {figma_component_inspector.IBoundingBox} message BoundingBox message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        BoundingBox.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a BoundingBox message from the specified reader or buffer.
         * @function decode
         * @memberof figma_component_inspector.BoundingBox
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {figma_component_inspector.BoundingBox} BoundingBox
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        BoundingBox.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_component_inspector.BoundingBox();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.x = reader.double();
                        break;
                    }
                case 2: {
                        message.y = reader.double();
                        break;
                    }
                case 3: {
                        message.width = reader.double();
                        break;
                    }
                case 4: {
                        message.height = reader.double();
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
         * Decodes a BoundingBox message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof figma_component_inspector.BoundingBox
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {figma_component_inspector.BoundingBox} BoundingBox
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        BoundingBox.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a BoundingBox message.
         * @function verify
         * @memberof figma_component_inspector.BoundingBox
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        BoundingBox.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.x != null && message.hasOwnProperty("x"))
                if (typeof message.x !== "number")
                    return "x: number expected";
            if (message.y != null && message.hasOwnProperty("y"))
                if (typeof message.y !== "number")
                    return "y: number expected";
            if (message.width != null && message.hasOwnProperty("width"))
                if (typeof message.width !== "number")
                    return "width: number expected";
            if (message.height != null && message.hasOwnProperty("height"))
                if (typeof message.height !== "number")
                    return "height: number expected";
            return null;
        };

        /**
         * Creates a BoundingBox message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof figma_component_inspector.BoundingBox
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {figma_component_inspector.BoundingBox} BoundingBox
         */
        BoundingBox.fromObject = function fromObject(object) {
            if (object instanceof $root.figma_component_inspector.BoundingBox)
                return object;
            let message = new $root.figma_component_inspector.BoundingBox();
            if (object.x != null)
                message.x = Number(object.x);
            if (object.y != null)
                message.y = Number(object.y);
            if (object.width != null)
                message.width = Number(object.width);
            if (object.height != null)
                message.height = Number(object.height);
            return message;
        };

        /**
         * Creates a plain object from a BoundingBox message. Also converts values to other types if specified.
         * @function toObject
         * @memberof figma_component_inspector.BoundingBox
         * @static
         * @param {figma_component_inspector.BoundingBox} message BoundingBox
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        BoundingBox.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.x = 0;
                object.y = 0;
                object.width = 0;
                object.height = 0;
            }
            if (message.x != null && message.hasOwnProperty("x"))
                object.x = options.json && !isFinite(message.x) ? String(message.x) : message.x;
            if (message.y != null && message.hasOwnProperty("y"))
                object.y = options.json && !isFinite(message.y) ? String(message.y) : message.y;
            if (message.width != null && message.hasOwnProperty("width"))
                object.width = options.json && !isFinite(message.width) ? String(message.width) : message.width;
            if (message.height != null && message.hasOwnProperty("height"))
                object.height = options.json && !isFinite(message.height) ? String(message.height) : message.height;
            return object;
        };

        /**
         * Converts this BoundingBox to JSON.
         * @function toJSON
         * @memberof figma_component_inspector.BoundingBox
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        BoundingBox.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for BoundingBox
         * @function getTypeUrl
         * @memberof figma_component_inspector.BoundingBox
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        BoundingBox.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/figma_component_inspector.BoundingBox";
        };

        return BoundingBox;
    })();

    figma_component_inspector.FigmaNode = (function() {

        /**
         * Properties of a FigmaNode.
         * @memberof figma_component_inspector
         * @interface IFigmaNode
         * @property {string|null} [id] FigmaNode id
         * @property {string|null} [name] FigmaNode name
         * @property {string|null} [type] FigmaNode type
         * @property {boolean|null} [visible] FigmaNode visible
         * @property {figma_component_inspector.IBoundingBox|null} [absoluteBoundingBox] FigmaNode absoluteBoundingBox
         * @property {Array.<figma_component_inspector.IFigmaNode>|null} [children] FigmaNode children
         * @property {Object.<string,string>|null} [styles] FigmaNode styles
         * @property {figma_component_inspector.IRGBAColor|null} [backgroundColor] FigmaNode backgroundColor
         */

        /**
         * Constructs a new FigmaNode.
         * @memberof figma_component_inspector
         * @classdesc Represents a FigmaNode.
         * @implements IFigmaNode
         * @constructor
         * @param {figma_component_inspector.IFigmaNode=} [properties] Properties to set
         */
        function FigmaNode(properties) {
            this.children = [];
            this.styles = {};
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * FigmaNode id.
         * @member {string} id
         * @memberof figma_component_inspector.FigmaNode
         * @instance
         */
        FigmaNode.prototype.id = "";

        /**
         * FigmaNode name.
         * @member {string} name
         * @memberof figma_component_inspector.FigmaNode
         * @instance
         */
        FigmaNode.prototype.name = "";

        /**
         * FigmaNode type.
         * @member {string} type
         * @memberof figma_component_inspector.FigmaNode
         * @instance
         */
        FigmaNode.prototype.type = "";

        /**
         * FigmaNode visible.
         * @member {boolean|null|undefined} visible
         * @memberof figma_component_inspector.FigmaNode
         * @instance
         */
        FigmaNode.prototype.visible = null;

        /**
         * FigmaNode absoluteBoundingBox.
         * @member {figma_component_inspector.IBoundingBox|null|undefined} absoluteBoundingBox
         * @memberof figma_component_inspector.FigmaNode
         * @instance
         */
        FigmaNode.prototype.absoluteBoundingBox = null;

        /**
         * FigmaNode children.
         * @member {Array.<figma_component_inspector.IFigmaNode>} children
         * @memberof figma_component_inspector.FigmaNode
         * @instance
         */
        FigmaNode.prototype.children = $util.emptyArray;

        /**
         * FigmaNode styles.
         * @member {Object.<string,string>} styles
         * @memberof figma_component_inspector.FigmaNode
         * @instance
         */
        FigmaNode.prototype.styles = $util.emptyObject;

        /**
         * FigmaNode backgroundColor.
         * @member {figma_component_inspector.IRGBAColor|null|undefined} backgroundColor
         * @memberof figma_component_inspector.FigmaNode
         * @instance
         */
        FigmaNode.prototype.backgroundColor = null;

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(FigmaNode.prototype, "_visible", {
            get: $util.oneOfGetter($oneOfFields = ["visible"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(FigmaNode.prototype, "_absoluteBoundingBox", {
            get: $util.oneOfGetter($oneOfFields = ["absoluteBoundingBox"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(FigmaNode.prototype, "_backgroundColor", {
            get: $util.oneOfGetter($oneOfFields = ["backgroundColor"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new FigmaNode instance using the specified properties.
         * @function create
         * @memberof figma_component_inspector.FigmaNode
         * @static
         * @param {figma_component_inspector.IFigmaNode=} [properties] Properties to set
         * @returns {figma_component_inspector.FigmaNode} FigmaNode instance
         */
        FigmaNode.create = function create(properties) {
            return new FigmaNode(properties);
        };

        /**
         * Encodes the specified FigmaNode message. Does not implicitly {@link figma_component_inspector.FigmaNode.verify|verify} messages.
         * @function encode
         * @memberof figma_component_inspector.FigmaNode
         * @static
         * @param {figma_component_inspector.IFigmaNode} message FigmaNode message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FigmaNode.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
            if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.type);
            if (message.visible != null && Object.hasOwnProperty.call(message, "visible"))
                writer.uint32(/* id 4, wireType 0 =*/32).bool(message.visible);
            if (message.absoluteBoundingBox != null && Object.hasOwnProperty.call(message, "absoluteBoundingBox"))
                $root.figma_component_inspector.BoundingBox.encode(message.absoluteBoundingBox, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
            if (message.children != null && message.children.length)
                for (let i = 0; i < message.children.length; ++i)
                    $root.figma_component_inspector.FigmaNode.encode(message.children[i], writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
            if (message.styles != null && Object.hasOwnProperty.call(message, "styles"))
                for (let keys = Object.keys(message.styles), i = 0; i < keys.length; ++i)
                    writer.uint32(/* id 7, wireType 2 =*/58).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]).uint32(/* id 2, wireType 2 =*/18).string(message.styles[keys[i]]).ldelim();
            if (message.backgroundColor != null && Object.hasOwnProperty.call(message, "backgroundColor"))
                $root.figma_component_inspector.RGBAColor.encode(message.backgroundColor, writer.uint32(/* id 8, wireType 2 =*/66).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified FigmaNode message, length delimited. Does not implicitly {@link figma_component_inspector.FigmaNode.verify|verify} messages.
         * @function encodeDelimited
         * @memberof figma_component_inspector.FigmaNode
         * @static
         * @param {figma_component_inspector.IFigmaNode} message FigmaNode message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FigmaNode.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a FigmaNode message from the specified reader or buffer.
         * @function decode
         * @memberof figma_component_inspector.FigmaNode
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {figma_component_inspector.FigmaNode} FigmaNode
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FigmaNode.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_component_inspector.FigmaNode(), key, value;
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
                        message.type = reader.string();
                        break;
                    }
                case 4: {
                        message.visible = reader.bool();
                        break;
                    }
                case 5: {
                        message.absoluteBoundingBox = $root.figma_component_inspector.BoundingBox.decode(reader, reader.uint32());
                        break;
                    }
                case 6: {
                        if (!(message.children && message.children.length))
                            message.children = [];
                        message.children.push($root.figma_component_inspector.FigmaNode.decode(reader, reader.uint32()));
                        break;
                    }
                case 7: {
                        if (message.styles === $util.emptyObject)
                            message.styles = {};
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
                        message.styles[key] = value;
                        break;
                    }
                case 8: {
                        message.backgroundColor = $root.figma_component_inspector.RGBAColor.decode(reader, reader.uint32());
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
         * Decodes a FigmaNode message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof figma_component_inspector.FigmaNode
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {figma_component_inspector.FigmaNode} FigmaNode
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FigmaNode.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a FigmaNode message.
         * @function verify
         * @memberof figma_component_inspector.FigmaNode
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        FigmaNode.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.type != null && message.hasOwnProperty("type"))
                if (!$util.isString(message.type))
                    return "type: string expected";
            if (message.visible != null && message.hasOwnProperty("visible")) {
                properties._visible = 1;
                if (typeof message.visible !== "boolean")
                    return "visible: boolean expected";
            }
            if (message.absoluteBoundingBox != null && message.hasOwnProperty("absoluteBoundingBox")) {
                properties._absoluteBoundingBox = 1;
                {
                    let error = $root.figma_component_inspector.BoundingBox.verify(message.absoluteBoundingBox);
                    if (error)
                        return "absoluteBoundingBox." + error;
                }
            }
            if (message.children != null && message.hasOwnProperty("children")) {
                if (!Array.isArray(message.children))
                    return "children: array expected";
                for (let i = 0; i < message.children.length; ++i) {
                    let error = $root.figma_component_inspector.FigmaNode.verify(message.children[i]);
                    if (error)
                        return "children." + error;
                }
            }
            if (message.styles != null && message.hasOwnProperty("styles")) {
                if (!$util.isObject(message.styles))
                    return "styles: object expected";
                let key = Object.keys(message.styles);
                for (let i = 0; i < key.length; ++i)
                    if (!$util.isString(message.styles[key[i]]))
                        return "styles: string{k:string} expected";
            }
            if (message.backgroundColor != null && message.hasOwnProperty("backgroundColor")) {
                properties._backgroundColor = 1;
                {
                    let error = $root.figma_component_inspector.RGBAColor.verify(message.backgroundColor);
                    if (error)
                        return "backgroundColor." + error;
                }
            }
            return null;
        };

        /**
         * Creates a FigmaNode message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof figma_component_inspector.FigmaNode
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {figma_component_inspector.FigmaNode} FigmaNode
         */
        FigmaNode.fromObject = function fromObject(object) {
            if (object instanceof $root.figma_component_inspector.FigmaNode)
                return object;
            let message = new $root.figma_component_inspector.FigmaNode();
            if (object.id != null)
                message.id = String(object.id);
            if (object.name != null)
                message.name = String(object.name);
            if (object.type != null)
                message.type = String(object.type);
            if (object.visible != null)
                message.visible = Boolean(object.visible);
            if (object.absoluteBoundingBox != null) {
                if (typeof object.absoluteBoundingBox !== "object")
                    throw TypeError(".figma_component_inspector.FigmaNode.absoluteBoundingBox: object expected");
                message.absoluteBoundingBox = $root.figma_component_inspector.BoundingBox.fromObject(object.absoluteBoundingBox);
            }
            if (object.children) {
                if (!Array.isArray(object.children))
                    throw TypeError(".figma_component_inspector.FigmaNode.children: array expected");
                message.children = [];
                for (let i = 0; i < object.children.length; ++i) {
                    if (typeof object.children[i] !== "object")
                        throw TypeError(".figma_component_inspector.FigmaNode.children: object expected");
                    message.children[i] = $root.figma_component_inspector.FigmaNode.fromObject(object.children[i]);
                }
            }
            if (object.styles) {
                if (typeof object.styles !== "object")
                    throw TypeError(".figma_component_inspector.FigmaNode.styles: object expected");
                message.styles = {};
                for (let keys = Object.keys(object.styles), i = 0; i < keys.length; ++i)
                    message.styles[keys[i]] = String(object.styles[keys[i]]);
            }
            if (object.backgroundColor != null) {
                if (typeof object.backgroundColor !== "object")
                    throw TypeError(".figma_component_inspector.FigmaNode.backgroundColor: object expected");
                message.backgroundColor = $root.figma_component_inspector.RGBAColor.fromObject(object.backgroundColor);
            }
            return message;
        };

        /**
         * Creates a plain object from a FigmaNode message. Also converts values to other types if specified.
         * @function toObject
         * @memberof figma_component_inspector.FigmaNode
         * @static
         * @param {figma_component_inspector.FigmaNode} message FigmaNode
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        FigmaNode.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.children = [];
            if (options.objects || options.defaults)
                object.styles = {};
            if (options.defaults) {
                object.id = "";
                object.name = "";
                object.type = "";
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.type != null && message.hasOwnProperty("type"))
                object.type = message.type;
            if (message.visible != null && message.hasOwnProperty("visible")) {
                object.visible = message.visible;
                if (options.oneofs)
                    object._visible = "visible";
            }
            if (message.absoluteBoundingBox != null && message.hasOwnProperty("absoluteBoundingBox")) {
                object.absoluteBoundingBox = $root.figma_component_inspector.BoundingBox.toObject(message.absoluteBoundingBox, options);
                if (options.oneofs)
                    object._absoluteBoundingBox = "absoluteBoundingBox";
            }
            if (message.children && message.children.length) {
                object.children = [];
                for (let j = 0; j < message.children.length; ++j)
                    object.children[j] = $root.figma_component_inspector.FigmaNode.toObject(message.children[j], options);
            }
            let keys2;
            if (message.styles && (keys2 = Object.keys(message.styles)).length) {
                object.styles = {};
                for (let j = 0; j < keys2.length; ++j)
                    object.styles[keys2[j]] = message.styles[keys2[j]];
            }
            if (message.backgroundColor != null && message.hasOwnProperty("backgroundColor")) {
                object.backgroundColor = $root.figma_component_inspector.RGBAColor.toObject(message.backgroundColor, options);
                if (options.oneofs)
                    object._backgroundColor = "backgroundColor";
            }
            return object;
        };

        /**
         * Converts this FigmaNode to JSON.
         * @function toJSON
         * @memberof figma_component_inspector.FigmaNode
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        FigmaNode.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for FigmaNode
         * @function getTypeUrl
         * @memberof figma_component_inspector.FigmaNode
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        FigmaNode.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/figma_component_inspector.FigmaNode";
        };

        return FigmaNode;
    })();

    figma_component_inspector.FigmaComponent = (function() {

        /**
         * Properties of a FigmaComponent.
         * @memberof figma_component_inspector
         * @interface IFigmaComponent
         * @property {string|null} [key] FigmaComponent key
         * @property {string|null} [name] FigmaComponent name
         * @property {string|null} [description] FigmaComponent description
         */

        /**
         * Constructs a new FigmaComponent.
         * @memberof figma_component_inspector
         * @classdesc Represents a FigmaComponent.
         * @implements IFigmaComponent
         * @constructor
         * @param {figma_component_inspector.IFigmaComponent=} [properties] Properties to set
         */
        function FigmaComponent(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * FigmaComponent key.
         * @member {string} key
         * @memberof figma_component_inspector.FigmaComponent
         * @instance
         */
        FigmaComponent.prototype.key = "";

        /**
         * FigmaComponent name.
         * @member {string} name
         * @memberof figma_component_inspector.FigmaComponent
         * @instance
         */
        FigmaComponent.prototype.name = "";

        /**
         * FigmaComponent description.
         * @member {string|null|undefined} description
         * @memberof figma_component_inspector.FigmaComponent
         * @instance
         */
        FigmaComponent.prototype.description = null;

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(FigmaComponent.prototype, "_description", {
            get: $util.oneOfGetter($oneOfFields = ["description"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new FigmaComponent instance using the specified properties.
         * @function create
         * @memberof figma_component_inspector.FigmaComponent
         * @static
         * @param {figma_component_inspector.IFigmaComponent=} [properties] Properties to set
         * @returns {figma_component_inspector.FigmaComponent} FigmaComponent instance
         */
        FigmaComponent.create = function create(properties) {
            return new FigmaComponent(properties);
        };

        /**
         * Encodes the specified FigmaComponent message. Does not implicitly {@link figma_component_inspector.FigmaComponent.verify|verify} messages.
         * @function encode
         * @memberof figma_component_inspector.FigmaComponent
         * @static
         * @param {figma_component_inspector.IFigmaComponent} message FigmaComponent message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FigmaComponent.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.key != null && Object.hasOwnProperty.call(message, "key"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.key);
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.description);
            return writer;
        };

        /**
         * Encodes the specified FigmaComponent message, length delimited. Does not implicitly {@link figma_component_inspector.FigmaComponent.verify|verify} messages.
         * @function encodeDelimited
         * @memberof figma_component_inspector.FigmaComponent
         * @static
         * @param {figma_component_inspector.IFigmaComponent} message FigmaComponent message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FigmaComponent.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a FigmaComponent message from the specified reader or buffer.
         * @function decode
         * @memberof figma_component_inspector.FigmaComponent
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {figma_component_inspector.FigmaComponent} FigmaComponent
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FigmaComponent.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_component_inspector.FigmaComponent();
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
                        message.name = reader.string();
                        break;
                    }
                case 3: {
                        message.description = reader.string();
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
         * Decodes a FigmaComponent message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof figma_component_inspector.FigmaComponent
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {figma_component_inspector.FigmaComponent} FigmaComponent
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FigmaComponent.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a FigmaComponent message.
         * @function verify
         * @memberof figma_component_inspector.FigmaComponent
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        FigmaComponent.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
            if (message.key != null && message.hasOwnProperty("key"))
                if (!$util.isString(message.key))
                    return "key: string expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.description != null && message.hasOwnProperty("description")) {
                properties._description = 1;
                if (!$util.isString(message.description))
                    return "description: string expected";
            }
            return null;
        };

        /**
         * Creates a FigmaComponent message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof figma_component_inspector.FigmaComponent
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {figma_component_inspector.FigmaComponent} FigmaComponent
         */
        FigmaComponent.fromObject = function fromObject(object) {
            if (object instanceof $root.figma_component_inspector.FigmaComponent)
                return object;
            let message = new $root.figma_component_inspector.FigmaComponent();
            if (object.key != null)
                message.key = String(object.key);
            if (object.name != null)
                message.name = String(object.name);
            if (object.description != null)
                message.description = String(object.description);
            return message;
        };

        /**
         * Creates a plain object from a FigmaComponent message. Also converts values to other types if specified.
         * @function toObject
         * @memberof figma_component_inspector.FigmaComponent
         * @static
         * @param {figma_component_inspector.FigmaComponent} message FigmaComponent
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        FigmaComponent.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.key = "";
                object.name = "";
            }
            if (message.key != null && message.hasOwnProperty("key"))
                object.key = message.key;
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.description != null && message.hasOwnProperty("description")) {
                object.description = message.description;
                if (options.oneofs)
                    object._description = "description";
            }
            return object;
        };

        /**
         * Converts this FigmaComponent to JSON.
         * @function toJSON
         * @memberof figma_component_inspector.FigmaComponent
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        FigmaComponent.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for FigmaComponent
         * @function getTypeUrl
         * @memberof figma_component_inspector.FigmaComponent
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        FigmaComponent.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/figma_component_inspector.FigmaComponent";
        };

        return FigmaComponent;
    })();

    figma_component_inspector.FigmaFileResponse = (function() {

        /**
         * Properties of a FigmaFileResponse.
         * @memberof figma_component_inspector
         * @interface IFigmaFileResponse
         * @property {string|null} [name] FigmaFileResponse name
         * @property {string|null} [lastModified] FigmaFileResponse lastModified
         * @property {string|null} [thumbnailUrl] FigmaFileResponse thumbnailUrl
         * @property {string|null} [version] FigmaFileResponse version
         * @property {figma_component_inspector.IFigmaNode|null} [document] FigmaFileResponse document
         * @property {Object.<string,figma_component_inspector.IFigmaComponent>|null} [components] FigmaFileResponse components
         */

        /**
         * Constructs a new FigmaFileResponse.
         * @memberof figma_component_inspector
         * @classdesc Represents a FigmaFileResponse.
         * @implements IFigmaFileResponse
         * @constructor
         * @param {figma_component_inspector.IFigmaFileResponse=} [properties] Properties to set
         */
        function FigmaFileResponse(properties) {
            this.components = {};
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * FigmaFileResponse name.
         * @member {string} name
         * @memberof figma_component_inspector.FigmaFileResponse
         * @instance
         */
        FigmaFileResponse.prototype.name = "";

        /**
         * FigmaFileResponse lastModified.
         * @member {string} lastModified
         * @memberof figma_component_inspector.FigmaFileResponse
         * @instance
         */
        FigmaFileResponse.prototype.lastModified = "";

        /**
         * FigmaFileResponse thumbnailUrl.
         * @member {string|null|undefined} thumbnailUrl
         * @memberof figma_component_inspector.FigmaFileResponse
         * @instance
         */
        FigmaFileResponse.prototype.thumbnailUrl = null;

        /**
         * FigmaFileResponse version.
         * @member {string} version
         * @memberof figma_component_inspector.FigmaFileResponse
         * @instance
         */
        FigmaFileResponse.prototype.version = "";

        /**
         * FigmaFileResponse document.
         * @member {figma_component_inspector.IFigmaNode|null|undefined} document
         * @memberof figma_component_inspector.FigmaFileResponse
         * @instance
         */
        FigmaFileResponse.prototype.document = null;

        /**
         * FigmaFileResponse components.
         * @member {Object.<string,figma_component_inspector.IFigmaComponent>} components
         * @memberof figma_component_inspector.FigmaFileResponse
         * @instance
         */
        FigmaFileResponse.prototype.components = $util.emptyObject;

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(FigmaFileResponse.prototype, "_thumbnailUrl", {
            get: $util.oneOfGetter($oneOfFields = ["thumbnailUrl"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new FigmaFileResponse instance using the specified properties.
         * @function create
         * @memberof figma_component_inspector.FigmaFileResponse
         * @static
         * @param {figma_component_inspector.IFigmaFileResponse=} [properties] Properties to set
         * @returns {figma_component_inspector.FigmaFileResponse} FigmaFileResponse instance
         */
        FigmaFileResponse.create = function create(properties) {
            return new FigmaFileResponse(properties);
        };

        /**
         * Encodes the specified FigmaFileResponse message. Does not implicitly {@link figma_component_inspector.FigmaFileResponse.verify|verify} messages.
         * @function encode
         * @memberof figma_component_inspector.FigmaFileResponse
         * @static
         * @param {figma_component_inspector.IFigmaFileResponse} message FigmaFileResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FigmaFileResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
            if (message.lastModified != null && Object.hasOwnProperty.call(message, "lastModified"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.lastModified);
            if (message.thumbnailUrl != null && Object.hasOwnProperty.call(message, "thumbnailUrl"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.thumbnailUrl);
            if (message.version != null && Object.hasOwnProperty.call(message, "version"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.version);
            if (message.document != null && Object.hasOwnProperty.call(message, "document"))
                $root.figma_component_inspector.FigmaNode.encode(message.document, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
            if (message.components != null && Object.hasOwnProperty.call(message, "components"))
                for (let keys = Object.keys(message.components), i = 0; i < keys.length; ++i) {
                    writer.uint32(/* id 6, wireType 2 =*/50).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                    $root.figma_component_inspector.FigmaComponent.encode(message.components[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
                }
            return writer;
        };

        /**
         * Encodes the specified FigmaFileResponse message, length delimited. Does not implicitly {@link figma_component_inspector.FigmaFileResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof figma_component_inspector.FigmaFileResponse
         * @static
         * @param {figma_component_inspector.IFigmaFileResponse} message FigmaFileResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FigmaFileResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a FigmaFileResponse message from the specified reader or buffer.
         * @function decode
         * @memberof figma_component_inspector.FigmaFileResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {figma_component_inspector.FigmaFileResponse} FigmaFileResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FigmaFileResponse.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_component_inspector.FigmaFileResponse(), key, value;
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
                        message.lastModified = reader.string();
                        break;
                    }
                case 3: {
                        message.thumbnailUrl = reader.string();
                        break;
                    }
                case 4: {
                        message.version = reader.string();
                        break;
                    }
                case 5: {
                        message.document = $root.figma_component_inspector.FigmaNode.decode(reader, reader.uint32());
                        break;
                    }
                case 6: {
                        if (message.components === $util.emptyObject)
                            message.components = {};
                        let end2 = reader.uint32() + reader.pos;
                        key = "";
                        value = null;
                        while (reader.pos < end2) {
                            let tag2 = reader.uint32();
                            switch (tag2 >>> 3) {
                            case 1:
                                key = reader.string();
                                break;
                            case 2:
                                value = $root.figma_component_inspector.FigmaComponent.decode(reader, reader.uint32());
                                break;
                            default:
                                reader.skipType(tag2 & 7);
                                break;
                            }
                        }
                        message.components[key] = value;
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
         * Decodes a FigmaFileResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof figma_component_inspector.FigmaFileResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {figma_component_inspector.FigmaFileResponse} FigmaFileResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FigmaFileResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a FigmaFileResponse message.
         * @function verify
         * @memberof figma_component_inspector.FigmaFileResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        FigmaFileResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.lastModified != null && message.hasOwnProperty("lastModified"))
                if (!$util.isString(message.lastModified))
                    return "lastModified: string expected";
            if (message.thumbnailUrl != null && message.hasOwnProperty("thumbnailUrl")) {
                properties._thumbnailUrl = 1;
                if (!$util.isString(message.thumbnailUrl))
                    return "thumbnailUrl: string expected";
            }
            if (message.version != null && message.hasOwnProperty("version"))
                if (!$util.isString(message.version))
                    return "version: string expected";
            if (message.document != null && message.hasOwnProperty("document")) {
                let error = $root.figma_component_inspector.FigmaNode.verify(message.document);
                if (error)
                    return "document." + error;
            }
            if (message.components != null && message.hasOwnProperty("components")) {
                if (!$util.isObject(message.components))
                    return "components: object expected";
                let key = Object.keys(message.components);
                for (let i = 0; i < key.length; ++i) {
                    let error = $root.figma_component_inspector.FigmaComponent.verify(message.components[key[i]]);
                    if (error)
                        return "components." + error;
                }
            }
            return null;
        };

        /**
         * Creates a FigmaFileResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof figma_component_inspector.FigmaFileResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {figma_component_inspector.FigmaFileResponse} FigmaFileResponse
         */
        FigmaFileResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.figma_component_inspector.FigmaFileResponse)
                return object;
            let message = new $root.figma_component_inspector.FigmaFileResponse();
            if (object.name != null)
                message.name = String(object.name);
            if (object.lastModified != null)
                message.lastModified = String(object.lastModified);
            if (object.thumbnailUrl != null)
                message.thumbnailUrl = String(object.thumbnailUrl);
            if (object.version != null)
                message.version = String(object.version);
            if (object.document != null) {
                if (typeof object.document !== "object")
                    throw TypeError(".figma_component_inspector.FigmaFileResponse.document: object expected");
                message.document = $root.figma_component_inspector.FigmaNode.fromObject(object.document);
            }
            if (object.components) {
                if (typeof object.components !== "object")
                    throw TypeError(".figma_component_inspector.FigmaFileResponse.components: object expected");
                message.components = {};
                for (let keys = Object.keys(object.components), i = 0; i < keys.length; ++i) {
                    if (typeof object.components[keys[i]] !== "object")
                        throw TypeError(".figma_component_inspector.FigmaFileResponse.components: object expected");
                    message.components[keys[i]] = $root.figma_component_inspector.FigmaComponent.fromObject(object.components[keys[i]]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a FigmaFileResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof figma_component_inspector.FigmaFileResponse
         * @static
         * @param {figma_component_inspector.FigmaFileResponse} message FigmaFileResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        FigmaFileResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.objects || options.defaults)
                object.components = {};
            if (options.defaults) {
                object.name = "";
                object.lastModified = "";
                object.version = "";
                object.document = null;
            }
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.lastModified != null && message.hasOwnProperty("lastModified"))
                object.lastModified = message.lastModified;
            if (message.thumbnailUrl != null && message.hasOwnProperty("thumbnailUrl")) {
                object.thumbnailUrl = message.thumbnailUrl;
                if (options.oneofs)
                    object._thumbnailUrl = "thumbnailUrl";
            }
            if (message.version != null && message.hasOwnProperty("version"))
                object.version = message.version;
            if (message.document != null && message.hasOwnProperty("document"))
                object.document = $root.figma_component_inspector.FigmaNode.toObject(message.document, options);
            let keys2;
            if (message.components && (keys2 = Object.keys(message.components)).length) {
                object.components = {};
                for (let j = 0; j < keys2.length; ++j)
                    object.components[keys2[j]] = $root.figma_component_inspector.FigmaComponent.toObject(message.components[keys2[j]], options);
            }
            return object;
        };

        /**
         * Converts this FigmaFileResponse to JSON.
         * @function toJSON
         * @memberof figma_component_inspector.FigmaFileResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        FigmaFileResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for FigmaFileResponse
         * @function getTypeUrl
         * @memberof figma_component_inspector.FigmaFileResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        FigmaFileResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/figma_component_inspector.FigmaFileResponse";
        };

        return FigmaFileResponse;
    })();

    figma_component_inspector.FigmaImagesResponse = (function() {

        /**
         * Properties of a FigmaImagesResponse.
         * @memberof figma_component_inspector
         * @interface IFigmaImagesResponse
         * @property {string|null} [err] FigmaImagesResponse err
         * @property {Object.<string,string>|null} [images] FigmaImagesResponse images
         * @property {number|null} [status] FigmaImagesResponse status
         */

        /**
         * Constructs a new FigmaImagesResponse.
         * @memberof figma_component_inspector
         * @classdesc Represents a FigmaImagesResponse.
         * @implements IFigmaImagesResponse
         * @constructor
         * @param {figma_component_inspector.IFigmaImagesResponse=} [properties] Properties to set
         */
        function FigmaImagesResponse(properties) {
            this.images = {};
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * FigmaImagesResponse err.
         * @member {string|null|undefined} err
         * @memberof figma_component_inspector.FigmaImagesResponse
         * @instance
         */
        FigmaImagesResponse.prototype.err = null;

        /**
         * FigmaImagesResponse images.
         * @member {Object.<string,string>} images
         * @memberof figma_component_inspector.FigmaImagesResponse
         * @instance
         */
        FigmaImagesResponse.prototype.images = $util.emptyObject;

        /**
         * FigmaImagesResponse status.
         * @member {number|null|undefined} status
         * @memberof figma_component_inspector.FigmaImagesResponse
         * @instance
         */
        FigmaImagesResponse.prototype.status = null;

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(FigmaImagesResponse.prototype, "_err", {
            get: $util.oneOfGetter($oneOfFields = ["err"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(FigmaImagesResponse.prototype, "_status", {
            get: $util.oneOfGetter($oneOfFields = ["status"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new FigmaImagesResponse instance using the specified properties.
         * @function create
         * @memberof figma_component_inspector.FigmaImagesResponse
         * @static
         * @param {figma_component_inspector.IFigmaImagesResponse=} [properties] Properties to set
         * @returns {figma_component_inspector.FigmaImagesResponse} FigmaImagesResponse instance
         */
        FigmaImagesResponse.create = function create(properties) {
            return new FigmaImagesResponse(properties);
        };

        /**
         * Encodes the specified FigmaImagesResponse message. Does not implicitly {@link figma_component_inspector.FigmaImagesResponse.verify|verify} messages.
         * @function encode
         * @memberof figma_component_inspector.FigmaImagesResponse
         * @static
         * @param {figma_component_inspector.IFigmaImagesResponse} message FigmaImagesResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FigmaImagesResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.err != null && Object.hasOwnProperty.call(message, "err"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.err);
            if (message.images != null && Object.hasOwnProperty.call(message, "images"))
                for (let keys = Object.keys(message.images), i = 0; i < keys.length; ++i)
                    writer.uint32(/* id 2, wireType 2 =*/18).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]).uint32(/* id 2, wireType 2 =*/18).string(message.images[keys[i]]).ldelim();
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.status);
            return writer;
        };

        /**
         * Encodes the specified FigmaImagesResponse message, length delimited. Does not implicitly {@link figma_component_inspector.FigmaImagesResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof figma_component_inspector.FigmaImagesResponse
         * @static
         * @param {figma_component_inspector.IFigmaImagesResponse} message FigmaImagesResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FigmaImagesResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a FigmaImagesResponse message from the specified reader or buffer.
         * @function decode
         * @memberof figma_component_inspector.FigmaImagesResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {figma_component_inspector.FigmaImagesResponse} FigmaImagesResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FigmaImagesResponse.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_component_inspector.FigmaImagesResponse(), key, value;
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.err = reader.string();
                        break;
                    }
                case 2: {
                        if (message.images === $util.emptyObject)
                            message.images = {};
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
                        message.images[key] = value;
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
         * Decodes a FigmaImagesResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof figma_component_inspector.FigmaImagesResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {figma_component_inspector.FigmaImagesResponse} FigmaImagesResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FigmaImagesResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a FigmaImagesResponse message.
         * @function verify
         * @memberof figma_component_inspector.FigmaImagesResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        FigmaImagesResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
            if (message.err != null && message.hasOwnProperty("err")) {
                properties._err = 1;
                if (!$util.isString(message.err))
                    return "err: string expected";
            }
            if (message.images != null && message.hasOwnProperty("images")) {
                if (!$util.isObject(message.images))
                    return "images: object expected";
                let key = Object.keys(message.images);
                for (let i = 0; i < key.length; ++i)
                    if (!$util.isString(message.images[key[i]]))
                        return "images: string{k:string} expected";
            }
            if (message.status != null && message.hasOwnProperty("status")) {
                properties._status = 1;
                if (!$util.isInteger(message.status))
                    return "status: integer expected";
            }
            return null;
        };

        /**
         * Creates a FigmaImagesResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof figma_component_inspector.FigmaImagesResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {figma_component_inspector.FigmaImagesResponse} FigmaImagesResponse
         */
        FigmaImagesResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.figma_component_inspector.FigmaImagesResponse)
                return object;
            let message = new $root.figma_component_inspector.FigmaImagesResponse();
            if (object.err != null)
                message.err = String(object.err);
            if (object.images) {
                if (typeof object.images !== "object")
                    throw TypeError(".figma_component_inspector.FigmaImagesResponse.images: object expected");
                message.images = {};
                for (let keys = Object.keys(object.images), i = 0; i < keys.length; ++i)
                    message.images[keys[i]] = String(object.images[keys[i]]);
            }
            if (object.status != null)
                message.status = object.status | 0;
            return message;
        };

        /**
         * Creates a plain object from a FigmaImagesResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof figma_component_inspector.FigmaImagesResponse
         * @static
         * @param {figma_component_inspector.FigmaImagesResponse} message FigmaImagesResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        FigmaImagesResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.objects || options.defaults)
                object.images = {};
            if (message.err != null && message.hasOwnProperty("err")) {
                object.err = message.err;
                if (options.oneofs)
                    object._err = "err";
            }
            let keys2;
            if (message.images && (keys2 = Object.keys(message.images)).length) {
                object.images = {};
                for (let j = 0; j < keys2.length; ++j)
                    object.images[keys2[j]] = message.images[keys2[j]];
            }
            if (message.status != null && message.hasOwnProperty("status")) {
                object.status = message.status;
                if (options.oneofs)
                    object._status = "status";
            }
            return object;
        };

        /**
         * Converts this FigmaImagesResponse to JSON.
         * @function toJSON
         * @memberof figma_component_inspector.FigmaImagesResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        FigmaImagesResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for FigmaImagesResponse
         * @function getTypeUrl
         * @memberof figma_component_inspector.FigmaImagesResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        FigmaImagesResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/figma_component_inspector.FigmaImagesResponse";
        };

        return FigmaImagesResponse;
    })();

    figma_component_inspector.DesignVariable = (function() {

        /**
         * Properties of a DesignVariable.
         * @memberof figma_component_inspector
         * @interface IDesignVariable
         * @property {string|null} [name] DesignVariable name
         * @property {string|null} [value] DesignVariable value
         * @property {string|null} [type] DesignVariable type
         * @property {string|null} [collection] DesignVariable collection
         */

        /**
         * Constructs a new DesignVariable.
         * @memberof figma_component_inspector
         * @classdesc Represents a DesignVariable.
         * @implements IDesignVariable
         * @constructor
         * @param {figma_component_inspector.IDesignVariable=} [properties] Properties to set
         */
        function DesignVariable(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * DesignVariable name.
         * @member {string} name
         * @memberof figma_component_inspector.DesignVariable
         * @instance
         */
        DesignVariable.prototype.name = "";

        /**
         * DesignVariable value.
         * @member {string} value
         * @memberof figma_component_inspector.DesignVariable
         * @instance
         */
        DesignVariable.prototype.value = "";

        /**
         * DesignVariable type.
         * @member {string} type
         * @memberof figma_component_inspector.DesignVariable
         * @instance
         */
        DesignVariable.prototype.type = "";

        /**
         * DesignVariable collection.
         * @member {string|null|undefined} collection
         * @memberof figma_component_inspector.DesignVariable
         * @instance
         */
        DesignVariable.prototype.collection = null;

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(DesignVariable.prototype, "_collection", {
            get: $util.oneOfGetter($oneOfFields = ["collection"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new DesignVariable instance using the specified properties.
         * @function create
         * @memberof figma_component_inspector.DesignVariable
         * @static
         * @param {figma_component_inspector.IDesignVariable=} [properties] Properties to set
         * @returns {figma_component_inspector.DesignVariable} DesignVariable instance
         */
        DesignVariable.create = function create(properties) {
            return new DesignVariable(properties);
        };

        /**
         * Encodes the specified DesignVariable message. Does not implicitly {@link figma_component_inspector.DesignVariable.verify|verify} messages.
         * @function encode
         * @memberof figma_component_inspector.DesignVariable
         * @static
         * @param {figma_component_inspector.IDesignVariable} message DesignVariable message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DesignVariable.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
            if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.value);
            if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.type);
            if (message.collection != null && Object.hasOwnProperty.call(message, "collection"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.collection);
            return writer;
        };

        /**
         * Encodes the specified DesignVariable message, length delimited. Does not implicitly {@link figma_component_inspector.DesignVariable.verify|verify} messages.
         * @function encodeDelimited
         * @memberof figma_component_inspector.DesignVariable
         * @static
         * @param {figma_component_inspector.IDesignVariable} message DesignVariable message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DesignVariable.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a DesignVariable message from the specified reader or buffer.
         * @function decode
         * @memberof figma_component_inspector.DesignVariable
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {figma_component_inspector.DesignVariable} DesignVariable
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DesignVariable.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_component_inspector.DesignVariable();
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
                        message.value = reader.string();
                        break;
                    }
                case 3: {
                        message.type = reader.string();
                        break;
                    }
                case 4: {
                        message.collection = reader.string();
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
         * Decodes a DesignVariable message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof figma_component_inspector.DesignVariable
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {figma_component_inspector.DesignVariable} DesignVariable
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DesignVariable.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a DesignVariable message.
         * @function verify
         * @memberof figma_component_inspector.DesignVariable
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        DesignVariable.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.value != null && message.hasOwnProperty("value"))
                if (!$util.isString(message.value))
                    return "value: string expected";
            if (message.type != null && message.hasOwnProperty("type"))
                if (!$util.isString(message.type))
                    return "type: string expected";
            if (message.collection != null && message.hasOwnProperty("collection")) {
                properties._collection = 1;
                if (!$util.isString(message.collection))
                    return "collection: string expected";
            }
            return null;
        };

        /**
         * Creates a DesignVariable message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof figma_component_inspector.DesignVariable
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {figma_component_inspector.DesignVariable} DesignVariable
         */
        DesignVariable.fromObject = function fromObject(object) {
            if (object instanceof $root.figma_component_inspector.DesignVariable)
                return object;
            let message = new $root.figma_component_inspector.DesignVariable();
            if (object.name != null)
                message.name = String(object.name);
            if (object.value != null)
                message.value = String(object.value);
            if (object.type != null)
                message.type = String(object.type);
            if (object.collection != null)
                message.collection = String(object.collection);
            return message;
        };

        /**
         * Creates a plain object from a DesignVariable message. Also converts values to other types if specified.
         * @function toObject
         * @memberof figma_component_inspector.DesignVariable
         * @static
         * @param {figma_component_inspector.DesignVariable} message DesignVariable
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        DesignVariable.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.name = "";
                object.value = "";
                object.type = "";
            }
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.value != null && message.hasOwnProperty("value"))
                object.value = message.value;
            if (message.type != null && message.hasOwnProperty("type"))
                object.type = message.type;
            if (message.collection != null && message.hasOwnProperty("collection")) {
                object.collection = message.collection;
                if (options.oneofs)
                    object._collection = "collection";
            }
            return object;
        };

        /**
         * Converts this DesignVariable to JSON.
         * @function toJSON
         * @memberof figma_component_inspector.DesignVariable
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        DesignVariable.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for DesignVariable
         * @function getTypeUrl
         * @memberof figma_component_inspector.DesignVariable
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        DesignVariable.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/figma_component_inspector.DesignVariable";
        };

        return DesignVariable;
    })();

    figma_component_inspector.ComponentProperty = (function() {

        /**
         * Properties of a ComponentProperty.
         * @memberof figma_component_inspector
         * @interface IComponentProperty
         * @property {string|null} [value] ComponentProperty value
         * @property {string|null} [type] ComponentProperty type
         * @property {string|null} [token] ComponentProperty token
         */

        /**
         * Constructs a new ComponentProperty.
         * @memberof figma_component_inspector
         * @classdesc Represents a ComponentProperty.
         * @implements IComponentProperty
         * @constructor
         * @param {figma_component_inspector.IComponentProperty=} [properties] Properties to set
         */
        function ComponentProperty(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ComponentProperty value.
         * @member {string} value
         * @memberof figma_component_inspector.ComponentProperty
         * @instance
         */
        ComponentProperty.prototype.value = "";

        /**
         * ComponentProperty type.
         * @member {string} type
         * @memberof figma_component_inspector.ComponentProperty
         * @instance
         */
        ComponentProperty.prototype.type = "";

        /**
         * ComponentProperty token.
         * @member {string|null|undefined} token
         * @memberof figma_component_inspector.ComponentProperty
         * @instance
         */
        ComponentProperty.prototype.token = null;

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(ComponentProperty.prototype, "_token", {
            get: $util.oneOfGetter($oneOfFields = ["token"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new ComponentProperty instance using the specified properties.
         * @function create
         * @memberof figma_component_inspector.ComponentProperty
         * @static
         * @param {figma_component_inspector.IComponentProperty=} [properties] Properties to set
         * @returns {figma_component_inspector.ComponentProperty} ComponentProperty instance
         */
        ComponentProperty.create = function create(properties) {
            return new ComponentProperty(properties);
        };

        /**
         * Encodes the specified ComponentProperty message. Does not implicitly {@link figma_component_inspector.ComponentProperty.verify|verify} messages.
         * @function encode
         * @memberof figma_component_inspector.ComponentProperty
         * @static
         * @param {figma_component_inspector.IComponentProperty} message ComponentProperty message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ComponentProperty.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.value);
            if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.type);
            if (message.token != null && Object.hasOwnProperty.call(message, "token"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.token);
            return writer;
        };

        /**
         * Encodes the specified ComponentProperty message, length delimited. Does not implicitly {@link figma_component_inspector.ComponentProperty.verify|verify} messages.
         * @function encodeDelimited
         * @memberof figma_component_inspector.ComponentProperty
         * @static
         * @param {figma_component_inspector.IComponentProperty} message ComponentProperty message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ComponentProperty.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ComponentProperty message from the specified reader or buffer.
         * @function decode
         * @memberof figma_component_inspector.ComponentProperty
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {figma_component_inspector.ComponentProperty} ComponentProperty
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ComponentProperty.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_component_inspector.ComponentProperty();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.value = reader.string();
                        break;
                    }
                case 2: {
                        message.type = reader.string();
                        break;
                    }
                case 3: {
                        message.token = reader.string();
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
         * Decodes a ComponentProperty message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof figma_component_inspector.ComponentProperty
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {figma_component_inspector.ComponentProperty} ComponentProperty
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ComponentProperty.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ComponentProperty message.
         * @function verify
         * @memberof figma_component_inspector.ComponentProperty
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ComponentProperty.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
            if (message.value != null && message.hasOwnProperty("value"))
                if (!$util.isString(message.value))
                    return "value: string expected";
            if (message.type != null && message.hasOwnProperty("type"))
                if (!$util.isString(message.type))
                    return "type: string expected";
            if (message.token != null && message.hasOwnProperty("token")) {
                properties._token = 1;
                if (!$util.isString(message.token))
                    return "token: string expected";
            }
            return null;
        };

        /**
         * Creates a ComponentProperty message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof figma_component_inspector.ComponentProperty
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {figma_component_inspector.ComponentProperty} ComponentProperty
         */
        ComponentProperty.fromObject = function fromObject(object) {
            if (object instanceof $root.figma_component_inspector.ComponentProperty)
                return object;
            let message = new $root.figma_component_inspector.ComponentProperty();
            if (object.value != null)
                message.value = String(object.value);
            if (object.type != null)
                message.type = String(object.type);
            if (object.token != null)
                message.token = String(object.token);
            return message;
        };

        /**
         * Creates a plain object from a ComponentProperty message. Also converts values to other types if specified.
         * @function toObject
         * @memberof figma_component_inspector.ComponentProperty
         * @static
         * @param {figma_component_inspector.ComponentProperty} message ComponentProperty
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ComponentProperty.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.value = "";
                object.type = "";
            }
            if (message.value != null && message.hasOwnProperty("value"))
                object.value = message.value;
            if (message.type != null && message.hasOwnProperty("type"))
                object.type = message.type;
            if (message.token != null && message.hasOwnProperty("token")) {
                object.token = message.token;
                if (options.oneofs)
                    object._token = "token";
            }
            return object;
        };

        /**
         * Converts this ComponentProperty to JSON.
         * @function toJSON
         * @memberof figma_component_inspector.ComponentProperty
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ComponentProperty.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ComponentProperty
         * @function getTypeUrl
         * @memberof figma_component_inspector.ComponentProperty
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ComponentProperty.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/figma_component_inspector.ComponentProperty";
        };

        return ComponentProperty;
    })();

    figma_component_inspector.NodeDetailsResponse = (function() {

        /**
         * Properties of a NodeDetailsResponse.
         * @memberof figma_component_inspector
         * @interface INodeDetailsResponse
         * @property {figma_component_inspector.IFigmaNode|null} [node] NodeDetailsResponse node
         * @property {Object.<string,figma_component_inspector.IComponentProperty>|null} [properties] NodeDetailsResponse properties
         */

        /**
         * Constructs a new NodeDetailsResponse.
         * @memberof figma_component_inspector
         * @classdesc Represents a NodeDetailsResponse.
         * @implements INodeDetailsResponse
         * @constructor
         * @param {figma_component_inspector.INodeDetailsResponse=} [properties] Properties to set
         */
        function NodeDetailsResponse(properties) {
            this.properties = {};
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * NodeDetailsResponse node.
         * @member {figma_component_inspector.IFigmaNode|null|undefined} node
         * @memberof figma_component_inspector.NodeDetailsResponse
         * @instance
         */
        NodeDetailsResponse.prototype.node = null;

        /**
         * NodeDetailsResponse properties.
         * @member {Object.<string,figma_component_inspector.IComponentProperty>} properties
         * @memberof figma_component_inspector.NodeDetailsResponse
         * @instance
         */
        NodeDetailsResponse.prototype.properties = $util.emptyObject;

        /**
         * Creates a new NodeDetailsResponse instance using the specified properties.
         * @function create
         * @memberof figma_component_inspector.NodeDetailsResponse
         * @static
         * @param {figma_component_inspector.INodeDetailsResponse=} [properties] Properties to set
         * @returns {figma_component_inspector.NodeDetailsResponse} NodeDetailsResponse instance
         */
        NodeDetailsResponse.create = function create(properties) {
            return new NodeDetailsResponse(properties);
        };

        /**
         * Encodes the specified NodeDetailsResponse message. Does not implicitly {@link figma_component_inspector.NodeDetailsResponse.verify|verify} messages.
         * @function encode
         * @memberof figma_component_inspector.NodeDetailsResponse
         * @static
         * @param {figma_component_inspector.INodeDetailsResponse} message NodeDetailsResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        NodeDetailsResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.node != null && Object.hasOwnProperty.call(message, "node"))
                $root.figma_component_inspector.FigmaNode.encode(message.node, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.properties != null && Object.hasOwnProperty.call(message, "properties"))
                for (let keys = Object.keys(message.properties), i = 0; i < keys.length; ++i) {
                    writer.uint32(/* id 2, wireType 2 =*/18).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                    $root.figma_component_inspector.ComponentProperty.encode(message.properties[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
                }
            return writer;
        };

        /**
         * Encodes the specified NodeDetailsResponse message, length delimited. Does not implicitly {@link figma_component_inspector.NodeDetailsResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof figma_component_inspector.NodeDetailsResponse
         * @static
         * @param {figma_component_inspector.INodeDetailsResponse} message NodeDetailsResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        NodeDetailsResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a NodeDetailsResponse message from the specified reader or buffer.
         * @function decode
         * @memberof figma_component_inspector.NodeDetailsResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {figma_component_inspector.NodeDetailsResponse} NodeDetailsResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        NodeDetailsResponse.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_component_inspector.NodeDetailsResponse(), key, value;
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.node = $root.figma_component_inspector.FigmaNode.decode(reader, reader.uint32());
                        break;
                    }
                case 2: {
                        if (message.properties === $util.emptyObject)
                            message.properties = {};
                        let end2 = reader.uint32() + reader.pos;
                        key = "";
                        value = null;
                        while (reader.pos < end2) {
                            let tag2 = reader.uint32();
                            switch (tag2 >>> 3) {
                            case 1:
                                key = reader.string();
                                break;
                            case 2:
                                value = $root.figma_component_inspector.ComponentProperty.decode(reader, reader.uint32());
                                break;
                            default:
                                reader.skipType(tag2 & 7);
                                break;
                            }
                        }
                        message.properties[key] = value;
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
         * Decodes a NodeDetailsResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof figma_component_inspector.NodeDetailsResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {figma_component_inspector.NodeDetailsResponse} NodeDetailsResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        NodeDetailsResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a NodeDetailsResponse message.
         * @function verify
         * @memberof figma_component_inspector.NodeDetailsResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        NodeDetailsResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.node != null && message.hasOwnProperty("node")) {
                let error = $root.figma_component_inspector.FigmaNode.verify(message.node);
                if (error)
                    return "node." + error;
            }
            if (message.properties != null && message.hasOwnProperty("properties")) {
                if (!$util.isObject(message.properties))
                    return "properties: object expected";
                let key = Object.keys(message.properties);
                for (let i = 0; i < key.length; ++i) {
                    let error = $root.figma_component_inspector.ComponentProperty.verify(message.properties[key[i]]);
                    if (error)
                        return "properties." + error;
                }
            }
            return null;
        };

        /**
         * Creates a NodeDetailsResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof figma_component_inspector.NodeDetailsResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {figma_component_inspector.NodeDetailsResponse} NodeDetailsResponse
         */
        NodeDetailsResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.figma_component_inspector.NodeDetailsResponse)
                return object;
            let message = new $root.figma_component_inspector.NodeDetailsResponse();
            if (object.node != null) {
                if (typeof object.node !== "object")
                    throw TypeError(".figma_component_inspector.NodeDetailsResponse.node: object expected");
                message.node = $root.figma_component_inspector.FigmaNode.fromObject(object.node);
            }
            if (object.properties) {
                if (typeof object.properties !== "object")
                    throw TypeError(".figma_component_inspector.NodeDetailsResponse.properties: object expected");
                message.properties = {};
                for (let keys = Object.keys(object.properties), i = 0; i < keys.length; ++i) {
                    if (typeof object.properties[keys[i]] !== "object")
                        throw TypeError(".figma_component_inspector.NodeDetailsResponse.properties: object expected");
                    message.properties[keys[i]] = $root.figma_component_inspector.ComponentProperty.fromObject(object.properties[keys[i]]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a NodeDetailsResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof figma_component_inspector.NodeDetailsResponse
         * @static
         * @param {figma_component_inspector.NodeDetailsResponse} message NodeDetailsResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        NodeDetailsResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.objects || options.defaults)
                object.properties = {};
            if (options.defaults)
                object.node = null;
            if (message.node != null && message.hasOwnProperty("node"))
                object.node = $root.figma_component_inspector.FigmaNode.toObject(message.node, options);
            let keys2;
            if (message.properties && (keys2 = Object.keys(message.properties)).length) {
                object.properties = {};
                for (let j = 0; j < keys2.length; ++j)
                    object.properties[keys2[j]] = $root.figma_component_inspector.ComponentProperty.toObject(message.properties[keys2[j]], options);
            }
            return object;
        };

        /**
         * Converts this NodeDetailsResponse to JSON.
         * @function toJSON
         * @memberof figma_component_inspector.NodeDetailsResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        NodeDetailsResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for NodeDetailsResponse
         * @function getTypeUrl
         * @memberof figma_component_inspector.NodeDetailsResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        NodeDetailsResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/figma_component_inspector.NodeDetailsResponse";
        };

        return NodeDetailsResponse;
    })();

    figma_component_inspector.ApiResponse = (function() {

        /**
         * Properties of an ApiResponse.
         * @memberof figma_component_inspector
         * @interface IApiResponse
         * @property {boolean|null} [success] ApiResponse success
         * @property {figma_component_inspector.IFigmaFileResponse|null} [fileResponse] ApiResponse fileResponse
         * @property {figma_component_inspector.IFigmaImagesResponse|null} [imagesResponse] ApiResponse imagesResponse
         * @property {figma_component_inspector.INodeDetailsResponse|null} [nodeResponse] ApiResponse nodeResponse
         * @property {string|null} [error] ApiResponse error
         * @property {string|null} [message] ApiResponse message
         * @property {number|null} [statusCode] ApiResponse statusCode
         */

        /**
         * Constructs a new ApiResponse.
         * @memberof figma_component_inspector
         * @classdesc Represents an ApiResponse.
         * @implements IApiResponse
         * @constructor
         * @param {figma_component_inspector.IApiResponse=} [properties] Properties to set
         */
        function ApiResponse(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ApiResponse success.
         * @member {boolean} success
         * @memberof figma_component_inspector.ApiResponse
         * @instance
         */
        ApiResponse.prototype.success = false;

        /**
         * ApiResponse fileResponse.
         * @member {figma_component_inspector.IFigmaFileResponse|null|undefined} fileResponse
         * @memberof figma_component_inspector.ApiResponse
         * @instance
         */
        ApiResponse.prototype.fileResponse = null;

        /**
         * ApiResponse imagesResponse.
         * @member {figma_component_inspector.IFigmaImagesResponse|null|undefined} imagesResponse
         * @memberof figma_component_inspector.ApiResponse
         * @instance
         */
        ApiResponse.prototype.imagesResponse = null;

        /**
         * ApiResponse nodeResponse.
         * @member {figma_component_inspector.INodeDetailsResponse|null|undefined} nodeResponse
         * @memberof figma_component_inspector.ApiResponse
         * @instance
         */
        ApiResponse.prototype.nodeResponse = null;

        /**
         * ApiResponse error.
         * @member {string|null|undefined} error
         * @memberof figma_component_inspector.ApiResponse
         * @instance
         */
        ApiResponse.prototype.error = null;

        /**
         * ApiResponse message.
         * @member {string|null|undefined} message
         * @memberof figma_component_inspector.ApiResponse
         * @instance
         */
        ApiResponse.prototype.message = null;

        /**
         * ApiResponse statusCode.
         * @member {number|null|undefined} statusCode
         * @memberof figma_component_inspector.ApiResponse
         * @instance
         */
        ApiResponse.prototype.statusCode = null;

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

        /**
         * ApiResponse payload.
         * @member {"fileResponse"|"imagesResponse"|"nodeResponse"|undefined} payload
         * @memberof figma_component_inspector.ApiResponse
         * @instance
         */
        Object.defineProperty(ApiResponse.prototype, "payload", {
            get: $util.oneOfGetter($oneOfFields = ["fileResponse", "imagesResponse", "nodeResponse"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(ApiResponse.prototype, "_error", {
            get: $util.oneOfGetter($oneOfFields = ["error"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(ApiResponse.prototype, "_message", {
            get: $util.oneOfGetter($oneOfFields = ["message"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(ApiResponse.prototype, "_statusCode", {
            get: $util.oneOfGetter($oneOfFields = ["statusCode"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new ApiResponse instance using the specified properties.
         * @function create
         * @memberof figma_component_inspector.ApiResponse
         * @static
         * @param {figma_component_inspector.IApiResponse=} [properties] Properties to set
         * @returns {figma_component_inspector.ApiResponse} ApiResponse instance
         */
        ApiResponse.create = function create(properties) {
            return new ApiResponse(properties);
        };

        /**
         * Encodes the specified ApiResponse message. Does not implicitly {@link figma_component_inspector.ApiResponse.verify|verify} messages.
         * @function encode
         * @memberof figma_component_inspector.ApiResponse
         * @static
         * @param {figma_component_inspector.IApiResponse} message ApiResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ApiResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.success != null && Object.hasOwnProperty.call(message, "success"))
                writer.uint32(/* id 1, wireType 0 =*/8).bool(message.success);
            if (message.fileResponse != null && Object.hasOwnProperty.call(message, "fileResponse"))
                $root.figma_component_inspector.FigmaFileResponse.encode(message.fileResponse, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.imagesResponse != null && Object.hasOwnProperty.call(message, "imagesResponse"))
                $root.figma_component_inspector.FigmaImagesResponse.encode(message.imagesResponse, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            if (message.nodeResponse != null && Object.hasOwnProperty.call(message, "nodeResponse"))
                $root.figma_component_inspector.NodeDetailsResponse.encode(message.nodeResponse, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            if (message.error != null && Object.hasOwnProperty.call(message, "error"))
                writer.uint32(/* id 10, wireType 2 =*/82).string(message.error);
            if (message.message != null && Object.hasOwnProperty.call(message, "message"))
                writer.uint32(/* id 11, wireType 2 =*/90).string(message.message);
            if (message.statusCode != null && Object.hasOwnProperty.call(message, "statusCode"))
                writer.uint32(/* id 12, wireType 0 =*/96).int32(message.statusCode);
            return writer;
        };

        /**
         * Encodes the specified ApiResponse message, length delimited. Does not implicitly {@link figma_component_inspector.ApiResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof figma_component_inspector.ApiResponse
         * @static
         * @param {figma_component_inspector.IApiResponse} message ApiResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ApiResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an ApiResponse message from the specified reader or buffer.
         * @function decode
         * @memberof figma_component_inspector.ApiResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {figma_component_inspector.ApiResponse} ApiResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ApiResponse.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.figma_component_inspector.ApiResponse();
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
                        message.fileResponse = $root.figma_component_inspector.FigmaFileResponse.decode(reader, reader.uint32());
                        break;
                    }
                case 3: {
                        message.imagesResponse = $root.figma_component_inspector.FigmaImagesResponse.decode(reader, reader.uint32());
                        break;
                    }
                case 4: {
                        message.nodeResponse = $root.figma_component_inspector.NodeDetailsResponse.decode(reader, reader.uint32());
                        break;
                    }
                case 10: {
                        message.error = reader.string();
                        break;
                    }
                case 11: {
                        message.message = reader.string();
                        break;
                    }
                case 12: {
                        message.statusCode = reader.int32();
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
         * Decodes an ApiResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof figma_component_inspector.ApiResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {figma_component_inspector.ApiResponse} ApiResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ApiResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an ApiResponse message.
         * @function verify
         * @memberof figma_component_inspector.ApiResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ApiResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
            if (message.success != null && message.hasOwnProperty("success"))
                if (typeof message.success !== "boolean")
                    return "success: boolean expected";
            if (message.fileResponse != null && message.hasOwnProperty("fileResponse")) {
                properties.payload = 1;
                {
                    let error = $root.figma_component_inspector.FigmaFileResponse.verify(message.fileResponse);
                    if (error)
                        return "fileResponse." + error;
                }
            }
            if (message.imagesResponse != null && message.hasOwnProperty("imagesResponse")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    let error = $root.figma_component_inspector.FigmaImagesResponse.verify(message.imagesResponse);
                    if (error)
                        return "imagesResponse." + error;
                }
            }
            if (message.nodeResponse != null && message.hasOwnProperty("nodeResponse")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    let error = $root.figma_component_inspector.NodeDetailsResponse.verify(message.nodeResponse);
                    if (error)
                        return "nodeResponse." + error;
                }
            }
            if (message.error != null && message.hasOwnProperty("error")) {
                properties._error = 1;
                if (!$util.isString(message.error))
                    return "error: string expected";
            }
            if (message.message != null && message.hasOwnProperty("message")) {
                properties._message = 1;
                if (!$util.isString(message.message))
                    return "message: string expected";
            }
            if (message.statusCode != null && message.hasOwnProperty("statusCode")) {
                properties._statusCode = 1;
                if (!$util.isInteger(message.statusCode))
                    return "statusCode: integer expected";
            }
            return null;
        };

        /**
         * Creates an ApiResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof figma_component_inspector.ApiResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {figma_component_inspector.ApiResponse} ApiResponse
         */
        ApiResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.figma_component_inspector.ApiResponse)
                return object;
            let message = new $root.figma_component_inspector.ApiResponse();
            if (object.success != null)
                message.success = Boolean(object.success);
            if (object.fileResponse != null) {
                if (typeof object.fileResponse !== "object")
                    throw TypeError(".figma_component_inspector.ApiResponse.fileResponse: object expected");
                message.fileResponse = $root.figma_component_inspector.FigmaFileResponse.fromObject(object.fileResponse);
            }
            if (object.imagesResponse != null) {
                if (typeof object.imagesResponse !== "object")
                    throw TypeError(".figma_component_inspector.ApiResponse.imagesResponse: object expected");
                message.imagesResponse = $root.figma_component_inspector.FigmaImagesResponse.fromObject(object.imagesResponse);
            }
            if (object.nodeResponse != null) {
                if (typeof object.nodeResponse !== "object")
                    throw TypeError(".figma_component_inspector.ApiResponse.nodeResponse: object expected");
                message.nodeResponse = $root.figma_component_inspector.NodeDetailsResponse.fromObject(object.nodeResponse);
            }
            if (object.error != null)
                message.error = String(object.error);
            if (object.message != null)
                message.message = String(object.message);
            if (object.statusCode != null)
                message.statusCode = object.statusCode | 0;
            return message;
        };

        /**
         * Creates a plain object from an ApiResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof figma_component_inspector.ApiResponse
         * @static
         * @param {figma_component_inspector.ApiResponse} message ApiResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ApiResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults)
                object.success = false;
            if (message.success != null && message.hasOwnProperty("success"))
                object.success = message.success;
            if (message.fileResponse != null && message.hasOwnProperty("fileResponse")) {
                object.fileResponse = $root.figma_component_inspector.FigmaFileResponse.toObject(message.fileResponse, options);
                if (options.oneofs)
                    object.payload = "fileResponse";
            }
            if (message.imagesResponse != null && message.hasOwnProperty("imagesResponse")) {
                object.imagesResponse = $root.figma_component_inspector.FigmaImagesResponse.toObject(message.imagesResponse, options);
                if (options.oneofs)
                    object.payload = "imagesResponse";
            }
            if (message.nodeResponse != null && message.hasOwnProperty("nodeResponse")) {
                object.nodeResponse = $root.figma_component_inspector.NodeDetailsResponse.toObject(message.nodeResponse, options);
                if (options.oneofs)
                    object.payload = "nodeResponse";
            }
            if (message.error != null && message.hasOwnProperty("error")) {
                object.error = message.error;
                if (options.oneofs)
                    object._error = "error";
            }
            if (message.message != null && message.hasOwnProperty("message")) {
                object.message = message.message;
                if (options.oneofs)
                    object._message = "message";
            }
            if (message.statusCode != null && message.hasOwnProperty("statusCode")) {
                object.statusCode = message.statusCode;
                if (options.oneofs)
                    object._statusCode = "statusCode";
            }
            return object;
        };

        /**
         * Converts this ApiResponse to JSON.
         * @function toJSON
         * @memberof figma_component_inspector.ApiResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ApiResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ApiResponse
         * @function getTypeUrl
         * @memberof figma_component_inspector.ApiResponse
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ApiResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/figma_component_inspector.ApiResponse";
        };

        return ApiResponse;
    })();

    return figma_component_inspector;
})();

export { $root as default };
