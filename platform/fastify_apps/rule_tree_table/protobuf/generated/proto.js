/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const rule_tree_table = $root.rule_tree_table = (() => {

    /**
     * Namespace rule_tree_table.
     * @exports rule_tree_table
     * @namespace
     */
    const rule_tree_table = {};

    rule_tree_table.RuleTree = (function() {

        /**
         * Properties of a RuleTree.
         * @memberof rule_tree_table
         * @interface IRuleTree
         * @property {string|null} [id] RuleTree id
         * @property {string|null} [name] RuleTree name
         * @property {string|null} [description] RuleTree description
         * @property {boolean|null} [isActive] RuleTree isActive
         * @property {Array.<rule_tree_table.IRuleItem>|null} [items] RuleTree items
         * @property {rule_tree_table.IRuleStats|null} [stats] RuleTree stats
         * @property {string|null} [createdAt] RuleTree createdAt
         * @property {string|null} [updatedAt] RuleTree updatedAt
         * @property {string|null} [graphType] RuleTree graphType
         * @property {string|null} [language] RuleTree language
         */

        /**
         * Constructs a new RuleTree.
         * @memberof rule_tree_table
         * @classdesc Represents a RuleTree.
         * @implements IRuleTree
         * @constructor
         * @param {rule_tree_table.IRuleTree=} [properties] Properties to set
         */
        function RuleTree(properties) {
            this.items = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * RuleTree id.
         * @member {string} id
         * @memberof rule_tree_table.RuleTree
         * @instance
         */
        RuleTree.prototype.id = "";

        /**
         * RuleTree name.
         * @member {string} name
         * @memberof rule_tree_table.RuleTree
         * @instance
         */
        RuleTree.prototype.name = "";

        /**
         * RuleTree description.
         * @member {string|null|undefined} description
         * @memberof rule_tree_table.RuleTree
         * @instance
         */
        RuleTree.prototype.description = null;

        /**
         * RuleTree isActive.
         * @member {boolean} isActive
         * @memberof rule_tree_table.RuleTree
         * @instance
         */
        RuleTree.prototype.isActive = false;

        /**
         * RuleTree items.
         * @member {Array.<rule_tree_table.IRuleItem>} items
         * @memberof rule_tree_table.RuleTree
         * @instance
         */
        RuleTree.prototype.items = $util.emptyArray;

        /**
         * RuleTree stats.
         * @member {rule_tree_table.IRuleStats|null|undefined} stats
         * @memberof rule_tree_table.RuleTree
         * @instance
         */
        RuleTree.prototype.stats = null;

        /**
         * RuleTree createdAt.
         * @member {string} createdAt
         * @memberof rule_tree_table.RuleTree
         * @instance
         */
        RuleTree.prototype.createdAt = "";

        /**
         * RuleTree updatedAt.
         * @member {string} updatedAt
         * @memberof rule_tree_table.RuleTree
         * @instance
         */
        RuleTree.prototype.updatedAt = "";

        /**
         * RuleTree graphType.
         * @member {string} graphType
         * @memberof rule_tree_table.RuleTree
         * @instance
         */
        RuleTree.prototype.graphType = "";

        /**
         * RuleTree language.
         * @member {string} language
         * @memberof rule_tree_table.RuleTree
         * @instance
         */
        RuleTree.prototype.language = "";

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(RuleTree.prototype, "_description", {
            get: $util.oneOfGetter($oneOfFields = ["description"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new RuleTree instance using the specified properties.
         * @function create
         * @memberof rule_tree_table.RuleTree
         * @static
         * @param {rule_tree_table.IRuleTree=} [properties] Properties to set
         * @returns {rule_tree_table.RuleTree} RuleTree instance
         */
        RuleTree.create = function create(properties) {
            return new RuleTree(properties);
        };

        /**
         * Encodes the specified RuleTree message. Does not implicitly {@link rule_tree_table.RuleTree.verify|verify} messages.
         * @function encode
         * @memberof rule_tree_table.RuleTree
         * @static
         * @param {rule_tree_table.IRuleTree} message RuleTree message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RuleTree.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.description);
            if (message.isActive != null && Object.hasOwnProperty.call(message, "isActive"))
                writer.uint32(/* id 4, wireType 0 =*/32).bool(message.isActive);
            if (message.items != null && message.items.length)
                for (let i = 0; i < message.items.length; ++i)
                    $root.rule_tree_table.RuleItem.encode(message.items[i], writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
            if (message.stats != null && Object.hasOwnProperty.call(message, "stats"))
                $root.rule_tree_table.RuleStats.encode(message.stats, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
            if (message.createdAt != null && Object.hasOwnProperty.call(message, "createdAt"))
                writer.uint32(/* id 7, wireType 2 =*/58).string(message.createdAt);
            if (message.updatedAt != null && Object.hasOwnProperty.call(message, "updatedAt"))
                writer.uint32(/* id 8, wireType 2 =*/66).string(message.updatedAt);
            if (message.graphType != null && Object.hasOwnProperty.call(message, "graphType"))
                writer.uint32(/* id 9, wireType 2 =*/74).string(message.graphType);
            if (message.language != null && Object.hasOwnProperty.call(message, "language"))
                writer.uint32(/* id 10, wireType 2 =*/82).string(message.language);
            return writer;
        };

        /**
         * Encodes the specified RuleTree message, length delimited. Does not implicitly {@link rule_tree_table.RuleTree.verify|verify} messages.
         * @function encodeDelimited
         * @memberof rule_tree_table.RuleTree
         * @static
         * @param {rule_tree_table.IRuleTree} message RuleTree message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RuleTree.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a RuleTree message from the specified reader or buffer.
         * @function decode
         * @memberof rule_tree_table.RuleTree
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {rule_tree_table.RuleTree} RuleTree
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RuleTree.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.rule_tree_table.RuleTree();
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
                        message.isActive = reader.bool();
                        break;
                    }
                case 5: {
                        if (!(message.items && message.items.length))
                            message.items = [];
                        message.items.push($root.rule_tree_table.RuleItem.decode(reader, reader.uint32()));
                        break;
                    }
                case 6: {
                        message.stats = $root.rule_tree_table.RuleStats.decode(reader, reader.uint32());
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
                        message.graphType = reader.string();
                        break;
                    }
                case 10: {
                        message.language = reader.string();
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
         * Decodes a RuleTree message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof rule_tree_table.RuleTree
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {rule_tree_table.RuleTree} RuleTree
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RuleTree.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a RuleTree message.
         * @function verify
         * @memberof rule_tree_table.RuleTree
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        RuleTree.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.description != null && message.hasOwnProperty("description")) {
                properties._description = 1;
                if (!$util.isString(message.description))
                    return "description: string expected";
            }
            if (message.isActive != null && message.hasOwnProperty("isActive"))
                if (typeof message.isActive !== "boolean")
                    return "isActive: boolean expected";
            if (message.items != null && message.hasOwnProperty("items")) {
                if (!Array.isArray(message.items))
                    return "items: array expected";
                for (let i = 0; i < message.items.length; ++i) {
                    let error = $root.rule_tree_table.RuleItem.verify(message.items[i]);
                    if (error)
                        return "items." + error;
                }
            }
            if (message.stats != null && message.hasOwnProperty("stats")) {
                let error = $root.rule_tree_table.RuleStats.verify(message.stats);
                if (error)
                    return "stats." + error;
            }
            if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                if (!$util.isString(message.createdAt))
                    return "createdAt: string expected";
            if (message.updatedAt != null && message.hasOwnProperty("updatedAt"))
                if (!$util.isString(message.updatedAt))
                    return "updatedAt: string expected";
            if (message.graphType != null && message.hasOwnProperty("graphType"))
                if (!$util.isString(message.graphType))
                    return "graphType: string expected";
            if (message.language != null && message.hasOwnProperty("language"))
                if (!$util.isString(message.language))
                    return "language: string expected";
            return null;
        };

        /**
         * Creates a RuleTree message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof rule_tree_table.RuleTree
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {rule_tree_table.RuleTree} RuleTree
         */
        RuleTree.fromObject = function fromObject(object) {
            if (object instanceof $root.rule_tree_table.RuleTree)
                return object;
            let message = new $root.rule_tree_table.RuleTree();
            if (object.id != null)
                message.id = String(object.id);
            if (object.name != null)
                message.name = String(object.name);
            if (object.description != null)
                message.description = String(object.description);
            if (object.isActive != null)
                message.isActive = Boolean(object.isActive);
            if (object.items) {
                if (!Array.isArray(object.items))
                    throw TypeError(".rule_tree_table.RuleTree.items: array expected");
                message.items = [];
                for (let i = 0; i < object.items.length; ++i) {
                    if (typeof object.items[i] !== "object")
                        throw TypeError(".rule_tree_table.RuleTree.items: object expected");
                    message.items[i] = $root.rule_tree_table.RuleItem.fromObject(object.items[i]);
                }
            }
            if (object.stats != null) {
                if (typeof object.stats !== "object")
                    throw TypeError(".rule_tree_table.RuleTree.stats: object expected");
                message.stats = $root.rule_tree_table.RuleStats.fromObject(object.stats);
            }
            if (object.createdAt != null)
                message.createdAt = String(object.createdAt);
            if (object.updatedAt != null)
                message.updatedAt = String(object.updatedAt);
            if (object.graphType != null)
                message.graphType = String(object.graphType);
            if (object.language != null)
                message.language = String(object.language);
            return message;
        };

        /**
         * Creates a plain object from a RuleTree message. Also converts values to other types if specified.
         * @function toObject
         * @memberof rule_tree_table.RuleTree
         * @static
         * @param {rule_tree_table.RuleTree} message RuleTree
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        RuleTree.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.items = [];
            if (options.defaults) {
                object.id = "";
                object.name = "";
                object.isActive = false;
                object.stats = null;
                object.createdAt = "";
                object.updatedAt = "";
                object.graphType = "";
                object.language = "";
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.description != null && message.hasOwnProperty("description")) {
                object.description = message.description;
                if (options.oneofs)
                    object._description = "description";
            }
            if (message.isActive != null && message.hasOwnProperty("isActive"))
                object.isActive = message.isActive;
            if (message.items && message.items.length) {
                object.items = [];
                for (let j = 0; j < message.items.length; ++j)
                    object.items[j] = $root.rule_tree_table.RuleItem.toObject(message.items[j], options);
            }
            if (message.stats != null && message.hasOwnProperty("stats"))
                object.stats = $root.rule_tree_table.RuleStats.toObject(message.stats, options);
            if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                object.createdAt = message.createdAt;
            if (message.updatedAt != null && message.hasOwnProperty("updatedAt"))
                object.updatedAt = message.updatedAt;
            if (message.graphType != null && message.hasOwnProperty("graphType"))
                object.graphType = message.graphType;
            if (message.language != null && message.hasOwnProperty("language"))
                object.language = message.language;
            return object;
        };

        /**
         * Converts this RuleTree to JSON.
         * @function toJSON
         * @memberof rule_tree_table.RuleTree
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        RuleTree.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for RuleTree
         * @function getTypeUrl
         * @memberof rule_tree_table.RuleTree
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        RuleTree.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/rule_tree_table.RuleTree";
        };

        return RuleTree;
    })();

    rule_tree_table.RuleItem = (function() {

        /**
         * Properties of a RuleItem.
         * @memberof rule_tree_table
         * @interface IRuleItem
         * @property {string|null} [id] RuleItem id
         * @property {rule_tree_table.ItemType|null} [type] RuleItem type
         * @property {boolean|null} [enabled] RuleItem enabled
         * @property {string|null} [description] RuleItem description
         * @property {number|null} [sortOrder] RuleItem sortOrder
         * @property {string|null} [name] RuleItem name
         * @property {rule_tree_table.LogicType|null} [logic] RuleItem logic
         * @property {string|null} [color] RuleItem color
         * @property {Array.<rule_tree_table.IRuleItem>|null} [conditions] RuleItem conditions
         * @property {string|null} [field] RuleItem field
         * @property {string|null} [operator] RuleItem operator
         * @property {rule_tree_table.ValueType|null} [valueType] RuleItem valueType
         * @property {string|null} [value] RuleItem value
         * @property {rule_tree_table.DataType|null} [dataType] RuleItem dataType
         * @property {google.protobuf.IStruct|null} [metadata] RuleItem metadata
         */

        /**
         * Constructs a new RuleItem.
         * @memberof rule_tree_table
         * @classdesc Represents a RuleItem.
         * @implements IRuleItem
         * @constructor
         * @param {rule_tree_table.IRuleItem=} [properties] Properties to set
         */
        function RuleItem(properties) {
            this.conditions = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * RuleItem id.
         * @member {string} id
         * @memberof rule_tree_table.RuleItem
         * @instance
         */
        RuleItem.prototype.id = "";

        /**
         * RuleItem type.
         * @member {rule_tree_table.ItemType} type
         * @memberof rule_tree_table.RuleItem
         * @instance
         */
        RuleItem.prototype.type = 0;

        /**
         * RuleItem enabled.
         * @member {boolean} enabled
         * @memberof rule_tree_table.RuleItem
         * @instance
         */
        RuleItem.prototype.enabled = false;

        /**
         * RuleItem description.
         * @member {string|null|undefined} description
         * @memberof rule_tree_table.RuleItem
         * @instance
         */
        RuleItem.prototype.description = null;

        /**
         * RuleItem sortOrder.
         * @member {number} sortOrder
         * @memberof rule_tree_table.RuleItem
         * @instance
         */
        RuleItem.prototype.sortOrder = 0;

        /**
         * RuleItem name.
         * @member {string|null|undefined} name
         * @memberof rule_tree_table.RuleItem
         * @instance
         */
        RuleItem.prototype.name = null;

        /**
         * RuleItem logic.
         * @member {rule_tree_table.LogicType|null|undefined} logic
         * @memberof rule_tree_table.RuleItem
         * @instance
         */
        RuleItem.prototype.logic = null;

        /**
         * RuleItem color.
         * @member {string|null|undefined} color
         * @memberof rule_tree_table.RuleItem
         * @instance
         */
        RuleItem.prototype.color = null;

        /**
         * RuleItem conditions.
         * @member {Array.<rule_tree_table.IRuleItem>} conditions
         * @memberof rule_tree_table.RuleItem
         * @instance
         */
        RuleItem.prototype.conditions = $util.emptyArray;

        /**
         * RuleItem field.
         * @member {string|null|undefined} field
         * @memberof rule_tree_table.RuleItem
         * @instance
         */
        RuleItem.prototype.field = null;

        /**
         * RuleItem operator.
         * @member {string|null|undefined} operator
         * @memberof rule_tree_table.RuleItem
         * @instance
         */
        RuleItem.prototype.operator = null;

        /**
         * RuleItem valueType.
         * @member {rule_tree_table.ValueType|null|undefined} valueType
         * @memberof rule_tree_table.RuleItem
         * @instance
         */
        RuleItem.prototype.valueType = null;

        /**
         * RuleItem value.
         * @member {string|null|undefined} value
         * @memberof rule_tree_table.RuleItem
         * @instance
         */
        RuleItem.prototype.value = null;

        /**
         * RuleItem dataType.
         * @member {rule_tree_table.DataType|null|undefined} dataType
         * @memberof rule_tree_table.RuleItem
         * @instance
         */
        RuleItem.prototype.dataType = null;

        /**
         * RuleItem metadata.
         * @member {google.protobuf.IStruct|null|undefined} metadata
         * @memberof rule_tree_table.RuleItem
         * @instance
         */
        RuleItem.prototype.metadata = null;

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(RuleItem.prototype, "_description", {
            get: $util.oneOfGetter($oneOfFields = ["description"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(RuleItem.prototype, "_name", {
            get: $util.oneOfGetter($oneOfFields = ["name"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(RuleItem.prototype, "_logic", {
            get: $util.oneOfGetter($oneOfFields = ["logic"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(RuleItem.prototype, "_color", {
            get: $util.oneOfGetter($oneOfFields = ["color"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(RuleItem.prototype, "_field", {
            get: $util.oneOfGetter($oneOfFields = ["field"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(RuleItem.prototype, "_operator", {
            get: $util.oneOfGetter($oneOfFields = ["operator"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(RuleItem.prototype, "_valueType", {
            get: $util.oneOfGetter($oneOfFields = ["valueType"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(RuleItem.prototype, "_value", {
            get: $util.oneOfGetter($oneOfFields = ["value"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(RuleItem.prototype, "_dataType", {
            get: $util.oneOfGetter($oneOfFields = ["dataType"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(RuleItem.prototype, "_metadata", {
            get: $util.oneOfGetter($oneOfFields = ["metadata"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new RuleItem instance using the specified properties.
         * @function create
         * @memberof rule_tree_table.RuleItem
         * @static
         * @param {rule_tree_table.IRuleItem=} [properties] Properties to set
         * @returns {rule_tree_table.RuleItem} RuleItem instance
         */
        RuleItem.create = function create(properties) {
            return new RuleItem(properties);
        };

        /**
         * Encodes the specified RuleItem message. Does not implicitly {@link rule_tree_table.RuleItem.verify|verify} messages.
         * @function encode
         * @memberof rule_tree_table.RuleItem
         * @static
         * @param {rule_tree_table.IRuleItem} message RuleItem message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RuleItem.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.type);
            if (message.enabled != null && Object.hasOwnProperty.call(message, "enabled"))
                writer.uint32(/* id 3, wireType 0 =*/24).bool(message.enabled);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.description);
            if (message.sortOrder != null && Object.hasOwnProperty.call(message, "sortOrder"))
                writer.uint32(/* id 5, wireType 0 =*/40).int32(message.sortOrder);
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.name);
            if (message.logic != null && Object.hasOwnProperty.call(message, "logic"))
                writer.uint32(/* id 7, wireType 0 =*/56).int32(message.logic);
            if (message.color != null && Object.hasOwnProperty.call(message, "color"))
                writer.uint32(/* id 8, wireType 2 =*/66).string(message.color);
            if (message.conditions != null && message.conditions.length)
                for (let i = 0; i < message.conditions.length; ++i)
                    $root.rule_tree_table.RuleItem.encode(message.conditions[i], writer.uint32(/* id 9, wireType 2 =*/74).fork()).ldelim();
            if (message.field != null && Object.hasOwnProperty.call(message, "field"))
                writer.uint32(/* id 10, wireType 2 =*/82).string(message.field);
            if (message.operator != null && Object.hasOwnProperty.call(message, "operator"))
                writer.uint32(/* id 11, wireType 2 =*/90).string(message.operator);
            if (message.valueType != null && Object.hasOwnProperty.call(message, "valueType"))
                writer.uint32(/* id 12, wireType 0 =*/96).int32(message.valueType);
            if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                writer.uint32(/* id 13, wireType 2 =*/106).string(message.value);
            if (message.dataType != null && Object.hasOwnProperty.call(message, "dataType"))
                writer.uint32(/* id 14, wireType 0 =*/112).int32(message.dataType);
            if (message.metadata != null && Object.hasOwnProperty.call(message, "metadata"))
                $root.google.protobuf.Struct.encode(message.metadata, writer.uint32(/* id 15, wireType 2 =*/122).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified RuleItem message, length delimited. Does not implicitly {@link rule_tree_table.RuleItem.verify|verify} messages.
         * @function encodeDelimited
         * @memberof rule_tree_table.RuleItem
         * @static
         * @param {rule_tree_table.IRuleItem} message RuleItem message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RuleItem.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a RuleItem message from the specified reader or buffer.
         * @function decode
         * @memberof rule_tree_table.RuleItem
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {rule_tree_table.RuleItem} RuleItem
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RuleItem.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.rule_tree_table.RuleItem();
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
                        message.enabled = reader.bool();
                        break;
                    }
                case 4: {
                        message.description = reader.string();
                        break;
                    }
                case 5: {
                        message.sortOrder = reader.int32();
                        break;
                    }
                case 6: {
                        message.name = reader.string();
                        break;
                    }
                case 7: {
                        message.logic = reader.int32();
                        break;
                    }
                case 8: {
                        message.color = reader.string();
                        break;
                    }
                case 9: {
                        if (!(message.conditions && message.conditions.length))
                            message.conditions = [];
                        message.conditions.push($root.rule_tree_table.RuleItem.decode(reader, reader.uint32()));
                        break;
                    }
                case 10: {
                        message.field = reader.string();
                        break;
                    }
                case 11: {
                        message.operator = reader.string();
                        break;
                    }
                case 12: {
                        message.valueType = reader.int32();
                        break;
                    }
                case 13: {
                        message.value = reader.string();
                        break;
                    }
                case 14: {
                        message.dataType = reader.int32();
                        break;
                    }
                case 15: {
                        message.metadata = $root.google.protobuf.Struct.decode(reader, reader.uint32());
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
         * Decodes a RuleItem message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof rule_tree_table.RuleItem
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {rule_tree_table.RuleItem} RuleItem
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RuleItem.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a RuleItem message.
         * @function verify
         * @memberof rule_tree_table.RuleItem
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        RuleItem.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
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
                case 3:
                    break;
                }
            if (message.enabled != null && message.hasOwnProperty("enabled"))
                if (typeof message.enabled !== "boolean")
                    return "enabled: boolean expected";
            if (message.description != null && message.hasOwnProperty("description")) {
                properties._description = 1;
                if (!$util.isString(message.description))
                    return "description: string expected";
            }
            if (message.sortOrder != null && message.hasOwnProperty("sortOrder"))
                if (!$util.isInteger(message.sortOrder))
                    return "sortOrder: integer expected";
            if (message.name != null && message.hasOwnProperty("name")) {
                properties._name = 1;
                if (!$util.isString(message.name))
                    return "name: string expected";
            }
            if (message.logic != null && message.hasOwnProperty("logic")) {
                properties._logic = 1;
                switch (message.logic) {
                default:
                    return "logic: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                    break;
                }
            }
            if (message.color != null && message.hasOwnProperty("color")) {
                properties._color = 1;
                if (!$util.isString(message.color))
                    return "color: string expected";
            }
            if (message.conditions != null && message.hasOwnProperty("conditions")) {
                if (!Array.isArray(message.conditions))
                    return "conditions: array expected";
                for (let i = 0; i < message.conditions.length; ++i) {
                    let error = $root.rule_tree_table.RuleItem.verify(message.conditions[i]);
                    if (error)
                        return "conditions." + error;
                }
            }
            if (message.field != null && message.hasOwnProperty("field")) {
                properties._field = 1;
                if (!$util.isString(message.field))
                    return "field: string expected";
            }
            if (message.operator != null && message.hasOwnProperty("operator")) {
                properties._operator = 1;
                if (!$util.isString(message.operator))
                    return "operator: string expected";
            }
            if (message.valueType != null && message.hasOwnProperty("valueType")) {
                properties._valueType = 1;
                switch (message.valueType) {
                default:
                    return "valueType: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                    break;
                }
            }
            if (message.value != null && message.hasOwnProperty("value")) {
                properties._value = 1;
                if (!$util.isString(message.value))
                    return "value: string expected";
            }
            if (message.dataType != null && message.hasOwnProperty("dataType")) {
                properties._dataType = 1;
                switch (message.dataType) {
                default:
                    return "dataType: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                    break;
                }
            }
            if (message.metadata != null && message.hasOwnProperty("metadata")) {
                properties._metadata = 1;
                {
                    let error = $root.google.protobuf.Struct.verify(message.metadata);
                    if (error)
                        return "metadata." + error;
                }
            }
            return null;
        };

        /**
         * Creates a RuleItem message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof rule_tree_table.RuleItem
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {rule_tree_table.RuleItem} RuleItem
         */
        RuleItem.fromObject = function fromObject(object) {
            if (object instanceof $root.rule_tree_table.RuleItem)
                return object;
            let message = new $root.rule_tree_table.RuleItem();
            if (object.id != null)
                message.id = String(object.id);
            switch (object.type) {
            default:
                if (typeof object.type === "number") {
                    message.type = object.type;
                    break;
                }
                break;
            case "ITEM_TYPE_UNSPECIFIED":
            case 0:
                message.type = 0;
                break;
            case "ITEM_TYPE_GROUP":
            case 1:
                message.type = 1;
                break;
            case "ITEM_TYPE_CONDITION":
            case 2:
                message.type = 2;
                break;
            case "ITEM_TYPE_FOLDER":
            case 3:
                message.type = 3;
                break;
            }
            if (object.enabled != null)
                message.enabled = Boolean(object.enabled);
            if (object.description != null)
                message.description = String(object.description);
            if (object.sortOrder != null)
                message.sortOrder = object.sortOrder | 0;
            if (object.name != null)
                message.name = String(object.name);
            switch (object.logic) {
            default:
                if (typeof object.logic === "number") {
                    message.logic = object.logic;
                    break;
                }
                break;
            case "LOGIC_TYPE_UNSPECIFIED":
            case 0:
                message.logic = 0;
                break;
            case "LOGIC_TYPE_AND":
            case 1:
                message.logic = 1;
                break;
            case "LOGIC_TYPE_OR":
            case 2:
                message.logic = 2;
                break;
            case "LOGIC_TYPE_NOT":
            case 3:
                message.logic = 3;
                break;
            case "LOGIC_TYPE_XOR":
            case 4:
                message.logic = 4;
                break;
            }
            if (object.color != null)
                message.color = String(object.color);
            if (object.conditions) {
                if (!Array.isArray(object.conditions))
                    throw TypeError(".rule_tree_table.RuleItem.conditions: array expected");
                message.conditions = [];
                for (let i = 0; i < object.conditions.length; ++i) {
                    if (typeof object.conditions[i] !== "object")
                        throw TypeError(".rule_tree_table.RuleItem.conditions: object expected");
                    message.conditions[i] = $root.rule_tree_table.RuleItem.fromObject(object.conditions[i]);
                }
            }
            if (object.field != null)
                message.field = String(object.field);
            if (object.operator != null)
                message.operator = String(object.operator);
            switch (object.valueType) {
            default:
                if (typeof object.valueType === "number") {
                    message.valueType = object.valueType;
                    break;
                }
                break;
            case "VALUE_TYPE_UNSPECIFIED":
            case 0:
                message.valueType = 0;
                break;
            case "VALUE_TYPE_VALUE":
            case 1:
                message.valueType = 1;
                break;
            case "VALUE_TYPE_FIELD":
            case 2:
                message.valueType = 2;
                break;
            case "VALUE_TYPE_FUNCTION":
            case 3:
                message.valueType = 3;
                break;
            case "VALUE_TYPE_REGEX":
            case 4:
                message.valueType = 4;
                break;
            }
            if (object.value != null)
                message.value = String(object.value);
            switch (object.dataType) {
            default:
                if (typeof object.dataType === "number") {
                    message.dataType = object.dataType;
                    break;
                }
                break;
            case "DATA_TYPE_UNSPECIFIED":
            case 0:
                message.dataType = 0;
                break;
            case "DATA_TYPE_STRING":
            case 1:
                message.dataType = 1;
                break;
            case "DATA_TYPE_NUMBER":
            case 2:
                message.dataType = 2;
                break;
            case "DATA_TYPE_BOOLEAN":
            case 3:
                message.dataType = 3;
                break;
            case "DATA_TYPE_DATE":
            case 4:
                message.dataType = 4;
                break;
            }
            if (object.metadata != null) {
                if (typeof object.metadata !== "object")
                    throw TypeError(".rule_tree_table.RuleItem.metadata: object expected");
                message.metadata = $root.google.protobuf.Struct.fromObject(object.metadata);
            }
            return message;
        };

        /**
         * Creates a plain object from a RuleItem message. Also converts values to other types if specified.
         * @function toObject
         * @memberof rule_tree_table.RuleItem
         * @static
         * @param {rule_tree_table.RuleItem} message RuleItem
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        RuleItem.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.conditions = [];
            if (options.defaults) {
                object.id = "";
                object.type = options.enums === String ? "ITEM_TYPE_UNSPECIFIED" : 0;
                object.enabled = false;
                object.sortOrder = 0;
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.type != null && message.hasOwnProperty("type"))
                object.type = options.enums === String ? $root.rule_tree_table.ItemType[message.type] === undefined ? message.type : $root.rule_tree_table.ItemType[message.type] : message.type;
            if (message.enabled != null && message.hasOwnProperty("enabled"))
                object.enabled = message.enabled;
            if (message.description != null && message.hasOwnProperty("description")) {
                object.description = message.description;
                if (options.oneofs)
                    object._description = "description";
            }
            if (message.sortOrder != null && message.hasOwnProperty("sortOrder"))
                object.sortOrder = message.sortOrder;
            if (message.name != null && message.hasOwnProperty("name")) {
                object.name = message.name;
                if (options.oneofs)
                    object._name = "name";
            }
            if (message.logic != null && message.hasOwnProperty("logic")) {
                object.logic = options.enums === String ? $root.rule_tree_table.LogicType[message.logic] === undefined ? message.logic : $root.rule_tree_table.LogicType[message.logic] : message.logic;
                if (options.oneofs)
                    object._logic = "logic";
            }
            if (message.color != null && message.hasOwnProperty("color")) {
                object.color = message.color;
                if (options.oneofs)
                    object._color = "color";
            }
            if (message.conditions && message.conditions.length) {
                object.conditions = [];
                for (let j = 0; j < message.conditions.length; ++j)
                    object.conditions[j] = $root.rule_tree_table.RuleItem.toObject(message.conditions[j], options);
            }
            if (message.field != null && message.hasOwnProperty("field")) {
                object.field = message.field;
                if (options.oneofs)
                    object._field = "field";
            }
            if (message.operator != null && message.hasOwnProperty("operator")) {
                object.operator = message.operator;
                if (options.oneofs)
                    object._operator = "operator";
            }
            if (message.valueType != null && message.hasOwnProperty("valueType")) {
                object.valueType = options.enums === String ? $root.rule_tree_table.ValueType[message.valueType] === undefined ? message.valueType : $root.rule_tree_table.ValueType[message.valueType] : message.valueType;
                if (options.oneofs)
                    object._valueType = "valueType";
            }
            if (message.value != null && message.hasOwnProperty("value")) {
                object.value = message.value;
                if (options.oneofs)
                    object._value = "value";
            }
            if (message.dataType != null && message.hasOwnProperty("dataType")) {
                object.dataType = options.enums === String ? $root.rule_tree_table.DataType[message.dataType] === undefined ? message.dataType : $root.rule_tree_table.DataType[message.dataType] : message.dataType;
                if (options.oneofs)
                    object._dataType = "dataType";
            }
            if (message.metadata != null && message.hasOwnProperty("metadata")) {
                object.metadata = $root.google.protobuf.Struct.toObject(message.metadata, options);
                if (options.oneofs)
                    object._metadata = "metadata";
            }
            return object;
        };

        /**
         * Converts this RuleItem to JSON.
         * @function toJSON
         * @memberof rule_tree_table.RuleItem
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        RuleItem.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for RuleItem
         * @function getTypeUrl
         * @memberof rule_tree_table.RuleItem
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        RuleItem.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/rule_tree_table.RuleItem";
        };

        return RuleItem;
    })();

    rule_tree_table.RuleStats = (function() {

        /**
         * Properties of a RuleStats.
         * @memberof rule_tree_table
         * @interface IRuleStats
         * @property {number|null} [total] RuleStats total
         * @property {number|null} [groups] RuleStats groups
         * @property {number|null} [conditions] RuleStats conditions
         * @property {number|null} [enabled] RuleStats enabled
         * @property {number|null} [folders] RuleStats folders
         */

        /**
         * Constructs a new RuleStats.
         * @memberof rule_tree_table
         * @classdesc Represents a RuleStats.
         * @implements IRuleStats
         * @constructor
         * @param {rule_tree_table.IRuleStats=} [properties] Properties to set
         */
        function RuleStats(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * RuleStats total.
         * @member {number} total
         * @memberof rule_tree_table.RuleStats
         * @instance
         */
        RuleStats.prototype.total = 0;

        /**
         * RuleStats groups.
         * @member {number} groups
         * @memberof rule_tree_table.RuleStats
         * @instance
         */
        RuleStats.prototype.groups = 0;

        /**
         * RuleStats conditions.
         * @member {number} conditions
         * @memberof rule_tree_table.RuleStats
         * @instance
         */
        RuleStats.prototype.conditions = 0;

        /**
         * RuleStats enabled.
         * @member {number} enabled
         * @memberof rule_tree_table.RuleStats
         * @instance
         */
        RuleStats.prototype.enabled = 0;

        /**
         * RuleStats folders.
         * @member {number} folders
         * @memberof rule_tree_table.RuleStats
         * @instance
         */
        RuleStats.prototype.folders = 0;

        /**
         * Creates a new RuleStats instance using the specified properties.
         * @function create
         * @memberof rule_tree_table.RuleStats
         * @static
         * @param {rule_tree_table.IRuleStats=} [properties] Properties to set
         * @returns {rule_tree_table.RuleStats} RuleStats instance
         */
        RuleStats.create = function create(properties) {
            return new RuleStats(properties);
        };

        /**
         * Encodes the specified RuleStats message. Does not implicitly {@link rule_tree_table.RuleStats.verify|verify} messages.
         * @function encode
         * @memberof rule_tree_table.RuleStats
         * @static
         * @param {rule_tree_table.IRuleStats} message RuleStats message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RuleStats.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.total != null && Object.hasOwnProperty.call(message, "total"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.total);
            if (message.groups != null && Object.hasOwnProperty.call(message, "groups"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.groups);
            if (message.conditions != null && Object.hasOwnProperty.call(message, "conditions"))
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.conditions);
            if (message.enabled != null && Object.hasOwnProperty.call(message, "enabled"))
                writer.uint32(/* id 4, wireType 0 =*/32).int32(message.enabled);
            if (message.folders != null && Object.hasOwnProperty.call(message, "folders"))
                writer.uint32(/* id 5, wireType 0 =*/40).int32(message.folders);
            return writer;
        };

        /**
         * Encodes the specified RuleStats message, length delimited. Does not implicitly {@link rule_tree_table.RuleStats.verify|verify} messages.
         * @function encodeDelimited
         * @memberof rule_tree_table.RuleStats
         * @static
         * @param {rule_tree_table.IRuleStats} message RuleStats message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RuleStats.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a RuleStats message from the specified reader or buffer.
         * @function decode
         * @memberof rule_tree_table.RuleStats
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {rule_tree_table.RuleStats} RuleStats
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RuleStats.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.rule_tree_table.RuleStats();
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
                        message.groups = reader.int32();
                        break;
                    }
                case 3: {
                        message.conditions = reader.int32();
                        break;
                    }
                case 4: {
                        message.enabled = reader.int32();
                        break;
                    }
                case 5: {
                        message.folders = reader.int32();
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
         * Decodes a RuleStats message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof rule_tree_table.RuleStats
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {rule_tree_table.RuleStats} RuleStats
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RuleStats.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a RuleStats message.
         * @function verify
         * @memberof rule_tree_table.RuleStats
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        RuleStats.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.total != null && message.hasOwnProperty("total"))
                if (!$util.isInteger(message.total))
                    return "total: integer expected";
            if (message.groups != null && message.hasOwnProperty("groups"))
                if (!$util.isInteger(message.groups))
                    return "groups: integer expected";
            if (message.conditions != null && message.hasOwnProperty("conditions"))
                if (!$util.isInteger(message.conditions))
                    return "conditions: integer expected";
            if (message.enabled != null && message.hasOwnProperty("enabled"))
                if (!$util.isInteger(message.enabled))
                    return "enabled: integer expected";
            if (message.folders != null && message.hasOwnProperty("folders"))
                if (!$util.isInteger(message.folders))
                    return "folders: integer expected";
            return null;
        };

        /**
         * Creates a RuleStats message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof rule_tree_table.RuleStats
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {rule_tree_table.RuleStats} RuleStats
         */
        RuleStats.fromObject = function fromObject(object) {
            if (object instanceof $root.rule_tree_table.RuleStats)
                return object;
            let message = new $root.rule_tree_table.RuleStats();
            if (object.total != null)
                message.total = object.total | 0;
            if (object.groups != null)
                message.groups = object.groups | 0;
            if (object.conditions != null)
                message.conditions = object.conditions | 0;
            if (object.enabled != null)
                message.enabled = object.enabled | 0;
            if (object.folders != null)
                message.folders = object.folders | 0;
            return message;
        };

        /**
         * Creates a plain object from a RuleStats message. Also converts values to other types if specified.
         * @function toObject
         * @memberof rule_tree_table.RuleStats
         * @static
         * @param {rule_tree_table.RuleStats} message RuleStats
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        RuleStats.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.total = 0;
                object.groups = 0;
                object.conditions = 0;
                object.enabled = 0;
                object.folders = 0;
            }
            if (message.total != null && message.hasOwnProperty("total"))
                object.total = message.total;
            if (message.groups != null && message.hasOwnProperty("groups"))
                object.groups = message.groups;
            if (message.conditions != null && message.hasOwnProperty("conditions"))
                object.conditions = message.conditions;
            if (message.enabled != null && message.hasOwnProperty("enabled"))
                object.enabled = message.enabled;
            if (message.folders != null && message.hasOwnProperty("folders"))
                object.folders = message.folders;
            return object;
        };

        /**
         * Converts this RuleStats to JSON.
         * @function toJSON
         * @memberof rule_tree_table.RuleStats
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        RuleStats.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for RuleStats
         * @function getTypeUrl
         * @memberof rule_tree_table.RuleStats
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        RuleStats.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/rule_tree_table.RuleStats";
        };

        return RuleStats;
    })();

    rule_tree_table.ValidationResult = (function() {

        /**
         * Properties of a ValidationResult.
         * @memberof rule_tree_table
         * @interface IValidationResult
         * @property {boolean|null} [isValid] ValidationResult isValid
         * @property {Array.<rule_tree_table.IValidationError>|null} [errors] ValidationResult errors
         */

        /**
         * Constructs a new ValidationResult.
         * @memberof rule_tree_table
         * @classdesc Represents a ValidationResult.
         * @implements IValidationResult
         * @constructor
         * @param {rule_tree_table.IValidationResult=} [properties] Properties to set
         */
        function ValidationResult(properties) {
            this.errors = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ValidationResult isValid.
         * @member {boolean} isValid
         * @memberof rule_tree_table.ValidationResult
         * @instance
         */
        ValidationResult.prototype.isValid = false;

        /**
         * ValidationResult errors.
         * @member {Array.<rule_tree_table.IValidationError>} errors
         * @memberof rule_tree_table.ValidationResult
         * @instance
         */
        ValidationResult.prototype.errors = $util.emptyArray;

        /**
         * Creates a new ValidationResult instance using the specified properties.
         * @function create
         * @memberof rule_tree_table.ValidationResult
         * @static
         * @param {rule_tree_table.IValidationResult=} [properties] Properties to set
         * @returns {rule_tree_table.ValidationResult} ValidationResult instance
         */
        ValidationResult.create = function create(properties) {
            return new ValidationResult(properties);
        };

        /**
         * Encodes the specified ValidationResult message. Does not implicitly {@link rule_tree_table.ValidationResult.verify|verify} messages.
         * @function encode
         * @memberof rule_tree_table.ValidationResult
         * @static
         * @param {rule_tree_table.IValidationResult} message ValidationResult message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ValidationResult.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.isValid != null && Object.hasOwnProperty.call(message, "isValid"))
                writer.uint32(/* id 1, wireType 0 =*/8).bool(message.isValid);
            if (message.errors != null && message.errors.length)
                for (let i = 0; i < message.errors.length; ++i)
                    $root.rule_tree_table.ValidationError.encode(message.errors[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified ValidationResult message, length delimited. Does not implicitly {@link rule_tree_table.ValidationResult.verify|verify} messages.
         * @function encodeDelimited
         * @memberof rule_tree_table.ValidationResult
         * @static
         * @param {rule_tree_table.IValidationResult} message ValidationResult message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ValidationResult.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ValidationResult message from the specified reader or buffer.
         * @function decode
         * @memberof rule_tree_table.ValidationResult
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {rule_tree_table.ValidationResult} ValidationResult
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ValidationResult.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.rule_tree_table.ValidationResult();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.isValid = reader.bool();
                        break;
                    }
                case 2: {
                        if (!(message.errors && message.errors.length))
                            message.errors = [];
                        message.errors.push($root.rule_tree_table.ValidationError.decode(reader, reader.uint32()));
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
         * Decodes a ValidationResult message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof rule_tree_table.ValidationResult
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {rule_tree_table.ValidationResult} ValidationResult
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ValidationResult.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ValidationResult message.
         * @function verify
         * @memberof rule_tree_table.ValidationResult
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ValidationResult.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.isValid != null && message.hasOwnProperty("isValid"))
                if (typeof message.isValid !== "boolean")
                    return "isValid: boolean expected";
            if (message.errors != null && message.hasOwnProperty("errors")) {
                if (!Array.isArray(message.errors))
                    return "errors: array expected";
                for (let i = 0; i < message.errors.length; ++i) {
                    let error = $root.rule_tree_table.ValidationError.verify(message.errors[i]);
                    if (error)
                        return "errors." + error;
                }
            }
            return null;
        };

        /**
         * Creates a ValidationResult message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof rule_tree_table.ValidationResult
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {rule_tree_table.ValidationResult} ValidationResult
         */
        ValidationResult.fromObject = function fromObject(object) {
            if (object instanceof $root.rule_tree_table.ValidationResult)
                return object;
            let message = new $root.rule_tree_table.ValidationResult();
            if (object.isValid != null)
                message.isValid = Boolean(object.isValid);
            if (object.errors) {
                if (!Array.isArray(object.errors))
                    throw TypeError(".rule_tree_table.ValidationResult.errors: array expected");
                message.errors = [];
                for (let i = 0; i < object.errors.length; ++i) {
                    if (typeof object.errors[i] !== "object")
                        throw TypeError(".rule_tree_table.ValidationResult.errors: object expected");
                    message.errors[i] = $root.rule_tree_table.ValidationError.fromObject(object.errors[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a ValidationResult message. Also converts values to other types if specified.
         * @function toObject
         * @memberof rule_tree_table.ValidationResult
         * @static
         * @param {rule_tree_table.ValidationResult} message ValidationResult
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ValidationResult.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.errors = [];
            if (options.defaults)
                object.isValid = false;
            if (message.isValid != null && message.hasOwnProperty("isValid"))
                object.isValid = message.isValid;
            if (message.errors && message.errors.length) {
                object.errors = [];
                for (let j = 0; j < message.errors.length; ++j)
                    object.errors[j] = $root.rule_tree_table.ValidationError.toObject(message.errors[j], options);
            }
            return object;
        };

        /**
         * Converts this ValidationResult to JSON.
         * @function toJSON
         * @memberof rule_tree_table.ValidationResult
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ValidationResult.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ValidationResult
         * @function getTypeUrl
         * @memberof rule_tree_table.ValidationResult
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ValidationResult.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/rule_tree_table.ValidationResult";
        };

        return ValidationResult;
    })();

    rule_tree_table.ValidationError = (function() {

        /**
         * Properties of a ValidationError.
         * @memberof rule_tree_table
         * @interface IValidationError
         * @property {string|null} [path] ValidationError path
         * @property {string|null} [message] ValidationError message
         * @property {string|null} [itemId] ValidationError itemId
         */

        /**
         * Constructs a new ValidationError.
         * @memberof rule_tree_table
         * @classdesc Represents a ValidationError.
         * @implements IValidationError
         * @constructor
         * @param {rule_tree_table.IValidationError=} [properties] Properties to set
         */
        function ValidationError(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ValidationError path.
         * @member {string} path
         * @memberof rule_tree_table.ValidationError
         * @instance
         */
        ValidationError.prototype.path = "";

        /**
         * ValidationError message.
         * @member {string} message
         * @memberof rule_tree_table.ValidationError
         * @instance
         */
        ValidationError.prototype.message = "";

        /**
         * ValidationError itemId.
         * @member {string|null|undefined} itemId
         * @memberof rule_tree_table.ValidationError
         * @instance
         */
        ValidationError.prototype.itemId = null;

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(ValidationError.prototype, "_itemId", {
            get: $util.oneOfGetter($oneOfFields = ["itemId"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new ValidationError instance using the specified properties.
         * @function create
         * @memberof rule_tree_table.ValidationError
         * @static
         * @param {rule_tree_table.IValidationError=} [properties] Properties to set
         * @returns {rule_tree_table.ValidationError} ValidationError instance
         */
        ValidationError.create = function create(properties) {
            return new ValidationError(properties);
        };

        /**
         * Encodes the specified ValidationError message. Does not implicitly {@link rule_tree_table.ValidationError.verify|verify} messages.
         * @function encode
         * @memberof rule_tree_table.ValidationError
         * @static
         * @param {rule_tree_table.IValidationError} message ValidationError message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ValidationError.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.path != null && Object.hasOwnProperty.call(message, "path"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.path);
            if (message.message != null && Object.hasOwnProperty.call(message, "message"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.message);
            if (message.itemId != null && Object.hasOwnProperty.call(message, "itemId"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.itemId);
            return writer;
        };

        /**
         * Encodes the specified ValidationError message, length delimited. Does not implicitly {@link rule_tree_table.ValidationError.verify|verify} messages.
         * @function encodeDelimited
         * @memberof rule_tree_table.ValidationError
         * @static
         * @param {rule_tree_table.IValidationError} message ValidationError message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ValidationError.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ValidationError message from the specified reader or buffer.
         * @function decode
         * @memberof rule_tree_table.ValidationError
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {rule_tree_table.ValidationError} ValidationError
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ValidationError.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.rule_tree_table.ValidationError();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.path = reader.string();
                        break;
                    }
                case 2: {
                        message.message = reader.string();
                        break;
                    }
                case 3: {
                        message.itemId = reader.string();
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
         * Decodes a ValidationError message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof rule_tree_table.ValidationError
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {rule_tree_table.ValidationError} ValidationError
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ValidationError.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ValidationError message.
         * @function verify
         * @memberof rule_tree_table.ValidationError
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ValidationError.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
            if (message.path != null && message.hasOwnProperty("path"))
                if (!$util.isString(message.path))
                    return "path: string expected";
            if (message.message != null && message.hasOwnProperty("message"))
                if (!$util.isString(message.message))
                    return "message: string expected";
            if (message.itemId != null && message.hasOwnProperty("itemId")) {
                properties._itemId = 1;
                if (!$util.isString(message.itemId))
                    return "itemId: string expected";
            }
            return null;
        };

        /**
         * Creates a ValidationError message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof rule_tree_table.ValidationError
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {rule_tree_table.ValidationError} ValidationError
         */
        ValidationError.fromObject = function fromObject(object) {
            if (object instanceof $root.rule_tree_table.ValidationError)
                return object;
            let message = new $root.rule_tree_table.ValidationError();
            if (object.path != null)
                message.path = String(object.path);
            if (object.message != null)
                message.message = String(object.message);
            if (object.itemId != null)
                message.itemId = String(object.itemId);
            return message;
        };

        /**
         * Creates a plain object from a ValidationError message. Also converts values to other types if specified.
         * @function toObject
         * @memberof rule_tree_table.ValidationError
         * @static
         * @param {rule_tree_table.ValidationError} message ValidationError
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ValidationError.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.path = "";
                object.message = "";
            }
            if (message.path != null && message.hasOwnProperty("path"))
                object.path = message.path;
            if (message.message != null && message.hasOwnProperty("message"))
                object.message = message.message;
            if (message.itemId != null && message.hasOwnProperty("itemId")) {
                object.itemId = message.itemId;
                if (options.oneofs)
                    object._itemId = "itemId";
            }
            return object;
        };

        /**
         * Converts this ValidationError to JSON.
         * @function toJSON
         * @memberof rule_tree_table.ValidationError
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ValidationError.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ValidationError
         * @function getTypeUrl
         * @memberof rule_tree_table.ValidationError
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ValidationError.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/rule_tree_table.ValidationError";
        };

        return ValidationError;
    })();

    /**
     * ItemType enum.
     * @name rule_tree_table.ItemType
     * @enum {number}
     * @property {number} ITEM_TYPE_UNSPECIFIED=0 ITEM_TYPE_UNSPECIFIED value
     * @property {number} ITEM_TYPE_GROUP=1 ITEM_TYPE_GROUP value
     * @property {number} ITEM_TYPE_CONDITION=2 ITEM_TYPE_CONDITION value
     * @property {number} ITEM_TYPE_FOLDER=3 ITEM_TYPE_FOLDER value
     */
    rule_tree_table.ItemType = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "ITEM_TYPE_UNSPECIFIED"] = 0;
        values[valuesById[1] = "ITEM_TYPE_GROUP"] = 1;
        values[valuesById[2] = "ITEM_TYPE_CONDITION"] = 2;
        values[valuesById[3] = "ITEM_TYPE_FOLDER"] = 3;
        return values;
    })();

    /**
     * LogicType enum.
     * @name rule_tree_table.LogicType
     * @enum {number}
     * @property {number} LOGIC_TYPE_UNSPECIFIED=0 LOGIC_TYPE_UNSPECIFIED value
     * @property {number} LOGIC_TYPE_AND=1 LOGIC_TYPE_AND value
     * @property {number} LOGIC_TYPE_OR=2 LOGIC_TYPE_OR value
     * @property {number} LOGIC_TYPE_NOT=3 LOGIC_TYPE_NOT value
     * @property {number} LOGIC_TYPE_XOR=4 LOGIC_TYPE_XOR value
     */
    rule_tree_table.LogicType = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "LOGIC_TYPE_UNSPECIFIED"] = 0;
        values[valuesById[1] = "LOGIC_TYPE_AND"] = 1;
        values[valuesById[2] = "LOGIC_TYPE_OR"] = 2;
        values[valuesById[3] = "LOGIC_TYPE_NOT"] = 3;
        values[valuesById[4] = "LOGIC_TYPE_XOR"] = 4;
        return values;
    })();

    /**
     * ValueType enum.
     * @name rule_tree_table.ValueType
     * @enum {number}
     * @property {number} VALUE_TYPE_UNSPECIFIED=0 VALUE_TYPE_UNSPECIFIED value
     * @property {number} VALUE_TYPE_VALUE=1 VALUE_TYPE_VALUE value
     * @property {number} VALUE_TYPE_FIELD=2 VALUE_TYPE_FIELD value
     * @property {number} VALUE_TYPE_FUNCTION=3 VALUE_TYPE_FUNCTION value
     * @property {number} VALUE_TYPE_REGEX=4 VALUE_TYPE_REGEX value
     */
    rule_tree_table.ValueType = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "VALUE_TYPE_UNSPECIFIED"] = 0;
        values[valuesById[1] = "VALUE_TYPE_VALUE"] = 1;
        values[valuesById[2] = "VALUE_TYPE_FIELD"] = 2;
        values[valuesById[3] = "VALUE_TYPE_FUNCTION"] = 3;
        values[valuesById[4] = "VALUE_TYPE_REGEX"] = 4;
        return values;
    })();

    /**
     * DataType enum.
     * @name rule_tree_table.DataType
     * @enum {number}
     * @property {number} DATA_TYPE_UNSPECIFIED=0 DATA_TYPE_UNSPECIFIED value
     * @property {number} DATA_TYPE_STRING=1 DATA_TYPE_STRING value
     * @property {number} DATA_TYPE_NUMBER=2 DATA_TYPE_NUMBER value
     * @property {number} DATA_TYPE_BOOLEAN=3 DATA_TYPE_BOOLEAN value
     * @property {number} DATA_TYPE_DATE=4 DATA_TYPE_DATE value
     */
    rule_tree_table.DataType = (function() {
        const valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "DATA_TYPE_UNSPECIFIED"] = 0;
        values[valuesById[1] = "DATA_TYPE_STRING"] = 1;
        values[valuesById[2] = "DATA_TYPE_NUMBER"] = 2;
        values[valuesById[3] = "DATA_TYPE_BOOLEAN"] = 3;
        values[valuesById[4] = "DATA_TYPE_DATE"] = 4;
        return values;
    })();

    return rule_tree_table;
})();

export const google = $root.google = (() => {

    /**
     * Namespace google.
     * @exports google
     * @namespace
     */
    const google = {};

    google.protobuf = (function() {

        /**
         * Namespace protobuf.
         * @memberof google
         * @namespace
         */
        const protobuf = {};

        protobuf.Struct = (function() {

            /**
             * Properties of a Struct.
             * @memberof google.protobuf
             * @interface IStruct
             * @property {Object.<string,google.protobuf.IValue>|null} [fields] Struct fields
             */

            /**
             * Constructs a new Struct.
             * @memberof google.protobuf
             * @classdesc Represents a Struct.
             * @implements IStruct
             * @constructor
             * @param {google.protobuf.IStruct=} [properties] Properties to set
             */
            function Struct(properties) {
                this.fields = {};
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Struct fields.
             * @member {Object.<string,google.protobuf.IValue>} fields
             * @memberof google.protobuf.Struct
             * @instance
             */
            Struct.prototype.fields = $util.emptyObject;

            /**
             * Creates a new Struct instance using the specified properties.
             * @function create
             * @memberof google.protobuf.Struct
             * @static
             * @param {google.protobuf.IStruct=} [properties] Properties to set
             * @returns {google.protobuf.Struct} Struct instance
             */
            Struct.create = function create(properties) {
                return new Struct(properties);
            };

            /**
             * Encodes the specified Struct message. Does not implicitly {@link google.protobuf.Struct.verify|verify} messages.
             * @function encode
             * @memberof google.protobuf.Struct
             * @static
             * @param {google.protobuf.IStruct} message Struct message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Struct.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.fields != null && Object.hasOwnProperty.call(message, "fields"))
                    for (let keys = Object.keys(message.fields), i = 0; i < keys.length; ++i) {
                        writer.uint32(/* id 1, wireType 2 =*/10).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                        $root.google.protobuf.Value.encode(message.fields[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
                    }
                return writer;
            };

            /**
             * Encodes the specified Struct message, length delimited. Does not implicitly {@link google.protobuf.Struct.verify|verify} messages.
             * @function encodeDelimited
             * @memberof google.protobuf.Struct
             * @static
             * @param {google.protobuf.IStruct} message Struct message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Struct.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Struct message from the specified reader or buffer.
             * @function decode
             * @memberof google.protobuf.Struct
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {google.protobuf.Struct} Struct
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Struct.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.google.protobuf.Struct(), key, value;
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            if (message.fields === $util.emptyObject)
                                message.fields = {};
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
                                    value = $root.google.protobuf.Value.decode(reader, reader.uint32());
                                    break;
                                default:
                                    reader.skipType(tag2 & 7);
                                    break;
                                }
                            }
                            message.fields[key] = value;
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
             * Decodes a Struct message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof google.protobuf.Struct
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {google.protobuf.Struct} Struct
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Struct.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Struct message.
             * @function verify
             * @memberof google.protobuf.Struct
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Struct.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.fields != null && message.hasOwnProperty("fields")) {
                    if (!$util.isObject(message.fields))
                        return "fields: object expected";
                    let key = Object.keys(message.fields);
                    for (let i = 0; i < key.length; ++i) {
                        let error = $root.google.protobuf.Value.verify(message.fields[key[i]]);
                        if (error)
                            return "fields." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a Struct message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof google.protobuf.Struct
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {google.protobuf.Struct} Struct
             */
            Struct.fromObject = function fromObject(object) {
                if (object instanceof $root.google.protobuf.Struct)
                    return object;
                let message = new $root.google.protobuf.Struct();
                if (object.fields) {
                    if (typeof object.fields !== "object")
                        throw TypeError(".google.protobuf.Struct.fields: object expected");
                    message.fields = {};
                    for (let keys = Object.keys(object.fields), i = 0; i < keys.length; ++i) {
                        if (typeof object.fields[keys[i]] !== "object")
                            throw TypeError(".google.protobuf.Struct.fields: object expected");
                        message.fields[keys[i]] = $root.google.protobuf.Value.fromObject(object.fields[keys[i]]);
                    }
                }
                return message;
            };

            /**
             * Creates a plain object from a Struct message. Also converts values to other types if specified.
             * @function toObject
             * @memberof google.protobuf.Struct
             * @static
             * @param {google.protobuf.Struct} message Struct
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Struct.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.objects || options.defaults)
                    object.fields = {};
                let keys2;
                if (message.fields && (keys2 = Object.keys(message.fields)).length) {
                    object.fields = {};
                    for (let j = 0; j < keys2.length; ++j)
                        object.fields[keys2[j]] = $root.google.protobuf.Value.toObject(message.fields[keys2[j]], options);
                }
                return object;
            };

            /**
             * Converts this Struct to JSON.
             * @function toJSON
             * @memberof google.protobuf.Struct
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Struct.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Struct
             * @function getTypeUrl
             * @memberof google.protobuf.Struct
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Struct.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/google.protobuf.Struct";
            };

            return Struct;
        })();

        protobuf.Value = (function() {

            /**
             * Properties of a Value.
             * @memberof google.protobuf
             * @interface IValue
             * @property {google.protobuf.NullValue|null} [nullValue] Value nullValue
             * @property {number|null} [numberValue] Value numberValue
             * @property {string|null} [stringValue] Value stringValue
             * @property {boolean|null} [boolValue] Value boolValue
             * @property {google.protobuf.IStruct|null} [structValue] Value structValue
             * @property {google.protobuf.IListValue|null} [listValue] Value listValue
             */

            /**
             * Constructs a new Value.
             * @memberof google.protobuf
             * @classdesc Represents a Value.
             * @implements IValue
             * @constructor
             * @param {google.protobuf.IValue=} [properties] Properties to set
             */
            function Value(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Value nullValue.
             * @member {google.protobuf.NullValue|null|undefined} nullValue
             * @memberof google.protobuf.Value
             * @instance
             */
            Value.prototype.nullValue = null;

            /**
             * Value numberValue.
             * @member {number|null|undefined} numberValue
             * @memberof google.protobuf.Value
             * @instance
             */
            Value.prototype.numberValue = null;

            /**
             * Value stringValue.
             * @member {string|null|undefined} stringValue
             * @memberof google.protobuf.Value
             * @instance
             */
            Value.prototype.stringValue = null;

            /**
             * Value boolValue.
             * @member {boolean|null|undefined} boolValue
             * @memberof google.protobuf.Value
             * @instance
             */
            Value.prototype.boolValue = null;

            /**
             * Value structValue.
             * @member {google.protobuf.IStruct|null|undefined} structValue
             * @memberof google.protobuf.Value
             * @instance
             */
            Value.prototype.structValue = null;

            /**
             * Value listValue.
             * @member {google.protobuf.IListValue|null|undefined} listValue
             * @memberof google.protobuf.Value
             * @instance
             */
            Value.prototype.listValue = null;

            // OneOf field names bound to virtual getters and setters
            let $oneOfFields;

            /**
             * Value kind.
             * @member {"nullValue"|"numberValue"|"stringValue"|"boolValue"|"structValue"|"listValue"|undefined} kind
             * @memberof google.protobuf.Value
             * @instance
             */
            Object.defineProperty(Value.prototype, "kind", {
                get: $util.oneOfGetter($oneOfFields = ["nullValue", "numberValue", "stringValue", "boolValue", "structValue", "listValue"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new Value instance using the specified properties.
             * @function create
             * @memberof google.protobuf.Value
             * @static
             * @param {google.protobuf.IValue=} [properties] Properties to set
             * @returns {google.protobuf.Value} Value instance
             */
            Value.create = function create(properties) {
                return new Value(properties);
            };

            /**
             * Encodes the specified Value message. Does not implicitly {@link google.protobuf.Value.verify|verify} messages.
             * @function encode
             * @memberof google.protobuf.Value
             * @static
             * @param {google.protobuf.IValue} message Value message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Value.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.nullValue != null && Object.hasOwnProperty.call(message, "nullValue"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.nullValue);
                if (message.numberValue != null && Object.hasOwnProperty.call(message, "numberValue"))
                    writer.uint32(/* id 2, wireType 1 =*/17).double(message.numberValue);
                if (message.stringValue != null && Object.hasOwnProperty.call(message, "stringValue"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.stringValue);
                if (message.boolValue != null && Object.hasOwnProperty.call(message, "boolValue"))
                    writer.uint32(/* id 4, wireType 0 =*/32).bool(message.boolValue);
                if (message.structValue != null && Object.hasOwnProperty.call(message, "structValue"))
                    $root.google.protobuf.Struct.encode(message.structValue, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                if (message.listValue != null && Object.hasOwnProperty.call(message, "listValue"))
                    $root.google.protobuf.ListValue.encode(message.listValue, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified Value message, length delimited. Does not implicitly {@link google.protobuf.Value.verify|verify} messages.
             * @function encodeDelimited
             * @memberof google.protobuf.Value
             * @static
             * @param {google.protobuf.IValue} message Value message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Value.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Value message from the specified reader or buffer.
             * @function decode
             * @memberof google.protobuf.Value
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {google.protobuf.Value} Value
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Value.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.google.protobuf.Value();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.nullValue = reader.int32();
                            break;
                        }
                    case 2: {
                            message.numberValue = reader.double();
                            break;
                        }
                    case 3: {
                            message.stringValue = reader.string();
                            break;
                        }
                    case 4: {
                            message.boolValue = reader.bool();
                            break;
                        }
                    case 5: {
                            message.structValue = $root.google.protobuf.Struct.decode(reader, reader.uint32());
                            break;
                        }
                    case 6: {
                            message.listValue = $root.google.protobuf.ListValue.decode(reader, reader.uint32());
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
             * Decodes a Value message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof google.protobuf.Value
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {google.protobuf.Value} Value
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Value.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Value message.
             * @function verify
             * @memberof google.protobuf.Value
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Value.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                let properties = {};
                if (message.nullValue != null && message.hasOwnProperty("nullValue")) {
                    properties.kind = 1;
                    switch (message.nullValue) {
                    default:
                        return "nullValue: enum value expected";
                    case 0:
                        break;
                    }
                }
                if (message.numberValue != null && message.hasOwnProperty("numberValue")) {
                    if (properties.kind === 1)
                        return "kind: multiple values";
                    properties.kind = 1;
                    if (typeof message.numberValue !== "number")
                        return "numberValue: number expected";
                }
                if (message.stringValue != null && message.hasOwnProperty("stringValue")) {
                    if (properties.kind === 1)
                        return "kind: multiple values";
                    properties.kind = 1;
                    if (!$util.isString(message.stringValue))
                        return "stringValue: string expected";
                }
                if (message.boolValue != null && message.hasOwnProperty("boolValue")) {
                    if (properties.kind === 1)
                        return "kind: multiple values";
                    properties.kind = 1;
                    if (typeof message.boolValue !== "boolean")
                        return "boolValue: boolean expected";
                }
                if (message.structValue != null && message.hasOwnProperty("structValue")) {
                    if (properties.kind === 1)
                        return "kind: multiple values";
                    properties.kind = 1;
                    {
                        let error = $root.google.protobuf.Struct.verify(message.structValue);
                        if (error)
                            return "structValue." + error;
                    }
                }
                if (message.listValue != null && message.hasOwnProperty("listValue")) {
                    if (properties.kind === 1)
                        return "kind: multiple values";
                    properties.kind = 1;
                    {
                        let error = $root.google.protobuf.ListValue.verify(message.listValue);
                        if (error)
                            return "listValue." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a Value message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof google.protobuf.Value
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {google.protobuf.Value} Value
             */
            Value.fromObject = function fromObject(object) {
                if (object instanceof $root.google.protobuf.Value)
                    return object;
                let message = new $root.google.protobuf.Value();
                switch (object.nullValue) {
                default:
                    if (typeof object.nullValue === "number") {
                        message.nullValue = object.nullValue;
                        break;
                    }
                    break;
                case "NULL_VALUE":
                case 0:
                    message.nullValue = 0;
                    break;
                }
                if (object.numberValue != null)
                    message.numberValue = Number(object.numberValue);
                if (object.stringValue != null)
                    message.stringValue = String(object.stringValue);
                if (object.boolValue != null)
                    message.boolValue = Boolean(object.boolValue);
                if (object.structValue != null) {
                    if (typeof object.structValue !== "object")
                        throw TypeError(".google.protobuf.Value.structValue: object expected");
                    message.structValue = $root.google.protobuf.Struct.fromObject(object.structValue);
                }
                if (object.listValue != null) {
                    if (typeof object.listValue !== "object")
                        throw TypeError(".google.protobuf.Value.listValue: object expected");
                    message.listValue = $root.google.protobuf.ListValue.fromObject(object.listValue);
                }
                return message;
            };

            /**
             * Creates a plain object from a Value message. Also converts values to other types if specified.
             * @function toObject
             * @memberof google.protobuf.Value
             * @static
             * @param {google.protobuf.Value} message Value
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Value.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (message.nullValue != null && message.hasOwnProperty("nullValue")) {
                    object.nullValue = options.enums === String ? $root.google.protobuf.NullValue[message.nullValue] === undefined ? message.nullValue : $root.google.protobuf.NullValue[message.nullValue] : message.nullValue;
                    if (options.oneofs)
                        object.kind = "nullValue";
                }
                if (message.numberValue != null && message.hasOwnProperty("numberValue")) {
                    object.numberValue = options.json && !isFinite(message.numberValue) ? String(message.numberValue) : message.numberValue;
                    if (options.oneofs)
                        object.kind = "numberValue";
                }
                if (message.stringValue != null && message.hasOwnProperty("stringValue")) {
                    object.stringValue = message.stringValue;
                    if (options.oneofs)
                        object.kind = "stringValue";
                }
                if (message.boolValue != null && message.hasOwnProperty("boolValue")) {
                    object.boolValue = message.boolValue;
                    if (options.oneofs)
                        object.kind = "boolValue";
                }
                if (message.structValue != null && message.hasOwnProperty("structValue")) {
                    object.structValue = $root.google.protobuf.Struct.toObject(message.structValue, options);
                    if (options.oneofs)
                        object.kind = "structValue";
                }
                if (message.listValue != null && message.hasOwnProperty("listValue")) {
                    object.listValue = $root.google.protobuf.ListValue.toObject(message.listValue, options);
                    if (options.oneofs)
                        object.kind = "listValue";
                }
                return object;
            };

            /**
             * Converts this Value to JSON.
             * @function toJSON
             * @memberof google.protobuf.Value
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Value.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Value
             * @function getTypeUrl
             * @memberof google.protobuf.Value
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Value.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/google.protobuf.Value";
            };

            return Value;
        })();

        /**
         * NullValue enum.
         * @name google.protobuf.NullValue
         * @enum {number}
         * @property {number} NULL_VALUE=0 NULL_VALUE value
         */
        protobuf.NullValue = (function() {
            const valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "NULL_VALUE"] = 0;
            return values;
        })();

        protobuf.ListValue = (function() {

            /**
             * Properties of a ListValue.
             * @memberof google.protobuf
             * @interface IListValue
             * @property {Array.<google.protobuf.IValue>|null} [values] ListValue values
             */

            /**
             * Constructs a new ListValue.
             * @memberof google.protobuf
             * @classdesc Represents a ListValue.
             * @implements IListValue
             * @constructor
             * @param {google.protobuf.IListValue=} [properties] Properties to set
             */
            function ListValue(properties) {
                this.values = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ListValue values.
             * @member {Array.<google.protobuf.IValue>} values
             * @memberof google.protobuf.ListValue
             * @instance
             */
            ListValue.prototype.values = $util.emptyArray;

            /**
             * Creates a new ListValue instance using the specified properties.
             * @function create
             * @memberof google.protobuf.ListValue
             * @static
             * @param {google.protobuf.IListValue=} [properties] Properties to set
             * @returns {google.protobuf.ListValue} ListValue instance
             */
            ListValue.create = function create(properties) {
                return new ListValue(properties);
            };

            /**
             * Encodes the specified ListValue message. Does not implicitly {@link google.protobuf.ListValue.verify|verify} messages.
             * @function encode
             * @memberof google.protobuf.ListValue
             * @static
             * @param {google.protobuf.IListValue} message ListValue message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ListValue.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.values != null && message.values.length)
                    for (let i = 0; i < message.values.length; ++i)
                        $root.google.protobuf.Value.encode(message.values[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified ListValue message, length delimited. Does not implicitly {@link google.protobuf.ListValue.verify|verify} messages.
             * @function encodeDelimited
             * @memberof google.protobuf.ListValue
             * @static
             * @param {google.protobuf.IListValue} message ListValue message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ListValue.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ListValue message from the specified reader or buffer.
             * @function decode
             * @memberof google.protobuf.ListValue
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {google.protobuf.ListValue} ListValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ListValue.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.google.protobuf.ListValue();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            if (!(message.values && message.values.length))
                                message.values = [];
                            message.values.push($root.google.protobuf.Value.decode(reader, reader.uint32()));
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
             * Decodes a ListValue message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof google.protobuf.ListValue
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {google.protobuf.ListValue} ListValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ListValue.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ListValue message.
             * @function verify
             * @memberof google.protobuf.ListValue
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ListValue.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.values != null && message.hasOwnProperty("values")) {
                    if (!Array.isArray(message.values))
                        return "values: array expected";
                    for (let i = 0; i < message.values.length; ++i) {
                        let error = $root.google.protobuf.Value.verify(message.values[i]);
                        if (error)
                            return "values." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a ListValue message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof google.protobuf.ListValue
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {google.protobuf.ListValue} ListValue
             */
            ListValue.fromObject = function fromObject(object) {
                if (object instanceof $root.google.protobuf.ListValue)
                    return object;
                let message = new $root.google.protobuf.ListValue();
                if (object.values) {
                    if (!Array.isArray(object.values))
                        throw TypeError(".google.protobuf.ListValue.values: array expected");
                    message.values = [];
                    for (let i = 0; i < object.values.length; ++i) {
                        if (typeof object.values[i] !== "object")
                            throw TypeError(".google.protobuf.ListValue.values: object expected");
                        message.values[i] = $root.google.protobuf.Value.fromObject(object.values[i]);
                    }
                }
                return message;
            };

            /**
             * Creates a plain object from a ListValue message. Also converts values to other types if specified.
             * @function toObject
             * @memberof google.protobuf.ListValue
             * @static
             * @param {google.protobuf.ListValue} message ListValue
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ListValue.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.arrays || options.defaults)
                    object.values = [];
                if (message.values && message.values.length) {
                    object.values = [];
                    for (let j = 0; j < message.values.length; ++j)
                        object.values[j] = $root.google.protobuf.Value.toObject(message.values[j], options);
                }
                return object;
            };

            /**
             * Converts this ListValue to JSON.
             * @function toJSON
             * @memberof google.protobuf.ListValue
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ListValue.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ListValue
             * @function getTypeUrl
             * @memberof google.protobuf.ListValue
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ListValue.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/google.protobuf.ListValue";
            };

            return ListValue;
        })();

        return protobuf;
    })();

    return google;
})();

export { $root as default };
