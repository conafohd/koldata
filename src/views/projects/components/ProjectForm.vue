<template>
  <v-dialog v-model="showDialog" fullscreen>
    <v-card class="fullScreenCard">
      <v-toolbar :color="authStore.isAdmin ? 'main-purple' : 'main-blue'">
        <v-btn
          icon="$close"
          @click="((projectsStore.projectToEdit = null), (projectsStore.projectToCreate = null))"
        ></v-btn>
        <v-toolbar-title
          >{{
            projectsStore.projectToCreate
              ? $t('projects.form.createTitle')
              : projectsStore.projectToEdit?.newProject
                ? $t('projects.form.validateNewProjectTitle')
                : $t('projects.form.updateTitle')
          }}
        </v-toolbar-title>
        <v-toolbar-items class="bg-white">
          <template v-if="authStore.isAdmin">
            <v-tooltip :text="$t('admin.refuseUpdateDisclaimer')" bottom>
              <template v-slot:activator="{ props }">
                <v-btn
                  @click="refuseUpdate"
                  base-color="light-grey"
                  variant="flat"
                  v-bind="props"
                  :loading="projectForm.isSubmitting.value"
                  v-if="
                    projectsStore.projectToEdit?.waiting_for_validation ||
                    projectsStore.projectToEdit?.newProject
                  "
                  >{{
                    projectsStore.projectToEdit?.newProject
                      ? $t('admin.refuseSubmission')
                      : $t('admin.refuseUpdate')
                  }}</v-btn
                >
              </template>
            </v-tooltip>
            <v-tooltip :text="$t('admin.acceptUpdateDisclaimer')" bottom>
              <template v-slot:activator="{ props }">
                <v-btn
                  @click="projectsStore.projectToCreate ? createProject() : validateUpdate()"
                  variant="flat"
                  color="main-purple"
                  v-bind="props"
                  :loading="projectForm.isSubmitting.value"
                  >{{
                    projectsStore.projectToEdit?.waiting_for_validation ||
                    projectsStore.projectToEdit?.newProject
                      ? projectsStore.projectToEdit?.newProject
                        ? $t('admin.acceptSubmission')
                        : $t('admin.acceptUpdate')
                      : $t('forms.validate')
                  }}</v-btn
                >
              </template>
            </v-tooltip>
          </template>
          <template v-else>
            <v-tooltip :text="$t('projects.form.buttons.saveDisclaimer')" bottom>
              <template v-slot:activator="{ props }">
                <v-btn
                  @click="submitUpdate"
                  variant="flat"
                  color="light-blue"
                  v-bind="props"
                  :loading="projectForm.isSubmitting.value"
                  >{{ $t('projects.form.buttons.save') }}</v-btn
                >
              </template>
            </v-tooltip>
          </template>
        </v-toolbar-items>
      </v-toolbar>
      <div class="Form">
        <div class="Form__categoryCtn ContentCard">
          <span class="ContentCard__title">
            <v-icon icon="$informationSlabBoxOutline" class="mr-1" color="light-blue"></v-icon>
            {{ $t('projects.form.categories.general') }}</span
          >
          <div class="Form__fields">
            <v-text-field
              variant="outlined"
              :label="$t('projects.form.fields.intitule_projet')"
              :placeholder="$t('projects.form.placeholders.intitule_projet')"
              v-model="projectForm.form.intitule_projet.value.value"
              :error-messages="projectForm.form.intitule_projet.errorMessage.value"
              @blur="projectForm.form.intitule_projet.handleBlur"
              required
              clearable
            />
            <div class="d-flex ga-2">
              <v-checkbox
                :label="$t('projects.form.fields.consortium')"
                v-model="projectForm.form.consortium.value.value"
              ></v-checkbox>
              <v-text-field
                variant="outlined"
                :label="$t('projects.form.fields.partenaires_consortium')"
                :placeholder="$t('projects.form.placeholders.partenaires_consortium')"
                v-model="projectForm.form.partenaires_consortium.value.value"
                :error-messages="projectForm.form.partenaires_consortium.errorMessage.value"
                @blur="projectForm.form.partenaires_consortium.handleBlur"
                v-if="projectForm.form.consortium.value.value"
                clearable
              />
            </div>
            <div class="d-flex ga-2">
              <v-text-field
                variant="outlined"
                :label="$t('projects.form.fields.partenaire_financier_technique')"
                :placeholder="$t('projects.form.placeholders.partenaire_financier_technique')"
                v-model="projectForm.form.partenaire_financier_technique.value.value"
                :error-messages="projectForm.form.partenaire_financier_technique.errorMessage.value"
                @blur="projectForm.form.partenaire_financier_technique.handleBlur"
                required
                clearable
              />
              <v-number-input
                variant="outlined"
                :label="$t('projects.form.fields.budget_projet')"
                :placeholder="$t('projects.form.placeholders.budget_projet')"
                v-model="projectForm.form.budget_projet.value.value"
                :error-messages="projectForm.form.budget_projet.errorMessage.value"
                @blur="projectForm.form.budget_projet.handleBlur"
                required
                controlVariant="stacked"
                clearable
              />
            </div>

            <div class="d-flex ga-2">
              <v-select
                variant="outlined"
                :label="$t('projects.form.fields.noms_bailleurs_fonds')"
                v-model="projectForm.form.noms_bailleurs_fonds.value.value as ProjectFunder[]"
                :error-messages="projectForm.form.noms_bailleurs_fonds.errorMessage.value"
                @blur="projectForm.form.noms_bailleurs_fonds.handleBlur"
                :items="Object.values(ProjectFunder)"
                :item-title="(key) => $t(`projects.form.lists.projectFunders.${key}`)"
                :item-value="(item) => item"
                multiple
                required
                clearable
              />
              <v-text-field
                variant="outlined"
                :label="$t('projects.form.fields.autre_bailleur_fonds')"
                :placeholder="$t('projects.form.placeholders.autre_bailleur_fonds')"
                v-model="projectForm.form.autre_bailleur_fonds.value.value"
                :error-messages="projectForm.form.autre_bailleur_fonds.errorMessage.value"
                @blur="projectForm.form.autre_bailleur_fonds.handleBlur"
                v-if="
                  projectForm.form.noms_bailleurs_fonds.value.value?.includes(ProjectFunder.OTHER)
                "
                clearable
              />
            </div>

            <div class="d-flex ga-2">
              <v-select
                variant="outlined"
                :label="$t('projects.form.fields.secteurs_intervention')"
                v-model="projectForm.form.secteurs_intervention.value.value as InterventionSector[]"
                :error-messages="projectForm.form.secteurs_intervention.errorMessage.value"
                @blur="projectForm.form.secteurs_intervention.handleBlur"
                :items="Object.values(InterventionSector)"
                :item-title="(key) => $t(`intervention_sector.${key}`)"
                :item-value="(item) => item"
                multiple
                required
                chips
                clearable
              />
              <v-text-field
                variant="outlined"
                :label="$t('projects.form.fields.autre_secteur_intervention')"
                :placeholder="$t('projects.form.placeholders.autre_secteur_intervention')"
                v-model="projectForm.form.autre_secteur_intervention.value.value"
                :error-messages="projectForm.form.autre_secteur_intervention.errorMessage.value"
                @blur="projectForm.form.autre_secteur_intervention.handleBlur"
                v-if="
                  projectForm.form.secteurs_intervention.value.value?.includes(
                    InterventionSector.OTHER,
                  )
                "
                clearable
              />
            </div>

            <div class="d-flex ga-2">
              <v-select
                variant="outlined"
                :label="$t('projects.form.fields.statut_projet')"
                v-model="projectForm.form.statut_projet.value.value as ProjectStatus"
                :error-messages="projectForm.form.statut_projet.errorMessage.value"
                @blur="projectForm.form.statut_projet.handleBlur"
                :items="Object.values(ProjectStatus)"
                :item-title="(key) => $t(`projects.form.lists.projectStatus.${key}`)"
                :item-value="(item) => item"
                required
                clearable
              />
              <v-text-field
                variant="outlined"
                :label="$t('projects.form.fields.date_debut_projet')"
                v-model="projectForm.form.date_debut_projet.value.value"
                :error-messages="projectForm.form.date_debut_projet.errorMessage.value"
                @blur="projectForm.form.date_debut_projet.handleBlur"
                readonly
                @click="openDatePicker('start')"
                append-inner-icon="$calendar"
                @click:append-inner="openDatePicker('start')"
                required
                clearable
              />
              <v-text-field
                variant="outlined"
                :label="$t('projects.form.fields.date_fin_projet')"
                v-model="projectForm.form.date_fin_projet.value.value"
                :error-messages="projectForm.form.date_fin_projet.errorMessage.value"
                @blur="projectForm.form.date_fin_projet.handleBlur"
                readonly
                @click="openDatePicker('end')"
                append-inner-icon="$calendar"
                @click:append-inner="openDatePicker('end')"
                clearable
              />
            </div>

            <div class="d-flex ga-2">
              <v-select
                variant="outlined"
                :label="$t('projects.form.fields.province')"
                v-model="projectForm.form.province.value.value"
                :error-messages="projectForm.form.province.errorMessage.value"
                @blur="projectForm.form.province.handleBlur"
                :items="adminBoundariesStore.provincesList"
                item-title="province"
                item-value="province_c"
                @update:model-value="updateTerritories()"
                required
                multiple
                clearable
              />
              <v-select
                variant="outlined"
                :label="$t('projects.form.fields.territoire')"
                v-model="projectForm.form.territoire.value.value"
                :error-messages="projectForm.form.territoire.errorMessage.value"
                @blur="projectForm.form.territoire.handleBlur"
                :items="territoriesList"
                item-title="territoire"
                item-value="territoire_c"
                @update:model-value="updateHealthZones()"
                required
                multiple
                clearable
              />
              <v-select
                variant="outlined"
                :label="$t('projects.form.fields.zone_sante')"
                v-model="projectForm.form.zone_sante.value.value"
                :error-messages="projectForm.form.zone_sante.errorMessage.value"
                @blur="projectForm.form.zone_sante.handleBlur"
                :items="healthZonesList"
                item-title="zone_sante"
                item-value="zone_sante_c"
                required
                multiple
                clearable
              />
            </div>
            <div class="d-flex ga-2">
              <v-text-field
                variant="outlined"
                :label="$t('projects.form.fields.aire_sante')"
                :placeholder="$t('projects.form.placeholders.aire_sante')"
                v-model="projectForm.form.aire_sante.value.value"
                :error-messages="projectForm.form.aire_sante.errorMessage.value"
                @blur="projectForm.form.aire_sante.handleBlur"
                required
                clearable
              />
              <v-text-field
                variant="outlined"
                :label="$t('projects.form.fields.localite_village_quartier')"
                :placeholder="$t('projects.form.placeholders.localite_village_quartier')"
                v-model="projectForm.form.localite_village_quartier.value.value"
                :error-messages="projectForm.form.localite_village_quartier.errorMessage.value"
                @blur="projectForm.form.localite_village_quartier.handleBlur"
                required
                clearable
              />
            </div>
          </div>
        </div>

        <div class="Form__categoryCtn ContentCard">
          <span class="ContentCard__title">
            <v-icon icon="$accountGroup" class="mr-1" color="light-blue"></v-icon>
            {{ $t('projects.form.categories.beneficiaries') }}</span
          >
          <div class="Form__fields">
            <div class="d-flex ga-2">
              <v-select
                variant="outlined"
                :label="$t('projects.form.fields.types_services_fournis')"
                v-model="
                  projectForm.form.types_services_fournis.value.value as ProjectServiceType[]
                "
                :error-messages="projectForm.form.types_services_fournis.errorMessage.value"
                @blur="projectForm.form.types_services_fournis.handleBlur"
                :items="translatedProjectServicesList"
                item-title="title"
                item-value="value"
                multiple
                required
                clearable
              />
              <v-text-field
                variant="outlined"
                :label="$t('projects.form.fields.autre_type_services_fournis')"
                :placeholder="$t('projects.form.placeholders.autre_type_services_fournis')"
                v-model="projectForm.form.autre_type_services_fournis.value.value"
                :error-messages="projectForm.form.autre_type_services_fournis.errorMessage.value"
                @blur="projectForm.form.autre_type_services_fournis.handleBlur"
                v-if="
                  projectForm.form.types_services_fournis.value.value?.includes(
                    ProjectServiceType.OTHER,
                  )
                "
                class="ProjectForm__serviceType"
                clearable
              />
            </div>
            <div class="d-flex ga-2">
              <v-select
                variant="outlined"
                :label="$t('projects.form.fields.types_beneficiaires_populations_cibles')"
                v-model="
                  projectForm.form.types_beneficiaires_populations_cibles.value
                    .value as ProjectBeneficiaryType[]
                "
                :error-messages="
                  projectForm.form.types_beneficiaires_populations_cibles.errorMessage.value
                "
                @blur="projectForm.form.types_beneficiaires_populations_cibles.handleBlur"
                :items="Object.values(ProjectBeneficiaryType)"
                :item-title="(key) => $t(`projects.form.lists.beneficiariesTypes.${key}`)"
                :item-value="(item) => item"
                multiple
                required
                clearable
              />
              <v-text-field
                variant="outlined"
                :label="$t('projects.form.fields.autre_types_beneficiaires_populations_cibles')"
                :placeholder="
                  $t('projects.form.placeholders.autre_types_beneficiaires_populations_cibles')
                "
                v-model="projectForm.form.autre_types_beneficiaires_populations_cibles.value.value"
                :error-messages="
                  projectForm.form.autre_types_beneficiaires_populations_cibles.errorMessage.value
                "
                @blur="projectForm.form.autre_types_beneficiaires_populations_cibles.handleBlur"
                v-if="
                  projectForm.form.types_beneficiaires_populations_cibles.value.value?.includes(
                    ProjectBeneficiaryType.OTHER,
                  )
                "
                clearable
              />
            </div>
            <div class="d-flex ga-2"></div>
            <div class="d-flex ga-2">
              <v-number-input
                variant="outlined"
                :label="$t('projects.form.fields.nombre_total_personnes_cibles')"
                :placeholder="$t('projects.form.placeholders.nombre_total_personnes_cibles')"
                v-model="projectForm.form.nombre_total_personnes_cibles.value.value"
                :error-messages="projectForm.form.nombre_total_personnes_cibles.errorMessage.value"
                @blur="projectForm.form.nombre_total_personnes_cibles.handleBlur"
                required
                controlVariant="stacked"
                clearable
              />
              <v-number-input
                variant="outlined"
                :label="$t('projects.form.fields.nombre_hommes')"
                :placeholder="$t('projects.form.placeholders.nombre_hommes')"
                v-model="projectForm.form.nombre_hommes.value.value"
                :error-messages="projectForm.form.nombre_hommes.errorMessage.value"
                @blur="projectForm.form.nombre_hommes.handleBlur"
                required
                controlVariant="stacked"
                clearable
              />
            </div>
            <div class="d-flex ga-2">
              <v-number-input
                variant="outlined"
                :label="$t('projects.form.fields.nombre_femmes')"
                :placeholder="$t('projects.form.placeholders.nombre_femmes')"
                v-model="projectForm.form.nombre_femmes.value.value"
                :error-messages="projectForm.form.nombre_femmes.errorMessage.value"
                @blur="projectForm.form.nombre_femmes.handleBlur"
                required
                controlVariant="stacked"
                clearable
              />
              <v-number-input
                variant="outlined"
                :label="$t('projects.form.fields.nombre_filles')"
                :placeholder="$t('projects.form.placeholders.nombre_filles')"
                v-model="projectForm.form.nombre_filles.value.value"
                :error-messages="projectForm.form.nombre_filles.errorMessage.value"
                @blur="projectForm.form.nombre_filles.handleBlur"
                required
                controlVariant="stacked"
                clearable
              />
            </div>
            <div class="d-flex ga-2">
              <v-number-input
                variant="outlined"
                :label="$t('projects.form.fields.nombre_garcons')"
                :placeholder="$t('projects.form.placeholders.nombre_garcons')"
                v-model="projectForm.form.nombre_garcons.value.value"
                :error-messages="projectForm.form.nombre_garcons.errorMessage.value"
                @blur="projectForm.form.nombre_garcons.handleBlur"
                required
                controlVariant="stacked"
                clearable
              />
              <v-number-input
                variant="outlined"
                :label="$t('projects.form.fields.nombre_personnes_atteintes')"
                :placeholder="$t('projects.form.placeholders.nombre_personnes_atteintes')"
                v-model="projectForm.form.nombre_personnes_atteintes.value.value"
                :error-messages="projectForm.form.nombre_personnes_atteintes.errorMessage.value"
                @blur="projectForm.form.nombre_personnes_atteintes.handleBlur"
                required
                controlVariant="stacked"
                clearable
              />
            </div>
            <div class="d-flex ga-2">
              <v-number-input
                variant="outlined"
                :label="$t('projects.form.fields.nombre_personnes_handicapees')"
                :placeholder="$t('projects.form.placeholders.nombre_personnes_handicapees')"
                v-model="projectForm.form.nombre_personnes_handicapees.value.value"
                :error-messages="projectForm.form.nombre_personnes_handicapees.errorMessage.value"
                @blur="projectForm.form.nombre_personnes_handicapees.handleBlur"
                required
                controlVariant="stacked"
                clearable
              />
              <v-number-input
                variant="outlined"
                :label="$t('projects.form.fields.nombre_personnes_agees')"
                :placeholder="$t('projects.form.placeholders.nombre_personnes_agees')"
                v-model="projectForm.form.nombre_personnes_agees.value.value"
                :error-messages="projectForm.form.nombre_personnes_agees.errorMessage.value"
                @blur="projectForm.form.nombre_personnes_agees.handleBlur"
                required
                controlVariant="stacked"
                clearable
              />
            </div>
          </div>
        </div>
      </div>
    </v-card>

    <v-dialog v-model="showStartDatePicker" max-width="400px">
      <v-card>
        <v-card-title>{{ $t('projects.form.fields.date_debut_projet') }}</v-card-title>
        <v-card-text>
          <v-date-picker
            v-model="tempStartDate"
            @update:model-value="onStartDateSelected"
            full-width
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showStartDatePicker = false">{{ $t('forms.cancel') }}</v-btn>
          <v-btn @click="confirmStartDate" color="primary">{{ $t('forms.confirm') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showEndDatePicker" max-width="400px">
      <v-card>
        <v-card-title>{{ $t('projects.form.fields.date_fin_projet') }}</v-card-title>
        <v-card-text>
          <v-date-picker v-model="tempEndDate" @update:model-value="onEndDateSelected" full-width />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showEndDatePicker = false">{{ $t('forms.cancel') }}</v-btn>
          <v-btn @click="confirmEndDate" color="primary">{{ $t('forms.confirm') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>
<script setup lang="ts">
import { InterventionSector } from '@/models/enums/InterventionSector'
import { NotificationType } from '@/models/enums/NotificationType'
import { ProjectBeneficiaryType } from '@/models/enums/projects/ProjectBeneficiaryType'
import { ProjectFunder } from '@/models/enums/projects/ProjectFunder'
import { ProjectServiceType } from '@/models/enums/projects/ProjectServiceType'
import { ProjectStatus } from '@/models/enums/projects/ProjectStatus'
import type { Project, ProjectUpdate } from '@/models/interfaces/Project'
import { i18n } from '@/plugins/i18n'
import { CommonFormService } from '@/services/forms/CommonFormService'
import { addNotification } from '@/services/NotificationsService'
import { ProjectFormService } from '@/services/projects/ProjectFormService'
import { formatDateToString } from '@/services/utils/FormatDate'
import { PROJECT_SERVICES_BY_SECTOR } from '@/services/utils/ProjectServiceList'
import { useAdminBoundariesStore } from '@/stores/adminBoundariesStore'
import { useAuthenticationStore } from '@/stores/authStore'
import { useProjectsStore } from '@/stores/projectsStore'
import { computed, onMounted, ref } from 'vue'

const projectsStore = useProjectsStore()
const authStore = useAuthenticationStore()
const adminBoundariesStore = useAdminBoundariesStore()
const showDialog = computed(
  () => projectsStore.projectToEdit !== null || projectsStore.projectToCreate !== null,
)
const projectForm = ProjectFormService.getProjectForm(projectsStore.projectToEdit)
const showStartDatePicker = ref(false)
const showEndDatePicker = ref(false)
const tempStartDate = ref<Date | null>(null)
const tempEndDate = ref<Date | null>(null)

onMounted(async () => {
  await adminBoundariesStore.fetchBoundaries()
  if (!projectsStore.projectToEdit) {
    projectForm.form.consortium.value.value = false
  }
})
const territoriesList = computed(() => {
  if (!projectForm.form.province.value.value) {
    return adminBoundariesStore.territoriesList
  } else {
    return adminBoundariesStore.territoriesList.filter((t) =>
      projectForm.form.province.value.value.includes(t.province_c),
    )
  }
})

const healthZonesList = computed(() => {
  if (!projectForm.form.territoire.value.value) {
    return adminBoundariesStore.healthZonesList
  } else {
    return adminBoundariesStore.healthZonesList.filter((h) =>
      projectForm.form.territoire.value.value.includes(h.territoire_c),
    )
  }
})

function updateTerritories() {
  projectForm.form.territoire.value.value = projectForm.form.territoire.value.value.filter((t) => {
    const territory = adminBoundariesStore.territoriesList.find(
      (territory) => territory.territoire === t,
    )
    if (!territory) {
      return false
    }
    return projectForm.form.province.value.value.includes(territory.province_c)
  })
}

function updateHealthZones() {
  projectForm.form.zone_sante.value.value = projectForm.form.zone_sante?.value.value.filter((h) => {
    const healthZone = adminBoundariesStore.healthZonesList.find(
      (healthZone) => healthZone.zone_sante === h,
    )
    if (!healthZone) {
      return false
    }
    return projectForm.form.territoire.value.value.includes(healthZone.territoire_c)
  })
}

function openDatePicker(type: 'start' | 'end') {
  if (type === 'start') {
    tempStartDate.value = projectForm.form.date_debut_projet.value.value
      ? new Date(projectForm.form.date_debut_projet.value.value)
      : null
    showStartDatePicker.value = true
  } else {
    tempEndDate.value = projectForm.form.date_fin_projet.value.value
      ? new Date(projectForm.form.date_fin_projet.value.value)
      : null
    showEndDatePicker.value = true
  }
}

function onStartDateSelected(date: Date | null) {
  tempStartDate.value = date
}

function onEndDateSelected(date: Date | null) {
  tempEndDate.value = date
}

function confirmStartDate() {
  if (tempStartDate.value) {
    projectForm.form.date_debut_projet.value.value = formatDateToString(tempStartDate.value)
  }
  showStartDatePicker.value = false
}

function confirmEndDate() {
  if (tempEndDate.value) {
    projectForm.form.date_fin_projet.value.value = formatDateToString(tempEndDate.value)
  }
  showEndDatePicker.value = false
}

const projectServicesList = computed(() => {
  return ProjectFormService.getProjectServiceTypesForSector(
    projectForm.form.secteurs_intervention.value.value as InterventionSector[],
  )
})

const translatedProjectServicesList = computed(() => {
  return projectServicesList.value.map((service) => {
    const serviceLabel =
      i18n.t('projects.form.lists.serviceTypes', {})[service as unknown as number] || service

    // If several sectors are selected, precise it in service label
    let title = serviceLabel
    if (
      projectForm.form.secteurs_intervention.value.value &&
      (projectForm.form.secteurs_intervention.value.value as InterventionSector[]).length > 1
    ) {
      console.log('here')
      const sector = Object.keys(PROJECT_SERVICES_BY_SECTOR).find((sectorKey) =>
        PROJECT_SERVICES_BY_SECTOR[sectorKey as InterventionSector].includes(service),
      ) as InterventionSector

      if (sector) {
        const sectorLabel = i18n.t(`intervention_sector.${sector}`) || sector
        title = `${serviceLabel} - ${sectorLabel}`
      }
    }

    return {
      value: service,
      title: title,
    }
  })
})

const createProject = projectForm.handleSubmit(
  async (values) => {
    const sanitizedData = CommonFormService.sanitizeFormData(values)
    const newProject = {
      ...sanitizedData,
      association_id: projectsStore.projectToCreate as string,
    }
    projectsStore.createProject(newProject as unknown as Project)
  },
  ({ errors }) => {
    console.error(errors)
    addNotification(i18n.t('forms.errors.formNotValid'), NotificationType.ERROR)
  },
)

const submitUpdate = projectForm.handleSubmit(
  async (values) => {
    const sanitizedData = CommonFormService.sanitizeFormData(values)
    if (projectsStore.projectToEdit) {
      // If this project already have an update submitted, use the update id
      const projectId = (projectsStore.projectToEdit as ProjectUpdate).projet_id
        ? (projectsStore.projectToEdit as ProjectUpdate).projet_id
        : projectsStore.projectToEdit!.id
      const updatedProject: ProjectUpdate = {
        ...sanitizedData,
        association_id: projectsStore.projectToEdit!.association_id,
        projet_id: projectId,
      }
      await projectsStore.submitUpdate(updatedProject)
    } else {
      createProject()
    }
  },
  ({ errors }) => {
    console.error(errors)
    addNotification(i18n.t('forms.errors.formNotValid'), NotificationType.ERROR)
  },
)

function refuseUpdate() {
  if (projectsStore.projectToEdit?.newProject) {
    projectsStore.refuseNewProject(projectsStore.projectToEdit!.id as unknown as number)
  } else {
    projectsStore.refuseUpdate(projectsStore.projectToEdit!.id as unknown as number)
  }
}

const validateUpdate = projectForm.handleSubmit(
  async (values) => {
    const sanitizedData = CommonFormService.sanitizeFormData(values)
    if (projectsStore.projectToEdit?.newProject) {
      const newProject: Project = {
        ...sanitizedData,
        association_id: projectsStore.projectToEdit!.association_id,
      }
      await projectsStore.validateNewProject(newProject)
    } else {
      // If this association already have an update submitted, use the update id
      const projectId = (projectsStore.projectToEdit as ProjectUpdate).projet_id
        ? (projectsStore.projectToEdit as ProjectUpdate).projet_id
        : projectsStore.projectToEdit!.id
      const updatedProject: Project = {
        ...sanitizedData,
        id: projectId,
      }
      await projectsStore.validateUpdate(updatedProject)
    }
  },
  ({ errors }) => {
    console.error(errors)
    addNotification(i18n.t('forms.errors.formNotValid'), NotificationType.ERROR)
  },
)
</script>
<style lang="scss" scoped>
.ProjectForm__serviceType {
  width: 100%;
}
</style>
