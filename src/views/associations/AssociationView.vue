<template>
  <div class="Association" v-if="selectedAssociation">
    <div class="Association__header">
      <div class="d-flex align-center">
        <v-btn variant="text" icon="$arrowLeft" to="/associations" color="main-blue" />
        <h2 class="Associations__title ml-2">{{ selectedAssociation.nom }}</h2>
        <v-chip v-if="selectedAssociation.acronyme" class="ml-2" color="main-grey">
          {{ selectedAssociation.acronyme }}
        </v-chip>
        <v-btn
          :color="authStore.isAdmin ? 'main-purple' : 'main-blue'"
          class="ml-6"
          flat
          v-if="hasPermission"
          prepend-icon="$squareEditOutline"
          @click="editAssociation"
        >
          {{ $t('associations.edit') }}
        </v-btn>
        <v-tooltip :text="$t('admin.disclaimer')">
          <template v-slot:activator="{ props }">
            <v-icon
              v-bind="props"
              icon="$timerEditOutline"
              :color="authStore.isAdmin ? 'main-purple' : 'main-blue'"
              class="ml-2"
              v-if="selectedAssociation.waiting_for_validation"
            ></v-icon>
          </template>
        </v-tooltip>
      </div>
      <span class="Association__header--date"
        >{{ $t('associations.updatedAt') }}:
        {{ new Date(selectedAssociation.updated_at).toLocaleDateString() }}</span
      >
    </div>
    <div class="Association__content">
      <div class="Association__content--description">{{ selectedAssociation.desc }}</div>
      <div class="Association__content--switch">
        <v-btn-toggle v-model="selectedTab" color="light-blue" rounded="0" group>
          <v-btn value="infos"> {{ $t('associations.infos') }} </v-btn>
          <v-btn value="projects"> {{ $t('associations.projects') }} </v-btn>
        </v-btn-toggle>
      </div>
      <div class="Association__contentCtn">
        <AssociationInfos v-show="selectedTab === 'infos'" :association="selectedAssociation" />
        <AssociationProjects
          v-show="selectedTab === 'projects'"
          :projects="projects"
          :association-id="selectedAssociation.id"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { Association } from '@/models/interfaces/Association'
import { useApplicationStore } from '@/stores/applicationStore'
import { useAssociationsStore } from '@/stores/associationsStore'
import { useAuthenticationStore } from '@/stores/authStore'
import { useProjectsStore } from '@/stores/projectsStore'
import { storeToRefs } from 'pinia'
import { computed, onBeforeMount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AssociationInfos from './components/AssociationInfos.vue'
import AssociationProjects from './components/AssociationProjects.vue'

const applicationStore = useApplicationStore()
const associationsStore = useAssociationsStore()
const authStore = useAuthenticationStore()
const projectsStore = useProjectsStore()
const route = useRoute()
const { associationsList } = storeToRefs(associationsStore)

const selectedAssociation = computed(() => {
  return (
    associationsList.value.find((association: Association) => association.id === route.params.id) ||
    null
  )
})

const projects = computed(() => {
  return projectsStore.projectsList.filter(
    (project) => project.association_id === selectedAssociation.value?.id,
  )
})

onBeforeMount(async () => {
  if (associationsStore.associationsList.length === 0) {
    await associationsStore.getAssociationsList()
  }
  projectsStore.getProjectsList()
})

onMounted(() => {
  applicationStore.isLoading = false
})

const hasPermission = computed(() => {
  return (
    authStore.isAdmin || authStore.userInfos?.edit_association_id === selectedAssociation.value?.id
  )
})
const selectedTab = ref('infos')
function editAssociation() {
  associationsStore.activeAssociationEdition(selectedAssociation.value?.id as string)
}
</script>

<style scoped lang="scss">
.Association {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;

  &__header {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
  }
}

.Association__header--date {
  font-size: 0.9rem;
  color: var(--main-grey);
  margin-left: auto;
  font-style: italic;
}

.Association__content {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
}
.Association__content--description {
  font-size: 0.9rem;
  line-height: 1.5;
  text-align: justify;
}
.Association__content--switch {
  margin-top: 2rem;
  display: flex;
}
.Association__contentCtn {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
  margin-top: 2rem;
}
</style>
