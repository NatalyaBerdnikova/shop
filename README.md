# amateru.st

Витрина магазина украшений на Nuxt 4. Каталог, карточки товаров, корзина и избранное собираются в статические файлы. Вход через Яндекс ID, оплата, заказы и метрики остаются маршрутами Nitro и без сервера приложения не работают.

## Версии

| | |
| --- | --- |
| Node.js | `package.json` → `engines.node`: `>=20.12.0`. Команды ниже проверены на Node.js 22.23.4. |
| npm | 10.9.9. Lockfile — `package-lock.json`. |
| Менеджер пакетов | только npm. `amvera.yml` тоже указывает `toolchain: npm`. |

Другие менеджеры (pnpm, yarn, bun) для воспроизводимой установки не использовать: под них нет lockfile.

## Статическая сборка

```bash
npm ci
npm run generate
npm run verify:static
```

Результат: каталог `.output/public`. Его можно отдать любым статическим HTTP-сервером. Сервер приложения для этих файлов не нужен. Сайт рассчитан на корень домена: пути ассетов абсолютные (`/_nuxt/...`).

### Переменные окружения сборки

Секреты для `npm run generate` не нужны. Не подставляйте ключи Яндекса и строку PostgreSQL в окружение статической сборки.

Необязательная несекретная переменная:

```bash
NUXT_PUBLIC_SITE_URL=https://example.com npm run generate
```

Она попадает в канонические ссылки и Open Graph карточек товара. Без неё эти абсолютные URL не генерируются: хост пререндера (`localhost`) в HTML не записывается. Значение без завершающего слэша, схема `http` или `https`.

Публичные `NUXT_PUBLIC_YANDEX_PAY_MERCHANT_ID` и `NUXT_PUBLIC_YANDEX_OAUTH_CLIENT_ID`, если задать их на сборке, вшиваются в клиентский бандл. Для статической публикации без сервера оставьте их пустыми.

## Локальная проверка

```bash
python3 -m http.server 4173 --directory .output/public
```

Вложенный маршрут открывается как файл, без fallback на `index.html` приложения:

`http://127.0.0.1:4173/catalog/ring-aurora/`

Неизвестный адрес. `python3 -m http.server` отвечает своим 404 и не подставляет файл Nuxt. Проверено: `GET /order/CT-TEST/`, `GET /api/auth/me`, `GET /no-such-page/` → HTTP 404.

`.output/public/404.html` и `.output/public/200.html` Nuxt пишет как клиентские оболочки без HTML ошибки: в документе пустой `<div id="__nuxt">`, заголовок остаётся `amateru.st`, текста «Страница не найдена» и картинок `404.png` там нет. Так устроен пререндер этих двух путей. Страница `app/error.vue` по-прежнему используется сервером Nitro (`npm run build`). Показ этой оболочки после загрузки JavaScript в браузере здесь не проверялся: headless Chrome на `GET /404.html` не завершился.

## Публикация

Скопируйте содержимое `.output/public` в корень статического хоста. Отдельный провайдер в репозитории для статики не задан.

`amvera.yml` описывает другой режим: Node.js, `npm run build`, затем `node .output/server/index.mjs`. Так поднимается Nitro с API. Этот процесс не заменяется каталогом `.output/public`.

## Что не работает на статическом хостинге

Код этих функций в репозитории сохранён. На чистой статике вызовы завершатся ошибкой сети, интерфейс витрины остаётся.

| Возможность | Куда ходит браузер или Яндекс |
| --- | --- |
| Вход через Яндекс ID | `GET /api/auth/me`, `GET /api/auth/yandex/url`, `GET /api/auth/yandex/callback`, `POST /api/auth/logout` |
| Чекаут и оплата | `POST /api/checkout/session` |
| Страница заказа `/order/:id` | `GET /api/orders/:id`, `POST /api/orders/:id/sync`. HTML этого маршрута не пререндерится: номер заказа известен только после оплаты |
| Вебхук и методы Яндекс Пэй | `POST /v1/webhook`, `POST /v1/order/create`, `POST /v1/order/render` |
| Заказы на диске | хранилище Nitro `.data/orders` |
| PostgreSQL | `GET /api/health/db` и `server/db`. Каталог витрины берётся из `app/data/catalog.mock.ts`, не из базы |
| Метрики | `GET /metrics`, `GET /health` (`@artmizu/nuxt-prometheus`) |

Для них нужен `npm run build` и процесс `node .output/server/index.mjs` (как в `amvera.yml`), плюс переменные из `.env.example`. Секреты в репозиторий не класть.

Корзина и избранное на статике работают: они пишутся в `localStorage` браузера.

## Проверки

```bash
npm run test:unit
npm run generate
npm run verify:static
```

Тот же порядок выполняет `.github/workflows/static-site.yml` на Node.js 22.
