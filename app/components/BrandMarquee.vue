<template lang="pug">
section.brand-marquee(aria-label="Анонс: Цитадель, новый дроп на сайте")
  .brand-marquee__viewport
    .brand-marquee__track
      .brand-marquee__group(
        v-for="group in 2"
        :key="group"
        :aria-hidden="group === 2 ? true : undefined"
      )
        template(v-for="i in 10" :key="`${group}-${i}`")
          span.brand-marquee__chunk
            strong.brand-marquee__brand Цитадель
            span.brand-marquee__msg  новый дроп уже на сайте
            span.brand-marquee__sep(aria-hidden="true") ·
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;

.brand-marquee {
  overflow: hidden;
  background: $color-bg-dark;
  color: $color-paper;
  border-block: 1px solid $color-white-8;

  &__viewport {
    overflow: hidden;
  }

  &__track {
    display: flex;
    width: max-content;
    animation: brand-marquee-scroll 32s linear infinite;
  }

  &__group {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    padding-block: 0.65rem;
  }

  &__chunk {
    display: inline-flex;
    align-items: baseline;
    gap: 0.35rem;
    padding-inline: 1.25rem;
    white-space: nowrap;
  }

  &__brand {
    font-size: 0.8rem;
    font-weight: 650;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: $color-gold;
  }

  &__msg {
    font-size: 0.8rem;
    letter-spacing: 0.06em;
    opacity: 0.92;
  }

  &__sep {
    margin-left: 0.15rem;
    opacity: 0.35;
  }
}

@keyframes brand-marquee-scroll {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(-50%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .brand-marquee__track {
    animation: none;
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
    max-width: 56rem;
    margin-inline: auto;
    padding-inline: clamp(1rem, 4vw, 2rem);
    row-gap: 0.35rem;
  }

  .brand-marquee__group[aria-hidden='true'] {
    display: none;
  }

  .brand-marquee__group {
    flex-wrap: wrap;
    justify-content: center;
    padding-block: 0.75rem;
  }

  .brand-marquee__chunk {
    padding-inline: 0.5rem;
  }
}
</style>
