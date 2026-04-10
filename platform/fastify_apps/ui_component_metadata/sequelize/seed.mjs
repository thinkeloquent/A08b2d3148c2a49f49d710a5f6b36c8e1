import { sequelize, SCHEMA, ComponentDefinition, ComponentTag } from './models/index.mjs';

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    if (process.env.POSTGRES_SCHEMA_EXIST) {
      await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${SCHEMA}";`);
    }

    // Create sample tags
    const tagData = [
      { name: 'form', color: '#3B82F6' },
      { name: 'display', color: '#10B981' },
      { name: 'navigation', color: '#F59E0B' },
      { name: 'data-viz', color: '#EF4444' },
      { name: 'layout', color: '#8B5CF6' },
      { name: 'interactive', color: '#EC4899' },
    ];

    const tags = {};
    for (const t of tagData) {
      const [tag] = await ComponentTag.findOrCreate({
        where: { name: t.name },
        defaults: t,
      });
      tags[t.name] = tag;
    }

    // Create sample component definitions
    const components = [
      {
        name: 'UserAuthenticationForm',
        description: 'Multi-step authentication form with SSO support and credential validation.',
        taxonomy_level: 'Organism',
        status: 'published',
        created_by: 'system',
        aliases: ['Login', 'SignIn', 'SSO_Modal', 'CredentialEntry'],
        directives: '## Usage\nUse this component when the agent needs to collect user credentials.\n\n## Do NOT use\n- For password reset flows (use PasswordResetForm instead)\n- For API key entry (use APIKeyInput atom)',
        few_shot_examples: [
          {
            prompt: 'I need to log in to my account',
            action: 'Render UserAuthenticationForm',
            payload: { mode: 'login', ssoEnabled: true },
          },
          {
            prompt: 'Sign me in with Google',
            action: 'Render UserAuthenticationForm',
            payload: { mode: 'sso', provider: 'google' },
          },
        ],
        input_schema: {
          fields: [
            { name: 'mode', type: 'string', required: true, constraints: { enum: ['login', 'register', 'sso'] } },
            { name: 'ssoEnabled', type: 'boolean', required: false },
            { name: 'providers', type: 'array', required: false },
          ],
        },
        output_schema: {
          fields: [
            { name: 'token', type: 'string', required: true },
            { name: 'userId', type: 'string', required: true },
          ],
        },
        lifecycle_config: {
          mounting: 'immediate',
          streamMutable: false,
          resolution: 'Token received and validated',
          cleanup: 'Clear credential state, revoke pending OAuth flows',
        },
        interactions: [
          { name: 'onSubmit', type: 'form_submit', interrupt: false, payloadKey: 'credentials' },
          { name: 'onSSOClick', type: 'button_click', interrupt: false, payloadKey: 'sso_provider' },
          { name: 'onCancel', type: 'button_click', interrupt: true, payloadKey: null },
        ],
        service_dependencies: [
          { name: 'Auth API', operationId: 'authenticateUser', authScope: 'auth:write' },
          { name: 'SSO Provider', operationId: 'initOAuthFlow', authScope: 'auth:sso' },
        ],
        composition_rules: {
          allowedParents: ['AppShell', 'Modal'],
          allowedChildren: [],
          ariaRole: 'form',
          ariaLabel: 'User authentication',
          viewport: 'Centered modal, max-width 480px',
        },
        tagNames: ['form', 'interactive'],
      },
      {
        name: 'SentimentBadge',
        description: 'Displays a color-coded sentiment indicator with score and label.',
        taxonomy_level: 'Atom',
        status: 'published',
        created_by: 'system',
        aliases: ['SentimentIndicator', 'MoodBadge', 'FeelingTag'],
        directives: '## Usage\nRender inline alongside text analysis results to indicate sentiment polarity.\n\n## Constraints\n- Always pair with a text snippet for context\n- Score must be 1-5 integer',
        few_shot_examples: [
          {
            prompt: 'I absolutely loved the cinematography in this film.',
            action: 'Render SentimentBadge',
            payload: { sentiment: 'positive', score: 5, label: 'Highly Favorable' },
          },
          {
            prompt: 'The product broke after two days of use.',
            action: 'Render SentimentBadge',
            payload: { sentiment: 'negative', score: 1, label: 'Critical Failure' },
          },
        ],
        input_schema: {
          fields: [
            { name: 'sentiment', type: 'string', required: true, constraints: { enum: ['positive', 'neutral', 'negative'] } },
            { name: 'score', type: 'integer', required: true, constraints: { min: 1, max: 5 } },
            { name: 'label', type: 'string', required: true },
          ],
        },
        output_schema: null,
        lifecycle_config: {
          mounting: 'resolved',
          streamMutable: false,
          resolution: 'Data fully populated',
          cleanup: '',
        },
        interactions: [],
        service_dependencies: [],
        composition_rules: {
          allowedParents: ['Card', 'ListItem', 'DataRow'],
          allowedChildren: [],
          ariaRole: 'status',
          ariaLabel: 'Sentiment indicator',
          viewport: 'Inline, auto-width',
        },
        tagNames: ['display'],
      },
      {
        name: 'InteractiveDataGrid',
        description: 'Sortable, filterable data grid with row selection and inline editing.',
        taxonomy_level: 'Organism',
        status: 'draft',
        created_by: 'system',
        aliases: ['DataTable', 'GridView', 'SpreadsheetView'],
        directives: '## Usage\nUse for displaying tabular datasets that require sorting, filtering, or row-level actions.\n\n## Fallbacks\nIf data lacks tabular structure, fall back to CardList organism.',
        few_shot_examples: [
          {
            prompt: 'Show me all users in a table',
            action: 'Render InteractiveDataGrid',
            payload: { dataSource: 'users', columns: ['name', 'email', 'role', 'lastLogin'] },
          },
        ],
        input_schema: {
          fields: [
            { name: 'dataSource', type: 'string', required: true },
            { name: 'columns', type: 'array', required: true },
            { name: 'pageSize', type: 'integer', required: false, constraints: { min: 5, max: 100 } },
            { name: 'selectable', type: 'boolean', required: false },
          ],
        },
        output_schema: {
          fields: [
            { name: 'selectedRows', type: 'array', required: false },
            { name: 'editedCells', type: 'array', required: false },
          ],
        },
        lifecycle_config: {
          mounting: 'skeleton',
          streamMutable: true,
          resolution: 'All rows loaded and rendered',
          cleanup: 'Cancel pending data fetch requests',
        },
        interactions: [
          { name: 'onRowSelect', type: 'row_click', interrupt: false, payloadKey: 'selected_row_ids' },
          { name: 'onCellEdit', type: 'inline_edit', interrupt: false, payloadKey: 'cell_update' },
          { name: 'onSort', type: 'column_click', interrupt: false, payloadKey: 'sort_config' },
        ],
        service_dependencies: [
          { name: 'Data API', operationId: 'fetchTableData', authScope: 'data:read' },
        ],
        composition_rules: {
          allowedParents: ['Dashboard', 'Panel', 'Page'],
          allowedChildren: [],
          ariaRole: 'grid',
          ariaLabel: 'Interactive data grid',
          viewport: 'Full-width, min-height 400px, horizontally scrollable',
        },
        tagNames: ['data-viz', 'interactive'],
      },
    ];

    for (const compData of components) {
      const { tagNames, ...data } = compData;
      const component = await ComponentDefinition.create(data);

      if (tagNames?.length) {
        const tagInstances = tagNames.map(name => tags[name]).filter(Boolean);
        await component.setTags(tagInstances);
      }

      console.log(`Seeded: ${compData.name}`);
    }

    console.log(`\nSeeding complete. ${components.length} component definitions loaded.`);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

seed();
