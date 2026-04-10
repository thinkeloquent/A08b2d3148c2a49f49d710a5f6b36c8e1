export type MessageRole = 'assistant' | 'user';

export interface FileAttachment {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  url?: string;
  preview?: string;
}

export interface ChatMessage {
  id: number;
  role: MessageRole;
  text: string;
  timestamp?: Date;
  isEditing?: boolean;
  attachments?: FileAttachment[];
  isEditable?: boolean;
  isDeletable?: boolean;
  metadata?: {
    model?: string;
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
    };
  };
}

export interface SchemaField {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
}

export interface SchemaState {
  name: string;
  fields: SchemaField[];
}

export interface StructuredChatResponse {
  success: boolean;
  data?: Record<string, unknown>;
  raw: string;
  error?: string;
  model: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

export interface StructuredMessage {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  response?: StructuredChatResponse;
  timestamp: Date;
}

export interface ExamplePrompt {
  id: string;
  label: string;
  prompt: string;
}

export interface SchemaTemplate {
  id: string;
  name: string;
  description: string;
  examples: ExamplePrompt[];
  schema: {
    name: string;
    properties: Record<string, unknown>;
    required?: string[];
  };
}
