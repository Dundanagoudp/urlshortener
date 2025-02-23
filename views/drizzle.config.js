import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle/migration',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
