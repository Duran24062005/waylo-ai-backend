import type { FastifyInstance } from 'fastify';
import type { AppDeps } from '../../app';

export function registerHealthRoutes(app: FastifyInstance, _deps: AppDeps): void {
  app.get('/health', async () => ({ status: 'ok' }));
}
