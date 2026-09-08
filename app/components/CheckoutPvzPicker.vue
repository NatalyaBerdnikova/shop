<script setup lang="ts">
import { findPickupPoints } from '~/data/pickupPoints.mock'
import { formatRubFromCents } from '~/utils/formatMoney'
import type { DeliveryCarrier, PickupPointSelection } from '~~/types/order'
import { CARRIER_LABELS, FREE_DELIVERY_MIN_CENTS } from '~~/types/order'

const city = defineModel<string>('city', { required: true })
const carrier = defineModel<DeliveryCarrier>('carrier', { required: true })
const pickupPoint = defineModel<PickupPointSelection | null>('pickupPoint', {
  required: true
})

defineProps<{
  error?: string
  subtotalCents: number
}>()

const carriers = Object.keys(CARRIER_LABELS) as DeliveryCarrier[]

const points = computed(() =>
  findPickupPoints(carrier.value, city.value)
)

watch([city, carrier], () => {
  if (
    pickupPoint.value &&
    (pickupPoint.value.carrier !== carrier.value ||
      !points.value.some((p) => p.id === pickupPoint.value?.id))
  ) {
    pickupPoint.value = null
  }
})

function selectPoint(point: PickupPointSelection) {
  pickupPoint.value = point
}

function etaLabel(point: PickupPointSelection) {
  if (point.etaDaysMin == null || point.etaDaysMax == null) return ''
  if (point.etaDaysMin === point.etaDaysMax) {
    return `${point.etaDaysMin} дн.`
  }
  return `${point.etaDaysMin}–${point.etaDaysMax} дн.`
}

function priceLabel(point: PickupPointSelection, subtotalCents: number) {
  if (subtotalCents >= FREE_DELIVERY_MIN_CENTS) return 'Бесплатно'
  return formatRubFromCents(point.deliveryCents)
}
</script>

<template lang="pug">
.pvz-picker
  .pvz-picker__carriers(role="tablist" aria-label="Служба доставки")
    button.pvz-picker__carrier(
      v-for="item in carriers"
      :key="item"
      type="button"
      role="tab"
      :aria-selected="carrier === item"
      :class="{ 'pvz-picker__carrier--active': carrier === item }"
      @click="carrier = item"
    ) {{ CARRIER_LABELS[item] }}

  .pvz-picker__city
    label.pvz-picker__label(for="checkout-city") Город получения
    input#checkout-city.pvz-picker__input(
      v-model.trim="city"
      type="text"
      name="city"
      autocomplete="address-level2"
      placeholder="Москва, Санкт-Петербург, Казань…"
      required
    )

  p.pvz-picker__hint
    | Пока подключены демо-пункты. После настройки ключей здесь откроется виджет
    |
    | {{ CARRIER_LABELS[carrier] }}.

  .pvz-picker__empty(v-if="city && !points.length")
    | В «{{ city }}» пока нет демо-ПВЗ для {{ CARRIER_LABELS[carrier] }}.
    | Попробуйте Москву, Санкт-Петербург или Казань.

  ul.pvz-picker__list(
    v-else-if="points.length"
    role="listbox"
    aria-label="Пункты выдачи"
  )
    li(
      v-for="point in points"
      :key="point.id"
    )
      button.pvz-picker__point(
        type="button"
        role="option"
        :aria-selected="pickupPoint?.id === point.id"
        :class="{ 'pvz-picker__point--active': pickupPoint?.id === point.id }"
        @click="selectPoint(point)"
      )
        .pvz-picker__point-main
          span.pvz-picker__point-name {{ point.name }}
          span.pvz-picker__point-address {{ point.address }}
          span.pvz-picker__point-schedule(v-if="point.schedule") {{ point.schedule }}
        .pvz-picker__point-meta
          span.pvz-picker__point-price {{ priceLabel(point, subtotalCents) }}
          span.pvz-picker__point-eta(v-if="etaLabel(point)") {{ etaLabel(point) }}

  p.pvz-picker__error(v-if="error" role="alert") {{ error }}
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;

.pvz-picker {
  display: grid;
  gap: 0.9rem;

  &__carriers {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  &__carrier {
    height: 2.5rem;
    border: 1px solid $color-ink-12;
    border-radius: 999px;
    background: $color-white;
    color: $color-ink;
    font: inherit;
    font-size: 0.88rem;
    cursor: pointer;

    &--active {
      border-color: $color-gold;
      color: $color-gold;
      font-weight: 600;
    }

    &:focus-visible {
      outline: 2px solid $color-gold;
      outline-offset: 2px;
    }
  }

  &__city {
    display: grid;
    gap: 0.35rem;
  }

  &__label {
    font-size: 0.88rem;
  }

  &__input {
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
  }

  &__hint,
  &__empty,
  &__error {
    margin: 0;
    font-size: 0.85rem;
    line-height: 1.45;
    color: $color-ink-55;
  }

  &__error {
    color: #8a3a32;
  }

  &__list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: 0.55rem;
  }

  &__point {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.75rem;
    align-items: start;
    text-align: left;
    padding: 0.9rem 1rem;
    border: 1px solid $color-ink-10;
    border-radius: 0.85rem;
    background: $color-white;
    cursor: pointer;
    font: inherit;

    &--active {
      border-color: $color-gold;
    }

    &:focus-visible {
      outline: 2px solid $color-gold;
      outline-offset: 2px;
    }
  }

  &__point-main {
    display: grid;
    gap: 0.2rem;
    min-width: 0;
  }

  &__point-name {
    font-weight: 600;
    font-size: 0.95rem;
  }

  &__point-address,
  &__point-schedule,
  &__point-eta {
    font-size: 0.82rem;
    color: $color-ink-55;
  }

  &__point-meta {
    display: grid;
    gap: 0.2rem;
    justify-items: end;
  }

  &__point-price {
    font-weight: 600;
    font-size: 0.9rem;
    white-space: nowrap;
  }
}
</style>
