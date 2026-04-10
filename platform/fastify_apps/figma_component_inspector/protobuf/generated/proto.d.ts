import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace figma_component_inspector. */
export namespace figma_component_inspector {

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
        constructor(properties?: figma_component_inspector.ITimestamp);

        /** Timestamp seconds. */
        public seconds: (number|Long);

        /** Timestamp nanos. */
        public nanos: number;

        /**
         * Creates a new Timestamp instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Timestamp instance
         */
        public static create(properties?: figma_component_inspector.ITimestamp): figma_component_inspector.Timestamp;

        /**
         * Encodes the specified Timestamp message. Does not implicitly {@link figma_component_inspector.Timestamp.verify|verify} messages.
         * @param message Timestamp message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: figma_component_inspector.ITimestamp, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Timestamp message, length delimited. Does not implicitly {@link figma_component_inspector.Timestamp.verify|verify} messages.
         * @param message Timestamp message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: figma_component_inspector.ITimestamp, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Timestamp message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Timestamp
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_component_inspector.Timestamp;

        /**
         * Decodes a Timestamp message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Timestamp
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_component_inspector.Timestamp;

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
        public static fromObject(object: { [k: string]: any }): figma_component_inspector.Timestamp;

        /**
         * Creates a plain object from a Timestamp message. Also converts values to other types if specified.
         * @param message Timestamp
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: figma_component_inspector.Timestamp, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
        constructor(properties?: figma_component_inspector.IPaginationRequest);

        /** PaginationRequest page. */
        public page: number;

        /** PaginationRequest pageSize. */
        public pageSize: number;

        /**
         * Creates a new PaginationRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns PaginationRequest instance
         */
        public static create(properties?: figma_component_inspector.IPaginationRequest): figma_component_inspector.PaginationRequest;

        /**
         * Encodes the specified PaginationRequest message. Does not implicitly {@link figma_component_inspector.PaginationRequest.verify|verify} messages.
         * @param message PaginationRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: figma_component_inspector.IPaginationRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified PaginationRequest message, length delimited. Does not implicitly {@link figma_component_inspector.PaginationRequest.verify|verify} messages.
         * @param message PaginationRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: figma_component_inspector.IPaginationRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a PaginationRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns PaginationRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_component_inspector.PaginationRequest;

        /**
         * Decodes a PaginationRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns PaginationRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_component_inspector.PaginationRequest;

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
        public static fromObject(object: { [k: string]: any }): figma_component_inspector.PaginationRequest;

        /**
         * Creates a plain object from a PaginationRequest message. Also converts values to other types if specified.
         * @param message PaginationRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: figma_component_inspector.PaginationRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
        constructor(properties?: figma_component_inspector.IPaginationResponse);

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
        public static create(properties?: figma_component_inspector.IPaginationResponse): figma_component_inspector.PaginationResponse;

        /**
         * Encodes the specified PaginationResponse message. Does not implicitly {@link figma_component_inspector.PaginationResponse.verify|verify} messages.
         * @param message PaginationResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: figma_component_inspector.IPaginationResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified PaginationResponse message, length delimited. Does not implicitly {@link figma_component_inspector.PaginationResponse.verify|verify} messages.
         * @param message PaginationResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: figma_component_inspector.IPaginationResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a PaginationResponse message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns PaginationResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_component_inspector.PaginationResponse;

        /**
         * Decodes a PaginationResponse message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns PaginationResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_component_inspector.PaginationResponse;

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
        public static fromObject(object: { [k: string]: any }): figma_component_inspector.PaginationResponse;

        /**
         * Creates a plain object from a PaginationResponse message. Also converts values to other types if specified.
         * @param message PaginationResponse
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: figma_component_inspector.PaginationResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

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

    /** Properties of a RGBAColor. */
    interface IRGBAColor {

        /** RGBAColor r */
        r?: (number|null);

        /** RGBAColor g */
        g?: (number|null);

        /** RGBAColor b */
        b?: (number|null);

        /** RGBAColor a */
        a?: (number|null);
    }

    /** Represents a RGBAColor. */
    class RGBAColor implements IRGBAColor {

        /**
         * Constructs a new RGBAColor.
         * @param [properties] Properties to set
         */
        constructor(properties?: figma_component_inspector.IRGBAColor);

        /** RGBAColor r. */
        public r: number;

        /** RGBAColor g. */
        public g: number;

        /** RGBAColor b. */
        public b: number;

        /** RGBAColor a. */
        public a: number;

