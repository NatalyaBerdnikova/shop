import {
  getCatalogProductById,
  catalogProducts
} from '../../app/data/catalog'
import type { CatalogProduct } from '../../app/data/catalog.types'
import { toCartLines } from '#shared/orderValidation'
import { parcelMeasurements } from '#shared/yandexPay'

export { catalogProducts }

export function resolveCatalogLine(productId: string, quantity: number) {
  const product = getCatalogProductById(productId)
  if (!product) return null
  return {
    product,
    quantity,
    measurements: parcelMeasurements(product)
  }
}

export function resolveCheckoutLines(
  lines: Array<{ productId: string; quantity: number }>
) {
  const resolved: Array<{
    product: CatalogProduct
    quantity: number
    measurements: ReturnType<typeof parcelMeasurements>
  }> = []
  const missing: string[] = []

  for (const line of lines) {
    const item = resolveCatalogLine(line.productId, line.quantity)
    if (!item) {
      missing.push(line.productId)
      continue
    }
    resolved.push(item)
  }

  if (missing.length) {
    return { ok: false as const, missing }
  }

  return {
    ok: true as const,
    items: resolved,
    cartLines: toCartLines(
      resolved.map(({ product, quantity }) => ({
        productId: product.id,
        slug: product.slug,
        title: product.title,
        unitPriceCents: product.priceCents,
        quantity,
        imageUrl: product.images[0]
      }))
    )
  }
}
