import { sql } from 'drizzle-orm'

/**
 * Проверка соединения с PostgreSQL.
 * GET /api/health/db
 */
export default defineEventHandler(async () => {
  const db = useDb()
  const started = Date.now()
  const result = await db.execute<{ ok: number; server_time: Date }>(
    sql`select 1::int as ok, now() as server_time`
  )
  const row = result[0]

  return {
    ok: row?.ok === 1,
    latencyMs: Date.now() - started,
    serverTime: row?.server_time ?? null
  }
})
