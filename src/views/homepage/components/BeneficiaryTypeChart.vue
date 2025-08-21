<template>
  <div class="BeneficiaryTypeChart">
    <canvas ref="canvasEl"></canvas>
  </div>
</template>

<script setup lang="ts">
import type { DashboardStats } from '@/models/interfaces/DashboardStats'
import { i18n } from '@/plugins/i18n'
import { getChartsColorsPalette } from '@/services/utils/ChartsColors'
import { ArcElement, Chart, DoughnutController, Legend, Title, Tooltip } from 'chart.js'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
Chart.register(DoughnutController, ArcElement, Tooltip, Legend, Title)

const props = defineProps<{
  data: DashboardStats['beneficiaries_types_details']
}>()

const canvasEl = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart<'doughnut'> | null = null
const colors = getChartsColorsPalette()

onMounted(() => {
  if (!canvasEl.value) return
  if (chartInstance) {
    chartInstance.destroy()
  }

  chartInstance = new Chart(canvasEl.value, {
    type: 'doughnut',
    data: {
      labels: props.data.map((item) => item.type),
      datasets: [
        {
          data: props.data.map((item) => item.occurrences),
          backgroundColor: colors,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' },
        title: { display: true, text: i18n.t('dashboard.chart2Title') },
        tooltip: {
          callbacks: {
            label: (context) => {
              const item = props.data[context.dataIndex]
              return `${item.type}: ${item.occurrences} (${item.percentage}%)`
            },
          },
        },
      },
    },
  })
})

watch(
  () => props.data,
  (newData) => {
    if (chartInstance) {
      chartInstance.data.labels = newData.map((item) => item.type)
      chartInstance.data.datasets[0].data = newData.map((item) => item.occurrences)
      chartInstance.update()
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})
</script>

<style scoped>
.BeneficiaryTypeChart {
  width: 100% !important;
  height: 100% !important;
  display: block;
}
</style>
