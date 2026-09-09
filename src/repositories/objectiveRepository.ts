import { supabase } from '../lib/supabase';
import { Objective, ObjectiveActivity } from '../types';

export const objectiveRepository = {
  getObjectives: async (): Promise<Objective[]> => {
    const { data, error } = await supabase
      .from('objectives')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching objectives:', error);
      return [];
    }
    return data.map(mapObjectiveFromDB);
  },

  getObjective: async (id: string): Promise<Objective | undefined> => {
    const { data, error } = await supabase
      .from('objectives')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error || !data) return undefined;
    return mapObjectiveFromDB(data);
  },

  saveObjective: async (objective: Objective): Promise<void> => {
    const { error } = await supabase
      .from('objectives')
      .upsert(mapObjectiveToDB(objective));
      
    if (error) {
      console.error('Error saving objective:', error);
      throw error;
    }
  },

  deleteObjective: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('objectives')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting objective:', error);
      throw error;
    }
  },

  getActivitiesByObjective: async (objectiveId: string): Promise<ObjectiveActivity[]> => {
    const { data, error } = await supabase
      .from('objective_activities')
      .select('*')
      .eq('objective_id', objectiveId)
      .order('date', { ascending: true });
      
    if (error) {
      console.error('Error fetching activities:', error);
      return [];
    }
    return data.map(mapActivityFromDB);
  },

  saveActivity: async (activity: ObjectiveActivity): Promise<void> => {
    const { error } = await supabase
      .from('objective_activities')
      .upsert(mapActivityToDB(activity));
      
    if (error) {
      console.error('Error saving activity:', error);
      throw error;
    }
  },

  deleteActivity: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('objective_activities')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting activity:', error);
      throw error;
    }
  },
};

// Mappers to convert between CamelCase (Frontend) and SnakeCase (Supabase DB)
function mapObjectiveFromDB(row: any): Objective {
  return {
    id: row.id,
    title: row.title,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapObjectiveToDB(obj: Objective): any {
  return {
    id: obj.id,
    title: obj.title,
    start_date: obj.startDate,
    end_date: obj.endDate,
    status: obj.status,
    created_at: obj.createdAt,
  };
}

function mapActivityFromDB(row: any): ObjectiveActivity {
  return {
    id: row.id,
    objectiveId: row.objective_id,
    date: row.date,
    type: row.type,
    description: row.description,
    createdAt: row.created_at,
  };
}

function mapActivityToDB(act: ObjectiveActivity): any {
  return {
    id: act.id,
    objective_id: act.objectiveId,
    date: act.date,
    type: act.type,
    description: act.description,
    created_at: act.createdAt,
  };
}
