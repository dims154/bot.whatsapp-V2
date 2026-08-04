import 'reflect-metadata';
import { config } from './config/environment';
import { createApp } from './app';
import { prismaService } from './database/prisma.service';
import { seedService } from './apps/api/seed/seed.service';
import dotenv from "dotenv";

dotenv.config();
const start = async () => {
  try {
    await prismaService.connect();
    await seedService.initialize();
  } catch (err) {
    console.error('Database initialization failed, continuing without DB:', err instanceof Error ? err.message : err);
  }

  const app = createApp();
  const port = config.server.port;

  app.listen(port, () => {
    console.log(`Enterprise ERP platform listening on port ${port}`);
  });
};

start().catch((error) => {
  if (error instanceof Error) {
    console.error('Startup failed:', error.stack ?? error.message);
  } else {
    try {
      console.error('Startup failed:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    } catch {
      console.error('Startup failed:', error);
    }
  }
  process.exit(1);
});
