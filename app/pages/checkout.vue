<script setup lang="ts">
import { formatRubFromCents } from '~/utils/formatMoney'

const cart = useCartStore()
const route = useRoute()
const config = useRuntimeConfig()

useHead({
  title: 'Оформление заказа',
  meta: [
    {
      name: 'description',
      content:
        'Оформление заказа в amateru.st через чекаут Яндекса: Яндекс Доставка, СДЭК и оплата.'
    }
  ]
})

const comment = ref('')
const submitError = ref('')
const submitting = ref(false)

const aborted = computed(() => route.query.pay === 'abort')
const checkoutReady = computed(() => Boolean(config.public.yandexPayMerchantId))

async function startYandexCheckout() {
  submitError.value = ''

  if (cart.isEmpty) {
    submitError.value = 'Корзина пуста'
    return
  }

  if (!checkoutReady.value) {
    submitError.value =
      'Чекаут Яндекса ещё не подключён. Добавьте merchant id в окружение.'
    return
  }

  submitting.value = true
  try {
    const result = await $fetch<{ paymentUrl: string }>('/api/checkout/session', {
      method: 'POST',
      body: {
        comment: comment.value,
        lines: cart.lines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity
        }))
      }
    })
    await navigateTo(result.paymentUrl, { external: true })
  } catch (err: unknown) {
    const fetchError = err as {
      data?: { data?: { errors?: { lines?: string; form?: string } }; message?: string }
      statusMessage?: string
    }
    submitError.value =
      fetchError.data?.data?.errors?.lines ||
      fetchError.data?.data?.errors?.form ||
      fetchError.data?.message ||
      fetchError.statusMessage ||
      'Не удалось открыть чекаут Яндекса. Попробуйте ещё раз.'
  } finally {
    submitting.value = false
  }
}
</script>

<template lang="pug">
.checkout-page
  .container
    nav.checkout-page__breadcrumbs(aria-label="Хлебные крошки")
      NuxtLink.checkout-page__crumb(to="/cart") Корзина
      span.checkout-page__crumb-sep /
      span.checkout-page__crumb-current Оформление

    header.checkout-page__header
      h1.checkout-page__title Оформление заказа
      p.checkout-page__lead
        | Доставку, пункт выдачи и оплату выберете на стороне Яндекса.
        | Доступны Яндекс Доставка и СДЭК.

    .checkout-page__banner(v-if="aborted" role="status")
      | Оформление прервано. Корзина сохранена — можно попробовать снова.

    .checkout-page__empty(v-if="cart.hydrated && cart.isEmpty")
      p.checkout-page__empty-text В корзине пока ничего нет — добавить товары можно в каталоге.
      NuxtLink.checkout-page__empty-cta(to="/catalog") Перейти в каталог

    .checkout-page__layout(v-else-if="!cart.isEmpty")
      .checkout-page__form
        section.checkout-section
          h2.checkout-section__title Как проходит заказ
          p.checkout-section__note
            | После кнопки «Перейти к оформлению» откроется чекаут Яндекса:
            | контакты подставятся из Яндекс ID, там же выбираются ПВЗ
            | Яндекс Доставки или СДЭК и оплата картой, СБП или Сплитом.
            |
            NuxtLink.checkout-section__link(to="/delivery") Подробнее о доставке

        section.checkout-section
          h2.checkout-section__title Комментарий
          .checkout-field
            label.checkout-field__label(for="checkout-comment")
              | Пожелания к заказу
              span.checkout-field__optional  необязательно
            textarea#checkout-comment.checkout-field__textarea(
              v-model="comment"
              name="comment"
              rows="3"
              maxlength="500"
            )

      aside.checkout-page__summary
        .checkout-page__summary-card
          h2.checkout-page__summary-title Ваш заказ
          ul.checkout-summary-list
            li.checkout-summary-line(v-for="line in cart.lines" :key="line.id")
              span.checkout-summary-line__title {{ line.title }}
              span.checkout-summary-line__meta ×{{ line.quantity }}
              span.checkout-summary-line__price {{ formatRubFromCents(line.unitPriceCents * line.quantity) }}

          .checkout-page__summary-rows
            .checkout-page__summary-row
              span Товары
              span {{ formatRubFromCents(cart.subtotalCents) }}
            .checkout-page__summary-row
              span Доставка
              span Считает Яндекс
            .checkout-page__summary-row.checkout-page__summary-row--total
              span Товары к оплате
              strong {{ formatRubFromCents(cart.subtotalCents) }}

          p.checkout-page__submit-error(v-if="submitError" role="alert") {{ submitError }}

          button.checkout-page__submit(
            type="button"
            :disabled="submitting || !checkoutReady"
            @click="startYandexCheckout"
          ) {{ submitting ? 'Открываем Яндекс…' : 'Перейти к оформлению' }}

          p.checkout-page__hint(v-if="!checkoutReady")
            | Для редиректа нужны ключи Яндекс Пэй в окружении.

          NuxtLink.checkout-page__back(to="/cart") Вернуться в корзину
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;

