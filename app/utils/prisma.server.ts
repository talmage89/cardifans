import { PrismaClient } from "../generated/prisma";

declare global {
  var prismaClient: PrismaClient;
}

globalThis.prismaClient ??= new PrismaClient();

const prisma = globalThis.prismaClient;

export { prisma };
