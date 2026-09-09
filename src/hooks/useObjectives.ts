import { useState, useEffect, useCallback } from 'react';
import { objectiveService } from '../services/objectiveService';
import { Objective, ObjectiveActivity } from '../types';

export function useObjectives() {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await objectiveService.getAllObjectives();
      setObjectives(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { objectives, loading, reload: load };
}

export function useObjectiveDetail(id: string | undefined) {
  const [objective, setObjective] = useState<Objective | undefined>(undefined);
  const [activities, setActivities] = useState<ObjectiveActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const obj = await objectiveService.getObjective(id);
      setObjective(obj);
      if (obj) {
        const acts = await objectiveService.getActivities(id);
        setActivities(acts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return { objective, activities, loading, reload: load };
}
