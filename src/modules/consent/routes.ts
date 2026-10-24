import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { AppDeps } from '../../app';
import { pseudonymize } from '../../lib/crypto';
import { requireAuth } from '../auth/guard';

const consentSchema = z.object({ text_version: z.string().trim().min(1).max(100) });

// Prueba de consentimiento (Ley 1581). Se guarda el HMAC del userId, sin FK:
// sobrevive al borrado de la cuenta como prueba.
export function registerConsentRoutes(app: FastifyInstance, deps: AppDeps): void {
  const { prisma, config } = deps;

  app.post('/consent', async (req, reply) => {
    const userId = await requireAuth(req, deps);
    const body = consentSchema.parse(req.body);
    const consent = await prisma.consent.create({
      data: { userId: pseudonymize(userId, config.APP_SECRET), textVersion: body.text_version, source: 'registro' },
    });
    return reply.status(201).send({ text_version: consent.textVersion, granted_at: consent.grantedAt.toISOString() });
  });
}
