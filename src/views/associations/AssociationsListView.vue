<template>
  <div class="Associations">
    <header class="Associations__header">
      <div class="d-flex align-center">
        <h1 class="Associations__title">{{ $t('associations.title') }}</h1>
        <v-chip color="main-blue" class="ml-2" size="small">{{ associations.length }}</v-chip>
      </div>
      <div class="d-flex align-center">
        <v-chip color="light-blue" class="mr-2" size="small">{{
          filteredAssociations.length
        }}</v-chip>
        <v-btn variant="text" size="small" class="Associations__reset-btn" @click="resetFilters">
          {{ $t('associations.resetFilters') }}
        </v-btn>
      </div>
    </header>

    <section class="Associations__filters">
      <v-text-field
        :placeholder="$t('associations.filters.search')"
        variant="outlined"
        density="compact"
        hide-details
        class="Associations__search-field"
        v-model="searchQuery"
        clearable
      />

      <v-select
        :label="$t('associations.filters.province')"
        :items="adminBoundStore.provincesList?.sort((a, b) => a.province.localeCompare(b.province))"
        :item-title="'province'"
        :item-value="'province'"
        v-model="selectedProvince"
        variant="outlined"
        density="compact"
        hide-details
        class="Associations__select"
        clearable
      />

      <v-select
        :label="$t('associations.filters.territory')"
        :items="
          adminBoundStore.territoriesList?.sort((a, b) => a.territoire.localeCompare(b.territoire))
        "
        :item-title="'territoire'"
        :item-value="'territoire'"
        v-model="selectedTerritory"
        variant="outlined"
        density="compact"
        hide-details
        class="Associations__select"
        clearable
      />

      <v-select
        :label="$t('associations.filters.healthZone')"
        :items="
          adminBoundStore.healthZonesList?.sort((a, b) => a.zone_sante.localeCompare(b.zone_sante))
        "
        :item-title="'zone_sante'"
        :item-value="'zone_sante'"
        v-model="selectedHealthZone"
        variant="outlined"
        density="compact"
        hide-details
        class="Associations__select"
        clearable
      />

      <v-select
        :label="$t('associations.filters.typeOrg')"
        :items="Object.values(AssociationType)"
        :item-title="(item) => $t(`associations.form.lists.type_org.${item}`)"
        :item-value="(item) => item"
        v-model="selectedTypeOrg"
        variant="outlined"
        density="compact"
        hide-details
        class="Associations__select"
        clearable
      />
    </section>

    <main class="Associations__content">
      <div class="Associations__grid">
        <article
          v-for="association in filteredAssociations"
          :key="association.id"
          class="Associations__card"
          @click="() => associationsStore.navigateToAssociation(association.id)"
        >
          <div class="Associations__card-avatar">
            <v-avatar
              size="2.5rem"
              color="black"
              class="Associations__avatar"
              :image="association.logo_url ? association.logo_url : undefined"
            />
          </div>

          <div class="Associations__card-content">
            <div class="d-flex justify-space-between">
              <h3 class="Associations__card-title">{{ association.nom }}</h3>
              <div>
                <v-tooltip :text="$t('admin.disclaimer')">
                  <template v-slot:activator="{ props }">
                    <v-icon
                      v-bind="props"
                      size="small"
                      icon="$timerEditOutline"
                      :color="authStore.isAdmin ? 'main-purple' : 'main-blue'"
                      class="mr-1"
                      v-if="
                        association.waiting_for_validation &&
                        hasPermissionToEdit(association.id) &&
                        !applicationStore.mobile
                      "
                      @click.stop
                    ></v-icon>
                  </template>
                </v-tooltip>
                <v-icon
                  size="small"
                  icon="$squareEditOutline"
                  :color="authStore.isAdmin ? 'main-purple' : 'main-blue'"
                  v-if="hasPermissionToEdit(association.id) && !applicationStore.mobile"
                  @click.stop="editAssociation(association)"
                ></v-icon>
              </div>
            </div>
            <p class="Associations__card-description">{{ association.desc }}</p>
            <div class="Associations__card-footer">
              <v-icon size="small" class="Associations__card-icon" icon="$calendar"></v-icon>
              <span class="Associations__card-date">{{ association.updated_at }}</span>
            </div>
          </div>
        </article>
      </div>
    </main>
  </div>
