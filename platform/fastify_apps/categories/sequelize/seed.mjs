import { sequelize, CategoryType, TargetApp, Category } from './models/index.mjs';

const CATEGORY_TYPES = [
  'Feature',
  'Bug',
  'Enhancement',
  'Documentation',
  'Refactor',
  'Test',
  'Infrastructure',
];

const TARGET_APPS = [
  'task-graph',
  'code-repositories',
  'form-builder',
  'csv-datasource-hub',
  'persona-editor',
  'ai-ask',
  'categories',
  'ui-component-metadata',
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Seed category types
    const types = {};
    for (const name of CATEGORY_TYPES) {
      const [type] = await CategoryType.findOrCreate({ where: { name } });
      types[name] = type;
      console.log(`Category type: ${name}`);
    }

    // Seed target apps
    const apps = {};
    for (const name of TARGET_APPS) {
      const [app] = await TargetApp.findOrCreate({ where: { name } });
      apps[name] = app;
      console.log(`Target app: ${name}`);
    }

    // Seed sample categories
    const CATEGORIES = [
      { name: 'Graph Visualization', description: 'Task graph rendering and layout', type: 'Feature', app: 'task-graph' },
      { name: 'Node Editing', description: 'Edit task graph nodes inline', type: 'Enhancement', app: 'task-graph' },
      { name: 'CSV Import', description: 'Import data from CSV files', type: 'Feature', app: 'csv-datasource-hub' },
      { name: 'Infosec', description: 'Information security category', type: 'Feature', app: 'csv-datasource-hub' },
      { name: 'Vulnerability', description: 'Vulnerability tracking and reporting', type: 'Feature', app: 'csv-datasource-hub' },
      { name: 'Dependency', description: 'Dependency management and tracking', type: 'Feature', app: 'csv-datasource-hub' },
      { name: 'Compliance', description: 'Compliance audit and reporting', type: 'Feature', app: 'csv-datasource-hub' },
      { name: 'Performance', description: 'Performance metrics and monitoring', type: 'Feature', app: 'csv-datasource-hub' },
      { name: 'Custom', description: 'Custom user-defined category', type: 'Feature', app: 'csv-datasource-hub' },
      { name: 'Persona Templates', description: 'Pre-built persona configurations', type: 'Feature', app: 'persona-editor' },
      { name: 'Prompt Registry', description: 'Manage prompt modules and registry', type: 'Feature', app: 'ai-ask' },
      { name: 'Form Validation', description: 'Client and server-side form validation', type: 'Enhancement', app: 'form-builder' },
      { name: 'Repository Search', description: 'Search and filter code repositories', type: 'Feature', app: 'code-repositories' },
      { name: 'Component Catalog', description: 'Browse and document UI components', type: 'Documentation', app: 'ui-component-metadata' },
    ];

    for (const cat of CATEGORIES) {
      await Category.findOrCreate({
        where: { name: cat.name },
        defaults: {
          description: cat.description,
          category_type_id: types[cat.type].id,
          target_app_id: apps[cat.app].id,
        },
      });
      console.log(`Category: ${cat.name}`);
    }

    console.log(`\nSeeding complete. ${CATEGORY_TYPES.length} types, ${TARGET_APPS.length} apps, ${CATEGORIES.length} categories.`);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

seed();