        /**
         * Creates a new RGBAColor instance using the specified properties.
         * @param [properties] Properties to set
         * @returns RGBAColor instance
         */
        public static create(properties?: figma_component_inspector.IRGBAColor): figma_component_inspector.RGBAColor;

        /**
         * Encodes the specified RGBAColor message. Does not implicitly {@link figma_component_inspector.RGBAColor.verify|verify} messages.
         * @param message RGBAColor message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: figma_component_inspector.IRGBAColor, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified RGBAColor message, length delimited. Does not implicitly {@link figma_component_inspector.RGBAColor.verify|verify} messages.
         * @param message RGBAColor message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: figma_component_inspector.IRGBAColor, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a RGBAColor message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns RGBAColor
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_component_inspector.RGBAColor;

        /**
         * Decodes a RGBAColor message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns RGBAColor
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_component_inspector.RGBAColor;

        /**
         * Verifies a RGBAColor message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a RGBAColor message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns RGBAColor
         */
        public static fromObject(object: { [k: string]: any }): figma_component_inspector.RGBAColor;

        /**
         * Creates a plain object from a RGBAColor message. Also converts values to other types if specified.
         * @param message RGBAColor
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: figma_component_inspector.RGBAColor, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this RGBAColor to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for RGBAColor
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a BoundingBox. */
    interface IBoundingBox {

        /** BoundingBox x */
        x?: (number|null);

        /** BoundingBox y */
        y?: (number|null);

        /** BoundingBox width */
        width?: (number|null);

        /** BoundingBox height */
        height?: (number|null);
    }

    /** Represents a BoundingBox. */
    class BoundingBox implements IBoundingBox {

        /**
         * Constructs a new BoundingBox.
         * @param [properties] Properties to set
         */
        constructor(properties?: figma_component_inspector.IBoundingBox);

        /** BoundingBox x. */
        public x: number;

        /** BoundingBox y. */
        public y: number;

        /** BoundingBox width. */
        public width: number;

        /** BoundingBox height. */
        public height: number;

        /**
         * Creates a new BoundingBox instance using the specified properties.
         * @param [properties] Properties to set
         * @returns BoundingBox instance
         */
        public static create(properties?: figma_component_inspector.IBoundingBox): figma_component_inspector.BoundingBox;

        /**
         * Encodes the specified BoundingBox message. Does not implicitly {@link figma_component_inspector.BoundingBox.verify|verify} messages.
         * @param message BoundingBox message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: figma_component_inspector.IBoundingBox, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified BoundingBox message, length delimited. Does not implicitly {@link figma_component_inspector.BoundingBox.verify|verify} messages.
         * @param message BoundingBox message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: figma_component_inspector.IBoundingBox, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a BoundingBox message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns BoundingBox
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_component_inspector.BoundingBox;

        /**
         * Decodes a BoundingBox message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns BoundingBox
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_component_inspector.BoundingBox;

        /**
         * Verifies a BoundingBox message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a BoundingBox message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns BoundingBox
         */
        public static fromObject(object: { [k: string]: any }): figma_component_inspector.BoundingBox;

        /**
         * Creates a plain object from a BoundingBox message. Also converts values to other types if specified.
         * @param message BoundingBox
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: figma_component_inspector.BoundingBox, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this BoundingBox to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for BoundingBox
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a FigmaNode. */
    interface IFigmaNode {

        /** FigmaNode id */
        id?: (string|null);

        /** FigmaNode name */
        name?: (string|null);

        /** FigmaNode type */
        type?: (string|null);

        /** FigmaNode visible */
        visible?: (boolean|null);

        /** FigmaNode absoluteBoundingBox */
        absoluteBoundingBox?: (figma_component_inspector.IBoundingBox|null);

        /** FigmaNode children */
        children?: (figma_component_inspector.IFigmaNode[]|null);

        /** FigmaNode styles */
        styles?: ({ [k: string]: string }|null);

        /** FigmaNode backgroundColor */
        backgroundColor?: (figma_component_inspector.IRGBAColor|null);
    }

    /** Represents a FigmaNode. */
    class FigmaNode implements IFigmaNode {

        /**
         * Constructs a new FigmaNode.
         * @param [properties] Properties to set
         */
        constructor(properties?: figma_component_inspector.IFigmaNode);

        /** FigmaNode id. */
        public id: string;

        /** FigmaNode name. */
        public name: string;

        /** FigmaNode type. */
        public type: string;

