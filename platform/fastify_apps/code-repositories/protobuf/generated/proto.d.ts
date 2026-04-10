import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace code_repositories. */
export namespace code_repositories {

    /** Namespace repository. */
    namespace repository {

        /** Properties of a Repository. */
        interface IRepository {

            /** Repository id */
            id?: (string|null);

            /** Repository name */
            name?: (string|null);

            /** Repository description */
            description?: (string|null);

            /** Repository type */
            type?: (code_repositories.common.RepositoryType|null);

            /** Repository githubUrl */
            githubUrl?: (string|null);

            /** Repository packageUrl */
            packageUrl?: (string|null);

            /** Repository stars */
            stars?: (number|null);

            /** Repository forks */
            forks?: (number|null);

            /** Repository version */
            version?: (string|null);

            /** Repository maintainer */
            maintainer?: (string|null);

            /** Repository lastUpdated */
            lastUpdated?: (string|null);

            /** Repository trending */
            trending?: (boolean|null);

            /** Repository verified */
            verified?: (boolean|null);

            /** Repository language */
            language?: (string|null);

            /** Repository license */
            license?: (string|null);

            /** Repository size */
            size?: (string|null);

            /** Repository dependencies */
            dependencies?: (number|null);

            /** Repository healthScore */
            healthScore?: (number|null);

            /** Repository status */
            status?: (code_repositories.common.RepositoryStatus|null);

            /** Repository source */
            source?: (code_repositories.common.RepositorySource|null);

            /** Repository externalIds */
            externalIds?: (code_repositories.common.IExternalId[]|null);

            /** Repository tags */
            tags?: (code_repositories.tag.ITag[]|null);

            /** Repository metadata */
            metadata?: (code_repositories.metadata.IMetadata[]|null);

            /** Repository createdAt */
            createdAt?: (code_repositories.common.ITimestamp|null);

            /** Repository updatedAt */
            updatedAt?: (code_repositories.common.ITimestamp|null);
        }

        /** Represents a Repository. */
        class Repository implements IRepository {

            /**
             * Constructs a new Repository.
             * @param [properties] Properties to set
             */
            constructor(properties?: code_repositories.repository.IRepository);

            /** Repository id. */
            public id: string;

            /** Repository name. */
            public name: string;

            /** Repository description. */
            public description: string;

            /** Repository type. */
            public type: code_repositories.common.RepositoryType;

            /** Repository githubUrl. */
            public githubUrl: string;

            /** Repository packageUrl. */
            public packageUrl: string;

            /** Repository stars. */
            public stars: number;

            /** Repository forks. */
            public forks: number;

            /** Repository version. */
            public version: string;

            /** Repository maintainer. */
            public maintainer: string;

            /** Repository lastUpdated. */
            public lastUpdated: string;

            /** Repository trending. */
            public trending: boolean;

            /** Repository verified. */
            public verified: boolean;

            /** Repository language. */
            public language: string;

            /** Repository license. */
            public license: string;

            /** Repository size. */
            public size: string;

            /** Repository dependencies. */
            public dependencies: number;

            /** Repository healthScore. */
            public healthScore: number;

            /** Repository status. */
            public status: code_repositories.common.RepositoryStatus;

            /** Repository source. */
            public source: code_repositories.common.RepositorySource;

            /** Repository externalIds. */
            public externalIds: code_repositories.common.IExternalId[];

            /** Repository tags. */
            public tags: code_repositories.tag.ITag[];

            /** Repository metadata. */
            public metadata: code_repositories.metadata.IMetadata[];

            /** Repository createdAt. */
            public createdAt?: (code_repositories.common.ITimestamp|null);

            /** Repository updatedAt. */
            public updatedAt?: (code_repositories.common.ITimestamp|null);

            /**
             * Creates a new Repository instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Repository instance
             */
            public static create(properties?: code_repositories.repository.IRepository): code_repositories.repository.Repository;

            /**
             * Encodes the specified Repository message. Does not implicitly {@link code_repositories.repository.Repository.verify|verify} messages.
             * @param message Repository message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: code_repositories.repository.IRepository, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Repository message, length delimited. Does not implicitly {@link code_repositories.repository.Repository.verify|verify} messages.
             * @param message Repository message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: code_repositories.repository.IRepository, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Repository message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Repository
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): code_repositories.repository.Repository;

            /**
             * Decodes a Repository message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Repository
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): code_repositories.repository.Repository;

            /**
             * Verifies a Repository message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Repository message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Repository
             */
            public static fromObject(object: { [k: string]: any }): code_repositories.repository.Repository;

            /**
             * Creates a plain object from a Repository message. Also converts values to other types if specified.
             * @param message Repository
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: code_repositories.repository.Repository, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Repository to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Repository
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a ListRepositoriesRequest. */
        interface IListRepositoriesRequest {

            /** ListRepositoriesRequest pagination */
            pagination?: (code_repositories.common.IPaginationRequest|null);

            /** ListRepositoriesRequest type */
            type?: (code_repositories.common.RepositoryType|null);

            /** ListRepositoriesRequest status */
            status?: (code_repositories.common.RepositoryStatus|null);

            /** ListRepositoriesRequest search */
            search?: (string|null);

            /** ListRepositoriesRequest tags */
            tags?: (string[]|null);

            /** ListRepositoriesRequest trending */
            trending?: (boolean|null);

            /** ListRepositoriesRequest verified */
            verified?: (boolean|null);

            /** ListRepositoriesRequest includeTags */
            includeTags?: (boolean|null);

            /** ListRepositoriesRequest includeMetadata */
            includeMetadata?: (boolean|null);
        }

        /** Represents a ListRepositoriesRequest. */
        class ListRepositoriesRequest implements IListRepositoriesRequest {

            /**
             * Constructs a new ListRepositoriesRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: code_repositories.repository.IListRepositoriesRequest);

            /** ListRepositoriesRequest pagination. */
            public pagination?: (code_repositories.common.IPaginationRequest|null);

            /** ListRepositoriesRequest type. */
            public type: code_repositories.common.RepositoryType;

            /** ListRepositoriesRequest status. */
            public status: code_repositories.common.RepositoryStatus;

            /** ListRepositoriesRequest search. */
            public search: string;

            /** ListRepositoriesRequest tags. */
            public tags: string[];

            /** ListRepositoriesRequest trending. */
            public trending: boolean;

            /** ListRepositoriesRequest verified. */
            public verified: boolean;

            /** ListRepositoriesRequest includeTags. */
            public includeTags: boolean;

            /** ListRepositoriesRequest includeMetadata. */
            public includeMetadata: boolean;

            /**
             * Creates a new ListRepositoriesRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ListRepositoriesRequest instance
             */
            public static create(properties?: code_repositories.repository.IListRepositoriesRequest): code_repositories.repository.ListRepositoriesRequest;

            /**
             * Encodes the specified ListRepositoriesRequest message. Does not implicitly {@link code_repositories.repository.ListRepositoriesRequest.verify|verify} messages.
             * @param message ListRepositoriesRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: code_repositories.repository.IListRepositoriesRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ListRepositoriesRequest message, length delimited. Does not implicitly {@link code_repositories.repository.ListRepositoriesRequest.verify|verify} messages.
             * @param message ListRepositoriesRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: code_repositories.repository.IListRepositoriesRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ListRepositoriesRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ListRepositoriesRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): code_repositories.repository.ListRepositoriesRequest;

            /**
             * Decodes a ListRepositoriesRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ListRepositoriesRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): code_repositories.repository.ListRepositoriesRequest;

            /**
             * Verifies a ListRepositoriesRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ListRepositoriesRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ListRepositoriesRequest
             */
            public static fromObject(object: { [k: string]: any }): code_repositories.repository.ListRepositoriesRequest;

            /**
             * Creates a plain object from a ListRepositoriesRequest message. Also converts values to other types if specified.
             * @param message ListRepositoriesRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: code_repositories.repository.ListRepositoriesRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ListRepositoriesRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for ListRepositoriesRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a ListRepositoriesResponse. */
        interface IListRepositoriesResponse {

            /** ListRepositoriesResponse repositories */
            repositories?: (code_repositories.repository.IRepository[]|null);

            /** ListRepositoriesResponse pagination */
            pagination?: (code_repositories.common.IPaginationResponse|null);
        }

        /** Represents a ListRepositoriesResponse. */
        class ListRepositoriesResponse implements IListRepositoriesResponse {

            /**
             * Constructs a new ListRepositoriesResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: code_repositories.repository.IListRepositoriesResponse);

            /** ListRepositoriesResponse repositories. */
            public repositories: code_repositories.repository.IRepository[];

