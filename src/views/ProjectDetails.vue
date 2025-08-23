<template>
  <div class="project-details">
    <h1>Project Details</h1>
    <ProjectsTable
      v-model:modelValue="tasks"
      :headers="taskHeaders"
      table-type="tasks"
    />
  </div>
</template>

<script setup lang="ts">
  import ProjectsTable from '@/components/TableComponent.vue'
  import { ref } from 'vue'

  interface Task {
    id: number
    name: string
    assignee: string
    status: 'todo' | 'in-progress' | 'done'
    dueDate: string
  }

  interface Header<T> {
    key: keyof T
    title?: string
    width?: number
    minWidth?: number
    sortable?: boolean
  }

  const tasks = ref<Task[]>([
    { id: 1, name: 'Create wireframes', assignee: 'Alice', status: 'done', dueDate: '2025-01-05' },
    { id: 2, name: 'Implement login page', assignee: 'Bob', status: 'in-progress', dueDate: '2025-01-12' },
  ])
  const taskHeaders: Header<Task>[] = [
    { key: 'id', title: 'ID', width: 80, minWidth: 60, sortable: true },
    { key: 'name', title: 'Task', width: 200, minWidth: 120, sortable: true },
    { key: 'assignee', title: 'Assignee', width: 150, minWidth: 100, sortable: true },
    { key: 'status', title: 'Status', width: 120, minWidth: 100, sortable: true },
    { key: 'dueDate', title: 'Due Date', width: 150, minWidth: 120, sortable: true },
  ]
</script>

<style scoped>
.project-details {
  padding: 20px;
}
</style>
