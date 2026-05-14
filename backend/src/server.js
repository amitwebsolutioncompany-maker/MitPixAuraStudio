// const app = require('./app');
// const connectDB = require('./config/db');
// const { env } = require('./config/env');
// const { seedAdmin, seedCatalog } = require('./services/adminSeedService');

// async function start() {
//   await connectDB();
//   await seedAdmin();
//   await seedCatalog();

//   app.listen(env.port, () => {
//     console.log(`MitPix Aura Studio API running on port ${env.port}`);
//   });
// }

// start().catch((error) => {
//   console.error('Failed to start server', error);
//   process.exit(1);
// });
const app = require('./app');
const connectDB = require('./config/db');
const { env } = require('./config/env');
const { seedAdmin, seedCatalog } = require('./services/adminSeedService');
const { purgeExpiredHistory } = require('./services/historyRetentionService');

async function runStartupMaintenance() {
  const results = await Promise.allSettled([
    purgeExpiredHistory({ force: true }),
    seedAdmin(),
    seedCatalog(),
  ]);

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      const taskName = ['history purge', 'admin seed', 'catalog seed'][index];
      console.error(`Startup ${taskName} failed:`, result.reason);
    }
  });
}

async function start() {
  const PORT = process.env.PORT || env.port || 10000;
  const server = app.listen(PORT, () => {
    console.log(`MitPix Aura Studio API running on port ${PORT}`);
    console.log(`Health check ready at /health`);
  });

  try {
    await connectDB();
    await runStartupMaintenance();
  } catch (error) {
    console.error("Failed to start server:", error);
    server.close(() => process.exit(1));
  }
}

start();
