/**
 * Task Graph Schema Teardown
 *
 * Drops all tables for the task-graph schema.
 *
 * @module teardown
 */

import { sequelize, OWNED_TABLE_NAMES } from './models/index.mjs';

async function teardown() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    const qi = sequelize.getQueryInterface();

    // Drop tables in reverse dependency order
    for (const tableName of OWNED_TABLE_NAMES) {
      await qi.dropTable(tableName, { cascade: true }).catch(() => {
        // Table may not exist yet — ignore
      });
      console.log(`  Dropped table: ${tableName}`);
    }

    console.log('Tables dropped successfully (task-graph schema).');
  } catch (error) {
    console.error('Teardown failed:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

teardown();
