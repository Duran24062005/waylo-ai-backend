import type { FastifyInstance, FastifyReply } from 'fastify';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import type { AppDeps } from '../../app';
import { AppError, errors } from '../../errors';
import { hashPassword, verifyPassword } from '../../lib/password';
import { decryptSecret, randomToken, sha256hex } from '../../lib/crypto';
import { requireAuth } from './guard';
import { createIpsClient } from '../ips/client';
import { toContractAppointment } from '../ips/contract';

const registerSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(1000),
});

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(1000),
});

export function registerAuthRoutes(app: FastifyInstance, deps: AppDeps): void {
  const { prisma, config } = deps;

  const openSession = async (userId: string): Promise<string> => {
    const token = randomToken(); // 32 bytes aleatorios; solo se guarda su hash
    await prisma.session.create({
      data: { userId, tokenHash: sha256hex(token), expiresAt: new Date(Date.now() + config.SESSION_TTL_DAYS * 86_400_000) },
    });
    return token;
  };

  const setSessionCookie = (token: string, reply: FastifyReply): void => {
    reply.setCookie('waylo_session', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: config.NODE_ENV === 'production',
      path: '/',
      maxAge: config.SESSION_TTL_DAYS * 86_400,
    });
  };

  app.post('/auth/register', async (req, reply) => {
    const body = registerSchema.parse(req.body);
    const email = body.email.toLowerCase();
    try {
      // El perfil nace vacío: sex/birth_date/city se completarán cuando exista escritura (ver pendiente)
      const user = await prisma.user.create({
        data: { email, passwordHash: hashPassword(body.password), profile: { create: {} } },
      });
      const token = await openSession(user.id);
      setSessionCookie(token, reply);
      return reply.status(201).send({ id: user.id, email: user.email });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') throw errors.emailTaken();
      throw err;
    }
  });

  app.post('/auth/login', async (req, reply) => {
    const body = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (!user || !verifyPassword(body.password, user.passwordHash)) throw errors.invalidCredentials();
    const token = await openSession(user.id);
    setSessionCookie(token, reply);
    return reply.status(200).send({ id: user.id, email: user.email });
  });

  app.post('/auth/logout', async (req, reply) => {
    await requireAuth(req, deps);
    await prisma.session.deleteMany({ where: { tokenHash: sha256hex(req.cookies.waylo_session!) } });
    reply.clearCookie('waylo_session', { path: '/' });
    return reply.status(204).send();
  });

  // Baja = borrado total en Waylo. Las citas NO se tocan: permanecen en la IPS
  // y se devuelven aquí para el aviso previo (best-effort si la IPS falla).
  app.delete('/auth/account', async (req, reply) => {
    const userId = await requireAuth(req, deps);
    let appointments: Awaited<ReturnType<ReturnType<typeof createIpsClient>['listAppointments']>> = [];
    const link = await prisma.ipsLink.findUnique({ where: { userId }, include: { ips: true } });
    if (link?.status === 'ACTIVE' && link.accessTokenEncrypted) {
      try {
        const token = decryptSecret(link.accessTokenEncrypted, config.IPS_TOKEN_KEY);
        appointments = await createIpsClient(link.ips, process.env).listAppointments(token);
      } catch {
        appointments = []; // IPS caída: el aviso sale vacío, el borrado no depende de ella
      }
    }
    await prisma.user.delete({ where: { id: userId } });
    reply.clearCookie('waylo_session', { path: '/' });
    return reply.status(200).send({
      deleted: true,
      appointments_left_in_ips: appointments.map(toContractAppointment),
    });
  });
}
