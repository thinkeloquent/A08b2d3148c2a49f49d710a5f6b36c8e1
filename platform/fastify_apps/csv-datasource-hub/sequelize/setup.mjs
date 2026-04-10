import { sequelize, SCHEMA, OWNED_MODELS, CsvDatasource } from './models/index.mjs';

async function setup() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    if (process.env.POSTGRES_SCHEMA_EXIST) {
      await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${SCHEMA}";`);
    }

    // Migrate category column from ENUM to VARCHAR if needed
    const tableName = CsvDatasource.getTableName();
    const tbl = typeof tableName === 'string' ? tableName : `"${tableName.schema}"."${tableName.tableName}"`;
    try {
      await sequelize.query(`ALTER TABLE ${tbl} ALTER COLUMN category TYPE VARCHAR(255);`);
      console.log('  Migrated: category ENUM -> VARCHAR(255)');
    } catch (_err) {
      // Column may already be VARCHAR or table may not exist yet — safe to ignore
    }

    for (const model of OWNED_MODELS) {
      await model.sync({ force: false });
      console.log(`  Synced: ${model.name}`);
    }

    // Sync association join tables (e.g. mta_csv_dh_tags_ref)
    await sequelize.sync({ force: false });
    console.log('  Synced: association join tables');

    console.log('Setup complete.');
  } finally {
    await sequelize.close();
  }
}

setup();
