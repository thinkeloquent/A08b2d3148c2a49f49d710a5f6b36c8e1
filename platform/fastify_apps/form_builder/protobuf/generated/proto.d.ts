import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace form_builder. */
export namespace form_builder {

    /** Namespace common. */
    namespace common {

        /** FormStatus enum. */
        enum FormStatus {
            FORM_STATUS_UNSPECIFIED = 0,
            FORM_STATUS_DRAFT = 1,
            FORM_STATUS_PUBLISHED = 2,
            FORM_STATUS_ARCHIVED = 3
        }

        /** Properties of a PaginationRequest. */
        interface IPaginationRequest {

            /** PaginationRequest page */
            page?: (number|null);

            /** PaginationRequest limit */
            limit?: (number|null);
        }

        /** Represents a PaginationRequest. */
        class PaginationRequest implements IPaginationRequest {

            /**
             * Constructs a new PaginationRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: form_builder.common.IPaginationRequest);

            /** PaginationRequest page. */
            public page: number;

            /** PaginationRequest limit. */
            public limit: number;

            /**
             * Creates a new PaginationRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns PaginationRequest instance
             */
            public static create(properties?: form_builder.common.IPaginationRequest): form_builder.common.PaginationRequest;

            /**
             * Encodes the specified PaginationRequest message. Does not implicitly {@link form_builder.common.PaginationRequest.verify|verify} messages.
             * @param message PaginationRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: form_builder.common.IPaginationRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified PaginationRequest message, length delimited. Does not implicitly {@link form_builder.common.PaginationRequest.verify|verify} messages.
             * @param message PaginationRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: form_builder.common.IPaginationRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a PaginationRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns PaginationRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): form_builder.common.PaginationRequest;

            /**
             * Decodes a PaginationRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns PaginationRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): form_builder.common.PaginationRequest;

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
            public static fromObject(object: { [k: string]: any }): form_builder.common.PaginationRequest;

            /**
             * Creates a plain object from a PaginationRequest message. Also converts values to other types if specified.
             * @param message PaginationRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: form_builder.common.PaginationRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

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

            /** PaginationResponse page */
            page?: (number|null);

            /** PaginationResponse limit */
            limit?: (number|null);

            /** PaginationResponse total */
            total?: (number|null);

            /** PaginationResponse totalPages */
            totalPages?: (number|null);
        }

        /** Represents a PaginationResponse. */
        class PaginationResponse implements IPaginationResponse {

            /**
             * Constructs a new PaginationResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: form_builder.common.IPaginationResponse);

            /** PaginationResponse page. */
            public page: number;

            /** PaginationResponse limit. */
            public limit: number;

            /** PaginationResponse total. */
            public total: number;

            /** PaginationResponse totalPages. */
            public totalPages: number;

            /**
             * Creates a new PaginationResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns PaginationResponse instance
             */
            public static create(properties?: form_builder.common.IPaginationResponse): form_builder.common.PaginationResponse;

            /**
             * Encodes the specified PaginationResponse message. Does not implicitly {@link form_builder.common.PaginationResponse.verify|verify} messages.
             * @param message PaginationResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: form_builder.common.IPaginationResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified PaginationResponse message, length delimited. Does not implicitly {@link form_builder.common.PaginationResponse.verify|verify} messages.
             * @param message PaginationResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: form_builder.common.IPaginationResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a PaginationResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns PaginationResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): form_builder.common.PaginationResponse;

            /**
             * Decodes a PaginationResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns PaginationResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): form_builder.common.PaginationResponse;

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
            public static fromObject(object: { [k: string]: any }): form_builder.common.PaginationResponse;

            /**
             * Creates a plain object from a PaginationResponse message. Also converts values to other types if specified.
             * @param message PaginationResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: form_builder.common.PaginationResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

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

        /** Properties of an ErrorResponse. */
        interface IErrorResponse {

            /** ErrorResponse code */
            code?: (number|null);

            /** ErrorResponse message */
            message?: (string|null);

            /** ErrorResponse details */
            details?: (string|null);
        }

        /** Represents an ErrorResponse. */
        class ErrorResponse implements IErrorResponse {

            /**
             * Constructs a new ErrorResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: form_builder.common.IErrorResponse);

            /** ErrorResponse code. */
            public code: number;

            /** ErrorResponse message. */
            public message: string;

            /** ErrorResponse details. */
            public details: string;

            /**
             * Creates a new ErrorResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ErrorResponse instance
             */
            public static create(properties?: form_builder.common.IErrorResponse): form_builder.common.ErrorResponse;

            /**
             * Encodes the specified ErrorResponse message. Does not implicitly {@link form_builder.common.ErrorResponse.verify|verify} messages.
             * @param message ErrorResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: form_builder.common.IErrorResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ErrorResponse message, length delimited. Does not implicitly {@link form_builder.common.ErrorResponse.verify|verify} messages.
             * @param message ErrorResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: form_builder.common.IErrorResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an ErrorResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ErrorResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): form_builder.common.ErrorResponse;

            /**
             * Decodes an ErrorResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ErrorResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): form_builder.common.ErrorResponse;

            /**
             * Verifies an ErrorResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an ErrorResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ErrorResponse
             */
            public static fromObject(object: { [k: string]: any }): form_builder.common.ErrorResponse;

            /**
             * Creates a plain object from an ErrorResponse message. Also converts values to other types if specified.
             * @param message ErrorResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: form_builder.common.ErrorResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ErrorResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for ErrorResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a Timestamp. */
        interface ITimestamp {

            /** Timestamp iso8601 */
            iso8601?: (string|null);
        }

        /** Represents a Timestamp. */
        class Timestamp implements ITimestamp {

            /**
             * Constructs a new Timestamp.
             * @param [properties] Properties to set
             */
            constructor(properties?: form_builder.common.ITimestamp);

            /** Timestamp iso8601. */
            public iso8601: string;

            /**
             * Creates a new Timestamp instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Timestamp instance
             */
            public static create(properties?: form_builder.common.ITimestamp): form_builder.common.Timestamp;

            /**
             * Encodes the specified Timestamp message. Does not implicitly {@link form_builder.common.Timestamp.verify|verify} messages.
             * @param message Timestamp message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: form_builder.common.ITimestamp, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Timestamp message, length delimited. Does not implicitly {@link form_builder.common.Timestamp.verify|verify} messages.
             * @param message Timestamp message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: form_builder.common.ITimestamp, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Timestamp message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): form_builder.common.Timestamp;

            /**
             * Decodes a Timestamp message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): form_builder.common.Timestamp;

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
            public static fromObject(object: { [k: string]: any }): form_builder.common.Timestamp;

            /**
             * Creates a plain object from a Timestamp message. Also converts values to other types if specified.
             * @param message Timestamp
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: form_builder.common.Timestamp, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
    }

    /** Namespace form_definition. */
    namespace form_definition {

        /** Properties of a FormDefinition. */
        interface IFormDefinition {

            /** FormDefinition id */
            id?: (string|null);

            /** FormDefinition name */
            name?: (string|null);

            /** FormDefinition description */
            description?: (string|null);

            /** FormDefinition version */
            version?: (string|null);

            /** FormDefinition status */
            status?: (form_builder.common.FormStatus|null);

            /** FormDefinition schemaData */
            schemaData?: (Uint8Array|null);

            /** FormDefinition metadataData */
            metadataData?: (Uint8Array|null);

            /** FormDefinition createdBy */
            createdBy?: (string|null);

            /** FormDefinition tags */
            tags?: (form_builder.tag.ITag[]|null);

            /** FormDefinition createdAt */
            createdAt?: (form_builder.common.ITimestamp|null);

            /** FormDefinition updatedAt */
            updatedAt?: (form_builder.common.ITimestamp|null);
        }

        /** Represents a FormDefinition. */
        class FormDefinition implements IFormDefinition {

            /**
             * Constructs a new FormDefinition.
             * @param [properties] Properties to set
             */
            constructor(properties?: form_builder.form_definition.IFormDefinition);

            /** FormDefinition id. */
            public id: string;

            /** FormDefinition name. */
            public name: string;

            /** FormDefinition description. */
            public description: string;

            /** FormDefinition version. */
            public version: string;

            /** FormDefinition status. */
            public status: form_builder.common.FormStatus;

            /** FormDefinition schemaData. */
            public schemaData: Uint8Array;

            /** FormDefinition metadataData. */
            public metadataData: Uint8Array;

            /** FormDefinition createdBy. */
            public createdBy: string;

            /** FormDefinition tags. */
            public tags: form_builder.tag.ITag[];

            /** FormDefinition createdAt. */
            public createdAt?: (form_builder.common.ITimestamp|null);

            /** FormDefinition updatedAt. */
            public updatedAt?: (form_builder.common.ITimestamp|null);

            /**
             * Creates a new FormDefinition instance using the specified properties.
             * @param [properties] Properties to set
             * @returns FormDefinition instance
             */
            public static create(properties?: form_builder.form_definition.IFormDefinition): form_builder.form_definition.FormDefinition;

