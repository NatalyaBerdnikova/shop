<script setup lang="ts">
import {
  catalogProducts,
  categorySlugSet
} from '~/data/catalog'

useHead({
  title: 'Каталог',
  meta: [
    {
      name: 'description',
      content: 'Каталог украшений Цитадель: кольца, подвески, серьги, браслеты и другие коллекции.'
    }
  ]
})

const route = useRoute()
const router = useRouter()

const SORT_VALUES = ['new', 'price-asc', 'price-desc'] as const
type SortValue = (typeof SORT_VALUES)[number]

const DEFAULT_SORT: SortValue = 'new'

function parseSort(value: unknown): SortValue {
  const v = typeof value === 'string' ? value : ''
  return SORT_VALUES.includes(v as SortValue) ? (v as SortValue) : DEFAULT_SORT
}

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

const sort = ref<SortValue>(DEFAULT_SORT)

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
  if (sort.value !== DEFAULT_SORT) {
    query.sort = sort.value
  }
  router.replace({ path: route.path, query })
}

function applyRouteQuery() {
  const q = typeof route.query.q === 'string' ? route.query.q : ''
  searchInput.value = q
  searchQuery.value = q.trim()
  selectedCategorySlugs.value = filterValidSlugs(parseCatParam(route.query.cat))
  sort.value = parseSort(route.query.sort)
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

function setSort(value: SortValue) {
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

  if (sort.value === 'price-asc') {
    list.sort((a, b) => a.priceCents - b.priceCents)
  } else if (sort.value === 'price-desc') {
    list.sort((a, b) => b.priceCents - a.priceCents)
  } else {
    list.sort(
      (a, b) =>
        new Date(b.releasedAt).getTime() - new Date(a.releasedAt).getTime()
    )
  }

  return list
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
    .catalog-page__top
      .catalog-page__title-wrap
        p.catalog-page__eyebrow Каталог
        h1.catalog-page__title Украшения Цитадель
        p.catalog-page__subtitle
          | Выберите категорию и добавьте товары в корзину прямо из каталога.
      button.catalog-page__filter-btn(
        type="button"
        @click="isFilterOpen = true"
      ) Фильтры

    .catalog-page__toolbar
      label.catalog-page__search-label
        span.catalog-page__search-hint Поиск по названию
        input.catalog-page__search-input(
          v-model="searchInput"
          type="search"
          name="q"
          placeholder="Например, кольцо или Luna"
          autocomplete="off"
          @input="onSearchInput"
          @keydown.enter.prevent="onSearchBlur"
          @blur="onSearchBlur"
        )

      .catalog-page__sort
        span.catalog-page__sort-label Сортировка
        .catalog-page__sort-buttons
          button.catalog-page__sort-btn(
            type="button"
            :class="{ 'catalog-page__sort-btn--active': sort === 'new' }"
            @click="setSort('new')"
          ) По новизне
          button.catalog-page__sort-btn(
            type="button"
            :class="{ 'catalog-page__sort-btn--active': sort === 'price-asc' }"
            @click="setSort('price-asc')"
          ) Цена ↑
          button.catalog-page__sort-btn(
            type="button"
            :class="{ 'catalog-page__sort-btn--active': sort === 'price-desc' }"
            @click="setSort('price-desc')"
          ) Цена ↓

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

  &__top {
    display: flex;
    gap: 1rem;
    align-items: end;
    justify-content: space-between;
    margin-bottom: 0.8rem;
  }

  &__eyebrow {
    margin: 0;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: $color-ink-55;
  }

  &__title {
    margin: 0.2rem 0 0;
    font-size: clamp(1.5rem, 4vw, 2.2rem);
    line-height: 1.15;
  }

  &__subtitle {
    margin: 0.45rem 0 0;
    color: $color-ink-55;
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

  &__toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: flex-end;
    margin-bottom: 0.75rem;
  }

  &__search-label {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    flex: 1 1 16rem;
    min-width: min(100%, 18rem);
  }

  &__search-hint {
    font-size: 0.72rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: $color-ink-55;
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
    flex-direction: column;
    gap: 0.35rem;
    flex: 1 1 14rem;
  }

  &__sort-label {
    font-size: 0.72rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: $color-ink-55;
  }

  &__sort-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
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
      background: rgb(154 123 79 / 12%);
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
