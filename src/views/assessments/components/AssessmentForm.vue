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

    <v-stepper v-model="step" :items="steps" color="main-blue" alt-labels flat class="AssessmentForm__stepper">
      <!-- Step 1 — Identity -->
      <template #item.1>
        <div class="AssessmentForm__card app-card app-card--flat">
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

      <!-- Step 2 — Questionnaire (one part at a time) -->
      <template #item.2>
        <div class="AssessmentForm__card app-card app-card--flat">
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

          <!-- Part selector doubles as the section title -->
          <div v-if="currentGroup" class="AssessmentForm__groupHeader">
            <v-select
              :model-value="partIndex"
              :items="partItems"
              variant="outlined"
              density="compact"
              hide-details
              flat
              class="AssessmentForm__partSelect"
              @update:model-value="goToPart"
            >
              <template #selection="{ item }">
                <span class="AssessmentForm__partSelectText">{{ item.raw.title }}</span>
              </template>
              <template #item="{ item, props: itemProps }">
                <v-list-item v-bind="itemProps" :title="item.raw.title">
                  <template #append>
                    <v-chip
                      size="x-small"
                      :color="item.raw.answered === item.raw.total ? 'success' : 'default'"
                      variant="tonal"
                    >
                      {{ item.raw.answered }}/{{ item.raw.total }}
                    </v-chip>
                  </template>
                </v-list-item>
              </template>
            </v-select>
            <v-chip
              size="x-small"
              :color="groupAnsweredCount(currentGroup) === currentGroup.questions.length ? 'success' : 'default'"
              variant="tonal"
              class="ml-auto"
            >
              {{ groupAnsweredCount(currentGroup) }}/{{ currentGroup.questions.length }}
            </v-chip>
          </div>

          <div ref="groupWrap" class="AssessmentForm__groupWrap">
          <transition
            :name="slideName"
            @before-leave="lockHeight"
            @enter="animateHeight"
          >
          <div v-if="currentGroup" :key="partIndex" class="AssessmentForm__group">
            <div class="AssessmentForm__questions">
              <div
                v-for="question in currentGroup.questions"
                :key="question.id"
                class="AssessmentForm__question"
                :class="{
                  'AssessmentForm__question--missing': showErrors && !isAnswered(question.id),
                  'AssessmentForm__question--stacked': question.type !== 'boolean',
                }"
              >
                <span class="AssessmentForm__questionText">
                  {{ getLabel(question.label) }}
                  <span v-if="AssessmentFormService.isRequired(question)" class="AssessmentForm__required">*</span>
                </span>

                <v-btn-toggle
                  v-if="question.type === 'boolean'"
                  v-model="answers[question.id]"
                  density="compact"
                  divided
                  rounded="lg"
                  :disabled="isFinalized"
                  class="AssessmentForm__toggle"
                >
                  <v-btn :value="true" size="small" color="success" variant="tonal">{{ $t('assessments.form.yes') }}</v-btn>
                  <v-btn :value="false" size="small" color="error" variant="tonal">{{ $t('assessments.form.no') }}</v-btn>
                </v-btn-toggle>

                <v-text-field
                  v-else-if="question.type === 'text'"
                  v-model="answers[question.id]"
                  :type="question.inputType ?? 'text'"
                  variant="outlined"
                  density="compact"
                  hide-details
                  :readonly="isFinalized"
                  class="AssessmentForm__input"
                />

                <v-select
                  v-else-if="question.type === 'select'"
                  v-model="answers[question.id]"
                  :items="optionItems(question)"
                  variant="outlined"
                  density="compact"
                  hide-details
                  :disabled="isFinalized"
                  class="AssessmentForm__input"
                />

                <v-select
                  v-else-if="question.type === 'multiselect'"
                  :model-value="getMulti(question.id)"
                  @update:model-value="setMulti(question.id, $event)"
                  :items="optionItems(question)"
                  variant="outlined"
                  density="compact"
                  multiple
                  chips
                  closable-chips
                  hide-details
                  :disabled="isFinalized"
                  class="AssessmentForm__input"
                />
              </div>
            </div>
          </div>
          </transition>
          </div>
        </div>
      </template>

      <!-- Step 3 — Review -->
      <template #item.3>
        <div class="AssessmentForm__card app-card app-card--flat">
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
                <button
                  v-for="(group, gi) in questionGroups"
                  :key="group.id"
                  type="button"
                  class="AssessmentForm__reviewGroup"
                  @click="jumpToPart(gi)"
                >
                  <span class="AssessmentForm__reviewGroupName">{{ getLabel(group.label) }}</span>
                  <v-chip
                    size="x-small"
                    :color="groupAnsweredCount(group) === group.questions.length ? 'success' : 'warning'"
                    variant="tonal"
                  >
                    {{ groupAnsweredCount(group) }}/{{ group.questions.length }}
                  </v-chip>
                  <v-icon icon="$chevronRight" size="16" class="AssessmentForm__reviewGroupArrow" />
                </button>
              </div>
            </div>
          </div>
          <v-alert
            v-if="!isFinalized && !allAnswered"
            type="error"
            variant="tonal"
            class="mt-5"
          >
            {{ $t('assessments.form.incompleteWarning', { count: remainingRequiredCount }) }}
          </v-alert>
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
            v-if="step > 1 || partIndex > 0"
            variant="outlined"
            @click="handlePrev"
          >
            {{ $t('assessments.form.previous') }}
          </v-btn>
          <v-spacer />
          <v-btn
            v-if="step < steps.length"
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
        </div>
      </template>
    </v-stepper>

    <v-dialog v-model="showStartPicker" max-width="400px">
      <v-card flat>
        <v-card-title>{{ $t('assessments.form.periodStart') }}</v-card-title>
        <v-card-text>
          <v-date-picker
            v-model="tempStartDate"
            :max="endDateAsDate"
            full-width
            hide-header
            @update:model-value="confirmPicker('start')"
          />
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showEndPicker" max-width="400px">
      <v-card flat>
        <v-card-title>{{ $t('assessments.form.periodEnd') }}</v-card-title>
        <v-card-text>
          <v-date-picker
            v-model="tempEndDate"
            :min="startDateAsDate"
            full-width
            hide-header
            @update:model-value="confirmPicker('end')"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import questionsData from '@/assets/assessmentQuestions.json'
