<script setup lang="ts">
import {
  catalogProducts,
  categorySlugSet
} from '~/data/catalog'
import {
  CATALOG_SORT_OPTIONS,
  DEFAULT_CATALOG_SORT,
  catalogSortQueryParam,
  parseCatalogSort,
  sortCatalogProducts,
  type CatalogSortValue
} from '#shared/catalogSort'

useHead({
  title: 'Каталог',
  meta: [
    {
      name: 'description',
      content: 'Каталог украшений amateru.st: кольца, подвески, серьги, браслеты и другие коллекции.'
    }
  ]
})

const route = useRoute()
const router = useRouter()

function parseCatParam(value: unknown): string[] {
  if (value == null || value === '') return []
  if (Array.isArray(value)) {
    return value
      .flatMap((v) => String(v).split(','))
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return String(value)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function filterValidSlugs(slugs: string[]) {
  return slugs.filter((s) => categorySlugSet.has(s))
}

const isFilterOpen = ref(false)

const searchInput = ref('')
const searchQuery = ref('')
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

const sort = ref<CatalogSortValue>(DEFAULT_CATALOG_SORT)

const selectedCategorySlugs = ref<string[]>([])

const categoryOptions = computed(() => {
  const map = new Map<string, string>()
  for (const p of catalogProducts) {
    if (!map.has(p.categorySlug)) map.set(p.categorySlug, p.category)
  }
  return [...map.entries()].map(([slug, label]) => ({ slug, label }))
})

function syncQueryToUrl() {
  const query: Record<string, string | string[]> = {}
  for (const [key, val] of Object.entries(route.query)) {
    if (key === 'q' || key === 'cat' || key === 'sort') continue
    query[key] = val as string | string[]
  }
  if (searchQuery.value.trim()) {
    query.q = searchQuery.value.trim()
  }
  if (selectedCategorySlugs.value.length) {
    query.cat = [...selectedCategorySlugs.value].sort().join(',')
  }
  if (catalogSortQueryParam(sort.value)) {
    query.sort = sort.value
  }
  router.replace({ path: route.path, query })
}

function applyRouteQuery() {
  const q = typeof route.query.q === 'string' ? route.query.q : ''
  searchInput.value = q
  searchQuery.value = q.trim()
  selectedCategorySlugs.value = filterValidSlugs(parseCatParam(route.query.cat))
  sort.value = parseCatalogSort(route.query.sort)
}

watch(
  () => route.query,
  () => {
    applyRouteQuery()
  },
  { immediate: true }
)

function onSearchInput() {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    searchQuery.value = searchInput.value.trim()
    syncQueryToUrl()
  }, 300)
}

function onSearchBlur() {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  searchDebounceTimer = null
  searchQuery.value = searchInput.value.trim()
  syncQueryToUrl()
}

function setSort(value: CatalogSortValue) {
  sort.value = value
  syncQueryToUrl()
}

function toggleCategory(slug: string) {
  if (selectedCategorySlugs.value.includes(slug)) {
    selectedCategorySlugs.value = selectedCategorySlugs.value.filter((s) => s !== slug)
  } else {
    selectedCategorySlugs.value = [...selectedCategorySlugs.value, slug]
  }
  syncQueryToUrl()
}

function resetFilters() {
  selectedCategorySlugs.value = []
  syncQueryToUrl()
}

const filteredProducts = computed(() => {
  let list = [...catalogProducts]

  if (selectedCategorySlugs.value.length) {
    const set = new Set(selectedCategorySlugs.value)
    list = list.filter((p) => set.has(p.categorySlug))
  }

  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter((p) => p.title.toLowerCase().includes(q))
  }

  return sortCatalogProducts(list, sort.value)
})

watch(isFilterOpen, (open) => {
  if (!import.meta.client) return
  document.body.style.overflow = open ? 'hidden' : ''
})

onUnmounted(() => {
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
})
</script>

