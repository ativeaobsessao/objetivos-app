import { Goal, Task, GoalTaskLink, GoalMark } from '../types';

const parse = (key: string) => JSON.parse(localStorage.getItem(key) || '[]');
const save = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

export const localRepository = {
  // Goals
  getGoals: (): Goal[] => parse('pwa_goals'),
  getGoal: (id: string): Goal | undefined => parse('pwa_goals').find((g: Goal) => g.id === id),
  saveGoal: (goal: Goal) => {
    const goals = parse('pwa_goals');
    const idx = goals.findIndex((g: Goal) => g.id === goal.id);
    if (idx >= 0) goals[idx] = goal;
    else goals.push(goal);
    save('pwa_goals', goals);
  },
  deleteGoal: (id: string) => {
    save('pwa_goals', parse('pwa_goals').filter((g: Goal) => g.id !== id));
    // Cleanup links and marks
    save('pwa_goal_task_links', parse('pwa_goal_task_links').filter((l: GoalTaskLink) => l.goalId !== id));
    save('pwa_goal_marks', parse('pwa_goal_marks').filter((m: GoalMark) => m.goalId !== id));
  },

  // Tasks
  getTasks: (): Task[] => parse('pwa_tasks'),
  getTask: (id: string): Task | undefined => parse('pwa_tasks').find((t: Task) => t.id === id),
  saveTask: (task: Task) => {
    const tasks = parse('pwa_tasks');
    const idx = tasks.findIndex((t: Task) => t.id === task.id);
    if (idx >= 0) tasks[idx] = task;
    else tasks.push(task);
    save('pwa_tasks', tasks);
  },
  
  // GoalTaskLinks
  getGoalTaskLinks: (): GoalTaskLink[] => parse('pwa_goal_task_links'),
  saveGoalTaskLink: (link: GoalTaskLink) => {
    const links = parse('pwa_goal_task_links');
    links.push(link);
    save('pwa_goal_task_links', links);
  },
  deleteGoalTaskLink: (goalId: string, taskId: string) => {
    save('pwa_goal_task_links', parse('pwa_goal_task_links').filter((l: GoalTaskLink) => !(l.goalId === goalId && l.taskId === taskId)));
  },
  
  // GoalMarks
  getGoalMarks: (): GoalMark[] => parse('pwa_goal_marks'),
  getGoalMarksByGoal: (goalId: string): GoalMark[] => parse('pwa_goal_marks').filter((m: GoalMark) => m.goalId === goalId),
  saveGoalMark: (mark: GoalMark) => {
    const marks = parse('pwa_goal_marks');
    const idx = marks.findIndex((m: GoalMark) => m.goalId === mark.goalId && m.markDate === mark.markDate);
    if (idx >= 0) marks[idx] = mark;
    else marks.push(mark);
    save('pwa_goal_marks', marks);
  },
  deleteGoalMark: (goalId: string, markDate: string) => {
    save('pwa_goal_marks', parse('pwa_goal_marks').filter((m: GoalMark) => !(m.goalId === goalId && m.markDate === markDate)));
  }
};