</template>
<script setup lang="ts">
import { AssociationType } from '@/models/enums/associations/AssociationType'
import type { Association } from '@/models/interfaces/Association'
import { useAdminBoundariesStore } from '@/stores/adminBoundariesStore'
import { useApplicationStore } from '@/stores/applicationStore'
import { useAssociationsStore } from '@/stores/associationsStore'
import { useAuthenticationStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { computed, onBeforeMount, onMounted, ref, type Ref } from 'vue'

const applicationStore = useApplicationStore()
const associationsStore = useAssociationsStore()
const authStore = useAuthenticationStore()
const adminBoundStore = useAdminBoundariesStore()
const { associationsList: associations } = storeToRefs(associationsStore)
onBeforeMount(async () => {
  await associationsStore.getAssociationsList()
  await adminBoundStore.fetchBoundaries()
})
onMounted(() => {
  applicationStore.isLoading = false
})
const hasPermissionToEdit = (id: string) =>
  authStore.isAdmin || authStore.userInfos?.edit_association_id === id

function editAssociation(association: Association) {
  associationsStore.activeAssociationEdition(association.id)
}

const searchQuery: Ref<string> = ref('')
const selectedProvince: Ref<string | null> = ref(null)
const selectedTerritory: Ref<string | null> = ref(null)
const selectedHealthZone: Ref<string | null> = ref(null)
const selectedTypeOrg: Ref<AssociationType | null> = ref(null)
const filteredAssociations = computed(() => {
  if (
    !searchQuery.value &&
    !selectedProvince.value &&
    !selectedTerritory.value &&
    !selectedHealthZone.value &&
    !selectedTypeOrg.value
  ) {
    return associations.value
  }
  const filteredByProvince = selectedProvince.value
    ? associations.value.filter((association) => association.province === selectedProvince.value)
    : associations.value
  const filteredByTerritory = selectedTerritory.value
    ? filteredByProvince.filter((association) => association.territoire === selectedTerritory.value)
    : filteredByProvince
  const filteredByHealthZone = selectedHealthZone.value
    ? filteredByTerritory.filter(
        (association) => association.zone_sante === selectedHealthZone.value,
      )
    : filteredByTerritory
  const filteredByTypeOrg = selectedTypeOrg.value
    ? filteredByHealthZone.filter((association) => association.type_org === selectedTypeOrg.value)
    : filteredByHealthZone

  return filteredByTypeOrg.filter(
    (association) =>
      association.nom.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      association.acronyme?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      association.province.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      association.territoire.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      association.zone_sante.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      association.nom_contact.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      association.secteurs_interv.some((secteur) =>
        secteur.toLowerCase().includes(searchQuery.value.toLowerCase()),
      ),
  )
})
function resetFilters() {
  searchQuery.value = ''
  selectedProvince.value = null
  selectedTerritory.value = null
  selectedHealthZone.value = null
  selectedTypeOrg.value = null
}
</script>

<style scoped lang="scss">
.Associations {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  &__title {
    font-size: 2rem;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
  }

  &__reset-btn {
    color: #666;
    font-size: 0.875rem;
    text-transform: none;
    letter-spacing: normal;
  }

  &__filters {
    display: grid;
    grid-template-columns: 1fr repeat(4, minmax(12rem, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
    align-items: end;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }

    @media (max-width: 1024px) and (min-width: 769px) {
      grid-template-columns: 1fr 1fr;
    }
  }

  &__search-field {
    min-width: 15rem;
  }

  &__select {
    min-width: 12rem;
  }

  &__content {
    margin-bottom: 3rem;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
    gap: 1.5rem;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  &__card {
    display: flex;
    gap: 1rem;
    padding: 1.5rem;
    border: 0.0625rem solid #e0e0e0;
    max-width: 90vw;
    border-radius: 0.5rem;
    background: white;
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
      box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);
      transform: translateY(-0.125rem);
    }
  }

  &__card-avatar {
    flex-shrink: 0;
  }

  &__avatar {
    background-color: #1a1a1a !important;
  }

  &__card-content {
    flex: 1;
    min-width: 0;
  }

  &__card-title {
    font-size: 1rem;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 0.5rem 0;
    line-height: 1.4;
  }

  &__card-description {
    font-size: 0.875rem;
    color: #666;
    line-height: 1.5;
    margin: 0 0 1rem 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__card-footer {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__card-icon {
    color: #999;
    opacity: 0.7;
  }

  &__card-date {
    font-size: 0.75rem;
    color: #999;
    font-weight: 500;
  }
}
</style>
