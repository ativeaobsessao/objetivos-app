import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../types';
import { CheckSquare, Square, Edit2, Trash2, GripVertical, Check, X } from 'lucide-react';

export interface TaskItemProps {
  task: Task;
  editingId?: string | null;
  editTitle?: string;
  isSaving?: boolean;
  onEditChange?: (val: string) => void;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
  onTaskClick?: (task: Task) => void;
  onEditRequest?: (task: Task) => void;
  onDeleteRequest?: (task: Task) => void;
  isOverlay?: boolean;
  isDraggingPlaceholder?: boolean;
  setNodeRef?: (node: HTMLElement | null) => void;
  style?: React.CSSProperties;
  attributes?: any;
  listeners?: any;
}

export function TaskItem({
  task, editingId, editTitle, isSaving, onEditChange, onSaveEdit, onCancelEdit,
  onTaskClick, onEditRequest, onDeleteRequest, isOverlay, isDraggingPlaceholder,
  setNodeRef, style, attributes, listeners
}: TaskItemProps) {
  const isEditing = editingId === task.id;

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style} className="flex items-center gap-2 py-2 bg-white dark:bg-gray-900 z-10 relative">
        <input
          autoFocus
          value={editTitle || ''}
          onChange={e => onEditChange?.(e.target.value)}
          className="flex-1 bg-white dark:bg-gray-900 dark:border-gray-800 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-gray-900 transition-colors text-lg shadow-sm"
          disabled={isSaving}
        />
        <button onClick={onSaveEdit} disabled={isSaving || !editTitle?.trim()} className="p-2 text-green-600 hover:bg-green-50 rounded-lg active:scale-95 transition-all disabled:opacity-50">
          <Check className="w-5 h-5" />
        </button>
        <button onClick={onCancelEdit} disabled={isSaving} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg active:scale-95 transition-all">
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  }

  if (isDraggingPlaceholder) {
    return (
      <div ref={setNodeRef} style={style} className="flex items-start gap-2 sm:gap-3 py-2 group bg-gray-50/50 dark:bg-gray-800/30 rounded-xl opacity-30 border border-dashed border-gray-300 dark:border-gray-700">
        <div className="mt-0.5 text-transparent p-2 sm:p-1 -ml-2 sm:-ml-1"><GripVertical className="w-5 h-5 sm:w-6 sm:h-6" /></div>
        <div className="mt-0.5 text-transparent"><Square className="w-6 h-6" /></div>
        <span className="text-lg flex-1 text-transparent">{task.title}</span>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start gap-2 sm:gap-3 py-2 group bg-transparent rounded-xl transition-all ${isOverlay ? 'shadow-2xl ring-1 ring-gray-900/5 dark:ring-white/10 bg-white dark:bg-gray-800 scale-105 p-2 -mx-2 z-50 cursor-grabbing' : ''}`}
    >
      <div
        className="mt-0.5 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none flex items-center justify-center p-2 sm:p-1 -ml-2 sm:-ml-1 rounded-md active:bg-gray-100 dark:active:bg-gray-800"
        style={{ touchAction: 'none' }}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      
      <button
        onClick={() => onTaskClick?.(task)}
        className="mt-0.5 text-gray-400 active:scale-90 transition-transform"
      >
        {task.completed ? (
          <CheckSquare className="w-6 h-6 text-gray-900 dark:text-gray-100" />
        ) : (
          <Square className="w-6 h-6" />
        )}
      </button>
      
      <span
        draggable={false}
        className={`text-lg flex-1 transition-colors select-none ${task.completed ? 'text-gray-400 line-through decoration-gray-300 cursor-default' : 'text-gray-900 dark:text-gray-100 cursor-pointer'}`}
        onClick={() => onTaskClick?.(task)}
        title={task.completed ? "Clique duas vezes para desmarcar" : ""}
      >
        {task.title}
      </span>
      
      <button
        onClick={() => onEditRequest?.(task)}
        className={`p-1.5 text-gray-300 hover:text-gray-600 active:bg-gray-100 rounded-lg transition-colors ${isOverlay ? 'opacity-0' : 'opacity-0 group-hover:opacity-100 focus:opacity-100'}`}
        title="Editar"
      >
        <Edit2 className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => onDeleteRequest?.(task)}
        className={`p-1.5 text-gray-300 hover:text-red-500 active:bg-red-50 rounded-lg transition-colors ${isOverlay ? 'opacity-0' : 'opacity-0 group-hover:opacity-100 focus:opacity-100'}`}
        title="Excluir"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export function SortableTaskItem(props: Omit<TaskItemProps, 'isOverlay' | 'isDraggingPlaceholder' | 'setNodeRef' | 'style' | 'attributes' | 'listeners'>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.task.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <TaskItem
      {...props}
      setNodeRef={setNodeRef}
      style={style}
      attributes={attributes}
      listeners={listeners}
      isDraggingPlaceholder={isDragging}
    />
  );
}
