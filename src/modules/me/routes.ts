import type { FastifyInstance } from 'fastify';
import type { AppDeps } from '../../app';
import { AppError, errors } from '../../errors';
import { decryptSecret, pseudonymize } from '../../lib/crypto';
import { requireAuth } from '../auth/guard';
import { createIpsClient } from '../ips/client';
import { linkState } from '../ips/state';
import type { CanonicalPatient } from '../ips/types';

// Perfil fusionado: lo local de Waylo + lo de la IPS (si hay vínculo activo).
// Los datos de la IPS sobreescriben por campo; sin vínculo todo es local.
export function registerMeRoutes(app: FastifyInstance, deps: AppDeps): void {
  const { prisma, config } = deps;

  app.get('/me', async (req) => {
    const userId = await requireAuth(req, deps);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, link: { include: { ips: true } } },
    });
    if (!user) throw errors.unauthorized('Cuenta inexistente');

    const consent = await prisma.consent.findFirst({
      where: { userId: pseudonymize(userId, config.APP_SECRET) },
      orderBy: { grantedAt: 'desc' },
    });

    let link = user.link;
    let ipsValues: Partial<Record<'name' | 'sex' | 'birth_date' | 'city' | 'eps', string>> = {};
    let primarySite: CanonicalPatient['primarySite'] = null;

    if (link && link.status === 'ACTIVE' && link.accessTokenEncrypted) {
      const notExpired = !link.tokenExpiresAt || link.tokenExpiresAt.getTime() > Date.now();
      if (notExpired) {
        try {
          const token = decryptSecret(link.accessTokenEncrypted, config.IPS_TOKEN_KEY);
          const patient = await createIpsClient(link.ips, process.env).getPatient(token, link.patientId);
          ipsValues = {
            name: patient.name ?? undefined,
            sex: patient.sex ?? undefined,
            birth_date: patient.birthDate ?? undefined,
            city: patient.city ?? undefined,
            eps: patient.eps ?? undefined,
          };
          primarySite = patient.primarySite;
        } catch (err) {
          // La IPS rechazó el token / desactivó al usuario → degradar el vínculo (N0/N3/N4 siguen)
          if (err instanceof AppError && (err.statusCode === 401 || err.statusCode === 403)) {
            link = await prisma.ipsLink.update({
              where: { id: link.id },
              data: { status: 'DEACTIVATED', statusChangedAt: new Date() },
              include: { ips: true },
            });
          }
          // 503 (IPS caída): Fase 0 sin caché de respaldo → se sirve lo local
        }
      }
    }

    const field = (ipsVal: string | undefined, localVal: string | null) =>
      ipsVal != null ? { value: ipsVal, source: 'ips' as const } : { value: localVal, source: 'local' as const };

    return {
      user: { id: user.id, email: user.email },
      consent: { granted: consent !== null, text_version: consent?.textVersion ?? null },
      profile: {
        // El perfil local no tiene nombre: sin IPS, name queda null
        name: field(ipsValues.name, null),
        sex: field(ipsValues.sex, user.profile?.sex ?? null),
        birth_date: field(ipsValues.birth_date, isoDateOrNull(user.profile?.birthDate)),
        city: field(ipsValues.city, user.profile?.city ?? null),
        eps: field(ipsValues.eps, null),
      },
      primary_site: primarySite,
      link: linkState(link),
    };
  });
}

function isoDateOrNull(d: Date | null | undefined): string | null {
  return d ? d.toISOString().slice(0, 10) : null;
}
