import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace component_registry. */
export namespace component_registry {

    /** ComponentCategory enum. */
    enum ComponentCategory {
        COMPONENT_CATEGORY_UNSPECIFIED = 0,
        COMPONENT_CATEGORY_FORMS = 1,
        COMPONENT_CATEGORY_DATA = 2,
        COMPONENT_CATEGORY_LAYOUT = 3,
        COMPONENT_CATEGORY_FEEDBACK = 4,
        COMPONENT_CATEGORY_NAVIGATION = 5,
        COMPONENT_CATEGORY_OVERLAY = 6
    }

    /** ComponentStatus enum. */
    enum ComponentStatus {
        COMPONENT_STATUS_UNSPECIFIED = 0,
        COMPONENT_STATUS_STABLE = 1,
        COMPONENT_STATUS_BETA = 2,
        COMPONENT_STATUS_ALPHA = 3,
        COMPONENT_STATUS_DEPRECATED = 4
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
        constructor(properties?: component_registry.IPaginationRequest);

        /** PaginationRequest page. */
        public page: number;

        /** PaginationRequest pageSize. */
        public pageSize: number;

        /**
         * Creates a new PaginationRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns PaginationRequest instance
         */
        public static create(properties?: component_registry.IPaginationRequest): component_registry.PaginationRequest;

        /**
         * Encodes the specified PaginationRequest message. Does not implicitly {@link component_registry.PaginationRequest.verify|verify} messages.
         * @param message PaginationRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: component_registry.IPaginationRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified PaginationRequest message, length delimited. Does not implicitly {@link component_registry.PaginationRequest.verify|verify} messages.
         * @param message PaginationRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: component_registry.IPaginationRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a PaginationRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns PaginationRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): component_registry.PaginationRequest;

        /**
         * Decodes a PaginationRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns PaginationRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): component_registry.PaginationRequest;

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
        public static fromObject(object: { [k: string]: any }): component_registry.PaginationRequest;

        /**
         * Creates a plain object from a PaginationRequest message. Also converts values to other types if specified.
         * @param message PaginationRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: component_registry.PaginationRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
        constructor(properties?: component_registry.IPaginationResponse);

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
        public static create(properties?: component_registry.IPaginationResponse): component_registry.PaginationResponse;

        /**
         * Encodes the specified PaginationResponse message. Does not implicitly {@link component_registry.PaginationResponse.verify|verify} messages.
         * @param message PaginationResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: component_registry.IPaginationResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified PaginationResponse message, length delimited. Does not implicitly {@link component_registry.PaginationResponse.verify|verify} messages.
         * @param message PaginationResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: component_registry.IPaginationResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a PaginationResponse message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns PaginationResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): component_registry.PaginationResponse;

        /**
         * Decodes a PaginationResponse message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns PaginationResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): component_registry.PaginationResponse;

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
        public static fromObject(object: { [k: string]: any }): component_registry.PaginationResponse;

        /**
         * Creates a plain object from a PaginationResponse message. Also converts values to other types if specified.
         * @param message PaginationResponse
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: component_registry.PaginationResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
        constructor(properties?: component_registry.ITimestamp);

        /** Timestamp seconds. */
        public seconds: (number|Long);

        /** Timestamp nanos. */
        public nanos: number;

        /**
         * Creates a new Timestamp instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Timestamp instance
         */
        public static create(properties?: component_registry.ITimestamp): component_registry.Timestamp;

        /**
         * Encodes the specified Timestamp message. Does not implicitly {@link component_registry.Timestamp.verify|verify} messages.
         * @param message Timestamp message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: component_registry.ITimestamp, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Timestamp message, length delimited. Does not implicitly {@link component_registry.Timestamp.verify|verify} messages.
         * @param message Timestamp message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: component_registry.ITimestamp, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Timestamp message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Timestamp
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): component_registry.Timestamp;

        /**
         * Decodes a Timestamp message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Timestamp
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): component_registry.Timestamp;

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
        public static fromObject(object: { [k: string]: any }): component_registry.Timestamp;

        /**
         * Creates a plain object from a Timestamp message. Also converts values to other types if specified.
         * @param message Timestamp
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: component_registry.Timestamp, options?: $protobuf.IConversionOptions): { [k: string]: any };

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

    /** Properties of a Component. */
    interface IComponent {

