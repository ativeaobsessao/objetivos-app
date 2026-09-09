import { objectiveRepository } from '../repositories/objectiveRepository';
import { Objective, ObjectiveActivity } from '../types';

export const objectiveService = {
  createObjective: (title: string, startDate: string, endDate: string): Objective => {
    const objective: Objective = {
      id: crypto.randomUUID(),
      title,
      startDate,
      endDate,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    objectiveRepository.saveObjective(objective);
    return objective;
  },

  getAllObjectives: (): Objective[] => {
    return objectiveRepository.getObjectives();
  },

  getObjective: (id: string): Objective | undefined => {
    return objectiveRepository.getObjective(id);
  },

  updateObjective: (id: string, updates: Partial<Objective>): Objective | undefined => {
    const obj = objectiveRepository.getObjective(id);
    if (!obj) return undefined;
    const updated = { ...obj, ...updates };
    objectiveRepository.saveObjective(updated);
    return updated;
  },

  deleteObjective: (id: string): void => {
    objectiveRepository.deleteObjective(id);
  },

  getActivities: (objectiveId: string): ObjectiveActivity[] => {
    return objectiveRepository.getActivitiesByObjective(objectiveId);
  },

  addActivity: (objectiveId: string, date: string, description?: string): ObjectiveActivity => {
    const activity: ObjectiveActivity = {
      id: crypto.randomUUID(),
      objectiveId,
      date,
      type: 'manual',
      description,
      createdAt: new Date().toISOString(),
    };
    objectiveRepository.saveActivity(activity);
    return activity;
  },
  
  deleteActivity: (id: string): void => {
    objectiveRepository.deleteActivity(id);
  }
};
