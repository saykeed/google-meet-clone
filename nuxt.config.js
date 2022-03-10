export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  ssr: false,
  target: 'server',
  loadingIndicator: {
    name: 'circle',
    color: '#3B8070',
    background: 'white'
  },
  head: {
    title: 'google-meet-clone',
    meta: [
      {charset: 'utf-8'},
      {name: 'viewport', content: 'width=device-width, initial-scale=1'},
      {hid: 'description', name: 'description', content: ''},
      {name: 'format-detection', content: 'telephone=no'}
    ],
    link: [
      {rel: 'icon', type: 'image/x-icon', href: '/favicon.ico'},
      {rel: 'preconnect', type: 'image/x-icon', href: 'https://fonts.googleapis.com'},
      {rel: 'preconnect', type: 'image/x-icon', href: 'https://fonts.gstatic.com', crossOrigin: true},
      {
        rel: 'stylesheet',
        type: 'image/x-icon',
        href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500&family=Rubik:wght@300;400;500;600;700;800;900&display=swap'
      },
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '~/assets/style.css',
    '~/assets/responsive.css',
    '~/assets/override.css',
    '~/assets/base.css',
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    'bootstrap-vue/nuxt',
    '@nuxtjs/axios',
    '@nuxtjs/pwa',
    '@nuxtjs/firebase'
  ],
  firebase: {
    config: {
      apiKey: "AIzaSyCApCt_K_pFmgH4PwP9L5A-OutJxieJnww",
      authDomain: "fir-rtc-3e174.firebaseapp.com",
      projectId: "fir-rtc-3e174",
      storageBucket: "fir-rtc-3e174.appspot.com",
      messagingSenderId: "459987118456",
      appId: "1:459987118456:web:93b9f2829b36712f85c08d",
      measurementId: "G-B21SCPVY6V"
    },
    services: {
      firestore: true
    },
    lazy: true
  },

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    // Workaround to avoid enforcing hard-coded localhost:3000: https://github.com/nuxt-community/axios-module/issues/308
    baseURL: '/',
  },

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      lang: 'en'
    }
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {}
}
