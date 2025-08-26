<template>
  <div class="task-distribution-chart">
    <div class="chart-header">
      <h3>Task Distribution by Status</h3>
      <p class="chart-subtitle">Overview of all tasks across projects</p>
    </div>
    
    <div class="chart-container">
      <div v-if="loading" class="chart-loading">
        <p>Loading chart data...</p>
      </div>
      
      <div v-else-if="hasNoData" class="chart-empty">
        <p>No tasks available to display</p>
      </div>
      
      <div v-else class="chart-wrapper">
        <div class="chart-canvas">
          <Doughnut
            :data="chartData"
            :options="chartOptions"
            :plugins="chartPlugins"
          />
        </div>
        
        <div class="chart-legend-overlay">
          <div 
            v-for="(item) in legendItems" 
            :key="item.label"
            class="legend-item"
          >
            <div 
              class="legend-color"
              :style="{ backgroundColor: item.color }"
            ></div>
            <span class="legend-label">{{ item.label }}</span>
            <span class="legend-count">{{ item.count }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  Legend,
  Tooltip,
  ArcElement,
  type ChartData,
  type ChartOptions,
  Chart as ChartJS
} from 'chart.js'
import { Doughnut } from 'vue-chartjs'

import { TaskStatus } from '@/types/types'

ChartJS.register(ArcElement, Tooltip, Legend)

interface Props {
  taskDistribution: Record<TaskStatus, number>
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const colors = {
  [TaskStatus.TODO]: '#f59e0b',
  [TaskStatus.IN_PROGRESS]: '#3b82f6',
  [TaskStatus.DONE]: '#10b981'
}

const hasNoData = computed(() => {
  return Object.values(props.taskDistribution).every(count => count === 0)
})

const chartData = computed<ChartData<'doughnut'>>(() => {
  const labels = Object.keys(props.taskDistribution) as TaskStatus[]
  const data = Object.values(props.taskDistribution)
  const backgroundColors = labels.map(status => colors[status])

  return {
    labels: labels.map(status => {
      switch (status) {
        case TaskStatus.TODO: return 'To Do'
        case TaskStatus.IN_PROGRESS: return 'In Progress'
        case TaskStatus.DONE: return 'Done'
        default: return status
      }
    }),
    datasets: [
      {
        data,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors.map(color => color),
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverOffset: 8
      }
    ]
  }
})

const chartOptions = computed<ChartOptions<'doughnut'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.label || ''
          const value = context.parsed
          const total = context.dataset.data.reduce((a, b) => (a as number) + (b as number), 0) as number
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0'
          return `${label}: ${value} tasks (${percentage}%)`
        }
      },
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: '#374151',
      borderWidth: 1
    }
  },
  cutout: '60%',
  animation: {
    animateRotate: true,
    duration: 1000
  }
}))

const chartPlugins = ref([
  {
    id: 'centerText',
    beforeDraw: (chart: ChartJS) => {
      const { ctx, width, height } = chart
      const total = Object.values(props.taskDistribution).reduce((a, b) => a + b, 0)
      
      ctx.restore()
      const fontSize = Math.min(width, height) * 0.08
      ctx.font = `bold ${fontSize}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#374151'
      
      const centerX = width / 2
      const centerY = height / 2
      
      ctx.fillText(total.toString(), centerX, centerY - 10)
      
      ctx.font = `${fontSize * 0.6}px sans-serif`
      ctx.fillStyle = '#6b7280'
      ctx.fillText('Total Tasks', centerX, centerY + 15)
      
      ctx.save()
    }
  }
])

const legendItems = computed(() => {
  return Object.entries(props.taskDistribution).map(([status, count]) => ({
    label: status === TaskStatus.TODO ? 'To Do' : 
           status === TaskStatus.IN_PROGRESS ? 'In Progress' : 
           status === TaskStatus.DONE ? 'Done' : status,
    count,
    color: colors[status as TaskStatus]
  }))
})
</script>

<style scoped lang="scss">
.task-distribution-chart {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  margin-bottom: 24px;
}

.chart-header {
  margin-bottom: 20px;
  text-align: center;
  
  h3 {
    margin: 0 0 8px 0;
    color: #1f2937;
    font-size: 1.25rem;
    font-weight: 600;
  }
  
  .chart-subtitle {
    margin: 0;
    color: #6b7280;
    font-size: 0.875rem;
  }
}

.chart-container {
  position: relative;
  min-height: 300px;
}

.chart-loading,
.chart-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #6b7280;
  font-size: 0.875rem;
}

.chart-wrapper {
  position: relative;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart-canvas {
  width: 100%;
  height: 100%;
  max-width: 400px;
}

.chart-legend-overlay {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 120px;
  
  @media (max-width: 768px) {
    position: static;
    margin-top: 16px;
    background: transparent;
    box-shadow: none;
    border: none;
    padding: 0;
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
    min-width: auto;
  }
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  
  @media (max-width: 768px) {
    margin: 0 8px;
    font-size: 0.875rem;
  }
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    width: 16px;
    height: 16px;
    border-radius: 4px;
  }
}

.legend-label {
  color: #374151;
  font-weight: 500;
  white-space: nowrap;
}

.legend-count {
  color: #6b7280;
  font-weight: 600;
  margin-left: auto;
  
  @media (max-width: 768px) {
    margin-left: 4px;
  }
}
</style>