            /** ListRepositoriesResponse pagination. */
            public pagination?: (code_repositories.common.IPaginationResponse|null);

            /**
             * Creates a new ListRepositoriesResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ListRepositoriesResponse instance
             */
            public static create(properties?: code_repositories.repository.IListRepositoriesResponse): code_repositories.repository.ListRepositoriesResponse;

            /**
             * Encodes the specified ListRepositoriesResponse message. Does not implicitly {@link code_repositories.repository.ListRepositoriesResponse.verify|verify} messages.
             * @param message ListRepositoriesResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: code_repositories.repository.IListRepositoriesResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ListRepositoriesResponse message, length delimited. Does not implicitly {@link code_repositories.repository.ListRepositoriesResponse.verify|verify} messages.
             * @param message ListRepositoriesResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: code_repositories.repository.IListRepositoriesResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ListRepositoriesResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ListRepositoriesResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): code_repositories.repository.ListRepositoriesResponse;

            /**
             * Decodes a ListRepositoriesResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ListRepositoriesResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): code_repositories.repository.ListRepositoriesResponse;

            /**
             * Verifies a ListRepositoriesResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ListRepositoriesResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ListRepositoriesResponse
             */
            public static fromObject(object: { [k: string]: any }): code_repositories.repository.ListRepositoriesResponse;

            /**
             * Creates a plain object from a ListRepositoriesResponse message. Also converts values to other types if specified.
             * @param message ListRepositoriesResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: code_repositories.repository.ListRepositoriesResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ListRepositoriesResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for ListRepositoriesResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a GetRepositoryRequest. */
        interface IGetRepositoryRequest {

            /** GetRepositoryRequest id */
            id?: (string|null);

            /** GetRepositoryRequest includeTags */
            includeTags?: (boolean|null);

            /** GetRepositoryRequest includeMetadata */
            includeMetadata?: (boolean|null);
        }

        /** Represents a GetRepositoryRequest. */
        class GetRepositoryRequest implements IGetRepositoryRequest {

            /**
             * Constructs a new GetRepositoryRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: code_repositories.repository.IGetRepositoryRequest);

            /** GetRepositoryRequest id. */
            public id: string;

            /** GetRepositoryRequest includeTags. */
            public includeTags: boolean;

            /** GetRepositoryRequest includeMetadata. */
            public includeMetadata: boolean;

            /**
             * Creates a new GetRepositoryRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns GetRepositoryRequest instance
             */
            public static create(properties?: code_repositories.repository.IGetRepositoryRequest): code_repositories.repository.GetRepositoryRequest;

            /**
             * Encodes the specified GetRepositoryRequest message. Does not implicitly {@link code_repositories.repository.GetRepositoryRequest.verify|verify} messages.
             * @param message GetRepositoryRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: code_repositories.repository.IGetRepositoryRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified GetRepositoryRequest message, length delimited. Does not implicitly {@link code_repositories.repository.GetRepositoryRequest.verify|verify} messages.
             * @param message GetRepositoryRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: code_repositories.repository.IGetRepositoryRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a GetRepositoryRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns GetRepositoryRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): code_repositories.repository.GetRepositoryRequest;

            /**
             * Decodes a GetRepositoryRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns GetRepositoryRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): code_repositories.repository.GetRepositoryRequest;

            /**
             * Verifies a GetRepositoryRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a GetRepositoryRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns GetRepositoryRequest
             */
            public static fromObject(object: { [k: string]: any }): code_repositories.repository.GetRepositoryRequest;

            /**
             * Creates a plain object from a GetRepositoryRequest message. Also converts values to other types if specified.
             * @param message GetRepositoryRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: code_repositories.repository.GetRepositoryRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this GetRepositoryRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for GetRepositoryRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a GetRepositoryResponse. */
        interface IGetRepositoryResponse {

            /** GetRepositoryResponse repository */
            repository?: (code_repositories.repository.IRepository|null);
        }

        /** Represents a GetRepositoryResponse. */
        class GetRepositoryResponse implements IGetRepositoryResponse {

            /**
             * Constructs a new GetRepositoryResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: code_repositories.repository.IGetRepositoryResponse);

            /** GetRepositoryResponse repository. */
            public repository?: (code_repositories.repository.IRepository|null);

            /**
             * Creates a new GetRepositoryResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns GetRepositoryResponse instance
             */
            public static create(properties?: code_repositories.repository.IGetRepositoryResponse): code_repositories.repository.GetRepositoryResponse;

            /**
             * Encodes the specified GetRepositoryResponse message. Does not implicitly {@link code_repositories.repository.GetRepositoryResponse.verify|verify} messages.
             * @param message GetRepositoryResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: code_repositories.repository.IGetRepositoryResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified GetRepositoryResponse message, length delimited. Does not implicitly {@link code_repositories.repository.GetRepositoryResponse.verify|verify} messages.
             * @param message GetRepositoryResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: code_repositories.repository.IGetRepositoryResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a GetRepositoryResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns GetRepositoryResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): code_repositories.repository.GetRepositoryResponse;

            /**
             * Decodes a GetRepositoryResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns GetRepositoryResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): code_repositories.repository.GetRepositoryResponse;

            /**
             * Verifies a GetRepositoryResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a GetRepositoryResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns GetRepositoryResponse
             */
            public static fromObject(object: { [k: string]: any }): code_repositories.repository.GetRepositoryResponse;

            /**
             * Creates a plain object from a GetRepositoryResponse message. Also converts values to other types if specified.
             * @param message GetRepositoryResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: code_repositories.repository.GetRepositoryResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this GetRepositoryResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for GetRepositoryResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a CreateRepositoryRequest. */
        interface ICreateRepositoryRequest {

            /** CreateRepositoryRequest name */
            name?: (string|null);

            /** CreateRepositoryRequest description */
            description?: (string|null);

            /** CreateRepositoryRequest type */
            type?: (code_repositories.common.RepositoryType|null);

            /** CreateRepositoryRequest githubUrl */
            githubUrl?: (string|null);

            /** CreateRepositoryRequest packageUrl */
            packageUrl?: (string|null);

            /** CreateRepositoryRequest stars */
            stars?: (number|null);

            /** CreateRepositoryRequest forks */
            forks?: (number|null);

            /** CreateRepositoryRequest version */
            version?: (string|null);

            /** CreateRepositoryRequest maintainer */
            maintainer?: (string|null);

            /** CreateRepositoryRequest lastUpdated */
            lastUpdated?: (string|null);

            /** CreateRepositoryRequest trending */
            trending?: (boolean|null);

            /** CreateRepositoryRequest verified */
            verified?: (boolean|null);

            /** CreateRepositoryRequest language */
            language?: (string|null);

            /** CreateRepositoryRequest license */
            license?: (string|null);

            /** CreateRepositoryRequest size */
            size?: (string|null);

            /** CreateRepositoryRequest dependencies */
            dependencies?: (number|null);

            /** CreateRepositoryRequest healthScore */
            healthScore?: (number|null);

            /** CreateRepositoryRequest status */
            status?: (code_repositories.common.RepositoryStatus|null);

            /** CreateRepositoryRequest source */
            source?: (code_repositories.common.RepositorySource|null);

            /** CreateRepositoryRequest externalIds */
            externalIds?: (code_repositories.common.IExternalId[]|null);

            /** CreateRepositoryRequest tagNames */
            tagNames?: (string[]|null);
        }

        /** Represents a CreateRepositoryRequest. */
        class CreateRepositoryRequest implements ICreateRepositoryRequest {

            /**
             * Constructs a new CreateRepositoryRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: code_repositories.repository.ICreateRepositoryRequest);

            /** CreateRepositoryRequest name. */
            public name: string;

            /** CreateRepositoryRequest description. */
            public description: string;

            /** CreateRepositoryRequest type. */
            public type: code_repositories.common.RepositoryType;

            /** CreateRepositoryRequest githubUrl. */
            public githubUrl: string;

            /** CreateRepositoryRequest packageUrl. */
            public packageUrl: string;

            /** CreateRepositoryRequest stars. */
            public stars: number;

            /** CreateRepositoryRequest forks. */
            public forks: number;

            /** CreateRepositoryRequest version. */
            public version: string;

            /** CreateRepositoryRequest maintainer. */
            public maintainer: string;

            /** CreateRepositoryRequest lastUpdated. */
            public lastUpdated: string;

            /** CreateRepositoryRequest trending. */
            public trending: boolean;

            /** CreateRepositoryRequest verified. */
            public verified: boolean;

            /** CreateRepositoryRequest language. */
            public language: string;

            /** CreateRepositoryRequest license. */
            public license: string;

