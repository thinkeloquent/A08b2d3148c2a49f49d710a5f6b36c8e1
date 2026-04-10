export interface FrameworkInfo {
  slug: string;
  name: string;
  ingested: boolean;
  chunk_count: number;
}

export interface AppInfo {
  app: string;
  library: string;
  slug: string;
  persist_directory: string;
  embeddings_model: string;
  vector_backend: string;
  elasticsearch_available: boolean;
  redis_available: boolean;
  chunk_count: number;
  pipeline: {
    alpha: number;
    threshold: number;
    reranker_enabled: boolean;
    reranker_model: string;
    retrieve_n: number;
  };
}

export interface SearchResult {
  content: string;
  code_parts: string[];
  text_parts: string[];
  metadata: {
    component?: string;
    file_name?: string;
    [key: string]: unknown;
  };
  score: number;
}

export interface SearchResponse {
  query: string;
  components: string[];
  results: SearchResult[];
  answer?: string | null;
  _cached?: boolean;
}

export interface LlmResponse {
  answer: string;
}

export type SearchMode = 'query' | 'search';
export type CodeMode = 'regex' | 'llm';
export type ComponentMode = 'metadata' | 'parse' | 'llm';
export type LlmProvider = '' | 'openai' | 'anthropic' | 'gemini';
export type Backend = '' | 'chroma' | 'elasticsearch';
export type LlmFormat = 'markdown' | 'json' | 'yaml';

export type SchemaLanguage = 'json_schema' | 'zod' | 'typescript' | 'graphql' | 'pydantic' | 'dataclass' | 'typeddict';

export interface SchemaConfig {
  language: SchemaLanguage;
  text: string;
  template_id?: string;
}

export interface StructuredTemplate {
  id: string;
  name: string;
  description: string;
  schema: Record<string, unknown>;
}

export interface ComponentDocument {
  component_name: string;
  content: string;
}

export interface ComponentFunction {
  fn: string;
  description: string;
  params: { name: string; default: string | null }[];
}

export interface ComponentFunctions {
  [component: string]: ComponentFunction[];
}

export interface PromptTemplateRef {
  id: string;
  name: string;
  selected_version_id: string;
}

export interface ChatSession {
  id: string;
  query: string;
  mode: string;
  top_k: number;
  provider: string | null;
  alpha: number;
  threshold: number;
  reranker: boolean;
  backend: string | null;
  code_mode: string;
  component_mode: string;
  search_results: SearchResult[] | null;
  components: string[] | null;
  search_answer: string | null;
  question: string | null;
  system_prompt: string | null;
  format: string;
  schema_config: SchemaConfig | null;
  prompt_templates: PromptTemplateRef[] | null;
  selected_docs: string[] | null;
  variant_selections: Record<string, { value: string; label: string }[]> | null;
  llm_responses: { question: string; answer: string; timestamp: string }[] | null;
  created_at: string;
  updated_at: string;
}
