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

    return { projectsList, selectedProject, projectToEdit, getProjectsList, activeProjectEdition }
})