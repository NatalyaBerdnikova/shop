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
    src: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1920&q=80',
    alt: 'Просторный зал магазина с рядами одежды на вешалках',
    headline: 'Стиль на каждый день',
    tagline: 'Подборка базового гардероба сезона'
  },
  {
    src: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1920&q=80',
    alt: 'Аксессуары и детали образа крупным планом',
    headline: 'Детали, которые замечают',
    tagline: 'Аксессуары и уход'
  },
  {
    src: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1920&q=80',
    alt: 'Уютный шоурум с мягким светом и полками с товарами',
    headline: 'Уютный шопинг онлайн',
    tagline: 'Доставка по всей стране'
  }
]
