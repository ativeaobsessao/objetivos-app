const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const targetStr = `function SortableGoalItem({ goal, index, total }: { goal: any, index: number, total: number } & { key?: React.Key }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: goal.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const progress = goal.taskCount > 0 ? Math.round((goal.markCount / goal.taskCount) * 100) : 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={\`group bg-white dark:bg-gray-900 dark:border-gray-800 p-2 sm:p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center transition-all \${isDragging ? 'shadow-2xl ring-2 ring-gray-900/10 dark:ring-white/10 scale-[1.03] z-50' : ''}\`}
      aria-label={\`Objetivo \${goal.title}\`}
    >
      <div
        className="drag-handle text-gray-400 cursor-grab active:cursor-grabbing p-3 sm:p-2 rounded-lg flex items-center justify-center touch-none"
        {...listeners}
        {...attributes}
      >
        <GripVertical className="w-6 h-6" />
      </div>
      
      <Link
        to={\`/objective/\${goal.id}\`}
        draggable={false}
        className="flex-1 flex justify-between items-center ml-2 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-[0.98] transition-all select-none"
      >
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 dark:text-gray-100 text-lg line-clamp-1">{goal.title}</span>
          <div className="flex items-center gap-2 mt-1">
            <span className={\`text-xs font-bold px-2 py-0.5 rounded-full \${goal.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : goal.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}\`}>
              {goal.status === 'in_progress' ? 'Em andamento' : goal.status === 'completed' ? 'Concluído' : 'Não iniciado'}
            </span>
            <span className="text-xs text-gray-500 font-medium">{progress}% concluído</span>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center text-gray-400">
            <CalendarIcon className="w-4 h-4 mr-1" />
            <span className="text-xs font-bold">{goal.taskCount > 0 ? \`\${goal.taskCount} tarefas\` : 'Sem tarefas'}</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300" />
        </div>
      </Link>
    </div>
  );
}`;

const replacement = `function SortableGoalItem({ goal, index, total }: { goal: any, index: number, total: number } & { key?: React.Key }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: goal.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const progress = goal.taskCount > 0 ? Math.round((goal.markCount / goal.taskCount) * 100) : 0;
  
  let computedStatus = 'not_started';
  if (goal.taskCount > 0 && progress === 100) {
    computedStatus = 'completed';
  } else if (goal.taskCount > 0 && progress > 0) {
    computedStatus = 'in_progress';
  }

  const badgeClasses = computedStatus === 'in_progress' 
    ? 'bg-blue-100 text-blue-800' 
    : computedStatus === 'completed' 
    ? 'bg-green-100 text-green-800' 
    : 'bg-gray-100 text-gray-800';

  const badgeText = computedStatus === 'in_progress' 
    ? 'Em andamento' 
    : computedStatus === 'completed' 
    ? 'Concluído' 
    : 'Não iniciado';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={\`group bg-white dark:bg-gray-900 dark:border-gray-800 p-2 sm:p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center transition-all \${isDragging ? 'shadow-2xl ring-2 ring-gray-900/10 dark:ring-white/10 scale-[1.03] z-50' : ''}\`}
      aria-label={\`Objetivo \${goal.title}\`}
    >
      <div
        className="drag-handle text-gray-400 cursor-grab active:cursor-grabbing p-3 sm:p-2 rounded-lg flex items-center justify-center touch-none"
        {...listeners}
        {...attributes}
      >
        <GripVertical className="w-6 h-6" />
      </div>
      
      <Link
        to={\`/objective/\${goal.id}\`}
        draggable={false}
        className="flex-1 flex justify-between items-center ml-2 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-[0.98] transition-all select-none"
      >
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 dark:text-gray-100 text-lg line-clamp-2">{goal.title}</span>
          <div className="flex items-center gap-2 mt-1">
            <span className={\`text-xs font-bold px-2 py-0.5 rounded-full \${badgeClasses}\`}>
              {badgeText}
            </span>
            <span className="text-xs text-gray-500 font-medium">{progress}% concluído</span>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="flex items-center text-gray-400 shrink-0">
            <CalendarIcon className="w-4 h-4 mr-1" />
            <span className="text-xs font-bold whitespace-nowrap">{goal.taskCount > 0 ? \`\${goal.taskCount} tarefas\` : 'Sem tarefas'}</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300" />
        </div>
      </Link>
    </div>
  );
}`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacement);
  fs.writeFileSync('src/pages/Home.tsx', content);
  console.log("Patched successfully!");
} else {
  console.log("Could not find target string.");
}