        /** Component id */
        id?: (string|null);

        /** Component name */
        name?: (string|null);

        /** Component category */
        category?: (component_registry.ComponentCategory|null);

        /** Component version */
        version?: (string|null);

        /** Component author */
        author?: (string|null);

        /** Component downloads */
        downloads?: (number|null);

        /** Component stars */
        stars?: (number|null);

        /** Component status */
        status?: (component_registry.ComponentStatus|null);

        /** Component description */
        description?: (string|null);

        /** Component tags */
        tags?: (component_registry.ITag[]|null);

        /** Component createdAt */
        createdAt?: (string|null);

        /** Component updatedAt */
        updatedAt?: (string|null);
    }

    /** Represents a Component. */
    class Component implements IComponent {

        /**
         * Constructs a new Component.
         * @param [properties] Properties to set
         */
        constructor(properties?: component_registry.IComponent);

        /** Component id. */
        public id: string;

        /** Component name. */
        public name: string;

        /** Component category. */
        public category: component_registry.ComponentCategory;

        /** Component version. */
        public version: string;

        /** Component author. */
        public author: string;

        /** Component downloads. */
        public downloads: number;

        /** Component stars. */
        public stars: number;

        /** Component status. */
        public status: component_registry.ComponentStatus;

        /** Component description. */
        public description: string;

        /** Component tags. */
        public tags: component_registry.ITag[];

        /** Component createdAt. */
        public createdAt: string;

        /** Component updatedAt. */
        public updatedAt: string;

        /**
         * Creates a new Component instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Component instance
         */
        public static create(properties?: component_registry.IComponent): component_registry.Component;

        /**
         * Encodes the specified Component message. Does not implicitly {@link component_registry.Component.verify|verify} messages.
         * @param message Component message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: component_registry.IComponent, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Component message, length delimited. Does not implicitly {@link component_registry.Component.verify|verify} messages.
         * @param message Component message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: component_registry.IComponent, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Component message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Component
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): component_registry.Component;

        /**
         * Decodes a Component message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Component
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): component_registry.Component;

        /**
         * Verifies a Component message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Component message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Component
         */
        public static fromObject(object: { [k: string]: any }): component_registry.Component;

        /**
         * Creates a plain object from a Component message. Also converts values to other types if specified.
         * @param message Component
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: component_registry.Component, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Component to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Component
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a CreateComponentRequest. */
    interface ICreateComponentRequest {

        /** CreateComponentRequest name */
        name?: (string|null);

        /** CreateComponentRequest category */
        category?: (component_registry.ComponentCategory|null);

        /** CreateComponentRequest version */
        version?: (string|null);

        /** CreateComponentRequest author */
        author?: (string|null);

        /** CreateComponentRequest status */
        status?: (component_registry.ComponentStatus|null);

        /** CreateComponentRequest description */
        description?: (string|null);

        /** CreateComponentRequest tagIds */
        tagIds?: (string[]|null);
    }

    /** Represents a CreateComponentRequest. */
    class CreateComponentRequest implements ICreateComponentRequest {

        /**
         * Constructs a new CreateComponentRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: component_registry.ICreateComponentRequest);

        /** CreateComponentRequest name. */
        public name: string;

        /** CreateComponentRequest category. */
        public category: component_registry.ComponentCategory;

        /** CreateComponentRequest version. */
        public version: string;

        /** CreateComponentRequest author. */
        public author: string;

        /** CreateComponentRequest status. */
        public status: component_registry.ComponentStatus;

        /** CreateComponentRequest description. */
        public description: string;

        /** CreateComponentRequest tagIds. */
        public tagIds: string[];

        /**
         * Creates a new CreateComponentRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CreateComponentRequest instance
         */
        public static create(properties?: component_registry.ICreateComponentRequest): component_registry.CreateComponentRequest;

