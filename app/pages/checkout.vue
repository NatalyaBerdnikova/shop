<script setup lang="ts">
import { formatRubFromCents } from '~/utils/formatMoney'
import {
  calcOrderTotals,
  validateCheckoutForm,
  type CheckoutFieldErrors
} from '#shared/orderValidation'
import type {
  CheckoutFormInput,
  Order,
  PaymentMethod
} from '~~/types/order'
import {
  CARRIER_LABELS,
  FREE_DELIVERY_MIN_CENTS,
  PAYMENT_LABELS
} from '~~/types/order'

const cart = useCartStore()
const auth = useAuthStore()
const router = useRouter()
const config = useRuntimeConfig()

useHead({
  title: 'Оформление заказа',
  meta: [
    {
      name: 'description',
      content:
        'Оформление заказа в Цитадель: контакты, доставка до ПВЗ Яндекс или СДЭК и оплата.'
    }
  ]
})

const form = reactive<CheckoutFormInput>({
  contact: {
    name: '',
    phone: '',
    email: ''
  },
  delivery: {
    carrier: 'yandex',
    city: 'Москва',
    pickupPoint: null
  },
  paymentMethod: 'card_online',
  comment: ''
})

watch(
  () => auth.user,
  (user) => {
    if (!user) return
    if (!form.contact.name.trim()) {
      form.contact.name =
        `${user.firstName} ${user.lastName}`.trim() || user.displayName
    }
    if (!form.contact.phone.trim() && user.phone) {
      form.contact.phone = user.phone
    }
    if (!form.contact.email.trim() && user.email) {
      form.contact.email = user.email
    }
  },
  { immediate: true }
)

const errors = ref<CheckoutFieldErrors>({})
const submitError = ref('')
const submitting = ref(false)
const touched = ref(false)

const freeDeliveryMinCents = computed(
  () => Number(config.public.freeDeliveryMinCents) || FREE_DELIVERY_MIN_CENTS
)

const totals = computed(() =>
  calcOrderTotals(cart.lines, form.delivery.pickupPoint)
)

const paymentOptions = (Object.keys(PAYMENT_LABELS) as PaymentMethod[]).map(
  (value) => ({
    value,
    label: PAYMENT_LABELS[value]
  })
)

const remainingToFree = computed(() =>
  Math.max(0, freeDeliveryMinCents.value - totals.value.subtotalCents)
)

function fieldError(key: keyof CheckoutFieldErrors) {
  return touched.value ? errors.value[key] : undefined
}

function validate() {
  errors.value = validateCheckoutForm(form)
  return Object.keys(errors.value).length === 0
}

watch(
  form,
  () => {
    if (touched.value) validate()
  },
  { deep: true }
)

