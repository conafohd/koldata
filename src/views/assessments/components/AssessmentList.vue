<template>
  <div class="AssessmentList">
    <v-data-table
      :headers="headers"
      :items="assessments"
      item-key="id"
      :items-per-page="-1"
      hide-default-footer
      class="AssessmentList__table"
    >
      <template #item.title="{ item }">
        {{ item.title || '—' }}
      </template>

      <template #item.period="{ item }">
        <span v-if="item.period_start || item.period_end">
          {{ item.period_start || '?' }} → {{ item.period_end || '?' }}
        </span>
        <span v-else>—</span>
      </template>

      <template #item.created_at="{ item }">
        {{ new Date(item.created_at).toLocaleDateString() }}
      </template>

      <template #item.status="{ item }">
        <v-chip
          :color="item.finalized_at ? 'success' : 'main-blue'"
          size="small"
          variant="tonal"
          :prepend-icon="item.finalized_at ? '$checkCircle' : '$circleEditOutline'"
        >
          {{ item.finalized_at ? $t('assessments.status.finalized') : $t('assessments.status.inProgress') }}
        </v-chip>
      </template>

      <template #item.actions="{ item }">
        <div class="AssessmentList__actions">
          <v-btn
            v-if="item.finalized_at"
            variant="tonal"
            color="main-blue"
            size="small"
            prepend-icon="$fileCheckOutline"
            @click="$emit('view-report', item)"
          >
            {{ $t('assessments.viewReport') }}
          </v-btn>
          <v-btn
            v-else
            variant="text"
            size="small"
            prepend-icon="$squareEditOutline"
            @click="$emit('open', item)"
          >
            {{ $t('assessments.actions.edit') }}
          </v-btn>
          <v-menu location="bottom end">
            <template #activator="{ props }">
              <v-btn icon="$dotsVertical" variant="text" size="small" v-bind="props" />
            </template>
            <v-list density="compact" min-width="160">
              <v-list-item
                prepend-icon="$trashCanOutline"
                :title="$t('assessments.actions.delete')"
                class="AssessmentList__deleteItem"
                @click="confirmDelete(item.id)"
              />
            </v-list>
          </v-menu>
        </div>
      </template>

      <template #no-data>
        <div class="AssessmentList__empty">
          {{ $t('assessments.noAssessments') }}
        </div>
      </template>
    </v-data-table>

    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card flat>
        <v-card-title>{{ $t('assessments.delete.confirm') }}</v-card-title>
        <v-card-text>{{ $t('assessments.delete.confirmText') }}</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">
            {{ $t('assessments.delete.no') }}
          </v-btn>
          <v-btn color="error" variant="flat" :loading="deleting" @click="handleDelete">
            {{ $t('assessments.delete.yes') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import type { Assessment } from '@/models/interfaces/Assessment'
import { useAssessmentsStore } from '@/stores/assessmentsStore'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

defineProps<{
  assessments: Assessment[]
}>()

defineEmits<{
  (e: 'open', assessment: Assessment): void
  (e: 'view-report', assessment: Assessment): void
}>()

const { t } = useI18n()
const assessmentsStore = useAssessmentsStore()

const deleteDialog = ref(false)
const deleting = ref(false)
const pendingDeleteId = ref<string | null>(null)

const headers = [
  { title: t('assessments.columns.title'), key: 'title', sortable: false },
  { title: t('assessments.columns.period'), key: 'period', sortable: false },
  { title: t('assessments.columns.createdAt'), key: 'created_at' },
  { title: t('assessments.columns.status'), key: 'status', sortable: false },
  { title: t('assessments.columns.actions'), key: 'actions', sortable: false, align: 'end' as const },
]

function confirmDelete(id: string) {
  pendingDeleteId.value = id
  deleteDialog.value = true
}

async function handleDelete() {
  if (!pendingDeleteId.value) return
  deleting.value = true
  await assessmentsStore.deleteAssessment(pendingDeleteId.value)
  deleting.value = false
  deleteDialog.value = false
  pendingDeleteId.value = null
}
</script>

<style scoped lang="scss">
.AssessmentList__table {
  background: transparent !important;
  :deep(.v-data-table__td) { background: transparent; }
}

.AssessmentList__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.25rem;
}

.AssessmentList__deleteItem {
  color: rgb(var(--v-theme-error));
  :deep(.v-icon) { color: rgb(var(--v-theme-error)); }
}

.AssessmentList__empty {
  text-align: center;
  padding: 2rem;
  color: var(--main-grey);
}
</style>
