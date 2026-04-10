import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace fqdp. */
export namespace fqdp {

    /** Properties of an Application. */
    interface IApplication {

        /** Application id */
        id?: (string|null);

        /** Application name */
        name?: (string|null);

        /** Application slug */
        slug?: (string|null);

        /** Application description */
        description?: (string|null);

        /** Application status */
        status?: (fqdp.EntityStatus|null);

        /** Application metadataJson */
        metadataJson?: (string|null);

        /** Application teamId */
        teamId?: (string|null);

        /** Application teamName */
        teamName?: (string|null);

        /** Application workspaceId */
        workspaceId?: (string|null);

        /** Application workspaceName */
        workspaceName?: (string|null);

        /** Application organizationId */
        organizationId?: (string|null);

        /** Application organizationName */
        organizationName?: (string|null);

        /** Application projectCount */
        projectCount?: (number|null);

        /** Application createdBy */
        createdBy?: (string|null);

        /** Application updatedBy */
        updatedBy?: (string|null);

        /** Application createdAt */
        createdAt?: (string|null);

        /** Application updatedAt */
        updatedAt?: (string|null);
    }

    /** Represents an Application. */
    class Application implements IApplication {

        /**
         * Constructs a new Application.
         * @param [properties] Properties to set
         */
        constructor(properties?: fqdp.IApplication);

        /** Application id. */
        public id: string;

        /** Application name. */
        public name: string;

        /** Application slug. */
        public slug: string;

        /** Application description. */
        public description: string;

        /** Application status. */
        public status: fqdp.EntityStatus;

        /** Application metadataJson. */
        public metadataJson: string;

        /** Application teamId. */
        public teamId: string;

        /** Application teamName. */
        public teamName: string;

        /** Application workspaceId. */
        public workspaceId: string;

        /** Application workspaceName. */
        public workspaceName: string;

        /** Application organizationId. */
        public organizationId: string;

        /** Application organizationName. */
        public organizationName: string;

        /** Application projectCount. */
        public projectCount: number;

        /** Application createdBy. */
        public createdBy: string;

        /** Application updatedBy. */
        public updatedBy: string;

        /** Application createdAt. */
        public createdAt: string;

        /** Application updatedAt. */
        public updatedAt: string;

        /**
         * Creates a new Application instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Application instance
         */
        public static create(properties?: fqdp.IApplication): fqdp.Application;

        /**
         * Encodes the specified Application message. Does not implicitly {@link fqdp.Application.verify|verify} messages.
         * @param message Application message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: fqdp.IApplication, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Application message, length delimited. Does not implicitly {@link fqdp.Application.verify|verify} messages.
         * @param message Application message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: fqdp.IApplication, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an Application message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Application
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): fqdp.Application;

        /**
         * Decodes an Application message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Application
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): fqdp.Application;

        /**
         * Verifies an Application message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an Application message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Application
         */
        public static fromObject(object: { [k: string]: any }): fqdp.Application;

        /**
         * Creates a plain object from an Application message. Also converts values to other types if specified.
         * @param message Application
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: fqdp.Application, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Application to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Application
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an ApplicationList. */
    interface IApplicationList {

        /** ApplicationList data */
        data?: (fqdp.IApplication[]|null);

        /** ApplicationList meta */
        meta?: (fqdp.IPaginationMeta|null);
    }

    /** Represents an ApplicationList. */
    class ApplicationList implements IApplicationList {

        /**
         * Constructs a new ApplicationList.
         * @param [properties] Properties to set
         */
        constructor(properties?: fqdp.IApplicationList);

        /** ApplicationList data. */
        public data: fqdp.IApplication[];

        /** ApplicationList meta. */
        public meta?: (fqdp.IPaginationMeta|null);

        /**
         * Creates a new ApplicationList instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ApplicationList instance
         */
        public static create(properties?: fqdp.IApplicationList): fqdp.ApplicationList;

        /**
         * Encodes the specified ApplicationList message. Does not implicitly {@link fqdp.ApplicationList.verify|verify} messages.
         * @param message ApplicationList message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: fqdp.IApplicationList, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ApplicationList message, length delimited. Does not implicitly {@link fqdp.ApplicationList.verify|verify} messages.
         * @param message ApplicationList message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: fqdp.IApplicationList, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an ApplicationList message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ApplicationList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): fqdp.ApplicationList;

        /**
         * Decodes an ApplicationList message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ApplicationList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): fqdp.ApplicationList;

        /**
         * Verifies an ApplicationList message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an ApplicationList message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ApplicationList
         */
        public static fromObject(object: { [k: string]: any }): fqdp.ApplicationList;

        /**
         * Creates a plain object from an ApplicationList message. Also converts values to other types if specified.
         * @param message ApplicationList
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: fqdp.ApplicationList, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ApplicationList to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for ApplicationList
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a CreateApplicationRequest. */
    interface ICreateApplicationRequest {

        /** CreateApplicationRequest name */
        name?: (string|null);

        /** CreateApplicationRequest description */
        description?: (string|null);

        /** CreateApplicationRequest teamId */
        teamId?: (string|null);

        /** CreateApplicationRequest metadataJson */
        metadataJson?: (string|null);
    }

    /** Represents a CreateApplicationRequest. */
    class CreateApplicationRequest implements ICreateApplicationRequest {

        /**
         * Constructs a new CreateApplicationRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: fqdp.ICreateApplicationRequest);

        /** CreateApplicationRequest name. */
        public name: string;

        /** CreateApplicationRequest description. */
        public description: string;

        /** CreateApplicationRequest teamId. */
        public teamId: string;

        /** CreateApplicationRequest metadataJson. */
        public metadataJson: string;

        /**
         * Creates a new CreateApplicationRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CreateApplicationRequest instance
         */
        public static create(properties?: fqdp.ICreateApplicationRequest): fqdp.CreateApplicationRequest;

        /**
         * Encodes the specified CreateApplicationRequest message. Does not implicitly {@link fqdp.CreateApplicationRequest.verify|verify} messages.
         * @param message CreateApplicationRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: fqdp.ICreateApplicationRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CreateApplicationRequest message, length delimited. Does not implicitly {@link fqdp.CreateApplicationRequest.verify|verify} messages.
         * @param message CreateApplicationRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: fqdp.ICreateApplicationRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CreateApplicationRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns CreateApplicationRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): fqdp.CreateApplicationRequest;

        /**
         * Decodes a CreateApplicationRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns CreateApplicationRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): fqdp.CreateApplicationRequest;

        /**
         * Verifies a CreateApplicationRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CreateApplicationRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CreateApplicationRequest
         */
        public static fromObject(object: { [k: string]: any }): fqdp.CreateApplicationRequest;

        /**
         * Creates a plain object from a CreateApplicationRequest message. Also converts values to other types if specified.
         * @param message CreateApplicationRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: fqdp.CreateApplicationRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CreateApplicationRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for CreateApplicationRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an UpdateApplicationRequest. */
    interface IUpdateApplicationRequest {

        /** UpdateApplicationRequest name */
        name?: (string|null);

        /** UpdateApplicationRequest description */
        description?: (string|null);

        /** UpdateApplicationRequest status */
        status?: (fqdp.EntityStatus|null);

        /** UpdateApplicationRequest metadataJson */
        metadataJson?: (string|null);
    }

    /** Represents an UpdateApplicationRequest. */
    class UpdateApplicationRequest implements IUpdateApplicationRequest {

        /**
         * Constructs a new UpdateApplicationRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: fqdp.IUpdateApplicationRequest);

        /** UpdateApplicationRequest name. */
        public name: string;

        /** UpdateApplicationRequest description. */
        public description: string;

        /** UpdateApplicationRequest status. */
        public status: fqdp.EntityStatus;

        /** UpdateApplicationRequest metadataJson. */
        public metadataJson: string;

        /**
         * Creates a new UpdateApplicationRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns UpdateApplicationRequest instance
         */
        public static create(properties?: fqdp.IUpdateApplicationRequest): fqdp.UpdateApplicationRequest;

        /**
         * Encodes the specified UpdateApplicationRequest message. Does not implicitly {@link fqdp.UpdateApplicationRequest.verify|verify} messages.
         * @param message UpdateApplicationRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: fqdp.IUpdateApplicationRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified UpdateApplicationRequest message, length delimited. Does not implicitly {@link fqdp.UpdateApplicationRequest.verify|verify} messages.
         * @param message UpdateApplicationRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: fqdp.IUpdateApplicationRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an UpdateApplicationRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns UpdateApplicationRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): fqdp.UpdateApplicationRequest;

        /**
         * Decodes an UpdateApplicationRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns UpdateApplicationRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): fqdp.UpdateApplicationRequest;

        /**
         * Verifies an UpdateApplicationRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an UpdateApplicationRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns UpdateApplicationRequest
         */
        public static fromObject(object: { [k: string]: any }): fqdp.UpdateApplicationRequest;

