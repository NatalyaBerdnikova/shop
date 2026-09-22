// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: ['~/assets/styles/global.scss'],

  app: {
    head: {
      title: 'amateru.st',
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '16x16',
          href: '/favicon-16x16.png'
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          href: '/favicon-32x32.png'
        },
        {
          rel: 'apple-touch-icon',
          sizes: '180x180',
          href: '/apple-touch-icon.png'
        },
        { rel: 'manifest', href: '/site.webmanifest' }
      ],
      meta: [{ name: 'theme-color', content: '#ffffff' }]
    }
  },

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
    yandexOauthClientId: '',
    yandexOauthClientSecret: '',
    yandexPayMerchantId: '',
    yandexPayApiKey: '',
    yandexPaySandbox: true,
    yandexPayMethods: 'CARD,SPLIT',
    /** НДС для чека: 1 = 20%, 6 = не облагается. */
    yandexPayReceiptTax: 6,
    yandexWarehouseLocality: 'Москва',
    yandexWarehouseRegion: 'Москва',
    yandexWarehouseZip: '',
    yandexWarehouseStreet: '',
    yandexWarehouseBuilding: '',
    yandexWarehouseAddressLine: '',
    yandexWarehousePhone: '',
    yandexWarehouseContactName: 'amateru.st',
    yandexWarehouseEmail: '',
    public: {
      siteUrl: '',
      yandexPayMerchantId: '',
      yandexPaySandbox: true,
      yandexOauthClientId: ''
    }
  }
})
