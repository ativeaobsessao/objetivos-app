import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { domainService } from '../services/domainService';
import { CheckSquare, Square, Plus, Edit2, Check, X, Trash2 } from 'lucide-react';
import { getTodayLocal } from '../utils/dates';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { SortableTaskItem } from './SortableTaskItem';

export function GoalTasks({ goalId, tasks, onUpdate }: { goalId: string, tasks: Task[], onUpdate: (showLoading?: boolean) => void }) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const [taskToConfirm, setTaskToConfirm] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  
  const [lastClickTime, setLastClickTime] = useState<Record<string, number>>({});
  
  // Optimistic local state for immediate visual feedback
  const [optimisticTasks, setOptimisticTasks] = useState<Task[]>(tasks);

  useEffect(() => {
    setOptimisticTasks(tasks);
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = optimisticTasks.findIndex((t) => t.id === active.id);
      const newIndex = optimisticTasks.findIndex((t) => t.id === over.id);
      
      const newTasks = arrayMove(optimisticTasks, oldIndex, newIndex);
      setOptimisticTasks(newTasks);

      const prevTask = newTasks[newIndex - 1];
      const nextTask = newTasks[newIndex + 1];
      
      let newCreatedAt = '';
      if (!prevTask && nextTask) {
        const d = new Date(nextTask.createdAt);
        d.setHours(d.getHours() - 1);
        newCreatedAt = d.toISOString();
      } else if (prevTask && !nextTask) {
        const d = new Date(prevTask.createdAt);
        d.setHours(d.getHours() + 1);
        newCreatedAt = d.toISOString();
      } else if (prevTask && nextTask) {
        const d1 = new Date(prevTask.createdAt).getTime();
        const d2 = new Date(nextTask.createdAt).getTime();
        newCreatedAt = new Date((d1 + d2) / 2).toISOString();
      } else {
        return;
      }

      setOptimisticTasks(current => 
        current.map(t => t.id === active.id ? { ...t, createdAt: newCreatedAt } : t)
      );

      try {
        await domainService.updateTaskOrder(active.id as string, newCreatedAt);
        onUpdate(false);
      } catch (err) {
        console.error(err);
        setOptimisticTasks(tasks);
      }
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
      // Optimistic update
      setOptimisticTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: true, completedDate: today } : t));
      setTaskToConfirm(task);
      
      try {
        await domainService.toggleTask(task.id, true, today);
        onUpdate(false);
      } catch (error) {
        console.error(error);
        alert('Erro ao salvar.');
        setOptimisticTasks(tasks); // revert
      }
    } else {
      // Optimistic update
      setOptimisticTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: false, completedDate: undefined } : t));
      
      try {
        await domainService.toggleTask(task.id, false, undefined);
        onUpdate(false);
      } catch (error) {
        console.error(error);
        alert('Erro ao salvar.');
        setOptimisticTasks(tasks); // revert
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
    
    // Optimistic delete
    setOptimisticTasks(prev => prev.filter(t => t.id !== deletedId));
    
    try {
      await domainService.deleteTaskFromGoal(goalId, deletedId);
      onUpdate(false);
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir.');
      setOptimisticTasks(tasks); // revert
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    const newTitle = newTaskTitle.trim();
    setNewTaskTitle('');
    setIsAdding(false);
    
    // Optimistic add
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
      alert('Erro ao adicionar.');
      setOptimisticTasks(tasks); // revert
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
    
    // Optimistic edit
    setOptimisticTasks(prev => prev.map(t => t.id === idToEdit ? { ...t, title: newTitle } : t));
    
    try {
      await domainService.updateTask(idToEdit, newTitle);
      onUpdate(false);
    } catch (err) {
      console.error(err);
      alert('Ocorreu um erro ao editar a tarefa.');
      setOptimisticTasks(tasks); // revert
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="mb-10">
      <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-4">Tarefas</h2>
      
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={optimisticTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {optimisticTasks.map(task => (
              <SortableTaskItem
                key={task.id}
                task={task}
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
