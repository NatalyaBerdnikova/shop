<script setup lang="ts">
defineProps<{
  title: string
  lead: string
}>()
</script>

<template lang="pug">
.info-page
  .container
    header.info-page__header
      h1.info-page__title {{ title }}
      p.info-page__lead {{ lead }}
    .info-page__sections
      slot
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;

.info-page {
  padding-block: clamp(1.5rem, 4vw, 2.5rem) clamp(2.5rem, 6vw, 4.5rem);

  &__header {
    max-width: 40rem;
    margin-bottom: clamp(1.75rem, 4vw, 2.75rem);
  }

  &__title {
    margin: 0;
    font-size: clamp(1.8rem, 4vw, 2.5rem);
    font-weight: 600;
    letter-spacing: 0.02em;
    line-height: 1.15;
  }

  &__lead {
    margin: 0.7rem 0 0;
    font-size: 1.05rem;
    line-height: 1.5;
    color: $color-ink-55;
  }

  &__sections {
    display: grid;
    gap: 1rem;
    max-width: 46rem;
  }
}
</style>

<style lang="scss">
@use '~/assets/styles/variables' as *;

.info-page {
  .info-block {
    padding: 1.25rem 1.35rem;
    border: 1px solid $color-ink-10;
    border-radius: 1rem;
    background: $color-white;
  }

  .info-block__title {
    margin: 0 0 0.65rem;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: $color-ink-55;
  }

  .info-block__text {
    margin: 0 0 0.7rem;
    font-size: 0.98rem;
    line-height: 1.55;
    color: $color-ink;

    &:last-child {
      margin-bottom: 0;
    }
  }

  a {
    color: $color-ink;
    text-underline-offset: 0.15em;

    &:hover {
      color: $color-gold;
    }
  }
}
</style>
