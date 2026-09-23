<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const statusCode = computed(
  () => props.error?.statusCode ?? props.error?.status ?? 500
)

const isNotFound = computed(() => statusCode.value === 404)

const title = computed(() =>
  isNotFound.value ? 'Страница не найдена' : 'Что-то пошло не так'
)

const lead = computed(() => {
  if (isNotFound.value) {
    if (props.error?.statusMessage === 'Товар не найден') {
      return 'Такого товара нет в каталоге. Возможно, ссылка устарела или изделие сняли с продажи.'
    }
    return 'Ссылка устарела или адрес указан неверно. Загляните в каталог — там всё на месте.'
  }
  return (
    props.error?.statusMessage ||
    'Мы уже знаем о проблеме. Попробуйте вернуться на главную.'
  )
})

useHead(() => ({
  title: isNotFound.value ? 'Страница не найдена' : `Ошибка ${statusCode.value}`,
  meta: [
    {
      name: 'description',
      content: isNotFound.value
        ? 'Страница не найдена — amateru.st'
        : 'Произошла ошибка — amateru.st'
    },
    ...(isNotFound.value
      ? [{ name: 'robots', content: 'noindex' } as const]
      : [])
  ]
}))

function goTo(path: string) {
  clearError({ redirect: path })
}

const route = useRoute()
watch(
  () => route.fullPath,
  (to, from) => {
    if (from && to !== from && useError().value) {
      clearError()
    }
  }
)
</script>

<template lang="pug">
div
  NuxtLayout
    .error-page(:class="{ 'error-page--not-found': isNotFound }")
      .container
        .error-page__cover(v-if="isNotFound")
          picture.error-page__picture
            source(
              media="(max-width: 719px)"
              srcset="/404_mobile.png"
              width="1024"
              height="1024"
            )
            img.error-page__image(
              src="/404.png"
              width="1376"
              height="768"
              alt="404"
              decoding="async"
              fetchpriority="high"
            )

        .error-page__inner
          p.error-page__code(v-if="!isNotFound" aria-hidden="true") {{ statusCode }}
          h1.error-page__title {{ title }}
          p.error-page__lead {{ lead }}
          .error-page__actions
            button.error-page__cta(
              type="button"
              @click="goTo('/catalog')"
            ) В каталог
            button.error-page__secondary(
              type="button"
              @click="goTo('/')"
            ) На главную
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;

.error-page {
  padding-block: clamp(2.5rem, 10vw, 6rem) clamp(3rem, 8vw, 5rem);

  &--not-found {
    padding-block: clamp(1rem, 3vw, 1.75rem) clamp(2.5rem, 6vw, 4rem);
  }

  &__cover {
    display: flex;
    justify-content: center;
    margin-bottom: clamp(1.25rem, 3vw, 2rem);
  }

  &__picture {
    display: block;
    width: min(100%, 52rem);
  }

  &__image {
    display: block;
    width: 100%;
    height: auto;
  }

  &__inner {
    max-width: 28rem;
  }

  &--not-found &__inner {
    margin-inline: auto;
    text-align: center;
  }

  &--not-found &__actions {
    justify-content: center;
  }

  &--not-found &__lead {
    margin-inline: auto;
  }

  &__code {
    margin: 0 0 0.65rem;
    font-size: clamp(3.5rem, 12vw, 5.5rem);
    font-weight: 700;
    letter-spacing: 0.04em;
    line-height: 1;
    color: $color-ink-8;
  }

  &__title {
    margin: 0;
    font-size: clamp(1.6rem, 4vw, 2.1rem);
    font-weight: 600;
    letter-spacing: 0.02em;
    line-height: 1.2;
    color: $color-ink;
  }

  &__lead {
    margin: 0.85rem 0 0;
    font-size: 1.05rem;
    line-height: 1.55;
    color: $color-ink-55;
    max-width: 36ch;
  }

  &__actions {
    margin-top: 1.5rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem 1.1rem;
    align-items: center;
  }

  &__cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 2.6rem;
    padding-inline: 1.25rem;
    border: none;
    border-radius: 999px;
    background: $color-gold;
    color: $color-white;
    font: inherit;
    font-size: 0.9rem;
    letter-spacing: 0.03em;
    cursor: pointer;
  }

  &__secondary {
    margin: 0;
    padding: 0;
    border: none;
    background: transparent;
    color: $color-ink-55;
    font: inherit;
    font-size: 0.9rem;
    cursor: pointer;

    &:hover {
      color: $color-gold;
    }
  }
}
</style>
