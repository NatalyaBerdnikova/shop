# amateru.st

Витрина каталога на Nuxt 4. Сайт показывает товары и ссылки на Telegram / VK для связи с продавцом. Корзина, авторизация, cookie-баннер и онлайн-оплата отключены.

## Версии

| | |
| --- | --- |
| Node.js | `package.json` → `engines.node`: `>=20.12.0` |
| npm | Lockfile — `package-lock.json`. Только npm. |

## Статическая сборка

```bash
npm ci
npm run generate
npm run verify:static
```

Результат: каталог `.output/public`. Его можно отдать любым статическим HTTP-сервером.

### Переменные окружения сборки

Секреты для `npm run generate` не нужны.

```bash
NUXT_PUBLIC_SITE_URL=https://example.com npm run generate
```

Значение без завершающего слэша попадает в канонические ссылки и Open Graph. Без него абсолютные URL на пререндере не записываются.

## Локальная разработка

```bash
npm ci
npm run dev
```

Каталог витрины сейчас берётся из `app/data/catalog.mock.ts` (один товар: «Клубника в стекле»). Цена и изображение заполняются позже.

## PostgreSQL (опционально)

```bash
npm run db:up
```

Схема — в `../shop_DB`. В БД можно держать тот же каталог; витрина пока не читает Postgres на клиенте.

## Проверки

```bash
npm run test:unit
npm run generate
npm run verify:static
```
