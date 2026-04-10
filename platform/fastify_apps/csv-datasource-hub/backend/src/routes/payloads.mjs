import { createPayloadService } from '../services/payload.service.mjs';
import Papa from 'papaparse';

export default async function payloadsRoutes(fastify, _options) {
  const payloadService = createPayloadService(fastify.db);

  // GET paginated data
  fastify.get('/instances/:id/data', async (request, reply) => {
    const { offset = 0, limit = 50 } = request.query;
    const result = await payloadService.findByInstance(request.params.id, {
      offset: parseInt(offset, 10),
      limit: Math.min(parseInt(limit, 10) || 50, 500),
    });
    return reply.send(result);
  });

  // GET columns
  fastify.get('/instances/:id/columns', async (request, reply) => {
    const columns = await payloadService.getColumns(request.params.id);
    if (columns === null) {
      return reply.status(404).send({ error: 'NotFound', message: `Instance not found: ${request.params.id}`, statusCode: 404 });
    }
    return reply.send({ columns });
  });

  // SEARCH data with JSONB filters
  fastify.get('/instances/:id/data/search', async (request, reply) => {
    const { offset = 0, limit = 50, ...filters } = request.query;
    const result = await payloadService.search(request.params.id, {
      filters,
      offset: parseInt(offset, 10),
      limit: Math.min(parseInt(limit, 10) || 50, 500),
    });
    return reply.send(result);
  });

  // UPSERT CSV data into existing instance
  fastify.post('/instances/:id/upsert', async (request, reply) => {
    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ error: 'BadRequest', message: 'No file uploaded', statusCode: 400 });
    }

    const fileBuffer = await data.toBuffer();
    const fields = data.fields;

    // match_columns comes as comma-separated string or JSON array
    let matchColumns;
    const raw = fields.match_columns?.value;
    if (!raw) {
      return reply.status(400).send({ error: 'BadRequest', message: 'match_columns field is required', statusCode: 400 });
    }
    try {
      matchColumns = JSON.parse(raw);
    } catch {
      matchColumns = raw.split(',').map((c) => c.trim()).filter(Boolean);
    }

    const result = await payloadService.upsertFromCsv(request.params.id, {
      fileBuffer,
      matchColumns,
    });

    return reply.send(result);
  });

  // EXPORT data (supports optional offset/limit pagination)
  fastify.get('/instances/:id/data/export', async (request, reply) => {
    const { format = 'json', offset, limit } = request.query;

    const paginationOpts = offset != null && limit != null
      ? { offset: parseInt(offset, 10), limit: Math.min(parseInt(limit, 10) || 1000, 5000) }
      : {};

    const result = await payloadService.exportAll(request.params.id, paginationOpts);

    if (format === 'csv') {
      const data = result.rows.map((r) => r.data);
      const csv = Papa.unparse(data);
      reply.header('Content-Type', 'text/csv');
      reply.header('Content-Disposition', `attachment; filename="export-${request.params.id}.csv"`);
      reply.header('X-Total-Count', result.total);
      reply.header('X-Offset', result.offset);
      reply.header('X-Limit', result.limit);
      return reply.send(csv);
    }

    return reply.send({
      items: result.rows,
      total: result.total,
      offset: result.offset,
      limit: result.limit,
    });
  });
}
