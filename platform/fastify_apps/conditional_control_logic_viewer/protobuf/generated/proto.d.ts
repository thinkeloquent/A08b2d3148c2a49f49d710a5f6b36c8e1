import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace conditional_control_logic_viewer. */
export namespace conditional_control_logic_viewer {

    /** FilterTreeStatus enum. */
    enum FilterTreeStatus {
        FILTER_TREE_STATUS_UNSPECIFIED = 0,
        FILTER_TREE_STATUS_ACTIVE = 1,
        FILTER_TREE_STATUS_ARCHIVED = 2
    }

    /** LogicalOperator enum. */
    enum LogicalOperator {
        LOGICAL_OPERATOR_UNSPECIFIED = 0,
        LOGICAL_OPERATOR_AND = 1,
        LOGICAL_OPERATOR_OR = 2
    }

    /** FilterNodeType enum. */
    enum FilterNodeType {
        FILTER_NODE_TYPE_UNSPECIFIED = 0,
        FILTER_NODE_TYPE_FILTER = 1,
        FILTER_NODE_TYPE_GROUP = 2
    }

    /** Properties of a PaginationRequest. */
    interface IPaginationRequest {

        /** PaginationRequest page */
        page?: (number|null);

        /** PaginationRequest pageSize */
        pageSize?: (number|null);
    }

    /** Represents a PaginationRequest. */
    class PaginationRequest implements IPaginationRequest {

        /**
         * Constructs a new PaginationRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: conditional_control_logic_viewer.IPaginationRequest);

        /** PaginationRequest page. */
        public page: number;

        /** PaginationRequest pageSize. */
        public pageSize: number;

        /**
         * Creates a new PaginationRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns PaginationRequest instance
         */
        public static create(properties?: conditional_control_logic_viewer.IPaginationRequest): conditional_control_logic_viewer.PaginationRequest;

        /**
         * Encodes the specified PaginationRequest message. Does not implicitly {@link conditional_control_logic_viewer.PaginationRequest.verify|verify} messages.
         * @param message PaginationRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: conditional_control_logic_viewer.IPaginationRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified PaginationRequest message, length delimited. Does not implicitly {@link conditional_control_logic_viewer.PaginationRequest.verify|verify} messages.
         * @param message PaginationRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: conditional_control_logic_viewer.IPaginationRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a PaginationRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns PaginationRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): conditional_control_logic_viewer.PaginationRequest;

        /**
         * Decodes a PaginationRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns PaginationRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): conditional_control_logic_viewer.PaginationRequest;

        /**
         * Verifies a PaginationRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a PaginationRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns PaginationRequest
         */
        public static fromObject(object: { [k: string]: any }): conditional_control_logic_viewer.PaginationRequest;

        /**
         * Creates a plain object from a PaginationRequest message. Also converts values to other types if specified.
         * @param message PaginationRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: conditional_control_logic_viewer.PaginationRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this PaginationRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for PaginationRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a PaginationResponse. */
    interface IPaginationResponse {

        /** PaginationResponse total */
        total?: (number|null);

        /** PaginationResponse page */
        page?: (number|null);

        /** PaginationResponse pageSize */
        pageSize?: (number|null);

        /** PaginationResponse totalPages */
        totalPages?: (number|null);
    }

    /** Represents a PaginationResponse. */
    class PaginationResponse implements IPaginationResponse {

        /**
         * Constructs a new PaginationResponse.
         * @param [properties] Properties to set
         */
        constructor(properties?: conditional_control_logic_viewer.IPaginationResponse);

        /** PaginationResponse total. */
        public total: number;

        /** PaginationResponse page. */
        public page: number;

        /** PaginationResponse pageSize. */
        public pageSize: number;

        /** PaginationResponse totalPages. */
        public totalPages: number;

        /**
         * Creates a new PaginationResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns PaginationResponse instance
         */
        public static create(properties?: conditional_control_logic_viewer.IPaginationResponse): conditional_control_logic_viewer.PaginationResponse;

        /**
         * Encodes the specified PaginationResponse message. Does not implicitly {@link conditional_control_logic_viewer.PaginationResponse.verify|verify} messages.
         * @param message PaginationResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: conditional_control_logic_viewer.IPaginationResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified PaginationResponse message, length delimited. Does not implicitly {@link conditional_control_logic_viewer.PaginationResponse.verify|verify} messages.
         * @param message PaginationResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: conditional_control_logic_viewer.IPaginationResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a PaginationResponse message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns PaginationResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): conditional_control_logic_viewer.PaginationResponse;

        /**
         * Decodes a PaginationResponse message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns PaginationResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): conditional_control_logic_viewer.PaginationResponse;

        /**
         * Verifies a PaginationResponse message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a PaginationResponse message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns PaginationResponse
         */
        public static fromObject(object: { [k: string]: any }): conditional_control_logic_viewer.PaginationResponse;

        /**
         * Creates a plain object from a PaginationResponse message. Also converts values to other types if specified.
         * @param message PaginationResponse
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: conditional_control_logic_viewer.PaginationResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this PaginationResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for PaginationResponse
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a Timestamp. */
    interface ITimestamp {

