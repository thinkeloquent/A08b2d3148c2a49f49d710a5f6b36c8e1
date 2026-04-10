import { sequelize, OWNED_TABLE_NAMES } from './models/index.mjs';

async function teardown() {
  if (process.env.CAN_DELETE !== 'true') {
    console.error('Teardown aborted: CAN_DELETE is not "true".');
    process.exitCode = 1;
    return;
  }

  try {
    await sequelize.authenticate();
    const qi = sequelize.getQueryInterface();

    for (const table of OWNED_TABLE_NAMES) {
      await qi.dropTable(table, { cascade: true }).catch(() => {});
      console.log(`  Dropped: ${table}`);
    }

    // Drop ENUM types
    const enumTypes = [
      'enum_mta_csv_dh_datasources_category',
      'enum_mta_csv_dh_datasources_status',
      'enum_mta_csv_dh_instances_status',
    ];
    for (const enumType of enumTypes) {
      await sequelize.query(`DROP TYPE IF EXISTS "${enumType}";`).catch(() => {});
    }

    console.log('Teardown complete.');
  } finally {
    await sequelize.close();
  }
}

teardown();
