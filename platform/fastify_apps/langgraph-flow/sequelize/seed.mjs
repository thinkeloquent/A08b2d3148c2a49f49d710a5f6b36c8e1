import {
  sequelize,
  SCHEMA,
  Flow,
  FlowVersion,
  WorkflowTemplate,
  StringTemplate,
} from './models/index.mjs';

const SEED_FLOWS = [
  {
    name: 'Simple Chat Pipeline',
    description: 'A basic LLM chat pipeline with prompt template, OpenAI chat model, and output.',
    viewport_x: 0,
    viewport_y: 0,
    viewport_zoom: 1,
    source_format: 'native',
    flow_data: {
      nodes: [
        {
          id: 'node-prompt',
          type: 'promptTemplate',
          position: { x: 100, y: 200 },
          data: {
            label: 'PromptTemplate',
            template: 'You are a helpful assistant. User: {input}',
            inputVariables: ['input'],
          },
        },
        {
          id: 'node-chat',
          type: 'chatOpenAI',
          position: { x: 400, y: 200 },
          data: {
            label: 'ChatOpenAI',
            modelName: 'gpt-4o',
            temperature: 0.7,
          },
        },
        {
          id: 'node-end',
          type: 'output',
          position: { x: 700, y: 200 },
          data: {
            label: 'END',
          },
        },
      ],
      edges: [
        {
          id: 'edge-prompt-chat',
          source: 'node-prompt',
          target: 'node-chat',
          sourceHandle: 'output',
          targetHandle: 'input',
        },
        {
          id: 'edge-chat-end',
          source: 'node-chat',
          target: 'node-end',
          sourceHandle: 'output',
          targetHandle: 'input',
        },
      ],
      viewport: { x: 0, y: 0, zoom: 1 },
    },
  },
  {
    name: 'Agent with Tools',
    description: 'A ReAct-style agent that routes through tools and loops back until completion.',
    viewport_x: -50,
    viewport_y: 0,
    viewport_zoom: 0.85,
    source_format: 'native',
    flow_data: {
      nodes: [
        {
          id: 'node-start',
          type: 'input',
          position: { x: 50, y: 300 },
          data: { label: 'START' },
        },
        {
          id: 'node-system-prompt',
          type: 'systemPrompt',
          position: { x: 250, y: 300 },
          data: {
            label: 'SystemPrompt',
            content: 'You are an AI agent with access to tools. Use them to answer user queries.',
          },
        },
        {
          id: 'node-agent',
          type: 'agentExecutor',
          position: { x: 500, y: 300 },
          data: {
            label: 'AgentExecutor',
            modelName: 'gpt-4o',
            maxIterations: 10,
          },
        },
        {
          id: 'node-tools',
          type: 'toolNode',
          position: { x: 750, y: 180 },
          data: {
            label: 'ToolNode',
            tools: ['search', 'calculator', 'code_interpreter'],
          },
        },
        {
          id: 'node-end',
          type: 'output',
          position: { x: 1000, y: 300 },
          data: { label: 'END' },
        },
      ],
      edges: [
        {
          id: 'edge-start-system',
          source: 'node-start',
          target: 'node-system-prompt',
          sourceHandle: 'output',
          targetHandle: 'input',
        },
        {
          id: 'edge-system-agent',
          source: 'node-system-prompt',
          target: 'node-agent',
          sourceHandle: 'output',
          targetHandle: 'input',
        },
        {
          id: 'edge-agent-tools',
          source: 'node-agent',
          target: 'node-tools',
          sourceHandle: 'tools',
          targetHandle: 'input',
          label: 'use_tools',
        },
        {
          id: 'edge-tools-agent',
          source: 'node-tools',
          target: 'node-agent',
          sourceHandle: 'output',
          targetHandle: 'tool_result',
          label: 'tool_result',
        },
        {
          id: 'edge-agent-end',
          source: 'node-agent',
          target: 'node-end',
          sourceHandle: 'output',
          targetHandle: 'input',
          label: 'finish',
        },
      ],
      viewport: { x: -50, y: 0, zoom: 0.85 },
    },
  },
];