        /** Timestamp seconds */
        seconds?: (number|Long|null);

        /** Timestamp nanos */
        nanos?: (number|null);
    }

    /** Represents a Timestamp. */
    class Timestamp implements ITimestamp {

        /**
         * Constructs a new Timestamp.
         * @param [properties] Properties to set
         */
        constructor(properties?: conditional_control_logic_viewer.ITimestamp);

        /** Timestamp seconds. */
        public seconds: (number|Long);

        /** Timestamp nanos. */
        public nanos: number;

        /**
         * Creates a new Timestamp instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Timestamp instance
         */
        public static create(properties?: conditional_control_logic_viewer.ITimestamp): conditional_control_logic_viewer.Timestamp;

        /**
         * Encodes the specified Timestamp message. Does not implicitly {@link conditional_control_logic_viewer.Timestamp.verify|verify} messages.
         * @param message Timestamp message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: conditional_control_logic_viewer.ITimestamp, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Timestamp message, length delimited. Does not implicitly {@link conditional_control_logic_viewer.Timestamp.verify|verify} messages.
         * @param message Timestamp message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: conditional_control_logic_viewer.ITimestamp, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Timestamp message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Timestamp
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): conditional_control_logic_viewer.Timestamp;

        /**
         * Decodes a Timestamp message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Timestamp
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): conditional_control_logic_viewer.Timestamp;

        /**
         * Verifies a Timestamp message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Timestamp message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Timestamp
         */
        public static fromObject(object: { [k: string]: any }): conditional_control_logic_viewer.Timestamp;

        /**
         * Creates a plain object from a Timestamp message. Also converts values to other types if specified.
         * @param message Timestamp
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: conditional_control_logic_viewer.Timestamp, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Timestamp to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Timestamp
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a FilterCondition. */
    interface IFilterCondition {

        /** FilterCondition field */
        field?: (string|null);

        /** FilterCondition operator */
        operator?: (string|null);

        /** FilterCondition value */
        value?: (string|null);
    }

    /** Represents a FilterCondition. */
    class FilterCondition implements IFilterCondition {

        /**
         * Constructs a new FilterCondition.
         * @param [properties] Properties to set
         */
        constructor(properties?: conditional_control_logic_viewer.IFilterCondition);

        /** FilterCondition field. */
        public field: string;

        /** FilterCondition operator. */
        public operator: string;

        /** FilterCondition value. */
        public value: string;

        /**
         * Creates a new FilterCondition instance using the specified properties.
         * @param [properties] Properties to set
         * @returns FilterCondition instance
         */
        public static create(properties?: conditional_control_logic_viewer.IFilterCondition): conditional_control_logic_viewer.FilterCondition;

        /**
         * Encodes the specified FilterCondition message. Does not implicitly {@link conditional_control_logic_viewer.FilterCondition.verify|verify} messages.
         * @param message FilterCondition message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: conditional_control_logic_viewer.IFilterCondition, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified FilterCondition message, length delimited. Does not implicitly {@link conditional_control_logic_viewer.FilterCondition.verify|verify} messages.
         * @param message FilterCondition message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: conditional_control_logic_viewer.IFilterCondition, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a FilterCondition message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns FilterCondition
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): conditional_control_logic_viewer.FilterCondition;

        /**
         * Decodes a FilterCondition message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns FilterCondition
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): conditional_control_logic_viewer.FilterCondition;

        /**
         * Verifies a FilterCondition message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a FilterCondition message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns FilterCondition
         */
        public static fromObject(object: { [k: string]: any }): conditional_control_logic_viewer.FilterCondition;

        /**
         * Creates a plain object from a FilterCondition message. Also converts values to other types if specified.
         * @param message FilterCondition
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: conditional_control_logic_viewer.FilterCondition, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this FilterCondition to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for FilterCondition
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a FilterNode. */
    interface IFilterNode {

        /** FilterNode id */
        id?: (string|null);

        /** FilterNode type */
        type?: (conditional_control_logic_viewer.FilterNodeType|null);

        /** FilterNode condition */
        condition?: (conditional_control_logic_viewer.IFilterCondition|null);

        /** FilterNode operator */
        operator?: (conditional_control_logic_viewer.LogicalOperator|null);

        /** FilterNode children */
        children?: (conditional_control_logic_viewer.IFilterNode[]|null);

        /** FilterNode text */
        text?: (string|null);
    }

    /** Represents a FilterNode. */
    class FilterNode implements IFilterNode {

        /**
         * Constructs a new FilterNode.
         * @param [properties] Properties to set
         */
        constructor(properties?: conditional_control_logic_viewer.IFilterNode);

        /** FilterNode id. */
        public id: string;

        /** FilterNode type. */
        public type: conditional_control_logic_viewer.FilterNodeType;

        /** FilterNode condition. */
        public condition?: (conditional_control_logic_viewer.IFilterCondition|null);

        /** FilterNode operator. */
        public operator: conditional_control_logic_viewer.LogicalOperator;

        /** FilterNode children. */
        public children: conditional_control_logic_viewer.IFilterNode[];

        /** FilterNode text. */
        public text: string;

