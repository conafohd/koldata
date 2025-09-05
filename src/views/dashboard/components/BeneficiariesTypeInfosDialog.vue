<template>
  <v-dialog v-model="showBeneficiariesInfosDialog">
    <v-card>
      <v-card-text>
        <p v-html="$t('dashboard.chart2.refugeesDescription')"></p>
        <p v-html="$t('dashboard.chart2.displacedDescription')" class="mt-2"></p>
        <p v-html="$t('dashboard.chart2.returneesDescription')" class="mt-2"></p>
        <p v-html="$t('dashboard.chart2.localCommunitiesDescription')" class="mt-2"></p>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import { type ModelRef } from 'vue'
const showBeneficiariesInfosDialog: ModelRef<boolean | undefined> = defineModel(
  'showBeneficiariesInfosDialog',
)
</script>
