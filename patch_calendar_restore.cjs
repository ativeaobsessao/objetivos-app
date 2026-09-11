const fs = require('fs');
const content = `import React, { useState } from 'react';
import { Goal, GoalMark, Task } from '../types';
import { getDaysInRange, getTodayLocal, formatLocal, parseLocal } from '../utils/dates';
import { X, Check, Edit2 } from 'lucide-react';
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
        <div className="bg-red-500 h-2 rounded-full transition-all duration-500" style={{ width: \`\${percent}%\` }}></div>
      </div>
    </div>
  );
}

export function GoalCalendar({ goal, marks, tasks, onUpdate }: { goal: Goal, marks: GoalMark[], tasks: Task[], onUpdate: (showLoading?: boolean) => void }) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const days = getDaysInRange(goal.startDate, goal.endDate);
  const totalDays = days.length;
  const markedDaysCount = marks.length;
  const progressPercent = totalDays > 0 ? Math.round((markedDaysCount / totalDays) * 100) : 0;

  const today = getTodayLocal();
  
  const currentMonthStr = today.substring(0, 7);
  const goalDaysThisMonth = days.filter(d => d.startsWith(currentMonthStr));
  const markedThisMonth = marks.filter(m => m.markDate.startsWith(currentMonthStr)).length;
  const monthPercent = goalDaysThisMonth.length > 0 ? Math.round((markedThisMonth / goalDaysThisMonth.length) * 100) : 0;

  const todayDateObj = parseLocal(today);
  const currentDayOfWeek = todayDateObj.getDay();
  const startOfWeekObj = new Date(todayDateObj);
  startOfWeekObj.setDate(startOfWeekObj.getDate() - currentDayOfWeek);
  const endOfWeekObj = new Date(startOfWeekObj);
  endOfWeekObj.setDate(endOfWeekObj.getDate() + 6);
  
  const startOfWeekStr = formatLocal(startOfWeekObj);
  const endOfWeekStr = formatLocal(endOfWeekObj);
  
  const goalDaysThisWeek = days.filter(d => d >= startOfWeekStr && d <= endOfWeekStr);
  const markedThisWeek = marks.filter(m => m.markDate >= startOfWeekStr && m.markDate <= endOfWeekStr).length;
  const weekPercent = goalDaysThisWeek.length > 0 ? Math.round((markedThisWeek / goalDaysThisWeek.length) * 100) : 0;

  const handleDayClick = (date: string) => {
    if (date > today) return;
    setSelectedDate(date);
  };

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
            <div key={\`empty-\${i}\`} />
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
                  className={\`w-10 h-10 rounded-full flex items-center justify-center transition-all relative \${
                    isFuture ? 'text-gray-300 cursor-default' :
                    isMarked ? 'bg-red-500 text-white shadow-sm' :
                    isToday ? 'text-red-500 font-bold' :
                    'text-gray-900 dark:text-gray-100 font-medium hover:bg-gray-100'
                  }\`}
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
          existingMark={marks.find(m => m.markDate === selectedDate)}
          completedTasks={tasks?.filter(t => t.completedDate === selectedDate) || []}
          onClose={() => setSelectedDate(null)}
          onUpdate={(showLoading = true) => {
            onUpdate(showLoading);
            if (showLoading) setSelectedDate(null);
          }}
        />
      )}
    </section>
  );
}

function DayModal({ date, goalId, existingMark, completedTasks, onClose, onUpdate }: { date: string, goalId: string, existingMark?: { id: string, note?: string }, completedTasks: Task[], onClose: () => void, onUpdate: (showLoading?: boolean) => void }) {
  const isMarked = !!existingMark;
  const initialNote = existingMark?.note || '';
  const [note, setNote] = useState(initialNote);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);

  React.useEffect(() => {
    setNote(existingMark?.note || '');
    setIsEditingNote(false);
  }, [existingMark]);

  const hasNoteChanged = note !== (existingMark?.note || '');

  const handleSaveNote = async () => {
    setIsSubmitting(true);
    try {
      if (existingMark) {
        await domainService.updateGoalMarkNote(existingMark.id, note.trim() || undefined);
        onUpdate(false);
        setIsEditingNote(false);
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar anotação.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleMark = async () => {
    setIsSubmitting(true);
    try {
      if (isMarked) {
        await domainService.toggleGoalMark(goalId, date, undefined);
      } else {
        await domainService.toggleGoalMark(goalId, date, note.trim() || undefined);
      }
      onUpdate(false);
      onClose();
    } catch (e) {
      console.error(e);
      alert("Erro ao alterar status do dia.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedDate = date.split('-').reverse().join('/');

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-900 dark:border-gray-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 pb-12 sm:pb-6 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 shadow-2xl flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{formattedDate}</h3>
          <button onClick={onClose} className="p-2 -mr-2 text-gray-400 active:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 -mx-6 px-6 pb-2">
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

          {isMarked && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-bold tracking-widest text-gray-400 uppercase">Anotação</h4>
                {!isEditingNote && (
                  <button 
                    onClick={() => setIsEditingNote(true)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm font-bold flex items-center gap-1 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg active:scale-95 transition-all"
                  >
                    <Edit2 className="w-3 h-3" /> Editar
                  </button>
                )}
              </div>

              {isEditingNote ? (
                <div className="flex flex-col gap-3">
                  <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Escreva algo sobre o progresso de hoje..."
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-4 outline-none focus:border-gray-900 min-h-[120px] resize-none text-lg"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setNote(initialNote); setIsEditingNote(false); }}
                      disabled={isSubmitting}
                      className="flex-1 py-3 font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 rounded-xl"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveNote}
                      disabled={isSubmitting || !hasNoteChanged}
                      className="flex-1 py-3 font-bold text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-xl disabled:opacity-50"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-4 rounded-2xl min-h-[60px]">
                  {initialNote ? (
                    <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap text-lg">{initialNote}</p>
                  ) : (
                    <p className="text-gray-400 italic">Nenhuma anotação para este dia.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {!isMarked && (
            <div className="mb-6">
              <h4 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">Anotação</h4>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                disabled={isSubmitting}
                placeholder="Opcional: o que você fez hoje?"
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-4 outline-none focus:border-gray-900 min-h-[120px] resize-none text-lg"
              />
            </div>
          )}

          <p className="text-gray-600 mb-6 text-lg font-medium">
            {isMarked ? 'Você marcou este dia como concluído.' : 'Você fez algo que moveu este objetivo para frente?'}
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleToggleMark}
              disabled={isSubmitting}
              className={\`w-full py-4 font-bold text-lg rounded-2xl active:scale-95 transition-transform disabled:opacity-50 \${
                isMarked ? 'bg-gray-100 text-gray-900 dark:text-gray-100 dark:bg-gray-800' : 'bg-red-500 text-white shadow-md shadow-red-500/20'
              }\`}
            >
              {isMarked ? 'Remover marcação manual' : 'Marcar dia como feito'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync('src/components/GoalCalendar.tsx', content);