        /**
         * Creates a new FilterNode instance using the specified properties.
         * @param [properties] Properties to set
         * @returns FilterNode instance
         */
        public static create(properties?: conditional_control_logic_viewer.IFilterNode): conditional_control_logic_viewer.FilterNode;

        /**
         * Encodes the specified FilterNode message. Does not implicitly {@link conditional_control_logic_viewer.FilterNode.verify|verify} messages.
         * @param message FilterNode message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: conditional_control_logic_viewer.IFilterNode, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified FilterNode message, length delimited. Does not implicitly {@link conditional_control_logic_viewer.FilterNode.verify|verify} messages.
         * @param message FilterNode message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: conditional_control_logic_viewer.IFilterNode, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a FilterNode message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns FilterNode
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): conditional_control_logic_viewer.FilterNode;

        /**
         * Decodes a FilterNode message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns FilterNode
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): conditional_control_logic_viewer.FilterNode;

        /**
         * Verifies a FilterNode message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a FilterNode message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns FilterNode
         */
        public static fromObject(object: { [k: string]: any }): conditional_control_logic_viewer.FilterNode;

        /**
         * Creates a plain object from a FilterNode message. Also converts values to other types if specified.
         * @param message FilterNode
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: conditional_control_logic_viewer.FilterNode, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this FilterNode to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for FilterNode
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a FilterTree. */
    interface IFilterTree {

        /** FilterTree id */
        id?: (string|null);

        /** FilterTree name */
        name?: (string|null);

        /** FilterTree description */
        description?: (string|null);

        /** FilterTree status */
        status?: (conditional_control_logic_viewer.FilterTreeStatus|null);

        /** FilterTree treeData */
        treeData?: (conditional_control_logic_viewer.IFilterNode|null);

        /** FilterTree version */
        version?: (number|null);

        /** FilterTree createdBy */
        createdBy?: (string|null);

        /** FilterTree updatedBy */
        updatedBy?: (string|null);

        /** FilterTree createdAt */
        createdAt?: (conditional_control_logic_viewer.ITimestamp|null);

        /** FilterTree updatedAt */
        updatedAt?: (conditional_control_logic_viewer.ITimestamp|null);
    }

    /** Represents a FilterTree. */
    class FilterTree implements IFilterTree {

        /**
         * Constructs a new FilterTree.
         * @param [properties] Properties to set
         */
        constructor(properties?: conditional_control_logic_viewer.IFilterTree);

        /** FilterTree id. */
        public id: string;

        /** FilterTree name. */
        public name: string;

        /** FilterTree description. */
        public description: string;

        /** FilterTree status. */
        public status: conditional_control_logic_viewer.FilterTreeStatus;

        /** FilterTree treeData. */
        public treeData?: (conditional_control_logic_viewer.IFilterNode|null);

        /** FilterTree version. */
        public version: number;

        /** FilterTree createdBy. */
        public createdBy: string;

        /** FilterTree updatedBy. */
        public updatedBy: string;

        /** FilterTree createdAt. */
        public createdAt?: (conditional_control_logic_viewer.ITimestamp|null);

        /** FilterTree updatedAt. */
        public updatedAt?: (conditional_control_logic_viewer.ITimestamp|null);

        /**
         * Creates a new FilterTree instance using the specified properties.
         * @param [properties] Properties to set
         * @returns FilterTree instance
         */
        public static create(properties?: conditional_control_logic_viewer.IFilterTree): conditional_control_logic_viewer.FilterTree;

        /**
         * Encodes the specified FilterTree message. Does not implicitly {@link conditional_control_logic_viewer.FilterTree.verify|verify} messages.
         * @param message FilterTree message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: conditional_control_logic_viewer.IFilterTree, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified FilterTree message, length delimited. Does not implicitly {@link conditional_control_logic_viewer.FilterTree.verify|verify} messages.
         * @param message FilterTree message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: conditional_control_logic_viewer.IFilterTree, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a FilterTree message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns FilterTree
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): conditional_control_logic_viewer.FilterTree;

        /**
         * Decodes a FilterTree message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns FilterTree
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): conditional_control_logic_viewer.FilterTree;

        /**
         * Verifies a FilterTree message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a FilterTree message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns FilterTree
         */
        public static fromObject(object: { [k: string]: any }): conditional_control_logic_viewer.FilterTree;

        /**
         * Creates a plain object from a FilterTree message. Also converts values to other types if specified.
         * @param message FilterTree
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: conditional_control_logic_viewer.FilterTree, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this FilterTree to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for FilterTree
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a CreateFilterTreeRequest. */
    interface ICreateFilterTreeRequest {

        /** CreateFilterTreeRequest name */
        name?: (string|null);

        /** CreateFilterTreeRequest description */
        description?: (string|null);

        /** CreateFilterTreeRequest treeData */
        treeData?: (conditional_control_logic_viewer.IFilterNode|null);
    }

    /** Represents a CreateFilterTreeRequest. */
    class CreateFilterTreeRequest implements ICreateFilterTreeRequest {

        /**
         * Constructs a new CreateFilterTreeRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: conditional_control_logic_viewer.ICreateFilterTreeRequest);

        /** CreateFilterTreeRequest name. */
        public name: string;

        /** CreateFilterTreeRequest description. */
        public description: string;