import type { Assessment, AssessmentAnswer, AssessmentUpdate } from '@/models/interfaces/Assessment'
import {
  AssessmentFormService,
  type Question,
  type QuestionGroup,
  type QuestionLabel,
} from '@/services/forms/AssessmentFormService'
import { formatDateToString } from '@/services/utils/FormatDate'
import { useAssessmentsStore } from '@/stores/assessmentsStore'
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  assessment: Assessment
}>()

const emit = defineEmits<{
  (e: 'saved'): void
  (e: 'finalized'): void
}>()

const { t, locale } = useI18n()
const assessmentsStore = useAssessmentsStore()

const questionGroups: QuestionGroup[] = AssessmentFormService.visibleGroups(
  questionsData.groups as QuestionGroup[],
)
const totalQuestions = questionGroups.reduce((sum, g) => sum + g.questions.length, 0)

function getLabel(label: QuestionLabel): string {
  return AssessmentFormService.getLabel(label, locale.value)
}

function optionItems(question: Question) {
  return (question.options ?? []).map((o) => ({ value: o.value, title: getLabel(o.label) }))
}

function getMulti(questionId: string): string[] {
  const v = answers.value[questionId]
  return Array.isArray(v) ? v : []
}

function setMulti(questionId: string, value: unknown): void {
  answers.value[questionId] = Array.isArray(value) ? (value as string[]) : []
}

function isAnswered(questionId: string): boolean {
  const question = questionById.value[questionId]
  if (!question) return false
  return AssessmentFormService.isAnswered(question, answers.value[questionId] ?? null)
}

const questionById = computed<Record<string, Question>>(() => {
  const map: Record<string, Question> = {}
  for (const g of questionGroups) for (const q of g.questions) map[q.id] = q
  return map
})

function groupAnsweredCount(group: QuestionGroup): number {
  return group.questions.filter((q) => isAnswered(q.id)).length
}

// Questions that must be answered before finalizing (excludes optional ones).
const requiredQuestions = computed(() =>
  questionGroups.flatMap((g) => g.questions).filter((q) => AssessmentFormService.isRequired(q)),
)

const step = ref(1)
const showErrors = ref(false)
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