            /**
             * Encodes the specified FormDefinition message. Does not implicitly {@link form_builder.form_definition.FormDefinition.verify|verify} messages.
             * @param message FormDefinition message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: form_builder.form_definition.IFormDefinition, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified FormDefinition message, length delimited. Does not implicitly {@link form_builder.form_definition.FormDefinition.verify|verify} messages.
             * @param message FormDefinition message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: form_builder.form_definition.IFormDefinition, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a FormDefinition message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns FormDefinition
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): form_builder.form_definition.FormDefinition;

            /**
             * Decodes a FormDefinition message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns FormDefinition
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): form_builder.form_definition.FormDefinition;

            /**
             * Verifies a FormDefinition message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a FormDefinition message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns FormDefinition
             */
            public static fromObject(object: { [k: string]: any }): form_builder.form_definition.FormDefinition;

            /**
             * Creates a plain object from a FormDefinition message. Also converts values to other types if specified.
             * @param message FormDefinition
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: form_builder.form_definition.FormDefinition, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this FormDefinition to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for FormDefinition
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a FormDefinitionSummary. */
        interface IFormDefinitionSummary {

            /** FormDefinitionSummary id */
            id?: (string|null);

            /** FormDefinitionSummary name */
            name?: (string|null);

            /** FormDefinitionSummary description */
            description?: (string|null);

            /** FormDefinitionSummary version */
            version?: (string|null);

            /** FormDefinitionSummary status */
            status?: (form_builder.common.FormStatus|null);

            /** FormDefinitionSummary createdBy */
            createdBy?: (string|null);

            /** FormDefinitionSummary tags */
            tags?: (form_builder.tag.ITag[]|null);

            /** FormDefinitionSummary pageCount */
            pageCount?: (number|null);

            /** FormDefinitionSummary elementCount */
            elementCount?: (number|null);

            /** FormDefinitionSummary createdAt */
            createdAt?: (form_builder.common.ITimestamp|null);

            /** FormDefinitionSummary updatedAt */
            updatedAt?: (form_builder.common.ITimestamp|null);
        }

        /** Represents a FormDefinitionSummary. */
        class FormDefinitionSummary implements IFormDefinitionSummary {

            /**
             * Constructs a new FormDefinitionSummary.
             * @param [properties] Properties to set
             */
            constructor(properties?: form_builder.form_definition.IFormDefinitionSummary);

            /** FormDefinitionSummary id. */
            public id: string;

            /** FormDefinitionSummary name. */
            public name: string;

            /** FormDefinitionSummary description. */
            public description: string;

            /** FormDefinitionSummary version. */
            public version: string;

            /** FormDefinitionSummary status. */
            public status: form_builder.common.FormStatus;

            /** FormDefinitionSummary createdBy. */
            public createdBy: string;

            /** FormDefinitionSummary tags. */
            public tags: form_builder.tag.ITag[];

            /** FormDefinitionSummary pageCount. */
            public pageCount: number;

            /** FormDefinitionSummary elementCount. */
            public elementCount: number;

            /** FormDefinitionSummary createdAt. */
            public createdAt?: (form_builder.common.ITimestamp|null);

            /** FormDefinitionSummary updatedAt. */
            public updatedAt?: (form_builder.common.ITimestamp|null);

            /**
             * Creates a new FormDefinitionSummary instance using the specified properties.
             * @param [properties] Properties to set
             * @returns FormDefinitionSummary instance
             */
            public static create(properties?: form_builder.form_definition.IFormDefinitionSummary): form_builder.form_definition.FormDefinitionSummary;

            /**
             * Encodes the specified FormDefinitionSummary message. Does not implicitly {@link form_builder.form_definition.FormDefinitionSummary.verify|verify} messages.
             * @param message FormDefinitionSummary message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: form_builder.form_definition.IFormDefinitionSummary, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified FormDefinitionSummary message, length delimited. Does not implicitly {@link form_builder.form_definition.FormDefinitionSummary.verify|verify} messages.
             * @param message FormDefinitionSummary message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: form_builder.form_definition.IFormDefinitionSummary, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a FormDefinitionSummary message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns FormDefinitionSummary
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): form_builder.form_definition.FormDefinitionSummary;

            /**
             * Decodes a FormDefinitionSummary message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns FormDefinitionSummary
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): form_builder.form_definition.FormDefinitionSummary;

            /**
             * Verifies a FormDefinitionSummary message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a FormDefinitionSummary message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns FormDefinitionSummary
             */
            public static fromObject(object: { [k: string]: any }): form_builder.form_definition.FormDefinitionSummary;

            /**
             * Creates a plain object from a FormDefinitionSummary message. Also converts values to other types if specified.
             * @param message FormDefinitionSummary
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: form_builder.form_definition.FormDefinitionSummary, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this FormDefinitionSummary to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for FormDefinitionSummary
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a ListFormDefinitionsRequest. */
        interface IListFormDefinitionsRequest {

            /** ListFormDefinitionsRequest pagination */
            pagination?: (form_builder.common.IPaginationRequest|null);

            /** ListFormDefinitionsRequest status */
            status?: (form_builder.common.FormStatus|null);

            /** ListFormDefinitionsRequest search */
            search?: (string|null);

            /** ListFormDefinitionsRequest tags */
            tags?: (string[]|null);
        }

        /** Represents a ListFormDefinitionsRequest. */
        class ListFormDefinitionsRequest implements IListFormDefinitionsRequest {

            /**
             * Constructs a new ListFormDefinitionsRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: form_builder.form_definition.IListFormDefinitionsRequest);

            /** ListFormDefinitionsRequest pagination. */
            public pagination?: (form_builder.common.IPaginationRequest|null);

            /** ListFormDefinitionsRequest status. */
            public status: form_builder.common.FormStatus;

            /** ListFormDefinitionsRequest search. */
            public search: string;

            /** ListFormDefinitionsRequest tags. */
            public tags: string[];

            /**
             * Creates a new ListFormDefinitionsRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ListFormDefinitionsRequest instance
             */
            public static create(properties?: form_builder.form_definition.IListFormDefinitionsRequest): form_builder.form_definition.ListFormDefinitionsRequest;

            /**
             * Encodes the specified ListFormDefinitionsRequest message. Does not implicitly {@link form_builder.form_definition.ListFormDefinitionsRequest.verify|verify} messages.
             * @param message ListFormDefinitionsRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: form_builder.form_definition.IListFormDefinitionsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ListFormDefinitionsRequest message, length delimited. Does not implicitly {@link form_builder.form_definition.ListFormDefinitionsRequest.verify|verify} messages.
             * @param message ListFormDefinitionsRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: form_builder.form_definition.IListFormDefinitionsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ListFormDefinitionsRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ListFormDefinitionsRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): form_builder.form_definition.ListFormDefinitionsRequest;

            /**
             * Decodes a ListFormDefinitionsRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ListFormDefinitionsRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): form_builder.form_definition.ListFormDefinitionsRequest;

            /**
             * Verifies a ListFormDefinitionsRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ListFormDefinitionsRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ListFormDefinitionsRequest
             */
            public static fromObject(object: { [k: string]: any }): form_builder.form_definition.ListFormDefinitionsRequest;

            /**
             * Creates a plain object from a ListFormDefinitionsRequest message. Also converts values to other types if specified.
             * @param message ListFormDefinitionsRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: form_builder.form_definition.ListFormDefinitionsRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ListFormDefinitionsRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for ListFormDefinitionsRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a ListFormDefinitionsResponse. */
        interface IListFormDefinitionsResponse {

            /** ListFormDefinitionsResponse formDefinitions */
            formDefinitions?: (form_builder.form_definition.IFormDefinitionSummary[]|null);

            /** ListFormDefinitionsResponse pagination */
            pagination?: (form_builder.common.IPaginationResponse|null);
        }

        /** Represents a ListFormDefinitionsResponse. */
        class ListFormDefinitionsResponse implements IListFormDefinitionsResponse {

            /**
             * Constructs a new ListFormDefinitionsResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: form_builder.form_definition.IListFormDefinitionsResponse);

            /** ListFormDefinitionsResponse formDefinitions. */
            public formDefinitions: form_builder.form_definition.IFormDefinitionSummary[];

            /** ListFormDefinitionsResponse pagination. */
            public pagination?: (form_builder.common.IPaginationResponse|null);

            /**
             * Creates a new ListFormDefinitionsResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ListFormDefinitionsResponse instance
             */
            public static create(properties?: form_builder.form_definition.IListFormDefinitionsResponse): form_builder.form_definition.ListFormDefinitionsResponse;

