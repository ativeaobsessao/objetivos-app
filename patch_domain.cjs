const fs = require('fs');
let code = fs.readFileSync('src/services/domainService.ts', 'utf8');

// Modify getAllGoals to sort by position
code = code.replace(
`    const { data, error } = await supabase.from('goals').select('*').order('created_at', { ascending: false });`,
`    const { data, error } = await supabase.from('goals').select('*').order('position', { ascending: true }).order('created_at', { ascending: false });`
);

// Modify getGoalView to sort tasks by position
code = code.replace(
`      supabase.from('tasks').select('*, goal_tasks!inner(goal_id)').eq('goal_tasks.goal_id', id).order('created_at', { ascending: true }),`,
`      supabase.from('tasks').select('*, goal_tasks!inner(goal_id)').eq('goal_tasks.goal_id', id).order('position', { ascending: true }).order('created_at', { ascending: true }),`
);

// Map position in getAllGoals
code = code.replace(
`      endDate: g.end_date,
      status: g.status,
      createdAt: g.created_at`,
`      endDate: g.end_date,
      status: g.status,
      createdAt: g.created_at,
      position: g.position`
);

// Map position in getGoalView tasks
code = code.replace(
`          completedDate: t.completed_date,
          createdAt: t.created_at,
          updatedAt: t.updated_at`,
`          completedDate: t.completed_date,
          createdAt: t.created_at,
          updatedAt: t.updated_at,
          position: t.position`
);

// Add updateGoalOrderBatch and updateTaskOrderBatch at the bottom of the object before the closing brace
code = code.replace(
`  // Utils`,
`  updateGoalOrderBatch: async (updates: { id: string, position: number }[]) => {
    const promises = updates.map(u => 
      supabase.from('goals').update({ position: u.position }).eq('id', u.id)
    );
    await Promise.all(promises);
  },
  
  updateTaskOrderBatch: async (updates: { id: string, position: number }[]) => {
    const promises = updates.map(u => 
      supabase.from('tasks').update({ position: u.position }).eq('id', u.id)
    );
    await Promise.all(promises);
  },

  // Utils`
);

fs.writeFileSync('src/services/domainService.ts', code);
