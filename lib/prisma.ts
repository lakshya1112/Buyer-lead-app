// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

console.log("Attempting to initialize Prisma Client...");

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

console.log("Prisma Client initialized successfully.");

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma