import { sequelize, SCHEMA, Role, Group, Label } from './models/index.mjs';

const INITIAL_GROUPS = [
  { name: 'Administrators', description: 'System administration and full access control' },
  { name: 'Editors', description: 'Content management and editorial access' },
  { name: 'Viewers', description: 'Read-only access to resources' },
  { name: 'Marketing', description: 'Marketing team access and campaign management' },
  { name: 'Sales', description: 'Sales team access and CRM management' },
  { name: 'Support', description: 'Customer support and ticket management' },
  { name: 'Developers', description: 'Development team access and code management' },
  { name: 'Finance', description: 'Finance team access and billing management' },
  { name: 'Human Resources', description: 'HR team access and employee management' },
  { name: 'Operations', description: 'Operations team access and system monitoring' },
];

const INITIAL_LABELS = [
  { name: 'Critical', color: 'red', is_predefined: true, custom_created: false },
  { name: 'Admin', color: 'purple', is_predefined: true, custom_created: false },
  { name: 'Read-Only', color: 'green', is_predefined: true, custom_created: false },
  { name: 'Limited', color: 'yellow', is_predefined: true, custom_created: false },
  { name: 'Full Access', color: 'blue', is_predefined: true, custom_created: false },
  { name: 'API', color: 'indigo', is_predefined: true, custom_created: false },
  { name: 'Dashboard', color: 'cyan', is_predefined: true, custom_created: false },
  { name: 'Reporting', color: 'orange', is_predefined: true, custom_created: false },
  { name: 'System', color: 'gray', is_predefined: true, custom_created: false },
  { name: 'Custom', color: 'pink', is_predefined: true, custom_created: false },
];

const INITIAL_ROLES = [
  {
    name: 'Super Admin',
    description: 'Complete system access with full administrative privileges',
    icon: 'shield',
    labels: ['Critical', 'Admin', 'Full Access'],
    groups: ['Administrators'],
  },
  {
    name: 'Content Editor',
    description: 'Create, edit, and publish content across all channels',
    icon: 'file',
    labels: ['Dashboard'],
    groups: ['Editors'],
  },
  {
    name: 'Viewer',
    description: 'View-only access to dashboards, reports, and content',
    icon: 'eye',
    labels: ['Read-Only', 'Limited'],
    groups: ['Viewers'],
  },
  {
    name: 'API Access',
    description: 'Access to API endpoints and integration management',
    icon: 'code',
    labels: ['API', 'System'],
    groups: ['Developers'],
  },
  {
    name: 'Billing Admin',
    description: 'Manage billing, invoices, and payment operations',
    icon: 'credit',
    labels: ['Admin', 'Reporting'],
    groups: ['Finance', 'Administrators'],
  },
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    if (process.env.POSTGRES_SCHEMA_EXIST) {
      await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${SCHEMA}";`);
    }

    // Seed groups
    const groupMap = {};
    for (const groupData of INITIAL_GROUPS) {
      const [group] = await Group.findOrCreate({
        where: { name: groupData.name },
        defaults: groupData,
      });
      groupMap[group.name] = group;
      console.log(`Seeded group: ${group.name}`);
    }

    // Seed labels
    const labelMap = {};
    for (const labelData of INITIAL_LABELS) {
      const [label] = await Label.findOrCreate({
        where: { name: labelData.name },
        defaults: labelData,
      });
      labelMap[label.name] = label;
      console.log(`Seeded label: ${label.name}`);
    }

    // Seed roles with associations
    for (const roleData of INITIAL_ROLES) {
      const { labels, groups, ...roleFields } = roleData;

      const [role, created] = await Role.findOrCreate({
        where: { name: roleFields.name },
        defaults: roleFields,
      });

      if (created) {
        // Assign groups
        if (groups?.length) {
          const groupInstances = groups
            .map(name => groupMap[name])
            .filter(Boolean);
          await role.setGroups(groupInstances);
        }

        // Assign labels
        if (labels?.length) {
          const labelInstances = labels
            .map(name => labelMap[name])
            .filter(Boolean);
          await role.setLabels(labelInstances);
        }
      }

      console.log(`Seeded role: ${role.name}`);
    }

    console.log(`\nSeeding complete. ${INITIAL_ROLES.length} roles, ${INITIAL_GROUPS.length} groups, ${INITIAL_LABELS.length} labels loaded.`);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

seed();
