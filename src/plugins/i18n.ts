import authFR from '@/assets/translations/fr/auth.json'
import formsFR from '@/assets/translations/fr/forms.json'
import headerFR from '@/assets/translations/fr/header.json'
import { createI18n } from 'vue-i18n'

export const i18nInstance = createI18n({
  legacy: false,
  locale: 'fr',
  fallbackLocale: 'fr',
  messages: {
    fr: {
      ...headerFR,
      ...authFR,
      ...formsFR
    }
  }
})

export const i18n = i18nInstance.global //Workaround for translate text outside components
