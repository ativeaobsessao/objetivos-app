import React, { useState, useEffect, useRef } from 'react';
import { Task } from '../types';
import { domainService } from '../services/domainService';
import { CheckSquare, Square, Plus, Edit2, Trash2, GripVertical, Check, X } from 'lucide-react';
import { getTodayLocal } from '../utils/dates';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  TouchSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent, 
  DragStartEvent, 
  DragOverlay 
} from '@dnd-kit/core';
import { 
  SortableContext, 
  verticalListSortingStrategy, 
  arrayMove, 
  sortableKeyboardCoordinates,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableTaskItem({ key, 
  task, 
  editingId, 
  editTitle, 
  isSaving, 
  onEditChange, 
  onSaveEdit, 
  onCancelEdit, 
  onTaskClick, 
  onEditRequest, 
  onDeleteRequest 
}: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start gap-2 sm:gap-3 py-2 group rounded-xl transition-all ${isDragging ? 'shadow-2xl ring-1 ring-gray-900/5 dark:ring-white/10 bg-white dark:bg-gray-800 scale-[1.03] p-2 -mx-2 z-50' : 'bg-transparent'}`}
    >
      <div
        className="drag-handle text-gray-400 cursor-grab active:cursor-grabbing touch-none flex items-center justify-center p-2 sm:p-1 -ml-2 sm:-ml-1 rounded-md"
        {...listeners}
        {...attributes}
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
      >
        {task.title}
      </span>
      
      <button
        onClick={() => onEditRequest?.(task)}
        className="p-1.5 text-gray-300 hover:text-gray-600 active:bg-gray-100 rounded-lg transition-colors"
        title="Editar"
      >
        <Edit2 className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => onDeleteRequest?.(task)}
        className="p-1.5 text-gray-300 hover:text-red-500 active:bg-red-50 rounded-lg transition-colors"
        title="Excluir"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export function GoalTasks({ goalId, tasks, onUpdate }: { goalId: string, tasks: Task[], onUpdate: (showLoading?: boolean) => void }) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [taskToConfirm, setTaskToConfirm] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [lastClickTime, setLastClickTime] = useState<Record<string, number>>({});

  const [optimisticTasks, setOptimisticTasks] = useState<Task[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setOptimisticTasks(tasks);
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    if (over && active.id !== over.id) {
      const oldIndex = optimisticTasks.findIndex((t) => t.id === active.id);
      const newIndex = optimisticTasks.findIndex((t) => t.id === over.id);
      
      const oldIds = optimisticTasks.map(t => t.id);
      const newTasks = arrayMove<any>(optimisticTasks, oldIndex, newIndex);
      const newIds = newTasks.map(t => t.id);
      
      console.log('--- onDragEnd: Tarefas ---');
      console.log('IDs antes do arrayMove:', oldIds);
      console.log('IDs depois do arrayMove:', newIds);

      const updatedTasks = newTasks.map((t: any, idx) => ({ ...t, position: idx }));
      setOptimisticTasks(updatedTasks);
      
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
          setOptimisticTasks(tasks);
        }
      }, 500);
    }
  };

  useEffect(() => {
    if (taskToConfirm) {
      const t = setTimeout(() => {
        setTaskToConfirm(null);
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [taskToConfirm]);

  const handleTaskClick = (task: Task) => {
    if (!task.completed) {
      handleToggle(task);
    } else {
      const now = Date.now();
      const last = lastClickTime[task.id] || 0;
      if (now - last < 500) {
        handleToggle(task);
        setLastClickTime(prev => ({ ...prev, [task.id]: 0 }));
      } else {
        setLastClickTime(prev => ({ ...prev, [task.id]: now }));
      }
    }
  };

  const handleToggle = async (task: Task) => {
    if (!task.completed) {
      const today = getTodayLocal();
      setOptimisticTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: true, completedDate: today } : t));
      setTaskToConfirm(task);
      
      try {
        await domainService.toggleTask(task.id, true, today);
        onUpdate(false);
      } catch (error) {
        console.error(error);
        setOptimisticTasks(tasks);
      }
    } else {
      setOptimisticTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: false, completedDate: undefined } : t));
      
      try {
        await domainService.toggleTask(task.id, false, undefined);
        onUpdate(false);
      } catch (error) {
        console.error(error);
        setOptimisticTasks(tasks);
      }
    }
  };

  const handleDeleteRequest = (task: Task) => {
    setTaskToDelete(task);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    const deletedId = taskToDelete.id;
    setTaskToDelete(null);
    
    setOptimisticTasks(prev => prev.filter(t => t.id !== deletedId));
    
    try {
      await domainService.deleteTaskFromGoal(goalId, deletedId);
      onUpdate(false);
    } catch (err) {
      console.error(err);
      setOptimisticTasks(tasks);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    const newTitle = newTaskTitle.trim();
    setNewTaskTitle('');
    setIsAdding(false);
    
    setOptimisticTasks(prev => [...prev, {
      id: `temp-${Date.now()}`,
      goalId,
      title: newTitle,
      completed: false,
      createdAt: new Date().toISOString()
    }]);

    try {
      await domainService.addTaskToGoal(goalId, newTitle);
      onUpdate(false);
    } catch (error) {
      console.error(error);
      setOptimisticTasks(tasks);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return;
    
    const idToEdit = editingId!;
    const newTitle = editTitle.trim();
    
    setEditingId(null);
    setIsSaving(true);
    
    setOptimisticTasks(prev => prev.map(t => t.id === idToEdit ? { ...t, title: newTitle } : t));
    
    try {
      await domainService.updateTask(idToEdit, newTitle);
      onUpdate(false);
    } catch (err) {
      console.error(err);
      setOptimisticTasks(tasks);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="mb-10">
      <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-4">Tarefas</h2>
      
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
        <SortableContext items={optimisticTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {optimisticTasks.map((task, idx) => (
              <SortableTaskItem
                key={task.id}
                task={task}
                index={idx}
                editingId={editingId}
                editTitle={editTitle}
                isSaving={isSaving}
                onEditChange={setEditTitle}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={() => setEditingId(null)}
                onTaskClick={handleTaskClick}
                onEditRequest={handleEditTask}
                onDeleteRequest={handleDeleteRequest}
              />
            ))}
            
            {isAdding ? (
              <form onSubmit={handleAddTask} className="flex items-center gap-3 mt-2">
                <Square className="w-6 h-6 text-gray-300 mt-0.5 shrink-0" />
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  placeholder="Descreva a tarefa..."
                  autoFocus
                  className="flex-1 bg-transparent border-b border-gray-200 outline-none py-1 text-lg"
                  onBlur={() => {
                    if (!newTaskTitle.trim()) setIsAdding(false);
                  }}
                />
              </form>
            ) : (
              <button 
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-3 py-2 mt-2 text-gray-400 hover:text-gray-900 dark:text-gray-100 transition-colors text-left"
              >
                <Plus className="w-6 h-6 mt-0.5" />
                <span className="text-lg">Adicionar tarefa</span>
              </button>
            )}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeId ? (
            <div className="flex items-start gap-2 sm:gap-3 py-2 bg-white dark:bg-gray-800 shadow-2xl ring-1 ring-gray-900/5 dark:ring-white/10 rounded-xl p-2 -mx-2 z-50 scale-[1.03]">
              <div className="drag-handle text-gray-400 p-2 sm:p-1 -ml-2 sm:-ml-1 flex items-center justify-center">
                <GripVertical className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <Square className="w-6 h-6 text-gray-400 mt-0.5" />
              <span className="text-lg flex-1 text-gray-900 dark:text-gray-100">
                {optimisticTasks.find((t: any) => t.id === activeId)?.title}
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {taskToConfirm && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-gray-900 text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-3">
            <CheckSquare className="w-5 h-5 text-green-400" />
            <span className="font-medium">Salvo no hoje</span>
          </div>
        </div>
      )}

      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center" onClick={() => setTaskToDelete(null)}>
          <div 
            className="bg-white dark:bg-gray-900 dark:border-gray-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 pb-12 sm:pb-6 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Excluir tarefa</h3>
            <p className="text-gray-600 mb-6 font-medium text-lg">
              Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleConfirmDelete}
                className="w-full py-4 font-bold text-lg rounded-2xl active:scale-95 transition-transform bg-red-500 text-white shadow-md shadow-red-500/20"
              >
                Sim, excluir
              </button>
              <button
                onClick={() => setTaskToDelete(null)}
                className="w-full py-4 font-bold text-lg rounded-2xl active:scale-95 transition-transform bg-gray-100 text-gray-900 dark:text-black hover:bg-gray-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
