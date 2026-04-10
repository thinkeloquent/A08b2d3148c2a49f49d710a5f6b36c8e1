import { sequelize, OWNED_TABLE_NAMES } from './models/index.mjs';

async function teardown() {
  if (process.env.CAN_DELETE !== 'true') {
    console.error('Teardown aborted: CAN_DELETE environment variable is not set to "true".');
    process.exitCode = 1;
    return;
  }

  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    const qi = sequelize.getQueryInterface();

    // Drop only tables owned by this schema, in dependency order (dependents first)
    for (const table of OWNED_TABLE_NAMES) {
      await qi.dropTable(table, { cascade: true }).catch(() => {});
      console.log(`Dropped table: ${table}`);
    }

    // Clean up ENUM types
    const enumTypes = [
      'enum_prompt_management_system_projects_status',
      'enum_prompt_management_system_prompts_status',
      'enum_prompt_management_system_prompt_versions_status',
      'enum_prompt_management_system_variables_type',
    ];
    for (const enumType of enumTypes) {
      await sequelize.query(`DROP TYPE IF EXISTS "${enumType}";`).catch(() => {});
    }

    console.log('Teardown complete (prompt-management-system schema only).');
  } catch (error) {
    console.error('Teardown failed:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

teardown();
