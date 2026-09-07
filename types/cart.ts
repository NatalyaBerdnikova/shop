/** Одна позиция в корзине (SKU / вариант товара). */
export interface CartLine {
  /** Уникальный идентификатор строки (например productId или productId:variantId). */
  id: string
  productId: string
  /** Слаг для ссылки на PDP; если нет — можно использовать productId. */
  slug?: string
  title: string
  /** Цена за единицу в минимальных единицах валюты (копейки), чтобы избежать float. */
  unitPriceCents: number
  quantity: number
  imageUrl?: string
}

/** Данные для добавления товара в корзину. */
export type CartLineInput = Omit<CartLine, 'quantity'> & {
  quantity?: number
}

export const CART_STORAGE_KEY = 'citadel:cart:v1'

export interface CartPersistedState {
  version: 1
  lines: CartLine[]
}
