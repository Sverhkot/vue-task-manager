<template>
  <div class="projects-table">
    <table>
      <thead>
        <tr>
          <th @click="sortBy('id')">
            ID
            <span>
              <ChevronUpIcon v-if="sortKey === 'id' && sortOrder === 'asc'" class="icon active" />
              <ChevronDownIcon v-else-if="sortKey === 'id' && sortOrder === 'desc'" class="icon active" />
              <ChevronUpIcon v-else class="icon inactive" />
            </span>
          </th>
          <th @click="sortBy('name')">
            Name
            <span>
              <ChevronUpIcon v-if="sortKey === 'name' && sortOrder === 'asc'" class="icon active" />
              <ChevronDownIcon v-else-if="sortKey === 'name' && sortOrder === 'desc'" class="icon active" />
              <ChevronUpIcon v-else class="icon inactive" />
            </span>
          </th>
          <th @click="sortBy('tasksCount')">
            Tasks
            <span>
              <ChevronUpIcon v-if="sortKey === 'tasksCount' && sortOrder === 'asc'" class="icon active" />
              <ChevronDownIcon v-else-if="sortKey === 'tasksCount' && sortOrder === 'desc'" class="icon active" />
              <ChevronUpIcon v-else class="icon inactive" />
            </span>
          </th>
          <th @click="sortBy('status')">
            Status
            <span>
              <ChevronUpIcon v-if="sortKey === 'status' && sortOrder === 'asc'" class="icon active" />
              <ChevronDownIcon v-else-if="sortKey === 'status' && sortOrder === 'desc'" class="icon active" />
              <ChevronUpIcon v-else class="icon inactive" />
            </span>
          </th>
          <th @click="sortBy('createdAt')">
            Created At
            <span>
              <ChevronUpIcon v-if="sortKey === 'createdAt' && sortOrder === 'asc'" class="icon active" />
              <ChevronDownIcon v-else-if="sortKey === 'createdAt' && sortOrder === 'desc'" class="icon active" />
              <ChevronUpIcon v-else class="icon inactive" />
            </span>
          </th>
        </tr>
        <tr>
          <th></th>
          <th>
            <input
              type="text"
              v-model="filters.name"
              placeholder="Search by name..."
            />
          </th>
          <th></th>
          <th>
            <select v-model="filters.status">
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="project in filteredProjects"
          :key="project.id"
          @click="goToProject(project.id)"
        >
          <td>{{ project.id }}</td>
          <td>{{ project.name }}</td>
          <td>{{ project.tasksCount }}</td>
          <td>{{ project.status }}</td>
          <td>{{ project.createdAt }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
  import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/vue/24/solid'
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'

  interface Project {
    id: number
    name: string
    tasksCount: number
    status: 'active' | 'archived'
    createdAt: string
  }

  const projects = ref<Project[]>([
    { id: 1, name: 'Frontend app', tasksCount: 5, status: 'active', createdAt: '2025-01-10' },
    { id: 2, name: 'Backend API', tasksCount: 8, status: 'archived', createdAt: '2025-02-02' },
    { id: 3, name: 'Mobile app', tasksCount: 2, status: 'active', createdAt: '2025-03-01' }
  ])

  const filters = ref({
    name: '',
    status: ''
  })

  const sortKey = ref<keyof Project>('id')
  const sortOrder = ref<'asc' | 'desc'>('asc')

  function sortBy(key: keyof Project) {
    if (sortKey.value === key) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey.value = key
      sortOrder.value = 'asc'
    }
  }

  const filteredProjects = computed(() => {
    let result = [...projects.value]

    if (filters.value.name) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(filters.value.name.toLowerCase())
      )
    }

    if (filters.value.status) {
      result = result.filter(p => p.status === filters.value.status)
    }

    if (sortKey.value) {
      result.sort((a, b) => {
        const valA = a[sortKey.value!]
        const valB = b[sortKey.value!]
        if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
        if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  })

  const router = useRouter()
  function goToProject(id: number) {
    router.push(`/projects/${id}`)
  }
</script>

<style scoped lang="scss">
.projects-table {
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th, td {
    padding: 8px 12px;
    border: 1px solid #ddd;
    text-align: left;
  }
  th {
    cursor: pointer;
    background: #f8f8f8;
    min-width: 80px;
    max-width: 200px;
  }
  tr:hover {
    background: #f1f1f1;
  }
  input, select {
    width: 100%;
    padding: 4px;
  }
  .icon {
    width: 16px;
    height: 16px;
    display: inline-block;
    margin-left: 4px;
    vertical-align: middle;
  }
  .icon.active {
    color: #333;
  }
  .icon.inactive {
    color: #ccc;
  }
}
</style>