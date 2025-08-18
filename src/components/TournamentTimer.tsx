"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocalStorage } from "../hooks/use-local-storage";

interface TournamentTimerProps {
  roundNumber: number;
  onTimeUp?: () => void;
  variant?: "floating" | "button";
}

interface TimerState {
  timeRemaining: number; // en milisegundos
  isRunning: boolean;
  isPaused: boolean;
  startTime: number | null;
  pausedTime: number | null;
}

export const TournamentTimer = ({
  roundNumber,
  onTimeUp,
  variant = "floating",
}: TournamentTimerProps) => {
  const [timerState, setTimerState] = useLocalStorage<TimerState>(
    `tournament-timer-${roundNumber}`,
    {
      timeRemaining: 50 * 60 * 1000, // 50 minutos en milisegundos
      isRunning: false,
      isPaused: false,
      startTime: null,
      pausedTime: null,
    }
  );

  // Formatear tiempo en MM:SS
  const formatTime = useCallback((milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  // Determinar el color del temporizador basado en el tiempo restante
  const getTimerColor = useCallback((timeRemaining: number) => {
    if (timeRemaining <= 300000) {
      // 5 minutos o menos
      return "bg-red-500 text-white border-red-600";
    } else if (timeRemaining <= 600000) {
      // 10 minutos o menos
      return "bg-yellow-500 text-white border-yellow-600";
    } else {
      return "bg-green-500 text-white border-green-600";
    }
  }, []);

  // Determinar el color del botón basado en el tiempo restante
  const getButtonColor = useCallback((timeRemaining: number) => {
    if (timeRemaining <= 300000) {
      // 5 minutos o menos
      return "bg-red-900/40 border-red-400/50 text-red-200";
    } else if (timeRemaining <= 600000) {
      // 10 minutos o menos
      return "bg-yellow-900/40 border-yellow-400/50 text-yellow-200";
    } else {
      return "bg-emerald-900/40 border-emerald-400/50 text-emerald-200";
    }
  }, []);

  // Función para iniciar el temporizador
  const startTimer = useCallback(() => {
    setTimerState((prev) => ({
      ...prev,
      isRunning: true,
      isPaused: false,
      startTime: Date.now(),
      pausedTime: null,
    }));
  }, [setTimerState]);

  // Función para pausar el temporizador
  const pauseTimer = useCallback(() => {
    setTimerState((prev) => ({
      ...prev,
      isRunning: false,
      isPaused: true,
      pausedTime: Date.now(),
    }));
  }, [setTimerState]);

  // Función para reanudar el temporizador
  const resumeTimer = useCallback(() => {
    setTimerState((prev) => {
      if (!prev.pausedTime) return prev;

      const pauseDuration = Date.now() - prev.pausedTime;
      return {
        ...prev,
        isRunning: true,
        isPaused: false,
        startTime: (prev.startTime || 0) + pauseDuration,
        pausedTime: null,
      };
    });
  }, [setTimerState]);

  // Función para detener el temporizador
  const stopTimer = useCallback(() => {
    setTimerState((prev) => ({
      ...prev,
      timeRemaining: 50 * 60 * 1000, // Reset a 50 minutos
      isRunning: false,
      isPaused: false,
      startTime: null,
      pausedTime: null,
    }));
  }, [setTimerState]);

  // Función para reiniciar el temporizador
  const resetTimer = useCallback(() => {
    setTimerState({
      timeRemaining: 50 * 60 * 1000, // 50 minutos
      isRunning: false,
      isPaused: false,
      startTime: null,
      pausedTime: null,
    });
  }, [setTimerState]);

  // Efecto para manejar el temporizador
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (timerState.isRunning && timerState.startTime) {
      interval = setInterval(() => {
        setTimerState((prev) => {
          if (!prev.startTime) return prev;

          const elapsed = Date.now() - prev.startTime;
          const remaining = Math.max(0, 50 * 60 * 1000 - elapsed);

          if (remaining <= 0) {
            // Tiempo agotado
            onTimeUp?.();
            return {
              ...prev,
              timeRemaining: 0,
              isRunning: false,
              isPaused: false,
            };
          }

          return {
            ...prev,
            timeRemaining: remaining,
          };
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timerState.isRunning, timerState.startTime, setTimerState, onTimeUp]);

  // Auto-iniciar cuando se monta el componente - REMOVIDO
  // El timer ahora solo se inicia manualmente cuando el usuario hace clic en "Iniciar"

  // Renderizar como botón
  if (variant === "button") {
    return (
      <div className="text-center p-4 rounded-xl border shadow-sm transition-all duration-200 hover:scale-105 bg-gray-900/40 border-gray-400/50 text-gray-200">
        <div className="text-2xl font-bold mb-1">
          {formatTime(timerState.timeRemaining)}
        </div>
        <div className="text-sm font-medium mb-3">⏱️ Ronda {roundNumber}</div>
        <div className="text-xs mb-3 opacity-80">
          {timerState.isRunning
            ? "▶️ En curso"
            : timerState.isPaused
              ? "⏸️ Pausado"
              : "⏹️ Detenido"}
        </div>

        {/* Controles del timer */}
        <div className="flex justify-center gap-2">
          {!timerState.isRunning && !timerState.isPaused && (
            <button
              onClick={startTimer}
              className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 rounded transition-colors"
            >
              ▶️ Iniciar
            </button>
          )}

          {timerState.isRunning && (
            <button
              onClick={pauseTimer}
              className="px-3 py-1 text-xs bg-yellow-600/40 hover:bg-yellow-600/60 rounded transition-colors"
            >
              ⏸️ Pausar
            </button>
          )}

          {timerState.isPaused && (
            <button
              onClick={resumeTimer}
              className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded transition-colors"
            >
              ▶️ Reanudar
            </button>
          )}

          {(timerState.isRunning || timerState.isPaused) && (
            <button
              onClick={stopTimer}
              className="px-3 py-1 text-xs bg-red-600/40 hover:bg-red-600/60 rounded transition-colors"
            >
              ⏹️ Detener
            </button>
          )}
        </div>
      </div>
    );
  }

  // Renderizar como timer flotante (comportamiento original)
  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
      {/* Versión Desktop */}
      <div className="hidden md:block">
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg p-4 min-w-[280px]">
          <div className="flex items-center justify-between gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">
                ⏱️ Ronda {roundNumber}
              </div>
              <div
                className={`px-4 py-2 rounded-lg font-mono font-bold text-2xl border ${getTimerColor(timerState.timeRemaining)}`}
              >
                {formatTime(timerState.timeRemaining)}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {timerState.isRunning ? (
                <button
                  onClick={pauseTimer}
                  className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  ⏸️ Pausar
                </button>
              ) : timerState.isPaused ? (
                <button
                  onClick={resumeTimer}
                  className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  ▶️ Reanudar
                </button>
              ) : (
                <button
                  onClick={startTimer}
                  className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  ▶️ Iniciar
                </button>
              )}

              <button
                onClick={stopTimer}
                className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors text-sm"
              >
                ⏹️ Detener
              </button>

              <button
                onClick={resetTimer}
                className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors text-sm"
              >
                🔄 Reiniciar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Versión Mobile */}
      <div className="md:hidden">
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-center">
              <div className="text-xs text-gray-600 mb-1">R{roundNumber}</div>
              <div
                className={`px-3 py-1 rounded font-mono font-bold text-lg border ${getTimerColor(timerState.timeRemaining)}`}
              >
                {formatTime(timerState.timeRemaining)}
              </div>
            </div>

            <div className="flex gap-1">
              {timerState.isRunning ? (
                <button
                  onClick={pauseTimer}
                  className="px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded font-medium transition-colors text-xs"
                >
                  ⏸️
                </button>
              ) : timerState.isPaused ? (
                <button
                  onClick={resumeTimer}
                  className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded font-medium transition-colors text-xs"
                >
                  ▶️
                </button>
              ) : (
                <button
                  onClick={startTimer}
                  className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded font-medium transition-colors text-xs"
                >
                  ▶️
                </button>
              )}

              <button
                onClick={stopTimer}
                className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded font-medium transition-colors text-xs"
              >
                ⏹️
              </button>

              <button
                onClick={resetTimer}
                className="px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded font-medium transition-colors text-xs"
              >
                🔄
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