            /** CreateRepositoryRequest size. */
            public size: string;

            /** CreateRepositoryRequest dependencies. */
            public dependencies: number;

            /** CreateRepositoryRequest healthScore. */
            public healthScore: number;

            /** CreateRepositoryRequest status. */
            public status: code_repositories.common.RepositoryStatus;

            /** CreateRepositoryRequest source. */
            public source: code_repositories.common.RepositorySource;

            /** CreateRepositoryRequest externalIds. */
            public externalIds: code_repositories.common.IExternalId[];

            /** CreateRepositoryRequest tagNames. */
            public tagNames: string[];

            /**
             * Creates a new CreateRepositoryRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns CreateRepositoryRequest instance
             */
            public static create(properties?: code_repositories.repository.ICreateRepositoryRequest): code_repositories.repository.CreateRepositoryRequest;

            /**
             * Encodes the specified CreateRepositoryRequest message. Does not implicitly {@link code_repositories.repository.CreateRepositoryRequest.verify|verify} messages.
             * @param message CreateRepositoryRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: code_repositories.repository.ICreateRepositoryRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified CreateRepositoryRequest message, length delimited. Does not implicitly {@link code_repositories.repository.CreateRepositoryRequest.verify|verify} messages.
             * @param message CreateRepositoryRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: code_repositories.repository.ICreateRepositoryRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a CreateRepositoryRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns CreateRepositoryRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): code_repositories.repository.CreateRepositoryRequest;

            /**
             * Decodes a CreateRepositoryRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns CreateRepositoryRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): code_repositories.repository.CreateRepositoryRequest;

            /**
             * Verifies a CreateRepositoryRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a CreateRepositoryRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns CreateRepositoryRequest
             */
            public static fromObject(object: { [k: string]: any }): code_repositories.repository.CreateRepositoryRequest;

            /**
             * Creates a plain object from a CreateRepositoryRequest message. Also converts values to other types if specified.
             * @param message CreateRepositoryRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: code_repositories.repository.CreateRepositoryRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this CreateRepositoryRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for CreateRepositoryRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a CreateRepositoryResponse. */
        interface ICreateRepositoryResponse {

            /** CreateRepositoryResponse repository */
            repository?: (code_repositories.repository.IRepository|null);
        }

        /** Represents a CreateRepositoryResponse. */
        class CreateRepositoryResponse implements ICreateRepositoryResponse {

            /**
             * Constructs a new CreateRepositoryResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: code_repositories.repository.ICreateRepositoryResponse);

            /** CreateRepositoryResponse repository. */
            public repository?: (code_repositories.repository.IRepository|null);

            /**
             * Creates a new CreateRepositoryResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns CreateRepositoryResponse instance
             */
            public static create(properties?: code_repositories.repository.ICreateRepositoryResponse): code_repositories.repository.CreateRepositoryResponse;

            /**
             * Encodes the specified CreateRepositoryResponse message. Does not implicitly {@link code_repositories.repository.CreateRepositoryResponse.verify|verify} messages.
             * @param message CreateRepositoryResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: code_repositories.repository.ICreateRepositoryResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified CreateRepositoryResponse message, length delimited. Does not implicitly {@link code_repositories.repository.CreateRepositoryResponse.verify|verify} messages.
             * @param message CreateRepositoryResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: code_repositories.repository.ICreateRepositoryResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a CreateRepositoryResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns CreateRepositoryResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): code_repositories.repository.CreateRepositoryResponse;

            /**
             * Decodes a CreateRepositoryResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns CreateRepositoryResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): code_repositories.repository.CreateRepositoryResponse;

            /**
             * Verifies a CreateRepositoryResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a CreateRepositoryResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns CreateRepositoryResponse
             */
            public static fromObject(object: { [k: string]: any }): code_repositories.repository.CreateRepositoryResponse;

            /**
             * Creates a plain object from a CreateRepositoryResponse message. Also converts values to other types if specified.
             * @param message CreateRepositoryResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: code_repositories.repository.CreateRepositoryResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this CreateRepositoryResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for CreateRepositoryResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an UpdateRepositoryRequest. */
        interface IUpdateRepositoryRequest {

            /** UpdateRepositoryRequest id */
            id?: (string|null);

            /** UpdateRepositoryRequest name */
            name?: (string|null);

            /** UpdateRepositoryRequest description */
            description?: (string|null);

            /** UpdateRepositoryRequest type */
            type?: (code_repositories.common.RepositoryType|null);

            /** UpdateRepositoryRequest githubUrl */
            githubUrl?: (string|null);

            /** UpdateRepositoryRequest packageUrl */
            packageUrl?: (string|null);

            /** UpdateRepositoryRequest stars */
            stars?: (number|null);

            /** UpdateRepositoryRequest forks */
            forks?: (number|null);

            /** UpdateRepositoryRequest version */
            version?: (string|null);

            /** UpdateRepositoryRequest maintainer */
            maintainer?: (string|null);

            /** UpdateRepositoryRequest lastUpdated */
            lastUpdated?: (string|null);

            /** UpdateRepositoryRequest trending */
            trending?: (boolean|null);

            /** UpdateRepositoryRequest verified */
            verified?: (boolean|null);

            /** UpdateRepositoryRequest language */
            language?: (string|null);

            /** UpdateRepositoryRequest license */
            license?: (string|null);

            /** UpdateRepositoryRequest size */
            size?: (string|null);

            /** UpdateRepositoryRequest dependencies */
            dependencies?: (number|null);

            /** UpdateRepositoryRequest healthScore */
            healthScore?: (number|null);

            /** UpdateRepositoryRequest status */
            status?: (code_repositories.common.RepositoryStatus|null);

            /** UpdateRepositoryRequest source */
            source?: (code_repositories.common.RepositorySource|null);

            /** UpdateRepositoryRequest externalIds */
            externalIds?: (code_repositories.common.IExternalId[]|null);

            /** UpdateRepositoryRequest tagNames */
            tagNames?: (string[]|null);
        }

        /** Represents an UpdateRepositoryRequest. */
        class UpdateRepositoryRequest implements IUpdateRepositoryRequest {

            /**
             * Constructs a new UpdateRepositoryRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: code_repositories.repository.IUpdateRepositoryRequest);

            /** UpdateRepositoryRequest id. */
            public id: string;

            /** UpdateRepositoryRequest name. */
            public name: string;

            /** UpdateRepositoryRequest description. */
            public description: string;

            /** UpdateRepositoryRequest type. */
            public type: code_repositories.common.RepositoryType;

            /** UpdateRepositoryRequest githubUrl. */
            public githubUrl: string;

            /** UpdateRepositoryRequest packageUrl. */
            public packageUrl: string;

            /** UpdateRepositoryRequest stars. */
            public stars: number;

            /** UpdateRepositoryRequest forks. */
            public forks: number;

            /** UpdateRepositoryRequest version. */
            public version: string;

            /** UpdateRepositoryRequest maintainer. */
            public maintainer: string;

            /** UpdateRepositoryRequest lastUpdated. */
            public lastUpdated: string;

            /** UpdateRepositoryRequest trending. */
            public trending: boolean;

            /** UpdateRepositoryRequest verified. */
            public verified: boolean;

            /** UpdateRepositoryRequest language. */
            public language: string;

            /** UpdateRepositoryRequest license. */
            public license: string;

            /** UpdateRepositoryRequest size. */
            public size: string;

            /** UpdateRepositoryRequest dependencies. */
            public dependencies: number;

            /** UpdateRepositoryRequest healthScore. */
            public healthScore: number;

            /** UpdateRepositoryRequest status. */
            public status: code_repositories.common.RepositoryStatus;

            /** UpdateRepositoryRequest source. */
            public source: code_repositories.common.RepositorySource;

            /** UpdateRepositoryRequest externalIds. */
            public externalIds: code_repositories.common.IExternalId[];

            /** UpdateRepositoryRequest tagNames. */
            public tagNames: string[];

            /**
             * Creates a new UpdateRepositoryRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns UpdateRepositoryRequest instance
             */
            public static create(properties?: code_repositories.repository.IUpdateRepositoryRequest): code_repositories.repository.UpdateRepositoryRequest;

