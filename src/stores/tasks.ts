/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import type 
  { 
    Task, 
    TaskStatus,
    SortOptions,
    FilterOptions,
    CreateTaskData
  } from '../types/types.ts'
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
          let aValue: any = a[sort.key as keyof Task]
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
      return newTask
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create task'
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
      return updatedTask
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update task'
      console.error('Error updating task:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteTask(id: string) {
    loading.value = true
    error.value = null
    try {
      await tasksApi.delete(id)
      tasks.value = tasks.value.filter(t => t.id !== id)
      
      saveToLocalStorage()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete task'
      console.error('Error deleting task:', err)
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
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    reorderTasks,
    updateTaskStatus,
    saveToLocalStorage,
    fetchTasksByProject,
    loadFromLocalStorage
  }
})
