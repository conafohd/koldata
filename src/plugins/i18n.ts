import adminFR from '@/assets/translations/fr/admin.json'
import associationsFR from '@/assets/translations/fr/associations.json'
import authFR from '@/assets/translations/fr/auth.json'
import commonFR from '@/assets/translations/fr/common.json'
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
      ...commonFR,
      ...associationsFR,
      ...adminFR
    }
  }
})

export const i18n = i18nInstance.global //Workaround for translate text outside components
