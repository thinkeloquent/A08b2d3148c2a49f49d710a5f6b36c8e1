/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const form_builder = $root.form_builder = (() => {

    /**
     * Namespace form_builder.
     * @exports form_builder
     * @namespace
     */
    const form_builder = {};

    form_builder.common = (function() {

        /**
         * Namespace common.
         * @memberof form_builder
         * @namespace
         */
        const common = {};

        /**
         * FormStatus enum.
         * @name form_builder.common.FormStatus
         * @enum {number}
         * @property {number} FORM_STATUS_UNSPECIFIED=0 FORM_STATUS_UNSPECIFIED value
         * @property {number} FORM_STATUS_DRAFT=1 FORM_STATUS_DRAFT value
         * @property {number} FORM_STATUS_PUBLISHED=2 FORM_STATUS_PUBLISHED value
         * @property {number} FORM_STATUS_ARCHIVED=3 FORM_STATUS_ARCHIVED value
         */
        common.FormStatus = (function() {
            const valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "FORM_STATUS_UNSPECIFIED"] = 0;
            values[valuesById[1] = "FORM_STATUS_DRAFT"] = 1;
            values[valuesById[2] = "FORM_STATUS_PUBLISHED"] = 2;
            values[valuesById[3] = "FORM_STATUS_ARCHIVED"] = 3;
            return values;
        })();

        common.PaginationRequest = (function() {

            /**
             * Properties of a PaginationRequest.
             * @memberof form_builder.common
             * @interface IPaginationRequest
             * @property {number|null} [page] PaginationRequest page
             * @property {number|null} [limit] PaginationRequest limit
             */

            /**
             * Constructs a new PaginationRequest.
             * @memberof form_builder.common
             * @classdesc Represents a PaginationRequest.
             * @implements IPaginationRequest
             * @constructor
             * @param {form_builder.common.IPaginationRequest=} [properties] Properties to set
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
             * @memberof form_builder.common.PaginationRequest
             * @instance
             */
            PaginationRequest.prototype.page = 0;

            /**
             * PaginationRequest limit.
             * @member {number} limit
             * @memberof form_builder.common.PaginationRequest
             * @instance
             */
            PaginationRequest.prototype.limit = 0;

            /**
             * Creates a new PaginationRequest instance using the specified properties.
             * @function create
             * @memberof form_builder.common.PaginationRequest
             * @static
             * @param {form_builder.common.IPaginationRequest=} [properties] Properties to set
             * @returns {form_builder.common.PaginationRequest} PaginationRequest instance
             */
            PaginationRequest.create = function create(properties) {
                return new PaginationRequest(properties);
            };

            /**
             * Encodes the specified PaginationRequest message. Does not implicitly {@link form_builder.common.PaginationRequest.verify|verify} messages.
             * @function encode
             * @memberof form_builder.common.PaginationRequest
             * @static
             * @param {form_builder.common.IPaginationRequest} message PaginationRequest message or plain object to encode
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
             * Encodes the specified PaginationRequest message, length delimited. Does not implicitly {@link form_builder.common.PaginationRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof form_builder.common.PaginationRequest
             * @static
             * @param {form_builder.common.IPaginationRequest} message PaginationRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PaginationRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a PaginationRequest message from the specified reader or buffer.
             * @function decode
             * @memberof form_builder.common.PaginationRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {form_builder.common.PaginationRequest} PaginationRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PaginationRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.form_builder.common.PaginationRequest();
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
             * @memberof form_builder.common.PaginationRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {form_builder.common.PaginationRequest} PaginationRequest
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
             * @memberof form_builder.common.PaginationRequest
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
             * @memberof form_builder.common.PaginationRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {form_builder.common.PaginationRequest} PaginationRequest
             */
            PaginationRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.form_builder.common.PaginationRequest)
                    return object;
                let message = new $root.form_builder.common.PaginationRequest();
                if (object.page != null)
                    message.page = object.page | 0;
                if (object.limit != null)
                    message.limit = object.limit | 0;
                return message;
            };

            /**
             * Creates a plain object from a PaginationRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof form_builder.common.PaginationRequest
             * @static
             * @param {form_builder.common.PaginationRequest} message PaginationRequest
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
             * @memberof form_builder.common.PaginationRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            PaginationRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for PaginationRequest
             * @function getTypeUrl
             * @memberof form_builder.common.PaginationRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            PaginationRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/form_builder.common.PaginationRequest";
            };

            return PaginationRequest;
        })();

        common.PaginationResponse = (function() {

            /**
             * Properties of a PaginationResponse.
             * @memberof form_builder.common
             * @interface IPaginationResponse
             * @property {number|null} [page] PaginationResponse page
             * @property {number|null} [limit] PaginationResponse limit
             * @property {number|null} [total] PaginationResponse total
             * @property {number|null} [totalPages] PaginationResponse totalPages
             */

            /**
             * Constructs a new PaginationResponse.
             * @memberof form_builder.common
             * @classdesc Represents a PaginationResponse.
             * @implements IPaginationResponse
             * @constructor
             * @param {form_builder.common.IPaginationResponse=} [properties] Properties to set
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
             * @memberof form_builder.common.PaginationResponse
             * @instance
             */
            PaginationResponse.prototype.page = 0;

            /**
             * PaginationResponse limit.
             * @member {number} limit
             * @memberof form_builder.common.PaginationResponse
             * @instance
             */
            PaginationResponse.prototype.limit = 0;

            /**
             * PaginationResponse total.
             * @member {number} total
             * @memberof form_builder.common.PaginationResponse
             * @instance
             */
            PaginationResponse.prototype.total = 0;

            /**
             * PaginationResponse totalPages.
             * @member {number} totalPages
             * @memberof form_builder.common.PaginationResponse
             * @instance
             */
            PaginationResponse.prototype.totalPages = 0;

            /**
             * Creates a new PaginationResponse instance using the specified properties.
             * @function create
             * @memberof form_builder.common.PaginationResponse
             * @static
             * @param {form_builder.common.IPaginationResponse=} [properties] Properties to set
             * @returns {form_builder.common.PaginationResponse} PaginationResponse instance
             */
            PaginationResponse.create = function create(properties) {
                return new PaginationResponse(properties);
            };

            /**
             * Encodes the specified PaginationResponse message. Does not implicitly {@link form_builder.common.PaginationResponse.verify|verify} messages.
             * @function encode
             * @memberof form_builder.common.PaginationResponse
             * @static
             * @param {form_builder.common.IPaginationResponse} message PaginationResponse message or plain object to encode
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
             * Encodes the specified PaginationResponse message, length delimited. Does not implicitly {@link form_builder.common.PaginationResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof form_builder.common.PaginationResponse
             * @static
             * @param {form_builder.common.IPaginationResponse} message PaginationResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PaginationResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a PaginationResponse message from the specified reader or buffer.
             * @function decode
             * @memberof form_builder.common.PaginationResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {form_builder.common.PaginationResponse} PaginationResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PaginationResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.form_builder.common.PaginationResponse();
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
             * @memberof form_builder.common.PaginationResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {form_builder.common.PaginationResponse} PaginationResponse
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
             * @memberof form_builder.common.PaginationResponse
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
             * @memberof form_builder.common.PaginationResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {form_builder.common.PaginationResponse} PaginationResponse
             */
            PaginationResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.form_builder.common.PaginationResponse)
                    return object;
                let message = new $root.form_builder.common.PaginationResponse();
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
             * @memberof form_builder.common.PaginationResponse
             * @static
             * @param {form_builder.common.PaginationResponse} message PaginationResponse
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
             * @memberof form_builder.common.PaginationResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            PaginationResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for PaginationResponse
             * @function getTypeUrl
             * @memberof form_builder.common.PaginationResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            PaginationResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/form_builder.common.PaginationResponse";
            };

            return PaginationResponse;
        })();

        common.ErrorResponse = (function() {

            /**
             * Properties of an ErrorResponse.
             * @memberof form_builder.common
             * @interface IErrorResponse
             * @property {number|null} [code] ErrorResponse code
             * @property {string|null} [message] ErrorResponse message
             * @property {string|null} [details] ErrorResponse details
             */

            /**
             * Constructs a new ErrorResponse.
             * @memberof form_builder.common
             * @classdesc Represents an ErrorResponse.
             * @implements IErrorResponse
             * @constructor
             * @param {form_builder.common.IErrorResponse=} [properties] Properties to set
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
             * @memberof form_builder.common.ErrorResponse
             * @instance
             */
            ErrorResponse.prototype.code = 0;

            /**
             * ErrorResponse message.
             * @member {string} message
             * @memberof form_builder.common.ErrorResponse
             * @instance
             */
            ErrorResponse.prototype.message = "";

            /**
             * ErrorResponse details.
             * @member {string} details
             * @memberof form_builder.common.ErrorResponse
             * @instance
             */
            ErrorResponse.prototype.details = "";

            /**
             * Creates a new ErrorResponse instance using the specified properties.
             * @function create
             * @memberof form_builder.common.ErrorResponse
             * @static
             * @param {form_builder.common.IErrorResponse=} [properties] Properties to set
             * @returns {form_builder.common.ErrorResponse} ErrorResponse instance
             */
            ErrorResponse.create = function create(properties) {
                return new ErrorResponse(properties);
            };

            /**
             * Encodes the specified ErrorResponse message. Does not implicitly {@link form_builder.common.ErrorResponse.verify|verify} messages.
             * @function encode
             * @memberof form_builder.common.ErrorResponse
             * @static
             * @param {form_builder.common.IErrorResponse} message ErrorResponse message or plain object to encode
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
             * Encodes the specified ErrorResponse message, length delimited. Does not implicitly {@link form_builder.common.ErrorResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof form_builder.common.ErrorResponse
             * @static
             * @param {form_builder.common.IErrorResponse} message ErrorResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ErrorResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an ErrorResponse message from the specified reader or buffer.
             * @function decode
             * @memberof form_builder.common.ErrorResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {form_builder.common.ErrorResponse} ErrorResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ErrorResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.form_builder.common.ErrorResponse();
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
             * @memberof form_builder.common.ErrorResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {form_builder.common.ErrorResponse} ErrorResponse
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
             * @memberof form_builder.common.ErrorResponse
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
             * @memberof form_builder.common.ErrorResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {form_builder.common.ErrorResponse} ErrorResponse
             */
            ErrorResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.form_builder.common.ErrorResponse)
                    return object;
                let message = new $root.form_builder.common.ErrorResponse();
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
             * @memberof form_builder.common.ErrorResponse
             * @static
             * @param {form_builder.common.ErrorResponse} message ErrorResponse
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
             * @memberof form_builder.common.ErrorResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ErrorResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ErrorResponse
             * @function getTypeUrl
             * @memberof form_builder.common.ErrorResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ErrorResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/form_builder.common.ErrorResponse";
            };

            return ErrorResponse;
        })();

        common.Timestamp = (function() {

            /**
             * Properties of a Timestamp.
             * @memberof form_builder.common
             * @interface ITimestamp
             * @property {string|null} [iso8601] Timestamp iso8601
             */

            /**
             * Constructs a new Timestamp.
             * @memberof form_builder.common
             * @classdesc Represents a Timestamp.
             * @implements ITimestamp
             * @constructor
             * @param {form_builder.common.ITimestamp=} [properties] Properties to set
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
             * @memberof form_builder.common.Timestamp
             * @instance
             */
            Timestamp.prototype.iso8601 = "";

            /**
             * Creates a new Timestamp instance using the specified properties.
             * @function create
             * @memberof form_builder.common.Timestamp
             * @static
             * @param {form_builder.common.ITimestamp=} [properties] Properties to set
             * @returns {form_builder.common.Timestamp} Timestamp instance
             */
            Timestamp.create = function create(properties) {
                return new Timestamp(properties);
            };

            /**
             * Encodes the specified Timestamp message. Does not implicitly {@link form_builder.common.Timestamp.verify|verify} messages.
             * @function encode
             * @memberof form_builder.common.Timestamp
             * @static
             * @param {form_builder.common.ITimestamp} message Timestamp message or plain object to encode
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
             * Encodes the specified Timestamp message, length delimited. Does not implicitly {@link form_builder.common.Timestamp.verify|verify} messages.
             * @function encodeDelimited
             * @memberof form_builder.common.Timestamp
             * @static
             * @param {form_builder.common.ITimestamp} message Timestamp message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Timestamp.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Timestamp message from the specified reader or buffer.
             * @function decode
             * @memberof form_builder.common.Timestamp
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {form_builder.common.Timestamp} Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Timestamp.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.form_builder.common.Timestamp();
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
             * @memberof form_builder.common.Timestamp
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {form_builder.common.Timestamp} Timestamp
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
             * @memberof form_builder.common.Timestamp
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
             * @memberof form_builder.common.Timestamp
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {form_builder.common.Timestamp} Timestamp
             */
            Timestamp.fromObject = function fromObject(object) {
                if (object instanceof $root.form_builder.common.Timestamp)
                    return object;
                let message = new $root.form_builder.common.Timestamp();
                if (object.iso8601 != null)
                    message.iso8601 = String(object.iso8601);
                return message;
            };

            /**
             * Creates a plain object from a Timestamp message. Also converts values to other types if specified.
             * @function toObject
             * @memberof form_builder.common.Timestamp
             * @static
             * @param {form_builder.common.Timestamp} message Timestamp
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
             * @memberof form_builder.common.Timestamp
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Timestamp.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Timestamp
             * @function getTypeUrl
             * @memberof form_builder.common.Timestamp
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Timestamp.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/form_builder.common.Timestamp";
            };

            return Timestamp;
        })();

        return common;
    })();

    form_builder.form_definition = (function() {

        /**
         * Namespace form_definition.
         * @memberof form_builder
         * @namespace
         */
        const form_definition = {};

        form_definition.FormDefinition = (function() {

            /**
             * Properties of a FormDefinition.
             * @memberof form_builder.form_definition
             * @interface IFormDefinition
             * @property {string|null} [id] FormDefinition id
             * @property {string|null} [name] FormDefinition name
             * @property {string|null} [description] FormDefinition description
             * @property {string|null} [version] FormDefinition version
             * @property {form_builder.common.FormStatus|null} [status] FormDefinition status
             * @property {Uint8Array|null} [schemaData] FormDefinition schemaData
             * @property {Uint8Array|null} [metadataData] FormDefinition metadataData
             * @property {string|null} [createdBy] FormDefinition createdBy
             * @property {Array.<form_builder.tag.ITag>|null} [tags] FormDefinition tags
             * @property {form_builder.common.ITimestamp|null} [createdAt] FormDefinition createdAt
             * @property {form_builder.common.ITimestamp|null} [updatedAt] FormDefinition updatedAt
             */

            /**
             * Constructs a new FormDefinition.
             * @memberof form_builder.form_definition
             * @classdesc Represents a FormDefinition.
             * @implements IFormDefinition
             * @constructor
             * @param {form_builder.form_definition.IFormDefinition=} [properties] Properties to set
             */
            function FormDefinition(properties) {
                this.tags = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * FormDefinition id.
             * @member {string} id
             * @memberof form_builder.form_definition.FormDefinition
             * @instance
             */
            FormDefinition.prototype.id = "";

            /**
             * FormDefinition name.
             * @member {string} name
             * @memberof form_builder.form_definition.FormDefinition
             * @instance
             */
            FormDefinition.prototype.name = "";

            /**
             * FormDefinition description.
             * @member {string} description
             * @memberof form_builder.form_definition.FormDefinition
             * @instance
             */
            FormDefinition.prototype.description = "";

            /**
             * FormDefinition version.
             * @member {string} version
             * @memberof form_builder.form_definition.FormDefinition
             * @instance
             */
            FormDefinition.prototype.version = "";

            /**
             * FormDefinition status.
             * @member {form_builder.common.FormStatus} status
             * @memberof form_builder.form_definition.FormDefinition
             * @instance
             */
            FormDefinition.prototype.status = 0;

            /**
             * FormDefinition schemaData.
             * @member {Uint8Array} schemaData
             * @memberof form_builder.form_definition.FormDefinition
             * @instance
             */
            FormDefinition.prototype.schemaData = $util.newBuffer([]);

            /**
             * FormDefinition metadataData.
             * @member {Uint8Array} metadataData
             * @memberof form_builder.form_definition.FormDefinition
             * @instance
             */
            FormDefinition.prototype.metadataData = $util.newBuffer([]);

            /**
             * FormDefinition createdBy.
             * @member {string} createdBy
             * @memberof form_builder.form_definition.FormDefinition
             * @instance
             */
            FormDefinition.prototype.createdBy = "";

            /**
             * FormDefinition tags.
             * @member {Array.<form_builder.tag.ITag>} tags
             * @memberof form_builder.form_definition.FormDefinition
             * @instance
             */
            FormDefinition.prototype.tags = $util.emptyArray;

            /**
             * FormDefinition createdAt.
             * @member {form_builder.common.ITimestamp|null|undefined} createdAt
             * @memberof form_builder.form_definition.FormDefinition
             * @instance
             */
            FormDefinition.prototype.createdAt = null;

            /**
             * FormDefinition updatedAt.
             * @member {form_builder.common.ITimestamp|null|undefined} updatedAt
             * @memberof form_builder.form_definition.FormDefinition
             * @instance
             */
            FormDefinition.prototype.updatedAt = null;

            /**
             * Creates a new FormDefinition instance using the specified properties.
             * @function create
             * @memberof form_builder.form_definition.FormDefinition
             * @static
             * @param {form_builder.form_definition.IFormDefinition=} [properties] Properties to set
             * @returns {form_builder.form_definition.FormDefinition} FormDefinition instance
             */
            FormDefinition.create = function create(properties) {
                return new FormDefinition(properties);
            };

            /**
             * Encodes the specified FormDefinition message. Does not implicitly {@link form_builder.form_definition.FormDefinition.verify|verify} messages.
             * @function encode
             * @memberof form_builder.form_definition.FormDefinition
             * @static
             * @param {form_builder.form_definition.IFormDefinition} message FormDefinition message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            FormDefinition.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
                if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
                if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.description);
                if (message.version != null && Object.hasOwnProperty.call(message, "version"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.version);
                if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                    writer.uint32(/* id 5, wireType 0 =*/40).int32(message.status);
                if (message.schemaData != null && Object.hasOwnProperty.call(message, "schemaData"))
                    writer.uint32(/* id 6, wireType 2 =*/50).bytes(message.schemaData);
                if (message.metadataData != null && Object.hasOwnProperty.call(message, "metadataData"))
                    writer.uint32(/* id 7, wireType 2 =*/58).bytes(message.metadataData);
                if (message.createdBy != null && Object.hasOwnProperty.call(message, "createdBy"))
                    writer.uint32(/* id 8, wireType 2 =*/66).string(message.createdBy);
                if (message.tags != null && message.tags.length)
                    for (let i = 0; i < message.tags.length; ++i)
                        $root.form_builder.tag.Tag.encode(message.tags[i], writer.uint32(/* id 9, wireType 2 =*/74).fork()).ldelim();
                if (message.createdAt != null && Object.hasOwnProperty.call(message, "createdAt"))
                    $root.form_builder.common.Timestamp.encode(message.createdAt, writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
                if (message.updatedAt != null && Object.hasOwnProperty.call(message, "updatedAt"))
                    $root.form_builder.common.Timestamp.encode(message.updatedAt, writer.uint32(/* id 11, wireType 2 =*/90).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified FormDefinition message, length delimited. Does not implicitly {@link form_builder.form_definition.FormDefinition.verify|verify} messages.
             * @function encodeDelimited
             * @memberof form_builder.form_definition.FormDefinition
             * @static
             * @param {form_builder.form_definition.IFormDefinition} message FormDefinition message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            FormDefinition.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a FormDefinition message from the specified reader or buffer.
             * @function decode
             * @memberof form_builder.form_definition.FormDefinition
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {form_builder.form_definition.FormDefinition} FormDefinition
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            FormDefinition.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.form_builder.form_definition.FormDefinition();
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
                            message.version = reader.string();
                            break;
                        }
                    case 5: {
                            message.status = reader.int32();
                            break;
                        }
                    case 6: {
                            message.schemaData = reader.bytes();
                            break;
                        }
                    case 7: {
                            message.metadataData = reader.bytes();
                            break;
                        }
                    case 8: {
                            message.createdBy = reader.string();
                            break;
                        }
                    case 9: {
                            if (!(message.tags && message.tags.length))
                                message.tags = [];
                            message.tags.push($root.form_builder.tag.Tag.decode(reader, reader.uint32()));
                            break;
                        }
                    case 10: {
                            message.createdAt = $root.form_builder.common.Timestamp.decode(reader, reader.uint32());
                            break;
                        }
                    case 11: {
                            message.updatedAt = $root.form_builder.common.Timestamp.decode(reader, reader.uint32());
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
             * Decodes a FormDefinition message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof form_builder.form_definition.FormDefinition
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {form_builder.form_definition.FormDefinition} FormDefinition
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            FormDefinition.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a FormDefinition message.
             * @function verify
             * @memberof form_builder.form_definition.FormDefinition
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            FormDefinition.verify = function verify(message) {
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
                if (message.version != null && message.hasOwnProperty("version"))
                    if (!$util.isString(message.version))
                        return "version: string expected";
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
                if (message.schemaData != null && message.hasOwnProperty("schemaData"))
                    if (!(message.schemaData && typeof message.schemaData.length === "number" || $util.isString(message.schemaData)))
                        return "schemaData: buffer expected";
                if (message.metadataData != null && message.hasOwnProperty("metadataData"))
                    if (!(message.metadataData && typeof message.metadataData.length === "number" || $util.isString(message.metadataData)))
                        return "metadataData: buffer expected";
                if (message.createdBy != null && message.hasOwnProperty("createdBy"))
                    if (!$util.isString(message.createdBy))
                        return "createdBy: string expected";
                if (message.tags != null && message.hasOwnProperty("tags")) {
                    if (!Array.isArray(message.tags))
                        return "tags: array expected";
                    for (let i = 0; i < message.tags.length; ++i) {
                        let error = $root.form_builder.tag.Tag.verify(message.tags[i]);
                        if (error)
                            return "tags." + error;
                    }
                }
                if (message.createdAt != null && message.hasOwnProperty("createdAt")) {
                    let error = $root.form_builder.common.Timestamp.verify(message.createdAt);
                    if (error)
                        return "createdAt." + error;
                }
                if (message.updatedAt != null && message.hasOwnProperty("updatedAt")) {
                    let error = $root.form_builder.common.Timestamp.verify(message.updatedAt);
                    if (error)
                        return "updatedAt." + error;
                }
                return null;
            };

            /**
             * Creates a FormDefinition message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof form_builder.form_definition.FormDefinition
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {form_builder.form_definition.FormDefinition} FormDefinition
             */
            FormDefinition.fromObject = function fromObject(object) {
                if (object instanceof $root.form_builder.form_definition.FormDefinition)
                    return object;
                let message = new $root.form_builder.form_definition.FormDefinition();
                if (object.id != null)
                    message.id = String(object.id);
                if (object.name != null)
                    message.name = String(object.name);
                if (object.description != null)
                    message.description = String(object.description);
                if (object.version != null)
                    message.version = String(object.version);
                switch (object.status) {
                default:
                    if (typeof object.status === "number") {
                        message.status = object.status;
                        break;
                    }
                    break;
                case "FORM_STATUS_UNSPECIFIED":
                case 0:
                    message.status = 0;
                    break;
                case "FORM_STATUS_DRAFT":
                case 1:
                    message.status = 1;
                    break;
                case "FORM_STATUS_PUBLISHED":
                case 2:
                    message.status = 2;
                    break;
                case "FORM_STATUS_ARCHIVED":
                case 3:
                    message.status = 3;
                    break;
                }
                if (object.schemaData != null)
                    if (typeof object.schemaData === "string")
                        $util.base64.decode(object.schemaData, message.schemaData = $util.newBuffer($util.base64.length(object.schemaData)), 0);
                    else if (object.schemaData.length >= 0)
                        message.schemaData = object.schemaData;
                if (object.metadataData != null)
                    if (typeof object.metadataData === "string")
                        $util.base64.decode(object.metadataData, message.metadataData = $util.newBuffer($util.base64.length(object.metadataData)), 0);
                    else if (object.metadataData.length >= 0)
                        message.metadataData = object.metadataData;
                if (object.createdBy != null)
                    message.createdBy = String(object.createdBy);
                if (object.tags) {
                    if (!Array.isArray(object.tags))
                        throw TypeError(".form_builder.form_definition.FormDefinition.tags: array expected");
                    message.tags = [];
                    for (let i = 0; i < object.tags.length; ++i) {
                        if (typeof object.tags[i] !== "object")
                            throw TypeError(".form_builder.form_definition.FormDefinition.tags: object expected");
                        message.tags[i] = $root.form_builder.tag.Tag.fromObject(object.tags[i]);
                    }
                }
                if (object.createdAt != null) {
                    if (typeof object.createdAt !== "object")
                        throw TypeError(".form_builder.form_definition.FormDefinition.createdAt: object expected");
                    message.createdAt = $root.form_builder.common.Timestamp.fromObject(object.createdAt);
                }
                if (object.updatedAt != null) {
                    if (typeof object.updatedAt !== "object")
                        throw TypeError(".form_builder.form_definition.FormDefinition.updatedAt: object expected");
                    message.updatedAt = $root.form_builder.common.Timestamp.fromObject(object.updatedAt);
                }
                return message;
            };

            /**
             * Creates a plain object from a FormDefinition message. Also converts values to other types if specified.
             * @function toObject
             * @memberof form_builder.form_definition.FormDefinition
             * @static
             * @param {form_builder.form_definition.FormDefinition} message FormDefinition
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            FormDefinition.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.arrays || options.defaults)
                    object.tags = [];
                if (options.defaults) {
                    object.id = "";
                    object.name = "";
                    object.description = "";
                    object.version = "";
                    object.status = options.enums === String ? "FORM_STATUS_UNSPECIFIED" : 0;
                    if (options.bytes === String)
                        object.schemaData = "";
                    else {
                        object.schemaData = [];
                        if (options.bytes !== Array)
                            object.schemaData = $util.newBuffer(object.schemaData);
                    }
                    if (options.bytes === String)
                        object.metadataData = "";
                    else {
                        object.metadataData = [];
                        if (options.bytes !== Array)
                            object.metadataData = $util.newBuffer(object.metadataData);
                    }
                    object.createdBy = "";
                    object.createdAt = null;
                    object.updatedAt = null;
                }
                if (message.id != null && message.hasOwnProperty("id"))
                    object.id = message.id;
                if (message.name != null && message.hasOwnProperty("name"))
                    object.name = message.name;
                if (message.description != null && message.hasOwnProperty("description"))
                    object.description = message.description;
                if (message.version != null && message.hasOwnProperty("version"))
                    object.version = message.version;
                if (message.status != null && message.hasOwnProperty("status"))
                    object.status = options.enums === String ? $root.form_builder.common.FormStatus[message.status] === undefined ? message.status : $root.form_builder.common.FormStatus[message.status] : message.status;
                if (message.schemaData != null && message.hasOwnProperty("schemaData"))
                    object.schemaData = options.bytes === String ? $util.base64.encode(message.schemaData, 0, message.schemaData.length) : options.bytes === Array ? Array.prototype.slice.call(message.schemaData) : message.schemaData;
                if (message.metadataData != null && message.hasOwnProperty("metadataData"))
                    object.metadataData = options.bytes === String ? $util.base64.encode(message.metadataData, 0, message.metadataData.length) : options.bytes === Array ? Array.prototype.slice.call(message.metadataData) : message.metadataData;
                if (message.createdBy != null && message.hasOwnProperty("createdBy"))
                    object.createdBy = message.createdBy;
                if (message.tags && message.tags.length) {
                    object.tags = [];
                    for (let j = 0; j < message.tags.length; ++j)
                        object.tags[j] = $root.form_builder.tag.Tag.toObject(message.tags[j], options);
                }
                if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                    object.createdAt = $root.form_builder.common.Timestamp.toObject(message.createdAt, options);
                if (message.updatedAt != null && message.hasOwnProperty("updatedAt"))
                    object.updatedAt = $root.form_builder.common.Timestamp.toObject(message.updatedAt, options);
                return object;
            };

            /**
             * Converts this FormDefinition to JSON.
             * @function toJSON
             * @memberof form_builder.form_definition.FormDefinition
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            FormDefinition.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for FormDefinition
             * @function getTypeUrl
             * @memberof form_builder.form_definition.FormDefinition
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            FormDefinition.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/form_builder.form_definition.FormDefinition";
            };

            return FormDefinition;
        })();

        form_definition.FormDefinitionSummary = (function() {

            /**
             * Properties of a FormDefinitionSummary.
             * @memberof form_builder.form_definition
             * @interface IFormDefinitionSummary
             * @property {string|null} [id] FormDefinitionSummary id
             * @property {string|null} [name] FormDefinitionSummary name
             * @property {string|null} [description] FormDefinitionSummary description
             * @property {string|null} [version] FormDefinitionSummary version
             * @property {form_builder.common.FormStatus|null} [status] FormDefinitionSummary status
             * @property {string|null} [createdBy] FormDefinitionSummary createdBy
             * @property {Array.<form_builder.tag.ITag>|null} [tags] FormDefinitionSummary tags
             * @property {number|null} [pageCount] FormDefinitionSummary pageCount
             * @property {number|null} [elementCount] FormDefinitionSummary elementCount
             * @property {form_builder.common.ITimestamp|null} [createdAt] FormDefinitionSummary createdAt
             * @property {form_builder.common.ITimestamp|null} [updatedAt] FormDefinitionSummary updatedAt
             */

            /**
             * Constructs a new FormDefinitionSummary.
             * @memberof form_builder.form_definition
             * @classdesc Represents a FormDefinitionSummary.
             * @implements IFormDefinitionSummary
             * @constructor
             * @param {form_builder.form_definition.IFormDefinitionSummary=} [properties] Properties to set
             */
            function FormDefinitionSummary(properties) {
                this.tags = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * FormDefinitionSummary id.
             * @member {string} id
             * @memberof form_builder.form_definition.FormDefinitionSummary
             * @instance
             */
            FormDefinitionSummary.prototype.id = "";

            /**
             * FormDefinitionSummary name.
             * @member {string} name
             * @memberof form_builder.form_definition.FormDefinitionSummary
             * @instance
             */
            FormDefinitionSummary.prototype.name = "";

            /**
             * FormDefinitionSummary description.
             * @member {string} description
             * @memberof form_builder.form_definition.FormDefinitionSummary
             * @instance
             */
            FormDefinitionSummary.prototype.description = "";

            /**
             * FormDefinitionSummary version.
             * @member {string} version
             * @memberof form_builder.form_definition.FormDefinitionSummary
             * @instance
             */
            FormDefinitionSummary.prototype.version = "";

            /**
             * FormDefinitionSummary status.
             * @member {form_builder.common.FormStatus} status
             * @memberof form_builder.form_definition.FormDefinitionSummary
             * @instance
             */
            FormDefinitionSummary.prototype.status = 0;

            /**
             * FormDefinitionSummary createdBy.
             * @member {string} createdBy
             * @memberof form_builder.form_definition.FormDefinitionSummary
             * @instance
             */
            FormDefinitionSummary.prototype.createdBy = "";

            /**
             * FormDefinitionSummary tags.
             * @member {Array.<form_builder.tag.ITag>} tags
             * @memberof form_builder.form_definition.FormDefinitionSummary
             * @instance
             */
            FormDefinitionSummary.prototype.tags = $util.emptyArray;

            /**
             * FormDefinitionSummary pageCount.
             * @member {number} pageCount
             * @memberof form_builder.form_definition.FormDefinitionSummary
             * @instance
             */
            FormDefinitionSummary.prototype.pageCount = 0;

            /**
             * FormDefinitionSummary elementCount.
             * @member {number} elementCount
             * @memberof form_builder.form_definition.FormDefinitionSummary
             * @instance
             */
            FormDefinitionSummary.prototype.elementCount = 0;

            /**
             * FormDefinitionSummary createdAt.
             * @member {form_builder.common.ITimestamp|null|undefined} createdAt
             * @memberof form_builder.form_definition.FormDefinitionSummary
             * @instance
             */
            FormDefinitionSummary.prototype.createdAt = null;

            /**
             * FormDefinitionSummary updatedAt.
             * @member {form_builder.common.ITimestamp|null|undefined} updatedAt
             * @memberof form_builder.form_definition.FormDefinitionSummary
             * @instance
             */
            FormDefinitionSummary.prototype.updatedAt = null;

            /**
             * Creates a new FormDefinitionSummary instance using the specified properties.
             * @function create
             * @memberof form_builder.form_definition.FormDefinitionSummary
             * @static
             * @param {form_builder.form_definition.IFormDefinitionSummary=} [properties] Properties to set
             * @returns {form_builder.form_definition.FormDefinitionSummary} FormDefinitionSummary instance
             */
            FormDefinitionSummary.create = function create(properties) {
                return new FormDefinitionSummary(properties);
            };

            /**
             * Encodes the specified FormDefinitionSummary message. Does not implicitly {@link form_builder.form_definition.FormDefinitionSummary.verify|verify} messages.
             * @function encode
             * @memberof form_builder.form_definition.FormDefinitionSummary
             * @static
             * @param {form_builder.form_definition.IFormDefinitionSummary} message FormDefinitionSummary message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            FormDefinitionSummary.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
                if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
                if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.description);
                if (message.version != null && Object.hasOwnProperty.call(message, "version"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.version);
                if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                    writer.uint32(/* id 5, wireType 0 =*/40).int32(message.status);
                if (message.createdBy != null && Object.hasOwnProperty.call(message, "createdBy"))
                    writer.uint32(/* id 6, wireType 2 =*/50).string(message.createdBy);
                if (message.tags != null && message.tags.length)
                    for (let i = 0; i < message.tags.length; ++i)
                        $root.form_builder.tag.Tag.encode(message.tags[i], writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
                if (message.pageCount != null && Object.hasOwnProperty.call(message, "pageCount"))
                    writer.uint32(/* id 8, wireType 0 =*/64).int32(message.pageCount);
                if (message.elementCount != null && Object.hasOwnProperty.call(message, "elementCount"))
                    writer.uint32(/* id 9, wireType 0 =*/72).int32(message.elementCount);
                if (message.createdAt != null && Object.hasOwnProperty.call(message, "createdAt"))
                    $root.form_builder.common.Timestamp.encode(message.createdAt, writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
                if (message.updatedAt != null && Object.hasOwnProperty.call(message, "updatedAt"))
                    $root.form_builder.common.Timestamp.encode(message.updatedAt, writer.uint32(/* id 11, wireType 2 =*/90).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified FormDefinitionSummary message, length delimited. Does not implicitly {@link form_builder.form_definition.FormDefinitionSummary.verify|verify} messages.
             * @function encodeDelimited
             * @memberof form_builder.form_definition.FormDefinitionSummary
             * @static
             * @param {form_builder.form_definition.IFormDefinitionSummary} message FormDefinitionSummary message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            FormDefinitionSummary.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a FormDefinitionSummary message from the specified reader or buffer.
             * @function decode
             * @memberof form_builder.form_definition.FormDefinitionSummary
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {form_builder.form_definition.FormDefinitionSummary} FormDefinitionSummary
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            FormDefinitionSummary.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.form_builder.form_definition.FormDefinitionSummary();
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
                            message.version = reader.string();
                            break;
                        }
                    case 5: {
                            message.status = reader.int32();
                            break;
                        }
                    case 6: {
                            message.createdBy = reader.string();
                            break;
                        }
                    case 7: {
                            if (!(message.tags && message.tags.length))
                                message.tags = [];
                            message.tags.push($root.form_builder.tag.Tag.decode(reader, reader.uint32()));
                            break;
                        }
                    case 8: {
                            message.pageCount = reader.int32();
                            break;
                        }
                    case 9: {
                            message.elementCount = reader.int32();
                            break;
                        }
                    case 10: {
                            message.createdAt = $root.form_builder.common.Timestamp.decode(reader, reader.uint32());
                            break;
                        }
                    case 11: {
                            message.updatedAt = $root.form_builder.common.Timestamp.decode(reader, reader.uint32());
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
             * Decodes a FormDefinitionSummary message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof form_builder.form_definition.FormDefinitionSummary
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {form_builder.form_definition.FormDefinitionSummary} FormDefinitionSummary
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            FormDefinitionSummary.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a FormDefinitionSummary message.
             * @function verify
             * @memberof form_builder.form_definition.FormDefinitionSummary
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            FormDefinitionSummary.verify = function verify(message) {
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
                if (message.version != null && message.hasOwnProperty("version"))
                    if (!$util.isString(message.version))
                        return "version: string expected";
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
                if (message.createdBy != null && message.hasOwnProperty("createdBy"))
                    if (!$util.isString(message.createdBy))
                        return "createdBy: string expected";
                if (message.tags != null && message.hasOwnProperty("tags")) {
                    if (!Array.isArray(message.tags))
                        return "tags: array expected";
                    for (let i = 0; i < message.tags.length; ++i) {
                        let error = $root.form_builder.tag.Tag.verify(message.tags[i]);
                        if (error)
                            return "tags." + error;
                    }
                }
                if (message.pageCount != null && message.hasOwnProperty("pageCount"))
                    if (!$util.isInteger(message.pageCount))
                        return "pageCount: integer expected";
                if (message.elementCount != null && message.hasOwnProperty("elementCount"))
                    if (!$util.isInteger(message.elementCount))
                        return "elementCount: integer expected";
                if (message.createdAt != null && message.hasOwnProperty("createdAt")) {
                    let error = $root.form_builder.common.Timestamp.verify(message.createdAt);
                    if (error)
                        return "createdAt." + error;
                }
                if (message.updatedAt != null && message.hasOwnProperty("updatedAt")) {
                    let error = $root.form_builder.common.Timestamp.verify(message.updatedAt);
                    if (error)
                        return "updatedAt." + error;
                }
                return null;
            };

            /**
             * Creates a FormDefinitionSummary message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof form_builder.form_definition.FormDefinitionSummary
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {form_builder.form_definition.FormDefinitionSummary} FormDefinitionSummary
             */
            FormDefinitionSummary.fromObject = function fromObject(object) {
                if (object instanceof $root.form_builder.form_definition.FormDefinitionSummary)
                    return object;
                let message = new $root.form_builder.form_definition.FormDefinitionSummary();
                if (object.id != null)
                    message.id = String(object.id);
                if (object.name != null)
                    message.name = String(object.name);
                if (object.description != null)
                    message.description = String(object.description);
                if (object.version != null)
                    message.version = String(object.version);
                switch (object.status) {
                default:
                    if (typeof object.status === "number") {
                        message.status = object.status;
                        break;
                    }
                    break;
                case "FORM_STATUS_UNSPECIFIED":
                case 0:
                    message.status = 0;
                    break;
                case "FORM_STATUS_DRAFT":
                case 1:
                    message.status = 1;
                    break;
                case "FORM_STATUS_PUBLISHED":
                case 2:
                    message.status = 2;
                    break;
                case "FORM_STATUS_ARCHIVED":
                case 3:
                    message.status = 3;
                    break;
                }
                if (object.createdBy != null)
                    message.createdBy = String(object.createdBy);
                if (object.tags) {
                    if (!Array.isArray(object.tags))
                        throw TypeError(".form_builder.form_definition.FormDefinitionSummary.tags: array expected");
                    message.tags = [];
                    for (let i = 0; i < object.tags.length; ++i) {
                        if (typeof object.tags[i] !== "object")
                            throw TypeError(".form_builder.form_definition.FormDefinitionSummary.tags: object expected");
                        message.tags[i] = $root.form_builder.tag.Tag.fromObject(object.tags[i]);
                    }
                }
                if (object.pageCount != null)
                    message.pageCount = object.pageCount | 0;
                if (object.elementCount != null)
                    message.elementCount = object.elementCount | 0;
                if (object.createdAt != null) {
                    if (typeof object.createdAt !== "object")
                        throw TypeError(".form_builder.form_definition.FormDefinitionSummary.createdAt: object expected");
                    message.createdAt = $root.form_builder.common.Timestamp.fromObject(object.createdAt);
                }
                if (object.updatedAt != null) {
                    if (typeof object.updatedAt !== "object")
                        throw TypeError(".form_builder.form_definition.FormDefinitionSummary.updatedAt: object expected");
                    message.updatedAt = $root.form_builder.common.Timestamp.fromObject(object.updatedAt);
                }
                return message;
            };

            /**
             * Creates a plain object from a FormDefinitionSummary message. Also converts values to other types if specified.
             * @function toObject
             * @memberof form_builder.form_definition.FormDefinitionSummary
             * @static
             * @param {form_builder.form_definition.FormDefinitionSummary} message FormDefinitionSummary
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            FormDefinitionSummary.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.arrays || options.defaults)
                    object.tags = [];
                if (options.defaults) {
                    object.id = "";
                    object.name = "";
                    object.description = "";
                    object.version = "";
                    object.status = options.enums === String ? "FORM_STATUS_UNSPECIFIED" : 0;
                    object.createdBy = "";
                    object.pageCount = 0;
                    object.elementCount = 0;
                    object.createdAt = null;
                    object.updatedAt = null;
                }
                if (message.id != null && message.hasOwnProperty("id"))
                    object.id = message.id;
                if (message.name != null && message.hasOwnProperty("name"))
                    object.name = message.name;
                if (message.description != null && message.hasOwnProperty("description"))
                    object.description = message.description;
                if (message.version != null && message.hasOwnProperty("version"))
                    object.version = message.version;
                if (message.status != null && message.hasOwnProperty("status"))
                    object.status = options.enums === String ? $root.form_builder.common.FormStatus[message.status] === undefined ? message.status : $root.form_builder.common.FormStatus[message.status] : message.status;
                if (message.createdBy != null && message.hasOwnProperty("createdBy"))
                    object.createdBy = message.createdBy;
                if (message.tags && message.tags.length) {
                    object.tags = [];
                    for (let j = 0; j < message.tags.length; ++j)
                        object.tags[j] = $root.form_builder.tag.Tag.toObject(message.tags[j], options);
                }
                if (message.pageCount != null && message.hasOwnProperty("pageCount"))
                    object.pageCount = message.pageCount;
                if (message.elementCount != null && message.hasOwnProperty("elementCount"))
                    object.elementCount = message.elementCount;
                if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                    object.createdAt = $root.form_builder.common.Timestamp.toObject(message.createdAt, options);
                if (message.updatedAt != null && message.hasOwnProperty("updatedAt"))
                    object.updatedAt = $root.form_builder.common.Timestamp.toObject(message.updatedAt, options);
                return object;
            };

            /**
             * Converts this FormDefinitionSummary to JSON.
             * @function toJSON
             * @memberof form_builder.form_definition.FormDefinitionSummary
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            FormDefinitionSummary.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for FormDefinitionSummary
             * @function getTypeUrl
             * @memberof form_builder.form_definition.FormDefinitionSummary
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            FormDefinitionSummary.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/form_builder.form_definition.FormDefinitionSummary";
            };

            return FormDefinitionSummary;
        })();

        form_definition.ListFormDefinitionsRequest = (function() {

            /**
             * Properties of a ListFormDefinitionsRequest.
             * @memberof form_builder.form_definition
             * @interface IListFormDefinitionsRequest
             * @property {form_builder.common.IPaginationRequest|null} [pagination] ListFormDefinitionsRequest pagination
             * @property {form_builder.common.FormStatus|null} [status] ListFormDefinitionsRequest status
             * @property {string|null} [search] ListFormDefinitionsRequest search
             * @property {Array.<string>|null} [tags] ListFormDefinitionsRequest tags
             */

            /**
             * Constructs a new ListFormDefinitionsRequest.
             * @memberof form_builder.form_definition
             * @classdesc Represents a ListFormDefinitionsRequest.
             * @implements IListFormDefinitionsRequest
             * @constructor
             * @param {form_builder.form_definition.IListFormDefinitionsRequest=} [properties] Properties to set
             */
            function ListFormDefinitionsRequest(properties) {
                this.tags = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ListFormDefinitionsRequest pagination.
             * @member {form_builder.common.IPaginationRequest|null|undefined} pagination
             * @memberof form_builder.form_definition.ListFormDefinitionsRequest
             * @instance
             */
            ListFormDefinitionsRequest.prototype.pagination = null;

            /**
             * ListFormDefinitionsRequest status.
             * @member {form_builder.common.FormStatus} status
             * @memberof form_builder.form_definition.ListFormDefinitionsRequest
             * @instance
             */
            ListFormDefinitionsRequest.prototype.status = 0;

            /**
             * ListFormDefinitionsRequest search.
             * @member {string} search
             * @memberof form_builder.form_definition.ListFormDefinitionsRequest
             * @instance
             */
            ListFormDefinitionsRequest.prototype.search = "";

            /**
             * ListFormDefinitionsRequest tags.
             * @member {Array.<string>} tags
             * @memberof form_builder.form_definition.ListFormDefinitionsRequest
             * @instance
             */
            ListFormDefinitionsRequest.prototype.tags = $util.emptyArray;

            /**
             * Creates a new ListFormDefinitionsRequest instance using the specified properties.
             * @function create
             * @memberof form_builder.form_definition.ListFormDefinitionsRequest
             * @static
             * @param {form_builder.form_definition.IListFormDefinitionsRequest=} [properties] Properties to set
             * @returns {form_builder.form_definition.ListFormDefinitionsRequest} ListFormDefinitionsRequest instance
             */
            ListFormDefinitionsRequest.create = function create(properties) {
                return new ListFormDefinitionsRequest(properties);
            };

            /**
             * Encodes the specified ListFormDefinitionsRequest message. Does not implicitly {@link form_builder.form_definition.ListFormDefinitionsRequest.verify|verify} messages.
             * @function encode
             * @memberof form_builder.form_definition.ListFormDefinitionsRequest
             * @static
             * @param {form_builder.form_definition.IListFormDefinitionsRequest} message ListFormDefinitionsRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ListFormDefinitionsRequest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.pagination != null && Object.hasOwnProperty.call(message, "pagination"))
                    $root.form_builder.common.PaginationRequest.encode(message.pagination, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int32(message.status);
                if (message.search != null && Object.hasOwnProperty.call(message, "search"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.search);
                if (message.tags != null && message.tags.length)
                    for (let i = 0; i < message.tags.length; ++i)
                        writer.uint32(/* id 4, wireType 2 =*/34).string(message.tags[i]);
                return writer;
            };

            /**
             * Encodes the specified ListFormDefinitionsRequest message, length delimited. Does not implicitly {@link form_builder.form_definition.ListFormDefinitionsRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof form_builder.form_definition.ListFormDefinitionsRequest
             * @static
             * @param {form_builder.form_definition.IListFormDefinitionsRequest} message ListFormDefinitionsRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ListFormDefinitionsRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ListFormDefinitionsRequest message from the specified reader or buffer.
             * @function decode
             * @memberof form_builder.form_definition.ListFormDefinitionsRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {form_builder.form_definition.ListFormDefinitionsRequest} ListFormDefinitionsRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ListFormDefinitionsRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.form_builder.form_definition.ListFormDefinitionsRequest();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.pagination = $root.form_builder.common.PaginationRequest.decode(reader, reader.uint32());
                            break;
                        }
                    case 2: {
                            message.status = reader.int32();
                            break;
                        }
                    case 3: {
                            message.search = reader.string();
                            break;
                        }
                    case 4: {
                            if (!(message.tags && message.tags.length))
                                message.tags = [];
                            message.tags.push(reader.string());
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
             * Decodes a ListFormDefinitionsRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof form_builder.form_definition.ListFormDefinitionsRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {form_builder.form_definition.ListFormDefinitionsRequest} ListFormDefinitionsRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ListFormDefinitionsRequest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ListFormDefinitionsRequest message.
             * @function verify
             * @memberof form_builder.form_definition.ListFormDefinitionsRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ListFormDefinitionsRequest.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.pagination != null && message.hasOwnProperty("pagination")) {
                    let error = $root.form_builder.common.PaginationRequest.verify(message.pagination);
                    if (error)
                        return "pagination." + error;
                }
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
                return null;
            };

            /**
             * Creates a ListFormDefinitionsRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof form_builder.form_definition.ListFormDefinitionsRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {form_builder.form_definition.ListFormDefinitionsRequest} ListFormDefinitionsRequest
             */
            ListFormDefinitionsRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.form_builder.form_definition.ListFormDefinitionsRequest)
                    return object;
                let message = new $root.form_builder.form_definition.ListFormDefinitionsRequest();
                if (object.pagination != null) {
                    if (typeof object.pagination !== "object")
                        throw TypeError(".form_builder.form_definition.ListFormDefinitionsRequest.pagination: object expected");
                    message.pagination = $root.form_builder.common.PaginationRequest.fromObject(object.pagination);
                }
                switch (object.status) {
                default:
                    if (typeof object.status === "number") {
                        message.status = object.status;
                        break;
                    }
                    break;
                case "FORM_STATUS_UNSPECIFIED":
                case 0:
                    message.status = 0;
                    break;
                case "FORM_STATUS_DRAFT":
                case 1:
                    message.status = 1;
                    break;
                case "FORM_STATUS_PUBLISHED":
                case 2:
                    message.status = 2;
                    break;
                case "FORM_STATUS_ARCHIVED":
                case 3:
                    message.status = 3;
                    break;
                }
                if (object.search != null)
                    message.search = String(object.search);
                if (object.tags) {
                    if (!Array.isArray(object.tags))
                        throw TypeError(".form_builder.form_definition.ListFormDefinitionsRequest.tags: array expected");
                    message.tags = [];
                    for (let i = 0; i < object.tags.length; ++i)
                        message.tags[i] = String(object.tags[i]);
                }
                return message;
            };

            /**
             * Creates a plain object from a ListFormDefinitionsRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof form_builder.form_definition.ListFormDefinitionsRequest
             * @static
             * @param {form_builder.form_definition.ListFormDefinitionsRequest} message ListFormDefinitionsRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ListFormDefinitionsRequest.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.arrays || options.defaults)
                    object.tags = [];
                if (options.defaults) {
                    object.pagination = null;
                    object.status = options.enums === String ? "FORM_STATUS_UNSPECIFIED" : 0;
                    object.search = "";
                }
                if (message.pagination != null && message.hasOwnProperty("pagination"))
                    object.pagination = $root.form_builder.common.PaginationRequest.toObject(message.pagination, options);
                if (message.status != null && message.hasOwnProperty("status"))
                    object.status = options.enums === String ? $root.form_builder.common.FormStatus[message.status] === undefined ? message.status : $root.form_builder.common.FormStatus[message.status] : message.status;
                if (message.search != null && message.hasOwnProperty("search"))
                    object.search = message.search;
                if (message.tags && message.tags.length) {
                    object.tags = [];
                    for (let j = 0; j < message.tags.length; ++j)
                        object.tags[j] = message.tags[j];
                }
                return object;
            };

            /**
             * Converts this ListFormDefinitionsRequest to JSON.
             * @function toJSON
             * @memberof form_builder.form_definition.ListFormDefinitionsRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ListFormDefinitionsRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ListFormDefinitionsRequest
             * @function getTypeUrl
             * @memberof form_builder.form_definition.ListFormDefinitionsRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ListFormDefinitionsRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/form_builder.form_definition.ListFormDefinitionsRequest";
            };

            return ListFormDefinitionsRequest;
        })();

        form_definition.ListFormDefinitionsResponse = (function() {

            /**
             * Properties of a ListFormDefinitionsResponse.
             * @memberof form_builder.form_definition
             * @interface IListFormDefinitionsResponse
             * @property {Array.<form_builder.form_definition.IFormDefinitionSummary>|null} [formDefinitions] ListFormDefinitionsResponse formDefinitions
             * @property {form_builder.common.IPaginationResponse|null} [pagination] ListFormDefinitionsResponse pagination
             */

            /**
             * Constructs a new ListFormDefinitionsResponse.
             * @memberof form_builder.form_definition
             * @classdesc Represents a ListFormDefinitionsResponse.
             * @implements IListFormDefinitionsResponse
             * @constructor
             * @param {form_builder.form_definition.IListFormDefinitionsResponse=} [properties] Properties to set
             */
            function ListFormDefinitionsResponse(properties) {
                this.formDefinitions = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ListFormDefinitionsResponse formDefinitions.
             * @member {Array.<form_builder.form_definition.IFormDefinitionSummary>} formDefinitions
             * @memberof form_builder.form_definition.ListFormDefinitionsResponse
             * @instance
             */
            ListFormDefinitionsResponse.prototype.formDefinitions = $util.emptyArray;

            /**
             * ListFormDefinitionsResponse pagination.
             * @member {form_builder.common.IPaginationResponse|null|undefined} pagination
             * @memberof form_builder.form_definition.ListFormDefinitionsResponse
             * @instance
             */
            ListFormDefinitionsResponse.prototype.pagination = null;

            /**
             * Creates a new ListFormDefinitionsResponse instance using the specified properties.
             * @function create
             * @memberof form_builder.form_definition.ListFormDefinitionsResponse
             * @static
             * @param {form_builder.form_definition.IListFormDefinitionsResponse=} [properties] Properties to set
             * @returns {form_builder.form_definition.ListFormDefinitionsResponse} ListFormDefinitionsResponse instance
             */
            ListFormDefinitionsResponse.create = function create(properties) {
                return new ListFormDefinitionsResponse(properties);
            };

            /**
             * Encodes the specified ListFormDefinitionsResponse message. Does not implicitly {@link form_builder.form_definition.ListFormDefinitionsResponse.verify|verify} messages.
             * @function encode
             * @memberof form_builder.form_definition.ListFormDefinitionsResponse
             * @static
             * @param {form_builder.form_definition.IListFormDefinitionsResponse} message ListFormDefinitionsResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ListFormDefinitionsResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.formDefinitions != null && message.formDefinitions.length)
                    for (let i = 0; i < message.formDefinitions.length; ++i)
                        $root.form_builder.form_definition.FormDefinitionSummary.encode(message.formDefinitions[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                if (message.pagination != null && Object.hasOwnProperty.call(message, "pagination"))
                    $root.form_builder.common.PaginationResponse.encode(message.pagination, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified ListFormDefinitionsResponse message, length delimited. Does not implicitly {@link form_builder.form_definition.ListFormDefinitionsResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof form_builder.form_definition.ListFormDefinitionsResponse
             * @static
             * @param {form_builder.form_definition.IListFormDefinitionsResponse} message ListFormDefinitionsResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ListFormDefinitionsResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ListFormDefinitionsResponse message from the specified reader or buffer.
             * @function decode
             * @memberof form_builder.form_definition.ListFormDefinitionsResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {form_builder.form_definition.ListFormDefinitionsResponse} ListFormDefinitionsResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ListFormDefinitionsResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.form_builder.form_definition.ListFormDefinitionsResponse();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            if (!(message.formDefinitions && message.formDefinitions.length))
                                message.formDefinitions = [];
                            message.formDefinitions.push($root.form_builder.form_definition.FormDefinitionSummary.decode(reader, reader.uint32()));
                            break;
                        }
                    case 2: {
                            message.pagination = $root.form_builder.common.PaginationResponse.decode(reader, reader.uint32());
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
             * Decodes a ListFormDefinitionsResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof form_builder.form_definition.ListFormDefinitionsResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {form_builder.form_definition.ListFormDefinitionsResponse} ListFormDefinitionsResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ListFormDefinitionsResponse.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ListFormDefinitionsResponse message.
             * @function verify
             * @memberof form_builder.form_definition.ListFormDefinitionsResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ListFormDefinitionsResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.formDefinitions != null && message.hasOwnProperty("formDefinitions")) {
                    if (!Array.isArray(message.formDefinitions))
                        return "formDefinitions: array expected";
                    for (let i = 0; i < message.formDefinitions.length; ++i) {
                        let error = $root.form_builder.form_definition.FormDefinitionSummary.verify(message.formDefinitions[i]);
                        if (error)
                            return "formDefinitions." + error;
                    }
                }
                if (message.pagination != null && message.hasOwnProperty("pagination")) {
                    let error = $root.form_builder.common.PaginationResponse.verify(message.pagination);
                    if (error)
                        return "pagination." + error;
                }
                return null;
            };

            /**
             * Creates a ListFormDefinitionsResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof form_builder.form_definition.ListFormDefinitionsResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {form_builder.form_definition.ListFormDefinitionsResponse} ListFormDefinitionsResponse
             */
            ListFormDefinitionsResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.form_builder.form_definition.ListFormDefinitionsResponse)
                    return object;
                let message = new $root.form_builder.form_definition.ListFormDefinitionsResponse();
                if (object.formDefinitions) {
                    if (!Array.isArray(object.formDefinitions))
                        throw TypeError(".form_builder.form_definition.ListFormDefinitionsResponse.formDefinitions: array expected");
                    message.formDefinitions = [];
                    for (let i = 0; i < object.formDefinitions.length; ++i) {
                        if (typeof object.formDefinitions[i] !== "object")
                            throw TypeError(".form_builder.form_definition.ListFormDefinitionsResponse.formDefinitions: object expected");
                        message.formDefinitions[i] = $root.form_builder.form_definition.FormDefinitionSummary.fromObject(object.formDefinitions[i]);
                    }
                }
                if (object.pagination != null) {
                    if (typeof object.pagination !== "object")
                        throw TypeError(".form_builder.form_definition.ListFormDefinitionsResponse.pagination: object expected");
                    message.pagination = $root.form_builder.common.PaginationResponse.fromObject(object.pagination);
                }
                return message;
            };

            /**
             * Creates a plain object from a ListFormDefinitionsResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof form_builder.form_definition.ListFormDefinitionsResponse
             * @static
             * @param {form_builder.form_definition.ListFormDefinitionsResponse} message ListFormDefinitionsResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ListFormDefinitionsResponse.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.arrays || options.defaults)
                    object.formDefinitions = [];
                if (options.defaults)
                    object.pagination = null;
                if (message.formDefinitions && message.formDefinitions.length) {
                    object.formDefinitions = [];
                    for (let j = 0; j < message.formDefinitions.length; ++j)
                        object.formDefinitions[j] = $root.form_builder.form_definition.FormDefinitionSummary.toObject(message.formDefinitions[j], options);
                }
                if (message.pagination != null && message.hasOwnProperty("pagination"))
                    object.pagination = $root.form_builder.common.PaginationResponse.toObject(message.pagination, options);
                return object;
            };

            /**
             * Converts this ListFormDefinitionsResponse to JSON.
             * @function toJSON
             * @memberof form_builder.form_definition.ListFormDefinitionsResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ListFormDefinitionsResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ListFormDefinitionsResponse
             * @function getTypeUrl
             * @memberof form_builder.form_definition.ListFormDefinitionsResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ListFormDefinitionsResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/form_builder.form_definition.ListFormDefinitionsResponse";
            };

            return ListFormDefinitionsResponse;
        })();

        form_definition.GetFormDefinitionRequest = (function() {

            /**
             * Properties of a GetFormDefinitionRequest.
             * @memberof form_builder.form_definition
             * @interface IGetFormDefinitionRequest
             * @property {string|null} [id] GetFormDefinitionRequest id
             */

            /**
             * Constructs a new GetFormDefinitionRequest.
             * @memberof form_builder.form_definition
             * @classdesc Represents a GetFormDefinitionRequest.
             * @implements IGetFormDefinitionRequest
             * @constructor
             * @param {form_builder.form_definition.IGetFormDefinitionRequest=} [properties] Properties to set
             */
            function GetFormDefinitionRequest(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * GetFormDefinitionRequest id.
             * @member {string} id
             * @memberof form_builder.form_definition.GetFormDefinitionRequest
             * @instance
             */
            GetFormDefinitionRequest.prototype.id = "";

            /**
             * Creates a new GetFormDefinitionRequest instance using the specified properties.
             * @function create
             * @memberof form_builder.form_definition.GetFormDefinitionRequest
             * @static
             * @param {form_builder.form_definition.IGetFormDefinitionRequest=} [properties] Properties to set
             * @returns {form_builder.form_definition.GetFormDefinitionRequest} GetFormDefinitionRequest instance
             */
            GetFormDefinitionRequest.create = function create(properties) {
                return new GetFormDefinitionRequest(properties);
            };

            /**
             * Encodes the specified GetFormDefinitionRequest message. Does not implicitly {@link form_builder.form_definition.GetFormDefinitionRequest.verify|verify} messages.
             * @function encode
             * @memberof form_builder.form_definition.GetFormDefinitionRequest
             * @static
             * @param {form_builder.form_definition.IGetFormDefinitionRequest} message GetFormDefinitionRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            GetFormDefinitionRequest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
                return writer;
            };

            /**
             * Encodes the specified GetFormDefinitionRequest message, length delimited. Does not implicitly {@link form_builder.form_definition.GetFormDefinitionRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof form_builder.form_definition.GetFormDefinitionRequest
             * @static
             * @param {form_builder.form_definition.IGetFormDefinitionRequest} message GetFormDefinitionRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            GetFormDefinitionRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a GetFormDefinitionRequest message from the specified reader or buffer.
             * @function decode
             * @memberof form_builder.form_definition.GetFormDefinitionRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {form_builder.form_definition.GetFormDefinitionRequest} GetFormDefinitionRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            GetFormDefinitionRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.form_builder.form_definition.GetFormDefinitionRequest();
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
             * Decodes a GetFormDefinitionRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof form_builder.form_definition.GetFormDefinitionRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {form_builder.form_definition.GetFormDefinitionRequest} GetFormDefinitionRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            GetFormDefinitionRequest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a GetFormDefinitionRequest message.
             * @function verify
             * @memberof form_builder.form_definition.GetFormDefinitionRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            GetFormDefinitionRequest.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.id != null && message.hasOwnProperty("id"))
                    if (!$util.isString(message.id))
                        return "id: string expected";
                return null;
            };

            /**
             * Creates a GetFormDefinitionRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof form_builder.form_definition.GetFormDefinitionRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {form_builder.form_definition.GetFormDefinitionRequest} GetFormDefinitionRequest
             */
            GetFormDefinitionRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.form_builder.form_definition.GetFormDefinitionRequest)
                    return object;
                let message = new $root.form_builder.form_definition.GetFormDefinitionRequest();
                if (object.id != null)
                    message.id = String(object.id);
                return message;
            };

            /**
             * Creates a plain object from a GetFormDefinitionRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof form_builder.form_definition.GetFormDefinitionRequest
             * @static
             * @param {form_builder.form_definition.GetFormDefinitionRequest} message GetFormDefinitionRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            GetFormDefinitionRequest.toObject = function toObject(message, options) {
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
             * Converts this GetFormDefinitionRequest to JSON.
             * @function toJSON
             * @memberof form_builder.form_definition.GetFormDefinitionRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            GetFormDefinitionRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for GetFormDefinitionRequest
             * @function getTypeUrl
             * @memberof form_builder.form_definition.GetFormDefinitionRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            GetFormDefinitionRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/form_builder.form_definition.GetFormDefinitionRequest";
            };

            return GetFormDefinitionRequest;
        })();

        form_definition.GetFormDefinitionResponse = (function() {

            /**
             * Properties of a GetFormDefinitionResponse.
             * @memberof form_builder.form_definition
             * @interface IGetFormDefinitionResponse
             * @property {form_builder.form_definition.IFormDefinition|null} [formDefinition] GetFormDefinitionResponse formDefinition
             */

            /**
             * Constructs a new GetFormDefinitionResponse.
             * @memberof form_builder.form_definition
             * @classdesc Represents a GetFormDefinitionResponse.
             * @implements IGetFormDefinitionResponse
             * @constructor
             * @param {form_builder.form_definition.IGetFormDefinitionResponse=} [properties] Properties to set
             */
            function GetFormDefinitionResponse(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * GetFormDefinitionResponse formDefinition.
             * @member {form_builder.form_definition.IFormDefinition|null|undefined} formDefinition
             * @memberof form_builder.form_definition.GetFormDefinitionResponse
             * @instance
             */
            GetFormDefinitionResponse.prototype.formDefinition = null;

            /**
             * Creates a new GetFormDefinitionResponse instance using the specified properties.
             * @function create
             * @memberof form_builder.form_definition.GetFormDefinitionResponse
             * @static
             * @param {form_builder.form_definition.IGetFormDefinitionResponse=} [properties] Properties to set
             * @returns {form_builder.form_definition.GetFormDefinitionResponse} GetFormDefinitionResponse instance
             */
            GetFormDefinitionResponse.create = function create(properties) {
                return new GetFormDefinitionResponse(properties);
            };

            /**
             * Encodes the specified GetFormDefinitionResponse message. Does not implicitly {@link form_builder.form_definition.GetFormDefinitionResponse.verify|verify} messages.
             * @function encode
             * @memberof form_builder.form_definition.GetFormDefinitionResponse
             * @static
             * @param {form_builder.form_definition.IGetFormDefinitionResponse} message GetFormDefinitionResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            GetFormDefinitionResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.formDefinition != null && Object.hasOwnProperty.call(message, "formDefinition"))
                    $root.form_builder.form_definition.FormDefinition.encode(message.formDefinition, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified GetFormDefinitionResponse message, length delimited. Does not implicitly {@link form_builder.form_definition.GetFormDefinitionResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof form_builder.form_definition.GetFormDefinitionResponse
             * @static
             * @param {form_builder.form_definition.IGetFormDefinitionResponse} message GetFormDefinitionResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            GetFormDefinitionResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a GetFormDefinitionResponse message from the specified reader or buffer.
             * @function decode
             * @memberof form_builder.form_definition.GetFormDefinitionResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {form_builder.form_definition.GetFormDefinitionResponse} GetFormDefinitionResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            GetFormDefinitionResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.form_builder.form_definition.GetFormDefinitionResponse();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.formDefinition = $root.form_builder.form_definition.FormDefinition.decode(reader, reader.uint32());
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
             * Decodes a GetFormDefinitionResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof form_builder.form_definition.GetFormDefinitionResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {form_builder.form_definition.GetFormDefinitionResponse} GetFormDefinitionResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            GetFormDefinitionResponse.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a GetFormDefinitionResponse message.
             * @function verify
             * @memberof form_builder.form_definition.GetFormDefinitionResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            GetFormDefinitionResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.formDefinition != null && message.hasOwnProperty("formDefinition")) {
                    let error = $root.form_builder.form_definition.FormDefinition.verify(message.formDefinition);
                    if (error)
                        return "formDefinition." + error;
                }
                return null;
            };

            /**
             * Creates a GetFormDefinitionResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof form_builder.form_definition.GetFormDefinitionResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {form_builder.form_definition.GetFormDefinitionResponse} GetFormDefinitionResponse
             */
            GetFormDefinitionResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.form_builder.form_definition.GetFormDefinitionResponse)
                    return object;
                let message = new $root.form_builder.form_definition.GetFormDefinitionResponse();
                if (object.formDefinition != null) {
                    if (typeof object.formDefinition !== "object")
                        throw TypeError(".form_builder.form_definition.GetFormDefinitionResponse.formDefinition: object expected");
                    message.formDefinition = $root.form_builder.form_definition.FormDefinition.fromObject(object.formDefinition);
                }
                return message;
            };

            /**
             * Creates a plain object from a GetFormDefinitionResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof form_builder.form_definition.GetFormDefinitionResponse
             * @static
             * @param {form_builder.form_definition.GetFormDefinitionResponse} message GetFormDefinitionResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            GetFormDefinitionResponse.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults)
                    object.formDefinition = null;
                if (message.formDefinition != null && message.hasOwnProperty("formDefinition"))
                    object.formDefinition = $root.form_builder.form_definition.FormDefinition.toObject(message.formDefinition, options);
                return object;
            };

            /**
             * Converts this GetFormDefinitionResponse to JSON.
             * @function toJSON
             * @memberof form_builder.form_definition.GetFormDefinitionResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            GetFormDefinitionResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for GetFormDefinitionResponse
             * @function getTypeUrl
             * @memberof form_builder.form_definition.GetFormDefinitionResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            GetFormDefinitionResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/form_builder.form_definition.GetFormDefinitionResponse";
            };

            return GetFormDefinitionResponse;
        })();

        form_definition.CreateFormDefinitionRequest = (function() {

            /**
             * Properties of a CreateFormDefinitionRequest.
             * @memberof form_builder.form_definition
             * @interface ICreateFormDefinitionRequest
             * @property {string|null} [name] CreateFormDefinitionRequest name
             * @property {string|null} [description] CreateFormDefinitionRequest description
             * @property {string|null} [version] CreateFormDefinitionRequest version
             * @property {form_builder.common.FormStatus|null} [status] CreateFormDefinitionRequest status
             * @property {Uint8Array|null} [schemaData] CreateFormDefinitionRequest schemaData
             * @property {Uint8Array|null} [metadataData] CreateFormDefinitionRequest metadataData
             * @property {string|null} [createdBy] CreateFormDefinitionRequest createdBy
             * @property {Array.<string>|null} [tagNames] CreateFormDefinitionRequest tagNames
             */

            /**
             * Constructs a new CreateFormDefinitionRequest.
             * @memberof form_builder.form_definition
             * @classdesc Represents a CreateFormDefinitionRequest.
             * @implements ICreateFormDefinitionRequest
             * @constructor
             * @param {form_builder.form_definition.ICreateFormDefinitionRequest=} [properties] Properties to set
             */
            function CreateFormDefinitionRequest(properties) {
                this.tagNames = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * CreateFormDefinitionRequest name.
             * @member {string} name
             * @memberof form_builder.form_definition.CreateFormDefinitionRequest
             * @instance
             */
            CreateFormDefinitionRequest.prototype.name = "";

            /**
             * CreateFormDefinitionRequest description.
             * @member {string} description
             * @memberof form_builder.form_definition.CreateFormDefinitionRequest
             * @instance
             */
            CreateFormDefinitionRequest.prototype.description = "";

            /**
             * CreateFormDefinitionRequest version.
             * @member {string} version
             * @memberof form_builder.form_definition.CreateFormDefinitionRequest
             * @instance
             */
            CreateFormDefinitionRequest.prototype.version = "";

            /**
             * CreateFormDefinitionRequest status.
             * @member {form_builder.common.FormStatus} status
             * @memberof form_builder.form_definition.CreateFormDefinitionRequest
             * @instance
             */
            CreateFormDefinitionRequest.prototype.status = 0;

            /**
             * CreateFormDefinitionRequest schemaData.
             * @member {Uint8Array} schemaData
             * @memberof form_builder.form_definition.CreateFormDefinitionRequest
             * @instance
             */
            CreateFormDefinitionRequest.prototype.schemaData = $util.newBuffer([]);

            /**
             * CreateFormDefinitionRequest metadataData.
             * @member {Uint8Array} metadataData
             * @memberof form_builder.form_definition.CreateFormDefinitionRequest
             * @instance
             */
            CreateFormDefinitionRequest.prototype.metadataData = $util.newBuffer([]);

            /**
             * CreateFormDefinitionRequest createdBy.
             * @member {string} createdBy
             * @memberof form_builder.form_definition.CreateFormDefinitionRequest
             * @instance
             */
            CreateFormDefinitionRequest.prototype.createdBy = "";

            /**
             * CreateFormDefinitionRequest tagNames.
             * @member {Array.<string>} tagNames
             * @memberof form_builder.form_definition.CreateFormDefinitionRequest
             * @instance
             */
            CreateFormDefinitionRequest.prototype.tagNames = $util.emptyArray;

            /**
             * Creates a new CreateFormDefinitionRequest instance using the specified properties.
             * @function create
             * @memberof form_builder.form_definition.CreateFormDefinitionRequest
             * @static
             * @param {form_builder.form_definition.ICreateFormDefinitionRequest=} [properties] Properties to set
             * @returns {form_builder.form_definition.CreateFormDefinitionRequest} CreateFormDefinitionRequest instance
             */
            CreateFormDefinitionRequest.create = function create(properties) {
                return new CreateFormDefinitionRequest(properties);
            };

            /**
             * Encodes the specified CreateFormDefinitionRequest message. Does not implicitly {@link form_builder.form_definition.CreateFormDefinitionRequest.verify|verify} messages.
             * @function encode
             * @memberof form_builder.form_definition.CreateFormDefinitionRequest
             * @static
             * @param {form_builder.form_definition.ICreateFormDefinitionRequest} message CreateFormDefinitionRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CreateFormDefinitionRequest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
                if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.description);
                if (message.version != null && Object.hasOwnProperty.call(message, "version"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.version);
                if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                    writer.uint32(/* id 4, wireType 0 =*/32).int32(message.status);
                if (message.schemaData != null && Object.hasOwnProperty.call(message, "schemaData"))
                    writer.uint32(/* id 5, wireType 2 =*/42).bytes(message.schemaData);
                if (message.metadataData != null && Object.hasOwnProperty.call(message, "metadataData"))
                    writer.uint32(/* id 6, wireType 2 =*/50).bytes(message.metadataData);
                if (message.createdBy != null && Object.hasOwnProperty.call(message, "createdBy"))
                    writer.uint32(/* id 7, wireType 2 =*/58).string(message.createdBy);
                if (message.tagNames != null && message.tagNames.length)
                    for (let i = 0; i < message.tagNames.length; ++i)
                        writer.uint32(/* id 8, wireType 2 =*/66).string(message.tagNames[i]);
                return writer;
            };

            /**
             * Encodes the specified CreateFormDefinitionRequest message, length delimited. Does not implicitly {@link form_builder.form_definition.CreateFormDefinitionRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof form_builder.form_definition.CreateFormDefinitionRequest
             * @static
             * @param {form_builder.form_definition.ICreateFormDefinitionRequest} message CreateFormDefinitionRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CreateFormDefinitionRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a CreateFormDefinitionRequest message from the specified reader or buffer.
             * @function decode
             * @memberof form_builder.form_definition.CreateFormDefinitionRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {form_builder.form_definition.CreateFormDefinitionRequest} CreateFormDefinitionRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CreateFormDefinitionRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.form_builder.form_definition.CreateFormDefinitionRequest();
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
                            message.version = reader.string();
                            break;
                        }
                    case 4: {
                            message.status = reader.int32();
                            break;
                        }
                    case 5: {
                            message.schemaData = reader.bytes();
                            break;
                        }
                    case 6: {
                            message.metadataData = reader.bytes();
                            break;
                        }
                    case 7: {
                            message.createdBy = reader.string();
                            break;
                        }
                    case 8: {
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
             * Decodes a CreateFormDefinitionRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof form_builder.form_definition.CreateFormDefinitionRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {form_builder.form_definition.CreateFormDefinitionRequest} CreateFormDefinitionRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CreateFormDefinitionRequest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a CreateFormDefinitionRequest message.
             * @function verify
             * @memberof form_builder.form_definition.CreateFormDefinitionRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            CreateFormDefinitionRequest.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.name != null && message.hasOwnProperty("name"))
                    if (!$util.isString(message.name))
                        return "name: string expected";
                if (message.description != null && message.hasOwnProperty("description"))
                    if (!$util.isString(message.description))
                        return "description: string expected";
                if (message.version != null && message.hasOwnProperty("version"))
                    if (!$util.isString(message.version))
                        return "version: string expected";
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
                if (message.schemaData != null && message.hasOwnProperty("schemaData"))
                    if (!(message.schemaData && typeof message.schemaData.length === "number" || $util.isString(message.schemaData)))
                        return "schemaData: buffer expected";
                if (message.metadataData != null && message.hasOwnProperty("metadataData"))
                    if (!(message.metadataData && typeof message.metadataData.length === "number" || $util.isString(message.metadataData)))
                        return "metadataData: buffer expected";
                if (message.createdBy != null && message.hasOwnProperty("createdBy"))
                    if (!$util.isString(message.createdBy))
                        return "createdBy: string expected";
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
             * Creates a CreateFormDefinitionRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof form_builder.form_definition.CreateFormDefinitionRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {form_builder.form_definition.CreateFormDefinitionRequest} CreateFormDefinitionRequest
             */
            CreateFormDefinitionRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.form_builder.form_definition.CreateFormDefinitionRequest)
                    return object;
                let message = new $root.form_builder.form_definition.CreateFormDefinitionRequest();
                if (object.name != null)
                    message.name = String(object.name);
                if (object.description != null)
                    message.description = String(object.description);
                if (object.version != null)
                    message.version = String(object.version);
                switch (object.status) {
                default:
                    if (typeof object.status === "number") {
                        message.status = object.status;
                        break;
                    }
                    break;
                case "FORM_STATUS_UNSPECIFIED":
                case 0:
                    message.status = 0;
                    break;
                case "FORM_STATUS_DRAFT":
                case 1:
                    message.status = 1;
                    break;
                case "FORM_STATUS_PUBLISHED":
                case 2:
                    message.status = 2;
                    break;
                case "FORM_STATUS_ARCHIVED":
                case 3:
                    message.status = 3;
                    break;
                }
                if (object.schemaData != null)
                    if (typeof object.schemaData === "string")
                        $util.base64.decode(object.schemaData, message.schemaData = $util.newBuffer($util.base64.length(object.schemaData)), 0);
                    else if (object.schemaData.length >= 0)
                        message.schemaData = object.schemaData;
                if (object.metadataData != null)
                    if (typeof object.metadataData === "string")
                        $util.base64.decode(object.metadataData, message.metadataData = $util.newBuffer($util.base64.length(object.metadataData)), 0);
                    else if (object.metadataData.length >= 0)
                        message.metadataData = object.metadataData;
                if (object.createdBy != null)
                    message.createdBy = String(object.createdBy);
                if (object.tagNames) {
                    if (!Array.isArray(object.tagNames))
                        throw TypeError(".form_builder.form_definition.CreateFormDefinitionRequest.tagNames: array expected");
                    message.tagNames = [];
                    for (let i = 0; i < object.tagNames.length; ++i)
                        message.tagNames[i] = String(object.tagNames[i]);
                }
                return message;
            };

            /**
             * Creates a plain object from a CreateFormDefinitionRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof form_builder.form_definition.CreateFormDefinitionRequest
             * @static
             * @param {form_builder.form_definition.CreateFormDefinitionRequest} message CreateFormDefinitionRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            CreateFormDefinitionRequest.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.arrays || options.defaults)
                    object.tagNames = [];
                if (options.defaults) {
                    object.name = "";
                    object.description = "";
                    object.version = "";
                    object.status = options.enums === String ? "FORM_STATUS_UNSPECIFIED" : 0;
                    if (options.bytes === String)
                        object.schemaData = "";
                    else {
                        object.schemaData = [];
                        if (options.bytes !== Array)
                            object.schemaData = $util.newBuffer(object.schemaData);
                    }
                    if (options.bytes === String)
                        object.metadataData = "";
                    else {
                        object.metadataData = [];
                        if (options.bytes !== Array)
                            object.metadataData = $util.newBuffer(object.metadataData);
                    }
                    object.createdBy = "";
                }
                if (message.name != null && message.hasOwnProperty("name"))
                    object.name = message.name;
                if (message.description != null && message.hasOwnProperty("description"))
                    object.description = message.description;
                if (message.version != null && message.hasOwnProperty("version"))
                    object.version = message.version;
                if (message.status != null && message.hasOwnProperty("status"))
                    object.status = options.enums === String ? $root.form_builder.common.FormStatus[message.status] === undefined ? message.status : $root.form_builder.common.FormStatus[message.status] : message.status;
                if (message.schemaData != null && message.hasOwnProperty("schemaData"))
                    object.schemaData = options.bytes === String ? $util.base64.encode(message.schemaData, 0, message.schemaData.length) : options.bytes === Array ? Array.prototype.slice.call(message.schemaData) : message.schemaData;
                if (message.metadataData != null && message.hasOwnProperty("metadataData"))
                    object.metadataData = options.bytes === String ? $util.base64.encode(message.metadataData, 0, message.metadataData.length) : options.bytes === Array ? Array.prototype.slice.call(message.metadataData) : message.metadataData;
                if (message.createdBy != null && message.hasOwnProperty("createdBy"))
                    object.createdBy = message.createdBy;
                if (message.tagNames && message.tagNames.length) {
                    object.tagNames = [];
                    for (let j = 0; j < message.tagNames.length; ++j)
                        object.tagNames[j] = message.tagNames[j];
                }
                return object;
            };

            /**
             * Converts this CreateFormDefinitionRequest to JSON.
             * @function toJSON
             * @memberof form_builder.form_definition.CreateFormDefinitionRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            CreateFormDefinitionRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for CreateFormDefinitionRequest
             * @function getTypeUrl
             * @memberof form_builder.form_definition.CreateFormDefinitionRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            CreateFormDefinitionRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/form_builder.form_definition.CreateFormDefinitionRequest";
            };

            return CreateFormDefinitionRequest;
        })();

        form_definition.CreateFormDefinitionResponse = (function() {

            /**
             * Properties of a CreateFormDefinitionResponse.
             * @memberof form_builder.form_definition
             * @interface ICreateFormDefinitionResponse
             * @property {form_builder.form_definition.IFormDefinition|null} [formDefinition] CreateFormDefinitionResponse formDefinition
             */

            /**
             * Constructs a new CreateFormDefinitionResponse.
             * @memberof form_builder.form_definition
             * @classdesc Represents a CreateFormDefinitionResponse.
             * @implements ICreateFormDefinitionResponse
             * @constructor
             * @param {form_builder.form_definition.ICreateFormDefinitionResponse=} [properties] Properties to set
             */
            function CreateFormDefinitionResponse(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * CreateFormDefinitionResponse formDefinition.
             * @member {form_builder.form_definition.IFormDefinition|null|undefined} formDefinition
             * @memberof form_builder.form_definition.CreateFormDefinitionResponse
             * @instance
             */
            CreateFormDefinitionResponse.prototype.formDefinition = null;

            /**
             * Creates a new CreateFormDefinitionResponse instance using the specified properties.
             * @function create
             * @memberof form_builder.form_definition.CreateFormDefinitionResponse
             * @static
             * @param {form_builder.form_definition.ICreateFormDefinitionResponse=} [properties] Properties to set
             * @returns {form_builder.form_definition.CreateFormDefinitionResponse} CreateFormDefinitionResponse instance
             */
            CreateFormDefinitionResponse.create = function create(properties) {
                return new CreateFormDefinitionResponse(properties);
            };

            /**
             * Encodes the specified CreateFormDefinitionResponse message. Does not implicitly {@link form_builder.form_definition.CreateFormDefinitionResponse.verify|verify} messages.
             * @function encode
             * @memberof form_builder.form_definition.CreateFormDefinitionResponse
             * @static
             * @param {form_builder.form_definition.ICreateFormDefinitionResponse} message CreateFormDefinitionResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CreateFormDefinitionResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.formDefinition != null && Object.hasOwnProperty.call(message, "formDefinition"))
                    $root.form_builder.form_definition.FormDefinition.encode(message.formDefinition, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified CreateFormDefinitionResponse message, length delimited. Does not implicitly {@link form_builder.form_definition.CreateFormDefinitionResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof form_builder.form_definition.CreateFormDefinitionResponse
             * @static
             * @param {form_builder.form_definition.ICreateFormDefinitionResponse} message CreateFormDefinitionResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CreateFormDefinitionResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a CreateFormDefinitionResponse message from the specified reader or buffer.
             * @function decode
             * @memberof form_builder.form_definition.CreateFormDefinitionResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {form_builder.form_definition.CreateFormDefinitionResponse} CreateFormDefinitionResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CreateFormDefinitionResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.form_builder.form_definition.CreateFormDefinitionResponse();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.formDefinition = $root.form_builder.form_definition.FormDefinition.decode(reader, reader.uint32());
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
             * Decodes a CreateFormDefinitionResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof form_builder.form_definition.CreateFormDefinitionResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {form_builder.form_definition.CreateFormDefinitionResponse} CreateFormDefinitionResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CreateFormDefinitionResponse.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a CreateFormDefinitionResponse message.
             * @function verify
             * @memberof form_builder.form_definition.CreateFormDefinitionResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            CreateFormDefinitionResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.formDefinition != null && message.hasOwnProperty("formDefinition")) {
                    let error = $root.form_builder.form_definition.FormDefinition.verify(message.formDefinition);
                    if (error)
                        return "formDefinition." + error;
                }
                return null;
            };

            /**
             * Creates a CreateFormDefinitionResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof form_builder.form_definition.CreateFormDefinitionResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {form_builder.form_definition.CreateFormDefinitionResponse} CreateFormDefinitionResponse
             */
            CreateFormDefinitionResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.form_builder.form_definition.CreateFormDefinitionResponse)
                    return object;
                let message = new $root.form_builder.form_definition.CreateFormDefinitionResponse();
                if (object.formDefinition != null) {
                    if (typeof object.formDefinition !== "object")
                        throw TypeError(".form_builder.form_definition.CreateFormDefinitionResponse.formDefinition: object expected");
                    message.formDefinition = $root.form_builder.form_definition.FormDefinition.fromObject(object.formDefinition);
                }
                return message;
            };

            /**
             * Creates a plain object from a CreateFormDefinitionResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof form_builder.form_definition.CreateFormDefinitionResponse
             * @static
             * @param {form_builder.form_definition.CreateFormDefinitionResponse} message CreateFormDefinitionResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            CreateFormDefinitionResponse.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults)
                    object.formDefinition = null;
                if (message.formDefinition != null && message.hasOwnProperty("formDefinition"))
                    object.formDefinition = $root.form_builder.form_definition.FormDefinition.toObject(message.formDefinition, options);
                return object;
            };

            /**
             * Converts this CreateFormDefinitionResponse to JSON.
             * @function toJSON
             * @memberof form_builder.form_definition.CreateFormDefinitionResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            CreateFormDefinitionResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for CreateFormDefinitionResponse
             * @function getTypeUrl
             * @memberof form_builder.form_definition.CreateFormDefinitionResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            CreateFormDefinitionResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/form_builder.form_definition.CreateFormDefinitionResponse";
            };

            return CreateFormDefinitionResponse;
        })();

        form_definition.UpdateFormDefinitionRequest = (function() {

            /**
             * Properties of an UpdateFormDefinitionRequest.
             * @memberof form_builder.form_definition
             * @interface IUpdateFormDefinitionRequest
             * @property {string|null} [id] UpdateFormDefinitionRequest id
             * @property {string|null} [name] UpdateFormDefinitionRequest name
             * @property {string|null} [description] UpdateFormDefinitionRequest description
             * @property {string|null} [version] UpdateFormDefinitionRequest version
             * @property {form_builder.common.FormStatus|null} [status] UpdateFormDefinitionRequest status
             * @property {Uint8Array|null} [schemaData] UpdateFormDefinitionRequest schemaData
             * @property {Uint8Array|null} [metadataData] UpdateFormDefinitionRequest metadataData
             * @property {Array.<string>|null} [tagNames] UpdateFormDefinitionRequest tagNames
             */

            /**
             * Constructs a new UpdateFormDefinitionRequest.
             * @memberof form_builder.form_definition
             * @classdesc Represents an UpdateFormDefinitionRequest.
             * @implements IUpdateFormDefinitionRequest
             * @constructor
             * @param {form_builder.form_definition.IUpdateFormDefinitionRequest=} [properties] Properties to set
             */
            function UpdateFormDefinitionRequest(properties) {
                this.tagNames = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * UpdateFormDefinitionRequest id.
             * @member {string} id
             * @memberof form_builder.form_definition.UpdateFormDefinitionRequest
             * @instance
             */
            UpdateFormDefinitionRequest.prototype.id = "";

            /**
             * UpdateFormDefinitionRequest name.
             * @member {string} name
             * @memberof form_builder.form_definition.UpdateFormDefinitionRequest
             * @instance
             */
            UpdateFormDefinitionRequest.prototype.name = "";

            /**
             * UpdateFormDefinitionRequest description.
             * @member {string} description
             * @memberof form_builder.form_definition.UpdateFormDefinitionRequest
             * @instance
             */
            UpdateFormDefinitionRequest.prototype.description = "";

            /**
             * UpdateFormDefinitionRequest version.
             * @member {string} version
             * @memberof form_builder.form_definition.UpdateFormDefinitionRequest
             * @instance
             */
            UpdateFormDefinitionRequest.prototype.version = "";

            /**
             * UpdateFormDefinitionRequest status.
             * @member {form_builder.common.FormStatus} status
             * @memberof form_builder.form_definition.UpdateFormDefinitionRequest
             * @instance
             */
            UpdateFormDefinitionRequest.prototype.status = 0;

            /**
             * UpdateFormDefinitionRequest schemaData.
             * @member {Uint8Array} schemaData
             * @memberof form_builder.form_definition.UpdateFormDefinitionRequest
             * @instance
             */
            UpdateFormDefinitionRequest.prototype.schemaData = $util.newBuffer([]);

            /**
             * UpdateFormDefinitionRequest metadataData.
             * @member {Uint8Array} metadataData
             * @memberof form_builder.form_definition.UpdateFormDefinitionRequest
             * @instance
             */
            UpdateFormDefinitionRequest.prototype.metadataData = $util.newBuffer([]);

            /**
             * UpdateFormDefinitionRequest tagNames.
             * @member {Array.<string>} tagNames
             * @memberof form_builder.form_definition.UpdateFormDefinitionRequest
             * @instance
             */
            UpdateFormDefinitionRequest.prototype.tagNames = $util.emptyArray;

            /**
             * Creates a new UpdateFormDefinitionRequest instance using the specified properties.
             * @function create
             * @memberof form_builder.form_definition.UpdateFormDefinitionRequest
             * @static
             * @param {form_builder.form_definition.IUpdateFormDefinitionRequest=} [properties] Properties to set
             * @returns {form_builder.form_definition.UpdateFormDefinitionRequest} UpdateFormDefinitionRequest instance
             */
            UpdateFormDefinitionRequest.create = function create(properties) {
                return new UpdateFormDefinitionRequest(properties);
            };

            /**
             * Encodes the specified UpdateFormDefinitionRequest message. Does not implicitly {@link form_builder.form_definition.UpdateFormDefinitionRequest.verify|verify} messages.
             * @function encode
             * @memberof form_builder.form_definition.UpdateFormDefinitionRequest
             * @static
             * @param {form_builder.form_definition.IUpdateFormDefinitionRequest} message UpdateFormDefinitionRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            UpdateFormDefinitionRequest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
                if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
                if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.description);
                if (message.version != null && Object.hasOwnProperty.call(message, "version"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.version);
                if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                    writer.uint32(/* id 5, wireType 0 =*/40).int32(message.status);
                if (message.schemaData != null && Object.hasOwnProperty.call(message, "schemaData"))
                    writer.uint32(/* id 6, wireType 2 =*/50).bytes(message.schemaData);
                if (message.metadataData != null && Object.hasOwnProperty.call(message, "metadataData"))
                    writer.uint32(/* id 7, wireType 2 =*/58).bytes(message.metadataData);
                if (message.tagNames != null && message.tagNames.length)
                    for (let i = 0; i < message.tagNames.length; ++i)
                        writer.uint32(/* id 8, wireType 2 =*/66).string(message.tagNames[i]);
                return writer;
            };

            /**
             * Encodes the specified UpdateFormDefinitionRequest message, length delimited. Does not implicitly {@link form_builder.form_definition.UpdateFormDefinitionRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof form_builder.form_definition.UpdateFormDefinitionRequest
             * @static
             * @param {form_builder.form_definition.IUpdateFormDefinitionRequest} message UpdateFormDefinitionRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            UpdateFormDefinitionRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an UpdateFormDefinitionRequest message from the specified reader or buffer.
             * @function decode
             * @memberof form_builder.form_definition.UpdateFormDefinitionRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {form_builder.form_definition.UpdateFormDefinitionRequest} UpdateFormDefinitionRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            UpdateFormDefinitionRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.form_builder.form_definition.UpdateFormDefinitionRequest();
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
                            message.version = reader.string();
                            break;
                        }
                    case 5: {
                            message.status = reader.int32();
                            break;
                        }
                    case 6: {
                            message.schemaData = reader.bytes();
                            break;
                        }
                    case 7: {
                            message.metadataData = reader.bytes();
                            break;
                        }
                    case 8: {
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
             * Decodes an UpdateFormDefinitionRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof form_builder.form_definition.UpdateFormDefinitionRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {form_builder.form_definition.UpdateFormDefinitionRequest} UpdateFormDefinitionRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            UpdateFormDefinitionRequest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an UpdateFormDefinitionRequest message.
             * @function verify
             * @memberof form_builder.form_definition.UpdateFormDefinitionRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            UpdateFormDefinitionRequest.verify = function verify(message) {
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
                if (message.version != null && message.hasOwnProperty("version"))
                    if (!$util.isString(message.version))
                        return "version: string expected";
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
                if (message.schemaData != null && message.hasOwnProperty("schemaData"))
                    if (!(message.schemaData && typeof message.schemaData.length === "number" || $util.isString(message.schemaData)))
                        return "schemaData: buffer expected";
                if (message.metadataData != null && message.hasOwnProperty("metadataData"))
                    if (!(message.metadataData && typeof message.metadataData.length === "number" || $util.isString(message.metadataData)))
                        return "metadataData: buffer expected";
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
             * Creates an UpdateFormDefinitionRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof form_builder.form_definition.UpdateFormDefinitionRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {form_builder.form_definition.UpdateFormDefinitionRequest} UpdateFormDefinitionRequest
             */
            UpdateFormDefinitionRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.form_builder.form_definition.UpdateFormDefinitionRequest)
                    return object;
                let message = new $root.form_builder.form_definition.UpdateFormDefinitionRequest();
                if (object.id != null)
                    message.id = String(object.id);
                if (object.name != null)
                    message.name = String(object.name);
                if (object.description != null)
                    message.description = String(object.description);
                if (object.version != null)
                    message.version = String(object.version);
                switch (object.status) {
                default:
                    if (typeof object.status === "number") {
                        message.status = object.status;
                        break;
                    }
                    break;
                case "FORM_STATUS_UNSPECIFIED":
                case 0:
                    message.status = 0;
                    break;
                case "FORM_STATUS_DRAFT":
                case 1:
                    message.status = 1;
                    break;
                case "FORM_STATUS_PUBLISHED":
                case 2:
                    message.status = 2;
                    break;
                case "FORM_STATUS_ARCHIVED":
                case 3:
                    message.status = 3;
                    break;
                }
                if (object.schemaData != null)
                    if (typeof object.schemaData === "string")
                        $util.base64.decode(object.schemaData, message.schemaData = $util.newBuffer($util.base64.length(object.schemaData)), 0);
                    else if (object.schemaData.length >= 0)
                        message.schemaData = object.schemaData;
                if (object.metadataData != null)
                    if (typeof object.metadataData === "string")
                        $util.base64.decode(object.metadataData, message.metadataData = $util.newBuffer($util.base64.length(object.metadataData)), 0);
                    else if (object.metadataData.length >= 0)
                        message.metadataData = object.metadataData;
                if (object.tagNames) {
                    if (!Array.isArray(object.tagNames))
                        throw TypeError(".form_builder.form_definition.UpdateFormDefinitionRequest.tagNames: array expected");
                    message.tagNames = [];
                    for (let i = 0; i < object.tagNames.length; ++i)
                        message.tagNames[i] = String(object.tagNames[i]);
                }
                return message;
            };

            /**
             * Creates a plain object from an UpdateFormDefinitionRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof form_builder.form_definition.UpdateFormDefinitionRequest
             * @static
             * @param {form_builder.form_definition.UpdateFormDefinitionRequest} message UpdateFormDefinitionRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            UpdateFormDefinitionRequest.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.arrays || options.defaults)
                    object.tagNames = [];
                if (options.defaults) {
                    object.id = "";
                    object.name = "";
                    object.description = "";
                    object.version = "";
                    object.status = options.enums === String ? "FORM_STATUS_UNSPECIFIED" : 0;
                    if (options.bytes === String)
                        object.schemaData = "";
                    else {
                        object.schemaData = [];
                        if (options.bytes !== Array)
                            object.schemaData = $util.newBuffer(object.schemaData);
                    }
                    if (options.bytes === String)
                        object.metadataData = "";
                    else {
                        object.metadataData = [];
                        if (options.bytes !== Array)
                            object.metadataData = $util.newBuffer(object.metadataData);
                    }
                }
                if (message.id != null && message.hasOwnProperty("id"))
                    object.id = message.id;
                if (message.name != null && message.hasOwnProperty("name"))
                    object.name = message.name;
                if (message.description != null && message.hasOwnProperty("description"))
                    object.description = message.description;
                if (message.version != null && message.hasOwnProperty("version"))
                    object.version = message.version;
                if (message.status != null && message.hasOwnProperty("status"))
                    object.status = options.enums === String ? $root.form_builder.common.FormStatus[message.status] === undefined ? message.status : $root.form_builder.common.FormStatus[message.status] : message.status;
                if (message.schemaData != null && message.hasOwnProperty("schemaData"))
                    object.schemaData = options.bytes === String ? $util.base64.encode(message.schemaData, 0, message.schemaData.length) : options.bytes === Array ? Array.prototype.slice.call(message.schemaData) : message.schemaData;
                if (message.metadataData != null && message.hasOwnProperty("metadataData"))
                    object.metadataData = options.bytes === String ? $util.base64.encode(message.metadataData, 0, message.metadataData.length) : options.bytes === Array ? Array.prototype.slice.call(message.metadataData) : message.metadataData;
                if (message.tagNames && message.tagNames.length) {
                    object.tagNames = [];
                    for (let j = 0; j < message.tagNames.length; ++j)
                        object.tagNames[j] = message.tagNames[j];
                }
                return object;
            };

            /**
             * Converts this UpdateFormDefinitionRequest to JSON.
             * @function toJSON
             * @memberof form_builder.form_definition.UpdateFormDefinitionRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            UpdateFormDefinitionRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for UpdateFormDefinitionRequest
             * @function getTypeUrl
             * @memberof form_builder.form_definition.UpdateFormDefinitionRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            UpdateFormDefinitionRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/form_builder.form_definition.UpdateFormDefinitionRequest";
            };

            return UpdateFormDefinitionRequest;
        })();

        form_definition.UpdateFormDefinitionResponse = (function() {

            /**
             * Properties of an UpdateFormDefinitionResponse.
             * @memberof form_builder.form_definition
             * @interface IUpdateFormDefinitionResponse
             * @property {form_builder.form_definition.IFormDefinition|null} [formDefinition] UpdateFormDefinitionResponse formDefinition
             */

            /**
             * Constructs a new UpdateFormDefinitionResponse.
             * @memberof form_builder.form_definition
             * @classdesc Represents an UpdateFormDefinitionResponse.
             * @implements IUpdateFormDefinitionResponse
             * @constructor
             * @param {form_builder.form_definition.IUpdateFormDefinitionResponse=} [properties] Properties to set
             */
            function UpdateFormDefinitionResponse(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * UpdateFormDefinitionResponse formDefinition.
             * @member {form_builder.form_definition.IFormDefinition|null|undefined} formDefinition
             * @memberof form_builder.form_definition.UpdateFormDefinitionResponse
             * @instance
             */
            UpdateFormDefinitionResponse.prototype.formDefinition = null;

            /**
             * Creates a new UpdateFormDefinitionResponse instance using the specified properties.
             * @function create
             * @memberof form_builder.form_definition.UpdateFormDefinitionResponse
             * @static
             * @param {form_builder.form_definition.IUpdateFormDefinitionResponse=} [properties] Properties to set
             * @returns {form_builder.form_definition.UpdateFormDefinitionResponse} UpdateFormDefinitionResponse instance
             */
            UpdateFormDefinitionResponse.create = function create(properties) {
                return new UpdateFormDefinitionResponse(properties);
            };

            /**
             * Encodes the specified UpdateFormDefinitionResponse message. Does not implicitly {@link form_builder.form_definition.UpdateFormDefinitionResponse.verify|verify} messages.
             * @function encode
             * @memberof form_builder.form_definition.UpdateFormDefinitionResponse
             * @static
             * @param {form_builder.form_definition.IUpdateFormDefinitionResponse} message UpdateFormDefinitionResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            UpdateFormDefinitionResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.formDefinition != null && Object.hasOwnProperty.call(message, "formDefinition"))
                    $root.form_builder.form_definition.FormDefinition.encode(message.formDefinition, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified UpdateFormDefinitionResponse message, length delimited. Does not implicitly {@link form_builder.form_definition.UpdateFormDefinitionResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof form_builder.form_definition.UpdateFormDefinitionResponse
             * @static
             * @param {form_builder.form_definition.IUpdateFormDefinitionResponse} message UpdateFormDefinitionResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            UpdateFormDefinitionResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an UpdateFormDefinitionResponse message from the specified reader or buffer.
             * @function decode
             * @memberof form_builder.form_definition.UpdateFormDefinitionResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {form_builder.form_definition.UpdateFormDefinitionResponse} UpdateFormDefinitionResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            UpdateFormDefinitionResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.form_builder.form_definition.UpdateFormDefinitionResponse();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.formDefinition = $root.form_builder.form_definition.FormDefinition.decode(reader, reader.uint32());
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
             * Decodes an UpdateFormDefinitionResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof form_builder.form_definition.UpdateFormDefinitionResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {form_builder.form_definition.UpdateFormDefinitionResponse} UpdateFormDefinitionResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            UpdateFormDefinitionResponse.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an UpdateFormDefinitionResponse message.
             * @function verify
             * @memberof form_builder.form_definition.UpdateFormDefinitionResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            UpdateFormDefinitionResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.formDefinition != null && message.hasOwnProperty("formDefinition")) {
                    let error = $root.form_builder.form_definition.FormDefinition.verify(message.formDefinition);
                    if (error)
                        return "formDefinition." + error;
                }
                return null;
            };

            /**
             * Creates an UpdateFormDefinitionResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof form_builder.form_definition.UpdateFormDefinitionResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {form_builder.form_definition.UpdateFormDefinitionResponse} UpdateFormDefinitionResponse
             */
            UpdateFormDefinitionResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.form_builder.form_definition.UpdateFormDefinitionResponse)
                    return object;
                let message = new $root.form_builder.form_definition.UpdateFormDefinitionResponse();
                if (object.formDefinition != null) {
                    if (typeof object.formDefinition !== "object")
                        throw TypeError(".form_builder.form_definition.UpdateFormDefinitionResponse.formDefinition: object expected");
                    message.formDefinition = $root.form_builder.form_definition.FormDefinition.fromObject(object.formDefinition);
                }
                return message;
            };

            /**
             * Creates a plain object from an UpdateFormDefinitionResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof form_builder.form_definition.UpdateFormDefinitionResponse
             * @static
             * @param {form_builder.form_definition.UpdateFormDefinitionResponse} message UpdateFormDefinitionResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            UpdateFormDefinitionResponse.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults)
                    object.formDefinition = null;
                if (message.formDefinition != null && message.hasOwnProperty("formDefinition"))
                    object.formDefinition = $root.form_builder.form_definition.FormDefinition.toObject(message.formDefinition, options);
                return object;
            };

            /**
             * Converts this UpdateFormDefinitionResponse to JSON.
             * @function toJSON
             * @memberof form_builder.form_definition.UpdateFormDefinitionResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            UpdateFormDefinitionResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for UpdateFormDefinitionResponse
             * @function getTypeUrl
             * @memberof form_builder.form_definition.UpdateFormDefinitionResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            UpdateFormDefinitionResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/form_builder.form_definition.UpdateFormDefinitionResponse";
            };

            return UpdateFormDefinitionResponse;
        })();

        form_definition.DeleteFormDefinitionRequest = (function() {

            /**
             * Properties of a DeleteFormDefinitionRequest.
             * @memberof form_builder.form_definition
             * @interface IDeleteFormDefinitionRequest
             * @property {string|null} [id] DeleteFormDefinitionRequest id
             */

            /**
             * Constructs a new DeleteFormDefinitionRequest.
             * @memberof form_builder.form_definition
             * @classdesc Represents a DeleteFormDefinitionRequest.
             * @implements IDeleteFormDefinitionRequest
             * @constructor
             * @param {form_builder.form_definition.IDeleteFormDefinitionRequest=} [properties] Properties to set
             */
            function DeleteFormDefinitionRequest(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * DeleteFormDefinitionRequest id.
             * @member {string} id
             * @memberof form_builder.form_definition.DeleteFormDefinitionRequest
             * @instance
             */
            DeleteFormDefinitionRequest.prototype.id = "";

            /**
             * Creates a new DeleteFormDefinitionRequest instance using the specified properties.
             * @function create
             * @memberof form_builder.form_definition.DeleteFormDefinitionRequest
             * @static
             * @param {form_builder.form_definition.IDeleteFormDefinitionRequest=} [properties] Properties to set
             * @returns {form_builder.form_definition.DeleteFormDefinitionRequest} DeleteFormDefinitionRequest instance
             */
            DeleteFormDefinitionRequest.create = function create(properties) {
                return new DeleteFormDefinitionRequest(properties);
            };

            /**
             * Encodes the specified DeleteFormDefinitionRequest message. Does not implicitly {@link form_builder.form_definition.DeleteFormDefinitionRequest.verify|verify} messages.
             * @function encode
             * @memberof form_builder.form_definition.DeleteFormDefinitionRequest
             * @static
             * @param {form_builder.form_definition.IDeleteFormDefinitionRequest} message DeleteFormDefinitionRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DeleteFormDefinitionRequest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
                return writer;
            };

            /**
             * Encodes the specified DeleteFormDefinitionRequest message, length delimited. Does not implicitly {@link form_builder.form_definition.DeleteFormDefinitionRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof form_builder.form_definition.DeleteFormDefinitionRequest
             * @static
             * @param {form_builder.form_definition.IDeleteFormDefinitionRequest} message DeleteFormDefinitionRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DeleteFormDefinitionRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a DeleteFormDefinitionRequest message from the specified reader or buffer.
             * @function decode
             * @memberof form_builder.form_definition.DeleteFormDefinitionRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {form_builder.form_definition.DeleteFormDefinitionRequest} DeleteFormDefinitionRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DeleteFormDefinitionRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.form_builder.form_definition.DeleteFormDefinitionRequest();
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
             * Decodes a DeleteFormDefinitionRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof form_builder.form_definition.DeleteFormDefinitionRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {form_builder.form_definition.DeleteFormDefinitionRequest} DeleteFormDefinitionRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DeleteFormDefinitionRequest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a DeleteFormDefinitionRequest message.
             * @function verify
             * @memberof form_builder.form_definition.DeleteFormDefinitionRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            DeleteFormDefinitionRequest.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.id != null && message.hasOwnProperty("id"))
                    if (!$util.isString(message.id))
                        return "id: string expected";
                return null;
            };

            /**
             * Creates a DeleteFormDefinitionRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof form_builder.form_definition.DeleteFormDefinitionRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {form_builder.form_definition.DeleteFormDefinitionRequest} DeleteFormDefinitionRequest
             */
            DeleteFormDefinitionRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.form_builder.form_definition.DeleteFormDefinitionRequest)
                    return object;
                let message = new $root.form_builder.form_definition.DeleteFormDefinitionRequest();
                if (object.id != null)
                    message.id = String(object.id);
                return message;
            };

            /**
             * Creates a plain object from a DeleteFormDefinitionRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof form_builder.form_definition.DeleteFormDefinitionRequest
             * @static
             * @param {form_builder.form_definition.DeleteFormDefinitionRequest} message DeleteFormDefinitionRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            DeleteFormDefinitionRequest.toObject = function toObject(message, options) {
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
             * Converts this DeleteFormDefinitionRequest to JSON.
             * @function toJSON
             * @memberof form_builder.form_definition.DeleteFormDefinitionRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            DeleteFormDefinitionRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for DeleteFormDefinitionRequest
             * @function getTypeUrl
             * @memberof form_builder.form_definition.DeleteFormDefinitionRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            DeleteFormDefinitionRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/form_builder.form_definition.DeleteFormDefinitionRequest";
            };

            return DeleteFormDefinitionRequest;
        })();

        form_definition.DeleteFormDefinitionResponse = (function() {

            /**
             * Properties of a DeleteFormDefinitionResponse.
             * @memberof form_builder.form_definition
             * @interface IDeleteFormDefinitionResponse
             * @property {boolean|null} [success] DeleteFormDefinitionResponse success
             */

            /**
             * Constructs a new DeleteFormDefinitionResponse.
             * @memberof form_builder.form_definition
             * @classdesc Represents a DeleteFormDefinitionResponse.
             * @implements IDeleteFormDefinitionResponse
             * @constructor
             * @param {form_builder.form_definition.IDeleteFormDefinitionResponse=} [properties] Properties to set
             */
            function DeleteFormDefinitionResponse(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * DeleteFormDefinitionResponse success.
             * @member {boolean} success
             * @memberof form_builder.form_definition.DeleteFormDefinitionResponse
             * @instance
             */
            DeleteFormDefinitionResponse.prototype.success = false;

            /**
             * Creates a new DeleteFormDefinitionResponse instance using the specified properties.
             * @function create
             * @memberof form_builder.form_definition.DeleteFormDefinitionResponse
             * @static
             * @param {form_builder.form_definition.IDeleteFormDefinitionResponse=} [properties] Properties to set
             * @returns {form_builder.form_definition.DeleteFormDefinitionResponse} DeleteFormDefinitionResponse instance
             */
            DeleteFormDefinitionResponse.create = function create(properties) {
                return new DeleteFormDefinitionResponse(properties);
            };

            /**
             * Encodes the specified DeleteFormDefinitionResponse message. Does not implicitly {@link form_builder.form_definition.DeleteFormDefinitionResponse.verify|verify} messages.
             * @function encode
             * @memberof form_builder.form_definition.DeleteFormDefinitionResponse
             * @static
             * @param {form_builder.form_definition.IDeleteFormDefinitionResponse} message DeleteFormDefinitionResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DeleteFormDefinitionResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.success != null && Object.hasOwnProperty.call(message, "success"))
                    writer.uint32(/* id 1, wireType 0 =*/8).bool(message.success);
                return writer;
            };

            /**
             * Encodes the specified DeleteFormDefinitionResponse message, length delimited. Does not implicitly {@link form_builder.form_definition.DeleteFormDefinitionResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof form_builder.form_definition.DeleteFormDefinitionResponse
             * @static
             * @param {form_builder.form_definition.IDeleteFormDefinitionResponse} message DeleteFormDefinitionResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DeleteFormDefinitionResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a DeleteFormDefinitionResponse message from the specified reader or buffer.
             * @function decode
             * @memberof form_builder.form_definition.DeleteFormDefinitionResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {form_builder.form_definition.DeleteFormDefinitionResponse} DeleteFormDefinitionResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DeleteFormDefinitionResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.form_builder.form_definition.DeleteFormDefinitionResponse();
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
             * Decodes a DeleteFormDefinitionResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof form_builder.form_definition.DeleteFormDefinitionResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {form_builder.form_definition.DeleteFormDefinitionResponse} DeleteFormDefinitionResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DeleteFormDefinitionResponse.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a DeleteFormDefinitionResponse message.
             * @function verify
             * @memberof form_builder.form_definition.DeleteFormDefinitionResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            DeleteFormDefinitionResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.success != null && message.hasOwnProperty("success"))
                    if (typeof message.success !== "boolean")
                        return "success: boolean expected";
                return null;
            };

            /**
             * Creates a DeleteFormDefinitionResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof form_builder.form_definition.DeleteFormDefinitionResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {form_builder.form_definition.DeleteFormDefinitionResponse} DeleteFormDefinitionResponse
             */
            DeleteFormDefinitionResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.form_builder.form_definition.DeleteFormDefinitionResponse)
                    return object;
                let message = new $root.form_builder.form_definition.DeleteFormDefinitionResponse();
                if (object.success != null)
                    message.success = Boolean(object.success);
                return message;
            };

            /**
             * Creates a plain object from a DeleteFormDefinitionResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof form_builder.form_definition.DeleteFormDefinitionResponse
             * @static
             * @param {form_builder.form_definition.DeleteFormDefinitionResponse} message DeleteFormDefinitionResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            DeleteFormDefinitionResponse.toObject = function toObject(message, options) {
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
             * Converts this DeleteFormDefinitionResponse to JSON.
             * @function toJSON
             * @memberof form_builder.form_definition.DeleteFormDefinitionResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            DeleteFormDefinitionResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for DeleteFormDefinitionResponse
             * @function getTypeUrl
             * @memberof form_builder.form_definition.DeleteFormDefinitionResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            DeleteFormDefinitionResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/form_builder.form_definition.DeleteFormDefinitionResponse";
            };

            return DeleteFormDefinitionResponse;
        })();

        return form_definition;
    })();

    form_builder.tag = (function() {

        /**
         * Namespace tag.
         * @memberof form_builder
         * @namespace
         */
        const tag = {};

        tag.Tag = (function() {

            /**
             * Properties of a Tag.
             * @memberof form_builder.tag
             * @interface ITag
             * @property {string|null} [id] Tag id
             * @property {string|null} [name] Tag name
             * @property {string|null} [color] Tag color
             * @property {form_builder.common.ITimestamp|null} [createdAt] Tag createdAt
             * @property {form_builder.common.ITimestamp|null} [updatedAt] Tag updatedAt
             */

            /**
             * Constructs a new Tag.
             * @memberof form_builder.tag
             * @classdesc Represents a Tag.
             * @implements ITag
             * @constructor
             * @param {form_builder.tag.ITag=} [properties] Properties to set
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
             * @memberof form_builder.tag.Tag
             * @instance
             */
            Tag.prototype.id = "";

            /**
             * Tag name.
             * @member {string} name
             * @memberof form_builder.tag.Tag
             * @instance
             */
            Tag.prototype.name = "";

            /**
             * Tag color.
             * @member {string} color
             * @memberof form_builder.tag.Tag
             * @instance
             */
            Tag.prototype.color = "";

            /**
             * Tag createdAt.
             * @member {form_builder.common.ITimestamp|null|undefined} createdAt
             * @memberof form_builder.tag.Tag
             * @instance
             */
            Tag.prototype.createdAt = null;

            /**
             * Tag updatedAt.
             * @member {form_builder.common.ITimestamp|null|undefined} updatedAt
             * @memberof form_builder.tag.Tag
             * @instance
             */
            Tag.prototype.updatedAt = null;

            /**
             * Creates a new Tag instance using the specified properties.
             * @function create
             * @memberof form_builder.tag.Tag
             * @static
             * @param {form_builder.tag.ITag=} [properties] Properties to set
             * @returns {form_builder.tag.Tag} Tag instance
             */
            Tag.create = function create(properties) {
                return new Tag(properties);
            };

            /**
             * Encodes the specified Tag message. Does not implicitly {@link form_builder.tag.Tag.verify|verify} messages.
             * @function encode
             * @memberof form_builder.tag.Tag
             * @static
             * @param {form_builder.tag.ITag} message Tag message or plain object to encode
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
                if (message.color != null && Object.hasOwnProperty.call(message, "color"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.color);
                if (message.createdAt != null && Object.hasOwnProperty.call(message, "createdAt"))
                    $root.form_builder.common.Timestamp.encode(message.createdAt, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                if (message.updatedAt != null && Object.hasOwnProperty.call(message, "updatedAt"))
                    $root.form_builder.common.Timestamp.encode(message.updatedAt, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified Tag message, length delimited. Does not implicitly {@link form_builder.tag.Tag.verify|verify} messages.
             * @function encodeDelimited
             * @memberof form_builder.tag.Tag
             * @static
             * @param {form_builder.tag.ITag} message Tag message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Tag.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Tag message from the specified reader or buffer.
             * @function decode
             * @memberof form_builder.tag.Tag
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {form_builder.tag.Tag} Tag
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Tag.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.form_builder.tag.Tag();
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
                            message.color = reader.string();
                            break;
                        }
                    case 4: {
                            message.createdAt = $root.form_builder.common.Timestamp.decode(reader, reader.uint32());
                            break;
                        }
                    case 5: {
                            message.updatedAt = $root.form_builder.common.Timestamp.decode(reader, reader.uint32());
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
             * @memberof form_builder.tag.Tag
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {form_builder.tag.Tag} Tag
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
             * @memberof form_builder.tag.Tag
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
                if (message.color != null && message.hasOwnProperty("color"))
                    if (!$util.isString(message.color))
                        return "color: string expected";
                if (message.createdAt != null && message.hasOwnProperty("createdAt")) {
                    let error = $root.form_builder.common.Timestamp.verify(message.createdAt);
                    if (error)
                        return "createdAt." + error;
                }
                if (message.updatedAt != null && message.hasOwnProperty("updatedAt")) {
                    let error = $root.form_builder.common.Timestamp.verify(message.updatedAt);
                    if (error)
                        return "updatedAt." + error;
                }
                return null;
            };

            /**
             * Creates a Tag message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof form_builder.tag.Tag
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {form_builder.tag.Tag} Tag
             */
            Tag.fromObject = function fromObject(object) {
                if (object instanceof $root.form_builder.tag.Tag)
                    return object;
                let message = new $root.form_builder.tag.Tag();
                if (object.id != null)
                    message.id = String(object.id);
                if (object.name != null)
                    message.name = String(object.name);
                if (object.color != null)
                    message.color = String(object.color);
                if (object.createdAt != null) {
                    if (typeof object.createdAt !== "object")
                        throw TypeError(".form_builder.tag.Tag.createdAt: object expected");
                    message.createdAt = $root.form_builder.common.Timestamp.fromObject(object.createdAt);
                }
                if (object.updatedAt != null) {
                    if (typeof object.updatedAt !== "object")
                        throw TypeError(".form_builder.tag.Tag.updatedAt: object expected");
                    message.updatedAt = $root.form_builder.common.Timestamp.fromObject(object.updatedAt);
                }
                return message;
            };

            /**
             * Creates a plain object from a Tag message. Also converts values to other types if specified.
             * @function toObject
             * @memberof form_builder.tag.Tag
             * @static
             * @param {form_builder.tag.Tag} message Tag
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
                    object.color = "";
                    object.createdAt = null;
                    object.updatedAt = null;
                }
                if (message.id != null && message.hasOwnProperty("id"))
                    object.id = message.id;
                if (message.name != null && message.hasOwnProperty("name"))
                    object.name = message.name;
                if (message.color != null && message.hasOwnProperty("color"))
                    object.color = message.color;
                if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                    object.createdAt = $root.form_builder.common.Timestamp.toObject(message.createdAt, options);
                if (message.updatedAt != null && message.hasOwnProperty("updatedAt"))
                    object.updatedAt = $root.form_builder.common.Timestamp.toObject(message.updatedAt, options);
                return object;
            };

            /**
             * Converts this Tag to JSON.
             * @function toJSON
             * @memberof form_builder.tag.Tag
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Tag.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Tag
             * @function getTypeUrl
             * @memberof form_builder.tag.Tag
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Tag.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/form_builder.tag.Tag";
            };

            return Tag;
        })();

        tag.TagListResponse = (function() {

            /**
             * Properties of a TagListResponse.
             * @memberof form_builder.tag
             * @interface ITagListResponse
             * @property {Array.<form_builder.tag.ITag>|null} [tags] TagListResponse tags
             */

            /**
             * Constructs a new TagListResponse.
             * @memberof form_builder.tag
             * @classdesc Represents a TagListResponse.
             * @implements ITagListResponse
             * @constructor
             * @param {form_builder.tag.ITagListResponse=} [properties] Properties to set
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
             * @member {Array.<form_builder.tag.ITag>} tags
             * @memberof form_builder.tag.TagListResponse
             * @instance
             */
            TagListResponse.prototype.tags = $util.emptyArray;

            /**
             * Creates a new TagListResponse instance using the specified properties.
             * @function create
             * @memberof form_builder.tag.TagListResponse
             * @static
             * @param {form_builder.tag.ITagListResponse=} [properties] Properties to set
             * @returns {form_builder.tag.TagListResponse} TagListResponse instance
             */
            TagListResponse.create = function create(properties) {
                return new TagListResponse(properties);
            };

            /**
             * Encodes the specified TagListResponse message. Does not implicitly {@link form_builder.tag.TagListResponse.verify|verify} messages.
             * @function encode
             * @memberof form_builder.tag.TagListResponse
             * @static
             * @param {form_builder.tag.ITagListResponse} message TagListResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TagListResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.tags != null && message.tags.length)
                    for (let i = 0; i < message.tags.length; ++i)
                        $root.form_builder.tag.Tag.encode(message.tags[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified TagListResponse message, length delimited. Does not implicitly {@link form_builder.tag.TagListResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof form_builder.tag.TagListResponse
             * @static
             * @param {form_builder.tag.ITagListResponse} message TagListResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TagListResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a TagListResponse message from the specified reader or buffer.
             * @function decode
             * @memberof form_builder.tag.TagListResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {form_builder.tag.TagListResponse} TagListResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TagListResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.form_builder.tag.TagListResponse();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            if (!(message.tags && message.tags.length))
                                message.tags = [];
                            message.tags.push($root.form_builder.tag.Tag.decode(reader, reader.uint32()));
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
             * @memberof form_builder.tag.TagListResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {form_builder.tag.TagListResponse} TagListResponse
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
             * @memberof form_builder.tag.TagListResponse
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
                        let error = $root.form_builder.tag.Tag.verify(message.tags[i]);
                        if (error)
                            return "tags." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a TagListResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof form_builder.tag.TagListResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {form_builder.tag.TagListResponse} TagListResponse
             */
            TagListResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.form_builder.tag.TagListResponse)
                    return object;
                let message = new $root.form_builder.tag.TagListResponse();
                if (object.tags) {
                    if (!Array.isArray(object.tags))
                        throw TypeError(".form_builder.tag.TagListResponse.tags: array expected");
                    message.tags = [];
                    for (let i = 0; i < object.tags.length; ++i) {
                        if (typeof object.tags[i] !== "object")
                            throw TypeError(".form_builder.tag.TagListResponse.tags: object expected");
                        message.tags[i] = $root.form_builder.tag.Tag.fromObject(object.tags[i]);
                    }
                }
                return message;
            };

            /**
             * Creates a plain object from a TagListResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof form_builder.tag.TagListResponse
             * @static
             * @param {form_builder.tag.TagListResponse} message TagListResponse
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
                        object.tags[j] = $root.form_builder.tag.Tag.toObject(message.tags[j], options);
                }
                return object;
            };

            /**
             * Converts this TagListResponse to JSON.
             * @function toJSON
             * @memberof form_builder.tag.TagListResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            TagListResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for TagListResponse
             * @function getTypeUrl
             * @memberof form_builder.tag.TagListResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            TagListResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/form_builder.tag.TagListResponse";
            };

            return TagListResponse;
        })();

        tag.CreateTagRequest = (function() {

            /**
             * Properties of a CreateTagRequest.
             * @memberof form_builder.tag
             * @interface ICreateTagRequest
             * @property {string|null} [name] CreateTagRequest name
             * @property {string|null} [color] CreateTagRequest color
             */

            /**
             * Constructs a new CreateTagRequest.
             * @memberof form_builder.tag
             * @classdesc Represents a CreateTagRequest.
             * @implements ICreateTagRequest
             * @constructor
             * @param {form_builder.tag.ICreateTagRequest=} [properties] Properties to set
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
             * @memberof form_builder.tag.CreateTagRequest
             * @instance
             */
            CreateTagRequest.prototype.name = "";

            /**
             * CreateTagRequest color.
             * @member {string} color
             * @memberof form_builder.tag.CreateTagRequest
             * @instance
             */
            CreateTagRequest.prototype.color = "";

            /**
             * Creates a new CreateTagRequest instance using the specified properties.
             * @function create
             * @memberof form_builder.tag.CreateTagRequest
             * @static
             * @param {form_builder.tag.ICreateTagRequest=} [properties] Properties to set
             * @returns {form_builder.tag.CreateTagRequest} CreateTagRequest instance
             */
            CreateTagRequest.create = function create(properties) {
                return new CreateTagRequest(properties);
            };

            /**
             * Encodes the specified CreateTagRequest message. Does not implicitly {@link form_builder.tag.CreateTagRequest.verify|verify} messages.
             * @function encode
             * @memberof form_builder.tag.CreateTagRequest
             * @static
             * @param {form_builder.tag.ICreateTagRequest} message CreateTagRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CreateTagRequest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
                if (message.color != null && Object.hasOwnProperty.call(message, "color"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.color);
                return writer;
            };

            /**
             * Encodes the specified CreateTagRequest message, length delimited. Does not implicitly {@link form_builder.tag.CreateTagRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof form_builder.tag.CreateTagRequest
             * @static
             * @param {form_builder.tag.ICreateTagRequest} message CreateTagRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CreateTagRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a CreateTagRequest message from the specified reader or buffer.
             * @function decode
             * @memberof form_builder.tag.CreateTagRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {form_builder.tag.CreateTagRequest} CreateTagRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CreateTagRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.form_builder.tag.CreateTagRequest();
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
                            message.color = reader.string();
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
             * @memberof form_builder.tag.CreateTagRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {form_builder.tag.CreateTagRequest} CreateTagRequest
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
             * @memberof form_builder.tag.CreateTagRequest
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
                if (message.color != null && message.hasOwnProperty("color"))
                    if (!$util.isString(message.color))
                        return "color: string expected";
                return null;
            };

            /**
             * Creates a CreateTagRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof form_builder.tag.CreateTagRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {form_builder.tag.CreateTagRequest} CreateTagRequest
             */
            CreateTagRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.form_builder.tag.CreateTagRequest)
                    return object;
                let message = new $root.form_builder.tag.CreateTagRequest();
                if (object.name != null)
                    message.name = String(object.name);
                if (object.color != null)
                    message.color = String(object.color);
                return message;
            };

            /**
             * Creates a plain object from a CreateTagRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof form_builder.tag.CreateTagRequest
             * @static
             * @param {form_builder.tag.CreateTagRequest} message CreateTagRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            CreateTagRequest.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.name = "";
                    object.color = "";
                }
                if (message.name != null && message.hasOwnProperty("name"))
                    object.name = message.name;
                if (message.color != null && message.hasOwnProperty("color"))
                    object.color = message.color;
                return object;
            };

            /**
             * Converts this CreateTagRequest to JSON.
             * @function toJSON
             * @memberof form_builder.tag.CreateTagRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            CreateTagRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for CreateTagRequest
             * @function getTypeUrl
             * @memberof form_builder.tag.CreateTagRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            CreateTagRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/form_builder.tag.CreateTagRequest";
            };

            return CreateTagRequest;
        })();

        tag.CreateTagResponse = (function() {

            /**
             * Properties of a CreateTagResponse.
             * @memberof form_builder.tag
             * @interface ICreateTagResponse
             * @property {form_builder.tag.ITag|null} [tag] CreateTagResponse tag
             */

            /**
             * Constructs a new CreateTagResponse.
             * @memberof form_builder.tag
             * @classdesc Represents a CreateTagResponse.
             * @implements ICreateTagResponse
             * @constructor
             * @param {form_builder.tag.ICreateTagResponse=} [properties] Properties to set
             */
            function CreateTagResponse(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * CreateTagResponse tag.
             * @member {form_builder.tag.ITag|null|undefined} tag
             * @memberof form_builder.tag.CreateTagResponse
             * @instance
             */
            CreateTagResponse.prototype.tag = null;

            /**
             * Creates a new CreateTagResponse instance using the specified properties.
             * @function create
             * @memberof form_builder.tag.CreateTagResponse
             * @static
             * @param {form_builder.tag.ICreateTagResponse=} [properties] Properties to set
             * @returns {form_builder.tag.CreateTagResponse} CreateTagResponse instance
             */
            CreateTagResponse.create = function create(properties) {
                return new CreateTagResponse(properties);
            };

            /**
             * Encodes the specified CreateTagResponse message. Does not implicitly {@link form_builder.tag.CreateTagResponse.verify|verify} messages.
             * @function encode
             * @memberof form_builder.tag.CreateTagResponse
             * @static
             * @param {form_builder.tag.ICreateTagResponse} message CreateTagResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CreateTagResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.tag != null && Object.hasOwnProperty.call(message, "tag"))
                    $root.form_builder.tag.Tag.encode(message.tag, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified CreateTagResponse message, length delimited. Does not implicitly {@link form_builder.tag.CreateTagResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof form_builder.tag.CreateTagResponse
             * @static
             * @param {form_builder.tag.ICreateTagResponse} message CreateTagResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CreateTagResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a CreateTagResponse message from the specified reader or buffer.
             * @function decode
             * @memberof form_builder.tag.CreateTagResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {form_builder.tag.CreateTagResponse} CreateTagResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CreateTagResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.form_builder.tag.CreateTagResponse();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.tag = $root.form_builder.tag.Tag.decode(reader, reader.uint32());
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
             * @memberof form_builder.tag.CreateTagResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {form_builder.tag.CreateTagResponse} CreateTagResponse
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
             * @memberof form_builder.tag.CreateTagResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            CreateTagResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.tag != null && message.hasOwnProperty("tag")) {
                    let error = $root.form_builder.tag.Tag.verify(message.tag);
                    if (error)
                        return "tag." + error;
                }
                return null;
            };

            /**
             * Creates a CreateTagResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof form_builder.tag.CreateTagResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {form_builder.tag.CreateTagResponse} CreateTagResponse
             */
            CreateTagResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.form_builder.tag.CreateTagResponse)
                    return object;
                let message = new $root.form_builder.tag.CreateTagResponse();
                if (object.tag != null) {
                    if (typeof object.tag !== "object")
                        throw TypeError(".form_builder.tag.CreateTagResponse.tag: object expected");
                    message.tag = $root.form_builder.tag.Tag.fromObject(object.tag);
                }
                return message;
            };

            /**
             * Creates a plain object from a CreateTagResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof form_builder.tag.CreateTagResponse
             * @static
             * @param {form_builder.tag.CreateTagResponse} message CreateTagResponse
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
                    object.tag = $root.form_builder.tag.Tag.toObject(message.tag, options);
                return object;
            };

            /**
             * Converts this CreateTagResponse to JSON.
             * @function toJSON
             * @memberof form_builder.tag.CreateTagResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            CreateTagResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for CreateTagResponse
             * @function getTypeUrl
             * @memberof form_builder.tag.CreateTagResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            CreateTagResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/form_builder.tag.CreateTagResponse";
            };

            return CreateTagResponse;
        })();

        tag.UpdateTagRequest = (function() {

            /**
             * Properties of an UpdateTagRequest.
             * @memberof form_builder.tag
             * @interface IUpdateTagRequest
             * @property {string|null} [id] UpdateTagRequest id
             * @property {string|null} [name] UpdateTagRequest name
             * @property {string|null} [color] UpdateTagRequest color
             */

            /**
             * Constructs a new UpdateTagRequest.
             * @memberof form_builder.tag
             * @classdesc Represents an UpdateTagRequest.
             * @implements IUpdateTagRequest
             * @constructor
             * @param {form_builder.tag.IUpdateTagRequest=} [properties] Properties to set
             */
            function UpdateTagRequest(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * UpdateTagRequest id.
             * @member {string} id
             * @memberof form_builder.tag.UpdateTagRequest
             * @instance
             */
            UpdateTagRequest.prototype.id = "";

            /**
             * UpdateTagRequest name.
             * @member {string} name
             * @memberof form_builder.tag.UpdateTagRequest
             * @instance
             */
            UpdateTagRequest.prototype.name = "";

            /**
             * UpdateTagRequest color.
             * @member {string} color
             * @memberof form_builder.tag.UpdateTagRequest
             * @instance
             */
            UpdateTagRequest.prototype.color = "";

            /**
             * Creates a new UpdateTagRequest instance using the specified properties.
             * @function create
             * @memberof form_builder.tag.UpdateTagRequest
             * @static
             * @param {form_builder.tag.IUpdateTagRequest=} [properties] Properties to set
             * @returns {form_builder.tag.UpdateTagRequest} UpdateTagRequest instance
             */
            UpdateTagRequest.create = function create(properties) {
                return new UpdateTagRequest(properties);
            };

            /**
             * Encodes the specified UpdateTagRequest message. Does not implicitly {@link form_builder.tag.UpdateTagRequest.verify|verify} messages.
             * @function encode
             * @memberof form_builder.tag.UpdateTagRequest
             * @static
             * @param {form_builder.tag.IUpdateTagRequest} message UpdateTagRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            UpdateTagRequest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
                if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
                if (message.color != null && Object.hasOwnProperty.call(message, "color"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.color);
                return writer;
            };

            /**
             * Encodes the specified UpdateTagRequest message, length delimited. Does not implicitly {@link form_builder.tag.UpdateTagRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof form_builder.tag.UpdateTagRequest
             * @static
             * @param {form_builder.tag.IUpdateTagRequest} message UpdateTagRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            UpdateTagRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an UpdateTagRequest message from the specified reader or buffer.
             * @function decode
             * @memberof form_builder.tag.UpdateTagRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {form_builder.tag.UpdateTagRequest} UpdateTagRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            UpdateTagRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.form_builder.tag.UpdateTagRequest();
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
                            message.color = reader.string();
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
             * @memberof form_builder.tag.UpdateTagRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {form_builder.tag.UpdateTagRequest} UpdateTagRequest
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
             * @memberof form_builder.tag.UpdateTagRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            UpdateTagRequest.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.id != null && message.hasOwnProperty("id"))
                    if (!$util.isString(message.id))
                        return "id: string expected";
                if (message.name != null && message.hasOwnProperty("name"))
                    if (!$util.isString(message.name))
                        return "name: string expected";
                if (message.color != null && message.hasOwnProperty("color"))
                    if (!$util.isString(message.color))
                        return "color: string expected";
                return null;
            };

            /**
             * Creates an UpdateTagRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof form_builder.tag.UpdateTagRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {form_builder.tag.UpdateTagRequest} UpdateTagRequest
             */
            UpdateTagRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.form_builder.tag.UpdateTagRequest)
                    return object;
                let message = new $root.form_builder.tag.UpdateTagRequest();
                if (object.id != null)
                    message.id = String(object.id);
                if (object.name != null)
                    message.name = String(object.name);
                if (object.color != null)
                    message.color = String(object.color);
                return message;
            };

            /**
             * Creates a plain object from an UpdateTagRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof form_builder.tag.UpdateTagRequest
             * @static
             * @param {form_builder.tag.UpdateTagRequest} message UpdateTagRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            UpdateTagRequest.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.id = "";
                    object.name = "";
                    object.color = "";
                }
                if (message.id != null && message.hasOwnProperty("id"))
                    object.id = message.id;
                if (message.name != null && message.hasOwnProperty("name"))
                    object.name = message.name;
                if (message.color != null && message.hasOwnProperty("color"))
                    object.color = message.color;
                return object;
            };

            /**
             * Converts this UpdateTagRequest to JSON.
             * @function toJSON
             * @memberof form_builder.tag.UpdateTagRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            UpdateTagRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for UpdateTagRequest
             * @function getTypeUrl
             * @memberof form_builder.tag.UpdateTagRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            UpdateTagRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/form_builder.tag.UpdateTagRequest";
            };

            return UpdateTagRequest;
        })();

        tag.UpdateTagResponse = (function() {

            /**
             * Properties of an UpdateTagResponse.
             * @memberof form_builder.tag
             * @interface IUpdateTagResponse
             * @property {form_builder.tag.ITag|null} [tag] UpdateTagResponse tag
             */

            /**
             * Constructs a new UpdateTagResponse.
             * @memberof form_builder.tag
             * @classdesc Represents an UpdateTagResponse.
             * @implements IUpdateTagResponse
             * @constructor
             * @param {form_builder.tag.IUpdateTagResponse=} [properties] Properties to set
             */
            function UpdateTagResponse(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * UpdateTagResponse tag.
             * @member {form_builder.tag.ITag|null|undefined} tag
             * @memberof form_builder.tag.UpdateTagResponse
             * @instance
             */
            UpdateTagResponse.prototype.tag = null;

            /**
             * Creates a new UpdateTagResponse instance using the specified properties.
             * @function create
             * @memberof form_builder.tag.UpdateTagResponse
             * @static
             * @param {form_builder.tag.IUpdateTagResponse=} [properties] Properties to set
             * @returns {form_builder.tag.UpdateTagResponse} UpdateTagResponse instance
             */
            UpdateTagResponse.create = function create(properties) {
                return new UpdateTagResponse(properties);
            };

            /**
             * Encodes the specified UpdateTagResponse message. Does not implicitly {@link form_builder.tag.UpdateTagResponse.verify|verify} messages.
             * @function encode
             * @memberof form_builder.tag.UpdateTagResponse
             * @static
             * @param {form_builder.tag.IUpdateTagResponse} message UpdateTagResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            UpdateTagResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.tag != null && Object.hasOwnProperty.call(message, "tag"))
                    $root.form_builder.tag.Tag.encode(message.tag, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified UpdateTagResponse message, length delimited. Does not implicitly {@link form_builder.tag.UpdateTagResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof form_builder.tag.UpdateTagResponse
             * @static
             * @param {form_builder.tag.IUpdateTagResponse} message UpdateTagResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            UpdateTagResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an UpdateTagResponse message from the specified reader or buffer.
             * @function decode
             * @memberof form_builder.tag.UpdateTagResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {form_builder.tag.UpdateTagResponse} UpdateTagResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            UpdateTagResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.form_builder.tag.UpdateTagResponse();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.tag = $root.form_builder.tag.Tag.decode(reader, reader.uint32());
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
             * @memberof form_builder.tag.UpdateTagResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {form_builder.tag.UpdateTagResponse} UpdateTagResponse
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
             * @memberof form_builder.tag.UpdateTagResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            UpdateTagResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.tag != null && message.hasOwnProperty("tag")) {
                    let error = $root.form_builder.tag.Tag.verify(message.tag);
                    if (error)
                        return "tag." + error;
                }
                return null;
            };

            /**
             * Creates an UpdateTagResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof form_builder.tag.UpdateTagResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {form_builder.tag.UpdateTagResponse} UpdateTagResponse
             */
            UpdateTagResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.form_builder.tag.UpdateTagResponse)
                    return object;
                let message = new $root.form_builder.tag.UpdateTagResponse();
                if (object.tag != null) {
                    if (typeof object.tag !== "object")
                        throw TypeError(".form_builder.tag.UpdateTagResponse.tag: object expected");
                    message.tag = $root.form_builder.tag.Tag.fromObject(object.tag);
                }
                return message;
            };

            /**
             * Creates a plain object from an UpdateTagResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof form_builder.tag.UpdateTagResponse
             * @static
             * @param {form_builder.tag.UpdateTagResponse} message UpdateTagResponse
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
                    object.tag = $root.form_builder.tag.Tag.toObject(message.tag, options);
                return object;
            };

            /**
             * Converts this UpdateTagResponse to JSON.
             * @function toJSON
             * @memberof form_builder.tag.UpdateTagResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            UpdateTagResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for UpdateTagResponse
             * @function getTypeUrl
             * @memberof form_builder.tag.UpdateTagResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            UpdateTagResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/form_builder.tag.UpdateTagResponse";
            };

            return UpdateTagResponse;
        })();

        tag.GetTagRequest = (function() {

            /**
             * Properties of a GetTagRequest.
             * @memberof form_builder.tag
             * @interface IGetTagRequest
             * @property {string|null} [id] GetTagRequest id
             */

            /**
             * Constructs a new GetTagRequest.
             * @memberof form_builder.tag
             * @classdesc Represents a GetTagRequest.
             * @implements IGetTagRequest
             * @constructor
             * @param {form_builder.tag.IGetTagRequest=} [properties] Properties to set
             */
            function GetTagRequest(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * GetTagRequest id.
             * @member {string} id
             * @memberof form_builder.tag.GetTagRequest
             * @instance
             */
            GetTagRequest.prototype.id = "";

            /**
             * Creates a new GetTagRequest instance using the specified properties.
             * @function create
             * @memberof form_builder.tag.GetTagRequest
             * @static
             * @param {form_builder.tag.IGetTagRequest=} [properties] Properties to set
             * @returns {form_builder.tag.GetTagRequest} GetTagRequest instance
             */
            GetTagRequest.create = function create(properties) {
                return new GetTagRequest(properties);
            };

            /**
             * Encodes the specified GetTagRequest message. Does not implicitly {@link form_builder.tag.GetTagRequest.verify|verify} messages.
             * @function encode
             * @memberof form_builder.tag.GetTagRequest
             * @static
             * @param {form_builder.tag.IGetTagRequest} message GetTagRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            GetTagRequest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
                return writer;
            };

            /**
             * Encodes the specified GetTagRequest message, length delimited. Does not implicitly {@link form_builder.tag.GetTagRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof form_builder.tag.GetTagRequest
             * @static
             * @param {form_builder.tag.IGetTagRequest} message GetTagRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            GetTagRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a GetTagRequest message from the specified reader or buffer.
             * @function decode
             * @memberof form_builder.tag.GetTagRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {form_builder.tag.GetTagRequest} GetTagRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            GetTagRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.form_builder.tag.GetTagRequest();
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
             * Decodes a GetTagRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof form_builder.tag.GetTagRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {form_builder.tag.GetTagRequest} GetTagRequest
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
             * @memberof form_builder.tag.GetTagRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            GetTagRequest.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.id != null && message.hasOwnProperty("id"))
                    if (!$util.isString(message.id))
                        return "id: string expected";
                return null;
            };

            /**
             * Creates a GetTagRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof form_builder.tag.GetTagRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {form_builder.tag.GetTagRequest} GetTagRequest
             */
            GetTagRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.form_builder.tag.GetTagRequest)
                    return object;
                let message = new $root.form_builder.tag.GetTagRequest();
                if (object.id != null)
                    message.id = String(object.id);
                return message;
            };

            /**
             * Creates a plain object from a GetTagRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof form_builder.tag.GetTagRequest
             * @static
             * @param {form_builder.tag.GetTagRequest} message GetTagRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            GetTagRequest.toObject = function toObject(message, options) {
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
             * Converts this GetTagRequest to JSON.
             * @function toJSON
             * @memberof form_builder.tag.GetTagRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            GetTagRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for GetTagRequest
             * @function getTypeUrl
             * @memberof form_builder.tag.GetTagRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            GetTagRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/form_builder.tag.GetTagRequest";
            };

            return GetTagRequest;
        })();

        tag.GetTagResponse = (function() {

            /**
             * Properties of a GetTagResponse.
             * @memberof form_builder.tag
             * @interface IGetTagResponse
             * @property {form_builder.tag.ITag|null} [tag] GetTagResponse tag
             */

            /**
             * Constructs a new GetTagResponse.
             * @memberof form_builder.tag
             * @classdesc Represents a GetTagResponse.
             * @implements IGetTagResponse
             * @constructor
             * @param {form_builder.tag.IGetTagResponse=} [properties] Properties to set
             */
            function GetTagResponse(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * GetTagResponse tag.
             * @member {form_builder.tag.ITag|null|undefined} tag
             * @memberof form_builder.tag.GetTagResponse
             * @instance
             */
            GetTagResponse.prototype.tag = null;

            /**
             * Creates a new GetTagResponse instance using the specified properties.
             * @function create
             * @memberof form_builder.tag.GetTagResponse
             * @static
             * @param {form_builder.tag.IGetTagResponse=} [properties] Properties to set
             * @returns {form_builder.tag.GetTagResponse} GetTagResponse instance
             */
            GetTagResponse.create = function create(properties) {
                return new GetTagResponse(properties);
            };

            /**
             * Encodes the specified GetTagResponse message. Does not implicitly {@link form_builder.tag.GetTagResponse.verify|verify} messages.
             * @function encode
             * @memberof form_builder.tag.GetTagResponse
             * @static
             * @param {form_builder.tag.IGetTagResponse} message GetTagResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            GetTagResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.tag != null && Object.hasOwnProperty.call(message, "tag"))
                    $root.form_builder.tag.Tag.encode(message.tag, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified GetTagResponse message, length delimited. Does not implicitly {@link form_builder.tag.GetTagResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof form_builder.tag.GetTagResponse
             * @static
             * @param {form_builder.tag.IGetTagResponse} message GetTagResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            GetTagResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a GetTagResponse message from the specified reader or buffer.
             * @function decode
             * @memberof form_builder.tag.GetTagResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {form_builder.tag.GetTagResponse} GetTagResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            GetTagResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.form_builder.tag.GetTagResponse();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.tag = $root.form_builder.tag.Tag.decode(reader, reader.uint32());
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
             * @memberof form_builder.tag.GetTagResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {form_builder.tag.GetTagResponse} GetTagResponse
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
             * @memberof form_builder.tag.GetTagResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            GetTagResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.tag != null && message.hasOwnProperty("tag")) {
                    let error = $root.form_builder.tag.Tag.verify(message.tag);
                    if (error)
                        return "tag." + error;
                }
                return null;
            };

            /**
             * Creates a GetTagResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof form_builder.tag.GetTagResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {form_builder.tag.GetTagResponse} GetTagResponse
             */
            GetTagResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.form_builder.tag.GetTagResponse)
                    return object;
                let message = new $root.form_builder.tag.GetTagResponse();
                if (object.tag != null) {
                    if (typeof object.tag !== "object")
                        throw TypeError(".form_builder.tag.GetTagResponse.tag: object expected");
                    message.tag = $root.form_builder.tag.Tag.fromObject(object.tag);
                }
                return message;
            };

            /**
             * Creates a plain object from a GetTagResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof form_builder.tag.GetTagResponse
             * @static
             * @param {form_builder.tag.GetTagResponse} message GetTagResponse
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
                    object.tag = $root.form_builder.tag.Tag.toObject(message.tag, options);
                return object;
            };

            /**
             * Converts this GetTagResponse to JSON.
             * @function toJSON
             * @memberof form_builder.tag.GetTagResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            GetTagResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for GetTagResponse
             * @function getTypeUrl
             * @memberof form_builder.tag.GetTagResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            GetTagResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/form_builder.tag.GetTagResponse";
            };

            return GetTagResponse;
        })();

        tag.DeleteTagRequest = (function() {

            /**
             * Properties of a DeleteTagRequest.
             * @memberof form_builder.tag
             * @interface IDeleteTagRequest
             * @property {string|null} [id] DeleteTagRequest id
             */

            /**
             * Constructs a new DeleteTagRequest.
             * @memberof form_builder.tag
             * @classdesc Represents a DeleteTagRequest.
             * @implements IDeleteTagRequest
             * @constructor
             * @param {form_builder.tag.IDeleteTagRequest=} [properties] Properties to set
             */
            function DeleteTagRequest(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * DeleteTagRequest id.
             * @member {string} id
             * @memberof form_builder.tag.DeleteTagRequest
             * @instance
             */
            DeleteTagRequest.prototype.id = "";

            /**
             * Creates a new DeleteTagRequest instance using the specified properties.
             * @function create
             * @memberof form_builder.tag.DeleteTagRequest
             * @static
             * @param {form_builder.tag.IDeleteTagRequest=} [properties] Properties to set
             * @returns {form_builder.tag.DeleteTagRequest} DeleteTagRequest instance
             */
            DeleteTagRequest.create = function create(properties) {
                return new DeleteTagRequest(properties);
            };

            /**
             * Encodes the specified DeleteTagRequest message. Does not implicitly {@link form_builder.tag.DeleteTagRequest.verify|verify} messages.
             * @function encode
             * @memberof form_builder.tag.DeleteTagRequest
             * @static
             * @param {form_builder.tag.IDeleteTagRequest} message DeleteTagRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DeleteTagRequest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
                return writer;
            };

            /**
             * Encodes the specified DeleteTagRequest message, length delimited. Does not implicitly {@link form_builder.tag.DeleteTagRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof form_builder.tag.DeleteTagRequest
             * @static
             * @param {form_builder.tag.IDeleteTagRequest} message DeleteTagRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DeleteTagRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a DeleteTagRequest message from the specified reader or buffer.
             * @function decode
             * @memberof form_builder.tag.DeleteTagRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {form_builder.tag.DeleteTagRequest} DeleteTagRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DeleteTagRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.form_builder.tag.DeleteTagRequest();
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
             * Decodes a DeleteTagRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof form_builder.tag.DeleteTagRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {form_builder.tag.DeleteTagRequest} DeleteTagRequest
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
             * @memberof form_builder.tag.DeleteTagRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            DeleteTagRequest.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.id != null && message.hasOwnProperty("id"))
                    if (!$util.isString(message.id))
                        return "id: string expected";
                return null;
            };

            /**
             * Creates a DeleteTagRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof form_builder.tag.DeleteTagRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {form_builder.tag.DeleteTagRequest} DeleteTagRequest
             */
            DeleteTagRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.form_builder.tag.DeleteTagRequest)
                    return object;
                let message = new $root.form_builder.tag.DeleteTagRequest();
                if (object.id != null)
                    message.id = String(object.id);
                return message;
            };

            /**
             * Creates a plain object from a DeleteTagRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof form_builder.tag.DeleteTagRequest
             * @static
             * @param {form_builder.tag.DeleteTagRequest} message DeleteTagRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            DeleteTagRequest.toObject = function toObject(message, options) {
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
             * Converts this DeleteTagRequest to JSON.
             * @function toJSON
             * @memberof form_builder.tag.DeleteTagRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            DeleteTagRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for DeleteTagRequest
             * @function getTypeUrl
             * @memberof form_builder.tag.DeleteTagRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            DeleteTagRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/form_builder.tag.DeleteTagRequest";
            };

            return DeleteTagRequest;
        })();

        tag.DeleteTagResponse = (function() {

            /**
             * Properties of a DeleteTagResponse.
             * @memberof form_builder.tag
             * @interface IDeleteTagResponse
             * @property {boolean|null} [success] DeleteTagResponse success
             */

            /**
             * Constructs a new DeleteTagResponse.
             * @memberof form_builder.tag
             * @classdesc Represents a DeleteTagResponse.
             * @implements IDeleteTagResponse
             * @constructor
             * @param {form_builder.tag.IDeleteTagResponse=} [properties] Properties to set
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
             * @memberof form_builder.tag.DeleteTagResponse
             * @instance
             */
            DeleteTagResponse.prototype.success = false;

            /**
             * Creates a new DeleteTagResponse instance using the specified properties.
             * @function create
             * @memberof form_builder.tag.DeleteTagResponse
             * @static
             * @param {form_builder.tag.IDeleteTagResponse=} [properties] Properties to set
             * @returns {form_builder.tag.DeleteTagResponse} DeleteTagResponse instance
             */
            DeleteTagResponse.create = function create(properties) {
                return new DeleteTagResponse(properties);
            };

            /**
             * Encodes the specified DeleteTagResponse message. Does not implicitly {@link form_builder.tag.DeleteTagResponse.verify|verify} messages.
             * @function encode
             * @memberof form_builder.tag.DeleteTagResponse
             * @static
             * @param {form_builder.tag.IDeleteTagResponse} message DeleteTagResponse message or plain object to encode
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
             * Encodes the specified DeleteTagResponse message, length delimited. Does not implicitly {@link form_builder.tag.DeleteTagResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof form_builder.tag.DeleteTagResponse
             * @static
             * @param {form_builder.tag.IDeleteTagResponse} message DeleteTagResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DeleteTagResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a DeleteTagResponse message from the specified reader or buffer.
             * @function decode
             * @memberof form_builder.tag.DeleteTagResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {form_builder.tag.DeleteTagResponse} DeleteTagResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DeleteTagResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.form_builder.tag.DeleteTagResponse();
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
             * @memberof form_builder.tag.DeleteTagResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {form_builder.tag.DeleteTagResponse} DeleteTagResponse
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
             * @memberof form_builder.tag.DeleteTagResponse
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
             * @memberof form_builder.tag.DeleteTagResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {form_builder.tag.DeleteTagResponse} DeleteTagResponse
             */
            DeleteTagResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.form_builder.tag.DeleteTagResponse)
                    return object;
                let message = new $root.form_builder.tag.DeleteTagResponse();
                if (object.success != null)
                    message.success = Boolean(object.success);
                return message;
            };

            /**
             * Creates a plain object from a DeleteTagResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof form_builder.tag.DeleteTagResponse
             * @static
             * @param {form_builder.tag.DeleteTagResponse} message DeleteTagResponse
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
             * @memberof form_builder.tag.DeleteTagResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            DeleteTagResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for DeleteTagResponse
             * @function getTypeUrl
             * @memberof form_builder.tag.DeleteTagResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            DeleteTagResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/form_builder.tag.DeleteTagResponse";
            };

            return DeleteTagResponse;
        })();

        return tag;
    })();

    form_builder.version = (function() {

        /**
         * Namespace version.
         * @memberof form_builder
         * @namespace
         */
        const version = {};

        version.FormVersion = (function() {

            /**
             * Properties of a FormVersion.
             * @memberof form_builder.version
             * @interface IFormVersion
             * @property {string|null} [id] FormVersion id
             * @property {string|null} [formDefinitionId] FormVersion formDefinitionId
             * @property {string|null} [version] FormVersion version
             * @property {Uint8Array|null} [schemaData] FormVersion schemaData
             * @property {Uint8Array|null} [metadataData] FormVersion metadataData
             * @property {string|null} [changeSummary] FormVersion changeSummary
             * @property {form_builder.common.ITimestamp|null} [createdAt] FormVersion createdAt
             */

            /**
             * Constructs a new FormVersion.
             * @memberof form_builder.version
             * @classdesc Represents a FormVersion.
             * @implements IFormVersion
             * @constructor
             * @param {form_builder.version.IFormVersion=} [properties] Properties to set
             */
            function FormVersion(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * FormVersion id.
             * @member {string} id
             * @memberof form_builder.version.FormVersion
             * @instance
             */
            FormVersion.prototype.id = "";

            /**
             * FormVersion formDefinitionId.
             * @member {string} formDefinitionId
             * @memberof form_builder.version.FormVersion
             * @instance
             */
            FormVersion.prototype.formDefinitionId = "";

            /**
             * FormVersion version.
             * @member {string} version
             * @memberof form_builder.version.FormVersion
             * @instance
             */
            FormVersion.prototype.version = "";

            /**
             * FormVersion schemaData.
             * @member {Uint8Array} schemaData
             * @memberof form_builder.version.FormVersion
             * @instance
             */
            FormVersion.prototype.schemaData = $util.newBuffer([]);

            /**
             * FormVersion metadataData.
             * @member {Uint8Array} metadataData
             * @memberof form_builder.version.FormVersion
             * @instance
             */
            FormVersion.prototype.metadataData = $util.newBuffer([]);

            /**
             * FormVersion changeSummary.
             * @member {string} changeSummary
             * @memberof form_builder.version.FormVersion
             * @instance
             */
            FormVersion.prototype.changeSummary = "";

            /**
             * FormVersion createdAt.
             * @member {form_builder.common.ITimestamp|null|undefined} createdAt
             * @memberof form_builder.version.FormVersion
             * @instance
             */
            FormVersion.prototype.createdAt = null;

            /**
             * Creates a new FormVersion instance using the specified properties.
             * @function create
             * @memberof form_builder.version.FormVersion
             * @static
             * @param {form_builder.version.IFormVersion=} [properties] Properties to set
             * @returns {form_builder.version.FormVersion} FormVersion instance
             */
            FormVersion.create = function create(properties) {
                return new FormVersion(properties);
            };

            /**
             * Encodes the specified FormVersion message. Does not implicitly {@link form_builder.version.FormVersion.verify|verify} messages.
             * @function encode
             * @memberof form_builder.version.FormVersion
             * @static
             * @param {form_builder.version.IFormVersion} message FormVersion message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            FormVersion.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
                if (message.formDefinitionId != null && Object.hasOwnProperty.call(message, "formDefinitionId"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.formDefinitionId);
                if (message.version != null && Object.hasOwnProperty.call(message, "version"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.version);
                if (message.schemaData != null && Object.hasOwnProperty.call(message, "schemaData"))
                    writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.schemaData);
                if (message.metadataData != null && Object.hasOwnProperty.call(message, "metadataData"))
                    writer.uint32(/* id 5, wireType 2 =*/42).bytes(message.metadataData);
                if (message.changeSummary != null && Object.hasOwnProperty.call(message, "changeSummary"))
                    writer.uint32(/* id 6, wireType 2 =*/50).string(message.changeSummary);
                if (message.createdAt != null && Object.hasOwnProperty.call(message, "createdAt"))
                    $root.form_builder.common.Timestamp.encode(message.createdAt, writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified FormVersion message, length delimited. Does not implicitly {@link form_builder.version.FormVersion.verify|verify} messages.
             * @function encodeDelimited
             * @memberof form_builder.version.FormVersion
             * @static
             * @param {form_builder.version.IFormVersion} message FormVersion message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            FormVersion.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a FormVersion message from the specified reader or buffer.
             * @function decode
             * @memberof form_builder.version.FormVersion
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {form_builder.version.FormVersion} FormVersion
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            FormVersion.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.form_builder.version.FormVersion();
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
                            message.formDefinitionId = reader.string();
                            break;
                        }
                    case 3: {
                            message.version = reader.string();
                            break;
                        }
                    case 4: {
                            message.schemaData = reader.bytes();
                            break;
                        }
                    case 5: {
                            message.metadataData = reader.bytes();
                            break;
                        }
                    case 6: {
                            message.changeSummary = reader.string();
                            break;
                        }
                    case 7: {
                            message.createdAt = $root.form_builder.common.Timestamp.decode(reader, reader.uint32());
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
             * Decodes a FormVersion message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof form_builder.version.FormVersion
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {form_builder.version.FormVersion} FormVersion
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            FormVersion.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a FormVersion message.
             * @function verify
             * @memberof form_builder.version.FormVersion
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            FormVersion.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.id != null && message.hasOwnProperty("id"))
                    if (!$util.isString(message.id))
                        return "id: string expected";
                if (message.formDefinitionId != null && message.hasOwnProperty("formDefinitionId"))
                    if (!$util.isString(message.formDefinitionId))
                        return "formDefinitionId: string expected";
                if (message.version != null && message.hasOwnProperty("version"))
                    if (!$util.isString(message.version))
                        return "version: string expected";
                if (message.schemaData != null && message.hasOwnProperty("schemaData"))
                    if (!(message.schemaData && typeof message.schemaData.length === "number" || $util.isString(message.schemaData)))
                        return "schemaData: buffer expected";
                if (message.metadataData != null && message.hasOwnProperty("metadataData"))
                    if (!(message.metadataData && typeof message.metadataData.length === "number" || $util.isString(message.metadataData)))
                        return "metadataData: buffer expected";
                if (message.changeSummary != null && message.hasOwnProperty("changeSummary"))
                    if (!$util.isString(message.changeSummary))
                        return "changeSummary: string expected";
                if (message.createdAt != null && message.hasOwnProperty("createdAt")) {
                    let error = $root.form_builder.common.Timestamp.verify(message.createdAt);
                    if (error)
                        return "createdAt." + error;
                }
                return null;
            };

            /**
             * Creates a FormVersion message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof form_builder.version.FormVersion
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {form_builder.version.FormVersion} FormVersion
             */
            FormVersion.fromObject = function fromObject(object) {
                if (object instanceof $root.form_builder.version.FormVersion)
                    return object;
                let message = new $root.form_builder.version.FormVersion();
                if (object.id != null)
                    message.id = String(object.id);
                if (object.formDefinitionId != null)
                    message.formDefinitionId = String(object.formDefinitionId);
                if (object.version != null)
                    message.version = String(object.version);
                if (object.schemaData != null)
                    if (typeof object.schemaData === "string")
                        $util.base64.decode(object.schemaData, message.schemaData = $util.newBuffer($util.base64.length(object.schemaData)), 0);
                    else if (object.schemaData.length >= 0)
                        message.schemaData = object.schemaData;
                if (object.metadataData != null)
                    if (typeof object.metadataData === "string")
                        $util.base64.decode(object.metadataData, message.metadataData = $util.newBuffer($util.base64.length(object.metadataData)), 0);
                    else if (object.metadataData.length >= 0)
                        message.metadataData = object.metadataData;
                if (object.changeSummary != null)
                    message.changeSummary = String(object.changeSummary);
                if (object.createdAt != null) {
                    if (typeof object.createdAt !== "object")
                        throw TypeError(".form_builder.version.FormVersion.createdAt: object expected");
                    message.createdAt = $root.form_builder.common.Timestamp.fromObject(object.createdAt);
                }
                return message;
            };

            /**
             * Creates a plain object from a FormVersion message. Also converts values to other types if specified.
             * @function toObject
             * @memberof form_builder.version.FormVersion
             * @static
             * @param {form_builder.version.FormVersion} message FormVersion
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            FormVersion.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.id = "";
                    object.formDefinitionId = "";
                    object.version = "";
                    if (options.bytes === String)
                        object.schemaData = "";
                    else {
                        object.schemaData = [];
                        if (options.bytes !== Array)
                            object.schemaData = $util.newBuffer(object.schemaData);
                    }
                    if (options.bytes === String)
                        object.metadataData = "";
                    else {
                        object.metadataData = [];
                        if (options.bytes !== Array)
                            object.metadataData = $util.newBuffer(object.metadataData);
                    }
                    object.changeSummary = "";
                    object.createdAt = null;
                }
                if (message.id != null && message.hasOwnProperty("id"))
                    object.id = message.id;
                if (message.formDefinitionId != null && message.hasOwnProperty("formDefinitionId"))
                    object.formDefinitionId = message.formDefinitionId;
                if (message.version != null && message.hasOwnProperty("version"))
                    object.version = message.version;
                if (message.schemaData != null && message.hasOwnProperty("schemaData"))
                    object.schemaData = options.bytes === String ? $util.base64.encode(message.schemaData, 0, message.schemaData.length) : options.bytes === Array ? Array.prototype.slice.call(message.schemaData) : message.schemaData;
                if (message.metadataData != null && message.hasOwnProperty("metadataData"))
                    object.metadataData = options.bytes === String ? $util.base64.encode(message.metadataData, 0, message.metadataData.length) : options.bytes === Array ? Array.prototype.slice.call(message.metadataData) : message.metadataData;
                if (message.changeSummary != null && message.hasOwnProperty("changeSummary"))
                    object.changeSummary = message.changeSummary;
                if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                    object.createdAt = $root.form_builder.common.Timestamp.toObject(message.createdAt, options);
                return object;
            };

            /**
             * Converts this FormVersion to JSON.
             * @function toJSON
             * @memberof form_builder.version.FormVersion
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            FormVersion.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for FormVersion
             * @function getTypeUrl
             * @memberof form_builder.version.FormVersion
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            FormVersion.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/form_builder.version.FormVersion";
            };

            return FormVersion;
        })();

        version.ListVersionsRequest = (function() {

            /**
             * Properties of a ListVersionsRequest.
             * @memberof form_builder.version
             * @interface IListVersionsRequest
             * @property {string|null} [formDefinitionId] ListVersionsRequest formDefinitionId
             */

            /**
             * Constructs a new ListVersionsRequest.
             * @memberof form_builder.version
             * @classdesc Represents a ListVersionsRequest.
             * @implements IListVersionsRequest
             * @constructor
             * @param {form_builder.version.IListVersionsRequest=} [properties] Properties to set
             */
            function ListVersionsRequest(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ListVersionsRequest formDefinitionId.
             * @member {string} formDefinitionId
             * @memberof form_builder.version.ListVersionsRequest
             * @instance
             */
            ListVersionsRequest.prototype.formDefinitionId = "";

            /**
             * Creates a new ListVersionsRequest instance using the specified properties.
             * @function create
             * @memberof form_builder.version.ListVersionsRequest
             * @static
             * @param {form_builder.version.IListVersionsRequest=} [properties] Properties to set
             * @returns {form_builder.version.ListVersionsRequest} ListVersionsRequest instance
             */
            ListVersionsRequest.create = function create(properties) {
                return new ListVersionsRequest(properties);
            };

            /**
             * Encodes the specified ListVersionsRequest message. Does not implicitly {@link form_builder.version.ListVersionsRequest.verify|verify} messages.
             * @function encode
             * @memberof form_builder.version.ListVersionsRequest
             * @static
             * @param {form_builder.version.IListVersionsRequest} message ListVersionsRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ListVersionsRequest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.formDefinitionId != null && Object.hasOwnProperty.call(message, "formDefinitionId"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.formDefinitionId);
                return writer;
            };

            /**
             * Encodes the specified ListVersionsRequest message, length delimited. Does not implicitly {@link form_builder.version.ListVersionsRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof form_builder.version.ListVersionsRequest
             * @static
             * @param {form_builder.version.IListVersionsRequest} message ListVersionsRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ListVersionsRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ListVersionsRequest message from the specified reader or buffer.
             * @function decode
             * @memberof form_builder.version.ListVersionsRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {form_builder.version.ListVersionsRequest} ListVersionsRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ListVersionsRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.form_builder.version.ListVersionsRequest();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.formDefinitionId = reader.string();
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
             * Decodes a ListVersionsRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof form_builder.version.ListVersionsRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {form_builder.version.ListVersionsRequest} ListVersionsRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ListVersionsRequest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ListVersionsRequest message.
             * @function verify
             * @memberof form_builder.version.ListVersionsRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ListVersionsRequest.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.formDefinitionId != null && message.hasOwnProperty("formDefinitionId"))
                    if (!$util.isString(message.formDefinitionId))
                        return "formDefinitionId: string expected";
                return null;
            };

            /**
             * Creates a ListVersionsRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof form_builder.version.ListVersionsRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {form_builder.version.ListVersionsRequest} ListVersionsRequest
             */
            ListVersionsRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.form_builder.version.ListVersionsRequest)
                    return object;
                let message = new $root.form_builder.version.ListVersionsRequest();
                if (object.formDefinitionId != null)
                    message.formDefinitionId = String(object.formDefinitionId);
                return message;
            };

            /**
             * Creates a plain object from a ListVersionsRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof form_builder.version.ListVersionsRequest
             * @static
             * @param {form_builder.version.ListVersionsRequest} message ListVersionsRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ListVersionsRequest.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults)
                    object.formDefinitionId = "";
                if (message.formDefinitionId != null && message.hasOwnProperty("formDefinitionId"))
                    object.formDefinitionId = message.formDefinitionId;
                return object;
            };

            /**
             * Converts this ListVersionsRequest to JSON.
             * @function toJSON
             * @memberof form_builder.version.ListVersionsRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ListVersionsRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ListVersionsRequest
             * @function getTypeUrl
             * @memberof form_builder.version.ListVersionsRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ListVersionsRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/form_builder.version.ListVersionsRequest";
            };

            return ListVersionsRequest;
        })();

        version.ListVersionsResponse = (function() {

            /**
             * Properties of a ListVersionsResponse.
             * @memberof form_builder.version
             * @interface IListVersionsResponse
             * @property {Array.<form_builder.version.IFormVersion>|null} [versions] ListVersionsResponse versions
             */

            /**
             * Constructs a new ListVersionsResponse.
             * @memberof form_builder.version
             * @classdesc Represents a ListVersionsResponse.
             * @implements IListVersionsResponse
             * @constructor
             * @param {form_builder.version.IListVersionsResponse=} [properties] Properties to set
             */
            function ListVersionsResponse(properties) {
                this.versions = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ListVersionsResponse versions.
             * @member {Array.<form_builder.version.IFormVersion>} versions
             * @memberof form_builder.version.ListVersionsResponse
             * @instance
             */
            ListVersionsResponse.prototype.versions = $util.emptyArray;

            /**
             * Creates a new ListVersionsResponse instance using the specified properties.
             * @function create
             * @memberof form_builder.version.ListVersionsResponse
             * @static
             * @param {form_builder.version.IListVersionsResponse=} [properties] Properties to set
             * @returns {form_builder.version.ListVersionsResponse} ListVersionsResponse instance
             */
            ListVersionsResponse.create = function create(properties) {
                return new ListVersionsResponse(properties);
            };

            /**
             * Encodes the specified ListVersionsResponse message. Does not implicitly {@link form_builder.version.ListVersionsResponse.verify|verify} messages.
             * @function encode
             * @memberof form_builder.version.ListVersionsResponse
             * @static
             * @param {form_builder.version.IListVersionsResponse} message ListVersionsResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ListVersionsResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.versions != null && message.versions.length)
                    for (let i = 0; i < message.versions.length; ++i)
                        $root.form_builder.version.FormVersion.encode(message.versions[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified ListVersionsResponse message, length delimited. Does not implicitly {@link form_builder.version.ListVersionsResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof form_builder.version.ListVersionsResponse
             * @static
             * @param {form_builder.version.IListVersionsResponse} message ListVersionsResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ListVersionsResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ListVersionsResponse message from the specified reader or buffer.
             * @function decode
             * @memberof form_builder.version.ListVersionsResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {form_builder.version.ListVersionsResponse} ListVersionsResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ListVersionsResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.form_builder.version.ListVersionsResponse();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            if (!(message.versions && message.versions.length))
                                message.versions = [];
                            message.versions.push($root.form_builder.version.FormVersion.decode(reader, reader.uint32()));
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
             * Decodes a ListVersionsResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof form_builder.version.ListVersionsResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {form_builder.version.ListVersionsResponse} ListVersionsResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ListVersionsResponse.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ListVersionsResponse message.
             * @function verify
             * @memberof form_builder.version.ListVersionsResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ListVersionsResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.versions != null && message.hasOwnProperty("versions")) {
                    if (!Array.isArray(message.versions))
                        return "versions: array expected";
                    for (let i = 0; i < message.versions.length; ++i) {
                        let error = $root.form_builder.version.FormVersion.verify(message.versions[i]);
                        if (error)
                            return "versions." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a ListVersionsResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof form_builder.version.ListVersionsResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {form_builder.version.ListVersionsResponse} ListVersionsResponse
             */
            ListVersionsResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.form_builder.version.ListVersionsResponse)
                    return object;
                let message = new $root.form_builder.version.ListVersionsResponse();
                if (object.versions) {
                    if (!Array.isArray(object.versions))
                        throw TypeError(".form_builder.version.ListVersionsResponse.versions: array expected");
                    message.versions = [];
                    for (let i = 0; i < object.versions.length; ++i) {
                        if (typeof object.versions[i] !== "object")
                            throw TypeError(".form_builder.version.ListVersionsResponse.versions: object expected");
                        message.versions[i] = $root.form_builder.version.FormVersion.fromObject(object.versions[i]);
                    }
                }
                return message;
            };

            /**
             * Creates a plain object from a ListVersionsResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof form_builder.version.ListVersionsResponse
             * @static
             * @param {form_builder.version.ListVersionsResponse} message ListVersionsResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ListVersionsResponse.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.arrays || options.defaults)
                    object.versions = [];
                if (message.versions && message.versions.length) {
                    object.versions = [];
                    for (let j = 0; j < message.versions.length; ++j)
                        object.versions[j] = $root.form_builder.version.FormVersion.toObject(message.versions[j], options);
                }
                return object;
            };

            /**
             * Converts this ListVersionsResponse to JSON.
             * @function toJSON
             * @memberof form_builder.version.ListVersionsResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ListVersionsResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ListVersionsResponse
             * @function getTypeUrl
             * @memberof form_builder.version.ListVersionsResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ListVersionsResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/form_builder.version.ListVersionsResponse";
            };

            return ListVersionsResponse;
        })();

        version.GetVersionRequest = (function() {

            /**
             * Properties of a GetVersionRequest.
             * @memberof form_builder.version
             * @interface IGetVersionRequest
             * @property {string|null} [id] GetVersionRequest id
             */

            /**
             * Constructs a new GetVersionRequest.
             * @memberof form_builder.version
             * @classdesc Represents a GetVersionRequest.
             * @implements IGetVersionRequest
             * @constructor
             * @param {form_builder.version.IGetVersionRequest=} [properties] Properties to set
             */
            function GetVersionRequest(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * GetVersionRequest id.
             * @member {string} id
             * @memberof form_builder.version.GetVersionRequest
             * @instance
             */
            GetVersionRequest.prototype.id = "";

            /**
             * Creates a new GetVersionRequest instance using the specified properties.
             * @function create
             * @memberof form_builder.version.GetVersionRequest
             * @static
             * @param {form_builder.version.IGetVersionRequest=} [properties] Properties to set
             * @returns {form_builder.version.GetVersionRequest} GetVersionRequest instance
             */
            GetVersionRequest.create = function create(properties) {
                return new GetVersionRequest(properties);
            };

            /**
             * Encodes the specified GetVersionRequest message. Does not implicitly {@link form_builder.version.GetVersionRequest.verify|verify} messages.
             * @function encode
             * @memberof form_builder.version.GetVersionRequest
             * @static
             * @param {form_builder.version.IGetVersionRequest} message GetVersionRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            GetVersionRequest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
                return writer;
            };

            /**
             * Encodes the specified GetVersionRequest message, length delimited. Does not implicitly {@link form_builder.version.GetVersionRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof form_builder.version.GetVersionRequest
             * @static
             * @param {form_builder.version.IGetVersionRequest} message GetVersionRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            GetVersionRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a GetVersionRequest message from the specified reader or buffer.
             * @function decode
             * @memberof form_builder.version.GetVersionRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {form_builder.version.GetVersionRequest} GetVersionRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            GetVersionRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.form_builder.version.GetVersionRequest();
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
             * Decodes a GetVersionRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof form_builder.version.GetVersionRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {form_builder.version.GetVersionRequest} GetVersionRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            GetVersionRequest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a GetVersionRequest message.
             * @function verify
             * @memberof form_builder.version.GetVersionRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            GetVersionRequest.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.id != null && message.hasOwnProperty("id"))
                    if (!$util.isString(message.id))
                        return "id: string expected";
                return null;
            };

            /**
             * Creates a GetVersionRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof form_builder.version.GetVersionRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {form_builder.version.GetVersionRequest} GetVersionRequest
             */
            GetVersionRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.form_builder.version.GetVersionRequest)
                    return object;
                let message = new $root.form_builder.version.GetVersionRequest();
                if (object.id != null)
                    message.id = String(object.id);
                return message;
            };

            /**
             * Creates a plain object from a GetVersionRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof form_builder.version.GetVersionRequest
             * @static
             * @param {form_builder.version.GetVersionRequest} message GetVersionRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            GetVersionRequest.toObject = function toObject(message, options) {
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
             * Converts this GetVersionRequest to JSON.
             * @function toJSON
             * @memberof form_builder.version.GetVersionRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            GetVersionRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for GetVersionRequest
             * @function getTypeUrl
             * @memberof form_builder.version.GetVersionRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            GetVersionRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/form_builder.version.GetVersionRequest";
            };

            return GetVersionRequest;
        })();

        version.GetVersionResponse = (function() {

            /**
             * Properties of a GetVersionResponse.
             * @memberof form_builder.version
             * @interface IGetVersionResponse
             * @property {form_builder.version.IFormVersion|null} [version] GetVersionResponse version
             */

            /**
             * Constructs a new GetVersionResponse.
             * @memberof form_builder.version
             * @classdesc Represents a GetVersionResponse.
             * @implements IGetVersionResponse
             * @constructor
             * @param {form_builder.version.IGetVersionResponse=} [properties] Properties to set
             */
            function GetVersionResponse(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * GetVersionResponse version.
             * @member {form_builder.version.IFormVersion|null|undefined} version
             * @memberof form_builder.version.GetVersionResponse
             * @instance
             */
            GetVersionResponse.prototype.version = null;

            /**
             * Creates a new GetVersionResponse instance using the specified properties.
             * @function create
             * @memberof form_builder.version.GetVersionResponse
             * @static
             * @param {form_builder.version.IGetVersionResponse=} [properties] Properties to set
             * @returns {form_builder.version.GetVersionResponse} GetVersionResponse instance
             */
            GetVersionResponse.create = function create(properties) {
                return new GetVersionResponse(properties);
            };

            /**
             * Encodes the specified GetVersionResponse message. Does not implicitly {@link form_builder.version.GetVersionResponse.verify|verify} messages.
             * @function encode
             * @memberof form_builder.version.GetVersionResponse
             * @static
             * @param {form_builder.version.IGetVersionResponse} message GetVersionResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            GetVersionResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.version != null && Object.hasOwnProperty.call(message, "version"))
                    $root.form_builder.version.FormVersion.encode(message.version, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified GetVersionResponse message, length delimited. Does not implicitly {@link form_builder.version.GetVersionResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof form_builder.version.GetVersionResponse
             * @static
             * @param {form_builder.version.IGetVersionResponse} message GetVersionResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            GetVersionResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a GetVersionResponse message from the specified reader or buffer.
             * @function decode
             * @memberof form_builder.version.GetVersionResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {form_builder.version.GetVersionResponse} GetVersionResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            GetVersionResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.form_builder.version.GetVersionResponse();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.version = $root.form_builder.version.FormVersion.decode(reader, reader.uint32());
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
             * Decodes a GetVersionResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof form_builder.version.GetVersionResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {form_builder.version.GetVersionResponse} GetVersionResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            GetVersionResponse.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a GetVersionResponse message.
             * @function verify
             * @memberof form_builder.version.GetVersionResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            GetVersionResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.version != null && message.hasOwnProperty("version")) {
                    let error = $root.form_builder.version.FormVersion.verify(message.version);
                    if (error)
                        return "version." + error;
                }
                return null;
            };

            /**
             * Creates a GetVersionResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof form_builder.version.GetVersionResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {form_builder.version.GetVersionResponse} GetVersionResponse
             */
            GetVersionResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.form_builder.version.GetVersionResponse)
                    return object;
                let message = new $root.form_builder.version.GetVersionResponse();
                if (object.version != null) {
                    if (typeof object.version !== "object")
                        throw TypeError(".form_builder.version.GetVersionResponse.version: object expected");
                    message.version = $root.form_builder.version.FormVersion.fromObject(object.version);
                }
                return message;
            };

            /**
             * Creates a plain object from a GetVersionResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof form_builder.version.GetVersionResponse
             * @static
             * @param {form_builder.version.GetVersionResponse} message GetVersionResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            GetVersionResponse.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults)
                    object.version = null;
                if (message.version != null && message.hasOwnProperty("version"))
                    object.version = $root.form_builder.version.FormVersion.toObject(message.version, options);
                return object;
            };

            /**
             * Converts this GetVersionResponse to JSON.
             * @function toJSON
             * @memberof form_builder.version.GetVersionResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            GetVersionResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for GetVersionResponse
             * @function getTypeUrl
             * @memberof form_builder.version.GetVersionResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            GetVersionResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/form_builder.version.GetVersionResponse";
            };

            return GetVersionResponse;
        })();

        version.CreateVersionRequest = (function() {

            /**
             * Properties of a CreateVersionRequest.
             * @memberof form_builder.version
             * @interface ICreateVersionRequest
             * @property {string|null} [formDefinitionId] CreateVersionRequest formDefinitionId
             * @property {string|null} [changeSummary] CreateVersionRequest changeSummary
             */

            /**
             * Constructs a new CreateVersionRequest.
             * @memberof form_builder.version
             * @classdesc Represents a CreateVersionRequest.
             * @implements ICreateVersionRequest
             * @constructor
             * @param {form_builder.version.ICreateVersionRequest=} [properties] Properties to set
             */
            function CreateVersionRequest(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * CreateVersionRequest formDefinitionId.
             * @member {string} formDefinitionId
             * @memberof form_builder.version.CreateVersionRequest
             * @instance
             */
            CreateVersionRequest.prototype.formDefinitionId = "";

            /**
             * CreateVersionRequest changeSummary.
             * @member {string} changeSummary
             * @memberof form_builder.version.CreateVersionRequest
             * @instance
             */
            CreateVersionRequest.prototype.changeSummary = "";

            /**
             * Creates a new CreateVersionRequest instance using the specified properties.
             * @function create
             * @memberof form_builder.version.CreateVersionRequest
             * @static
             * @param {form_builder.version.ICreateVersionRequest=} [properties] Properties to set
             * @returns {form_builder.version.CreateVersionRequest} CreateVersionRequest instance
             */
            CreateVersionRequest.create = function create(properties) {
                return new CreateVersionRequest(properties);
            };

            /**
             * Encodes the specified CreateVersionRequest message. Does not implicitly {@link form_builder.version.CreateVersionRequest.verify|verify} messages.
             * @function encode
             * @memberof form_builder.version.CreateVersionRequest
             * @static
             * @param {form_builder.version.ICreateVersionRequest} message CreateVersionRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CreateVersionRequest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.formDefinitionId != null && Object.hasOwnProperty.call(message, "formDefinitionId"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.formDefinitionId);
                if (message.changeSummary != null && Object.hasOwnProperty.call(message, "changeSummary"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.changeSummary);
                return writer;
            };

            /**
             * Encodes the specified CreateVersionRequest message, length delimited. Does not implicitly {@link form_builder.version.CreateVersionRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof form_builder.version.CreateVersionRequest
             * @static
             * @param {form_builder.version.ICreateVersionRequest} message CreateVersionRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CreateVersionRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a CreateVersionRequest message from the specified reader or buffer.
             * @function decode
             * @memberof form_builder.version.CreateVersionRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {form_builder.version.CreateVersionRequest} CreateVersionRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CreateVersionRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.form_builder.version.CreateVersionRequest();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.formDefinitionId = reader.string();
                            break;
                        }
                    case 2: {
                            message.changeSummary = reader.string();
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
             * Decodes a CreateVersionRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof form_builder.version.CreateVersionRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {form_builder.version.CreateVersionRequest} CreateVersionRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CreateVersionRequest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a CreateVersionRequest message.
             * @function verify
             * @memberof form_builder.version.CreateVersionRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            CreateVersionRequest.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.formDefinitionId != null && message.hasOwnProperty("formDefinitionId"))
                    if (!$util.isString(message.formDefinitionId))
                        return "formDefinitionId: string expected";
                if (message.changeSummary != null && message.hasOwnProperty("changeSummary"))
                    if (!$util.isString(message.changeSummary))
                        return "changeSummary: string expected";
                return null;
            };

            /**
             * Creates a CreateVersionRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof form_builder.version.CreateVersionRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {form_builder.version.CreateVersionRequest} CreateVersionRequest
             */
            CreateVersionRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.form_builder.version.CreateVersionRequest)
                    return object;
                let message = new $root.form_builder.version.CreateVersionRequest();
                if (object.formDefinitionId != null)
                    message.formDefinitionId = String(object.formDefinitionId);
                if (object.changeSummary != null)
                    message.changeSummary = String(object.changeSummary);
                return message;
            };

            /**
             * Creates a plain object from a CreateVersionRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof form_builder.version.CreateVersionRequest
             * @static
             * @param {form_builder.version.CreateVersionRequest} message CreateVersionRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            CreateVersionRequest.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.formDefinitionId = "";
                    object.changeSummary = "";
                }
                if (message.formDefinitionId != null && message.hasOwnProperty("formDefinitionId"))
                    object.formDefinitionId = message.formDefinitionId;
                if (message.changeSummary != null && message.hasOwnProperty("changeSummary"))
                    object.changeSummary = message.changeSummary;
                return object;
            };

            /**
             * Converts this CreateVersionRequest to JSON.
             * @function toJSON
             * @memberof form_builder.version.CreateVersionRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            CreateVersionRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for CreateVersionRequest
             * @function getTypeUrl
             * @memberof form_builder.version.CreateVersionRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            CreateVersionRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/form_builder.version.CreateVersionRequest";
            };

            return CreateVersionRequest;
        })();

        version.CreateVersionResponse = (function() {

            /**
             * Properties of a CreateVersionResponse.
             * @memberof form_builder.version
             * @interface ICreateVersionResponse
             * @property {form_builder.version.IFormVersion|null} [version] CreateVersionResponse version
             */

            /**
             * Constructs a new CreateVersionResponse.
             * @memberof form_builder.version
             * @classdesc Represents a CreateVersionResponse.
             * @implements ICreateVersionResponse
             * @constructor
             * @param {form_builder.version.ICreateVersionResponse=} [properties] Properties to set
             */
            function CreateVersionResponse(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * CreateVersionResponse version.
             * @member {form_builder.version.IFormVersion|null|undefined} version
             * @memberof form_builder.version.CreateVersionResponse
             * @instance
             */
            CreateVersionResponse.prototype.version = null;

            /**
             * Creates a new CreateVersionResponse instance using the specified properties.
             * @function create
             * @memberof form_builder.version.CreateVersionResponse
             * @static
             * @param {form_builder.version.ICreateVersionResponse=} [properties] Properties to set
             * @returns {form_builder.version.CreateVersionResponse} CreateVersionResponse instance
             */
            CreateVersionResponse.create = function create(properties) {
                return new CreateVersionResponse(properties);
            };

            /**
             * Encodes the specified CreateVersionResponse message. Does not implicitly {@link form_builder.version.CreateVersionResponse.verify|verify} messages.
             * @function encode
             * @memberof form_builder.version.CreateVersionResponse
             * @static
             * @param {form_builder.version.ICreateVersionResponse} message CreateVersionResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CreateVersionResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.version != null && Object.hasOwnProperty.call(message, "version"))
                    $root.form_builder.version.FormVersion.encode(message.version, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified CreateVersionResponse message, length delimited. Does not implicitly {@link form_builder.version.CreateVersionResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof form_builder.version.CreateVersionResponse
             * @static
             * @param {form_builder.version.ICreateVersionResponse} message CreateVersionResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CreateVersionResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a CreateVersionResponse message from the specified reader or buffer.
             * @function decode
             * @memberof form_builder.version.CreateVersionResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {form_builder.version.CreateVersionResponse} CreateVersionResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CreateVersionResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.form_builder.version.CreateVersionResponse();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.version = $root.form_builder.version.FormVersion.decode(reader, reader.uint32());
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
             * Decodes a CreateVersionResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof form_builder.version.CreateVersionResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {form_builder.version.CreateVersionResponse} CreateVersionResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CreateVersionResponse.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a CreateVersionResponse message.
             * @function verify
             * @memberof form_builder.version.CreateVersionResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            CreateVersionResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.version != null && message.hasOwnProperty("version")) {
                    let error = $root.form_builder.version.FormVersion.verify(message.version);
                    if (error)
                        return "version." + error;
                }
                return null;
            };

            /**
             * Creates a CreateVersionResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof form_builder.version.CreateVersionResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {form_builder.version.CreateVersionResponse} CreateVersionResponse
             */
            CreateVersionResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.form_builder.version.CreateVersionResponse)
                    return object;
                let message = new $root.form_builder.version.CreateVersionResponse();
                if (object.version != null) {
                    if (typeof object.version !== "object")
                        throw TypeError(".form_builder.version.CreateVersionResponse.version: object expected");
                    message.version = $root.form_builder.version.FormVersion.fromObject(object.version);
                }
                return message;
            };

            /**
             * Creates a plain object from a CreateVersionResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof form_builder.version.CreateVersionResponse
             * @static
             * @param {form_builder.version.CreateVersionResponse} message CreateVersionResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            CreateVersionResponse.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults)
                    object.version = null;
                if (message.version != null && message.hasOwnProperty("version"))
                    object.version = $root.form_builder.version.FormVersion.toObject(message.version, options);
                return object;
            };

            /**
             * Converts this CreateVersionResponse to JSON.
             * @function toJSON
             * @memberof form_builder.version.CreateVersionResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            CreateVersionResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for CreateVersionResponse
             * @function getTypeUrl
             * @memberof form_builder.version.CreateVersionResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            CreateVersionResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/form_builder.version.CreateVersionResponse";
            };

            return CreateVersionResponse;
        })();

        version.RestoreVersionRequest = (function() {

            /**
             * Properties of a RestoreVersionRequest.
             * @memberof form_builder.version
             * @interface IRestoreVersionRequest
             * @property {string|null} [id] RestoreVersionRequest id
             */

            /**
             * Constructs a new RestoreVersionRequest.
             * @memberof form_builder.version
             * @classdesc Represents a RestoreVersionRequest.
             * @implements IRestoreVersionRequest
             * @constructor
             * @param {form_builder.version.IRestoreVersionRequest=} [properties] Properties to set
             */
            function RestoreVersionRequest(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * RestoreVersionRequest id.
             * @member {string} id
             * @memberof form_builder.version.RestoreVersionRequest
             * @instance
             */
            RestoreVersionRequest.prototype.id = "";

            /**
             * Creates a new RestoreVersionRequest instance using the specified properties.
             * @function create
             * @memberof form_builder.version.RestoreVersionRequest
             * @static
             * @param {form_builder.version.IRestoreVersionRequest=} [properties] Properties to set
             * @returns {form_builder.version.RestoreVersionRequest} RestoreVersionRequest instance
             */
            RestoreVersionRequest.create = function create(properties) {
                return new RestoreVersionRequest(properties);
            };

            /**
             * Encodes the specified RestoreVersionRequest message. Does not implicitly {@link form_builder.version.RestoreVersionRequest.verify|verify} messages.
             * @function encode
             * @memberof form_builder.version.RestoreVersionRequest
             * @static
             * @param {form_builder.version.IRestoreVersionRequest} message RestoreVersionRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            RestoreVersionRequest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
                return writer;
            };

            /**
             * Encodes the specified RestoreVersionRequest message, length delimited. Does not implicitly {@link form_builder.version.RestoreVersionRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof form_builder.version.RestoreVersionRequest
             * @static
             * @param {form_builder.version.IRestoreVersionRequest} message RestoreVersionRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            RestoreVersionRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a RestoreVersionRequest message from the specified reader or buffer.
             * @function decode
             * @memberof form_builder.version.RestoreVersionRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {form_builder.version.RestoreVersionRequest} RestoreVersionRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            RestoreVersionRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.form_builder.version.RestoreVersionRequest();
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
             * Decodes a RestoreVersionRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof form_builder.version.RestoreVersionRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {form_builder.version.RestoreVersionRequest} RestoreVersionRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            RestoreVersionRequest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a RestoreVersionRequest message.
             * @function verify
             * @memberof form_builder.version.RestoreVersionRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            RestoreVersionRequest.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.id != null && message.hasOwnProperty("id"))
                    if (!$util.isString(message.id))
                        return "id: string expected";
                return null;
            };

            /**
             * Creates a RestoreVersionRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof form_builder.version.RestoreVersionRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {form_builder.version.RestoreVersionRequest} RestoreVersionRequest
             */
            RestoreVersionRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.form_builder.version.RestoreVersionRequest)
                    return object;
                let message = new $root.form_builder.version.RestoreVersionRequest();
                if (object.id != null)
                    message.id = String(object.id);
                return message;
            };

            /**
             * Creates a plain object from a RestoreVersionRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof form_builder.version.RestoreVersionRequest
             * @static
             * @param {form_builder.version.RestoreVersionRequest} message RestoreVersionRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            RestoreVersionRequest.toObject = function toObject(message, options) {
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
             * Converts this RestoreVersionRequest to JSON.
             * @function toJSON
             * @memberof form_builder.version.RestoreVersionRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            RestoreVersionRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for RestoreVersionRequest
             * @function getTypeUrl
             * @memberof form_builder.version.RestoreVersionRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            RestoreVersionRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/form_builder.version.RestoreVersionRequest";
            };

            return RestoreVersionRequest;
        })();

        version.RestoreVersionResponse = (function() {

            /**
             * Properties of a RestoreVersionResponse.
             * @memberof form_builder.version
             * @interface IRestoreVersionResponse
             * @property {boolean|null} [success] RestoreVersionResponse success
             * @property {string|null} [restoredVersion] RestoreVersionResponse restoredVersion
             */

            /**
             * Constructs a new RestoreVersionResponse.
             * @memberof form_builder.version
             * @classdesc Represents a RestoreVersionResponse.
             * @implements IRestoreVersionResponse
             * @constructor
             * @param {form_builder.version.IRestoreVersionResponse=} [properties] Properties to set
             */
            function RestoreVersionResponse(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * RestoreVersionResponse success.
             * @member {boolean} success
             * @memberof form_builder.version.RestoreVersionResponse
             * @instance
             */
            RestoreVersionResponse.prototype.success = false;

            /**
             * RestoreVersionResponse restoredVersion.
             * @member {string} restoredVersion
             * @memberof form_builder.version.RestoreVersionResponse
             * @instance
             */
            RestoreVersionResponse.prototype.restoredVersion = "";

            /**
             * Creates a new RestoreVersionResponse instance using the specified properties.
             * @function create
             * @memberof form_builder.version.RestoreVersionResponse
             * @static
             * @param {form_builder.version.IRestoreVersionResponse=} [properties] Properties to set
             * @returns {form_builder.version.RestoreVersionResponse} RestoreVersionResponse instance
             */
            RestoreVersionResponse.create = function create(properties) {
                return new RestoreVersionResponse(properties);
            };

            /**
             * Encodes the specified RestoreVersionResponse message. Does not implicitly {@link form_builder.version.RestoreVersionResponse.verify|verify} messages.
             * @function encode
             * @memberof form_builder.version.RestoreVersionResponse
             * @static
             * @param {form_builder.version.IRestoreVersionResponse} message RestoreVersionResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            RestoreVersionResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.success != null && Object.hasOwnProperty.call(message, "success"))
                    writer.uint32(/* id 1, wireType 0 =*/8).bool(message.success);
                if (message.restoredVersion != null && Object.hasOwnProperty.call(message, "restoredVersion"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.restoredVersion);
                return writer;
            };

            /**
             * Encodes the specified RestoreVersionResponse message, length delimited. Does not implicitly {@link form_builder.version.RestoreVersionResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof form_builder.version.RestoreVersionResponse
             * @static
             * @param {form_builder.version.IRestoreVersionResponse} message RestoreVersionResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            RestoreVersionResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a RestoreVersionResponse message from the specified reader or buffer.
             * @function decode
             * @memberof form_builder.version.RestoreVersionResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {form_builder.version.RestoreVersionResponse} RestoreVersionResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            RestoreVersionResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.form_builder.version.RestoreVersionResponse();
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
                            message.restoredVersion = reader.string();
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
             * Decodes a RestoreVersionResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof form_builder.version.RestoreVersionResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {form_builder.version.RestoreVersionResponse} RestoreVersionResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            RestoreVersionResponse.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a RestoreVersionResponse message.
             * @function verify
             * @memberof form_builder.version.RestoreVersionResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            RestoreVersionResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.success != null && message.hasOwnProperty("success"))
                    if (typeof message.success !== "boolean")
                        return "success: boolean expected";
                if (message.restoredVersion != null && message.hasOwnProperty("restoredVersion"))
                    if (!$util.isString(message.restoredVersion))
                        return "restoredVersion: string expected";
                return null;
            };

            /**
             * Creates a RestoreVersionResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof form_builder.version.RestoreVersionResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {form_builder.version.RestoreVersionResponse} RestoreVersionResponse
             */
            RestoreVersionResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.form_builder.version.RestoreVersionResponse)
                    return object;
                let message = new $root.form_builder.version.RestoreVersionResponse();
                if (object.success != null)
                    message.success = Boolean(object.success);
                if (object.restoredVersion != null)
                    message.restoredVersion = String(object.restoredVersion);
                return message;
            };

            /**
             * Creates a plain object from a RestoreVersionResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof form_builder.version.RestoreVersionResponse
             * @static
             * @param {form_builder.version.RestoreVersionResponse} message RestoreVersionResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            RestoreVersionResponse.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.success = false;
                    object.restoredVersion = "";
                }
                if (message.success != null && message.hasOwnProperty("success"))
                    object.success = message.success;
                if (message.restoredVersion != null && message.hasOwnProperty("restoredVersion"))
                    object.restoredVersion = message.restoredVersion;
                return object;
            };

            /**
             * Converts this RestoreVersionResponse to JSON.
             * @function toJSON
             * @memberof form_builder.version.RestoreVersionResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            RestoreVersionResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for RestoreVersionResponse
             * @function getTypeUrl
             * @memberof form_builder.version.RestoreVersionResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            RestoreVersionResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/form_builder.version.RestoreVersionResponse";
            };

            return RestoreVersionResponse;
        })();

        return version;
    })();

    return form_builder;
})();

export { $root as default };
