<template>
  <v-dialog
    v-model="showDialog"
    width="600"
    persistent
    :max-width="appStore.mobile ? '90%' : '80%'"
    :fullscreen="appStore.mobile"
  >
    <v-card class="ProjectDetails">
      <div class="ProjectDetails__header">
        <div class="ProjectDetails__title">
          {{ project.intitule_projet }}
        </div>
        <v-btn icon variant="text" @click="closeDialog" class="ProjectDetails__close-btn">
          <v-icon icon="$close"></v-icon>
        </v-btn>
      </div>

      <v-card-text class="ProjectDetails__content">
        <div class="ProjectDetails__association" v-if="projectAssociation">
          <a :href="associationUrl" target="_blank">
            <v-btn variant="outlined" color="light-blue" class="mt-2">{{
              $t('projects.seeAssociation')
            }}</v-btn>
          </a>
        </div>
        <v-container fluid class="pa-0">
          <!-- Informations générales -->
          <section class="ProjectDetails__section">
            <h3 class="ProjectDetails__section-title">
              <v-icon icon="$informationSlabBoxOutline" color="light-blue"></v-icon>
              {{ $t('projects.form.categories.general') }}
            </h3>

            <v-row class="ProjectDetails__row">
              <v-col cols="12" md="6">
                <div class="ProjectDetails__field">
                  <span class="ProjectDetails__field-label">
                    {{ $t('projects.form.fields.partenaire_financier_technique') }}
                  </span>
                  <p class="ProjectDetails__field-value">
                    {{ project.partenaire_financier_technique || '-' }}
                  </p>
                </div>
              </v-col>

              <v-col cols="12" md="6">
                <div class="ProjectDetails__field">
                  <span class="ProjectDetails__field-label">
                    {{ $t('projects.card.consortium_question') }}
                  </span>
                  <p class="ProjectDetails__field-value">
                    {{
                      project.consortium
                        ? $t('projects.card.consortium_yes')
                        : $t('projects.card.consortium_no')
                    }}
                  </p>
                </div>
              </v-col>

              <v-col cols="12" md="6" v-if="project.consortium">
                <div class="ProjectDetails__field">
                  <span class="ProjectDetails__field-label">
                    {{ $t('projects.card.consortium_text') }}
                  </span>
                  <p class="ProjectDetails__field-value">
                    {{ project.partenaires_consortium }}
                  </p>
                </div>
              </v-col>

              <v-col cols="12" md="6">
                <div class="ProjectDetails__field">
                  <span class="ProjectDetails__field-label">
                    {{ $t('projects.associationTable.statut_projet') }}
                  </span>
                  <v-chip
                    :color="getStatusColor(project.statut_projet)"
                    size="small"
                    class="ProjectDetails__status-chip"
                  >
                    {{ getStatusLabel(project.statut_projet) }}
                  </v-chip>
                </div>
              </v-col>
            </v-row>

            <v-row class="ProjectDetails__row">
              <v-col cols="12" md="6">
                <div class="ProjectDetails__field">
                  <span class="ProjectDetails__field-label">
                    {{ $t('projects.form.fields.date_debut_projet') }}
                  </span>
                  <p class="ProjectDetails__field-value">
                    {{ formatDate(project.date_debut_projet) }}
                  </p>
                </div>
              </v-col>

              <v-col cols="12" md="6">
                <div class="ProjectDetails__field">
                  <span class="ProjectDetails__field-label">
                    {{ $t('projects.form.fields.date_fin_projet') }}
                  </span>
                  <p class="ProjectDetails__field-value">
                    {{ formatDate(project.date_fin_projet) }}
                  </p>
                </div>
              </v-col>
            </v-row>

            <v-row class="ProjectDetails__row">
              <v-col cols="12" md="6">
                <div class="ProjectDetails__field">
                  <span class="ProjectDetails__field-label">
                    {{ $t('projects.form.fields.budget_projet') }}
                  </span>
                  <p class="ProjectDetails__field-value ProjectDetails__field-value--budget">
                    {{ formatCurrency(project.budget_projet) }}
                  </p>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="ProjectDetails__field">
                  <span class="ProjectDetails__field-label">
                    {{ $t('projects.form.fields.noms_bailleurs_fonds') }}
                  </span>
                  <div class="ProjectDetails__chips">
                    <template v-for="funder in project.noms_bailleurs_fonds" :key="funder">
                      <span
                        v-if="funder !== ProjectFunder.OTHER"
                        class="ProjectDetails__field-value"
                      >
                        {{ $t(`projects.form.lists.projectFunders.${funder}`) }}
                      </span>
                    </template>
                    <span class="ProjectDetails__field-value">
                      {{ project.autre_bailleur_fonds }}
                    </span>
                  </div>
                </div>
              </v-col>
            </v-row>

            <v-row class="ProjectDetails__row">
              <v-col cols="12" md="6">
                <div class="ProjectDetails__field">
                  <span class="ProjectDetails__field-label">
                    {{ $t('projects.form.fields.secteurs_intervention') }}
                  </span>
                  <div class="ProjectDetails__chips">
                    <template v-for="sector in project.secteurs_intervention" :key="sector">
                      <v-chip
                        size="small"
                        color="main-blue"
                        variant="outlined"
                        class="ProjectDetails__chip"
                        v-if="sector !== InterventionSector.OTHER"
                      >
                        {{ $t(`intervention_sector.${sector}`) }}
                      </v-chip>
                    </template>

                    <v-chip
                      v-if="project.autre_secteur_intervention"
                      size="small"
                      color="main-blue"
                      variant="outlined"
                      class="ProjectDetails__chip"
                    >
                      {{ project.autre_secteur_intervention }}
                    </v-chip>
                  </div>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="ProjectDetails__field">
                  <span class="ProjectDetails__field-label">
                    {{ $t('projects.form.fields.types_services_fournis') }}
                  </span>
                  <div class="ProjectDetails__chips">
                    <template v-for="service in project.types_services_fournis" :key="service">
                      <span
                        class="ProjectDetails__field-value"
                        v-if="ProjectServiceType.OTHER !== service"
                      >
                        {{ getServiceName(service) }}
                      </span>
                    </template>
                    <span class="ProjectDetails__field-value">
                      {{ project.autre_type_services_fournis }}
                    </span>
                  </div>
                </div>
              </v-col>
            </v-row>
          </section>

          <!-- Localisation -->
          <section class="ProjectDetails__section">
            <h3 class="ProjectDetails__section-title">
              <v-icon icon="$selectMarker" color="light-blue"></v-icon
              >{{ $t('associations.form.categories.location') }}
            </h3>

            <v-row class="ProjectDetails__row">
              <v-col cols="12" md="6">
                <div class="ProjectDetails__field">
                  <span class="ProjectDetails__field-label">
                    {{ $t('projects.form.fields.province') }}
                  </span>
                  <p class="ProjectDetails__field-value">
                    {{ project.province.join(', ') || '-' }}
                  </p>
                </div>
              </v-col>

              <v-col cols="12" md="6">
                <div class="ProjectDetails__field">
                  <span class="ProjectDetails__field-label">
                    {{ $t('projects.form.fields.territoire') }}
                  </span>
                  <p class="ProjectDetails__field-value">
                    {{ project.territoire.join(', ') || '-' }}
                  </p>
                </div>
              </v-col>

              <v-col cols="12" md="6" v-if="project.zone_sante">
                <div class="ProjectDetails__field">
                  <span class="ProjectDetails__field-label">
                    {{ $t('projects.form.fields.zone_sante') }}
                  </span>
                  <p class="ProjectDetails__field-value">
                    {{ project.zone_sante.join(', ') || '-' }}
                  </p>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="ProjectDetails__field">
                  <span class="ProjectDetails__field-label">
                    {{ $t('projects.form.fields.aire_sante') }}
                  </span>
                  <p class="ProjectDetails__field-value">
                    {{ project.aire_sante || '-' }}
                  </p>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="ProjectDetails__field">
                  <span class="ProjectDetails__field-label">
                    {{ $t('projects.form.fields.localite_village_quartier') }}
                  </span>
                  <p class="ProjectDetails__field-value">
                    {{ project.localite_village_quartier || '-' }}
                  </p>
                </div>
              </v-col>
            </v-row>
          </section>

          <!-- Bénéficiaires -->
          <section class="ProjectDetails__section">
            <h3 class="ProjectDetails__section-title">
              <v-icon icon="$accountGroup" color="light-blue"></v-icon>
              {{ $t('projects.form.categories.beneficiaries') }}
            </h3>

            <v-row class="ProjectDetails__row">
              <v-col cols="12">
                <div class="ProjectDetails__field">
                  <span class="ProjectDetails__field-label">
                    {{ $t('projects.form.fields.types_beneficiaires_populations_cibles') }}
                  </span>
                  <div class="ProjectDetails__chips">
                    <template
                      v-for="type in project.types_beneficiaires_populations_cibles"
                      :key="type"
                    >
                      <v-chip
                        size="small"
                        color="main-blue"
                        variant="outlined"
                        class="ProjectDetails__chip"
                        v-if="ProjectBeneficiaryType.OTHER !== type"
                      >
                        {{ $t(`projects.form.lists.beneficiariesTypes.${type}`) }}
                      </v-chip>
                    </template>
                    <v-chip
                      v-if="project.autre_types_beneficiaires_populations_cibles"
                      size="small"
                      color="main-blue"
                      variant="outlined"
                      class="ProjectDetails__chip"
                    >
                      {{ project.autre_types_beneficiaires_populations_cibles }}
                    </v-chip>
                  </div>
                </div>
              </v-col>
            </v-row>

            <v-row class="ProjectDetails__row">
              <v-col cols="12" md="6">
                <div class="ProjectDetails__field">
                  <span class="ProjectDetails__field-label">
                    {{ $t('projects.form.fields.nombre_total_personnes_cibles') }}
                  </span>
                  <p class="ProjectDetails__field-value ProjectDetails__field-value--number">
                    {{ formatNumber(project.nombre_total_personnes_cibles) }}
                  </p>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="ProjectDetails__field">
                  <span class="ProjectDetails__field-label">
                    {{ $t('projects.form.fields.nombre_personnes_atteintes') }}
                  </span>
                  <p class="ProjectDetails__field-value ProjectDetails__field-value--number">
                    {{ formatNumber(project.nombre_personnes_atteintes) }}
                  </p>
                </div>
              </v-col>
            </v-row>

            <!-- Répartition démographique -->
            <div class="ProjectDetails__demographics">
              <h4 class="ProjectDetails__demographics-title">Répartition démographique</h4>

              <v-row class="ProjectDetails__row">
                <v-col cols="6" md="4">
                  <div class="ProjectDetails__field ProjectDetails__field--compact">
                    <span class="ProjectDetails__field-label">
                      {{ $t('projects.form.fields.nombre_hommes') }}
                    </span>
                    <p class="ProjectDetails__field-value">
                      {{ formatNumber(project.nombre_hommes) }}
                    </p>
                  </div>
                </v-col>

                <v-col cols="6" md="4">
                  <div class="ProjectDetails__field ProjectDetails__field--compact">
                    <span class="ProjectDetails__field-label">
                      {{ $t('projects.form.fields.nombre_femmes') }}
                    </span>
                    <p class="ProjectDetails__field-value">
                      {{ formatNumber(project.nombre_femmes) }}
                    </p>
                  </div>
                </v-col>

                <v-col cols="6" md="4">
                  <div class="ProjectDetails__field ProjectDetails__field--compact">
                    <span class="ProjectDetails__field-label">
                      {{ $t('projects.form.fields.nombre_filles') }}
                    </span>
                    <p class="ProjectDetails__field-value">
                      {{ formatNumber(project.nombre_filles) }}
                    </p>
                  </div>
                </v-col>

                <v-col cols="6" md="4">
                  <div class="ProjectDetails__field ProjectDetails__field--compact">
                    <span class="ProjectDetails__field-label">
                      {{ $t('projects.form.fields.nombre_garcons') }}
                    </span>
                    <p class="ProjectDetails__field-value">
                      {{ formatNumber(project.nombre_garcons) }}
                    </p>
                  </div>
                </v-col>
                <v-col cols="12" md="4">
                  <div class="ProjectDetails__field ProjectDetails__field--compact">
                    <span class="ProjectDetails__field-label">
                      {{ $t('projects.form.fields.nombre_personnes_handicapees') }}
                    </span>
                    <p class="ProjectDetails__field-value">
                      {{ formatNumber(project.nombre_personnes_handicapees) }}
                    </p>
                  </div>
                </v-col>
                <v-col cols="12" md="4">
                  <div class="ProjectDetails__field ProjectDetails__field--compact">
                    <span class="ProjectDetails__field-label">
                      {{ $t('projects.form.fields.nombre_personnes_agees') }}
                    </span>
                    <p class="ProjectDetails__field-value">
                      {{ formatNumber(project.nombre_personnes_agees) }}
                    </p>
                  </div>
                </v-col>
              </v-row>
            </div>
          </section>

          <!-- Validation Badge -->
          <v-row v-if="project.waiting_for_validation" class="ProjectDetails__row">
            <v-col cols="12">
              <v-alert type="warning" variant="outlined" class="ProjectDetails__validation-alert">
                <template #prepend>
                  <v-icon>mdi-clock-outline</v-icon>
                </template>
                {{ $t('projects.associationTable.validationPending') }}
              </v-alert>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-card-actions class="ProjectDetails__actions">
        <v-spacer />
        <v-btn color="main-blue" @click="closeDialog" class="ProjectDetails__close-action">
          Fermer
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { InterventionSector } from '@/models/enums/InterventionSector'
import { ProjectBeneficiaryType } from '@/models/enums/projects/ProjectBeneficiaryType'
import { ProjectFunder } from '@/models/enums/projects/ProjectFunder'
import { ProjectServiceType } from '@/models/enums/projects/ProjectServiceType'
import { ProjectStatus } from '@/models/enums/projects/ProjectStatus'
import type { Project } from '@/models/interfaces/Project'
import { i18n } from '@/plugins/i18n'
import { formatNumber } from '@/services/utils/FormatNumber'
import { PROJECT_SERVICES_BY_SECTOR } from '@/services/utils/ProjectServiceList'
import { useApplicationStore } from '@/stores/applicationStore'
import { useAssociationsStore } from '@/stores/associationsStore'
import { useProjectsStore } from '@/stores/projectsStore'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const appStore = useApplicationStore()
const projectsStore = useProjectsStore()
const associationsStore = useAssociationsStore()
const { t } = useI18n()
const associationUrl = computed(
  () => `${import.meta.env.BASE_URL}associations/${projectAssociation.value?.id}`,
)

