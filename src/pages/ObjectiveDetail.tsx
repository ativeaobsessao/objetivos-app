import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGoalView } from '../hooks/useDomain';
import { domainService } from '../services/domainService';
import { MobileLayout } from '../components/MobileLayout';
import { ArrowLeft, MoreHorizontal, Calendar as CalendarIcon, Check, ChevronRight } from 'lucide-react';
import { formatLocal, parseLocal, formatDateFull, getDiffDaysLocal } from '../utils/dates';
import { GoalTasks } from '../components/GoalTasks';
import { GoalCalendar } from '../components/GoalCalendar';
import { GoalAchievements } from '../components/GoalAchievements';
import { UserMenu } from '../components/UserMenu';
import { ThemeToggle } from '../components/ThemeToggle';

export default function ObjectiveDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { goal, tasks, marks, loading, reload } = useGoalView(id);
  const [showMenu, setShowMenu] = useState(false);
  const [dateModalMode, setDateModalMode] = useState<'start' | 'end' | 'both' | null>(null);

  if (loading) {
    return (
      <MobileLayout>
        <div className="flex-1 flex flex-col items-center justify-center min-h-screen text-center px-4">
           <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-gray-900 animate-spin mb-4" />
        </div>
      </MobileLayout>
    );
  }

  if (!goal) {
    return (
      <MobileLayout>
        <div className="flex-1 flex flex-col items-center justify-center min-h-screen text-center px-4">
          <p>Objetivo não encontrado.</p>
          <button onClick={() => navigate('/')} className="mt-4 text-gray-900 dark:text-gray-100 font-medium">Voltar</button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout className="p-6">
      <header className="flex justify-between items-start py-4 mb-6">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 text-gray-900 dark:text-gray-100 active:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu />
          <button onClick={() => setShowMenu(true)} className="p-2 -mr-2 text-gray-900 dark:text-gray-100 dark:text-white active:bg-gray-100 dark:active:bg-gray-800 rounded-full transition-colors">
            <MoreHorizontal className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Goal Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 leading-tight tracking-tight mb-6">
            {goal.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {/* Start Date Badge - Clickable */}
            <button
              type="button"
              onClick={() => setDateModalMode('start')}
              className="group flex items-center gap-2.5 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 px-4 py-2.5 rounded-xl border border-gray-200/80 dark:border-gray-800 transition-all active:scale-[0.98] text-left"
              title="Clique para editar a data de início"
            >
              <div className="flex flex-col">
                <span className="font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase text-[10px] leading-tight">Início</span>
                <span className="font-bold text-gray-800 dark:text-gray-200 text-sm mt-0.5">{formatDateFull(goal.startDate)}</span>
              </div>
            </button>
            
            {/* End Date Badge - Clickable */}
            <button
              type="button"
              onClick={() => setDateModalMode('end')}
              className="group flex items-center gap-2.5 bg-red-50/70 dark:bg-red-950/30 hover:bg-red-100/70 dark:hover:bg-red-900/40 px-4 py-2.5 rounded-xl border border-red-200/70 dark:border-red-900/40 transition-all active:scale-[0.98] text-left"
              title="Clique para editar o prazo final"
            >
              <div className="flex flex-col">
                <span className="font-bold tracking-widest text-red-500/80 dark:text-red-400 uppercase text-[10px] leading-tight">Prazo final</span>
                <span className="font-bold text-red-700 dark:text-red-300 text-sm mt-0.5">{formatDateFull(goal.endDate)}</span>
              </div>
            </button>
          </div>
        </div>

        <GoalTasks goalId={goal.id} tasks={tasks} onUpdate={reload} />
        <GoalCalendar goal={goal} marks={marks} tasks={tasks} onUpdate={reload} />
        <GoalAchievements marks={marks} goalEndDate={goal.endDate} />
      </main>

      {showMenu && (
        <ObjectiveMenu 
          goal={goal} 
          onClose={() => setShowMenu(false)} 
          onUpdate={reload}
          onDelete={() => navigate('/', { replace: true })}
          onOpenDateModal={(mode) => {
            setShowMenu(false);
            setDateModalMode(mode);
          }}
        />
      )}

      {dateModalMode && (
        <EditDateModal
          goal={goal}
          initialMode={dateModalMode}
          onClose={() => setDateModalMode(null)}
          onSuccess={() => {
            setDateModalMode(null);
            reload();
          }}
        />
      )}
    </MobileLayout>
  );
}

function EditDateModal({
  goal,
  initialMode,
  onClose,
  onSuccess
}: {
  goal: any;
  initialMode: 'start' | 'end' | 'both';
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [startDate, setStartDate] = useState(goal.startDate);
  const [endDate, setEndDate] = useState(goal.endDate);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const durationDays = startDate && endDate ? getDiffDaysLocal(startDate, endDate) + 1 : 0;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setError('Por favor, informe ambas as datas.');
      return;
    }
    if (startDate > endDate) {
      setError('A data de início não pode ser posterior ao prazo final.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await domainService.updateGoal(goal.id, {
        startDate,
        endDate
      });
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError('Ocorreu um erro ao salvar as datas.');
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => !isSubmitting && onClose()}
    >
      <div 
        className="w-full max-w-[340px] sm:max-w-[360px] bg-white dark:bg-[#1c1c1e] border border-black/5 dark:border-white/10 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-300">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">
              {initialMode === 'start' ? 'Data de início' : initialMode === 'end' ? 'Prazo final' : 'Datas do objetivo'}
            </h3>
            <p className="text-xs text-gray-400">
              {durationDays > 0 ? `${durationDays} ${durationDays === 1 ? 'dia' : 'dias'} de duração` : 'Período do objetivo'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-xl border border-red-100 dark:border-red-900/30">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400 uppercase pl-1">
              Data de início
            </label>
            <input
              type="date"
              value={startDate}
              max={endDate}
              autoFocus={initialMode === 'start'}
              disabled={isSubmitting}
              onChange={e => {
                setStartDate(e.target.value);
                if (error) setError(null);
              }}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-base text-gray-900 dark:text-gray-100 outline-none focus:border-gray-900 dark:focus:border-gray-300 transition-all font-medium"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400 uppercase pl-1">
              Prazo final
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              autoFocus={initialMode === 'end'}
              disabled={isSubmitting}
              onChange={e => {
                setEndDate(e.target.value);
                if (error) setError(null);
              }}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-base text-gray-900 dark:text-gray-100 outline-none focus:border-gray-900 dark:focus:border-gray-300 transition-all font-medium"
            />
          </div>

          <div className="flex gap-2.5 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-2xl active:scale-[0.98] transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 text-sm font-semibold text-white bg-gray-900 dark:bg-white dark:text-black rounded-2xl active:scale-[0.98] transition-all disabled:opacity-50 shadow-sm"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ObjectiveMenu({ 
  goal, 
  onClose, 
  onUpdate, 
  onDelete,
  onOpenDateModal
}: { 
  goal: any;
  onClose: () => void; 
  onUpdate: () => void; 
  onDelete: () => void;
  onOpenDateModal: (mode: 'start' | 'end' | 'both') => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleComplete = async () => {
    if (confirm('Encerrar objetivo?')) {
      setIsSubmitting(true);
      await domainService.updateGoal(goal.id, { status: 'completed' });
      onUpdate();
      onClose();
    }
  };

  const handleConfirmDelete = async () => {
    setIsSubmitting(true);
    try {
      await domainService.deleteGoal(goal.id);
      setShowDeleteConfirm(false);
      onDelete();
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
        <div 
          className="bg-white dark:bg-gray-900 dark:border-gray-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 pb-12 sm:pb-6 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Opções</h3>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => onOpenDateModal('start')}
              className="w-full flex items-center justify-between px-4 py-4 rounded-2xl font-medium text-gray-900 dark:text-gray-100 active:bg-gray-100 dark:active:bg-gray-800 transition-colors"
            >
              <span>Alterar data de início</span>
              <span className="text-xs text-gray-400 font-semibold">{formatDateFull(goal.startDate)}</span>
            </button>
            <button
              onClick={() => onOpenDateModal('end')}
              className="w-full flex items-center justify-between px-4 py-4 rounded-2xl font-medium text-gray-900 dark:text-gray-100 active:bg-gray-100 dark:active:bg-gray-800 transition-colors"
            >
              <span>Alterar prazo final</span>
              <span className="text-xs text-gray-400 font-semibold">{formatDateFull(goal.endDate)}</span>
            </button>
            {goal.status === 'active' && (
              <button
                onClick={handleComplete}
                className="w-full text-left px-4 py-4 rounded-2xl font-medium text-gray-900 dark:text-gray-100 active:bg-gray-100 dark:active:bg-gray-800 transition-colors"
              >
                Marcar como concluído
              </button>
            )}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full text-left px-4 py-4 rounded-2xl font-medium text-red-600 dark:text-red-400 active:bg-red-50 dark:active:bg-red-950/30 mt-3 transition-colors"
            >
              Excluir objetivo
            </button>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => !isSubmitting && setShowDeleteConfirm(false)}
        >
          <div 
            className="w-full max-w-[290px] sm:max-w-[310px] bg-white/85 dark:bg-[#1e1e1e]/85 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[20px] shadow-2xl overflow-hidden text-center animate-in zoom-in-95 duration-150 select-none"
            onClick={e => e.stopPropagation()}
          >
            <div className="pt-5 px-4 pb-4">
              <h4 className="text-[17px] font-semibold text-gray-900 dark:text-white leading-tight tracking-tight">
                Excluir objetivo?
              </h4>
              <p className="mt-1.5 text-[13px] text-gray-500 dark:text-gray-400 leading-normal font-normal">
                Todo o histórico e as tarefas vinculadas a este objetivo serão permanentemente removidos.
              </p>
            </div>

            <div className="border-t border-gray-200/80 dark:border-white/10 flex flex-col divide-y divide-gray-200/80 dark:divide-white/10">
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="w-full py-3 text-[17px] font-semibold text-red-600 dark:text-red-500 hover:bg-gray-100/60 dark:hover:bg-white/5 active:bg-gray-200/70 dark:active:bg-white/10 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Excluindo...' : 'Excluir'}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isSubmitting}
                className="w-full py-3 text-[17px] font-normal text-gray-800 dark:text-gray-200 hover:bg-gray-100/60 dark:hover:bg-white/5 active:bg-gray-200/70 dark:active:bg-white/10 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
