import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useObjectiveDetail } from '../hooks/useObjectives';
import { MobileLayout, cn } from '../components/MobileLayout';
import { ArrowLeft, MoreHorizontal, X as CloseIcon } from 'lucide-react';
import { getDaysInRange, getTodayLocal, formatDisplayMonth, getMonthStartOffset, parseLocal, getDaysInMonth, formatLocal } from '../utils/dates';
import { objectiveService } from '../services/objectiveService';
import { motion, AnimatePresence } from 'motion/react';

export default function ObjectiveDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { objective, activities, loading, reload } = useObjectiveDetail(id);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  if (loading) return (
    <MobileLayout>
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen text-center px-4">
         <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-gray-900 animate-spin mb-4" />
      </div>
    </MobileLayout>
  );

  if (!objective) return null; // Or a loading/not found state

  const today = getTodayLocal();
  const activeDays = new Set(activities.map(a => a.date));
  const progressCount = activeDays.size;
  const totalDays = getDaysInRange(objective.startDate, objective.endDate).length;

  // Group days by month for rendering
  const renderCalendar = () => {
    // Generate months from start to end date
    const startObj = parseLocal(objective.startDate);
    const endObj = parseLocal(objective.endDate);
    
    let current = new Date(startObj.getFullYear(), startObj.getMonth(), 1);
    const endMonth = new Date(endObj.getFullYear(), endObj.getMonth(), 1);
    
    const months: string[] = [];
    while (current <= endMonth) {
      months.push(formatLocal(current).substring(0, 7) + '-01');
      current.setMonth(current.getMonth() + 1);
    }

    return months.map(monthStr => {
      const monthTitle = formatDisplayMonth(monthStr);
      const daysInMonth = getDaysInMonth(monthStr);
      const startOffset = getMonthStartOffset(monthStr);
      
      const blanks = Array.from({ length: startOffset }, (_, i) => <div key={`blank-${i}`} className="h-12" />);
      
      const days = Array.from({ length: daysInMonth }, (_, i) => {
        const dayNum = i + 1;
        const dStr = `${monthStr.substring(0, 7)}-${String(dayNum).padStart(2, '0')}`;
        
        const isOutOfRange = dStr < objective.startDate || dStr > objective.endDate;
        const isToday = dStr === today;
        const isDone = activeDays.has(dStr);
        
        if (isOutOfRange) {
          return <div key={dStr} className="h-12 flex items-center justify-center text-transparent">.</div>;
        }

        return (
          <button
            key={dStr}
            onClick={() => {
               if (objective.status === 'active' || isDone) {
                 setSelectedDate(dStr);
               }
            }}
            className={cn(
              "relative h-12 flex items-center justify-center rounded-xl",
              isToday ? "bg-gray-100" : "active:bg-gray-50",
            )}
          >
            <span className={cn("text-[15px] font-medium z-10", isToday ? "text-gray-900" : "text-gray-500")}>
              {dayNum}
            </span>
            <AnimatePresence>
              {isDone && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute inset-0 flex items-center justify-center text-red-500 z-0"
                >
                  <CloseIcon className="w-9 h-9 stroke-[3]" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        );
      });

      return (
        <div key={monthStr} className="mb-8">
          <h4 className="text-xs font-bold tracking-widest text-center text-gray-400 mb-6">{monthTitle}</h4>
          <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-400 mb-2">
            <div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div><div>Dom</div>
          </div>
          <div className="grid grid-cols-7 gap-y-2">
            {blanks}
            {days}
          </div>
        </div>
      );
    });
  };

  return (
    <MobileLayout>
      <header className="flex items-center justify-between px-4 py-4 sticky top-0 bg-[#f9fafb]/90 backdrop-blur-md z-20">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-900 active:bg-gray-200 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <button onClick={() => setShowMenu(true)} className="p-2 -mr-2 text-gray-900 active:bg-gray-200 rounded-full transition-colors">
          <MoreHorizontal className="w-6 h-6" />
        </button>
      </header>

      <main className="px-6 pb-32">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2 leading-tight">{objective.title}</h1>
          <div className="text-gray-500 font-medium">
            {formatLocal(parseLocal(objective.startDate)).split('-').reverse().join('/')} &mdash; {formatLocal(parseLocal(objective.endDate)).split('-').reverse().join('/')}
            <span className="mx-2">•</span>
            {totalDays} dias
          </div>
        </div>

        <div className="calendar-container">
          {renderCalendar()}
        </div>
      </main>

      {/* Progress Summary fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#f9fafb] via-[#f9fafb] to-transparent pointer-events-none flex justify-center z-20">
        <div className="w-full max-w-md bg-white rounded-2xl p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] border border-gray-100 pointer-events-auto">
          <div className="text-sm font-semibold text-gray-900 mb-2 text-center">
            {progressCount} de {totalDays} dias realizados
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gray-900 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, (progressCount / totalDays) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedDate && (
          <ActivitySheet 
            date={selectedDate} 
            objective={objective} 
            activities={activities.filter(a => a.date === selectedDate)}
            onClose={() => setSelectedDate(null)}
            onProgress={() => reload()}
          />
        )}
        
        {showMenu && (
          <ObjectiveMenu 
            objective={objective}
            onClose={() => setShowMenu(false)}
            onUpdate={() => reload()}
            onDelete={() => navigate('/', { replace: true })}
          />
        )}
      </AnimatePresence>
    </MobileLayout>
  );
}

function ActivitySheet({ date, objective, activities, onClose, onProgress }: { date: string, objective: any, activities: any[], onClose: () => void, onProgress: () => void }) {
  const [note, setNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDone = activities.length > 0;

  const handleMark = async () => {
    setIsSubmitting(true);
    try {
      await objectiveService.addActivity(objective.id, date, note.trim() || undefined);
      onProgress();
      setNote('');
      setIsAdding(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await objectiveService.deleteActivity(id);
      onProgress();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 flex flex-col mx-auto max-w-md shadow-2xl max-h-[90vh]"
      >
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 mb-5" />
        <div className="px-6 pb-8 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-1">
            {parseInt(date.split('-')[2], 10)} de {formatDisplayMonth(date).split(' ')[0].toLowerCase()}
          </h2>
          
          {isDone ? (
            <div className="mt-6">
              <div className="flex items-center gap-2 text-red-600 font-semibold mb-4">
                <CloseIcon className="w-5 h-5 stroke-[3]" />
                <span>Progresso realizado</span>
              </div>
              
              <h3 className="text-sm font-semibold text-gray-500 mb-3">Atividades</h3>
              <div className="flex flex-col gap-3">
                {activities.map(act => (
                  <div key={act.id} className="bg-gray-50 rounded-xl p-4 flex justify-between items-start group">
                    <span className="text-gray-900 leading-snug">{act.description || "Progresso confirmado"}</span>
                    {objective.status === 'active' && (
                      <button onClick={() => handleRemove(act.id)} className="text-gray-400 hover:text-red-500 p-1">
                         <CloseIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {objective.status === 'active' && !isAdding && (
                <button 
                  onClick={() => setIsAdding(true)}
                  className="mt-4 text-sm font-medium text-gray-500 py-2 w-full text-left"
                >
                  + Adicionar outra atividade
                </button>
              )}
            </div>
          ) : (
            <div className="mt-6">
              <p className="text-lg font-medium text-gray-900 mb-6">
                Hoje você fez algo relacionado a este objetivo?
              </p>
              
              {objective.status === 'active' && (
                <button
                  onClick={() => handleMark()}
                  disabled={isSubmitting}
                  className="w-full bg-red-500 text-white font-medium text-lg py-4 rounded-2xl active:scale-95 transition-transform shadow-sm disabled:opacity-50 disabled:active:scale-100"
                >
                  {isSubmitting ? 'Marcando...' : 'Marcar progresso'}
                </button>
              )}
              
              {!isAdding && objective.status === 'active' && (
                <button 
                  onClick={() => setIsAdding(true)}
                  disabled={isSubmitting}
                  className="mt-6 text-sm font-medium text-gray-500 block text-center w-full disabled:opacity-50"
                >
                  Registrar atividade específica
                </button>
              )}
            </div>
          )}

          {isAdding && (
            <div className="mt-6 animate-in fade-in slide-in-from-bottom-4">
              <label className="text-sm font-medium text-gray-500 block mb-2">O que você fez?</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                autoFocus
                disabled={isSubmitting}
                placeholder="Ex: Pesquisei 10 concorrentes"
                className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:border-gray-900 min-h-[100px] resize-none disabled:opacity-50"
              />
              <div className="flex gap-3 mt-4">
                <button 
                  onClick={() => setIsAdding(false)}
                  disabled={isSubmitting}
                  className="flex-1 py-3 font-medium text-gray-600 bg-gray-100 rounded-xl disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleMark}
                  disabled={isSubmitting}
                  className="flex-1 py-3 font-medium text-white bg-gray-900 rounded-xl disabled:opacity-50"
                >
                  {isSubmitting ? 'Registrando...' : 'Registrar'}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

function ObjectiveMenu({ objective, onClose, onUpdate, onDelete }: { objective: any, onClose: () => void, onUpdate: () => void, onDelete: () => void }) {
  const [showEditEnd, setShowEditEnd] = useState(false);
  const [newEnd, setNewEnd] = useState(objective.endDate);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdateEnd = async () => {
    if (newEnd >= objective.startDate) {
      setIsSubmitting(true);
      try {
        await objectiveService.updateObjective(objective.id, { endDate: newEnd });
        onUpdate();
        onClose();
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleComplete = async () => {
    if (confirm('Encerrar objetivo? Você poderá continuar visualizando seu progresso, mas não poderá registrar novas atividades.')) {
      setIsSubmitting(true);
      try {
        await objectiveService.updateObjective(objective.id, { status: 'completed' });
        onUpdate();
        onClose();
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDelete = async () => {
    if (confirm('Excluir objetivo? Todo o histórico desse objetivo será removido. Essa ação não pode ser desfeita.')) {
      setIsSubmitting(true);
      try {
        await objectiveService.deleteObjective(objective.id);
        onDelete();
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed top-16 right-4 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 origin-top-right flex flex-col"
      >
        {showEditEnd ? (
          <div className="p-4">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Alterar data final</label>
            <input 
              type="date"
              value={newEnd}
              onChange={e => setNewEnd(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowEditEnd(false)} className="px-3 py-1.5 text-sm font-medium text-gray-600">Cancelar</button>
              <button onClick={handleUpdateEnd} className="px-3 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-lg">Salvar</button>
            </div>
          </div>
        ) : (
          <>
            <button 
              onClick={() => setShowEditEnd(true)}
              className="px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100"
            >
              Alterar data final
            </button>
            {objective.status === 'active' && (
              <button 
                onClick={handleComplete}
                className="px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100"
              >
                Encerrar objetivo
              </button>
            )}
            <div className="h-px bg-gray-100 my-1" />
            <button 
              onClick={handleDelete}
              className="px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 active:bg-red-100"
            >
              Excluir objetivo
            </button>
          </>
        )}
      </motion.div>
    </>
  );
}
