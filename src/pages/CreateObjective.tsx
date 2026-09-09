import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { objectiveService } from '../services/objectiveService';
import { MobileLayout } from '../components/MobileLayout';
import { ArrowLeft } from 'lucide-react';
import { getTodayLocal, addDaysLocal } from '../utils/dates';

export default function CreateObjective() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(getTodayLocal());
  const [endDate, setEndDate] = useState(addDaysLocal(getTodayLocal(), 29)); // 30 days total inclusive
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!title.trim()) {
      setError('O objetivo não pode ficar vazio.');
      return;
    }
    if (endDate < startDate) {
      setError('A data final não pode ser anterior à data inicial.');
      return;
    }
    
    objectiveService.createObjective(title.trim(), startDate, endDate);
    navigate('/', { replace: true });
  };

  return (
    <MobileLayout className="p-6">
      <header className="flex items-center gap-4 py-4 mb-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-900 active:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold">Novo objetivo</h1>
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
            placeholder="Ex: Criar minha primeira VSL"
            className="w-full text-lg bg-white border border-gray-200 rounded-2xl px-4 py-4 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all placeholder:text-gray-300 shadow-sm"
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <label className="text-sm font-medium text-gray-500 pl-1">Data de início</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              // auto update end date if not touched? The prompt says standard is 30 days.
              setEndDate(addDaysLocal(e.target.value, 29));
            }}
            className="w-full text-base bg-white border border-gray-200 rounded-2xl px-4 py-4 outline-none focus:border-gray-900 transition-all shadow-sm"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-end pl-1">
            <label className="text-sm font-medium text-gray-500">Data de término</label>
            <span className="text-xs text-gray-400">Período inicial: 30 dias</span>
          </div>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full text-base bg-white border border-gray-200 rounded-2xl px-4 py-4 outline-none focus:border-gray-900 transition-all shadow-sm"
          />
        </div>

      </main>

      <footer className="mt-8 mb-4">
        <button
          onClick={handleSave}
          className="w-full bg-gray-900 text-white font-medium text-lg py-4 rounded-2xl active:scale-95 transition-transform"
        >
          Criar objetivo
        </button>
      </footer>
    </MobileLayout>
  );
}
