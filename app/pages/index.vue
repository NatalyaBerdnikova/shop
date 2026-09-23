<script setup lang="ts">
import { getPopularProducts } from '~/data/catalog'

useHead({
  title: 'Главная',
  meta: [
    {
      name: 'description',
      content: 'Интернет-магазин: новые коллекции и удобная доставка.'
    }
  ]
})

const popularProducts = getPopularProducts(10)
</script>

<template lang="pug">
main
  HeroImageSlider
  BrandMarquee
  CatalogProductSlider(
    title="Самые популярные"
    :products="popularProducts"
  )
</template>