            /**
             * Encodes the specified ListFormDefinitionsResponse message. Does not implicitly {@link form_builder.form_definition.ListFormDefinitionsResponse.verify|verify} messages.
             * @param message ListFormDefinitionsResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: form_builder.form_definition.IListFormDefinitionsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ListFormDefinitionsResponse message, length delimited. Does not implicitly {@link form_builder.form_definition.ListFormDefinitionsResponse.verify|verify} messages.
             * @param message ListFormDefinitionsResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: form_builder.form_definition.IListFormDefinitionsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ListFormDefinitionsResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ListFormDefinitionsResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): form_builder.form_definition.ListFormDefinitionsResponse;

            /**
             * Decodes a ListFormDefinitionsResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ListFormDefinitionsResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): form_builder.form_definition.ListFormDefinitionsResponse;

            /**
             * Verifies a ListFormDefinitionsResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ListFormDefinitionsResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ListFormDefinitionsResponse
             */
            public static fromObject(object: { [k: string]: any }): form_builder.form_definition.ListFormDefinitionsResponse;

            /**
             * Creates a plain object from a ListFormDefinitionsResponse message. Also converts values to other types if specified.
             * @param message ListFormDefinitionsResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: form_builder.form_definition.ListFormDefinitionsResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ListFormDefinitionsResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for ListFormDefinitionsResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a GetFormDefinitionRequest. */
        interface IGetFormDefinitionRequest {

            /** GetFormDefinitionRequest id */
            id?: (string|null);
        }

        /** Represents a GetFormDefinitionRequest. */
        class GetFormDefinitionRequest implements IGetFormDefinitionRequest {

            /**
             * Constructs a new GetFormDefinitionRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: form_builder.form_definition.IGetFormDefinitionRequest);

            /** GetFormDefinitionRequest id. */
            public id: string;

            /**
             * Creates a new GetFormDefinitionRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns GetFormDefinitionRequest instance
             */
            public static create(properties?: form_builder.form_definition.IGetFormDefinitionRequest): form_builder.form_definition.GetFormDefinitionRequest;

            /**
             * Encodes the specified GetFormDefinitionRequest message. Does not implicitly {@link form_builder.form_definition.GetFormDefinitionRequest.verify|verify} messages.
             * @param message GetFormDefinitionRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: form_builder.form_definition.IGetFormDefinitionRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified GetFormDefinitionRequest message, length delimited. Does not implicitly {@link form_builder.form_definition.GetFormDefinitionRequest.verify|verify} messages.
             * @param message GetFormDefinitionRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: form_builder.form_definition.IGetFormDefinitionRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a GetFormDefinitionRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns GetFormDefinitionRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): form_builder.form_definition.GetFormDefinitionRequest;

            /**
             * Decodes a GetFormDefinitionRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns GetFormDefinitionRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): form_builder.form_definition.GetFormDefinitionRequest;

            /**
             * Verifies a GetFormDefinitionRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a GetFormDefinitionRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns GetFormDefinitionRequest
             */
            public static fromObject(object: { [k: string]: any }): form_builder.form_definition.GetFormDefinitionRequest;

            /**
             * Creates a plain object from a GetFormDefinitionRequest message. Also converts values to other types if specified.
             * @param message GetFormDefinitionRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: form_builder.form_definition.GetFormDefinitionRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this GetFormDefinitionRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for GetFormDefinitionRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a GetFormDefinitionResponse. */
        interface IGetFormDefinitionResponse {

            /** GetFormDefinitionResponse formDefinition */
            formDefinition?: (form_builder.form_definition.IFormDefinition|null);
        }

        /** Represents a GetFormDefinitionResponse. */
        class GetFormDefinitionResponse implements IGetFormDefinitionResponse {

            /**
             * Constructs a new GetFormDefinitionResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: form_builder.form_definition.IGetFormDefinitionResponse);

            /** GetFormDefinitionResponse formDefinition. */
            public formDefinition?: (form_builder.form_definition.IFormDefinition|null);

            /**
             * Creates a new GetFormDefinitionResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns GetFormDefinitionResponse instance
             */
            public static create(properties?: form_builder.form_definition.IGetFormDefinitionResponse): form_builder.form_definition.GetFormDefinitionResponse;

            /**
             * Encodes the specified GetFormDefinitionResponse message. Does not implicitly {@link form_builder.form_definition.GetFormDefinitionResponse.verify|verify} messages.
             * @param message GetFormDefinitionResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: form_builder.form_definition.IGetFormDefinitionResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified GetFormDefinitionResponse message, length delimited. Does not implicitly {@link form_builder.form_definition.GetFormDefinitionResponse.verify|verify} messages.
             * @param message GetFormDefinitionResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: form_builder.form_definition.IGetFormDefinitionResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a GetFormDefinitionResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns GetFormDefinitionResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): form_builder.form_definition.GetFormDefinitionResponse;

            /**
             * Decodes a GetFormDefinitionResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns GetFormDefinitionResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): form_builder.form_definition.GetFormDefinitionResponse;

            /**
             * Verifies a GetFormDefinitionResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a GetFormDefinitionResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns GetFormDefinitionResponse
             */
            public static fromObject(object: { [k: string]: any }): form_builder.form_definition.GetFormDefinitionResponse;

            /**
             * Creates a plain object from a GetFormDefinitionResponse message. Also converts values to other types if specified.
             * @param message GetFormDefinitionResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: form_builder.form_definition.GetFormDefinitionResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this GetFormDefinitionResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for GetFormDefinitionResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a CreateFormDefinitionRequest. */
        interface ICreateFormDefinitionRequest {

            /** CreateFormDefinitionRequest name */
            name?: (string|null);

            /** CreateFormDefinitionRequest description */
            description?: (string|null);

            /** CreateFormDefinitionRequest version */
            version?: (string|null);

            /** CreateFormDefinitionRequest status */
            status?: (form_builder.common.FormStatus|null);

            /** CreateFormDefinitionRequest schemaData */
            schemaData?: (Uint8Array|null);

            /** CreateFormDefinitionRequest metadataData */
            metadataData?: (Uint8Array|null);

            /** CreateFormDefinitionRequest createdBy */
            createdBy?: (string|null);

            /** CreateFormDefinitionRequest tagNames */
            tagNames?: (string[]|null);
        }

        /** Represents a CreateFormDefinitionRequest. */
        class CreateFormDefinitionRequest implements ICreateFormDefinitionRequest {

            /**
             * Constructs a new CreateFormDefinitionRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: form_builder.form_definition.ICreateFormDefinitionRequest);

            /** CreateFormDefinitionRequest name. */
            public name: string;

            /** CreateFormDefinitionRequest description. */
            public description: string;

            /** CreateFormDefinitionRequest version. */
            public version: string;

            /** CreateFormDefinitionRequest status. */
            public status: form_builder.common.FormStatus;

            /** CreateFormDefinitionRequest schemaData. */
            public schemaData: Uint8Array;

            /** CreateFormDefinitionRequest metadataData. */
            public metadataData: Uint8Array;

            /** CreateFormDefinitionRequest createdBy. */
            public createdBy: string;

            /** CreateFormDefinitionRequest tagNames. */
            public tagNames: string[];

            /**
             * Creates a new CreateFormDefinitionRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns CreateFormDefinitionRequest instance
             */
            public static create(properties?: form_builder.form_definition.ICreateFormDefinitionRequest): form_builder.form_definition.CreateFormDefinitionRequest;

            /**
             * Encodes the specified CreateFormDefinitionRequest message. Does not implicitly {@link form_builder.form_definition.CreateFormDefinitionRequest.verify|verify} messages.
             * @param message CreateFormDefinitionRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: form_builder.form_definition.ICreateFormDefinitionRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified CreateFormDefinitionRequest message, length delimited. Does not implicitly {@link form_builder.form_definition.CreateFormDefinitionRequest.verify|verify} messages.
             * @param message CreateFormDefinitionRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: form_builder.form_definition.ICreateFormDefinitionRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a CreateFormDefinitionRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns CreateFormDefinitionRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): form_builder.form_definition.CreateFormDefinitionRequest;

            /**
             * Decodes a CreateFormDefinitionRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns CreateFormDefinitionRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): form_builder.form_definition.CreateFormDefinitionRequest;

            /**
             * Verifies a CreateFormDefinitionRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a CreateFormDefinitionRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns CreateFormDefinitionRequest
             */
            public static fromObject(object: { [k: string]: any }): form_builder.form_definition.CreateFormDefinitionRequest;

            /**
             * Creates a plain object from a CreateFormDefinitionRequest message. Also converts values to other types if specified.
             * @param message CreateFormDefinitionRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: form_builder.form_definition.CreateFormDefinitionRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this CreateFormDefinitionRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for CreateFormDefinitionRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a CreateFormDefinitionResponse. */
        interface ICreateFormDefinitionResponse {

            /** CreateFormDefinitionResponse formDefinition */
            formDefinition?: (form_builder.form_definition.IFormDefinition|null);
        }

        /** Represents a CreateFormDefinitionResponse. */
        class CreateFormDefinitionResponse implements ICreateFormDefinitionResponse {

            /**
             * Constructs a new CreateFormDefinitionResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: form_builder.form_definition.ICreateFormDefinitionResponse);

            /** CreateFormDefinitionResponse formDefinition. */
            public formDefinition?: (form_builder.form_definition.IFormDefinition|null);