        /** CreateFilterTreeRequest treeData. */
        public treeData?: (conditional_control_logic_viewer.IFilterNode|null);

        /**
         * Creates a new CreateFilterTreeRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CreateFilterTreeRequest instance
         */
        public static create(properties?: conditional_control_logic_viewer.ICreateFilterTreeRequest): conditional_control_logic_viewer.CreateFilterTreeRequest;

        /**
         * Encodes the specified CreateFilterTreeRequest message. Does not implicitly {@link conditional_control_logic_viewer.CreateFilterTreeRequest.verify|verify} messages.
         * @param message CreateFilterTreeRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: conditional_control_logic_viewer.ICreateFilterTreeRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CreateFilterTreeRequest message, length delimited. Does not implicitly {@link conditional_control_logic_viewer.CreateFilterTreeRequest.verify|verify} messages.
         * @param message CreateFilterTreeRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: conditional_control_logic_viewer.ICreateFilterTreeRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CreateFilterTreeRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns CreateFilterTreeRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): conditional_control_logic_viewer.CreateFilterTreeRequest;

        /**
         * Decodes a CreateFilterTreeRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns CreateFilterTreeRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): conditional_control_logic_viewer.CreateFilterTreeRequest;

        /**
         * Verifies a CreateFilterTreeRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CreateFilterTreeRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CreateFilterTreeRequest
         */
        public static fromObject(object: { [k: string]: any }): conditional_control_logic_viewer.CreateFilterTreeRequest;

        /**
         * Creates a plain object from a CreateFilterTreeRequest message. Also converts values to other types if specified.
         * @param message CreateFilterTreeRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: conditional_control_logic_viewer.CreateFilterTreeRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CreateFilterTreeRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for CreateFilterTreeRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a CreateFilterTreeResponse. */
    interface ICreateFilterTreeResponse {

        /** CreateFilterTreeResponse filterTree */
        filterTree?: (conditional_control_logic_viewer.IFilterTree|null);
    }

    /** Represents a CreateFilterTreeResponse. */
    class CreateFilterTreeResponse implements ICreateFilterTreeResponse {

        /**
         * Constructs a new CreateFilterTreeResponse.
         * @param [properties] Properties to set
         */
        constructor(properties?: conditional_control_logic_viewer.ICreateFilterTreeResponse);

        /** CreateFilterTreeResponse filterTree. */
        public filterTree?: (conditional_control_logic_viewer.IFilterTree|null);

        /**
         * Creates a new CreateFilterTreeResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CreateFilterTreeResponse instance
         */
        public static create(properties?: conditional_control_logic_viewer.ICreateFilterTreeResponse): conditional_control_logic_viewer.CreateFilterTreeResponse;

        /**
         * Encodes the specified CreateFilterTreeResponse message. Does not implicitly {@link conditional_control_logic_viewer.CreateFilterTreeResponse.verify|verify} messages.
         * @param message CreateFilterTreeResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: conditional_control_logic_viewer.ICreateFilterTreeResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CreateFilterTreeResponse message, length delimited. Does not implicitly {@link conditional_control_logic_viewer.CreateFilterTreeResponse.verify|verify} messages.
         * @param message CreateFilterTreeResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: conditional_control_logic_viewer.ICreateFilterTreeResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CreateFilterTreeResponse message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns CreateFilterTreeResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): conditional_control_logic_viewer.CreateFilterTreeResponse;

        /**
         * Decodes a CreateFilterTreeResponse message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns CreateFilterTreeResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): conditional_control_logic_viewer.CreateFilterTreeResponse;

        /**
         * Verifies a CreateFilterTreeResponse message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CreateFilterTreeResponse message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CreateFilterTreeResponse
         */
        public static fromObject(object: { [k: string]: any }): conditional_control_logic_viewer.CreateFilterTreeResponse;

        /**
         * Creates a plain object from a CreateFilterTreeResponse message. Also converts values to other types if specified.
         * @param message CreateFilterTreeResponse
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: conditional_control_logic_viewer.CreateFilterTreeResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CreateFilterTreeResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for CreateFilterTreeResponse
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a ListFilterTreesRequest. */
    interface IListFilterTreesRequest {

        /** ListFilterTreesRequest pagination */
        pagination?: (conditional_control_logic_viewer.IPaginationRequest|null);

        /** ListFilterTreesRequest search */
        search?: (string|null);

        /** ListFilterTreesRequest status */
        status?: (conditional_control_logic_viewer.FilterTreeStatus|null);
    }

    /** Represents a ListFilterTreesRequest. */
    class ListFilterTreesRequest implements IListFilterTreesRequest {

        /**
         * Constructs a new ListFilterTreesRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: conditional_control_logic_viewer.IListFilterTreesRequest);

        /** ListFilterTreesRequest pagination. */
        public pagination?: (conditional_control_logic_viewer.IPaginationRequest|null);

        /** ListFilterTreesRequest search. */
        public search: string;

        /** ListFilterTreesRequest status. */
        public status: conditional_control_logic_viewer.FilterTreeStatus;

