<template>
  <div class="AssessmentsFormView">
    <div class="AssessmentsFormView__hero app-card app-card--flat">
      <div class="AssessmentsFormView__heroLeft">
        <div class="AssessmentsFormView__heroIcon">
          <v-icon icon="$circleEditOutline" color="main-blue" size="24" />
        </div>
        <div>
          <h2 class="AssessmentsFormView__heroTitle">
            {{ assessment?.title || $t('assessments.newAssessment') }}
          </h2>
          <p class="AssessmentsFormView__heroSub">{{ $t('assessments.form.heroSub') }}</p>
        </div>
      </div>
      <v-chip
        v-if="assessment"
        :color="assessment.finalized_at ? 'success' : 'main-blue'"
        size="small"
        variant="tonal"
        :prepend-icon="assessment.finalized_at ? '$checkCircle' : '$circleEditOutline'"
      >
        {{ assessment.finalized_at
          ? $t('assessments.status.finalized')
          : $t('assessments.status.inProgress') }}
      </v-chip>
      <v-btn
        v-if="assessment && !assessment.finalized_at"
        variant="tonal"
        color="main-blue"
        size="large"
        :loading="exiting"
        class="ml-2"
        @click="handleSaveAndExit"
      >
        {{ $t('assessments.form.saveAndExit') }}
      </v-btn>
    </div>

    <v-progress-linear v-if="loading" indeterminate color="main-blue" class="mb-4" />

    <template v-if="assessment">
      <AssessmentForm
        ref="formRef"
        :assessment="assessment"
        @saved="onSaved"
        @finalized="onFinalized"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Assessment } from '@/models/interfaces/Assessment'
import { useApplicationStore } from '@/stores/applicationStore'
import { useAssessmentsStore } from '@/stores/assessmentsStore'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AssessmentForm from './components/AssessmentForm.vue'

const route = useRoute()
const router = useRouter()
const applicationStore = useApplicationStore()
const assessmentsStore = useAssessmentsStore()

const associationId = computed(() => route.params.id as string)
const assessmentId = computed(() => route.params.assessmentId as string)

const assessment = ref<Assessment | null>(null)
const loading = ref(false)
const exiting = ref(false)
const formRef = ref<InstanceType<typeof AssessmentForm> | null>(null)

onMounted(async () => {
  applicationStore.setActiveTab()
  applicationStore.isLoading = false
  loading.value = true

  const cached = assessmentsStore.assessmentsList.find((a) => a.id === assessmentId.value)
  if (cached) {
    assessment.value = cached
  } else {
    assessment.value = await assessmentsStore.getAssessmentById(assessmentId.value)
  }

  if (assessment.value) assessmentsStore.openAssessment(assessment.value)
  loading.value = false
})

onUnmounted(() => {
  assessmentsStore.closeAssessment()
})

async function handleSaveAndExit() {
  exiting.value = true
  await formRef.value?.saveDraft()
  exiting.value = false
  router.push({ name: 'assessments', params: { id: associationId.value } })
}

function onSaved() {}

function onFinalized() {
  router.push({ name: 'assessments-report', params: { id: associationId.value, assessmentId: assessmentId.value } })
}
</script>

<style scoped lang="scss">
.AssessmentsFormView {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
}

.AssessmentsFormView__hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.AssessmentsFormView__heroLeft {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
}

.AssessmentsFormView__heroIcon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: rgba(50, 92, 142, 0.1);
  flex-shrink: 0;
}

.AssessmentsFormView__heroTitle {
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.2;
  color: #1e293b;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.AssessmentsFormView__heroSub {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0.2rem 0 0;
  line-height: 1.5;
}
</style>
