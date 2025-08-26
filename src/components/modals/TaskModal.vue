<template>
  <AddNewModal
    :show="show"
    :title="isEdit ? 'Edit Task' : 'Create New Task'"
    @close="handleClose"
    size="md"
  >
    <form @submit.prevent="handleSubmit" class="task-form">
      <div class="form-group">
        <label for="taskName" class="form-label">Task Name *</label>
        <input
          id="taskName"
          v-model="form.name"
          type="text"
          class="form-input"
          :class="{ 'error': errors.name }"
          placeholder="Enter task name"
          required
        />
        <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="taskAssignee" class="form-label">Assignee *</label>
          <select
            id="taskAssignee"
            v-model="form.assignee"
            class="form-select"
            :class="{ 'error': errors.assignee }"
            required
          >
            <option value="">Select assignee</option>
            <option v-for="assignee in availableAssignees" :key="assignee" :value="assignee">
              {{ assignee }}
            </option>
          </select>
          <span v-if="errors.assignee" class="error-message">{{ errors.assignee }}</span>
        </div>

        <div class="form-group">
          <label for="taskStatus" class="form-label">Status</label>
          <select
            id="taskStatus"
            v-model="form.status"
            class="form-select"
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label for="taskDueDate" class="form-label">Due Date *</label>
        <input
          id="taskDueDate"
          v-model="form.dueDate"
          type="date"
          class="form-input"
          :class="{ 'error': errors.dueDate }"
          required
        />
        <span v-if="errors.dueDate" class="error-message">{{ errors.dueDate }}</span>
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
        {{ loading ? 'Saving...' : (isEdit ? 'Update Task' : 'Create Task') }}
      </button>
    </template>
  </AddNewModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

import AddNewModal from '@/components/modals/AddNewModal.vue'
import { type Task, TaskStatus, type CreateTaskData } from '@/types/types'

interface Props {
  show: boolean
  task?: Task | null
  projectId: string
  loading?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'save', data: CreateTaskData): void
  (e: 'update', id: string, data: Partial<Task>): void
}

const props = withDefaults(defineProps<Props>(), {
  task: null,
  loading: false
})

const emit = defineEmits<Emits>()

const availableAssignees = [
  'John Doe',
  'Jane Smith',
  'Bob Johnson',
  'Alice Brown',
  'Mike Wilson',
  'Sarah Davis',
  'Tom Anderson'
]

const form = ref<{
  name: string
  assignee: string
  status: TaskStatus
  dueDate: string
}>({
  name: '',
  assignee: '',
  status: TaskStatus.TODO,
  dueDate: ''
})

const errors = ref<Record<string, string>>({})

const isEdit = computed(() => !!props.task)

const isFormValid = computed(() => {
  return form.value.name.trim() && 
         form.value.assignee && 
         form.value.dueDate
})

const resetForm = () => {
  form.value = {
    name: '',
    assignee: '',
    status: TaskStatus.TODO,
    dueDate: ''
  }
  errors.value = {}
}

const populateForm = (task: Task) => {
  form.value = {
    name: task.name,
    assignee: task.assignee,
    status: task.status,
    dueDate: task.dueDate.split('T')[0]
  }
}

const validateForm = () => {
  errors.value = {}

  if (!form.value.name.trim()) {
    errors.value.name = 'Task name is required'
  }

  if (!form.value.assignee) {
    errors.value.assignee = 'Assignee is required'
  }

  if (!form.value.dueDate) {
    errors.value.dueDate = 'Due date is required'
  }

  if (form.value.dueDate) {
    const selectedDate = new Date(form.value.dueDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (selectedDate < today) {
      errors.value.dueDate = 'Due date cannot be in the past'
    }
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = () => {
  if (!validateForm()) return

  const taskData = {
    name: form.value.name.trim(),
    assignee: form.value.assignee,
    status: form.value.status,
    dueDate: new Date(form.value.dueDate).toISOString(),
    projectId: props.projectId
  }

  if (isEdit.value && props.task) {
    emit('update', props.task.id, taskData)
  } else {
    emit('save', {
      ...taskData,
      projectId: props.projectId.toString()
    })
  }
}

const handleClose = () => {
  if (!props.loading) {
    resetForm()
    emit('close')
  }
}

watch(() => props.show, (newValue) => {
  if (newValue) {
    if (props.task) {
      populateForm(props.task)
    } else {
      resetForm()
    }
  }
})

watch(() => props.task, (newTask) => {
  if (newTask && props.show) {
    populateForm(newTask)
  }
})
</script>

<style scoped lang="scss">

.task-form {
  .form-group {
    margin-bottom: 1.5rem;
    width: 90%;
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
  
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    
    @media (max-width: 640px) {
      grid-template-columns: 1fr;
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
}
</style>