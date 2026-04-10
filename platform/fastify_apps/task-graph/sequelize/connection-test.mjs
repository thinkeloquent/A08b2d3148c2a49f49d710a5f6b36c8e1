/**
 * Task Graph Connection Test
 *
 * Tests database connectivity and model loading.
 *
 * @module connection-test
 */

import { sequelize, OWNED_MODELS, OWNED_TABLE_NAMES } from './models/index.mjs';

async function connectionTest() {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection established.');

    console.log(`\nLoaded ${OWNED_MODELS.length} models:`);
    for (const model of OWNED_MODELS) {
      console.log(`  - ${model.name} (${model.getTableName()})`);
    }

    console.log(`\nOwned tables (${OWNED_TABLE_NAMES.length}):`);
    for (const table of OWNED_TABLE_NAMES) {
      console.log(`  - ${table}`);
    }

    // Check if tables exist
    console.log('\nChecking tables...');
    const [results] = await sequelize.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN (${OWNED_TABLE_NAMES.map(t => `'${t}'`).join(', ')})
    `);

    const existingTables = results.map(r => r.table_name);
    const missingTables = OWNED_TABLE_NAMES.filter(t => !existingTables.includes(t));

    if (missingTables.length === 0) {
      console.log('✓ All tables exist.');
    } else {
      console.log(`⚠ Missing tables: ${missingTables.join(', ')}`);
      console.log('  Run "node setup.mjs" to create tables.');
    }

    console.log('\n✓ Connection test passed.');
  } catch (error) {
    console.error('✗ Connection test failed:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

connectionTest();
