import React, { useState } from 'react';
import { Goal, GoalMark } from '../types';
import { getDaysInRange, getTodayLocal, formatLocal } from '../utils/dates';
import { X, Check } from 'lucide-react';
import { domainService } from '../services/domainService';

export function GoalCalendar({ goal, marks, onUpdate }: { goal: Goal, marks: GoalMark[], onUpdate: () => void }) {
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
    <section>
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase">Progresso</h2>
        <span className="text-sm font-medium text-gray-900">{markedDaysCount} / {totalDays} dias ({progressPercent}%)</span>
      </div>

      <div className="grid grid-cols-7 gap-y-4 gap-x-2">
        {days.map((date) => {
          const isFuture = date > today;
          const isToday = date === today;
          const isMarked = marks.some(m => m.markDate === date);

          return (
            <div key={date} className="flex flex-col items-center">
              <button
                onClick={() => handleDayClick(date)}
                disabled={isFuture}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isFuture ? 'opacity-30 cursor-not-allowed text-gray-300' :
                  isMarked ? 'bg-red-500 text-white' :
                  isToday ? 'border-2 border-gray-900 text-gray-900 font-bold' :
                  'border border-gray-200 text-gray-500 hover:border-gray-400'
                }`}
              >
                {isMarked ? <X className="w-6 h-6 stroke-[3]" /> : <span className="text-xs">{date.split('-')[2]}</span>}
              </button>
            </div>
          );
        })}
      </div>

      {selectedDate && (
        <DayModal
          date={selectedDate}
          goalId={goal.id}
          isMarked={marks.some(m => m.markDate === selectedDate)}
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

function DayModal({ date, goalId, isMarked, onClose, onUpdate }: { date: string, goalId: string, isMarked: boolean, onClose: () => void, onUpdate: () => void }) {
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
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 pb-12 sm:pb-6 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">{formattedDate}</h3>
          <button onClick={onClose} className="p-2 -mr-2 text-gray-400 active:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-gray-600 mb-6 text-lg">
          {isMarked ? 'Você registrou progresso neste dia.' : 'Você fez algo que moveu este objetivo para frente?'}
        </p>

        {!isMarked && (
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            disabled={isSubmitting}
            placeholder="Anotação opcional (ex: finalizei a página)"
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:border-gray-900 min-h-[100px] resize-none mb-4"
          />
        )}

        <button
          onClick={handleToggle}
          disabled={isSubmitting}
          className={`w-full py-4 font-medium text-lg rounded-2xl active:scale-95 transition-transform disabled:opacity-50 ${
            isMarked ? 'bg-gray-100 text-gray-900' : 'bg-red-500 text-white'
          }`}
        >
          {isMarked ? 'Remover marcação' : 'Marcar progresso'}
        </button>
      </div>
    </div>
  );
}
