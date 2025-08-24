import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Project, CreateProjectInput, APIResponse } from '@/types/types'

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<Project[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const mockProjects: Project[] = [
    {
      id: 1,
      name: 'Website Redesign',
      description: 'Complete overhaul of company website',
      tasksCount: 5,
      status: 'active',
      createdAt: '2024-12-01T10:00:00Z'
    },
    {
      id: 2,
      name: 'Mobile App',
      description: 'iOS and Android mobile application',
      tasksCount: 8,
      status: 'active',
      createdAt: '2024-11-15T14:30:00Z'
    },
    {
      id: 3,
      name: 'Data Migration',
      description: 'Migrate legacy data to new system',
      tasksCount: 3,
      status: 'archived',
      createdAt: '2024-10-20T09:15:00Z'
    }
  ]

  async function dispatchGetProjects(): Promise<APIResponse<Project[]>> {
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
      

      projects.value = mockProjects
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

  async function addNewProject(input: CreateProjectInput): Promise<APIResponse<Project>> {
    loading.value = true
    error.value = null

    try {
      const newProject: Project = {
        id: Date.now(),
        name: input.name.trim(),
        description: input.description?.trim(),
        tasksCount: 0,
        status: 'active',
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
        return {
          success: true,
          content: newProject,
          status: 201,
          message: 'Added locally (API unavailable)'
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create project'
      error.value = errorMessage
      
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

  async function updateProject(id: number, updates: Partial<CreateProjectInput>): Promise<APIResponse<Project>> {
    loading.value = true
    error.value = null

    try {
      const projectIndex = projects.value.findIndex(p => p.id === id)
      if (projectIndex === -1) {
        throw new Error('Project not found')
      }

      const updatedProject = {
        ...projects.value[projectIndex],
        ...updates,
        name: updates.name?.trim() || projects.value[projectIndex].name
      }

      try {
        const response = await fetch(`http://localhost:3000/projects/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedProject)
        })

        if (response.ok) {
          const updated = await response.json()
          projects.value[projectIndex] = updated
          return {
            success: true,
            content: updated,
            status: response.status
          }
        } else {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      } catch (apiError) {
        console.warn('API unavailable, updating locally:', apiError)
        
        projects.value[projectIndex] = updatedProject
        return {
          success: true,
          content: updatedProject,
          status: 200,
          message: 'Updated locally (API unavailable)'
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update project'
      error.value = errorMessage
      
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

  async function deleteProject(id: number): Promise<APIResponse<boolean>> {
    loading.value = true
    error.value = null

    try {
      const projectIndex = projects.value.findIndex(p => p.id === id)
      if (projectIndex === -1) {
        throw new Error('Project not found')
      }

      try {
        const response = await fetch(`http://localhost:3000/projects/${id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          projects.value.splice(projectIndex, 1)
          return {
            success: true,
            content: true,
            status: response.status
          }
        } else {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      } catch (apiError) {
        console.warn('API unavailable, deleting locally:', apiError)
        
        projects.value.splice(projectIndex, 1)
        return {
          success: true,
          content: true,
          status: 200,
          message: 'Deleted locally (API unavailable)'
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete project'
      error.value = errorMessage
      
      return {
        success: false,
        content: false,
        status: 500,
        message: errorMessage
      }
    } finally {
      loading.value = false
    }
  }

  function getProjectById(id: number): Project | undefined {
    return projects.value.find(p => p.id === id)
  }

  function clearError() {
    error.value = null
  }

  return {
    projects,
    loading,
    error,
    dispatchGetProjects,
    addNewProject,
    updateProject,
    deleteProject,
    getProjectById,
    clearError
  }
})