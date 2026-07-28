import type { AssessmentAnswer } from '@/models/interfaces/Assessment'

export interface QuestionLabel {
  fr: string
  en: string
}

export type QuestionType = 'boolean' | 'text' | 'select' | 'multiselect' | 'level'

export interface QuestionOption {
  value: string
  label: QuestionLabel
  weight: number
}

/** One rung (0–3) of a `level` question's maturity scale. */
export interface LevelDescriptor {
  /** 0–3; also the score the level contributes. */
  value: number
  /** Short level name shown in the dropdown (e.g. "Fonctionnel"). */
  name: QuestionLabel
  /** Per-question description of this level, shown in the info tooltip. */
  description: QuestionLabel
  /** Kept from the source data but intentionally unused for now. */
  recommendation?: QuestionLabel
}

/** Highest score a `level` question can earn. */
export const LEVEL_MAX_SCORE = 3

/** Native input type for `text` questions (defaults to plain text). */
export type TextInputType = 'text' | 'number' | 'date'

export interface Question {
  id: string
  type: QuestionType
  label: QuestionLabel
  /** Defaults to true when omitted. */
  required?: boolean
  /** Only meaningful for `text` questions. */
  inputType?: TextInputType
  /** Hidden in the form/report because the data lives in the association profile. */
  hidden?: boolean
  options?: QuestionOption[]
  /** Only meaningful for `level` questions — the 0–3 maturity scale. */
  levels?: LevelDescriptor[]
}

export interface QuestionGroup {
  id: string
  label: QuestionLabel
  questions: Question[]
}

/**
 * Pure helpers for the OCA assessment form: answer validation and weighted
 * scoring. No Supabase calls — kept here so the form and report views agree on
 * how each question type is interpreted.
 */
export class AssessmentFormService {
  static isRequired(question: Question): boolean {
    return question.required !== false
  }

  /**
   * Drops questions flagged `hidden` (already captured in the association
   * profile) and any group left without questions. Used by the form and the
   * report so neither shows nor scores duplicated fields.
   */
  static visibleGroups(groups: QuestionGroup[]): QuestionGroup[] {
    return groups
      .map((g) => ({ ...g, questions: g.questions.filter((q) => !q.hidden) }))
      .filter((g) => g.questions.length > 0)
  }

  static getLabel(label: QuestionLabel, locale: string): string {
    return label[locale as 'fr' | 'en'] ?? label.fr
  }

  /**
   * Coarse tone for the PDF (which only has positive/negative/neutral): 0
   * negative, 3 positive, the in-between levels neutral.
   */
  static levelTone(value: number): 'positive' | 'negative' | 'neutral' {
    if (value >= LEVEL_MAX_SCORE) return 'positive'
    if (value <= 0) return 'negative'
    return 'neutral'
  }

  /**
   * Vuetify colour for a 0–3 level, as a red → orange → yellow → green scale:
   * 0 Pas en place, 1 En développement, 2 Fonctionnel, 3 Bonne pratique.
   */
  static levelColor(value: number): string {
    switch (value) {
      case 0:
        return 'error'
      case 1:
        return 'main-orange'
      case 2:
        return 'main-yellow'
      case 3:
        return 'success'
      default:
        return 'default'
    }
  }

  /** A question is "answered" once it holds a meaningful value for its type. */
  static isAnswered(question: Question, answer: AssessmentAnswer): boolean {
    switch (question.type) {
      case 'boolean':
        return typeof answer === 'boolean'
      case 'level':
        // 0 is a valid answer, so check the type rather than truthiness.
        return typeof answer === 'number' && answer >= 0 && answer <= LEVEL_MAX_SCORE
      case 'text':
      case 'select':
        return typeof answer === 'string' && answer.trim() !== ''
      case 'multiselect':
        return Array.isArray(answer) && answer.length > 0
      default:
        return answer !== null && answer !== undefined
    }
  }

  /** Maximum score a question can contribute (0 = excluded from scoring). */
  static maxScore(question: Question): number {
    switch (question.type) {
      case 'boolean':
        return 1
      case 'level':
        return LEVEL_MAX_SCORE
      case 'select':
        return Math.max(0, ...(question.options ?? []).map((o) => o.weight))
      case 'multiselect':
        return (question.options ?? []).reduce((sum, o) => sum + o.weight, 0)
      default:
        return 0
    }
  }

  /** Score earned for the given answer. */
  static earnedScore(question: Question, answer: AssessmentAnswer): number {
    switch (question.type) {
      case 'boolean':
        return answer === true ? 1 : 0
      case 'level':
        return typeof answer === 'number' && answer >= 0 && answer <= LEVEL_MAX_SCORE
          ? answer
          : 0
      case 'select': {
        const opt = (question.options ?? []).find((o) => o.value === answer)
        return opt?.weight ?? 0
      }
      case 'multiselect':
        if (!Array.isArray(answer)) return 0
        return (question.options ?? [])
          .filter((o) => answer.includes(o.value))
          .reduce((sum, o) => sum + o.weight, 0)
      default:
        return 0
    }
  }

  /** Percentage score over a set of questions, ignoring unscored ones (max 0). */
  static scorePercent(
    questions: Question[],
    answers: Record<string, AssessmentAnswer>,
  ): number {
    let earned = 0
    let max = 0
    for (const q of questions) {
      const qMax = this.maxScore(q)
      if (qMax === 0) continue
      max += qMax
      earned += this.earnedScore(q, answers[q.id] ?? null)
    }
    return max === 0 ? 0 : Math.round((earned / max) * 100)
  }
}
