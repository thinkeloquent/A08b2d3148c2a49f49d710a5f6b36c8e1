import { sequelize, SCHEMA, OWNED_MODELS } from './models/index.mjs';

async function setup() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    if (process.env.POSTGRES_SCHEMA_EXIST) {
      await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${SCHEMA}";`);
    }

    for (const model of OWNED_MODELS) {
      await model.sync({ force: false });
    }

    console.log('Tables created successfully (ai-ask-v2 schema only).');
  } catch (error) {
    console.error('Setup failed:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

setup();
