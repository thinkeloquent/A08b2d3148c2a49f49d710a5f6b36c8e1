import { sequelize, config } from './models/index.mjs';

async function connectionTest() {
  try {
    await sequelize.authenticate();
    console.log(`Connection OK — ${config.host}:${config.port}/${config.database}`);
  } catch (error) {
    console.error('Connection FAILED:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

connectionTest();
