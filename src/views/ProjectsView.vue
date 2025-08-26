<template>
  <div class="projects">
    <h1>Projects</h1>
    
    <div v-if="loading" class="loading">
      <p>Loading projects...</p>
    </div>
    
    <div v-else-if="error" class="error">
      <p>Error loading projects: {{ error }}</p>
      <button @click="retryLoading" class="retry-btn">Retry</button>
    </div>
    
    <div v-else-if="projects.length === 0" class="empty">
      <p>No projects found</p>
      <button @click="handleCreateProject" class="btn btn-primary">
        Create First Project
      </button>
    </div>
    
    <div v-else class="projects-section">
      <TaskDistributionChart 
        :task-distribution="taskDistributionByStatus"
        :loading="tasksStore.loading"
      />
      
      <div class="section-header">
        <h3>Projects</h3>
        <button @click="handleCreateProject" class="btn btn-primary">
          Add Project
        </button>
      </div>
      
      <ProjectsTable
        v-model:modelValue="draggableProjects"
        :headers="projectsHeaders"
        table-type="projects"
        @row-reorder="handleReorder"
        @edit-project="handleEditProject"
        @delete-project="handleDeleteProject"
      />
    </div>
    <ProjectModal
      :show="showCreateModal"
      :loading="modalLoading"
      @close="closeCreateModal"
      @save="handleSaveProject"
    />
    <ProjectModal
      :show="showEditModal"
      :project="editingProject"
      :loading="modalLoading"
      @close="closeEditModal"
      @update="handleUpdateProject"
    />
    <AddNewModal
      :show="showDeleteModal"
      title="Delete Project"
      @close="showDeleteModal = false"
      size="sm"
    >
      <p>Are you sure you want to delete the project "{{ projectToDelete?.name }}"? This action cannot be undone and will also delete all associated tasks.</p>
      
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="showDeleteModal = false" :disabled="modalLoading">
          Cancel
        </button>
        <button
          type="button"
          class="btn btn-danger"
          @click="confirmDeleteProject"
          :disabled="modalLoading"
        >
          {{ modalLoading ? 'Deleting...' : 'Delete Project' }}
        </button>
      </template>
    </AddNewModal>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onMounted, ref, watch } from 'vue'

import { useTasksStore } from '@/stores/tasks.ts'
import { useProjectsStore } from '@/stores/projects.ts'
import ProjectsTable from '@/components/TableComponent.vue'
import ProjectModal from '@/components/modals/ProjectModal.vue'
import AddNewModal from '@/components/modals/AddNewModal.vue'
import TaskDistributionChart from '@/components/charts/TaskDistributionChart.vue'
import type { Project, CreateProjectInput } from '@/types/types.ts'

const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()

const { projects, loading, error } = storeToRefs(projectsStore)
const { taskDistributionByStatus } = storeToRefs(tasksStore)

const draggableProjects = ref<Project[]>([])
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const editingProject = ref<Project | null>(null)
const projectToDelete = ref<Project | null>(null)
const modalLoading = ref(false)

const projectsHeaders = [
  { key: 'id', title: 'ID', width: 80, minWidth: 60, sortable: true },
  { key: 'name', title: 'Name', width: 200, minWidth: 120, sortable: true },
  { key: 'tasksCount', title: 'Tasks', width: 100, minWidth: 80, sortable: true },
  { key: 'status', title: 'Status', width: 120, minWidth: 100, sortable: true },
  { key: 'createdAt', title: 'Created At', width: 150, minWidth: 120, sortable: true },
  { key: 'actions', title: 'Actions', width: 120, minWidth: 100, sortable: false },
]

watch(
  () => projectsStore.projectsWithCounts,
  function (newVal) {
    draggableProjects.value = newVal.slice()
  },
  { immediate: true }
)

const handleReorder = () => {
  const ids = draggableProjects.value.map(p => p.id)
  projects.value.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id))
}

const hasTriedLoading = ref(false)

const loadProjects = async () => {
  if (loading.value) return
  await projectsStore.fetchAllProjects()
}

const retryLoading = async () => {
  hasTriedLoading.value = false
  await loadProjects()
  await tasksStore.fetchTasks()
}

const handleCreateProject = () => {
  showCreateModal.value = true
}

const handleEditProject = (project: Project) => {
  editingProject.value = project
  showEditModal.value = true
}

const handleDeleteProject = (project: Project) => {
  projectToDelete.value = project
  showDeleteModal.value = true
}

const handleSaveProject = async (data: CreateProjectInput) => {
  modalLoading.value = true
  try {
    await projectsStore.addNewProject(data)
    showCreateModal.value = false
  } catch (error) {
    console.error('Failed to create project:', error)
  } finally {
    modalLoading.value = false
  }
}

const handleUpdateProject = async (id: string, data: Partial<Project>) => {
  modalLoading.value = true
  try {
    await projectsStore.updateProject(id, data)
    showEditModal.value = false
    editingProject.value = null
  } catch (error) {
    console.error('Failed to update project:', error)
  } finally {
    modalLoading.value = false
  }
}

const confirmDeleteProject = async () => {
  if (!projectToDelete.value) return
  modalLoading.value = true
  
  try {
    await projectsStore.deleteProject(projectToDelete.value.id)
    showDeleteModal.value = false
    projectToDelete.value = null
  } catch (error) {
    console.error('Failed to delete project:', error)
  } finally {
    modalLoading.value = false
  }
}

const closeCreateModal = () => {
  showCreateModal.value = false
}

const closeEditModal = () => {
  showEditModal.value = false
  editingProject.value = null
}

onMounted(async () => {
  if (hasTriedLoading.value) return
  hasTriedLoading.value = true
  await loadProjects()
  await tasksStore.fetchTasks()
})
</script>

<style scoped lang="scss">
  .projects {
    padding: 20px;
    margin: 20px;
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

  .projects-section {
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      
      h3 {
        margin: 0;
        color: #1f2937;
      }
    }
  }

  .btn {
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 100px;
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    
    &:not(:disabled):hover {
      transform: translateY(-1px);
    }
    
    &.btn-primary {
      background: #3b82f6;
      color: white;
      
      &:hover:not(:disabled) {
        background: #2563eb;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
      }
    }
    
    &.btn-secondary {
      background: #6b7280;
      color: white;
      
      &:hover:not(:disabled) {
        background: #4b5563;
        box-shadow: 0 4px 12px rgba(107, 114, 128, 0.4);
      }
    }
    
    &.btn-danger {
      background: #dc2626;
      color: white;
      
      &:hover:not(:disabled) {
        background: #b91c1c;
        box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
      }
    }
  }
</style>