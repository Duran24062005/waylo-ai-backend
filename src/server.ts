import { existsSync } from 'node:fs';
import { buildApp } from './app';
import { loadConfig } from './config';
import { createPrisma } from './lib/prisma';

if (existsSync('.env')) process.loadEnvFile('.env');

async function main(): Promise<void> {
  const config = loadConfig();
  const prisma = createPrisma();
  const app = await buildApp({ config, prisma });

  const shutdown = async (signal: string): Promise<void> => {
    app.log.info(`Señal ${signal}: cerrando…`);
    await app.close();
    await prisma.$disconnect();
    process.exit(0);
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));

  await app.listen({ port: config.PORT, host: '0.0.0.0' });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
