import http from '@/services/api'
export { getProjectTasks } from '@/services/projects/tasks'
import { type Project, type InputAddProject } from '@/services/projects/types'

async function getProjects() {
  const response = await http.get<Project[]>('projects')

  return {
    status: response.status,
    data: {
      content: response.data,
    },
  }
}

async function addProject(input: InputAddProject) {
  const response = await http.post<Project>('projects', input)

  return {
    status: response.status,
    data: {
      content: response.data,
    },
  }
}

export default {
  getProjects,
  addProject,
}
