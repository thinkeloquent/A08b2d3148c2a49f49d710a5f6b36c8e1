import { createInstanceService } from '../services/instance.service.mjs';

export default async function instancesRoutes(fastify, _options) {
  const instanceService = createInstanceService(fastify.db);

  // LIST instances for datasource
  fastify.get('/datasources/:id/instances', async (request, reply) => {
    const { page = 1, limit = 20 } = request.query;
    const result = await instanceService.findByDatasource(request.params.id, {
      page: parseInt(page, 10),
      limit: Math.min(parseInt(limit, 10) || 20, 100),
    });
    return reply.send(result);
  });

  // GET instance by ID
  fastify.get('/instances/:id', async (request, reply) => {
    const instance = await instanceService.findById(request.params.id);
    if (!instance) {
      return reply.status(404).send({ error: 'NotFound', message: `Instance not found: ${request.params.id}`, statusCode: 404 });
    }
    return reply.send(instance);
  });

  // UPLOAD CSV — multipart
  fastify.post('/datasources/:id/instances', async (request, reply) => {
    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ error: 'BadRequest', message: 'No file uploaded', statusCode: 400 });
    }

    const fileBuffer = await data.toBuffer();
    const fields = data.fields;

    const instance = await instanceService.createFromUpload(request.params.id, {
      label: fields.label?.value || data.filename,
      instanceDate: fields.instance_date?.value || null,
      fileBuffer,
      fileName: data.filename,
    });

    return reply.status(201).send(instance);
  });

  // DELETE instance
  fastify.delete('/instances/:id', async (request, reply) => {
    const deleted = await instanceService.remove(request.params.id);
    if (!deleted) {
      return reply.status(404).send({ error: 'NotFound', message: `Instance not found: ${request.params.id}`, statusCode: 404 });
    }
    return reply.status(204).send();
  });
}
