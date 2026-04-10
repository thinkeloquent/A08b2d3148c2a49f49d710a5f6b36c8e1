import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace figma_files. */
export namespace figma_files {

    /** Namespace common. */
    namespace common {

        /** FigmaFileType enum. */
        enum FigmaFileType {
            FIGMA_FILE_TYPE_UNSPECIFIED = 0,
            FIGMA_FILE_TYPE_DESIGN_SYSTEM = 1,
            FIGMA_FILE_TYPE_COMPONENT_LIBRARY = 2,
            FIGMA_FILE_TYPE_PROTOTYPE = 3,
            FIGMA_FILE_TYPE_ILLUSTRATION = 4,
            FIGMA_FILE_TYPE_ICON_SET = 5
        }

        /** FigmaFileStatus enum. */
        enum FigmaFileStatus {
            FIGMA_FILE_STATUS_UNSPECIFIED = 0,
            FIGMA_FILE_STATUS_STABLE = 1,
            FIGMA_FILE_STATUS_BETA = 2,
            FIGMA_FILE_STATUS_DEPRECATED = 3,
            FIGMA_FILE_STATUS_EXPERIMENTAL = 4
        }

        /** FigmaFileSource enum. */
        enum FigmaFileSource {
            FIGMA_FILE_SOURCE_UNSPECIFIED = 0,
            FIGMA_FILE_SOURCE_FIGMA = 1,
            FIGMA_FILE_SOURCE_FIGMA_COMMUNITY = 2,
            FIGMA_FILE_SOURCE_MANUAL = 3
        }

        /** Properties of an ExternalId. */
        interface IExternalId {

            /** ExternalId registry */
            registry?: (string|null);

            /** ExternalId id */
            id?: (string|null);
        }

        /** Represents an ExternalId. */
        class ExternalId implements IExternalId {

            /**
             * Constructs a new ExternalId.
             * @param [properties] Properties to set
             */
            constructor(properties?: figma_files.common.IExternalId);

            /** ExternalId registry. */
            public registry: string;

            /** ExternalId id. */
            public id: string;

            /**
             * Creates a new ExternalId instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ExternalId instance
             */
            public static create(properties?: figma_files.common.IExternalId): figma_files.common.ExternalId;

            /**
             * Encodes the specified ExternalId message. Does not implicitly {@link figma_files.common.ExternalId.verify|verify} messages.
             * @param message ExternalId message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: figma_files.common.IExternalId, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ExternalId message, length delimited. Does not implicitly {@link figma_files.common.ExternalId.verify|verify} messages.
             * @param message ExternalId message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: figma_files.common.IExternalId, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an ExternalId message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ExternalId
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_files.common.ExternalId;

            /**
             * Decodes an ExternalId message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ExternalId
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_files.common.ExternalId;

            /**
             * Verifies an ExternalId message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an ExternalId message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ExternalId
             */
            public static fromObject(object: { [k: string]: any }): figma_files.common.ExternalId;

            /**
             * Creates a plain object from an ExternalId message. Also converts values to other types if specified.
             * @param message ExternalId
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: figma_files.common.ExternalId, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ExternalId to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for ExternalId
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
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
            constructor(properties?: figma_files.common.IPaginationRequest);

            /** PaginationRequest page. */
            public page: number;

            /** PaginationRequest limit. */
            public limit: number;

            /**
             * Creates a new PaginationRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns PaginationRequest instance
             */
            public static create(properties?: figma_files.common.IPaginationRequest): figma_files.common.PaginationRequest;

            /**
             * Encodes the specified PaginationRequest message. Does not implicitly {@link figma_files.common.PaginationRequest.verify|verify} messages.
             * @param message PaginationRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: figma_files.common.IPaginationRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified PaginationRequest message, length delimited. Does not implicitly {@link figma_files.common.PaginationRequest.verify|verify} messages.
             * @param message PaginationRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: figma_files.common.IPaginationRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a PaginationRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns PaginationRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_files.common.PaginationRequest;

            /**
             * Decodes a PaginationRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns PaginationRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_files.common.PaginationRequest;

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
            public static fromObject(object: { [k: string]: any }): figma_files.common.PaginationRequest;

            /**
             * Creates a plain object from a PaginationRequest message. Also converts values to other types if specified.
             * @param message PaginationRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: figma_files.common.PaginationRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            constructor(properties?: figma_files.common.IPaginationResponse);

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
            public static create(properties?: figma_files.common.IPaginationResponse): figma_files.common.PaginationResponse;

            /**
             * Encodes the specified PaginationResponse message. Does not implicitly {@link figma_files.common.PaginationResponse.verify|verify} messages.
             * @param message PaginationResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: figma_files.common.IPaginationResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified PaginationResponse message, length delimited. Does not implicitly {@link figma_files.common.PaginationResponse.verify|verify} messages.
             * @param message PaginationResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: figma_files.common.IPaginationResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a PaginationResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns PaginationResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_files.common.PaginationResponse;

            /**
             * Decodes a PaginationResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns PaginationResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_files.common.PaginationResponse;

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
            public static fromObject(object: { [k: string]: any }): figma_files.common.PaginationResponse;

            /**
             * Creates a plain object from a PaginationResponse message. Also converts values to other types if specified.
             * @param message PaginationResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: figma_files.common.PaginationResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            constructor(properties?: figma_files.common.IErrorResponse);

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
            public static create(properties?: figma_files.common.IErrorResponse): figma_files.common.ErrorResponse;

            /**
             * Encodes the specified ErrorResponse message. Does not implicitly {@link figma_files.common.ErrorResponse.verify|verify} messages.
             * @param message ErrorResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: figma_files.common.IErrorResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ErrorResponse message, length delimited. Does not implicitly {@link figma_files.common.ErrorResponse.verify|verify} messages.
             * @param message ErrorResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: figma_files.common.IErrorResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an ErrorResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ErrorResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_files.common.ErrorResponse;

            /**
             * Decodes an ErrorResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ErrorResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_files.common.ErrorResponse;

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
            public static fromObject(object: { [k: string]: any }): figma_files.common.ErrorResponse;

            /**
             * Creates a plain object from an ErrorResponse message. Also converts values to other types if specified.
             * @param message ErrorResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: figma_files.common.ErrorResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            constructor(properties?: figma_files.common.ITimestamp);

            /** Timestamp iso8601. */
            public iso8601: string;

            /**
             * Creates a new Timestamp instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Timestamp instance
             */
            public static create(properties?: figma_files.common.ITimestamp): figma_files.common.Timestamp;

            /**
             * Encodes the specified Timestamp message. Does not implicitly {@link figma_files.common.Timestamp.verify|verify} messages.
             * @param message Timestamp message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: figma_files.common.ITimestamp, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Timestamp message, length delimited. Does not implicitly {@link figma_files.common.Timestamp.verify|verify} messages.
             * @param message Timestamp message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: figma_files.common.ITimestamp, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Timestamp message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_files.common.Timestamp;

            /**
             * Decodes a Timestamp message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_files.common.Timestamp;

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
            public static fromObject(object: { [k: string]: any }): figma_files.common.Timestamp;

            /**
             * Creates a plain object from a Timestamp message. Also converts values to other types if specified.
             * @param message Timestamp
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: figma_files.common.Timestamp, options?: $protobuf.IConversionOptions): { [k: string]: any };

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

    /** Namespace figma_file. */
    namespace figma_file {

        /** Properties of a FigmaFile. */
        interface IFigmaFile {

            /** FigmaFile id */
            id?: (string|null);

            /** FigmaFile name */
            name?: (string|null);

            /** FigmaFile description */
            description?: (string|null);

            /** FigmaFile type */
            type?: (figma_files.common.FigmaFileType|null);

            /** FigmaFile figmaUrl */
            figmaUrl?: (string|null);

            /** FigmaFile figmaFileKey */
            figmaFileKey?: (string|null);

            /** FigmaFile thumbnailUrl */
            thumbnailUrl?: (string|null);

            /** FigmaFile pageCount */
            pageCount?: (number|null);

            /** FigmaFile componentCount */
            componentCount?: (number|null);

            /** FigmaFile styleCount */
            styleCount?: (number|null);

            /** FigmaFile lastModifiedBy */
            lastModifiedBy?: (string|null);

            /** FigmaFile editorType */
            editorType?: (string|null);

            /** FigmaFile trending */
            trending?: (boolean|null);

            /** FigmaFile verified */
            verified?: (boolean|null);

            /** FigmaFile status */
            status?: (figma_files.common.FigmaFileStatus|null);

            /** FigmaFile source */
            source?: (figma_files.common.FigmaFileSource|null);

            /** FigmaFile externalIds */
            externalIds?: (figma_files.common.IExternalId[]|null);

            /** FigmaFile tags */
            tags?: (figma_files.tag.ITag[]|null);

            /** FigmaFile metadata */
            metadata?: (figma_files.metadata.IMetadata[]|null);

            /** FigmaFile createdAt */
            createdAt?: (figma_files.common.ITimestamp|null);

            /** FigmaFile updatedAt */
            updatedAt?: (figma_files.common.ITimestamp|null);
        }

        /** Represents a FigmaFile. */
        class FigmaFile implements IFigmaFile {

            /**
             * Constructs a new FigmaFile.
             * @param [properties] Properties to set
             */
            constructor(properties?: figma_files.figma_file.IFigmaFile);

            /** FigmaFile id. */
            public id: string;

            /** FigmaFile name. */
            public name: string;

