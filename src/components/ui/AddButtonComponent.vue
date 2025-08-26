<template>
  <button class="btn btn-primary" @click="showCreateModal = true">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
    Add
  </button>
    <AddNewModal
      :show="showCreateModal"
      @close="closeCreateModal"
      title="Create New Project"
    >
      <form @submit.prevent="handleCreateProject" class="project-form">
        <div v-if="errors.general" class="error-banner">
          {{ errors.general }}
        </div>
        
        <div class="form-group">
          <label for="projectName" class="form-label">Project Name *</label>
          <input
            id="projectName"
            v-model="newProject.name"
            type="text"
            class="form-input"
            :class="{ 'error': errors.name }"
            placeholder="Enter project name"
            required
          />
          <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
        </div>

        <div class="form-group">
          <label for="projectDescription" class="form-label">Description</label>
          <textarea
            id="projectDescription"
            v-model="newProject.description"
            class="form-textarea"
            placeholder="Enter project description"
            rows="4"
          ></textarea>
        </div>
      </form>

    <template #footer>
      <button type="button" class="btn btn-secondary" @click="closeCreateModal">
        Cancel
      </button>
      <button
        type="submit"
        class="btn btn-primary"
        @click="handleCreateProject"
        :disabled="loading || !newProject.name.trim()"
      >
        {{ loading ? 'Creating...' : 'Create Project' }}
      </button>
    </template>
    </AddNewModal>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  import { useProjectsStore } from '@/stores/projects.ts'
  import type { CreateProjectInput } from '@/types/types'
  import AddNewModal from '@/components/modals/AddNewModal.vue'

  const projectsStore = useProjectsStore()

  const showCreateModal = ref(false)
  const loading = ref(false)
  const newProject = ref<CreateProjectInput>({
    name: '',
    description: ''
  })
  const errors = ref<Record<string, string>>({})

  function closeCreateModal() {
    showCreateModal.value = false
    newProject.value = { name: '', description: '' }
    errors.value = {}
  }

  async function handleCreateProject() {
    errors.value = {}
    
    if (!newProject.value.name.trim()) {
      errors.value.name = 'Project name is required'
      return
    }

    loading.value = true

    try {
      console.log('Creating project:', newProject.value)
      await projectsStore.addNewProject(newProject.value)

      closeCreateModal()
      
    } catch (error) {
      console.error('Failed to create project:', error)
      errors.value.general = 'Failed to create project'
    } finally {
      loading.value = false
    }
  }
</script>

<style lang="scss" scoped>
.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  margin-top: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.btn-primary {
  background: #3b82f6;
  color: white;
  
  &:hover:not(:disabled) {
    background: #2563eb;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
  
  &:hover:not(:disabled) {
    background: #e2e8f0;
  }
}

.error-banner {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 14px;
}
.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-weight: 600;
  margin-bottom: 4px;
  color: #374151;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
  
  &.error {
    border-color: #ef4444;
  }
}

.error-message {
  display: block;
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
}
</style>