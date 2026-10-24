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
exports.buildApp = buildApp;
var fastify_1 = require("fastify");
var cookie_1 = require("@fastify/cookie");
var zod_1 = require("zod");
var errors_1 = require("./errors");
var routes_1 = require("./modules/health/routes");
var routes_2 = require("./modules/auth/routes");
var routes_3 = require("./modules/consent/routes");
var routes_4 = require("./modules/ips/routes");
var routes_5 = require("./modules/me/routes");
function buildApp(deps) {
    return __awaiter(this, void 0, void 0, function () {
        var app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = (0, fastify_1.default)({ logger: deps.config.NODE_ENV !== 'test' });
                    return [4 /*yield*/, app.register(cookie_1.default)];
                case 1:
                    _a.sent();
                    app.decorateRequest('userId', null);
                    // Todos los errores salen con la forma del contrato: { error: { code, message } }
                    app.setErrorHandler(function (err, req, reply) {
                        var _a, _b;
                        if (err instanceof errors_1.AppError) {
                            return reply.status(err.statusCode).send({ error: { code: err.code, message: err.message } });
                        }
                        if (err instanceof zod_1.ZodError) {
                            var first = err.issues[0];
                            var where = (first === null || first === void 0 ? void 0 : first.path.join('.')) || 'body';
                            return reply.status(422).send({ error: { code: 'VALIDATION', message: "".concat(where, ": ").concat((_a = first === null || first === void 0 ? void 0 : first.message) !== null && _a !== void 0 ? _a : 'inválido') } });
                        }
                        var status = (_b = err === null || err === void 0 ? void 0 : err.statusCode) !== null && _b !== void 0 ? _b : 500;
                        if (status === 401)
                            return reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'Sin sesión' } });
                        if (status === 404)
                            return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Ruta no encontrada' } });
                        if (status >= 400 && status < 500) {
                            return reply.status(422).send({ error: { code: 'VALIDATION', message: 'Payload inválido' } });
                        }
                        req.log.error({ err: err }, 'Error interno');
                        return reply.status(500).send({ error: { code: 'INTERNAL', message: 'Error interno' } });
                    });
                    app.setNotFoundHandler(function (_req, reply) {
                        return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Ruta no encontrada' } });
                    });
                    (0, routes_1.registerHealthRoutes)(app, deps);
                    (0, routes_2.registerAuthRoutes)(app, deps);
                    (0, routes_3.registerConsentRoutes)(app, deps);
                    (0, routes_4.registerIpsRoutes)(app, deps);
                    (0, routes_5.registerMeRoutes)(app, deps);
                    return [2 /*return*/, app];
            }
        });
    });
}
