import React, { useState } from 'react';
import { Task } from '../types';
import { domainService } from '../services/domainService';
import { CheckSquare, Square, Plus } from 'lucide-react';

export function GoalTasks({ goalId, tasks, onUpdate }: { goalId: string, tasks: Task[], onUpdate: () => void }) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

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

  return (
    <section className="mb-10">
      <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-4">Tarefas</h2>
      
      <div className="flex flex-col gap-2">
        {tasks.map(task => (
          <div 
            key={task.id} 
            className="flex items-start gap-3 py-2 cursor-pointer group"
            onClick={() => handleToggle(task)}
          >
            <button className="mt-0.5 text-gray-400 group-active:scale-90 transition-transform">
              {task.completed ? (
                <CheckSquare className="w-6 h-6 text-gray-900" />
              ) : (
                <Square className="w-6 h-6" />
              )}
            </button>
            <span className={`text-lg transition-colors ${task.completed ? 'text-gray-400 line-through decoration-gray-300' : 'text-gray-900'}`}>
              {task.title}
            </span>
          </div>
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
