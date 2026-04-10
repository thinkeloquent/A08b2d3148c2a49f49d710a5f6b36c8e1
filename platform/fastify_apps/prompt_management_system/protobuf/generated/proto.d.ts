import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace prompt_management_system. */
export namespace prompt_management_system {

    /** Properties of a Project. */
    interface IProject {

        /** Project id */
        id?: (string|null);

        /** Project name */
        name?: (string|null);

        /** Project description */
        description?: (string|null);

        /** Project status */
        status?: (string|null);

        /** Project createdBy */
        createdBy?: (string|null);

        /** Project updatedBy */
        updatedBy?: (string|null);

        /** Project createdAt */
        createdAt?: (string|null);

        /** Project updatedAt */
        updatedAt?: (string|null);

        /** Project metadata */
        metadata?: (string|null);

        /** Project prompts */
        prompts?: (prompt_management_system.IPrompt[]|null);
    }

    /** Represents a Project. */
    class Project implements IProject {

        /**
         * Constructs a new Project.
         * @param [properties] Properties to set
         */
        constructor(properties?: prompt_management_system.IProject);

        /** Project id. */
        public id: string;

        /** Project name. */
        public name: string;

        /** Project description. */
        public description: string;

        /** Project status. */
        public status: string;

        /** Project createdBy. */
        public createdBy: string;

        /** Project updatedBy. */
        public updatedBy: string;

        /** Project createdAt. */
        public createdAt: string;

        /** Project updatedAt. */
        public updatedAt: string;

        /** Project metadata. */
        public metadata: string;

        /** Project prompts. */
        public prompts: prompt_management_system.IPrompt[];

        /**
         * Creates a new Project instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Project instance
         */
        public static create(properties?: prompt_management_system.IProject): prompt_management_system.Project;

        /**
         * Encodes the specified Project message. Does not implicitly {@link prompt_management_system.Project.verify|verify} messages.
         * @param message Project message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: prompt_management_system.IProject, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Project message, length delimited. Does not implicitly {@link prompt_management_system.Project.verify|verify} messages.
         * @param message Project message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: prompt_management_system.IProject, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Project message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Project
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): prompt_management_system.Project;

        /**
         * Decodes a Project message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Project
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): prompt_management_system.Project;

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
        public static fromObject(object: { [k: string]: any }): prompt_management_system.Project;

        /**
         * Creates a plain object from a Project message. Also converts values to other types if specified.
         * @param message Project
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: prompt_management_system.Project, options?: $protobuf.IConversionOptions): { [k: string]: any };

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

    /** Properties of a Prompt. */
    interface IPrompt {

        /** Prompt id */
        id?: (string|null);

        /** Prompt projectId */
        projectId?: (string|null);

        /** Prompt slug */
        slug?: (string|null);

        /** Prompt name */
        name?: (string|null);

        /** Prompt description */
        description?: (string|null);

        /** Prompt status */
        status?: (string|null);

        /** Prompt createdBy */
        createdBy?: (string|null);

        /** Prompt updatedBy */
        updatedBy?: (string|null);

        /** Prompt createdAt */
        createdAt?: (string|null);

        /** Prompt updatedAt */
        updatedAt?: (string|null);

        /** Prompt metadata */
        metadata?: (string|null);

        /** Prompt versions */
        versions?: (prompt_management_system.IPromptVersion[]|null);

        /** Prompt deployments */
        deployments?: (prompt_management_system.IDeployment[]|null);
    }

    /** Represents a Prompt. */
    class Prompt implements IPrompt {

        /**
         * Constructs a new Prompt.
         * @param [properties] Properties to set
         */
        constructor(properties?: prompt_management_system.IPrompt);

        /** Prompt id. */
        public id: string;

        /** Prompt projectId. */
        public projectId: string;

        /** Prompt slug. */
        public slug: string;

        /** Prompt name. */
        public name: string;

        /** Prompt description. */
        public description: string;

        /** Prompt status. */
        public status: string;

