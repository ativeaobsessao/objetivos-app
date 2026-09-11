const fs = require('fs');
let code = fs.readFileSync('src/components/SortableGoalItem.tsx', 'utf8');

const replacement = `export function GoalItem({
  goal, isOverlay, isDraggingPlaceholder, setNodeRef, style, attributes, listeners
}: GoalItemProps) {
  const totalDays = getDiffDaysLocal(goal.startDate, goal.endDate) + 1;
  const markCount = goal.markCount || 0;
  const progressPercent = totalDays > 0 ? Math.round((markCount / totalDays) * 100) : 0;
  const daysLeft = Math.max(0, totalDays - markCount);

  if (isDraggingPlaceholder) {
    return (
      <div ref={setNodeRef} style={style} className="bg-gray-50/50 dark:bg-gray-800/30 p-2 sm:p-3 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 flex items-center opacity-40">
        <div className="p-3 sm:p-2 text-transparent flex items-center justify-center">
          <GripVertical className="w-6 h-6" />
        </div>
        <div className="flex-1 ml-1 sm:ml-2 p-2">
          <h3 className="text-lg mb-1 text-transparent">{goal.title}</h3>
          <p className="text-sm text-transparent">progress</p>
        </div>
      </div>
    );
  }
  
  // Custom listeners to allow touch everywhere, but mouse only on the handle.
  // The TouchSensor will pick up touch events.
  // The PointerSensor will pick up mouse events.
  const customListeners = {
    ...listeners,
    onPointerDown: (e: any) => {
      // If it's a mouse event and we are not clicking the drag handle, ignore
      if (e.pointerType === 'mouse' && !e.target.closest('.drag-handle')) {
        return;
      }
      if (listeners?.onPointerDown) {
        listeners.onPointerDown(e);
      }
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...customListeners}
      className={\`group bg-white dark:bg-gray-900 dark:border-gray-800 p-2 sm:p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center transition-all \${isOverlay ? 'shadow-2xl ring-2 ring-gray-900/10 dark:ring-white/10 scale-[1.03] z-50 cursor-grabbing' : ''}\`}
      aria-label={\`Objetivo \${goal.title}\`}
    >
      <div
        className="drag-handle text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none p-3 sm:p-2 rounded-lg active:bg-gray-100 dark:active:bg-gray-800 flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hidden md:flex"
        style={{ touchAction: 'none' }}
      >
        <GripVertical className="w-6 h-6" />
      </div>
      
      <Link
        to={isOverlay ? '#' : \`/objective/\${goal.id}\`}
        draggable={false}
        onClick={(e) => { if (isOverlay) e.preventDefault(); }}
        className="flex-1 flex justify-between items-center ml-1 sm:ml-0 md:ml-2 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-[0.98] transition-all select-none"
      >
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg mb-1">{goal.title}</h3>
          <p className="text-gray-500 text-sm font-medium">
            {progressPercent}% concluído • Faltam {daysLeft} {daysLeft === 1 ? 'dia' : 'dias'}
          </p>
        </div>
        <ChevronRight className="text-gray-300 w-5 h-5" />
      </Link>
    </div>
  );
}`;

const startIdx = code.indexOf('export function GoalItem');
const endIdx = code.indexOf('export function SortableGoalItem');
code = code.substring(0, startIdx) + replacement + '\n\n' + code.substring(endIdx);

fs.writeFileSync('src/components/SortableGoalItem.tsx', code);