        /** FigmaNode visible. */
        public visible?: (boolean|null);

        /** FigmaNode absoluteBoundingBox. */
        public absoluteBoundingBox?: (figma_component_inspector.IBoundingBox|null);

        /** FigmaNode children. */
        public children: figma_component_inspector.IFigmaNode[];

        /** FigmaNode styles. */
        public styles: { [k: string]: string };

        /** FigmaNode backgroundColor. */
        public backgroundColor?: (figma_component_inspector.IRGBAColor|null);

        /**
         * Creates a new FigmaNode instance using the specified properties.
         * @param [properties] Properties to set
         * @returns FigmaNode instance
         */
        public static create(properties?: figma_component_inspector.IFigmaNode): figma_component_inspector.FigmaNode;

        /**
         * Encodes the specified FigmaNode message. Does not implicitly {@link figma_component_inspector.FigmaNode.verify|verify} messages.
         * @param message FigmaNode message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: figma_component_inspector.IFigmaNode, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified FigmaNode message, length delimited. Does not implicitly {@link figma_component_inspector.FigmaNode.verify|verify} messages.
         * @param message FigmaNode message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: figma_component_inspector.IFigmaNode, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a FigmaNode message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns FigmaNode
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_component_inspector.FigmaNode;

        /**
         * Decodes a FigmaNode message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns FigmaNode
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_component_inspector.FigmaNode;

        /**
         * Verifies a FigmaNode message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a FigmaNode message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns FigmaNode
         */
        public static fromObject(object: { [k: string]: any }): figma_component_inspector.FigmaNode;

        /**
         * Creates a plain object from a FigmaNode message. Also converts values to other types if specified.
         * @param message FigmaNode
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: figma_component_inspector.FigmaNode, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this FigmaNode to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for FigmaNode
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a FigmaComponent. */
    interface IFigmaComponent {

        /** FigmaComponent key */
        key?: (string|null);

        /** FigmaComponent name */
        name?: (string|null);

        /** FigmaComponent description */
        description?: (string|null);
    }

    /** Represents a FigmaComponent. */
    class FigmaComponent implements IFigmaComponent {

        /**
         * Constructs a new FigmaComponent.
         * @param [properties] Properties to set
         */
        constructor(properties?: figma_component_inspector.IFigmaComponent);

        /** FigmaComponent key. */
        public key: string;

        /** FigmaComponent name. */
        public name: string;

        /** FigmaComponent description. */
        public description?: (string|null);

        /**
         * Creates a new FigmaComponent instance using the specified properties.
         * @param [properties] Properties to set
         * @returns FigmaComponent instance
         */
        public static create(properties?: figma_component_inspector.IFigmaComponent): figma_component_inspector.FigmaComponent;

        /**
         * Encodes the specified FigmaComponent message. Does not implicitly {@link figma_component_inspector.FigmaComponent.verify|verify} messages.
         * @param message FigmaComponent message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: figma_component_inspector.IFigmaComponent, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified FigmaComponent message, length delimited. Does not implicitly {@link figma_component_inspector.FigmaComponent.verify|verify} messages.
         * @param message FigmaComponent message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: figma_component_inspector.IFigmaComponent, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a FigmaComponent message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns FigmaComponent
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_component_inspector.FigmaComponent;

        /**
         * Decodes a FigmaComponent message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns FigmaComponent
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_component_inspector.FigmaComponent;

        /**
         * Verifies a FigmaComponent message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a FigmaComponent message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns FigmaComponent
         */
        public static fromObject(object: { [k: string]: any }): figma_component_inspector.FigmaComponent;

        /**
         * Creates a plain object from a FigmaComponent message. Also converts values to other types if specified.
         * @param message FigmaComponent
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: figma_component_inspector.FigmaComponent, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this FigmaComponent to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for FigmaComponent
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a FigmaFileResponse. */
    interface IFigmaFileResponse {

        /** FigmaFileResponse name */
        name?: (string|null);

        /** FigmaFileResponse lastModified */
        lastModified?: (string|null);

        /** FigmaFileResponse thumbnailUrl */
        thumbnailUrl?: (string|null);

        /** FigmaFileResponse version */
        version?: (string|null);

        /** FigmaFileResponse document */
        document?: (figma_component_inspector.IFigmaNode|null);

        /** FigmaFileResponse components */
        components?: ({ [k: string]: figma_component_inspector.IFigmaComponent }|null);
    }

    /** Represents a FigmaFileResponse. */
    class FigmaFileResponse implements IFigmaFileResponse {

