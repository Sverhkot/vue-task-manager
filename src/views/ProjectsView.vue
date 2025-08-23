<template>
  <div class="projects">
    <h1>Projects</h1>
    <ProjectsTable
      v-model:modelValue="projects"
      :headers="projectHeaders"
      table-type="projects"
    />
  </div>
</template>

<script setup lang="ts">
import ProjectsTable from '@/components/TableComponent.vue'
import { ref } from 'vue'

interface Project {
  id: number
  name: string
  tasksCount: number
  status: 'active' | 'archived'
  createdAt: string
}

interface Header<T> {
  key: keyof T
  title?: string
  width?: number
  minWidth?: number
  sortable?: boolean
}

const projects = ref<Project[]>([
  { id: 1, name: 'Frontend app', tasksCount: 5, status: 'active', createdAt: '2025-01-10' },
  { id: 2, name: 'Backend API', tasksCount: 8, status: 'archived', createdAt: '2025-02-02' },
  { id: 3, name: 'Mobile app', tasksCount: 2, status: 'active', createdAt: '2025-03-01' },
])

const projectHeaders: Header<Project>[] = [
  { key: 'id', title: 'ID', width: 80, minWidth: 60, sortable: true },
  { key: 'name', title: 'Name', width: 200, minWidth: 120, sortable: true },
  { key: 'tasksCount', title: 'Tasks', width: 100, minWidth: 80, sortable: true },
  { key: 'status', title: 'Status', width: 120, minWidth: 100, sortable: true },
  { key: 'createdAt', title: 'Created At', width: 150, minWidth: 120, sortable: true },
]

</script>

<style scoped lang="scss">
  .projects {
    padding: 20px;
  }
</style>
