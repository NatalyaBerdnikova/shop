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

  cookieControl: {
    barPosition: 'bottom-full',
    closeModalOnClickOutside: true,
    isAcceptNecessaryButtonEnabled: true,
    isControlButtonEnabled: true,
    declineAllAcceptsNecessary: true,
    locales: ['ru'],
    localeTexts: {
      ru: {
        bannerTitle: 'Мы используем cookie',
        bannerDescription:
          'Нужны для работы сайта и входа в аккаунт. Вы можете принять все или только необходимые.',
        accept: 'Принять все',
        decline: 'Только необходимые',
        manageCookies: 'Настроить',
        cookiesNecessary: 'Необходимые',
        cookiesOptional: 'Дополнительные'
      }
    },
    colors: {
      barBackground: '#0f0f10',
      barButtonBackground: '#4d0e12',
      barButtonColor: '#ffffff',
      barButtonHoverBackground: '#ffffff',
      barButtonHoverColor: '#1a1918',
      barTextColor: '#faf9f7',
      checkboxActiveBackground: '#4d0e12',
      checkboxActiveCircleBackground: '#ffffff',
      checkboxDisabledBackground: '#d4d0c8',
      checkboxDisabledCircleBackground: '#ffffff',
      checkboxInactiveBackground: '#1a1918',
      checkboxInactiveCircleBackground: '#ffffff',
      controlButtonBackground: '#0f0f10',
      controlButtonHoverBackground: '#1a1918',
      controlButtonIconColor: '#ffffff',
      controlButtonIconHoverColor: '#ffffff',
      focusRingColor: '#4d0e12',
      modalBackground: '#ffffff',
      modalButtonBackground: '#4d0e12',
      modalButtonColor: '#ffffff',
      modalButtonHoverBackground: '#1a1918',
      modalButtonHoverColor: '#ffffff',
      modalOverlay: '#0f0f10',
      modalOverlayOpacity: 0.55,
      modalTextColor: '#1a1918',
      modalUnsavedColor: '#4d0e12'
    },
    cookies: {
      necessary: [
        {
          id: 'ncc',
          name: 'Согласие на cookie',
          description:
            'Сохраняет ваш выбор по файлам cookie (ncc_c, ncc_e).',
          targetCookieIds: ['ncc_c', 'ncc_e']
        },
        {
          id: 'auth',
          name: 'Вход в аккаунт',
          description:
            'Сессия Яндекс ID и защита входа (amateru_auth_v1, amateru_oauth_state).',
          targetCookieIds: ['amateru_auth_v1', 'amateru_oauth_state'],
          links: {
            '/privacy': 'Политика конфиденциальности'
          }
        }
      ],
      optional: []
    }
  },

  nitro: {
    storage: {
      orders: {
        driver: 'fs',
        base: './.data/orders'
      }
    }
  },

  runtimeConfig: {
    /** PostgreSQL: NUXT_DATABASE_URL или DATABASE_URL */
    databaseUrl: '',
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
