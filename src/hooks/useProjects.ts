"use client";

import { Project } from '@/types/types';

import { useState, useEffect } from "react";
import { fetchProjects, deleteProject as deleteProjectApi } from "@/actions/projects";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await fetchProjects();
      setProjects(data);
    } catch (error) {
      console.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const deleteProject = async (id: number) => {
    try {
      await deleteProjectApi(id);
      await loadProjects(); // Refresh list
    } catch (error) {
      console.error("Failed to delete project");
    }
  };

  return { projects, loading, deleteProject, refresh: loadProjects };
}