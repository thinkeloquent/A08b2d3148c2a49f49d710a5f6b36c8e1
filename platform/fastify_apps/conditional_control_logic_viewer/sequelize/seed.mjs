import { sequelize, SCHEMA, FilterTree, DropdownOption } from './models/index.mjs';

const SAMPLE_TREES = [
  {
    name: 'User Behavior Targeting',
    description: 'Filters for targeting users based on behavioral attributes',
    tree_data: {
      id: 'root',
      type: 'group',
      operator: 'AND',
      children: [
        {
          id: 'filter-1',
          type: 'filter',
          condition: { field: 'behaviour', operator: 'equals', value: 'active_user' },
        },
        {
          id: 'group-1',
          type: 'group',
          operator: 'OR',
          children: [
            {
              id: 'filter-2',
              type: 'filter',
              condition: { field: 'select_from', operator: 'in', value: 'premium_tier' },
            },
            {
              id: 'filter-3',
              type: 'filter',
              condition: { field: 'master_contact.gender', operator: 'equals', value: 'any' },
            },
          ],
        },
      ],
    },
  },
  {
    name: 'Email Bounce Filter',
    description: 'Conditional logic for handling email bounces',
    tree_data: {
      id: 'root',
      type: 'group',
      operator: 'AND',
      children: [
        {
          id: 'filter-1',
          type: 'filter',
          condition: { field: 'contact_bounce', operator: 'greater_than', value: '3' },
        },
        {
          id: 'group-1',
          type: 'group',
          operator: 'OR',
          children: [
            {
              id: 'filter-2',
              type: 'filter',
              condition: { field: 'behaviour', operator: 'equals', value: 'unsubscribed' },
            },
            {
              id: 'filter-3',
              type: 'filter',
              condition: { field: 'behaviour', operator: 'equals', value: 'hard_bounce' },
            },
          ],
        },
      ],
    },
  },
  {
    name: 'Premium Segment Rules',
    description: 'Multi-level conditions for premium user segmentation',
    tree_data: {
      id: 'root',
      type: 'group',
      operator: 'AND',
      children: [
        {
          id: 'filter-1',
          type: 'filter',
          condition: { field: 'select_from', operator: 'in', value: 'premium_tier' },
        },
        {
          id: 'group-1',
          type: 'group',
          operator: 'AND',
          children: [
            {
              id: 'filter-2',
              type: 'filter',
              condition: { field: 'behaviour', operator: 'equals', value: 'active_user' },
            },
            {
              id: 'group-2',
              type: 'group',
              operator: 'OR',
              children: [
                {
                  id: 'filter-3',
                  type: 'filter',
                  condition: { field: 'master_contact.gender', operator: 'equals', value: 'female' },
                },
                {
                  id: 'filter-4',
                  type: 'filter',
                  condition: { field: 'master_contact.gender', operator: 'equals', value: 'male' },
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    name: 'Empty Tree Template',
    description: 'A blank filter tree for new configurations',
    tree_data: {
      id: 'root',
      type: 'group',
      operator: 'AND',
      children: [],
    },
  },
];

const SAMPLE_DROPDOWN_OPTIONS = [
  { value: 'select_from', label: 'Select from', category: 'source', sort_order: 1 },
  { value: 'master_contact.gender', label: 'master_contact \u203A gender', category: 'contact', sort_order: 2 },
  { value: 'master_contact.birth_date', label: 'master_contact \u203A birth_date', category: 'contact', sort_order: 3 },
  { value: 'behaviour', label: 'Select contacts by behaviour', category: 'behaviour', sort_order: 4 },
  { value: 'contact_bounce', label: 'Contact that have bounce from', category: 'behaviour', sort_order: 5 },
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    if (process.env.POSTGRES_SCHEMA_EXIST) {
      await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${SCHEMA}";`);
    }

    for (const treeData of SAMPLE_TREES) {
      const [tree, created] = await FilterTree.findOrCreate({
        where: { name: treeData.name },
        defaults: treeData,
      });
      console.log(`${created ? 'Seeded' : 'Exists'} filter tree: ${tree.name}`);
    }

    for (const optionData of SAMPLE_DROPDOWN_OPTIONS) {
      const [option, created] = await DropdownOption.findOrCreate({
        where: { value: optionData.value },
        defaults: optionData,
      });
      console.log(`${created ? 'Seeded' : 'Exists'} dropdown option: ${option.label}`);
    }

    console.log(`\nSeeding complete. ${SAMPLE_TREES.length} filter trees and ${SAMPLE_DROPDOWN_OPTIONS.length} dropdown options loaded.`);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

seed();