            /**
             * Encodes the specified UpdateRepositoryRequest message. Does not implicitly {@link code_repositories.repository.UpdateRepositoryRequest.verify|verify} messages.
             * @param message UpdateRepositoryRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: code_repositories.repository.IUpdateRepositoryRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified UpdateRepositoryRequest message, length delimited. Does not implicitly {@link code_repositories.repository.UpdateRepositoryRequest.verify|verify} messages.
             * @param message UpdateRepositoryRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: code_repositories.repository.IUpdateRepositoryRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an UpdateRepositoryRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns UpdateRepositoryRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): code_repositories.repository.UpdateRepositoryRequest;

            /**
             * Decodes an UpdateRepositoryRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns UpdateRepositoryRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): code_repositories.repository.UpdateRepositoryRequest;

            /**
             * Verifies an UpdateRepositoryRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an UpdateRepositoryRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns UpdateRepositoryRequest
             */
            public static fromObject(object: { [k: string]: any }): code_repositories.repository.UpdateRepositoryRequest;

            /**
             * Creates a plain object from an UpdateRepositoryRequest message. Also converts values to other types if specified.
             * @param message UpdateRepositoryRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: code_repositories.repository.UpdateRepositoryRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this UpdateRepositoryRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for UpdateRepositoryRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an UpdateRepositoryResponse. */
        interface IUpdateRepositoryResponse {

            /** UpdateRepositoryResponse repository */
            repository?: (code_repositories.repository.IRepository|null);
        }

        /** Represents an UpdateRepositoryResponse. */
        class UpdateRepositoryResponse implements IUpdateRepositoryResponse {

            /**
             * Constructs a new UpdateRepositoryResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: code_repositories.repository.IUpdateRepositoryResponse);

            /** UpdateRepositoryResponse repository. */
            public repository?: (code_repositories.repository.IRepository|null);

            /**
             * Creates a new UpdateRepositoryResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns UpdateRepositoryResponse instance
             */
            public static create(properties?: code_repositories.repository.IUpdateRepositoryResponse): code_repositories.repository.UpdateRepositoryResponse;

            /**
             * Encodes the specified UpdateRepositoryResponse message. Does not implicitly {@link code_repositories.repository.UpdateRepositoryResponse.verify|verify} messages.
             * @param message UpdateRepositoryResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: code_repositories.repository.IUpdateRepositoryResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified UpdateRepositoryResponse message, length delimited. Does not implicitly {@link code_repositories.repository.UpdateRepositoryResponse.verify|verify} messages.
             * @param message UpdateRepositoryResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: code_repositories.repository.IUpdateRepositoryResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an UpdateRepositoryResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns UpdateRepositoryResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): code_repositories.repository.UpdateRepositoryResponse;

            /**
             * Decodes an UpdateRepositoryResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns UpdateRepositoryResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): code_repositories.repository.UpdateRepositoryResponse;

            /**
             * Verifies an UpdateRepositoryResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an UpdateRepositoryResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns UpdateRepositoryResponse
             */
            public static fromObject(object: { [k: string]: any }): code_repositories.repository.UpdateRepositoryResponse;

            /**
             * Creates a plain object from an UpdateRepositoryResponse message. Also converts values to other types if specified.
             * @param message UpdateRepositoryResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: code_repositories.repository.UpdateRepositoryResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this UpdateRepositoryResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for UpdateRepositoryResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a DeleteRepositoryRequest. */
        interface IDeleteRepositoryRequest {

            /** DeleteRepositoryRequest id */
            id?: (string|null);
        }

        /** Represents a DeleteRepositoryRequest. */
        class DeleteRepositoryRequest implements IDeleteRepositoryRequest {

            /**
             * Constructs a new DeleteRepositoryRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: code_repositories.repository.IDeleteRepositoryRequest);

            /** DeleteRepositoryRequest id. */
            public id: string;

            /**
             * Creates a new DeleteRepositoryRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns DeleteRepositoryRequest instance
             */
            public static create(properties?: code_repositories.repository.IDeleteRepositoryRequest): code_repositories.repository.DeleteRepositoryRequest;

            /**
             * Encodes the specified DeleteRepositoryRequest message. Does not implicitly {@link code_repositories.repository.DeleteRepositoryRequest.verify|verify} messages.
             * @param message DeleteRepositoryRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: code_repositories.repository.IDeleteRepositoryRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified DeleteRepositoryRequest message, length delimited. Does not implicitly {@link code_repositories.repository.DeleteRepositoryRequest.verify|verify} messages.
             * @param message DeleteRepositoryRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: code_repositories.repository.IDeleteRepositoryRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DeleteRepositoryRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns DeleteRepositoryRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): code_repositories.repository.DeleteRepositoryRequest;

            /**
             * Decodes a DeleteRepositoryRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns DeleteRepositoryRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): code_repositories.repository.DeleteRepositoryRequest;

            /**
             * Verifies a DeleteRepositoryRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a DeleteRepositoryRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns DeleteRepositoryRequest
             */
            public static fromObject(object: { [k: string]: any }): code_repositories.repository.DeleteRepositoryRequest;

            /**
             * Creates a plain object from a DeleteRepositoryRequest message. Also converts values to other types if specified.
             * @param message DeleteRepositoryRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: code_repositories.repository.DeleteRepositoryRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this DeleteRepositoryRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for DeleteRepositoryRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a DeleteRepositoryResponse. */
        interface IDeleteRepositoryResponse {

            /** DeleteRepositoryResponse success */
            success?: (boolean|null);
        }

        /** Represents a DeleteRepositoryResponse. */
        class DeleteRepositoryResponse implements IDeleteRepositoryResponse {

            /**
             * Constructs a new DeleteRepositoryResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: code_repositories.repository.IDeleteRepositoryResponse);

            /** DeleteRepositoryResponse success. */
            public success: boolean;

            /**
             * Creates a new DeleteRepositoryResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns DeleteRepositoryResponse instance
             */
            public static create(properties?: code_repositories.repository.IDeleteRepositoryResponse): code_repositories.repository.DeleteRepositoryResponse;

            /**
             * Encodes the specified DeleteRepositoryResponse message. Does not implicitly {@link code_repositories.repository.DeleteRepositoryResponse.verify|verify} messages.
             * @param message DeleteRepositoryResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: code_repositories.repository.IDeleteRepositoryResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified DeleteRepositoryResponse message, length delimited. Does not implicitly {@link code_repositories.repository.DeleteRepositoryResponse.verify|verify} messages.
             * @param message DeleteRepositoryResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: code_repositories.repository.IDeleteRepositoryResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DeleteRepositoryResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns DeleteRepositoryResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): code_repositories.repository.DeleteRepositoryResponse;

            /**
             * Decodes a DeleteRepositoryResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns DeleteRepositoryResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): code_repositories.repository.DeleteRepositoryResponse;

            /**
             * Verifies a DeleteRepositoryResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a DeleteRepositoryResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns DeleteRepositoryResponse
             */
            public static fromObject(object: { [k: string]: any }): code_repositories.repository.DeleteRepositoryResponse;

            /**
             * Creates a plain object from a DeleteRepositoryResponse message. Also converts values to other types if specified.
             * @param message DeleteRepositoryResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: code_repositories.repository.DeleteRepositoryResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this DeleteRepositoryResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for DeleteRepositoryResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }

    /** Namespace common. */
    namespace common {

        /** RepositoryType enum. */
        enum RepositoryType {
            REPOSITORY_TYPE_UNSPECIFIED = 0,
            REPOSITORY_TYPE_NPM = 1,
            REPOSITORY_TYPE_DOCKER = 2,
            REPOSITORY_TYPE_PYTHON = 3
        }

        /** RepositoryStatus enum. */
        enum RepositoryStatus {
            REPOSITORY_STATUS_UNSPECIFIED = 0,
            REPOSITORY_STATUS_STABLE = 1,
            REPOSITORY_STATUS_BETA = 2,
            REPOSITORY_STATUS_DEPRECATED = 3,
            REPOSITORY_STATUS_EXPERIMENTAL = 4
        }

        /** RepositorySource enum. */
        enum RepositorySource {
            REPOSITORY_SOURCE_UNSPECIFIED = 0,
            REPOSITORY_SOURCE_GITHUB = 1,
            REPOSITORY_SOURCE_NPM = 2,
            REPOSITORY_SOURCE_DOCKERHUB = 3,
            REPOSITORY_SOURCE_PYPI = 4,
            REPOSITORY_SOURCE_MANUAL = 5
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
            constructor(properties?: code_repositories.common.IExternalId);

            /** ExternalId registry. */
            public registry: string;

            /** ExternalId id. */
            public id: string;

            /**
             * Creates a new ExternalId instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ExternalId instance
             */
            public static create(properties?: code_repositories.common.IExternalId): code_repositories.common.ExternalId;

