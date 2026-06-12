export interface AssessmentFields {
  sections: {
    answers: Record<string, boolean | null>
  }
}

export interface Assessment {
  id: string
  association_id: string
  title: string
  period_start: string | null
  period_end: string | null
  created_at: string
  updated_at: string
  finalized_at: string | null
  fields: AssessmentFields
}

export interface AssessmentUpdate {
  title: string
  period_start: string | null
  period_end: string | null
  fields: AssessmentFields
}

export type AssessmentCreate = Omit<Assessment, 'id' | 'created_at' | 'updated_at'>