        /**
         * Creates a new ListFilterTreesRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ListFilterTreesRequest instance
         */
        public static create(properties?: conditional_control_logic_viewer.IListFilterTreesRequest): conditional_control_logic_viewer.ListFilterTreesRequest;

        /**
         * Encodes the specified ListFilterTreesRequest message. Does not implicitly {@link conditional_control_logic_viewer.ListFilterTreesRequest.verify|verify} messages.
         * @param message ListFilterTreesRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: conditional_control_logic_viewer.IListFilterTreesRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ListFilterTreesRequest message, length delimited. Does not implicitly {@link conditional_control_logic_viewer.ListFilterTreesRequest.verify|verify} messages.
         * @param message ListFilterTreesRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: conditional_control_logic_viewer.IListFilterTreesRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ListFilterTreesRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ListFilterTreesRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): conditional_control_logic_viewer.ListFilterTreesRequest;

        /**
         * Decodes a ListFilterTreesRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ListFilterTreesRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): conditional_control_logic_viewer.ListFilterTreesRequest;

        /**
         * Verifies a ListFilterTreesRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a ListFilterTreesRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ListFilterTreesRequest
         */
        public static fromObject(object: { [k: string]: any }): conditional_control_logic_viewer.ListFilterTreesRequest;

        /**
         * Creates a plain object from a ListFilterTreesRequest message. Also converts values to other types if specified.
         * @param message ListFilterTreesRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: conditional_control_logic_viewer.ListFilterTreesRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ListFilterTreesRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for ListFilterTreesRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a ListFilterTreesResponse. */
    interface IListFilterTreesResponse {

        /** ListFilterTreesResponse filterTrees */
        filterTrees?: (conditional_control_logic_viewer.IFilterTree[]|null);

        /** ListFilterTreesResponse pagination */
        pagination?: (conditional_control_logic_viewer.IPaginationResponse|null);
    }

    /** Represents a ListFilterTreesResponse. */
    class ListFilterTreesResponse implements IListFilterTreesResponse {

        /**
         * Constructs a new ListFilterTreesResponse.
         * @param [properties] Properties to set
         */
        constructor(properties?: conditional_control_logic_viewer.IListFilterTreesResponse);

        /** ListFilterTreesResponse filterTrees. */
        public filterTrees: conditional_control_logic_viewer.IFilterTree[];

        /** ListFilterTreesResponse pagination. */
        public pagination?: (conditional_control_logic_viewer.IPaginationResponse|null);

        /**
         * Creates a new ListFilterTreesResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ListFilterTreesResponse instance
         */
        public static create(properties?: conditional_control_logic_viewer.IListFilterTreesResponse): conditional_control_logic_viewer.ListFilterTreesResponse;

        /**
         * Encodes the specified ListFilterTreesResponse message. Does not implicitly {@link conditional_control_logic_viewer.ListFilterTreesResponse.verify|verify} messages.
         * @param message ListFilterTreesResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: conditional_control_logic_viewer.IListFilterTreesResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ListFilterTreesResponse message, length delimited. Does not implicitly {@link conditional_control_logic_viewer.ListFilterTreesResponse.verify|verify} messages.
         * @param message ListFilterTreesResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: conditional_control_logic_viewer.IListFilterTreesResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ListFilterTreesResponse message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ListFilterTreesResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): conditional_control_logic_viewer.ListFilterTreesResponse;

        /**
         * Decodes a ListFilterTreesResponse message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ListFilterTreesResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): conditional_control_logic_viewer.ListFilterTreesResponse;

        /**
         * Verifies a ListFilterTreesResponse message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a ListFilterTreesResponse message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ListFilterTreesResponse
         */
        public static fromObject(object: { [k: string]: any }): conditional_control_logic_viewer.ListFilterTreesResponse;

        /**
         * Creates a plain object from a ListFilterTreesResponse message. Also converts values to other types if specified.
         * @param message ListFilterTreesResponse
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: conditional_control_logic_viewer.ListFilterTreesResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ListFilterTreesResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for ListFilterTreesResponse
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a GetFilterTreeRequest. */
    interface IGetFilterTreeRequest {

        /** GetFilterTreeRequest id */
        id?: (string|null);
    }

    /** Represents a GetFilterTreeRequest. */
    class GetFilterTreeRequest implements IGetFilterTreeRequest {

        /**
         * Constructs a new GetFilterTreeRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: conditional_control_logic_viewer.IGetFilterTreeRequest);

        /** GetFilterTreeRequest id. */
        public id: string;

        /**
         * Creates a new GetFilterTreeRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GetFilterTreeRequest instance
         */
        public static create(properties?: conditional_control_logic_viewer.IGetFilterTreeRequest): conditional_control_logic_viewer.GetFilterTreeRequest;

