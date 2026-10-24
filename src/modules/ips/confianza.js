"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfianzaIpsClient = void 0;
var errors_1 = require("../../errors");
var APPOINTMENT_STATUSES = new Set(['requested', 'confirmed', 'cancelled', 'completed', 'no_show']);
function mapErrorResponse(res) {
    if (res.status >= 400 && res.status < 500)
        return errors_1.errors.linkInvalid();
    return errors_1.errors.ipsUnavailable("La IPS respondi\u00F3 ".concat(res.status));
}
var ConfianzaIpsClient = /** @class */ (function () {
    function ConfianzaIpsClient(opts, doFetch) {
        if (doFetch === void 0) { doFetch = fetch; }
        this.opts = opts;
        this.doFetch = doFetch;
    }
    ConfianzaIpsClient.prototype.url = function (path) {
        return "".concat(this.opts.baseUrl.replace(/\/+$/, '')).concat(path);
    };
    ConfianzaIpsClient.prototype.agentHeaders = function () {
        var _a;
        var _b;
        if (!this.opts.agentKey)
            return {};
        var headerName = (_b = this.opts.mapping.headerName) !== null && _b !== void 0 ? _b : 'X-Confianza-Agent-Key';
        return _a = {}, _a[headerName] = this.opts.agentKey, _a;
    };
    ConfianzaIpsClient.prototype.call = function (path, init) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.doFetch(this.url(path), init)];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        throw errors_1.errors.ipsUnavailable('La IPS no responde (red o caída)');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ConfianzaIpsClient.prototype.exchangeActivation = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var res, json, patientId;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.call('/api/v1/integrations/agent/token', {
                            method: 'POST',
                            headers: __assign({ 'content-type': 'application/json' }, this.agentHeaders()),
                            body: JSON.stringify({
                                document_type: input.documentType,
                                document_number: input.documentNumber,
                                eps: input.eps, // exigido por Confianza
                                activation_code: input.activationCode,
                            }),
                        })];
                    case 1:
                        res = _c.sent();
                        if (!res.ok)
                            throw mapErrorResponse(res);
                        return [4 /*yield*/, res.json()];
                    case 2:
                        json = (_c.sent());
                        patientId = (_a = json.identity) === null || _a === void 0 ? void 0 : _a.patient_id;
                        if (!json.access_token || typeof patientId !== 'number') {
                            throw errors_1.errors.internal('Respuesta inesperada de la IPS al activar el contrato');
                        }
                        return [2 /*return*/, { accessToken: json.access_token, expiresInSeconds: (_b = json.expires_in) !== null && _b !== void 0 ? _b : null, patientId: patientId }];
                }
            });
        });
    };
    ConfianzaIpsClient.prototype.getPatient = function (accessToken, fallbackPatientId) {
        return __awaiter(this, void 0, void 0, function () {
            var res, p;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, this.call('/api/v1/patients/me', {
                            headers: __assign({ authorization: "Bearer ".concat(accessToken) }, this.agentHeaders()),
                        })];
                    case 1:
                        res = _e.sent();
                        if (!res.ok)
                            throw mapErrorResponse(res);
                        return [4 /*yield*/, res.json()];
                    case 2:
                        p = (_e.sent());
                        if (p.active === false)
                            throw errors_1.errors.linkInvalid('El usuario está desactivado en la IPS');
                        return [2 /*return*/, {
                                patientId: (_a = p.id) !== null && _a !== void 0 ? _a : fallbackPatientId,
                                name: [p.first_name, p.last_name].filter(Boolean).join(' ') || null,
                                sex: null, // gap del contrato actual → ver IPS_CONTRATO_FEEDBACK.md
                                birthDate: (_b = p.birth_date) !== null && _b !== void 0 ? _b : null,
                                city: (_c = p.city) !== null && _c !== void 0 ? _c : null,
                                eps: (_d = p.eps) !== null && _d !== void 0 ? _d : null,
                                primarySite: null, // gap: /patients/me no trae la sede vinculada aún
                            }];
                }
            });
        });
    };
    ConfianzaIpsClient.prototype.listAppointments = function (accessToken) {
        return __awaiter(this, void 0, void 0, function () {
            var res, rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.call('/api/v1/appointments', {
                            headers: __assign({ authorization: "Bearer ".concat(accessToken) }, this.agentHeaders()),
                        })];
                    case 1:
                        res = _a.sent();
                        if (!res.ok)
                            throw mapErrorResponse(res);
                        return [4 /*yield*/, res.json()];
                    case 2:
                        rows = (_a.sent());
                        return [2 /*return*/, rows.map(function (a) {
                                var _a, _b, _c;
                                return ({
                                    id: String(a.id),
                                    type: null, // el contrato de Confianza no expone el tipo de cita
                                    startsAt: (_a = a.starts_at) !== null && _a !== void 0 ? _a : '',
                                    endsAt: (_b = a.ends_at) !== null && _b !== void 0 ? _b : null,
                                    status: (a.status && APPOINTMENT_STATUSES.has(a.status) ? a.status : 'requested'),
                                    reason: (_c = a.reason) !== null && _c !== void 0 ? _c : null,
                                    doctorName: null,
                                    site: null, // llega site_id; el nombre de la sede se resuelve en una fase posterior
                                });
                            })];
                }
            });
        });
    };
    return ConfianzaIpsClient;
}());
exports.ConfianzaIpsClient = ConfianzaIpsClient;
