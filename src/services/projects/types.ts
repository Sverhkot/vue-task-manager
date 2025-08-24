// @/services/projects/types.ts
export type Project = {
  id: number
  name: string
  tasksCount: number
  status: 'active' | 'archived'
  createdAt: string
}

// For adding new projects, ID should be optional since JSON Server generates it
export type InputAddProject = {
  name: string
  tasksCount?: number
  status: 'active' | 'archived'
  createdAt?: string
  description?: string
}