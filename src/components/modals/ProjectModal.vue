<template>
  <AddNewModal
    :show="show"
    :title="isEdit ? 'Edit Project' : 'Create New Project'"
    @close="handleClose"
    size="md"
  >
    <form @submit.prevent="handleSubmit" class="project-form">
      <div v-if="errors.general" class="error-banner">
        {{ errors.general }}
      </div>

      <div class="form-group">
        <label for="projectName" class="form-label">Project Name *</label>
        <input
          id="projectName"
          v-model="form.name"
          type="text"
          class="form-input"
          :class="{ error: errors.name }"
          placeholder="Enter project name"
          required
        />
        <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
      </div>

      <div class="form-group">
        <label for="projectDescription" class="form-label">Description</label>
        <textarea
          id="projectDescription"
          v-model="form.description"
          class="form-textarea"
          placeholder="Enter project description"
          rows="4"
        ></textarea>
      </div>

      <div class="form-group" v-if="isEdit">
        <label for="projectStatus" class="form-label">Status</label>
        <select id="projectStatus" v-model="form.status" class="form-select">
          <option :value="ProjectStatus.ACTIVE">Active</option>
          <option :value="ProjectStatus.ARCHIVED">Archived</option>
        </select>
      </div>
    </form>

    <template #footer>
      <button type="button" class="btn btn-secondary" @click="handleClose" :disabled="loading">
        Cancel
      </button>
      <button
        type="submit"
        class="btn btn-primary"
        @click="handleSubmit"
        :disabled="loading || !isFormValid"
      >
        {{ loading ? 'Saving...' : isEdit ? 'Update Project' : 'Create Project' }}
      </button>
    </template>
  </AddNewModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

import { useProjectsStore } from '@/stores/projects'
import AddNewModal from '@/components/modals/AddNewModal.vue'
import { type Project, type CreateProjectInput, ProjectStatus } from '@/types/types'

interface Props {
  show: boolean
  project?: Project | null
  loading?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'save', data: CreateProjectInput): void
  (e: 'update', id: string, data: Partial<Project>): void
}

const props = withDefaults(defineProps<Props>(), {
  project: null,
  loading: false,
})

const emit = defineEmits<Emits>()

const projectsStore = useProjectsStore()

const form = ref<{
  name: string
  description: string
  status: ProjectStatus
}>({
  name: '',
  description: '',
  status: ProjectStatus.ACTIVE,
})

const errors = ref<Record<string, string>>({})

const isEdit = computed(() => !!props.project)

const isFormValid = computed(() => {
  return form.value.name.trim() && !errors.value.name
})

const resetForm = () => {
  form.value = {
    name: '',
    description: '',
    status: ProjectStatus.ACTIVE,
  }
  errors.value = {}
}

const populateForm = (project: Project) => {
  form.value = {
    name: project.name,
    description: project.description || '',
    status: project.status,
  }
}

const validateForm = () => {
  errors.value = {}

  if (!form.value.name.trim()) {
    errors.value.name = 'Project name is required'
    return false
  }

  const trimmedName = form.value.name.trim()
  const existingProject = projectsStore.projects.find(
    (project) =>
      project.name.toLowerCase() === trimmedName.toLowerCase() &&
      (!isEdit.value || project.id !== props.project?.id)
  )

  if (existingProject) {
    errors.value.name = 'A project with this name already exists'
    return false
  }

  return true
}

const handleSubmit = () => {
  if (!validateForm()) return

  const projectData = {
    name: form.value.name.trim(),
    description: form.value.description.trim() || undefined,
    ...(isEdit.value && { status: form.value.status }),
  }

  if (isEdit.value && props.project) {
    emit('update', props.project.id, projectData)
  } else {
    emit('save', {
      name: projectData.name,
      description: projectData.description,
    })
  }
}

const handleClose = () => {
  if (!props.loading) {
    resetForm()
    emit('close')
  }
}

watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      if (props.project) {
        populateForm(props.project)
      } else {
        resetForm()
      }
    }
  }
)

watch(
  () => props.project,
  (newProject) => {
    if (newProject && props.show) {
      populateForm(newProject)
    }
  }
)

watch(
  () => form.value.name,
  () => {
    if (form.value.name.trim() && errors.value.name) {
      delete errors.value.name

      const trimmedName = form.value.name.trim()
      const existingProject = projectsStore.projects.find(
        (project) =>
          project.name.toLowerCase() === trimmedName.toLowerCase() &&
          (!isEdit.value || project.id !== props.project?.id)
      )

      if (existingProject) {
        errors.value.name = 'A project with this name already exists'
      }
    }
  }
)
</script>

<style scoped lang="scss">
.project-form {
  .form-group {
    margin-bottom: 1.5rem;

    &:last-child {
      margin-bottom: 0;
    }

    .form-label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #374151;
      font-size: 0.875rem;
    }

    .form-input,
    .form-textarea,
    .form-select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      transition: all 0.2s;
      background: white;

      &:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      &.error {
        border-color: #dc2626;
        box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
      }

      &::placeholder {
        color: #9ca3af;
      }
    }

    .form-textarea {
      resize: vertical;
      min-height: 100px;
    }

    .form-select {
      cursor: pointer;

      option {
        padding: 0.5rem;
      }
    }

    .error-message {
      display: block;
      margin-top: 0.5rem;
      font-size: 0.75rem;
      color: #dc2626;
      font-weight: 500;
    }
  }
}

.error-banner {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
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
}
</style>
