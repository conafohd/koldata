<template>
  <div class="AssessmentReport">
    <v-progress-linear v-if="loading" indeterminate color="main-blue" class="mb-4" />

    <template v-if="assessment">
      <div class="AssessmentReport__header app-card app-card--flat">
        <div class="AssessmentReport__headerTop">
          <div class="AssessmentReport__headerIcon">
            <v-icon icon="$fileCheckOutline" color="main-blue" size="22" />
          </div>
          <div class="AssessmentReport__headerInfo">
            <h2 class="AssessmentReport__title">
              {{ assessment.title || $t('assessments.report.notAvailable') }}
            </h2>
            <div class="AssessmentReport__subtitle">{{ $t('assessments.report.title') }}</div>
          </div>
          <v-chip color="success" variant="tonal" size="small">
            <v-icon start icon="$checkCircle" size="14" />
            {{ $t('assessments.status.finalized') }}
          </v-chip>
          <v-btn
            color="main-blue"
            variant="flat"
            size="small"
            prepend-icon="$download"
            :loading="exporting"
            class="ml-2"
            @click="onExportPdf"
          >
            {{ $t('assessments.report.exportPdf') }}
          </v-btn>
        </div>

        <v-divider class="my-4" />

        <div class="AssessmentReport__metaStrip">
          <div class="AssessmentReport__metaItem">
            <div class="AssessmentReport__metaLabel">{{ $t('assessments.report.period') }}</div>
            <div class="AssessmentReport__metaValue">
              <template v-if="assessment.period_start || assessment.period_end">
                {{ formatDate(assessment.period_start) || '?' }} → {{ formatDate(assessment.period_end) || '?' }}
              </template>
              <template v-else>{{ $t('assessments.report.notAvailable') }}</template>
            </div>
          </div>
          <div class="AssessmentReport__metaDivider" />
          <div class="AssessmentReport__metaItem">
            <div class="AssessmentReport__metaLabel">{{ $t('assessments.report.createdOn') }}</div>
            <div class="AssessmentReport__metaValue">{{ formatDate(assessment.created_at) }}</div>
          </div>
          <div class="AssessmentReport__metaDivider" />
          <div class="AssessmentReport__metaItem">
            <div class="AssessmentReport__metaLabel">{{ $t('assessments.report.finalizedOn') }}</div>
            <div class="AssessmentReport__metaValue">
              {{ assessment.finalized_at ? formatDate(assessment.finalized_at) : $t('assessments.report.notAvailable') }}
            </div>
          </div>
          <div class="AssessmentReport__metaDivider" />
          <div class="AssessmentReport__metaItem">
            <div class="AssessmentReport__metaLabel">{{ $t('assessments.report.globalScore') }}</div>
            <div class="AssessmentReport__metaValue AssessmentReport__metaValue--score">
              {{ globalScore(assessment) }}%
            </div>
          </div>
        </div>
      </div>

      <div class="AssessmentReport__chart">
        <AssessmentRadarChart
          :labels="radarLabels(assessment)"
          :values="radarValues(assessment)"
        />
      </div>

      <v-divider class="my-6" />

      <div class="AssessmentReport__sections">
        <h3 class="AssessmentReport__sectionsTitle">{{ $t('assessments.report.sections') }}</h3>

        <div
          v-for="(group, gi) in questionGroups"
          :key="group.id"
          class="AssessmentReport__group"
        >
          <div class="AssessmentReport__groupHeader">
            <span class="AssessmentReport__groupIndex">{{ gi + 1 }}</span>
            <span class="AssessmentReport__groupTitle">{{ getLabel(group.label) }}</span>

          </div>
          <div class="AssessmentReport__questions">
            <div
              v-for="question in group.questions"
              :key="question.id"
              class="AssessmentReport__question"
            >
              <span class="AssessmentReport__questionText">{{ getLabel(question.label) }}</span>
              <v-chip
                size="small"
                variant="tonal"
                :color="answerColor(question, assessment)"
              >
                {{ answerLabel(question, assessment) }}
              </v-chip>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import questionsData from '@/assets/assessmentQuestions.json'
