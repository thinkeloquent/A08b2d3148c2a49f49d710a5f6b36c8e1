/**
 * Content Negotiation Plugin
 * Handles protobuf serialization/deserialization based on Accept/Content-Type headers
 */

import fastifyPlugin from 'fastify-plugin';
import { protoRoot } from '@internal/figma-files-proto';

const PROTO_CONTENT_TYPE = 'application/protobuf';
const PROTO_MESSAGE_HEADER = 'x-proto-message';

/**
 * Resolve a proto message type from a dotted path
 * e.g., "figma_files.figma_file.ListFigmaFilesResponse"
 * Since protoRoot is the figma_files namespace itself,
 * we strip that prefix if present.
 */
function resolveProtoType(messagePath) {
  if (!messagePath) return null;

  // Strip "figma_files." prefix if present since protoRoot IS figma_files
  const normalizedPath = messagePath.startsWith('figma_files.')
    ? messagePath.slice('figma_files.'.length)
    : messagePath;

  const parts = normalizedPath.split('.');
  let current = protoRoot;

  for (const part of parts) {
    current = current[part];
    if (!current) return null;
  }

  return current;
}

async function contentNegotiationPlugin(fastify, _options) {
  // Add custom content type parser for protobuf
  fastify.addContentTypeParser(
    PROTO_CONTENT_TYPE,
    { parseAs: 'buffer' },
    async (request, payload) => {
      const messageType = request.headers[PROTO_MESSAGE_HEADER];
      if (!messageType) {
        throw fastify.httpErrors.badRequest(
          `Missing ${PROTO_MESSAGE_HEADER} header for protobuf content`
        );
      }

      const ProtoType = resolveProtoType(messageType);
      if (!ProtoType) {
        throw fastify.httpErrors.badRequest(
          `Unknown proto message type: ${messageType}`
        );
      }

      try {
        return ProtoType.decode(payload);
      } catch (error) {
        throw fastify.httpErrors.badRequest(
          `Failed to decode protobuf: ${error.message}`
        );
      }
    }
  );

  // Decorate request with helper to check if protobuf response is requested
  fastify.decorateRequest('wantsProtobuf', function () {
    const accept = this.headers.accept || '';
    return accept.includes(PROTO_CONTENT_TYPE);
  });

  // Decorate request with helper to get requested proto message type
  fastify.decorateRequest('getProtoMessageType', function () {
    return this.headers[PROTO_MESSAGE_HEADER] || null;
  });

  // Decorate reply with protobuf serialization helper
  fastify.decorateReply('sendProto', function (data, messageType) {
    const ProtoType = resolveProtoType(messageType);
    if (!ProtoType) {
      throw fastify.httpErrors.internalServerError(
        `Unknown proto message type: ${messageType}`
      );
    }

    const errMsg = ProtoType.verify(data);
    if (errMsg) {
      throw fastify.httpErrors.internalServerError(
        `Proto validation failed: ${errMsg}`
      );
    }

    const message = ProtoType.create(data);
    const buffer = ProtoType.encode(message).finish();

    this.header('Content-Type', PROTO_CONTENT_TYPE);
    this.header(PROTO_MESSAGE_HEADER, messageType);
    return this.send(Buffer.from(buffer));
  });

  // Decorate reply with smart send that handles content negotiation
  fastify.decorateReply('sendNegotiated', function (data, protoMessageType) {
    if (this.request.wantsProtobuf() && protoMessageType) {
      return this.sendProto(data, protoMessageType);
    }
    return this.send(data);
  });

  fastify.log.info('Content negotiation plugin registered');

  return Promise.resolve();
}

export default fastifyPlugin(contentNegotiationPlugin, {
  name: 'content-negotiation',
});

export { PROTO_CONTENT_TYPE, PROTO_MESSAGE_HEADER, resolveProtoType };
