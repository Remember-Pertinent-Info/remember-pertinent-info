import { PrismaClient } from '@prisma/client';

// Create a singleton Prisma Client to avoid exhausting connections during dev/hot-reload
declare global {
  var __prismaClient: PrismaClient | undefined;
}

const prisma = global.__prismaClient || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.__prismaClient = prisma;

export default prisma;
