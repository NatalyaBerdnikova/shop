<script setup lang="ts">
import {
  footerServiceLinks,
  primaryNavLinks
} from '~/data/navigation'

const catalogLinks = computed(() =>
  primaryNavLinks.filter(
    (l) => l.to !== '/' && l.to !== '/kontakty'
  )
)
</script>

<template lang="pug">
footer.site-footer(role="contentinfo")
  .site-footer__main
    .container.site-footer__grid
      .site-footer__brand-block
        NuxtLink.site-footer__logo(to="/") Сияние
        p.site-footer__about
          | Ювелирные украшения из серебра и золота: кольца, подвески, серьги и браслеты.
          | Ручная работа и внимание к деталям.

      .site-footer__col
        h2.site-footer__heading Каталог
        nav.site-footer__nav(aria-label="Каталог в подвале")
          NuxtLink.site-footer__link(
            v-for="link in catalogLinks"
            :key="link.to"
            :to="link.to"
          ) {{ link.label }}

      .site-footer__col
        h2.site-footer__heading Покупателям
        nav.site-footer__nav(aria-label="Сервис")
          NuxtLink.site-footer__link(
            v-for="link in footerServiceLinks"
            :key="link.to"
            :to="link.to"
          ) {{ link.label }}

      address.site-footer__col.site-footer__contacts
        h2.site-footer__heading Контакты
        p
          a.site-footer__contact-link(href="tel:+78001234567") +7 (800) 123-45-67
        p
          a.site-footer__contact-link(href="mailto:hello@siyanie.example") hello@siyanie.example
        p.site-footer__hours Ежедневно, 10:00–21:00

  .site-footer__bottom
    .container.site-footer__bottom-inner
      p.site-footer__copy © {{ new Date().getFullYear() }} Сияние. Все права защищены.
      p.site-footer__legal
        NuxtLink.site-footer__mini-link(to="/privacy") Политика конфиденциальности
        span.site-footer__dot(aria-hidden="true") ·
        NuxtLink.site-footer__mini-link(to="/offer") Публичная оферта
</template>

<style scoped lang="scss">
$gold: #9a7b4f;
$ink: #1a1918;
$muted: rgb(26 25 24 / 58%);

.site-footer {
  margin-top: auto;
  background: #0f0f10;
  color: rgb(250 249 247 / 88%);
}

.site-footer__main {
  padding-block: clamp(2.5rem, 6vw, 4rem);
}

.site-footer__grid {
  display: grid;
  gap: clamp(2rem, 4vw, 3rem);

  @media (min-width: 640px) {
    grid-template-columns: 1.4fr 1fr 1fr 1fr;
  }
}

.site-footer__brand-block {
  @media (min-width: 640px) {
    grid-column: span 1;
  }
}

.site-footer__logo {
  display: inline-block;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  color: #faf9f7;

  &:hover {
    color: $gold;
  }

  &:focus-visible {
    outline: 2px solid $gold;
    outline-offset: 4px;
  }
}

.site-footer__about {
  margin: 0;
  max-width: 28ch;
  font-size: 0.9rem;
  line-height: 1.55;
  color: $muted;
}

.site-footer__heading {
  margin: 0 0 1rem;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgb(250 249 247 / 45%);
}

.site-footer__nav {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.site-footer__link {
  font-size: 0.9rem;
  text-decoration: none;
  color: rgb(250 249 247 / 88%);
  transition: color 0.2s ease;

  &:hover {
    color: $gold;
  }

  &:focus-visible {
    outline: 2px solid $gold;
    outline-offset: 2px;
  }
}

.site-footer__contacts {
  margin: 0;
  font-size: 0.9rem;
  font-style: normal;
  line-height: 1.6;
  color: $muted;

  p {
    margin: 0 0 0.5rem;
  }
}

.site-footer__contact-link {
  color: inherit;
  text-decoration: none;

  &:hover {
    color: $gold;
  }

  &:focus-visible {
    outline: 2px solid $gold;
    outline-offset: 2px;
  }
}

.site-footer__hours {
  margin-top: 0.35rem !important;
  font-size: 0.85rem;
  color: rgb(250 249 247 / 45%);
}

.site-footer__bottom {
  border-top: 1px solid rgb(250 249 247 / 8%);
}

.site-footer__bottom-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-block: 1.25rem;
  font-size: 0.8rem;
  color: rgb(250 249 247 / 45%);
}

.site-footer__copy {
  margin: 0;
}

.site-footer__legal {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}

.site-footer__mini-link {
  color: inherit;
  text-decoration: none;

  &:hover {
    color: $gold;
  }

  &:focus-visible {
    outline: 2px solid $gold;
    outline-offset: 2px;
  }
}

.site-footer__dot {
  opacity: 0.5;
}
</style>
