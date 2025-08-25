import http from "../api"

export interface ProjectTask {
  id: number
  projectId: number
  name: string
  assignee: string
  status: 'To Do' | 'In Progress' | 'Done'
  dueDate: string
}

export async function getProjectTasks(projectId: number) {
  const response = await http.get<ProjectTask[]>(`projectTasks?projectId=${projectId}`)
  
  return {
    status: response.status,
    data: {
      content: response.data
    }
  }
}

export async function getAllTasks() {
  const response = await http.get<ProjectTask[]>("projectTasks")
  
  return {
    status: response.status,
    data: {
      content: response.data
    }
  }
}