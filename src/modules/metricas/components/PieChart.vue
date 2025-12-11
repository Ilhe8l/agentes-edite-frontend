<template>
  <div class="w-full">
    <div class="flex flex-col lg:flex-row items-center gap-8">
      <!-- Chart -->
      <div class="flex-shrink-0">
        <canvas ref="chartCanvas" :width="chartSize" :height="chartSize"></canvas>
      </div>
      
      <!-- Legend -->
      <div class="flex-1 space-y-3">
        <h4 class="font-semibold text-gray-900 mb-4">Editais</h4>
        <div class="space-y-2 max-h-80 overflow-y-auto">
          <div
            v-for="(item, index) in data"
            :key="item.editalId"
            class="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div class="flex items-center space-x-3">
              <div
                class="w-4 h-4 rounded-full flex-shrink-0"
                :style="{ backgroundColor: colors[index % colors.length] }"
              ></div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-gray-900 truncate" :title="item.editalName">
                  {{ truncateText(item.editalName, 20) }}
                </p>
                <p class="text-xs text-gray-500">
                  ID: {{ item.editalId }} <!-- TODO: Usar número do edital quando disponível -->
                </p>
              </div>
            </div>
            <div class="text-right flex-shrink-0">
              <p class="text-sm font-semibold text-gray-900">
                {{ item.messageCount }}
              </p>
              <p class="text-xs text-gray-500">
                {{ Math.round((item.messageCount / totalMessages) * 100) }}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { EditalDistribution } from '@/services/metrics.service'

interface Props {
  data: EditalDistribution[]
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  height: 400
})

const chartCanvas = ref<HTMLCanvasElement | null>(null)
const chartSize = computed(() => Math.min(props.height, 400))

const colors = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#F43F5E', // Rose
]

const totalMessages = computed(() => {
  return props.data.reduce((sum, item) => sum + item.messageCount, 0)
})

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const drawChart = () => {
  if (!chartCanvas.value || props.data.length === 0) return

  const canvas = chartCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const size = chartSize.value
  const centerX = size / 2
  const centerY = size / 2
  const radius = Math.min(centerX, centerY) - 20

  // Clear canvas
  ctx.clearRect(0, 0, size, size)

  // Calculate angles
  let currentAngle = -Math.PI / 2 // Start from top
  const total = totalMessages.value

  props.data.forEach((item, index) => {
    const sliceAngle = (item.messageCount / total) * 2 * Math.PI
    const color = colors[index % colors.length]

    // Draw slice
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
    ctx.closePath()
    ctx.fillStyle = color
    ctx.fill()

    // Draw border
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw percentage label if slice is large enough
    const percentage = (item.messageCount / total) * 100
    if (percentage > 5) {
      const labelAngle = currentAngle + sliceAngle / 2
      const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7)
      const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7)

      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 12px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`${Math.round(percentage)}%`, labelX, labelY)
    }

    currentAngle += sliceAngle
  })

  // Draw center circle for donut effect
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius * 0.4, 0, 2 * Math.PI)
  ctx.fillStyle = '#FFFFFF'
  ctx.fill()

  // Draw total in center
  ctx.fillStyle = '#374151'
  ctx.font = 'bold 16px system-ui'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('Total', centerX, centerY - 10)
  ctx.font = 'bold 20px system-ui'
  ctx.fillText(total.toString(), centerX, centerY + 10)
}

onMounted(() => {
  drawChart()
})

watch(() => props.data, () => {
  drawChart()
}, { deep: true })
</script>

<style scoped>
canvas {
  display: block;
}
</style>