// Index of the currently displayed questionnaire part (0-based)
const partIndex = ref(0)
const currentGroup = computed(() => questionGroups[partIndex.value])

const partItems = computed(() =>
  questionGroups.map((g, i) => ({
    value: i,
    title: `${i + 1}. ${getLabel(g.label)}`,
    answered: groupAnsweredCount(g),
    total: g.questions.length,
  })),
)

const groupWrap = ref<HTMLElement | null>(null)
const slideName = ref<'slide-next' | 'slide-prev'>('slide-next')

// Animate the wrapper height alongside the slide so there's no vertical jump.
// The height transition is applied only for the duration of the slide.
function lockHeight() {
  const w = groupWrap.value
  if (w) w.style.height = `${w.offsetHeight}px`
}
function animateHeight(el: Element) {
  const w = groupWrap.value
  if (!w) return
  const target = (el as HTMLElement).offsetHeight
  void w.offsetHeight // force reflow so the locked height is committed
  w.style.transition = 'height 0.28s ease'
  w.style.height = `${target}px`
  const done = (e: TransitionEvent) => {
    if (e.propertyName !== 'height') return
    w.style.transition = ''
    w.style.height = ''
    w.removeEventListener('transitionend', done)
  }
  w.addEventListener('transitionend', done)
}

async function goToPart(index: number) {
  if (index === partIndex.value || index < 0 || index >= questionGroups.length) return
  slideName.value = index > partIndex.value ? 'slide-next' : 'slide-prev'
  // Switch immediately so the animation is instant, then persist in the background
  partIndex.value = index
  if (!isFinalized.value) {
    autoSaving.value = true
    await assessmentsStore.saveAssessment(props.assessment.id, buildUpdate())
    autoSaving.value = false
  }
}

// Jump from the recap straight to a questionnaire part
function jumpToPart(index: number) {
  partIndex.value = index
  step.value = 2
}

// Clear any leftover inline height from an interrupted slide when re-entering step 2
watch(step, (value) => {
  if (value !== 2) return
  nextTick(() => {
    if (groupWrap.value) {
      groupWrap.value.style.transition = ''
      groupWrap.value.style.height = ''
    }
  })
})

const isFinalized = computed(() => !!props.assessment.finalized_at)

const title = ref(props.assessment.title)
const periodStart = ref(props.assessment.period_start ?? '')
const periodEnd = ref(props.assessment.period_end ?? '')
const answers = ref<Record<string, AssessmentAnswer>>(
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
  questionGroups.reduce((sum, g) => sum + groupAnsweredCount(g), 0),
)

const allAnswered = computed(() =>
  requiredQuestions.value.every((q) => isAnswered(q.id)),
)

const remainingRequiredCount = computed(
  () => requiredQuestions.value.filter((q) => !isAnswered(q.id)).length,
)

// Index of the first part that still has unanswered required questions, or -1 if none
const firstIncompletePart = computed(() =>
  questionGroups.findIndex((g) =>
    g.questions.some((q) => AssessmentFormService.isRequired(q) && !isAnswered(q.id)),
  ),
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
  // While in the questionnaire step, page through parts before advancing
  if (step.value === 2 && partIndex.value < questionGroups.length - 1) {
    await goToPart(partIndex.value + 1)
    return
  }
  if (!isFinalized.value) {
    autoSaving.value = true
    await assessmentsStore.saveAssessment(props.assessment.id, buildUpdate())
    autoSaving.value = false
  }
  if (step.value === 1) partIndex.value = 0
  step.value++
}

async function handlePrev() {
  // While in the questionnaire step, page back through parts before stepping back
  if (step.value === 2 && partIndex.value > 0) {
    await goToPart(partIndex.value - 1)
    return
  }
  // Coming back from review lands on the last part for a continuous flow
  if (step.value === 3) {
    step.value--
    partIndex.value = questionGroups.length - 1
    return
  }
  step.value--
}

async function handleSave() {
  saving.value = true
  await assessmentsStore.saveAssessment(props.assessment.id, buildUpdate())
  saving.value = false
  emit('saved')
}