        /** Prompt createdBy. */
        public createdBy: string;

        /** Prompt updatedBy. */
        public updatedBy: string;

        /** Prompt createdAt. */
        public createdAt: string;

        /** Prompt updatedAt. */
        public updatedAt: string;

        /** Prompt metadata. */
        public metadata: string;

        /** Prompt versions. */
        public versions: prompt_management_system.IPromptVersion[];

        /** Prompt deployments. */
        public deployments: prompt_management_system.IDeployment[];

        /**
         * Creates a new Prompt instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Prompt instance
         */
        public static create(properties?: prompt_management_system.IPrompt): prompt_management_system.Prompt;

        /**
         * Encodes the specified Prompt message. Does not implicitly {@link prompt_management_system.Prompt.verify|verify} messages.
         * @param message Prompt message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: prompt_management_system.IPrompt, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Prompt message, length delimited. Does not implicitly {@link prompt_management_system.Prompt.verify|verify} messages.
         * @param message Prompt message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: prompt_management_system.IPrompt, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Prompt message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Prompt
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): prompt_management_system.Prompt;

        /**
         * Decodes a Prompt message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Prompt
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): prompt_management_system.Prompt;

        /**
         * Verifies a Prompt message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Prompt message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Prompt
         */
        public static fromObject(object: { [k: string]: any }): prompt_management_system.Prompt;

        /**
         * Creates a plain object from a Prompt message. Also converts values to other types if specified.
         * @param message Prompt
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: prompt_management_system.Prompt, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Prompt to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Prompt
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a PromptVersion. */
    interface IPromptVersion {

        /** PromptVersion id */
        id?: (string|null);

        /** PromptVersion promptId */
        promptId?: (string|null);

        /** PromptVersion versionNumber */
        versionNumber?: (number|null);

        /** PromptVersion template */
        template?: (string|null);

        /** PromptVersion config */
        config?: (string|null);

        /** PromptVersion inputSchema */
        inputSchema?: (string|null);

        /** PromptVersion commitMessage */
        commitMessage?: (string|null);

        /** PromptVersion status */
        status?: (string|null);

        /** PromptVersion createdBy */
        createdBy?: (string|null);

        /** PromptVersion createdAt */
        createdAt?: (string|null);

        /** PromptVersion metadata */
        metadata?: (string|null);

        /** PromptVersion variables */
        variables?: (prompt_management_system.IVariable[]|null);
    }

    /** Represents a PromptVersion. */
    class PromptVersion implements IPromptVersion {

        /**
         * Constructs a new PromptVersion.
         * @param [properties] Properties to set
         */
        constructor(properties?: prompt_management_system.IPromptVersion);

        /** PromptVersion id. */
        public id: string;

        /** PromptVersion promptId. */
        public promptId: string;

        /** PromptVersion versionNumber. */
        public versionNumber: number;

        /** PromptVersion template. */
        public template: string;

        /** PromptVersion config. */
        public config: string;

        /** PromptVersion inputSchema. */
        public inputSchema: string;

        /** PromptVersion commitMessage. */
        public commitMessage: string;

        /** PromptVersion status. */
        public status: string;

        /** PromptVersion createdBy. */
        public createdBy: string;

        /** PromptVersion createdAt. */
        public createdAt: string;

        /** PromptVersion metadata. */
        public metadata: string;

        /** PromptVersion variables. */
        public variables: prompt_management_system.IVariable[];

        /**
         * Creates a new PromptVersion instance using the specified properties.
         * @param [properties] Properties to set
         * @returns PromptVersion instance
         */
        public static create(properties?: prompt_management_system.IPromptVersion): prompt_management_system.PromptVersion;