        /**
         * Creates a plain object from an UpdateApplicationRequest message. Also converts values to other types if specified.
         * @param message UpdateApplicationRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: fqdp.UpdateApplicationRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this UpdateApplicationRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for UpdateApplicationRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** EntityStatus enum. */
    enum EntityStatus {
        ENTITY_STATUS_UNSPECIFIED = 0,
        ACTIVE = 1,
        INACTIVE = 2,
        ARCHIVED = 3
    }

    /** ResourceType enum. */
    enum ResourceType {
        RESOURCE_TYPE_UNSPECIFIED = 0,
        FIGMA = 1,
        SKETCH = 2,
        XD = 3,
        PDF = 4,
        IMAGE = 5,
        CODE = 6,
        DOCUMENT = 7,
        OTHER = 8
    }

    /** ReferenceType enum. */
    enum ReferenceType {
        REFERENCE_TYPE_UNSPECIFIED = 0,
        SERVICE = 1,
        PAGE = 2,
        COMPONENT = 3,
        REPOSITORY = 4
    }

    /** Properties of a Metadata. */
    interface IMetadata {

        /** Metadata key */
        key?: (string|null);

        /** Metadata value */
        value?: (string|null);
    }

    /** Represents a Metadata. */
    class Metadata implements IMetadata {

        /**
         * Constructs a new Metadata.
         * @param [properties] Properties to set
         */
        constructor(properties?: fqdp.IMetadata);

        /** Metadata key. */
        public key: string;

        /** Metadata value. */
        public value: string;

        /**
         * Creates a new Metadata instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Metadata instance
         */
        public static create(properties?: fqdp.IMetadata): fqdp.Metadata;

        /**
         * Encodes the specified Metadata message. Does not implicitly {@link fqdp.Metadata.verify|verify} messages.
         * @param message Metadata message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: fqdp.IMetadata, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Metadata message, length delimited. Does not implicitly {@link fqdp.Metadata.verify|verify} messages.
         * @param message Metadata message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: fqdp.IMetadata, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Metadata message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Metadata
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): fqdp.Metadata;

        /**
         * Decodes a Metadata message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Metadata
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): fqdp.Metadata;

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
        public static fromObject(object: { [k: string]: any }): fqdp.Metadata;

        /**
         * Creates a plain object from a Metadata message. Also converts values to other types if specified.
         * @param message Metadata
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: fqdp.Metadata, options?: $protobuf.IConversionOptions): { [k: string]: any };

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

    /** Properties of a PaginationMeta. */
    interface IPaginationMeta {

        /** PaginationMeta total */
        total?: (number|null);

        /** PaginationMeta page */
        page?: (number|null);

        /** PaginationMeta limit */
        limit?: (number|null);

        /** PaginationMeta totalPages */
        totalPages?: (number|null);
    }

    /** Represents a PaginationMeta. */
    class PaginationMeta implements IPaginationMeta {

        /**
         * Constructs a new PaginationMeta.
         * @param [properties] Properties to set
         */
        constructor(properties?: fqdp.IPaginationMeta);

        /** PaginationMeta total. */
        public total: number;

        /** PaginationMeta page. */
        public page: number;

        /** PaginationMeta limit. */
        public limit: number;

        /** PaginationMeta totalPages. */
        public totalPages: number;

        /**
         * Creates a new PaginationMeta instance using the specified properties.
         * @param [properties] Properties to set
         * @returns PaginationMeta instance
         */
        public static create(properties?: fqdp.IPaginationMeta): fqdp.PaginationMeta;

        /**
         * Encodes the specified PaginationMeta message. Does not implicitly {@link fqdp.PaginationMeta.verify|verify} messages.
         * @param message PaginationMeta message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: fqdp.IPaginationMeta, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified PaginationMeta message, length delimited. Does not implicitly {@link fqdp.PaginationMeta.verify|verify} messages.
         * @param message PaginationMeta message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: fqdp.IPaginationMeta, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a PaginationMeta message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns PaginationMeta
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): fqdp.PaginationMeta;

        /**
         * Decodes a PaginationMeta message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns PaginationMeta
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): fqdp.PaginationMeta;

        /**
         * Verifies a PaginationMeta message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a PaginationMeta message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns PaginationMeta
         */
        public static fromObject(object: { [k: string]: any }): fqdp.PaginationMeta;

        /**
         * Creates a plain object from a PaginationMeta message. Also converts values to other types if specified.
         * @param message PaginationMeta
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: fqdp.PaginationMeta, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this PaginationMeta to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for PaginationMeta
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an Organization. */
    interface IOrganization {

        /** Organization id */
        id?: (string|null);

        /** Organization name */
        name?: (string|null);

        /** Organization slug */
        slug?: (string|null);

        /** Organization description */
        description?: (string|null);

        /** Organization status */
        status?: (fqdp.EntityStatus|null);

        /** Organization metadataJson */
        metadataJson?: (string|null);

        /** Organization workspaceCount */
        workspaceCount?: (number|null);

        /** Organization createdBy */
        createdBy?: (string|null);

        /** Organization updatedBy */
        updatedBy?: (string|null);

        /** Organization createdAt */
        createdAt?: (string|null);

        /** Organization updatedAt */
        updatedAt?: (string|null);
    }

    /** Represents an Organization. */
    class Organization implements IOrganization {

        /**
         * Constructs a new Organization.
         * @param [properties] Properties to set
         */
        constructor(properties?: fqdp.IOrganization);

        /** Organization id. */
        public id: string;

        /** Organization name. */
        public name: string;

        /** Organization slug. */
        public slug: string;

        /** Organization description. */
        public description: string;

        /** Organization status. */
        public status: fqdp.EntityStatus;

        /** Organization metadataJson. */
        public metadataJson: string;

        /** Organization workspaceCount. */
        public workspaceCount: number;

        /** Organization createdBy. */
        public createdBy: string;

        /** Organization updatedBy. */
        public updatedBy: string;

        /** Organization createdAt. */
        public createdAt: string;

        /** Organization updatedAt. */
        public updatedAt: string;

        /**
         * Creates a new Organization instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Organization instance
         */
        public static create(properties?: fqdp.IOrganization): fqdp.Organization;

        /**
         * Encodes the specified Organization message. Does not implicitly {@link fqdp.Organization.verify|verify} messages.
         * @param message Organization message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: fqdp.IOrganization, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Organization message, length delimited. Does not implicitly {@link fqdp.Organization.verify|verify} messages.
         * @param message Organization message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: fqdp.IOrganization, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an Organization message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Organization
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): fqdp.Organization;

        /**
         * Decodes an Organization message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Organization
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): fqdp.Organization;

        /**
         * Verifies an Organization message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an Organization message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Organization
         */
        public static fromObject(object: { [k: string]: any }): fqdp.Organization;

        /**
         * Creates a plain object from an Organization message. Also converts values to other types if specified.
         * @param message Organization
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: fqdp.Organization, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Organization to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Organization
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an OrganizationList. */
    interface IOrganizationList {

        /** OrganizationList data */
        data?: (fqdp.IOrganization[]|null);

        /** OrganizationList meta */
        meta?: (fqdp.IPaginationMeta|null);
    }

    /** Represents an OrganizationList. */
    class OrganizationList implements IOrganizationList {

        /**
         * Constructs a new OrganizationList.
         * @param [properties] Properties to set
         */
        constructor(properties?: fqdp.IOrganizationList);

        /** OrganizationList data. */
        public data: fqdp.IOrganization[];

        /** OrganizationList meta. */
        public meta?: (fqdp.IPaginationMeta|null);

        /**
         * Creates a new OrganizationList instance using the specified properties.
         * @param [properties] Properties to set
         * @returns OrganizationList instance
         */
        public static create(properties?: fqdp.IOrganizationList): fqdp.OrganizationList;

        /**
         * Encodes the specified OrganizationList message. Does not implicitly {@link fqdp.OrganizationList.verify|verify} messages.
         * @param message OrganizationList message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: fqdp.IOrganizationList, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified OrganizationList message, length delimited. Does not implicitly {@link fqdp.OrganizationList.verify|verify} messages.
         * @param message OrganizationList message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: fqdp.IOrganizationList, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an OrganizationList message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns OrganizationList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): fqdp.OrganizationList;

        /**
         * Decodes an OrganizationList message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns OrganizationList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): fqdp.OrganizationList;

        /**
         * Verifies an OrganizationList message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an OrganizationList message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns OrganizationList
         */
        public static fromObject(object: { [k: string]: any }): fqdp.OrganizationList;

        /**
         * Creates a plain object from an OrganizationList message. Also converts values to other types if specified.
         * @param message OrganizationList
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: fqdp.OrganizationList, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this OrganizationList to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for OrganizationList
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a CreateOrganizationRequest. */
    interface ICreateOrganizationRequest {

