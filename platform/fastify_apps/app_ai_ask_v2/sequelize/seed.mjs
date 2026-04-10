import { sequelize, SCHEMA, Persona, LLMDefault } from './models/index.mjs';

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    if (process.env.POSTGRES_SCHEMA_EXIST) {
      await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${SCHEMA}";`);
    }

    const personas = [
      {
        name: 'Code Architect',
        description: 'Expert system architect for designing scalable applications',
        role: 'architect',
        tone: 'professional',
        llm_provider: 'openai',
        llm_temperature: 0.7,
        llm_parameters: { model: 'gpt-4', max_tokens: 2000 },
        goals: ['Design scalable systems', 'Optimize performance', 'Review architecture decisions'],
        tools: ['web-search', 'code-gen', 'analysis-engine'],
        permitted_to: ['read_repo', 'write_code', 'generate_report'],
        context_files: ['architecture.md', 'design-patterns.md'],
        memory: { enabled: true, scope: 'persistent', storage_id: 'memory-architect' },
        version: '1.0.0',
      },
      {
        name: 'Debug Assistant',
        description: 'Specialized in debugging and troubleshooting code issues',
        role: 'developer',
        tone: 'analytical',
        llm_provider: 'anthropic',
        llm_temperature: 0.3,
        llm_parameters: { model: 'claude-opus-4', max_tokens: 4000 },
        goals: ['Find and fix bugs', 'Analyze error logs', 'Suggest improvements'],
        tools: ['debugger', 'test-runner', 'analysis-engine'],
        permitted_to: ['read_repo', 'run_test', 'access_docs'],
        context_files: ['debugging-guide.md'],
        memory: { enabled: true, scope: 'session', storage_id: 'memory-debugger' },
        version: '1.0.0',
      },
      {
        name: 'Data Analyst',
        description: 'Analyzes data patterns and generates insights',
        role: 'analyst',
        tone: 'neutral',
        llm_provider: 'google',
        llm_temperature: 0.5,
        llm_parameters: { model: 'gemini-pro', max_tokens: 3000 },
        goals: ['Analyze data patterns', 'Generate reports', 'Identify trends'],
        tools: ['analysis-engine', 'web-search'],
        permitted_to: ['read_repo', 'generate_report', 'access_docs'],
        context_files: ['data-schema.md'],
        memory: { enabled: false, scope: 'session', storage_id: 'memory-analyst' },
        version: '1.0.0',
      },
    ];

    for (const data of personas) {
      await Persona.create(data);
      console.log(`Seeded persona: ${data.name}`);
    }

    const defaults = [
      {
        category: 'tools',
        name: 'Standard Tools',
        description: 'Default tool set for general AI assistants',
        value: ['web-search', 'code-gen', 'analysis-engine'],
        is_default: true,
      },
      {
        category: 'permissions',
        name: 'Read-Only Access',
        description: 'Default permissions for read-only operations',
        value: ['read_repo', 'access_docs'],
        is_default: true,
      },
      {
        category: 'goals',
        name: 'General Assistance',
        description: 'Default goals for general-purpose assistants',
        value: ['Answer questions', 'Provide explanations', 'Generate code samples'],
        is_default: true,
      },
      {
        category: 'tones',
        name: 'Professional',
        description: 'Professional and helpful communication tone',
        value: { tone: 'professional', formality: 'high' },
        is_default: true,
      },
      {
        category: 'roles',
        name: 'Assistant',
        description: 'Default assistant role configuration',
        value: { role: 'assistant', capabilities: ['general'] },
        is_default: true,
      },
      {
        category: 'prompts',
        name: 'System Prompt Template',
        description: 'Default system prompt for AI assistants',
        value: { template: 'You are a helpful AI assistant. Respond clearly and concisely.' },
        is_default: true,
      },
    ];

    for (const data of defaults) {
      await LLMDefault.create(data);
      console.log(`Seeded LLM default: ${data.name}`);
    }

    console.log(`\nSeeding complete. ${personas.length} personas, ${defaults.length} LLM defaults loaded.`);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

seed();
