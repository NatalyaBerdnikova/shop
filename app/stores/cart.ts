import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { CartLine, CartLineInput } from '~~/types/cart'

export type { CartLine, CartLineInput } from '~~/types/cart'

export const useCartStore = defineStore('cart', () => {
  const lines = ref<CartLine[]>([])

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
    const qty = input.quantity ?? 1
    if (qty <= 0) return

    const existing = lines.value.find((line) => line.id === input.id)
    if (existing) {
      existing.quantity += qty
      return
    }

    lines.value.push({
      id: input.id,
      productId: input.productId,
      title: input.title,
      unitPriceCents: input.unitPriceCents,
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

    line.quantity = quantity
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

  return {
    lines,
    lineCount,
    totalQuantity,
    subtotalCents,
    isEmpty,
    addItem,
    setQuantity,
    increment,
    removeLine,
    clear
  }
})
