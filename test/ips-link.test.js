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
var vitest_1 = require("vitest");
var helpers_1 = require("./helpers");
var DOMAIN = '@it-ips.test';
(0, vitest_1.describe)('vínculo con la IPS (adaptador mock)', function () {
    var app;
    var prisma;
    var seq = 0;
    var seedIps = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.ips.upsert({
                        where: { slug: 'mock' },
                        update: { active: true, contractMapping: { adapter: 'mock' } },
                        create: {
                            name: 'IPS Mock (desarrollo)',
                            slug: 'mock',
                            baseUrl: 'mock://local',
                            authType: 'HEADER_KEY',
                            contractMapping: { adapter: 'mock' },
                            serviceIds: [],
                            ragDir: 'rag/mock',
                            active: true,
                        },
                    })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, prisma.ips.upsert({
                            where: { slug: 'confianza' },
                            update: { active: false },
                            create: {
                                name: 'Confianza IPS',
                                slug: 'confianza',
                                baseUrl: 'http://localhost:9',
                                authType: 'HEADER_KEY',
                                contractMapping: { adapter: 'confianza' },
                                serviceIds: [],
                                ragDir: 'rag/confianza',
                                active: false,
                            },
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    (0, vitest_1.beforeAll)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    (0, helpers_1.requireTestDatabase)();
                    return [4 /*yield*/, (0, helpers_1.buildTestApp)()];
                case 1:
                    (_a = _b.sent(), app = _a.app, prisma = _a.prisma);
                    return [4 /*yield*/, seedIps()];
                case 2:
                    _b.sent();
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
                    return [4 /*yield*/, prisma.ips.deleteMany({ where: { slug: { in: ['mock', 'confianza', 'mock2'] } } })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, app.close()];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, prisma.$disconnect()];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    var newUser = function () { return __awaiter(void 0, void 0, void 0, function () {
        var email, res, token;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    email = "it-ips-".concat(Date.now(), "-").concat(seq++).concat(DOMAIN);
                    return [4 /*yield*/, app.inject({
                            method: 'POST',
                            url: '/auth/register',
                            payload: { email: email, password: 'clave-secreta1' },
                        })];
                case 1:
                    res = _a.sent();
                    token = res.cookies.find(function (c) { return c.name === 'waylo_session'; }).value;
                    return [2 /*return*/, { cookies: { waylo_session: token }, email: email }];
            }
        });
    }); };
    var linkPayload = function (extra) {
        if (extra === void 0) { extra = {}; }
        return (__assign({ document_type: 'CC', document_number: '123456789', eps: 'Salud Total', activation_code: '123456' }, extra));
    };
    var postLink = function (cookies, extra) {
        if (extra === void 0) { extra = {}; }
        return app.inject({ method: 'POST', url: '/ips/link', cookies: cookies, payload: linkPayload(extra) });
    };
    (0, vitest_1.it)('sin vínculo: GET → none; sin sesión → 401', function () { return __awaiter(void 0, void 0, void 0, function () {
        var noSession, cookies, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, app.inject({ method: 'GET', url: '/ips/link' })];
                case 1:
                    noSession = _a.sent();
                    (0, vitest_1.expect)(noSession.statusCode).toBe(401);
                    (0, vitest_1.expect)(noSession.json().error.code).toBe('UNAUTHORIZED');
                    return [4 /*yield*/, newUser()];
                case 2:
                    cookies = (_a.sent()).cookies;
                    return [4 /*yield*/, app.inject({ method: 'GET', url: '/ips/link', cookies: cookies })];
                case 3:
                    res = _a.sent();
                    (0, vitest_1.expect)(res.statusCode).toBe(200);
                    (0, vitest_1.expect)(res.json()).toEqual({ status: 'none', ips: null, linked_at: null, status_changed_at: null });
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('vincular con código válido → active; /me sirve los datos de la IPS', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, cookies, email, res, me, body, link;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, newUser()];
                case 1:
                    _a = _b.sent(), cookies = _a.cookies, email = _a.email;
                    return [4 /*yield*/, postLink(cookies)];
                case 2:
                    res = _b.sent();
                    (0, vitest_1.expect)(res.statusCode).toBe(200);
                    (0, vitest_1.expect)(res.json()).toMatchObject({ status: 'active', ips: { name: 'IPS Mock (desarrollo)' } });
                    (0, vitest_1.expect)(typeof res.json().linked_at).toBe('string');
                    return [4 /*yield*/, app.inject({ method: 'GET', url: '/me', cookies: cookies })];
                case 3:
                    me = _b.sent();
                    body = me.json();
                    (0, vitest_1.expect)(body.profile.name).toEqual({ value: 'Paciente Demo', source: 'ips' });
                    (0, vitest_1.expect)(body.profile.sex).toEqual({ value: 'F', source: 'ips' });
                    (0, vitest_1.expect)(body.profile.birth_date).toEqual({ value: '1990-05-17', source: 'ips' });
                    (0, vitest_1.expect)(body.profile.city).toEqual({ value: 'Bogotá', source: 'ips' });
                    (0, vitest_1.expect)(body.profile.eps).toEqual({ value: 'Salud Total', source: 'ips' });
                    (0, vitest_1.expect)(body.primary_site).toMatchObject({ id: 1, name: 'Sede Centro', address: 'Calle 10 # 5-20', city: 'Bogotá' });
                    (0, vitest_1.expect)(body.link).toMatchObject({ status: 'active', ips: { name: 'IPS Mock (desarrollo)' } });
                    return [4 /*yield*/, prisma.ipsLink.findFirst({ where: { user: { email: email } } })];
                case 4:
                    link = _b.sent();
                    (0, vitest_1.expect)(link === null || link === void 0 ? void 0 : link.accessTokenEncrypted).toMatch(/^v1\./);
                    (0, vitest_1.expect)(link === null || link === void 0 ? void 0 : link.accessTokenEncrypted).not.toContain('mock-token');
                    (0, vitest_1.expect)(link === null || link === void 0 ? void 0 : link.patientId).toBe(42);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('código inválido → 401 LINK_INVALID', function () { return __awaiter(void 0, void 0, void 0, function () {
        var cookies, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, newUser()];
                case 1:
                    cookies = (_a.sent()).cookies;
                    return [4 /*yield*/, postLink(cookies, { activation_code: '999999' })];
                case 2:
                    res = _a.sent();
                    (0, vitest_1.expect)(res.statusCode).toBe(401);
                    (0, vitest_1.expect)(res.json().error.code).toBe('LINK_INVALID');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('código de activación mal formado → 422 VALIDATION', function () { return __awaiter(void 0, void 0, void 0, function () {
        var cookies, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, newUser()];
                case 1:
                    cookies = (_a.sent()).cookies;
                    return [4 /*yield*/, postLink(cookies, { activation_code: '12345' })];
                case 2:
                    res = _a.sent();
                    (0, vitest_1.expect)(res.statusCode).toBe(422);
                    (0, vitest_1.expect)(res.json().error.code).toBe('VALIDATION');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('segundo vínculo activo → 409 LINK_EXISTS', function () { return __awaiter(void 0, void 0, void 0, function () {
        var cookies, again;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, newUser()];
                case 1:
                    cookies = (_a.sent()).cookies;
                    return [4 /*yield*/, postLink(cookies)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, postLink(cookies)];
                case 3:
                    again = _a.sent();
                    (0, vitest_1.expect)(again.statusCode).toBe(409);
                    (0, vitest_1.expect)(again.json().error.code).toBe('LINK_EXISTS');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('desvincular → unlinked y /me vuelve a lo local; reactivar reutiliza la fila', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, cookies, email, del, me, relink, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, newUser()];
                case 1:
                    _a = _c.sent(), cookies = _a.cookies, email = _a.email;
                    return [4 /*yield*/, postLink(cookies)];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, app.inject({ method: 'DELETE', url: '/ips/link', cookies: cookies })];
                case 3:
                    del = _c.sent();
                    (0, vitest_1.expect)(del.statusCode).toBe(200);
                    (0, vitest_1.expect)(del.json().status).toBe('unlinked');
                    return [4 /*yield*/, app.inject({ method: 'GET', url: '/me', cookies: cookies })];
                case 4:
                    me = _c.sent();
                    (0, vitest_1.expect)(me.json().profile.name).toEqual({ value: null, source: 'local' });
                    (0, vitest_1.expect)(me.json().primary_site).toBeNull();
                    (0, vitest_1.expect)(me.json().link.status).toBe('unlinked');
                    return [4 /*yield*/, postLink(cookies)];
                case 5:
                    relink = _c.sent();
                    (0, vitest_1.expect)(relink.statusCode).toBe(200);
                    (0, vitest_1.expect)(relink.json().status).toBe('active');
                    _b = vitest_1.expect;
                    return [4 /*yield*/, prisma.ipsLink.count({ where: { user: { email: email } } })];
                case 6:
                    _b.apply(void 0, [_c.sent()]).toBe(1);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('DELETE sin vínculo → 200 none (idempotente)', function () { return __awaiter(void 0, void 0, void 0, function () {
        var cookies, del;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, newUser()];
                case 1:
                    cookies = (_a.sent()).cookies;
                    return [4 /*yield*/, app.inject({ method: 'DELETE', url: '/ips/link', cookies: cookies })];
                case 2:
                    del = _a.sent();
                    (0, vitest_1.expect)(del.statusCode).toBe(200);
                    (0, vitest_1.expect)(del.json().status).toBe('none');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('ips_id a una IPS inactiva → 409 NO_ACTIVE_LINK', function () { return __awaiter(void 0, void 0, void 0, function () {
        var cookies, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, newUser()];
                case 1:
                    cookies = (_a.sent()).cookies;
                    return [4 /*yield*/, postLink(cookies, { ips_id: 'confianza' })];
                case 2:
                    res = _a.sent();
                    (0, vitest_1.expect)(res.statusCode).toBe(409);
                    (0, vitest_1.expect)(res.json().error.code).toBe('NO_ACTIVE_LINK');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('varias IPS activas: sin ips_id → 422; con ips_id → active', function () { return __awaiter(void 0, void 0, void 0, function () {
        var cookies, noSlug, withSlug;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.ips.upsert({
                        where: { slug: 'mock2' },
                        update: { active: true },
                        create: {
                            name: 'IPS Mock 2',
                            slug: 'mock2',
                            baseUrl: 'mock://local',
                            authType: 'HEADER_KEY',
                            contractMapping: { adapter: 'mock' },
                            serviceIds: [],
                            ragDir: 'rag/mock2',
                            active: true,
                        },
                    })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, newUser()];
                case 2:
                    cookies = (_a.sent()).cookies;
                    return [4 /*yield*/, postLink(cookies)];
                case 3:
                    noSlug = _a.sent();
                    (0, vitest_1.expect)(noSlug.statusCode).toBe(422);
                    (0, vitest_1.expect)(noSlug.json().error.code).toBe('VALIDATION');
                    return [4 /*yield*/, postLink(cookies, { ips_id: 'mock2' })];
                case 4:
                    withSlug = _a.sent();
                    (0, vitest_1.expect)(withSlug.statusCode).toBe(200);
                    (0, vitest_1.expect)(withSlug.json()).toMatchObject({ status: 'active', ips: { name: 'IPS Mock 2' } });
                    return [4 /*yield*/, prisma.ips.update({ where: { slug: 'mock2' }, data: { active: false } })];
                case 5:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
