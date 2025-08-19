<template>
  <div>
    <canvas ref="canvasEl"></canvas>
  </div>
</template>

<script setup lang="ts">
import { i18n } from '@/plugins/i18n'
import { useDashboardStore } from '@/stores/dashboardStore'
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js'
import { onBeforeUnmount, onMounted, ref } from 'vue'
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend)

const dashboardStore = useDashboardStore()

const canvasEl = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart<'bar'> | null = null

onMounted(async () => {
  if (!canvasEl.value) return
  await dashboardStore.fetchStats()
  const data = dashboardStore.stats!.interventions_fields_details
  const labels = data.map((d: any) => d.secteur)
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
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors,
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: i18n.t('homepage.chart1Title') },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 },
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
