import type { Notification } from "@/models/interfaces/Notifications"
import { defineStore } from "pinia"
import { ref, type Ref } from "vue"
import { useDisplay } from 'vuetify'

export const useApplicationStore = defineStore('application', () => {
  const { mobile } = useDisplay()
  const activeTab = ref(0)
  const notificationPile: Ref<Notification[]> = ref([])
  const isLoading = ref(false)

  return { mobile, activeTab, notificationPile, isLoading }
})
