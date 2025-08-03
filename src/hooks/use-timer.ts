import { useState, useEffect, useCallback, useRef } from "react";

interface UseTimerOptions {
  duration: number; // duración en minutos
  autoStart?: boolean;
  onStart?: () => void;
  onStop?: () => void;
  onComplete?: () => void;
  onTick?: (timeRemaining: number) => void;
}

export const useTimer = ({
  duration,
  autoStart = false,
  onStart,
  onStop,
  onComplete,
  onTick,
}: UseTimerOptions) => {
  const [timeRemaining, setTimeRemaining] = useState(duration * 60 * 1000); // en milisegundos
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Función para iniciar el temporizador
  const start = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
      setStartTime(Date.now());
      onStart?.();
    }
  }, [isRunning, onStart]);

  // Función para detener el temporizador
  const stop = useCallback(() => {
    setIsRunning(false);
    setStartTime(null);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    onStop?.();
  }, [onStop]);

  // Función para reiniciar el temporizador
  const reset = useCallback(() => {
    setIsRunning(false);
    setStartTime(null);
    setTimeRemaining(duration * 60 * 1000);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [duration]);

  // Función para pausar/reanudar el temporizador
  const toggle = useCallback(() => {
    if (isRunning) {
      stop();
    } else {
      start();
    }
  }, [isRunning, start, stop]);

  // Formatear tiempo en MM:SS
  const formatTime = useCallback((milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  // Obtener el tiempo formateado actual
  const formattedTime = formatTime(timeRemaining);

  // Efecto para manejar el temporizador
  useEffect(() => {
    if (isRunning && startTime) {
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, duration * 60 * 1000 - elapsed);
        setTimeRemaining(remaining);
        onTick?.(remaining);

        if (remaining <= 0) {
          setIsRunning(false);
          setStartTime(null);
          onComplete?.();
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, startTime, duration, onComplete, onTick]);

  // Auto-iniciar si está habilitado
  useEffect(() => {
    if (autoStart && !isRunning) {
      start();
    }
  }, [autoStart, isRunning, start]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    timeRemaining,
    formattedTime,
    isRunning,
    start,
    stop,
    reset,
    toggle,
    formatTime,
  };
}; 