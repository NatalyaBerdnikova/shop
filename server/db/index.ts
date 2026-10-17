import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

export type Database = ReturnType<typeof createDb>

type SqlClient = ReturnType<typeof postgres>

const globalForDb = globalThis as unknown as {
  __amateruPg?: SqlClient
  __amateruDb?: Database
}

function resolveDatabaseUrl(): string {
  const fromRuntime = (() => {
    try {
      return String(useRuntimeConfig().databaseUrl || '').trim()
    } catch {
      return ''
    }
  })()

  return (
    fromRuntime ||
    process.env.NUXT_DATABASE_URL?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    ''
  )
}

function createDb(url: string) {
  // max 5–10 на инстанс (Amvera / несколько контейнеров)
  const client = postgres(url, {
    max: Number(process.env.DB_POOL_MAX || 10),
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false
  })
  return {
    client,
    db: drizzle(client, { schema })
  }
}

/** Drizzle-клиент для Nitro (singleton на процесс). */
export function useDb() {
  const url = resolveDatabaseUrl()
  if (!url) {
    throw createError({
      statusCode: 503,
      statusMessage:
        'База данных не настроена: задайте NUXT_DATABASE_URL или DATABASE_URL'
    })
  }

  if (!globalForDb.__amateruDb || !globalForDb.__amateruPg) {
    const { client, db } = createDb(url)
    globalForDb.__amateruPg = client
    globalForDb.__amateruDb = db
  }

  return globalForDb.__amateruDb
}

/** Сырой postgres.js-клиент (для health-check / транзакций вне Drizzle). */
export function useSql() {
  useDb()
  return globalForDb.__amateruPg!
}

export { schema }
