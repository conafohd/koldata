import { NotificationType } from "@/models/enums/NotificationType"
import type { Association, AssociationUpdate } from "@/models/interfaces/Association"
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
            return {
                projects: projects,
                updates: update_submissions
            }
        }
    }

    public static async submitAssociationUpdate(association: AssociationUpdate) {
        const { error } = await supabase.rpc('submit_association_update', association)
        if (error) {
            addNotification(i18n.t('associations.updateError'), NotificationType.ERROR)
        throw error
        } else {
            addNotification(i18n.t('associations.updateSuccess'), NotificationType.SUCCESS)
        }
    }

    public static async removeAssociationUpdate(id: number, raiseResult: boolean) {
        const { error } = await supabase.from('associations_maj').delete().eq('id', id)
        if (error && raiseResult) {
            addNotification(i18n.t('associations.updateDeletionError'), NotificationType.ERROR)
        throw error
        } else {
            if (raiseResult) {
                addNotification(i18n.t('associations.updateDeletionSuccess'), NotificationType.SUCCESS)
            }
        }
    }

    public static async validateAssociationUpdate(association: Association) {
        const { error } = await supabase.from('associations').update(association).eq('id', association.id)
        if (error) {
            addNotification(i18n.t('associations.updateError'), NotificationType.ERROR)
            throw error
        } else {
            addNotification(i18n.t('admin.validationSuccess'), NotificationType.SUCCESS)
        }
    }
}