        /**
         * Constructs a new FigmaFileResponse.
         * @param [properties] Properties to set
         */
        constructor(properties?: figma_component_inspector.IFigmaFileResponse);

        /** FigmaFileResponse name. */
        public name: string;

        /** FigmaFileResponse lastModified. */
        public lastModified: string;

        /** FigmaFileResponse thumbnailUrl. */
        public thumbnailUrl?: (string|null);

        /** FigmaFileResponse version. */
        public version: string;

        /** FigmaFileResponse document. */
        public document?: (figma_component_inspector.IFigmaNode|null);

        /** FigmaFileResponse components. */
        public components: { [k: string]: figma_component_inspector.IFigmaComponent };

        /**
         * Creates a new FigmaFileResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns FigmaFileResponse instance
         */
        public static create(properties?: figma_component_inspector.IFigmaFileResponse): figma_component_inspector.FigmaFileResponse;

        /**
         * Encodes the specified FigmaFileResponse message. Does not implicitly {@link figma_component_inspector.FigmaFileResponse.verify|verify} messages.
         * @param message FigmaFileResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: figma_component_inspector.IFigmaFileResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified FigmaFileResponse message, length delimited. Does not implicitly {@link figma_component_inspector.FigmaFileResponse.verify|verify} messages.
         * @param message FigmaFileResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: figma_component_inspector.IFigmaFileResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a FigmaFileResponse message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns FigmaFileResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_component_inspector.FigmaFileResponse;

        /**
         * Decodes a FigmaFileResponse message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns FigmaFileResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_component_inspector.FigmaFileResponse;

        /**
         * Verifies a FigmaFileResponse message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a FigmaFileResponse message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns FigmaFileResponse
         */
        public static fromObject(object: { [k: string]: any }): figma_component_inspector.FigmaFileResponse;

        /**
         * Creates a plain object from a FigmaFileResponse message. Also converts values to other types if specified.
         * @param message FigmaFileResponse
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: figma_component_inspector.FigmaFileResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this FigmaFileResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for FigmaFileResponse
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a FigmaImagesResponse. */
    interface IFigmaImagesResponse {

        /** FigmaImagesResponse err */
        err?: (string|null);

        /** FigmaImagesResponse images */
        images?: ({ [k: string]: string }|null);

        /** FigmaImagesResponse status */
        status?: (number|null);
    }

    /** Represents a FigmaImagesResponse. */
    class FigmaImagesResponse implements IFigmaImagesResponse {

        /**
         * Constructs a new FigmaImagesResponse.
         * @param [properties] Properties to set
         */
        constructor(properties?: figma_component_inspector.IFigmaImagesResponse);

        /** FigmaImagesResponse err. */
        public err?: (string|null);

        /** FigmaImagesResponse images. */
        public images: { [k: string]: string };

        /** FigmaImagesResponse status. */
        public status?: (number|null);

        /**
         * Creates a new FigmaImagesResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns FigmaImagesResponse instance
         */
        public static create(properties?: figma_component_inspector.IFigmaImagesResponse): figma_component_inspector.FigmaImagesResponse;

        /**
         * Encodes the specified FigmaImagesResponse message. Does not implicitly {@link figma_component_inspector.FigmaImagesResponse.verify|verify} messages.
         * @param message FigmaImagesResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: figma_component_inspector.IFigmaImagesResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified FigmaImagesResponse message, length delimited. Does not implicitly {@link figma_component_inspector.FigmaImagesResponse.verify|verify} messages.
         * @param message FigmaImagesResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: figma_component_inspector.IFigmaImagesResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a FigmaImagesResponse message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns FigmaImagesResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_component_inspector.FigmaImagesResponse;

        /**
         * Decodes a FigmaImagesResponse message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns FigmaImagesResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_component_inspector.FigmaImagesResponse;

        /**
         * Verifies a FigmaImagesResponse message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a FigmaImagesResponse message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns FigmaImagesResponse
         */
        public static fromObject(object: { [k: string]: any }): figma_component_inspector.FigmaImagesResponse;

        /**
         * Creates a plain object from a FigmaImagesResponse message. Also converts values to other types if specified.
         * @param message FigmaImagesResponse
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: figma_component_inspector.FigmaImagesResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this FigmaImagesResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for FigmaImagesResponse
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a DesignVariable. */
    interface IDesignVariable {

        /** DesignVariable name */
        name?: (string|null);

