/**
 * Node Routes
 * CRUD endpoints for nodes within a flow's flow_data.nodes JSONB array.
 */

import { createNodeService } from '../services/node.service.mjs';
import { serializeNode, serializeNodeList } from '../serializers/node.serializer.mjs';

export default async function nodeRoutes(fastify, _options) {
  const service = createNodeService(fastify.db);

  fastify.get('/flows/:flowId/nodes', {
    schema: {
      description: 'List all nodes in a flow',
      tags: ['Nodes'],
      params: {
        type: 'object',
        required: ['flowId'],
        properties: { flowId: { type: 'string', format: 'uuid' } },
      },
    },
  }, async (request, reply) => {
    const { flowId } = request.params;
    const nodes = await service.listNodes(flowId);
    return reply.send({ nodes: serializeNodeList(nodes) });
  });

  fastify.get('/flows/:flowId/nodes/:nodeId', {
    schema: {
      description: 'Get a single node within a flow',
      tags: ['Nodes'],
      params: {
        type: 'object',
        required: ['flowId', 'nodeId'],
        properties: {
          flowId: { type: 'string', format: 'uuid' },
          nodeId: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { flowId, nodeId } = request.params;
    let node;
    try {
      node = await service.getNode(flowId, nodeId);
    } catch (err) {
      return reply.status(err.statusCode || 500).send({
        statusCode: err.statusCode || 500,
        error: err.statusCode === 404 ? 'NotFound' : 'InternalServerError',
        message: err.message,
      });
    }
    return reply.send({ node: serializeNode(node) });
  });

  fastify.post('/flows/:flowId/nodes', {
    schema: {
      description: 'Add a node to a flow',
      tags: ['Nodes'],
      params: {
        type: 'object',
        required: ['flowId'],
        properties: { flowId: { type: 'string', format: 'uuid' } },
      },
      body: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', minLength: 1, description: 'Node ID (no spaces allowed)' },
          type: { type: 'string', default: 'default' },
          position: {
            type: 'object',
            properties: {
              x: { type: 'number', default: 0 },
              y: { type: 'number', default: 0 },
            },
          },
          data: { type: 'object', description: 'Node metadata (label, handler, category, icon, …)' },
        },
      },
    },
  }, async (request, reply) => {
    const { flowId } = request.params;
    let node;
    try {
      node = await service.addNode(flowId, request.body);
    } catch (err) {
      return reply.status(err.statusCode || 500).send({
        statusCode: err.statusCode || 500,
        error: err.statusCode === 409 ? 'Conflict' : err.statusCode === 400 ? 'BadRequest' : 'InternalServerError',
        message: err.message,
      });
    }
    return reply.status(201).send({ node: serializeNode(node) });
  });

  fastify.put('/flows/:flowId/nodes/:nodeId', {
    schema: {
      description: 'Update a node within a flow. If id changes, edge and condition references are rewired.',
      tags: ['Nodes'],
      params: {
        type: 'object',
        required: ['flowId', 'nodeId'],
        properties: {
          flowId: { type: 'string', format: 'uuid' },
          nodeId: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        properties: {
          id: { type: 'string', minLength: 1, description: 'New node ID (triggers edge/condition rewiring)' },
          type: { type: 'string' },
          position: {
            type: 'object',
            properties: {
              x: { type: 'number' },
              y: { type: 'number' },
            },
          },
          data: { type: 'object' },
        },
      },
    },
  }, async (request, reply) => {
    const { flowId, nodeId } = request.params;
    let node;
    try {
      node = await service.updateNode(flowId, nodeId, request.body);
    } catch (err) {
      return reply.status(err.statusCode || 500).send({
        statusCode: err.statusCode || 500,
        error: err.statusCode === 404 ? 'NotFound' : err.statusCode === 409 ? 'Conflict' : err.statusCode === 400 ? 'BadRequest' : 'InternalServerError',
        message: err.message,
      });
    }
    return reply.send({ node: serializeNode(node) });
  });

  fastify.delete('/flows/:flowId/nodes/:nodeId', {
    schema: {
      description: 'Delete a node from a flow. Removes referencing edges and conditions.',
      tags: ['Nodes'],
      params: {
        type: 'object',
        required: ['flowId', 'nodeId'],
        properties: {
          flowId: { type: 'string', format: 'uuid' },
          nodeId: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { flowId, nodeId } = request.params;
    try {
      await service.deleteNode(flowId, nodeId);
    } catch (err) {
      return reply.status(err.statusCode || 500).send({
        statusCode: err.statusCode || 500,
        error: err.statusCode === 404 ? 'NotFound' : 'InternalServerError',
        message: err.message,
      });
    }
    return reply.send({ success: true });
  });
}
