import { sequelize, SCHEMA, FormDefinition, FormDefinitionTag } from './models/index.mjs';

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    if (process.env.POSTGRES_SCHEMA_EXIST) {
      await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${SCHEMA}";`);
    }

    // Create sample tags
    const tagData = [
      { name: 'survey', color: '#3B82F6' },
      { name: 'feedback', color: '#10B981' },
      { name: 'registration', color: '#F59E0B' },
      { name: 'application', color: '#EF4444' },
      { name: 'intake', color: '#8B5CF6' },
    ];

    const tags = {};
    for (const t of tagData) {
      const [tag] = await FormDefinitionTag.findOrCreate({
        where: { name: t.name },
        defaults: t,
      });
      tags[t.name] = tag;
    }

    // Create sample form definitions
    const forms = [
      {
        name: 'Customer Feedback Form',
        description: 'A simple customer feedback form with rating and comments.',
        version: '1.0.0',
        status: 'published',
        created_by: 'system',
        schema_data: {
          version: '1.0.0',
          exportedAt: new Date().toISOString(),
          pages: [{
            id: 'page-1',
            title: 'Feedback',
            description: 'Please provide your feedback',
            elements: [
              { id: 'el-1', fieldType: 'text', label: 'Name', required: true },
              { id: 'el-2', fieldType: 'select', label: 'Rating', required: true, options: [
                { label: 'Excellent', value: '5' },
                { label: 'Good', value: '4' },
                { label: 'Average', value: '3' },
                { label: 'Poor', value: '2' },
                { label: 'Very Poor', value: '1' },
              ]},
              { id: 'el-3', fieldType: 'textarea', label: 'Comments', rows: 4 },
            ],
            layout: [
              { id: 'el-1', rgl_grid: [0, 0, 12, 2] },
              { id: 'el-2', rgl_grid: [0, 2, 12, 2] },
              { id: 'el-3', rgl_grid: [0, 4, 12, 4] },
            ],
          }],
        },
        metadata_data: { pages: {} },
        tagNames: ['feedback', 'survey'],
      },
      {
        name: 'User Registration Form',
        description: 'Multi-page user registration with validation.',
        version: '2.1.0',
        status: 'published',
        created_by: 'system',
        schema_data: {
          version: '2.1.0',
          exportedAt: new Date().toISOString(),
          pages: [{
            id: 'page-1',
            title: 'Personal Info',
            elements: [
              { id: 'el-1', fieldType: 'text', label: 'First Name', required: true },
              { id: 'el-2', fieldType: 'text', label: 'Last Name', required: true },
              { id: 'el-3', fieldType: 'text', label: 'Email', required: true },
            ],
            layout: [
              { id: 'el-1', rgl_grid: [0, 0, 12, 2] },
              { id: 'el-2', rgl_grid: [12, 0, 12, 2] },
              { id: 'el-3', rgl_grid: [0, 2, 24, 2] },
            ],
          }],
        },
        metadata_data: { pages: {} },
        tagNames: ['registration', 'application'],
      },
      {
        name: 'Bug Report Template',
        description: 'Template for submitting bug reports.',
        version: '1.0.0',
        status: 'draft',
        created_by: 'system',
        schema_data: {
          version: '1.0.0',
          exportedAt: new Date().toISOString(),
          pages: [{
            id: 'page-1',
            title: 'Bug Details',
            elements: [
              { id: 'el-1', fieldType: 'text', label: 'Summary', required: true },
              { id: 'el-2', fieldType: 'textarea', label: 'Steps to Reproduce', rows: 6 },
              { id: 'el-3', fieldType: 'select', label: 'Severity', options: [
                { label: 'Critical', value: 'critical' },
                { label: 'High', value: 'high' },
                { label: 'Medium', value: 'medium' },
                { label: 'Low', value: 'low' },
              ]},
            ],
            layout: [
              { id: 'el-1', rgl_grid: [0, 0, 24, 2] },
              { id: 'el-2', rgl_grid: [0, 2, 24, 6] },
              { id: 'el-3', rgl_grid: [0, 8, 12, 2] },
            ],
          }],
        },
        metadata_data: { pages: {} },
        tagNames: ['feedback'],
      },
    ];

    for (const formData of forms) {
      const { tagNames, ...data } = formData;
      const form = await FormDefinition.create(data);

      if (tagNames?.length) {
        const tagInstances = tagNames.map(name => tags[name]).filter(Boolean);
        await form.setTags(tagInstances);
      }

      console.log(`Seeded: ${formData.name}`);
    }

    console.log(`\nSeeding complete. ${forms.length} form definitions loaded.`);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

seed();
