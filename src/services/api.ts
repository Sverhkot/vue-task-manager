import axios from 'axios'

import { 
  ProjectStatus, 
  type Task,
  type Project, 
  type CreateTaskData, 
  type CreateProjectData
} from '@/types/types'

const instance = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000,
})

export const projectsApi = {
  async getAll(): Promise<Project[]> {
    const response = await instance.get<Project[]>('/projects')
    return response.data
  },

  async getById(id: string): Promise<Project> {
    const response = await instance.get<Project>(`/projects/${id}`)
    return response.data
  },

  async create(data: CreateProjectData): Promise<Project> {
    const newProject: Omit<Project, 'id'> = {
      ...data,
      status: ProjectStatus.ACTIVE,
      createdAt: new Date().toISOString()
    }
    const response = await instance.post<Project>('/projects', newProject)
    return response.data
  },

  async update(id: string, data: Partial<Project>): Promise<Project> {
    const response = await instance.patch<Project>(`/projects/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await instance.delete(`/projects/${id}`)
  }
}

export const tasksApi = {
  async getAll(): Promise<Task[]> {
    const response = await instance.get<Task[]>('/tasks')
    return response.data
  },

  async getByProjectId(projectId: string): Promise<Task[]> {
    const response = await instance.get<Task[]>(`/tasks?projectId=${projectId}`)
    return response.data
  },

  async getById(id: string): Promise<Task> {
    const response = await instance.get<Task>(`/tasks/${id}`)
    return response.data
  },

  async create(data: CreateTaskData): Promise<Task> {
    const newTask: Omit<Task, 'id'> = {
      ...data,
    }
    const response = await instance.post<Task>('/tasks', newTask)
    return response.data
  },

  async update(id: string, data: Partial<Task>): Promise<Task> {
    const response = await instance.patch<Task>(`/tasks/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await instance.delete(`/tasks/${id}`)
  }
}

export default instance