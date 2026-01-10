import { useState, useEffect, useCallback } from 'react';
import { HiringPipeline } from '@/types/applicant';

const STORAGE_KEY = 'hiring-pipelines';

export function useHiringPipelines() {
  const [pipelines, setPipelines] = useState<HiringPipeline[]>([]);

  // Load pipelines from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setPipelines(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse hiring pipelines', e);
      }
    }
  }, []);

  // Save pipelines to localStorage whenever they change
  const savePipelines = useCallback((updatedPipelines: HiringPipeline[]) => {
    setPipelines(updatedPipelines);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPipelines));
  }, []);

  const createPipeline = useCallback((name: string, applicantIds: string[]) => {
    const newPipeline: HiringPipeline = {
      id: `pipeline-${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
      applicantIds,
    };
    savePipelines([...pipelines, newPipeline]);
    return newPipeline;
  }, [pipelines, savePipelines]);

  const updatePipeline = useCallback((pipelineId: string, updates: Partial<HiringPipeline>) => {
    const updatedPipelines = pipelines.map((p) =>
      p.id === pipelineId ? { ...p, ...updates } : p
    );
    savePipelines(updatedPipelines);
  }, [pipelines, savePipelines]);

  const deletePipeline = useCallback((pipelineId: string) => {
    savePipelines(pipelines.filter((p) => p.id !== pipelineId));
  }, [pipelines, savePipelines]);

  const getPipeline = useCallback((pipelineId: string) => {
    return pipelines.find((p) => p.id === pipelineId);
  }, [pipelines]);

  return {
    pipelines,
    createPipeline,
    updatePipeline,
    deletePipeline,
    getPipeline,
  };
}
