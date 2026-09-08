import type { DeliveryCarrier, PickupPointSelection } from '~~/types/order'

/** Демо-ПВЗ до подключения боевых виджетов Яндекс / СДЭК. */
export const mockPickupPoints: PickupPointSelection[] = [
  {
    id: 'yandex-msk-patriki',
    carrier: 'yandex',
    name: 'ПВЗ на Патриарших',
    city: 'Москва',
    address: 'Большой Патриарший пер., 8',
    schedule: 'ежедневно 10:00–21:00',
    deliveryCents: 29_000,
    etaDaysMin: 1,
    etaDaysMax: 2
  },
  {
    id: 'yandex-msk-tverskaya',
    carrier: 'yandex',
    name: 'Постамат у метро Тверская',
    city: 'Москва',
    address: 'ул. Тверская, 12',
    schedule: 'круглосуточно',
    deliveryCents: 29_000,
    etaDaysMin: 1,
    etaDaysMax: 2
  },
  {
    id: 'yandex-spb-nevsky',
    carrier: 'yandex',
    name: 'ПВЗ на Невском',
    city: 'Санкт-Петербург',
    address: 'Невский пр., 48',
    schedule: 'ежедневно 10:00–22:00',
    deliveryCents: 39_000,
    etaDaysMin: 2,
    etaDaysMax: 4
  },
  {
    id: 'cdek-msk-arbat',
    carrier: 'cdek',
    name: 'СДЭК Арбат',
    city: 'Москва',
    address: 'ул. Арбат, 20',
    schedule: 'пн–пт 10:00–20:00, сб–вс 11:00–18:00',
    deliveryCents: 32_000,
    etaDaysMin: 1,
    etaDaysMax: 3
  },
  {
    id: 'cdek-msk-taganka',
    carrier: 'cdek',
    name: 'СДЭК Таганка',
    city: 'Москва',
    address: 'ул. Таганская, 3',
    schedule: 'ежедневно 10:00–21:00',
    deliveryCents: 32_000,
    etaDaysMin: 1,
    etaDaysMax: 3
  },
  {
    id: 'cdek-spb-vasileostrov',
    carrier: 'cdek',
    name: 'СДЭК Васильевский остров',
    city: 'Санкт-Петербург',
    address: 'Средний пр. В.О., 36',
    schedule: 'ежедневно 10:00–20:00',
    deliveryCents: 42_000,
    etaDaysMin: 2,
    etaDaysMax: 5
  },
  {
    id: 'cdek-kzn-baumana',
    carrier: 'cdek',
    name: 'СДЭК Баумана',
    city: 'Казань',
    address: 'ул. Баумана, 58',
    schedule: 'ежедневно 10:00–21:00',
    deliveryCents: 49_000,
    etaDaysMin: 3,
    etaDaysMax: 6
  },
  {
    id: 'yandex-kzn-kremlevskaya',
    carrier: 'yandex',
    name: 'ПВЗ у Кремля',
    city: 'Казань',
    address: 'ул. Кремлёвская, 7',
    schedule: 'ежедневно 09:00–21:00',
    deliveryCents: 49_000,
    etaDaysMin: 3,
    etaDaysMax: 5
  }
]

export function findPickupPoints(
  carrier: DeliveryCarrier,
  city: string
): PickupPointSelection[] {
  const needle = city.trim().toLowerCase()
  if (!needle) return []
  return mockPickupPoints.filter(
    (point) =>
      point.carrier === carrier &&
      point.city.toLowerCase().includes(needle)
  )
}