        /**
         * Encodes the specified GetFilterTreeRequest message. Does not implicitly {@link conditional_control_logic_viewer.GetFilterTreeRequest.verify|verify} messages.
         * @param message GetFilterTreeRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: conditional_control_logic_viewer.IGetFilterTreeRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified GetFilterTreeRequest message, length delimited. Does not implicitly {@link conditional_control_logic_viewer.GetFilterTreeRequest.verify|verify} messages.
         * @param message GetFilterTreeRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: conditional_control_logic_viewer.IGetFilterTreeRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GetFilterTreeRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns GetFilterTreeRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): conditional_control_logic_viewer.GetFilterTreeRequest;

        /**
         * Decodes a GetFilterTreeRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns GetFilterTreeRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): conditional_control_logic_viewer.GetFilterTreeRequest;

        /**
         * Verifies a GetFilterTreeRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a GetFilterTreeRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns GetFilterTreeRequest
         */
        public static fromObject(object: { [k: string]: any }): conditional_control_logic_viewer.GetFilterTreeRequest;

        /**
         * Creates a plain object from a GetFilterTreeRequest message. Also converts values to other types if specified.
         * @param message GetFilterTreeRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: conditional_control_logic_viewer.GetFilterTreeRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this GetFilterTreeRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for GetFilterTreeRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a GetFilterTreeResponse. */
    interface IGetFilterTreeResponse {

        /** GetFilterTreeResponse filterTree */
        filterTree?: (conditional_control_logic_viewer.IFilterTree|null);
    }

    /** Represents a GetFilterTreeResponse. */
    class GetFilterTreeResponse implements IGetFilterTreeResponse {

        /**
         * Constructs a new GetFilterTreeResponse.
         * @param [properties] Properties to set
         */
        constructor(properties?: conditional_control_logic_viewer.IGetFilterTreeResponse);

        /** GetFilterTreeResponse filterTree. */
        public filterTree?: (conditional_control_logic_viewer.IFilterTree|null);

        /**
         * Creates a new GetFilterTreeResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GetFilterTreeResponse instance
         */
        public static create(properties?: conditional_control_logic_viewer.IGetFilterTreeResponse): conditional_control_logic_viewer.GetFilterTreeResponse;

        /**
         * Encodes the specified GetFilterTreeResponse message. Does not implicitly {@link conditional_control_logic_viewer.GetFilterTreeResponse.verify|verify} messages.
         * @param message GetFilterTreeResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: conditional_control_logic_viewer.IGetFilterTreeResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified GetFilterTreeResponse message, length delimited. Does not implicitly {@link conditional_control_logic_viewer.GetFilterTreeResponse.verify|verify} messages.
         * @param message GetFilterTreeResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: conditional_control_logic_viewer.IGetFilterTreeResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GetFilterTreeResponse message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns GetFilterTreeResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): conditional_control_logic_viewer.GetFilterTreeResponse;

        /**
         * Decodes a GetFilterTreeResponse message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns GetFilterTreeResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): conditional_control_logic_viewer.GetFilterTreeResponse;

        /**
         * Verifies a GetFilterTreeResponse message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a GetFilterTreeResponse message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns GetFilterTreeResponse
         */
        public static fromObject(object: { [k: string]: any }): conditional_control_logic_viewer.GetFilterTreeResponse;

        /**
         * Creates a plain object from a GetFilterTreeResponse message. Also converts values to other types if specified.
         * @param message GetFilterTreeResponse
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: conditional_control_logic_viewer.GetFilterTreeResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this GetFilterTreeResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for GetFilterTreeResponse
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an UpdateFilterTreeRequest. */
    interface IUpdateFilterTreeRequest {

        /** UpdateFilterTreeRequest id */
        id?: (string|null);

        /** UpdateFilterTreeRequest name */
        name?: (string|null);

        /** UpdateFilterTreeRequest description */
        description?: (string|null);

        /** UpdateFilterTreeRequest treeData */
        treeData?: (conditional_control_logic_viewer.IFilterNode|null);

        /** UpdateFilterTreeRequest status */
        status?: (conditional_control_logic_viewer.FilterTreeStatus|null);
    }

    /** Represents an UpdateFilterTreeRequest. */
    class UpdateFilterTreeRequest implements IUpdateFilterTreeRequest {

        /**
         * Constructs a new UpdateFilterTreeRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: conditional_control_logic_viewer.IUpdateFilterTreeRequest);

        /** UpdateFilterTreeRequest id. */
        public id: string;

        /** UpdateFilterTreeRequest name. */
        public name: string;

        /** UpdateFilterTreeRequest description. */
        public description: string;

        /** UpdateFilterTreeRequest treeData. */
        public treeData?: (conditional_control_logic_viewer.IFilterNode|null);

        /** UpdateFilterTreeRequest status. */
        public status: conditional_control_logic_viewer.FilterTreeStatus;

        /**
         * Creates a new UpdateFilterTreeRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns UpdateFilterTreeRequest instance
         */
        public static create(properties?: conditional_control_logic_viewer.IUpdateFilterTreeRequest): conditional_control_logic_viewer.UpdateFilterTreeRequest;

