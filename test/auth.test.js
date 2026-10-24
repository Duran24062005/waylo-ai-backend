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
var vitest_1 = require("vitest");
var helpers_1 = require("./helpers");
var crypto_1 = require("../src/lib/crypto");
var DOMAIN = '@it-auth.test';
(0, vitest_1.describe)('auth, consent y cuenta', function () {
    var app;
    var prisma;
    var seq = 0;
    var email = function () { return "it-auth-".concat(Date.now(), "-").concat(seq++).concat(DOMAIN); };
    (0, vitest_1.beforeAll)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    (0, helpers_1.requireTestDatabase)();
                    return [4 /*yield*/, (0, helpers_1.buildTestApp)()];
                case 1:
                    (_a = _b.sent(), app = _a.app, prisma = _a.prisma);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.afterAll)(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.user.deleteMany({ where: { email: { endsWith: DOMAIN } } })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, app.close()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, prisma.$disconnect()];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.beforeEach)(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.user.deleteMany({ where: { email: { endsWith: DOMAIN } } })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    var register = function (mail, password) {
        if (password === void 0) { password = 'clave-secreta1'; }
        return app.inject({ method: 'POST', url: '/auth/register', payload: { email: mail, password: password } });
    };
    var sessionCookie = function (res) { return ({
        waylo_session: res.cookies.find(function (c) { return c.name === 'waylo_session'; }).value,
    }); };
    (0, vitest_1.it)('register crea cuenta + cookie httpOnly y /me responde', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mail, res, cookie, me;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mail = email();
                    return [4 /*yield*/, register(mail)];
                case 1:
                    res = _a.sent();
                    (0, vitest_1.expect)(res.statusCode).toBe(201);
                    (0, vitest_1.expect)(res.json()).toMatchObject({ email: mail });
                    cookie = res.cookies.find(function (c) { return c.name === 'waylo_session'; });
                    (0, vitest_1.expect)(cookie).toBeDefined();
                    (0, vitest_1.expect)(cookie === null || cookie === void 0 ? void 0 : cookie.httpOnly).toBe(true);
                    (0, vitest_1.expect)(cookie === null || cookie === void 0 ? void 0 : cookie.sameSite).toBe('Lax');
                    return [4 /*yield*/, app.inject({ method: 'GET', url: '/me', cookies: sessionCookie(res) })];
                case 2:
                    me = _a.sent();
                    (0, vitest_1.expect)(me.statusCode).toBe(200);
                    (0, vitest_1.expect)(me.json().user).toMatchObject({ email: mail });
                    (0, vitest_1.expect)(me.json().profile.name).toEqual({ value: null, source: 'local' });
                    (0, vitest_1.expect)(me.json().consent).toEqual({ granted: false, text_version: null });
                    (0, vitest_1.expect)(me.json().link.status).toBe('none');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('email duplicado → 409 EMAIL_TAKEN', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mail, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mail = email();
                    return [4 /*yield*/, register(mail)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, register(mail)];
                case 2:
                    res = _a.sent();
                    (0, vitest_1.expect)(res.statusCode).toBe(409);
                    (0, vitest_1.expect)(res.json().error.code).toBe('EMAIL_TAKEN');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('contraseña corta → 422 VALIDATION', function () { return __awaiter(void 0, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, register(email(), 'corta')];
                case 1:
                    res = _a.sent();
                    (0, vitest_1.expect)(res.statusCode).toBe(422);
                    (0, vitest_1.expect)(res.json().error.code).toBe('VALIDATION');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('login: correcto crea sesión; incorrecto → 401 INVALID_CREDENTIALS', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mail, bad, ok;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mail = email();
                    return [4 /*yield*/, register(mail)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, app.inject({ method: 'POST', url: '/auth/login', payload: { email: mail, password: 'mala12345' } })];
                case 2:
                    bad = _a.sent();
                    (0, vitest_1.expect)(bad.statusCode).toBe(401);
                    (0, vitest_1.expect)(bad.json().error.code).toBe('INVALID_CREDENTIALS');
                    return [4 /*yield*/, app.inject({ method: 'POST', url: '/auth/login', payload: { email: mail, password: 'clave-secreta1' } })];
                case 3:
                    ok = _a.sent();
                    (0, vitest_1.expect)(ok.statusCode).toBe(200);
                    (0, vitest_1.expect)(sessionCookie(ok).waylo_session).toBeTruthy();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('logout → 204 y la cookie deja de valer', function () { return __awaiter(void 0, void 0, void 0, function () {
        var res, cookies, out, me;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, register(email())];
                case 1:
                    res = _a.sent();
                    cookies = sessionCookie(res);
                    return [4 /*yield*/, app.inject({ method: 'POST', url: '/auth/logout', cookies: cookies })];
                case 2:
                    out = _a.sent();
                    (0, vitest_1.expect)(out.statusCode).toBe(204);
                    return [4 /*yield*/, app.inject({ method: 'GET', url: '/me', cookies: cookies })];
                case 3:
                    me = _a.sent();
                    (0, vitest_1.expect)(me.statusCode).toBe(401);
                    (0, vitest_1.expect)(me.json().error.code).toBe('UNAUTHORIZED');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('/me sin sesión → 401 UNAUTHORIZED', function () { return __awaiter(void 0, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, app.inject({ method: 'GET', url: '/me' })];
                case 1:
                    res = _a.sent();
                    (0, vitest_1.expect)(res.statusCode).toBe(401);
                    (0, vitest_1.expect)(res.json().error.code).toBe('UNAUTHORIZED');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('consent queda registrado (seudonimizado) y /me lo refleja', function () { return __awaiter(void 0, void 0, void 0, function () {
        var res, cookies, consent, me;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, register(email())];
                case 1:
                    res = _a.sent();
                    cookies = sessionCookie(res);
                    return [4 /*yield*/, app.inject({ method: 'POST', url: '/consent', cookies: cookies, payload: { text_version: 'v1' } })];
                case 2:
                    consent = _a.sent();
                    (0, vitest_1.expect)(consent.statusCode).toBe(201);
                    (0, vitest_1.expect)(consent.json().text_version).toBe('v1');
                    (0, vitest_1.expect)(typeof consent.json().granted_at).toBe('string');
                    return [4 /*yield*/, app.inject({ method: 'GET', url: '/me', cookies: cookies })];
                case 3:
                    me = _a.sent();
                    (0, vitest_1.expect)(me.json().consent).toEqual({ granted: true, text_version: 'v1' });
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('borrar cuenta: borra lo local, las sesiones mueren y el consent persiste', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mail, res, cookies, del, _a, _b, _c, me;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    mail = email();
                    return [4 /*yield*/, register(mail)];
                case 1:
                    res = _d.sent();
                    cookies = sessionCookie(res);
                    return [4 /*yield*/, app.inject({ method: 'POST', url: '/consent', cookies: cookies, payload: { text_version: 'v1' } })];
                case 2:
                    _d.sent();
                    return [4 /*yield*/, app.inject({ method: 'DELETE', url: '/auth/account', cookies: cookies })];
                case 3:
                    del = _d.sent();
                    (0, vitest_1.expect)(del.statusCode).toBe(200);
                    (0, vitest_1.expect)(del.json()).toEqual({ deleted: true, appointments_left_in_ips: [] });
                    _a = vitest_1.expect;
                    return [4 /*yield*/, prisma.user.findUnique({ where: { email: mail } })];
                case 4:
                    _a.apply(void 0, [_d.sent()]).toBeNull();
                    _b = vitest_1.expect;
                    return [4 /*yield*/, prisma.session.findUnique({ where: { tokenHash: (0, crypto_1.sha256hex)(cookies.waylo_session) } })];
                case 5:
                    _b.apply(void 0, [_d.sent()]).toBeNull();
                    _c = vitest_1.expect;
                    return [4 /*yield*/, prisma.consent.count()];
                case 6:
                    _c.apply(void 0, [_d.sent()]).toBeGreaterThan(0); // la prueba de consentimiento sobrevive
                    return [4 /*yield*/, app.inject({ method: 'GET', url: '/me', cookies: cookies })];
                case 7:
                    me = _d.sent();
                    (0, vitest_1.expect)(me.statusCode).toBe(401);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('ruta inexistente → 404 NOT_FOUND con forma de contrato', function () { return __awaiter(void 0, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, app.inject({ method: 'GET', url: '/no-existe' })];
                case 1:
                    res = _a.sent();
                    (0, vitest_1.expect)(res.statusCode).toBe(404);
                    (0, vitest_1.expect)(res.json().error.code).toBe('NOT_FOUND');
                    return [2 /*return*/];
            }
        });
    }); });
});
