const fs = require('fs');
let code = fs.readFileSync('src/components/GoalTasks.tsx', 'utf8');

const replacement = `  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    if (over && active.id !== over.id) {
      const oldIndex = optimisticTasks.findIndex((t) => t.id === active.id);
      const newIndex = optimisticTasks.findIndex((t) => t.id === over.id);
      
      const newTasks = arrayMove(optimisticTasks, oldIndex, newIndex);
      
      // Update position field based on array index locally
      const updatedTasks = newTasks.map((t, idx) => ({ ...t, position: idx }));
      setOptimisticTasks(updatedTasks);
      
      // Debounced batch update to Supabase
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      debounceTimerRef.current = setTimeout(async () => {
        try {
          const updates = updatedTasks.map(t => ({ id: t.id, position: t.position! }));
          await domainService.updateTaskOrderBatch(updates);
          onUpdate(false);
        } catch (err) {
          console.error(err);
          setOptimisticTasks(tasks); // revert on error
        }
      }, 500);
    }
  };`;

const startIdx = code.indexOf('  const handleDragEnd = async');
const endIdx = code.indexOf('  useEffect(() => {', startIdx);
code = code.substring(0, startIdx) + replacement + '\n' + code.substring(endIdx);

fs.writeFileSync('src/components/GoalTasks.tsx', code);
