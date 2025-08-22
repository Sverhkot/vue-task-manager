<template>
  <div class="projects">
    <h1>Projects</h1>
    <ProjectsTable />
  </div>
</template>

<script setup lang="ts">
	import ProjectsTable from '@/components/projects/ProjectsTable.vue'
</script>

<style scoped lang="scss">
	.projects {
		padding: 20px;
	}
</style>