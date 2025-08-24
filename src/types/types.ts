export interface Project {
  id: number
  name: string
  description?: string
  tasksCount: number
  status: 'active' | 'archived'
  createdAt: string
}

export interface Task {
  id: number
  name: string
  assignee: string
  status: 'todo' | 'in-progress' | 'done'
  dueDate: string
  projectId?: number
}

export interface Header<T> {
  key: keyof T
  title?: string
  width?: number
  minWidth?: number
  sortable?: boolean
} 

// Input types for creation (only user-provided fields)
export interface CreateProjectInput {
  name: string
  description?: string
}

export interface CreateTaskInput {
  name: string
  assignee: string
  status: 'todo' | 'in-progress' | 'done'
  dueDate: string
  projectId: number
}

export type Model = Record<string, unknown>

// API Response types
export interface APIResponse<T> {
  success: boolean
  content: T
  status?: number
  message?: string
}