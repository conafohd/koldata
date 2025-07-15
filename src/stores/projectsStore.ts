import { NotificationType } from "@/models/enums/NotificationType"
import type { Project, ProjectUpdate } from "@/models/interfaces/Project"
import { i18n } from "@/plugins/i18n"
import { addNotification } from "@/services/NotificationsService"
import { ProjectDbService } from "@/services/projects/ProjectDbService"
import { defineStore } from "pinia"
import { ref, type Ref } from "vue"

export const useProjectsStore = defineStore('projects', () => {
    const projectsList: Ref<Project[]> = ref([])
    const updateslist: Ref<ProjectUpdate[]> = ref([])
    const selectedProject: Ref<Project | null> = ref(null)
    const projectToEdit: Ref<Project | null> = ref(null)

    async function getProjectsList(force = false) {
        if (!force && projectsList.value.length > 0) return
        try {
            const { projects, updates } = await ProjectDbService.getProjects();
            projectsList.value = projects;
            updateslist.value = updates;
        } catch (error) {
            console.log('Error fetching associations:', error)
        }
    }

    function activeProjectEdition(id: string) {
        const updateSubmission = updateslist.value.find(project => project.projet_id === id)
        if (updateSubmission) {
            projectToEdit.value = updateSubmission
        } else {
            const project = projectsList.value.find(project => project.id === id)
            if (project) {
                projectToEdit.value = project
            } else {
                addNotification(i18n.t('projects.projectNotFound'), NotificationType.ERROR)
            }
        }
    }

    async function submitUpdate(project: ProjectUpdate) {
        try {
            await ProjectDbService.submitProjectUpdate(project)
            await getProjectsList(true)
            projectToEdit.value = null
        } catch (error) {
            console.error(error)
        }
    }

    async function refuseUpdate(id: number, raiseResult: boolean = true) {
        try {
            await ProjectDbService.removeProjectUpdate(id, raiseResult)
            projectToEdit.value = null
            await getProjectsList(true)
        } catch (error) {
            console.error(error)
        }
    }

    async function validateUpdate(project: Project) {
    try {
      await ProjectDbService.validateProjectUpdate(project)
      if (projectToEdit.value!.waiting_for_validation) {
        await refuseUpdate(projectToEdit.value!.id as unknown as number, false)
      }
      await getProjectsList(true)
      projectToEdit.value = null
    } catch (error) {
      console.error(error)
    }
  }

    return { projectsList, selectedProject, projectToEdit, getProjectsList, activeProjectEdition, submitUpdate, refuseUpdate, validateUpdate }
})