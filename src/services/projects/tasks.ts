import http from '@/services/api'

export interface ProjectTask {
  id: string
  projectId: string
  name: string
  assignee: string
  status: 'To Do' | 'In Progress' | 'Done'
  dueDate: string
}

export async function getProjectTasks(projectId: string) {
  const response = await http.get<ProjectTask[]>(`projectTasks?projectId=${projectId}`)

  return {
    status: response.status,
    data: {
      content: response.data,
    },
  }
}

export async function getAllTasks() {
  const response = await http.get<ProjectTask[]>('projectTasks')

  return {
    status: response.status,
    data: {
      content: response.data,
    },
  }
}
