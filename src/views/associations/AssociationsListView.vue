<template>
  <div class="Associations">
    <header class="Associations__header">
      <h1 class="Associations__title">{{ $t('associations.title') }}</h1>
      <v-btn variant="text" size="small" class="Associations__reset-btn">
        {{ $t('associations.resetFilters') }}
      </v-btn>
    </header>

    <section class="Associations__filters">
      <v-text-field
        placeholder="Rechercher..."
        variant="outlined"
        density="compact"
        hide-details
        class="Associations__search-field"
      />

      <v-select
        label="Filtrer par ONG"
        variant="outlined"
        density="compact"
        hide-details
        class="Associations__select"
      />

      <v-select
        label="Filtrer par secteur"
        variant="outlined"
        density="compact"
        hide-details
        class="Associations__select"
      />

      <v-select
        label="Filtrer par groupe"
        variant="outlined"
        density="compact"
        hide-details
        class="Associations__select"
      />

      <v-select
        label="Filtrer par statut"
        variant="outlined"
        density="compact"
        hide-details
        class="Associations__select"
      />
    </section>

    <main class="Associations__content">
      <div class="Associations__grid">
        <article
          v-for="association in associations"
          :key="association.id"
          class="Associations__card"
          @click="() => associationsStore.navigateToAssociation(association.id)"
        >
          <div class="Associations__card-avatar">
            <v-avatar size="2.5rem" color="black" class="Associations__avatar" />
          </div>

          <div class="Associations__card-content">
            <div class="d-flex justify-space-between">
              <h3 class="Associations__card-title">{{ association.nom }}</h3>
              <div>
                <v-tooltip :text="$t('admin.disclaimer')" color="main-grey">
                  <template v-slot:activator="{ props }">
                    <v-icon
                      v-bind="props"
                      size="small"
                      icon="$timerEditOutline"
                      :color="authStore.isAdmin ? 'main-purple' : 'main-blue'"
                      class="mr-1"
                      v-if="hasPermissionToEdit(association.id)"
                      @click.stop
                    ></v-icon>
                  </template>
                </v-tooltip>
                <v-icon
                  size="small"
                  icon="$squareEditOutline"
                  :color="authStore.isAdmin ? 'main-purple' : 'main-blue'"
                  v-if="hasPermissionToEdit(association.id)"
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
import { FormOperation } from '@/models/enums/FormOperation'
import type { Association } from '@/models/interfaces/Association'
import { useApplicationStore } from '@/stores/applicationStore'
import { useAssociationsStore } from '@/stores/associationsStore'
import { useAuthenticationStore } from '@/stores/authStore'
import { computed, onBeforeMount, onMounted } from 'vue'

const applicationStore = useApplicationStore()
const associationsStore = useAssociationsStore()
const authStore = useAuthenticationStore()
const associations = computed(() => associationsStore.associationsList)
onBeforeMount(async () => {
  await associationsStore.getAssociationsList()
})
onMounted(() => {
  applicationStore.isLoading = false
})
const hasPermissionToEdit = (id: string) =>
  authStore.isAdmin || authStore.userInfos?.edit_association_id === id

function editAssociation(association: Association) {
  associationsStore.associationToEdit = association
  associationsStore.editStatus = authStore.isAdmin
    ? FormOperation.ADMIN_UPDATE
    : FormOperation.EDITOR_UPDATE
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
