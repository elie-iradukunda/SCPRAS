import app from './app.js';
import { sequelize } from './config/database.js';
import { env } from './config/env.js';
import './models/index.js';
import { seedDemoDataIfEmpty } from './services/demoSeedService.js';
import { ensureSchema } from './services/schemaService.js';

async function startServer() {
  try {
    await sequelize.authenticate();
    if (env.db.sync) {
      await sequelize.sync();
      await ensureSchema();
      const seeded = await seedDemoDataIfEmpty();
      if (seeded) {
        console.log('Demo construction data seeded.');
      }
      console.log('Database tables are ready.');
    }
    console.log('MySQL connection established.');
  } catch (error) {
    console.warn('MySQL connection failed. Check server/.env before using database routes.');
    if (env.demoMode) {
      console.warn('Demo mode is enabled, so API routes will use in-memory construction data as a fallback.');
    }
    console.warn(error.message);
  }

  app.listen(env.port, () => {
    console.log(`SCPRAS API running on http://localhost:${env.port}`);
  });
}

startServer();
