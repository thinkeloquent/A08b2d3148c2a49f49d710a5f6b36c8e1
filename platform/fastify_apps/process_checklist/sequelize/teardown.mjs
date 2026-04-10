import { sequelize, OWNED_TABLE_NAMES } from "./models/index.mjs";

async function teardown() {
  try {
    await sequelize.authenticate();
    console.log("Database connection established.");

    // Drop tables in reverse dependency order
    for (const tableName of OWNED_TABLE_NAMES) {
      await sequelize.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE;`);
      console.log(`  Dropped table: ${tableName}`);
    }

    console.log("Teardown complete (process-checklist tables dropped).");
  } catch (error) {
    console.error("Teardown failed:", error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

teardown();
