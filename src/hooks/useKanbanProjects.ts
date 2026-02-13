import { useState, useEffect, useCallback } from 'react';
import { KanbanProject } from '@/types/applicant';
import { projectsApi } from '@/services/api';
import { toast } from 'sonner';

export function useKanbanProjects() {
  const [projects, setProjects] = useState<KanbanProject[]>([]);
  const [loading, setLoading] = useState(true);

  // Load projects from Firebase on mount
  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await projectsApi.getAll();
        if (response.success) {
          setProjects(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
        toast.error('Failed to load Kanban projects');
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  const createProject = useCallback(async (name: string, applicantIds: string[]) => {
    try {
      const response = await projectsApi.create(name, applicantIds);
      if (response.success) {
        const newProject: KanbanProject = {
          id: response.data.id,
          name: response.data.name,
          createdAt: response.data.createdAt,
          applicantIds: response.data.applicantIds,
        };
        setProjects(prev => [...prev, newProject]);
        return newProject;
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error('Failed to create Kanban project');
      throw error;
    }
  }, []);

  const updateProject = useCallback(async (projectId: string, updates: Partial<KanbanProject>) => {
    try {
      const response = await projectsApi.update(projectId, updates);
      if (response.success) {
        setProjects(prev =>
          prev.map(p => (p.id === projectId ? { ...p, ...updates } : p))
        );
      }
    } catch (error) {
      console.error('Failed to update project:', error);
      toast.error('Failed to update project');
      throw error;
    }
  }, []);

  const deleteProject = useCallback(async (projectId: string) => {
    try {
      const response = await projectsApi.delete(projectId);
      if (response.success) {
        setProjects(prev => prev.filter(p => p.id !== projectId));
        toast.success('Project deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error('Failed to delete project');
      throw error;
    }
  }, []);

  const getProject = useCallback((projectId: string) => {
    return projects.find((p) => p.id === projectId);
  }, [projects]);

  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    getProject,
  };
}
