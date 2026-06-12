<template>
  <div class="AssessmentForm">
    <v-alert
      v-if="isFinalized"
      type="info"
      variant="tonal"
      class="mb-6"
    >
      {{ $t('assessments.form.readOnly') }}
    </v-alert>

    <v-stepper v-model="step" :items="steps" alt-labels flat class="AssessmentForm__stepper">
      <!-- Step 1 — Identity -->
      <template #item.1>
        <div class="AssessmentForm__card app-card">
          <div class="form-field">
            <div class="form-label">{{ $t('assessments.form.campaignTitle') }}</div>
            <v-text-field
              v-model="title"
              :placeholder="$t('assessments.form.campaignTitlePlaceholder')"
              variant="outlined"
              density="comfortable"
              :readonly="isFinalized"
              hide-details
              autofocus
            />
          </div>
          <v-row class="mt-2">
            <v-col cols="12" sm="6">
              <div class="form-label mb-1">{{ $t('assessments.form.periodStart') }}</div>
              <v-text-field
                :model-value="formatDate(periodStart)"
                :placeholder="$t('assessments.form.datePlaceholder')"
                variant="outlined"
                density="comfortable"
                readonly
                append-inner-icon="$calendar"
                @click="!isFinalized && openPicker('start')"
                @click:append-inner="!isFinalized && openPicker('start')"
                clearable
                @click:clear="periodStart = ''"
                :error-messages="dateOrderError ? $t('assessments.form.dateOrderError') : ''"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <div class="form-label mb-1">{{ $t('assessments.form.periodEnd') }}</div>
              <v-text-field
                :model-value="formatDate(periodEnd)"
                :placeholder="$t('assessments.form.datePlaceholder')"
                variant="outlined"
                density="comfortable"
                readonly
                append-inner-icon="$calendar"
                @click="!isFinalized && openPicker('end')"
                @click:append-inner="!isFinalized && openPicker('end')"
                clearable
                @click:clear="periodEnd = ''"
                :error-messages="dateOrderError ? $t('assessments.form.dateOrderError') : ''"
              />
            </v-col>
          </v-row>
        </div>
      </template>

      <!-- Step 2 — Questionnaire -->
      <template #item.2>
        <div class="AssessmentForm__card app-card">
          <div class="AssessmentForm__progress">
            <div class="AssessmentForm__progressHeader">
              <span class="form-label">{{ answeredCount }} / {{ totalQuestions }} {{ $t('assessments.form.questionsAnswered') }}</span>
              <span class="AssessmentForm__progressPct">{{ Math.round((answeredCount / totalQuestions) * 100) }}%</span>
            </div>
            <v-progress-linear
              :model-value="(answeredCount / totalQuestions) * 100"
              color="main-blue"
              bg-color="#e2e8f0"
              rounded
              height="6"
            />
          </div>

          <div
            v-for="(group, gi) in questionGroups"
            :key="group.id"
            class="AssessmentForm__group"
            :class="{ 'mt-6': gi > 0 }"
          >
            <div class="AssessmentForm__groupHeader">
              <span class="AssessmentForm__groupIndex">{{ gi + 1 }}</span>
              <span class="AssessmentForm__groupTitle">{{ getLabel(group.label) }}</span>
              <v-chip
                size="x-small"
                :color="groupAnsweredCount(group) === group.questions.length ? 'success' : 'default'"
                variant="tonal"
                class="ml-auto"
              >
                {{ groupAnsweredCount(group) }}/{{ group.questions.length }}
              </v-chip>
            </div>
            <div class="AssessmentForm__questions">
              <div
                v-for="question in group.questions"
                :key="question.id"
                class="AssessmentForm__question"
              >
                <span class="AssessmentForm__questionText">{{ getLabel(question.label) }}</span>
                <v-btn-toggle
                  v-model="answers[question.id]"
                  density="compact"
                  divided
                  rounded="lg"
                  :disabled="isFinalized"
                >
                  <v-btn :value="true" size="small">{{ $t('assessments.form.yes') }}</v-btn>
                  <v-btn :value="false" size="small">{{ $t('assessments.form.no') }}</v-btn>
                </v-btn-toggle>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Step 3 — Review -->
      <template #item.3>
        <div class="AssessmentForm__card app-card">
          <div class="AssessmentForm__review">
            <div class="AssessmentForm__reviewRow">
              <span class="AssessmentForm__reviewLabel">{{ $t('assessments.form.campaignTitle') }}</span>
              <span class="AssessmentForm__reviewValue">{{ title || '—' }}</span>
            </div>
            <div class="AssessmentForm__reviewRow">
              <span class="AssessmentForm__reviewLabel">{{ $t('assessments.form.periodStart') }}</span>
              <span class="AssessmentForm__reviewValue">{{ formatDate(periodStart) || '—' }}</span>
            </div>
            <div class="AssessmentForm__reviewRow">
              <span class="AssessmentForm__reviewLabel">{{ $t('assessments.form.periodEnd') }}</span>
              <span class="AssessmentForm__reviewValue">{{ formatDate(periodEnd) || '—' }}</span>
            </div>
            <div class="AssessmentForm__reviewRow">
              <span class="AssessmentForm__reviewLabel">{{ $t('assessments.form.stepFields') }}</span>
              <div class="AssessmentForm__reviewGroups">
                <div
                  v-for="group in questionGroups"
                  :key="group.id"
                  class="AssessmentForm__reviewGroup"
                >
                  <span class="AssessmentForm__reviewGroupName">{{ getLabel(group.label) }}</span>
                  <v-chip
                    size="x-small"
                    :color="groupAnsweredCount(group) === group.questions.length ? 'success' : 'warning'"
                    variant="tonal"
                  >
                    {{ groupAnsweredCount(group) }}/{{ group.questions.length }}
                  </v-chip>
                </div>
              </div>
            </div>
          </div>
          <v-alert
            v-if="!isFinalized"
            type="warning"
            variant="tonal"
            class="mt-5"
          >
            {{ $t('assessments.form.finalizeWarning') }}
          </v-alert>
        </div>
      </template>

      <template #actions>
        <div class="AssessmentForm__actions">
          <v-btn
            v-if="step > 1"
            variant="outlined"
            @click="step--"
          >
            {{ $t('assessments.form.previous') }}
          </v-btn>
          <v-spacer />
          <v-btn
            v-if="step < steps.length && !isFinalized"
            color="main-blue"
            :disabled="step === 1 && dateOrderError"
            :loading="autoSaving"
            @click="handleNext"
          >
            {{ $t('assessments.form.next') }}
          </v-btn>
          <template v-if="step === steps.length && !isFinalized">
            <v-btn
              variant="outlined"
              color="main-blue"
              :loading="saving"
              @click="handleSave"
            >
              {{ $t('assessments.form.save') }}
            </v-btn>
            <v-btn
              color="main-blue"
              :loading="finalizing"
              @click="handleFinalize"
            >
              {{ $t('assessments.form.finalize') }}
            </v-btn>
          </template>
          <v-btn
            v-if="step < steps.length && isFinalized"
            color="main-blue"
            @click="step++"
          >
            {{ $t('assessments.form.next') }}
          </v-btn>
        </div>
      </template>
    </v-stepper>

    <v-dialog v-model="showStartPicker" max-width="400px">
      <v-card flat>
        <v-card-title>{{ $t('assessments.form.periodStart') }}</v-card-title>
        <v-card-text>
          <v-date-picker v-model="tempStartDate" :max="endDateAsDate" full-width />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showStartPicker = false">{{ $t('forms.cancel') }}</v-btn>
          <v-btn color="main-blue" @click="confirmPicker('start')">{{ $t('forms.confirm') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showEndPicker" max-width="400px">
      <v-card flat>
        <v-card-title>{{ $t('assessments.form.periodEnd') }}</v-card-title>
        <v-card-text>
          <v-date-picker v-model="tempEndDate" :min="startDateAsDate" full-width />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showEndPicker = false">{{ $t('forms.cancel') }}</v-btn>
          <v-btn color="main-blue" @click="confirmPicker('end')">{{ $t('forms.confirm') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import questionsData from '@/assets/assessmentQuestions.json'
import type { Assessment, AssessmentUpdate } from '@/models/interfaces/Assessment'
import { formatDateToString } from '@/services/utils/FormatDate'
import { useAssessmentsStore } from '@/stores/assessmentsStore'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

interface QuestionLabel { fr: string; en: string }
interface Question { id: string; label: QuestionLabel }
interface QuestionGroup { id: string; label: QuestionLabel; questions: Question[] }

const props = defineProps<{
  assessment: Assessment
}>()

const emit = defineEmits<{
  (e: 'saved'): void
  (e: 'finalized'): void
}>()

const { t, locale } = useI18n()
const assessmentsStore = useAssessmentsStore()

const questionGroups: QuestionGroup[] = questionsData.groups as QuestionGroup[]
const totalQuestions = questionGroups.reduce((sum, g) => sum + g.questions.length, 0)

function getLabel(label: QuestionLabel): string {
  return label[locale.value as 'fr' | 'en'] ?? label.fr
}

function groupAnsweredCount(group: QuestionGroup): number {
  return group.questions.filter((q) => answers.value[q.id] !== undefined && answers.value[q.id] !== null).length
}

const step = ref(1)
const autoSaving = ref(false)
const saving = ref(false)
const finalizing = ref(false)
const showStartPicker = ref(false)
const showEndPicker = ref(false)
const tempStartDate = ref<Date | null>(null)
const tempEndDate = ref<Date | null>(null)

const steps = computed(() => [
  t('assessments.form.stepIdentity'),
  t('assessments.form.stepFields'),
  t('assessments.form.stepReview'),
])

const isFinalized = computed(() => !!props.assessment.finalized_at)

const title = ref(props.assessment.title)
const periodStart = ref(props.assessment.period_start ?? '')
const periodEnd = ref(props.assessment.period_end ?? '')
const answers = ref<Record<string, boolean | null>>(
  { ...(props.assessment.fields?.sections?.answers ?? {}) },
)

const startDateAsDate = computed(() =>
  periodStart.value ? new Date(periodStart.value) : undefined,
)
const endDateAsDate = computed(() =>
  periodEnd.value ? new Date(periodEnd.value) : undefined,
)
const dateOrderError = computed(() => {
  if (!periodStart.value || !periodEnd.value) return false
  return new Date(periodStart.value) > new Date(periodEnd.value)
})

const answeredCount = computed(() =>
  Object.values(answers.value).filter((v) => v !== null && v !== undefined).length,
)

watch(() => props.assessment, (newVal) => {
  title.value = newVal.title
  periodStart.value = newVal.period_start ?? ''
  periodEnd.value = newVal.period_end ?? ''
  answers.value = { ...(newVal.fields?.sections?.answers ?? {}) }
})

function buildUpdate(): AssessmentUpdate {
  return {
    title: title.value,
    period_start: periodStart.value || null,
    period_end: periodEnd.value || null,
    fields: { sections: { answers: { ...answers.value } } },
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('fr-FR')
}

function openPicker(type: 'start' | 'end') {
  if (type === 'start') {
    tempStartDate.value = periodStart.value ? new Date(periodStart.value) : null
    showStartPicker.value = true
  } else {
    tempEndDate.value = periodEnd.value ? new Date(periodEnd.value) : null
    showEndPicker.value = true
  }
}

function confirmPicker(type: 'start' | 'end') {
  if (type === 'start') {
    if (tempStartDate.value) periodStart.value = formatDateToString(tempStartDate.value)
    showStartPicker.value = false
  } else {
    if (tempEndDate.value) periodEnd.value = formatDateToString(tempEndDate.value)
    showEndPicker.value = false
  }
}

async function handleNext() {
  autoSaving.value = true
  await assessmentsStore.saveAssessment(props.assessment.id, buildUpdate())
  autoSaving.value = false
  step.value++
}

async function handleSave() {
  saving.value = true
  await assessmentsStore.saveAssessment(props.assessment.id, buildUpdate())
  saving.value = false
  emit('saved')
}

async function handleFinalize() {
  finalizing.value = true
  await assessmentsStore.finalizeAssessment(props.assessment.id, buildUpdate())
  finalizing.value = false
  emit('finalized')
}
</script>

<style scoped lang="scss">
.AssessmentForm {
  &__stepper {
    background: transparent;

    :deep(.v-stepper-header) {
      box-shadow: none;
    }

    :deep(.v-stepper-window) {
      margin: 0;
      padding: 0;
    }
  }

  &__card {
    padding: 1.75rem;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 0 0;
  }

  &__progress {
    margin-bottom: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  &__progressHeader {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__progressPct {
    font-size: 0.8rem;
    font-weight: 600;
    color: rgb(var(--v-theme-main-blue));
  }

  &__group {
    border-top: 1px solid #f1f5f9;
    padding-top: 1.25rem;

    &:first-of-type {
      border-top: none;
      padding-top: 0;
    }
  }

  &__groupHeader {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-bottom: 0.75rem;
  }

  &__groupIndex {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: rgba(51, 92, 142, 0.1);
    color: rgb(var(--v-theme-main-blue));
    font-size: 0.75rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__groupTitle {
    font-size: 0.9rem;
    font-weight: 700;
    color: #1e293b;
  }

  &__questions {
    display: flex;
    flex-direction: column;
  }

  &__question {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.55rem 0;
    border-bottom: 1px solid #f8fafc;

    &:last-child {
      border-bottom: none;
    }
  }

  &__questionText {
    font-size: 0.875rem;
    color: #334155;
    flex: 1;
    line-height: 1.5;
  }

  &__review {
    display: flex;
    flex-direction: column;
  }

  &__reviewGroups {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    flex: 1;
  }

  &__reviewGroup {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  &__reviewGroupName {
    font-size: 0.85rem;
    color: #475569;
  }

  &__reviewRow {
    display: flex;
    gap: 1rem;
    align-items: baseline;
    padding: 0.75rem 0;
    border-bottom: 1px solid #f1f5f9;

    &:first-child {
      padding-top: 0;
    }

    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
  }

  &__reviewLabel {
    font-size: 0.85rem;
    font-weight: 600;
    color: #475569;
    min-width: 10rem;
  }

  &__reviewValue {
    color: #1e293b;
    font-size: 0.95rem;
  }
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
}
</style>
