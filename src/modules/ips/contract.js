"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toContractAppointment = toContractAppointment;
// Cita canónica → forma del contrato (docs/waylo-api.openapi.yaml, schema Appointment).
function toContractAppointment(a) {
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