            /**
             * Encodes the specified ExternalId message. Does not implicitly {@link code_repositories.common.ExternalId.verify|verify} messages.
             * @param message ExternalId message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: code_repositories.common.IExternalId, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ExternalId message, length delimited. Does not implicitly {@link code_repositories.common.ExternalId.verify|verify} messages.
             * @param message ExternalId message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: code_repositories.common.IExternalId, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an ExternalId message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ExternalId
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): code_repositories.common.ExternalId;

            /**
             * Decodes an ExternalId message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ExternalId
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): code_repositories.common.ExternalId;

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
            public static fromObject(object: { [k: string]: any }): code_repositories.common.ExternalId;

            /**
             * Creates a plain object from an ExternalId message. Also converts values to other types if specified.
             * @param message ExternalId
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: code_repositories.common.ExternalId, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            constructor(properties?: code_repositories.common.IPaginationRequest);

            /** PaginationRequest page. */
            public page: number;

            /** PaginationRequest limit. */
            public limit: number;

            /**
             * Creates a new PaginationRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns PaginationRequest instance
             */
            public static create(properties?: code_repositories.common.IPaginationRequest): code_repositories.common.PaginationRequest;

            /**
             * Encodes the specified PaginationRequest message. Does not implicitly {@link code_repositories.common.PaginationRequest.verify|verify} messages.
             * @param message PaginationRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: code_repositories.common.IPaginationRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified PaginationRequest message, length delimited. Does not implicitly {@link code_repositories.common.PaginationRequest.verify|verify} messages.
             * @param message PaginationRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: code_repositories.common.IPaginationRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a PaginationRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns PaginationRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): code_repositories.common.PaginationRequest;

            /**
             * Decodes a PaginationRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns PaginationRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): code_repositories.common.PaginationRequest;

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
            public static fromObject(object: { [k: string]: any }): code_repositories.common.PaginationRequest;

            /**
             * Creates a plain object from a PaginationRequest message. Also converts values to other types if specified.
             * @param message PaginationRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: code_repositories.common.PaginationRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            constructor(properties?: code_repositories.common.IPaginationResponse);

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
            public static create(properties?: code_repositories.common.IPaginationResponse): code_repositories.common.PaginationResponse;

            /**
             * Encodes the specified PaginationResponse message. Does not implicitly {@link code_repositories.common.PaginationResponse.verify|verify} messages.
             * @param message PaginationResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: code_repositories.common.IPaginationResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified PaginationResponse message, length delimited. Does not implicitly {@link code_repositories.common.PaginationResponse.verify|verify} messages.
             * @param message PaginationResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: code_repositories.common.IPaginationResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a PaginationResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns PaginationResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): code_repositories.common.PaginationResponse;

            /**
             * Decodes a PaginationResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns PaginationResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): code_repositories.common.PaginationResponse;

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
            public static fromObject(object: { [k: string]: any }): code_repositories.common.PaginationResponse;

            /**
             * Creates a plain object from a PaginationResponse message. Also converts values to other types if specified.
             * @param message PaginationResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: code_repositories.common.PaginationResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            constructor(properties?: code_repositories.common.IErrorResponse);

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
            public static create(properties?: code_repositories.common.IErrorResponse): code_repositories.common.ErrorResponse;

            /**
             * Encodes the specified ErrorResponse message. Does not implicitly {@link code_repositories.common.ErrorResponse.verify|verify} messages.
             * @param message ErrorResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: code_repositories.common.IErrorResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ErrorResponse message, length delimited. Does not implicitly {@link code_repositories.common.ErrorResponse.verify|verify} messages.
             * @param message ErrorResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: code_repositories.common.IErrorResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an ErrorResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ErrorResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): code_repositories.common.ErrorResponse;

            /**
             * Decodes an ErrorResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ErrorResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): code_repositories.common.ErrorResponse;

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
            public static fromObject(object: { [k: string]: any }): code_repositories.common.ErrorResponse;

            /**
             * Creates a plain object from an ErrorResponse message. Also converts values to other types if specified.
             * @param message ErrorResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: code_repositories.common.ErrorResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            constructor(properties?: code_repositories.common.ITimestamp);

            /** Timestamp iso8601. */
            public iso8601: string;

            /**
             * Creates a new Timestamp instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Timestamp instance
             */
            public static create(properties?: code_repositories.common.ITimestamp): code_repositories.common.Timestamp;

            /**
             * Encodes the specified Timestamp message. Does not implicitly {@link code_repositories.common.Timestamp.verify|verify} messages.
             * @param message Timestamp message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: code_repositories.common.ITimestamp, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Timestamp message, length delimited. Does not implicitly {@link code_repositories.common.Timestamp.verify|verify} messages.
             * @param message Timestamp message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: code_repositories.common.ITimestamp, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Timestamp message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): code_repositories.common.Timestamp;

            /**
             * Decodes a Timestamp message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): code_repositories.common.Timestamp;

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
            public static fromObject(object: { [k: string]: any }): code_repositories.common.Timestamp;

            /**
             * Creates a plain object from a Timestamp message. Also converts values to other types if specified.
             * @param message Timestamp
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: code_repositories.common.Timestamp, options?: $protobuf.IConversionOptions): { [k: string]: any };

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

    /** Namespace tag. */
    namespace tag {

        /** Properties of a Tag. */
        interface ITag {

            /** Tag id */
            id?: (number|null);

            /** Tag name */
            name?: (string|null);

            /** Tag createdAt */
            createdAt?: (code_repositories.common.ITimestamp|null);

            /** Tag updatedAt */
            updatedAt?: (code_repositories.common.ITimestamp|null);
        }

        /** Represents a Tag. */
        class Tag implements ITag {

            /**
             * Constructs a new Tag.
             * @param [properties] Properties to set
             */
            constructor(properties?: code_repositories.tag.ITag);

            /** Tag id. */
            public id: number;

            /** Tag name. */
            public name: string;

            /** Tag createdAt. */
            public createdAt?: (code_repositories.common.ITimestamp|null);

            /** Tag updatedAt. */
            public updatedAt?: (code_repositories.common.ITimestamp|null);

            /**
             * Creates a new Tag instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Tag instance
             */
            public static create(properties?: code_repositories.tag.ITag): code_repositories.tag.Tag;

            /**
             * Encodes the specified Tag message. Does not implicitly {@link code_repositories.tag.Tag.verify|verify} messages.
             * @param message Tag message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: code_repositories.tag.ITag, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Tag message, length delimited. Does not implicitly {@link code_repositories.tag.Tag.verify|verify} messages.
             * @param message Tag message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: code_repositories.tag.ITag, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Tag message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Tag
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): code_repositories.tag.Tag;

            /**
             * Decodes a Tag message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Tag
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): code_repositories.tag.Tag;

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
            public static fromObject(object: { [k: string]: any }): code_repositories.tag.Tag;

            /**
             * Creates a plain object from a Tag message. Also converts values to other types if specified.
             * @param message Tag
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: code_repositories.tag.Tag, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            tags?: (code_repositories.tag.ITag[]|null);
        }

        /** Represents a TagListResponse. */
        class TagListResponse implements ITagListResponse {

            /**
             * Constructs a new TagListResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: code_repositories.tag.ITagListResponse);

            /** TagListResponse tags. */
            public tags: code_repositories.tag.ITag[];

            /**
             * Creates a new TagListResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns TagListResponse instance
             */
            public static create(properties?: code_repositories.tag.ITagListResponse): code_repositories.tag.TagListResponse;

            /**
             * Encodes the specified TagListResponse message. Does not implicitly {@link code_repositories.tag.TagListResponse.verify|verify} messages.
             * @param message TagListResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: code_repositories.tag.ITagListResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified TagListResponse message, length delimited. Does not implicitly {@link code_repositories.tag.TagListResponse.verify|verify} messages.
             * @param message TagListResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: code_repositories.tag.ITagListResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a TagListResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns TagListResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): code_repositories.tag.TagListResponse;

            /**
             * Decodes a TagListResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns TagListResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): code_repositories.tag.TagListResponse;

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
            public static fromObject(object: { [k: string]: any }): code_repositories.tag.TagListResponse;

            /**
             * Creates a plain object from a TagListResponse message. Also converts values to other types if specified.
             * @param message TagListResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: code_repositories.tag.TagListResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            constructor(properties?: code_repositories.tag.ICreateTagRequest);

            /** CreateTagRequest name. */
            public name: string;

            /**
             * Creates a new CreateTagRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns CreateTagRequest instance
             */
            public static create(properties?: code_repositories.tag.ICreateTagRequest): code_repositories.tag.CreateTagRequest;

