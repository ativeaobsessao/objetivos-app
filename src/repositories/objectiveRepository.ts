import { Objective, ObjectiveActivity } from '../types';

const OBJECTIVES_KEY = 'pwa_objectives';
const ACTIVITIES_KEY = 'pwa_objective_activities';

export const objectiveRepository = {
  getObjectives: (): Objective[] => {
    const data = localStorage.getItem(OBJECTIVES_KEY);
    return data ? JSON.parse(data) : [];
  },

  getObjective: (id: string): Objective | undefined => {
    return objectiveRepository.getObjectives().find((o) => o.id === id);
  },

  saveObjective: (objective: Objective): void => {
    const objectives = objectiveRepository.getObjectives();
    const existingIndex = objectives.findIndex((o) => o.id === objective.id);
    if (existingIndex >= 0) {
      objectives[existingIndex] = objective;
    } else {
      objectives.push(objective);
    }
    localStorage.setItem(OBJECTIVES_KEY, JSON.stringify(objectives));
  },

  deleteObjective: (id: string): void => {
    const objectives = objectiveRepository.getObjectives().filter((o) => o.id !== id);
    localStorage.setItem(OBJECTIVES_KEY, JSON.stringify(objectives));
    
    // Also delete activities
    const activities = objectiveRepository.getActivities();
    const filteredActivities = activities.filter((a) => a.objectiveId !== id);
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(filteredActivities));
  },

  getActivities: (): ObjectiveActivity[] => {
    const data = localStorage.getItem(ACTIVITIES_KEY);
    return data ? JSON.parse(data) : [];
  },

  getActivitiesByObjective: (objectiveId: string): ObjectiveActivity[] => {
    return objectiveRepository.getActivities().filter((a) => a.objectiveId === objectiveId);
  },

  saveActivity: (activity: ObjectiveActivity): void => {
    const activities = objectiveRepository.getActivities();
    const existingIndex = activities.findIndex((a) => a.id === activity.id);
    if (existingIndex >= 0) {
      activities[existingIndex] = activity;
    } else {
      activities.push(activity);
    }
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
  },

  deleteActivity: (id: string): void => {
    const activities = objectiveRepository.getActivities().filter((a) => a.id !== id);
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
  },
};
