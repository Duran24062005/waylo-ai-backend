"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = loadConfig;
var zod_1 = require("zod");
// Configuración por variables de entorno (.env en dev; variables reales en prod/Docker).
var emptyToUndefined = function (v) { return (v === '' ? undefined : v); };
var envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
    PORT: zod_1.z.coerce.number().int().min(1).max(65535).default(3001),
    DATABASE_URL: zod_1.z.string().min(1),
    APP_SECRET: zod_1.z.string().min(32),
    IPS_TOKEN_KEY: zod_1.z.string().regex(/^[0-9a-fA-F]{64}$/, 'IPS_TOKEN_KEY debe ser64 hex (32 bytes)'),
    SESSION_TTL_DAYS: zod_1.z.coerce.number().int().positive().default(30),
    CONFIANZA_BASE_URL: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().url().default('http://localhost:8000')),
    XAI_API_KEY: zod_1.z.string().default(''),
    LLM_BASE_URL: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().url().optional()),
    // Configurables por país (MVP Colombia)
    EMERGENCY_PHONE: zod_1.z.string().default(''),
    MENTAL_HEALTH_PHONE: zod_1.z.string().default(''),
    VOICE_BUDGET_MONTHLY_USD: zod_1.z.coerce.number().min(0).optional(),
});
function loadConfig(env) {
    if (env === void 0) { env = process.env; }
    return envSchema.parse(env);
}