            /**
             * Encodes the specified CreateTagRequest message. Does not implicitly {@link code_repositories.tag.CreateTagRequest.verify|verify} messages.
             * @param message CreateTagRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: code_repositories.tag.ICreateTagRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified CreateTagRequest message, length delimited. Does not implicitly {@link code_repositories.tag.CreateTagRequest.verify|verify} messages.
             * @param message CreateTagRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: code_repositories.tag.ICreateTagRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a CreateTagRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns CreateTagRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): code_repositories.tag.CreateTagRequest;

            /**
             * Decodes a CreateTagRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns CreateTagRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): code_repositories.tag.CreateTagRequest;

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
            public static fromObject(object: { [k: string]: any }): code_repositories.tag.CreateTagRequest;

            /**
             * Creates a plain object from a CreateTagRequest message. Also converts values to other types if specified.
             * @param message CreateTagRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: code_repositories.tag.CreateTagRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            tag?: (code_repositories.tag.ITag|null);
        }

        /** Represents a CreateTagResponse. */
        class CreateTagResponse implements ICreateTagResponse {

            /**
             * Constructs a new CreateTagResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: code_repositories.tag.ICreateTagResponse);

            /** CreateTagResponse tag. */
            public tag?: (code_repositories.tag.ITag|null);

            /**
             * Creates a new CreateTagResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns CreateTagResponse instance
             */
            public static create(properties?: code_repositories.tag.ICreateTagResponse): code_repositories.tag.CreateTagResponse;

            /**
             * Encodes the specified CreateTagResponse message. Does not implicitly {@link code_repositories.tag.CreateTagResponse.verify|verify} messages.
             * @param message CreateTagResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: code_repositories.tag.ICreateTagResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified CreateTagResponse message, length delimited. Does not implicitly {@link code_repositories.tag.CreateTagResponse.verify|verify} messages.
             * @param message CreateTagResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: code_repositories.tag.ICreateTagResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a CreateTagResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns CreateTagResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): code_repositories.tag.CreateTagResponse;

            /**
             * Decodes a CreateTagResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns CreateTagResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): code_repositories.tag.CreateTagResponse;

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
            public static fromObject(object: { [k: string]: any }): code_repositories.tag.CreateTagResponse;

            /**
             * Creates a plain object from a CreateTagResponse message. Also converts values to other types if specified.
             * @param message CreateTagResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: code_repositories.tag.CreateTagResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            constructor(properties?: code_repositories.tag.IUpdateTagRequest);

            /** UpdateTagRequest id. */
            public id: number;

            /** UpdateTagRequest name. */
            public name: string;

            /**
             * Creates a new UpdateTagRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns UpdateTagRequest instance
             */
            public static create(properties?: code_repositories.tag.IUpdateTagRequest): code_repositories.tag.UpdateTagRequest;

            /**
             * Encodes the specified UpdateTagRequest message. Does not implicitly {@link code_repositories.tag.UpdateTagRequest.verify|verify} messages.
             * @param message UpdateTagRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: code_repositories.tag.IUpdateTagRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified UpdateTagRequest message, length delimited. Does not implicitly {@link code_repositories.tag.UpdateTagRequest.verify|verify} messages.
             * @param message UpdateTagRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: code_repositories.tag.IUpdateTagRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an UpdateTagRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns UpdateTagRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): code_repositories.tag.UpdateTagRequest;

            /**
             * Decodes an UpdateTagRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns UpdateTagRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): code_repositories.tag.UpdateTagRequest;

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
            public static fromObject(object: { [k: string]: any }): code_repositories.tag.UpdateTagRequest;

            /**
             * Creates a plain object from an UpdateTagRequest message. Also converts values to other types if specified.
             * @param message UpdateTagRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: code_repositories.tag.UpdateTagRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            tag?: (code_repositories.tag.ITag|null);
        }

        /** Represents an UpdateTagResponse. */
        class UpdateTagResponse implements IUpdateTagResponse {

            /**
             * Constructs a new UpdateTagResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: code_repositories.tag.IUpdateTagResponse);

            /** UpdateTagResponse tag. */
            public tag?: (code_repositories.tag.ITag|null);

            /**
             * Creates a new UpdateTagResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns UpdateTagResponse instance
             */
            public static create(properties?: code_repositories.tag.IUpdateTagResponse): code_repositories.tag.UpdateTagResponse;

            /**
             * Encodes the specified UpdateTagResponse message. Does not implicitly {@link code_repositories.tag.UpdateTagResponse.verify|verify} messages.
             * @param message UpdateTagResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: code_repositories.tag.IUpdateTagResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified UpdateTagResponse message, length delimited. Does not implicitly {@link code_repositories.tag.UpdateTagResponse.verify|verify} messages.
             * @param message UpdateTagResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: code_repositories.tag.IUpdateTagResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an UpdateTagResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns UpdateTagResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): code_repositories.tag.UpdateTagResponse;

            /**
             * Decodes an UpdateTagResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns UpdateTagResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): code_repositories.tag.UpdateTagResponse;

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
            public static fromObject(object: { [k: string]: any }): code_repositories.tag.UpdateTagResponse;

            /**
             * Creates a plain object from an UpdateTagResponse message. Also converts values to other types if specified.
             * @param message UpdateTagResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: code_repositories.tag.UpdateTagResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            constructor(properties?: code_repositories.tag.IGetTagRequest);

            /** GetTagRequest id. */
            public id: number;

            /**
             * Creates a new GetTagRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns GetTagRequest instance
             */
            public static create(properties?: code_repositories.tag.IGetTagRequest): code_repositories.tag.GetTagRequest;

            /**
             * Encodes the specified GetTagRequest message. Does not implicitly {@link code_repositories.tag.GetTagRequest.verify|verify} messages.
             * @param message GetTagRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: code_repositories.tag.IGetTagRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified GetTagRequest message, length delimited. Does not implicitly {@link code_repositories.tag.GetTagRequest.verify|verify} messages.
             * @param message GetTagRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: code_repositories.tag.IGetTagRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a GetTagRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns GetTagRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): code_repositories.tag.GetTagRequest;

            /**
             * Decodes a GetTagRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns GetTagRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): code_repositories.tag.GetTagRequest;

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
            public static fromObject(object: { [k: string]: any }): code_repositories.tag.GetTagRequest;

            /**
             * Creates a plain object from a GetTagRequest message. Also converts values to other types if specified.
             * @param message GetTagRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: code_repositories.tag.GetTagRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            tag?: (code_repositories.tag.ITag|null);
        }

        /** Represents a GetTagResponse. */
        class GetTagResponse implements IGetTagResponse {

            /**
             * Constructs a new GetTagResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: code_repositories.tag.IGetTagResponse);

            /** GetTagResponse tag. */
            public tag?: (code_repositories.tag.ITag|null);

            /**
             * Creates a new GetTagResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns GetTagResponse instance
             */
            public static create(properties?: code_repositories.tag.IGetTagResponse): code_repositories.tag.GetTagResponse;

            /**
             * Encodes the specified GetTagResponse message. Does not implicitly {@link code_repositories.tag.GetTagResponse.verify|verify} messages.
             * @param message GetTagResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: code_repositories.tag.IGetTagResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified GetTagResponse message, length delimited. Does not implicitly {@link code_repositories.tag.GetTagResponse.verify|verify} messages.
             * @param message GetTagResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: code_repositories.tag.IGetTagResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a GetTagResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns GetTagResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): code_repositories.tag.GetTagResponse;

            /**
             * Decodes a GetTagResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns GetTagResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): code_repositories.tag.GetTagResponse;

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
            public static fromObject(object: { [k: string]: any }): code_repositories.tag.GetTagResponse;

            /**
             * Creates a plain object from a GetTagResponse message. Also converts values to other types if specified.
             * @param message GetTagResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: code_repositories.tag.GetTagResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            constructor(properties?: code_repositories.tag.IDeleteTagRequest);

            /** DeleteTagRequest id. */
            public id: number;

            /**
             * Creates a new DeleteTagRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns DeleteTagRequest instance
             */
            public static create(properties?: code_repositories.tag.IDeleteTagRequest): code_repositories.tag.DeleteTagRequest;

