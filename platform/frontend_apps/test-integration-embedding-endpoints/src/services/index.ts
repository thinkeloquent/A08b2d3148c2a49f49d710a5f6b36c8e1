/**
 * Services module - Unified API client using app-yaml-endpoints pattern.
 */

export * from './types';
export * from './endpoint-config';
export {
  createService,
  services,
  type EmbeddingService,
} from './embedding.service';
