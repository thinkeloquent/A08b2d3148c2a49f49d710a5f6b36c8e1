import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace rule_tree_table. */
export namespace rule_tree_table {

    /** Properties of a RuleTree. */
    interface IRuleTree {

        /** RuleTree id */
        id?: (string|null);

        /** RuleTree name */
        name?: (string|null);

        /** RuleTree description */
        description?: (string|null);

        /** RuleTree isActive */
        isActive?: (boolean|null);

        /** RuleTree items */
        items?: (rule_tree_table.IRuleItem[]|null);

        /** RuleTree stats */
        stats?: (rule_tree_table.IRuleStats|null);

        /** RuleTree createdAt */
        createdAt?: (string|null);

        /** RuleTree updatedAt */
        updatedAt?: (string|null);

        /** RuleTree graphType */
        graphType?: (string|null);

        /** RuleTree language */
        language?: (string|null);
    }

    /** Represents a RuleTree. */
    class RuleTree implements IRuleTree {

        /**
         * Constructs a new RuleTree.
         * @param [properties] Properties to set
         */
        constructor(properties?: rule_tree_table.IRuleTree);

        /** RuleTree id. */
        public id: string;

        /** RuleTree name. */
        public name: string;

        /** RuleTree description. */
        public description?: (string|null);

        /** RuleTree isActive. */
        public isActive: boolean;

        /** RuleTree items. */
        public items: rule_tree_table.IRuleItem[];

        /** RuleTree stats. */
        public stats?: (rule_tree_table.IRuleStats|null);

        /** RuleTree createdAt. */
        public createdAt: string;

        /** RuleTree updatedAt. */
        public updatedAt: string;

        /** RuleTree graphType. */
        public graphType: string;

        /** RuleTree language. */
        public language: string;

        /**
         * Creates a new RuleTree instance using the specified properties.
         * @param [properties] Properties to set
         * @returns RuleTree instance
         */
        public static create(properties?: rule_tree_table.IRuleTree): rule_tree_table.RuleTree;

        /**
         * Encodes the specified RuleTree message. Does not implicitly {@link rule_tree_table.RuleTree.verify|verify} messages.
         * @param message RuleTree message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: rule_tree_table.IRuleTree, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified RuleTree message, length delimited. Does not implicitly {@link rule_tree_table.RuleTree.verify|verify} messages.
         * @param message RuleTree message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: rule_tree_table.IRuleTree, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a RuleTree message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns RuleTree
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): rule_tree_table.RuleTree;

        /**
         * Decodes a RuleTree message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns RuleTree
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): rule_tree_table.RuleTree;

        /**
         * Verifies a RuleTree message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a RuleTree message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns RuleTree
         */
        public static fromObject(object: { [k: string]: any }): rule_tree_table.RuleTree;

        /**
         * Creates a plain object from a RuleTree message. Also converts values to other types if specified.
         * @param message RuleTree
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: rule_tree_table.RuleTree, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this RuleTree to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for RuleTree
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a RuleItem. */
    interface IRuleItem {

        /** RuleItem id */
        id?: (string|null);

        /** RuleItem type */
        type?: (rule_tree_table.ItemType|null);

        /** RuleItem enabled */
        enabled?: (boolean|null);

        /** RuleItem description */
        description?: (string|null);

        /** RuleItem sortOrder */
        sortOrder?: (number|null);

        /** RuleItem name */
        name?: (string|null);

        /** RuleItem logic */
        logic?: (rule_tree_table.LogicType|null);

        /** RuleItem color */
        color?: (string|null);

        /** RuleItem conditions */
        conditions?: (rule_tree_table.IRuleItem[]|null);

        /** RuleItem field */
        field?: (string|null);

        /** RuleItem operator */
        operator?: (string|null);

        /** RuleItem valueType */
        valueType?: (rule_tree_table.ValueType|null);

        /** RuleItem value */
        value?: (string|null);

        /** RuleItem dataType */
        dataType?: (rule_tree_table.DataType|null);

        /** RuleItem metadata */
        metadata?: (google.protobuf.IStruct|null);
    }

    /** Represents a RuleItem. */
    class RuleItem implements IRuleItem {

        /**
         * Constructs a new RuleItem.
         * @param [properties] Properties to set
         */
        constructor(properties?: rule_tree_table.IRuleItem);

        /** RuleItem id. */
        public id: string;

        /** RuleItem type. */
        public type: rule_tree_table.ItemType;

        /** RuleItem enabled. */
        public enabled: boolean;

