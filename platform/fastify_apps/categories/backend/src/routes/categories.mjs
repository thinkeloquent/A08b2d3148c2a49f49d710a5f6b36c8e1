import { createCategoryService } from '../services/category.service.mjs';

export default async function categoryRoutes(fastify, _options) {
  const service = createCategoryService(fastify.db);

  // --- Lookup tables ---

  fastify.get('/category-types', async () => {
    const types = await service.listCategoryTypes();
    return { category_types: types };
  });

  fastify.post('/category-types', {
    schema: {
      body: {
        type: 'object',
        required: ['name'],
        properties: { name: { type: 'string', minLength: 1 } },
      },
    },
  }, async (request, reply) => {
    try {
      const type = await service.createCategoryType(request.body);
      return reply.status(201).send({ category_type: type });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return reply.status(409).send({ code: 409, message: 'Category type already exists' });
      }
      throw error;
    }
  });

  fastify.get('/target-apps', async () => {
    const apps = await service.listTargetApps();
    return { target_apps: apps };
  });

  fastify.post('/target-apps', {
    schema: {
      body: {
        type: 'object',
        required: ['name'],
        properties: { name: { type: 'string', minLength: 1 } },
      },
    },
  }, async (request, reply) => {
    try {
      const app = await service.createTargetApp(request.body);
      return reply.status(201).send({ target_app: app });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return reply.status(409).send({ code: 409, message: 'Target app already exists' });
      }
      throw error;
    }
  });

  // --- Export ---

  fastify.get('/export', async () => {
    const [categories, types, apps] = await Promise.all([
      service.listCategories(),
      service.listCategoryTypes(),
      service.listTargetApps(),
    ]);
    return {
      exported_at: new Date().toISOString(),
      categories,
      category_types: types,
      target_apps: apps,
    };
  });

  // --- Search ---

  fastify.get('/search', {
    schema: {
      querystring: {
        type: 'object',
        required: ['q'],
        properties: {
          q: { type: 'string', minLength: 1 },
        },
      },
    },
  }, async (request) => {
    const categories = await service.searchCategories(request.query.q);
    return { categories };
  });

  // --- Categories CRUD ---

  fastify.get('/', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          category_type_id: { type: 'string', format: 'uuid' },
          category_type_name: { type: 'string', minLength: 1 },
          target_app_id: { type: 'string', format: 'uuid' },
          target_app_name: { type: 'string', minLength: 1 },
        },
      },
    },
  }, async (request) => {
    const { category_type_id, category_type_name, target_app_id, target_app_name } = request.query;
    const categories = await service.listCategories({
      category_type_id, category_type_name, target_app_id, target_app_name,
    });
    return { categories };
  });

  fastify.get('/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } },
      },
    },
  }, async (request, reply) => {
    const category = await service.getCategoryById(request.params.id);
    if (!category) {
      return reply.status(404).send({ code: 404, message: 'Category not found' });
    }
    return { category };
  });

  fastify.post('/', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'category_type_id', 'target_app_id'],
        properties: {
          name: { type: 'string', minLength: 1 },
          description: { type: 'string' },
          category_type_id: { type: 'string', format: 'uuid' },
          target_app_id: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const category = await service.createCategory(request.body);
      return reply.status(201).send({ category });
    } catch (error) {
      if (error.name === 'ValidationError') {
        return reply.status(422).send({ code: 422, message: error.message });
      }
      throw error;
    }
  });

  fastify.put('/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } },
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1 },
          description: { type: 'string' },
          category_type_id: { type: 'string', format: 'uuid' },
          target_app_id: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const category = await service.updateCategory(request.params.id, request.body);
      if (!category) {
        return reply.status(404).send({ code: 404, message: 'Category not found' });
      }
      return { category };
    } catch (error) {
      if (error.name === 'ValidationError') {
        return reply.status(422).send({ code: 422, message: error.message });
      }
      throw error;
    }
  });

  fastify.delete('/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } },
      },
    },
  }, async (request, reply) => {
    const success = await service.deleteCategory(request.params.id);
    if (!success) {
      return reply.status(404).send({ code: 404, message: 'Category not found' });
    }
    return { success: true };
  });
}
