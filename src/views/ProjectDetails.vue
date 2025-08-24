<template>
  <div class="project-details">
    <div class="project-header">
      <button @click="goBack" class="back-btn">← Back to Projects</button>
      <h1>Project Details</h1>
      <div v-if="currentProject" class="project-info">
        <h2>{{ currentProject.name }}</h2>
        <div class="project-meta">
          <span class="status" :class="currentProject.status">{{ currentProject.status }}</span>
          <span class="tasks-count">{{ currentProject.tasksCount }} tasks</span>
          <span class="created-date">Created: {{ formatDate(currentProject.createdAt) }}</span>
        </div>
      </div>
    </div>
    
    <div class="tasks-section">
      <h3>Tasks</h3>
      
      <div v-if="loading" class="loading">
        <p>Loading project tasks...</p>
      </div>
      
      <div v-else-if="error" class="error">
        <p>❌ Error loading tasks: {{ error }}</p>
        <button @click="retryLoading" class="retry-btn">Retry</button>
      </div>
      
      <div v-else-if="tasks.length === 0" class="empty">
        <p>No tasks found for this project</p>
      </div>
      
      <ProjectsTable
        v-else
        v-model:modelValue="tasks"
        :headers="tasksHeaders"
        table-type="tasks"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import ProjectsTable from '@/components/TableComponent.vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectsStore } from '../stores/projects/index.ts'
import { storeToRefs } from 'pinia'
import { onMounted, ref, computed } from 'vue'
import type { Task } from '@/types/types.ts'

const route = useRoute()
const router = useRouter()
const projectsStore = useProjectsStore()

const { projects } = storeToRefs(projectsStore)

const projectId = computed(() => parseInt(route.params.id as string))

const currentProject = computed(() => 
  projects.value.find(p => p.id === projectId.value)
)

const tasks = ref<Task[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const tasksHeaders = [
  { key: 'id', title: 'ID', width: 60, minWidth: 50, sortable: true },
  { key: 'name', title: 'Task Name', width: 250, minWidth: 150, sortable: true },
  { key: 'assignee', title: 'Assignee', width: 120, minWidth: 100, sortable: true },
  { key: 'status', title: 'Status', width: 120, minWidth: 100, sortable: true },
  { key: 'dueDate', title: 'Due Date', width: 130, minWidth: 120, sortable: true },
]

const hasTriedLoading = ref(false)

const loadProjectTasks = async () => {
  if (loading.value) return
  
  loading.value = true
  error.value = null
  
  try {
    console.log('Loading tasks for project:', projectId.value)
    
    const response = await fetch(`http://localhost:3000/projectTasks?projectId=${projectId.value}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const projectTasks = await response.json()
    console.log('Tasks for this project:', projectTasks)
    
    tasks.value = projectTasks
    
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error('Error loading project tasks:', err)
    error.value = err.message || 'Failed to load project tasks'
  } finally {
    loading.value = false
  }
}

const retryLoading = () => {
  hasTriedLoading.value = false
  loadProjectTasks()
}

const goBack = () => {
  router.push('/projects')
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

onMounted(async () => {
  if (projects.value.length === 0) {
    await projectsStore.dispatchGetProjects()
  }
  
  if (hasTriedLoading.value) return
  hasTriedLoading.value = true
  await loadProjectTasks()
})
</script>

<style scoped lang="scss">
.project-details {
  padding: 20px;
}

.project-header {
  margin-bottom: 30px;
  
  .back-btn {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    margin-bottom: 16px;
    font-size: 14px;
    
    &:hover {
      background: #f1f5f9;
    }
  }
  
  h1 {
    margin: 0 0 16px 0;
    color: #1f2937;
  }
}

.project-info {
  background: #f8fafc;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  
  h2 {
    margin: 0 0 12px 0;
    color: #1f2937;
  }
  
  .project-meta {
    display: flex;
    gap: 16px;
    align-items: center;
    font-size: 14px;
    
    .status {
      padding: 4px 12px;
      border-radius: 20px;
      font-weight: 500;
      
      &.active {
        background: #dcfce7;
        color: #166534;
      }
      
      &.archived {
        background: #f3f4f6;
        color: #374151;
      }
    }
    
    .tasks-count {
      color: #6b7280;
      font-weight: 500;
    }
    
    .created-date {
      color: #6b7280;
    }
  }
}

.tasks-section {
  h3 {
    margin-bottom: 20px;
    color: #1f2937;
  }
}

.loading, .error, .empty {
  text-align: center;
  padding: 40px 20px;
  
  p {
    font-size: 16px;
    margin-bottom: 16px;
  }
}

.error {
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  
  .retry-btn {
    background: #dc2626;
    color: white;
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    
    &:hover {
      background: #b91c1c;
    }
  }
}

.loading {
  color: #1f2937;
}

.empty {
  color: #6b7280;
}
</style>