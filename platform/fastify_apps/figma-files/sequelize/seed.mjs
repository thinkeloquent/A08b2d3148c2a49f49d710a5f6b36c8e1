import { sequelize, SCHEMA, OWNED_TABLE_NAMES, FigmaFile, FigmaFileTag, FigmaFileMetadata } from './models/index.mjs';

const SEED_DATA = [
  {
    name: 'Material Design 3',
    description: 'Google\'s open-source design system with components, tokens, and guidelines for building high-quality digital experiences.',
    type: 'design_system',
    figma_url: 'https://www.figma.com/community/file/1035203688168086460',
    figma_file_key: '1035203688168086460',
    thumbnail_url: null,
    page_count: 12,
    component_count: 320,
    style_count: 85,
    last_modified_by: 'Google',
    editor_type: 'figma',
    trending: true,
    verified: true,
    status: 'stable',
    source: 'figma_community',
    external_ids: [['figma_community', '1035203688168086460']],
    tags: ['material', 'google', 'design-system', 'tokens'],
    metadata: [
      { name: 'Component Specs', labels: ['specs'] },
      { name: 'Token Documentation', labels: ['docs', 'tokens'] },
    ],
  },
  {
    name: 'Ant Design UI Kit',
    description: 'The official Ant Design component library for Figma, covering all major components from the Ant Design ecosystem.',
    type: 'component_library',
    figma_url: 'https://www.figma.com/community/file/831698976089873405',
    figma_file_key: '831698976089873405',
    thumbnail_url: null,
    page_count: 8,
    component_count: 480,
    style_count: 60,
    last_modified_by: 'Ant Design Team',
    editor_type: 'figma',
    trending: false,
    verified: true,
    status: 'stable',
    source: 'figma_community',
    external_ids: [['figma_community', '831698976089873405']],
    tags: ['ant-design', 'component-library', 'enterprise'],
    metadata: [
      { name: 'Usage Guidelines', labels: ['docs'] },
    ],
  },
  {
    name: 'Figma UI3 Design System',
    description: 'Figma\'s own design system used internally and shared with the community. Includes the full component set powering the Figma product.',
    type: 'design_system',
    figma_url: 'https://www.figma.com/community/file/1271813911103366792',
    figma_file_key: '1271813911103366792',
    thumbnail_url: null,
    page_count: 6,
    component_count: 210,
    style_count: 95,
    last_modified_by: 'Figma',
    editor_type: 'figma',
    trending: true,
    verified: true,
    status: 'beta',
    source: 'figma_community',
    external_ids: [['figma_community', '1271813911103366792']],
    tags: ['figma', 'design-system', 'ui3'],
    metadata: [],
  },
  {
    name: 'Radix Icons',
    description: 'A crisp set of 15x15 icons designed and maintained by the WorkOS team. Optimized for product interfaces.',
    type: 'icon_set',
    figma_url: 'https://www.figma.com/community/file/1015748072965708895',
    figma_file_key: '1015748072965708895',
    thumbnail_url: null,
    page_count: 2,
    component_count: 318,
    style_count: 4,
    last_modified_by: 'WorkOS',
    editor_type: 'figma',
    trending: false,
    verified: true,
    status: 'stable',
    source: 'figma_community',
    external_ids: [['figma_community', '1015748072965708895']],
    tags: ['icons', 'radix', 'workos', 'minimal'],
    metadata: [],
  },
  {
    name: 'Shadcn UI Components',
    description: 'Figma component library mirroring the shadcn/ui open-source component collection. Built with Tailwind design tokens.',
    type: 'component_library',
    figma_url: null,
    figma_file_key: null,
    thumbnail_url: null,
    page_count: 5,
    component_count: 140,
    style_count: 30,
    last_modified_by: null,
    editor_type: 'figma',
    trending: true,
    verified: false,
    status: 'beta',
    source: 'manual',
    external_ids: [],
    tags: ['shadcn', 'tailwind', 'component-library', 'radix'],
    metadata: [
      { name: 'Component Checklist', labels: ['docs', 'needs-analysis'] },
    ],
  },
  {
    name: 'iOS 17 UI Kit',
    description: 'Apple\'s official iOS 17 design kit including all native components, system colors, typography, and SF Symbols integration.',
    type: 'design_system',
    figma_url: 'https://www.figma.com/community/file/1248375255495415511',
    figma_file_key: '1248375255495415511',
    thumbnail_url: null,
    page_count: 18,
    component_count: 550,
    style_count: 120,
    last_modified_by: 'Apple',
    editor_type: 'figma',
    trending: false,
    verified: true,
    status: 'stable',
    source: 'figma_community',
    external_ids: [['figma_community', '1248375255495415511']],
    tags: ['ios', 'apple', 'mobile', 'native', 'design-system'],
    metadata: [
      { name: 'HIG Reference', labels: ['docs', 'specs'] },
    ],
  },
  {
    name: 'Flowbite Design System',
    description: 'Open-source Tailwind CSS component library with a full Figma design system including dark mode support.',
    type: 'design_system',
    figma_url: 'https://www.figma.com/community/file/1179442320711977498',
    figma_file_key: '1179442320711977498',
    thumbnail_url: null,
    page_count: 9,
    component_count: 260,
    style_count: 48,
    last_modified_by: 'Flowbite',
    editor_type: 'figma',
    trending: false,
    verified: true,
    status: 'stable',
    source: 'figma_community',
    external_ids: [['figma_community', '1179442320711977498']],
    tags: ['tailwind', 'flowbite', 'dark-mode', 'open-source'],
    metadata: [],
  },
  {
    name: 'FigJam Brainstorm Template',
    description: 'A collaborative brainstorming template for product teams using sticky notes, voting dots, and mind-map connectors.',
    type: 'prototype',
    figma_url: null,
    figma_file_key: null,
    thumbnail_url: null,
    page_count: 3,
    component_count: 40,
    style_count: 12,
    last_modified_by: null,
    editor_type: 'figjam',
    trending: false,
    verified: false,
    status: 'experimental',
    source: 'manual',
    external_ids: [],
    tags: ['figjam', 'brainstorm', 'template', 'collaboration'],
    metadata: [],
  },
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    if (process.env.POSTGRES_SCHEMA_EXIST) {
      await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${SCHEMA}";`);
    }

    // Truncate existing data to allow re-seeding
    for (const table of OWNED_TABLE_NAMES) {
      await sequelize.query(`TRUNCATE TABLE "${table}" CASCADE`);
    }
    console.log('Existing data truncated.');

    for (const item of SEED_DATA) {
      const file = await FigmaFile.create({
        name: item.name,
        description: item.description,
        type: item.type,
        figma_url: item.figma_url,
        figma_file_key: item.figma_file_key,
        thumbnail_url: item.thumbnail_url,
        page_count: item.page_count,
        component_count: item.component_count,
        style_count: item.style_count,
        last_modified_by: item.last_modified_by,
        editor_type: item.editor_type,
        trending: item.trending ?? false,
        verified: item.verified ?? false,
        status: item.status,
        source: item.source,
        external_ids: item.external_ids,
      });

      if (item.tags?.length) {
        const tagInstances = await Promise.all(
          item.tags.map((tagName) =>
            FigmaFileTag.findOrCreate({ where: { name: tagName } }).then(([tag]) => tag)
          )
        );
        await file.setTags(tagInstances);
      }

      if (item.metadata?.length) {
        await FigmaFileMetadata.bulkCreate(
          item.metadata.map((doc) => ({
            name: doc.name,
            labels: doc.labels ?? [],
            figma_file_id: file.id,
          }))
        );
      }

      console.log(`Seeded: ${item.name}`);
    }

    console.log(`\nSeeding complete. ${SEED_DATA.length} figma files loaded.`);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

seed();
