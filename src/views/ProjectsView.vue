<template>
  <div class="projects">
    <h1>Projects</h1>
    <ProjectsTable
      v-model:modelValue="allProjects"
      :headers="projectHeaders"
      table-type="projects"
    />
  </div>
</template>

<script setup lang="ts">
import ProjectsTable from '@/components/TableComponent.vue'
import { useProjectsStore, useProjectsHeadersStore } from '../stores/projects.ts'
import { storeToRefs } from 'pinia'

const projectsStore = useProjectsStore()
const projectsHeaderStore = useProjectsHeadersStore()

const { allProjects } = storeToRefs(projectsStore)
const { projectHeaders } = storeToRefs(projectsHeaderStore)

console.log('Projects from store:', allProjects.value)
console.log('Headers from store:', projectHeaders.value)
</script>

<style scoped lang="scss">
  .projects {
    padding: 20px;
  }
</style>