        /**
         * Encodes the specified PromptVersion message. Does not implicitly {@link prompt_management_system.PromptVersion.verify|verify} messages.
         * @param message PromptVersion message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: prompt_management_system.IPromptVersion, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified PromptVersion message, length delimited. Does not implicitly {@link prompt_management_system.PromptVersion.verify|verify} messages.
         * @param message PromptVersion message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: prompt_management_system.IPromptVersion, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a PromptVersion message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns PromptVersion
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): prompt_management_system.PromptVersion;

        /**
         * Decodes a PromptVersion message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns PromptVersion
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): prompt_management_system.PromptVersion;

        /**
         * Verifies a PromptVersion message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a PromptVersion message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns PromptVersion
         */
        public static fromObject(object: { [k: string]: any }): prompt_management_system.PromptVersion;

        /**
         * Creates a plain object from a PromptVersion message. Also converts values to other types if specified.
         * @param message PromptVersion
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: prompt_management_system.PromptVersion, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this PromptVersion to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for PromptVersion
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a Deployment. */
    interface IDeployment {

        /** Deployment id */
        id?: (string|null);

        /** Deployment promptId */
        promptId?: (string|null);

        /** Deployment environment */
        environment?: (string|null);

        /** Deployment versionId */
        versionId?: (string|null);

        /** Deployment deployedBy */
        deployedBy?: (string|null);

        /** Deployment createdAt */
        createdAt?: (string|null);

        /** Deployment updatedAt */
        updatedAt?: (string|null);

        /** Deployment metadata */
        metadata?: (string|null);

        /** Deployment version */
        version?: (prompt_management_system.IPromptVersion|null);
    }

    /** Represents a Deployment. */
    class Deployment implements IDeployment {

        /**
         * Constructs a new Deployment.
         * @param [properties] Properties to set
         */
        constructor(properties?: prompt_management_system.IDeployment);

        /** Deployment id. */
        public id: string;

        /** Deployment promptId. */
        public promptId: string;

        /** Deployment environment. */
        public environment: string;

        /** Deployment versionId. */
        public versionId: string;

        /** Deployment deployedBy. */
        public deployedBy: string;

        /** Deployment createdAt. */
        public createdAt: string;

        /** Deployment updatedAt. */
        public updatedAt: string;

        /** Deployment metadata. */
        public metadata: string;

        /** Deployment version. */
        public version?: (prompt_management_system.IPromptVersion|null);

        /**
         * Creates a new Deployment instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Deployment instance
         */
        public static create(properties?: prompt_management_system.IDeployment): prompt_management_system.Deployment;

        /**
         * Encodes the specified Deployment message. Does not implicitly {@link prompt_management_system.Deployment.verify|verify} messages.
         * @param message Deployment message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: prompt_management_system.IDeployment, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Deployment message, length delimited. Does not implicitly {@link prompt_management_system.Deployment.verify|verify} messages.
         * @param message Deployment message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: prompt_management_system.IDeployment, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Deployment message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Deployment
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): prompt_management_system.Deployment;

        /**
         * Decodes a Deployment message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Deployment
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): prompt_management_system.Deployment;

        /**
         * Verifies a Deployment message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Deployment message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Deployment
         */
        public static fromObject(object: { [k: string]: any }): prompt_management_system.Deployment;

        /**
         * Creates a plain object from a Deployment message. Also converts values to other types if specified.
         * @param message Deployment
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: prompt_management_system.Deployment, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Deployment to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Deployment
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a Variable. */
    interface IVariable {

        /** Variable id */
        id?: (string|null);

        /** Variable versionId */
        versionId?: (string|null);

        /** Variable key */
        key?: (string|null);

        /** Variable type */
        type?: (string|null);

        /** Variable description */
        description?: (string|null);

        /** Variable defaultValue */
        defaultValue?: (string|null);

        /** Variable required */
        required?: (boolean|null);

        /** Variable createdAt */
        createdAt?: (string|null);
    }

    /** Represents a Variable. */
    class Variable implements IVariable {

        /**
         * Constructs a new Variable.
         * @param [properties] Properties to set
         */
        constructor(properties?: prompt_management_system.IVariable);

        /** Variable id. */
        public id: string;

        /** Variable versionId. */
        public versionId: string;

        /** Variable key. */
        public key: string;