        /**
         * Encodes the specified CreateComponentRequest message. Does not implicitly {@link component_registry.CreateComponentRequest.verify|verify} messages.
         * @param message CreateComponentRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: component_registry.ICreateComponentRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CreateComponentRequest message, length delimited. Does not implicitly {@link component_registry.CreateComponentRequest.verify|verify} messages.
         * @param message CreateComponentRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: component_registry.ICreateComponentRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CreateComponentRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns CreateComponentRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): component_registry.CreateComponentRequest;

        /**
         * Decodes a CreateComponentRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns CreateComponentRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): component_registry.CreateComponentRequest;

        /**
         * Verifies a CreateComponentRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CreateComponentRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CreateComponentRequest
         */
        public static fromObject(object: { [k: string]: any }): component_registry.CreateComponentRequest;

        /**
         * Creates a plain object from a CreateComponentRequest message. Also converts values to other types if specified.
         * @param message CreateComponentRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: component_registry.CreateComponentRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CreateComponentRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for CreateComponentRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an UpdateComponentRequest. */
    interface IUpdateComponentRequest {

        /** UpdateComponentRequest id */
        id?: (string|null);

        /** UpdateComponentRequest name */
        name?: (string|null);

        /** UpdateComponentRequest category */
        category?: (component_registry.ComponentCategory|null);

        /** UpdateComponentRequest version */
        version?: (string|null);

        /** UpdateComponentRequest author */
        author?: (string|null);

        /** UpdateComponentRequest status */
        status?: (component_registry.ComponentStatus|null);

        /** UpdateComponentRequest description */
        description?: (string|null);

        /** UpdateComponentRequest tagIds */
        tagIds?: (string[]|null);
    }

    /** Represents an UpdateComponentRequest. */
    class UpdateComponentRequest implements IUpdateComponentRequest {

        /**
         * Constructs a new UpdateComponentRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: component_registry.IUpdateComponentRequest);

        /** UpdateComponentRequest id. */
        public id: string;

        /** UpdateComponentRequest name. */
        public name: string;

        /** UpdateComponentRequest category. */
        public category: component_registry.ComponentCategory;

        /** UpdateComponentRequest version. */
        public version: string;

        /** UpdateComponentRequest author. */
        public author: string;

        /** UpdateComponentRequest status. */
        public status: component_registry.ComponentStatus;

        /** UpdateComponentRequest description. */
        public description: string;

        /** UpdateComponentRequest tagIds. */
        public tagIds: string[];

        /**
         * Creates a new UpdateComponentRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns UpdateComponentRequest instance
         */
        public static create(properties?: component_registry.IUpdateComponentRequest): component_registry.UpdateComponentRequest;

        /**
         * Encodes the specified UpdateComponentRequest message. Does not implicitly {@link component_registry.UpdateComponentRequest.verify|verify} messages.
         * @param message UpdateComponentRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: component_registry.IUpdateComponentRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified UpdateComponentRequest message, length delimited. Does not implicitly {@link component_registry.UpdateComponentRequest.verify|verify} messages.
         * @param message UpdateComponentRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: component_registry.IUpdateComponentRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an UpdateComponentRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns UpdateComponentRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): component_registry.UpdateComponentRequest;

        /**
         * Decodes an UpdateComponentRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns UpdateComponentRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): component_registry.UpdateComponentRequest;

        /**
         * Verifies an UpdateComponentRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an UpdateComponentRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns UpdateComponentRequest
         */
        public static fromObject(object: { [k: string]: any }): component_registry.UpdateComponentRequest;

        /**
         * Creates a plain object from an UpdateComponentRequest message. Also converts values to other types if specified.
         * @param message UpdateComponentRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: component_registry.UpdateComponentRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this UpdateComponentRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for UpdateComponentRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a ListComponentsRequest. */
    interface IListComponentsRequest {

        /** ListComponentsRequest pagination */
        pagination?: (component_registry.IPaginationRequest|null);

        /** ListComponentsRequest search */
        search?: (string|null);

        /** ListComponentsRequest status */
        status?: (component_registry.ComponentStatus|null);

        /** ListComponentsRequest category */
        category?: (component_registry.ComponentCategory|null);

        /** ListComponentsRequest author */
        author?: (string|null);

        /** ListComponentsRequest sort */
        sort?: (string|null);

        /** ListComponentsRequest order */
        order?: (string|null);
    }

    /** Represents a ListComponentsRequest. */
    class ListComponentsRequest implements IListComponentsRequest {

