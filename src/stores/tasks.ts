import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTasksStore = defineStore('tasks', () => {
    const allTasks= ref([
        { id: 1, name: 'Create wireframes', assignee: 'Alice', status: 'done', dueDate: '2025-01-05' },
        { id: 2, name: 'Implement login page', assignee: 'Bob', status: 'in-progress', dueDate: '2025-01-12' },
    ])

    function show() {
        console.log(allTasks.value)
    }

    return { allTasks, show }
})

export const useTasksHeadersStore = defineStore('tasksHeaders', () => {
    const tasksHeaders = ref([
        { key: 'id', title: 'ID', width: 80, minWidth: 60, sortable: true },
        { key: 'name', title: 'Task', width: 200, minWidth: 120, sortable: true },
        { key: 'assignee', title: 'Assignee', width: 150, minWidth: 100, sortable: true },
        { key: 'status', title: 'Status', width: 120, minWidth: 100, sortable: true },
        { key: 'dueDate', title: 'Due Date', width: 150, minWidth: 120, sortable: true },
    ])

    return { tasksHeaders }
})