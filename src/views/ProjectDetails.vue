<template>
  <div class="project-details">
    <h1>Project Details</h1>
    <ProjectsTable
      v-model:modelValue="allTasks"
      :headers="tasksHeaders"
      table-type="tasks"
    />
  </div>
</template>

<script setup lang="ts">
  import ProjectsTable from '@/components/TableComponent.vue'
  import { useTasksStore, useTasksHeadersStore } from '../stores/tasks.ts'
  import { storeToRefs } from 'pinia'

  const tasksStore = useTasksStore()
  const tasksHeaderStore = useTasksHeadersStore()

  const { allTasks } = storeToRefs(tasksStore)
  const { tasksHeaders } = storeToRefs(tasksHeaderStore)

  console.log('Projects from store:', allTasks.value)
  console.log('Headers from store:', tasksHeaders.value)
</script>

<style scoped>
  .project-details {
    padding: 20px;
  }
</style>
