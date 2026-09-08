// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: ['~/assets/styles/global.scss'],

  // Чтобы Vue Language Tools / ts-plugin видел использование переменных в Pug-шаблонах
  typescript: {
    tsConfig: {
      vueCompilerOptions: {
        plugins: ['@vue/language-plugin-pug']
      }
    }
  },

  modules: [
    '@pinia/nuxt',
    '@nuxt/a11y',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@artmizu/nuxt-prometheus',
    '@dargmuesli/nuxt-cookie-control',
    '@nuxtjs/svg-sprite'
  ],

  nitro: {
    storage: {
      orders: {
        driver: 'fs',
        base: './.data/orders'
      }
    }
  },

  runtimeConfig: {
    // Серверные секреты (не попадают в клиент)
    cdekAccount: '',
    cdekSecurePassword: '',
    yandexDeliveryToken: '',
    yandexOauthClientId: '',
    yandexOauthClientSecret: '',
    // Публичные настройки виджетов / порогов
    public: {
      freeDeliveryMinCents: 800_000,
      yandexMapsApiKey: '',
      cdekWidgetServiceUrl: '/api/delivery/cdek-proxy',
      yandexOauthClientId: ''
    }
  }
})
