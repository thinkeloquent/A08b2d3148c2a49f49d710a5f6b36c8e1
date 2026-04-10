import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace ai_ask. */
export namespace ai_ask {

    /** Properties of a Persona. */
    interface IPersona {

        /** Persona id */
        id?: (string|null);

        /** Persona name */
        name?: (string|null);

        /** Persona description */
        description?: (string|null);

        /** Persona role */
        role?: (string|null);

        /** Persona tone */
        tone?: (string|null);

        /** Persona llmProvider */
        llmProvider?: (string|null);

        /** Persona llmTemperature */
        llmTemperature?: (number|null);

        /** Persona llmParametersJson */
        llmParametersJson?: (string|null);

        /** Persona goals */
        goals?: (string[]|null);

        /** Persona tools */
        tools?: (string[]|null);

        /** Persona permittedTo */
        permittedTo?: (string[]|null);

        /** Persona promptSystemTemplate */
        promptSystemTemplate?: (string[]|null);

        /** Persona promptUserTemplate */
        promptUserTemplate?: (string[]|null);

        /** Persona promptContextTemplate */
        promptContextTemplate?: (string[]|null);

        /** Persona promptInstruction */
        promptInstruction?: (string[]|null);

        /** Persona agentDelegate */
        agentDelegate?: (string[]|null);

        /** Persona agentCall */
        agentCall?: (string[]|null);

        /** Persona contextFiles */
        contextFiles?: (string[]|null);

        /** Persona memoryJson */
        memoryJson?: (string|null);

        /** Persona version */
        version?: (string|null);

        /** Persona createdAt */
        createdAt?: (string|null);

        /** Persona updatedAt */
        updatedAt?: (string|null);
    }

    /** Represents a Persona. */
    class Persona implements IPersona {

        /**
         * Constructs a new Persona.
         * @param [properties] Properties to set
         */
        constructor(properties?: ai_ask.IPersona);

        /** Persona id. */
        public id: string;

        /** Persona name. */
        public name: string;

        /** Persona description. */
        public description: string;

        /** Persona role. */
        public role: string;

        /** Persona tone. */
        public tone: string;

        /** Persona llmProvider. */
        public llmProvider: string;

        /** Persona llmTemperature. */
        public llmTemperature: number;

        /** Persona llmParametersJson. */
        public llmParametersJson: string;

        /** Persona goals. */
        public goals: string[];

        /** Persona tools. */
        public tools: string[];

        /** Persona permittedTo. */
        public permittedTo: string[];

        /** Persona promptSystemTemplate. */
        public promptSystemTemplate: string[];

        /** Persona promptUserTemplate. */
        public promptUserTemplate: string[];

        /** Persona promptContextTemplate. */
        public promptContextTemplate: string[];

        /** Persona promptInstruction. */
        public promptInstruction: string[];

        /** Persona agentDelegate. */
        public agentDelegate: string[];

        /** Persona agentCall. */
        public agentCall: string[];

        /** Persona contextFiles. */
        public contextFiles: string[];

        /** Persona memoryJson. */
        public memoryJson: string;

        /** Persona version. */
        public version: string;

        /** Persona createdAt. */
        public createdAt: string;

        /** Persona updatedAt. */
        public updatedAt: string;

        /**
         * Creates a new Persona instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Persona instance
         */
        public static create(properties?: ai_ask.IPersona): ai_ask.Persona;

        /**
         * Encodes the specified Persona message. Does not implicitly {@link ai_ask.Persona.verify|verify} messages.
         * @param message Persona message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: ai_ask.IPersona, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Persona message, length delimited. Does not implicitly {@link ai_ask.Persona.verify|verify} messages.
         * @param message Persona message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: ai_ask.IPersona, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Persona message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Persona
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ai_ask.Persona;

        /**
         * Decodes a Persona message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Persona
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ai_ask.Persona;

        /**
         * Verifies a Persona message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Persona message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Persona
         */
        public static fromObject(object: { [k: string]: any }): ai_ask.Persona;

        /**
         * Creates a plain object from a Persona message. Also converts values to other types if specified.
         * @param message Persona
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: ai_ask.Persona, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Persona to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Persona
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a PersonaList. */
    interface IPersonaList {

        /** PersonaList personas */
        personas?: (ai_ask.IPersona[]|null);
    }

    /** Represents a PersonaList. */
    class PersonaList implements IPersonaList {

        /**
         * Constructs a new PersonaList.
         * @param [properties] Properties to set
         */
        constructor(properties?: ai_ask.IPersonaList);

        /** PersonaList personas. */
        public personas: ai_ask.IPersona[];

        /**
         * Creates a new PersonaList instance using the specified properties.
         * @param [properties] Properties to set
         * @returns PersonaList instance
         */
        public static create(properties?: ai_ask.IPersonaList): ai_ask.PersonaList;

