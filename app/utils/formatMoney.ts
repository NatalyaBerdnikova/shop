/** Форматирует сумму в копейках как рубли (без копеек). */
export function formatRubFromCents(cents: number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(cents / 100)
}