            /**
             * Creates a new CreateFormDefinitionResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns CreateFormDefinitionResponse instance
             */
            public static create(properties?: form_builder.form_definition.ICreateFormDefinitionResponse): form_builder.form_definition.CreateFormDefinitionResponse;

            /**
             * Encodes the specified CreateFormDefinitionResponse message. Does not implicitly {@link form_builder.form_definition.CreateFormDefinitionResponse.verify|verify} messages.
             * @param message CreateFormDefinitionResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: form_builder.form_definition.ICreateFormDefinitionResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified CreateFormDefinitionResponse message, length delimited. Does not implicitly {@link form_builder.form_definition.CreateFormDefinitionResponse.verify|verify} messages.
             * @param message CreateFormDefinitionResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: form_builder.form_definition.ICreateFormDefinitionResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a CreateFormDefinitionResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns CreateFormDefinitionResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): form_builder.form_definition.CreateFormDefinitionResponse;

            /**
             * Decodes a CreateFormDefinitionResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns CreateFormDefinitionResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): form_builder.form_definition.CreateFormDefinitionResponse;

            /**
             * Verifies a CreateFormDefinitionResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a CreateFormDefinitionResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns CreateFormDefinitionResponse
             */
            public static fromObject(object: { [k: string]: any }): form_builder.form_definition.CreateFormDefinitionResponse;

            /**
             * Creates a plain object from a CreateFormDefinitionResponse message. Also converts values to other types if specified.
             * @param message CreateFormDefinitionResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: form_builder.form_definition.CreateFormDefinitionResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this CreateFormDefinitionResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for CreateFormDefinitionResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an UpdateFormDefinitionRequest. */
        interface IUpdateFormDefinitionRequest {

            /** UpdateFormDefinitionRequest id */
            id?: (string|null);

            /** UpdateFormDefinitionRequest name */
            name?: (string|null);

            /** UpdateFormDefinitionRequest description */
            description?: (string|null);

            /** UpdateFormDefinitionRequest version */
            version?: (string|null);

            /** UpdateFormDefinitionRequest status */
            status?: (form_builder.common.FormStatus|null);

            /** UpdateFormDefinitionRequest schemaData */
            schemaData?: (Uint8Array|null);

            /** UpdateFormDefinitionRequest metadataData */
            metadataData?: (Uint8Array|null);

            /** UpdateFormDefinitionRequest tagNames */
            tagNames?: (string[]|null);
        }

        /** Represents an UpdateFormDefinitionRequest. */
        class UpdateFormDefinitionRequest implements IUpdateFormDefinitionRequest {

            /**
             * Constructs a new UpdateFormDefinitionRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: form_builder.form_definition.IUpdateFormDefinitionRequest);

            /** UpdateFormDefinitionRequest id. */
            public id: string;

            /** UpdateFormDefinitionRequest name. */
            public name: string;

            /** UpdateFormDefinitionRequest description. */
            public description: string;

            /** UpdateFormDefinitionRequest version. */
            public version: string;

            /** UpdateFormDefinitionRequest status. */
            public status: form_builder.common.FormStatus;

            /** UpdateFormDefinitionRequest schemaData. */
            public schemaData: Uint8Array;

            /** UpdateFormDefinitionRequest metadataData. */
            public metadataData: Uint8Array;

            /** UpdateFormDefinitionRequest tagNames. */
            public tagNames: string[];

            /**
             * Creates a new UpdateFormDefinitionRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns UpdateFormDefinitionRequest instance
             */
            public static create(properties?: form_builder.form_definition.IUpdateFormDefinitionRequest): form_builder.form_definition.UpdateFormDefinitionRequest;

            /**
             * Encodes the specified UpdateFormDefinitionRequest message. Does not implicitly {@link form_builder.form_definition.UpdateFormDefinitionRequest.verify|verify} messages.
             * @param message UpdateFormDefinitionRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: form_builder.form_definition.IUpdateFormDefinitionRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified UpdateFormDefinitionRequest message, length delimited. Does not implicitly {@link form_builder.form_definition.UpdateFormDefinitionRequest.verify|verify} messages.
             * @param message UpdateFormDefinitionRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: form_builder.form_definition.IUpdateFormDefinitionRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an UpdateFormDefinitionRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns UpdateFormDefinitionRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): form_builder.form_definition.UpdateFormDefinitionRequest;

            /**
             * Decodes an UpdateFormDefinitionRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns UpdateFormDefinitionRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): form_builder.form_definition.UpdateFormDefinitionRequest;

            /**
             * Verifies an UpdateFormDefinitionRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an UpdateFormDefinitionRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns UpdateFormDefinitionRequest
             */
            public static fromObject(object: { [k: string]: any }): form_builder.form_definition.UpdateFormDefinitionRequest;

            /**
             * Creates a plain object from an UpdateFormDefinitionRequest message. Also converts values to other types if specified.
             * @param message UpdateFormDefinitionRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: form_builder.form_definition.UpdateFormDefinitionRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this UpdateFormDefinitionRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for UpdateFormDefinitionRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an UpdateFormDefinitionResponse. */
        interface IUpdateFormDefinitionResponse {

            /** UpdateFormDefinitionResponse formDefinition */
            formDefinition?: (form_builder.form_definition.IFormDefinition|null);
        }

        /** Represents an UpdateFormDefinitionResponse. */
        class UpdateFormDefinitionResponse implements IUpdateFormDefinitionResponse {

            /**
             * Constructs a new UpdateFormDefinitionResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: form_builder.form_definition.IUpdateFormDefinitionResponse);

            /** UpdateFormDefinitionResponse formDefinition. */
            public formDefinition?: (form_builder.form_definition.IFormDefinition|null);

            /**
             * Creates a new UpdateFormDefinitionResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns UpdateFormDefinitionResponse instance
             */
            public static create(properties?: form_builder.form_definition.IUpdateFormDefinitionResponse): form_builder.form_definition.UpdateFormDefinitionResponse;

            /**
             * Encodes the specified UpdateFormDefinitionResponse message. Does not implicitly {@link form_builder.form_definition.UpdateFormDefinitionResponse.verify|verify} messages.
             * @param message UpdateFormDefinitionResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: form_builder.form_definition.IUpdateFormDefinitionResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified UpdateFormDefinitionResponse message, length delimited. Does not implicitly {@link form_builder.form_definition.UpdateFormDefinitionResponse.verify|verify} messages.
             * @param message UpdateFormDefinitionResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: form_builder.form_definition.IUpdateFormDefinitionResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an UpdateFormDefinitionResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns UpdateFormDefinitionResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): form_builder.form_definition.UpdateFormDefinitionResponse;

            /**
             * Decodes an UpdateFormDefinitionResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns UpdateFormDefinitionResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): form_builder.form_definition.UpdateFormDefinitionResponse;

            /**
             * Verifies an UpdateFormDefinitionResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an UpdateFormDefinitionResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns UpdateFormDefinitionResponse
             */
            public static fromObject(object: { [k: string]: any }): form_builder.form_definition.UpdateFormDefinitionResponse;

            /**
             * Creates a plain object from an UpdateFormDefinitionResponse message. Also converts values to other types if specified.
             * @param message UpdateFormDefinitionResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: form_builder.form_definition.UpdateFormDefinitionResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this UpdateFormDefinitionResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for UpdateFormDefinitionResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a DeleteFormDefinitionRequest. */
        interface IDeleteFormDefinitionRequest {

            /** DeleteFormDefinitionRequest id */
            id?: (string|null);
        }

        /** Represents a DeleteFormDefinitionRequest. */
        class DeleteFormDefinitionRequest implements IDeleteFormDefinitionRequest {

            /**
             * Constructs a new DeleteFormDefinitionRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: form_builder.form_definition.IDeleteFormDefinitionRequest);

            /** DeleteFormDefinitionRequest id. */
            public id: string;

            /**
             * Creates a new DeleteFormDefinitionRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns DeleteFormDefinitionRequest instance
             */
            public static create(properties?: form_builder.form_definition.IDeleteFormDefinitionRequest): form_builder.form_definition.DeleteFormDefinitionRequest;

            /**
             * Encodes the specified DeleteFormDefinitionRequest message. Does not implicitly {@link form_builder.form_definition.DeleteFormDefinitionRequest.verify|verify} messages.
             * @param message DeleteFormDefinitionRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: form_builder.form_definition.IDeleteFormDefinitionRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified DeleteFormDefinitionRequest message, length delimited. Does not implicitly {@link form_builder.form_definition.DeleteFormDefinitionRequest.verify|verify} messages.
             * @param message DeleteFormDefinitionRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: form_builder.form_definition.IDeleteFormDefinitionRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DeleteFormDefinitionRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns DeleteFormDefinitionRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): form_builder.form_definition.DeleteFormDefinitionRequest;

            /**
             * Decodes a DeleteFormDefinitionRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns DeleteFormDefinitionRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): form_builder.form_definition.DeleteFormDefinitionRequest;

            /**
             * Verifies a DeleteFormDefinitionRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a DeleteFormDefinitionRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns DeleteFormDefinitionRequest
             */
            public static fromObject(object: { [k: string]: any }): form_builder.form_definition.DeleteFormDefinitionRequest;

