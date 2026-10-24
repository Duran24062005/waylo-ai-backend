import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import type { PrismaClient } from '@prisma/client';
import { buildTestApp } from './helpers';

describe('Swagger UI (/docs)', () => {
  let app: FastifyInstance;
  let prisma: PrismaClient;

  beforeAll(async () => {
    ({ app, prisma } = await buildTestApp());
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('sirve la UI de Swagger en /docs', async () => {
    const res = await app.inject({ method: 'GET', url: '/docs' });
    expect(res.statusCode).toBe(200);
    expect(res.body.toLowerCase()).toContain('swagger');
  });

  it('sirve el contrato canónico en /docs/json', async () => {
    const res = await app.inject({ method: 'GET', url: '/docs/json' });
    expect(res.statusCode).toBe(200);
    const spec = res.json();
    expect(spec.openapi).toBe('3.1.0');
    expect(spec.paths['/health']).toBeDefined();
    expect(spec.paths['/ips/link']).toBeDefined();
    expect(spec.components.schemas.Error.properties.error.required).toEqual(['code', 'message']);
  });
});
