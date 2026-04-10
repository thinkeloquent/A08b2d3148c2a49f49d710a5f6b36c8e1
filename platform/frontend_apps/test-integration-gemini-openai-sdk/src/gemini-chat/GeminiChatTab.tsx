import { useState, useCallback, useRef, useEffect } from 'react';
import { Trash2, Send, Copy, Pencil, X, Loader2 } from 'lucide-react';
import type { ChatMessage } from './types';

interface GeminiChatTabProps {
  onSendMessage: (messages: {role: string;content: string;}[]) => Promise<{
    content: string;
    model?: string;
    usage?: {prompt_tokens?: number;completion_tokens?: number;total_tokens?: number;};
  }>;
  isLoading?: boolean;
}

export function GeminiChatTab({ onSendMessage, isLoading: externalLoading }: GeminiChatTabProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loading = isLoading || externalLoading;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = useCallback(async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: 'user',
      text: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const chatMessages = [...messages, userMessage].map((msg) => ({
        role: msg.role,
        content: msg.text
      }));

      const response = await onSendMessage(chatMessages);

      const assistantMessage: ChatMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        text: response.content,
        timestamp: new Date(),
        metadata: {
          model: response.model,
          usage: response.usage
        }
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get response');
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, loading, messages, onSendMessage]);

  const handleClearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const handleEditMessage = useCallback((id: number, newText: string) => {
    setMessages((prev) =>
    prev.map((msg) => msg.id === id ? { ...msg, text: newText } : msg)
    );
    setEditingId(null);
  }, []);

  const handleDeleteMessage = useCallback((id: number) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  }, []);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  const formatTime = (date?: Date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div>
          <h3 className="font-semibold text-gray-900">Chat with Gemini</h3>
          <p className="text-xs text-gray-500">Full conversation with history</p>
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ?
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg className="w-16 h-16 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" data-test-id="svg-b8d47e53">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h4 className="text-lg font-medium">Start a conversation</h4>
            <p className="text-sm">Send a message to chat with Google Gemini</p>
          </div> :

        <>
            {messages.map((message) =>
          <div
            key={message.id}
            className={`group flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>

                {/* Avatar */}
                <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`
              }>

                  {message.role === 'user' ?
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" data-test-id="svg-2d7793b5">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg> :

              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" data-test-id="svg-9d64e41f">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
              }
                </div>

                {/* Message Content */}
                <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-700">
                      {message.role === 'user' ? 'You' : 'Gemini'}
                    </span>
                    {message.timestamp &&
                <span className="text-xs text-gray-400">{formatTime(message.timestamp)}</span>
                }
                  </div>

                  {editingId === message.id ?
              <div className="space-y-2">
                      <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full p-2 text-sm border rounded-md resize-none"
                  rows={3}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setEditingId(null);
                    }
                  }} />

                      <div className="flex gap-2">
                        <button
                    onClick={() => setEditingId(null)}
                    className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200">

                          Cancel
                        </button>
                        <button
                    onClick={() => handleEditMessage(message.id, editText)}
                    className="px-2 py-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700">

                          Save
                        </button>
                      </div>
                    </div> :

              <div
                className={`inline-block p-3 rounded-lg text-sm ${
                message.role === 'user' ?
                'bg-blue-600 text-white' :
                'bg-gray-100 text-gray-900'}`
                }>

                      <p className="whitespace-pre-wrap">{message.text}</p>
                    </div>
              }

                  {/* Actions */}
                  {editingId !== message.id &&
              <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                  onClick={() => handleCopy(message.text)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  title="Copy">

                        <Copy className="w-3 h-3" />
                      </button>
                      {message.role === 'user' &&
                <button
                  onClick={() => {
                    setEditingId(message.id);
                    setEditText(message.text);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  title="Edit">

                          <Pencil className="w-3 h-3" />
                        </button>
                }
                      <button
                  onClick={() => handleDeleteMessage(message.id)}
                  className="p-1 text-gray-400 hover:text-red-600 rounded"
                  title="Delete">

                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
              }

                  {/* Metadata */}
                  {message.metadata?.usage &&
              <div className="mt-1 text-xs text-gray-400">
                      {message.metadata.model} | {message.metadata.usage.total_tokens} tokens
                    </div>
              }
                </div>
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

        {/* Error */}
        {error &&
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            <X className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
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
            placeholder="Type your message..."
            disabled={loading}
            rows={1}
            className="flex-1 px-3 py-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50" />

          <button
            onClick={handleSubmit}
            disabled={loading || !inputValue.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">

            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">Press Enter to send, Shift+Enter for new line</p>
      </div>
    </div>);

}