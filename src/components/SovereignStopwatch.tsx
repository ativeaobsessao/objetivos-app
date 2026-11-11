import React, { useState, useEffect, useRef } from 'react';
import { useStopwatch } from '../contexts/StopwatchContext';
import { Play, Pause, RotateCcw, X, Minimize2, Maximize2, GripHorizontal } from 'lucide-react';

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

  // Estados de arrasto (drag & drop) para a mini-cápsula
  // Guardamos a posição em pixels (x, y)
  const [capsulePos, setCapsulePos] = useState<{ x: number; y: number } | null>(null);
  const isDraggingCapsuleRef = useRef(false);
  const dragStartPosRef = useRef<{ clientX: number; clientY: number; startX: number; startY: number } | null>(null);
  const hasDraggedRef = useRef(false);

  // Estados de arrasto para a janela expandida (especialmente útil em desktop e tablets)
  const [expandedOffset, setExpandedOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingModalRef = useRef(false);
  const modalDragStartRef = useRef<{ clientX: number; clientY: number; startX: number; startY: number } | null>(null);

  // Inicializar posição da cápsula no topo central com padding seguro
  useEffect(() => {
    if (typeof window !== 'undefined' && capsulePos === null) {
      // Posicionar inicialmente no topo central
      const defaultY = 20; // 20px do topo (respeita notch de celulares)
      const defaultX = Math.max(16, (window.innerWidth - 220) / 2);
      setCapsulePos({ x: defaultX, y: defaultY });
    }
  }, [capsulePos]);

  // Listener para redimensionamento de janela (manter dentro da viewport)
  useEffect(() => {
    const handleResize = () => {
      setCapsulePos(prev => {
        if (!prev) return null;
        const maxX = window.innerWidth - 200;
        const maxY = window.innerHeight - 60;
        return {
          x: Math.min(Math.max(12, prev.x), Math.max(12, maxX)),
          y: Math.min(Math.max(12, prev.y), Math.max(12, maxY))
        };
      });
      // Resetar offset do modal se a tela mudar drasticamente
      setExpandedOffset(prev => {
        const maxOffset = window.innerWidth < 640 ? 40 : 200;
        return {
          x: Math.min(Math.max(-maxOffset, prev.x), maxOffset),
          y: Math.min(Math.max(-maxOffset, prev.y), maxOffset)
        };
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // --- Handlers de Arraste da Mini-Cápsula (Touch e Mouse) ---
  const handleCapsulePointerDown = (e: React.PointerEvent) => {
    isDraggingCapsuleRef.current = true;
    hasDraggedRef.current = false;
    const currentX = capsulePos ? capsulePos.x : (window.innerWidth - 220) / 2;
    const currentY = capsulePos ? capsulePos.y : 20;

    dragStartPosRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startX: currentX,
      startY: currentY
    };

    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handleCapsulePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingCapsuleRef.current || !dragStartPosRef.current) return;

    const deltaX = e.clientX - dragStartPosRef.current.clientX;
    const deltaY = e.clientY - dragStartPosRef.current.clientY;

    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      hasDraggedRef.current = true;
    }

    const newX = dragStartPosRef.current.startX + deltaX;
    const newY = dragStartPosRef.current.startY + deltaY;

    // Confinar dentro da tela com margens de segurança para celular e desktop
    const minX = 12;
    const maxX = window.innerWidth - 210;
    const minY = 12;
    const maxY = window.innerHeight - 56;

    setCapsulePos({
      x: Math.min(Math.max(minX, newX), Math.max(minX, maxX)),
      y: Math.min(Math.max(minY, newY), Math.max(minY, maxY))
    });
  };

  const handleCapsulePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingCapsuleRef.current) return;
    isDraggingCapsuleRef.current = false;
    dragStartPosRef.current = null;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);

    // Se foi apenas um toque/clique sem arrastar, abre a janela expandida
    if (!hasDraggedRef.current) {
      setIsExpanded(true);
    }
  };

  // --- Handlers de Arraste do Modal Expandido ---
  const handleModalPointerDown = (e: React.PointerEvent) => {
    isDraggingModalRef.current = true;
    modalDragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startX: expandedOffset.x,
      startY: expandedOffset.y
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handleModalPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingModalRef.current || !modalDragStartRef.current) return;

    const deltaX = e.clientX - modalDragStartRef.current.clientX;
    const deltaY = e.clientY - modalDragStartRef.current.clientY;

    // Em celular, limitamos o movimento para a janela nunca fugir da vista
    const isMobile = window.innerWidth < 640;
    const maxBoundX = isMobile ? (window.innerWidth * 0.25) : (window.innerWidth * 0.4);
    const maxBoundY = isMobile ? (window.innerHeight * 0.25) : (window.innerHeight * 0.4);

    const targetX = modalDragStartRef.current.startX + deltaX;
    const targetY = modalDragStartRef.current.startY + deltaY;

    setExpandedOffset({
      x: Math.min(Math.max(-maxBoundX, targetX), maxBoundX),
      y: Math.min(Math.max(-maxBoundY, targetY), maxBoundY)
    });
  };

  const handleModalPointerUp = (e: React.PointerEvent) => {
    isDraggingModalRef.current = false;
    modalDragStartRef.current = null;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  return (
    <>
      {/* 1. MODO MINI-CÁPSULA SOBERANA FLUTUANTE E ARRASTÁVEL LIVREMENTE */}
      {!isExpanded && (
        <div
          style={{
            position: 'fixed',
            left: `${capsulePos ? capsulePos.x : 16}px`,
            top: `${capsulePos ? capsulePos.y : 20}px`,
            touchAction: 'none'
          }}
          className="z-[80] select-none transition-shadow"
        >
          <div
            onPointerDown={handleCapsulePointerDown}
            onPointerMove={handleCapsulePointerMove}
            onPointerUp={handleCapsulePointerUp}
            onPointerCancel={handleCapsulePointerUp}
            className="flex items-center gap-2.5 bg-black/90 dark:bg-[#1a1a1c]/95 text-white backdrop-blur-2xl pl-3 pr-3.5 py-2 rounded-full shadow-2xl border border-white/15 cursor-grab active:cursor-grabbing active:scale-95 transition-transform hover:border-white/30 group ring-1 ring-black/10"
            title="Arraste para reposicionar ou toque para expandir"
          >
            {/* Ícone de alça de arraste sutil */}
            <div className="flex items-center text-gray-500 group-hover:text-gray-300 transition-colors">
              <GripHorizontal className="w-3.5 h-3.5" />
            </div>

            {/* Mini relógio indicador animado */}
            <div className="relative w-4 h-4 rounded-full border border-emerald-500/60 flex items-center justify-center shrink-0">
              <div 
                className="absolute top-1/2 left-1/2 w-0.5 h-1.5 bg-emerald-400 origin-bottom rounded-full -translate-x-1/2 -translate-y-full"
                style={{ transform: `translate(-50%, -100%) rotate(${rotationDeg}deg)` }}
              />
              <div className="w-1 h-1 rounded-full bg-emerald-400" />
            </div>

            <span className="font-mono text-sm font-bold tracking-wider text-emerald-300 tabular-nums">
              {compactTime}
            </span>

            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-white/10 px-1.5 py-0.5 rounded-full">
              {isRunning ? 'Ativo' : 'Pausa'}
            </span>

            <Maximize2 className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors shrink-0" />
          </div>
        </div>
      )}

      {/* 2. MODO IMERSIVO COMPLETO SOBERANO E ARRASTÁVEL */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-2xl animate-in fade-in duration-200 overflow-hidden"
          onClick={() => {}}
        >
          <div 
            style={{
              transform: `translate(${expandedOffset.x}px, ${expandedOffset.y}px)`,
              transition: isDraggingModalRef.current ? 'none' : 'transform 0.15s ease-out'
            }}
            className="w-full max-w-[340px] sm:max-w-[380px] bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-[32px] p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-150 select-none flex flex-col items-center relative touch-none"
            onClick={e => e.stopPropagation()}
          >
            {/* Barra de Arraste Superior (Mobile-First Handle) */}
            <div 
              onPointerDown={handleModalPointerDown}
              onPointerMove={handleModalPointerMove}
              onPointerUp={handleModalPointerUp}
              onPointerCancel={handleModalPointerUp}
              className="w-full pt-1 pb-3 flex flex-col items-center cursor-grab active:cursor-grabbing group"
              title="Arraste para mover o cronômetro"
            >
              <div className="w-10 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700 group-hover:bg-gray-400 dark:group-hover:bg-gray-600 transition-colors" />
            </div>

            {/* Cabeçalho do modal */}
            <div className="w-full flex items-center justify-between mb-1">
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                title="Minimizar para cápsula flutuante"
              >
                <Minimize2 className="w-5 h-5" />
              </button>

              <div 
                onPointerDown={handleModalPointerDown}
                onPointerMove={handleModalPointerMove}
                onPointerUp={handleModalPointerUp}
                onPointerCancel={handleModalPointerUp}
                className="flex items-center gap-1.5 cursor-grab active:cursor-grabbing px-3 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                  Cronômetro
                </span>
              </div>

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
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 my-3 flex items-center justify-center">
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
                <div className="w-1 h-[82px] sm:h-[94px] mt-6 sm:mt-7 bg-gradient-to-t from-emerald-500 to-green-400 rounded-full shadow-sm" />
              </div>

              {/* Centro do mostrador */}
              <div className="relative z-10 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-[#1c1c1e] shadow-md" />

              {/* Tempo Digital Centralizado em Destaque */}
              <div className="absolute bottom-7 sm:bottom-8 left-0 right-0 text-center">
                <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white tabular-nums drop-shadow-sm">
                  {formattedTime}
                </span>
              </div>
            </div>

            {/* Painel de Controles Ergonômicos */}
            <div className="w-full flex items-center justify-between gap-2.5 sm:gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-white/10">
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
