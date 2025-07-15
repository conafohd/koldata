import { NotificationType } from "@/models/enums/NotificationType"
import type { Project, ProjectUpdate } from "@/models/interfaces/Project"
import { i18n } from "@/plugins/i18n"
import { supabase } from "@/plugins/supabase"
import { addNotification } from "@/services/NotificationsService"

export class ProjectDbService {
    public static async getProjects() {
        const { data: projects, error } = await supabase.from('projets').select('*')
        if (error) {
            addNotification(i18n.t('projects.fetchError'), NotificationType.ERROR)
            throw error
        } else {
            const { data: update_submissions, error } = await supabase.from('projets_maj').select('*')
            if (error) {
                addNotification(i18n.t('projects.fetchError'), NotificationType.ERROR)
                throw error
            } else {
                update_submissions.forEach((updated_submission: ProjectUpdate) => {
                    const projet = projects.find((project: Project) => project.id === updated_submission.projet_id)
                    if (projet) {
                        projet.waiting_for_validation = true
                        updated_submission.waiting_for_validation = true
                    }
                })
            }
            const { data: new_projects, error: errorNewProjects } = await supabase.from('projets_new').select('*')
            if (errorNewProjects) {
                addNotification(i18n.t('projects.fetchError'), NotificationType.ERROR)
                throw error
            }
            return {
                projects: projects,
                updates: update_submissions,
                newProjects: new_projects.map((project: Project) => {
                    project.newProject = true
                    return project
                })
            }
        }
    }

    public static async submitProjectUpdate(project: ProjectUpdate) {
        const { error } = await supabase.rpc('submit_projet_update', project)
        if (error) {
            addNotification(i18n.t('projects.updateError'), NotificationType.ERROR)
            throw error
        } else {
            addNotification(i18n.t('projects.updateSuccess'), NotificationType.SUCCESS)
        }
    }

    public static async removeProjectUpdate(id: number, raiseResult: boolean) {
        const { error } = await supabase.from('projets_maj').delete().eq('id', id)
        if (error && raiseResult) {
            addNotification(i18n.t('projects.updateDeletionError'), NotificationType.ERROR)
            throw error
        } else {
            if (raiseResult) {
                addNotification(i18n.t('projects.updateDeletionSuccess'), NotificationType.SUCCESS)
            }
        }
    }

    public static async removeNewProject(id: number, raiseResult: boolean) {
        const { error } = await supabase.from('projets_new').delete().eq('id', id)
        if (error && raiseResult) {
            addNotification(i18n.t('projects.updateDeletionError'), NotificationType.ERROR)
            throw error
        } else {
            if (raiseResult) {
                addNotification(i18n.t('projects.updateDeletionSuccess'), NotificationType.SUCCESS)
            }
        }
    }

    public static async validateProjectUpdate(project: Project) {
        const { error } = await supabase.from('projets').update(project).eq('id', project.id)
        if (error) {
            addNotification(i18n.t('projects.updateError'), NotificationType.ERROR)
            throw error
        } else {
            addNotification(i18n.t('admin.validationSuccess'), NotificationType.SUCCESS)
        }
    }

    public static async validateNewProject(project: Project) {
        const { error } = await supabase.from('projets').insert(project)
        if (error) {
            addNotification(i18n.t('projects.createError'), NotificationType.ERROR)
            throw error
        } else {
            addNotification(i18n.t('projects.createSuccess'), NotificationType.SUCCESS)
        }
    }

    public static async createProject(project: Project, isAdmin: boolean = false) {
        const { error } = await supabase.from(isAdmin ? 'projets' : 'projets_new').insert(project)
        if (error) {
            addNotification(i18n.t('projects.createError'), NotificationType.ERROR)
            throw error
        } else {
            addNotification(i18n.t('projects.createSuccess'), NotificationType.SUCCESS)
        }
    }

    public static async deleteProject(id: string) {
        const { error } = await supabase.from('projets').delete().eq('id', id)
        if (error) {
            addNotification(i18n.t('projects.deleteProjectError'), NotificationType.ERROR)
            throw error
        } else {
            addNotification(i18n.t('projects.deleteProjectSuccess'), NotificationType.SUCCESS)
        }
    }
}