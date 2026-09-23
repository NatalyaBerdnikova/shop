export interface HeroSlide {
  src: string
  alt: string
  /** Короткий текст для оверлея и объявления screen reader */
  headline: string
  /** Подзаголовок под headline */
  tagline?: string
}

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    src: '/decor/cover.png',
    alt: 'Обложка amateru.st',
    headline: 'amateru.st'
  },
  {
    src: '/decor/cover.png',
    alt: 'Обложка amateru.st',
    headline: 'amateru.st'
  }
]