            /** FigmaFile description. */
            public description: string;

            /** FigmaFile type. */
            public type: figma_files.common.FigmaFileType;

            /** FigmaFile figmaUrl. */
            public figmaUrl: string;

            /** FigmaFile figmaFileKey. */
            public figmaFileKey: string;

            /** FigmaFile thumbnailUrl. */
            public thumbnailUrl: string;

            /** FigmaFile pageCount. */
            public pageCount: number;

            /** FigmaFile componentCount. */
            public componentCount: number;

            /** FigmaFile styleCount. */
            public styleCount: number;

            /** FigmaFile lastModifiedBy. */
            public lastModifiedBy: string;

            /** FigmaFile editorType. */
            public editorType: string;

            /** FigmaFile trending. */
            public trending: boolean;

            /** FigmaFile verified. */
            public verified: boolean;

            /** FigmaFile status. */
            public status: figma_files.common.FigmaFileStatus;

            /** FigmaFile source. */
            public source: figma_files.common.FigmaFileSource;

            /** FigmaFile externalIds. */
            public externalIds: figma_files.common.IExternalId[];

            /** FigmaFile tags. */
            public tags: figma_files.tag.ITag[];

            /** FigmaFile metadata. */
            public metadata: figma_files.metadata.IMetadata[];

            /** FigmaFile createdAt. */
            public createdAt?: (figma_files.common.ITimestamp|null);

            /** FigmaFile updatedAt. */
            public updatedAt?: (figma_files.common.ITimestamp|null);

            /**
             * Creates a new FigmaFile instance using the specified properties.
             * @param [properties] Properties to set
             * @returns FigmaFile instance
             */
            public static create(properties?: figma_files.figma_file.IFigmaFile): figma_files.figma_file.FigmaFile;

            /**
             * Encodes the specified FigmaFile message. Does not implicitly {@link figma_files.figma_file.FigmaFile.verify|verify} messages.
             * @param message FigmaFile message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: figma_files.figma_file.IFigmaFile, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified FigmaFile message, length delimited. Does not implicitly {@link figma_files.figma_file.FigmaFile.verify|verify} messages.
             * @param message FigmaFile message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: figma_files.figma_file.IFigmaFile, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a FigmaFile message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns FigmaFile
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_files.figma_file.FigmaFile;

            /**
             * Decodes a FigmaFile message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns FigmaFile
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_files.figma_file.FigmaFile;

            /**
             * Verifies a FigmaFile message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a FigmaFile message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns FigmaFile
             */
            public static fromObject(object: { [k: string]: any }): figma_files.figma_file.FigmaFile;

            /**
             * Creates a plain object from a FigmaFile message. Also converts values to other types if specified.
             * @param message FigmaFile
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: figma_files.figma_file.FigmaFile, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this FigmaFile to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for FigmaFile
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a ListFigmaFilesRequest. */
        interface IListFigmaFilesRequest {

            /** ListFigmaFilesRequest pagination */
            pagination?: (figma_files.common.IPaginationRequest|null);

            /** ListFigmaFilesRequest type */
            type?: (figma_files.common.FigmaFileType|null);

            /** ListFigmaFilesRequest status */
            status?: (figma_files.common.FigmaFileStatus|null);

            /** ListFigmaFilesRequest search */
            search?: (string|null);

            /** ListFigmaFilesRequest tags */
            tags?: (string[]|null);

            /** ListFigmaFilesRequest trending */
            trending?: (boolean|null);

            /** ListFigmaFilesRequest verified */
            verified?: (boolean|null);

            /** ListFigmaFilesRequest includeTags */
            includeTags?: (boolean|null);

            /** ListFigmaFilesRequest includeMetadata */
            includeMetadata?: (boolean|null);
        }

        /** Represents a ListFigmaFilesRequest. */
        class ListFigmaFilesRequest implements IListFigmaFilesRequest {

            /**
             * Constructs a new ListFigmaFilesRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: figma_files.figma_file.IListFigmaFilesRequest);

            /** ListFigmaFilesRequest pagination. */
            public pagination?: (figma_files.common.IPaginationRequest|null);

            /** ListFigmaFilesRequest type. */
            public type: figma_files.common.FigmaFileType;

            /** ListFigmaFilesRequest status. */
            public status: figma_files.common.FigmaFileStatus;

            /** ListFigmaFilesRequest search. */
            public search: string;

            /** ListFigmaFilesRequest tags. */
            public tags: string[];

            /** ListFigmaFilesRequest trending. */
            public trending: boolean;

            /** ListFigmaFilesRequest verified. */
            public verified: boolean;

            /** ListFigmaFilesRequest includeTags. */
            public includeTags: boolean;

            /** ListFigmaFilesRequest includeMetadata. */
            public includeMetadata: boolean;

            /**
             * Creates a new ListFigmaFilesRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ListFigmaFilesRequest instance
             */
            public static create(properties?: figma_files.figma_file.IListFigmaFilesRequest): figma_files.figma_file.ListFigmaFilesRequest;

            /**
             * Encodes the specified ListFigmaFilesRequest message. Does not implicitly {@link figma_files.figma_file.ListFigmaFilesRequest.verify|verify} messages.
             * @param message ListFigmaFilesRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: figma_files.figma_file.IListFigmaFilesRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ListFigmaFilesRequest message, length delimited. Does not implicitly {@link figma_files.figma_file.ListFigmaFilesRequest.verify|verify} messages.
             * @param message ListFigmaFilesRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: figma_files.figma_file.IListFigmaFilesRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ListFigmaFilesRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ListFigmaFilesRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_files.figma_file.ListFigmaFilesRequest;

            /**
             * Decodes a ListFigmaFilesRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ListFigmaFilesRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_files.figma_file.ListFigmaFilesRequest;

            /**
             * Verifies a ListFigmaFilesRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ListFigmaFilesRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ListFigmaFilesRequest
             */
            public static fromObject(object: { [k: string]: any }): figma_files.figma_file.ListFigmaFilesRequest;

            /**
             * Creates a plain object from a ListFigmaFilesRequest message. Also converts values to other types if specified.
             * @param message ListFigmaFilesRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: figma_files.figma_file.ListFigmaFilesRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ListFigmaFilesRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for ListFigmaFilesRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a ListFigmaFilesResponse. */
        interface IListFigmaFilesResponse {

            /** ListFigmaFilesResponse figmaFiles */
            figmaFiles?: (figma_files.figma_file.IFigmaFile[]|null);

            /** ListFigmaFilesResponse pagination */
            pagination?: (figma_files.common.IPaginationResponse|null);
        }

        /** Represents a ListFigmaFilesResponse. */
        class ListFigmaFilesResponse implements IListFigmaFilesResponse {

            /**
             * Constructs a new ListFigmaFilesResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: figma_files.figma_file.IListFigmaFilesResponse);

            /** ListFigmaFilesResponse figmaFiles. */
            public figmaFiles: figma_files.figma_file.IFigmaFile[];

            /** ListFigmaFilesResponse pagination. */
            public pagination?: (figma_files.common.IPaginationResponse|null);

            /**
             * Creates a new ListFigmaFilesResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ListFigmaFilesResponse instance
             */
            public static create(properties?: figma_files.figma_file.IListFigmaFilesResponse): figma_files.figma_file.ListFigmaFilesResponse;

            /**
             * Encodes the specified ListFigmaFilesResponse message. Does not implicitly {@link figma_files.figma_file.ListFigmaFilesResponse.verify|verify} messages.
             * @param message ListFigmaFilesResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: figma_files.figma_file.IListFigmaFilesResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ListFigmaFilesResponse message, length delimited. Does not implicitly {@link figma_files.figma_file.ListFigmaFilesResponse.verify|verify} messages.
             * @param message ListFigmaFilesResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: figma_files.figma_file.IListFigmaFilesResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ListFigmaFilesResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ListFigmaFilesResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_files.figma_file.ListFigmaFilesResponse;

            /**
             * Decodes a ListFigmaFilesResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ListFigmaFilesResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_files.figma_file.ListFigmaFilesResponse;

            /**
             * Verifies a ListFigmaFilesResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ListFigmaFilesResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ListFigmaFilesResponse
             */
            public static fromObject(object: { [k: string]: any }): figma_files.figma_file.ListFigmaFilesResponse;

            /**
             * Creates a plain object from a ListFigmaFilesResponse message. Also converts values to other types if specified.
             * @param message ListFigmaFilesResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: figma_files.figma_file.ListFigmaFilesResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ListFigmaFilesResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for ListFigmaFilesResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a GetFigmaFileRequest. */
        interface IGetFigmaFileRequest {

            /** GetFigmaFileRequest id */
            id?: (string|null);

            /** GetFigmaFileRequest includeTags */
            includeTags?: (boolean|null);

            /** GetFigmaFileRequest includeMetadata */
            includeMetadata?: (boolean|null);
        }

        /** Represents a GetFigmaFileRequest. */
        class GetFigmaFileRequest implements IGetFigmaFileRequest {

            /**
             * Constructs a new GetFigmaFileRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: figma_files.figma_file.IGetFigmaFileRequest);

            /** GetFigmaFileRequest id. */
            public id: string;

            /** GetFigmaFileRequest includeTags. */
            public includeTags: boolean;

            /** GetFigmaFileRequest includeMetadata. */
            public includeMetadata: boolean;

            /**
             * Creates a new GetFigmaFileRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns GetFigmaFileRequest instance
             */
            public static create(properties?: figma_files.figma_file.IGetFigmaFileRequest): figma_files.figma_file.GetFigmaFileRequest;

