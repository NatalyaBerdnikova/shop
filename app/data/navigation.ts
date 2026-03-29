export interface NavLink {
  label: string
  to: string
}

/** Десктоп и мобильное меню — один и тот же набор ссылок */
export const primaryNavLinks: NavLink[] = [
  { label: 'Главная', to: '/' },
  { label: 'Кольца', to: '/koltsa' },
  { label: 'Подвески', to: '/podveski' },
  { label: 'Серьги', to: '/sergi' },
  { label: 'Браслеты', to: '/braslety' },
  { label: 'Броши', to: '/broshi' },
  { label: 'Коллекции', to: '/kollektsii' },
  { label: 'Контакты', to: '/kontakty' }
]

export const footerServiceLinks: NavLink[] = [
  { label: 'Доставка и оплата', to: '/dostavka' },
  { label: 'Уход за изделиями', to: '/ukhod' },
  { label: 'Возврат', to: '/vozvrat' }
]
