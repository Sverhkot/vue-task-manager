export interface Project {
  id: number
  name: string
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
}

export interface Header<T> {
  key: keyof T
  title?: string
  width?: number
  minWidth?: number
  sortable?: boolean
} 

export type Model = Record<string, unknown>