        /**
         * Encodes the specified PersonaList message. Does not implicitly {@link ai_ask.PersonaList.verify|verify} messages.
         * @param message PersonaList message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: ai_ask.IPersonaList, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified PersonaList message, length delimited. Does not implicitly {@link ai_ask.PersonaList.verify|verify} messages.
         * @param message PersonaList message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: ai_ask.IPersonaList, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a PersonaList message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns PersonaList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ai_ask.PersonaList;

        /**
         * Decodes a PersonaList message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns PersonaList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ai_ask.PersonaList;

        /**
         * Verifies a PersonaList message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a PersonaList message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns PersonaList
         */
        public static fromObject(object: { [k: string]: any }): ai_ask.PersonaList;

        /**
         * Creates a plain object from a PersonaList message. Also converts values to other types if specified.
         * @param message PersonaList
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: ai_ask.PersonaList, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this PersonaList to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for PersonaList
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a LLMDefault. */
    interface ILLMDefault {

        /** LLMDefault id */
        id?: (string|null);

        /** LLMDefault category */
        category?: (string|null);

        /** LLMDefault name */
        name?: (string|null);

        /** LLMDefault description */
        description?: (string|null);

        /** LLMDefault valueJson */
        valueJson?: (string|null);

        /** LLMDefault isDefault */
        isDefault?: (boolean|null);

        /** LLMDefault createdAt */
        createdAt?: (string|null);

        /** LLMDefault updatedAt */
        updatedAt?: (string|null);
    }

    /** Represents a LLMDefault. */
    class LLMDefault implements ILLMDefault {

        /**
         * Constructs a new LLMDefault.
         * @param [properties] Properties to set
         */
        constructor(properties?: ai_ask.ILLMDefault);

        /** LLMDefault id. */
        public id: string;

        /** LLMDefault category. */
        public category: string;

        /** LLMDefault name. */
        public name: string;

        /** LLMDefault description. */
        public description: string;

        /** LLMDefault valueJson. */
        public valueJson: string;

        /** LLMDefault isDefault. */
        public isDefault: boolean;

        /** LLMDefault createdAt. */
        public createdAt: string;

        /** LLMDefault updatedAt. */
        public updatedAt: string;

        /**
         * Creates a new LLMDefault instance using the specified properties.
         * @param [properties] Properties to set
         * @returns LLMDefault instance
         */
        public static create(properties?: ai_ask.ILLMDefault): ai_ask.LLMDefault;

        /**
         * Encodes the specified LLMDefault message. Does not implicitly {@link ai_ask.LLMDefault.verify|verify} messages.
         * @param message LLMDefault message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: ai_ask.ILLMDefault, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified LLMDefault message, length delimited. Does not implicitly {@link ai_ask.LLMDefault.verify|verify} messages.
         * @param message LLMDefault message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: ai_ask.ILLMDefault, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a LLMDefault message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns LLMDefault
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ai_ask.LLMDefault;

        /**
         * Decodes a LLMDefault message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns LLMDefault
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ai_ask.LLMDefault;

        /**
         * Verifies a LLMDefault message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a LLMDefault message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns LLMDefault
         */
        public static fromObject(object: { [k: string]: any }): ai_ask.LLMDefault;

        /**
         * Creates a plain object from a LLMDefault message. Also converts values to other types if specified.
         * @param message LLMDefault
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: ai_ask.LLMDefault, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this LLMDefault to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for LLMDefault
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a LLMDefaultList. */
    interface ILLMDefaultList {

        /** LLMDefaultList defaults */
        defaults?: (ai_ask.ILLMDefault[]|null);
    }

    /** Represents a LLMDefaultList. */
    class LLMDefaultList implements ILLMDefaultList {

        /**
         * Constructs a new LLMDefaultList.
         * @param [properties] Properties to set
         */
        constructor(properties?: ai_ask.ILLMDefaultList);

        /** LLMDefaultList defaults. */
        public defaults: ai_ask.ILLMDefault[];

        /**
         * Creates a new LLMDefaultList instance using the specified properties.
         * @param [properties] Properties to set
         * @returns LLMDefaultList instance
         */
        public static create(properties?: ai_ask.ILLMDefaultList): ai_ask.LLMDefaultList;

        /**
         * Encodes the specified LLMDefaultList message. Does not implicitly {@link ai_ask.LLMDefaultList.verify|verify} messages.
         * @param message LLMDefaultList message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: ai_ask.ILLMDefaultList, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified LLMDefaultList message, length delimited. Does not implicitly {@link ai_ask.LLMDefaultList.verify|verify} messages.
         * @param message LLMDefaultList message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: ai_ask.ILLMDefaultList, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a LLMDefaultList message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns LLMDefaultList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ai_ask.LLMDefaultList;

        /**
         * Decodes a LLMDefaultList message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns LLMDefaultList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ai_ask.LLMDefaultList;

        /**
         * Verifies a LLMDefaultList message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a LLMDefaultList message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns LLMDefaultList
         */
        public static fromObject(object: { [k: string]: any }): ai_ask.LLMDefaultList;

        /**
         * Creates a plain object from a LLMDefaultList message. Also converts values to other types if specified.
         * @param message LLMDefaultList
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: ai_ask.LLMDefaultList, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this LLMDefaultList to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for LLMDefaultList
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }
}