        /**
         * Constructs a new ListComponentsRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: component_registry.IListComponentsRequest);

        /** ListComponentsRequest pagination. */
        public pagination?: (component_registry.IPaginationRequest|null);

        /** ListComponentsRequest search. */
        public search: string;

        /** ListComponentsRequest status. */
        public status: component_registry.ComponentStatus;

        /** ListComponentsRequest category. */
        public category: component_registry.ComponentCategory;

        /** ListComponentsRequest author. */
        public author: string;

        /** ListComponentsRequest sort. */
        public sort: string;

        /** ListComponentsRequest order. */
        public order: string;

        /**
         * Creates a new ListComponentsRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ListComponentsRequest instance
         */
        public static create(properties?: component_registry.IListComponentsRequest): component_registry.ListComponentsRequest;

        /**
         * Encodes the specified ListComponentsRequest message. Does not implicitly {@link component_registry.ListComponentsRequest.verify|verify} messages.
         * @param message ListComponentsRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: component_registry.IListComponentsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ListComponentsRequest message, length delimited. Does not implicitly {@link component_registry.ListComponentsRequest.verify|verify} messages.
         * @param message ListComponentsRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: component_registry.IListComponentsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ListComponentsRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ListComponentsRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): component_registry.ListComponentsRequest;

        /**
         * Decodes a ListComponentsRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ListComponentsRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): component_registry.ListComponentsRequest;

        /**
         * Verifies a ListComponentsRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a ListComponentsRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ListComponentsRequest
         */
        public static fromObject(object: { [k: string]: any }): component_registry.ListComponentsRequest;

        /**
         * Creates a plain object from a ListComponentsRequest message. Also converts values to other types if specified.
         * @param message ListComponentsRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: component_registry.ListComponentsRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ListComponentsRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for ListComponentsRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a ListComponentsResponse. */
    interface IListComponentsResponse {

        /** ListComponentsResponse components */
        components?: (component_registry.IComponent[]|null);

        /** ListComponentsResponse pagination */
        pagination?: (component_registry.IPaginationResponse|null);
    }

    /** Represents a ListComponentsResponse. */
    class ListComponentsResponse implements IListComponentsResponse {

        /**
         * Constructs a new ListComponentsResponse.
         * @param [properties] Properties to set
         */
        constructor(properties?: component_registry.IListComponentsResponse);

        /** ListComponentsResponse components. */
        public components: component_registry.IComponent[];

        /** ListComponentsResponse pagination. */
        public pagination?: (component_registry.IPaginationResponse|null);

        /**
         * Creates a new ListComponentsResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ListComponentsResponse instance
         */
        public static create(properties?: component_registry.IListComponentsResponse): component_registry.ListComponentsResponse;

        /**
         * Encodes the specified ListComponentsResponse message. Does not implicitly {@link component_registry.ListComponentsResponse.verify|verify} messages.
         * @param message ListComponentsResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: component_registry.IListComponentsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ListComponentsResponse message, length delimited. Does not implicitly {@link component_registry.ListComponentsResponse.verify|verify} messages.
         * @param message ListComponentsResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: component_registry.IListComponentsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ListComponentsResponse message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ListComponentsResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): component_registry.ListComponentsResponse;

        /**
         * Decodes a ListComponentsResponse message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ListComponentsResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): component_registry.ListComponentsResponse;

        /**
         * Verifies a ListComponentsResponse message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a ListComponentsResponse message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ListComponentsResponse
         */
        public static fromObject(object: { [k: string]: any }): component_registry.ListComponentsResponse;

        /**
         * Creates a plain object from a ListComponentsResponse message. Also converts values to other types if specified.
         * @param message ListComponentsResponse
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: component_registry.ListComponentsResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ListComponentsResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for ListComponentsResponse
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a ComponentStatsResponse. */
    interface IComponentStatsResponse {

        /** ComponentStatsResponse totalComponents */
        totalComponents?: (number|null);

        /** ComponentStatsResponse totalDownloads */
        totalDownloads?: (number|Long|null);

        /** ComponentStatsResponse activePublishers */
        activePublishers?: (number|null);
    }

    /** Represents a ComponentStatsResponse. */
    class ComponentStatsResponse implements IComponentStatsResponse {

        /**
         * Constructs a new ComponentStatsResponse.
         * @param [properties] Properties to set
         */
        constructor(properties?: component_registry.IComponentStatsResponse);

