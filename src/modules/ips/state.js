"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkState = linkState;
// Traducción de estados del vínculo al vocabulario del contrato.
var STATUS_MAP = {
    ACTIVE: 'active',
    UNLINKED: 'unlinked',
    DEACTIVATED: 'deactivated',
};
function linkState(link) {
    if (!link) {
        return { status: 'none', ips: null, linked_at: null, status_changed_at: null };
    }
    return {
        status: STATUS_MAP[link.status],
        ips: link.ips ? { name: link.ips.name } : null,
        linked_at: link.linkedAt.toISOString(),
        status_changed_at: link.statusChangedAt.toISOString(),
    };
}