        /** CreateOrganizationRequest name */
        name?: (string|null);

        /** CreateOrganizationRequest description */
        description?: (string|null);

        /** CreateOrganizationRequest metadataJson */
        metadataJson?: (string|null);
    }

    /** Represents a CreateOrganizationRequest. */
    class CreateOrganizationRequest implements ICreateOrganizationRequest {

        /**
         * Constructs a new CreateOrganizationRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: fqdp.ICreateOrganizationRequest);

        /** CreateOrganizationRequest name. */
        public name: string;

        /** CreateOrganizationRequest description. */
        public description: string;

        /** CreateOrganizationRequest metadataJson. */
        public metadataJson: string;

        /**
         * Creates a new CreateOrganizationRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CreateOrganizationRequest instance
         */
        public static create(properties?: fqdp.ICreateOrganizationRequest): fqdp.CreateOrganizationRequest;

        /**
         * Encodes the specified CreateOrganizationRequest message. Does not implicitly {@link fqdp.CreateOrganizationRequest.verify|verify} messages.
         * @param message CreateOrganizationRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: fqdp.ICreateOrganizationRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CreateOrganizationRequest message, length delimited. Does not implicitly {@link fqdp.CreateOrganizationRequest.verify|verify} messages.
         * @param message CreateOrganizationRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: fqdp.ICreateOrganizationRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CreateOrganizationRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns CreateOrganizationRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): fqdp.CreateOrganizationRequest;

        /**
         * Decodes a CreateOrganizationRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns CreateOrganizationRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): fqdp.CreateOrganizationRequest;

        /**
         * Verifies a CreateOrganizationRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CreateOrganizationRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CreateOrganizationRequest
         */
        public static fromObject(object: { [k: string]: any }): fqdp.CreateOrganizationRequest;

        /**
         * Creates a plain object from a CreateOrganizationRequest message. Also converts values to other types if specified.
         * @param message CreateOrganizationRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: fqdp.CreateOrganizationRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CreateOrganizationRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for CreateOrganizationRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an UpdateOrganizationRequest. */
    interface IUpdateOrganizationRequest {

        /** UpdateOrganizationRequest name */
        name?: (string|null);

        /** UpdateOrganizationRequest description */
        description?: (string|null);

        /** UpdateOrganizationRequest status */
        status?: (fqdp.EntityStatus|null);

        /** UpdateOrganizationRequest metadataJson */
        metadataJson?: (string|null);
    }

    /** Represents an UpdateOrganizationRequest. */
    class UpdateOrganizationRequest implements IUpdateOrganizationRequest {

        /**
         * Constructs a new UpdateOrganizationRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: fqdp.IUpdateOrganizationRequest);

        /** UpdateOrganizationRequest name. */
        public name: string;

        /** UpdateOrganizationRequest description. */
        public description: string;

        /** UpdateOrganizationRequest status. */
        public status: fqdp.EntityStatus;

        /** UpdateOrganizationRequest metadataJson. */
        public metadataJson: string;

        /**
         * Creates a new UpdateOrganizationRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns UpdateOrganizationRequest instance
         */
        public static create(properties?: fqdp.IUpdateOrganizationRequest): fqdp.UpdateOrganizationRequest;

        /**
         * Encodes the specified UpdateOrganizationRequest message. Does not implicitly {@link fqdp.UpdateOrganizationRequest.verify|verify} messages.
         * @param message UpdateOrganizationRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: fqdp.IUpdateOrganizationRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified UpdateOrganizationRequest message, length delimited. Does not implicitly {@link fqdp.UpdateOrganizationRequest.verify|verify} messages.
         * @param message UpdateOrganizationRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: fqdp.IUpdateOrganizationRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an UpdateOrganizationRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns UpdateOrganizationRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): fqdp.UpdateOrganizationRequest;

        /**
         * Decodes an UpdateOrganizationRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns UpdateOrganizationRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): fqdp.UpdateOrganizationRequest;

        /**
         * Verifies an UpdateOrganizationRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an UpdateOrganizationRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns UpdateOrganizationRequest
         */
        public static fromObject(object: { [k: string]: any }): fqdp.UpdateOrganizationRequest;

        /**
         * Creates a plain object from an UpdateOrganizationRequest message. Also converts values to other types if specified.
         * @param message UpdateOrganizationRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: fqdp.UpdateOrganizationRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this UpdateOrganizationRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for UpdateOrganizationRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a Project. */
    interface IProject {

        /** Project id */
        id?: (string|null);

        /** Project name */
        name?: (string|null);

        /** Project slug */
        slug?: (string|null);

        /** Project description */
        description?: (string|null);

        /** Project status */
        status?: (fqdp.EntityStatus|null);

        /** Project metadataJson */
        metadataJson?: (string|null);

        /** Project applicationId */
        applicationId?: (string|null);

        /** Project applicationName */
        applicationName?: (string|null);

        /** Project teamId */
        teamId?: (string|null);

        /** Project teamName */
        teamName?: (string|null);

        /** Project workspaceId */
        workspaceId?: (string|null);

        /** Project workspaceName */
        workspaceName?: (string|null);

        /** Project organizationId */
        organizationId?: (string|null);

        /** Project organizationName */
        organizationName?: (string|null);

        /** Project resourceCount */
        resourceCount?: (number|null);

        /** Project createdBy */
        createdBy?: (string|null);

        /** Project updatedBy */
        updatedBy?: (string|null);

        /** Project createdAt */
        createdAt?: (string|null);

        /** Project updatedAt */
        updatedAt?: (string|null);
    }

    /** Represents a Project. */
    class Project implements IProject {

        /**
         * Constructs a new Project.
         * @param [properties] Properties to set
         */
        constructor(properties?: fqdp.IProject);

        /** Project id. */
        public id: string;

        /** Project name. */
        public name: string;

        /** Project slug. */
        public slug: string;

        /** Project description. */
        public description: string;

        /** Project status. */
        public status: fqdp.EntityStatus;

        /** Project metadataJson. */
        public metadataJson: string;

        /** Project applicationId. */
        public applicationId: string;

        /** Project applicationName. */
        public applicationName: string;

        /** Project teamId. */
        public teamId: string;

        /** Project teamName. */
        public teamName: string;

        /** Project workspaceId. */
        public workspaceId: string;

        /** Project workspaceName. */
        public workspaceName: string;

        /** Project organizationId. */
        public organizationId: string;

        /** Project organizationName. */
        public organizationName: string;

        /** Project resourceCount. */
        public resourceCount: number;

        /** Project createdBy. */
        public createdBy: string;

        /** Project updatedBy. */
        public updatedBy: string;

        /** Project createdAt. */
        public createdAt: string;

        /** Project updatedAt. */
        public updatedAt: string;

        /**
         * Creates a new Project instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Project instance
         */
        public static create(properties?: fqdp.IProject): fqdp.Project;

        /**
         * Encodes the specified Project message. Does not implicitly {@link fqdp.Project.verify|verify} messages.
         * @param message Project message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: fqdp.IProject, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Project message, length delimited. Does not implicitly {@link fqdp.Project.verify|verify} messages.
         * @param message Project message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: fqdp.IProject, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Project message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Project
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): fqdp.Project;

        /**
         * Decodes a Project message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Project
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): fqdp.Project;

        /**
         * Verifies a Project message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Project message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Project
         */
        public static fromObject(object: { [k: string]: any }): fqdp.Project;

        /**
         * Creates a plain object from a Project message. Also converts values to other types if specified.
         * @param message Project
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: fqdp.Project, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Project to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Project
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a ProjectList. */
    interface IProjectList {

        /** ProjectList data */
        data?: (fqdp.IProject[]|null);

        /** ProjectList meta */
        meta?: (fqdp.IPaginationMeta|null);
    }

    /** Represents a ProjectList. */
    class ProjectList implements IProjectList {

        /**
         * Constructs a new ProjectList.
         * @param [properties] Properties to set
         */
        constructor(properties?: fqdp.IProjectList);

        /** ProjectList data. */
        public data: fqdp.IProject[];

        /** ProjectList meta. */
        public meta?: (fqdp.IPaginationMeta|null);

        /**
         * Creates a new ProjectList instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ProjectList instance
         */
        public static create(properties?: fqdp.IProjectList): fqdp.ProjectList;

        /**
         * Encodes the specified ProjectList message. Does not implicitly {@link fqdp.ProjectList.verify|verify} messages.
         * @param message ProjectList message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: fqdp.IProjectList, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ProjectList message, length delimited. Does not implicitly {@link fqdp.ProjectList.verify|verify} messages.
         * @param message ProjectList message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: fqdp.IProjectList, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ProjectList message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ProjectList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): fqdp.ProjectList;

        /**
         * Decodes a ProjectList message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ProjectList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): fqdp.ProjectList;

        /**
         * Verifies a ProjectList message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a ProjectList message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ProjectList
         */
        public static fromObject(object: { [k: string]: any }): fqdp.ProjectList;

