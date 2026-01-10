import { useState, useEffect, useCallback } from 'react';
import { KanbanProject, Applicant } from '@/types/applicant';

const STORAGE_KEY = 'kanban-projects';

export function useKanbanProjects() {
  const [projects, setProjects] = useState<KanbanProject[]>([]);

  // Load projects from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setProjects(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse kanban projects', e);
      }
    }
  }, []);

  // Save projects to localStorage whenever they change
  const saveProjects = useCallback((updatedProjects: KanbanProject[]) => {
    setProjects(updatedProjects);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));
  }, []);

  const createProject = useCallback((name: string, applicantIds: string[]) => {
    const newProject: KanbanProject = {
      id: `project-${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
      applicantIds,
    };
    saveProjects([...projects, newProject]);
    return newProject;
  }, [projects, saveProjects]);

  const updateProject = useCallback((projectId: string, updates: Partial<KanbanProject>) => {
    const updatedProjects = projects.map((p) =>
      p.id === projectId ? { ...p, ...updates } : p
    );
    saveProjects(updatedProjects);
  }, [projects, saveProjects]);

  const deleteProject = useCallback((projectId: string) => {
    saveProjects(projects.filter((p) => p.id !== projectId));
  }, [projects, saveProjects]);

  const getProject = useCallback((projectId: string) => {
    return projects.find((p) => p.id === projectId);
  }, [projects]);

  return {
    projects,
    createProject,
    updateProject,
    deleteProject,
    getProject,
  };
}
