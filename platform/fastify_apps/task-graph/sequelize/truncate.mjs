import { sequelize, OWNED_TABLE_NAMES } from "./models/index.mjs";

async function truncate() {
  try {
    await sequelize.authenticate();
    console.log("Database connection established.");

    for (const table of OWNED_TABLE_NAMES) {
      await sequelize.query(`TRUNCATE TABLE "${table}" CASCADE`);
      console.log(`Truncated: ${table}`);
    }

    console.log("Truncate complete.");
  } catch (error) {
    console.error("Truncate failed:", error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

truncate();
