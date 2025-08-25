export interface Project {
  id: string
  name: string
  status: ProjectStatus
  createdAt: string
  description?: string
}
export enum ProjectStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed'
}
export interface Task {
  id: string
  name: string
  status: TaskStatus
  dueDate: string
  assignee: string
  projectId: string
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done'
}

export interface Header<T> {
  key: keyof T
  title?: string
  width?: number
  minWidth?: number
  sortable?: boolean
} 

export interface CreateProjectInput {
  name: string
  description?: string
}

export interface CreateTaskInput {
  name: string
  status: TaskStatus
  dueDate: string
  assignee: string
  projectId: string
}

export type Model = Record<string, unknown>

export type ProjectWithCount = Project & { tasksCount: number }

export interface FilterOptions {
  search?: string
  status?: string
  assignee?: string
}

export interface SortOptions {
  key: string
  direction: 'asc' | 'desc'
}

export interface CreateProjectData {
  name: string
  description: string
}

export interface CreateTaskData {
  name: string
  status: TaskStatus
  dueDate: string
  assignee: string
  projectId: string
}

export interface APIResponse<T> {
  success: boolean
  content: T | null
  status?: number
  message?: string
}