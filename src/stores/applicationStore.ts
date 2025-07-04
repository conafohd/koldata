import { defineStore } from "pinia"
import { ref } from "vue"
import { useDisplay } from 'vuetify'

export const useApplicationStore = defineStore('application', () => {
  const { mobile } = useDisplay()
  const activeTab = ref(0)

  return { mobile, activeTab }
})
