import { useState, useEffect, useCallback } from 'react';
import { objectiveService } from '../services/objectiveService';
import { Objective, ObjectiveActivity } from '../types';

export function useObjectives() {
  const [objectives, setObjectives] = useState<Objective[]>([]);

  const load = useCallback(() => {
    setObjectives(objectiveService.getAllObjectives());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { objectives, reload: load };
}

export function useObjectiveDetail(id: string | undefined) {
  const [objective, setObjective] = useState<Objective | undefined>(undefined);
  const [activities, setActivities] = useState<ObjectiveActivity[]>([]);

  const load = useCallback(() => {
    if (!id) return;
    setObjective(objectiveService.getObjective(id));
    setActivities(objectiveService.getActivities(id));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return { objective, activities, reload: load };
}
