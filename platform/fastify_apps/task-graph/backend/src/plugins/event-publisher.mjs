/**
 * Event Publisher Plugin
 *
 * Decorates Fastify with eventPublisher
 *
 * @module plugins/event-publisher
 */

import fp from 'fastify-plugin';
import { EventPublisher } from '../services/event-publisher.service.mjs';

const APP_NAME = 'task-graph';

async function eventPublisherPlugin(app, options = {}) {
  const eventPublisher = new EventPublisher(app.sequelize, {
    bufferSize: options.bufferSize || 10,
    flushInterval: options.flushInterval || 5000,
  });

  app.decorate('eventPublisher', eventPublisher);

  app.addHook('onClose', async () => {
    console.debug(`[${APP_NAME}] [EventPublisherPlugin] Cleaning up event publisher`);
    await eventPublisher.cleanup();
  });

  console.debug(`[${APP_NAME}] [EventPublisherPlugin] Event publisher initialized`);

  return Promise.resolve();
}

export const eventPublisherPlugin_ = fp(eventPublisherPlugin, {
  name: 'task-graph-event-publisher',
  dependencies: ['task-graph-database'],
});
