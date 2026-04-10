import { sequelize, config } from './models/index.mjs';

async function connectionTest() {
  try {
    await sequelize.authenticate();
    console.log('Connection OK');
    console.log(`  Host: ${config.host}:${config.port}`);
    console.log(`  Database: ${config.database}`);
    console.log(`  Schema: ${config.schema}`);
  } catch (error) {
    console.error('Connection FAILED:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

connectionTest();