        /**
         * Creates a plain object from a ProjectList message. Also converts values to other types if specified.
         * @param message ProjectList
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: fqdp.ProjectList, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ProjectList to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for ProjectList
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a CreateProjectRequest. */
    interface ICreateProjectRequest {

        /** CreateProjectRequest name */
        name?: (string|null);

        /** CreateProjectRequest description */
        description?: (string|null);

        /** CreateProjectRequest applicationId */
        applicationId?: (string|null);

        /** CreateProjectRequest metadataJson */
        metadataJson?: (string|null);
    }

    /** Represents a CreateProjectRequest. */
    class CreateProjectRequest implements ICreateProjectRequest {

        /**
         * Constructs a new CreateProjectRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: fqdp.ICreateProjectRequest);

        /** CreateProjectRequest name. */
        public name: string;

        /** CreateProjectRequest description. */
        public description: string;

        /** CreateProjectRequest applicationId. */
        public applicationId: string;

        /** CreateProjectRequest metadataJson. */
        public metadataJson: string;

        /**
         * Creates a new CreateProjectRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CreateProjectRequest instance
         */
        public static create(properties?: fqdp.ICreateProjectRequest): fqdp.CreateProjectRequest;

        /**
         * Encodes the specified CreateProjectRequest message. Does not implicitly {@link fqdp.CreateProjectRequest.verify|verify} messages.
         * @param message CreateProjectRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: fqdp.ICreateProjectRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CreateProjectRequest message, length delimited. Does not implicitly {@link fqdp.CreateProjectRequest.verify|verify} messages.
         * @param message CreateProjectRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: fqdp.ICreateProjectRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CreateProjectRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns CreateProjectRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): fqdp.CreateProjectRequest;

        /**
         * Decodes a CreateProjectRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns CreateProjectRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): fqdp.CreateProjectRequest;

        /**
         * Verifies a CreateProjectRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CreateProjectRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CreateProjectRequest
         */
        public static fromObject(object: { [k: string]: any }): fqdp.CreateProjectRequest;

        /**
         * Creates a plain object from a CreateProjectRequest message. Also converts values to other types if specified.
         * @param message CreateProjectRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: fqdp.CreateProjectRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CreateProjectRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for CreateProjectRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an UpdateProjectRequest. */
    interface IUpdateProjectRequest {

        /** UpdateProjectRequest name */
        name?: (string|null);

        /** UpdateProjectRequest description */
        description?: (string|null);

        /** UpdateProjectRequest status */
        status?: (fqdp.EntityStatus|null);

        /** UpdateProjectRequest metadataJson */
        metadataJson?: (string|null);
    }

    /** Represents an UpdateProjectRequest. */
    class UpdateProjectRequest implements IUpdateProjectRequest {

        /**
         * Constructs a new UpdateProjectRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: fqdp.IUpdateProjectRequest);

        /** UpdateProjectRequest name. */
        public name: string;

        /** UpdateProjectRequest description. */
        public description: string;

        /** UpdateProjectRequest status. */
        public status: fqdp.EntityStatus;

        /** UpdateProjectRequest metadataJson. */
        public metadataJson: string;

        /**
         * Creates a new UpdateProjectRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns UpdateProjectRequest instance
         */
        public static create(properties?: fqdp.IUpdateProjectRequest): fqdp.UpdateProjectRequest;

        /**
         * Encodes the specified UpdateProjectRequest message. Does not implicitly {@link fqdp.UpdateProjectRequest.verify|verify} messages.
         * @param message UpdateProjectRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: fqdp.IUpdateProjectRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified UpdateProjectRequest message, length delimited. Does not implicitly {@link fqdp.UpdateProjectRequest.verify|verify} messages.
         * @param message UpdateProjectRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: fqdp.IUpdateProjectRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an UpdateProjectRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns UpdateProjectRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): fqdp.UpdateProjectRequest;

        /**
         * Decodes an UpdateProjectRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns UpdateProjectRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): fqdp.UpdateProjectRequest;

        /**
         * Verifies an UpdateProjectRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an UpdateProjectRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns UpdateProjectRequest
         */
        public static fromObject(object: { [k: string]: any }): fqdp.UpdateProjectRequest;

        /**
         * Creates a plain object from an UpdateProjectRequest message. Also converts values to other types if specified.
         * @param message UpdateProjectRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: fqdp.UpdateProjectRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this UpdateProjectRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for UpdateProjectRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a Reference. */
    interface IReference {

        /** Reference id */
        id?: (string|null);

        /** Reference entityType */
        entityType?: (string|null);

        /** Reference entityId */
        entityId?: (string|null);

        /** Reference name */
        name?: (string|null);

        /** Reference link */
        link?: (string|null);

        /** Reference type */
        type?: (string|null);

        /** Reference externalUid */
        externalUid?: (string|null);

        /** Reference description */
        description?: (string|null);

        /** Reference metadataJson */
        metadataJson?: (string|null);

        /** Reference status */
        status?: (string|null);

        /** Reference createdBy */
        createdBy?: (string|null);

        /** Reference updatedBy */
        updatedBy?: (string|null);

        /** Reference createdAt */
        createdAt?: (string|null);

        /** Reference updatedAt */
        updatedAt?: (string|null);
    }

    /** Represents a Reference. */
    class Reference implements IReference {

        /**
         * Constructs a new Reference.
         * @param [properties] Properties to set
         */
        constructor(properties?: fqdp.IReference);

        /** Reference id. */
        public id: string;

        /** Reference entityType. */
        public entityType: string;

        /** Reference entityId. */
        public entityId: string;

        /** Reference name. */
        public name: string;

        /** Reference link. */
        public link: string;

        /** Reference type. */
        public type: string;

        /** Reference externalUid. */
        public externalUid: string;

        /** Reference description. */
        public description: string;

        /** Reference metadataJson. */
        public metadataJson: string;

        /** Reference status. */
        public status: string;

        /** Reference createdBy. */
        public createdBy: string;

        /** Reference updatedBy. */
        public updatedBy: string;

        /** Reference createdAt. */
        public createdAt: string;

        /** Reference updatedAt. */
        public updatedAt: string;

        /**
         * Creates a new Reference instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Reference instance
         */
        public static create(properties?: fqdp.IReference): fqdp.Reference;

        /**
         * Encodes the specified Reference message. Does not implicitly {@link fqdp.Reference.verify|verify} messages.
         * @param message Reference message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: fqdp.IReference, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Reference message, length delimited. Does not implicitly {@link fqdp.Reference.verify|verify} messages.
         * @param message Reference message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: fqdp.IReference, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Reference message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Reference
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): fqdp.Reference;

        /**
         * Decodes a Reference message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Reference
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): fqdp.Reference;

        /**
         * Verifies a Reference message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Reference message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Reference
         */
        public static fromObject(object: { [k: string]: any }): fqdp.Reference;

        /**
         * Creates a plain object from a Reference message. Also converts values to other types if specified.
         * @param message Reference
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: fqdp.Reference, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Reference to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Reference
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a ReferenceList. */
    interface IReferenceList {

        /** ReferenceList data */
        data?: (fqdp.IReference[]|null);

        /** ReferenceList meta */
        meta?: (fqdp.IPaginationMeta|null);
    }

    /** Represents a ReferenceList. */
    class ReferenceList implements IReferenceList {

        /**
         * Constructs a new ReferenceList.
         * @param [properties] Properties to set
         */
        constructor(properties?: fqdp.IReferenceList);

        /** ReferenceList data. */
        public data: fqdp.IReference[];

        /** ReferenceList meta. */
        public meta?: (fqdp.IPaginationMeta|null);

        /**
         * Creates a new ReferenceList instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ReferenceList instance
         */
        public static create(properties?: fqdp.IReferenceList): fqdp.ReferenceList;

        /**
         * Encodes the specified ReferenceList message. Does not implicitly {@link fqdp.ReferenceList.verify|verify} messages.
         * @param message ReferenceList message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: fqdp.IReferenceList, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ReferenceList message, length delimited. Does not implicitly {@link fqdp.ReferenceList.verify|verify} messages.
         * @param message ReferenceList message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: fqdp.IReferenceList, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ReferenceList message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ReferenceList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): fqdp.ReferenceList;

        /**
         * Decodes a ReferenceList message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ReferenceList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): fqdp.ReferenceList;

        /**
         * Verifies a ReferenceList message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a ReferenceList message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ReferenceList
         */
        public static fromObject(object: { [k: string]: any }): fqdp.ReferenceList;

