import { PrismaClient } from "@prisma/client";
import { createPrismaPgAdapter } from "@/lib/pg-adapter";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({ adapter: createPrismaPgAdapter() });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
