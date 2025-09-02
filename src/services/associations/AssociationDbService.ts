import { DBFunction } from "@/models/enums/DBFunction"
import { NotificationType } from "@/models/enums/NotificationType"
import { TablesList } from "@/models/enums/TablesList"
import type { Association, AssociationUpdate } from "@/models/interfaces/Association"
import { i18n } from "@/plugins/i18n"
import { supabase } from "@/plugins/supabase"
import { addNotification } from "@/services/NotificationsService"

export class AssociationDbService {
    public static async getAssociations() {
        const { data: associations, error } = await supabase.from(TablesList.ASSOCIATIONS).select('*')
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
            const { data: new_associations, error: errorNewAssociations } = await supabase.from(TablesList.ASSOCIATIONS_NEW).select('*')
            if (errorNewAssociations) {
                addNotification(i18n.t('associations.fetchError'), NotificationType.ERROR)
                throw errorNewAssociations
            }
            return {
                associations: associations,
                updates: update_submissions,
                newAssociations: new_associations.map((association: Association) => {
                    association.newAssociation = true
                    return association
                })
            }
        }
    }

    public static async createAssociation(association: Association, isAdmin: boolean = false) {
        const { error } = await supabase.from(isAdmin ? TablesList.ASSOCIATIONS : TablesList.ASSOCIATIONS_NEW).insert(association)
        if (error) {
            addNotification(i18n.t('associations.creationError'), NotificationType.ERROR)
            throw error
        } else {
            addNotification(i18n.t('associations.creationSuccess'), NotificationType.SUCCESS)
        }
    }

    public static async submitAssociationUpdate(association: AssociationUpdate) {
        const { error } = await supabase.rpc(DBFunction.ASSOCIATION_UPDATE, association)
        if (error) {
            addNotification(i18n.t('associations.updateError'), NotificationType.ERROR)
        throw error
        } else {
            addNotification(i18n.t('associations.updateSuccess'), NotificationType.SUCCESS)
        }
    }

    public static async removeAssociationUpdate(id: number, raiseResult: boolean) {
        const { error } = await supabase.from(TablesList.ASSOCIATIONS_UPDATE).delete().eq('id', id)
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
        association.updated_at = new Date().toISOString()
        const { error } = await supabase.from(TablesList.ASSOCIATIONS).update(association).eq('id', association.id)
        if (error) {
            addNotification(i18n.t('associations.updateError'), NotificationType.ERROR)
            throw error
        } else {
            addNotification(i18n.t('admin.validationSuccess'), NotificationType.SUCCESS)
        }
    }

    public static async validateNewAssociation(association: Association): Promise<string> {
        const { data, error } = await supabase
            .from(TablesList.ASSOCIATIONS)
            .insert(association)
            .select('id')
            .single()
        
        if (error) {
            addNotification(i18n.t('associations.createError'), NotificationType.ERROR)
            throw error
        } else {
            addNotification(i18n.t('associations.createSuccess'), NotificationType.SUCCESS)
            return data.id
        }
    }


    public static async removeNewAssociation(id: number, raiseResult: boolean) {
        const { error } = await supabase.from(TablesList.ASSOCIATIONS_NEW).delete().eq('id', id)
        if (error && raiseResult) {
            addNotification(i18n.t('associations.updateDeletionError'), NotificationType.ERROR)
            throw error
        } else {
            if (raiseResult) {
                addNotification(i18n.t('associations.updateDeletionSuccess'), NotificationType.SUCCESS)
            }
        }
    }

    public static async removeAssociation(id: string) {
        const { error } = await supabase.from(TablesList.ASSOCIATIONS).delete().eq('id', id)
        if (error) {
            addNotification(i18n.t('associations.deleteAssociationError'), NotificationType.ERROR)
            throw error
        } else {
            addNotification(i18n.t('associations.deleteAssociationSuccess'), NotificationType.SUCCESS)
        }
    }
}