        /**
         * Creates a plain object from a ReferenceList message. Also converts values to other types if specified.
         * @param message ReferenceList
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: fqdp.ReferenceList, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ReferenceList to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for ReferenceList
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a CreateReferenceRequest. */
    interface ICreateReferenceRequest {

        /** CreateReferenceRequest entityType */
        entityType?: (string|null);

        /** CreateReferenceRequest entityId */
        entityId?: (string|null);

        /** CreateReferenceRequest name */
        name?: (string|null);

        /** CreateReferenceRequest link */
        link?: (string|null);

        /** CreateReferenceRequest type */
        type?: (string|null);

        /** CreateReferenceRequest externalUid */
        externalUid?: (string|null);

        /** CreateReferenceRequest description */
        description?: (string|null);

        /** CreateReferenceRequest metadataJson */
        metadataJson?: (string|null);
    }

    /** Represents a CreateReferenceRequest. */
    class CreateReferenceRequest implements ICreateReferenceRequest {

        /**
         * Constructs a new CreateReferenceRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: fqdp.ICreateReferenceRequest);

        /** CreateReferenceRequest entityType. */
        public entityType: string;

        /** CreateReferenceRequest entityId. */
        public entityId: string;

        /** CreateReferenceRequest name. */
        public name: string;

        /** CreateReferenceRequest link. */
        public link: string;

        /** CreateReferenceRequest type. */
        public type: string;

        /** CreateReferenceRequest externalUid. */
        public externalUid: string;

        /** CreateReferenceRequest description. */
        public description: string;

        /** CreateReferenceRequest metadataJson. */
        public metadataJson: string;

        /**
         * Creates a new CreateReferenceRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CreateReferenceRequest instance
         */
        public static create(properties?: fqdp.ICreateReferenceRequest): fqdp.CreateReferenceRequest;

        /**
         * Encodes the specified CreateReferenceRequest message. Does not implicitly {@link fqdp.CreateReferenceRequest.verify|verify} messages.
         * @param message CreateReferenceRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: fqdp.ICreateReferenceRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CreateReferenceRequest message, length delimited. Does not implicitly {@link fqdp.CreateReferenceRequest.verify|verify} messages.
         * @param message CreateReferenceRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: fqdp.ICreateReferenceRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CreateReferenceRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns CreateReferenceRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): fqdp.CreateReferenceRequest;

        /**
         * Decodes a CreateReferenceRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns CreateReferenceRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): fqdp.CreateReferenceRequest;

        /**
         * Verifies a CreateReferenceRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CreateReferenceRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CreateReferenceRequest
         */
        public static fromObject(object: { [k: string]: any }): fqdp.CreateReferenceRequest;

        /**
         * Creates a plain object from a CreateReferenceRequest message. Also converts values to other types if specified.
         * @param message CreateReferenceRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: fqdp.CreateReferenceRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CreateReferenceRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for CreateReferenceRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an UpdateReferenceRequest. */
    interface IUpdateReferenceRequest {

        /** UpdateReferenceRequest name */
        name?: (string|null);

        /** UpdateReferenceRequest link */
        link?: (string|null);

        /** UpdateReferenceRequest type */
        type?: (string|null);

        /** UpdateReferenceRequest externalUid */
        externalUid?: (string|null);

        /** UpdateReferenceRequest description */
        description?: (string|null);

        /** UpdateReferenceRequest metadataJson */
        metadataJson?: (string|null);

        /** UpdateReferenceRequest status */
        status?: (string|null);
    }

    /** Represents an UpdateReferenceRequest. */
    class UpdateReferenceRequest implements IUpdateReferenceRequest {

        /**
         * Constructs a new UpdateReferenceRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: fqdp.IUpdateReferenceRequest);

        /** UpdateReferenceRequest name. */
        public name: string;

        /** UpdateReferenceRequest link. */
        public link: string;

        /** UpdateReferenceRequest type. */
        public type: string;

        /** UpdateReferenceRequest externalUid. */
        public externalUid: string;

        /** UpdateReferenceRequest description. */
        public description: string;

        /** UpdateReferenceRequest metadataJson. */
        public metadataJson: string;

        /** UpdateReferenceRequest status. */
        public status: string;

        /**
         * Creates a new UpdateReferenceRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns UpdateReferenceRequest instance
         */
        public static create(properties?: fqdp.IUpdateReferenceRequest): fqdp.UpdateReferenceRequest;

        /**
         * Encodes the specified UpdateReferenceRequest message. Does not implicitly {@link fqdp.UpdateReferenceRequest.verify|verify} messages.
         * @param message UpdateReferenceRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: fqdp.IUpdateReferenceRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified UpdateReferenceRequest message, length delimited. Does not implicitly {@link fqdp.UpdateReferenceRequest.verify|verify} messages.
         * @param message UpdateReferenceRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: fqdp.IUpdateReferenceRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an UpdateReferenceRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns UpdateReferenceRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): fqdp.UpdateReferenceRequest;

        /**
         * Decodes an UpdateReferenceRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns UpdateReferenceRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): fqdp.UpdateReferenceRequest;

        /**
         * Verifies an UpdateReferenceRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an UpdateReferenceRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns UpdateReferenceRequest
         */
        public static fromObject(object: { [k: string]: any }): fqdp.UpdateReferenceRequest;

        /**
         * Creates a plain object from an UpdateReferenceRequest message. Also converts values to other types if specified.
         * @param message UpdateReferenceRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: fqdp.UpdateReferenceRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this UpdateReferenceRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for UpdateReferenceRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a Resource. */
    interface IResource {

        /** Resource id */
        id?: (string|null);

        /** Resource name */
        name?: (string|null);

        /** Resource slug */
        slug?: (string|null);

        /** Resource description */
        description?: (string|null);

        /** Resource status */
        status?: (fqdp.EntityStatus|null);

        /** Resource metadataJson */
        metadataJson?: (string|null);

        /** Resource resourceName */
        resourceName?: (string|null);

        /** Resource resourceType */
        resourceType?: (fqdp.ResourceType|null);

        /** Resource resourceUrl */
        resourceUrl?: (string|null);

        /** Resource resourceSize */
        resourceSize?: (number|null);

        /** Resource fqdpId */
        fqdpId?: (string|null);

        /** Resource externalLinksJson */
        externalLinksJson?: (string|null);

        /** Resource projectId */
        projectId?: (string|null);

        /** Resource projectName */
        projectName?: (string|null);

        /** Resource applicationId */
        applicationId?: (string|null);

        /** Resource applicationName */
        applicationName?: (string|null);

        /** Resource teamId */
        teamId?: (string|null);

        /** Resource teamName */
        teamName?: (string|null);

        /** Resource workspaceId */
        workspaceId?: (string|null);

        /** Resource workspaceName */
        workspaceName?: (string|null);

        /** Resource organizationId */
        organizationId?: (string|null);

        /** Resource organizationName */
        organizationName?: (string|null);

        /** Resource createdBy */
        createdBy?: (string|null);

        /** Resource updatedBy */
        updatedBy?: (string|null);

        /** Resource createdAt */
        createdAt?: (string|null);

        /** Resource updatedAt */
        updatedAt?: (string|null);
    }

    /** Represents a Resource. */
    class Resource implements IResource {

        /**
         * Constructs a new Resource.
         * @param [properties] Properties to set
         */
        constructor(properties?: fqdp.IResource);

        /** Resource id. */
        public id: string;

        /** Resource name. */
        public name: string;

        /** Resource slug. */
        public slug: string;

        /** Resource description. */
        public description: string;

        /** Resource status. */
        public status: fqdp.EntityStatus;

        /** Resource metadataJson. */
        public metadataJson: string;

        /** Resource resourceName. */
        public resourceName: string;

        /** Resource resourceType. */
        public resourceType: fqdp.ResourceType;

        /** Resource resourceUrl. */
        public resourceUrl: string;

        /** Resource resourceSize. */
        public resourceSize: number;

        /** Resource fqdpId. */
        public fqdpId: string;

        /** Resource externalLinksJson. */
        public externalLinksJson: string;

        /** Resource projectId. */
        public projectId: string;

        /** Resource projectName. */
        public projectName: string;

        /** Resource applicationId. */
        public applicationId: string;

        /** Resource applicationName. */
        public applicationName: string;

        /** Resource teamId. */
        public teamId: string;

        /** Resource teamName. */
        public teamName: string;

        /** Resource workspaceId. */
        public workspaceId: string;

        /** Resource workspaceName. */
        public workspaceName: string;

        /** Resource organizationId. */
        public organizationId: string;

        /** Resource organizationName. */
        public organizationName: string;

        /** Resource createdBy. */
        public createdBy: string;

        /** Resource updatedBy. */
        public updatedBy: string;

        /** Resource createdAt. */
        public createdAt: string;

        /** Resource updatedAt. */
        public updatedAt: string;

