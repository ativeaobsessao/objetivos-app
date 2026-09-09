import React, { useState } from 'react';
import { Task } from '../types';
import { domainService } from '../services/domainService';
import { CheckSquare, Square, Plus, Edit2, Check, X } from 'lucide-react';

export function GoalTasks({ goalId, tasks, onUpdate }: { goalId: string, tasks: Task[], onUpdate: () => void }) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = async (task: Task) => {
    // optimistic update could go here
    await domainService.toggleTask(task.id, !task.completed);
    onUpdate();
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    await domainService.addTaskToGoal(goalId, newTaskTitle.trim());
    setNewTaskTitle('');
    setIsAdding(false);
    onUpdate();
  };

  const handleEditTask = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return;
    setIsSaving(true);
    try {
      await domainService.updateTask(editingId!, editTitle.trim());
      setEditingId(null);
      onUpdate();
    } catch (err) {
      console.error(err);
      alert('Ocorreu um erro ao editar a tarefa.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="mb-10">
      <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-4">Tarefas</h2>
      
      <div className="flex flex-col gap-2">
        {tasks.map(task => (
          editingId === task.id ? (
            <div key={task.id} className="flex items-center gap-2 py-2">
              <input
                autoFocus
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-gray-900 transition-colors text-lg shadow-sm"
                disabled={isSaving}
              />
              <button onClick={handleSaveEdit} disabled={isSaving || !editTitle.trim()} className="p-2 text-green-600 hover:bg-green-50 rounded-lg active:scale-95 transition-all disabled:opacity-50">
                <Check className="w-5 h-5" />
              </button>
              <button onClick={() => setEditingId(null)} disabled={isSaving} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg active:scale-95 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div 
              key={task.id} 
              className="flex items-start gap-3 py-2 group"
            >
              <button onClick={() => handleToggle(task)} className="mt-0.5 text-gray-400 active:scale-90 transition-transform">
                {task.completed ? (
                  <CheckSquare className="w-6 h-6 text-gray-900" />
                ) : (
                  <Square className="w-6 h-6" />
                )}
              </button>
              <span 
                className={`text-lg flex-1 cursor-pointer transition-colors ${task.completed ? 'text-gray-400 line-through decoration-gray-300' : 'text-gray-900'}`}
                onClick={() => handleToggle(task)}
              >
                {task.title}
              </span>
              <button 
                onClick={() => handleEditTask(task)} 
                className="p-1.5 text-gray-300 hover:text-gray-600 active:bg-gray-100 rounded-lg transition-colors"
                title="Editar"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )
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
            className="flex items-center gap-3 py-2 mt-2 text-gray-400 hover:text-gray-900 transition-colors text-left"
          >
            <Plus className="w-6 h-6 mt-0.5" />
            <span className="text-lg">Adicionar tarefa</span>
          </button>
        )}
      </div>
    </section>
  );
}
