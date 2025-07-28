import { NotificationType } from "@/models/enums/NotificationType"
import type { Project, ProjectUpdate } from "@/models/interfaces/Project"
import { i18n } from "@/plugins/i18n"
import { addNotification } from "@/services/NotificationsService"
import { ProjectDbService } from "@/services/projects/ProjectDbService"
import { defineStore } from "pinia"
import { ref, type Ref } from "vue"
import { useAuthenticationStore } from "./authStore"

export const useProjectsStore = defineStore('projects', () => {
    const projectsList: Ref<Project[]> = ref([])
    const updateslist: Ref<ProjectUpdate[]> = ref([])
    const newProjectsList: Ref<Project[]> = ref([])
    const selectedProject: Ref<Project | null> = ref(null)
    const projectToEdit: Ref<Project | null> = ref(null)
    const projectToCreate: Ref<string | null> = ref(null)

    async function getProjectsList(force = false) {
        if (!force && projectsList.value.length > 0) return
        try {
            const { projects, updates, newProjects } = await ProjectDbService.getProjects();
            projectsList.value = projects;
            updateslist.value = updates;
            newProjectsList.value = newProjects;
        } catch (error) {
            console.log('Error fetching associations:', error)
        }
    }

    async function activeProjectCreation(associationId: string) {
        projectToCreate.value = associationId
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

    function activeNewProjectEdition(id: string) {
        const project = newProjectsList.value.find(project => project.id === id)
        console.log('activeNewProjectEdition', project)
        if (project) {
            projectToEdit.value = project
        } else {
            addNotification(i18n.t('projects.projectNotFound'), NotificationType.ERROR)
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

    async function refuseNewProject(id: number) {
        try {
            await ProjectDbService.removeNewProject(id, true)
            projectToEdit.value = null
            await getProjectsList(true)
        } catch (error) {
            console.error(error)
        }
    }

    async function validateUpdate(project: Project) {
        try {
            await ProjectDbService.validateProjectUpdate(project)
            if (projectToEdit.value?.waiting_for_validation) {
                await refuseUpdate(projectToEdit.value!.id as unknown as number, false)
            }
            await getProjectsList(true)
            projectToEdit.value = null
        } catch (error) {
            console.error(error)
        }
    }

    async function validateNewProject(project: Project) {
        try {
            await ProjectDbService.validateNewProject(project)
            await refuseNewProject(projectToEdit.value?.id as unknown as number)
            projectToEdit.value = null
            await getProjectsList(true)
        } catch (error) {
            console.error(error)
        }
    }

    async function createProject(project: Project) {
        try {
            await ProjectDbService.createProject(project, useAuthenticationStore().isAdmin)
            addNotification(i18n.t('projects.createSuccess'), NotificationType.SUCCESS)
            projectToCreate.value = null
            await getProjectsList(true)
        } catch (error) {
            console.error(error)
            addNotification(i18n.t('projects.createError'), NotificationType.ERROR)
        }
    }

    async function deleteProject(projectId: string) {
        try {
            await ProjectDbService.deleteProject(projectId)
            addNotification(i18n.t('projects.deleteProjectSuccess'), NotificationType.SUCCESS)
            await getProjectsList(true)
        } catch (error) {
            console.error(error)
            addNotification(i18n.t('projects.deleteProjectError'), NotificationType.ERROR)
        }
    }

    return { projectsList, selectedProject, newProjectsList, projectToEdit, projectToCreate, getProjectsList, activeProjectEdition, activeNewProjectEdition, activeProjectCreation, submitUpdate, refuseUpdate, refuseNewProject, validateUpdate, validateNewProject, createProject, deleteProject }
})