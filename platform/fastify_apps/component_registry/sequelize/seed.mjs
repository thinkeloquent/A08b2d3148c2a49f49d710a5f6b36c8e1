import { sequelize, SCHEMA, Component, Tag, Category } from './models/index.mjs';

const INITIAL_CATEGORIES = [
  { slug: 'forms', name: 'Form Controls', description: 'Input and form-related UI components.', icon: 'Type', sort_order: 1 },
  { slug: 'data', name: 'Data Display', description: 'Tables, charts, and data visualization components.', icon: 'Table2', sort_order: 2 },
  { slug: 'layout', name: 'Layout', description: 'Layout and structure components.', icon: 'Grid3X3', sort_order: 3 },
  { slug: 'feedback', name: 'Feedback', description: 'Alerts, notifications, and user feedback components.', icon: 'Zap', sort_order: 4 },
  { slug: 'navigation', name: 'Navigation', description: 'Menus, trees, and navigation components.', icon: 'Rows3', sort_order: 5 },
  { slug: 'overlay', name: 'Overlay', description: 'Modals, drawers, and overlay components.', icon: 'Layers', sort_order: 6 },
];

const INITIAL_TAGS = [
  'table', 'sorting', 'filtering', 'validation', 'wizard', 'dynamic',
  'responsive', 'grid', 'flexbox', 'toast', 'notification', 'alert',
  'tree', 'menu', 'sidebar', 'modal', 'dialog', 'drawer',
  'mask', 'input', 'formatting', 'charts', 'graphs', 'visualization',
  'picker', 'legacy', 'date',
];

const INITIAL_COMPONENTS = [
  {
    name: 'DataGrid Pro',
    category: 'data',
    version: '2.4.1',
    author: 'CoreUI Team',
    downloads: 45230,
    stars: 892,
    status: 'stable',
    tags: ['table', 'sorting', 'filtering'],
    description: 'Advanced data grid with virtual scrolling, sorting, and filtering capabilities.',
  },
  {
    name: 'SmartForm',
    category: 'forms',
    version: '1.8.0',
    author: 'FormLabs',
    downloads: 32100,
    stars: 654,
    status: 'stable',
    tags: ['validation', 'wizard', 'dynamic'],
    description: 'Dynamic form builder with validation and multi-step wizard support.',
  },
  {
    name: 'FlexLayout',
    category: 'layout',
    version: '3.0.0-beta',
    author: 'LayoutKit',
    downloads: 28900,
    stars: 421,
    status: 'beta',
    tags: ['responsive', 'grid', 'flexbox'],
    description: 'Responsive layout system with CSS Grid and Flexbox utilities.',
  },
  {
    name: 'AlertStack',
    category: 'feedback',
    version: '1.2.3',
    author: 'NotifyUI',
    downloads: 19800,
    stars: 312,
    status: 'stable',
    tags: ['toast', 'notification', 'alert'],
    description: 'Stackable notification system with customizable animations.',
  },
  {
    name: 'NavTree',
    category: 'navigation',
    version: '2.1.0',
    author: 'TreeView Inc',
    downloads: 15600,
    stars: 287,
    status: 'stable',
    tags: ['tree', 'menu', 'sidebar'],
    description: 'Hierarchical navigation tree with drag-and-drop support.',
  },
  {
    name: 'ModalKit',
    category: 'overlay',
    version: '1.5.2',
    author: 'OverlayJS',
    downloads: 41200,
    stars: 756,
    status: 'stable',
    tags: ['modal', 'dialog', 'drawer'],
    description: 'Accessible modal dialogs and drawer components.',
  },
  {
    name: 'InputMask',
    category: 'forms',
    version: '0.9.0',
    author: 'FormLabs',
    downloads: 8500,
    stars: 145,
    status: 'alpha',
    tags: ['mask', 'input', 'formatting'],
    description: 'Input masking for phone numbers, dates, and custom formats.',
  },
  {
    name: 'ChartPro',
    category: 'data',
    version: '1.0.0',
    author: 'DataViz Co',
    downloads: 22000,
    stars: 520,
    status: 'stable',
    tags: ['charts', 'graphs', 'visualization'],
    description: 'Interactive charts with real-time data updates and animations.',
  },
  {
    name: 'OldPicker',
    category: 'forms',
    version: '0.5.0',
    author: 'Legacy Corp',
    downloads: 3200,
    stars: 45,
    status: 'deprecated',
    tags: ['picker', 'legacy', 'date'],
    description: 'Date picker component. Deprecated in favor of SmartForm.',
  },
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    if (process.env.POSTGRES_SCHEMA_EXIST) {
      await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${SCHEMA}";`);
    }

    // Seed categories
    for (const catData of INITIAL_CATEGORIES) {
      const [category, created] = await Category.findOrCreate({
        where: { slug: catData.slug },
        defaults: catData,
      });
      console.log(`${created ? 'Seeded' : 'Exists'} category: ${category.slug}`);
    }

    // Seed tags
    const tagMap = {};
    for (const tagName of INITIAL_TAGS) {
      const [tag] = await Tag.findOrCreate({
        where: { name: tagName },
        defaults: { name: tagName },
      });
      tagMap[tag.name] = tag;
      console.log(`Seeded tag: ${tag.name}`);
    }

    // Seed components with associations
    for (const compData of INITIAL_COMPONENTS) {
      const { tags, ...compFields } = compData;

      const [component, created] = await Component.findOrCreate({
        where: { name: compFields.name },
        defaults: compFields,
      });

      if (created && tags?.length) {
        const tagInstances = tags
          .map(name => tagMap[name])
          .filter(Boolean);
        await component.setTags(tagInstances);
      }

      console.log(`Seeded component: ${component.name}`);
    }

    console.log(
      `\nSeeding complete. ${INITIAL_CATEGORIES.length} categories, ${INITIAL_COMPONENTS.length} components, ${INITIAL_TAGS.length} tags loaded.`,
    );
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

seed();
