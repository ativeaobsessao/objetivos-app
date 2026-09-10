import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGoalView } from '../hooks/useDomain';
import { domainService } from '../services/domainService';
import { MobileLayout } from '../components/MobileLayout';
import { ArrowLeft, MoreHorizontal } from 'lucide-react';
import { formatLocal, parseLocal } from '../utils/dates';
import { GoalTasks } from '../components/GoalTasks';
import { GoalCalendar } from '../components/GoalCalendar';
import { UserMenu } from '../components/UserMenu';

export default function ObjectiveDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { goal, tasks, marks, loading, reload } = useGoalView(id);
  const [showMenu, setShowMenu] = useState(false);

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
          <button onClick={() => navigate('/')} className="mt-4 text-gray-900 font-medium">Voltar</button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout className="p-6">
      <header className="flex justify-between items-start py-4 mb-6">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 text-gray-900 active:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <UserMenu />
          <button onClick={() => setShowMenu(true)} className="p-2 -mr-2 text-gray-900 active:bg-gray-100 rounded-full transition-colors">
            <MoreHorizontal className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Goal Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 leading-tight tracking-tight mb-6">
            {goal.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100">
              <span className="font-bold tracking-widest text-gray-400 uppercase text-xs">Início</span>
              <span className="font-medium text-gray-900">{parseLocal(goal.startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')}</span>
            </div>
            
            <div className="flex items-center gap-2 bg-red-50 px-4 py-2.5 rounded-xl border border-red-100">
              <span className="font-bold tracking-widest text-red-400 uppercase text-xs">Prazo final</span>
              <span className="font-bold text-red-700">{parseLocal(goal.endDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')}</span>
            </div>
          </div>
        </div>

        <GoalTasks goalId={goal.id} tasks={tasks} onUpdate={reload} />

        <GoalCalendar goal={goal} marks={marks} tasks={tasks} onUpdate={reload} />

      </main>

      {showMenu && (
        <ObjectiveMenu 
          goal={goal} 
          onClose={() => setShowMenu(false)} 
          onUpdate={reload}
          onDelete={() => navigate('/', { replace: true })}
        />
      )}
    </MobileLayout>
  );
}

function ObjectiveMenu({ goal, onClose, onUpdate, onDelete }: { goal: any, onClose: () => void, onUpdate: () => void, onDelete: () => void }) {
  const [showEditEnd, setShowEditEnd] = useState(false);
  const [newEnd, setNewEnd] = useState(goal.endDate);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdateEnd = async () => {
    if (newEnd >= goal.startDate) {
      setIsSubmitting(true);
      await domainService.updateGoal(goal.id, { endDate: newEnd });
      onUpdate();
      onClose();
    }
  };

  const handleComplete = async () => {
    if (confirm('Encerrar objetivo?')) {
      setIsSubmitting(true);
      await domainService.updateGoal(goal.id, { status: 'completed' });
      onUpdate();
      onClose();
    }
  };

  const handleDelete = async () => {
    if (confirm('Excluir objetivo? Todo o histórico desse objetivo será removido.')) {
      setIsSubmitting(true);
      await domainService.deleteGoal(goal.id);
      onDelete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 pb-12 sm:pb-6 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Opções</h3>
        </div>

        {showEditEnd ? (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm text-gray-500 mb-2 block">Nova data de término</label>
              <input
                type="date"
                value={newEnd}
                min={goal.startDate}
                disabled={isSubmitting}
                onChange={e => setNewEnd(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 outline-none focus:border-gray-900"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowEditEnd(false)} disabled={isSubmitting} className="flex-1 py-4 font-medium text-gray-600 bg-gray-100 rounded-2xl">Cancelar</button>
              <button onClick={handleUpdateEnd} disabled={isSubmitting} className="flex-1 py-4 font-medium text-white bg-gray-900 rounded-2xl">Salvar</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setShowEditEnd(true)}
              className="w-full text-left px-4 py-4 rounded-2xl font-medium text-gray-900 active:bg-gray-100"
            >
              Alterar data de término
            </button>
            {goal.status === 'active' && (
              <button
                onClick={handleComplete}
                className="w-full text-left px-4 py-4 rounded-2xl font-medium text-gray-900 active:bg-gray-100"
              >
                Marcar como concluído
              </button>
            )}
            <button
              onClick={handleDelete}
              className="w-full text-left px-4 py-4 rounded-2xl font-medium text-red-600 active:bg-red-50 mt-4"
            >
              Excluir objetivo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
