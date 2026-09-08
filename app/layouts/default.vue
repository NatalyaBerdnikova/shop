<template lang="pug">
.site-layout
  AppHeader
  main.site-layout__main
    slot
  AppFooter
  AuthLoginModal
</template>

<style scoped lang="scss">
.site-layout {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
}

.site-layout__main {
  flex: 1;
}
</style>
