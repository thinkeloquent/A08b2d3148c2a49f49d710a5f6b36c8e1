import templateRoutes from "./templates.mjs";
import checklistRoutes from "./checklists.mjs";

export default async function routes(fastify, _options) {
  await fastify.register(templateRoutes);
  await fastify.register(checklistRoutes);

  return Promise.resolve();
}
