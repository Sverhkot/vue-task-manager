// @/services/projects/index.ts
import http from "../api";
export { getProjectTasks } from './tasks'
import { type Project, type InputAddProject } from "./types";

async function getProjects() {
  // JSON Server returns data directly, so we need to wrap it in APIResponse format
  const response = await http.get<Project[]>("projects");
  
  return {
    status: response.status,
    data: {
      content: response.data
    }
  };
}

async function addProject(input: InputAddProject) {
  const response = await http.post<Project>("projects", input);
  
  return {
    status: response.status,
    data: {
      content: response.data
    }
  };
}

export default {
  getProjects,
  addProject,
};