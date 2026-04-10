/**
 * Rules Routes
 * Endpoints for managing rule items within a tree
 */

import { createRuleService } from '../services/rule.service.mjs';
import { validateRuleItem, validateTree } from '../services/validation.service.mjs';
import { countRulesNested } from '../utils/tree-helpers.mjs';

export default async function ruleRoutes(fastify, _options) {
  const service = createRuleService(fastify.db);

  /**
   * Get rules for a specific tree
   * GET /rules?tree_id=<uuid>
   */
  fastify.get('/rules', {
    schema: {
      description: 'Get rules for a specific tree',
      tags: ['Rules'],
      querystring: {
        type: 'object',
        required: ['tree_id'],
        properties: {
          tree_id: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, async (request, reply) => {
    const result = await service.getRules(request.query.tree_id);
    if (!result) {
      return reply.status(404).send({
        error: 'NotFound',
        message: 'Rule tree not found',
        statusCode: 404,
      });
    }
    return result;
  });

  /**
   * Save rules for a tree (replace entire rule set)
   * POST /rules
   */
  fastify.post('/rules', {
    schema: {
      description: 'Save the complete rule set for a tree',
      tags: ['Rules'],
      body: {
        type: 'object',
        required: ['tree_id', 'rules'],
        properties: {
          tree_id: { type: 'string', format: 'uuid' },
          rules: { type: 'object' },
        },
      },
    },
  }, async (request, reply) => {
    const { tree_id, rules } = request.body;

    // Validate the rules structure
    const validation = validateRuleItem(rules);
    if (!validation.isValid) {
      return reply.status(400).send({
        success: false,
        error: 'Invalid rules structure',
        details: validation.errors,
        timestamp: new Date().toISOString(),
      });
    }

    const result = await service.saveRules(tree_id, rules);
    if (!result) {
      return reply.status(404).send({
        error: 'NotFound',
        message: 'Rule tree not found',
        statusCode: 404,
      });
    }

    return {
      success: true,
      message: 'Rules saved successfully',
      ...result,
    };
  });

  /**
   * Validate rules without saving
   * POST /rules/validate
   */
  fastify.post('/rules/validate', {
    schema: {
      description: 'Validate a rule tree structure without saving',
      tags: ['Rules'],
      body: {
        type: 'object',
        required: ['rules'],
        properties: {
          rules: { type: 'object' },
        },
      },
    },
  }, async (request, _reply) => {
    const { rules } = request.body;
    const validation = validateTree(rules);
    const stats = countRulesNested(rules);

    return {
      isValid: validation.isValid,
      errors: validation.errors,
      stats,
      timestamp: new Date().toISOString(),
    };
  });
}
