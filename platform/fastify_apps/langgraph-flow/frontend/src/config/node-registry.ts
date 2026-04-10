import type { NodeCategory, NodeTemplate } from '@/types/flow.types';

// ── Categories ────────────────────────────────────────────────────────────────

export const CATEGORIES: NodeCategory[] = [
  {
    id: 'chat_models',
    label: 'Chat Models',
    color: '#6366f1',
    icon: '[M]',
    nodeTypes: ['ChatOpenAI', 'ChatAnthropic', 'ChatGoogleGenerativeAI'],
  },
  {
    id: 'prompts',
    label: 'Prompts',
    color: '#f59e0b',
    icon: '[P]',
    nodeTypes: ['PromptTemplate', 'ChatPromptTemplate', 'SystemMessagePrompt'],
  },
  {
    id: 'agents',
    label: 'Agents',
    color: '#10b981',
    icon: '[A]',
    nodeTypes: ['AgentExecutor', 'ToolNode'],
  },
  {
    id: 'memory',
    label: 'Memory',
    color: '#ec4899',
    icon: '[~]',
    nodeTypes: ['ConversationBufferMemory'],
  },
  {
    id: 'tools',
    label: 'Tools',
    color: '#8b5cf6',
    icon: '[T]',
    nodeTypes: ['TavilySearchResults', 'Calculator', 'LLMChain', 'VectorStoreRetriever'],
  },
  {
    id: 'langgraph',
    label: 'LangGraph',
    color: '#06b6d4',
    icon: '[G]',
    nodeTypes: ['StateGraph', 'START', 'END', 'ConditionalEdge'],
  },
];

// ── Category Map: nodeType -> NodeCategory ────────────────────────────────────

export const CATEGORY_MAP: Record<string, NodeCategory> = {};
for (const cat of CATEGORIES) {
  for (const nodeType of cat.nodeTypes) {
    CATEGORY_MAP[nodeType] = cat;
  }
}

// ── Node Templates ────────────────────────────────────────────────────────────