const SEED_TEMPLATES = [
  {
    slug: 'reflection-studio',
    name: 'Reflection Studio',
    description: 'Multi-stage reflection workflow with generation, reflection, and user feedback loops.',
    category: 'reflection',
    is_builtin: true,
    sort_order: 1,
    template_data: {
      nodes: [
        { id: 'generation', type: 'generation', position: { x: 250, y: 100 }, data: { label: 'Generation', handler: 'generationNode', category: 'Processing', icon: 'Sparkles' } },
        { id: 'reflect', type: 'reflection', position: { x: 500, y: 100 }, data: { label: 'Reflect', handler: 'reflectionNode', category: 'Processing', icon: 'Brain' } },
        { id: 'user_feedback', type: 'interrupt', position: { x: 500, y: 300 }, data: { label: 'User Feedback', handler: 'userFeedbackNode', category: 'Interaction', icon: 'MessageSquare' } },
        { id: 'end', type: 'end', position: { x: 750, y: 200 }, data: { label: 'END', category: 'Control', icon: 'Flag' } },
      ],
      edges: [
        { id: 'e-gen-reflect', source: 'generation', target: 'reflect' },
        { id: 'e-reflect-feedback', source: 'reflect', target: 'user_feedback', label: 'needs_feedback' },
        { id: 'e-reflect-end', source: 'reflect', target: 'end', label: 'approved' },
        { id: 'e-feedback-gen', source: 'user_feedback', target: 'generation' },
      ],
      conditions: [
        { id: 'cond-quality', name: 'Quality Gate', field: 'state.quality_score', operator: 'gte', value: 0.8, source_node: 'reflect', target_node: 'end' },
      ],
      g11n: {
        langgraph_placeholders: {
          labels: { generation: 'Generate Content', reflect: 'Review & Reflect', user_feedback: 'Awaiting Feedback' },
        },
      },
    },
  },
  {
    slug: 'simple-pipeline',
    name: 'Simple Pipeline',
    description: 'Linear pipeline: generate, reflect, and finish. No feedback loops.',
    category: 'pipeline',
    is_builtin: true,
    sort_order: 2,
    template_data: {
      nodes: [
        { id: 'generation', type: 'generation', position: { x: 100, y: 200 }, data: { label: 'Generation', handler: 'generationNode', category: 'Processing', icon: 'Sparkles' } },
        { id: 'reflect', type: 'reflection', position: { x: 400, y: 200 }, data: { label: 'Reflect', handler: 'reflectionNode', category: 'Processing', icon: 'Brain' } },
        { id: 'end', type: 'end', position: { x: 700, y: 200 }, data: { label: 'END', category: 'Control', icon: 'Flag' } },
      ],
      edges: [
        { id: 'e-gen-reflect', source: 'generation', target: 'reflect' },
        { id: 'e-reflect-end', source: 'reflect', target: 'end' },
      ],
      conditions: [],
      g11n: {
        langgraph_placeholders: {
          labels: { generation: 'Generate', reflect: 'Review' },
        },
      },
    },
  },
  {
    slug: 'dual-review',
    name: 'Dual Review',
    description: 'Two-reviewer workflow: primary generation reviewed by two independent reflection stages.',
    category: 'reflection',
    is_builtin: true,
    sort_order: 3,
    template_data: {
      nodes: [
        { id: 'generation', type: 'generation', position: { x: 100, y: 200 }, data: { label: 'Generation', handler: 'generationNode', category: 'Processing', icon: 'Sparkles' } },
        { id: 'reviewer_a', type: 'reflection', position: { x: 400, y: 100 }, data: { label: 'Reviewer A', handler: 'reflectionNode', category: 'Processing', icon: 'Brain' } },
        { id: 'reviewer_b', type: 'reflection', position: { x: 400, y: 300 }, data: { label: 'Reviewer B', handler: 'reflectionNode', category: 'Processing', icon: 'Brain' } },
        { id: 'merge', type: 'generation', position: { x: 700, y: 200 }, data: { label: 'Merge Reviews', handler: 'generationNode', category: 'Processing', icon: 'GitMerge' } },
        { id: 'user_feedback', type: 'interrupt', position: { x: 700, y: 400 }, data: { label: 'User Feedback', handler: 'userFeedbackNode', category: 'Interaction', icon: 'MessageSquare' } },
        { id: 'end', type: 'end', position: { x: 1000, y: 200 }, data: { label: 'END', category: 'Control', icon: 'Flag' } },
      ],
      edges: [
        { id: 'e-gen-ra', source: 'generation', target: 'reviewer_a' },
        { id: 'e-gen-rb', source: 'generation', target: 'reviewer_b' },
        { id: 'e-ra-merge', source: 'reviewer_a', target: 'merge' },
        { id: 'e-rb-merge', source: 'reviewer_b', target: 'merge' },
        { id: 'e-merge-feedback', source: 'merge', target: 'user_feedback', label: 'needs_review' },
        { id: 'e-merge-end', source: 'merge', target: 'end', label: 'approved' },
        { id: 'e-feedback-gen', source: 'user_feedback', target: 'generation' },
      ],
      conditions: [
        { id: 'cond-consensus', name: 'Consensus Check', field: 'state.consensus_score', operator: 'gte', value: 0.9, source_node: 'merge', target_node: 'end' },
      ],
      g11n: {
        langgraph_placeholders: {
          labels: { generation: 'Generate', reviewer_a: 'Review A', reviewer_b: 'Review B', merge: 'Merge', user_feedback: 'Feedback' },
        },
      },
    },
  },
  {
    slug: 'vuln-resolver',
    name: 'Vulnerability Resolver',
    description: 'Automated vulnerability resolution pipeline: scan, analyze, fix, review, and create PR.',
    category: 'automation',
    is_builtin: true,
    sort_order: 4,
    template_data: {
      nodes: [
        { id: 'load_dataset', type: 'data', position: { x: 50, y: 200 }, data: { label: 'Load Dataset', handler: 'loadDatasetNode', category: 'Processing', icon: 'Database' } },
        { id: 'fetch_file', type: 'data', position: { x: 250, y: 200 }, data: { label: 'Fetch File', handler: 'fetchFileNode', category: 'Processing', icon: 'FileCode' } },
        { id: 'generation', type: 'generation', position: { x: 450, y: 200 }, data: { label: 'Generate Fix', handler: 'generationNode', category: 'Processing', icon: 'Sparkles' } },
        { id: 'reflect', type: 'reflection', position: { x: 650, y: 200 }, data: { label: 'Review Fix', handler: 'reflectionNode', category: 'Processing', icon: 'Brain' } },
        { id: 'user_feedback', type: 'interrupt', position: { x: 650, y: 400 }, data: { label: 'User Approval', handler: 'userFeedbackNode', category: 'Interaction', icon: 'MessageSquare' } },
        { id: 'update_dep', type: 'action', position: { x: 850, y: 100 }, data: { label: 'Update Dependency', handler: 'updateDependencyNode', category: 'Processing', icon: 'Package' } },
        { id: 'review_changes', type: 'reflection', position: { x: 1050, y: 200 }, data: { label: 'Review Changes', handler: 'reviewChangesNode', category: 'Processing', icon: 'Eye' } },
        { id: 'create_pr', type: 'action', position: { x: 1250, y: 200 }, data: { label: 'Create PR', handler: 'createPrNode', category: 'Processing', icon: 'GitPullRequest' } },
        { id: 'end', type: 'end', position: { x: 1450, y: 200 }, data: { label: 'END', category: 'Control', icon: 'Flag' } },
      ],
      edges: [
        { id: 'e-load-fetch', source: 'load_dataset', target: 'fetch_file' },
        { id: 'e-fetch-gen', source: 'fetch_file', target: 'generation' },
        { id: 'e-gen-reflect', source: 'generation', target: 'reflect' },
        { id: 'e-reflect-feedback', source: 'reflect', target: 'user_feedback', label: 'needs_approval' },
        { id: 'e-reflect-update', source: 'reflect', target: 'update_dep', label: 'auto_approved' },
        { id: 'e-feedback-gen', source: 'user_feedback', target: 'generation' },
        { id: 'e-update-review', source: 'update_dep', target: 'review_changes' },
        { id: 'e-review-pr', source: 'review_changes', target: 'create_pr', label: 'changes_ok' },
        { id: 'e-review-gen', source: 'review_changes', target: 'generation', label: 'needs_rework' },
        { id: 'e-pr-end', source: 'create_pr', target: 'end' },
      ],
      conditions: [
        { id: 'cond-severity', name: 'Severity Gate', field: 'state.severity', operator: 'gte', value: 7, source_node: 'reflect', target_node: 'user_feedback' },
        { id: 'cond-review-pass', name: 'Review Pass', field: 'state.review_score', operator: 'gte', value: 0.85, source_node: 'review_changes', target_node: 'create_pr' },
      ],
      g11n: {
        langgraph_placeholders: {
          labels: {
            load_dataset: 'Load Vulnerabilities',
            fetch_file: 'Fetch Source',
            generation: 'Generate Fix',
            reflect: 'Review Fix',
            user_feedback: 'Approve Fix',
            update_dep: 'Update Package',
            review_changes: 'Final Review',
            create_pr: 'Open Pull Request',
          },
        },
      },
    },
  },
];