            /**
             * Creates a plain object from a DeleteFormDefinitionRequest message. Also converts values to other types if specified.
             * @param message DeleteFormDefinitionRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: form_builder.form_definition.DeleteFormDefinitionRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this DeleteFormDefinitionRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for DeleteFormDefinitionRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a DeleteFormDefinitionResponse. */
        interface IDeleteFormDefinitionResponse {

            /** DeleteFormDefinitionResponse success */
            success?: (boolean|null);
        }

        /** Represents a DeleteFormDefinitionResponse. */
        class DeleteFormDefinitionResponse implements IDeleteFormDefinitionResponse {

            /**
             * Constructs a new DeleteFormDefinitionResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: form_builder.form_definition.IDeleteFormDefinitionResponse);

            /** DeleteFormDefinitionResponse success. */
            public success: boolean;

            /**
             * Creates a new DeleteFormDefinitionResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns DeleteFormDefinitionResponse instance
             */
            public static create(properties?: form_builder.form_definition.IDeleteFormDefinitionResponse): form_builder.form_definition.DeleteFormDefinitionResponse;

            /**
             * Encodes the specified DeleteFormDefinitionResponse message. Does not implicitly {@link form_builder.form_definition.DeleteFormDefinitionResponse.verify|verify} messages.
             * @param message DeleteFormDefinitionResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: form_builder.form_definition.IDeleteFormDefinitionResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified DeleteFormDefinitionResponse message, length delimited. Does not implicitly {@link form_builder.form_definition.DeleteFormDefinitionResponse.verify|verify} messages.
             * @param message DeleteFormDefinitionResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: form_builder.form_definition.IDeleteFormDefinitionResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DeleteFormDefinitionResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns DeleteFormDefinitionResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): form_builder.form_definition.DeleteFormDefinitionResponse;

            /**
             * Decodes a DeleteFormDefinitionResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns DeleteFormDefinitionResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): form_builder.form_definition.DeleteFormDefinitionResponse;

            /**
             * Verifies a DeleteFormDefinitionResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a DeleteFormDefinitionResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns DeleteFormDefinitionResponse
             */
            public static fromObject(object: { [k: string]: any }): form_builder.form_definition.DeleteFormDefinitionResponse;

            /**
             * Creates a plain object from a DeleteFormDefinitionResponse message. Also converts values to other types if specified.
             * @param message DeleteFormDefinitionResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: form_builder.form_definition.DeleteFormDefinitionResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this DeleteFormDefinitionResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for DeleteFormDefinitionResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }

    /** Namespace tag. */
    namespace tag {

        /** Properties of a Tag. */
        interface ITag {

            /** Tag id */
            id?: (string|null);

            /** Tag name */
            name?: (string|null);

            /** Tag color */
            color?: (string|null);

            /** Tag createdAt */
            createdAt?: (form_builder.common.ITimestamp|null);

            /** Tag updatedAt */
            updatedAt?: (form_builder.common.ITimestamp|null);
        }

        /** Represents a Tag. */
        class Tag implements ITag {

            /**
             * Constructs a new Tag.
             * @param [properties] Properties to set
             */
            constructor(properties?: form_builder.tag.ITag);

            /** Tag id. */
            public id: string;

            /** Tag name. */
            public name: string;

            /** Tag color. */
            public color: string;

            /** Tag createdAt. */
            public createdAt?: (form_builder.common.ITimestamp|null);

            /** Tag updatedAt. */
            public updatedAt?: (form_builder.common.ITimestamp|null);

            /**
             * Creates a new Tag instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Tag instance
             */
            public static create(properties?: form_builder.tag.ITag): form_builder.tag.Tag;

            /**
             * Encodes the specified Tag message. Does not implicitly {@link form_builder.tag.Tag.verify|verify} messages.
             * @param message Tag message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: form_builder.tag.ITag, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Tag message, length delimited. Does not implicitly {@link form_builder.tag.Tag.verify|verify} messages.
             * @param message Tag message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: form_builder.tag.ITag, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Tag message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Tag
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): form_builder.tag.Tag;

            /**
             * Decodes a Tag message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Tag
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): form_builder.tag.Tag;

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
            public static fromObject(object: { [k: string]: any }): form_builder.tag.Tag;

            /**
             * Creates a plain object from a Tag message. Also converts values to other types if specified.
             * @param message Tag
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: form_builder.tag.Tag, options?: $protobuf.IConversionOptions): { [k: string]: any };

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

        /** Properties of a TagListResponse. */
        interface ITagListResponse {

            /** TagListResponse tags */
            tags?: (form_builder.tag.ITag[]|null);
        }

        /** Represents a TagListResponse. */
        class TagListResponse implements ITagListResponse {

            /**
             * Constructs a new TagListResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: form_builder.tag.ITagListResponse);

            /** TagListResponse tags. */
            public tags: form_builder.tag.ITag[];

            /**
             * Creates a new TagListResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns TagListResponse instance
             */
            public static create(properties?: form_builder.tag.ITagListResponse): form_builder.tag.TagListResponse;

            /**
             * Encodes the specified TagListResponse message. Does not implicitly {@link form_builder.tag.TagListResponse.verify|verify} messages.
             * @param message TagListResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: form_builder.tag.ITagListResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified TagListResponse message, length delimited. Does not implicitly {@link form_builder.tag.TagListResponse.verify|verify} messages.
             * @param message TagListResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: form_builder.tag.ITagListResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a TagListResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns TagListResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): form_builder.tag.TagListResponse;

            /**
             * Decodes a TagListResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns TagListResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): form_builder.tag.TagListResponse;

            /**
             * Verifies a TagListResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a TagListResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns TagListResponse
             */
            public static fromObject(object: { [k: string]: any }): form_builder.tag.TagListResponse;

            /**
             * Creates a plain object from a TagListResponse message. Also converts values to other types if specified.
             * @param message TagListResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: form_builder.tag.TagListResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this TagListResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for TagListResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a CreateTagRequest. */
        interface ICreateTagRequest {

            /** CreateTagRequest name */
            name?: (string|null);

            /** CreateTagRequest color */
            color?: (string|null);
        }

        /** Represents a CreateTagRequest. */
        class CreateTagRequest implements ICreateTagRequest {

            /**
             * Constructs a new CreateTagRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: form_builder.tag.ICreateTagRequest);

            /** CreateTagRequest name. */
            public name: string;

            /** CreateTagRequest color. */
            public color: string;

            /**
             * Creates a new CreateTagRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns CreateTagRequest instance
             */
            public static create(properties?: form_builder.tag.ICreateTagRequest): form_builder.tag.CreateTagRequest;

            /**
             * Encodes the specified CreateTagRequest message. Does not implicitly {@link form_builder.tag.CreateTagRequest.verify|verify} messages.
             * @param message CreateTagRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: form_builder.tag.ICreateTagRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified CreateTagRequest message, length delimited. Does not implicitly {@link form_builder.tag.CreateTagRequest.verify|verify} messages.
             * @param message CreateTagRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: form_builder.tag.ICreateTagRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a CreateTagRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns CreateTagRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): form_builder.tag.CreateTagRequest;

            /**
             * Decodes a CreateTagRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns CreateTagRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): form_builder.tag.CreateTagRequest;

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
            public static fromObject(object: { [k: string]: any }): form_builder.tag.CreateTagRequest;

            /**
             * Creates a plain object from a CreateTagRequest message. Also converts values to other types if specified.
             * @param message CreateTagRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: form_builder.tag.CreateTagRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

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

        /** Properties of a CreateTagResponse. */
        interface ICreateTagResponse {

            /** CreateTagResponse tag */
            tag?: (form_builder.tag.ITag|null);
        }

        /** Represents a CreateTagResponse. */
        class CreateTagResponse implements ICreateTagResponse {

            /**
             * Constructs a new CreateTagResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: form_builder.tag.ICreateTagResponse);

            /** CreateTagResponse tag. */
            public tag?: (form_builder.tag.ITag|null);

            /**
             * Creates a new CreateTagResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns CreateTagResponse instance
             */
            public static create(properties?: form_builder.tag.ICreateTagResponse): form_builder.tag.CreateTagResponse;

            /**
             * Encodes the specified CreateTagResponse message. Does not implicitly {@link form_builder.tag.CreateTagResponse.verify|verify} messages.
             * @param message CreateTagResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: form_builder.tag.ICreateTagResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified CreateTagResponse message, length delimited. Does not implicitly {@link form_builder.tag.CreateTagResponse.verify|verify} messages.
             * @param message CreateTagResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: form_builder.tag.ICreateTagResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a CreateTagResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns CreateTagResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): form_builder.tag.CreateTagResponse;

            /**
             * Decodes a CreateTagResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns CreateTagResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): form_builder.tag.CreateTagResponse;

            /**
             * Verifies a CreateTagResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a CreateTagResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns CreateTagResponse
             */
            public static fromObject(object: { [k: string]: any }): form_builder.tag.CreateTagResponse;

