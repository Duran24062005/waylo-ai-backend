import type { FastifyRequest } from 'fastify';
import type { AppDeps } from '../../app';
import { errors } from '../../errors';
import { sha256hex } from '../../lib/crypto';

// Autenticación por cookie httpOnly `waylo_session`: el cliente lleva el token,
// aquí solo el hash (sha256) en `sessions`.
export async function requireAuth(req: FastifyRequest, deps: AppDeps): Promise<string> {
  const raw = req.cookies?.waylo_session;
  if (!raw) throw errors.unauthorized();
  const session = await deps.prisma.session.findUnique({ where: { tokenHash: sha256hex(raw) } });
  if (!session || session.expiresAt.getTime() <= Date.now()) throw errors.unauthorized('Sesión vencida');
  req.userId = session.userId;
  return session.userId;
}