        /** Variable type. */
        public type: string;

        /** Variable description. */
        public description: string;

        /** Variable defaultValue. */
        public defaultValue: string;

        /** Variable required. */
        public required: boolean;

        /** Variable createdAt. */
        public createdAt: string;

        /**
         * Creates a new Variable instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Variable instance
         */
        public static create(properties?: prompt_management_system.IVariable): prompt_management_system.Variable;

        /**
         * Encodes the specified Variable message. Does not implicitly {@link prompt_management_system.Variable.verify|verify} messages.
         * @param message Variable message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: prompt_management_system.IVariable, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Variable message, length delimited. Does not implicitly {@link prompt_management_system.Variable.verify|verify} messages.
         * @param message Variable message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: prompt_management_system.IVariable, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Variable message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Variable
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): prompt_management_system.Variable;

        /**
         * Decodes a Variable message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Variable
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): prompt_management_system.Variable;

        /**
         * Verifies a Variable message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Variable message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Variable
         */
        public static fromObject(object: { [k: string]: any }): prompt_management_system.Variable;

        /**
         * Creates a plain object from a Variable message. Also converts values to other types if specified.
         * @param message Variable
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: prompt_management_system.Variable, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Variable to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Variable
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a ProjectList. */
    interface IProjectList {

        /** ProjectList data */
        data?: (prompt_management_system.IProject[]|null);

        /** ProjectList pagination */
        pagination?: (prompt_management_system.IPagination|null);
    }

    /** Represents a ProjectList. */
    class ProjectList implements IProjectList {

        /**
         * Constructs a new ProjectList.
         * @param [properties] Properties to set
         */
        constructor(properties?: prompt_management_system.IProjectList);

        /** ProjectList data. */
        public data: prompt_management_system.IProject[];

        /** ProjectList pagination. */
        public pagination?: (prompt_management_system.IPagination|null);

        /**
         * Creates a new ProjectList instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ProjectList instance
         */
        public static create(properties?: prompt_management_system.IProjectList): prompt_management_system.ProjectList;

        /**
         * Encodes the specified ProjectList message. Does not implicitly {@link prompt_management_system.ProjectList.verify|verify} messages.
         * @param message ProjectList message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: prompt_management_system.IProjectList, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ProjectList message, length delimited. Does not implicitly {@link prompt_management_system.ProjectList.verify|verify} messages.
         * @param message ProjectList message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: prompt_management_system.IProjectList, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ProjectList message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ProjectList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): prompt_management_system.ProjectList;

        /**
         * Decodes a ProjectList message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ProjectList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): prompt_management_system.ProjectList;

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
        public static fromObject(object: { [k: string]: any }): prompt_management_system.ProjectList;

        /**
         * Creates a plain object from a ProjectList message. Also converts values to other types if specified.
         * @param message ProjectList
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: prompt_management_system.ProjectList, options?: $protobuf.IConversionOptions): { [k: string]: any };

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

    /** Properties of a PromptList. */
    interface IPromptList {

        /** PromptList data */
        data?: (prompt_management_system.IPrompt[]|null);

        /** PromptList pagination */
        pagination?: (prompt_management_system.IPagination|null);
    }

    /** Represents a PromptList. */
    class PromptList implements IPromptList {

        /**
         * Constructs a new PromptList.
         * @param [properties] Properties to set
         */
        constructor(properties?: prompt_management_system.IPromptList);

        /** PromptList data. */
        public data: prompt_management_system.IPrompt[];

        /** PromptList pagination. */
        public pagination?: (prompt_management_system.IPagination|null);

        /**
         * Creates a new PromptList instance using the specified properties.
         * @param [properties] Properties to set
         * @returns PromptList instance
         */
        public static create(properties?: prompt_management_system.IPromptList): prompt_management_system.PromptList;