<template lang="pug">
main.catalog-page
  .container
    .catalog-page__toolbar
      button.catalog-page__filter-btn(
        type="button"
        @click="isFilterOpen = true"
      ) Фильтры

      label.catalog-page__search-label
        input.catalog-page__search-input(
          v-model="searchInput"
          type="search"
          name="q"
          placeholder="Поиск по названию"
          autocomplete="off"
          aria-label="Поиск по названию"
          @input="onSearchInput"
          @keydown.enter.prevent="onSearchBlur"
          @blur="onSearchBlur"
        )

      .catalog-page__sort(role="group" aria-label="Сортировка")
        button.catalog-page__sort-btn(
          v-for="option in CATALOG_SORT_OPTIONS"
          :key="option.value"
          type="button"
          :class="{ 'catalog-page__sort-btn--active': sort === option.value }"
          :aria-pressed="sort === option.value"
          @click="setSort(option.value)"
        ) {{ option.label }}

    p.catalog-page__result
      | Найдено товаров: {{ filteredProducts.length }}

    .catalog-page__grid
      CatalogProductCard(
        v-for="product in filteredProducts"
        :key="product.id"
        :product="product"
      )

  Transition(name="catalog-filter-overlay")
    button.catalog-page__overlay(
      v-if="isFilterOpen"
      type="button"
      aria-label="Закрыть фильтры"
      @click="isFilterOpen = false"
    )

  aside.catalog-page__filters(
    :class="{ 'catalog-page__filters--open': isFilterOpen }"
    role="dialog"
    aria-modal="true"
    aria-label="Фильтры по категориям"
    :aria-hidden="!isFilterOpen"
    :inert="!isFilterOpen"
  )
    .catalog-page__filters-head
      h2.catalog-page__filters-title Категории
      button.catalog-page__filters-close(
        type="button"
        aria-label="Закрыть фильтры"
        @click="isFilterOpen = false"
      ) ×

    .catalog-page__filters-body
      label.catalog-page__check(
        v-for="opt in categoryOptions"
        :key="opt.slug"
      )
        input(
          type="checkbox"
          :checked="selectedCategorySlugs.includes(opt.slug)"
          @change="toggleCategory(opt.slug)"
        )
        span {{ opt.label }}

    .catalog-page__filters-actions
      button.catalog-page__filters-reset(
        type="button"
        @click="resetFilters"
      ) Сбросить
      button.catalog-page__filters-apply(
        type="button"
        @click="isFilterOpen = false"
      ) Показать {{ filteredProducts.length }}
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;

.catalog-page {
  padding-block: clamp(1.4rem, 3vw, 2.3rem) clamp(2rem, 4vw, 3rem);

  &__toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  &__filter-btn {
    border: 1px solid $color-ink-12;
    background: $color-paper;
    color: $color-ink;
    border-radius: 999px;
    height: 2.5rem;
    padding-inline: 1rem;
    cursor: pointer;
    flex-shrink: 0;
  }

  &__search-label {
    flex: 1 1 12rem;
    min-width: min(100%, 10rem);
  }

  &__search-input {
    height: 2.5rem;
    padding-inline: 0.85rem;
    border-radius: 999px;
    border: 1px solid $color-ink-12;
    background: $color-paper;
    font-size: 0.95rem;
    width: 100%;
    box-sizing: border-box;

    &:focus-visible {
      outline: 2px solid $color-gold;
      outline-offset: 2px;
    }
  }

  &__sort {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    flex-shrink: 0;
  }

  &__sort-btn {
    border: 1px solid $color-ink-12;
    background: $color-paper;
    color: $color-ink;
    border-radius: 999px;
    height: 2.5rem;
    padding-inline: 0.85rem;
    font-size: 0.82rem;
    cursor: pointer;
    transition:
      border-color 0.2s ease,
      background 0.2s ease,
      color 0.2s ease;

    &--active {
      border-color: $color-gold;
      background: rgb(77 14 18 / 10%);
      color: $color-ink;
    }

    &:focus-visible {
      outline: 2px solid $color-gold;
      outline-offset: 2px;
    }
  }

  &__result {
    margin: 0 0 1rem;
    color: $color-ink-55;
  }

  &__grid {
    display: grid;
    gap: 1rem;
    align-items: start;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }

  &__overlay {
    position: fixed;
    inset: 0;
    z-index: 120;
    border: none;
    background: rgb(15 15 16 / 42%);
  }

  &__filters {
    position: fixed;
    z-index: 121;
    top: 0;
    left: 0;
    width: min(24rem, 88vw);
    height: 100dvh;
    background: $color-paper;
    border-right: 1px solid $color-ink-10;
    box-shadow: 12px 0 28px rgb(26 25 24 / 12%);
    display: flex;
    flex-direction: column;
    transform: translateX(-100%);
    transition: transform 0.25s ease;

    &--open {
      transform: translateX(0);
    }
  }

  &__filters-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1rem 0.75rem;
    border-bottom: 1px solid $color-ink-10;
  }

  &__filters-title {
    margin: 0;
    font-size: 1.1rem;
  }

  &__filters-close {
    width: 2.25rem;
    height: 2.25rem;
    border: none;
    border-radius: 8px;
    background: transparent;
    font-size: 1.4rem;
    cursor: pointer;
  }

  &__filters-body {
    display: grid;
    gap: 0.45rem;
    padding: 1rem;
    overflow: auto;
  }

  &__check {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    font-size: 0.95rem;
  }

  &__filters-actions {
    margin-top: auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.55rem;
    padding: 1rem;
    border-top: 1px solid $color-ink-10;
  }

  &__filters-reset,
  &__filters-apply {
    height: 2.4rem;
    border-radius: 999px;
    cursor: pointer;
    border: 1px solid $color-ink-12;
    background: $color-paper;
  }

  &__filters-apply {
    background: $color-gold;
    border-color: $color-gold;
    color: $color-white;
  }
}

.catalog-filter-overlay-enter-active,
.catalog-filter-overlay-leave-active {
  transition: opacity 0.25s ease;
}

.catalog-filter-overlay-enter-from,
.catalog-filter-overlay-leave-to {
  opacity: 0;
}
</style>
