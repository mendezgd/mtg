"use client";

import { Timer } from "@/components/ui/timer";

export default function TimerPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ⏱️ Temporizador Simple
          </h1>
          <p className="text-gray-600">
            Un temporizador que solo cuenta el tiempo, sin funcionalidades adicionales
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Temporizador de 5 minutos */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Temporizador de 5 minutos
            </h3>
            <Timer duration={5} />
          </div>

          {/* Temporizador de 10 minutos */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Temporizador de 10 minutos
            </h3>
            <Timer duration={10} />
          </div>

          {/* Temporizador de 15 minutos */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Temporizador de 15 minutos
            </h3>
            <Timer duration={15} />
          </div>

          {/* Temporizador de 30 minutos */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Temporizador de 30 minutos
            </h3>
            <Timer duration={30} />
          </div>

          {/* Temporizador de 60 minutos */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Temporizador de 60 minutos
            </h3>
            <Timer duration={60} />
          </div>

          {/* Temporizador con auto-inicio */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Temporizador con auto-inicio (3 min)
            </h3>
            <Timer 
              duration={3} 
              autoStart={true}
              onComplete={() => alert("¡Tiempo completado!")}
            />
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            📋 Características del Temporizador
          </h2>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Solo cuenta el tiempo - sin funcionalidades adicionales
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Botones para iniciar, pausar y reiniciar
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Cambio de colores según el tiempo restante
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Formato de tiempo MM:SS
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Opción de auto-inicio
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Callbacks opcionales para eventos
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
} 