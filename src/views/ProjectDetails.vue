<template>
  <div class="project-details">
    <div class="project-header">
      <button @click="goBack" class="back-btn">← Back to Projects</button>
      <h1>Project Details</h1>
      <div v-if="currentProject" class="project-info">
        <h2>{{ currentProject.name }}</h2>
        <div class="project-meta">
          <span class="status" :class="currentProject.status">{{ currentProject.status }}</span>
          <span class="tasks-count">{{ tasksCount }} tasks</span>
          <span class="created-date">Created: {{ formatDate(currentProject.createdAt) }}</span>
        </div>
      </div>
    </div>
    
    <div class="tasks-section">
      <div class="section-header">
        <h3>Tasks</h3>
          <button @click="openCreateModal" class="btn btn-primary">
            Add Task
          </button>
      </div>
      
      <div v-if="loading" class="loading">
        <p>Loading project tasks...</p>
      </div>
      
      <div v-else-if="error" class="error">
        <p>Error loading tasks: {{ error }}</p>
      </div>
      
      <div v-else-if="displayTasks.length === 0" class="empty">
        <p>No tasks found for this project</p>
        <button @click="openCreateModal" class="btn btn-primary">
          Create First Task
        </button>
      </div>
      
      <template v-else>
        <TaskTable
          :data="tasks"
          v-model:modelValue="draggableTasks"
          :headers="tasksHeaders"
          table-type="tasks"
          @row-reorder="handleReorder"
        />
        
        <TaskBoard
          :tasks="tasks"
          v-model:modelValue="tasks"
          @task-move="handleTaskMove"
          @task-click="handleTaskClick"
          @edit-task="handleEditTask"
          @delete-task="handleDeleteTask"
        />
      </template>
    </div>
    
    <TaskModal
      :show="showTaskModal"
      :task="editingTask"
      :project-id="projectId"
      :loading="taskLoading"
      @close="closeTaskModal"
      @save="handleCreateTask"
      @update="handleUpdateTask"
    />

    <AddNewModal
      :show="showDeleteModal"
      title="Delete Task"
      @close="showDeleteModal = false"
      size="sm"
    >
      <p>Are you sure you want to delete this task? This action cannot be undone.</p>
      
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">
          Cancel
        </button>
        <button
          type="button"
          class="btn btn-danger"
          @click="confirmDeleteTask"
          :disabled="taskLoading"
        >
          {{ taskLoading ? 'Deleting...' : 'Delete Task' }}
        </button>
      </template>
    </AddNewModal>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onMounted, ref, computed, watch } from 'vue'

import TaskTable from '@/components/TableComponent.vue'
import AddNewModal from '@/components/modals/AddNewModal.vue'
import TaskModal from '@/components/modals/TaskModal.vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectsStore } from '../stores/projects.ts'
import { useTasksStore } from '../stores/tasks.ts'
import TaskBoard from '@/components/TaskBoard.vue'
import type { Task, TaskStatus, CreateTaskData } from '../types/types.ts'

const route = useRoute()
const router = useRouter()
const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()

const { projects } = storeToRefs(projectsStore)

const projectId = computed<string>(() => {
  const id = route.params.id
  return Array.isArray(id) ? id[0] : id
})

const currentProject = computed(() => 
  projects.value.find(p => p.id.toString() === projectId.value)
)

const tasks = ref<Task[]>([])
const tasksCount = computed(() => tasks.value.length)
const loading = ref(false)
const error = ref<string | null>(null)
const taskLoading = ref(false)
const editingTask = ref<Task | null>(null)
const taskToDelete = ref<Task | null>(null)
const showTaskModal = ref(false)
const showDeleteModal = ref(false)
const draggableTasks = ref<Task[]>([])

const loadProjectTasks = async () => {
  if (!projectId.value) return
  await tasksStore.fetchTasksByProject(projectId.value)
  tasks.value = tasksStore.getTasksByProjectId(projectId.value)
}

