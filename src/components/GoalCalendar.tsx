import React, { useState } from 'react';
import { Goal, GoalMark, Task } from '../types';
import { getDaysInRange, getTodayLocal, formatLocal } from '../utils/dates';
import { X, Check } from 'lucide-react';
import { domainService } from '../services/domainService';

export function GoalCalendar({ goal, marks, tasks, onUpdate }: { goal: Goal, marks: GoalMark[], tasks: Task[], onUpdate: () => void }) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const days = getDaysInRange(goal.startDate, goal.endDate);
  const today = getTodayLocal();

  const handleDayClick = (date: string) => {
    if (date > today) return; // Cannot mark future days
    setSelectedDate(date);
  };

  const markedDaysCount = marks.length;
  const totalDays = days.length;
  const progressPercent = totalDays > 0 ? Math.round((markedDaysCount / totalDays) * 100) : 0;

  return (
    <section className="mb-10">
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase">Progresso</h2>
        <span className="text-sm font-bold text-gray-900">{markedDaysCount} / {totalDays} dias ({progressPercent}%)</span>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-7 gap-y-4 gap-x-2">
          {days.map((date) => {
            const isFuture = date > today;
            const isToday = date === today;
            const isMarked = marks.some(m => m.markDate === date);
            const hasCompletedTasks = tasks?.some(t => t.completedDate === date);
            
            // se o dia tem tarefas concluidas vinculadas ou marca manual, o botão ganha destaque vermelho
            const isActive = isMarked || hasCompletedTasks;
            
            return (
              <div key={date} className="flex flex-col items-center">
                <button
                  onClick={() => handleDayClick(date)}
                  disabled={isFuture}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isFuture ? 'opacity-30 cursor-not-allowed text-gray-200' :
                    isActive ? 'bg-red-500 text-white shadow-md' :
                    isToday ? 'border-2 border-gray-900 text-gray-900 font-bold' :
                    'bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  {isActive ? <X className="w-6 h-6 stroke-[3]" /> : <span className="text-xs font-medium">{date.split('-')[2]}</span>}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <DayModal
          date={selectedDate}
          goalId={goal.id}
          isMarked={marks.some(m => m.markDate === selectedDate)}
          completedTasks={tasks?.filter(t => t.completedDate === selectedDate) || []}
          onClose={() => setSelectedDate(null)}
          onUpdate={() => {
            onUpdate();
            setSelectedDate(null);
          }}
        />
      )}
    </section>
  );
}

function DayModal({ date, goalId, isMarked, completedTasks, onClose, onUpdate }: { date: string, goalId: string, isMarked: boolean, completedTasks: Task[], onClose: () => void, onUpdate: () => void }) {
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggle = async () => {
    setIsSubmitting(true);
    await domainService.toggleGoalMark(goalId, date, note.trim() || undefined);
    onUpdate();
  };

  const formattedDate = date.split('-').reverse().join('/');

  // O dia é considerado "feito" se tiver marca manual ou tarefas completadas nele
  const isDone = isMarked || completedTasks.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 pb-12 sm:pb-6 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">{formattedDate}</h3>
          <button onClick={onClose} className="p-2 -mr-2 text-gray-400 active:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {completedTasks.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">Tarefas concluídas hoje</h4>
            <div className="flex flex-col gap-2">
              {completedTasks.map(t => (
                <div key={t.id} className="flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-2xl">
                  <Check className="w-5 h-5 text-gray-900" />
                  <span className="font-medium text-gray-900 line-through decoration-gray-300">{t.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-gray-600 mb-6 text-lg font-medium">
          {isDone ? 'Você registrou progresso neste dia.' : 'Você fez algo que moveu este objetivo para frente?'}
        </p>

        {!isMarked && completedTasks.length === 0 && (
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            disabled={isSubmitting}
            placeholder="Anotação opcional (ex: finalizei a página)"
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 outline-none focus:border-gray-900 min-h-[120px] resize-none mb-4 text-lg"
          />
        )}

        <button
          onClick={handleToggle}
          disabled={isSubmitting}
          className={`w-full py-4 font-bold text-lg rounded-2xl active:scale-95 transition-transform disabled:opacity-50 ${
            isMarked ? 'bg-gray-100 text-gray-900' : 'bg-red-500 text-white shadow-md shadow-red-500/20'
          }`}
        >
          {isMarked ? 'Remover marcação manual' : 'Marcar dia como feito'}
        </button>
      </div>
    </div>
  );
}
