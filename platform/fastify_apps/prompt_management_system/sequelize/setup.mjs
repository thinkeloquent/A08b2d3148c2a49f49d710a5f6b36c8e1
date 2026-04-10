import {
  sequelize,
  SCHEMA,
  OWNED_MODELS,
} from './models/index.mjs';

async function setup() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    if (process.env.POSTGRES_SCHEMA_EXIST) {
      await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${SCHEMA}";`);
    }

    // Sync models in dependency order
    for (const model of OWNED_MODELS) {
      await model.sync({ force: false });
      console.log(`Synced: ${model.getTableName()?.tableName || model.getTableName()}`);
    }

    console.log('Tables created successfully (prompt-management-system schema only).');
  } catch (error) {
    console.error('Setup failed:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

setup();
