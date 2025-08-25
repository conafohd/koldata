import vuetify from '@/plugins/vuetify'
import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import { i18nInstance } from './plugins/i18n'
import router from './router'

const app = createApp(App)
app.config.globalProperties.$base = import.meta.env.BASE_URL

export const pinia = createPinia()
app.use(pinia)
app.use(vuetify)
app.use(router)
app.use(i18nInstance)

app.mount('#app')
