const fs = require('fs');
let code = fs.readFileSync('src/services/domainService.ts', 'utf8');

const replacement = `,

  updateGoalOrderBatch: async (updates: { id: string, position: number }[]) => {
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

  // Migration`;

code = code.replace(',\n  \n  // Migration', replacement);

fs.writeFileSync('src/services/domainService.ts', code);