        /** ComponentStatsResponse totalComponents. */
        public totalComponents: number;

        /** ComponentStatsResponse totalDownloads. */
        public totalDownloads: (number|Long);

        /** ComponentStatsResponse activePublishers. */
        public activePublishers: number;

        /**
         * Creates a new ComponentStatsResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ComponentStatsResponse instance
         */
        public static create(properties?: component_registry.IComponentStatsResponse): component_registry.ComponentStatsResponse;

        /**
         * Encodes the specified ComponentStatsResponse message. Does not implicitly {@link component_registry.ComponentStatsResponse.verify|verify} messages.
         * @param message ComponentStatsResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: component_registry.IComponentStatsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ComponentStatsResponse message, length delimited. Does not implicitly {@link component_registry.ComponentStatsResponse.verify|verify} messages.
         * @param message ComponentStatsResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: component_registry.IComponentStatsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ComponentStatsResponse message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ComponentStatsResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): component_registry.ComponentStatsResponse;

        /**
         * Decodes a ComponentStatsResponse message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ComponentStatsResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): component_registry.ComponentStatsResponse;

        /**
         * Verifies a ComponentStatsResponse message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a ComponentStatsResponse message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ComponentStatsResponse
         */
        public static fromObject(object: { [k: string]: any }): component_registry.ComponentStatsResponse;

        /**
         * Creates a plain object from a ComponentStatsResponse message. Also converts values to other types if specified.
         * @param message ComponentStatsResponse
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: component_registry.ComponentStatsResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ComponentStatsResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for ComponentStatsResponse
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a Tag. */
    interface ITag {

        /** Tag id */
        id?: (string|null);

        /** Tag name */
        name?: (string|null);

        /** Tag createdAt */
        createdAt?: (string|null);

        /** Tag updatedAt */
        updatedAt?: (string|null);
    }

    /** Represents a Tag. */
    class Tag implements ITag {

        /**
         * Constructs a new Tag.
         * @param [properties] Properties to set
         */
        constructor(properties?: component_registry.ITag);

        /** Tag id. */
        public id: string;

        /** Tag name. */
        public name: string;

        /** Tag createdAt. */
        public createdAt: string;

        /** Tag updatedAt. */
        public updatedAt: string;

        /**
         * Creates a new Tag instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Tag instance
         */
        public static create(properties?: component_registry.ITag): component_registry.Tag;

        /**
         * Encodes the specified Tag message. Does not implicitly {@link component_registry.Tag.verify|verify} messages.
         * @param message Tag message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: component_registry.ITag, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Tag message, length delimited. Does not implicitly {@link component_registry.Tag.verify|verify} messages.
         * @param message Tag message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: component_registry.ITag, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Tag message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Tag
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): component_registry.Tag;

        /**
         * Decodes a Tag message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Tag
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): component_registry.Tag;

        /**
         * Verifies a Tag message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Tag message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Tag
         */
        public static fromObject(object: { [k: string]: any }): component_registry.Tag;

        /**
         * Creates a plain object from a Tag message. Also converts values to other types if specified.
         * @param message Tag
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: component_registry.Tag, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Tag to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Tag
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a TagWithUsage. */
    interface ITagWithUsage {

        /** TagWithUsage id */
        id?: (string|null);

        /** TagWithUsage name */
        name?: (string|null);

        /** TagWithUsage usageCount */
        usageCount?: (number|null);

        /** TagWithUsage createdAt */
        createdAt?: (string|null);
    }

    /** Represents a TagWithUsage. */
    class TagWithUsage implements ITagWithUsage {

        /**
         * Constructs a new TagWithUsage.
         * @param [properties] Properties to set
         */
        constructor(properties?: component_registry.ITagWithUsage);

        /** TagWithUsage id. */
        public id: string;

        /** TagWithUsage name. */
        public name: string;

        /** TagWithUsage usageCount. */
        public usageCount: number;

        /** TagWithUsage createdAt. */
        public createdAt: string;

        /**
         * Creates a new TagWithUsage instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TagWithUsage instance
         */
        public static create(properties?: component_registry.ITagWithUsage): component_registry.TagWithUsage;

