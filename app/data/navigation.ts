export interface NavLink {
  label: string
  to: string
}

/** Десктоп и мобильное меню — один и тот же набор ссылок */
export const primaryNavLinks: NavLink[] = [
  { label: 'Каталог', to: '/catalog' },
  { label: 'Акции', to: '/sale' },
  { label: 'Подборки', to: '/collections' },
  { label: 'Доставка и оплата', to: '/delivery' },
  { label: 'Контакты', to: '/contacts' },
  { label: 'Подарочные карты', to: '/gift-cards' }
]

export const footerServiceLinks: NavLink[] = [
  { label: 'Избранное', to: '/wishlist' },
  { label: 'Доставка и оплата', to: '/delivery' },
  { label: 'Уход за изделиями', to: '/care' },
  { label: 'Возврат', to: '/return' }
]
