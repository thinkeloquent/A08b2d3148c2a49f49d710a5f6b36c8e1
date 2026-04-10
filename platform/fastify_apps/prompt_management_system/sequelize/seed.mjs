import { sequelize, SCHEMA, Project, Prompt, PromptVersion, Deployment, Variable } from './models/index.mjs';

const INITIAL_PROJECTS = [
  { name: 'Customer Support', description: 'Prompts for customer support chatbots and agents' },
  { name: 'Internal Analytics', description: 'Prompts for internal data analysis and reporting' },
  { name: 'Content Generation', description: 'Prompts for blog posts, emails, and marketing copy' },
];

const INITIAL_PROMPTS = [
  {
    projectName: 'Customer Support',
    slug: 'customer-service-agent',
    name: 'Customer Service Agent',
    description: 'Main system instruction for the customer service chatbot',
    versions: [
      {
        version_number: 1,
        template: 'You are a helpful customer service agent for {{company_name}}. Your role is to assist customers with their inquiries about {{product_category}}.\n\nGuidelines:\n- Always be polite and professional\n- If you cannot resolve an issue, escalate to a human agent\n- Never share internal company information\n- Respond in {{language}}',
        config: { model: 'gpt-4', temperature: 0.7, max_tokens: 1024, top_p: 0.9 },
        input_schema: {
          type: 'object',
          required: ['company_name', 'product_category'],
          properties: {
            company_name: { type: 'string', description: 'The company name' },
            product_category: { type: 'string', description: 'Product category for context' },
            language: { type: 'string', default: 'English', description: 'Response language' },
          },
        },
        commit_message: 'Initial version of customer service agent prompt',
        status: 'published',
        variables: [
          { key: 'company_name', type: 'string', description: 'The company name', required: true },
          { key: 'product_category', type: 'string', description: 'Product category for context', required: true },
          { key: 'language', type: 'string', description: 'Response language', default_value: 'English', required: false },
        ],
      },
      {
        version_number: 2,
        template: 'You are a helpful customer service agent for {{company_name}}. Your role is to assist customers with their inquiries about {{product_category}}.\n\nGuidelines:\n- Always be polite and professional\n- If you cannot resolve an issue, escalate to a human agent\n- Never share internal company information\n- Respond in {{language}}\n- Use a {{tone}} tone throughout the conversation\n- Reference the customer by name when possible',
        config: { model: 'gpt-4', temperature: 0.6, max_tokens: 1024, top_p: 0.9, frequency_penalty: 0.1 },
        input_schema: {
          type: 'object',
          required: ['company_name', 'product_category'],
          properties: {
            company_name: { type: 'string' },
            product_category: { type: 'string' },
            language: { type: 'string', default: 'English' },
            tone: { type: 'string', default: 'friendly', enum: ['formal', 'friendly', 'casual'] },
          },
        },
        commit_message: 'Added tone control and name personalization',
        status: 'published',
        variables: [
          { key: 'company_name', type: 'string', description: 'The company name', required: true },
          { key: 'product_category', type: 'string', description: 'Product category for context', required: true },
          { key: 'language', type: 'string', description: 'Response language', default_value: 'English', required: false },
          { key: 'tone', type: 'string', description: 'Conversation tone', default_value: 'friendly', required: false },
        ],
      },
    ],
    deployments: [
      { environment: 'production', versionNumber: 1 },
      { environment: 'staging', versionNumber: 2 },
    ],
  },
  {
    projectName: 'Customer Support',
    slug: 'summarize-ticket',
    name: 'Summarize Support Ticket',
    description: 'Summarizes customer support tickets for agent handoff',
    versions: [
      {
        version_number: 1,
        template: 'Summarize the following customer support ticket in 2-3 sentences. Focus on the core issue and any attempted resolutions.\n\nTicket:\n{{ticket_content}}\n\nCustomer sentiment: {{sentiment}}',
        config: { model: 'gpt-3.5-turbo', temperature: 0.3, max_tokens: 256 },
        input_schema: {
          type: 'object',
          required: ['ticket_content'],
          properties: {
            ticket_content: { type: 'string' },
            sentiment: { type: 'string', default: 'neutral' },
          },
        },
        commit_message: 'Initial ticket summarization prompt',
        status: 'published',
        variables: [
          { key: 'ticket_content', type: 'string', description: 'The full ticket content', required: true },
          { key: 'sentiment', type: 'string', description: 'Customer sentiment', default_value: 'neutral', required: false },
        ],
      },
    ],
    deployments: [
      { environment: 'production', versionNumber: 1 },
    ],
  },
  {
    projectName: 'Content Generation',
    slug: 'blog-post-outline',
    name: 'Blog Post Outline Generator',
    description: 'Generates structured outlines for blog posts',
    versions: [
      {
        version_number: 1,
        template: 'Create a detailed blog post outline for the topic: "{{topic}}"\n\nTarget audience: {{audience}}\nDesired length: {{word_count}} words\nTone: {{tone}}\n\nInclude:\n- A compelling title\n- Introduction hook\n- 3-5 main sections with subsections\n- Key points for each section\n- Conclusion with call-to-action',
        config: { model: 'gpt-4', temperature: 0.8, max_tokens: 2048, top_p: 0.95 },
        input_schema: {
          type: 'object',
          required: ['topic'],
          properties: {
            topic: { type: 'string' },
            audience: { type: 'string', default: 'general' },
            word_count: { type: 'number', default: 1500 },
            tone: { type: 'string', default: 'informative' },
          },
        },
        commit_message: 'Initial blog post outline generator',
        status: 'published',
        variables: [
          { key: 'topic', type: 'string', description: 'Blog post topic', required: true },
          { key: 'audience', type: 'string', description: 'Target audience', default_value: 'general', required: false },
          { key: 'word_count', type: 'number', description: 'Target word count', default_value: '1500', required: false },
          { key: 'tone', type: 'string', description: 'Writing tone', default_value: 'informative', required: false },
        ],
      },
    ],
    deployments: [
      { environment: 'production', versionNumber: 1 },
    ],
  },
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    if (process.env.POSTGRES_SCHEMA_EXIST) {
      await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${SCHEMA}";`);
    }

    // Seed projects
    const projectMap = {};
    for (const projectData of INITIAL_PROJECTS) {
      const [project] = await Project.findOrCreate({
        where: { name: projectData.name },
        defaults: projectData,
      });
      projectMap[project.name] = project;
      console.log(`Seeded project: ${project.name}`);
    }

    // Seed prompts with versions, variables, and deployments
    for (const promptData of INITIAL_PROMPTS) {
      const project = projectMap[promptData.projectName];
      if (!project) {
        console.warn(`Project "${promptData.projectName}" not found, skipping prompt "${promptData.slug}"`);
        continue;
      }

      const [prompt, created] = await Prompt.findOrCreate({
        where: { slug: promptData.slug },
        defaults: {
          project_id: project.id,
          slug: promptData.slug,
          name: promptData.name,
          description: promptData.description,
        },
      });

      if (!created) {
        console.log(`Prompt "${promptData.slug}" already exists, skipping...`);
        continue;
      }

      console.log(`Seeded prompt: ${prompt.slug}`);

      // Create versions
      const versionMap = {};
      for (const versionData of promptData.versions) {
        const { variables: variablesData, ...versionFields } = versionData;
        const version = await PromptVersion.create({
          ...versionFields,
          prompt_id: prompt.id,
        });
        versionMap[version.version_number] = version;
        console.log(`  Seeded version: v${version.version_number}`);

        // Create variables
        if (variablesData?.length) {
          for (const varData of variablesData) {
            await Variable.create({
              ...varData,
              version_id: version.id,
            });
          }
          console.log(`  Seeded ${variablesData.length} variables for v${version.version_number}`);
        }
      }

      // Create deployments
      if (promptData.deployments?.length) {
        for (const deployData of promptData.deployments) {
          const targetVersion = versionMap[deployData.versionNumber];
          if (targetVersion) {
            await Deployment.findOrCreate({
              where: { prompt_id: prompt.id, environment: deployData.environment },
              defaults: {
                prompt_id: prompt.id,
                environment: deployData.environment,
                version_id: targetVersion.id,
                deployed_by: 'system',
              },
            });
            console.log(`  Deployed v${deployData.versionNumber} to ${deployData.environment}`);
          }
        }
      }
    }

    console.log('\nSeeding complete.');
  } catch (error) {
    console.error('Seeding failed:', error.message);
    console.error(error.stack);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

seed();
