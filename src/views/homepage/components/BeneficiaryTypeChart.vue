<template>
  <div class="BeneficiaryTypeChart">
    <canvas ref="canvasEl"></canvas>
  </div>
</template>

<script setup lang="ts">
import { i18n } from '@/plugins/i18n'
import { useDashboardStore } from '@/stores/dashboardStore'
import { ArcElement, Chart, DoughnutController, Legend, Title, Tooltip } from 'chart.js'
import { onBeforeUnmount, onMounted, ref } from 'vue'

// Enregistrement des éléments nécessaires à Chart.js
Chart.register(DoughnutController, ArcElement, Tooltip, Legend, Title)

const dashboardStore = useDashboardStore()

const canvasEl = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart<'doughnut'> | null = null

onMounted(async () => {
  if (!canvasEl.value) return
  await dashboardStore.fetchStats()
  const data = dashboardStore.stats!.beneficiaries_types_details

  const labels = data.map((d: any) => d.type)
  const values = data.map((d: any) => d.occurrences)

  const colors = [
    '#60a5fa',
    '#34d399',
    '#fbbf24',
    '#f472b6',
    '#a78bfa',
    '#f87171',
    '#22d3ee',
    '#c084fc',
    '#fb7185',
  ]

  chartInstance = new Chart(canvasEl.value, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors,
          borderWidth: 1,
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
              const item = data[context.dataIndex]
              return `${item.type}: ${item.occurrences} (${item.percentage}%)`
            },
          },
        },
      },
    },
  })
})

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
