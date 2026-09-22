import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type {
  WishlistItem,
  WishlistItemInput,
  WishlistPersistedState
} from '~~/types/wishlist'
import { WISHLIST_STORAGE_KEY } from '~~/types/wishlist'

export type { WishlistItem, WishlistItemInput } from '~~/types/wishlist'

function isWishlistItem(value: unknown): value is WishlistItem {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    typeof item.id === 'string' &&
    typeof item.productId === 'string' &&
    typeof item.title === 'string' &&
    typeof item.unitPriceCents === 'number' &&
    Number.isFinite(item.unitPriceCents) &&
    item.unitPriceCents >= 0 &&
    (item.slug === undefined || typeof item.slug === 'string') &&
    (item.imageUrl === undefined || typeof item.imageUrl === 'string') &&
    (item.category === undefined || typeof item.category === 'string')
  )
}

function parsePersistedWishlist(raw: string | null): WishlistItem[] | null {
  if (!raw) return null
  try {
    const data = JSON.parse(raw) as WishlistPersistedState | WishlistItem[]
    const items = Array.isArray(data)
      ? data
      : data?.version === 1 && Array.isArray(data.items)
        ? data.items
        : null
    if (!items) return null
    return items
      .filter(isWishlistItem)
      .map((item) => ({
        ...item,
        unitPriceCents: Math.round(item.unitPriceCents)
      }))
  } catch {
    return null
  }
}

export const useWishlistStore = defineStore('wishlist', () => {
  const items = ref<WishlistItem[]>([])
  const hydrated = ref(false)

  const count = computed(() => items.value.length)
  const isEmpty = computed(() => items.value.length === 0)

  function has(productId: string) {
    return items.value.some((item) => item.id === productId)
  }

  function add(input: WishlistItemInput) {
    if (has(input.id)) return
    items.value.push({
      id: input.id,
      productId: input.productId,
      slug: input.slug,
      title: input.title,
      unitPriceCents: Math.round(input.unitPriceCents),
      imageUrl: input.imageUrl,
      category: input.category
    })
  }

  function remove(productId: string) {
    const index = items.value.findIndex((item) => item.id === productId)
    if (index !== -1) items.value.splice(index, 1)
  }

  function toggle(input: WishlistItemInput) {
    if (has(input.id)) {
      remove(input.id)
      return false
    }
    add(input)
    return true
  }

  function clear() {
    items.value = []
  }

  function hydrate() {
    if (!import.meta.client || hydrated.value) return
    const restored = parsePersistedWishlist(
      localStorage.getItem(WISHLIST_STORAGE_KEY)
    )
    if (restored) items.value = restored
    hydrated.value = true
  }

  function persist() {
    if (!import.meta.client || !hydrated.value) return
    const payload: WishlistPersistedState = {
      version: 1,
      items: items.value
    }
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(payload))
  }

  function startPersisting() {
    if (!import.meta.client) return
    watch(
      items,
      () => {
        persist()
      },
      { deep: true }
    )
  }

  return {
    items,
    hydrated,
    count,
    isEmpty,
    has,
    add,
    remove,
    toggle,
    clear,
    hydrate,
    startPersisting
  }
})
