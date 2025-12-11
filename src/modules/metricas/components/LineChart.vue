<template>
  <div class="w-full">
    <canvas ref="chartCanvas" :height="height"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import type { TimeSeriesData } from '@/services/metrics.service'

interface Props {
  data: TimeSeriesData[]
  height?: number
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: 300,
  color: '#3B82F6'
})

const chartCanvas = ref<HTMLCanvasElement | null>(null)

const drawChart = () => {
  if (!chartCanvas.value || props.data.length === 0) return

  const canvas = chartCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Set canvas size
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width * window.devicePixelRatio
  canvas.height = props.height * window.devicePixelRatio
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

  const width = rect.width
  const height = props.height
  const padding = 60

  // Clear canvas
  ctx.clearRect(0, 0, width, height)

  // Find min/max values
  const maxValue = Math.max(...props.data.map(d => d.count))
  const minValue = Math.min(...props.data.map(d => d.count))
  const valueRange = maxValue - minValue || 1

  // Draw grid lines and labels
  ctx.strokeStyle = '#E5E7EB'
  ctx.fillStyle = '#6B7280'
  ctx.font = '12px system-ui'
  ctx.lineWidth = 1

  // Y-axis grid lines
  const ySteps = 5
  for (let i = 0; i <= ySteps; i++) {
    const y = padding + (height - 2 * padding) * (i / ySteps)
    const value = Math.round(maxValue - (maxValue - minValue) * (i / ySteps))
    
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(width - padding, y)
    ctx.stroke()
    
    // Y-axis labels
    ctx.fillText(value.toString(), 10, y + 4)
  }

  // X-axis grid lines and labels
  const xStep = Math.max(1, Math.floor(props.data.length / 8))
  for (let i = 0; i < props.data.length; i += xStep) {
    const x = padding + (width - 2 * padding) * (i / (props.data.length - 1))
    const date = new Date(props.data[i].date)
    const label = date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })
    
    ctx.beginPath()
    ctx.moveTo(x, padding)
    ctx.lineTo(x, height - padding)
    ctx.stroke()
    
    // X-axis labels
    ctx.save()
    ctx.translate(x, height - 20)
    ctx.rotate(-Math.PI / 4)
    ctx.fillText(label, 0, 0)
    ctx.restore()
  }

  // Draw line
  ctx.strokeStyle = props.color
  ctx.fillStyle = props.color + '20' // Add transparency for fill
  ctx.lineWidth = 3
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'

  // Create path for line
  ctx.beginPath()
  props.data.forEach((point, index) => {
    const x = padding + (width - 2 * padding) * (index / (props.data.length - 1))
    const y = padding + (height - 2 * padding) * (1 - (point.count - minValue) / valueRange)
    
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })

  // Draw line
  ctx.stroke()

  // Fill area under line
  ctx.lineTo(width - padding, height - padding)
  ctx.lineTo(padding, height - padding)
  ctx.closePath()
  ctx.fill()

  // Draw points
  ctx.fillStyle = props.color
  props.data.forEach((point, index) => {
    const x = padding + (width - 2 * padding) * (index / (props.data.length - 1))
    const y = padding + (height - 2 * padding) * (1 - (point.count - minValue) / valueRange)
    
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, 2 * Math.PI)
    ctx.fill()
  })
}

onMounted(() => {
  drawChart()
})

watch(() => props.data, () => {
  drawChart()
}, { deep: true })

watch(() => props.color, () => {
  drawChart()
})
</script>

<style scoped>
canvas {
  width: 100%;
  height: auto;
}
</style>