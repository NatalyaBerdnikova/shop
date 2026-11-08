<script setup lang="ts">
import { shopContacts } from '~/data/contacts'

useHead({
  title: 'Возврат',
  meta: [
    {
      name: 'description',
      content:
        'Что делать при получении заказа amateru.st, если упаковка повреждена или комплект не сходится.'
    }
  ]
})
</script>

<template lang="pug">
InfoPage(
  title="Возврат"
  lead="Отдельного кабинета возвратов на сайте нет. Если с заказом что-то не так, напишите нам и укажите номер заказа."
)
  section.info-block
    h2.info-block__title При получении
    p.info-block__text При получении проверьте упаковку и комплектность.

  section.info-block
    h2.info-block__title Если есть повреждения
    p.info-block__text
      | Зафиксируйте это с сотрудником пункта выдачи и напишите нам, приложив фото и номер заказа.

  section.info-block
    h2.info-block__title Срок хранения
    p.info-block__text
      | Если заказ не забрали в срок хранения, повторная отправка согласовывается отдельно.

  section.info-block
    h2.info-block__title Как написать
    p.info-block__text
      a(:href="shopContacts.phoneHref") {{ shopContacts.phoneDisplay }}
      br
      a(:href="shopContacts.emailHref") {{ shopContacts.email }}
      br
      | {{ shopContacts.hours }}
    p.info-block__text
      NuxtLink(to="/delivery") Доставка и оплата
</template>