const showDialog = computed(() => projectsStore.selectedProject !== null)
const project = computed(() => projectsStore.selectedProject as Project)
const projectAssociation = computed(() => {
  if (projectsStore.showAssociationInProjectCard) {
    return associationsStore.associationsList.find(
      (association) => association.id === project.value.association_id,
    )
  }
  return null
})

const closeDialog = (): void => {
  projectsStore.showAssociationInProjectCard = false
  projectsStore.selectedProject = null
}

const formatDate = (dateString: string | null): string => {
  if (!dateString) return t('projects.associationTable.unknownDates')

  try {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return t('projects.associationTable.unknownDates')
  }
}

const formatCurrency = (amount: number | undefined): string => {
  if (!amount) return '-'

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount)
}

const getStatusColor = (status: ProjectStatus | null): string => {
  if (!status) return 'grey'

  switch (status) {
    case ProjectStatus.ON_GOING:
      return 'main-blue'
    case ProjectStatus.FINISHED:
      return 'main-grey'
    default:
      return 'light-grey'
  }
}

const getStatusLabel = (status: ProjectStatus | null): string => {
  if (!status) return t('projects.associationTable.unknown')

  return t(`projects.form.lists.projectStatus.${status}`)
}

const getServiceName = (service: ProjectServiceType): string => {
  const serviceLabel =
    i18n.t('projects.form.lists.serviceTypes', {})[service as unknown as number] || service

  // If several sectors are selected, precise it in service label
  let title = serviceLabel
  if ((project.value.secteurs_intervention as InterventionSector[]).length > 1) {
    const sector = Object.keys(PROJECT_SERVICES_BY_SECTOR).find((sectorKey) =>
      PROJECT_SERVICES_BY_SECTOR[sectorKey as InterventionSector].includes(service),
    ) as InterventionSector

    if (sector) {
      const sectorLabel = i18n.t(`intervention_sector.${sector}`) || sector
      title = `${sectorLabel} - ${serviceLabel}`
    }
  }

  return title
}
</script>

