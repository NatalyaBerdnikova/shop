# Server DB (Drizzle + PostgreSQL)

Схема совпадает с `../shop_DB/init/01_schema.sql`.

## Использование в Nitro

```ts
// server/api/example.get.ts
import { eq } from 'drizzle-orm'
import { products } from '../db/schema'

export default defineEventHandler(async () => {
  const db = useDb()
  return db.select().from(products).where(eq(products.isActive, true))
})
```

## Команды

```bash
npm run db:up          # поднять Postgres из shop_DB
npm run db:studio      # Drizzle Studio
npm run db:generate    # сгенерировать миграции из schema.ts
npm run db:push        # применить schema.ts к БД (dev)
```

Проверка: `GET /api/health/db`