        /**
         * Creates a new Resource instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Resource instance
         */
        public static create(properties?: fqdp.IResource): fqdp.Resource;

        /**
         * Encodes the specified Resource message. Does not implicitly {@link fqdp.Resource.verify|verify} messages.
         * @param message Resource message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: fqdp.IResource, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Resource message, length delimited. Does not implicitly {@link fqdp.Resource.verify|verify} messages.
         * @param message Resource message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: fqdp.IResource, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Resource message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Resource
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): fqdp.Resource;

        /**
         * Decodes a Resource message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Resource
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): fqdp.Resource;

        /**
         * Verifies a Resource message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Resource message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Resource
         */
        public static fromObject(object: { [k: string]: any }): fqdp.Resource;

        /**
         * Creates a plain object from a Resource message. Also converts values to other types if specified.
         * @param message Resource
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: fqdp.Resource, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Resource to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Resource
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a ResourceList. */
    interface IResourceList {

        /** ResourceList data */
        data?: (fqdp.IResource[]|null);

        /** ResourceList meta */
        meta?: (fqdp.IPaginationMeta|null);
    }

    /** Represents a ResourceList. */
    class ResourceList implements IResourceList {

        /**
         * Constructs a new ResourceList.
         * @param [properties] Properties to set
         */
        constructor(properties?: fqdp.IResourceList);

        /** ResourceList data. */
        public data: fqdp.IResource[];

        /** ResourceList meta. */
        public meta?: (fqdp.IPaginationMeta|null);

        /**
         * Creates a new ResourceList instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ResourceList instance
         */
        public static create(properties?: fqdp.IResourceList): fqdp.ResourceList;

        /**
         * Encodes the specified ResourceList message. Does not implicitly {@link fqdp.ResourceList.verify|verify} messages.
         * @param message ResourceList message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: fqdp.IResourceList, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ResourceList message, length delimited. Does not implicitly {@link fqdp.ResourceList.verify|verify} messages.
         * @param message ResourceList message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: fqdp.IResourceList, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ResourceList message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ResourceList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): fqdp.ResourceList;

        /**
         * Decodes a ResourceList message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ResourceList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): fqdp.ResourceList;

        /**
         * Verifies a ResourceList message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a ResourceList message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ResourceList
         */
        public static fromObject(object: { [k: string]: any }): fqdp.ResourceList;

        /**
         * Creates a plain object from a ResourceList message. Also converts values to other types if specified.
         * @param message ResourceList
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: fqdp.ResourceList, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ResourceList to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for ResourceList
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a CreateResourceRequest. */
    interface ICreateResourceRequest {

        /** CreateResourceRequest name */
        name?: (string|null);

        /** CreateResourceRequest description */
        description?: (string|null);

        /** CreateResourceRequest resourceName */
        resourceName?: (string|null);

        /** CreateResourceRequest resourceType */
        resourceType?: (fqdp.ResourceType|null);

        /** CreateResourceRequest resourceUrl */
        resourceUrl?: (string|null);

        /** CreateResourceRequest resourceSize */
        resourceSize?: (number|null);

        /** CreateResourceRequest projectId */
        projectId?: (string|null);

        /** CreateResourceRequest externalLinksJson */
        externalLinksJson?: (string|null);

        /** CreateResourceRequest metadataJson */
        metadataJson?: (string|null);
    }

    /** Represents a CreateResourceRequest. */
    class CreateResourceRequest implements ICreateResourceRequest {

        /**
         * Constructs a new CreateResourceRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: fqdp.ICreateResourceRequest);

        /** CreateResourceRequest name. */
        public name: string;

        /** CreateResourceRequest description. */
        public description: string;

        /** CreateResourceRequest resourceName. */
        public resourceName: string;

        /** CreateResourceRequest resourceType. */
        public resourceType: fqdp.ResourceType;

        /** CreateResourceRequest resourceUrl. */
        public resourceUrl: string;

        /** CreateResourceRequest resourceSize. */
        public resourceSize: number;

        /** CreateResourceRequest projectId. */
        public projectId: string;

        /** CreateResourceRequest externalLinksJson. */
        public externalLinksJson: string;

        /** CreateResourceRequest metadataJson. */
        public metadataJson: string;

        /**
         * Creates a new CreateResourceRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CreateResourceRequest instance
         */
        public static create(properties?: fqdp.ICreateResourceRequest): fqdp.CreateResourceRequest;

        /**
         * Encodes the specified CreateResourceRequest message. Does not implicitly {@link fqdp.CreateResourceRequest.verify|verify} messages.
         * @param message CreateResourceRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: fqdp.ICreateResourceRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CreateResourceRequest message, length delimited. Does not implicitly {@link fqdp.CreateResourceRequest.verify|verify} messages.
         * @param message CreateResourceRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: fqdp.ICreateResourceRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CreateResourceRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns CreateResourceRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): fqdp.CreateResourceRequest;

        /**
         * Decodes a CreateResourceRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns CreateResourceRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): fqdp.CreateResourceRequest;

        /**
         * Verifies a CreateResourceRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CreateResourceRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CreateResourceRequest
         */
        public static fromObject(object: { [k: string]: any }): fqdp.CreateResourceRequest;

        /**
         * Creates a plain object from a CreateResourceRequest message. Also converts values to other types if specified.
         * @param message CreateResourceRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: fqdp.CreateResourceRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CreateResourceRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for CreateResourceRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an UpdateResourceRequest. */
    interface IUpdateResourceRequest {

        /** UpdateResourceRequest name */
        name?: (string|null);

        /** UpdateResourceRequest description */
        description?: (string|null);

        /** UpdateResourceRequest status */
        status?: (fqdp.EntityStatus|null);

        /** UpdateResourceRequest resourceName */
        resourceName?: (string|null);

        /** UpdateResourceRequest resourceType */
        resourceType?: (fqdp.ResourceType|null);

        /** UpdateResourceRequest resourceUrl */
        resourceUrl?: (string|null);

        /** UpdateResourceRequest resourceSize */
        resourceSize?: (number|null);

        /** UpdateResourceRequest externalLinksJson */
        externalLinksJson?: (string|null);

        /** UpdateResourceRequest metadataJson */
        metadataJson?: (string|null);
    }

    /** Represents an UpdateResourceRequest. */
    class UpdateResourceRequest implements IUpdateResourceRequest {

        /**
         * Constructs a new UpdateResourceRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: fqdp.IUpdateResourceRequest);

        /** UpdateResourceRequest name. */
        public name: string;

        /** UpdateResourceRequest description. */
        public description: string;

        /** UpdateResourceRequest status. */
        public status: fqdp.EntityStatus;

        /** UpdateResourceRequest resourceName. */
        public resourceName: string;

        /** UpdateResourceRequest resourceType. */
        public resourceType: fqdp.ResourceType;

        /** UpdateResourceRequest resourceUrl. */
        public resourceUrl: string;

        /** UpdateResourceRequest resourceSize. */
        public resourceSize: number;

        /** UpdateResourceRequest externalLinksJson. */
        public externalLinksJson: string;

        /** UpdateResourceRequest metadataJson. */
        public metadataJson: string;

        /**
         * Creates a new UpdateResourceRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns UpdateResourceRequest instance
         */
        public static create(properties?: fqdp.IUpdateResourceRequest): fqdp.UpdateResourceRequest;

        /**
         * Encodes the specified UpdateResourceRequest message. Does not implicitly {@link fqdp.UpdateResourceRequest.verify|verify} messages.
         * @param message UpdateResourceRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: fqdp.IUpdateResourceRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified UpdateResourceRequest message, length delimited. Does not implicitly {@link fqdp.UpdateResourceRequest.verify|verify} messages.
         * @param message UpdateResourceRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: fqdp.IUpdateResourceRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an UpdateResourceRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns UpdateResourceRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): fqdp.UpdateResourceRequest;

        /**
         * Decodes an UpdateResourceRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns UpdateResourceRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): fqdp.UpdateResourceRequest;

        /**
         * Verifies an UpdateResourceRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an UpdateResourceRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns UpdateResourceRequest
         */
        public static fromObject(object: { [k: string]: any }): fqdp.UpdateResourceRequest;

        /**
         * Creates a plain object from an UpdateResourceRequest message. Also converts values to other types if specified.
         * @param message UpdateResourceRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: fqdp.UpdateResourceRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this UpdateResourceRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for UpdateResourceRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a Team. */
    interface ITeam {

        /** Team id */
        id?: (string|null);

        /** Team name */
        name?: (string|null);

        /** Team slug */
        slug?: (string|null);

        /** Team description */
        description?: (string|null);

        /** Team status */
        status?: (fqdp.EntityStatus|null);

        /** Team metadataJson */
        metadataJson?: (string|null);

        /** Team workspaceId */
        workspaceId?: (string|null);