            /**
             * Encodes the specified GetFigmaFileRequest message. Does not implicitly {@link figma_files.figma_file.GetFigmaFileRequest.verify|verify} messages.
             * @param message GetFigmaFileRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: figma_files.figma_file.IGetFigmaFileRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified GetFigmaFileRequest message, length delimited. Does not implicitly {@link figma_files.figma_file.GetFigmaFileRequest.verify|verify} messages.
             * @param message GetFigmaFileRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: figma_files.figma_file.IGetFigmaFileRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a GetFigmaFileRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns GetFigmaFileRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_files.figma_file.GetFigmaFileRequest;

            /**
             * Decodes a GetFigmaFileRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns GetFigmaFileRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_files.figma_file.GetFigmaFileRequest;

            /**
             * Verifies a GetFigmaFileRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a GetFigmaFileRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns GetFigmaFileRequest
             */
            public static fromObject(object: { [k: string]: any }): figma_files.figma_file.GetFigmaFileRequest;

            /**
             * Creates a plain object from a GetFigmaFileRequest message. Also converts values to other types if specified.
             * @param message GetFigmaFileRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: figma_files.figma_file.GetFigmaFileRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this GetFigmaFileRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for GetFigmaFileRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a GetFigmaFileResponse. */
        interface IGetFigmaFileResponse {

            /** GetFigmaFileResponse figmaFile */
            figmaFile?: (figma_files.figma_file.IFigmaFile|null);
        }

        /** Represents a GetFigmaFileResponse. */
        class GetFigmaFileResponse implements IGetFigmaFileResponse {

            /**
             * Constructs a new GetFigmaFileResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: figma_files.figma_file.IGetFigmaFileResponse);

            /** GetFigmaFileResponse figmaFile. */
            public figmaFile?: (figma_files.figma_file.IFigmaFile|null);

            /**
             * Creates a new GetFigmaFileResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns GetFigmaFileResponse instance
             */
            public static create(properties?: figma_files.figma_file.IGetFigmaFileResponse): figma_files.figma_file.GetFigmaFileResponse;

            /**
             * Encodes the specified GetFigmaFileResponse message. Does not implicitly {@link figma_files.figma_file.GetFigmaFileResponse.verify|verify} messages.
             * @param message GetFigmaFileResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: figma_files.figma_file.IGetFigmaFileResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified GetFigmaFileResponse message, length delimited. Does not implicitly {@link figma_files.figma_file.GetFigmaFileResponse.verify|verify} messages.
             * @param message GetFigmaFileResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: figma_files.figma_file.IGetFigmaFileResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a GetFigmaFileResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns GetFigmaFileResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_files.figma_file.GetFigmaFileResponse;

            /**
             * Decodes a GetFigmaFileResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns GetFigmaFileResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_files.figma_file.GetFigmaFileResponse;

            /**
             * Verifies a GetFigmaFileResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a GetFigmaFileResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns GetFigmaFileResponse
             */
            public static fromObject(object: { [k: string]: any }): figma_files.figma_file.GetFigmaFileResponse;

            /**
             * Creates a plain object from a GetFigmaFileResponse message. Also converts values to other types if specified.
             * @param message GetFigmaFileResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: figma_files.figma_file.GetFigmaFileResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this GetFigmaFileResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for GetFigmaFileResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a CreateFigmaFileRequest. */
        interface ICreateFigmaFileRequest {

            /** CreateFigmaFileRequest name */
            name?: (string|null);

            /** CreateFigmaFileRequest description */
            description?: (string|null);

            /** CreateFigmaFileRequest type */
            type?: (figma_files.common.FigmaFileType|null);

            /** CreateFigmaFileRequest figmaUrl */
            figmaUrl?: (string|null);

            /** CreateFigmaFileRequest figmaFileKey */
            figmaFileKey?: (string|null);

            /** CreateFigmaFileRequest thumbnailUrl */
            thumbnailUrl?: (string|null);

            /** CreateFigmaFileRequest pageCount */
            pageCount?: (number|null);

            /** CreateFigmaFileRequest componentCount */
            componentCount?: (number|null);

            /** CreateFigmaFileRequest styleCount */
            styleCount?: (number|null);

            /** CreateFigmaFileRequest lastModifiedBy */
            lastModifiedBy?: (string|null);

            /** CreateFigmaFileRequest editorType */
            editorType?: (string|null);

            /** CreateFigmaFileRequest trending */
            trending?: (boolean|null);

            /** CreateFigmaFileRequest verified */
            verified?: (boolean|null);

            /** CreateFigmaFileRequest status */
            status?: (figma_files.common.FigmaFileStatus|null);

            /** CreateFigmaFileRequest source */
            source?: (figma_files.common.FigmaFileSource|null);

            /** CreateFigmaFileRequest externalIds */
            externalIds?: (figma_files.common.IExternalId[]|null);

            /** CreateFigmaFileRequest tagNames */
            tagNames?: (string[]|null);
        }

        /** Represents a CreateFigmaFileRequest. */
        class CreateFigmaFileRequest implements ICreateFigmaFileRequest {

            /**
             * Constructs a new CreateFigmaFileRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: figma_files.figma_file.ICreateFigmaFileRequest);

            /** CreateFigmaFileRequest name. */
            public name: string;

            /** CreateFigmaFileRequest description. */
            public description: string;

            /** CreateFigmaFileRequest type. */
            public type: figma_files.common.FigmaFileType;

            /** CreateFigmaFileRequest figmaUrl. */
            public figmaUrl: string;

            /** CreateFigmaFileRequest figmaFileKey. */
            public figmaFileKey: string;

            /** CreateFigmaFileRequest thumbnailUrl. */
            public thumbnailUrl: string;

            /** CreateFigmaFileRequest pageCount. */
            public pageCount: number;

            /** CreateFigmaFileRequest componentCount. */
            public componentCount: number;

            /** CreateFigmaFileRequest styleCount. */
            public styleCount: number;

            /** CreateFigmaFileRequest lastModifiedBy. */
            public lastModifiedBy: string;

            /** CreateFigmaFileRequest editorType. */
            public editorType: string;

            /** CreateFigmaFileRequest trending. */
            public trending: boolean;

            /** CreateFigmaFileRequest verified. */
            public verified: boolean;

            /** CreateFigmaFileRequest status. */
            public status: figma_files.common.FigmaFileStatus;

            /** CreateFigmaFileRequest source. */
            public source: figma_files.common.FigmaFileSource;

            /** CreateFigmaFileRequest externalIds. */
            public externalIds: figma_files.common.IExternalId[];

            /** CreateFigmaFileRequest tagNames. */
            public tagNames: string[];

            /**
             * Creates a new CreateFigmaFileRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns CreateFigmaFileRequest instance
             */
            public static create(properties?: figma_files.figma_file.ICreateFigmaFileRequest): figma_files.figma_file.CreateFigmaFileRequest;

            /**
             * Encodes the specified CreateFigmaFileRequest message. Does not implicitly {@link figma_files.figma_file.CreateFigmaFileRequest.verify|verify} messages.
             * @param message CreateFigmaFileRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: figma_files.figma_file.ICreateFigmaFileRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified CreateFigmaFileRequest message, length delimited. Does not implicitly {@link figma_files.figma_file.CreateFigmaFileRequest.verify|verify} messages.
             * @param message CreateFigmaFileRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: figma_files.figma_file.ICreateFigmaFileRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a CreateFigmaFileRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns CreateFigmaFileRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_files.figma_file.CreateFigmaFileRequest;

            /**
             * Decodes a CreateFigmaFileRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns CreateFigmaFileRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_files.figma_file.CreateFigmaFileRequest;

            /**
             * Verifies a CreateFigmaFileRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a CreateFigmaFileRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns CreateFigmaFileRequest
             */
            public static fromObject(object: { [k: string]: any }): figma_files.figma_file.CreateFigmaFileRequest;

            /**
             * Creates a plain object from a CreateFigmaFileRequest message. Also converts values to other types if specified.
             * @param message CreateFigmaFileRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: figma_files.figma_file.CreateFigmaFileRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this CreateFigmaFileRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for CreateFigmaFileRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a CreateFigmaFileResponse. */
        interface ICreateFigmaFileResponse {

            /** CreateFigmaFileResponse figmaFile */
            figmaFile?: (figma_files.figma_file.IFigmaFile|null);
        }

        /** Represents a CreateFigmaFileResponse. */
        class CreateFigmaFileResponse implements ICreateFigmaFileResponse {

            /**
             * Constructs a new CreateFigmaFileResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: figma_files.figma_file.ICreateFigmaFileResponse);

            /** CreateFigmaFileResponse figmaFile. */
            public figmaFile?: (figma_files.figma_file.IFigmaFile|null);

            /**
             * Creates a new CreateFigmaFileResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns CreateFigmaFileResponse instance
             */
            public static create(properties?: figma_files.figma_file.ICreateFigmaFileResponse): figma_files.figma_file.CreateFigmaFileResponse;

