import React, { useState } from 'react';
import { Goal, GoalMark, Task } from '../types';
import { getDaysInRange, getTodayLocal, formatLocal, parseLocal } from '../utils/dates';
import { X, Check } from 'lucide-react';
import { domainService } from '../services/domainService';

function ProgressBar({ label, current, total, percent }: { label: string, current: number, total: number, percent: number }) {
  if (total === 0) return null; // Hide if no goal days in this period
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs font-medium mb-1.5">
        <span className="text-gray-500 dark:text-gray-400">{label}</span>
        <span className="text-gray-900 dark:text-gray-100">{current} / {total} dias ({percent}%)</span>
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
        <div className="bg-red-500 h-2 rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}

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

  // Calculate Weekly and Monthly Progress
  const todayDate = parseLocal(today);
  
  const weekStart = new Date(todayDate);
  weekStart.setDate(todayDate.getDate() - todayDate.getDay()); // Sunday
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6); // Saturday
  
  const currentMonth = todayDate.getMonth();
  const currentYear = todayDate.getFullYear();

  const goalDaysThisWeek = days.filter(d => {
    const date = parseLocal(d);
    return date >= weekStart && date <= weekEnd;
  });
  
  const goalDaysThisMonth = days.filter(d => {
    const date = parseLocal(d);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const markDates = new Set(marks.map(m => m.date));
  const markedThisWeek = goalDaysThisWeek.filter(d => markDates.has(d)).length;
  const markedThisMonth = goalDaysThisMonth.filter(d => markDates.has(d)).length;

  const weekPercent = goalDaysThisWeek.length > 0 ? Math.round((markedThisWeek / goalDaysThisWeek.length) * 100) : 0;
  const monthPercent = goalDaysThisMonth.length > 0 ? Math.round((markedThisMonth / goalDaysThisMonth.length) * 100) : 0;

  // Calculate padding for the first day of the calendar
  const startWeekday = parseLocal(goal.startDate).getDay();
  const emptyCells = Array.from({ length: startWeekday });
  const weekdays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  return (
    <section className="mb-10">
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase">Calendário</h2>
      </div>

      <div className="bg-white dark:bg-gray-900 dark:border-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center mb-4">
          {weekdays.map((wd, i) => (
            <span key={i} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{wd}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-2 gap-x-2">
          {emptyCells.map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map((date) => {
            const isFuture = date > today;
            const isToday = date === today;
            const isMarked = marks.some(m => m.markDate === date);
            const hasCompletedTasks = tasks?.some(t => t.completedDate === date);
            
            return (
              <div key={date} className="flex flex-col items-center justify-center relative h-10 w-full">
                <button
                  onClick={() => handleDayClick(date)}
                  disabled={isFuture}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all relative ${
                    isFuture ? 'text-gray-300 cursor-default' :
                    isMarked ? 'bg-red-500 text-white shadow-sm' :
                    isToday ? 'text-red-500 font-bold' :
                    'text-gray-900 dark:text-gray-100 font-medium hover:bg-gray-100'
                  }`}
                >
                  {isMarked ? <X className="w-5 h-5 stroke-[3]" /> : <span className="text-[15px]">{date.split('-')[2]}</span>}
                </button>
                {!isMarked && hasCompletedTasks && (
                  <div className="absolute bottom-0 w-1 h-1 bg-gray-400 rounded-full" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between items-end mb-4 mt-8">
        <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase">Progresso</h2>
      </div>

      <div className="bg-white dark:bg-gray-900 dark:border-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
        <ProgressBar label="Geral" current={markedDaysCount} total={totalDays} percent={progressPercent} />
        <ProgressBar label="Neste Mês" current={markedThisMonth} total={goalDaysThisMonth.length} percent={monthPercent} />
        <ProgressBar label="Nesta Semana" current={markedThisWeek} total={goalDaysThisWeek.length} percent={weekPercent} />
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

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-900 dark:border-gray-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 pb-12 sm:pb-6 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{formattedDate}</h3>
          <button onClick={onClose} className="p-2 -mr-2 text-gray-400 active:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {completedTasks.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">Tarefas concluídas hoje</h4>
            <div className="flex flex-col gap-2">
              {completedTasks.map(t => (
                <div key={t.id} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-2xl">
                  <Check className="w-5 h-5 text-gray-900 dark:text-gray-100" />
                  <span className="font-medium text-gray-900 dark:text-gray-100 line-through decoration-gray-300">{t.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-gray-600 mb-6 text-lg font-medium">
          {isMarked ? 'Você marcou este dia como concluído.' : 'Você fez algo que moveu este objetivo para frente?'}
        </p>

        {!isMarked && (
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            disabled={isSubmitting}
            placeholder="Anotação opcional (ex: finalizei a página)"
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-4 outline-none focus:border-gray-900 min-h-[120px] resize-none mb-4 text-lg"
          />
        )}

        <button
          onClick={handleToggle}
          disabled={isSubmitting}
          className={`w-full py-4 font-bold text-lg rounded-2xl active:scale-95 transition-transform disabled:opacity-50 ${
            isMarked ? 'bg-gray-100 text-gray-900 dark:text-black' : 'bg-red-500 text-white shadow-md shadow-red-500/20'
          }`}
        >
          {isMarked ? 'Remover marcação manual' : 'Marcar dia como feito'}
        </button>
      </div>
    </div>
  );
}
