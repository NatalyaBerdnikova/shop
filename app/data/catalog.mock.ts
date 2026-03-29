/**
 * Мок-данные каталога (демо для разработки и витрины).
 * Замените на загрузку с API, когда бэкенд будет готов.
 */
import type { CatalogProduct } from './catalog.types'

export const mockCatalogProducts: CatalogProduct[] = [
  {
    id: 'ring-aurora',
    slug: 'ring-aurora',
    title: 'Кольцо Aurora',
    categorySlug: 'rings',
    category: 'Кольца',
    material: 'Серебро 925',
    priceCents: 129900,
    releasedAt: '2025-11-02',
    images: [
      'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&w=900&q=80'
    ],
    description: 'Минималистичное кольцо с мягким сиянием полированной поверхности для ежедневных образов.',
    details: ['Вес: 4.1 г', 'Ширина шинки: 3 мм', 'Ручная полировка']
  },
  {
    id: 'ring-nocturne',
    slug: 'ring-nocturne',
    title: 'Кольцо Nocturne',
    categorySlug: 'rings',
    category: 'Кольца',
    material: 'Серебро, оксидирование',
    priceCents: 118500,
    releasedAt: '2025-12-01',
    images: [
      'https://images.unsplash.com/photo-1603561596112-e2390eefeea4?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80'
    ],
    description: 'Кольцо с контрастным оксидированием и графичным профилем, вдохновленное ночной архитектурой.',
    details: ['Вес: 4.6 г', 'Ширина шинки: 4 мм', 'Оксидированная фактура']
  },
  {
    id: 'pendant-luna',
    slug: 'pendant-luna',
    title: 'Подвеска Luna',
    categorySlug: 'pendants',
    category: 'Подвески',
    material: 'Серебро, эмаль',
    priceCents: 89900,
    releasedAt: '2025-12-10',
    images: [
      'https://images.unsplash.com/photo-1611085582972-efab67d2f4cc?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=80'
    ],
    description: 'Лаконичная подвеска в форме тонкого полумесяца с эмалевым акцентом.',
    details: ['Длина цепи: 45 см', 'Размер подвески: 16 мм', 'Надежный карабин']
  },
  {
    id: 'pendant-nova',
    slug: 'pendant-nova',
    title: 'Подвеска Nova',
    categorySlug: 'pendants',
    category: 'Подвески',
    material: 'Серебро 925',
    priceCents: 102400,
    releasedAt: '2026-01-05',
    images: [
      'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1611085582972-efab67d2f4cc?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=80'
    ],
    description: 'Подвеска с объемным профилем и зеркальной обработкой для выразительного акцента.',
    details: ['Длина цепи: 50 см', 'Размер подвески: 18 мм', 'Покрытие от потемнения']
  },
  {
    id: 'earrings-vela',
    slug: 'earrings-vela',
    title: 'Серьги Vela',
    categorySlug: 'earrings',
    category: 'Серьги',
    material: 'Позолоченное серебро',
    priceCents: 114900,
    releasedAt: '2025-10-18',
    images: [
      'https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1619119069152-a2b331eb392a?auto=format&fit=crop&w=900&q=80'
    ],
    description: 'Пара серег с плавным изгибом и теплым золотистым тоном, подходящая для вечерних образов.',
    details: ['Высота: 22 мм', 'Тип замка: английский', 'Гипоаллергенное покрытие']
  },
  {
    id: 'earrings-mira',
    slug: 'earrings-mira',
    title: 'Серьги Mira',
    categorySlug: 'earrings',
    category: 'Серьги',
    material: 'Серебро 925',
    priceCents: 98900,
    releasedAt: '2025-11-20',
    images: [
      'https://images.unsplash.com/photo-1619119069152-a2b331eb392a?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=900&q=80'
    ],
    description: 'Легкие серьги с чистой геометрией для повседневной носки и делового стиля.',
    details: ['Высота: 18 мм', 'Тип замка: пусет', 'Вес пары: 3.8 г']
  },
  {
    id: 'bracelet-orbit',
    slug: 'bracelet-orbit',
    title: 'Браслет Orbit',
    categorySlug: 'bracelets',
    category: 'Браслеты',
    material: 'Серебро 925',
    priceCents: 139900,
    releasedAt: '2025-09-05',
    images: [
      'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1633810545646-90ad7b1300b8?auto=format&fit=crop&w=900&q=80'
    ],
    description: 'Массивный браслет с гибким звеном и архитектурной формой для заметного акцента на запястье.',
    details: ['Длина: 18-21 см', 'Тип застежки: коробчатая', 'Вес: 12.4 г']
  },
  {
    id: 'bracelet-helix',
    slug: 'bracelet-helix',
    title: 'Браслет Helix',
    categorySlug: 'bracelets',
    category: 'Браслеты',
    material: 'Серебро, родий',
    priceCents: 125000,
    releasedAt: '2025-12-18',
    images: [
      'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1633810545646-90ad7b1300b8?auto=format&fit=crop&w=900&q=80'
    ],
    description: 'Браслет с ритмичным плетением и родиевым покрытием для холодного металлического блеска.',
    details: ['Длина: 17-20 см', 'Тип застежки: карабин', 'Защитное родирование']
  },
  {
    id: 'chain-flow',
    slug: 'chain-flow',
    title: 'Цепь Flow',
    categorySlug: 'chains',
    category: 'Цепи',
    material: 'Серебро 925',
    priceCents: 154900,
    releasedAt: '2026-01-12',
    images: [
      'https://images.unsplash.com/photo-1611107683227-e9060eccd846?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1598560917808-97f2014c7f8d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=900&q=80'
    ],
    description: 'Цепь с выразительным рельефом звена и плотной посадкой по шее.',
    details: ['Длина: 42 см', 'Толщина звена: 4.5 мм', 'Надежный замок-карабин']
  },
  {
    id: 'chain-aria',
    slug: 'chain-aria',
    title: 'Цепь Aria',
    categorySlug: 'chains',
    category: 'Цепи',
    material: 'Серебро 925',
    priceCents: 87900,
    releasedAt: '2025-07-30',
    images: [
      'https://images.unsplash.com/photo-1598560917808-97f2014c7f8d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1611107683227-e9060eccd846?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=900&q=80'
    ],
    description: 'Легкая цепь с деликатным плетением, хорошо сочетается с подвесками.',
    details: ['Длина: 45 см', 'Толщина звена: 2.5 мм', 'Полированное серебро']
  },
  {
    id: 'brooch-flora',
    slug: 'brooch-flora',
    title: 'Брошь Flora',
    categorySlug: 'brooches',
    category: 'Броши',
    material: 'Серебро, перламутр',
    priceCents: 97900,
    releasedAt: '2025-08-22',
    images: [
      'https://images.unsplash.com/photo-1612177343582-665b79733ea5?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1573408300885-58f8d6c8f2b4?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1596944948862-4d7d6e5234f2?auto=format&fit=crop&w=900&q=80'
    ],
    description: 'Брошь с перламутровой вставкой и мягким органичным силуэтом.',
    details: ['Размер: 34 × 22 мм', 'Тип крепления: булавка', 'Вставка: перламутр']
  },
  {
    id: 'brooch-iris',
    slug: 'brooch-iris',
    title: 'Брошь Iris',
    categorySlug: 'brooches',
    category: 'Броши',
    material: 'Серебро, фианиты',
    priceCents: 110200,
    releasedAt: '2025-10-03',
    images: [
      'https://images.unsplash.com/photo-1596944948862-4d7d6e5234f2?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1612177343582-665b79733ea5?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1573408300885-58f8d6c8f2b4?auto=format&fit=crop&w=900&q=80'
    ],
    description: 'Изящная брошь с дорожкой фианитов и выразительным floral-мотивом.',
    details: ['Размер: 28 × 20 мм', 'Тип крепления: булавка', 'Вставки: фианиты']
  }
]
