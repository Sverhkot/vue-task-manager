import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useProjectsStore = defineStore('projects', () => {
    const allProjects = ref([
        { id: 1, name: 'Frontend app', tasksCount: 5, status: 'active', createdAt: '2025-01-10' },
        { id: 2, name: 'Backend API', tasksCount: 8, status: 'archived', createdAt: '2025-02-02' },
        { id: 3, name: 'Mobile app', tasksCount: 2, status: 'active', createdAt: '2025-03-01' },
    ])

    function show() {
        console.log(allProjects.value)
    }

    return { allProjects, show }
})

export const useProjectsHeadersStore = defineStore('projectHeaders', () => {
    const projectHeaders = ref([
        { key: 'id', title: 'ID', width: 80, minWidth: 60, sortable: true },
        { key: 'name', title: 'Name', width: 200, minWidth: 120, sortable: true },
        { key: 'tasksCount', title: 'Tasks', width: 100, minWidth: 80, sortable: true },
        { key: 'status', title: 'Status', width: 120, minWidth: 100, sortable: true },
        { key: 'createdAt', title: 'Created At', width: 150, minWidth: 120, sortable: true },
    ])

    return { projectHeaders }
})