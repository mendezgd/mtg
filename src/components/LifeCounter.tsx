"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import SimpleBackground from "./ui/simple-background";

import { useLocalStorage } from "../hooks/use-local-storage";
import { useSound } from "../hooks/use-sound";
import { RotateCcw, Volume2, VolumeX } from "lucide-react";

interface PlayerState {
  life: number;
  name: string;
  color: "white" | "blue" | "black" | "red" | "green" | "colorless";
  isActive: boolean;
}

interface GameState {
  players: {
    player1: PlayerState;
    player2: PlayerState;
  };
  landscapeMode: boolean;
}

interface HistoryItem {
  id: number;
  change: number;
  timestamp: number;
}

const LifeCounter: React.FC = () => {
  // Hook para sonidos
  const { playLifeGain, playLifeLoss, playReset, isMuted, toggleMute } =
    useSound();

  // Estado principal del juego
  const [gameState, setGameState] = useLocalStorage<GameState>(
    "mtg-life-counter",
    {
      players: {
        player1: {
          life: 20,
          name: "villano",
          color: "blue",
          isActive: false,
        },
        player2: {
          life: 20,
          name: "yo",
          color: "red",
          isActive: false,
        },
      },
      landscapeMode: false,
    }
  );

  // Estado local para animaciones
  const [animations, setAnimations] = useState({
    player1: { life: false },
    player2: { life: false },
  });

  // Estado para el historial de cambios de vida
  const [lifeHistory, setLifeHistory] = useState<{
    player1: HistoryItem[];
    player2: HistoryItem[];
  }>({
    player1: [],
    player2: [],
  });

  // Referencias para el seguimiento de cambios secuenciales
  const sequentialData = useRef<{
    player1: { value: number; timer: NodeJS.Timeout | null };
    player2: { value: number; timer: NodeJS.Timeout | null };
  }>({
    player1: { value: 0, timer: null },
    player2: { value: 0, timer: null },
  });

  // Colores MTG oficiales
  const mtgColors = {
    white: { bg: "bg-white", text: "text-gray-800", border: "border-gray-300" },
    blue: { bg: "bg-blue-500", text: "text-white", border: "border-blue-600" },
    black: { bg: "bg-gray-800", text: "text-white", border: "border-gray-900" },
    red: { bg: "bg-red-500", text: "text-white", border: "border-red-600" },
    green: {
      bg: "bg-green-500",
      text: "text-white",
      border: "border-green-600",
    },
    colorless: {
      bg: "bg-gray-400",
      text: "text-white",
      border: "border-gray-500",
    },
  };

  // Función para resetear partida
  const resetGame = useCallback(() => {
    playReset();
    setGameState((prev) => ({
      ...prev,
      players: {
        player1: {
          life: 20,
          name: "villano",
          color: "blue",
          isActive: false,
        },
        player2: {
          life: 20,
          name: "yo",
          color: "red",
          isActive: false,
        },
      },
    }));
    // Clear history on reset
    setLifeHistory({
      player1: [],
      player2: [],
    });
    // Clear sequential data
    sequentialData.current = {
      player1: { value: 0, timer: null },
      player2: { value: 0, timer: null },
    };
  }, [setGameState, playReset]);

  // Detectar orientación de pantalla
  useEffect(() => {
    const handleOrientationChange = () => {
      setGameState((prev) => ({
        ...prev,
        landscapeMode: window.innerWidth > window.innerHeight,
      }));
    };

    handleOrientationChange();
    window.addEventListener("resize", handleOrientationChange);
    window.addEventListener("orientationchange", handleOrientationChange);

    return () => {
      window.removeEventListener("resize", handleOrientationChange);
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, [setGameState]);

  // Limpiar historial antiguo automáticamente
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setLifeHistory((prev) => ({
        player1: prev.player1.filter((item) => now - item.timestamp < 2000),
        player2: prev.player2.filter((item) => now - item.timestamp < 2000),
      }));
    }, 500);

    return () => clearInterval(cleanupInterval);
  }, []);

  // Función para animar cambios
  const animateChange = useCallback((player: "player1" | "player2") => {
    setAnimations((prev) => ({
      ...prev,
      [player]: { life: true },
    }));

    setTimeout(() => {
      setAnimations((prev) => ({
        ...prev,
        [player]: { life: false },
      }));
    }, 300);
  }, []);

  // Función para cambiar vida (estilo Magic Companion)
  const changeLife = useCallback(
    (player: "player1" | "player2", amount: number) => {
      // Reproducir sonido según el tipo de cambio
      if (amount > 0) {
        playLifeGain();
      } else if (amount < 0) {
        playLifeLoss();
      }

      // Actualizar el estado del juego inmediatamente
      setGameState((prev) => ({
        ...prev,
        players: {
          ...prev.players,
          [player]: {
            ...prev.players[player],
            life: prev.players[player].life + amount,
          },
        },
      }));

      // Manejar cambios secuenciales
      const playerData = sequentialData.current[player];

      // Si ya hay un timer activo, limpiarlo
      if (playerData.timer) {
        clearTimeout(playerData.timer);
        playerData.timer = null;
      }

      // Si es el mismo tipo de cambio, acumular
      if (
        (playerData.value > 0 && amount > 0) ||
        (playerData.value < 0 && amount < 0)
      ) {
        playerData.value += amount;

        // Limitar a ±10
        if (playerData.value > 10) playerData.value = 10;
        if (playerData.value < -10) playerData.value = -10;
      } else {
        // Si es un tipo de cambio diferente, reiniciar
        playerData.value = amount;
      }

      // Actualizar el historial con el valor acumulado
      setLifeHistory((prev) => {
        // Filtrar items antiguos del mismo jugador
        const filteredHistory = prev[player].filter(
          (item) =>
            !(
              (item.change > 0 && amount > 0) ||
              (item.change < 0 && amount < 0)
            )
        );

        return {
          ...prev,
          [player]: [
            {
              id: Date.now(),
              change: playerData.value,
              timestamp: Date.now(),
            },
            ...filteredHistory,
          ].slice(0, 3), // Mantener solo los últimos 3 items
        };
      });

      // Configurar timer para resetear el acumulador después de 1 segundo
      playerData.timer = setTimeout(() => {
        playerData.value = 0;
      }, 1000);

      animateChange(player);
    },
    [setGameState, animateChange, playLifeGain, playLifeLoss]
  );

  // Componente para mostrar historial de cambios de vida
  const LifeChangeHistory = ({ player }: { player: "player1" | "player2" }) => {
    return (
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none flex items-center justify-center">
        <div className="relative w-32 h-32">
          {lifeHistory[player].map((item, index) => (
            <div
              key={item.id}
              className={`absolute left-1/2 transform -translate-x-1/2 transition-all duration-1000 opacity-0 ${
                item.change > 0 ? "text-green-400" : "text-red-400"
              } font-bold text-xl`}
              style={{
                top: `${20 + index * 8}%`,
                animation: `fadeMoveUp 1.5s ease-out ${index * 0.1}s forwards`,
              }}
            >
              {item.change > 0 ? `+${item.change}` : item.change}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Componente para mostrar jugador
  const PlayerCard = ({
    player,
    playerData,
  }: {
    player: "player1" | "player2";
    playerData: PlayerState;
  }) => {
    const isAnimating = animations[player].life;
    const backgroundImage =
      player === "player1" ? "/images/chudixd.webp" : "/images/chudix.webp";

    return (
      <Card className="transition-all duration-300 relative overflow-hidden bg-gray-800 border-gray-700 h-full w-full">
        {/* Imagen de fondo simple */}
        <SimpleBackground
          src={backgroundImage}
          alt={`Background for ${playerData.name}`}
          className="opacity-20"
          fallbackColor={
            player === "player1"
              ? "rgba(59, 130, 246, 0.1)"
              : "rgba(239, 68, 68, 0.1)"
          }
        />
        <CardHeader className="pb-4 relative z-10 h-16 flex items-center justify-center">
          <div className="flex items-center justify-center">
            <CardTitle className="text-lg font-bold text-white truncate max-w-full">
              {playerData.name}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="relative z-10 flex-1 flex items-center justify-center mt-14">
          {/* Contador de vida principal */}
          <div className="text-center relative w-full h-48 flex items-center justify-center">
            <div
              className={`text-8xl md:text-9xl font-life-counter-space transition-all duration-300 ${
                isAnimating ? "scale-110" : "scale-100"
              } ${
                playerData.life < 0
                  ? "text-red-500"
                  : playerData.life > 0
                    ? "text-white"
                    : "text-yellow-400"
              }`}
            >
              {playerData.life}
            </div>

            {/* Historial de cambios de vida */}
            <LifeChangeHistory player={player} />
          </div>

          {/* Botones invisibles que cubren toda la tarjeta */}
          <div className="absolute inset-0 flex">
            <button
              onClick={() => changeLife(player, -1)}
              className="w-1/2 h-64 bg-transparent hover:bg-red-500/10 transition-all duration-300 flex items-center justify-center group"
              aria-label="Reducir vida"
            >
              <span className="text-6xl md:text-3xl font-light tracking-widest group-hover:text-red-300 group-hover:scale-125 transition-all duration-300 -mt-16">
                −
              </span>
            </button>
            <button
              onClick={() => changeLife(player, 1)}
              className="w-1/2 h-64 bg-transparent hover:bg-green-500/10 transition-all duration-300 flex items-center justify-center group"
              aria-label="Aumentar vida"
            >
              <span className="text-6xl md:text-3xl font-light tracking-widest group-hover:text-green-300 group-hover:scale-125 transition-all duration-300 -mt-16">
                +
              </span>
            </button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-900 text-white relative">
      {/* Estilos CSS para la animación de fade y movimiento */}
      <style jsx>{`
        @keyframes fadeMoveUp {
          0% {
            opacity: 1;
            transform: translate(-50%, 0);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -30px);
          }
        }
      `}</style>

      {/* Botones en la esquina superior derecha */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        {/* Botón de mute/unmute */}
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMute}
          className="bg-gray-800/80 backdrop-blur-sm border-gray-600 hover:bg-gray-700/80"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </Button>

        {/* Botón de reset */}
        <Button
          variant="destructive"
          size="icon"
          onClick={resetGame}
          className="flex items-center justify-center"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      <div className="h-[calc(100vh-4rem)] w-full">
        {/* Contadores principales */}
        <div
          className={`h-full w-full grid ${
            gameState.landscapeMode
              ? "grid-cols-2"
              : "grid-cols-1 lg:grid-cols-2"
          }`}
        >
          <PlayerCard player="player1" playerData={gameState.players.player1} />
          <PlayerCard player="player2" playerData={gameState.players.player2} />
        </div>
      </div>
    </div>
  );
};

export default LifeCounter;
