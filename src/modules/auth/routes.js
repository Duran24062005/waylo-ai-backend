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
exports.registerAuthRoutes = registerAuthRoutes;
var zod_1 = require("zod");
var client_1 = require("@prisma/client");
var errors_1 = require("../../errors");
var password_1 = require("../../lib/password");
var crypto_1 = require("../../lib/crypto");
var guard_1 = require("./guard");
var client_2 = require("../ips/client");
var contract_1 = require("../ips/contract");
var registerSchema = zod_1.z.object({
    email: zod_1.z.string().trim().email().max(254),
    password: zod_1.z.string().min(8).max(1000),
});
var loginSchema = zod_1.z.object({
    email: zod_1.z.string().trim().email().max(254),
    password: zod_1.z.string().min(1).max(1000),
});
function registerAuthRoutes(app, deps) {
    var _this = this;
    var prisma = deps.prisma, config = deps.config;
    var openSession = function (userId) { return __awaiter(_this, void 0, void 0, function () {
        var token;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    token = (0, crypto_1.randomToken)();
                    return [4 /*yield*/, prisma.session.create({
                            data: { userId: userId, tokenHash: (0, crypto_1.sha256hex)(token), expiresAt: new Date(Date.now() + config.SESSION_TTL_DAYS * 86400000) },
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, token];
            }
        });
    }); };
    var setSessionCookie = function (token, reply) {
        reply.setCookie('waylo_session', token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: config.NODE_ENV === 'production',
            path: '/',
            maxAge: config.SESSION_TTL_DAYS * 86400,
        });
    };
    app.post('/auth/register', function (req, reply) { return __awaiter(_this, void 0, void 0, function () {
        var body, email, user, token, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    body = registerSchema.parse(req.body);
                    email = body.email.toLowerCase();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, prisma.user.create({
                            data: { email: email, passwordHash: (0, password_1.hashPassword)(body.password), profile: { create: {} } },
                        })];
                case 2:
                    user = _a.sent();
                    return [4 /*yield*/, openSession(user.id)];
                case 3:
                    token = _a.sent();
                    setSessionCookie(token, reply);
                    return [2 /*return*/, reply.status(201).send({ id: user.id, email: user.email })];
                case 4:
                    err_1 = _a.sent();
                    if (err_1 instanceof client_1.Prisma.PrismaClientKnownRequestError && err_1.code === 'P2002')
                        throw errors_1.errors.emailTaken();
                    throw err_1;
                case 5: return [2 /*return*/];
            }
        });
    }); });
    app.post('/auth/login', function (req, reply) { return __awaiter(_this, void 0, void 0, function () {
        var body, user, token;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    body = loginSchema.parse(req.body);
                    return [4 /*yield*/, prisma.user.findUnique({ where: { email: body.email.toLowerCase() } })];
                case 1:
                    user = _a.sent();
                    if (!user || !(0, password_1.verifyPassword)(body.password, user.passwordHash))
                        throw errors_1.errors.invalidCredentials();
                    return [4 /*yield*/, openSession(user.id)];
                case 2:
                    token = _a.sent();
                    setSessionCookie(token, reply);
                    return [2 /*return*/, reply.status(200).send({ id: user.id, email: user.email })];
            }
        });
    }); });
    app.post('/auth/logout', function (req, reply) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, guard_1.requireAuth)(req, deps)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, prisma.session.deleteMany({ where: { tokenHash: (0, crypto_1.sha256hex)(req.cookies.waylo_session) } })];
                case 2:
                    _a.sent();
                    reply.clearCookie('waylo_session', { path: '/' });
                    return [2 /*return*/, reply.status(204).send()];
            }
        });
    }); });
    // Baja = borrado total en Waylo. Las citas NO se tocan: permanecen en la IPS
    // y se devuelven aquí para el aviso previo (best-effort si la IPS falla).
    app.delete('/auth/account', function (req, reply) { return __awaiter(_this, void 0, void 0, function () {
        var userId, appointments, link, token, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, guard_1.requireAuth)(req, deps)];
                case 1:
                    userId = _b.sent();
                    appointments = [];
                    return [4 /*yield*/, prisma.ipsLink.findUnique({ where: { userId: userId }, include: { ips: true } })];
                case 2:
                    link = _b.sent();
                    if (!((link === null || link === void 0 ? void 0 : link.status) === 'ACTIVE' && link.accessTokenEncrypted)) return [3 /*break*/, 6];
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 5, , 6]);
                    token = (0, crypto_1.decryptSecret)(link.accessTokenEncrypted, config.IPS_TOKEN_KEY);
                    return [4 /*yield*/, (0, client_2.createIpsClient)(link.ips, process.env).listAppointments(token)];
                case 4:
                    appointments = _b.sent();
                    return [3 /*break*/, 6];
                case 5:
                    _a = _b.sent();
                    appointments = []; // IPS caída: el aviso sale vacío, el borrado no depende de ella
                    return [3 /*break*/, 6];
                case 6: return [4 /*yield*/, prisma.user.delete({ where: { id: userId } })];
                case 7:
                    _b.sent();
                    reply.clearCookie('waylo_session', { path: '/' });
                    return [2 /*return*/, reply.status(200).send({
                            deleted: true,
                            appointments_left_in_ips: appointments.map(contract_1.toContractAppointment),
                        })];
            }
        });
    }); });
}