            /**
             * Creates a plain object from a CreateTagResponse message. Also converts values to other types if specified.
             * @param message CreateTagResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: form_builder.tag.CreateTagResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this CreateTagResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for CreateTagResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an UpdateTagRequest. */
        interface IUpdateTagRequest {

            /** UpdateTagRequest id */
            id?: (string|null);

            /** UpdateTagRequest name */
            name?: (string|null);

            /** UpdateTagRequest color */
            color?: (string|null);
        }

        /** Represents an UpdateTagRequest. */
        class UpdateTagRequest implements IUpdateTagRequest {

            /**
             * Constructs a new UpdateTagRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: form_builder.tag.IUpdateTagRequest);

            /** UpdateTagRequest id. */
            public id: string;

            /** UpdateTagRequest name. */
            public name: string;

            /** UpdateTagRequest color. */
            public color: string;

            /**
             * Creates a new UpdateTagRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns UpdateTagRequest instance
             */
            public static create(properties?: form_builder.tag.IUpdateTagRequest): form_builder.tag.UpdateTagRequest;

            /**
             * Encodes the specified UpdateTagRequest message. Does not implicitly {@link form_builder.tag.UpdateTagRequest.verify|verify} messages.
             * @param message UpdateTagRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: form_builder.tag.IUpdateTagRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified UpdateTagRequest message, length delimited. Does not implicitly {@link form_builder.tag.UpdateTagRequest.verify|verify} messages.
             * @param message UpdateTagRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: form_builder.tag.IUpdateTagRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an UpdateTagRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns UpdateTagRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): form_builder.tag.UpdateTagRequest;

            /**
             * Decodes an UpdateTagRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns UpdateTagRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): form_builder.tag.UpdateTagRequest;

            /**
             * Verifies an UpdateTagRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an UpdateTagRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns UpdateTagRequest
             */
            public static fromObject(object: { [k: string]: any }): form_builder.tag.UpdateTagRequest;

            /**
             * Creates a plain object from an UpdateTagRequest message. Also converts values to other types if specified.
             * @param message UpdateTagRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: form_builder.tag.UpdateTagRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this UpdateTagRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for UpdateTagRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an UpdateTagResponse. */
        interface IUpdateTagResponse {

            /** UpdateTagResponse tag */
            tag?: (form_builder.tag.ITag|null);
        }

        /** Represents an UpdateTagResponse. */
        class UpdateTagResponse implements IUpdateTagResponse {

            /**
             * Constructs a new UpdateTagResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: form_builder.tag.IUpdateTagResponse);

            /** UpdateTagResponse tag. */
            public tag?: (form_builder.tag.ITag|null);

            /**
             * Creates a new UpdateTagResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns UpdateTagResponse instance
             */
            public static create(properties?: form_builder.tag.IUpdateTagResponse): form_builder.tag.UpdateTagResponse;

            /**
             * Encodes the specified UpdateTagResponse message. Does not implicitly {@link form_builder.tag.UpdateTagResponse.verify|verify} messages.
             * @param message UpdateTagResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: form_builder.tag.IUpdateTagResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified UpdateTagResponse message, length delimited. Does not implicitly {@link form_builder.tag.UpdateTagResponse.verify|verify} messages.
             * @param message UpdateTagResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: form_builder.tag.IUpdateTagResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an UpdateTagResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns UpdateTagResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): form_builder.tag.UpdateTagResponse;

            /**
             * Decodes an UpdateTagResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns UpdateTagResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): form_builder.tag.UpdateTagResponse;

            /**
             * Verifies an UpdateTagResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an UpdateTagResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns UpdateTagResponse
             */
            public static fromObject(object: { [k: string]: any }): form_builder.tag.UpdateTagResponse;

            /**
             * Creates a plain object from an UpdateTagResponse message. Also converts values to other types if specified.
             * @param message UpdateTagResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: form_builder.tag.UpdateTagResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this UpdateTagResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for UpdateTagResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a GetTagRequest. */
        interface IGetTagRequest {

            /** GetTagRequest id */
            id?: (string|null);
        }

        /** Represents a GetTagRequest. */
        class GetTagRequest implements IGetTagRequest {

            /**
             * Constructs a new GetTagRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: form_builder.tag.IGetTagRequest);

            /** GetTagRequest id. */
            public id: string;

            /**
             * Creates a new GetTagRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns GetTagRequest instance
             */
            public static create(properties?: form_builder.tag.IGetTagRequest): form_builder.tag.GetTagRequest;

            /**
             * Encodes the specified GetTagRequest message. Does not implicitly {@link form_builder.tag.GetTagRequest.verify|verify} messages.
             * @param message GetTagRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: form_builder.tag.IGetTagRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified GetTagRequest message, length delimited. Does not implicitly {@link form_builder.tag.GetTagRequest.verify|verify} messages.
             * @param message GetTagRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: form_builder.tag.IGetTagRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a GetTagRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns GetTagRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): form_builder.tag.GetTagRequest;

            /**
             * Decodes a GetTagRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns GetTagRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): form_builder.tag.GetTagRequest;

            /**
             * Verifies a GetTagRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a GetTagRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns GetTagRequest
             */
            public static fromObject(object: { [k: string]: any }): form_builder.tag.GetTagRequest;

            /**
             * Creates a plain object from a GetTagRequest message. Also converts values to other types if specified.
             * @param message GetTagRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: form_builder.tag.GetTagRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this GetTagRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for GetTagRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a GetTagResponse. */
        interface IGetTagResponse {

            /** GetTagResponse tag */
            tag?: (form_builder.tag.ITag|null);
        }

        /** Represents a GetTagResponse. */
        class GetTagResponse implements IGetTagResponse {

            /**
             * Constructs a new GetTagResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: form_builder.tag.IGetTagResponse);

            /** GetTagResponse tag. */
            public tag?: (form_builder.tag.ITag|null);

            /**
             * Creates a new GetTagResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns GetTagResponse instance
             */
            public static create(properties?: form_builder.tag.IGetTagResponse): form_builder.tag.GetTagResponse;

            /**
             * Encodes the specified GetTagResponse message. Does not implicitly {@link form_builder.tag.GetTagResponse.verify|verify} messages.
             * @param message GetTagResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: form_builder.tag.IGetTagResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified GetTagResponse message, length delimited. Does not implicitly {@link form_builder.tag.GetTagResponse.verify|verify} messages.
             * @param message GetTagResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: form_builder.tag.IGetTagResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a GetTagResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns GetTagResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): form_builder.tag.GetTagResponse;

            /**
             * Decodes a GetTagResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns GetTagResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): form_builder.tag.GetTagResponse;

            /**
             * Verifies a GetTagResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a GetTagResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns GetTagResponse
             */
            public static fromObject(object: { [k: string]: any }): form_builder.tag.GetTagResponse;

            /**
             * Creates a plain object from a GetTagResponse message. Also converts values to other types if specified.
             * @param message GetTagResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: form_builder.tag.GetTagResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this GetTagResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for GetTagResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a DeleteTagRequest. */
        interface IDeleteTagRequest {

            /** DeleteTagRequest id */
            id?: (string|null);
        }

        /** Represents a DeleteTagRequest. */
        class DeleteTagRequest implements IDeleteTagRequest {

            /**
             * Constructs a new DeleteTagRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: form_builder.tag.IDeleteTagRequest);

            /** DeleteTagRequest id. */
            public id: string;

            /**
             * Creates a new DeleteTagRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns DeleteTagRequest instance
             */
            public static create(properties?: form_builder.tag.IDeleteTagRequest): form_builder.tag.DeleteTagRequest;

            /**
             * Encodes the specified DeleteTagRequest message. Does not implicitly {@link form_builder.tag.DeleteTagRequest.verify|verify} messages.
             * @param message DeleteTagRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: form_builder.tag.IDeleteTagRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified DeleteTagRequest message, length delimited. Does not implicitly {@link form_builder.tag.DeleteTagRequest.verify|verify} messages.
             * @param message DeleteTagRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: form_builder.tag.IDeleteTagRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DeleteTagRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns DeleteTagRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): form_builder.tag.DeleteTagRequest;

            /**
             * Decodes a DeleteTagRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns DeleteTagRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): form_builder.tag.DeleteTagRequest;

            /**
             * Verifies a DeleteTagRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a DeleteTagRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns DeleteTagRequest
             */
            public static fromObject(object: { [k: string]: any }): form_builder.tag.DeleteTagRequest;

            /**
             * Creates a plain object from a DeleteTagRequest message. Also converts values to other types if specified.
             * @param message DeleteTagRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: form_builder.tag.DeleteTagRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this DeleteTagRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for DeleteTagRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a DeleteTagResponse. */
        interface IDeleteTagResponse {

            /** DeleteTagResponse success */
            success?: (boolean|null);
        }

