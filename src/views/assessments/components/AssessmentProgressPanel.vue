<template>
  <aside class="AssessmentProgressPanel">
    <div class="AssessmentProgressPanel__card app-card app-card--flat">
      <div class="AssessmentProgressPanel__header">
        {{ $t('assessments.form.panel.title') }}
      </div>

      <div class="AssessmentProgressPanel__progress">
        <div class="AssessmentProgressPanel__progressRow">
          <span class="AssessmentProgressPanel__progressLabel">
            {{ $t('assessments.form.panel.overallProgress') }}
          </span>
          <span class="AssessmentProgressPanel__progressPct">{{ overallPct }}%</span>
        </div>
        <v-progress-linear
          :model-value="overallPct"
          color="main-blue"
          bg-color="#e2e8f0"
          rounded
          height="6"
        />
      </div>

      <nav class="AssessmentProgressPanel__nav">
        <!-- Questionnaire sections -->
        <button
          v-for="(group, gi) in questionGroups"
          :key="group.id"
          type="button"
          class="AssessmentProgressPanel__item"
          :class="{ 'AssessmentProgressPanel__item--active': partIndex === gi }"
          @click="emit('navigate-part', gi)"
        >
          <v-icon
            :icon="groupAnsweredCount(group) === group.questions.length ? '$checkCircle' : '$checkCircleOutline'"
            size="18"
            :color="groupAnsweredCount(group) === group.questions.length ? 'success' : '#cbd5e1'"
            class="AssessmentProgressPanel__itemIcon"
          />
          <span class="AssessmentProgressPanel__itemText">{{ getLabel(group.label) }}</span>
          <span class="AssessmentProgressPanel__itemCount">
            {{ groupAnsweredCount(group) }}/{{ group.questions.length }}
          </span>
        </button>
      </nav>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { AssessmentAnswer } from '@/models/interfaces/Assessment'
import {
  AssessmentFormService,
  type QuestionGroup,
  type QuestionLabel,
} from '@/services/forms/AssessmentFormService'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  questionGroups: QuestionGroup[]
  answers: Record<string, AssessmentAnswer>
  partIndex: number
}>()

const emit = defineEmits<{
  (e: 'navigate-part', index: number): void
}>()

const { locale } = useI18n()

function getLabel(label: QuestionLabel): string {
  return AssessmentFormService.getLabel(label, locale.value)
}

function groupAnsweredCount(group: QuestionGroup): number {
  return group.questions.filter((q) =>
    AssessmentFormService.isAnswered(q, props.answers[q.id] ?? null),
  ).length
}

const totalQuestions = computed(() =>
  props.questionGroups.reduce((sum, g) => sum + g.questions.length, 0),
)

const answeredCount = computed(() =>
  props.questionGroups.reduce((sum, g) => sum + groupAnsweredCount(g), 0),
)

const overallPct = computed(() =>
  totalQuestions.value ? Math.round((answeredCount.value / totalQuestions.value) * 100) : 0,
)
</script>

<style lang="scss">
.AssessmentProgressPanel {
  width: 380px;
  flex-shrink: 0;
  position: sticky;
  top: 1rem;

  // On mobile the in-form progress bar and section switcher are shown instead
  @media (max-width: 960px) {
    display: none;
  }

  &__card {
    padding: 1.25rem;
  }

  &__header {
    font-size: 0.95rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 1rem;
  }

  &__progress {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding-bottom: 1rem;
    margin-bottom: 0.5rem;
    border-bottom: 1px solid #f1f5f9;
  }

  &__progressRow {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__progressLabel {
    font-size: 0.75rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  &__progressPct {
    font-size: 0.8rem;
    font-weight: 700;
    color: rgb(var(--v-theme-main-blue));
  }

  &__nav {
    display: flex;
    flex-direction: column;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    width: 100%;
    padding: 0.6rem 0.5rem;
    border: none;
    border-left: 2px solid transparent;
    border-radius: 0 6px 6px 0;
    background: transparent;
    text-align: left;
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease;

    &:hover {
      background: rgba(51, 92, 142, 0.05);
    }

    &--active {
      background: rgba(51, 92, 142, 0.08);
      border-left-color: rgb(var(--v-theme-main-blue));

      .AssessmentProgressPanel__itemText {
        color: rgb(var(--v-theme-main-blue));
        font-weight: 600;
      }
    }
  }

  &__itemIcon {
    flex-shrink: 0;
  }

  &__itemText {
    flex: 1;
    min-width: 0;
    font-size: 0.85rem;
    color: #475569;
    line-height: 1.35;
  }

  &__itemCount {
    flex-shrink: 0;
    font-size: 0.75rem;
    font-weight: 600;
    color: #94a3b8;
  }
}
</style>
