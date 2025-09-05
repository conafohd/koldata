import type { Notification } from "@/models/interfaces/Notifications"
import { NavigationTabsService } from "@/services/NavigationService"
import { defineStore } from "pinia"
import { computed, ref, type Ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute } from "vue-router"
import { useDisplay } from 'vuetify'

export const useApplicationStore = defineStore('application', () => {
  const { mobile } = useDisplay()
  const activeTab = ref(0)
  const notificationPile: Ref<Notification[]> = ref([])
  const isLoading = ref(false)
  const route = useRoute()
  function setActiveTab() {
    activeTab.value = NavigationTabsService.getTabsNumberFromRoute(
      route,
      activeTab.value
    )
  }
  const { locale } = useI18n()
  const currentLocale = computed(() => locale.value)

  const changeLanguage = (lang: string) => {
    locale.value = lang
  }

  return { mobile, activeTab, setActiveTab, notificationPile, isLoading, currentLocale, changeLanguage }
})
