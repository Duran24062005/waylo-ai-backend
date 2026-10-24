import type { CanonicalAppointment } from './types';

// Cita canónica → forma del contrato (docs/waylo-api.openapi.yaml, schema Appointment).
export function toContractAppointment(a: CanonicalAppointment) {
  return {
    id: a.id,
    type: a.type,
    starts_at: a.startsAt,
    ends_at: a.endsAt,
    status: a.status,
    reason: a.reason,
    doctor_name: a.doctorName,
    site: a.site,
  };
}
