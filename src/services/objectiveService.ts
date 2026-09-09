import { objectiveRepository } from '../repositories/objectiveRepository';
import { Objective, ObjectiveActivity } from '../types';

export const objectiveService = {
  createObjective: async (title: string, startDate: string, endDate: string): Promise<Objective> => {
    const objective: Objective = {
      id: crypto.randomUUID(),
      title,
      startDate,
      endDate,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    await objectiveRepository.saveObjective(objective);
    return objective;
  },

  getAllObjectives: async (): Promise<Objective[]> => {
    return await objectiveRepository.getObjectives();
  },

  getObjective: async (id: string): Promise<Objective | undefined> => {
    return await objectiveRepository.getObjective(id);
  },

  updateObjective: async (id: string, updates: Partial<Objective>): Promise<Objective | undefined> => {
    const obj = await objectiveRepository.getObjective(id);
    if (!obj) return undefined;
    const updated = { ...obj, ...updates };
    await objectiveRepository.saveObjective(updated);
    return updated;
  },

  deleteObjective: async (id: string): Promise<void> => {
    await objectiveRepository.deleteObjective(id);
  },

  getActivities: async (objectiveId: string): Promise<ObjectiveActivity[]> => {
    return await objectiveRepository.getActivitiesByObjective(objectiveId);
  },

  addActivity: async (objectiveId: string, date: string, description?: string): Promise<ObjectiveActivity> => {
    const activity: ObjectiveActivity = {
      id: crypto.randomUUID(),
      objectiveId,
      date,
      type: 'manual',
      description,
      createdAt: new Date().toISOString(),
    };
    await objectiveRepository.saveActivity(activity);
    return activity;
  },
  
  deleteActivity: async (id: string): Promise<void> => {
    await objectiveRepository.deleteActivity(id);
  }
};