            /**
             * Encodes the specified CreateFigmaFileResponse message. Does not implicitly {@link figma_files.figma_file.CreateFigmaFileResponse.verify|verify} messages.
             * @param message CreateFigmaFileResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: figma_files.figma_file.ICreateFigmaFileResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified CreateFigmaFileResponse message, length delimited. Does not implicitly {@link figma_files.figma_file.CreateFigmaFileResponse.verify|verify} messages.
             * @param message CreateFigmaFileResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: figma_files.figma_file.ICreateFigmaFileResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a CreateFigmaFileResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns CreateFigmaFileResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_files.figma_file.CreateFigmaFileResponse;

            /**
             * Decodes a CreateFigmaFileResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns CreateFigmaFileResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_files.figma_file.CreateFigmaFileResponse;

            /**
             * Verifies a CreateFigmaFileResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a CreateFigmaFileResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns CreateFigmaFileResponse
             */
            public static fromObject(object: { [k: string]: any }): figma_files.figma_file.CreateFigmaFileResponse;

            /**
             * Creates a plain object from a CreateFigmaFileResponse message. Also converts values to other types if specified.
             * @param message CreateFigmaFileResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: figma_files.figma_file.CreateFigmaFileResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this CreateFigmaFileResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for CreateFigmaFileResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an UpdateFigmaFileRequest. */
        interface IUpdateFigmaFileRequest {

            /** UpdateFigmaFileRequest id */
            id?: (string|null);

            /** UpdateFigmaFileRequest name */
            name?: (string|null);

            /** UpdateFigmaFileRequest description */
            description?: (string|null);

            /** UpdateFigmaFileRequest type */
            type?: (figma_files.common.FigmaFileType|null);

            /** UpdateFigmaFileRequest figmaUrl */
            figmaUrl?: (string|null);

            /** UpdateFigmaFileRequest figmaFileKey */
            figmaFileKey?: (string|null);

            /** UpdateFigmaFileRequest thumbnailUrl */
            thumbnailUrl?: (string|null);

            /** UpdateFigmaFileRequest pageCount */
            pageCount?: (number|null);

            /** UpdateFigmaFileRequest componentCount */
            componentCount?: (number|null);

            /** UpdateFigmaFileRequest styleCount */
            styleCount?: (number|null);

            /** UpdateFigmaFileRequest lastModifiedBy */
            lastModifiedBy?: (string|null);

            /** UpdateFigmaFileRequest editorType */
            editorType?: (string|null);

            /** UpdateFigmaFileRequest trending */
            trending?: (boolean|null);

            /** UpdateFigmaFileRequest verified */
            verified?: (boolean|null);

            /** UpdateFigmaFileRequest status */
            status?: (figma_files.common.FigmaFileStatus|null);

            /** UpdateFigmaFileRequest source */
            source?: (figma_files.common.FigmaFileSource|null);

            /** UpdateFigmaFileRequest externalIds */
            externalIds?: (figma_files.common.IExternalId[]|null);

            /** UpdateFigmaFileRequest tagNames */
            tagNames?: (string[]|null);
        }

        /** Represents an UpdateFigmaFileRequest. */
        class UpdateFigmaFileRequest implements IUpdateFigmaFileRequest {

            /**
             * Constructs a new UpdateFigmaFileRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: figma_files.figma_file.IUpdateFigmaFileRequest);

            /** UpdateFigmaFileRequest id. */
            public id: string;

            /** UpdateFigmaFileRequest name. */
            public name: string;

            /** UpdateFigmaFileRequest description. */
            public description: string;

            /** UpdateFigmaFileRequest type. */
            public type: figma_files.common.FigmaFileType;

            /** UpdateFigmaFileRequest figmaUrl. */
            public figmaUrl: string;

            /** UpdateFigmaFileRequest figmaFileKey. */
            public figmaFileKey: string;

            /** UpdateFigmaFileRequest thumbnailUrl. */
            public thumbnailUrl: string;

            /** UpdateFigmaFileRequest pageCount. */
            public pageCount: number;

            /** UpdateFigmaFileRequest componentCount. */
            public componentCount: number;

            /** UpdateFigmaFileRequest styleCount. */
            public styleCount: number;

            /** UpdateFigmaFileRequest lastModifiedBy. */
            public lastModifiedBy: string;

            /** UpdateFigmaFileRequest editorType. */
            public editorType: string;

            /** UpdateFigmaFileRequest trending. */
            public trending: boolean;

            /** UpdateFigmaFileRequest verified. */
            public verified: boolean;

            /** UpdateFigmaFileRequest status. */
            public status: figma_files.common.FigmaFileStatus;

            /** UpdateFigmaFileRequest source. */
            public source: figma_files.common.FigmaFileSource;

            /** UpdateFigmaFileRequest externalIds. */
            public externalIds: figma_files.common.IExternalId[];

            /** UpdateFigmaFileRequest tagNames. */
            public tagNames: string[];

            /**
             * Creates a new UpdateFigmaFileRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns UpdateFigmaFileRequest instance
             */
            public static create(properties?: figma_files.figma_file.IUpdateFigmaFileRequest): figma_files.figma_file.UpdateFigmaFileRequest;

            /**
             * Encodes the specified UpdateFigmaFileRequest message. Does not implicitly {@link figma_files.figma_file.UpdateFigmaFileRequest.verify|verify} messages.
             * @param message UpdateFigmaFileRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: figma_files.figma_file.IUpdateFigmaFileRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified UpdateFigmaFileRequest message, length delimited. Does not implicitly {@link figma_files.figma_file.UpdateFigmaFileRequest.verify|verify} messages.
             * @param message UpdateFigmaFileRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: figma_files.figma_file.IUpdateFigmaFileRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an UpdateFigmaFileRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns UpdateFigmaFileRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_files.figma_file.UpdateFigmaFileRequest;

            /**
             * Decodes an UpdateFigmaFileRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns UpdateFigmaFileRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_files.figma_file.UpdateFigmaFileRequest;

            /**
             * Verifies an UpdateFigmaFileRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an UpdateFigmaFileRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns UpdateFigmaFileRequest
             */
            public static fromObject(object: { [k: string]: any }): figma_files.figma_file.UpdateFigmaFileRequest;

            /**
             * Creates a plain object from an UpdateFigmaFileRequest message. Also converts values to other types if specified.
             * @param message UpdateFigmaFileRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: figma_files.figma_file.UpdateFigmaFileRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this UpdateFigmaFileRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for UpdateFigmaFileRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an UpdateFigmaFileResponse. */
        interface IUpdateFigmaFileResponse {

            /** UpdateFigmaFileResponse figmaFile */
            figmaFile?: (figma_files.figma_file.IFigmaFile|null);
        }

        /** Represents an UpdateFigmaFileResponse. */
        class UpdateFigmaFileResponse implements IUpdateFigmaFileResponse {

            /**
             * Constructs a new UpdateFigmaFileResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: figma_files.figma_file.IUpdateFigmaFileResponse);

            /** UpdateFigmaFileResponse figmaFile. */
            public figmaFile?: (figma_files.figma_file.IFigmaFile|null);

            /**
             * Creates a new UpdateFigmaFileResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns UpdateFigmaFileResponse instance
             */
            public static create(properties?: figma_files.figma_file.IUpdateFigmaFileResponse): figma_files.figma_file.UpdateFigmaFileResponse;

            /**
             * Encodes the specified UpdateFigmaFileResponse message. Does not implicitly {@link figma_files.figma_file.UpdateFigmaFileResponse.verify|verify} messages.
             * @param message UpdateFigmaFileResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: figma_files.figma_file.IUpdateFigmaFileResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified UpdateFigmaFileResponse message, length delimited. Does not implicitly {@link figma_files.figma_file.UpdateFigmaFileResponse.verify|verify} messages.
             * @param message UpdateFigmaFileResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: figma_files.figma_file.IUpdateFigmaFileResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an UpdateFigmaFileResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns UpdateFigmaFileResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_files.figma_file.UpdateFigmaFileResponse;

            /**
             * Decodes an UpdateFigmaFileResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns UpdateFigmaFileResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_files.figma_file.UpdateFigmaFileResponse;

            /**
             * Verifies an UpdateFigmaFileResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an UpdateFigmaFileResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns UpdateFigmaFileResponse
             */
            public static fromObject(object: { [k: string]: any }): figma_files.figma_file.UpdateFigmaFileResponse;

            /**
             * Creates a plain object from an UpdateFigmaFileResponse message. Also converts values to other types if specified.
             * @param message UpdateFigmaFileResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: figma_files.figma_file.UpdateFigmaFileResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this UpdateFigmaFileResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for UpdateFigmaFileResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a DeleteFigmaFileRequest. */
        interface IDeleteFigmaFileRequest {

            /** DeleteFigmaFileRequest id */
            id?: (string|null);
        }

        /** Represents a DeleteFigmaFileRequest. */
        class DeleteFigmaFileRequest implements IDeleteFigmaFileRequest {

            /**
             * Constructs a new DeleteFigmaFileRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: figma_files.figma_file.IDeleteFigmaFileRequest);

            /** DeleteFigmaFileRequest id. */
            public id: string;

            /**
             * Creates a new DeleteFigmaFileRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns DeleteFigmaFileRequest instance
             */
            public static create(properties?: figma_files.figma_file.IDeleteFigmaFileRequest): figma_files.figma_file.DeleteFigmaFileRequest;

