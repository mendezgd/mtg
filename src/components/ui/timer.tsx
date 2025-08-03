import { useState, useEffect, useCallback } from "react";

interface TimerProps {
  duration: number; // duración en minutos
  onStart?: () => void;
  onStop?: () => void;
  onComplete?: () => void;
  autoStart?: boolean;
  className?: string;
}

export const Timer = ({
  duration,
  onStart,
  onStop,
  onComplete,
  autoStart = false,
  className = "",
}: TimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState(duration * 60 * 1000); // en milisegundos
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Función para iniciar el temporizador
  const startTimer = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
      setStartTime(Date.now());
      onStart?.();
    }
  }, [isRunning, onStart]);

  // Función para detener el temporizador
  const stopTimer = useCallback(() => {
    setIsRunning(false);
    setStartTime(null);
    onStop?.();
  }, [onStop]);

  // Función para reiniciar el temporizador
  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setStartTime(null);
    setTimeRemaining(duration * 60 * 1000);
  }, [duration]);

  // Función para pausar/reanudar el temporizador
  const toggleTimer = useCallback(() => {
    if (isRunning) {
      stopTimer();
    } else {
      startTimer();
    }
  }, [isRunning, startTimer, stopTimer]);

  // Efecto para manejar el temporizador
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && startTime) {
      interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, duration * 60 * 1000 - elapsed);
        setTimeRemaining(remaining);

        if (remaining <= 0) {
          setIsRunning(false);
          setStartTime(null);
          onComplete?.();
          if (interval) {
            clearInterval(interval);
          }
        }
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, startTime, duration, onComplete]);

  // Auto-iniciar si está habilitado
  useEffect(() => {
    if (autoStart && !isRunning) {
      startTimer();
    }
  }, [autoStart, isRunning, startTimer]);

  // Formatear tiempo en MM:SS
  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Determinar el color del temporizador basado en el tiempo restante
  const getTimerColor = () => {
    if (timeRemaining <= 300000) { // 5 minutos o menos
      return "bg-red-100 text-red-800 border-red-300";
    } else if (timeRemaining <= 600000) { // 10 minutos o menos
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    } else {
      return "bg-green-100 text-green-800 border-green-300";
    }
  };

  return (
    <div className={`flex flex-col items-center gap-3 p-4 rounded-lg border ${className}`}>
      <div className="text-center">
        <div className="text-sm text-gray-600 mb-2">⏱️ Temporizador</div>
        <div className={`px-4 py-2 rounded-lg font-mono font-bold text-2xl border ${getTimerColor()}`}>
          {formatTime(timeRemaining)}
        </div>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={toggleTimer}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isRunning
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          {isRunning ? "⏸️ Pausar" : "▶️ Iniciar"}
        </button>
        
        <button
          onClick={resetTimer}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
        >
          🔄 Reiniciar
        </button>
      </div>
      
      <div className="text-xs text-gray-500">
        Duración: {duration} minutos
      </div>
    </div>
  );
}; 