async function handleFinalize() {
  // All questions are mandatory before finalizing
  if (!allAnswered.value) {
    showErrors.value = true
    if (firstIncompletePart.value !== -1) {
      step.value = 2
      partIndex.value = firstIncompletePart.value
    }
    return
  }
  finalizing.value = true
  await assessmentsStore.finalizeAssessment(props.assessment.id, buildUpdate())
  finalizing.value = false
  emit('finalized')
}
</script>

<style scoped lang="scss">
// Directional slide between questionnaire parts — both parts move at once
.AssessmentForm__groupWrap {
  position: relative;
  overflow: hidden;
  overflow-anchor: none;
}

.slide-next-enter-active,
.slide-next-leave-active,
.slide-prev-enter-active,
.slide-prev-leave-active {
  transition: transform 0.28s ease, opacity 0.28s ease;
}

// Both parts are taken out of flow during the slide; the wrapper height is animated in JS
.slide-next-enter-active,
.slide-next-leave-active,
.slide-prev-enter-active,
.slide-prev-leave-active {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

.slide-next-enter-from {
  transform: translateX(40px);
  opacity: 0;
}
.slide-next-leave-to {
  transform: translateX(-40px);
  opacity: 0;
}
.slide-prev-enter-from {
  transform: translateX(-40px);
  opacity: 0;
}
.slide-prev-leave-to {
  transform: translateX(40px);
  opacity: 0;
}

.AssessmentForm {
  // Prevent the browser from "anchoring" the scroll position while the
  // questionnaire wrapper animates its height (which caused a jump above the card)
  overflow-anchor: none;

  &__stepper {
    background: transparent;

    :deep(.v-stepper-header) {
      box-shadow: none;
    }

    :deep(.v-stepper-item__title) {
      font-size: 0.8rem;
    }

    :deep(.v-stepper-item--selected .v-avatar),
    :deep(.v-stepper-item--complete .v-avatar) {
      background: rgb(var(--v-theme-main-blue)) !important;
      color: #fff !important;
    }

    :deep(.v-stepper-window) {
      margin: 0;
      padding: 0;
    }

    // Keep the Previous/Next bar pinned to the bottom of the screen while scrolling
    :deep(.v-stepper-actions) {
      position: sticky;
      bottom: 0;
      z-index: 2;
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
    padding: 1rem 0;
    background: #fff;
    border-top: 1px solid #f1f5f9;
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

  &__partSelect {
    flex: 1;

    :deep(.v-field) {
      border-radius: 8px;
    }

    :deep(.v-field__input) {
      font-size: 0.9rem;
      font-weight: 700;
      color: #1e293b;
    }
  }

  &__partSelectText {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__group {
    padding-top: 0;
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

  &__questions {
    display: flex;
    flex-direction: column;
  }

  &__question {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.65rem 0.5rem;
    border-bottom: 1px solid #cbd5e1;

    &:last-child {
      border-bottom: none;
    }

    &--missing {
      background: rgba(var(--v-theme-error), 0.06);
      border-radius: 6px;

      .AssessmentForm__questionText {
        color: rgb(var(--v-theme-error));
      }
    }

    // Text / dropdown questions stack the input under the label and use full width
    &--stacked {
      flex-direction: column;
      align-items: stretch;
      gap: 0.5rem;
    }
  }

  &__input {
    width: 100%;
  }

  &__questionText {
    font-size: 0.875rem;
    color: #334155;
    flex: 1;
    line-height: 1.5;
  }

  &__required {
    color: rgb(var(--v-theme-error));
    font-weight: 700;
    margin-left: 0.15rem;
  }

  &__toggle {
    border-color: #f1f5f9;
    background: #fff;

    :deep(.v-btn),
    :deep(.v-btn__overlay),
    :deep(.v-divider) {
      border-color: #f1f5f9;
    }

    :deep(.v-btn:not(.v-btn--active)) {
      background: #fff;
    }
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
    width: 100%;
    padding: 0.4rem 0.6rem;
    border: 1px solid transparent;
    border-radius: 8px;
    background: transparent;
    text-align: left;
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease;

    &:hover {
      background: rgba(51, 92, 142, 0.05);
      border-color: #e2e8f0;
    }
  }

  &__reviewGroupName {
    font-size: 0.85rem;
    color: #475569;
    flex: 1;
  }

  &__reviewGroupArrow {
    color: #94a3b8;
    flex-shrink: 0;
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
