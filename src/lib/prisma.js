"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPrisma = createPrisma;
var client_1 = require("@prisma/client");
// Cliente Prisma único por proceso. DATABASE_URL viene del entorno (Prisma lo lee solo).
function createPrisma() {
    return new client_1.PrismaClient();
}
