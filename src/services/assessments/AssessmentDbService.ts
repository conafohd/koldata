import { NotificationType } from '@/models/enums/NotificationType'
import { TablesList } from '@/models/enums/TablesList'
import type { Assessment, AssessmentCreate, AssessmentUpdate } from '@/models/interfaces/Assessment'
import { i18n } from '@/plugins/i18n'
import { supabase } from '@/plugins/supabase'
import { addNotification } from '@/services/NotificationsService'

export class AssessmentDbService {
  public static async getAssessments(associationId: string): Promise<Assessment[]> {
    const { data, error } = await supabase
      .from(TablesList.ASSESSMENTS)
      .select('*')
      .eq('association_id', associationId)
      .order('created_at', { ascending: false })

    if (error) {
      addNotification(i18n.t('assessments.fetchError'), NotificationType.ERROR)
      throw error
    }

    return data as Assessment[]
  }

  public static async getAssessmentById(id: string): Promise<Assessment> {
    const { data, error } = await supabase
      .from(TablesList.ASSESSMENTS)
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      addNotification(i18n.t('assessments.fetchError'), NotificationType.ERROR)
      throw error
    }

    return data as Assessment
  }

  public static async createAssessment(assessment: AssessmentCreate): Promise<Assessment> {
    const { data, error } = await supabase
      .from(TablesList.ASSESSMENTS)
      .insert(assessment)
      .select()
      .single()

    if (error) {
      addNotification(i18n.t('assessments.createError'), NotificationType.ERROR)
      throw error
    }

    addNotification(i18n.t('assessments.createSuccess'), NotificationType.SUCCESS)
    return data as Assessment
  }

  public static async updateAssessment(id: string, update: AssessmentUpdate): Promise<void> {
    const { error } = await supabase
      .from(TablesList.ASSESSMENTS)
      .update({
        title: update.title,
        period_start: update.period_start || null,
        period_end: update.period_end || null,
        fields: update.fields,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      addNotification(i18n.t('assessments.updateError'), NotificationType.ERROR)
      throw error
    }
  }

  public static async finalizeAssessment(id: string, update: AssessmentUpdate): Promise<void> {
    const { error } = await supabase
      .from(TablesList.ASSESSMENTS)
      .update({
        title: update.title,
        period_start: update.period_start || null,
        period_end: update.period_end || null,
        fields: update.fields,
        finalized_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      addNotification(i18n.t('assessments.finalizeError'), NotificationType.ERROR)
      throw error
    }

    addNotification(i18n.t('assessments.finalizeSuccess'), NotificationType.SUCCESS)
  }

  public static async deleteAssessment(id: string): Promise<void> {
    const { error } = await supabase
      .from(TablesList.ASSESSMENTS)
      .delete()
      .eq('id', id)

    if (error) {
      addNotification(i18n.t('assessments.deleteError'), NotificationType.ERROR)
      throw error
    }

    addNotification(i18n.t('assessments.deleteSuccess'), NotificationType.SUCCESS)
  }
}