        /**
         * Encodes the specified PromptList message. Does not implicitly {@link prompt_management_system.PromptList.verify|verify} messages.
         * @param message PromptList message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: prompt_management_system.IPromptList, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified PromptList message, length delimited. Does not implicitly {@link prompt_management_system.PromptList.verify|verify} messages.
         * @param message PromptList message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: prompt_management_system.IPromptList, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a PromptList message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns PromptList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): prompt_management_system.PromptList;

        /**
         * Decodes a PromptList message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns PromptList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): prompt_management_system.PromptList;

        /**
         * Verifies a PromptList message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a PromptList message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns PromptList
         */
        public static fromObject(object: { [k: string]: any }): prompt_management_system.PromptList;

        /**
         * Creates a plain object from a PromptList message. Also converts values to other types if specified.
         * @param message PromptList
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: prompt_management_system.PromptList, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this PromptList to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for PromptList
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a VersionList. */
    interface IVersionList {

        /** VersionList data */
        data?: (prompt_management_system.IPromptVersion[]|null);

        /** VersionList pagination */
        pagination?: (prompt_management_system.IPagination|null);
    }

    /** Represents a VersionList. */
    class VersionList implements IVersionList {

        /**
         * Constructs a new VersionList.
         * @param [properties] Properties to set
         */
        constructor(properties?: prompt_management_system.IVersionList);

        /** VersionList data. */
        public data: prompt_management_system.IPromptVersion[];

        /** VersionList pagination. */
        public pagination?: (prompt_management_system.IPagination|null);

        /**
         * Creates a new VersionList instance using the specified properties.
         * @param [properties] Properties to set
         * @returns VersionList instance
         */
        public static create(properties?: prompt_management_system.IVersionList): prompt_management_system.VersionList;

        /**
         * Encodes the specified VersionList message. Does not implicitly {@link prompt_management_system.VersionList.verify|verify} messages.
         * @param message VersionList message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: prompt_management_system.IVersionList, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified VersionList message, length delimited. Does not implicitly {@link prompt_management_system.VersionList.verify|verify} messages.
         * @param message VersionList message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: prompt_management_system.IVersionList, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a VersionList message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns VersionList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): prompt_management_system.VersionList;

        /**
         * Decodes a VersionList message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns VersionList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): prompt_management_system.VersionList;

        /**
         * Verifies a VersionList message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a VersionList message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns VersionList
         */
        public static fromObject(object: { [k: string]: any }): prompt_management_system.VersionList;

        /**
         * Creates a plain object from a VersionList message. Also converts values to other types if specified.
         * @param message VersionList
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: prompt_management_system.VersionList, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this VersionList to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for VersionList
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a Pagination. */
    interface IPagination {

        /** Pagination page */
        page?: (number|null);

        /** Pagination limit */
        limit?: (number|null);

        /** Pagination total */
        total?: (number|null);

        /** Pagination totalPages */
        totalPages?: (number|null);
    }

    /** Represents a Pagination. */
    class Pagination implements IPagination {

        /**
         * Constructs a new Pagination.
         * @param [properties] Properties to set
         */
        constructor(properties?: prompt_management_system.IPagination);

        /** Pagination page. */
        public page: number;

        /** Pagination limit. */
        public limit: number;

        /** Pagination total. */
        public total: number;

        /** Pagination totalPages. */
        public totalPages: number;

        /**
         * Creates a new Pagination instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Pagination instance
         */
        public static create(properties?: prompt_management_system.IPagination): prompt_management_system.Pagination;

        /**
         * Encodes the specified Pagination message. Does not implicitly {@link prompt_management_system.Pagination.verify|verify} messages.
         * @param message Pagination message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: prompt_management_system.IPagination, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Pagination message, length delimited. Does not implicitly {@link prompt_management_system.Pagination.verify|verify} messages.
         * @param message Pagination message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: prompt_management_system.IPagination, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Pagination message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Pagination
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): prompt_management_system.Pagination;

        /**
         * Decodes a Pagination message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Pagination
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): prompt_management_system.Pagination;

        /**
         * Verifies a Pagination message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Pagination message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Pagination
         */
        public static fromObject(object: { [k: string]: any }): prompt_management_system.Pagination;

