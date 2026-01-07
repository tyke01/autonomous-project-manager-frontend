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

export const getTaskGuidance = async (taskTitle: string, taskDescription: string, projectGoal: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/tasks/ai-guidance/`, {
      task_title: taskTitle,
      task_description: taskDescription,
      project_goal: projectGoal,
    });
    return response.data;
  } catch (error) {
    console.error("Error getting task guidance:", error);
    throw error;
  }
};

// Get conversation history
export const getTaskConversation = async (taskId: number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tasks/${taskId}/conversation/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching conversation:", error);
    throw error;
  }
};

// Send a message
export const sendTaskMessage = async (taskId: number, message: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/tasks/${taskId}/conversation/`, {
      message,
    });
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// Clear conversation
export const clearTaskConversation = async (taskId: number) => {
  try {
    await axios.delete(`${API_BASE_URL}/tasks/${taskId}/conversation/clear/`);
  } catch (error) {
    console.error("Error clearing conversation:", error);
    throw error;
  }
};