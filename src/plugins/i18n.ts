import adminFR from '@/assets/translations/fr/admin.json'
import associationsFR from '@/assets/translations/fr/associations.json'
import authFR from '@/assets/translations/fr/auth.json'
import commonFR from '@/assets/translations/fr/common.json'
import dashboardFR from '@/assets/translations/fr/dashboard.json'
import headerFR from '@/assets/translations/fr/header.json'
import homeFR from '@/assets/translations/fr/home.json'
import projectFR from '@/assets/translations/fr/projects.json'

import adminEN from '@/assets/translations/en/admin.json'
import associationsEN from '@/assets/translations/en/associations.json'
import authEN from '@/assets/translations/en/auth.json'
import commonEN from '@/assets/translations/en/common.json'
import dashboardEN from '@/assets/translations/en/dashboard.json'
import headerEN from '@/assets/translations/en/header.json'
import homeEN from '@/assets/translations/en/home.json'
import projectEN from '@/assets/translations/en/projects.json'

import { createI18n } from 'vue-i18n'

export const i18nInstance = createI18n({
  legacy: false,
  locale: 'fr', // Locale par défaut
  fallbackLocale: 'fr',
  messages: {
    fr: {
      ...headerFR,
      ...authFR,
      ...commonFR,
      ...associationsFR,
      ...adminFR,
      ...projectFR,
      ...dashboardFR,
      ...homeFR
    },
    en: {
      ...headerEN,
      ...authEN,
      ...commonEN,
      ...associationsEN,
      ...adminEN,
      ...projectEN,
      ...dashboardEN,
      ...homeEN
    }
  }
})

export const i18n = i18nInstance.global // Workaround for translate text outside components
