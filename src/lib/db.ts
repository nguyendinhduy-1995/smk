import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  // S6: Require DATABASE_URL in production
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    if (process.env.NODE_ENV === 'production') throw new Error('DATABASE_URL environment variable is required');
    console.warn('⚠️ DATABASE_URL not set — using dev fallback');
  }
  const url = connectionString || 'postgresql://postgres:postgres_dev_2026@localhost:5432/sieuthimatkinh?schema=public';
  // P1: Configure pool size and timeouts
  const pool = new pg.Pool({
    connectionString: url,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

export default db;
