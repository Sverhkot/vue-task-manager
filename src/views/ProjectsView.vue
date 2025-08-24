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
    </div>
    
    <ProjectsTable
      v-else
      v-model:modelValue="projects"
      :headers="projectsHeaders"
      table-type="projects"
    />
    <AddButtonComponent/>
  </div>
</template>

<script setup lang="ts">
import ProjectsTable from '@/components/TableComponent.vue'
import { useProjectsStore } from '../stores/projects/index.ts'
import AddButtonComponent from '@/components/ui/AddButtonComponent.vue';
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue';

const projectsStore = useProjectsStore()

const { projects, loading, error } = storeToRefs(projectsStore)

const projectsHeaders = [
  { key: 'id', title: 'ID', width: 80, minWidth: 60, sortable: true },
  { key: 'name', title: 'Name', width: 200, minWidth: 120, sortable: true },
  { key: 'tasksCount', title: 'Tasks', width: 100, minWidth: 80, sortable: true },
  { key: 'status', title: 'Status', width: 120, minWidth: 100, sortable: true },
  { key: 'createdAt', title: 'Created At', width: 150, minWidth: 120, sortable: true },
]

const hasTriedLoading = ref(false)

const loadProjects = async () => {
  if (loading.value) return
  
  console.log('Attempting to load projects...')
  
  try {
    const result = await projectsStore.dispatchGetProjects();
    console.log('Load result:', result)
    
    if (!result.success) {
      console.error("Failed to load projects:", result.status, result);
    }
  } catch (err) {
    console.error('Error during project loading:', err)
  }
}

const retryLoading = () => {
  hasTriedLoading.value = false
  loadProjects()
}

onMounted(async () => {
  if (hasTriedLoading.value) return
  hasTriedLoading.value = true
  await loadProjects()
});
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
</style>