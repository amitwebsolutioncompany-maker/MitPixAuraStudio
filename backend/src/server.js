const app = require('./app');
const connectDB = require('./config/db');
const { env } = require('./config/env');
const { seedAdmin, seedCatalog } = require('./services/adminSeedService');

async function start() {
  await connectDB();
  await seedAdmin();
  await seedCatalog();

  app.listen(env.port, () => {
    console.log(`MitPix Aura Studio API running on port ${env.port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
