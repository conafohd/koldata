<template>
  <v-dialog v-model="showDialog" fullscreen>
    <v-toolbar :color="authStore.isAdmin ? 'main-purple' : 'main-blue'">
      <v-btn icon="$close" @click="projectsStore.projectToEdit = null"></v-btn>
      <v-toolbar-title>{{ $t('projects.form.title') }}</v-toolbar-title>
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
                v-if="projectsStore.projectToEdit?.waiting_for_validation"
                >{{ $t('admin.refuseUpdate') }}</v-btn
              >
            </template>
          </v-tooltip>
          <v-tooltip :text="$t('admin.acceptUpdateDisclaimer')" bottom>
            <template v-slot:activator="{ props }">
              <v-btn
                @click="validateUpdate"
                variant="flat"
                color="main-purple"
                v-bind="props"
                :loading="projectForm.isSubmitting.value"
                >{{
                  projectsStore.projectToEdit?.waiting_for_validation
                    ? $t('admin.acceptUpdate')
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
  </v-dialog>
</template>
<script setup lang="ts">
import { NotificationType } from '@/models/enums/NotificationType'
import type { Project, ProjectUpdate } from '@/models/interfaces/Project'
import { i18n } from '@/plugins/i18n'
import { CommonFormService } from '@/services/forms/CommonFormService'
import { addNotification } from '@/services/NotificationsService'
import { ProjectFormService } from '@/services/projects/ProjectFormService'
import { useAuthenticationStore } from '@/stores/authStore'
import { useProjectsStore } from '@/stores/projectsStore'
import { computed } from 'vue'

const projectsStore = useProjectsStore()
const authStore = useAuthenticationStore()
const showDialog = computed(() => projectsStore.projectToEdit !== null)

const projectForm = ProjectFormService.getProjectForm(projectsStore.projectToEdit)

const submitUpdate = projectForm.handleSubmit(
  async (values) => {
    const sanitizedData = CommonFormService.sanitizeFormData(values)
    // If this project already have an update submitted, use the update id
    const projectId = (projectsStore.projectToEdit as ProjectUpdate).projet_id
      ? (projectsStore.projectToEdit as ProjectUpdate).association_id
      : projectsStore.projectToEdit!.id
    const updatedProject: ProjectUpdate = {
      ...sanitizedData,
      projet_id: projectId,
    }
    // await projectsStore.submitUpdate(updatedProject)
  },
  ({ errors }) => {
    console.error(errors)
    addNotification(i18n.t('forms.errors.formNotValid'), NotificationType.ERROR)
  },
)

function refuseUpdate() {
  console.log('refuse')
  // projectsStore.refuseUpdate(projectsStore.projectToEdit!.id as unknown as number)
}

const validateUpdate = projectForm.handleSubmit(
  async (values) => {
    const sanitizedData = CommonFormService.sanitizeFormData(values)
    // If this association already have an update submitted, use the update id
    const projectId = (projectsStore.projectToEdit as ProjectUpdate).projet_id
      ? (projectsStore.projectToEdit as ProjectUpdate).projet_id
      : projectsStore.projectToEdit!.id
    const updatedProject: Project = {
      ...sanitizedData,
      id: projectId,
    }
    // await projectsStore.validateUpdate(updatedProject)
  },
  ({ errors }) => {
    console.error(errors)
    addNotification(i18n.t('forms.errors.formNotValid'), NotificationType.ERROR)
  },
)
</script>