        /** Team workspaceName */
        workspaceName?: (string|null);

        /** Team organizationId */
        organizationId?: (string|null);

        /** Team organizationName */
        organizationName?: (string|null);

        /** Team applicationCount */
        applicationCount?: (number|null);

        /** Team createdBy */
        createdBy?: (string|null);

        /** Team updatedBy */
        updatedBy?: (string|null);

        /** Team createdAt */
        createdAt?: (string|null);

        /** Team updatedAt */
        updatedAt?: (string|null);
    }

    /** Represents a Team. */
    class Team implements ITeam {

        /**
         * Constructs a new Team.
         * @param [properties] Properties to set
         */
        constructor(properties?: fqdp.ITeam);

        /** Team id. */
        public id: string;

        /** Team name. */
        public name: string;

        /** Team slug. */
        public slug: string;

        /** Team description. */
        public description: string;

        /** Team status. */
        public status: fqdp.EntityStatus;

        /** Team metadataJson. */
        public metadataJson: string;

        /** Team workspaceId. */
        public workspaceId: string;

        /** Team workspaceName. */
        public workspaceName: string;

        /** Team organizationId. */
        public organizationId: string;

        /** Team organizationName. */
        public organizationName: string;

        /** Team applicationCount. */
        public applicationCount: number;

        /** Team createdBy. */
        public createdBy: string;

        /** Team updatedBy. */
        public updatedBy: string;

        /** Team createdAt. */
        public createdAt: string;

        /** Team updatedAt. */
        public updatedAt: string;

        /**
         * Creates a new Team instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Team instance
         */
        public static create(properties?: fqdp.ITeam): fqdp.Team;

        /**
         * Encodes the specified Team message. Does not implicitly {@link fqdp.Team.verify|verify} messages.
         * @param message Team message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: fqdp.ITeam, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Team message, length delimited. Does not implicitly {@link fqdp.Team.verify|verify} messages.
         * @param message Team message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: fqdp.ITeam, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Team message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Team
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): fqdp.Team;

        /**
         * Decodes a Team message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Team
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): fqdp.Team;

        /**
         * Verifies a Team message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Team message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Team
         */
        public static fromObject(object: { [k: string]: any }): fqdp.Team;

        /**
         * Creates a plain object from a Team message. Also converts values to other types if specified.
         * @param message Team
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: fqdp.Team, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Team to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Team
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a TeamList. */
    interface ITeamList {

        /** TeamList data */
        data?: (fqdp.ITeam[]|null);

        /** TeamList meta */
        meta?: (fqdp.IPaginationMeta|null);
    }

    /** Represents a TeamList. */
    class TeamList implements ITeamList {

        /**
         * Constructs a new TeamList.
         * @param [properties] Properties to set
         */
        constructor(properties?: fqdp.ITeamList);

        /** TeamList data. */
        public data: fqdp.ITeam[];

        /** TeamList meta. */
        public meta?: (fqdp.IPaginationMeta|null);

        /**
         * Creates a new TeamList instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TeamList instance
         */
        public static create(properties?: fqdp.ITeamList): fqdp.TeamList;

        /**
         * Encodes the specified TeamList message. Does not implicitly {@link fqdp.TeamList.verify|verify} messages.
         * @param message TeamList message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: fqdp.ITeamList, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified TeamList message, length delimited. Does not implicitly {@link fqdp.TeamList.verify|verify} messages.
         * @param message TeamList message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: fqdp.ITeamList, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TeamList message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns TeamList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): fqdp.TeamList;

        /**
         * Decodes a TeamList message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns TeamList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): fqdp.TeamList;

        /**
         * Verifies a TeamList message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a TeamList message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns TeamList
         */
        public static fromObject(object: { [k: string]: any }): fqdp.TeamList;

        /**
         * Creates a plain object from a TeamList message. Also converts values to other types if specified.
         * @param message TeamList
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: fqdp.TeamList, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this TeamList to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for TeamList
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a CreateTeamRequest. */
    interface ICreateTeamRequest {

        /** CreateTeamRequest name */
        name?: (string|null);

        /** CreateTeamRequest description */
        description?: (string|null);

        /** CreateTeamRequest workspaceId */
        workspaceId?: (string|null);

        /** CreateTeamRequest metadataJson */
        metadataJson?: (string|null);
    }

    /** Represents a CreateTeamRequest. */
    class CreateTeamRequest implements ICreateTeamRequest {

        /**
         * Constructs a new CreateTeamRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: fqdp.ICreateTeamRequest);

        /** CreateTeamRequest name. */
        public name: string;

        /** CreateTeamRequest description. */
        public description: string;

        /** CreateTeamRequest workspaceId. */
        public workspaceId: string;

        /** CreateTeamRequest metadataJson. */
        public metadataJson: string;

        /**
         * Creates a new CreateTeamRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CreateTeamRequest instance
         */
        public static create(properties?: fqdp.ICreateTeamRequest): fqdp.CreateTeamRequest;

        /**
         * Encodes the specified CreateTeamRequest message. Does not implicitly {@link fqdp.CreateTeamRequest.verify|verify} messages.
         * @param message CreateTeamRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: fqdp.ICreateTeamRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CreateTeamRequest message, length delimited. Does not implicitly {@link fqdp.CreateTeamRequest.verify|verify} messages.
         * @param message CreateTeamRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: fqdp.ICreateTeamRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CreateTeamRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns CreateTeamRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): fqdp.CreateTeamRequest;

        /**
         * Decodes a CreateTeamRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns CreateTeamRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): fqdp.CreateTeamRequest;

        /**
         * Verifies a CreateTeamRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CreateTeamRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CreateTeamRequest
         */
        public static fromObject(object: { [k: string]: any }): fqdp.CreateTeamRequest;

        /**
         * Creates a plain object from a CreateTeamRequest message. Also converts values to other types if specified.
         * @param message CreateTeamRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: fqdp.CreateTeamRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CreateTeamRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for CreateTeamRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an UpdateTeamRequest. */
    interface IUpdateTeamRequest {

        /** UpdateTeamRequest name */
        name?: (string|null);

        /** UpdateTeamRequest description */
        description?: (string|null);

        /** UpdateTeamRequest status */
        status?: (fqdp.EntityStatus|null);

        /** UpdateTeamRequest metadataJson */
        metadataJson?: (string|null);
    }

    /** Represents an UpdateTeamRequest. */
    class UpdateTeamRequest implements IUpdateTeamRequest {

        /**
         * Constructs a new UpdateTeamRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: fqdp.IUpdateTeamRequest);

        /** UpdateTeamRequest name. */
        public name: string;

        /** UpdateTeamRequest description. */
        public description: string;

        /** UpdateTeamRequest status. */
        public status: fqdp.EntityStatus;

        /** UpdateTeamRequest metadataJson. */
        public metadataJson: string;

        /**
         * Creates a new UpdateTeamRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns UpdateTeamRequest instance
         */
        public static create(properties?: fqdp.IUpdateTeamRequest): fqdp.UpdateTeamRequest;

        /**
         * Encodes the specified UpdateTeamRequest message. Does not implicitly {@link fqdp.UpdateTeamRequest.verify|verify} messages.
         * @param message UpdateTeamRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: fqdp.IUpdateTeamRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified UpdateTeamRequest message, length delimited. Does not implicitly {@link fqdp.UpdateTeamRequest.verify|verify} messages.
         * @param message UpdateTeamRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: fqdp.IUpdateTeamRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an UpdateTeamRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns UpdateTeamRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): fqdp.UpdateTeamRequest;

        /**
         * Decodes an UpdateTeamRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns UpdateTeamRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): fqdp.UpdateTeamRequest;

        /**
         * Verifies an UpdateTeamRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an UpdateTeamRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns UpdateTeamRequest
         */
        public static fromObject(object: { [k: string]: any }): fqdp.UpdateTeamRequest;

        /**
         * Creates a plain object from an UpdateTeamRequest message. Also converts values to other types if specified.
         * @param message UpdateTeamRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: fqdp.UpdateTeamRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this UpdateTeamRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for UpdateTeamRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a Workspace. */
    interface IWorkspace {

        /** Workspace id */
        id?: (string|null);

        /** Workspace name */
        name?: (string|null);

        /** Workspace slug */
        slug?: (string|null);

        /** Workspace description */
        description?: (string|null);

        /** Workspace status */
        status?: (fqdp.EntityStatus|null);

        /** Workspace metadataJson */
        metadataJson?: (string|null);

        /** Workspace organizationId */
        organizationId?: (string|null);

        /** Workspace organizationName */
        organizationName?: (string|null);

        /** Workspace teamCount */
        teamCount?: (number|null);

        /** Workspace createdBy */
        createdBy?: (string|null);

        /** Workspace updatedBy */
        updatedBy?: (string|null);

