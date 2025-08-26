import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { toast } from 'vue3-toastify'

import type 
  { 
    Task, 
    SortOptions,
    FilterOptions,
    CreateTaskData
  } from '../types/types.ts'
import { TaskStatus } from '../types/types.ts'
import { tasksApi } from '@/services/api'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getTaskById = computed(() => {
    return (id: string) => tasks.value.find(task => task.id === id)
  })

  const getTasksByProjectId = computed(() => {
    return (projectId: string) => tasks.value.filter(task => task.projectId === projectId)
  })

  const getTasksByStatus = computed(() => {
    return (projectId: string, status: TaskStatus) => 
      tasks.value.filter(task => task.projectId === projectId && task.status === status)
  })

  const filteredAndSortedTasks = computed(() => {
    return (projectId: string, filters: FilterOptions = {}, sort: SortOptions | null = null) => {
      let result = tasks.value.filter(task => task.projectId === projectId)

      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        result = result.filter(task => 
          task.name.toLowerCase().includes(searchLower)
        )
      }

      if (filters.status) {
        result = result.filter(task => task.status === filters.status)
      }

      if (filters.assignee) {
        const assigneeLower = filters.assignee.toLowerCase()
        result = result.filter(task => 
          task.assignee.toLowerCase().includes(assigneeLower)
        )
      }

      if (sort) {
        result.sort((a, b) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let aValue: any = a[sort.key as keyof Task]
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let bValue: any = b[sort.key as keyof Task]

          if (sort.key === 'dueDate' || sort.key === 'createdAt') {
            aValue = new Date(aValue).getTime()
            bValue = new Date(bValue).getTime()
          } else if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase()
            bValue = bValue.toLowerCase()
          }

          if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1
          if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1
          return 0
        })
      }

      return result
    }
  })

  const uniqueAssignees = computed(() => {
    const assignees = [...new Set(tasks.value.map(task => task.assignee))]
    return assignees.sort()
  })

  const taskDistributionByStatus = computed(() => {
    const distribution = {
      [TaskStatus.TODO]: 0,
      [TaskStatus.IN_PROGRESS]: 0,
      [TaskStatus.DONE]: 0
    }

    tasks.value.forEach(task => {
      if (task.status && distribution.hasOwnProperty(task.status)) {
        distribution[task.status]++
      }
    })

    return distribution
  })

  async function fetchTasks() {
    loading.value = true
    error.value = null
    try {
      const data = await tasksApi.getAll()
      tasks.value = data
      saveToLocalStorage()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch tasks'
      console.error('Error fetching tasks:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchTasksByProject(projectId: string) {
    loading.value = true
    error.value = null
    try {
      const data = await tasksApi.getByProjectId(projectId)
      tasks.value = tasks.value.filter(task => task.projectId !== projectId)
      tasks.value.push(...data)
      saveToLocalStorage()
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch tasks'
      console.error('Error fetching tasks:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createTask(data: CreateTaskData) {
    loading.value = true
    error.value = null
    try {
      const newTask = await tasksApi.create(data)
      tasks.value.push(newTask)
      
      saveToLocalStorage()
      toast.success(`Task "${newTask.name}" created successfully!`)
      return newTask
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create task'
      toast.error(`Failed to create task: ${error.value}`)
      console.error('Error creating task:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateTask(id: string, data: Partial<Task>) {
    loading.value = true
    error.value = null
    try {
      const updatedTask = await tasksApi.update(id, data)
      const index = tasks.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tasks.value[index] = updatedTask
      }
      saveToLocalStorage()
      toast.success(`Task "${updatedTask.name}" updated successfully!`)
      return updatedTask
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update task'
      toast.error(`Failed to update task: ${error.value}`)
      console.error('Error updating task:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteTask(id: string) {
    loading.value = true
    error.value = null
    
    const taskToDelete = tasks.value.find(t => t.id === id)
    const taskName = taskToDelete?.name || 'Task'
    
    try {
      await tasksApi.delete(id)
      tasks.value = tasks.value.filter(t => t.id !== id)
      
      saveToLocalStorage()
      toast.success(`Task "${taskName}" deleted successfully!`)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete task'
      toast.error(`Failed to delete task: ${error.value}`)
      console.error('Error deleting task:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteTasksByProjectId(projectId: string) {
    loading.value = true
    error.value = null
    
    try {
      const projectTasks = tasks.value.filter(t => t.projectId === projectId)
      
      for (const task of projectTasks) {
        try {
          await tasksApi.delete(task.id)
        } catch (err) {
          console.warn(`Failed to delete task ${task.id} from API:`, err)
        }
      }
      
      tasks.value = tasks.value.filter(t => t.projectId !== projectId)
      
      saveToLocalStorage()
      
      if (projectTasks.length > 0) {
        toast.success(`${projectTasks.length} task(s) deleted with project!`)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete project tasks'
      console.error('Error deleting project tasks:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateTaskStatus(id: string, status: TaskStatus) {
    return updateTask(id, { status })
  }

  async function reorderTasks(projectId: string, orderedTaskIds: string[]) {
    const projectTasks = getTasksByProjectId.value(projectId)
    const reorderedTasks = orderedTaskIds.map(id => 
      projectTasks.find(task => task.id === id)
    ).filter(Boolean) as Task[]
    
    tasks.value = tasks.value.filter(task => task.projectId !== projectId)
    tasks.value.push(...reorderedTasks)
    
    saveToLocalStorage()
  }

  function saveToLocalStorage() {
    try {
      localStorage.setItem('tasks', JSON.stringify(tasks.value))
    } catch (err) {
      console.error('Error saving tasks to localStorage:', err)
    }
  }

  function loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem('tasks')
      if (stored) {
        tasks.value = JSON.parse(stored)
      }
    } catch (err) {
      console.error('Error loading tasks from localStorage:', err)
    }
  }

  loadFromLocalStorage()

  return {
    tasks,
    error,
    loading,
    getTaskById,
    uniqueAssignees,
    getTasksByStatus,
    getTasksByProjectId,
    filteredAndSortedTasks,
    taskDistributionByStatus,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    reorderTasks,
    updateTaskStatus,
    saveToLocalStorage,
    fetchTasksByProject,
    loadFromLocalStorage,
    deleteTasksByProjectId
  }
})
