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

    for (const table of OWNED_TABLE_NAMES) {
      await qi.dropTable(table, { cascade: true }).catch(() => {});
      console.log(`Dropped table: ${table}`);
    }

    const enumTypes = [
      'enum_ai_ask_v2_personas_role',
      'enum_ai_ask_v2_personas_tone',
      'enum_ai_ask_v2_llm_defaults_category',
    ];
    for (const enumType of enumTypes) {
      await sequelize.query(`DROP TYPE IF EXISTS "${enumType}";`).catch(() => {});
    }

    console.log('Teardown complete (ai-ask-v2 schema only).');
  } catch (error) {
    console.error('Teardown failed:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

teardown();