        /** Workspace createdAt */
        createdAt?: (string|null);

        /** Workspace updatedAt */
        updatedAt?: (string|null);
    }

    /** Represents a Workspace. */
    class Workspace implements IWorkspace {

        /**
         * Constructs a new Workspace.
         * @param [properties] Properties to set
         */
        constructor(properties?: fqdp.IWorkspace);

        /** Workspace id. */
        public id: string;

        /** Workspace name. */
        public name: string;

        /** Workspace slug. */
        public slug: string;

        /** Workspace description. */
        public description: string;

        /** Workspace status. */
        public status: fqdp.EntityStatus;

        /** Workspace metadataJson. */
        public metadataJson: string;

        /** Workspace organizationId. */
        public organizationId: string;

        /** Workspace organizationName. */
        public organizationName: string;

        /** Workspace teamCount. */
        public teamCount: number;

        /** Workspace createdBy. */
        public createdBy: string;

        /** Workspace updatedBy. */
        public updatedBy: string;

        /** Workspace createdAt. */
        public createdAt: string;

        /** Workspace updatedAt. */
        public updatedAt: string;

        /**
         * Creates a new Workspace instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Workspace instance
         */
        public static create(properties?: fqdp.IWorkspace): fqdp.Workspace;

        /**
         * Encodes the specified Workspace message. Does not implicitly {@link fqdp.Workspace.verify|verify} messages.
         * @param message Workspace message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: fqdp.IWorkspace, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Workspace message, length delimited. Does not implicitly {@link fqdp.Workspace.verify|verify} messages.
         * @param message Workspace message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: fqdp.IWorkspace, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Workspace message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Workspace
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): fqdp.Workspace;

        /**
         * Decodes a Workspace message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Workspace
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): fqdp.Workspace;

        /**
         * Verifies a Workspace message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Workspace message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Workspace
         */
        public static fromObject(object: { [k: string]: any }): fqdp.Workspace;

        /**
         * Creates a plain object from a Workspace message. Also converts values to other types if specified.
         * @param message Workspace
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: fqdp.Workspace, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Workspace to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Workspace
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a WorkspaceList. */
    interface IWorkspaceList {

        /** WorkspaceList data */
        data?: (fqdp.IWorkspace[]|null);

        /** WorkspaceList meta */
        meta?: (fqdp.IPaginationMeta|null);
    }

    /** Represents a WorkspaceList. */
    class WorkspaceList implements IWorkspaceList {

        /**
         * Constructs a new WorkspaceList.
         * @param [properties] Properties to set
         */
        constructor(properties?: fqdp.IWorkspaceList);

        /** WorkspaceList data. */
        public data: fqdp.IWorkspace[];

        /** WorkspaceList meta. */
        public meta?: (fqdp.IPaginationMeta|null);

        /**
         * Creates a new WorkspaceList instance using the specified properties.
         * @param [properties] Properties to set
         * @returns WorkspaceList instance
         */
        public static create(properties?: fqdp.IWorkspaceList): fqdp.WorkspaceList;

        /**
         * Encodes the specified WorkspaceList message. Does not implicitly {@link fqdp.WorkspaceList.verify|verify} messages.
         * @param message WorkspaceList message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: fqdp.IWorkspaceList, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified WorkspaceList message, length delimited. Does not implicitly {@link fqdp.WorkspaceList.verify|verify} messages.
         * @param message WorkspaceList message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: fqdp.IWorkspaceList, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a WorkspaceList message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns WorkspaceList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): fqdp.WorkspaceList;

        /**
         * Decodes a WorkspaceList message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns WorkspaceList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): fqdp.WorkspaceList;

        /**
         * Verifies a WorkspaceList message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a WorkspaceList message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns WorkspaceList
         */
        public static fromObject(object: { [k: string]: any }): fqdp.WorkspaceList;

        /**
         * Creates a plain object from a WorkspaceList message. Also converts values to other types if specified.
         * @param message WorkspaceList
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: fqdp.WorkspaceList, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this WorkspaceList to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for WorkspaceList
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a CreateWorkspaceRequest. */
    interface ICreateWorkspaceRequest {

        /** CreateWorkspaceRequest name */
        name?: (string|null);

        /** CreateWorkspaceRequest description */
        description?: (string|null);

        /** CreateWorkspaceRequest organizationId */
        organizationId?: (string|null);

        /** CreateWorkspaceRequest metadataJson */
        metadataJson?: (string|null);
    }

    /** Represents a CreateWorkspaceRequest. */
    class CreateWorkspaceRequest implements ICreateWorkspaceRequest {

        /**
         * Constructs a new CreateWorkspaceRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: fqdp.ICreateWorkspaceRequest);

        /** CreateWorkspaceRequest name. */
        public name: string;

        /** CreateWorkspaceRequest description. */
        public description: string;

        /** CreateWorkspaceRequest organizationId. */
        public organizationId: string;

        /** CreateWorkspaceRequest metadataJson. */
        public metadataJson: string;

        /**
         * Creates a new CreateWorkspaceRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CreateWorkspaceRequest instance
         */
        public static create(properties?: fqdp.ICreateWorkspaceRequest): fqdp.CreateWorkspaceRequest;

        /**
         * Encodes the specified CreateWorkspaceRequest message. Does not implicitly {@link fqdp.CreateWorkspaceRequest.verify|verify} messages.
         * @param message CreateWorkspaceRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: fqdp.ICreateWorkspaceRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CreateWorkspaceRequest message, length delimited. Does not implicitly {@link fqdp.CreateWorkspaceRequest.verify|verify} messages.
         * @param message CreateWorkspaceRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: fqdp.ICreateWorkspaceRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CreateWorkspaceRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns CreateWorkspaceRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): fqdp.CreateWorkspaceRequest;

        /**
         * Decodes a CreateWorkspaceRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns CreateWorkspaceRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): fqdp.CreateWorkspaceRequest;

        /**
         * Verifies a CreateWorkspaceRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CreateWorkspaceRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CreateWorkspaceRequest
         */
        public static fromObject(object: { [k: string]: any }): fqdp.CreateWorkspaceRequest;

        /**
         * Creates a plain object from a CreateWorkspaceRequest message. Also converts values to other types if specified.
         * @param message CreateWorkspaceRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: fqdp.CreateWorkspaceRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CreateWorkspaceRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for CreateWorkspaceRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an UpdateWorkspaceRequest. */
    interface IUpdateWorkspaceRequest {

        /** UpdateWorkspaceRequest name */
        name?: (string|null);

        /** UpdateWorkspaceRequest description */
        description?: (string|null);

        /** UpdateWorkspaceRequest status */
        status?: (fqdp.EntityStatus|null);

        /** UpdateWorkspaceRequest metadataJson */
        metadataJson?: (string|null);
    }

    /** Represents an UpdateWorkspaceRequest. */
    class UpdateWorkspaceRequest implements IUpdateWorkspaceRequest {

        /**
         * Constructs a new UpdateWorkspaceRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: fqdp.IUpdateWorkspaceRequest);

        /** UpdateWorkspaceRequest name. */
        public name: string;

        /** UpdateWorkspaceRequest description. */
        public description: string;

        /** UpdateWorkspaceRequest status. */
        public status: fqdp.EntityStatus;

        /** UpdateWorkspaceRequest metadataJson. */
        public metadataJson: string;

        /**
         * Creates a new UpdateWorkspaceRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns UpdateWorkspaceRequest instance
         */
        public static create(properties?: fqdp.IUpdateWorkspaceRequest): fqdp.UpdateWorkspaceRequest;

        /**
         * Encodes the specified UpdateWorkspaceRequest message. Does not implicitly {@link fqdp.UpdateWorkspaceRequest.verify|verify} messages.
         * @param message UpdateWorkspaceRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: fqdp.IUpdateWorkspaceRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified UpdateWorkspaceRequest message, length delimited. Does not implicitly {@link fqdp.UpdateWorkspaceRequest.verify|verify} messages.
         * @param message UpdateWorkspaceRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: fqdp.IUpdateWorkspaceRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an UpdateWorkspaceRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns UpdateWorkspaceRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): fqdp.UpdateWorkspaceRequest;

        /**
         * Decodes an UpdateWorkspaceRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns UpdateWorkspaceRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): fqdp.UpdateWorkspaceRequest;

        /**
         * Verifies an UpdateWorkspaceRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an UpdateWorkspaceRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns UpdateWorkspaceRequest
         */
        public static fromObject(object: { [k: string]: any }): fqdp.UpdateWorkspaceRequest;

        /**
         * Creates a plain object from an UpdateWorkspaceRequest message. Also converts values to other types if specified.
         * @param message UpdateWorkspaceRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: fqdp.UpdateWorkspaceRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this UpdateWorkspaceRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for UpdateWorkspaceRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }
}
