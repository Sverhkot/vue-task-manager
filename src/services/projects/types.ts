export type Project = {
  id: number
  name: string
  tasksCount: number
  status: 'active' | 'archived'
  createdAt: string
}

export type InputAddProject = {
  name: string
  tasksCount?: number
  status: 'active' | 'archived'
  createdAt?: string
  description?: string
}