        /** Represents a DeleteTagResponse. */
        class DeleteTagResponse implements IDeleteTagResponse {

            /**
             * Constructs a new DeleteTagResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: form_builder.tag.IDeleteTagResponse);

            /** DeleteTagResponse success. */
            public success: boolean;

            /**
             * Creates a new DeleteTagResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns DeleteTagResponse instance
             */
            public static create(properties?: form_builder.tag.IDeleteTagResponse): form_builder.tag.DeleteTagResponse;

            /**
             * Encodes the specified DeleteTagResponse message. Does not implicitly {@link form_builder.tag.DeleteTagResponse.verify|verify} messages.
             * @param message DeleteTagResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: form_builder.tag.IDeleteTagResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified DeleteTagResponse message, length delimited. Does not implicitly {@link form_builder.tag.DeleteTagResponse.verify|verify} messages.
             * @param message DeleteTagResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: form_builder.tag.IDeleteTagResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DeleteTagResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns DeleteTagResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): form_builder.tag.DeleteTagResponse;

            /**
             * Decodes a DeleteTagResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns DeleteTagResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): form_builder.tag.DeleteTagResponse;

            /**
             * Verifies a DeleteTagResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a DeleteTagResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns DeleteTagResponse
             */
            public static fromObject(object: { [k: string]: any }): form_builder.tag.DeleteTagResponse;

            /**
             * Creates a plain object from a DeleteTagResponse message. Also converts values to other types if specified.
             * @param message DeleteTagResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: form_builder.tag.DeleteTagResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this DeleteTagResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for DeleteTagResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }

    /** Namespace version. */
    namespace version {

        /** Properties of a FormVersion. */
        interface IFormVersion {

            /** FormVersion id */
            id?: (string|null);

            /** FormVersion formDefinitionId */
            formDefinitionId?: (string|null);

            /** FormVersion version */
            version?: (string|null);

            /** FormVersion schemaData */
            schemaData?: (Uint8Array|null);

            /** FormVersion metadataData */
            metadataData?: (Uint8Array|null);

            /** FormVersion changeSummary */
            changeSummary?: (string|null);

            /** FormVersion createdAt */
            createdAt?: (form_builder.common.ITimestamp|null);
        }

        /** Represents a FormVersion. */
        class FormVersion implements IFormVersion {

            /**
             * Constructs a new FormVersion.
             * @param [properties] Properties to set
             */
            constructor(properties?: form_builder.version.IFormVersion);

            /** FormVersion id. */
            public id: string;

            /** FormVersion formDefinitionId. */
            public formDefinitionId: string;

            /** FormVersion version. */
            public version: string;

            /** FormVersion schemaData. */
            public schemaData: Uint8Array;

            /** FormVersion metadataData. */
            public metadataData: Uint8Array;

            /** FormVersion changeSummary. */
            public changeSummary: string;

            /** FormVersion createdAt. */
            public createdAt?: (form_builder.common.ITimestamp|null);

            /**
             * Creates a new FormVersion instance using the specified properties.
             * @param [properties] Properties to set
             * @returns FormVersion instance
             */
            public static create(properties?: form_builder.version.IFormVersion): form_builder.version.FormVersion;

            /**
             * Encodes the specified FormVersion message. Does not implicitly {@link form_builder.version.FormVersion.verify|verify} messages.
             * @param message FormVersion message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: form_builder.version.IFormVersion, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified FormVersion message, length delimited. Does not implicitly {@link form_builder.version.FormVersion.verify|verify} messages.
             * @param message FormVersion message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: form_builder.version.IFormVersion, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a FormVersion message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns FormVersion
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): form_builder.version.FormVersion;

            /**
             * Decodes a FormVersion message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns FormVersion
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): form_builder.version.FormVersion;

            /**
             * Verifies a FormVersion message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a FormVersion message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns FormVersion
             */
            public static fromObject(object: { [k: string]: any }): form_builder.version.FormVersion;

            /**
             * Creates a plain object from a FormVersion message. Also converts values to other types if specified.
             * @param message FormVersion
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: form_builder.version.FormVersion, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this FormVersion to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for FormVersion
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a ListVersionsRequest. */
        interface IListVersionsRequest {

            /** ListVersionsRequest formDefinitionId */
            formDefinitionId?: (string|null);
        }

        /** Represents a ListVersionsRequest. */
        class ListVersionsRequest implements IListVersionsRequest {

            /**
             * Constructs a new ListVersionsRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: form_builder.version.IListVersionsRequest);

            /** ListVersionsRequest formDefinitionId. */
            public formDefinitionId: string;

            /**
             * Creates a new ListVersionsRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ListVersionsRequest instance
             */
            public static create(properties?: form_builder.version.IListVersionsRequest): form_builder.version.ListVersionsRequest;

            /**
             * Encodes the specified ListVersionsRequest message. Does not implicitly {@link form_builder.version.ListVersionsRequest.verify|verify} messages.
             * @param message ListVersionsRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: form_builder.version.IListVersionsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ListVersionsRequest message, length delimited. Does not implicitly {@link form_builder.version.ListVersionsRequest.verify|verify} messages.
             * @param message ListVersionsRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: form_builder.version.IListVersionsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ListVersionsRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ListVersionsRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): form_builder.version.ListVersionsRequest;

            /**
             * Decodes a ListVersionsRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ListVersionsRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): form_builder.version.ListVersionsRequest;

            /**
             * Verifies a ListVersionsRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ListVersionsRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ListVersionsRequest
             */
            public static fromObject(object: { [k: string]: any }): form_builder.version.ListVersionsRequest;

            /**
             * Creates a plain object from a ListVersionsRequest message. Also converts values to other types if specified.
             * @param message ListVersionsRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: form_builder.version.ListVersionsRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ListVersionsRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for ListVersionsRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a ListVersionsResponse. */
        interface IListVersionsResponse {

            /** ListVersionsResponse versions */
            versions?: (form_builder.version.IFormVersion[]|null);
        }

        /** Represents a ListVersionsResponse. */
        class ListVersionsResponse implements IListVersionsResponse {

            /**
             * Constructs a new ListVersionsResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: form_builder.version.IListVersionsResponse);

            /** ListVersionsResponse versions. */
            public versions: form_builder.version.IFormVersion[];

            /**
             * Creates a new ListVersionsResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ListVersionsResponse instance
             */
            public static create(properties?: form_builder.version.IListVersionsResponse): form_builder.version.ListVersionsResponse;

            /**
             * Encodes the specified ListVersionsResponse message. Does not implicitly {@link form_builder.version.ListVersionsResponse.verify|verify} messages.
             * @param message ListVersionsResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: form_builder.version.IListVersionsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ListVersionsResponse message, length delimited. Does not implicitly {@link form_builder.version.ListVersionsResponse.verify|verify} messages.
             * @param message ListVersionsResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: form_builder.version.IListVersionsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ListVersionsResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ListVersionsResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): form_builder.version.ListVersionsResponse;

            /**
             * Decodes a ListVersionsResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ListVersionsResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): form_builder.version.ListVersionsResponse;

            /**
             * Verifies a ListVersionsResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ListVersionsResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ListVersionsResponse
             */
            public static fromObject(object: { [k: string]: any }): form_builder.version.ListVersionsResponse;

            /**
             * Creates a plain object from a ListVersionsResponse message. Also converts values to other types if specified.
             * @param message ListVersionsResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: form_builder.version.ListVersionsResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ListVersionsResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for ListVersionsResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a GetVersionRequest. */
        interface IGetVersionRequest {

            /** GetVersionRequest id */
            id?: (string|null);
        }

        /** Represents a GetVersionRequest. */
        class GetVersionRequest implements IGetVersionRequest {

            /**
             * Constructs a new GetVersionRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: form_builder.version.IGetVersionRequest);

            /** GetVersionRequest id. */
            public id: string;

            /**
             * Creates a new GetVersionRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns GetVersionRequest instance
             */
            public static create(properties?: form_builder.version.IGetVersionRequest): form_builder.version.GetVersionRequest;

            /**
             * Encodes the specified GetVersionRequest message. Does not implicitly {@link form_builder.version.GetVersionRequest.verify|verify} messages.
             * @param message GetVersionRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: form_builder.version.IGetVersionRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified GetVersionRequest message, length delimited. Does not implicitly {@link form_builder.version.GetVersionRequest.verify|verify} messages.
             * @param message GetVersionRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: form_builder.version.IGetVersionRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a GetVersionRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns GetVersionRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): form_builder.version.GetVersionRequest;

            /**
             * Decodes a GetVersionRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns GetVersionRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): form_builder.version.GetVersionRequest;

            /**
             * Verifies a GetVersionRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a GetVersionRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns GetVersionRequest
             */
            public static fromObject(object: { [k: string]: any }): form_builder.version.GetVersionRequest;

            /**
             * Creates a plain object from a GetVersionRequest message. Also converts values to other types if specified.
             * @param message GetVersionRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: form_builder.version.GetVersionRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this GetVersionRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for GetVersionRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a GetVersionResponse. */
        interface IGetVersionResponse {

