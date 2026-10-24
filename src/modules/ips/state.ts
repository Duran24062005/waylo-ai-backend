import type { IpsLinkStatus } from '@prisma/client';

// Traducción de estados del vínculo al vocabulario del contrato.
const STATUS_MAP: Record<IpsLinkStatus, 'active' | 'unlinked' | 'deactivated'> = {
  ACTIVE: 'active',
  UNLINKED: 'unlinked',
  DEACTIVATED: 'deactivated',
};

type LinkRow = {
  status: IpsLinkStatus;
  linkedAt: Date;
  statusChangedAt: Date;
  ips?: { name: string } | null;
} | null;

export function linkState(link: LinkRow) {
  if (!link) {
    return { status: 'none' as const, ips: null, linked_at: null, status_changed_at: null };
  }
  return {
    status: STATUS_MAP[link.status],
    ips: link.ips ? { name: link.ips.name } : null,
    linked_at: link.linkedAt.toISOString(),
    status_changed_at: link.statusChangedAt.toISOString(),
  };
}
