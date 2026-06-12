import type { Assessment, AssessmentCreate, AssessmentUpdate } from '@/models/interfaces/Assessment'
import { AssessmentDbService } from '@/services/assessments/AssessmentDbService'
import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'

export const useAssessmentsStore = defineStore('assessments', () => {
  const assessmentsList: Ref<Assessment[]> = ref([])
  const activeAssessment: Ref<Assessment | null> = ref(null)
  const isLoading = ref(false)

  async function getAssessmentById(id: string): Promise<Assessment | null> {
    try {
      return await AssessmentDbService.getAssessmentById(id)
    } catch (error) {
      console.error('Error fetching assessment:', error)
      return null
    }
  }

  async function getAssessments(associationId: string) {
    isLoading.value = true
    try {
      assessmentsList.value = await AssessmentDbService.getAssessments(associationId)
    } catch (error) {
      console.error('Error fetching assessments:', error)
    } finally {
      isLoading.value = false
    }
  }

  async function createAssessment(assessment: AssessmentCreate) {
    try {
      const created = await AssessmentDbService.createAssessment(assessment)
      assessmentsList.value.unshift(created)
      activeAssessment.value = created
      return created
    } catch (error) {
      console.error('Error creating assessment:', error)
      return null
    }
  }

  async function saveAssessment(id: string, update: AssessmentUpdate) {
    try {
      await AssessmentDbService.updateAssessment(id, update)
      const patch = {
        title: update.title,
        period_start: update.period_start,
        period_end: update.period_end,
        fields: update.fields,
      }
      const index = assessmentsList.value.findIndex((a) => a.id === id)
      if (index !== -1) Object.assign(assessmentsList.value[index], patch)
      if (activeAssessment.value?.id === id) Object.assign(activeAssessment.value, patch)
    } catch (error) {
      console.error('Error saving assessment:', error)
    }
  }

  async function finalizeAssessment(id: string, update: AssessmentUpdate) {
    try {
      await AssessmentDbService.finalizeAssessment(id, update)
      const now = new Date().toISOString()
      const patch = {
        title: update.title,
        period_start: update.period_start,
        period_end: update.period_end,
        fields: update.fields,
        finalized_at: now,
      }
      const index = assessmentsList.value.findIndex((a) => a.id === id)
      if (index !== -1) Object.assign(assessmentsList.value[index], patch)
      if (activeAssessment.value?.id === id) Object.assign(activeAssessment.value, patch)
    } catch (error) {
      console.error('Error finalizing assessment:', error)
    }
  }

  async function deleteAssessment(id: string) {
    try {
      await AssessmentDbService.deleteAssessment(id)
      assessmentsList.value = assessmentsList.value.filter((a) => a.id !== id)
      if (activeAssessment.value?.id === id) activeAssessment.value = null
    } catch (error) {
      console.error('Error deleting assessment:', error)
    }
  }

  function openAssessment(assessment: Assessment) {
    activeAssessment.value = assessment
  }

  function closeAssessment() {
    activeAssessment.value = null
  }

  return {
    assessmentsList,
    activeAssessment,
    isLoading,
    getAssessmentById,
    getAssessments,
    createAssessment,
    saveAssessment,
    finalizeAssessment,
    deleteAssessment,
    openAssessment,
    closeAssessment,
  }
})