            /**
             * Encodes the specified DeleteTagRequest message. Does not implicitly {@link code_repositories.tag.DeleteTagRequest.verify|verify} messages.
             * @param message DeleteTagRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: code_repositories.tag.IDeleteTagRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified DeleteTagRequest message, length delimited. Does not implicitly {@link code_repositories.tag.DeleteTagRequest.verify|verify} messages.
             * @param message DeleteTagRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: code_repositories.tag.IDeleteTagRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DeleteTagRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns DeleteTagRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): code_repositories.tag.DeleteTagRequest;

            /**
             * Decodes a DeleteTagRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns DeleteTagRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): code_repositories.tag.DeleteTagRequest;

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
            public static fromObject(object: { [k: string]: any }): code_repositories.tag.DeleteTagRequest;

            /**
             * Creates a plain object from a DeleteTagRequest message. Also converts values to other types if specified.
             * @param message DeleteTagRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: code_repositories.tag.DeleteTagRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            constructor(properties?: code_repositories.tag.IDeleteTagResponse);

            /** DeleteTagResponse success. */
            public success: boolean;

            /**
             * Creates a new DeleteTagResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns DeleteTagResponse instance
             */
            public static create(properties?: code_repositories.tag.IDeleteTagResponse): code_repositories.tag.DeleteTagResponse;

            /**
             * Encodes the specified DeleteTagResponse message. Does not implicitly {@link code_repositories.tag.DeleteTagResponse.verify|verify} messages.
             * @param message DeleteTagResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: code_repositories.tag.IDeleteTagResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified DeleteTagResponse message, length delimited. Does not implicitly {@link code_repositories.tag.DeleteTagResponse.verify|verify} messages.
             * @param message DeleteTagResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: code_repositories.tag.IDeleteTagResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DeleteTagResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns DeleteTagResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): code_repositories.tag.DeleteTagResponse;

            /**
             * Decodes a DeleteTagResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns DeleteTagResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): code_repositories.tag.DeleteTagResponse;

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
            public static fromObject(object: { [k: string]: any }): code_repositories.tag.DeleteTagResponse;

            /**
             * Creates a plain object from a DeleteTagResponse message. Also converts values to other types if specified.
             * @param message DeleteTagResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: code_repositories.tag.DeleteTagResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

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

            /** Metadata repositoryId */
            repositoryId?: (string|null);

            /** Metadata createdAt */
            createdAt?: (code_repositories.common.ITimestamp|null);

            /** Metadata updatedAt */
            updatedAt?: (code_repositories.common.ITimestamp|null);
        }

        /** Represents a Metadata. */
        class Metadata implements IMetadata {

            /**
             * Constructs a new Metadata.
             * @param [properties] Properties to set
             */
            constructor(properties?: code_repositories.metadata.IMetadata);

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

            /** Metadata repositoryId. */
            public repositoryId: string;

            /** Metadata createdAt. */
            public createdAt?: (code_repositories.common.ITimestamp|null);

            /** Metadata updatedAt. */
            public updatedAt?: (code_repositories.common.ITimestamp|null);

            /**
             * Creates a new Metadata instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Metadata instance
             */
            public static create(properties?: code_repositories.metadata.IMetadata): code_repositories.metadata.Metadata;

            /**
             * Encodes the specified Metadata message. Does not implicitly {@link code_repositories.metadata.Metadata.verify|verify} messages.
             * @param message Metadata message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: code_repositories.metadata.IMetadata, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Metadata message, length delimited. Does not implicitly {@link code_repositories.metadata.Metadata.verify|verify} messages.
             * @param message Metadata message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: code_repositories.metadata.IMetadata, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Metadata message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Metadata
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): code_repositories.metadata.Metadata;

            /**
             * Decodes a Metadata message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Metadata
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): code_repositories.metadata.Metadata;

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
            public static fromObject(object: { [k: string]: any }): code_repositories.metadata.Metadata;

            /**
             * Creates a plain object from a Metadata message. Also converts values to other types if specified.
             * @param message Metadata
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: code_repositories.metadata.Metadata, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            items?: (code_repositories.metadata.IMetadata[]|null);
        }

        /** Represents a MetadataListResponse. */
        class MetadataListResponse implements IMetadataListResponse {

            /**
             * Constructs a new MetadataListResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: code_repositories.metadata.IMetadataListResponse);

            /** MetadataListResponse items. */
            public items: code_repositories.metadata.IMetadata[];

            /**
             * Creates a new MetadataListResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns MetadataListResponse instance
             */
            public static create(properties?: code_repositories.metadata.IMetadataListResponse): code_repositories.metadata.MetadataListResponse;

            /**
             * Encodes the specified MetadataListResponse message. Does not implicitly {@link code_repositories.metadata.MetadataListResponse.verify|verify} messages.
             * @param message MetadataListResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: code_repositories.metadata.IMetadataListResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified MetadataListResponse message, length delimited. Does not implicitly {@link code_repositories.metadata.MetadataListResponse.verify|verify} messages.
             * @param message MetadataListResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: code_repositories.metadata.IMetadataListResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a MetadataListResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns MetadataListResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): code_repositories.metadata.MetadataListResponse;

            /**
             * Decodes a MetadataListResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns MetadataListResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): code_repositories.metadata.MetadataListResponse;

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
            public static fromObject(object: { [k: string]: any }): code_repositories.metadata.MetadataListResponse;

            /**
             * Creates a plain object from a MetadataListResponse message. Also converts values to other types if specified.
             * @param message MetadataListResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: code_repositories.metadata.MetadataListResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

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

            /** CreateMetadataRequest repositoryId */
            repositoryId?: (string|null);
        }

        /** Represents a CreateMetadataRequest. */
        class CreateMetadataRequest implements ICreateMetadataRequest {

            /**
             * Constructs a new CreateMetadataRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: code_repositories.metadata.ICreateMetadataRequest);

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

            /** CreateMetadataRequest repositoryId. */
            public repositoryId: string;

            /**
             * Creates a new CreateMetadataRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns CreateMetadataRequest instance
             */
            public static create(properties?: code_repositories.metadata.ICreateMetadataRequest): code_repositories.metadata.CreateMetadataRequest;

            /**
             * Encodes the specified CreateMetadataRequest message. Does not implicitly {@link code_repositories.metadata.CreateMetadataRequest.verify|verify} messages.
             * @param message CreateMetadataRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: code_repositories.metadata.ICreateMetadataRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified CreateMetadataRequest message, length delimited. Does not implicitly {@link code_repositories.metadata.CreateMetadataRequest.verify|verify} messages.
             * @param message CreateMetadataRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: code_repositories.metadata.ICreateMetadataRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a CreateMetadataRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns CreateMetadataRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): code_repositories.metadata.CreateMetadataRequest;

            /**
             * Decodes a CreateMetadataRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns CreateMetadataRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): code_repositories.metadata.CreateMetadataRequest;

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
            public static fromObject(object: { [k: string]: any }): code_repositories.metadata.CreateMetadataRequest;

            /**
             * Creates a plain object from a CreateMetadataRequest message. Also converts values to other types if specified.
             * @param message CreateMetadataRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: code_repositories.metadata.CreateMetadataRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            metadata?: (code_repositories.metadata.IMetadata|null);
        }

        /** Represents a CreateMetadataResponse. */
        class CreateMetadataResponse implements ICreateMetadataResponse {

            /**
             * Constructs a new CreateMetadataResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: code_repositories.metadata.ICreateMetadataResponse);

            /** CreateMetadataResponse metadata. */
            public metadata?: (code_repositories.metadata.IMetadata|null);

            /**
             * Creates a new CreateMetadataResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns CreateMetadataResponse instance
             */
            public static create(properties?: code_repositories.metadata.ICreateMetadataResponse): code_repositories.metadata.CreateMetadataResponse;

            /**
             * Encodes the specified CreateMetadataResponse message. Does not implicitly {@link code_repositories.metadata.CreateMetadataResponse.verify|verify} messages.
             * @param message CreateMetadataResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: code_repositories.metadata.ICreateMetadataResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified CreateMetadataResponse message, length delimited. Does not implicitly {@link code_repositories.metadata.CreateMetadataResponse.verify|verify} messages.
             * @param message CreateMetadataResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: code_repositories.metadata.ICreateMetadataResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a CreateMetadataResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns CreateMetadataResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): code_repositories.metadata.CreateMetadataResponse;

            /**
             * Decodes a CreateMetadataResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns CreateMetadataResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): code_repositories.metadata.CreateMetadataResponse;

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
            public static fromObject(object: { [k: string]: any }): code_repositories.metadata.CreateMetadataResponse;

            /**
             * Creates a plain object from a CreateMetadataResponse message. Also converts values to other types if specified.
             * @param message CreateMetadataResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: code_repositories.metadata.CreateMetadataResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            constructor(properties?: code_repositories.metadata.IUpdateMetadataRequest);

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
            public static create(properties?: code_repositories.metadata.IUpdateMetadataRequest): code_repositories.metadata.UpdateMetadataRequest;

            /**
             * Encodes the specified UpdateMetadataRequest message. Does not implicitly {@link code_repositories.metadata.UpdateMetadataRequest.verify|verify} messages.
             * @param message UpdateMetadataRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: code_repositories.metadata.IUpdateMetadataRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified UpdateMetadataRequest message, length delimited. Does not implicitly {@link code_repositories.metadata.UpdateMetadataRequest.verify|verify} messages.
             * @param message UpdateMetadataRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: code_repositories.metadata.IUpdateMetadataRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an UpdateMetadataRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns UpdateMetadataRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): code_repositories.metadata.UpdateMetadataRequest;

            /**
             * Decodes an UpdateMetadataRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns UpdateMetadataRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): code_repositories.metadata.UpdateMetadataRequest;

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
            public static fromObject(object: { [k: string]: any }): code_repositories.metadata.UpdateMetadataRequest;

            /**
             * Creates a plain object from an UpdateMetadataRequest message. Also converts values to other types if specified.
             * @param message UpdateMetadataRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: code_repositories.metadata.UpdateMetadataRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            metadata?: (code_repositories.metadata.IMetadata|null);
        }

        /** Represents an UpdateMetadataResponse. */
        class UpdateMetadataResponse implements IUpdateMetadataResponse {

