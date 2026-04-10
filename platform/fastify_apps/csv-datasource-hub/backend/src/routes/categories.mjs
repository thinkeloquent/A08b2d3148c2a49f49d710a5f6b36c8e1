const TARGET_APP = 'csv-datasource-hub';
const CATEGORIES_API_BASE = '/~/api/categories';

export default async function categoriesRoutes(fastify, _options) {
  // GET /categories — fetch valid categories from the central Categories API
  fastify.get('/', async (request, reply) => {
    const { category_type } = request.query;
    const url = new URL(`${CATEGORIES_API_BASE}/`, `http://localhost`);
    url.searchParams.set('target_app_name', TARGET_APP);
    if (category_type) url.searchParams.set('category_type_name', category_type);

    const res = await fastify.inject({
      method: 'GET',
      url: `${url.pathname}${url.search}`,
    });

    if (res.statusCode !== 200) {
      fastify.log.error({ statusCode: res.statusCode, body: res.body }, 'Failed to fetch categories');
      return reply.status(502).send({ error: 'BadGateway', message: 'Failed to fetch categories from API' });
    }

    const data = JSON.parse(res.body);
    return reply.send(data);
  });
}