        /**
         * Encodes the specified TagWithUsage message. Does not implicitly {@link component_registry.TagWithUsage.verify|verify} messages.
         * @param message TagWithUsage message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: component_registry.ITagWithUsage, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified TagWithUsage message, length delimited. Does not implicitly {@link component_registry.TagWithUsage.verify|verify} messages.
         * @param message TagWithUsage message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: component_registry.ITagWithUsage, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TagWithUsage message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns TagWithUsage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): component_registry.TagWithUsage;

        /**
         * Decodes a TagWithUsage message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns TagWithUsage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): component_registry.TagWithUsage;

        /**
         * Verifies a TagWithUsage message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a TagWithUsage message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns TagWithUsage
         */
        public static fromObject(object: { [k: string]: any }): component_registry.TagWithUsage;

        /**
         * Creates a plain object from a TagWithUsage message. Also converts values to other types if specified.
         * @param message TagWithUsage
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: component_registry.TagWithUsage, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this TagWithUsage to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for TagWithUsage
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a ListTagsResponse. */
    interface IListTagsResponse {

        /** ListTagsResponse tags */
        tags?: (component_registry.ITagWithUsage[]|null);
    }

    /** Represents a ListTagsResponse. */
    class ListTagsResponse implements IListTagsResponse {

        /**
         * Constructs a new ListTagsResponse.
         * @param [properties] Properties to set
         */
        constructor(properties?: component_registry.IListTagsResponse);

        /** ListTagsResponse tags. */
        public tags: component_registry.ITagWithUsage[];

        /**
         * Creates a new ListTagsResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ListTagsResponse instance
         */
        public static create(properties?: component_registry.IListTagsResponse): component_registry.ListTagsResponse;

        /**
         * Encodes the specified ListTagsResponse message. Does not implicitly {@link component_registry.ListTagsResponse.verify|verify} messages.
         * @param message ListTagsResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: component_registry.IListTagsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ListTagsResponse message, length delimited. Does not implicitly {@link component_registry.ListTagsResponse.verify|verify} messages.
         * @param message ListTagsResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: component_registry.IListTagsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ListTagsResponse message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ListTagsResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): component_registry.ListTagsResponse;

        /**
         * Decodes a ListTagsResponse message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ListTagsResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): component_registry.ListTagsResponse;

        /**
         * Verifies a ListTagsResponse message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a ListTagsResponse message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ListTagsResponse
         */
        public static fromObject(object: { [k: string]: any }): component_registry.ListTagsResponse;

        /**
         * Creates a plain object from a ListTagsResponse message. Also converts values to other types if specified.
         * @param message ListTagsResponse
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: component_registry.ListTagsResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ListTagsResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for ListTagsResponse
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a CreateTagRequest. */
    interface ICreateTagRequest {

        /** CreateTagRequest name */
        name?: (string|null);
    }

    /** Represents a CreateTagRequest. */
    class CreateTagRequest implements ICreateTagRequest {

        /**
         * Constructs a new CreateTagRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: component_registry.ICreateTagRequest);

        /** CreateTagRequest name. */
        public name: string;

        /**
         * Creates a new CreateTagRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CreateTagRequest instance
         */
        public static create(properties?: component_registry.ICreateTagRequest): component_registry.CreateTagRequest;

        /**
         * Encodes the specified CreateTagRequest message. Does not implicitly {@link component_registry.CreateTagRequest.verify|verify} messages.
         * @param message CreateTagRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: component_registry.ICreateTagRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CreateTagRequest message, length delimited. Does not implicitly {@link component_registry.CreateTagRequest.verify|verify} messages.
         * @param message CreateTagRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: component_registry.ICreateTagRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CreateTagRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns CreateTagRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): component_registry.CreateTagRequest;

        /**
         * Decodes a CreateTagRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns CreateTagRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): component_registry.CreateTagRequest;

        /**
         * Verifies a CreateTagRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CreateTagRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CreateTagRequest
         */
        public static fromObject(object: { [k: string]: any }): component_registry.CreateTagRequest;

        /**
         * Creates a plain object from a CreateTagRequest message. Also converts values to other types if specified.
         * @param message CreateTagRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: component_registry.CreateTagRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CreateTagRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for CreateTagRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }
}
