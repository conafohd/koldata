import type { FormOperation } from "@/models/enums/FormOperation"
import { NotificationType } from "@/models/enums/NotificationType"
import type { Association } from "@/models/interfaces/Association"
import { i18n } from "@/plugins/i18n"
import { supabase } from "@/plugins/supabase"
import { addNotification } from "@/services/NotificationsService"
import { defineStore } from "pinia"
import { ref, type Ref } from "vue"
import { useRouter } from "vue-router"

export const useAssociationsStore = defineStore('associations', () => {
  const associationsList: Ref<Association[]> = ref([])
  const router = useRouter()
  const associationToEdit: Ref<Association | null> = ref(null)
  const editStatus: Ref<FormOperation | null> = ref(null)

  async function getAssociationsList() {
    const { data: associations, error } = await supabase.from('associations').select('*')
    if (error) {
        console.error('Error fetching data:', error)
        addNotification(i18n.t('associations.fetchError'), NotificationType.ERROR)
    } else {
        associationsList.value = associations
    }
  }

  function navigateToAssociation(associationId: number) {
    router.push({ name: 'association', params: { id: associationId } })
  }

  return { associationsList, associationToEdit, editStatus, getAssociationsList, navigateToAssociation }
})
