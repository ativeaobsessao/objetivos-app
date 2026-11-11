import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface StopwatchContextType {
  isActive: boolean;
  isRunning: boolean;
  elapsedMs: number;
  isExpanded: boolean;
  startStopwatch: () => void;
  pauseStopwatch: () => void;
  resumeStopwatch: () => void;
  resetAndRestart: () => void;
  stopStopwatch: () => void;
  setIsExpanded: (expanded: boolean) => void;
}

const StopwatchContext = createContext<StopwatchContextType | undefined>(undefined);

const STORAGE_KEY = 'app_stopwatch_state';

interface StoredState {
  isActive: boolean;
  isRunning: boolean;
  elapsedMs: number;
  lastTimestamp: number | null;
}

export function StopwatchProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Carregar estado salvo ao iniciar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: StoredState = JSON.parse(stored);
        if (parsed.isActive) {
          setIsActive(true);
          let currentElapsed = parsed.elapsedMs;
          if (parsed.isRunning && parsed.lastTimestamp) {
            const diff = Date.now() - parsed.lastTimestamp;
            currentElapsed += diff;
            setIsRunning(true);
          } else {
            setIsRunning(false);
          }
          setElapsedMs(currentElapsed);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Salvar estado para persistência contínua
  useEffect(() => {
    try {
      const stateToStore: StoredState = {
        isActive,
        isRunning,
        elapsedMs,
        lastTimestamp: isRunning ? Date.now() : null
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToStore));
    } catch (e) {
      console.error(e);
    }
  }, [isActive, isRunning, elapsedMs]);

  // Loop de contagem suave de alta precisão
  useEffect(() => {
    if (isRunning) {
      lastTimeRef.current = performance.now();
      const update = (now: number) => {
        if (lastTimeRef.current !== null) {
          const delta = now - lastTimeRef.current;
          setElapsedMs(prev => prev + delta);
        }
        lastTimeRef.current = now;
        requestRef.current = requestAnimationFrame(update);
      };
      requestRef.current = requestAnimationFrame(update);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      lastTimeRef.current = null;
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isRunning]);

  const startStopwatch = () => {
    setElapsedMs(0);
    setIsActive(true);
    setIsRunning(true);
    setIsExpanded(true);
    if (navigator.vibrate) navigator.vibrate(25);
  };

  const pauseStopwatch = () => {
    setIsRunning(false);
    if (navigator.vibrate) navigator.vibrate(20);
  };

  const resumeStopwatch = () => {
    setIsRunning(true);
    if (navigator.vibrate) navigator.vibrate(20);
  };

  const resetAndRestart = () => {
    setElapsedMs(0);
    setIsActive(true);
    setIsRunning(true);
    if (navigator.vibrate) navigator.vibrate([20, 40, 20]);
  };

  const stopStopwatch = () => {
    setIsActive(false);
    setIsRunning(false);
    setElapsedMs(0);
    setIsExpanded(false);
    localStorage.removeItem(STORAGE_KEY);
    if (navigator.vibrate) navigator.vibrate(30);
  };

  return (
    <StopwatchContext.Provider
      value={{
        isActive,
        isRunning,
        elapsedMs,
        isExpanded,
        startStopwatch,
        pauseStopwatch,
        resumeStopwatch,
        resetAndRestart,
        stopStopwatch,
        setIsExpanded
      }}
    >
      {children}
    </StopwatchContext.Provider>
  );
}

export function useStopwatch() {
  const context = useContext(StopwatchContext);
  if (!context) {
    throw new Error('useStopwatch deve ser usado dentro de um StopwatchProvider');
  }
  return context;
}
