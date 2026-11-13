<script setup lang="ts">
import { shopContacts, socialLinks } from '~/data/contacts'

useHead({
  title: 'Возврат',
  meta: [
    {
      name: 'description',
      content:
        'Если с заказом amateru.st что-то не так — напишите в Telegram или VK.'
    }
  ]
})
</script>

<template lang="pug">
InfoPage(
  title="Возврат"
  lead="Отдельного кабинета возвратов на сайте нет. Если с заказом что-то не так, напишите продавцу."
)
  section.info-block
    h2.info-block__title При получении
    p.info-block__text При получении проверьте упаковку и комплектность.

  section.info-block
    h2.info-block__title Если есть повреждения
    p.info-block__text
      | Зафиксируйте это при получении и напишите нам, приложив фото.

  section.info-block
    h2.info-block__title Как написать
    p.info-block__text
      template(v-for="link in socialLinks" :key="link.href")
        a(
          :href="link.href"
          target="_blank"
          rel="noopener noreferrer"
        ) {{ link.label }}
        br
      a(v-if="shopContacts.email" :href="shopContacts.emailHref") {{ shopContacts.email }}
</template>
