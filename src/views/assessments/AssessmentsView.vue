<template>
  <div class="AssessmentsView">
    <div class="AssessmentsView__hero app-card app-card--flat">
      <div class="AssessmentsView__heroLeft">
        <div class="AssessmentsView__heroIcon">
          <v-icon icon="$fileCheckOutline" color="main-blue" size="24" />
        </div>
        <div>
          <h2 class="AssessmentsView__heroTitle">{{ $t('assessments.title') }}</h2>
          <p class="AssessmentsView__heroSub">{{ $t('assessments.intro') }}</p>
        </div>
      </div>
      <v-btn
        v-if="canEdit"
        color="main-blue"
        flat
        prepend-icon="$plus"
        @click="handleCreate"
        :loading="creating"
      >
        {{ $t('assessments.newAssessment') }}
      </v-btn>
    </div>

    <v-progress-linear v-if="assessmentsStore.isLoading" indeterminate color="main-blue" class="mb-2" />

    <AssessmentList
      :assessments="assessmentsStore.assessmentsList"
      @open="goToEdit($event.id)"
      @view-report="goToReport($event.id)"
    />
  </div>
</template>

<script setup lang="ts">
import { useApplicationStore } from '@/stores/applicationStore'
import { useAssessmentsStore } from '@/stores/assessmentsStore'
import { useAuthenticationStore } from '@/stores/authStore'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AssessmentList from './components/AssessmentList.vue'

const route = useRoute()
const router = useRouter()
const applicationStore = useApplicationStore()
const assessmentsStore = useAssessmentsStore()
const authStore = useAuthenticationStore()

const associationId = computed(() => route.params.id as string)
const creating = ref(false)

const canEdit = computed(() => authStore.canEditAssociation(associationId.value))

onMounted(async () => {
  applicationStore.setActiveTab()
  applicationStore.isLoading = false
  await assessmentsStore.getAssessments(associationId.value)
})

async function handleCreate() {
  creating.value = true
  const created = await assessmentsStore.createAssessment({
    association_id: associationId.value,
    finalized_at: null,
    title: '',
    period_start: null,
    period_end: null,
    fields: { sections: { answers: {} } },
  })
  if (created) goToEdit(created.id)
  creating.value = false
}

function goToEdit(assessmentId: string) {
  router.push({ name: 'assessments-edit', params: { id: associationId.value, assessmentId } })
}

function goToReport(assessmentId: string) {
  router.push({ name: 'assessments-report', params: { id: associationId.value, assessmentId } })
}
</script>

<style scoped lang="scss">
.AssessmentsView {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
}

.AssessmentsView__hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.AssessmentsView__heroLeft {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
}

.AssessmentsView__heroIcon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: rgba(50, 92, 142, 0.1);
  flex-shrink: 0;
}

.AssessmentsView__heroTitle {
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.2;
  color: #1e293b;
  margin: 0;
}

.AssessmentsView__heroSub {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0.2rem 0 0;
  line-height: 1.5;
}
</style>
