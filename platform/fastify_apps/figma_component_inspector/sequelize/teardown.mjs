import { sequelize, OWNED_TABLE_NAMES } from "./models/index.mjs";

async function teardown() {
  if (process.env.CAN_DELETE !== "true") {
    console.error(
      'Teardown aborted: CAN_DELETE environment variable is not set to "true".',
    );
    process.exitCode = 1;
    return;
  }

  try {
    await sequelize.authenticate();
    console.log("Database connection established.");

    const qi = sequelize.getQueryInterface();

    // Drop only tables owned by this schema, in dependency order (children first)
    for (const table of OWNED_TABLE_NAMES) {
      await qi.dropTable(table, { cascade: true }).catch(() => {
        // Table may not exist yet — ignore
      });
      console.log(`Dropped table: ${table}`);
    }

    console.log(
      "Teardown complete (figma_component_inspector schema only).",
    );
  } catch (error) {
    console.error("Teardown failed:", error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

teardown();
