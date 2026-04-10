import { sequelize } from "./models/index.mjs";

async function connectionTest() {
  try {
    await sequelize.authenticate();
    console.log("Connection test passed.");
  } catch (error) {
    console.error("Connection test failed:", error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

connectionTest();