            /**
             * Encodes the specified DeleteFigmaFileRequest message. Does not implicitly {@link figma_files.figma_file.DeleteFigmaFileRequest.verify|verify} messages.
             * @param message DeleteFigmaFileRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: figma_files.figma_file.IDeleteFigmaFileRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified DeleteFigmaFileRequest message, length delimited. Does not implicitly {@link figma_files.figma_file.DeleteFigmaFileRequest.verify|verify} messages.
             * @param message DeleteFigmaFileRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: figma_files.figma_file.IDeleteFigmaFileRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DeleteFigmaFileRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns DeleteFigmaFileRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_files.figma_file.DeleteFigmaFileRequest;

            /**
             * Decodes a DeleteFigmaFileRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns DeleteFigmaFileRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_files.figma_file.DeleteFigmaFileRequest;

            /**
             * Verifies a DeleteFigmaFileRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a DeleteFigmaFileRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns DeleteFigmaFileRequest
             */
            public static fromObject(object: { [k: string]: any }): figma_files.figma_file.DeleteFigmaFileRequest;

            /**
             * Creates a plain object from a DeleteFigmaFileRequest message. Also converts values to other types if specified.
             * @param message DeleteFigmaFileRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: figma_files.figma_file.DeleteFigmaFileRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this DeleteFigmaFileRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for DeleteFigmaFileRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a DeleteFigmaFileResponse. */
        interface IDeleteFigmaFileResponse {

            /** DeleteFigmaFileResponse success */
            success?: (boolean|null);
        }

        /** Represents a DeleteFigmaFileResponse. */
        class DeleteFigmaFileResponse implements IDeleteFigmaFileResponse {

            /**
             * Constructs a new DeleteFigmaFileResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: figma_files.figma_file.IDeleteFigmaFileResponse);

            /** DeleteFigmaFileResponse success. */
            public success: boolean;

            /**
             * Creates a new DeleteFigmaFileResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns DeleteFigmaFileResponse instance
             */
            public static create(properties?: figma_files.figma_file.IDeleteFigmaFileResponse): figma_files.figma_file.DeleteFigmaFileResponse;

            /**
             * Encodes the specified DeleteFigmaFileResponse message. Does not implicitly {@link figma_files.figma_file.DeleteFigmaFileResponse.verify|verify} messages.
             * @param message DeleteFigmaFileResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: figma_files.figma_file.IDeleteFigmaFileResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified DeleteFigmaFileResponse message, length delimited. Does not implicitly {@link figma_files.figma_file.DeleteFigmaFileResponse.verify|verify} messages.
             * @param message DeleteFigmaFileResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: figma_files.figma_file.IDeleteFigmaFileResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DeleteFigmaFileResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns DeleteFigmaFileResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_files.figma_file.DeleteFigmaFileResponse;

            /**
             * Decodes a DeleteFigmaFileResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns DeleteFigmaFileResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_files.figma_file.DeleteFigmaFileResponse;

            /**
             * Verifies a DeleteFigmaFileResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a DeleteFigmaFileResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns DeleteFigmaFileResponse
             */
            public static fromObject(object: { [k: string]: any }): figma_files.figma_file.DeleteFigmaFileResponse;

            /**
             * Creates a plain object from a DeleteFigmaFileResponse message. Also converts values to other types if specified.
             * @param message DeleteFigmaFileResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: figma_files.figma_file.DeleteFigmaFileResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this DeleteFigmaFileResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for DeleteFigmaFileResponse
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
            id?: (number|null);

            /** Tag name */
            name?: (string|null);

            /** Tag createdAt */
            createdAt?: (figma_files.common.ITimestamp|null);

            /** Tag updatedAt */
            updatedAt?: (figma_files.common.ITimestamp|null);
        }

        /** Represents a Tag. */
        class Tag implements ITag {

            /**
             * Constructs a new Tag.
             * @param [properties] Properties to set
             */
            constructor(properties?: figma_files.tag.ITag);

            /** Tag id. */
            public id: number;

            /** Tag name. */
            public name: string;

            /** Tag createdAt. */
            public createdAt?: (figma_files.common.ITimestamp|null);

            /** Tag updatedAt. */
            public updatedAt?: (figma_files.common.ITimestamp|null);

            /**
             * Creates a new Tag instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Tag instance
             */
            public static create(properties?: figma_files.tag.ITag): figma_files.tag.Tag;

            /**
             * Encodes the specified Tag message. Does not implicitly {@link figma_files.tag.Tag.verify|verify} messages.
             * @param message Tag message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: figma_files.tag.ITag, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Tag message, length delimited. Does not implicitly {@link figma_files.tag.Tag.verify|verify} messages.
             * @param message Tag message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: figma_files.tag.ITag, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Tag message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Tag
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_files.tag.Tag;

            /**
             * Decodes a Tag message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Tag
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_files.tag.Tag;

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
            public static fromObject(object: { [k: string]: any }): figma_files.tag.Tag;

            /**
             * Creates a plain object from a Tag message. Also converts values to other types if specified.
             * @param message Tag
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: figma_files.tag.Tag, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            tags?: (figma_files.tag.ITag[]|null);
        }

        /** Represents a TagListResponse. */
        class TagListResponse implements ITagListResponse {

            /**
             * Constructs a new TagListResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: figma_files.tag.ITagListResponse);

            /** TagListResponse tags. */
            public tags: figma_files.tag.ITag[];

            /**
             * Creates a new TagListResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns TagListResponse instance
             */
            public static create(properties?: figma_files.tag.ITagListResponse): figma_files.tag.TagListResponse;

            /**
             * Encodes the specified TagListResponse message. Does not implicitly {@link figma_files.tag.TagListResponse.verify|verify} messages.
             * @param message TagListResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: figma_files.tag.ITagListResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified TagListResponse message, length delimited. Does not implicitly {@link figma_files.tag.TagListResponse.verify|verify} messages.
             * @param message TagListResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: figma_files.tag.ITagListResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a TagListResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns TagListResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_files.tag.TagListResponse;

            /**
             * Decodes a TagListResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns TagListResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_files.tag.TagListResponse;

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
            public static fromObject(object: { [k: string]: any }): figma_files.tag.TagListResponse;

            /**
             * Creates a plain object from a TagListResponse message. Also converts values to other types if specified.
             * @param message TagListResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: figma_files.tag.TagListResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
        }

        /** Represents a CreateTagRequest. */
        class CreateTagRequest implements ICreateTagRequest {

            /**
             * Constructs a new CreateTagRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: figma_files.tag.ICreateTagRequest);

            /** CreateTagRequest name. */
            public name: string;

            /**
             * Creates a new CreateTagRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns CreateTagRequest instance
             */
            public static create(properties?: figma_files.tag.ICreateTagRequest): figma_files.tag.CreateTagRequest;

            /**
             * Encodes the specified CreateTagRequest message. Does not implicitly {@link figma_files.tag.CreateTagRequest.verify|verify} messages.
             * @param message CreateTagRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: figma_files.tag.ICreateTagRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified CreateTagRequest message, length delimited. Does not implicitly {@link figma_files.tag.CreateTagRequest.verify|verify} messages.
             * @param message CreateTagRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: figma_files.tag.ICreateTagRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a CreateTagRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns CreateTagRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_files.tag.CreateTagRequest;

            /**
             * Decodes a CreateTagRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns CreateTagRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_files.tag.CreateTagRequest;

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
            public static fromObject(object: { [k: string]: any }): figma_files.tag.CreateTagRequest;

            /**
             * Creates a plain object from a CreateTagRequest message. Also converts values to other types if specified.
             * @param message CreateTagRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: figma_files.tag.CreateTagRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            tag?: (figma_files.tag.ITag|null);
        }

        /** Represents a CreateTagResponse. */
        class CreateTagResponse implements ICreateTagResponse {

            /**
             * Constructs a new CreateTagResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: figma_files.tag.ICreateTagResponse);

            /** CreateTagResponse tag. */
            public tag?: (figma_files.tag.ITag|null);

            /**
             * Creates a new CreateTagResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns CreateTagResponse instance
             */
            public static create(properties?: figma_files.tag.ICreateTagResponse): figma_files.tag.CreateTagResponse;

            /**
             * Encodes the specified CreateTagResponse message. Does not implicitly {@link figma_files.tag.CreateTagResponse.verify|verify} messages.
             * @param message CreateTagResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: figma_files.tag.ICreateTagResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified CreateTagResponse message, length delimited. Does not implicitly {@link figma_files.tag.CreateTagResponse.verify|verify} messages.
             * @param message CreateTagResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: figma_files.tag.ICreateTagResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a CreateTagResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns CreateTagResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_files.tag.CreateTagResponse;

            /**
             * Decodes a CreateTagResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns CreateTagResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_files.tag.CreateTagResponse;

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
            public static fromObject(object: { [k: string]: any }): figma_files.tag.CreateTagResponse;

            /**
             * Creates a plain object from a CreateTagResponse message. Also converts values to other types if specified.
             * @param message CreateTagResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: figma_files.tag.CreateTagResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            id?: (number|null);

            /** UpdateTagRequest name */
            name?: (string|null);
        }

        /** Represents an UpdateTagRequest. */
        class UpdateTagRequest implements IUpdateTagRequest {

            /**
             * Constructs a new UpdateTagRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: figma_files.tag.IUpdateTagRequest);

            /** UpdateTagRequest id. */
            public id: number;

            /** UpdateTagRequest name. */
            public name: string;

            /**
             * Creates a new UpdateTagRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns UpdateTagRequest instance
             */
            public static create(properties?: figma_files.tag.IUpdateTagRequest): figma_files.tag.UpdateTagRequest;

