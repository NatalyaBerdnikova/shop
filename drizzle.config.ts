import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

const url =
  process.env.NUXT_DATABASE_URL ||
  process.env.DATABASE_URL ||
  'postgresql://amateru:amateru_dev@localhost:5432/amateru'

export default defineConfig({
  schema: './server/db/schema.ts',
  out: './server/db/migrations',
  dialect: 'postgresql',
  dbCredentials: { url },
  strict: true,
  verbose: true
})