        /**
         * Encodes the specified UpdateFilterTreeRequest message. Does not implicitly {@link conditional_control_logic_viewer.UpdateFilterTreeRequest.verify|verify} messages.
         * @param message UpdateFilterTreeRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: conditional_control_logic_viewer.IUpdateFilterTreeRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified UpdateFilterTreeRequest message, length delimited. Does not implicitly {@link conditional_control_logic_viewer.UpdateFilterTreeRequest.verify|verify} messages.
         * @param message UpdateFilterTreeRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: conditional_control_logic_viewer.IUpdateFilterTreeRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an UpdateFilterTreeRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns UpdateFilterTreeRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): conditional_control_logic_viewer.UpdateFilterTreeRequest;

        /**
         * Decodes an UpdateFilterTreeRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns UpdateFilterTreeRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): conditional_control_logic_viewer.UpdateFilterTreeRequest;

        /**
         * Verifies an UpdateFilterTreeRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an UpdateFilterTreeRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns UpdateFilterTreeRequest
         */
        public static fromObject(object: { [k: string]: any }): conditional_control_logic_viewer.UpdateFilterTreeRequest;

        /**
         * Creates a plain object from an UpdateFilterTreeRequest message. Also converts values to other types if specified.
         * @param message UpdateFilterTreeRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: conditional_control_logic_viewer.UpdateFilterTreeRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this UpdateFilterTreeRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for UpdateFilterTreeRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an UpdateFilterTreeResponse. */
    interface IUpdateFilterTreeResponse {

        /** UpdateFilterTreeResponse filterTree */
        filterTree?: (conditional_control_logic_viewer.IFilterTree|null);
    }

    /** Represents an UpdateFilterTreeResponse. */
    class UpdateFilterTreeResponse implements IUpdateFilterTreeResponse {

        /**
         * Constructs a new UpdateFilterTreeResponse.
         * @param [properties] Properties to set
         */
        constructor(properties?: conditional_control_logic_viewer.IUpdateFilterTreeResponse);

        /** UpdateFilterTreeResponse filterTree. */
        public filterTree?: (conditional_control_logic_viewer.IFilterTree|null);

        /**
         * Creates a new UpdateFilterTreeResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns UpdateFilterTreeResponse instance
         */
        public static create(properties?: conditional_control_logic_viewer.IUpdateFilterTreeResponse): conditional_control_logic_viewer.UpdateFilterTreeResponse;

        /**
         * Encodes the specified UpdateFilterTreeResponse message. Does not implicitly {@link conditional_control_logic_viewer.UpdateFilterTreeResponse.verify|verify} messages.
         * @param message UpdateFilterTreeResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: conditional_control_logic_viewer.IUpdateFilterTreeResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified UpdateFilterTreeResponse message, length delimited. Does not implicitly {@link conditional_control_logic_viewer.UpdateFilterTreeResponse.verify|verify} messages.
         * @param message UpdateFilterTreeResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: conditional_control_logic_viewer.IUpdateFilterTreeResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an UpdateFilterTreeResponse message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns UpdateFilterTreeResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): conditional_control_logic_viewer.UpdateFilterTreeResponse;

        /**
         * Decodes an UpdateFilterTreeResponse message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns UpdateFilterTreeResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): conditional_control_logic_viewer.UpdateFilterTreeResponse;

        /**
         * Verifies an UpdateFilterTreeResponse message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an UpdateFilterTreeResponse message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns UpdateFilterTreeResponse
         */
        public static fromObject(object: { [k: string]: any }): conditional_control_logic_viewer.UpdateFilterTreeResponse;

        /**
         * Creates a plain object from an UpdateFilterTreeResponse message. Also converts values to other types if specified.
         * @param message UpdateFilterTreeResponse
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: conditional_control_logic_viewer.UpdateFilterTreeResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this UpdateFilterTreeResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for UpdateFilterTreeResponse
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a DeleteFilterTreeRequest. */
    interface IDeleteFilterTreeRequest {

        /** DeleteFilterTreeRequest id */
        id?: (string|null);

        /** DeleteFilterTreeRequest permanent */
        permanent?: (boolean|null);
    }

    /** Represents a DeleteFilterTreeRequest. */
    class DeleteFilterTreeRequest implements IDeleteFilterTreeRequest {

        /**
         * Constructs a new DeleteFilterTreeRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: conditional_control_logic_viewer.IDeleteFilterTreeRequest);

        /** DeleteFilterTreeRequest id. */
        public id: string;

        /** DeleteFilterTreeRequest permanent. */
        public permanent: boolean;

        /**
         * Creates a new DeleteFilterTreeRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns DeleteFilterTreeRequest instance
         */
        public static create(properties?: conditional_control_logic_viewer.IDeleteFilterTreeRequest): conditional_control_logic_viewer.DeleteFilterTreeRequest;

        /**
         * Encodes the specified DeleteFilterTreeRequest message. Does not implicitly {@link conditional_control_logic_viewer.DeleteFilterTreeRequest.verify|verify} messages.
         * @param message DeleteFilterTreeRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: conditional_control_logic_viewer.IDeleteFilterTreeRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified DeleteFilterTreeRequest message, length delimited. Does not implicitly {@link conditional_control_logic_viewer.DeleteFilterTreeRequest.verify|verify} messages.
         * @param message DeleteFilterTreeRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: conditional_control_logic_viewer.IDeleteFilterTreeRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a DeleteFilterTreeRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns DeleteFilterTreeRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): conditional_control_logic_viewer.DeleteFilterTreeRequest;

        /**
         * Decodes a DeleteFilterTreeRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns DeleteFilterTreeRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): conditional_control_logic_viewer.DeleteFilterTreeRequest;

        /**
         * Verifies a DeleteFilterTreeRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a DeleteFilterTreeRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns DeleteFilterTreeRequest
         */
        public static fromObject(object: { [k: string]: any }): conditional_control_logic_viewer.DeleteFilterTreeRequest;

