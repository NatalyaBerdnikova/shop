/** Копейки → строка рублей с двумя знаками, как ждёт API Яндекс Пэй. */
export function formatRubAmount(cents: number) {
  return (Math.round(cents) / 100).toFixed(2)
}

/** Строка рублей («123.45») → копейки. */
export function parseRubAmountToCents(amount: string | number | undefined) {
  if (amount == null || amount === '') return 0
  const value = typeof amount === 'number' ? amount : Number(amount)
  if (!Number.isFinite(value)) return 0
  return Math.round(value * 100)
}

export function sumLineCents(
  lines: Array<{ unitPriceCents: number; quantity: number }>
) {
  return lines.reduce(
    (sum, line) => sum + line.unitPriceCents * line.quantity,
    0
  )
}
