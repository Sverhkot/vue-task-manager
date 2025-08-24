import { API } from '@/services'
import type { InputAddProject, Project } from '@/services/projects/types'
import type { APIResponse } from '@/services/types'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useProjectsStore = defineStore('projectsStore', () => {
    const projects = ref<Project[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    function initProjects(data: Project[]) {
        projects.value = data;
    }

    function addNewProject(project: Project) {
        projects.value.push(project);
    }

    async function dispatchGetProjects(): Promise<APIResponse<null>> {
        loading.value = true
        error.value = null
        
        try {
            const response = await API.projects.getProjects();
            console.log('API Response:', response);
            
            if (response.status === 200) {
                initProjects(response.data.content);
                console.log('Projects loaded successfully:', response.data.content)
                return {
                    success: true,
                    content: null,
                };
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch projects'
            console.error('Error fetching projects:', errorMessage)
            error.value = errorMessage
            
            return {
                success: false,
                status: error.response?.status || 500,
                content: null,
            }
        } finally {
            loading.value = false
        }
        
        return {
            success: false,
            content: null,
            status: 400,
        }
    }

    async function dispatchAddProject(input: InputAddProject): Promise<APIResponse<null>> {
        loading.value = true
        error.value = null
        
        try {
            const response = await API.projects.addProject(input);
            if (response.status === 201 || response.status === 200) {
                addNewProject(response.data.content);
                return {
                    success: true,
                    content: null,
                };
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to add project'
            console.error('Error adding project:', errorMessage)
            error.value = errorMessage
            
            return {
                success: false,
                status: error.response?.status || 500,
                content: null,
            };
        } finally {
            loading.value = false
        }
        
        return {
            success: false,
            content: null,
            status: 400,
        };
    }

    return { 
        projects, 
        loading, 
        error,
        initProjects, 
        addNewProject, 
        dispatchGetProjects, 
        dispatchAddProject 
    }
})