        /** RuleItem description. */
        public description?: (string|null);

        /** RuleItem sortOrder. */
        public sortOrder: number;

        /** RuleItem name. */
        public name?: (string|null);

        /** RuleItem logic. */
        public logic?: (rule_tree_table.LogicType|null);

        /** RuleItem color. */
        public color?: (string|null);

        /** RuleItem conditions. */
        public conditions: rule_tree_table.IRuleItem[];

        /** RuleItem field. */
        public field?: (string|null);

        /** RuleItem operator. */
        public operator?: (string|null);

        /** RuleItem valueType. */
        public valueType?: (rule_tree_table.ValueType|null);

        /** RuleItem value. */
        public value?: (string|null);

        /** RuleItem dataType. */
        public dataType?: (rule_tree_table.DataType|null);

        /** RuleItem metadata. */
        public metadata?: (google.protobuf.IStruct|null);

        /**
         * Creates a new RuleItem instance using the specified properties.
         * @param [properties] Properties to set
         * @returns RuleItem instance
         */
        public static create(properties?: rule_tree_table.IRuleItem): rule_tree_table.RuleItem;

        /**
         * Encodes the specified RuleItem message. Does not implicitly {@link rule_tree_table.RuleItem.verify|verify} messages.
         * @param message RuleItem message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: rule_tree_table.IRuleItem, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified RuleItem message, length delimited. Does not implicitly {@link rule_tree_table.RuleItem.verify|verify} messages.
         * @param message RuleItem message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: rule_tree_table.IRuleItem, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a RuleItem message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns RuleItem
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): rule_tree_table.RuleItem;

        /**
         * Decodes a RuleItem message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns RuleItem
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): rule_tree_table.RuleItem;

        /**
         * Verifies a RuleItem message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a RuleItem message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns RuleItem
         */
        public static fromObject(object: { [k: string]: any }): rule_tree_table.RuleItem;

        /**
         * Creates a plain object from a RuleItem message. Also converts values to other types if specified.
         * @param message RuleItem
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: rule_tree_table.RuleItem, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this RuleItem to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for RuleItem
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a RuleStats. */
    interface IRuleStats {

        /** RuleStats total */
        total?: (number|null);

        /** RuleStats groups */
        groups?: (number|null);

        /** RuleStats conditions */
        conditions?: (number|null);

        /** RuleStats enabled */
        enabled?: (number|null);

        /** RuleStats folders */
        folders?: (number|null);
    }

    /** Represents a RuleStats. */
    class RuleStats implements IRuleStats {

        /**
         * Constructs a new RuleStats.
         * @param [properties] Properties to set
         */
        constructor(properties?: rule_tree_table.IRuleStats);

        /** RuleStats total. */
        public total: number;

        /** RuleStats groups. */
        public groups: number;

        /** RuleStats conditions. */
        public conditions: number;

        /** RuleStats enabled. */
        public enabled: number;

        /** RuleStats folders. */
        public folders: number;

        /**
         * Creates a new RuleStats instance using the specified properties.
         * @param [properties] Properties to set
         * @returns RuleStats instance
         */
        public static create(properties?: rule_tree_table.IRuleStats): rule_tree_table.RuleStats;

        /**
         * Encodes the specified RuleStats message. Does not implicitly {@link rule_tree_table.RuleStats.verify|verify} messages.
         * @param message RuleStats message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: rule_tree_table.IRuleStats, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified RuleStats message, length delimited. Does not implicitly {@link rule_tree_table.RuleStats.verify|verify} messages.
         * @param message RuleStats message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: rule_tree_table.IRuleStats, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a RuleStats message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns RuleStats
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): rule_tree_table.RuleStats;

        /**
         * Decodes a RuleStats message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns RuleStats
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): rule_tree_table.RuleStats;

        /**
         * Verifies a RuleStats message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a RuleStats message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns RuleStats
         */
        public static fromObject(object: { [k: string]: any }): rule_tree_table.RuleStats;

        /**
         * Creates a plain object from a RuleStats message. Also converts values to other types if specified.
         * @param message RuleStats
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: rule_tree_table.RuleStats, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this RuleStats to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for RuleStats
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a ValidationResult. */
    interface IValidationResult {

        /** ValidationResult isValid */
        isValid?: (boolean|null);

        /** ValidationResult errors */
        errors?: (rule_tree_table.IValidationError[]|null);
    }

    /** Represents a ValidationResult. */
    class ValidationResult implements IValidationResult {

