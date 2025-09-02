import { NotificationType } from "@/models/enums/NotificationType"
import type { Association, AssociationUpdate } from "@/models/interfaces/Association"
import { i18n } from "@/plugins/i18n"
import { AssociationDbService } from "@/services/associations/AssociationDbService"
import { addNotification } from "@/services/NotificationsService"
import { defineStore } from "pinia"
import { ref, type Ref } from "vue"
import { useRouter } from "vue-router"
import { useAdminStore } from "./adminStore"
import { useAuthenticationStore } from "./authStore"

export const useAssociationsStore = defineStore('associations', () => {
  const associationsList: Ref<Association[]> = ref([])
  const updateslist: Ref<AssociationUpdate[]> = ref([])
  const newAssociationsList: Ref<Association[]> = ref([])
  const router = useRouter()
  const associationToEdit: Ref<Association | null> = ref(null)
  const associationToCreate = ref(false)

  async function getAssociationsList() {
    try {
      const { associations, updates, newAssociations } = await AssociationDbService.getAssociations();
      associationsList.value = associations;
      updateslist.value = updates;
      newAssociationsList.value = newAssociations;
    } catch (error) {
      console.log('Error fetching associations:', error)
    }
  }

  function navigateToAssociation(associationId: string) {
    router.push({ name: 'association', params: { id: associationId } })
  }

  async function createAssociation(association: Association) {
    console.log(association)
    try {
      await AssociationDbService.createAssociation(association, useAuthenticationStore().isAdmin)
      associationToCreate.value = false
      await getAssociationsList()
    } catch (error) {
      console.error(error)
    }
  }

  function activeAssociationEdition(id: string) {
    const updateSubmission = updateslist.value.find(association => association.association_id === id)
    if (updateSubmission) {
      associationToEdit.value = updateSubmission
    } else {
      const association = associationsList.value.find(association => association.id === id)
      if (association) {
        associationToEdit.value = association
      } else {
        addNotification(i18n.t('associations.associationNotFound'), NotificationType.ERROR)
      }
    }
  }

  function activeNewAssociationEdition(id: string) {
        const association = newAssociationsList.value.find(association => association.id === id)
        if (association) {
            associationToEdit.value = association
        } else {
            addNotification(i18n.t('associations.associationNotFound'), NotificationType.ERROR)
        }
    }

  async function submitUpdate(association: AssociationUpdate) {
    try {
      await AssociationDbService.submitAssociationUpdate(association)
      await getAssociationsList()
      associationToEdit.value = null
    } catch (error) {
      console.error(error)
    }
  }

  async function refuseUpdate(id: number, raiseResult: boolean = true) {
    try {
      await AssociationDbService.removeAssociationUpdate(id, raiseResult)
      associationToEdit.value = null
      await getAssociationsList()
    } catch (error) {
      console.error(error)
    }
  }

  async function validateUpdate(association: Association) {
    try {
      await AssociationDbService.validateAssociationUpdate(association)
      if (associationToEdit.value!.waiting_for_validation) {
        await refuseUpdate(associationToEdit.value!.id as unknown as number, false)
      }
      await getAssociationsList()
      associationToEdit.value = null
    } catch (error) {
      console.error(error)
    }
  }

  async function validateNewAssociation(association: Association) {
    try {
      const id = await AssociationDbService.validateNewAssociation(association)
      await refuseNewAssociation(associationToEdit.value?.id as unknown as number)
      associationToEdit.value = null
      await getAssociationsList()
      await useAdminStore().setMemberEditPermission(association.created_by, id)
    } catch (error) {
      console.error(error)
    }
  }

  async function refuseNewAssociation(id: number) {
        try {
            await AssociationDbService.removeNewAssociation(id, true)
            associationToEdit.value = null
            await getAssociationsList()
        } catch (error) {
            console.error(error)
        }
    }

  async function removeAssociation(id: string) {
    try {
      AssociationDbService.removeAssociation(id)
      await getAssociationsList()
    } catch (error) {
      console.error(error)
    }
  }

  return { associationsList, newAssociationsList, associationToEdit, associationToCreate, getAssociationsList, createAssociation, navigateToAssociation, activeAssociationEdition, submitUpdate, refuseUpdate, validateUpdate, validateNewAssociation, activeNewAssociationEdition, refuseNewAssociation, removeAssociation }
})
