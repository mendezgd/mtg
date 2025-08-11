"use client";

import { useTimer } from "@/hooks/use-timer";
import { useState } from "react";

export default function HookExamplePage() {
  const [duration, setDuration] = useState(5);
  const [showTimer, setShowTimer] = useState(false);

  const {
    timeRemaining,
    formattedTime,
    isRunning,
    start,
    stop,
    reset,
    toggle,
  } = useTimer({
    duration,
    onStart: () => {
      // Timer started
    },
    onStop: () => {
      // Timer stopped
    },
    onComplete: () => {
      alert("¡Tiempo completado!");
    },
    onTick: (timeRemaining) => {
      // Optional: do something on each tick
      if (timeRemaining <= 30000) { // 30 seconds or less
        // Time is running out
      }
    },
  });

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎣 Hook useTimer - Ejemplo
          </h1>
          <p className="text-gray-600">
            Ejemplo de uso del hook personalizado useTimer
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Configuración del Temporizador
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duración (minutos):
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={() => setShowTimer(!showTimer)}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              {showTimer ? "Ocultar" : "Mostrar"} Temporizador
            </button>
          </div>
        </div>

        {showTimer && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Temporizador ({duration} minutos)
            </h2>
            
            <div className="text-center mb-6">
              <div className={`px-6 py-4 rounded-lg font-mono font-bold text-4xl border ${getTimerColor()}`}>
                {formattedTime}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={toggle}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  isRunning
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {isRunning ? "⏸️ Pausar" : "▶️ Iniciar"}
              </button>
              
              <button
                onClick={reset}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                🔄 Reiniciar
              </button>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Estado del Temporizador:</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Tiempo restante: {timeRemaining}ms</li>
                <li>• Ejecutándose: {isRunning ? "Sí" : "No"}</li>
                <li>• Tiempo formateado: {formattedTime}</li>
                <li>• Duración configurada: {duration} minutos</li>
              </ul>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            📋 Características del Hook useTimer
          </h2>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Control total del temporizador
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Callbacks para todos los eventos
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Formateo de tiempo automático
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Limpieza automática de intervalos
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Reutilizable en cualquier componente
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Configuración flexible
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
} 