        /**
         * Constructs a new ValidationResult.
         * @param [properties] Properties to set
         */
        constructor(properties?: rule_tree_table.IValidationResult);

        /** ValidationResult isValid. */
        public isValid: boolean;

        /** ValidationResult errors. */
        public errors: rule_tree_table.IValidationError[];

        /**
         * Creates a new ValidationResult instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ValidationResult instance
         */
        public static create(properties?: rule_tree_table.IValidationResult): rule_tree_table.ValidationResult;

        /**
         * Encodes the specified ValidationResult message. Does not implicitly {@link rule_tree_table.ValidationResult.verify|verify} messages.
         * @param message ValidationResult message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: rule_tree_table.IValidationResult, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ValidationResult message, length delimited. Does not implicitly {@link rule_tree_table.ValidationResult.verify|verify} messages.
         * @param message ValidationResult message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: rule_tree_table.IValidationResult, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ValidationResult message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ValidationResult
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): rule_tree_table.ValidationResult;

        /**
         * Decodes a ValidationResult message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ValidationResult
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): rule_tree_table.ValidationResult;

        /**
         * Verifies a ValidationResult message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a ValidationResult message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ValidationResult
         */
        public static fromObject(object: { [k: string]: any }): rule_tree_table.ValidationResult;

        /**
         * Creates a plain object from a ValidationResult message. Also converts values to other types if specified.
         * @param message ValidationResult
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: rule_tree_table.ValidationResult, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ValidationResult to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for ValidationResult
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a ValidationError. */
    interface IValidationError {

        /** ValidationError path */
        path?: (string|null);

        /** ValidationError message */
        message?: (string|null);

        /** ValidationError itemId */
        itemId?: (string|null);
    }

    /** Represents a ValidationError. */
    class ValidationError implements IValidationError {

        /**
         * Constructs a new ValidationError.
         * @param [properties] Properties to set
         */
        constructor(properties?: rule_tree_table.IValidationError);

        /** ValidationError path. */
        public path: string;

        /** ValidationError message. */
        public message: string;

        /** ValidationError itemId. */
        public itemId?: (string|null);

        /**
         * Creates a new ValidationError instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ValidationError instance
         */
        public static create(properties?: rule_tree_table.IValidationError): rule_tree_table.ValidationError;

        /**
         * Encodes the specified ValidationError message. Does not implicitly {@link rule_tree_table.ValidationError.verify|verify} messages.
         * @param message ValidationError message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: rule_tree_table.IValidationError, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ValidationError message, length delimited. Does not implicitly {@link rule_tree_table.ValidationError.verify|verify} messages.
         * @param message ValidationError message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: rule_tree_table.IValidationError, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ValidationError message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ValidationError
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): rule_tree_table.ValidationError;

        /**
         * Decodes a ValidationError message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ValidationError
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): rule_tree_table.ValidationError;

        /**
         * Verifies a ValidationError message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a ValidationError message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ValidationError
         */
        public static fromObject(object: { [k: string]: any }): rule_tree_table.ValidationError;

        /**
         * Creates a plain object from a ValidationError message. Also converts values to other types if specified.
         * @param message ValidationError
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: rule_tree_table.ValidationError, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ValidationError to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for ValidationError
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** ItemType enum. */
    enum ItemType {
        ITEM_TYPE_UNSPECIFIED = 0,
        ITEM_TYPE_GROUP = 1,
        ITEM_TYPE_CONDITION = 2,
        ITEM_TYPE_FOLDER = 3
    }

    /** LogicType enum. */
    enum LogicType {
        LOGIC_TYPE_UNSPECIFIED = 0,
        LOGIC_TYPE_AND = 1,
        LOGIC_TYPE_OR = 2,
        LOGIC_TYPE_NOT = 3,
        LOGIC_TYPE_XOR = 4
    }

    /** ValueType enum. */
    enum ValueType {
        VALUE_TYPE_UNSPECIFIED = 0,
        VALUE_TYPE_VALUE = 1,
        VALUE_TYPE_FIELD = 2,
        VALUE_TYPE_FUNCTION = 3,
        VALUE_TYPE_REGEX = 4
    }

    /** DataType enum. */
    enum DataType {
        DATA_TYPE_UNSPECIFIED = 0,
        DATA_TYPE_STRING = 1,
        DATA_TYPE_NUMBER = 2,
        DATA_TYPE_BOOLEAN = 3,
        DATA_TYPE_DATE = 4
    }
}

/** Namespace google. */
export namespace google {