<style lang="scss" scoped>
.ProjectDetails {
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  }

  &__title {
    display: flex;
    flex-wrap: wrap;
    font-size: 1.2rem;
    font-weight: 600;
    max-width: 100%;
    margin: 0;
    color: rgb(var(--v-theme-main-blue));
    margin-right: 16px;
  }

  &__close-btn {
    flex-shrink: 0;
  }

  &__content {
    max-height: 70vh;
    overflow-y: auto;
    padding: 24px;

    @media (max-width: 768px) {
      padding: 16px;
      max-height: calc(100vh - 140px);
    }
  }

  &__section {
    margin-bottom: 32px;

    &:last-child {
      margin-bottom: 0;
    }

    @media (max-width: 768px) {
      margin-bottom: 24px;
    }
  }

  &__section-title {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #333;
    padding-bottom: 8px;
    border-bottom: 2px solid rgb(var(--v-theme-light-blue));
  }

  &__field-label {
    display: block;
    font-weight: 600;
    color: rgb(var(--v-theme-main-grey));
    margin-bottom: 4px;
    font-size: 1rem;
  }

  &__field-value {
    margin: 0;
    font-size: 0.875rem;
    color: #333;
    line-height: 1.4;

    &--budget {
      font-size: 1.125rem;
      font-weight: 600;
      color: rgb(var(--v-theme-main-blue));
    }

    &--number {
      font-size: 1.125rem;
      font-weight: 600;
      color: rgb(var(--v-theme-main-blue));
    }
  }

  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 4px;
  }

  &__chip {
    white-space: normal !important;
    height: auto !important;
    width: fit-content !important;
    max-width: 200px;
    min-height: 32px;
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
    text-align: center;
    word-wrap: break-word;
    word-break: break-word;
    line-height: 1.3;
    padding: 8px 12px !important;
  }

  &__status-chip {
    margin-top: 4px;
  }

  &__demographics {
    margin-top: 24px;
    padding: 16px;
    background-color: #edeff1;
    border-radius: 8px;

    @media (max-width: 768px) {
      padding: 12px;
      margin-top: 16px;
    }
  }

  &__demographics-title {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 12px;
    color: rgb(var(--v-theme-main-blue));
  }

  &__validation-alert {
    margin-top: 16px;
  }

  &__actions {
    padding: 16px 24px;
    border-top: 1px solid rgb(var(--v-theme-light-grey));

    @media (max-width: 768px) {
      padding: 12px 16px;
    }
  }

  &__close-action {
    min-width: 80px;
  }

  // Responsive adjustments
  @media (max-width: 768px) {
    &__header {
      padding: 12px 16px;
    }

    &__title {
      font-size: 1.25rem;
    }

    &__section-title {
      font-size: 1.125rem;
    }

    &__field-label {
      font-size: 0.8125rem;
    }

    &__field-value {
      font-size: 0.9375rem;

      &--budget,
      &--number {
        font-size: 1rem;
      }
    }

    &__chips {
      gap: 6px;
    }
  }
}

.ProjectDetails__content {
  scrollbar-width: thin;
  scrollbar-color: rgb(var(--v-theme-light-grey)) transparent;
}

.ProjectDetails__association {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  font-weight: 600;
  // font-size: 1.2rem;
  text-align: center;
  a {
    text-decoration: underline;
    color: rgb(var(--v-theme-main-grey));
  }
}
</style>
