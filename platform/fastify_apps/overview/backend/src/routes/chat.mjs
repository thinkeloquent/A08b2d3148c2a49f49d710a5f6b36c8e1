/**
 * Chat routes for the Overview AI assistant.
 *
 * Provides a simple echo endpoint for now. In production this would
 * proxy to an LLM backend (OpenAI, Anthropic, etc.).
 */

export default async function chatRoutes(fastify) {
  fastify.post("/", async (request) => {
    const { message } = request.body || {};

    if (!message || typeof message !== "string" || !message.trim()) {
      throw fastify.httpErrors.badRequest("message is required");
    }

    // Placeholder response - replace with actual LLM integration
    return {
      id: crypto.randomUUID(),
      role: "assistant",
      content: `Thanks for your question about: "${message.trim()}". AI integration is coming soon - this is a placeholder response. You can explore the apps listed on this dashboard to learn more about each tool.`,
      timestamp: new Date().toISOString(),
    };
  });
}
