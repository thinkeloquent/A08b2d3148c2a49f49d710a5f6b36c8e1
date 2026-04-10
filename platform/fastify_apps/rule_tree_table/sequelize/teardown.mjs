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

    // Drop only tables owned by this schema, in dependency order
    for (const table of OWNED_TABLE_NAMES) {
      await qi.dropTable(table, { cascade: true }).catch(() => {
        // Table may not exist yet -- ignore
      });
      console.log(`Dropped table: ${table}`);
    }

    // Clean up the ENUM types created by Sequelize for this schema
    const enumTypes = [
      'enum_rule_items_type',
      'enum_rule_items_logic',
      'enum_rule_items_value_type',
      'enum_rule_items_data_type',
    ];
    for (const enumType of enumTypes) {
      await sequelize.query(`DROP TYPE IF EXISTS "${enumType}";`).catch(() => {});
    }

    console.log('Teardown complete (rule_tree_table schema only).');
  } catch (error) {
    console.error('Teardown failed:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

teardown();