import type { Assessment, AssessmentAnswer } from '@/models/interfaces/Assessment'
import {
  AssessmentFormService,
  type Question,
  type QuestionGroup,
  type QuestionLabel,
} from '@/services/forms/AssessmentFormService'
import conafohdLogoUrl from '@/assets/img/conafohd-logo.png'
import { AssessmentPdfService, type PdfSection } from '@/services/assessments/AssessmentPdfService'
import { RadarImageService } from '@/services/assessments/RadarImageService'
import { imageToDataUrl } from '@/services/utils/ImageToDataUrl'
import { useApplicationStore } from '@/stores/applicationStore'
import { useAssessmentsStore } from '@/stores/assessmentsStore'
import { useAssociationsStore } from '@/stores/associationsStore'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import AssessmentRadarChart from './components/AssessmentRadarChart.vue'

const route = useRoute()
const { locale, t } = useI18n()
const applicationStore = useApplicationStore()
const assessmentsStore = useAssessmentsStore()
const associationsStore = useAssociationsStore()

const questionGroups: QuestionGroup[] = AssessmentFormService.visibleGroups(
  questionsData.groups as QuestionGroup[],
)

function getLabel(label: QuestionLabel): string {
  return AssessmentFormService.getLabel(label, locale.value)
}

function getAnswer(questionId: string, a: Assessment): AssessmentAnswer {
  return a.fields?.sections?.answers?.[questionId] ?? null
}

function answerLabel(question: Question, a: Assessment): string {
  const v = getAnswer(question.id, a)
  if (!AssessmentFormService.isAnswered(question, v)) return t('assessments.report.notAvailable')
  if (question.type === 'boolean') return v ? t('assessments.report.yes') : t('assessments.report.no')
  if (question.type === 'text') return String(v)
  if (question.type === 'select') {
    const opt = question.options?.find((o) => o.value === v)
    return opt ? getLabel(opt.label) : String(v)
  }
  // multiselect
  const selected = Array.isArray(v) ? v : []
  return (question.options ?? [])
    .filter((o) => selected.includes(o.value))
    .map((o) => getLabel(o.label))
    .join(', ')
}

function answerColor(question: Question, a: Assessment): string {
  const v = getAnswer(question.id, a)
  if (!AssessmentFormService.isAnswered(question, v)) return 'default'
  if (question.type === 'boolean') return v ? 'success' : 'error'
  return 'main-blue'
}

function globalScore(a: Assessment): number {
  const answers = a.fields?.sections?.answers ?? {}
  return AssessmentFormService.scorePercent(
    questionGroups.flatMap((g) => g.questions),
    answers,
  )
}

function radarLabels(a: Assessment): string[] {
  return questionGroups.map((g) => getLabel(g.label))
}

function radarValues(a: Assessment): number[] {
  const answers = a.fields?.sections?.answers ?? {}
  return questionGroups.map((g) => AssessmentFormService.scorePercent(g.questions, answers))
}

const assessmentId = computed(() => route.params.assessmentId as string)
const associationId = computed(() => route.params.id as string)

const assessment = ref<Assessment | null>(null)
const loading = ref(false)
const exporting = ref(false)

const association = computed(() =>
  associationsStore.associationsList.find((a) => a.id === associationId.value),
)

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

  if (!associationsStore.associationsList.length) {
    await associationsStore.getAssociationsList()
  }

  loading.value = false
})

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('fr-FR')
}

function compactDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}${m}${day}`
}

function buildFileName(a: Assessment): string {
  const start = compactDate(a.period_start)
  const end = compactDate(a.period_end)
  const period = [start, end].filter(Boolean).join('_')
  return period ? `oca_evaluation_${period}.pdf` : 'oca_evaluation.pdf'
}

function answerTone(question: Question, a: Assessment): 'positive' | 'negative' | 'neutral' {
  const color = answerColor(question, a)
  if (color === 'success') return 'positive'
  if (color === 'error') return 'negative'
  return 'neutral'
}

async function onExportPdf(): Promise<void> {
  if (!assessment.value) return
  exporting.value = true
  try {
    const a = assessment.value
    const associationName = association.value?.nom ?? ''

    const [associationLogo, conafohdLogo, radarImage] = await Promise.all([
      imageToDataUrl(association.value?.logo_url ?? null),
      imageToDataUrl(conafohdLogoUrl),
      RadarImageService.toPng(radarLabels(a), radarValues(a)),
    ])

    const sections: PdfSection[] = questionGroups.map((group) => ({
      title: getLabel(group.label),
      questions: group.questions.map((q) => ({
        text: getLabel(q.label),
        answer: answerLabel(q, a),
        tone: answerTone(q, a),
      })),
    }))

    await AssessmentPdfService.generate({
      fileName: buildFileName(a),
      reportTitle: t('assessments.report.title'),
      associationName,
      associationLogo,
      conafohdLogo,
      radarImage,
      meta: [
        {
          label: t('assessments.report.period'),
          small: true,
          value:
            a.period_start || a.period_end
              ? `${formatDate(a.period_start) || '?'} - ${formatDate(a.period_end) || '?'}`
              : t('assessments.report.notAvailable'),
        },
        { label: t('assessments.report.createdOn'), value: formatDate(a.created_at), small: true },
        {
          label: t('assessments.report.finalizedOn'),
          small: true,
          value: a.finalized_at ? formatDate(a.finalized_at) : t('assessments.report.notAvailable'),
        },
        { label: t('assessments.report.globalScore'), value: `${globalScore(a)}%`, small: true },
      ],
      sectionsHeading: t('assessments.report.sections'),
      sections,
      footerText: t('assessments.report.generatedOn', { date: formatDate(new Date().toISOString()) }),
    })
  } finally {
    exporting.value = false
  }
}
</script>

<style scoped lang="scss">
.AssessmentReport {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
}

.AssessmentReport__header {
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.AssessmentReport__headerTop {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.AssessmentReport__headerIcon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: rgba(51, 92, 142, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.AssessmentReport__headerInfo {
  flex: 1;
  min-width: 0;
}

.AssessmentReport__title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.AssessmentReport__subtitle {
  font-size: 0.78rem;
  color: #94a3b8;
  margin-top: 0.15rem;
}

.AssessmentReport__metaStrip {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.AssessmentReport__metaItem {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.AssessmentReport__metaLabel {
  font-size: 0.68rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

.AssessmentReport__metaValue {
  font-size: 0.9rem;
  font-weight: 500;
  color: #334155;

  &--score {
    font-size: 1rem;
    font-weight: 700;
    color: rgb(var(--v-theme-main-blue));
  }
}

.AssessmentReport__metaDivider {
  width: 1px;
  height: 2rem;
  background: #e2e8f0;
  flex-shrink: 0;
}

.AssessmentReport__chart {
  width: 100%;
}

.AssessmentReport__sectionsTitle {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
  color: var(--main-grey);
  text-transform: uppercase;
  letter-spacing: 0.05rem;
}

.AssessmentReport__group {
  border-top: 1px solid #f1f5f9;
  padding: 1rem 0;

  &:last-child {
    padding-bottom: 0;
  }
}

.AssessmentReport__groupHeader {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.6rem;
}

.AssessmentReport__groupIndex {
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

.AssessmentReport__groupTitle {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e293b;
}

.AssessmentReport__question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.45rem 0;
  border-bottom: 1px solid #f8fafc;

  &:last-child {
    border-bottom: none;
  }
}

.AssessmentReport__questionText {
  font-size: 0.875rem;
  color: #334155;
  flex: 1;
  line-height: 1.5;
}
</style>
