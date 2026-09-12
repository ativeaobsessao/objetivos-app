const fs = require('fs');

let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Ensure import
if (!code.includes('useDebouncedBatchUpdate')) {
  code = code.replace(
    /import \{ SortableGoalItem, GoalItem \} from '\.\.\/components\/SortableGoalItem';/,
    `import { SortableGoalItem, GoalItem } from '../components/SortableGoalItem';\nimport { useDebouncedBatchUpdate } from '../hooks/useDebouncedBatchUpdate';`
  );
}

// Remove old ref
code = code.replace(/  const debounceTimerRef = React\.useRef<NodeJS\.Timeout \| null>\(null\);\n/, '');

// Insert new hook
code = code.replace(
  /  const handleDragStart = \(event: DragStartEvent\) => \{/,
  `  const debouncedBatchUpdate = useDebouncedBatchUpdate(500);\n\n  const handleDragStart = (event: DragStartEvent) => {`
);

// Replace the handleDragEnd inner block
const oldDragEndLogic = `      // Debounced batch update to Supabase
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
      }, 500);`;

const newDragEndLogic = `      // Utilizando o hook utilitário para atualização em lote
      debouncedBatchUpdate(
        async () => {
          const updates = updatedGoals.map(g => ({ id: g.id, position: g.position! }));
          await domainService.updateGoalOrderBatch(updates);
        },
        () => reload(),
        (err) => {
          console.error(err);
          setOptimisticGoals(goals); // revert on error
        }
      );`;

code = code.replace(oldDragEndLogic, newDragEndLogic);

fs.writeFileSync('src/pages/Home.tsx', code);
