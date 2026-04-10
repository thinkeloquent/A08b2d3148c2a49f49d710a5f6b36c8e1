import { useState, useCallback, useRef, useEffect } from 'react';
import { Send, Trash2, Copy, Check, AlertCircle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { SchemaBuilder } from './SchemaBuilder';
import type { SchemaState, StructuredMessage, StructuredChatResponse } from './types';

interface StructuredChatTabProps {
  onSendMessage: (prompt: string, schema: Record<string, unknown>) => Promise<StructuredChatResponse>;
  isLoading?: boolean;
}

export function StructuredChatTab({ onSendMessage, isLoading: externalLoading }: StructuredChatTabProps) {
  const [messages, setMessages] = useState<StructuredMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [showSchemaBuilder, setShowSchemaBuilder] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [schema, setSchema] = useState<SchemaState>({
    name: '',
    fields: []
  });

  const loading = isLoading || externalLoading;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const buildSchemaObject = (): Record<string, unknown> | null => {
    if (!schema.name.trim()) {
      setSchemaError('Schema name is required');
      return null;
    }

    if (schema.fields.length === 0) {
      setSchemaError('At least one field is required');
      return null;
    }

    const emptyFields = schema.fields.filter((f) => !f.name.trim());
    if (emptyFields.length > 0) {
      setSchemaError('All fields must have a name');
      return null;
    }

    const properties: Record<string, unknown> = {};
    const required: string[] = [];

    schema.fields.forEach((field) => {
      properties[field.name] = {
        type: field.type,
        description: field.description || undefined
      };
      if (field.required) {
        required.push(field.name);
      }
    });

    return {
      name: schema.name,
      properties,
      required: required.length > 0 ? required : undefined
    };
  };

  const handleSubmit = useCallback(async () => {
    if (!inputValue.trim() || loading) return;

    setSchemaError(null);
    const schemaObj = buildSchemaObject();
    if (!schemaObj) return;

    const userMessage: StructuredMessage = {
      id: Date.now(),
      role: 'user',
      text: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await onSendMessage(inputValue.trim(), schemaObj);

      const assistantMessage: StructuredMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        text: response.raw,
        response,
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorResponse: StructuredChatResponse = {
        success: false,
        raw: '',
        error: err instanceof Error ? err.message : 'Failed to get response',
        model: ''
      };

      const assistantMessage: StructuredMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        text: '',
        response: errorResponse,
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, loading, schema, onSendMessage]);

  const handleClearChat = useCallback(() => {
    setMessages([]);
    setSchemaError(null);
  }, []);

  const handleCopy = useCallback((text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleExampleSelect = useCallback((example: string) => {
    setInputValue(example);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const formatTime = (date?: Date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  return (
    <div className="flex flex-col bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div>
          <h3 className="font-semibold text-gray-900">Structured Output Chat</h3>
          <p className="text-xs text-gray-500">Get JSON responses matching your schema</p>
        </div>
        {messages.length > 0 &&
        <button
          onClick={handleClearChat}
          className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors">

            <Trash2 className="w-3 h-3" />
            Clear
          </button>
        }
      </div>

      {/* Schema Builder Section */}
      <div className="border-b">
        <button
          onClick={() => setShowSchemaBuilder(!showSchemaBuilder)}
          className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">

          <span>Schema Builder</span>
          {showSchemaBuilder ?
          <ChevronUp className="w-4 h-4" /> :

          <ChevronDown className="w-4 h-4" />
          }
        </button>
        {showSchemaBuilder &&
        <div className="px-4 pb-4">
            <SchemaBuilder
            schema={schema}
            onSchemaChange={setSchema}
            onExampleSelect={handleExampleSelect}
            error={schemaError} />

          </div>
        }
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px]">
        {messages.length === 0 ?
        <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8">
            <svg className="w-12 h-12 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" data-test-id="svg-0acfac03">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h4 className="text-base font-medium">Structured Responses</h4>
            <p className="text-sm text-center mt-1">
              Define a schema above, then ask a question to get structured JSON output
            </p>
          </div> :

        <>
            {messages.map((message) =>
          <div key={message.id} className="space-y-2">
                {/* User Message */}
                {message.role === 'user' &&
            <div className="flex justify-end">
                    <div className="max-w-[80%]">
                      <div className="flex items-center justify-end gap-2 mb-1">
                        <span className="text-xs text-gray-400">{formatTime(message.timestamp)}</span>
                        <span className="text-xs font-medium text-gray-700">You</span>
                      </div>
                      <div className="bg-blue-600 text-white p-3 rounded-lg text-sm">
                        <p className="whitespace-pre-wrap">{message.text}</p>
                      </div>
                    </div>
                  </div>
            }

                {/* Assistant Message */}
                {message.role === 'assistant' && message.response &&
            <div className="flex justify-start">
                    <div className="max-w-[90%] w-full">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-700">Gemini</span>
                        <span className="text-xs text-gray-400">{formatTime(message.timestamp)}</span>
                      </div>

                      {message.response.error ?
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{message.response.error}</span>
                          </div>
                        </div> :

                <div className="bg-gray-50 border rounded-lg overflow-hidden">
                          {/* Structured Data */}
                          {message.response.data &&
                  <div className="p-3 border-b">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded">
                                  Structured Data
                                </span>
                                <button
                        onClick={() => handleCopy(JSON.stringify(message.response?.data, null, 2), message.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
                        title="Copy JSON">

                                  {copiedId === message.id ?
                        <Check className="w-3 h-3 text-green-500" /> :

                        <Copy className="w-3 h-3" />
                        }
                                </button>
                              </div>
                              <pre className="text-xs font-mono bg-gray-900 text-green-300 p-3 rounded overflow-x-auto">
                                {JSON.stringify(message.response.data, null, 2)}
                              </pre>
                            </div>
                  }

                          {/* Raw Response */}
                          {message.response.raw &&
                  <div className="p-3">
                              <span className="text-xs font-medium text-gray-500 mb-2 block">Raw Response</span>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{message.response.raw}</p>
                            </div>
                  }

                          {/* Metadata */}
                          {(message.response.model || message.response.usage) &&
                  <div className="px-3 py-2 bg-gray-100 text-xs text-gray-500 flex items-center gap-4">
                              {message.response.model && <span>Model: {message.response.model}</span>}
                              {message.response.usage?.total_tokens &&
                    <span>Tokens: {message.response.usage.total_tokens}</span>
                    }
                            </div>
                  }
                        </div>
                }
                    </div>
                  </div>
            }
              </div>
          )}
            <div ref={messagesEndRef} />
          </>
        }

        {/* Loading Indicator */}
        {loading &&
        <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
            </div>
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        }
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your prompt..."
            disabled={loading}
            rows={2}
            className="flex-1 px-3 py-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50" />

          <button
            onClick={handleSubmit}
            disabled={loading || !inputValue.trim() || schema.fields.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed self-end">

            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Press Enter to send, Shift+Enter for new line. Schema required.
        </p>
      </div>
    </div>);

}