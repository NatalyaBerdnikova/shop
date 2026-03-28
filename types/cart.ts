/** Одна позиция в корзине (SKU / вариант товара). */
export interface CartLine {
  /** Уникальный идентификатор строки (например productId или productId:variantId). */
  id: string
  productId: string
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
