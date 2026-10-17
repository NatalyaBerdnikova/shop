/**
 * Автоимпорт Nitro: `const db = useDb()` в server/api и server/routes.
 * Реализация — в `server/db`.
 */
export { useDb, useSql, schema } from '../db'
export type { Database } from '../db'