        /** DesignVariable value */
        value?: (string|null);

        /** DesignVariable type */
        type?: (string|null);

        /** DesignVariable collection */
        collection?: (string|null);
    }

    /** Represents a DesignVariable. */
    class DesignVariable implements IDesignVariable {

        /**
         * Constructs a new DesignVariable.
         * @param [properties] Properties to set
         */
        constructor(properties?: figma_component_inspector.IDesignVariable);

        /** DesignVariable name. */
        public name: string;

        /** DesignVariable value. */
        public value: string;

        /** DesignVariable type. */
        public type: string;

        /** DesignVariable collection. */
        public collection?: (string|null);

        /**
         * Creates a new DesignVariable instance using the specified properties.
         * @param [properties] Properties to set
         * @returns DesignVariable instance
         */
        public static create(properties?: figma_component_inspector.IDesignVariable): figma_component_inspector.DesignVariable;

        /**
         * Encodes the specified DesignVariable message. Does not implicitly {@link figma_component_inspector.DesignVariable.verify|verify} messages.
         * @param message DesignVariable message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: figma_component_inspector.IDesignVariable, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified DesignVariable message, length delimited. Does not implicitly {@link figma_component_inspector.DesignVariable.verify|verify} messages.
         * @param message DesignVariable message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: figma_component_inspector.IDesignVariable, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a DesignVariable message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns DesignVariable
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_component_inspector.DesignVariable;

        /**
         * Decodes a DesignVariable message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns DesignVariable
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_component_inspector.DesignVariable;

        /**
         * Verifies a DesignVariable message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a DesignVariable message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns DesignVariable
         */
        public static fromObject(object: { [k: string]: any }): figma_component_inspector.DesignVariable;

        /**
         * Creates a plain object from a DesignVariable message. Also converts values to other types if specified.
         * @param message DesignVariable
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: figma_component_inspector.DesignVariable, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this DesignVariable to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for DesignVariable
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a ComponentProperty. */
    interface IComponentProperty {

        /** ComponentProperty value */
        value?: (string|null);

        /** ComponentProperty type */
        type?: (string|null);

        /** ComponentProperty token */
        token?: (string|null);
    }

    /** Represents a ComponentProperty. */
    class ComponentProperty implements IComponentProperty {

        /**
         * Constructs a new ComponentProperty.
         * @param [properties] Properties to set
         */
        constructor(properties?: figma_component_inspector.IComponentProperty);

        /** ComponentProperty value. */
        public value: string;

        /** ComponentProperty type. */
        public type: string;

        /** ComponentProperty token. */
        public token?: (string|null);

        /**
         * Creates a new ComponentProperty instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ComponentProperty instance
         */
        public static create(properties?: figma_component_inspector.IComponentProperty): figma_component_inspector.ComponentProperty;

        /**
         * Encodes the specified ComponentProperty message. Does not implicitly {@link figma_component_inspector.ComponentProperty.verify|verify} messages.
         * @param message ComponentProperty message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: figma_component_inspector.IComponentProperty, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ComponentProperty message, length delimited. Does not implicitly {@link figma_component_inspector.ComponentProperty.verify|verify} messages.
         * @param message ComponentProperty message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: figma_component_inspector.IComponentProperty, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ComponentProperty message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ComponentProperty
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_component_inspector.ComponentProperty;

        /**
         * Decodes a ComponentProperty message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ComponentProperty
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_component_inspector.ComponentProperty;

        /**
         * Verifies a ComponentProperty message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a ComponentProperty message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ComponentProperty
         */
        public static fromObject(object: { [k: string]: any }): figma_component_inspector.ComponentProperty;

        /**
         * Creates a plain object from a ComponentProperty message. Also converts values to other types if specified.
         * @param message ComponentProperty
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: figma_component_inspector.ComponentProperty, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ComponentProperty to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for ComponentProperty
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a NodeDetailsResponse. */
    interface INodeDetailsResponse {

        /** NodeDetailsResponse node */
        node?: (figma_component_inspector.IFigmaNode|null);

        /** NodeDetailsResponse properties */
        properties?: ({ [k: string]: figma_component_inspector.IComponentProperty }|null);
    }

    /** Represents a NodeDetailsResponse. */
    class NodeDetailsResponse implements INodeDetailsResponse {

        /**
         * Constructs a new NodeDetailsResponse.
         * @param [properties] Properties to set
         */
        constructor(properties?: figma_component_inspector.INodeDetailsResponse);