async function onSubmit() {
  touched.value = true
  submitError.value = ''

  if (cart.isEmpty) {
    submitError.value = 'Корзина пуста'
    return
  }

  if (!validate()) return

  submitting.value = true
  try {
    const order = await $fetch<Order>('/api/orders', {
      method: 'POST',
      body: {
        ...form,
        lines: cart.lines
      }
    })
    cart.clear()
    await router.push(`/order/${order.id}`)
  } catch (err: unknown) {
    const fetchError = err as {
      data?: { data?: { errors?: CheckoutFieldErrors }; message?: string }
      statusMessage?: string
    }
    const apiErrors = fetchError.data?.data?.errors
    if (apiErrors) {
      errors.value = apiErrors
      submitError.value =
        apiErrors.form || apiErrors.lines || 'Проверьте поля формы'
    } else {
      submitError.value =
        fetchError.statusMessage ||
        fetchError.data?.message ||
        'Не удалось оформить заказ. Попробуйте ещё раз.'
    }
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
      p.checkout-page__lead Доставка только до пункта выдачи — Яндекс Доставка или СДЭК.

    .checkout-page__empty(v-if="cart.hydrated && cart.isEmpty")
      p.checkout-page__empty-text В корзине пока ничего нет — добавить товары можно в каталоге.
      NuxtLink.checkout-page__empty-cta(to="/catalog") Перейти в каталог

    form.checkout-page__layout(
      v-else-if="!cart.isEmpty"
      novalidate
      @submit.prevent="onSubmit"
    )
      .checkout-page__form
        section.checkout-section
          h2.checkout-section__title Контакты
          .checkout-fields
            .checkout-field
              label.checkout-field__label(for="checkout-name") Имя
              input#checkout-name.checkout-field__input(
                v-model="form.contact.name"
                type="text"
                name="name"
                autocomplete="name"
                required
                :aria-invalid="Boolean(fieldError('name'))"
              )
              p.checkout-field__error(v-if="fieldError('name')") {{ fieldError('name') }}

            .checkout-field
              label.checkout-field__label(for="checkout-phone") Телефон
              input#checkout-phone.checkout-field__input(
                v-model="form.contact.phone"
                type="tel"
                name="phone"
                autocomplete="tel"
                inputmode="tel"
                placeholder="+7 900 000-00-00"
                required
                :aria-invalid="Boolean(fieldError('phone'))"
              )
              p.checkout-field__error(v-if="fieldError('phone')") {{ fieldError('phone') }}

            .checkout-field
              label.checkout-field__label(for="checkout-email") Email
              input#checkout-email.checkout-field__input(
                v-model="form.contact.email"
                type="email"
                name="email"
                autocomplete="email"
                required
                :aria-invalid="Boolean(fieldError('email'))"
              )
              p.checkout-field__error(v-if="fieldError('email')") {{ fieldError('email') }}

        section.checkout-section
          h2.checkout-section__title Доставка до ПВЗ
          p.checkout-section__note
            | Самовывоза из мастерской нет. Выберите службу и пункт выдачи на карте.
            |
            NuxtLink.checkout-section__link(to="/delivery") Подробнее о доставке

          CheckoutPvzPicker(
            v-model:city="form.delivery.city"
            v-model:carrier="form.delivery.carrier"
            v-model:pickup-point="form.delivery.pickupPoint"
            :subtotal-cents="totals.subtotalCents"
            :error="fieldError('city') || fieldError('pickupPoint') || fieldError('carrier')"
          )

        section.checkout-section
          h2.checkout-section__title Оплата
          .checkout-options(role="radiogroup" aria-label="Способ оплаты")
            label.checkout-option(
              v-for="option in paymentOptions"
              :key="option.value"
              :class="{ 'checkout-option--active': form.paymentMethod === option.value }"
            )
              input.checkout-option__input(
                v-model="form.paymentMethod"
                type="radio"
                name="paymentMethod"
                :value="option.value"
              )
              span.checkout-option__body
                span.checkout-option__title {{ option.label }}

          p.checkout-field__error(v-if="fieldError('paymentMethod')") {{ fieldError('paymentMethod') }}
          p.checkout-online-note(v-if="form.paymentMethod === 'card_online'")
            | Онлайн-эквайринг подключим отдельно (ЮKassa / Yandex Pay). Сейчас заказ сохраняется как «к оплате».

        section.checkout-section
          h2.checkout-section__title Комментарий
          .checkout-field
            label.checkout-field__label(for="checkout-comment")
              | Пожелания к заказу
              span.checkout-field__optional  необязательно
            textarea#checkout-comment.checkout-field__textarea(
              v-model="form.comment"
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
              span {{ formatRubFromCents(totals.subtotalCents) }}
            .checkout-page__summary-row
              span Доставка
              span
                template(v-if="!form.delivery.pickupPoint") — выберите ПВЗ
                template(v-else-if="totals.freeDeliveryApplied") Бесплатно
                template(v-else) {{ formatRubFromCents(totals.deliveryCents) }}
            .checkout-page__summary-row.checkout-page__summary-row--total
              span Итого
              strong {{ formatRubFromCents(totals.totalCents) }}

          p.checkout-page__free(
            v-if="remainingToFree > 0"
          )
            | До бесплатной доставки осталось {{ formatRubFromCents(remainingToFree) }}
          p.checkout-page__free(v-else) Бесплатная доставка уже действует

          p.checkout-page__pvz(v-if="form.delivery.pickupPoint")
            strong {{ CARRIER_LABELS[form.delivery.pickupPoint.carrier] }}
            br
            | {{ form.delivery.pickupPoint.name }}
            br
            | {{ form.delivery.pickupPoint.address }}

          p.checkout-page__submit-error(v-if="submitError" role="alert") {{ submitError }}

          button.checkout-page__submit(
            type="submit"
            :disabled="submitting"
          ) {{ submitting ? 'Оформляем…' : 'Подтвердить заказ' }}

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

  &__free,
  &__pvz {
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

.checkout-fields {
  display: grid;
  gap: 0.85rem;
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

  &__input,
  &__textarea {
    width: 100%;
    box-sizing: border-box;
    padding: 0.7rem 0.85rem;
    border: 1px solid $color-ink-12;
    border-radius: 0.7rem;
    background: $color-white;
    font: inherit;
    font-size: 0.95rem;

    &:focus {
      outline: 2px solid $color-gold;
      outline-offset: 1px;
      border-color: transparent;
    }

    &[aria-invalid='true'] {
      border-color: #8a3a32;
    }
  }

  &__textarea {
    resize: vertical;
    min-height: 5rem;
  }

  &__error {
    margin: 0;
    font-size: 0.8rem;
    color: #8a3a32;
  }
}

.checkout-options {
  display: grid;
  gap: 0.55rem;
}

.checkout-option {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border: 1px solid $color-ink-10;
  border-radius: 0.85rem;
  background: $color-white;
  cursor: pointer;

  &--active {
    border-color: $color-gold;
  }

  &__input {
    margin-top: 0.2rem;
    accent-color: $color-gold;
  }

  &__title {
    font-size: 0.95rem;
    font-weight: 600;
  }
}

.checkout-online-note {
  margin: 0;
  font-size: 0.88rem;
  color: $color-ink-55;
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
