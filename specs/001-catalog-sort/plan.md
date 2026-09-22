# План: сортировка каталога

## Подход

Чистые функции разбора query и сортировки без Vue. Страница `/catalog` вызывает их и рисует кнопки из `CATALOG_SORT_OPTIONS`.

## Файлы

| Файл | Роль |
| --- | --- |
| `shared/catalogSort.ts` | parse, query, sort |
| `test/unit/catalog-sort.test.ts` | таблицы из `spec.md` |
| `app/pages/catalog.vue` | кнопки, URL, применение к отфильтрованному списку |

Локальный `SORT_VALUES` / `parseSort` / `list.sort` на странице убираем.

## Ограничения

- Не менять правила поиска и категорий.
- Не тащить полный `CatalogProduct` в компаратор — только `id`, `priceCents`, `releasedAt`.
