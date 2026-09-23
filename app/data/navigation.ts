export interface NavLink {
  label: string
  to: string
}

/** Десктоп и мобильное меню — один и тот же набор ссылок */
export const primaryNavLinks: NavLink[] = [
  { label: 'Каталог', to: '/catalog' },
  { label: 'Доставка и оплата', to: '/delivery' },
  { label: 'Контакты', to: '/contacts' }
]

export const footerServiceLinks: NavLink[] = [
  { label: 'Каталог', to: '/catalog' },
  { label: 'Избранное', to: '/wishlist' },
  { label: 'Доставка и оплата', to: '/delivery' },
  { label: 'Возврат', to: '/return' }
]
