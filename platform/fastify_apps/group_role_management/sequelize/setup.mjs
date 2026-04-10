import {
  sequelize,
  SCHEMA,
  OWNED_MODELS,
  ROLE_GROUPS_REF_TABLE,
  ROLE_LABELS_REF_TABLE,
  ROLE_ACTIONS_REF_TABLE,
  ROLE_RESTRICTIONS_REF_TABLE,
  GROUP_ACTIONS_REF_TABLE,
  GROUP_RESTRICTIONS_REF_TABLE,
} from './models/index.mjs';

const REF_TABLES = [
  ROLE_GROUPS_REF_TABLE,
  ROLE_LABELS_REF_TABLE,
  ROLE_ACTIONS_REF_TABLE,
  ROLE_RESTRICTIONS_REF_TABLE,
  GROUP_ACTIONS_REF_TABLE,
  GROUP_RESTRICTIONS_REF_TABLE,
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

    console.log('Tables created successfully (group-role-management schema only).');
  } catch (error) {
    console.error('Setup failed:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

setup();
