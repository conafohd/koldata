<template>
  <div>
    {{ selectedAssociation }}
  </div>
</template>
<script setup lang="ts">
import type { Association } from '@/models/interfaces/Association'
import { useApplicationStore } from '@/stores/applicationStore'
import { useAssociationsStore } from '@/stores/associationsStore'
import { onBeforeMount, onMounted, ref, type Ref } from 'vue'
import { useRoute } from 'vue-router'

const applicationStore = useApplicationStore()
const associationsStore = useAssociationsStore()
const selectedAssociation: Ref<Association | null> = ref(null)

const route = useRoute()

onBeforeMount(async () => {
  if (associationsStore.associationsList.length === 0) {
    await associationsStore.getAssociationsList()
  }

  selectedAssociation.value =
    associationsStore.associationsList.find(
      (association: Association) => association.id === parseInt(route.params.id as string, 10),
    ) || ({} as Association)
})

onMounted(() => {
  applicationStore.isLoading = false
})
</script>
