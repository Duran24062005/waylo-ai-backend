import { PrismaClient } from '@prisma/client';

// Cliente Prisma único por proceso. DATABASE_URL viene del entorno (Prisma lo lee solo).
export function createPrisma(): PrismaClient {
  return new PrismaClient();
}
