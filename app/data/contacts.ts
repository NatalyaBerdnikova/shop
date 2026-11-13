/** Контакты и соцсети витрины. */
export const shopContacts = {
  phoneDisplay: '+7 (800) 123-45-67',
  phoneHref: 'tel:+78001234567',
  email: 'hello@amateru.st',
  emailHref: 'mailto:hello@amateru.st',
  hours: 'Ежедневно, 10:00–21:00',
  /** Подставьте реальные ссылки */
  telegramUrl: 'https://t.me/amateru_st',
  telegramLabel: 'Telegram',
  vkUrl: 'https://vk.com/amateru_st',
  vkLabel: 'VK'
} as const

export const socialLinks = [
  { label: shopContacts.telegramLabel, href: shopContacts.telegramUrl },
  { label: shopContacts.vkLabel, href: shopContacts.vkUrl }
] as const
