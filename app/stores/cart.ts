import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { CartLine, CartLineInput, CartPersistedState } from '~~/types/cart'
import { CART_STORAGE_KEY } from '~~/types/cart'

export type { CartLine, CartLineInput } from '~~/types/cart'

const MAX_LINE_QUANTITY = 99

function isCartLine(value: unknown): value is CartLine {
  if (!value || typeof value !== 'object') return false
  const line = value as Record<string, unknown>
  return (
    typeof line.id === 'string' &&
    typeof line.productId === 'string' &&
    typeof line.title === 'string' &&
    typeof line.unitPriceCents === 'number' &&
    Number.isFinite(line.unitPriceCents) &&
    line.unitPriceCents >= 0 &&
    typeof line.quantity === 'number' &&
    Number.isInteger(line.quantity) &&
    line.quantity > 0 &&
    (line.slug === undefined || typeof line.slug === 'string') &&
    (line.imageUrl === undefined || typeof line.imageUrl === 'string')
  )
}

function parsePersistedCart(raw: string | null): CartLine[] | null {
  if (!raw) return null
  try {
    const data = JSON.parse(raw) as CartPersistedState | CartLine[]
    const lines = Array.isArray(data)
      ? data
      : data?.version === 1 && Array.isArray(data.lines)
        ? data.lines
        : null
    if (!lines) return null
    return lines
      .filter(isCartLine)
      .map((line) => ({
        ...line,
        quantity: Math.min(line.quantity, MAX_LINE_QUANTITY),
        unitPriceCents: Math.round(line.unitPriceCents)
      }))
  } catch {
    return null
  }
}

export const useCartStore = defineStore('cart', () => {
  const lines = ref<CartLine[]>([])
  const hydrated = ref(false)

  const lineCount = computed(() => lines.value.length)

  const totalQuantity = computed(() =>
    lines.value.reduce((sum, line) => sum + line.quantity, 0)
  )

  const subtotalCents = computed(() =>
    lines.value.reduce(
      (sum, line) => sum + line.unitPriceCents * line.quantity,
      0
    )
  )

  const isEmpty = computed(() => lines.value.length === 0)

  function addItem(input: CartLineInput) {
    const qty = Math.min(input.quantity ?? 1, MAX_LINE_QUANTITY)
    if (qty <= 0) return

    const existing = lines.value.find((line) => line.id === input.id)
    if (existing) {
      existing.quantity = Math.min(existing.quantity + qty, MAX_LINE_QUANTITY)
      if (input.slug && !existing.slug) existing.slug = input.slug
      if (input.imageUrl && !existing.imageUrl) existing.imageUrl = input.imageUrl
      return
    }

    lines.value.push({
      id: input.id,
      productId: input.productId,
      slug: input.slug,
      title: input.title,
      unitPriceCents: Math.round(input.unitPriceCents),
      quantity: qty,
      imageUrl: input.imageUrl
    })
  }

  function setQuantity(lineId: string, quantity: number) {
    const line = lines.value.find((l) => l.id === lineId)
    if (!line) return

    if (quantity <= 0) {
      removeLine(lineId)
      return
    }

    line.quantity = Math.min(Math.floor(quantity), MAX_LINE_QUANTITY)
  }

  function increment(lineId: string, delta = 1) {
    const line = lines.value.find((l) => l.id === lineId)
    if (!line) return
    setQuantity(lineId, line.quantity + delta)
  }

  function removeLine(lineId: string) {
    const index = lines.value.findIndex((l) => l.id === lineId)
    if (index !== -1) {
      lines.value.splice(index, 1)
    }
  }

  function clear() {
    lines.value = []
  }

  function hydrate() {
    if (!import.meta.client || hydrated.value) return
    const restored = parsePersistedCart(localStorage.getItem(CART_STORAGE_KEY))
    if (restored) {
      lines.value = restored
    }
    hydrated.value = true
  }

  function persist() {
    if (!import.meta.client || !hydrated.value) return
    const payload: CartPersistedState = {
      version: 1,
      lines: lines.value
    }
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(payload))
  }

  function startPersisting() {
    if (!import.meta.client) return
    watch(
      lines,
      () => {
        persist()
      },
      { deep: true }
    )
  }

  return {
    lines,
    hydrated,
    lineCount,
    totalQuantity,
    subtotalCents,
    isEmpty,
    addItem,
    setQuantity,
    increment,
    removeLine,
    clear,
    hydrate,
    startPersisting
  }
})
