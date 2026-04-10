import {
  sequelize,
  SCHEMA,
  OWNED_MODELS,
  COMPONENT_TAGS_REF_TABLE,
} from './models/index.mjs';

const REF_TABLES = [
  COMPONENT_TAGS_REF_TABLE,
];

async function setup() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    if (process.env.POSTGRES_SCHEMA_EXIST) {
      await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${SCHEMA}";`);
    }

    // Sync models owned by this schema
    for (const model of OWNED_MODELS) {
      await model.sync({ force: false });
    }

    // Sync the join tables (created by belongsToMany)
    for (const tableName of REF_TABLES) {
      const refModel = sequelize.models[tableName];
      if (refModel) {
        await refModel.sync({ force: false });
      }
    }

    console.log('Tables created successfully (component-registry schema only).');
  } catch (error) {
    console.error('Setup failed:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

setup();
