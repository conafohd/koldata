<template>
  <div class="AssessmentsLayout">
    <AppBreadcrumb :items="breadcrumbItems" />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import AppBreadcrumb, { type BreadcrumbItem } from '@/components/AppBreadcrumb.vue'
import { useAssessmentsStore } from '@/stores/assessmentsStore'
import { useAssociationsStore } from '@/stores/associationsStore'
import { storeToRefs } from 'pinia'
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const route = useRoute()
const { t } = useI18n()
const associationsStore = useAssociationsStore()
const assessmentsStore = useAssessmentsStore()

const { associationsList } = storeToRefs(associationsStore)
const { activeAssessment, assessmentsList } = storeToRefs(assessmentsStore)

onMounted(() => {
  if (!associationsList.value.length) {
    associationsStore.getAssociationsList()
  }
})

const associationId = computed(() => route.params.id as string)
const assessmentId = computed(() => route.params.assessmentId as string | undefined)
const isReportPage = computed(() => route.name === 'assessments-report')
const isFormPage = computed(() => route.name === 'assessments-edit')

const association = computed(() =>
  associationsList.value.find((a) => a.id === associationId.value),
)

const reportAssessment = computed(() =>
  assessmentId.value ? assessmentsList.value.find((a) => a.id === assessmentId.value) : null,
)

const breadcrumbItems = computed<BreadcrumbItem[]>(() => {
  const crumbs: BreadcrumbItem[] = [
    { title: t('header.tabs.associations'), to: '/associations' },
    { title: association.value?.nom ?? '…', to: `/associations/${associationId.value}` },
    {
      title: t('assessments.title'),
      to: `/associations/${associationId.value}/assessments`,
      disabled: !isReportPage.value && !isFormPage.value,
    },
  ]

  if (isFormPage.value && activeAssessment.value) {
    crumbs.push({
      title: activeAssessment.value.title || t('assessments.newAssessment'),
      disabled: true,
    })
  }

  if (isReportPage.value) {
    crumbs.push({
      title: reportAssessment.value?.title || t('assessments.report.title'),
      disabled: true,
    })
  }

  return crumbs
})
</script>

<style scoped lang="scss">
.AssessmentsLayout {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
}
</style>