export const NODE_TEMPLATES: NodeTemplate[] = [
  // Chat Models
  {
    nodeType: 'ChatOpenAI',
    category: 'chat_models',
    label: 'ChatOpenAI',
    defaultInputs: { model: 'gpt-4o', temperature: 0.7, maxTokens: 2048 },
    inHandles: [{ id: 'prompt', label: 'prompt' }],
    outHandles: [{ id: 'output', label: 'output' }],
  },
  {
    nodeType: 'ChatAnthropic',
    category: 'chat_models',
    label: 'ChatAnthropic',
    defaultInputs: { model: 'claude-3-5-sonnet-20241022', temperature: 0.7, maxTokens: 2048 },
    inHandles: [{ id: 'prompt', label: 'prompt' }],
    outHandles: [{ id: 'output', label: 'output' }],
  },
  {
    nodeType: 'ChatGoogleGenerativeAI',
    category: 'chat_models',
    label: 'ChatGoogleGenerativeAI',
    defaultInputs: { model: 'gemini-1.5-pro', temperature: 0.7 },
    inHandles: [{ id: 'prompt', label: 'prompt' }],
    outHandles: [{ id: 'output', label: 'output' }],
  },
  // Prompts
  {
    nodeType: 'PromptTemplate',
    category: 'prompts',
    label: 'PromptTemplate',
    defaultInputs: { template: 'You are a helpful assistant.\n\n{input}', inputVariables: 'input' },
    inHandles: [{ id: 'variables', label: 'variables' }],
    outHandles: [{ id: 'prompt', label: 'prompt' }],
  },
  {
    nodeType: 'ChatPromptTemplate',
    category: 'prompts',
    label: 'ChatPromptTemplate',
    defaultInputs: { systemMessage: 'You are a helpful assistant.', humanTemplate: '{input}' },
    inHandles: [{ id: 'variables', label: 'variables' }],
    outHandles: [{ id: 'prompt', label: 'prompt' }],
  },
  {
    nodeType: 'SystemMessagePrompt',
    category: 'prompts',
    label: 'SystemMessagePrompt',
    defaultInputs: { template: 'You are a helpful assistant.' },
    inHandles: [],
    outHandles: [{ id: 'message', label: 'message' }],
  },
  // Agents
  {
    nodeType: 'AgentExecutor',
    category: 'agents',
    label: 'AgentExecutor',
    defaultInputs: { maxIterations: 10, earlyStopMethod: 'generate', verbose: true },
    inHandles: [
      { id: 'llm', label: 'llm' },
      { id: 'tools', label: 'tools' },
      { id: 'memory', label: 'memory' },
    ],
    outHandles: [{ id: 'output', label: 'output' }],
  },
  {
    nodeType: 'ToolNode',
    category: 'agents',
    label: 'ToolNode',
    defaultInputs: {},
    inHandles: [{ id: 'tools', label: 'tools' }],
    outHandles: [{ id: 'output', label: 'output' }],
  },
  // Memory
  {
    nodeType: 'ConversationBufferMemory',
    category: 'memory',
    label: 'ConversationBufferMemory',
    defaultInputs: { memoryKey: 'chat_history', returnMessages: true, humanPrefix: 'Human', aiPrefix: 'AI' },
    inHandles: [],
    outHandles: [{ id: 'memory', label: 'memory' }],
  },
  // Tools
  {
    nodeType: 'TavilySearchResults',
    category: 'tools',
    label: 'TavilySearchResults',
    defaultInputs: { maxResults: 5, searchDepth: 'advanced' },
    inHandles: [{ id: 'query', label: 'query' }],
    outHandles: [{ id: 'results', label: 'results' }],
  },
  {
    nodeType: 'Calculator',
    category: 'tools',
    label: 'Calculator',
    defaultInputs: {},
    inHandles: [{ id: 'expression', label: 'expression' }],
    outHandles: [{ id: 'result', label: 'result' }],
  },
  {
    nodeType: 'LLMChain',
    category: 'tools',
    label: 'LLMChain',
    defaultInputs: { verbose: false },
    inHandles: [
      { id: 'llm', label: 'llm' },
      { id: 'prompt', label: 'prompt' },
    ],
    outHandles: [{ id: 'output', label: 'output' }],
  },
  {
    nodeType: 'VectorStoreRetriever',
    category: 'tools',
    label: 'VectorStoreRetriever',
    defaultInputs: { k: 4, searchType: 'similarity' },
    inHandles: [{ id: 'vectorstore', label: 'vectorstore' }],
    outHandles: [{ id: 'documents', label: 'documents' }],
  },
  // LangGraph
  {
    nodeType: 'StateGraph',
    category: 'langgraph',
    label: 'StateGraph',
    defaultInputs: { stateSchema: '{}' },
    inHandles: [],
    outHandles: [{ id: 'graph', label: 'graph' }],
  },
  {
    nodeType: 'START',
    category: 'langgraph',
    label: 'START',
    defaultInputs: {},
    inHandles: [],
    outHandles: [{ id: 'out', label: 'out' }],
  },
  {
    nodeType: 'END',
    category: 'langgraph',
    label: 'END',
    defaultInputs: {},
    inHandles: [{ id: 'in', label: 'in' }],
    outHandles: [],
  },
  {
    nodeType: 'ConditionalEdge',
    category: 'langgraph',
    label: 'ConditionalEdge',
    defaultInputs: { conditions: 'has_answer,needs_tool,error' },
    inHandles: [{ id: 'input', label: 'input' }],
    outHandles: [{ id: 'branch', label: 'branch' }],
  },
];

// ── Template Map: nodeType -> NodeTemplate ────────────────────────────────────

export const TEMPLATE_MAP: Record<string, NodeTemplate> = {};
for (const tmpl of NODE_TEMPLATES) {
  TEMPLATE_MAP[tmpl.nodeType] = tmpl;
}