        /** NodeDetailsResponse node. */
        public node?: (figma_component_inspector.IFigmaNode|null);

        /** NodeDetailsResponse properties. */
        public properties: { [k: string]: figma_component_inspector.IComponentProperty };

        /**
         * Creates a new NodeDetailsResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns NodeDetailsResponse instance
         */
        public static create(properties?: figma_component_inspector.INodeDetailsResponse): figma_component_inspector.NodeDetailsResponse;

        /**
         * Encodes the specified NodeDetailsResponse message. Does not implicitly {@link figma_component_inspector.NodeDetailsResponse.verify|verify} messages.
         * @param message NodeDetailsResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: figma_component_inspector.INodeDetailsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified NodeDetailsResponse message, length delimited. Does not implicitly {@link figma_component_inspector.NodeDetailsResponse.verify|verify} messages.
         * @param message NodeDetailsResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: figma_component_inspector.INodeDetailsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a NodeDetailsResponse message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns NodeDetailsResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_component_inspector.NodeDetailsResponse;

        /**
         * Decodes a NodeDetailsResponse message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns NodeDetailsResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_component_inspector.NodeDetailsResponse;

        /**
         * Verifies a NodeDetailsResponse message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a NodeDetailsResponse message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns NodeDetailsResponse
         */
        public static fromObject(object: { [k: string]: any }): figma_component_inspector.NodeDetailsResponse;

        /**
         * Creates a plain object from a NodeDetailsResponse message. Also converts values to other types if specified.
         * @param message NodeDetailsResponse
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: figma_component_inspector.NodeDetailsResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this NodeDetailsResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for NodeDetailsResponse
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an ApiResponse. */
    interface IApiResponse {

        /** ApiResponse success */
        success?: (boolean|null);

        /** ApiResponse fileResponse */
        fileResponse?: (figma_component_inspector.IFigmaFileResponse|null);

        /** ApiResponse imagesResponse */
        imagesResponse?: (figma_component_inspector.IFigmaImagesResponse|null);

        /** ApiResponse nodeResponse */
        nodeResponse?: (figma_component_inspector.INodeDetailsResponse|null);

        /** ApiResponse error */
        error?: (string|null);

        /** ApiResponse message */
        message?: (string|null);

        /** ApiResponse statusCode */
        statusCode?: (number|null);
    }

    /** Represents an ApiResponse. */
    class ApiResponse implements IApiResponse {

        /**
         * Constructs a new ApiResponse.
         * @param [properties] Properties to set
         */
        constructor(properties?: figma_component_inspector.IApiResponse);

        /** ApiResponse success. */
        public success: boolean;

        /** ApiResponse fileResponse. */
        public fileResponse?: (figma_component_inspector.IFigmaFileResponse|null);

        /** ApiResponse imagesResponse. */
        public imagesResponse?: (figma_component_inspector.IFigmaImagesResponse|null);

        /** ApiResponse nodeResponse. */
        public nodeResponse?: (figma_component_inspector.INodeDetailsResponse|null);

        /** ApiResponse error. */
        public error?: (string|null);

        /** ApiResponse message. */
        public message?: (string|null);

        /** ApiResponse statusCode. */
        public statusCode?: (number|null);

        /** ApiResponse payload. */
        public payload?: ("fileResponse"|"imagesResponse"|"nodeResponse");

        /**
         * Creates a new ApiResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ApiResponse instance
         */
        public static create(properties?: figma_component_inspector.IApiResponse): figma_component_inspector.ApiResponse;

        /**
         * Encodes the specified ApiResponse message. Does not implicitly {@link figma_component_inspector.ApiResponse.verify|verify} messages.
         * @param message ApiResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: figma_component_inspector.IApiResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ApiResponse message, length delimited. Does not implicitly {@link figma_component_inspector.ApiResponse.verify|verify} messages.
         * @param message ApiResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: figma_component_inspector.IApiResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an ApiResponse message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ApiResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): figma_component_inspector.ApiResponse;

        /**
         * Decodes an ApiResponse message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ApiResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): figma_component_inspector.ApiResponse;

        /**
         * Verifies an ApiResponse message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an ApiResponse message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ApiResponse
         */
        public static fromObject(object: { [k: string]: any }): figma_component_inspector.ApiResponse;

        /**
         * Creates a plain object from an ApiResponse message. Also converts values to other types if specified.
         * @param message ApiResponse
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: figma_component_inspector.ApiResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ApiResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for ApiResponse
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }
}
