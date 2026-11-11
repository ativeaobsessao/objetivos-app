import React, { useState } from 'react';
import { useStopwatch } from '../contexts/StopwatchContext';
import { Play, Pause, RotateCcw, X, Minimize2, Maximize2 } from 'lucide-react';

export function SovereignStopwatch() {
  const {
    isActive,
    isRunning,
    elapsedMs,
    isExpanded,
    pauseStopwatch,
    resumeStopwatch,
    resetAndRestart,
    stopStopwatch,
    setIsExpanded
  } = useStopwatch();

  const [showConfirmClose, setShowConfirmClose] = useState(false);

  if (!isActive) return null;

  // Cálculos de tempo
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const hundredths = Math.floor((elapsedMs % 1000) / 10);
  const hours = Math.floor(minutes / 60);
  const displayMinutes = minutes % 60;

  const formattedTime = hours > 0
    ? `${String(hours).padStart(2, '0')}:${String(displayMinutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`
    : `${String(displayMinutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`;

  const compactTime = hours > 0
    ? `${String(hours).padStart(2, '0')}:${String(displayMinutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${String(displayMinutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Rotação do ponteiro: 360 graus por minuto (60.000 ms)
  const rotationDeg = ((elapsedMs % 60000) / 60000) * 360;

  return (
    <>
      {/* 1. MODO MINI-CÁPSULA SOBERANA FLUTUANTE (Quando minimizado) */}
      {!isExpanded && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[80] animate-in fade-in slide-in-from-top-4 duration-200 select-none">
          <div
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-3 bg-black/90 dark:bg-[#1a1a1c]/95 text-white backdrop-blur-2xl px-4 py-2 rounded-full shadow-2xl border border-white/10 cursor-pointer active:scale-95 transition-all hover:bg-black group"
          >
            {/* Mini relógio indicador animado */}
            <div className="relative w-4 h-4 rounded-full border border-emerald-500/50 flex items-center justify-center">
              <div 
                className="absolute top-1/2 left-1/2 w-0.5 h-1.5 bg-emerald-400 origin-bottom rounded-full -translate-x-1/2 -translate-y-full"
                style={{ transform: `translate(-50%, -100%) rotate(${rotationDeg}deg)` }}
              />
              <div className="w-1 h-1 rounded-full bg-emerald-400" />
            </div>

            <span className="font-mono text-sm font-semibold tracking-wider text-emerald-300">
              {compactTime}
            </span>

            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-white/10 px-2 py-0.5 rounded-full">
              {isRunning ? 'Ativo' : 'Pausa'}
            </span>

            <Maximize2 className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors" />
          </div>
        </div>
      )}

      {/* 2. MODO IMERSIVO COMPLETO SOBERANO */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-2xl animate-in fade-in duration-200"
          onClick={() => {}}
        >
          <div 
            className="w-full max-w-[340px] sm:max-w-[370px] bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-[32px] p-6 shadow-2xl animate-in zoom-in-95 duration-150 select-none flex flex-col items-center relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Cabeçalho do modal */}
            <div className="w-full flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                title="Minimizar"
              >
                <Minimize2 className="w-5 h-5" />
              </button>

              <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                Cronômetro
              </span>

              <button
                type="button"
                onClick={() => setShowConfirmClose(true)}
                className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                title="Fechar cronômetro"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mostrador Circular do Relógio Analógico/Digital */}
            <div className="relative w-60 h-60 my-4 flex items-center justify-center">
              {/* Aro do relógio com marcadores de minutos e segundos */}
              <div className="absolute inset-0 rounded-full border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02] shadow-inner" />

              {/* Traços dos 60 segundos com destaque a cada 5 segundos */}
              {Array.from({ length: 60 }).map((_, i) => {
                const isMajor = i % 5 === 0;
                return (
                  <div
                    key={i}
                    className="absolute inset-0 flex justify-center"
                    style={{ transform: `rotate(${i * 6}deg)` }}
                  >
                    <div 
                      className={`rounded-full ${
                        isMajor 
                          ? 'w-1 h-3 bg-gray-400 dark:bg-gray-500' 
                          : 'w-0.5 h-1.5 bg-gray-200 dark:bg-gray-700'
                      }`} 
                    />
                  </div>
                );
              })}

              {/* Ponteiro Analógico Esmeralda Animado em Tempo Real */}
              <div 
                className="absolute inset-0 flex justify-center origin-center transition-transform"
                style={{ 
                  transform: `rotate(${rotationDeg}deg)`,
                  transition: isRunning ? 'none' : 'transform 0.15s ease-out'
                }}
              >
                {/* Haste do ponteiro */}
                <div className="w-1 h-[88px] mt-7 bg-gradient-to-t from-emerald-500 to-green-400 rounded-full shadow-sm" />
              </div>

              {/* Centro do mostrador */}
              <div className="relative z-10 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-[#1c1c1e] shadow-md" />

              {/* Tempo Digital Centralizado em Destaque */}
              <div className="absolute bottom-8 left-0 right-0 text-center">
                <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white tabular-nums drop-shadow-sm">
                  {formattedTime}
                </span>
              </div>
            </div>

            {/* Painel de Controles Ergonômicos */}
            <div className="w-full flex items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-white/10">
              {/* Botão Zerar e Reiniciar */}
              <button
                type="button"
                onClick={resetAndRestart}
                className="flex-1 py-3 px-3 flex items-center justify-center gap-1.5 rounded-2xl bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/15 active:scale-95 transition-all text-xs font-semibold"
                title="Zera e começa a contar novamente"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Zerar</span>
              </button>

              {/* Botão Play / Pause de Destaque */}
              <button
                type="button"
                onClick={isRunning ? pauseStopwatch : resumeStopwatch}
                className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 rounded-2xl active:scale-95 transition-all text-sm font-bold shadow-sm ${
                  isRunning 
                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                    : 'bg-emerald-600 text-white hover:bg-emerald-500'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pausar</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Retomar</span>
                  </>
                )}
              </button>

              {/* Botão Cancelar / Encerrar */}
              <button
                type="button"
                onClick={() => setShowConfirmClose(true)}
                className="py-3 px-3.5 rounded-2xl bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 active:scale-95 transition-all text-xs font-semibold"
                title="Encerrar cronômetro"
              >
                <span>Encerrar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POP-UP MODAL DE DIÁLOGO DE CONFIRMAÇÃO DE ENCERRAMENTO */}
      {showConfirmClose && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowConfirmClose(false)}
        >
          <div 
            className="w-full max-w-[290px] sm:max-w-[310px] bg-white/90 dark:bg-[#1e1e1e]/90 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-[22px] shadow-2xl overflow-hidden text-center animate-in zoom-in-95 duration-150 select-none"
            onClick={e => e.stopPropagation()}
          >
            <div className="pt-5 px-4 pb-4">
              <h4 className="text-[17px] font-semibold text-gray-900 dark:text-white leading-tight tracking-tight">
                Encerrar cronômetro?
              </h4>
              <p className="mt-1.5 text-[13px] text-gray-500 dark:text-gray-400 leading-normal font-normal">
                A contagem atual ({compactTime}) será finalizada e o relógio será fechado.
              </p>
            </div>

            <div className="border-t border-gray-200/80 dark:border-white/10 flex flex-col divide-y divide-gray-200/80 dark:divide-white/10">
              <button
                type="button"
                onClick={() => {
                  setShowConfirmClose(false);
                  stopStopwatch();
                }}
                className="w-full py-3.5 text-[17px] font-semibold text-red-600 dark:text-red-500 hover:bg-gray-100/60 dark:hover:bg-white/5 active:bg-gray-200/70 dark:active:bg-white/10 transition-colors"
              >
                Encerrar
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmClose(false)}
                className="w-full py-3.5 text-[17px] font-normal text-gray-800 dark:text-gray-200 hover:bg-gray-100/60 dark:hover:bg-white/5 active:bg-gray-200/70 dark:active:bg-white/10 transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
