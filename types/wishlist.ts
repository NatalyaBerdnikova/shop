/** Позиция в избранном (снимок карточки на момент добавления). */
export interface WishlistItem {
  id: string
  productId: string
  slug?: string
  title: string
  unitPriceCents: number
  imageUrl?: string
  category?: string
}

export type WishlistItemInput = WishlistItem

export const WISHLIST_STORAGE_KEY = 'amateru:wishlist:v1'

export interface WishlistPersistedState {
  version: 1
  items: WishlistItem[]
}