    /** Namespace protobuf. */
    namespace protobuf {

        /** Properties of a Struct. */
        interface IStruct {

            /** Struct fields */
            fields?: ({ [k: string]: google.protobuf.IValue }|null);
        }

        /** Represents a Struct. */
        class Struct implements IStruct {

            /**
             * Constructs a new Struct.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IStruct);

            /** Struct fields. */
            public fields: { [k: string]: google.protobuf.IValue };

            /**
             * Creates a new Struct instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Struct instance
             */
            public static create(properties?: google.protobuf.IStruct): google.protobuf.Struct;

            /**
             * Encodes the specified Struct message. Does not implicitly {@link google.protobuf.Struct.verify|verify} messages.
             * @param message Struct message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IStruct, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Struct message, length delimited. Does not implicitly {@link google.protobuf.Struct.verify|verify} messages.
             * @param message Struct message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IStruct, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Struct message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Struct
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.Struct;

            /**
             * Decodes a Struct message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Struct
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.Struct;

            /**
             * Verifies a Struct message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Struct message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Struct
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.Struct;

            /**
             * Creates a plain object from a Struct message. Also converts values to other types if specified.
             * @param message Struct
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.Struct, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Struct to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Struct
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a Value. */
        interface IValue {

            /** Value nullValue */
            nullValue?: (google.protobuf.NullValue|null);

            /** Value numberValue */
            numberValue?: (number|null);

            /** Value stringValue */
            stringValue?: (string|null);

            /** Value boolValue */
            boolValue?: (boolean|null);

            /** Value structValue */
            structValue?: (google.protobuf.IStruct|null);

            /** Value listValue */
            listValue?: (google.protobuf.IListValue|null);
        }

        /** Represents a Value. */
        class Value implements IValue {

            /**
             * Constructs a new Value.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IValue);

            /** Value nullValue. */
            public nullValue?: (google.protobuf.NullValue|null);

            /** Value numberValue. */
            public numberValue?: (number|null);

            /** Value stringValue. */
            public stringValue?: (string|null);

            /** Value boolValue. */
            public boolValue?: (boolean|null);

            /** Value structValue. */
            public structValue?: (google.protobuf.IStruct|null);

            /** Value listValue. */
            public listValue?: (google.protobuf.IListValue|null);

            /** Value kind. */
            public kind?: ("nullValue"|"numberValue"|"stringValue"|"boolValue"|"structValue"|"listValue");

            /**
             * Creates a new Value instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Value instance
             */
            public static create(properties?: google.protobuf.IValue): google.protobuf.Value;

            /**
             * Encodes the specified Value message. Does not implicitly {@link google.protobuf.Value.verify|verify} messages.
             * @param message Value message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IValue, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Value message, length delimited. Does not implicitly {@link google.protobuf.Value.verify|verify} messages.
             * @param message Value message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IValue, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Value message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Value
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.Value;

            /**
             * Decodes a Value message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Value
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.Value;

            /**
             * Verifies a Value message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Value message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Value
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.Value;

            /**
             * Creates a plain object from a Value message. Also converts values to other types if specified.
             * @param message Value
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.Value, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Value to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Value
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** NullValue enum. */
        enum NullValue {
            NULL_VALUE = 0
        }

        /** Properties of a ListValue. */
        interface IListValue {

            /** ListValue values */
            values?: (google.protobuf.IValue[]|null);
        }

        /** Represents a ListValue. */
        class ListValue implements IListValue {

            /**
             * Constructs a new ListValue.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IListValue);

            /** ListValue values. */
            public values: google.protobuf.IValue[];

            /**
             * Creates a new ListValue instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ListValue instance
             */
            public static create(properties?: google.protobuf.IListValue): google.protobuf.ListValue;

            /**
             * Encodes the specified ListValue message. Does not implicitly {@link google.protobuf.ListValue.verify|verify} messages.
             * @param message ListValue message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IListValue, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ListValue message, length delimited. Does not implicitly {@link google.protobuf.ListValue.verify|verify} messages.
             * @param message ListValue message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IListValue, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ListValue message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ListValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.ListValue;

            /**
             * Decodes a ListValue message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ListValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.ListValue;

            /**
             * Verifies a ListValue message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ListValue message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ListValue
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.ListValue;

            /**
             * Creates a plain object from a ListValue message. Also converts values to other types if specified.
             * @param message ListValue
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.ListValue, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ListValue to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for ListValue
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}
