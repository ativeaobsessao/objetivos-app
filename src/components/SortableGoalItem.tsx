import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';
import { ChevronRight, GripVertical } from 'lucide-react';
import { getDiffDaysLocal } from '../utils/dates';

interface SortableGoalItemProps {
  goal: any;
}

export function SortableGoalItem({ goal }: SortableGoalItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: goal.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.9 : 1,
  };

  const totalDays = getDiffDaysLocal(goal.startDate, goal.endDate) + 1;
  const markCount = goal.markCount || 0;
  const progressPercent = totalDays > 0 ? Math.round((markCount / totalDays) * 100) : 0;
  const daysLeft = Math.max(0, totalDays - markCount);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white dark:bg-gray-900 dark:border-gray-800 p-2 sm:p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center transition-all ${isDragging ? 'shadow-2xl ring-2 ring-gray-900/10 dark:ring-white/10 scale-[1.02]' : ''}`}
    >
      <div
        className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none p-3 sm:p-2 rounded-lg active:bg-gray-100 dark:active:bg-gray-800 flex items-center justify-center"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-6 h-6" />
      </div>
      <Link
        to={`/objective/${goal.id}`}
        draggable={false}
        className="flex-1 flex justify-between items-center ml-1 sm:ml-2 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-[0.98] transition-all select-none"
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
}