            /**
             * Constructs a new UpdateMetadataResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: code_repositories.metadata.IUpdateMetadataResponse);

            /** UpdateMetadataResponse metadata. */
            public metadata?: (code_repositories.metadata.IMetadata|null);

            /**
             * Creates a new UpdateMetadataResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns UpdateMetadataResponse instance
             */
            public static create(properties?: code_repositories.metadata.IUpdateMetadataResponse): code_repositories.metadata.UpdateMetadataResponse;

            /**
             * Encodes the specified UpdateMetadataResponse message. Does not implicitly {@link code_repositories.metadata.UpdateMetadataResponse.verify|verify} messages.
             * @param message UpdateMetadataResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: code_repositories.metadata.IUpdateMetadataResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified UpdateMetadataResponse message, length delimited. Does not implicitly {@link code_repositories.metadata.UpdateMetadataResponse.verify|verify} messages.
             * @param message UpdateMetadataResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: code_repositories.metadata.IUpdateMetadataResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an UpdateMetadataResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns UpdateMetadataResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): code_repositories.metadata.UpdateMetadataResponse;

            /**
             * Decodes an UpdateMetadataResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns UpdateMetadataResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): code_repositories.metadata.UpdateMetadataResponse;

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
            public static fromObject(object: { [k: string]: any }): code_repositories.metadata.UpdateMetadataResponse;

            /**
             * Creates a plain object from an UpdateMetadataResponse message. Also converts values to other types if specified.
             * @param message UpdateMetadataResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: code_repositories.metadata.UpdateMetadataResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            constructor(properties?: code_repositories.metadata.IGetMetadataRequest);

            /** GetMetadataRequest id. */
            public id: number;

            /**
             * Creates a new GetMetadataRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns GetMetadataRequest instance
             */
            public static create(properties?: code_repositories.metadata.IGetMetadataRequest): code_repositories.metadata.GetMetadataRequest;

            /**
             * Encodes the specified GetMetadataRequest message. Does not implicitly {@link code_repositories.metadata.GetMetadataRequest.verify|verify} messages.
             * @param message GetMetadataRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: code_repositories.metadata.IGetMetadataRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified GetMetadataRequest message, length delimited. Does not implicitly {@link code_repositories.metadata.GetMetadataRequest.verify|verify} messages.
             * @param message GetMetadataRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: code_repositories.metadata.IGetMetadataRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a GetMetadataRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns GetMetadataRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): code_repositories.metadata.GetMetadataRequest;

            /**
             * Decodes a GetMetadataRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns GetMetadataRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): code_repositories.metadata.GetMetadataRequest;

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
            public static fromObject(object: { [k: string]: any }): code_repositories.metadata.GetMetadataRequest;

            /**
             * Creates a plain object from a GetMetadataRequest message. Also converts values to other types if specified.
             * @param message GetMetadataRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: code_repositories.metadata.GetMetadataRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            metadata?: (code_repositories.metadata.IMetadata|null);
        }

        /** Represents a GetMetadataResponse. */
        class GetMetadataResponse implements IGetMetadataResponse {

            /**
             * Constructs a new GetMetadataResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: code_repositories.metadata.IGetMetadataResponse);

            /** GetMetadataResponse metadata. */
            public metadata?: (code_repositories.metadata.IMetadata|null);

            /**
             * Creates a new GetMetadataResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns GetMetadataResponse instance
             */
            public static create(properties?: code_repositories.metadata.IGetMetadataResponse): code_repositories.metadata.GetMetadataResponse;

            /**
             * Encodes the specified GetMetadataResponse message. Does not implicitly {@link code_repositories.metadata.GetMetadataResponse.verify|verify} messages.
             * @param message GetMetadataResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: code_repositories.metadata.IGetMetadataResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified GetMetadataResponse message, length delimited. Does not implicitly {@link code_repositories.metadata.GetMetadataResponse.verify|verify} messages.
             * @param message GetMetadataResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: code_repositories.metadata.IGetMetadataResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a GetMetadataResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns GetMetadataResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): code_repositories.metadata.GetMetadataResponse;

            /**
             * Decodes a GetMetadataResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns GetMetadataResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): code_repositories.metadata.GetMetadataResponse;

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
            public static fromObject(object: { [k: string]: any }): code_repositories.metadata.GetMetadataResponse;

            /**
             * Creates a plain object from a GetMetadataResponse message. Also converts values to other types if specified.
             * @param message GetMetadataResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: code_repositories.metadata.GetMetadataResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            constructor(properties?: code_repositories.metadata.IDeleteMetadataRequest);

            /** DeleteMetadataRequest id. */
            public id: number;

            /**
             * Creates a new DeleteMetadataRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns DeleteMetadataRequest instance
             */
            public static create(properties?: code_repositories.metadata.IDeleteMetadataRequest): code_repositories.metadata.DeleteMetadataRequest;

            /**
             * Encodes the specified DeleteMetadataRequest message. Does not implicitly {@link code_repositories.metadata.DeleteMetadataRequest.verify|verify} messages.
             * @param message DeleteMetadataRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: code_repositories.metadata.IDeleteMetadataRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified DeleteMetadataRequest message, length delimited. Does not implicitly {@link code_repositories.metadata.DeleteMetadataRequest.verify|verify} messages.
             * @param message DeleteMetadataRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: code_repositories.metadata.IDeleteMetadataRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DeleteMetadataRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns DeleteMetadataRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): code_repositories.metadata.DeleteMetadataRequest;

            /**
             * Decodes a DeleteMetadataRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns DeleteMetadataRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): code_repositories.metadata.DeleteMetadataRequest;

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
            public static fromObject(object: { [k: string]: any }): code_repositories.metadata.DeleteMetadataRequest;

            /**
             * Creates a plain object from a DeleteMetadataRequest message. Also converts values to other types if specified.
             * @param message DeleteMetadataRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: code_repositories.metadata.DeleteMetadataRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            constructor(properties?: code_repositories.metadata.IDeleteMetadataResponse);

            /** DeleteMetadataResponse success. */
            public success: boolean;

            /**
             * Creates a new DeleteMetadataResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns DeleteMetadataResponse instance
             */
            public static create(properties?: code_repositories.metadata.IDeleteMetadataResponse): code_repositories.metadata.DeleteMetadataResponse;

            /**
             * Encodes the specified DeleteMetadataResponse message. Does not implicitly {@link code_repositories.metadata.DeleteMetadataResponse.verify|verify} messages.
             * @param message DeleteMetadataResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: code_repositories.metadata.IDeleteMetadataResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified DeleteMetadataResponse message, length delimited. Does not implicitly {@link code_repositories.metadata.DeleteMetadataResponse.verify|verify} messages.
             * @param message DeleteMetadataResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: code_repositories.metadata.IDeleteMetadataResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DeleteMetadataResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns DeleteMetadataResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): code_repositories.metadata.DeleteMetadataResponse;

            /**
             * Decodes a DeleteMetadataResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns DeleteMetadataResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): code_repositories.metadata.DeleteMetadataResponse;

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
            public static fromObject(object: { [k: string]: any }): code_repositories.metadata.DeleteMetadataResponse;

            /**
             * Creates a plain object from a DeleteMetadataResponse message. Also converts values to other types if specified.
             * @param message DeleteMetadataResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: code_repositories.metadata.DeleteMetadataResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
