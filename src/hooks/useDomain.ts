import { useState, useEffect, useCallback } from 'react';
import { domainService } from '../services/domainService';
import { Goal, Task, GoalMark } from '../types';

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await domainService.getAllGoals();
      setGoals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { goals, loading, reload: load };
}

export function useGoalView(id: string | undefined) {
  const [goal, setGoal] = useState<Goal | undefined>(undefined);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [marks, setMarks] = useState<GoalMark[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (showLoading = true) => {
    if (!id) return;
    if (showLoading) setLoading(true);
    try {
      const data = await domainService.getGoalView(id);
      if (data) {
        setGoal(data.goal);
        setTasks(data.tasks);
        setMarks(data.marks);
      } else {
        setGoal(undefined);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return { goal, tasks, marks, loading, reload: load };
}
