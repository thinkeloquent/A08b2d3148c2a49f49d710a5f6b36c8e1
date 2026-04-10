import { sequelize } from './models/index.mjs';

async function test() {
  try {
    await sequelize.authenticate();
    console.log('Connection OK');
  } finally {
    await sequelize.close();
  }
}
test();
