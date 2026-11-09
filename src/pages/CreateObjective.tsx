import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { domainService } from '../services/domainService';
import { MobileLayout } from '../components/MobileLayout';
import { ArrowLeft, ChevronRight, Activity, Calendar } from 'lucide-react';
import { getTodayLocal, addDaysLocal, getDiffDaysLocal } from '../utils/dates';

export default function CreateObjective() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(getTodayLocal());
  const [endDate, setEndDate] = useState(addDaysLocal(getTodayLocal(), 29)); // 30 days total inclusive
  
  const [cadenceType, setCadenceType] = useState<'daily' | 'weekly_peaks'>('daily');
  const [weeklyPeaksTarget, setWeeklyPeaksTarget] = useState<number>(3);
  const [showRhythmModal, setShowRhythmModal] = useState(false);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const totalDays = getDiffDaysLocal(startDate, endDate) + 1; // +1 to be inclusive
  const totalWeeks = Math.max(1, Math.ceil(totalDays / 7));
  const estimatedPeaks = cadenceType === 'weekly_peaks' ? totalWeeks * weeklyPeaksTarget : totalDays;

  const handleSave = async () => {
    if (!title.trim()) {
      setError('O objetivo não pode ficar vazio.');
      return;
    }
    if (endDate < startDate) {
      setError('A data final não pode ser anterior à data inicial.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const newGoal = await domainService.createGoal(
        title.trim(), 
        startDate, 
        endDate,
        cadenceType,
        cadenceType === 'weekly_peaks' ? weeklyPeaksTarget : undefined
      );
      navigate(`/objective/${newGoal.id}`, { replace: true });
    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro ao salvar o objetivo.');
      setIsSubmitting(false);
    }
  };

  return (
    <MobileLayout className="p-6">
      <header className="flex items-center gap-4 py-4 mb-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-900 dark:text-gray-100 active:bg-gray-100 dark:active:bg-gray-800 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Novo objetivo</h1>
      </header>

      <main className="flex-1 flex flex-col gap-6">
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-500 pl-1">O que você quer realizar?</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            placeholder="Ex: Correr no parque"
            className="w-full text-lg bg-white dark:bg-gray-900 dark:border-gray-800 border border-gray-200 rounded-2xl px-4 py-4 outline-none focus:border-gray-900 dark:focus:border-gray-300 transition-all placeholder:text-gray-300 shadow-sm disabled:opacity-50 text-gray-900 dark:text-gray-100"
            autoFocus
          />
        </div>

        {/* Seletor Ritmo do Objetivo */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-500 pl-1">Ritmo do Objetivo</label>
          <button
            type="button"
            onClick={() => setShowRhythmModal(true)}
            className="w-full flex items-center justify-between bg-white dark:bg-gray-900 dark:border-gray-800 border border-gray-200 rounded-2xl px-4 py-4 outline-none active:scale-[0.99] transition-all shadow-sm text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-300">
                <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-base text-gray-900 dark:text-gray-100">
                  {cadenceType === 'daily' ? 'Diário' : `Picos Semanais (${weeklyPeaksTarget}x por semana)`}
                </span>
                <span className="text-xs text-gray-400">
                  {cadenceType === 'daily'
                    ? 'Praticado todos os dias da semana'
                    : `Meta total estimada de ${estimatedPeaks} picos`}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-gray-400 group-hover:text-gray-600">
              <span className="text-xs font-semibold hidden sm:inline">Alterar</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>
        </div>

        <div className="flex flex-col gap-2 mt-1">
          <label className="text-sm font-medium text-gray-500 pl-1">Data de início</label>
          <input
            type="date"
            value={startDate}
            disabled={isSubmitting}
            onChange={(e) => {
              setStartDate(e.target.value);
              setEndDate(addDaysLocal(e.target.value, 29));
            }}
            className="w-full text-base bg-white dark:bg-gray-900 dark:border-gray-800 border border-gray-200 rounded-2xl px-4 py-4 outline-none focus:border-gray-900 dark:focus:border-gray-300 transition-all shadow-sm disabled:opacity-50 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-end pl-1">
            <label className="text-sm font-medium text-gray-500">Data de término</label>
            <span className="text-xs text-gray-400">Duração: {totalDays > 0 ? totalDays : 0} dias</span>
          </div>
          <input
            type="date"
            value={endDate}
            disabled={isSubmitting}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full text-base bg-white dark:bg-gray-900 dark:border-gray-800 border border-gray-200 rounded-2xl px-4 py-4 outline-none focus:border-gray-900 dark:focus:border-gray-300 transition-all shadow-sm disabled:opacity-50 text-gray-900 dark:text-gray-100"
          />
        </div>

      </main>

      <footer className="mt-8 mb-4">
        <button
          onClick={handleSave}
          disabled={isSubmitting}
          className="w-full bg-gray-900 text-white font-medium text-lg py-4 rounded-2xl active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100 shadow-sm"
        >
          {isSubmitting ? 'Salvando...' : 'Criar objetivo'}
        </button>
      </footer>

      {/* Pop-up Modal Estilo Minimalista e Fluido: Ritmo do Objetivo */}
      {showRhythmModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowRhythmModal(false)}
        >
          <div 
            className="w-full max-w-[340px] sm:max-w-[370px] bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-[28px] p-6 shadow-2xl animate-in zoom-in-95 duration-150 select-none"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center mb-5">
              <h3 className="text-[19px] font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
                Ritmo do Objetivo
              </h3>
              <p className="mt-1 text-[13px] text-gray-500 dark:text-gray-400 font-normal">
                Como você deseja acompanhar este objetivo?
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {/* Opção 1: Diário */}
              <button
                type="button"
                onClick={() => setCadenceType('daily')}
                className={`w-full p-4 rounded-2xl text-left border transition-all ${
                  cadenceType === 'daily'
                    ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-white/10 ring-1 ring-gray-900/10'
                    : 'border-gray-200/80 dark:border-gray-800 bg-white dark:bg-transparent hover:bg-gray-50/50 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[15px] text-gray-900 dark:text-white">
                    Diário
                  </span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    cadenceType === 'daily' ? 'border-gray-900 dark:border-white' : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {cadenceType === 'daily' && <div className="w-2.5 h-2.5 rounded-full bg-gray-900 dark:bg-white" />}
                  </div>
                </div>
                <p className="text-[12px] text-gray-500 dark:text-gray-400 leading-snug">
                  Para compromissos que você pratica todos os dias.
                </p>
              </button>

              {/* Opção 2: Picos Semanais */}
              <button
                type="button"
                onClick={() => setCadenceType('weekly_peaks')}
                className={`w-full p-4 rounded-2xl text-left border transition-all ${
                  cadenceType === 'weekly_peaks'
                    ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-white/10 ring-1 ring-gray-900/10'
                    : 'border-gray-200/80 dark:border-gray-800 bg-white dark:bg-transparent hover:bg-gray-50/50 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[15px] text-gray-900 dark:text-white">
                    Picos Semanais
                  </span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    cadenceType === 'weekly_peaks' ? 'border-gray-900 dark:border-white' : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {cadenceType === 'weekly_peaks' && <div className="w-2.5 h-2.5 rounded-full bg-gray-900 dark:bg-white" />}
                  </div>
                </div>
                <p className="text-[12px] text-gray-500 dark:text-gray-400 leading-snug">
                  Você escolhe a frequência na semana com total liberdade nos dias.
                </p>
              </button>

              {/* Seletor de Frequência para Picos Semanais */}
              {cadenceType === 'weekly_peaks' && (
                <div className="mt-1 p-3.5 bg-gray-50 dark:bg-white/5 border border-gray-200/60 dark:border-white/10 rounded-2xl animate-in fade-in duration-150">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-[12px] font-semibold text-gray-600 dark:text-gray-300">
                      Picos por semana:
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {weeklyPeaksTarget}x na semana
                    </span>
                  </div>

                  <div className="grid grid-cols-6 gap-1.5">
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setWeeklyPeaksTarget(num)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all ${
                          weeklyPeaksTarget === num
                            ? 'bg-gray-900 text-white dark:bg-white dark:text-black shadow-sm scale-105'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 border border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        {num}x
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => setShowRhythmModal(false)}
                className="w-full py-3.5 text-[15px] font-semibold text-white bg-gray-900 dark:bg-white dark:text-black rounded-2xl active:scale-[0.98] transition-all shadow-sm"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}