.checkout-page {
  padding-block: clamp(1.3rem, 3vw, 2.2rem) clamp(2.5rem, 5vw, 4rem);

  &__breadcrumbs {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    color: $color-ink-55;
    font-size: 0.92rem;
  }

  &__crumb {
    color: inherit;
    text-decoration: none;

    &:hover {
      color: $color-gold;
    }
  }

  &__header {
    margin-bottom: clamp(1.25rem, 3vw, 2rem);
  }

  &__title {
    margin: 0;
    font-size: clamp(1.75rem, 4vw, 2.4rem);
    font-weight: 600;
    letter-spacing: 0.02em;
    line-height: 1.15;
  }

  &__lead {
    margin: 0.45rem 0 0;
    color: $color-ink-55;
    font-size: 0.98rem;
  }

  &__banner {
    margin-bottom: 1.25rem;
    padding: 0.85rem 1rem;
    border-radius: 0.85rem;
    background: $color-paper;
    border: 1px solid $color-ink-10;
    font-size: 0.92rem;
  }

  &__empty {
    display: grid;
    gap: 1.25rem;
    justify-items: start;
    max-width: 28rem;
    padding-block: clamp(2rem, 6vw, 4rem);
  }

  &__empty-text {
    margin: 0;
    font-size: 1.05rem;
    line-height: 1.55;
    color: $color-ink-55;
  }

  &__empty-cta,
  &__submit {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 2.6rem;
    padding-inline: 1.25rem;
    border: none;
    border-radius: 999px;
    background: $color-gold;
    color: $color-white;
    text-decoration: none;
    font-size: 0.9rem;
    letter-spacing: 0.04em;
    cursor: pointer;

    &:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
  }

  &__layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(16rem, 22rem);
    gap: clamp(1.5rem, 4vw, 2.75rem);
    align-items: start;
  }

  &__form {
    display: grid;
    gap: 1.75rem;
  }

  &__summary-card {
    position: sticky;
    top: 5.5rem;
    display: grid;
    gap: 0.9rem;
    padding: 1.25rem 1.35rem 1.35rem;
    border: 1px solid $color-ink-10;
    border-radius: 1rem;
    background: $color-white;
  }

  &__summary-title {
    margin: 0;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: $color-ink-55;
  }

  &__summary-rows {
    display: grid;
    gap: 0.55rem;
    padding-top: 0.35rem;
    border-top: 1px solid $color-ink-8;
  }

  &__summary-row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    font-size: 0.95rem;
    color: $color-ink-55;

    &--total {
      color: $color-ink;

      strong {
        font-size: 1.25rem;
      }
    }
  }

  &__hint {
    margin: 0;
    font-size: 0.82rem;
    line-height: 1.4;
    color: $color-ink-55;
  }

  &__submit {
    width: 100%;
  }

  &__submit-error {
    margin: 0;
    font-size: 0.85rem;
    color: #8a3a32;
  }

  &__back {
    text-align: center;
    font-size: 0.88rem;
    color: $color-ink;
    text-decoration: none;
    justify-self: center;

    &:hover {
      color: $color-gold;
    }
  }
}

.checkout-section {
  display: grid;
  gap: 0.9rem;

  &__title {
    margin: 0;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: $color-ink-55;
  }

  &__note {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.45;
    color: $color-ink-55;
  }

  &__link {
    color: $color-gold;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.checkout-field {
  display: grid;
  gap: 0.35rem;

  &__label {
    font-size: 0.88rem;
  }

  &__optional {
    color: $color-ink-55;
  }

  &__textarea {
    width: 100%;
    box-sizing: border-box;
    padding: 0.7rem 0.85rem;
    border: 1px solid $color-ink-12;
    border-radius: 0.7rem;
    background: $color-white;
    font: inherit;
    font-size: 0.95rem;
    resize: vertical;
    min-height: 5rem;

    &:focus {
      outline: 2px solid $color-gold;
      outline-offset: 1px;
      border-color: transparent;
    }
  }
}

.checkout-summary-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.65rem;
}

.checkout-summary-line {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 0.5rem 0.75rem;
  font-size: 0.88rem;

  &__title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__meta {
    color: $color-ink-55;
  }

  &__price {
    font-weight: 600;
  }
}

@media (width <= 900px) {
  .checkout-page {
    &__layout {
      grid-template-columns: 1fr;
    }

    &__summary-card {
      position: static;
    }
  }
}
</style>
