"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIpsClient = createIpsClient;
var errors_1 = require("../../errors");
var confianza_1 = require("./confianza");
var mock_1 = require("./mock");
function createIpsClient(ips, env) {
    var _a, _b;
    if (env === void 0) { env = process.env; }
    var mapping = toMapping(ips.contractMapping);
    switch (mapping.adapter) {
        case 'mock':
            return new mock_1.MockIpsClient();
        case 'confianza': {
            var keyEnv = (_a = mapping.agentKeyEnv) !== null && _a !== void 0 ? _a : 'CONFIANZA_AGENT_KEY';
            var agentKey = ((_b = env[keyEnv]) === null || _b === void 0 ? void 0 : _b.trim()) || null;
            return new confianza_1.ConfianzaIpsClient({ baseUrl: ips.baseUrl, agentKey: agentKey, mapping: mapping });
        }
        default:
            throw errors_1.errors.internal("Adaptador de IPS no implementado: ".concat(String(mapping.adapter)));
    }
}
function toMapping(json) {
    if (typeof json !== 'object' || json === null || !('adapter' in json)) {
        throw errors_1.errors.internal('ips.contract_mapping inválido: falta "adapter"');
    }
    return json;
}
