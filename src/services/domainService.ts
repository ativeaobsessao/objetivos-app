import { localRepository } from '../repositories/localRepository';
import { Goal, Task, GoalMark } from '../types';

export const domainService = {
  // Goal
  createGoal: async (title: string, startDate: string, endDate: string): Promise<Goal> => {
    const goal: Goal = {
      id: crypto.randomUUID(),
      title, 
      startDate, 
      endDate,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    localRepository.saveGoal(goal);
    return goal;
  },
  
  updateGoal: async (id: string, updates: Partial<Goal>): Promise<Goal> => {
    const goal = localRepository.getGoal(id);
    if (!goal) throw new Error('Goal not found');
    const updated = { ...goal, ...updates };
    localRepository.saveGoal(updated);
    return updated;
  },

  getAllGoals: async (): Promise<Goal[]> => {
    // Return all goals
    return localRepository.getGoals().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  
  getGoalView: async (goalId: string) => {
    const goal = localRepository.getGoal(goalId);
    if (!goal) return null;
    
    const links = localRepository.getGoalTaskLinks().filter(l => l.goalId === goalId);
    const allTasks = localRepository.getTasks();
    const tasks = links.map(l => allTasks.find(t => t.id === l.taskId)).filter(Boolean) as Task[];
    // sort tasks by creation date
    tasks.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    
    const marks = localRepository.getGoalMarksByGoal(goalId);
    
    return { goal, tasks, marks };
  },

  deleteGoal: async (id: string): Promise<void> => {
    localRepository.deleteGoal(id);
  },

  // Tasks
  addTaskToGoal: async (goalId: string, title: string): Promise<Task> => {
    const task: Task = {
      id: crypto.randomUUID(),
      title, 
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    localRepository.saveTask(task);
    localRepository.saveGoalTaskLink({
      id: crypto.randomUUID(),
      goalId, 
      taskId: task.id,
      createdAt: new Date().toISOString()
    });
    return task;
  },
  
  toggleTask: async (taskId: string, completed: boolean) => {
    const task = localRepository.getTask(taskId);
    if (task) {
      task.completed = completed;
      task.updatedAt = new Date().toISOString();
      localRepository.saveTask(task);
    }
  },

  deleteTaskFromGoal: async (goalId: string, taskId: string) => {
    localRepository.deleteGoalTaskLink(goalId, taskId);
    // Future integration note: we don't delete the actual Task entity to keep it in DUDE.
  },

  // Marks
  toggleGoalMark: async (goalId: string, markDate: string, note?: string) => {
    const existing = localRepository.getGoalMarks().find(m => m.goalId === goalId && m.markDate === markDate);
    if (existing) {
      localRepository.deleteGoalMark(goalId, markDate);
    } else {
      localRepository.saveGoalMark({
        id: crypto.randomUUID(),
        goalId, 
        markDate, 
        note,
        createdAt: new Date().toISOString()
      });
    }
  }
};