        /**
         * Creates a plain object from a DeleteFilterTreeRequest message. Also converts values to other types if specified.
         * @param message DeleteFilterTreeRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: conditional_control_logic_viewer.DeleteFilterTreeRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this DeleteFilterTreeRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for DeleteFilterTreeRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a CloneFilterTreeRequest. */
    interface ICloneFilterTreeRequest {

        /** CloneFilterTreeRequest id */
        id?: (string|null);

        /** CloneFilterTreeRequest name */
        name?: (string|null);
    }

    /** Represents a CloneFilterTreeRequest. */
    class CloneFilterTreeRequest implements ICloneFilterTreeRequest {

        /**
         * Constructs a new CloneFilterTreeRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: conditional_control_logic_viewer.ICloneFilterTreeRequest);

        /** CloneFilterTreeRequest id. */
        public id: string;

        /** CloneFilterTreeRequest name. */
        public name: string;

        /**
         * Creates a new CloneFilterTreeRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CloneFilterTreeRequest instance
         */
        public static create(properties?: conditional_control_logic_viewer.ICloneFilterTreeRequest): conditional_control_logic_viewer.CloneFilterTreeRequest;

        /**
         * Encodes the specified CloneFilterTreeRequest message. Does not implicitly {@link conditional_control_logic_viewer.CloneFilterTreeRequest.verify|verify} messages.
         * @param message CloneFilterTreeRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: conditional_control_logic_viewer.ICloneFilterTreeRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CloneFilterTreeRequest message, length delimited. Does not implicitly {@link conditional_control_logic_viewer.CloneFilterTreeRequest.verify|verify} messages.
         * @param message CloneFilterTreeRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: conditional_control_logic_viewer.ICloneFilterTreeRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CloneFilterTreeRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns CloneFilterTreeRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): conditional_control_logic_viewer.CloneFilterTreeRequest;

        /**
         * Decodes a CloneFilterTreeRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns CloneFilterTreeRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): conditional_control_logic_viewer.CloneFilterTreeRequest;

        /**
         * Verifies a CloneFilterTreeRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CloneFilterTreeRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CloneFilterTreeRequest
         */
        public static fromObject(object: { [k: string]: any }): conditional_control_logic_viewer.CloneFilterTreeRequest;

        /**
         * Creates a plain object from a CloneFilterTreeRequest message. Also converts values to other types if specified.
         * @param message CloneFilterTreeRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: conditional_control_logic_viewer.CloneFilterTreeRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CloneFilterTreeRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for CloneFilterTreeRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a CloneFilterTreeResponse. */
    interface ICloneFilterTreeResponse {

        /** CloneFilterTreeResponse filterTree */
        filterTree?: (conditional_control_logic_viewer.IFilterTree|null);
    }

    /** Represents a CloneFilterTreeResponse. */
    class CloneFilterTreeResponse implements ICloneFilterTreeResponse {

        /**
         * Constructs a new CloneFilterTreeResponse.
         * @param [properties] Properties to set
         */
        constructor(properties?: conditional_control_logic_viewer.ICloneFilterTreeResponse);

        /** CloneFilterTreeResponse filterTree. */
        public filterTree?: (conditional_control_logic_viewer.IFilterTree|null);

        /**
         * Creates a new CloneFilterTreeResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CloneFilterTreeResponse instance
         */
        public static create(properties?: conditional_control_logic_viewer.ICloneFilterTreeResponse): conditional_control_logic_viewer.CloneFilterTreeResponse;

        /**
         * Encodes the specified CloneFilterTreeResponse message. Does not implicitly {@link conditional_control_logic_viewer.CloneFilterTreeResponse.verify|verify} messages.
         * @param message CloneFilterTreeResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: conditional_control_logic_viewer.ICloneFilterTreeResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CloneFilterTreeResponse message, length delimited. Does not implicitly {@link conditional_control_logic_viewer.CloneFilterTreeResponse.verify|verify} messages.
         * @param message CloneFilterTreeResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: conditional_control_logic_viewer.ICloneFilterTreeResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CloneFilterTreeResponse message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns CloneFilterTreeResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): conditional_control_logic_viewer.CloneFilterTreeResponse;

        /**
         * Decodes a CloneFilterTreeResponse message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns CloneFilterTreeResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): conditional_control_logic_viewer.CloneFilterTreeResponse;

        /**
         * Verifies a CloneFilterTreeResponse message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CloneFilterTreeResponse message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CloneFilterTreeResponse
         */
        public static fromObject(object: { [k: string]: any }): conditional_control_logic_viewer.CloneFilterTreeResponse;

        /**
         * Creates a plain object from a CloneFilterTreeResponse message. Also converts values to other types if specified.
         * @param message CloneFilterTreeResponse
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: conditional_control_logic_viewer.CloneFilterTreeResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CloneFilterTreeResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for CloneFilterTreeResponse
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }
}