            /** GetVersionResponse version */
            version?: (form_builder.version.IFormVersion|null);
        }

        /** Represents a GetVersionResponse. */
        class GetVersionResponse implements IGetVersionResponse {

            /**
             * Constructs a new GetVersionResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: form_builder.version.IGetVersionResponse);

            /** GetVersionResponse version. */
            public version?: (form_builder.version.IFormVersion|null);

            /**
             * Creates a new GetVersionResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns GetVersionResponse instance
             */
            public static create(properties?: form_builder.version.IGetVersionResponse): form_builder.version.GetVersionResponse;

            /**
             * Encodes the specified GetVersionResponse message. Does not implicitly {@link form_builder.version.GetVersionResponse.verify|verify} messages.
             * @param message GetVersionResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: form_builder.version.IGetVersionResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified GetVersionResponse message, length delimited. Does not implicitly {@link form_builder.version.GetVersionResponse.verify|verify} messages.
             * @param message GetVersionResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: form_builder.version.IGetVersionResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a GetVersionResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns GetVersionResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): form_builder.version.GetVersionResponse;

            /**
             * Decodes a GetVersionResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns GetVersionResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): form_builder.version.GetVersionResponse;

            /**
             * Verifies a GetVersionResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a GetVersionResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns GetVersionResponse
             */
            public static fromObject(object: { [k: string]: any }): form_builder.version.GetVersionResponse;

            /**
             * Creates a plain object from a GetVersionResponse message. Also converts values to other types if specified.
             * @param message GetVersionResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: form_builder.version.GetVersionResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this GetVersionResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for GetVersionResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a CreateVersionRequest. */
        interface ICreateVersionRequest {

            /** CreateVersionRequest formDefinitionId */
            formDefinitionId?: (string|null);

            /** CreateVersionRequest changeSummary */
            changeSummary?: (string|null);
        }

        /** Represents a CreateVersionRequest. */
        class CreateVersionRequest implements ICreateVersionRequest {

            /**
             * Constructs a new CreateVersionRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: form_builder.version.ICreateVersionRequest);

            /** CreateVersionRequest formDefinitionId. */
            public formDefinitionId: string;

            /** CreateVersionRequest changeSummary. */
            public changeSummary: string;

            /**
             * Creates a new CreateVersionRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns CreateVersionRequest instance
             */
            public static create(properties?: form_builder.version.ICreateVersionRequest): form_builder.version.CreateVersionRequest;

            /**
             * Encodes the specified CreateVersionRequest message. Does not implicitly {@link form_builder.version.CreateVersionRequest.verify|verify} messages.
             * @param message CreateVersionRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: form_builder.version.ICreateVersionRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified CreateVersionRequest message, length delimited. Does not implicitly {@link form_builder.version.CreateVersionRequest.verify|verify} messages.
             * @param message CreateVersionRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: form_builder.version.ICreateVersionRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a CreateVersionRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns CreateVersionRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): form_builder.version.CreateVersionRequest;

            /**
             * Decodes a CreateVersionRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns CreateVersionRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): form_builder.version.CreateVersionRequest;

            /**
             * Verifies a CreateVersionRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a CreateVersionRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns CreateVersionRequest
             */
            public static fromObject(object: { [k: string]: any }): form_builder.version.CreateVersionRequest;

            /**
             * Creates a plain object from a CreateVersionRequest message. Also converts values to other types if specified.
             * @param message CreateVersionRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: form_builder.version.CreateVersionRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this CreateVersionRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for CreateVersionRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a CreateVersionResponse. */
        interface ICreateVersionResponse {

            /** CreateVersionResponse version */
            version?: (form_builder.version.IFormVersion|null);
        }

        /** Represents a CreateVersionResponse. */
        class CreateVersionResponse implements ICreateVersionResponse {

            /**
             * Constructs a new CreateVersionResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: form_builder.version.ICreateVersionResponse);

            /** CreateVersionResponse version. */
            public version?: (form_builder.version.IFormVersion|null);

            /**
             * Creates a new CreateVersionResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns CreateVersionResponse instance
             */
            public static create(properties?: form_builder.version.ICreateVersionResponse): form_builder.version.CreateVersionResponse;

            /**
             * Encodes the specified CreateVersionResponse message. Does not implicitly {@link form_builder.version.CreateVersionResponse.verify|verify} messages.
             * @param message CreateVersionResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: form_builder.version.ICreateVersionResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified CreateVersionResponse message, length delimited. Does not implicitly {@link form_builder.version.CreateVersionResponse.verify|verify} messages.
             * @param message CreateVersionResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: form_builder.version.ICreateVersionResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a CreateVersionResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns CreateVersionResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): form_builder.version.CreateVersionResponse;

            /**
             * Decodes a CreateVersionResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns CreateVersionResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): form_builder.version.CreateVersionResponse;

            /**
             * Verifies a CreateVersionResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a CreateVersionResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns CreateVersionResponse
             */
            public static fromObject(object: { [k: string]: any }): form_builder.version.CreateVersionResponse;

            /**
             * Creates a plain object from a CreateVersionResponse message. Also converts values to other types if specified.
             * @param message CreateVersionResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: form_builder.version.CreateVersionResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this CreateVersionResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for CreateVersionResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a RestoreVersionRequest. */
        interface IRestoreVersionRequest {

            /** RestoreVersionRequest id */
            id?: (string|null);
        }

        /** Represents a RestoreVersionRequest. */
        class RestoreVersionRequest implements IRestoreVersionRequest {

            /**
             * Constructs a new RestoreVersionRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: form_builder.version.IRestoreVersionRequest);

            /** RestoreVersionRequest id. */
            public id: string;

            /**
             * Creates a new RestoreVersionRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns RestoreVersionRequest instance
             */
            public static create(properties?: form_builder.version.IRestoreVersionRequest): form_builder.version.RestoreVersionRequest;

            /**
             * Encodes the specified RestoreVersionRequest message. Does not implicitly {@link form_builder.version.RestoreVersionRequest.verify|verify} messages.
             * @param message RestoreVersionRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: form_builder.version.IRestoreVersionRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified RestoreVersionRequest message, length delimited. Does not implicitly {@link form_builder.version.RestoreVersionRequest.verify|verify} messages.
             * @param message RestoreVersionRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: form_builder.version.IRestoreVersionRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a RestoreVersionRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns RestoreVersionRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): form_builder.version.RestoreVersionRequest;

            /**
             * Decodes a RestoreVersionRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns RestoreVersionRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): form_builder.version.RestoreVersionRequest;

            /**
             * Verifies a RestoreVersionRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a RestoreVersionRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns RestoreVersionRequest
             */
            public static fromObject(object: { [k: string]: any }): form_builder.version.RestoreVersionRequest;

            /**
             * Creates a plain object from a RestoreVersionRequest message. Also converts values to other types if specified.
             * @param message RestoreVersionRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: form_builder.version.RestoreVersionRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this RestoreVersionRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for RestoreVersionRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a RestoreVersionResponse. */
        interface IRestoreVersionResponse {

            /** RestoreVersionResponse success */
            success?: (boolean|null);

            /** RestoreVersionResponse restoredVersion */
            restoredVersion?: (string|null);
        }

        /** Represents a RestoreVersionResponse. */
        class RestoreVersionResponse implements IRestoreVersionResponse {

            /**
             * Constructs a new RestoreVersionResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: form_builder.version.IRestoreVersionResponse);

            /** RestoreVersionResponse success. */
            public success: boolean;

            /** RestoreVersionResponse restoredVersion. */
            public restoredVersion: string;

            /**
             * Creates a new RestoreVersionResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns RestoreVersionResponse instance
             */
            public static create(properties?: form_builder.version.IRestoreVersionResponse): form_builder.version.RestoreVersionResponse;

            /**
             * Encodes the specified RestoreVersionResponse message. Does not implicitly {@link form_builder.version.RestoreVersionResponse.verify|verify} messages.
             * @param message RestoreVersionResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: form_builder.version.IRestoreVersionResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified RestoreVersionResponse message, length delimited. Does not implicitly {@link form_builder.version.RestoreVersionResponse.verify|verify} messages.
             * @param message RestoreVersionResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: form_builder.version.IRestoreVersionResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a RestoreVersionResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns RestoreVersionResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): form_builder.version.RestoreVersionResponse;

            /**
             * Decodes a RestoreVersionResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns RestoreVersionResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): form_builder.version.RestoreVersionResponse;

            /**
             * Verifies a RestoreVersionResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a RestoreVersionResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns RestoreVersionResponse
             */
            public static fromObject(object: { [k: string]: any }): form_builder.version.RestoreVersionResponse;

            /**
             * Creates a plain object from a RestoreVersionResponse message. Also converts values to other types if specified.
             * @param message RestoreVersionResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: form_builder.version.RestoreVersionResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this RestoreVersionResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for RestoreVersionResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}
