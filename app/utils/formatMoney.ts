/** Форматирует сумму в копейках как рубли (без копеек). */
export function formatRubFromCents(cents: number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(cents / 100)
}

/** Цена витрины: число или «по запросу», если ещё не задана. */
export function formatProductPrice(priceCents: number | null | undefined) {
  if (priceCents == null || !Number.isFinite(priceCents) || priceCents < 0) {
    return 'Цена по запросу'
  }
  return formatRubFromCents(priceCents)
}