        /**
         * Creates a plain object from a Pagination message. Also converts values to other types if specified.
         * @param message Pagination
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: prompt_management_system.Pagination, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Pagination to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Pagination
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a RenderRequest. */
    interface IRenderRequest {

        /** RenderRequest environment */
        environment?: (string|null);

        /** RenderRequest variables */
        variables?: ({ [k: string]: string }|null);
    }

    /** Represents a RenderRequest. */
    class RenderRequest implements IRenderRequest {

        /**
         * Constructs a new RenderRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: prompt_management_system.IRenderRequest);

        /** RenderRequest environment. */
        public environment: string;

        /** RenderRequest variables. */
        public variables: { [k: string]: string };

        /**
         * Creates a new RenderRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns RenderRequest instance
         */
        public static create(properties?: prompt_management_system.IRenderRequest): prompt_management_system.RenderRequest;

        /**
         * Encodes the specified RenderRequest message. Does not implicitly {@link prompt_management_system.RenderRequest.verify|verify} messages.
         * @param message RenderRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: prompt_management_system.IRenderRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified RenderRequest message, length delimited. Does not implicitly {@link prompt_management_system.RenderRequest.verify|verify} messages.
         * @param message RenderRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: prompt_management_system.IRenderRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a RenderRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns RenderRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): prompt_management_system.RenderRequest;

        /**
         * Decodes a RenderRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns RenderRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): prompt_management_system.RenderRequest;

        /**
         * Verifies a RenderRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a RenderRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns RenderRequest
         */
        public static fromObject(object: { [k: string]: any }): prompt_management_system.RenderRequest;

        /**
         * Creates a plain object from a RenderRequest message. Also converts values to other types if specified.
         * @param message RenderRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: prompt_management_system.RenderRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this RenderRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for RenderRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a RenderResponse. */
    interface IRenderResponse {

        /** RenderResponse rendered */
        rendered?: (string|null);

        /** RenderResponse config */
        config?: (string|null);

        /** RenderResponse version */
        version?: (prompt_management_system.IPromptVersion|null);

        /** RenderResponse prompt */
        prompt?: (prompt_management_system.IPrompt|null);
    }

    /** Represents a RenderResponse. */
    class RenderResponse implements IRenderResponse {

        /**
         * Constructs a new RenderResponse.
         * @param [properties] Properties to set
         */
        constructor(properties?: prompt_management_system.IRenderResponse);

        /** RenderResponse rendered. */
        public rendered: string;

        /** RenderResponse config. */
        public config: string;

        /** RenderResponse version. */
        public version?: (prompt_management_system.IPromptVersion|null);

        /** RenderResponse prompt. */
        public prompt?: (prompt_management_system.IPrompt|null);

        /**
         * Creates a new RenderResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns RenderResponse instance
         */
        public static create(properties?: prompt_management_system.IRenderResponse): prompt_management_system.RenderResponse;

        /**
         * Encodes the specified RenderResponse message. Does not implicitly {@link prompt_management_system.RenderResponse.verify|verify} messages.
         * @param message RenderResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: prompt_management_system.IRenderResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified RenderResponse message, length delimited. Does not implicitly {@link prompt_management_system.RenderResponse.verify|verify} messages.
         * @param message RenderResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: prompt_management_system.IRenderResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a RenderResponse message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns RenderResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): prompt_management_system.RenderResponse;

        /**
         * Decodes a RenderResponse message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns RenderResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): prompt_management_system.RenderResponse;

        /**
         * Verifies a RenderResponse message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a RenderResponse message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns RenderResponse
         */
        public static fromObject(object: { [k: string]: any }): prompt_management_system.RenderResponse;

        /**
         * Creates a plain object from a RenderResponse message. Also converts values to other types if specified.
         * @param message RenderResponse
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: prompt_management_system.RenderResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this RenderResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for RenderResponse
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }
}