const tasksHeaders = [
  { key: 'id', title: 'ID', width: 60, minWidth: 50, sortable: true },
  { key: 'name', title: 'Task Name', width: 250, minWidth: 150, sortable: true },
  { key: 'assignee', title: 'Assignee', width: 120, minWidth: 100, sortable: true },
  { key: 'status', title: 'Status', width: 120, minWidth: 100, sortable: true },
  { key: 'dueDate', title: 'Due Date', width: 130, minWidth: 120, sortable: true },
]

const displayTasks = computed(() => tasks.value)

watch(
  () => tasksStore.getTasksByProjectId(projectId.value),
  (newTasks: Task[]) => {
    tasks.value = newTasks
  }
)
watch(
  () => tasksStore.getTasksByProjectId(projectId.value),
  function (newVal) {
    draggableTasks.value = newVal.slice()
  },
  { immediate: true }
)
const handleReorder = () => {
  const ids = draggableTasks.value.map(p => p.id)
  projects.value.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id))
}

const goBack = () => router.push('/projects')
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString()

const openCreateModal = () => {
  editingTask.value = null
  showTaskModal.value = true
}
const openEditModal = (task: Task) => {
  editingTask.value = task
  showTaskModal.value = true
}
const closeTaskModal = () => {
  showTaskModal.value = false
  editingTask.value = null
}

async function handleCreateTask(data: CreateTaskData) {
  taskLoading.value = true
  await tasksStore.createTask(data)
  await loadProjectTasks()
  closeTaskModal()
  taskLoading.value = false
}

async function handleUpdateTask(id: string, data: Partial<Task>) {
  taskLoading.value = true
  await tasksStore.updateTask(id, data)
  await loadProjectTasks()
  closeTaskModal()
  taskLoading.value = false
}

async function handleTaskMove(payload: { taskId: string; newStatus: TaskStatus; newIndex: string }) {
  await tasksStore.updateTaskStatus(payload.taskId, payload.newStatus)
  await loadProjectTasks()
}

function handleTaskClick(task: Task) {
  openEditModal(task)
}

function handleEditTask(task: Task) {
  openEditModal(task)
}

function handleDeleteTask(task: Task) {
  taskToDelete.value = task
  showDeleteModal.value = true
}

async function confirmDeleteTask() {
  if (!taskToDelete.value) return
  taskLoading.value = true

  await tasksStore.deleteTask(taskToDelete.value.id)
  await loadProjectTasks()

  showDeleteModal.value = false
  taskToDelete.value = null
  taskLoading.value = false
}

onMounted(async () => {
  await projectsStore.dispatchGetProjects()
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
    transition: background-color 0.2s;
    
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
      text-transform: capitalize;
      
      &.active {
        background: #dcfce7;
        color: #166534;
      }
      
      &.archived, &.completed {
        background: #f3f4f6;
        color: #374151;
      }
      
      &.on_hold {
        background: #fef3c7;
        color: #92400e;
      }
      
      &.cancelled {
        background: #fecaca;
        color: #dc2626;
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
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h3 {
      margin: 0;
      color: #1f2937;
    }
    
    .view-controls {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    
    .view-btn {
      padding: 6px 12px;
      border: 1px solid #e5e7eb;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
      
      &:hover {
        background: #f9fafb;
      }
      
      &.active {
        background: #3b82f6;
        color: white;
        border-color: #3b82f6;
      }
    }
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
    transition: background-color 0.2s;
    
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

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &.btn-primary {
    background: #3b82f6;
    color: white;
    
    &:hover:not(:disabled) {
      background: #2563eb;
    }
  }
  
  &.btn-secondary {
    background: #6b7280;
    color: white;
    
    &:hover:not(:disabled) {
      background: #4b5563;
    }
  }
  
  &.btn-danger {
    background: #dc2626;
    color: white;
    
    &:hover:not(:disabled) {
      background: #b91c1c;
    }
  }
}
</style>