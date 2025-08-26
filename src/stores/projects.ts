import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { toast } from 'vue3-toastify'

import { 
  type Task,
  type Project,
  type SortOptions,
  type APIResponse,
  type FilterOptions,
  type CreateProjectData,
  type CreateProjectInput,
  type ProjectWithCount,
  ProjectStatus
} from '@/types/types'
import { projectsApi } from '@/services/api'
import { useTasksStore } from '@/stores/tasks'

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<Project[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const tasksStore = useTasksStore()

  const projectsWithCounts = computed<ProjectWithCount[]>(() =>
  projects.value.map(project => ({
    ...project,
    tasksCount: tasksStore.tasks.filter((t: Task) => t.projectId === project.id).length
  }))
)

  const getProjectById = (id: string) => {
    return projects.value.find(project => project.id === id)
  }

  async function addNewProject(input: CreateProjectInput): Promise<APIResponse<Project>> {
    loading.value = true
    error.value = null

    try {
      const newProject: Project = {
        id: Date.now().toString(),
        name: input.name.trim(),
        description: input.description?.trim(),
        status: ProjectStatus.ACTIVE,
        createdAt: new Date().toISOString()
      }

      try {
        const response = await fetch('http://localhost:3000/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newProject)
        })

        if (response.ok) {
          const createdProject = await response.json()
          projects.value.push(createdProject)
          toast.success(`Project "${createdProject.name}" created successfully!`)
          return {
            success: true,
            content: createdProject,
            status: response.status
          }
        } else {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      } catch (apiError) {
        console.warn('API unavailable, adding to local store:', apiError)

        projects.value.push(newProject)
        toast.success(`Project "${newProject.name}" created locally!`)
        return {
            success: false,
            status: 400,
            content: null,
          message: 'Added locally (API unavailable)'
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create project'
      error.value = errorMessage
      toast.error(`Failed to create project: ${errorMessage}`)
      
      return {
        success: false,
        content: {} as Project,
        status: 500,
        message: errorMessage
      }
    } finally {
      loading.value = false
    }
  }

  async function fetchAllProjects(): Promise<APIResponse<Project[]>> {
    loading.value = true
    error.value = null

    try {
      const response = await fetch('http://localhost:3000/projects')
      
      if (response.ok) {
        const data = await response.json()
        projects.value = Array.isArray(data) ? data : []
        return {
          success: true,
          content: projects.value,
          status: response.status
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (err) {
      console.warn('Failed to fetch from API, using mock data:', err)
      
      error.value = null
      
      return {
        success: true,
        content: projects.value,
        status: 200,
        message: 'Using mock data (API unavailable)'
      }
    } finally {
      loading.value = false
    }
  }

  const filteredAndSortedProjects = computed(() => {
    return (filters: FilterOptions = {}, sort: SortOptions | null = null) => {
      let result = [...projects.value]

      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        result = result.filter(project => 
          project.name.toLowerCase().includes(searchLower) ||
          project.description?.toLowerCase().includes(searchLower)
        )
      }

      if (filters.status) {
        result = result.filter(project => project.status === filters.status)
      }

      if (sort) {
        result.sort((a, b) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let aValue: any = a[sort.key as keyof Project]
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let bValue: any = b[sort.key as keyof Project]

          if (sort.key === 'createdAt' || sort.key === 'dueDate') {
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

  async function fetchProjects() {
    loading.value = true
    error.value = null
    try {
      const data = await projectsApi.getAll()
      projects.value = data
      
      saveToLocalStorage()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch projects'
      console.error('Error fetching projects:', err)
    } finally {
      loading.value = false
    }
  }

  async function createProject(data: CreateProjectData) {
    loading.value = true
    error.value = null
    try {
      const newProject = await projectsApi.create(data)
      projects.value.push(newProject)
      saveToLocalStorage()
      toast.success(`Project "${newProject.name}" created successfully!`)
      return newProject
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create project'
      toast.error(`Failed to create project: ${error.value}`)
      console.error('Error creating project:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateProject(id: string, data: Partial<Project>) {
    loading.value = true
    error.value = null
    try {
      const updatedProject = await projectsApi.update(id, data)
      const index = projects.value.findIndex(p => p.id === id)
      if (index !== -1) {
        projects.value[index] = updatedProject
      }
      saveToLocalStorage()
      toast.success(`Project "${updatedProject.name}" updated successfully!`)
      return updatedProject
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update project'
      toast.error(`Failed to update project: ${error.value}`)
      console.error('Error updating project:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteProject(id: string) {
    loading.value = true
    error.value = null
    
    const projectToDelete = projects.value.find(p => p.id === id)
    const projectName = projectToDelete?.name || 'Project'
    
    try {
      await tasksStore.deleteTasksByProjectId(id)
      
      await projectsApi.delete(id)
      projects.value = projects.value.filter(p => p.id !== id)
      saveToLocalStorage()
      toast.success(`Project "${projectName}" and all its tasks deleted successfully!`)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete project'
      toast.error(`Failed to delete project: ${error.value}`)
      console.error('Error deleting project:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  function saveToLocalStorage() {
    try {
      localStorage.setItem('projects', JSON.stringify(projects.value))
    } catch (err) {
      console.error('Error saving projects to localStorage:', err)
    }
  }

  function loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem('projects')
      if (stored) {
        projects.value = JSON.parse(stored)
      }
    } catch (err) {
      console.error('Error loading projects from localStorage:', err)
    }
  }

  loadFromLocalStorage()

  return {
    error,
    loading,
    projects,
    projectsWithCounts,
    filteredAndSortedProjects,
    addNewProject,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    getProjectById,
    saveToLocalStorage,
    fetchAllProjects,
    loadFromLocalStorage
  }
})
