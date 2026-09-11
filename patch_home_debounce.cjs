const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const replacement = `  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    if (over && active.id !== over.id) {
      const oldIndex = optimisticGoals.findIndex((g) => g.id === active.id);
      const newIndex = optimisticGoals.findIndex((g) => g.id === over.id);
      
      const newGoals = arrayMove(optimisticGoals, oldIndex, newIndex);
      
      // Update position field based on array index locally
      const updatedGoals = newGoals.map((g, idx) => ({ ...g, position: idx }));
      setOptimisticGoals(updatedGoals);
      
      // Debounced batch update to Supabase
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      debounceTimerRef.current = setTimeout(async () => {
        try {
          const updates = updatedGoals.map(g => ({ id: g.id, position: g.position! }));
          await domainService.updateGoalOrderBatch(updates);
          reload();
        } catch (err) {
          console.error(err);
          setOptimisticGoals(goals); // revert on error
        }
      }, 500);
    }
  };`;

const startIdx = code.indexOf('  const handleDragEnd = async');
const endIdx = code.indexOf('  if (loading) {', startIdx);
code = code.substring(0, startIdx) + replacement + '\n' + code.substring(endIdx);

// Also need to add React import if it's not there, but it's likely already there or we can use React.useRef.
if (!code.includes("import * as React") && !code.includes("import React")) {
    code = "import React from 'react';\n" + code;
}

fs.writeFileSync('src/pages/Home.tsx', code);
