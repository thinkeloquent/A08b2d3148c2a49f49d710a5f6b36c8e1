/**
 * Services module - Unified API client using app-yaml-endpoints pattern.
 */

export * from './types';
export * from './endpoint-config';
export {
  createService,
  getService,
  services,
  clearServiceCache,
  type GeminiOpenAiSdkService,
} from './gemini-openai-sdk.service';
