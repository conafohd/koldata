import type { Notification } from "@/models/interfaces/Notifications"
import { NavigationTabsService } from "@/services/NavigationService"
import { defineStore } from "pinia"
import { ref, type Ref } from "vue"
import { useRoute } from "vue-router"
import { useDisplay } from 'vuetify'

export const useApplicationStore = defineStore('application', () => {
  const { mobile } = useDisplay()
  const activeTab = ref(0)
  const notificationPile: Ref<Notification[]> = ref([])
  const isLoading = ref(false)
  const route = useRoute()
  function setActiveTab() {
    NavigationTabsService.getTabsNumberFromRoute(
      route,
      activeTab.value
    )
  }

  return { mobile, activeTab, setActiveTab, notificationPile, isLoading }
})
