"use strict";
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
exports.registerMeRoutes = registerMeRoutes;
var errors_1 = require("../../errors");
var crypto_1 = require("../../lib/crypto");
var guard_1 = require("../auth/guard");
var client_1 = require("../ips/client");
var state_1 = require("../ips/state");
// Perfil fusionado: lo local de Waylo + lo de la IPS (si hay vínculo activo).
// Los datos de la IPS sobreescriben por campo; sin vínculo todo es local.
function registerMeRoutes(app, deps) {
    var _this = this;
    var prisma = deps.prisma, config = deps.config;
    app.get('/me', function (req) { return __awaiter(_this, void 0, void 0, function () {
        var userId, user, consent, link, ipsValues, primarySite, notExpired, token, patient, err_1, field;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        return __generator(this, function (_m) {
            switch (_m.label) {
                case 0: return [4 /*yield*/, (0, guard_1.requireAuth)(req, deps)];
                case 1:
                    userId = _m.sent();
                    return [4 /*yield*/, prisma.user.findUnique({
                            where: { id: userId },
                            include: { profile: true, link: { include: { ips: true } } },
                        })];
                case 2:
                    user = _m.sent();
                    if (!user)
                        throw errors_1.errors.unauthorized('Cuenta inexistente');
                    return [4 /*yield*/, prisma.consent.findFirst({
                            where: { userId: (0, crypto_1.pseudonymize)(userId, config.APP_SECRET) },
                            orderBy: { grantedAt: 'desc' },
                        })];
                case 3:
                    consent = _m.sent();
                    link = user.link;
                    ipsValues = {};
                    primarySite = null;
                    if (!(link && link.status === 'ACTIVE' && link.accessTokenEncrypted)) return [3 /*break*/, 9];
                    notExpired = !link.tokenExpiresAt || link.tokenExpiresAt.getTime() > Date.now();
                    if (!notExpired) return [3 /*break*/, 9];
                    _m.label = 4;
                case 4:
                    _m.trys.push([4, 6, , 9]);
                    token = (0, crypto_1.decryptSecret)(link.accessTokenEncrypted, config.IPS_TOKEN_KEY);
                    return [4 /*yield*/, (0, client_1.createIpsClient)(link.ips, process.env).getPatient(token, link.patientId)];
                case 5:
                    patient = _m.sent();
                    ipsValues = {
                        name: (_a = patient.name) !== null && _a !== void 0 ? _a : undefined,
                        sex: (_b = patient.sex) !== null && _b !== void 0 ? _b : undefined,
                        birth_date: (_c = patient.birthDate) !== null && _c !== void 0 ? _c : undefined,
                        city: (_d = patient.city) !== null && _d !== void 0 ? _d : undefined,
                        eps: (_e = patient.eps) !== null && _e !== void 0 ? _e : undefined,
                    };
                    primarySite = patient.primarySite;
                    return [3 /*break*/, 9];
                case 6:
                    err_1 = _m.sent();
                    if (!(err_1 instanceof errors_1.AppError && (err_1.statusCode === 401 || err_1.statusCode === 403))) return [3 /*break*/, 8];
                    return [4 /*yield*/, prisma.ipsLink.update({
                            where: { id: link.id },
                            data: { status: 'DEACTIVATED', statusChangedAt: new Date() },
                            include: { ips: true },
                        })];
                case 7:
                    link = _m.sent();
                    _m.label = 8;
                case 8: return [3 /*break*/, 9];
                case 9:
                    field = function (ipsVal, localVal) {
                        return ipsVal != null ? { value: ipsVal, source: 'ips' } : { value: localVal, source: 'local' };
                    };
                    return [2 /*return*/, {
                            user: { id: user.id, email: user.email },
                            consent: { granted: consent !== null, text_version: (_f = consent === null || consent === void 0 ? void 0 : consent.textVersion) !== null && _f !== void 0 ? _f : null },
                            profile: {
                                // El perfil local no tiene nombre: sin IPS, name queda null
                                name: field(ipsValues.name, null),
                                sex: field(ipsValues.sex, (_h = (_g = user.profile) === null || _g === void 0 ? void 0 : _g.sex) !== null && _h !== void 0 ? _h : null),
                                birth_date: field(ipsValues.birth_date, isoDateOrNull((_j = user.profile) === null || _j === void 0 ? void 0 : _j.birthDate)),
                                city: field(ipsValues.city, (_l = (_k = user.profile) === null || _k === void 0 ? void 0 : _k.city) !== null && _l !== void 0 ? _l : null),
                                eps: field(ipsValues.eps, null),
                            },
                            primary_site: primarySite,
                            link: (0, state_1.linkState)(link),
                        }];
            }
        });
    }); });
}
function isoDateOrNull(d) {
    return d ? d.toISOString().slice(0, 10) : null;
}
