import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

// Fetch all projects
export const fetchProjects = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/projects/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

// Fetch single project
export const fetchProject = async (id: number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/projects/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching project ${id}:`, error);
    throw error;
  }
};

// Create project
export const createProject = async (data: { title: string; goal: string; deadline?: string }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/projects/new/`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};

// Delete project
export const deleteProject = async (id: number) => {
  try {
    await axios.delete(`${API_BASE_URL}/projects/${id}/`);
  } catch (error) {
    console.error(`Error deleting project ${id}:`, error);
    throw error;
  }
};

// Update task status
export const updateTaskStatus = async (taskId: number, status: string) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/tasks/${taskId}/`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating task ${taskId}:`, error);
    throw error;
  }
};