import { NotificationType } from "@/models/enums/NotificationType"
import type { Association, AssociationUpdate } from "@/models/interfaces/Association"
import { i18n } from "@/plugins/i18n"
import { supabase } from "@/plugins/supabase"
import { addNotification } from "@/services/NotificationsService"

export class AssociationDbService {
    public static async getAssociations() {
        const { data: associations, error } = await supabase.from('associations').select('*')
        if (error) {
            addNotification(i18n.t('associations.fetchError'), NotificationType.ERROR)
            throw error
        } else {
            const { data: update_submissions, error } = await supabase.from('associations_maj').select('*')
            if (error) {
                addNotification(i18n.t('associations.fetchError'), NotificationType.ERROR)
                throw error
            } else {
                update_submissions.forEach((updated_submission: AssociationUpdate) => {
                    const association = associations.find((association: Association) => association.id === updated_submission.association_id)
                    if (association) {
                        association.waiting_for_validation = true
                        updated_submission.waiting_for_validation = true
                    }
                })
            }
            return {
                associations: associations,
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