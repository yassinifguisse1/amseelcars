import { PrismaClient } from '@prisma/client';
import { getFixedDatabaseUrl } from './db-connection';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Fix for Vercel DNS resolution issue: remove all Vercel internal domain suffixes
const getDatabaseUrl = () => {
  const url = getFixedDatabaseUrl();
  
  // Additional validation: ensure the URL doesn't contain compute.internal
  if (url && url.includes('compute.internal')) {
    console.error('[Prisma] Warning: Connection string still contains compute.internal after fix!');
    // Try one more aggressive fix
    return url.replace(/\.compute\.internal[^/]*/gi, '');
  }
  
  return url;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;