            /**
             * Encodes the specified UpdateTagRequest message. Does not implicitly {@link figma_files.tag.UpdateTagRequest.verify|verify} messages.
             * @param message UpdateTagRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: figma_files.tag.IUpdateTagRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified UpdateTagRequest message, length delimited. Does not implicitly {@link figma_files.tag.UpdateTagRequest.verify|verify} messages.
             * @param message UpdateTagRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: figma_files.tag.IUpdateTagRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an UpdateTagRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns UpdateTagRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_files.tag.UpdateTagRequest;

            /**
             * Decodes an UpdateTagRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns UpdateTagRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_files.tag.UpdateTagRequest;

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
            public static fromObject(object: { [k: string]: any }): figma_files.tag.UpdateTagRequest;

            /**
             * Creates a plain object from an UpdateTagRequest message. Also converts values to other types if specified.
             * @param message UpdateTagRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: figma_files.tag.UpdateTagRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            tag?: (figma_files.tag.ITag|null);
        }

        /** Represents an UpdateTagResponse. */
        class UpdateTagResponse implements IUpdateTagResponse {

            /**
             * Constructs a new UpdateTagResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: figma_files.tag.IUpdateTagResponse);

            /** UpdateTagResponse tag. */
            public tag?: (figma_files.tag.ITag|null);

            /**
             * Creates a new UpdateTagResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns UpdateTagResponse instance
             */
            public static create(properties?: figma_files.tag.IUpdateTagResponse): figma_files.tag.UpdateTagResponse;

            /**
             * Encodes the specified UpdateTagResponse message. Does not implicitly {@link figma_files.tag.UpdateTagResponse.verify|verify} messages.
             * @param message UpdateTagResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: figma_files.tag.IUpdateTagResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified UpdateTagResponse message, length delimited. Does not implicitly {@link figma_files.tag.UpdateTagResponse.verify|verify} messages.
             * @param message UpdateTagResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: figma_files.tag.IUpdateTagResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an UpdateTagResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns UpdateTagResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_files.tag.UpdateTagResponse;

            /**
             * Decodes an UpdateTagResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns UpdateTagResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_files.tag.UpdateTagResponse;

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
            public static fromObject(object: { [k: string]: any }): figma_files.tag.UpdateTagResponse;

            /**
             * Creates a plain object from an UpdateTagResponse message. Also converts values to other types if specified.
             * @param message UpdateTagResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: figma_files.tag.UpdateTagResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            id?: (number|null);
        }

        /** Represents a GetTagRequest. */
        class GetTagRequest implements IGetTagRequest {

            /**
             * Constructs a new GetTagRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: figma_files.tag.IGetTagRequest);

            /** GetTagRequest id. */
            public id: number;

            /**
             * Creates a new GetTagRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns GetTagRequest instance
             */
            public static create(properties?: figma_files.tag.IGetTagRequest): figma_files.tag.GetTagRequest;

            /**
             * Encodes the specified GetTagRequest message. Does not implicitly {@link figma_files.tag.GetTagRequest.verify|verify} messages.
             * @param message GetTagRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: figma_files.tag.IGetTagRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified GetTagRequest message, length delimited. Does not implicitly {@link figma_files.tag.GetTagRequest.verify|verify} messages.
             * @param message GetTagRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: figma_files.tag.IGetTagRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a GetTagRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns GetTagRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_files.tag.GetTagRequest;

            /**
             * Decodes a GetTagRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns GetTagRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_files.tag.GetTagRequest;

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
            public static fromObject(object: { [k: string]: any }): figma_files.tag.GetTagRequest;

            /**
             * Creates a plain object from a GetTagRequest message. Also converts values to other types if specified.
             * @param message GetTagRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: figma_files.tag.GetTagRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            tag?: (figma_files.tag.ITag|null);
        }

        /** Represents a GetTagResponse. */
        class GetTagResponse implements IGetTagResponse {

            /**
             * Constructs a new GetTagResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: figma_files.tag.IGetTagResponse);

            /** GetTagResponse tag. */
            public tag?: (figma_files.tag.ITag|null);

            /**
             * Creates a new GetTagResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns GetTagResponse instance
             */
            public static create(properties?: figma_files.tag.IGetTagResponse): figma_files.tag.GetTagResponse;

            /**
             * Encodes the specified GetTagResponse message. Does not implicitly {@link figma_files.tag.GetTagResponse.verify|verify} messages.
             * @param message GetTagResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: figma_files.tag.IGetTagResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified GetTagResponse message, length delimited. Does not implicitly {@link figma_files.tag.GetTagResponse.verify|verify} messages.
             * @param message GetTagResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: figma_files.tag.IGetTagResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a GetTagResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns GetTagResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_files.tag.GetTagResponse;

            /**
             * Decodes a GetTagResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns GetTagResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_files.tag.GetTagResponse;

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
            public static fromObject(object: { [k: string]: any }): figma_files.tag.GetTagResponse;

            /**
             * Creates a plain object from a GetTagResponse message. Also converts values to other types if specified.
             * @param message GetTagResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: figma_files.tag.GetTagResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            id?: (number|null);
        }

        /** Represents a DeleteTagRequest. */
        class DeleteTagRequest implements IDeleteTagRequest {

            /**
             * Constructs a new DeleteTagRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: figma_files.tag.IDeleteTagRequest);

            /** DeleteTagRequest id. */
            public id: number;

            /**
             * Creates a new DeleteTagRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns DeleteTagRequest instance
             */
            public static create(properties?: figma_files.tag.IDeleteTagRequest): figma_files.tag.DeleteTagRequest;

            /**
             * Encodes the specified DeleteTagRequest message. Does not implicitly {@link figma_files.tag.DeleteTagRequest.verify|verify} messages.
             * @param message DeleteTagRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: figma_files.tag.IDeleteTagRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified DeleteTagRequest message, length delimited. Does not implicitly {@link figma_files.tag.DeleteTagRequest.verify|verify} messages.
             * @param message DeleteTagRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: figma_files.tag.IDeleteTagRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DeleteTagRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns DeleteTagRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_files.tag.DeleteTagRequest;

            /**
             * Decodes a DeleteTagRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns DeleteTagRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_files.tag.DeleteTagRequest;

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
            public static fromObject(object: { [k: string]: any }): figma_files.tag.DeleteTagRequest;

            /**
             * Creates a plain object from a DeleteTagRequest message. Also converts values to other types if specified.
             * @param message DeleteTagRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: figma_files.tag.DeleteTagRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            constructor(properties?: figma_files.tag.IDeleteTagResponse);

            /** DeleteTagResponse success. */
            public success: boolean;

            /**
             * Creates a new DeleteTagResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns DeleteTagResponse instance
             */
            public static create(properties?: figma_files.tag.IDeleteTagResponse): figma_files.tag.DeleteTagResponse;

            /**
             * Encodes the specified DeleteTagResponse message. Does not implicitly {@link figma_files.tag.DeleteTagResponse.verify|verify} messages.
             * @param message DeleteTagResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: figma_files.tag.IDeleteTagResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified DeleteTagResponse message, length delimited. Does not implicitly {@link figma_files.tag.DeleteTagResponse.verify|verify} messages.
             * @param message DeleteTagResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: figma_files.tag.IDeleteTagResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DeleteTagResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns DeleteTagResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_files.tag.DeleteTagResponse;

            /**
             * Decodes a DeleteTagResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns DeleteTagResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_files.tag.DeleteTagResponse;

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
            public static fromObject(object: { [k: string]: any }): figma_files.tag.DeleteTagResponse;

            /**
             * Creates a plain object from a DeleteTagResponse message. Also converts values to other types if specified.
             * @param message DeleteTagResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: figma_files.tag.DeleteTagResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

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

    /** Namespace metadata. */
    namespace metadata {

        /** Properties of a Metadata. */
        interface IMetadata {

            /** Metadata id */
            id?: (number|null);

            /** Metadata name */
            name?: (string|null);

            /** Metadata contentType */
            contentType?: (string|null);

            /** Metadata sourceUrl */
            sourceUrl?: (string|null);

            /** Metadata sourceHashId */
            sourceHashId?: (string|null);

            /** Metadata labels */
            labels?: (string[]|null);

            /** Metadata figmaFileId */
            figmaFileId?: (string|null);

            /** Metadata createdAt */
            createdAt?: (figma_files.common.ITimestamp|null);

            /** Metadata updatedAt */
            updatedAt?: (figma_files.common.ITimestamp|null);
        }

        /** Represents a Metadata. */
        class Metadata implements IMetadata {

            /**
             * Constructs a new Metadata.
             * @param [properties] Properties to set
             */
            constructor(properties?: figma_files.metadata.IMetadata);

            /** Metadata id. */
            public id: number;

            /** Metadata name. */
            public name: string;

            /** Metadata contentType. */
            public contentType: string;

            /** Metadata sourceUrl. */
            public sourceUrl: string;

            /** Metadata sourceHashId. */
            public sourceHashId: string;

            /** Metadata labels. */
            public labels: string[];

            /** Metadata figmaFileId. */
            public figmaFileId: string;

            /** Metadata createdAt. */
            public createdAt?: (figma_files.common.ITimestamp|null);

            /** Metadata updatedAt. */
            public updatedAt?: (figma_files.common.ITimestamp|null);

            /**
             * Creates a new Metadata instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Metadata instance
             */
            public static create(properties?: figma_files.metadata.IMetadata): figma_files.metadata.Metadata;

            /**
             * Encodes the specified Metadata message. Does not implicitly {@link figma_files.metadata.Metadata.verify|verify} messages.
             * @param message Metadata message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: figma_files.metadata.IMetadata, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Metadata message, length delimited. Does not implicitly {@link figma_files.metadata.Metadata.verify|verify} messages.
             * @param message Metadata message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: figma_files.metadata.IMetadata, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Metadata message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Metadata
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_files.metadata.Metadata;

            /**
             * Decodes a Metadata message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Metadata
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_files.metadata.Metadata;

            /**
             * Verifies a Metadata message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Metadata message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Metadata
             */
            public static fromObject(object: { [k: string]: any }): figma_files.metadata.Metadata;

            /**
             * Creates a plain object from a Metadata message. Also converts values to other types if specified.
             * @param message Metadata
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: figma_files.metadata.Metadata, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Metadata to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Metadata
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a MetadataListResponse. */
        interface IMetadataListResponse {

            /** MetadataListResponse items */
            items?: (figma_files.metadata.IMetadata[]|null);
        }

        /** Represents a MetadataListResponse. */
        class MetadataListResponse implements IMetadataListResponse {

            /**
             * Constructs a new MetadataListResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: figma_files.metadata.IMetadataListResponse);

            /** MetadataListResponse items. */
            public items: figma_files.metadata.IMetadata[];

            /**
             * Creates a new MetadataListResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns MetadataListResponse instance
             */
            public static create(properties?: figma_files.metadata.IMetadataListResponse): figma_files.metadata.MetadataListResponse;

            /**
             * Encodes the specified MetadataListResponse message. Does not implicitly {@link figma_files.metadata.MetadataListResponse.verify|verify} messages.
             * @param message MetadataListResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: figma_files.metadata.IMetadataListResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified MetadataListResponse message, length delimited. Does not implicitly {@link figma_files.metadata.MetadataListResponse.verify|verify} messages.
             * @param message MetadataListResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: figma_files.metadata.IMetadataListResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a MetadataListResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns MetadataListResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_files.metadata.MetadataListResponse;

            /**
             * Decodes a MetadataListResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns MetadataListResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_files.metadata.MetadataListResponse;

            /**
             * Verifies a MetadataListResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a MetadataListResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns MetadataListResponse
             */
            public static fromObject(object: { [k: string]: any }): figma_files.metadata.MetadataListResponse;

            /**
             * Creates a plain object from a MetadataListResponse message. Also converts values to other types if specified.
             * @param message MetadataListResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: figma_files.metadata.MetadataListResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this MetadataListResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for MetadataListResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a CreateMetadataRequest. */
        interface ICreateMetadataRequest {

            /** CreateMetadataRequest name */
            name?: (string|null);

            /** CreateMetadataRequest contentType */
            contentType?: (string|null);

            /** CreateMetadataRequest sourceUrl */
            sourceUrl?: (string|null);

            /** CreateMetadataRequest sourceHashId */
            sourceHashId?: (string|null);

            /** CreateMetadataRequest labels */
            labels?: (string[]|null);

            /** CreateMetadataRequest figmaFileId */
            figmaFileId?: (string|null);
        }

        /** Represents a CreateMetadataRequest. */
        class CreateMetadataRequest implements ICreateMetadataRequest {

            /**
             * Constructs a new CreateMetadataRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: figma_files.metadata.ICreateMetadataRequest);

            /** CreateMetadataRequest name. */
            public name: string;

            /** CreateMetadataRequest contentType. */
            public contentType: string;

            /** CreateMetadataRequest sourceUrl. */
            public sourceUrl: string;

            /** CreateMetadataRequest sourceHashId. */
            public sourceHashId: string;

            /** CreateMetadataRequest labels. */
            public labels: string[];

            /** CreateMetadataRequest figmaFileId. */
            public figmaFileId: string;

            /**
             * Creates a new CreateMetadataRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns CreateMetadataRequest instance
             */
            public static create(properties?: figma_files.metadata.ICreateMetadataRequest): figma_files.metadata.CreateMetadataRequest;

            /**
             * Encodes the specified CreateMetadataRequest message. Does not implicitly {@link figma_files.metadata.CreateMetadataRequest.verify|verify} messages.
             * @param message CreateMetadataRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: figma_files.metadata.ICreateMetadataRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified CreateMetadataRequest message, length delimited. Does not implicitly {@link figma_files.metadata.CreateMetadataRequest.verify|verify} messages.
             * @param message CreateMetadataRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: figma_files.metadata.ICreateMetadataRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a CreateMetadataRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns CreateMetadataRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_files.metadata.CreateMetadataRequest;

            /**
             * Decodes a CreateMetadataRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns CreateMetadataRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_files.metadata.CreateMetadataRequest;

            /**
             * Verifies a CreateMetadataRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a CreateMetadataRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns CreateMetadataRequest
             */
            public static fromObject(object: { [k: string]: any }): figma_files.metadata.CreateMetadataRequest;

            /**
             * Creates a plain object from a CreateMetadataRequest message. Also converts values to other types if specified.
             * @param message CreateMetadataRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: figma_files.metadata.CreateMetadataRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this CreateMetadataRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for CreateMetadataRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a CreateMetadataResponse. */
        interface ICreateMetadataResponse {

            /** CreateMetadataResponse metadata */
            metadata?: (figma_files.metadata.IMetadata|null);
        }

        /** Represents a CreateMetadataResponse. */
        class CreateMetadataResponse implements ICreateMetadataResponse {

            /**
             * Constructs a new CreateMetadataResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: figma_files.metadata.ICreateMetadataResponse);

            /** CreateMetadataResponse metadata. */
            public metadata?: (figma_files.metadata.IMetadata|null);

            /**
             * Creates a new CreateMetadataResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns CreateMetadataResponse instance
             */
            public static create(properties?: figma_files.metadata.ICreateMetadataResponse): figma_files.metadata.CreateMetadataResponse;

            /**
             * Encodes the specified CreateMetadataResponse message. Does not implicitly {@link figma_files.metadata.CreateMetadataResponse.verify|verify} messages.
             * @param message CreateMetadataResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: figma_files.metadata.ICreateMetadataResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified CreateMetadataResponse message, length delimited. Does not implicitly {@link figma_files.metadata.CreateMetadataResponse.verify|verify} messages.
             * @param message CreateMetadataResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: figma_files.metadata.ICreateMetadataResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a CreateMetadataResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns CreateMetadataResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_files.metadata.CreateMetadataResponse;

            /**
             * Decodes a CreateMetadataResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns CreateMetadataResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_files.metadata.CreateMetadataResponse;

            /**
             * Verifies a CreateMetadataResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a CreateMetadataResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns CreateMetadataResponse
             */
            public static fromObject(object: { [k: string]: any }): figma_files.metadata.CreateMetadataResponse;

            /**
             * Creates a plain object from a CreateMetadataResponse message. Also converts values to other types if specified.
             * @param message CreateMetadataResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: figma_files.metadata.CreateMetadataResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this CreateMetadataResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for CreateMetadataResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an UpdateMetadataRequest. */
        interface IUpdateMetadataRequest {

            /** UpdateMetadataRequest id */
            id?: (number|null);

            /** UpdateMetadataRequest name */
            name?: (string|null);

            /** UpdateMetadataRequest contentType */
            contentType?: (string|null);

            /** UpdateMetadataRequest sourceUrl */
            sourceUrl?: (string|null);

            /** UpdateMetadataRequest sourceHashId */
            sourceHashId?: (string|null);

            /** UpdateMetadataRequest labels */
            labels?: (string[]|null);
        }

        /** Represents an UpdateMetadataRequest. */
        class UpdateMetadataRequest implements IUpdateMetadataRequest {

            /**
             * Constructs a new UpdateMetadataRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: figma_files.metadata.IUpdateMetadataRequest);

            /** UpdateMetadataRequest id. */
            public id: number;

            /** UpdateMetadataRequest name. */
            public name: string;

            /** UpdateMetadataRequest contentType. */
            public contentType: string;

            /** UpdateMetadataRequest sourceUrl. */
            public sourceUrl: string;

            /** UpdateMetadataRequest sourceHashId. */
            public sourceHashId: string;

            /** UpdateMetadataRequest labels. */
            public labels: string[];

            /**
             * Creates a new UpdateMetadataRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns UpdateMetadataRequest instance
             */
            public static create(properties?: figma_files.metadata.IUpdateMetadataRequest): figma_files.metadata.UpdateMetadataRequest;

            /**
             * Encodes the specified UpdateMetadataRequest message. Does not implicitly {@link figma_files.metadata.UpdateMetadataRequest.verify|verify} messages.
             * @param message UpdateMetadataRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: figma_files.metadata.IUpdateMetadataRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified UpdateMetadataRequest message, length delimited. Does not implicitly {@link figma_files.metadata.UpdateMetadataRequest.verify|verify} messages.
             * @param message UpdateMetadataRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: figma_files.metadata.IUpdateMetadataRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an UpdateMetadataRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns UpdateMetadataRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_files.metadata.UpdateMetadataRequest;

            /**
             * Decodes an UpdateMetadataRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns UpdateMetadataRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_files.metadata.UpdateMetadataRequest;

            /**
             * Verifies an UpdateMetadataRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an UpdateMetadataRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns UpdateMetadataRequest
             */
            public static fromObject(object: { [k: string]: any }): figma_files.metadata.UpdateMetadataRequest;