const SEED_STRING_TEMPLATES = [
  { key: 'labels.generation', value: 'Generate Content', locale: 'en', context: 'default' },
  { key: 'labels.reflect', value: 'Review & Reflect', locale: 'en', context: 'default' },
  { key: 'labels.user_feedback', value: 'Awaiting User Feedback', locale: 'en', context: 'default' },
  { key: 'labels.end', value: 'Workflow Complete', locale: 'en', context: 'default' },
  { key: 'labels.load_dataset', value: 'Load Dataset', locale: 'en', context: 'default' },
  { key: 'labels.fetch_file', value: 'Fetch Source File', locale: 'en', context: 'default' },
  { key: 'labels.create_pr', value: 'Create Pull Request', locale: 'en', context: 'default' },
  { key: 'status.active', value: 'Running', locale: 'en', context: 'status' },
  { key: 'status.paused', value: 'Paused for Feedback', locale: 'en', context: 'status' },
  { key: 'status.completed', value: 'Completed Successfully', locale: 'en', context: 'status' },
  { key: 'status.failed', value: 'Failed', locale: 'en', context: 'status' },
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    if (process.env.POSTGRES_SCHEMA_EXIST) {
      await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${SCHEMA}";`);
    }

    // Seed flows
    for (const flowData of SEED_FLOWS) {
      const { flow_data, ...flowFields } = flowData;

      const flow = await Flow.create({
        ...flowFields,
        flow_data,
      });

      await FlowVersion.create({
        flow_id: flow.id,
        version: 1,
        flow_data,
        change_summary: 'Initial seed version',
      });

      console.log(`Seeded flow: ${flow.name} (${flow.id})`);
    }

    // Seed workflow templates
    for (const templateData of SEED_TEMPLATES) {
      const template = await WorkflowTemplate.create(templateData);
      console.log(`Seeded template: ${template.name} (${template.slug})`);
    }

    // Seed global string templates
    for (const stData of SEED_STRING_TEMPLATES) {
      await StringTemplate.create({
        flow_id: null,
        ...stData,
      });
    }
    console.log(`Seeded ${SEED_STRING_TEMPLATES.length} global string templates.`);

    console.log(
      `\nSeeding complete. ${SEED_FLOWS.length} flows, ${SEED_TEMPLATES.length} templates, ${SEED_STRING_TEMPLATES.length} string templates loaded.`
    );
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

seed();
