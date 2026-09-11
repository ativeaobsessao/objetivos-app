import { supabase } from '../lib/supabase';
import { Goal, Task, GoalMark } from '../types';

export const domainService = {
  // Goal
  createGoal: async (title: string, startDate: string, endDate: string): Promise<Goal> => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error("Usuário não autenticado");

    const goal = {
      title, 
      start_date: startDate, 
      end_date: endDate,
      status: 'active',
      user_id: user.user.id
    };
    
    const { data, error } = await supabase.from('goals').insert(goal).select().single();
    if (error) throw error;
    
    return {
      id: data.id,
      title: data.title,
      startDate: data.start_date,
      endDate: data.end_date,
      status: data.status,
      createdAt: data.created_at
    };
  },
  
  updateGoal: async (id: string, updates: Partial<Goal>): Promise<Goal> => {
    const dbUpdates: any = {};
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.startDate) dbUpdates.start_date = updates.startDate;
    if (updates.endDate) dbUpdates.end_date = updates.endDate;
    if (updates.status) dbUpdates.status = updates.status;

    const { data, error } = await supabase.from('goals').update(dbUpdates).eq('id', id).select().single();
    if (error) throw error;
    
    return {
      id: data.id,
      title: data.title,
      startDate: data.start_date,
      endDate: data.end_date,
      status: data.status,
      createdAt: data.created_at
    };
  },

  updateTask: async (taskId: string, title: string) => {
    const { error } = await supabase.from('tasks').update({ title, updated_at: new Date().toISOString() }).eq('id', taskId);
    if (error) throw error;
  },

  updateTaskOrder: async (taskId: string, newCreatedAt: string) => {
    const { error } = await supabase.from('tasks').update({ created_at: newCreatedAt }).eq('id', taskId);
    if (error) throw error;
  },
  
  updateGoalOrder: async (goalId: string, newCreatedAt: string) => {
    const { error } = await supabase.from('goals').update({ created_at: newCreatedAt }).eq('id', goalId);
    if (error) throw error;
  },

  getAllGoals: async (): Promise<(Goal & { taskCount: number, markCount: number })[]> => {
    const { data, error } = await supabase.from('goals').select('*, goal_task_links(count), marks:goal_marks(count)').order('created_at', { ascending: false });
    if (error) throw error;
    
    return data.map(g => ({
      id: g.id,
      title: g.title,
      startDate: g.start_date,
      endDate: g.end_date,
      status: g.status,
      createdAt: g.created_at,
      position: g.position,
      taskCount: g.goal_task_links?.[0]?.count || 0,
      markCount: g.marks?.[0]?.count || 0
    }));
  },
  
  getGoalView: async (goalId: string) => {
    const { data: goalData, error: goalError } = await supabase.from('goals').select('*').eq('id', goalId).single();
    if (goalError || !goalData) return null;
    
    const goal: Goal = {
      id: goalData.id,
      title: goalData.title,
      startDate: goalData.start_date,
      endDate: goalData.end_date,
      status: goalData.status,
      createdAt: goalData.created_at
    };
    
    const { data: links, error: linksError } = await supabase
      .from('goal_task_links')
      .select('task_id')
      .eq('goal_id', goalId);
      
    let tasks: Task[] = [];
    if (!linksError && links && links.length > 0) {
      const taskIds = links.map(l => l.task_id);
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .in('id', taskIds)
        .order('created_at', { ascending: true });
        
      if (!tasksError && tasksData) {
        tasks = tasksData.map(t => ({
          id: t.id,
          title: t.title,
          completed: t.completed,
          completedDate: t.completed ? (t.updated_at ? t.updated_at.split('T')[0] : undefined) : undefined,
          createdAt: t.created_at,
          updatedAt: t.updated_at
        }));
      }
    }
    
    const { data: marksData, error: marksError } = await supabase
      .from('goal_marks')
      .select('*')
      .eq('goal_id', goalId);
      
    const marks: GoalMark[] = !marksError && marksData ? marksData.map(m => ({
      id: m.id,
      goalId: m.goal_id,
      markDate: m.mark_date,
      note: m.note,
      createdAt: m.created_at
    })) : [];
    
    return { goal, tasks, marks };
  },

  deleteGoal: async (id: string): Promise<void> => {
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (error) throw error;
  },

  // Tasks
  addTaskToGoal: async (goalId: string, title: string): Promise<Task> => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error("Usuário não autenticado");

    // Insert task
    const { data: taskData, error: taskError } = await supabase
      .from('tasks')
      .insert({ title, user_id: user.user.id })
      .select().single();
    if (taskError) throw taskError;

    // Link task to goal
    const { error: linkError } = await supabase
      .from('goal_task_links')
      .insert({ goal_id: goalId, task_id: taskData.id, user_id: user.user.id });
    if (linkError) throw linkError;

    return {
      id: taskData.id,
      title: taskData.title,
      completed: taskData.completed,
      createdAt: taskData.created_at,
      updatedAt: taskData.updated_at
    };
  },
  
  toggleTask: async (taskId: string, completed: boolean, date?: string) => {
    const { error } = await supabase.from('tasks').update({ 
      completed, 
      updated_at: new Date().toISOString() 
    }).eq('id', taskId);
    if (error) throw error;
  },

  deleteTaskFromGoal: async (goalId: string, taskId: string) => {
    const { error: linkError } = await supabase.from('goal_task_links').delete().match({ goal_id: goalId, task_id: taskId });
    if (linkError) throw linkError;
    
    const { error: taskError } = await supabase.from('tasks').delete().eq('id', taskId);
    if (taskError) throw taskError;
  },

  // Marks
  updateGoalMarkNote: async (markId: string, note?: string) => {
    const { error } = await supabase.from('goal_marks').update({ note: note || null }).eq('id', markId);
    if (error) throw error;
  },
  
  toggleGoalMark: async (goalId: string, markDate: string, note?: string) => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error("Usuário não autenticado");

    const { data: existing, error: findError } = await supabase
      .from('goal_marks')
      .select('id')
      .match({ goal_id: goalId, mark_date: markDate })
      .maybeSingle();

    if (existing) {
      const { error } = await supabase.from('goal_marks').delete().eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('goal_marks')
        .insert({ goal_id: goalId, mark_date: markDate, note, user_id: user.user.id });
      if (error) throw error;
    }
  },
  
  // Migration
  migrateLocalData: async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    const userId = user.user.id;

    // Check if migration was already done
    const migrated = localStorage.getItem('pwa_migrated_to_supabase');
    if (migrated === 'true') return;

    try {
      const parse = (key: string) => JSON.parse(localStorage.getItem(key) || '[]');
      const localGoals = parse('pwa_goals');
      const localTasks = parse('pwa_tasks');
      const localLinks = parse('pwa_goal_task_links');
      const localMarks = parse('pwa_goal_marks');

      if (localGoals.length === 0) {
        localStorage.setItem('pwa_migrated_to_supabase', 'true');
        return;
      }

      // We need to insert and remap IDs because Supabase generates new UUIDs if we don't supply them,
      // but we can supply our local crypto.randomUUIDs directly since UUIDv4 is accepted.
      
      for (const g of localGoals) {
        const { error } = await supabase.from('goals').insert({
          id: g.id,
          title: g.title,
          start_date: g.startDate,
          end_date: g.endDate,
          status: g.status,
          user_id: userId,
          created_at: g.createdAt
        });
        // Ignore duplicate key errors if already exists
      }

      for (const t of localTasks) {
        await supabase.from('tasks').insert({
          id: t.id,
          title: t.title,
          completed: t.completed,
          user_id: userId,
          created_at: t.createdAt,
          updated_at: t.updatedAt
        });
      }

      for (const l of localLinks) {
        await supabase.from('goal_task_links').insert({
          id: l.id,
          goal_id: l.goalId,
          task_id: l.taskId,
          user_id: userId,
          created_at: l.createdAt
        });
      }

      for (const m of localMarks) {
        await supabase.from('goal_marks').insert({
          id: m.id,
          goal_id: m.goalId,
          mark_date: m.markDate,
          note: m.note,
          user_id: userId,
          created_at: m.createdAt
        });
      }

      localStorage.setItem('pwa_migrated_to_supabase', 'true');
    } catch (err) {
      console.error("Erro ao migrar dados locais:", err);
    }
  }
};