            /**
             * Creates a plain object from an UpdateMetadataRequest message. Also converts values to other types if specified.
             * @param message UpdateMetadataRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: figma_files.metadata.UpdateMetadataRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this UpdateMetadataRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for UpdateMetadataRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an UpdateMetadataResponse. */
        interface IUpdateMetadataResponse {

            /** UpdateMetadataResponse metadata */
            metadata?: (figma_files.metadata.IMetadata|null);
        }

        /** Represents an UpdateMetadataResponse. */
        class UpdateMetadataResponse implements IUpdateMetadataResponse {

            /**
             * Constructs a new UpdateMetadataResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: figma_files.metadata.IUpdateMetadataResponse);

            /** UpdateMetadataResponse metadata. */
            public metadata?: (figma_files.metadata.IMetadata|null);

            /**
             * Creates a new UpdateMetadataResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns UpdateMetadataResponse instance
             */
            public static create(properties?: figma_files.metadata.IUpdateMetadataResponse): figma_files.metadata.UpdateMetadataResponse;

            /**
             * Encodes the specified UpdateMetadataResponse message. Does not implicitly {@link figma_files.metadata.UpdateMetadataResponse.verify|verify} messages.
             * @param message UpdateMetadataResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: figma_files.metadata.IUpdateMetadataResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified UpdateMetadataResponse message, length delimited. Does not implicitly {@link figma_files.metadata.UpdateMetadataResponse.verify|verify} messages.
             * @param message UpdateMetadataResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: figma_files.metadata.IUpdateMetadataResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an UpdateMetadataResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns UpdateMetadataResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_files.metadata.UpdateMetadataResponse;

            /**
             * Decodes an UpdateMetadataResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns UpdateMetadataResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_files.metadata.UpdateMetadataResponse;

            /**
             * Verifies an UpdateMetadataResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an UpdateMetadataResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns UpdateMetadataResponse
             */
            public static fromObject(object: { [k: string]: any }): figma_files.metadata.UpdateMetadataResponse;

            /**
             * Creates a plain object from an UpdateMetadataResponse message. Also converts values to other types if specified.
             * @param message UpdateMetadataResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: figma_files.metadata.UpdateMetadataResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this UpdateMetadataResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for UpdateMetadataResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a GetMetadataRequest. */
        interface IGetMetadataRequest {

            /** GetMetadataRequest id */
            id?: (number|null);
        }

        /** Represents a GetMetadataRequest. */
        class GetMetadataRequest implements IGetMetadataRequest {

            /**
             * Constructs a new GetMetadataRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: figma_files.metadata.IGetMetadataRequest);

            /** GetMetadataRequest id. */
            public id: number;

            /**
             * Creates a new GetMetadataRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns GetMetadataRequest instance
             */
            public static create(properties?: figma_files.metadata.IGetMetadataRequest): figma_files.metadata.GetMetadataRequest;

            /**
             * Encodes the specified GetMetadataRequest message. Does not implicitly {@link figma_files.metadata.GetMetadataRequest.verify|verify} messages.
             * @param message GetMetadataRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: figma_files.metadata.IGetMetadataRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified GetMetadataRequest message, length delimited. Does not implicitly {@link figma_files.metadata.GetMetadataRequest.verify|verify} messages.
             * @param message GetMetadataRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: figma_files.metadata.IGetMetadataRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a GetMetadataRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns GetMetadataRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_files.metadata.GetMetadataRequest;

            /**
             * Decodes a GetMetadataRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns GetMetadataRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_files.metadata.GetMetadataRequest;

            /**
             * Verifies a GetMetadataRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a GetMetadataRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns GetMetadataRequest
             */
            public static fromObject(object: { [k: string]: any }): figma_files.metadata.GetMetadataRequest;

            /**
             * Creates a plain object from a GetMetadataRequest message. Also converts values to other types if specified.
             * @param message GetMetadataRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: figma_files.metadata.GetMetadataRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this GetMetadataRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for GetMetadataRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a GetMetadataResponse. */
        interface IGetMetadataResponse {

            /** GetMetadataResponse metadata */
            metadata?: (figma_files.metadata.IMetadata|null);
        }

        /** Represents a GetMetadataResponse. */
        class GetMetadataResponse implements IGetMetadataResponse {

            /**
             * Constructs a new GetMetadataResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: figma_files.metadata.IGetMetadataResponse);

            /** GetMetadataResponse metadata. */
            public metadata?: (figma_files.metadata.IMetadata|null);

            /**
             * Creates a new GetMetadataResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns GetMetadataResponse instance
             */
            public static create(properties?: figma_files.metadata.IGetMetadataResponse): figma_files.metadata.GetMetadataResponse;

            /**
             * Encodes the specified GetMetadataResponse message. Does not implicitly {@link figma_files.metadata.GetMetadataResponse.verify|verify} messages.
             * @param message GetMetadataResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: figma_files.metadata.IGetMetadataResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified GetMetadataResponse message, length delimited. Does not implicitly {@link figma_files.metadata.GetMetadataResponse.verify|verify} messages.
             * @param message GetMetadataResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: figma_files.metadata.IGetMetadataResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a GetMetadataResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns GetMetadataResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_files.metadata.GetMetadataResponse;

            /**
             * Decodes a GetMetadataResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns GetMetadataResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_files.metadata.GetMetadataResponse;

            /**
             * Verifies a GetMetadataResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a GetMetadataResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns GetMetadataResponse
             */
            public static fromObject(object: { [k: string]: any }): figma_files.metadata.GetMetadataResponse;

            /**
             * Creates a plain object from a GetMetadataResponse message. Also converts values to other types if specified.
             * @param message GetMetadataResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: figma_files.metadata.GetMetadataResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this GetMetadataResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for GetMetadataResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a DeleteMetadataRequest. */
        interface IDeleteMetadataRequest {

            /** DeleteMetadataRequest id */
            id?: (number|null);
        }

        /** Represents a DeleteMetadataRequest. */
        class DeleteMetadataRequest implements IDeleteMetadataRequest {

            /**
             * Constructs a new DeleteMetadataRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: figma_files.metadata.IDeleteMetadataRequest);

            /** DeleteMetadataRequest id. */
            public id: number;

            /**
             * Creates a new DeleteMetadataRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns DeleteMetadataRequest instance
             */
            public static create(properties?: figma_files.metadata.IDeleteMetadataRequest): figma_files.metadata.DeleteMetadataRequest;

            /**
             * Encodes the specified DeleteMetadataRequest message. Does not implicitly {@link figma_files.metadata.DeleteMetadataRequest.verify|verify} messages.
             * @param message DeleteMetadataRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: figma_files.metadata.IDeleteMetadataRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified DeleteMetadataRequest message, length delimited. Does not implicitly {@link figma_files.metadata.DeleteMetadataRequest.verify|verify} messages.
             * @param message DeleteMetadataRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: figma_files.metadata.IDeleteMetadataRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DeleteMetadataRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns DeleteMetadataRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_files.metadata.DeleteMetadataRequest;

            /**
             * Decodes a DeleteMetadataRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns DeleteMetadataRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_files.metadata.DeleteMetadataRequest;

            /**
             * Verifies a DeleteMetadataRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a DeleteMetadataRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns DeleteMetadataRequest
             */
            public static fromObject(object: { [k: string]: any }): figma_files.metadata.DeleteMetadataRequest;

            /**
             * Creates a plain object from a DeleteMetadataRequest message. Also converts values to other types if specified.
             * @param message DeleteMetadataRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: figma_files.metadata.DeleteMetadataRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this DeleteMetadataRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for DeleteMetadataRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a DeleteMetadataResponse. */
        interface IDeleteMetadataResponse {

            /** DeleteMetadataResponse success */
            success?: (boolean|null);
        }

        /** Represents a DeleteMetadataResponse. */
        class DeleteMetadataResponse implements IDeleteMetadataResponse {

            /**
             * Constructs a new DeleteMetadataResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: figma_files.metadata.IDeleteMetadataResponse);

            /** DeleteMetadataResponse success. */
            public success: boolean;

            /**
             * Creates a new DeleteMetadataResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns DeleteMetadataResponse instance
             */
            public static create(properties?: figma_files.metadata.IDeleteMetadataResponse): figma_files.metadata.DeleteMetadataResponse;

            /**
             * Encodes the specified DeleteMetadataResponse message. Does not implicitly {@link figma_files.metadata.DeleteMetadataResponse.verify|verify} messages.
             * @param message DeleteMetadataResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: figma_files.metadata.IDeleteMetadataResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified DeleteMetadataResponse message, length delimited. Does not implicitly {@link figma_files.metadata.DeleteMetadataResponse.verify|verify} messages.
             * @param message DeleteMetadataResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: figma_files.metadata.IDeleteMetadataResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DeleteMetadataResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns DeleteMetadataResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_files.metadata.DeleteMetadataResponse;

            /**
             * Decodes a DeleteMetadataResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns DeleteMetadataResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_files.metadata.DeleteMetadataResponse;

            /**
             * Verifies a DeleteMetadataResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a DeleteMetadataResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns DeleteMetadataResponse
             */
            public static fromObject(object: { [k: string]: any }): figma_files.metadata.DeleteMetadataResponse;

            /**
             * Creates a plain object from a DeleteMetadataResponse message. Also converts values to other types if specified.
             * @param message DeleteMetadataResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: figma_files.metadata.DeleteMetadataResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this DeleteMetadataResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for DeleteMetadataResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}
