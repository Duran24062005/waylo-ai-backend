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
exports.registerIpsRoutes = registerIpsRoutes;
var zod_1 = require("zod");
var errors_1 = require("../../errors");
var crypto_1 = require("../../lib/crypto");
var guard_1 = require("../auth/guard");
var client_1 = require("./client");
var state_1 = require("./state");
var linkRequestSchema = zod_1.z.object({
    document_type: zod_1.z.string().trim().min(2).max(20),
    document_number: zod_1.z.string().trim().min(3).max(40),
    eps: zod_1.z.string().trim().min(2).max(120).nullish(), // Confianza lo exige
    activation_code: zod_1.z.string().regex(/^\d{6}$/, 'El código de activación son6 dígitos'),
    // Propuesta pendiente de aceptar en el contrato: slug de la IPS (obligatorio si hay >1 activa)
    ips_id: zod_1.z.string().trim().min(1).max(64).optional(),
});
var includeIps = { ips: { select: { name: true } } };
// Una IPS activa por cuenta (fila única en ips_links); reactivar o cambiar = UPDATE.
function registerIpsRoutes(app, deps) {
    var _this = this;
    var prisma = deps.prisma, config = deps.config;
    app.get('/ips/link', function (req) { return __awaiter(_this, void 0, void 0, function () {
        var userId, link;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, guard_1.requireAuth)(req, deps)];
                case 1:
                    userId = _a.sent();
                    return [4 /*yield*/, prisma.ipsLink.findUnique({ where: { userId: userId }, include: includeIps })];
                case 2:
                    link = _a.sent();
                    return [2 /*return*/, (0, state_1.linkState)(link)];
            }
        });
    }); });
    app.post('/ips/link', function (req, reply) { return __awaiter(_this, void 0, void 0, function () {
        var userId, body, existing, ips, client, activation, err_1, now, data, link, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, (0, guard_1.requireAuth)(req, deps)];
                case 1:
                    userId = _c.sent();
                    body = linkRequestSchema.parse(req.body);
                    return [4 /*yield*/, prisma.ipsLink.findUnique({ where: { userId: userId }, include: includeIps })];
                case 2:
                    existing = _c.sent();
                    if ((existing === null || existing === void 0 ? void 0 : existing.status) === 'ACTIVE')
                        throw errors_1.errors.linkExists();
                    return [4 /*yield*/, resolveIps(prisma, body.ips_id)];
                case 3:
                    ips = _c.sent();
                    client = (0, client_1.createIpsClient)(ips, process.env);
                    _c.label = 4;
                case 4:
                    _c.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, client.exchangeActivation({
                            documentType: body.document_type,
                            documentNumber: body.document_number,
                            eps: (_b = body.eps) !== null && _b !== void 0 ? _b : null,
                            activationCode: body.activation_code,
                        })];
                case 5:
                    activation = _c.sent();
                    return [3 /*break*/, 7];
                case 6:
                    err_1 = _c.sent();
                    if (err_1 instanceof errors_1.AppError)
                        throw err_1;
                    throw errors_1.errors.ipsUnavailable();
                case 7:
                    now = new Date();
                    data = {
                        ipsId: ips.id,
                        documentType: body.document_type,
                        documentNumber: body.document_number,
                        patientId: activation.patientId,
                        accessTokenEncrypted: (0, crypto_1.encryptSecret)(activation.accessToken, config.IPS_TOKEN_KEY),
                        tokenExpiresAt: activation.expiresInSeconds != null ? new Date(now.getTime() + activation.expiresInSeconds * 1000) : null,
                        status: 'ACTIVE',
                        linkedAt: now,
                        statusChangedAt: now,
                    };
                    if (!existing) return [3 /*break*/, 9];
                    return [4 /*yield*/, prisma.ipsLink.update({ where: { id: existing.id }, data: data, include: includeIps })];
                case 8:
                    _a = _c.sent();
                    return [3 /*break*/, 11];
                case 9: return [4 /*yield*/, prisma.ipsLink.create({ data: __assign(__assign({}, data), { userId: userId }), include: includeIps })];
                case 10:
                    _a = _c.sent();
                    _c.label = 11;
                case 11:
                    link = _a;
                    return [2 /*return*/, reply.status(200).send((0, state_1.linkState)(link))];
            }
        });
    }); });
    app.delete('/ips/link', function (req, reply) { return __awaiter(_this, void 0, void 0, function () {
        var userId, link, updated;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, guard_1.requireAuth)(req, deps)];
                case 1:
                    userId = _a.sent();
                    return [4 /*yield*/, prisma.ipsLink.findUnique({ where: { userId: userId }, include: includeIps })];
                case 2:
                    link = _a.sent();
                    if (!link)
                        return [2 /*return*/, reply.status(200).send((0, state_1.linkState)(null))]; // idempotente
                    return [4 /*yield*/, prisma.ipsLink.update({
                            where: { id: link.id },
                            data: { status: 'UNLINKED', statusChangedAt: new Date(), accessTokenEncrypted: null, tokenExpiresAt: null },
                            include: includeIps,
                        })];
                case 3:
                    updated = _a.sent();
                    return [2 /*return*/, reply.status(200).send((0, state_1.linkState)(updated))];
            }
        });
    }); });
}
function resolveIps(prisma, slug) {
    return __awaiter(this, void 0, void 0, function () {
        var ips, actives;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!slug) return [3 /*break*/, 2];
                    return [4 /*yield*/, prisma.ips.findUnique({ where: { slug: slug } })];
                case 1:
                    ips = _a.sent();
                    if (!ips || !ips.active)
                        throw errors_1.errors.noActiveLink("IPS no disponible: ".concat(slug));
                    return [2 /*return*/, ips];
                case 2: return [4 /*yield*/, prisma.ips.findMany({ where: { active: true } })];
                case 3:
                    actives = _a.sent();
                    if (actives.length === 0)
                        throw errors_1.errors.noActiveLink('No hay ninguna IPS configurada');
                    if (actives.length > 1)
                        throw errors_1.errors.validation('Hay varias IPS activas: indica ips_id');
                    return [2 /*return*/, actives[0]];
            }
        });
    });
}
