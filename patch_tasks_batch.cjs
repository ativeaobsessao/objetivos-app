const fs = require('fs');

let code = fs.readFileSync('src/components/GoalTasks.tsx', 'utf8');

// Ensure import
if (!code.includes('useDebouncedBatchUpdate')) {
  code = code.replace(
    /import \{ SortableTaskItem, TaskItem \} from '\.\/SortableTaskItem';/,
    `import { SortableTaskItem, TaskItem } from './SortableTaskItem';\nimport { useDebouncedBatchUpdate } from '../hooks/useDebouncedBatchUpdate';`
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
          const updates = updatedTasks.map(t => ({ id: t.id, position: t.position! }));
          await domainService.updateTaskOrderBatch(updates);
          onUpdate(false);
        } catch (err) {
          console.error(err);
          setOptimisticTasks(tasks); // revert on error
        }
      }, 500);`;

const newDragEndLogic = `      // Utilizando o hook utilitário para atualização em lote
      debouncedBatchUpdate(
        async () => {
          const updates = updatedTasks.map(t => ({ id: t.id, position: t.position! }));
          await domainService.updateTaskOrderBatch(updates);
        },
        () => onUpdate(false),
        (err) => {
          console.error(err);
          setOptimisticTasks(tasks); // revert on error
        }
      );`;

code = code.replace(oldDragEndLogic, newDragEndLogic);

fs.writeFileSync('src/components/GoalTasks.tsx', code);
