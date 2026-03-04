import path from 'node:path';
import { defineConfig } from 'prisma/config';

export default defineConfig({
    schema: path.join('prisma', 'schema'),
    datasource: {
        url: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres_dev_2026@localhost:5432/sieuthimatkinh?schema=public',
    },
});
