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

    // Clean up ENUM types created by Sequelize
    const enumTypes = [
      "enum_fqdp_references_entity_type",
      "enum_fqdp_references_status",
      "enum_fqdp_organizations_status",
      "enum_fqdp_workspaces_status",
      "enum_fqdp_teams_status",
      "enum_fqdp_applications_status",
      "enum_fqdp_projects_status",
      "enum_fqdp_resources_status",
      "enum_fqdp_resources_resource_type",
    ];
    for (const enumType of enumTypes) {
      await sequelize
        .query(`DROP TYPE IF EXISTS "${enumType}";`)
        .catch(() => {});
    }

    console.log(
      "Teardown complete (fqdp_management_system schema only).",
    );
  } catch (error) {
    console.error("Teardown failed:", error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

teardown();
