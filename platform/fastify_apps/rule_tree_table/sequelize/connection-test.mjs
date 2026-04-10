import { sequelize } from './models/index.mjs';

async function test() {
  try {
    await sequelize.authenticate();
    console.log('Connection established successfully.');
  } catch (error) {
    console.error('Unable to connect:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

test();
