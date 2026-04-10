/**
 * Undici HTTP Handler for AWS SDK v3
 *
 * Implements the @smithy/protocol-http HttpHandler interface using an undici
 * Dispatcher as the transport layer. This allows S3Client to route all HTTP
 * requests through a caller-provided undici Agent/Dispatcher, enabling unified
 * proxy, SSL, timeout, and connection pooling configuration.
 *
 * Polyglot parity with Python httpx_s3_client.py (transport injection pattern).
 *
 * @example
 * ```typescript
 * import { Agent } from "undici";
 * import { S3Client } from "@aws-sdk/client-s3";
 * import { UndiciHttpHandler } from "cache_json_awss3_storage";
 *
 * const dispatcher = new Agent({ connect: { timeout: 10_000 } });
 * const handler = new UndiciHttpHandler(dispatcher);
 * const s3 = new S3Client({ requestHandler: handler });
 * ```
 */

import { Readable } from "node:stream";
import type { HttpHandler, HttpRequest, HttpResponse } from "@smithy/protocol-http";
import { HttpResponse as SmithyHttpResponse } from "@smithy/protocol-http";
import type { Dispatcher } from "undici";
import { request as undiciRequest } from "undici";

/**
 * Options for the UndiciHttpHandler.
 */
export interface UndiciHttpHandlerOptions {
  /** Connection timeout in milliseconds (default: 20000) */
  connectionTimeout?: number;
  /** Request/read timeout in milliseconds (default: 60000) */
  requestTimeout?: number;
}

/**
 * AWS SDK v3 HttpHandler that routes all HTTP through an undici Dispatcher.
 *
 * The S3Client continues to handle SigV4 signing, command serialization,
 * retries, etc. — this handler only replaces the transport layer.
 *
 * The caller owns the Dispatcher lifecycle. destroy() is a no-op.
 */
export class UndiciHttpHandler implements HttpHandler {
  private readonly dispatcher: Dispatcher;
  private readonly connectionTimeout: number;
  private readonly requestTimeout: number;

  constructor(dispatcher: Dispatcher, options?: UndiciHttpHandlerOptions) {
    this.dispatcher = dispatcher;
    this.connectionTimeout = options?.connectionTimeout ?? 20_000;
    this.requestTimeout = options?.requestTimeout ?? 60_000;
  }

  async handle(
    request: HttpRequest
  ): Promise<{ response: HttpResponse }> {
    const { protocol, hostname, port, path, query, method, headers, body } =
      request;

    // Reassemble URL from Smithy request components
    const proto = protocol ?? "https:";
    const portSuffix = port ? `:${port}` : "";
    const queryString = query
      ? "?" +
        Object.entries(query)
          .map(
            ([k, v]) =>
              `${encodeURIComponent(k)}=${encodeURIComponent(Array.isArray(v) ? v.join(",") : v ?? "")}`
          )
          .join("&")
      : "";
    const url = `${proto}//${hostname}${portSuffix}${path}${queryString}`;

    // Convert body to a form undici accepts
    let requestBody: Dispatcher.DispatchOptions["body"] = undefined;
    if (body) {
      if (typeof body === "string" || Buffer.isBuffer(body)) {
        requestBody = body;
      } else if (body instanceof Uint8Array) {
        requestBody = Buffer.from(body);
      } else if (typeof body.pipe === "function") {
        // Readable stream
        requestBody = body as Readable;
      }
    }

    const response = await undiciRequest(url, {
      method: method as Dispatcher.HttpMethod,
      headers: headers as Record<string, string>,
      body: requestBody,
      dispatcher: this.dispatcher,
      bodyTimeout: this.requestTimeout,
      headersTimeout: this.connectionTimeout,
    });

    // Convert undici headers (IncomingHttpHeaders) to Record<string, string>
    const responseHeaders: Record<string, string> = {};
    const rawHeaders = response.headers;
    for (const [key, value] of Object.entries(rawHeaders)) {
      if (value !== undefined) {
        responseHeaders[key] = Array.isArray(value) ? value.join(", ") : String(value);
      }
    }

    // Convert undici response body to a Node.js Readable stream
    const bodyStream = Readable.from(response.body);

    const smithyResponse = new SmithyHttpResponse({
      statusCode: response.statusCode,
      headers: responseHeaders,
      body: bodyStream,
    });

    return { response: smithyResponse };
  }

  /**
   * No-op — the caller owns the Dispatcher lifecycle.
   */
  destroy(): void {
    // Intentional no-op: caller manages the dispatcher
  }

  /**
   * Metadata for the handler, used by AWS SDK internals.
   */
  metadata = {
    handlerProtocol: "undici",
  };

  updateHttpClientConfig(_key: never, _value: never): void {
    // No-op — undici dispatcher config is immutable after construction
  }

  httpHandlerConfigs(): Record<string, never> {
    return {} as Record<string, never>;
  }
}
